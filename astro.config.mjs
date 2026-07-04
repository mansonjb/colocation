// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Le domaine de production est configurable via SITE_URL (Netlify / Cloudflare Pages / Vercel).
const SITE = process.env.SITE_URL ?? 'https://www.capaufrais.fr';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  build: {
    format: 'directory',
  },
});
