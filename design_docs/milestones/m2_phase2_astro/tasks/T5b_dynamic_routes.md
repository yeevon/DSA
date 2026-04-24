# T5b — Dynamic chapter routes + pandoc → MDX safety bridge

**Status:** todo
**Depends on:** T5a (chapter index + chapters.json migration); T2 (filter); T3 (callout components); T4 (build pipeline)
**Blocks:** T6 (deploy needs functional chapter routes), T8

## Why

T5 was decomposed (2026-04-23): T5a shipped the chapter-listing index without going through Astro content collections (the index reads `scripts/chapters.json` directly). T5b is the deferred work — wire the schema and the dynamic chapter routes so `/lectures/<id>/`, `/notes/<id>/`, `/practice/<id>/` actually resolve to the rendered MDX bodies.

The blocker that forced the decompose: pandoc-emitted MDX has multiple constructs MDX's JSX parser rejects:

1. **`{#anchor-id}` header attribute syntax** — MDX reads `{...}` as a JSX expression; `#` isn't a valid JS identifier prefix. *(Already handled in `build-content.mjs` via `mdxSafetyRewrite()` — header attr blocks rewritten to leading `<a id="…"></a>` element.)*
2. **`<!--` HTML comments** (pandoc disambiguation) — MDX uses `{/* */}`. *(Already handled in `build-content.mjs` — converted in `mdxSafetyRewrite()`.)*
3. **Literal `{` / `}` braces in chapter content** — chapters use set notation extensively (`{a, b, c}`, `{set}`-style descriptions). MDX parses every `{` as a JSX expression opener. **Not yet handled.**
4. **Literal `<` / `>` outside math** — chapter prose uses `<` and `>` in inequalities, generics-style annotations (`vector<T>`), and plain comparisons. MDX may parse `<X>` as a JSX tag opener. *Probably needs handling but won't surface until brace-escape is in.*
5. **Other MDX-incompatible constructs** likely surface during T5b cycles (pandoc-specific fenced-div syntax `:::`, etc.).

T5b's job is to add a comprehensive **MDX-safety pass** to `build-content.mjs` that runs after pandoc and before write, escaping or rewriting all the pandoc-output patterns MDX rejects. Once the .mdx files are MDX-parseable, lifting the schema back from `parking/T5b-content.config.ts` and writing the 3 dynamic routes is mechanical.

## Deliverable

- `src/content.config.ts` — restored from `parking/T5b-content.config.ts` (Astro 6 `glob`-loader-based collection schemas with Zod validation for `lectures`, `notes`, `practice`).
- `src/pages/lectures/[id].astro` — dynamic route reading `lectures` collection, calling `entry.render()`, importing T3's callout components and passing them via `<Content components={...}>`.
- `src/pages/notes/[id].astro` — same for notes.
- `src/pages/practice/[id].astro` — same for practice.
- Extended `mdxSafetyRewrite()` in `scripts/build-content.mjs` that escapes literal `{`/`}` outside fenced code blocks, JSX tags, and existing escapes; handles any other MDX-blocking pandoc-output patterns surfaced during cycles.
- `src/pages/index.astro` updated to remove the "T5b will resolve these" pending-callout (or replaced with a `getCollection`-based listing if the collection-load path now works).

## Steps

1. **Implement brace-escape pass.** In `scripts/build-content.mjs`, extend `mdxSafetyRewrite()` to walk the pandoc output line-by-line, tracking whether we're inside a fenced code block (` ``` `), inline code span (`` ` ``), JSX tag, or top-of-file frontmatter. Outside those contexts, replace bare `{` → `\{` and bare `}` → `\}`. (MDX accepts the backslash escape for literal braces.)
2. **Run the smoke against ch_5** (set-notation-heavy from T5 cycle 1) and ch_12 (`{a, b}` math sets). Iterate until both parse cleanly under MDX.
3. **Run against all 12 chapters.** Surface any new MDX-parser failures (likely `<` / `>` outside math). Add per-pattern handlers to `mdxSafetyRewrite()` as needed.
4. **Restore schema.** `mv parking/T5b-content.config.ts src/content.config.ts`. Verify `npm run build` passes the content-sync step.
5. **Author dynamic routes.** Three near-identical `[id].astro` files under `src/pages/{lectures,notes,practice}/` each calling `getCollection()` + `entry.render()` + passing T3 callout components via `<Content components={…}>`. (Original implementations from T5 cycle 1 are in git history — `git show <T5-pre-decompose-commit>:src/pages/lectures/[id].astro` etc.)
6. **Smoke**: `npm run build` produces 38 pages (index + callouts-test + 36 chapter routes); `npm run preview`; auditor curls the index + at least 3 chapter routes (1 each from lectures/notes/practice) and confirms callouts render, math renders via `remark-math`/`rehype-katex`, anchors work as in-page navigation.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `mdxSafetyRewrite()` escapes literal `{`/`}` outside code/JSX/frontmatter contexts.
- [ ] **Auditor runs** `npm run build` from clean state. Exit 0. `dist/` contains 38 HTML files: `dist/index.html`, `dist/callouts-test/index.html`, and 36 chapter routes (12 lectures + 12 notes + 12 practice, ch_8 absent).
- [ ] **Auditor runs** `npm run preview` and curls `/DSA/lectures/ch_1/`. Response contains: T3 callout component class names (`callout-definition`, `callout-keyidea`, etc.), at least one `<a id="ch_1-…">` anchor from a header rewrite, syntax-highlighted code blocks (Shiki output), rendered KaTeX math (`<span class="katex">…`).
- [ ] **Auditor curls** `/DSA/notes/ch_3/` and `/DSA/practice/ch_5/` to spot-check the other two collections.
- [ ] No `/lectures/ch_8/` route exists.
- [ ] `src/content.config.ts` restored from parking; `glob` loader resolves all 12 entries per collection.

## Notes

- **Brace-escape is the surface area.** Most chapters use `{` / `}` in prose, math, and code; the escape needs to be careful about *inside-code* exemption (don't double-escape). Use `unified` / `remark` plugin if regex-line-walking gets unwieldy; otherwise keep it in the build script.
- **Decomposed origin.** Per the original T5 spec's decompose trigger ("If the chapters.yml→frontmatter migration ends up larger than expected, split into T5a + T5b"). The actual decompose driver was MDX-pandoc bridge work, not yml migration scope, but the split is the same shape.
- **T6 dependency** updated to T5b (was T5). T6's deploy verification curls a chapter route post-deploy; that needs T5b to land first.
- **T8 dependency** unchanged — T8 still gates on T6 stability.
