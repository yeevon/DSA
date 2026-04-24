// @ts-check
// Astro config for cs-300.
// site + base match the existing GitHub Pages mount so M2 T6's
// workflow swap is a like-for-like deploy.
// MDX integration registered in M2 T5 so generated content
// (src/content/{lectures,notes,practice}/ch_N.mdx) renders the
// JSX callout components T3 ships.
// remark-math + rehype-katex pick up `$…$` / `$$…$$` blocks before
// MDX's JSX parser sees them — without these, math content like
// `$<$` (literal less-than via inline math) trips MDX's tag-opener
// detection. Required by every chapter (44–699 inline math
// occurrences each).
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// M3 T3 — `@astrojs/node` adapter added so per-route
// `prerender = false` works in dev + standalone-server build.
// Pages stay prerendered (Astro 6 default with `output: 'static'`);
// API routes under src/pages/api/* opt out per-route. The
// public GH Pages deploy still serves only the prerendered chapter
// pages — the Node-server entrypoint produced by the adapter is
// not uploaded by M2 T6's deploy workflow (which uploads `dist/`,
// where prerendered pages live).
export default defineConfig({
  site: 'https://yeevon.github.io',
  base: '/DSA/',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  ],
});
