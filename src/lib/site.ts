/** Métadonnées globales du site */
export const SITE_NAME = 'Cap au Frais';
export const SITE_TAGLINE = 'Le guide des séjours ensoleillés sans la fournaise';
export const DEFAULT_LOCALE = 'fr';

/**
 * i18n : préparé pour la phase multilingue (/en/..., /de/...).
 * Tant qu'une seule locale est active, BaseHead n'émet qu'un hreflang fr + x-default.
 */
export const LOCALES: { code: string; prefix: string }[] = [{ code: 'fr', prefix: '' }];

/** Chemin localisé d'une page (prêt pour /[lang]/ sans rien casser aujourd'hui) */
export function localizePath(path: string, locale = DEFAULT_LOCALE): string {
  const l = LOCALES.find((x) => x.code === locale);
  return `${l?.prefix ?? ''}${path}`;
}
