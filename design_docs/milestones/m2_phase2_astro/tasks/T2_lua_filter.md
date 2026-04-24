# T2 — Build pandoc Lua filter (HYBRID per M1 T2 verdict)

**Status:** todo
**Depends on:** —
**Blocks:** T4 (build pipeline needs the filter); transitively T5, T6, T8

## Why

M1 Task T2's pandoc probe verdict is **HYBRID**
([`../../pandoc_probe.md`](../../pandoc_probe.md)). Pandoc's default
LaTeX reader handles ~80% of `chapters/ch_N/lectures.tex` correctly
but drops three things M2 cannot ship without:

1. **Callout titles** — the `[Title]` argument to `\begin{defnbox}[Title]{Key}` etc.
   is silently dropped. Components need `title` to render.
2. **`lstlisting language=…` hint** — pandoc strips it. `<CodeBlock>`
   needs the hint to choose a syntax highlighter.
3. **Section anchors** — pandoc emits `<a id="section-slug">`; the
   data model in [`../../architecture.md`](../../architecture.md) §2
   (`sections.anchor`) requires `<a id="ch_N-section-slug">` so anchors
   are unique across the 12 chapters.

The filter exists to fix exactly these. Everything else (paragraphs,
math, lists, citations, etc.) stays on pandoc's default rendering.

## Deliverable

`scripts/pandoc-filter.lua` plus two supporting artefacts:

- `.pandoc-version` (or equivalent `package.json` field) pinning the
  pandoc minor version the filter is known-good against. (Carry-over
  M1-T02-ISS-02.)
- `design_docs/m2_raw_passthrough_sweep.md` (or similar) recording
  the per-chapter count of `` ```{=html} `` raw-passthrough blocks
  pandoc emits when run against every chapter source, with a per-
  occurrence disposition (source-fix vs filter-handle vs accepted).
  (Carry-over M1-T02-ISS-03.)

## Steps

1. **Pin pandoc.** Decide on a specific minor version (suggest:
   whatever the developer machine has installed, captured via
   `pandoc --version`). Record in `.pandoc-version` and reference
   from `package.json` build scripts (e.g. `scripts/check-pandoc.mjs`
   that fails the build if the local pandoc version drifts from the
   pinned one). Document the pin in `architecture.md` §1 (the pandoc
   row in the settled-tech table) so future audits see it.
2. **Author the filter** at `scripts/pandoc-filter.lua`. Required
   handlers:
   - `RawBlock` / environment handlers for `defnbox`, `ideabox`,
     `warnbox`, `examplebox`, `notebox` → emit
     `<Definition title="…">…</Definition>` (and the four
     equivalents). Preserve the `[Title]` arg.
   - `lstlisting` block handler → emit `<CodeBlock lang="…">…</CodeBlock>`.
     Preserve the `language=…` hint from the LaTeX optional args.
   - `Header` handler → prepend `ch_N-` to the auto-generated id
     (where N comes from the input filename, passed via pandoc
     metadata or filter argument).
3. **Run the raw-passthrough sweep.** For each
   `chapters/ch_*/lectures.tex` and `chapters/ch_*/notes.tex` (24
   files total), run `pandoc --lua-filter scripts/pandoc-filter.lua
   <file> -o /tmp/<chapter>.mdx` and `grep -c '```{=html}' /tmp/<chapter>.mdx`.
   Record counts in `design_docs/m2_raw_passthrough_sweep.md`. For
   each non-zero count, inspect the block: is the source a tcolorbox
   construct pandoc can't fully parse (decision: source-fix or
   filter-handle), or genuinely raw HTML the chapter author
   intended (decision: accept)? Document the decision per
   occurrence.
4. **Smoke test.** Run filter against `chapters/ch_1/lectures.tex`
   end-to-end. Open the output MDX and visually confirm:
   - All 5 callout types appear with their `[Title]` preserved.
   - `lstlisting` blocks render as `<CodeBlock lang="C++">…</CodeBlock>`.
   - Section anchors are prefixed `ch_1-…`.
   - Raw-passthrough blocks are zero (or accounted for in the sweep doc).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `scripts/pandoc-filter.lua` exists and is non-empty.
- [ ] `.pandoc-version` (or equivalent) names a specific minor
      version; `architecture.md` §1 references the pin.
- [ ] `pandoc --lua-filter scripts/pandoc-filter.lua
      chapters/ch_1/lectures.tex -o /tmp/ch_1.mdx` exits 0.
      **Auditor must run this**, not infer from the filter file
      alone.
- [ ] `grep -c '<Definition\|<KeyIdea\|<Gotcha\|<Example\|<Aside'
      /tmp/ch_1.mdx` returns a count matching the source's callout
      count (count source `\begin{defnbox}` etc. and compare).
- [ ] `grep -c '<CodeBlock lang=' /tmp/ch_1.mdx` matches source
      `\begin{lstlisting}[language=…]` count.
- [ ] `grep -E '<a id="ch_1-' /tmp/ch_1.mdx` returns ≥ 1 anchor.
- [ ] `design_docs/m2_raw_passthrough_sweep.md` exists with all 24
      sources accounted for; every non-zero count has an explicit
      disposition.

## Notes

- **Why not skip the filter and use raw HTML in MDX?** Considered
  during M1 T2's probe; rejected because (a) we lose component
  styling consistency, (b) callout titles need to be props for
  search/indexing in later milestones, (c) the filter is small.
- **If T2 grows past one session**, decompose into T2a (filter +
  pin) and T2b (raw-passthrough sweep). The sweep is mostly
  bookkeeping and can land separately.
- **Carry-over absorbed:** M1-T02-ISS-02 (pin pandoc) → step 1
  + acceptance check; M1-T02-ISS-03 (raw-passthrough sweep) →
  step 3 + acceptance check. The M2 README's "Carry-over from
  prior audits" section can be removed once this task spec is in
  place.
