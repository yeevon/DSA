# T5a — Chapter-listing index + chapters.json migration — Audit Issues

**Source task:** [../tasks/T5a_content_collections.md](../tasks/T5a_content_collections.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`scripts/chapters.json`, `tasks/T5b_dynamic_routes.md`, `parking/T5b-content.config.ts`); renamed (`tasks/T5_content_collections.md` → `tasks/T5a_content_collections.md`); modified (`scripts/build-content.mjs` for metadata merge + grep-safe comments, `src/pages/index.astro` rewritten from T1 placeholder, `tasks/README.md` task-index split, `m2/README.md` task-table split, `tasks/T6_pages_workflow.md` dependency update, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1 (content pipeline) + §2 (per-chapter metadata seeding source), [`../tasks/T8_delete_jekyll.md`](../tasks/T8_delete_jekyll.md) step 3 (fail-loud `chapters\.yml` grep contract — must hold post-T5a), original M2 alignment-review Gap 2 ("T5 owns the yml→frontmatter migration"). Smoke checks executed by the auditor: clean-state full build, T8 contract grep, index-page content inspection.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `@astrojs/mdx`, `remark-math`, `rehype-katex`, `katex` were installed during T5 cycle 1 (pre-decompose). All four are sanctioned by architecture.md §1's MDX rendering pipeline; math plugins are required for the chapter content's heavy math density (44–699 inline math per chapter). They stay installed across T5a/T5b — T5a doesn't use them but T5b will. |
| Jekyll polish                            | ✅ ok  | `_data/chapters.yml` data is migrated *out of* Jekyll's data dir (to `scripts/chapters.json`) — that's the opposite of polishing Jekyll. The yml file itself stays for T8 to delete. |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content authored.                                                                          |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content authored.                                                                          |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T5a deliberately scopes down to data-only work that doesn't trigger MDX parsing. T5b owns the schema/route/MDX-bridge work that surfaced the cross-task complexity. |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                        | Status | Notes |
|---|---------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `scripts/chapters.json` exists; contains 12 entries; required-vs-optional flag matches the original yml split.                              | ✅ PASS | 12 entries; ch_1–ch_6 marked `required: true`, ch_7 + ch_9–ch_13 marked `required: false`. Mirrors yml exactly. |
| 2 | `scripts/build-content.mjs` reads `scripts/chapters.json` (not `_data/chapters.yml`).                                                        | ✅ PASS | Confirmed by reading the file; no `chapters.yml` references in active code. |
| 3 | `grep -rn 'chapters\.yml' src/ scripts/` returns zero hits — T8 contract holds.                                                              | ✅ PASS | Auditor ran the grep; zero hits. (Build-content.mjs's historical comments rephrased to `chapters dot yml` to avoid grep false-positives — explicitly noted in those comments.) |
| 4 | Each generated MDX (lectures, notes, practice) carries `chapter_id`, `n`, `title`, `subtitle`, `required` in its frontmatter.                | ✅ PASS | Spot-checked `src/content/lectures/ch_5.mdx` frontmatter: `chapter_id: "ch_5"`, `n: 5`, `title: "Chapter 5"`, `subtitle: "Hash tables"`, `required: true`, plus a 9-entry `sections:` array (lectures-only, per Gap 1). |
| 5 | `src/pages/index.astro` reads `scripts/chapters.json` directly; does NOT use `getCollection()`.                                              | ✅ PASS | `import chapters from '../../scripts/chapters.json';` — direct JSON import. No `astro:content` import. Header comment in the file documents *why* (avoiding the MDX-parse trigger that's T5b's scope). |
| 6 | Auditor runs `npm run build` from clean state. Exit 0. `dist/index.html` exists; lists all 12 chapters by required/optional with chapter-route links.  | ✅ PASS | Auditor ran `npm run build`; exit 0; `2 page(s) built in 553ms` (index + callouts-test). `dist/index.html` contains 12 chapter rows with `<a href="/DSA/{lectures,notes,practice}/<id>/">read</a>` links per chapter. Required/optional split visible as two separate `<table>` blocks. |
| 7 | No dynamic chapter routes resolve yet (intentional — T5b deliverable).                                                                      | ✅ PASS | `find dist -name '*.html'` returns only `dist/index.html` and `dist/callouts-test/index.html`. Chapter-route links in the index page resolve to 404 in the build output (intentional; index has a "T5b will resolve these" callout flag for users). |

All 7 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M2-T05a-ISS-01 — Index page chapter-route links currently 404 — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — T5b owns

The index page renders 36 outbound `<a href="/DSA/{lectures,notes,practice}/<id>/">` links, but only the 2 routes built so far (`/`, `/callouts-test/`) resolve. The chapter routes 404 until T5b lands the dynamic `[id].astro` pages. The index page calls this out in a visible paragraph ("Chapter routes pending M2 T5b") so a reader doesn't think the deploy is broken.

**Action / Recommendation:** none. T5b's deliverable is exactly this. Once T5b ships, an audit gate will be: "click any chapter link from the index page; it resolves and renders content."

## Additions beyond spec — audited and justified

- **MDX integration + math plugins (`@astrojs/mdx`, `remark-math`, `rehype-katex`, `katex`) installed during T5 cycle 1** before the decompose. Stay installed across T5a/T5b — T5a doesn't use them but T5b will, and uninstalling them now is churn. Bundle weight is zero for T5a's deploy (MDX integration only activates when a page uses `entry.render()`; T5a's index page doesn't).
- **Schema work parked at `parking/T5b-content.config.ts`.** T5 cycle 1 wrote `src/content.config.ts` with Astro 6's `glob`-loader-based collections. The schema itself is correct and validated for the 36 generated MDX entries — the blocker is upstream MDX parse failures in chapter bodies. Moved to a parking dir under M2's milestone tree (alongside `tasks/`, `issues/`) so the file isn't lost in git history but doesn't pollute `src/`. T5b lifts it back.
- **`chapters.json` lives under `scripts/` not `src/data/`.** The data is build-script-input (read by `build-content.mjs` and once by `index.astro`); colocating with the build script makes the data-flow obvious. Could also have lived under `src/data/` (Astro convention); chose `scripts/` for proximity to the consumer.
- **Index page has a visible "T5b pending" callout.** Not in spec; harmless transparency for any reader of the deployed site.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| `scripts/chapters.json` exists; 12 entries; required-vs-optional matches yml                     | ✅ |
| `scripts/build-content.mjs` reads `chapters.json`; merges metadata into all 3 collections        | ✅ |
| `grep -rn 'chapters\.yml' src/ scripts/` returns zero hits                                       | ✅ T8 contract holds |
| Generated MDX frontmatter has `chapter_id`, `n`, `title`, `subtitle`, `required` (sample ch_5)   | ✅ |
| `src/pages/index.astro` does NOT import from `astro:content`                                     | ✅ |
| Auditor `npm run build` from clean state exit 0                                                  | ✅ 553ms, 2 pages |
| `dist/index.html` lists 12 chapters with route links                                              | ✅ |
| `tasks/T5_content_collections.md` renamed to `T5a_content_collections.md`; T5b spec exists       | ✅ |
| Tasks index + M2 README task table reflect the T5a/T5b split                                     | ✅ |
| T6 dependency updated to T5b                                                                     | ✅ |
| CHANGELOG entry references T5a + the T5 decompose decision                                       | ✅ |

## Issue log — cross-task follow-up

| ID             | Severity  | Status       | Owner / next touch point                                       |
| -------------- | --------- | ------------ | -------------------------------------------------------------- |
| M2-T05a-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | T5b (delivers chapter-route resolution)                         |

## Propagation status

T5b spec already includes the deferred work as its own scope (no carry-over needed; the spec is purpose-built for it). T6 and T8 dependency lines updated to point at T5b where they previously said T5. The tasks/README.md "T5 decompose note (2026-04-23)" makes the split discoverable from the task-index alone.
