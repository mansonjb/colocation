import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schémas volontairement tolérants : une fiche squelette (draft: true) avec
 * uniquement slug/name/country doit valider. Les champs climat restent null
 * plutôt que devinés (règle "pas de données climatiques inventées").
 */

const neighborhoodSchema = z.object({
  name: z.string(),
  tag: z.string().default(''),
  description: z.string().default(''),
  best_for: z.string().default(''),
  affiliate_url: z.string().default(''),
});

const profileRecoSchema = z.object({
  profile: z.string(),
  neighborhood: z.string(),
  reason: z.string().default(''),
  affiliate_url: z.string().default(''),
});

const faqSchema = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/destinations' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    country: z.string(),
    region: z.string().default(''),
    coordinates: z
      .object({ lat: z.number().nullable().default(null), lng: z.number().nullable().default(null) })
      .default({ lat: null, lng: null }),
    hero_tagline: z.string().default(''),
    intro: z.string().default(''),
    // Libellé des zones : "quartier" (ville) ou "secteur" (région). Pluriel = +"s".
    area_label: z.string().default('quartier'),
    hero_image: z
      .object({
        src: z.string(), // /images/destinations/{slug}.jpg (hero)
        card: z.string(), // /images/destinations/card/{slug}.jpg (vignette)
        alt: z.string(), // obligatoire : échec de build si vide
        width: z.number(),
        height: z.number(),
        card_width: z.number(),
        card_height: z.number(),
        credit_author: z.string().default(''),
        credit_license: z.string().default(''),
        source_url: z.string().default(''),
      })
      .optional(),
    coolcation: z
      .object({
        sun_hours_year: z.number().nullable().default(null),
        july_max_avg: z.number().nullable().default(null),
        reference_city: z.string().default(''),
        reference_july_max: z.number().nullable().default(null),
        breeze_kmh: z.number().nullable().default(null),
        proof_points: z.array(z.string()).default([]),
      })
      .default({}),
    season: z
      .object({
        ideal_months: z.array(z.string()).default([]),
        peak_months: z.array(z.string()).default([]),
      })
      .default({}),
    neighborhoods: z.array(neighborhoodSchema).default([]),
    profiles: z.array(profileRecoSchema).default([]),
    faq: faqSchema,
    related_slugs: z.array(z.string()).default([]),
    affiliate: z
      .object({
        booking_search_url: z.string().default(''),
        hometogo_search_url: z.string().optional(),
      })
      .default({}),
    updated: z.coerce.date(),
    author: z.string().default('La rédaction Cap au Frais'),
    draft: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    angle: z.string().default(''),
    intro: z.string().default(''),
    cited_destinations: z.array(z.string()).default([]),
    faq: faqSchema,
    updated: z.coerce.date(),
    author: z.string().default('La rédaction Cap au Frais'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { destinations, guides };
