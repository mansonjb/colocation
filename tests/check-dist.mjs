/**
 * Tests SEO & affiliation sur le build statique (dist/).
 * Échoue (exit 1) si :
 *  - un lien vers un domaine monétisé n'a pas rel="sponsored nofollow" (+ noopener) et target="_blank"
 *  - une page contenant un lien monétisé n'affiche pas l'encart de divulgation
 *  - une image de contenu n'a pas d'alt, de width ou de height
 *  - une page n'a pas de <title>, de meta description ou de canonical
 *  - une page a plusieurs H1
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

// Doit rester aligné avec src/config/affiliate.config.ts
const MONETIZED_HOSTS = [
  'booking.com',
  'www.booking.com',
  'hometogo.fr',
  'www.hometogo.fr',
  'hometogo.com',
  'www.hometogo.com',
  'getyourguide.fr',
  'www.getyourguide.fr',
  'getyourguide.com',
  'www.getyourguide.com',
  'stay22.com',
  'www.stay22.com',
  'allez.stay22.com',
];

if (!existsSync(DIST)) {
  console.error('dist/ introuvable : lancer `npm run build` avant `npm run test`.');
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const errors = [];
let pages = 0;
let monetizedLinks = 0;

for (const file of htmlFiles(DIST)) {
  pages++;
  const rel = relative(DIST, file);
  const root = parse(readFileSync(file, 'utf8'));

  // --- Affiliation ---
  let hasMonetized = false;
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    let host = '';
    try {
      host = new URL(href).hostname;
    } catch {
      continue; // lien relatif
    }
    if (!MONETIZED_HOSTS.includes(host)) continue;
    hasMonetized = true;
    monetizedLinks++;
    const relAttr = (a.getAttribute('rel') ?? '').split(/\s+/);
    for (const required of ['sponsored', 'nofollow', 'noopener']) {
      if (!relAttr.includes(required)) {
        errors.push(`${rel} : lien affilié sans rel="${required}" → ${href}`);
      }
    }
    if (a.getAttribute('target') !== '_blank') {
      errors.push(`${rel} : lien affilié sans target="_blank" → ${href}`);
    }
  }
  if (hasMonetized && !root.querySelector('[data-disclosure]')) {
    errors.push(`${rel} : lien monétisé présent mais encart de divulgation absent`);
  }

  // --- Images ---
  for (const img of root.querySelectorAll('img')) {
    const src = img.getAttribute('src') ?? '(sans src)';
    if (!img.getAttribute('alt')) errors.push(`${rel} : image sans alt → ${src}`);
    if (!img.getAttribute('width') || !img.getAttribute('height'))
      errors.push(`${rel} : image sans width/height explicites → ${src}`);
    if (img.getAttribute('loading') !== 'lazy' && !img.hasAttribute('data-eager'))
      errors.push(`${rel} : image sans loading="lazy" → ${src}`);
  }

  // --- Meta SEO ---
  if (!root.querySelector('title')?.text?.trim()) errors.push(`${rel} : <title> manquant`);
  if (!root.querySelector('meta[name="description"]')?.getAttribute('content'))
    errors.push(`${rel} : meta description manquante`);
  if (!root.querySelector('link[rel="canonical"]')) errors.push(`${rel} : canonical manquant`);
  const h1s = root.querySelectorAll('h1');
  if (h1s.length !== 1) errors.push(`${rel} : ${h1s.length} balises H1 (attendu : 1)`);
}

console.log(`Pages analysées : ${pages} · liens monétisés : ${monetizedLinks}`);
if (errors.length) {
  console.error(`\n${errors.length} erreur(s) :`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('✓ Tous les contrôles SEO / affiliation passent.');
