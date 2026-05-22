// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://sheidasheikheh.com',
  // Custom domain serves from the root, so no `base` is needed.
  integrations: [react(), mdx(), sitemap(), icon()],
  markdown: {
    // Dual themes with defaultColor:false emit both `--shiki-light` and
    // `--shiki-dark` CSS vars per token; global.css picks which to use per
    // [data-theme] (sepia reuses the light token colors on a warm background).
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: true,
    },
  },
  vite: {
    ssr: {
      // d3 ships ESM; keep it out of the noExternal churn during builds.
      noExternal: ['d3-scale', 'd3-shape', 'd3-array', 'd3-geo', 'd3-interpolate'],
    },
  },
});
