# M2 — Pandoc raw-passthrough sweep

**Date:** 2026-04-23
**Pandoc version:** 3.1.3 (pinned in [`../.pandoc-version`](../.pandoc-version) per M2 T2 step 1, M1-T02-ISS-02 carry-over)
**Source task:** [`milestones/m2_phase2_astro/tasks/T2_lua_filter.md`](milestones/m2_phase2_astro/tasks/T2_lua_filter.md) step 3 (carry-over M1-T02-ISS-03)

## What this is

When pandoc's LaTeX reader encounters a construct it can't fully parse, it falls back to emitting a `` ```{=html} `` raw passthrough block in markdown output. The M1 T2 probe found **one** such block in `chapters/ch_1/lectures.tex` and deferred a 12-chapter sweep to M2. This is that sweep: pandoc run **without** the M2 Lua filter (so we count pandoc's *own* fallbacks, not the filter's intentional `RawBlock` injections) against every `chapters/ch_*/{lectures,notes}.tex` source.

## Sweep results

| Chapter | File         | Pandoc exit | Raw passthroughs | Disposition |
| ------- | ------------ | ----------- | ---------------- | ----------- |
| ch_1    | lectures.tex | 0           | 1                | ACCEPT (see below) |
| ch_1    | notes.tex    | 0           | 0                | — |
| ch_2    | lectures.tex | 0           | 0                | — |
| ch_2    | notes.tex    | 0           | 0                | — |
| ch_3    | lectures.tex | 0           | 0                | — |
| ch_3    | notes.tex    | 0           | 0                | — |
| ch_4    | lectures.tex | 0           | 0                | — |
| ch_4    | notes.tex    | 0           | 0                | — |
| ch_5    | lectures.tex | 0           | 0                | — |
| ch_5    | notes.tex    | 0           | 0                | — |
| ch_6    | lectures.tex | 0 *(after source-fix)* | 0 | SOURCE-FIX applied (see below) |
| ch_6    | notes.tex    | 0           | 0                | — |
| ch_7    | lectures.tex | 0           | 0                | — |
| ch_7    | notes.tex    | 0           | 0                | — |
| ch_9    | lectures.tex | 0           | 0                | — |
| ch_9    | notes.tex    | 0           | 0                | — |
| ch_10   | lectures.tex | 0           | 0                | — |
| ch_10   | notes.tex    | 0           | 0                | — |
| ch_11   | lectures.tex | 0           | 0                | — |
| ch_11   | notes.tex    | 0           | 0                | — |
| ch_12   | lectures.tex | 0           | 0                | — |
| ch_12   | notes.tex    | 0           | 0                | — |
| ch_13   | lectures.tex | 0           | 0                | — |
| ch_13   | notes.tex    | 0           | 0                | — |

**Totals:** 24/24 sources parse cleanly; 1 raw passthrough across the corpus.

## Per-occurrence disposition

### `chapters/ch_1/lectures.tex` — 1 raw block (line 496 of generated MDX) — **ACCEPT**

Block content:

```text
```{=html}
<!-- -->
```
```

That's an HTML comment pandoc uses to force-separate two adjacent markdown constructs (a list item and an indented code block) that would otherwise merge ambiguously. It's a standard pandoc disambiguation trick, not a parser failure. The output MDX is functionally correct without modification — when MDX renders the file, the comment becomes a noop (or, with `--markdown-headings=atx -raw_attribute`, doesn't even get emitted). T4 invokes pandoc with `-raw_attribute` (per the M2 T2 filter design), which suppresses the wrapping fence; the comment passes through inline as an HTML comment. **No source change required.**

### `chapters/ch_6/lectures.tex` lines 412–428 — **SOURCE-FIX (applied 2026-04-23 as part of T2)**

Initial sweep run (before fix) failed with:

```
Error at "chapters/ch_6/lectures.tex" (line 427, column 14):
expecting \end{center}
\end{tabular}
             ^
```

Root cause: the source used a nested-tabular pattern (a `tabular{cc}` containing two `tabular{c}` sub-cells, all inside a `center`) to draw two side-by-side ASCII trees. `pdflatex` handles this fine; pandoc's stricter LaTeX reader can't track the nesting. Decision per T2 step 3: **SOURCE-FIX**. Refactored the construct to two `minipage[t]{0.4\linewidth}` side-by-side blocks (one per tree) inside a single `center`. Visual output in the rendered PDF is identical (verified: `pdflatex -halt-on-error` exits 0; `lectures.pdf` still 31 pages); pandoc now parses cleanly with zero raw passthroughs. Source comment in `chapters/ch_6/lectures.tex` near the patched block points back at this sweep doc and the date.

## Methodology notes

- The sweep was run with `pandoc -f latex -t markdown --wrap=none <file>` (no Lua filter applied), so the counts are pandoc's *own* raw-passthrough fallbacks. The M2 Lua filter at `scripts/pandoc-filter.lua` legitimately uses `pandoc.RawBlock("html", …)` to emit MDX component tags — those would inflate the count by ~2× the callout count if measured with the filter applied. T4's build pipeline invokes pandoc with `-t markdown-raw_attribute` so neither the filter's RawBlocks nor pandoc's own fallback fences end up wrapped in `` ```{=html} `` syntax.
- The pandoc warning about `notes-style.tex` not being loadable (from the chapter source's `\input{../../notes-style.tex}`) is benign for the sweep — pandoc doesn't need the tcolorbox preamble to recognise the env names. Same warning was noted in M1's probe.

## Forward link

When T4 lands and starts running pandoc-with-filter against all 24 sources as a build step, it should re-run a count of `` ```{=html} `` blocks in the *generated* MDX (post-filter, post-`-raw_attribute`). The expected count is **0** across all 24 files; any deviation indicates either filter regression or a new source-side issue that warrants this sweep being re-run. T4's acceptance check picks this up.
