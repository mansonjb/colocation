import hotelsData from '../data/hotels.generated.json';

export interface Hotel {
  name: string;
  slug: string;
  rating: number | null;
  reviewCount: number | null;
  stars: string | number | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

const DATA = hotelsData as Record<string, Hotel[]>;

/** Hôtels réels repérés pour une destination (via scrape Apify), vide si non renseigné. */
export function hotelsFor(slug: string): Hotel[] {
  return DATA[slug] ?? [];
}

/** "Hôtel de tourisme 4 étoiles" | 4 -> 4 ; sinon null */
export function starCount(stars: string | number | null): number | null {
  if (stars == null) return null;
  if (typeof stars === 'number') return stars;
  const m = stars.match(/(\d)\s*étoile/i);
  return m ? Number(m[1]) : null;
}
