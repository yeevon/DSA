# T5a — Chapter-listing index + chapters.json migration

**Status:** ✅ done 2026-04-23 (decomposed from original T5; see [`T5b_dynamic_routes.md`](T5b_dynamic_routes.md) for the deferred MDX-bridge work)
**Depends on:** T1 (scaffold), T4 (build-content.mjs reads chapters.json)
**Blocks:** —

## Why

Original T5's scope (schema + 3 dynamic chapter routes + index page) fragmented along the pandoc-MDX boundary: `getCollection()` triggers MDX parsing of every entry at sync time, and the pandoc-emitted MDX has multiple JSX-incompatible constructs (`{#anchor}` header attrs, `<!--` comments, literal `{set}`/`<<` patterns from chapter content) that need a dedicated post-processing layer to bridge. T5a's scope is **just** what works without MDX rendering: the chapter-listing index page (data only — no `entry.render()`), the `_data/chapters.yml → scripts/chapters.json` migration that lets T8 delete the yml, and the build-content.mjs metadata merge that bakes per-chapter metadata into every generated MDX's frontmatter (the prep work T5b's schema will validate).

T5b owns the schema + the dynamic `[id].astro` routes + the brace-escape / MDX-safety pass that makes pandoc output parseable as MDX. The schema work is parked at [`../parking/T5b-content.config.ts`](../parking/T5b-content.config.ts) for T5b to lift back into `src/content.config.ts`.

## Deliverable

- `scripts/chapters.json` — 12-entry array (`id`, `n`, `title`, `subtitle`, `required`) migrated from Jekyll's `_data/chapters.yml`. Single source of truth for per-chapter metadata going forward.
- `scripts/build-content.mjs` reads `chapters.json` and merges per-chapter metadata into every generated MDX's frontmatter (`chapter_id`, `n`, `title`, `subtitle`, `required` — plus `sections:` array on lectures only).
- `_data/chapters.yml` is **unreferenced** by any code in `src/` or `scripts/` (T8's fail-loud `grep -rn 'chapters\.yml' src/ scripts/` check passes).
- `src/pages/index.astro` replaces the T1 placeholder with a per-chapter table (required + optional sections) populated from `scripts/chapters.json`. Links to `/lectures/<id>/`, `/notes/<id>/`, `/practice/<id>/` are present but resolve to 404 until T5b lands the dynamic routes.

## Steps

1. **Migrate yml → JSON.** `_data/chapters.yml` had two top-level keys (`required:` / `optional:`) each with 6 chapter entries; flatten into a single 12-entry array at `scripts/chapters.json`, deriving `required: true|false` from the source key.
2. **Wire `build-content.mjs` to read `chapters.json`** at top of file, build a `META_BY_ID` map, and merge `{n, title, subtitle, required}` into every collection's frontmatter (lectures + notes + practice). Section-list array stays lectures-only per Gap 1 from the M2 alignment review.
3. **Verify the T8 contract.** `grep -rn 'chapters\.yml' src/ scripts/` must return zero hits. Comments in `build-content.mjs` that reference the yml file historically must avoid the literal `chapters.yml` substring (use `chapters dot yml` or `the legacy yml` so the contract grep doesn't false-positive).
4. **Replace `src/pages/index.astro`** with a chapter-listing page that imports `scripts/chapters.json` directly (NOT through `astro:content` — T5a deliberately avoids the collection-load path that triggers MDX parsing). Sort by `n`; split into required + optional tables; emit `/lectures/<id>/`, `/notes/<id>/`, `/practice/<id>/` links + a "T5b will resolve these" callout.
5. **Smoke**: `npm run build` must exit 0 and produce `dist/index.html` containing all 12 chapter rows + 36 (incl. ch_8 = 0) outbound links.

## Acceptance check (auditor smoke test — non-inferential)

- [x] `scripts/chapters.json` exists; contains 12 entries; required-vs-optional flag matches the original yml split.
- [x] `scripts/build-content.mjs` reads `scripts/chapters.json` (not `_data/chapters.yml`).
- [x] `grep -rn 'chapters\.yml' src/ scripts/` returns zero hits — T8 contract holds.
- [x] Each generated MDX (lectures, notes, practice) carries `chapter_id`, `n`, `title`, `subtitle`, `required` in its frontmatter.
- [x] `src/pages/index.astro` reads `scripts/chapters.json` directly; does NOT use `getCollection()`.
- [x] **Auditor runs** `npm run build` from clean state. Exit 0. `dist/index.html` exists; lists all 12 chapters by required/optional with links to `/DSA/{lectures,notes,practice}/<id>/` per chapter.
- [x] No dynamic chapter routes resolve yet (intentional — T5b deliverable).

## Notes

- **ch_8 sanity preserved.** `chapters.json` has no `ch_8` entry, so the index renders 12 rows (1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13).
- **The `_data/` directory still contains `chapters.yml`** as a Jekyll artefact — T8 deletes it. T5a removed all *readers* of the file from active code; the file itself isn't deleted here so T8's Jekyll sweep stays the single deletion point.
- **Schema parking.** `src/content.config.ts` was written and tested briefly in T5 before decompose; the file moved to `parking/T5b-content.config.ts` so T5b can lift it back in once the MDX-safety pass makes the schema's `glob` loader safe to use. The schema itself is correct (verified validating the generated MDX frontmatter shapes); the blocker is upstream MDX parse failures in chapter bodies.
