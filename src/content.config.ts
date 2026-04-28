// src/content.config.ts
//
// M2 Task T5 — Astro content-collection schemas (Astro v6+ format).
//
// Three collections, one per source family (lectures / notes /
// practice). All three share a base of per-chapter metadata
// (chapter_id, n, title, subtitle, required) injected by
// scripts/build-content.mjs from scripts/chapters.json. Lectures
// additionally carry the section-list (id/anchor/title/ord) parsed
// from the pandoc-emitted ch_N- prefixed header anchors — this is
// the canonical section index M3's seeding contract reads per
// design_docs/architecture.md §2.
//
// Astro 6 requires each collection to declare an explicit `loader`
// (the legacy implicit "files under src/content/<name>/" lookup is
// gone) — `glob()` from `astro/loaders` does the equivalent here.
//
// MDX entries themselves are gitignored build artefacts (regenerated
// every `npm run build` / `npm run dev` via the prebuild/predev
// hook); only this config + the .gitkeep files are tracked.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  chapter_id: z.string().regex(/^ch_\d+$/),
  n: z.number().int().positive(),
  title: z.string(),
  subtitle: z.string(),
  required: z.boolean(),
});

// `level` added in M-UX-REVIEW T2 D1 (2026-04-27): 1 = top-level
// numbered section (title matches `^\d+\.\d+\s`); 2 = H2 subsection
// underneath. Consumed by RightRailTOC.astro to set `data-level` on
// each TOC `<li>` so the right-rail TOC renders H1 + H2 with a clear
// visual split (UI-review F4). Reverses the M-UX b29d409 frontmatter-
// side filter rule. Architecture.md §1.6 documents the new contract.
const sectionSchema = z.object({
  id: z.string(),
  anchor: z.string(),
  title: z.string(),
  level: z.union([z.literal(1), z.literal(2)]),
  ord: z.number().int().nonnegative(),
});

const lectures = defineCollection({
  loader: glob({ pattern: 'ch_*.mdx', base: './src/content/lectures' }),
  schema: baseSchema.extend({
    sections: z.array(sectionSchema),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: 'ch_*.mdx', base: './src/content/notes' }),
  schema: baseSchema,
});

const practice = defineCollection({
  loader: glob({ pattern: 'ch_*.mdx', base: './src/content/practice' }),
  schema: baseSchema,
});

export const collections = { lectures, notes, practice };
