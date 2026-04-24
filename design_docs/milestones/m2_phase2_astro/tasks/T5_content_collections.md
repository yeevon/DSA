# T5 — Astro content collections + per-chapter routes

**Status:** todo
**Depends on:** T1 (scaffold), T4 (content under `src/content/` exists)
**Blocks:** T6 (deploy needs functional routes), T8

## Why

T4 fills `src/content/{lectures,notes,practice}/ch_N.mdx`. T5 turns
those into addressable routes (`/lectures/ch_1/`, `/notes/ch_5/`,
`/practice/ch_3/`) so users can navigate to chapter content. This
is the layer that replaces today's Jekyll routes (`lectures/ch_N.md`
+ `notes/ch_N.md` wrapper files).

Per [`../../architecture.md`](../../architecture.md) §1, Astro
content collections own the per-collection schema; per-chapter
metadata (title, subtitle, required-vs-optional) comes from
`_data/chapters.yml` for now and migrates into collection
frontmatter at the end of M2 (out-of-scope for this task — bookmark
it for T8 or a post-T5 micro-task).

## Deliverable

- `src/content/config.ts` — defines 3 content collections with Zod
  schemas: `lectures`, `notes`, `practice`. Each row keyed by
  chapter id (`ch_1` … `ch_13`, skipping ch_8).
- `src/pages/lectures/[id].astro` — dynamic route that reads from
  the `lectures` collection.
- `src/pages/notes/[id].astro` — same for `notes`.
- `src/pages/practice/[id].astro` — same for `practice`.
- `src/pages/index.astro` — replaces the T1 placeholder with a real
  index listing all 12 chapters and linking to the 3 routes per
  chapter (matches today's Jekyll `index.md` table layout).

## Steps

1. **Schema** at `src/content/config.ts`:
   - Each collection: `{ id: string, title: string, subtitle?: string,
     n: number, required: boolean }` for now (sourced from
     `_data/chapters.yml` — see step 4).
   - Use `defineCollection` and `getCollection` from `astro:content`.
2. **Dynamic routes.** `src/pages/lectures/[id].astro`:
   - `getStaticPaths` enumerates the `lectures` collection.
   - Renders `<Base>` layout (T1) with the chapter content inside.
   - Imports the 6 callout components (T3) so MDX bodies resolve.
3. **Index** at `src/pages/index.astro`:
   - List all 12 chapters in a table: chapter number, title,
     [Lectures] [Notes] [Practice] links.
   - Mark optional chapters distinctly (visual cue).
4. **Frontmatter sourcing — and migrate `_data/chapters.yml` into
   per-MDX frontmatter as part of T5 (not deferred to T8).** The
   per-chapter metadata (`title`, `subtitle`, `n`, `required`)
   currently lives in Jekyll's `_data/chapters.yml`. T5 owns the
   migration: extend `scripts/build-content.mjs` (T4) to read the
   yml, merge it into each generated MDX's frontmatter alongside
   T4's section-list output (see T4 step 1), and stop reading from
   yml afterwards. By T5 close, the content collections are the
   single source of truth for per-chapter metadata; `_data/chapters.yml`
   is unreferenced and ready for T8 to delete with the rest of Jekyll.
   T8 carries a fail-loud check that the file is in fact unreferenced.
5. **Smoke**: `npm run dev`, navigate to:
   - `/` → index renders all 12 chapters.
   - `/lectures/ch_1/`, `/notes/ch_1/`, `/practice/ch_1/` → all 3
     routes render content.
   - `/lectures/ch_8/` → 404 (or Astro's missing-route behaviour;
     ch_8 doesn't exist).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/content/config.ts` defines 3 collections with matching
      schemas; `npm run build` types-check the schemas (no `any`
      escapes).
- [ ] **Auditor runs** `npm run build` and confirms `dist/` contains:
      `dist/index.html`, `dist/lectures/ch_1/index.html` …
      `dist/lectures/ch_13/index.html` (skipping ch_8) — all 12
      chapter routes for all 3 collections = 36 generated routes.
- [ ] **Auditor runs** `npm run preview` and navigates to the index
      and at least 3 chapter routes (1 each from
      lectures/notes/practice). Confirms callout components render,
      anchors prefixed `ch_N-` work as in-page navigation.
      Build-clean alone is insufficient per
      [CLAUDE.md](../../../CLAUDE.md#auditor-conventions).
- [ ] No `/lectures/ch_8/` or `/notes/ch_8/` route exists (ch_8
      isn't a chapter).
- [ ] `_data/chapters.yml` is **not read** by any code in `src/` or
      `scripts/` after T5 lands. *Verify:* `grep -rn 'chapters\.yml'
      src/ scripts/` returns zero hits. (T8 then deletes the file.)
- [ ] Each generated MDX in `src/content/lectures/`,
      `src/content/notes/`, `src/content/practice/` has the
      per-chapter metadata (`title`, `subtitle`, `n`, `required`)
      in its frontmatter, sourced from the migrated yml.

## Notes

- **`_data/chapters.yml` migration owned by T5** (not T8). Reasoning:
  T5 is where the content-collection schema lands; the yml→frontmatter
  shape decision belongs with the schema decision, not with the
  Jekyll-deletion task. T8 retains a fail-loud check that
  `_data/chapters.yml` is unreferenced before removal — that's
  T8's job, not the migration itself.
- **No interactive surfaces.** Per
  [`../README.md`](../README.md) "Out of scope": no review queue,
  no editor, no annotations. Static-only. Mode detection
  (`'static'` only) is fine without a stub for M2.
- **ch_8 sanity** — there is no `chapters/ch_8/`; the chapter map
  jumps from ch_7 (optional) to ch_9 (AVL). T5 must not generate
  ch_8 routes. This is also a `roadmap_addenda.md` Phase 1
  acceptance criterion that already passed; preserving it through
  M2 is automatic if `getCollection` enumerates only what exists.
- **Decompose trigger.** If the chapters.yml→frontmatter migration
  (step 4) ends up larger than expected (e.g. requires changing
  yml schema or restructuring `_data/`), split into T5a (schema +
  3 dynamic routes + index page) and T5b (yml migration + the
  fail-loud bridge to T8). T5a alone gets to a renderable site;
  T5b lets T8 proceed.
