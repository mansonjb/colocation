import { AFFILIATE_PARTNERS } from '../config/affiliate.config';

/**
 * Helper central : construit l'URL affiliée finale à partir d'une URL brute du contenu.
 * Injecte le tag partenaire configuré (env) si le domaine correspond à un programme connu.
 * Une URL vide (fiche squelette) reste vide : le composant AffiliateLink ne rend alors pas de lien.
 */
export function buildAffiliateLink(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  for (const partner of Object.values(AFFILIATE_PARTNERS)) {
    if (partner.hosts.includes(url.hostname) && partner.param && partner.id) {
      url.searchParams.set(partner.param, partner.id);
    }
  }
  return url.toString();
}

/** Vrai si l'URL pointe vers un partenaire monétisé */
export function isMonetized(rawUrl: string | undefined | null): boolean {
  if (!rawUrl) return false;
  try {
    const { hostname } = new URL(rawUrl);
    return Object.values(AFFILIATE_PARTNERS).some((p) => p.hosts.includes(hostname));
  } catch {
    return false;
  }
}
