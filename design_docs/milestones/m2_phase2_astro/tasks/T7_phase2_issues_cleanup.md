# T7 — Resolve `phase2_issues.md` items

**Status:** todo
**Depends on:** T2 (filter exists, so source-vs-filter trade-off is decidable) — soft dep, can land independently
**Blocks:** —

## Why

`design_docs/phase2_issues.md` carries two open items deferred from
pre-M2 work:

1. **Companion-materials line in chapter `lectures.tex`** — a
   stale cross-reference to material that no longer exists in the
   current chapter layout.
2. **`resources/week_2.tex` "Cheatsheet" heading** — the heading
   `\section{Big-O Cheatsheet}` references a concept-bag the
   chapter restructure replaced.

Both are doc-cleanliness items, not architectural. T7 is the
sweep that closes them out so M2 doesn't ship with `phase2_issues.md`
still listing pending work.

**Open question (carry from prior conversation):** the user has
flagged `resources/` (week_2–5) as possibly orphaned content. If
the user decides to remove `resources/` entirely as part of M2,
the `week_2.tex` "Cheatsheet" item becomes moot — T7 step 2 turns
into a removal note, not a rename. Before starting T7, **stop and
ask the user** which path they want.

## Deliverable

`design_docs/phase2_issues.md` with both items marked resolved
(commit refs cited), plus the actual source edits or removals
those resolutions require.

## Steps

1. **Re-read** `design_docs/phase2_issues.md` for the precise text
   of both items, plus any context that's accumulated since they
   were filed.
2. **Item 1 — companion-materials line.** Locate the offending
   line via `grep -rn 'companion materials' chapters/`. Decide
   per occurrence:
   - Remove if the referenced material doesn't exist anywhere.
   - Rewire to the new location if it moved (e.g., to
     `resources/` or to another chapter).
   Update each `chapters/ch_*/lectures.tex`; rebuild the affected
   PDFs to verify.
3. **Item 2 — `resources/week_2.tex` Cheatsheet heading.** Path A
   (rename): change `\section{Big-O Cheatsheet}` to whatever the
   week-2 content is actually about now. Path B (remove): if the
   user has approved removing `resources/`, this item is moot and
   gets a "obsolete by removal" note in `phase2_issues.md`.
4. **Update `phase2_issues.md`** — flip both items from open to
   `RESOLVED 2026-MM-DD` with the commit SHA (or "obsolete" if
   item 2 went path B).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `design_docs/phase2_issues.md` shows both items resolved
      (or obsolete) with dates and commit refs.
- [ ] `grep -rn 'companion materials' chapters/` returns zero hits
      OR every hit is to a real, current target (verify each).
- [ ] If path A on item 2: `grep -n 'Big-O Cheatsheet'
      resources/week_2.tex` returns zero hits.
- [ ] If path B on item 2: `test ! -d resources/` (or
      `test ! -f resources/week_2.tex`).
- [ ] Affected `chapters/ch_*/lectures.pdf` rebuild clean
      (`pdflatex -interaction=nonstopmode -halt-on-error`).

## Notes

- **Independent task.** T7 doesn't block T6 or T8; it can land any
  time once T2 (or T4) gives enough confidence the source-vs-filter
  trade-off is settled. The chapter `.tex` edits in step 2 may
  affect what T2's filter has to handle, so doing T2 first is
  cleaner.
- **The `resources/` removal decision is bigger than T7.** If the
  user approves it, that change touches `LICENSE` (scope statement
  references `resources/`), `README.md` (repo layout), `CLAUDE.md`
  (repo layout + auditor sequencing rule that says "chapter task
  touching `resources/` is HIGH"), plus T7 step 2. Capture all
  those in the same commit if path B is taken.
