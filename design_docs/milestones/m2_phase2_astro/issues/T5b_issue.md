# T5b — Dynamic chapter routes + pandoc → MDX safety bridge — Audit Issues

**Source task:** [../tasks/T5b_dynamic_routes.md](../tasks/T5b_dynamic_routes.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`src/content.config.ts` lifted from parking, `src/pages/{lectures,notes,practice}/[id].astro`); modified files (`scripts/build-content.mjs` extended `mdxSafetyRewrite()` + practice rewrite path, `scripts/pandoc-filter.lua` `CodeBlock` handler hardening, `src/pages/index.astro` removed pending callout, `CHANGELOG.md`). Cross-checked against [`../tasks/T5a_content_collections.md`](../tasks/T5a_content_collections.md) (T5a's index page contract that `index.astro` doesn't import `astro:content` — preserved), [`../../../architecture.md`](../../../architecture.md) §1 (component library + content collections) + §2 (per-chapter section seeding source = `src/content/lectures/*.mdx` frontmatter), [`../tasks/T6_pages_workflow.md`](../tasks/T6_pages_workflow.md) (T6 deploy verification needs the chapter routes T5b ships). Smoke checks executed by the auditor: clean-state full build (`rm src/content/*/ch_*.mdx && npm run build`), dist enumeration, `npm run preview` + curls of one route per collection + a 404 negative check for ch_8.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None — `@astrojs/mdx`, `remark-math`, `rehype-katex`, `katex` were installed during T5 cycle 1 (pre-decompose) and audited under T5a as already-sanctioned. T5b only authors content using them. |
| Jekyll polish                            | ✅ ok  | No Jekyll files touched.                                                                              |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content authored.                                                                          |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content authored.                                                                          |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T5b is M2-scope; doesn't touch M3+ surfaces. The dynamic routes are the architecture.md §1 collection-render layer; mode detection (M3) is correctly absent — `'static'` is the implicit mode and architecture.md §4 says no stub is needed until interactive UI exists. |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                | Status | Notes |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `mdxSafetyRewrite()` escapes literal `{`/`}` outside code/JSX/frontmatter contexts.                                                                                                  | ✅ PASS | Three new functions in `scripts/build-content.mjs`: `mdxSafetyRewrite()` orchestrates 3 passes (header anchors → HTML comments → braces); `escapeBraces()` walks lines tracking frontmatter + fenced-code state; `escapeLineBraces()` escapes braces in text mode while passing through inline code spans (backticks), inline math (`$…$`), display math (`$$…$$`), JSX/HTML tags (`<Tag …>`), and existing MDX comments (`{/* … */}`). Verified by inspection of generated MDX: prose like `\{`if`, `else`, `for`, ...\}` (set notation, originally `{`if`, ...}`) renders cleanly; `$\\{a, b\\}$` math passes through to remark-math intact (math wraps `\{` in TeX which KaTeX renders as `{`). |
| 2 | Auditor runs `npm run build` from clean state. Exit 0. `dist/` contains 38 HTML files: `dist/index.html`, `dist/callouts-test/index.html`, and 36 chapter routes.                    | ✅ PASS | Auditor cleared the 36 source MDX files (`rm src/content/*/ch_*.mdx`); `npm run build` exit 0; `38 page(s) built in 8.31s`. `find dist -name 'index.html' \| wc -l` → 38. |
| 3 | Auditor runs `npm run preview` and curls `/DSA/lectures/ch_1/`. Response contains: T3 callout component class names, at least one `<a id="ch_1-…">` anchor, syntax-highlighted code blocks (Shiki), rendered KaTeX math. | ✅ PASS | Preview started on `:4323`; `curl http://localhost:4323/DSA/lectures/ch_1/` returned **245,532 bytes** containing: **5/5** distinct callout class names (`callout-definition`, `callout-keyidea`, `callout-gotcha`, `callout-example`, `callout-aside`), **79** `id="ch_1-…"` anchors, **147** `class="katex"` math renders (remark-math + rehype-katex), **76** Shiki/`astro-code` code blocks. |
| 4 | Auditor curls `/DSA/notes/ch_3/` and `/DSA/practice/ch_5/` to spot-check the other two collections.                                                                                  | ✅ PASS | `notes/ch_3` → HTTP 200, 64,783 bytes. `practice/ch_5` → HTTP 200, 31,794 bytes. Both render with the same callout-component pipeline; practice MDX (which is straight markdown copy + brace-escape, no pandoc) parses cleanly under the rewrite pass. |
| 5 | No `/lectures/ch_8/` route exists.                                                                                                                                                  | ✅ PASS | `curl -o /dev/null -w '%{http_code}'` → **404**. `getCollection()` enumerates only the 12 generated MDX files; ch_8 has no source so no route is generated. |
| 6 | `src/content.config.ts` restored from parking; `glob` loader resolves all 12 entries per collection.                                                                                  | ✅ PASS | Schema lifted from `parking/T5b-content.config.ts` to `src/content.config.ts`. Build log includes `[content] Synced content` (no validation errors). All 36 entries (12 × 3) populate the collections; the build log enumerated all 38 routes by name. |

All 6 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M2-T05b-ISS-01 — Brace escape over-escapes inside math contexts under some conditions — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — verified safe by KaTeX

The brace-escaper detects `$…$` math spans and skips them, but pandoc emits some math content with the braces *outside* the `$…$` wrapper (e.g., when a math expression spans markdown emphasis or list-item boundaries). Those braces get escaped to `\{` / `\}`. KaTeX renders `\{` as the LaTeX `\{` command (literal `{` character) — visually correct, but semantically the math AST has an extra escape. Spot-check on `ch_5/lectures/` (264 inline math) shows no rendering regressions; KaTeX accepts both `\{` and bare `{` inside math.

**Action / Recommendation:** none. Visible math renders correctly across all 12 chapters per the spot-checks. If a future chapter introduces math that depends on bare `{` having a non-LaTeX-escape semantic, revisit the math-detection pass.

### M2-T05b-ISS-02 — `astro check` not run as a gate — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — `npm run build` typecheck-passes implicitly

`@astrojs/check` is installed (T1 audit ISS-02 follow-up) but no script wires it as a gate. `npm run build` does its own type-checking implicitly via the Astro 6 toolchain (collection schemas validate; tsconfig strict applies). No explicit `astro check` invocation.

**Action / Recommendation:** add `"check": "astro check"` to `package.json` scripts when T6's CI workflow lands — running it pre-build catches schema drift earlier than the build's own validation. Tiny addition; no need for a T5b cycle 2.

## Additions beyond spec — audited and justified

- **`pandoc-filter.lua` `CodeBlock` handler hardened.** T2 spec said "default cpp when no class survives"; my T2 implementation only set the class when classes was empty. Pandoc actually emits classes for `lstlisting` blocks (carrying `c++` / `cpp` plus original lstlisting options as attributes). T5b cycle 1 surfaced that Shiki was reading the attribute block `{.c++ basicstyle=…}` as the language string. Fix: the handler now unconditionally sets `classes = {"cpp"}` AND clears `attributes` + `identifier`. Justified by the actual cs-300 chapter set being uniformly C++17 (the only non-C++ block is pseudo-code in ch_2 which renders close enough). If a future chapter introduces a non-C++ block needing distinct highlighting, reintroduce per-class-language detection.
- **Practice MDX now goes through `mdxSafetyRewrite()`.** T4 spec said practice was a "straight copy" (no pandoc); T4 audit didn't catch that practice MDX had unescaped braces because no MDX rendering happened in T4. T5b found practice failed MDX parse on LaTeX-flavoured author notation (`\emph{lazy-delete}`). Adding the rewrite preserves the "no pandoc" framing while making the file MDX-parseable. Spec-wording deviation, but follows the spirit of "practice.md is valid MDX".
- **Astro 6 `render()` API used instead of `entry.render()`.** Astro 6 split the instance method into a separate `render()` import (`import { render } from 'astro:content'`). T5b spec drafted before this was confirmed; deliverable text used `entry.render()`. Implemented version uses the import form — same semantics; build verifies it works.

## Verification summary

| Check                                                                                                       | Result |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| `mdxSafetyRewrite()` includes `escapeBraces` + `escapeLineBraces` passes                                     | ✅ |
| Auditor `rm src/content/*/ch_*.mdx && npm run build` from clean state                                       | ✅ exit 0, 8.31s |
| `dist/` contains 38 HTML files (1 index + 1 test + 12 lectures + 12 notes + 12 practice)                    | ✅ |
| `npm run preview` + `curl /DSA/lectures/ch_1/` returns rendered chapter (245 KB)                            | ✅ |
| Rendered `lectures/ch_1` contains all 5 callout class names                                                  | ✅ |
| Rendered `lectures/ch_1` contains 79 `id="ch_1-…"` anchors                                                  | ✅ |
| Rendered `lectures/ch_1` contains 147 `class="katex"` math renders                                          | ✅ |
| Rendered `lectures/ch_1` contains 76 Shiki/astro-code code blocks                                            | ✅ |
| `notes/ch_3` and `practice/ch_5` resolve with HTTP 200                                                       | ✅ |
| `lectures/ch_8` returns HTTP 404                                                                            | ✅ |
| `src/content.config.ts` restored from parking; `glob` loader resolves all 12 entries per collection         | ✅ |
| `src/pages/index.astro` no longer carries the "T5b pending" callout (chapter routes now resolve)            | ✅ |
| `pandoc-filter.lua` `CodeBlock` handler strips attrs + sets cpp class unconditionally                        | ✅ |
| Practice MDX runs through `mdxSafetyRewrite()` (LaTeX-flavoured author notation parses cleanly)             | ✅ |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T5b + cites the 38-page build                       | ✅ |

## Issue log — cross-task follow-up

| ID             | Severity  | Status       | Owner / next touch point                                       |
| -------------- | --------- | ------------ | -------------------------------------------------------------- |
| M2-T05b-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | None — math renders correctly under both bare-`{` and `\{` forms |
| M2-T05b-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | T6 — add `"check": "astro check"` to `package.json` scripts    |

## Propagation status

T5b unblocks T6 (deploy verification curls a chapter route post-deploy — that route now exists). The `parking/` directory is empty after the schema lift; consider removing it during T8's cleanup sweep. T7 is independent of T5b; its scope (`phase2_issues.md` items + `resources/` removal) doesn't depend on the chapter routes.
