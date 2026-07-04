/**
 * Configuration d'affiliation centralisée.
 * Les IDs partenaires vivent ICI (via variables d'env), jamais dans le contenu ni les templates.
 * Changer de programme ou de tag = modifier ce seul fichier / les variables d'env.
 */
export interface AffiliatePartner {
  /** Domaines reconnus comme monétisés (utilisés par les tests) */
  hosts: string[];
  /** Nom du paramètre de tracking à injecter dans l'URL */
  param?: string;
  /** Valeur du tag partenaire (env) */
  id?: string;
}

export const AFFILIATE_PARTNERS: Record<string, AffiliatePartner> = {
  booking: {
    hosts: ['booking.com', 'www.booking.com'],
    param: 'aid',
    id: import.meta.env.PUBLIC_BOOKING_AID,
  },
  hometogo: {
    hosts: ['hometogo.fr', 'www.hometogo.fr', 'hometogo.com', 'www.hometogo.com'],
    param: 'ref',
    id: import.meta.env.PUBLIC_HOMETOGO_REF,
  },
  getyourguide: {
    hosts: ['getyourguide.fr', 'www.getyourguide.fr', 'getyourguide.com', 'www.getyourguide.com'],
    param: 'partner_id',
    id: import.meta.env.PUBLIC_GYG_PARTNER_ID,
  },
};

/** Tous les hosts monétisés, à plat (pour les tests et le wrapper AffiliateLink) */
export const MONETIZED_HOSTS: string[] = Object.values(AFFILIATE_PARTNERS).flatMap((p) => p.hosts);
