# Phase 2 Open Issues

Punch list of items deliberately deferred to the Phase 2 redesign
(Jekyll → Astro migration). Don't fix in pre-Phase-2 content work —
they will be churn that doesn't survive the migration. Just capture
here so they aren't lost.

Add new entries as they come up. Strike through items that get
resolved when Phase 2 work touches them.

## Open

- **Stale companion-materials line in chapter `lectures.tex` files.**
  Each chapter currently ends with a line referencing
  `cheat_sheets/ch_N.tex` and `practice_prompts/ch_N.md` (paths that
  never existed; "cheat sheet" terminology now stale post-rename).
  Confirmed in `chapters/ch_{1,2,3,4,5,6}/lectures.tex`. The new
  paths are `chapters/ch_N/notes.tex` and `chapters/ch_N/practice.md`.
  When Phase 2 restructures content into Astro collections + MDX, the
  cross-references between lectures / notes / practice get re-wired
  anyway — fix as part of that.

- **`resources/week_2.tex` `\section{Big-O Cheatsheet}` heading**
  uses old "Cheatsheet" terminology. Decide during Phase 2 whether
  to rename to align with the new Lectures/Notes convention or keep
  as a content-genre label.
