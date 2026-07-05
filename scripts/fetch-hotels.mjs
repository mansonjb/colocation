#!/usr/bin/env node
/**
 * Sélection d'hôtels par destination via Apify (acteur compass/crawler-google-places).
 * On ne récupère que des données FACTUELLES (nom, étoiles, note, nb d'avis, adresse, géo) :
 * pas de photo d'hôtel (licence grise). L'affichage se fait ensuite avec un lien Stay22.
 *
 *   APIFY_TOKEN=xxx node scripts/fetch-hotels.mjs
 *
 * Écrit src/data/hotels.generated.json, keyé par slug de destination.
 * Garde-fou : s'arrête avant le plafond d'usage mensuel.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOKEN = process.env.APIFY_TOKEN;
if (!TOKEN) {
  console.error('APIFY_TOKEN manquant. Lancer avec APIFY_TOKEN=xxx node scripts/fetch-hotels.mjs');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST_DIR = join(ROOT, 'src', 'content', 'destinations');
const OUT = join(ROOT, 'src', 'data', 'hotels.generated.json');

const PER = 12; // lieux crawlés par ville (facturés)
const KEEP = 6; // hôtels gardés par ville
const RADIUS_KM = 25; // on veut la ville, pas la région
const RUN_BUDGET_USD = 3; // dépense max autorisée POUR CE RUN (relatif à l'usage de départ)

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toRad = (d) => (d * Math.PI) / 180;
const km = (aLat, aLng, bLat, bLng) => {
  const R = 6371;
  const dLa = toRad(bLat - aLat);
  const dLo = toRad(bLng - aLng);
  const x =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const isHotel = (c = '') =>
  /hotel|hôtel|resort|inn|hostel|auberge|guest house|guesthouse|b&b|aparthotel|lodge/i.test(c);

async function usageUsd() {
  try {
    const r = await fetch(`https://api.apify.com/v2/users/me/limits?token=${TOKEN}`);
    const j = await r.json();
    return j?.data?.current?.monthlyUsageUsd ?? 0;
  } catch {
    return 0;
  }
}

async function crawl(name, country) {
  const input = {
    searchStringsArray: [`hotels in ${name}, ${country}`],
    maxCrawledPlacesPerSearch: PER,
    language: 'fr',
    maxImages: 0,
    skipClosedPlaces: true,
  };
  const r = await fetch(
    `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${TOKEN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) },
  );
  if (!r.ok) throw new Error(`Apify ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return await r.json();
}

const dests = readdirSync(DEST_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(DEST_DIR, f), 'utf8')))
  .filter((d) => !d.draft && d.coordinates?.lat != null);

const manifest = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const start = await usageUsd();
console.log(
  `Usage Apify au départ : $${start.toFixed(3)} (budget de ce run : +$${RUN_BUDGET_USD})`,
);

for (const d of dests) {
  if ((manifest[d.slug]?.length ?? 0) > 0) {
    console.log(`- ${d.slug}: déjà en cache (${manifest[d.slug].length}), skip`);
    continue;
  }
  if ((await usageUsd()) - start >= RUN_BUDGET_USD) {
    console.log(`STOP : budget de run atteint avant ${d.slug}`);
    break;
  }
  try {
    const raw = await crawl(d.name, d.country);
    const seen = new Set();
    const hotels = [];
    for (const p of raw) {
      if (!isHotel(p.categoryName)) continue;
      const loc = p.location;
      if (!p.title || !loc?.lat) continue;
      if (km(d.coordinates.lat, d.coordinates.lng, loc.lat, loc.lng) > RADIUS_KM) continue;
      const hslug = slugify(p.title);
      if (seen.has(hslug)) continue;
      seen.add(hslug);
      hotels.push({
        name: p.title,
        slug: hslug,
        rating: p.totalScore ?? null,
        reviewCount: p.reviewsCount ?? null,
        stars: p.hotelStars ?? null,
        address: p.address ?? null,
        lat: loc.lat,
        lng: loc.lng,
      });
    }
    hotels.sort(
      (a, b) =>
        (b.rating ?? 0) * Math.log((b.reviewCount ?? 0) + 1) -
        (a.rating ?? 0) * Math.log((a.reviewCount ?? 0) + 1),
    );
    manifest[d.slug] = hotels.slice(0, KEEP);
    console.log(`+ ${d.slug}: ${manifest[d.slug].length} hôtels retenus (sur ${hotels.length})`);
    if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
  } catch (e) {
    console.error(`! ${d.slug}: ${e.message}`);
  }
}
console.log(`Terminé. Usage final : $${(await usageUsd()).toFixed(3)}`);
