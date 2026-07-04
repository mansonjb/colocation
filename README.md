# Cap au Frais

Site d'affiliation **coolcation** : des destinations ensoleillées mais tempérées, et pour chacune la réponse à une seule question : *dans quel quartier dormir selon votre profil de voyageur*.

Spécification complète : [BRIEF.md](./BRIEF.md). Maquette de référence visuelle : [reference/la-rochelle-coolcation.html](./reference/la-rochelle-coolcation.html) (non publiée).

## Stack

- [Astro](https://astro.build) (SSG statique) + TypeScript strict
- Content Collections en JSON/MDX avec schémas Zod (`src/content.config.ts`)
- CSS natif à tokens (`src/styles/global.css`), pas de framework CSS
- Sitemap + robots.txt générés, JSON-LD par type de page

## Commandes

```bash
npm install
npm run dev        # dev server sur :3025
npm run build      # build statique dans dist/
npm run test       # contrôles SEO/affiliation sur dist/ (après build)
npm run verify     # build + test
npm run check      # astro check (types)
```

## Règles non négociables

- Tout lien monétisé passe par `<AffiliateLink>` (rel="sponsored nofollow noopener" + target="_blank"). `npm run test` échoue sinon.
- Les IDs partenaires vivent dans `src/config/affiliate.config.ts` via variables d'env (`.env.example`), jamais dans le contenu ni les templates.
- Pas de données climatiques inventées : une fiche sans chiffres vérifiés reste `draft: true` avec des champs vides.
- Toute page avec lien monétisé affiche l'encart `<Disclosure>`.

## Contenu

- `src/content/destinations/*.json` : 1 fiche complète (La Rochelle, le modèle) + 9 squelettes draft (Biarritz, Saint-Malo, Annecy, Chambéry, Highlands, Donegal, North Wales, Bled, Tropea).
- `src/content/guides/*.mdx` : guide pilier « Où partir au frais l'été sans quitter le soleil ».

## Déploiement

Cible statique (Netlify / Cloudflare Pages / Vercel). Configurer `SITE_URL` et les IDs d'affiliation en variables d'environnement.
