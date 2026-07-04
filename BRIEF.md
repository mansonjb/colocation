# Brief projet — « Cap au Frais » : site d'affiliation coolcation

À coller dans un repo vide et à donner à Claude Code comme spécification de départ. Objectif : bâtir un site de contenu généraliste sur l'hébergement de voyage, différencié par un angle coolcation (destinations ensoleillées mais tempérées) et un format signature « où dormir selon votre profil / quartier ».

## 1. Objectif & modèle économique

Construire un site éditorial monétisé par affiliation hébergement (Booking, HomeToGo, et affiliés type GetYourGuide en secondaire). L'audience est mondiale (site multilingue à terme, FR d'abord).

Le site n'est PAS un annuaire d'hôtels. Sa proposition de valeur : aider le lecteur à choisir le bon quartier / type d'hébergement selon sa façon de voyager, sous une ligne éditoriale « autant de soleil que le Sud, sans la fournaise ».

KPI de succès :

* Pages qui rankent sur des requêtes longue-traîne à forte intention (« où dormir à X en famille », « X sans la chaleur »).
* Taux de clic sortant vers les partenaires affiliés.
* Vitesse : Core Web Vitals tous verts (le contenu doit charger vite, c'est un site SEO).

Contrainte stratégique : ne jamais concurrencer frontalement Booking sur la requête générique. Toujours viser la variante cadrée (angle climat + profil + quartier), moins disputée.

## 2. Stack technique

* Framework : Astro (dernière version stable). Raison : site à dominante contenu, rendu statique (SSG) = SEO et performance optimaux, îlots interactifs seulement là où c'est utile.
* Contenu : Content Collections d'Astro en Markdown/MDX, avec schémas typés (Zod). Le contenu vit dans le repo, versionné — pas de CMS externe au départ.
* Styles : CSS natif avec variables (tokens ci-dessous). Pas de framework CSS lourd. Utiliser un reset léger.
* Composants interactifs (thermomètre, filtres) : composants Astro + un peu de JS vanilla, ou une micro-lib d'îlot si nécessaire. Éviter d'embarquer un framework client entier.
* Déploiement : cible statique (Netlify / Cloudflare Pages / Vercel — laisser configurable). Générer `sitemap.xml` et `robots.txt`.
* Pas de base de données, pas d'auth, pas de backend au lancement.

Utiliser TypeScript partout. Formatage Prettier, lint ESLint.

## 3. Système de design (tokens)

Reprendre exactement ces tokens (identité maritime « fraîche », volontairement éloignée des templates génériques). Les déclarer en variables CSS globales.

```css
:root{
  --atlantic:#0B3C49;   /* teal-navy profond : texte fort, sections sombres */
  --seaglass:#5FB4A2;   /* accent menthe : le "cool" de coolcation */
  --seaglass-deep:#3E8C7C;
  --sandstone:#F2EBDD;  /* pierre pâle chaude : fonds */
  --foam:#FBFAF6;       /* fond principal */
  --ochre:#D98A3D;      /* accent chaud : UNIQUEMENT le "côté chaud" du thermomètre / haute saison */
  --ink:#16282E;
  --ink-soft:#4B5E63;
  --line:rgba(11,60,73,.14);
  --radius:14px;
  --maxw:1080px;
}
```

Typographie (Google Fonts) :

* Display / titres : Fraunces (serif à contraste, chaleur éditoriale). Poids 400–600, italique pour les accents.
* Corps : Hanken Grotesk. Poids 400–700.
* Data / labels / eyebrows : Spline Sans Mono. Poids 500–600, uppercase, letter-spacing large.

Principes :

* Le boldness se dépense à un seul endroit : le thermomètre coolcation. Tout le reste reste calme et discipliné.
* Accessibilité plancher non négociable : responsive jusqu'au mobile, focus clavier visible, `prefers-reduced-motion` respecté, contrastes AA.
* Animations sobres : reveal au scroll (IntersectionObserver), micro-hover sur les cartes. Rien de clignotant.

Page HTML de référence : le fichier `la-rochelle-coolcation.html` est fourni à la racine du repo, à côté de ce brief. C'est la source de vérité visuelle : le gabarit destination et tous les composants signature (thermomètre, cartes profil, calendrier de saison, FAQ) doivent reproduire son rendu, sa palette et sa typographie. Le convertir en composants Astro alimentés par les données — sans changer l'apparence. Le garder dans le repo comme maquette de référence (ex. `/reference/la-rochelle-coolcation.html`), pas comme page publiée.

## 4. Arborescence & silos SEO

Structure en silos thématiques : chaque destination est une page pilier, entourée de pages support qui pointent vers elle et entre elles (maillage interne = accélérateur de ranking).

```
/                                  Accueil : la thèse coolcation + destinations vedettes
/destinations/                     Index de toutes les destinations (filtrable)
/destinations/[slug]/              PILIER : "Où dormir à {ville}" (le gabarit principal)
/guides/                           Index des guides transverses
/guides/[slug]/                    Guides d'angle : "7 villes côtières fraîches", "voyager sans voiture"...
/thematiques/coolcation/           Page hub de l'angle : explique le concept, liste les destinations éligibles
/a-propos/                         E-E-A-T : qui écrit, méthodo, sources climat
/mentions-affiliation/             Divulgation affiliée (obligatoire)
/[lang]/...                        Réservé i18n (phase ultérieure)
```

Règle de maillage : chaque page destination lie vers 2–4 destinations voisines/similaires + le hub coolcation + 1 guide pertinent. Chaque guide lie vers toutes les destinations qu'il cite.

## 5. Modèle de données (Content Collections)

Collection `destinations`

```ts
{
  slug: string,
  name: string,              // "La Rochelle"
  country: string,
  region: string,
  coordinates: { lat, lng },
  hero_tagline: string,      // "au frais sous le même soleil que le Sud"
  intro: string,             // 2-3 phrases, l'angle climat de CETTE ville
  coolcation: {
    sun_hours_year: number,      // 2110
    july_max_avg: number,        // 24
    reference_city: string,      // "Côte d'Azur"
    reference_july_max: number,  // 28
    breeze_kmh: number,          // 15
    proof_points: string[],      // 3 stats formatées
  },
  season: {                  // pour le calendrier épaules de saison
    ideal_months: string[],  // ["Mai","Juin","Sept"]
    peak_months: string[],   // ["Juil","Août"]
  },
  neighborhoods: Neighborhood[],   // voir ci-dessous
  profiles: ProfileReco[],         // voir ci-dessous
  faq: { q: string, a: string }[],
  related_slugs: string[],         // maillage
  affiliate: {
    booking_search_url: string,    // URL de recherche affiliée pour la ville
    hometogo_search_url?: string,
  },
  updated: date,
  author: string,
}
```

Type `Neighborhood`

```ts
{ name, tag, description, best_for, affiliate_url }
```

Type `ProfileReco` (le wedge)

```ts
{
  profile: string,        // "En famille"
  neighborhood: string,   // quartier recommandé
  reason: string,         // pourquoi ce quartier pour ce profil
  affiliate_url: string,
}
```

Collection `guides`

```ts
{ slug, title, angle, intro, body(MDX), cited_destinations: string[], faq, updated, author }
```

Important : l'affilié ne doit jamais être en dur dans les templates. Tout passe par les champs `affiliate_url` / `booking_search_url` du contenu, pour pouvoir changer de programme ou de tag partenaire d'un seul endroit. Prévoir un helper central `buildAffiliateLink()`.

## 6. Gabarits de page à construire

### A. Gabarit destination `/destinations/[slug]` (le cœur)

Reproduire la structure de la page de référence, alimentée par les données :

1. Hero : eyebrow, H1 `Où dormir à {name}, {hero_tagline}`, lede, 2 CTA, + thermomètre coolcation (composant signature).
2. Bandeau preuve climat : 3 stats depuis `coolcation.proof_points`.
3. Le wedge « selon votre profil » : grille de cartes depuis `profiles[]`, chaque carte finit sur un lien affilié.
4. Quartiers comparés : liste/tableau depuis `neighborhoods[]`, un CTA affilié par quartier.
5. Calendrier épaules de saison : composant qui colore les mois selon `season`.
6. FAQ : `<details>` depuis `faq[]`, + JSON-LD FAQPage.
7. Divulgation affiliée + bloc « à lire ensuite » depuis `related_slugs`.

### B. Gabarit guide `/guides/[slug]`

Article MDX long, avec sommaire ancré, encarts destinations liées (cartes cliquables), FAQ, divulgation.

### C. Index `/destinations` et `/guides`

Grille de cartes filtrables (par pays, par « idéal en été », par budget). Filtre en JS vanilla, pas de rechargement.

### D. Accueil `/`

Hero-thèse coolcation, sélection de destinations vedettes, explication de l'angle en 3 points, entrée vers le hub coolcation.

## 7. Composants réutilisables

* `<CoolcationThermometer>` — 2 jauges comparatives (ville vs référence), animées, accessibles (`aria-label`, valeurs texte). C'est la signature du site.
* `<ProfileCard>` — carte du wedge (profil → quartier → lien affilié).
* `<NeighborhoodRow>` — ligne quartier comparée.
* `<SeasonCalendar>` — bandeau des mois coloré (idéal / haute saison).
* `<FaqAccordion>` — `<details>` + injection JSON-LD.
* `<AffiliateLink>` — wrapper qui applique toujours `rel="sponsored nofollow"`, `target="_blank"`, `rel="noopener"`, et construit l'URL via le helper central.
* `<Disclosure>` — encart divulgation affiliée.
* `<RelatedLinks>` — maillage interne.
* `<BaseHead>` — meta, OpenGraph, canonical, hreflang (prêt i18n), JSON-LD par type de page.

## 8. Exigences SEO (critères d'acceptation)

* Chaque page : `<title>` et meta description uniques dérivés du contenu, canonical, OpenGraph + Twitter card.
* JSON-LD : `Article` sur les guides, `FAQPage` sur les FAQ, `BreadcrumbList` partout, `TouristDestination`/`Place` sur les destinations.
* `sitemap.xml` et `robots.txt` générés automatiquement.
* Fil d'ariane visible + structuré.
* Titres hiérarchisés proprement (un seul H1/page).
* Images en `loading="lazy"`, `width`/`height` explicites, formats modernes (AVIF/WebP), `alt` obligatoires (échec de build si `alt` manquant sur une image de contenu).
* URLs propres, en minuscules, sans paramètres.
* Objectif Lighthouse ≥ 95 en SEO, Performance et Accessibilité sur le gabarit destination.

## 9. Mécanique d'affiliation (non négociable)

* Tous les liens sortants monétisés passent par `<AffiliateLink>` avec `rel="sponsored nofollow"`. Un lien affilié sans ces attributs doit faire échouer un test.
* Tag partenaire / ID d'affiliation centralisé dans une config unique (variable d'env ou fichier `affiliate.config.ts`), jamais dupliqué dans le contenu.
* Page de divulgation affiliée + encart `<Disclosure>` présent sur toute page contenant un lien monétisé.
* Ne pas faire de cloaking, ne pas masquer la nature affiliée : conformité programmes + confiance lecteur.

## 10. Contenu de démarrage (seed)

Créer le repo avec 1 destination entièrement remplie (La Rochelle, depuis la page de référence) servant de modèle, puis des fiches squelette (données minimales + `draft:true`) pour amorcer le silo coolcation. Vietnam n'entre pas ici (pas coolcation) — cibler des destinations « soleil sans fournaise » :

* La Rochelle, Biarritz, Saint-Malo (côte atlantique FR)
* Annecy, Chambéry (montagne/lac, +894 % de recherche pour Annecy en tendance 2026)
* Highlands écossais, Donegal (Irlande), North Wales
* Bled (Slovénie), Tropea (côte tyrrhénienne ventilée)

* 1 guide pilier transverse : « Où partir au frais l'été sans quitter le soleil » liant toutes les fiches.

Chaque fiche squelette doit valider le schéma Zod même vide, pour que le build passe.

## 11. Plan de build (par phases)

* **Phase 1 — Fondations** : Init Astro + TS. Tokens de design globaux. `<BaseHead>`, layout de base, sitemap/robots. Définir les Content Collections + schémas Zod.
* **Phase 2 — Gabarit destination + composants signature** : Construire `<CoolcationThermometer>`, `<ProfileCard>`, `<NeighborhoodRow>`, `<SeasonCalendar>`, `<FaqAccordion>`, `<AffiliateLink>`. Assembler le gabarit `/destinations/[slug]`. Remplir La Rochelle en données réelles et matcher le rendu de la page de référence.
* **Phase 3 — Guides, index, accueil, maillage** : Gabarit guide MDX, index filtrables, accueil, hub coolcation. Câbler `related_slugs` et le maillage automatique.
* **Phase 4 — SEO & affiliation durcis** : Tous les JSON-LD, tests qui vérifient `rel="sponsored nofollow"` et la présence des `alt`/meta. Config affiliée centralisée. Passe Lighthouse.
* **Phase 5 — Contenu seed & i18n-ready** : Fiches squelette du silo, guide pilier. Préparer la structure `/[lang]/` et les hreflang sans encore traduire.

À chaque phase : build vert, aucun lien affilié nu, Lighthouse contrôlé sur le gabarit destination.

## 12. À NE PAS faire

* Pas de « top 10 des hôtels » génériques : toujours l'angle profil/quartier.
* Pas de framework CSS lourd ni de JS client superflu.
* Pas d'ID d'affiliation en dur dans le contenu ou les templates.
* Pas de données climatiques inventées : laisser les champs vides plutôt que de deviner (ils seront remplis avec des sources réelles avant publication).
* Pas de contenu marketing creux : chaque phrase aide le lecteur à décider où dormir.

## Notes de vérité (à valider avant mise en ligne, hors périmètre code)

Les chiffres climat et descriptions de quartiers de la fiche La Rochelle sont basés sur des moyennes réelles mais doivent être re-vérifiés et enrichis d'expérience de première main (E-E-A-T) avant publication. Le code, lui, doit traiter ces valeurs comme des données remplaçables.
