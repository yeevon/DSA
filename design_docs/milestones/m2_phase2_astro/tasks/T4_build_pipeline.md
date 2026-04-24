# T4 — Pandoc → Astro build pipeline

**Status:** todo
**Depends on:** T1 (Astro scaffold), T2 (Lua filter)
**Blocks:** T5, T6, T8

## Why

T2 produces a working Lua filter; T1 produces a working Astro
project. T4 glues them: a script that walks `chapters/`, runs
pandoc-with-filter on every `lectures.tex` and `notes.tex`, copies
`practice.md` straight through, and writes the results into
`src/content/{lectures,notes,practice}/ch_N.mdx` so Astro's content
collections (T5) can pick them up.

This is the seam where `chapters/` (source of truth) meets `src/`
(generated content). It runs at build time only — no runtime
pandoc.

## Deliverable

`scripts/build-content.mjs` (Node ESM script) with three
responsibilities:

1. Iterate `chapters/ch_*/`. For each chapter:
   - Run `pandoc --lua-filter scripts/pandoc-filter.lua` against
     `lectures.tex` → write to `src/content/lectures/ch_N.mdx`.
   - Same for `notes.tex` → `src/content/notes/ch_N.mdx`.
   - Copy `practice.md` (no pandoc) → `src/content/practice/ch_N.mdx`.
2. Validate: every chapter dir produces all 3 files; fail loudly
   if any are missing.
3. Wire into `package.json` as a `prebuild` script so
   `npm run build` runs T4 first, then `astro build`. Same for
   `predev` so dev mode works on the generated content.

## Steps

1. Write `scripts/build-content.mjs`. Use Node's built-in `fs/promises`
   and `child_process.execFile` (no extra deps). Pass the chapter
   number as a pandoc metadata arg so the filter can use it for
   anchor prefixing (matches T2 step 2).
2. Edit `package.json`:
   - Add `"prebuild": "node scripts/build-content.mjs"`.
   - Add `"predev": "node scripts/build-content.mjs"`.
   - (Optional) `"build:content": "node scripts/build-content.mjs"`
     for ad-hoc invocation.
3. Add `src/content/` directories with a `.gitkeep` in each
   subdirectory so the schema files (T5) have somewhere to live.
   The generated `ch_*.mdx` files themselves should be **gitignored**
   — they're build artefacts. Add `src/content/lectures/ch_*.mdx`,
   `src/content/notes/ch_*.mdx`, `src/content/practice/ch_*.mdx`
   to `.gitignore`. (`config.ts` from T5 stays tracked.)
4. **Smoke**: from a clean state (rm `src/content/{lectures,notes,
   practice}/ch_*.mdx`), run `npm run build`. Expect:
   - Prebuild hook fires, runs T4, produces 36 MDX files (12 × 3).
   - Astro build proceeds against the generated content.
   - `dist/` populated.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `scripts/build-content.mjs` exists and is executable as ESM
      Node.
- [ ] `package.json` `prebuild` and `predev` scripts both invoke
      the build-content script.
- [ ] **Auditor runs** `rm -rf src/content/lectures/ch_*.mdx
      src/content/notes/ch_*.mdx src/content/practice/ch_*.mdx
      && npm run build` from a clean state. Expects exit 0 and 36
      generated MDX files.
- [ ] `src/content/lectures/ch_1.mdx` opens cleanly: contains
      callout components from T2's filter, contains a `ch_1-`-prefixed
      anchor, no raw passthrough blocks unaccounted for.
- [ ] `git status` shows the 36 generated MDX files as ignored, not
      tracked.

## Notes

- **Why prebuild instead of an Astro integration?** Simpler. An
  integration would let Astro re-run the filter on file change in
  dev mode; a prebuild script requires `npm run dev` to be restarted
  on chapter source change. The trade-off is acceptable for now —
  chapter editing isn't constant during M2 dev. If it becomes
  painful, refactor into an Astro integration later (post-M2).
- **Don't checksum-skip in T4.** Pandoc is fast enough on 24 files
  that an unconditional rebuild is fine. Adding skip-on-unchanged
  logic is premature optimisation.
- **practice.md → MDX conversion is just a copy.** Markdown is valid
  MDX. No frontmatter manipulation here — T5 handles content-collection
  schema separately.
