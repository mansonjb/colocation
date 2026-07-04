import { SITE_NAME } from './site';

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbList(crumbs: Crumb[], site: URL | undefined): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.href, site).toString(),
    })),
  };
}

export function faqPage(faq: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function touristDestination(d: {
  name: string;
  country: string;
  intro: string;
  coordinates: { lat: number | null; lng: number | null };
}): object {
  const geo =
    d.coordinates.lat != null && d.coordinates.lng != null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: d.coordinates.lat,
            longitude: d.coordinates.lng,
          },
        }
      : {};
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: d.name,
    description: d.intro,
    address: { '@type': 'PostalAddress', addressCountry: d.country },
    ...geo,
  };
}

export function articleLd(
  a: { title: string; intro: string; updated: Date; author: string },
  url: URL,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.intro,
    dateModified: a.updated.toISOString(),
    author: { '@type': 'Organization', name: a.author || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url.toString(),
  };
}
