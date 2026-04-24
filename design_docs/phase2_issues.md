# Phase 2 Open Issues

Punch list of items deliberately deferred to the Phase 2 redesign
(Jekyll → Astro migration). Don't fix in pre-Phase-2 content work —
they will be churn that doesn't survive the migration. Just capture
here so they aren't lost.

Add new entries as they come up. Strike through items that get
resolved when Phase 2 work touches them.

## Open

(none — both items below resolved 2026-04-23 by M2 T7)

## Resolved

- ~~**Stale companion-materials line in chapter `lectures.tex` files.**~~
  ✅ **RESOLVED 2026-04-23 (M2 T7).** All 6 SNHU-required chapters
  (ch_1–ch_6) updated: `\texttt{cheat\_sheets/ch\_N.tex}` →
  `\texttt{chapters/ch\_N/notes.tex}` and
  `\texttt{practice\_prompts/ch\_N.md}` → `\texttt{chapters/ch\_N/practice.md}`
  in each chapter's "Companion materials" bookend block. All 6 PDFs
  rebuild clean (exit 0; page counts unchanged: ch_1=36, ch_2=34,
  ch_3=53, ch_4=51, ch_5=26, ch_6=31). Also fixed in 11 chapters'
  `practice.md` (`practice_prompts/ch_1.md` → `chapters/ch_1/practice.md`
  in the "standard wrapper" reference).

- ~~**`resources/week_2.tex` `\section{Big-O Cheatsheet}` heading.**~~
  ✅ **RESOLVED-OBSOLETE 2026-04-23 (M2 T7, path B).** `resources/`
  removed entirely. The week_2–5 sidecar TeX was orphaned by the
  ch_1–ch_6 augmentation pass (week 2 sorting → ch_3; week 3 lists
  → ch_4; week 4 hash tables → ch_5; week 5 trees → ch_6). Decision
  was made during the M2 alignment review (2026-04-23, option B);
  T7 executed the removal + propagated ripple edits to LICENSE
  scope (already generic post-consolidation; nothing to change),
  README.md repo-layout, CLAUDE.md repo-layout + auditor sequencing
  rule.
