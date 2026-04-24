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
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://yeevon.github.io',
  base: '/DSA/',
  output: 'static',
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  ],
});
