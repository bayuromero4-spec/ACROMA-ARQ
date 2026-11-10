// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cambia `site` por el dominio real cuando se publique la web.
export default defineConfig({
  site: 'https://acroma-arq.pages.dev',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  trailingSlash: 'never',
  compressHTML: true,
});
