# Roadmap Addenda

Local supplement to `interactive_notes_roadmap.md` (Google Drive). Captures decisions and deferrals made after the roadmap was written. 

## Sequence before Phase 1

1. **architecture.md** — nail down the overall architecture first. This is the gating artifact for everything below.
2. **README draft** — written *after* architecture.md is settled, *before* Phase 1 implementation starts. Per the roadmap's "draft README first" practice in Portfolio Framing, but explicitly sequenced behind the architecture doc.
3. **Phase 1 starts.**

## Phase 1 acceptance criteria

Set 2026-04-23 once architecture.md was settled (per the prior
DEFERRED note's trigger condition). M1 ([`milestones/m1_phase1_closeout/`](milestones/m1_phase1_closeout/))
operationalises these. Phase 1 is **done** when every box below is
ticked. **All checks must be verifiable yes/no without judgement
calls** — that's the contract.

> **"Phase-1-blocking"** wherever it appears below uses the project
> definition in [`../CLAUDE.md`](../CLAUDE.md#glossary): an item is
> blocking iff (a) without it a later phase cannot start, OR (b)
> without it ≥ 2 other Phase-1 items will fail or produce inaccurate
> output. Anything that fails both tests is non-blocking.

### Required-arc augmentation (ch_1–ch_6)

- [ ] Each chapter `ch_N` for N ∈ {1, 2, 3, 4, 5, 6} has a Step-1
      inventory at `design_docs/chapter_reviews/ch_<N>.md`. *Verify:*
      `for n in 1 2 3 4 5 6; do test -f design_docs/chapter_reviews/ch_${n}.md; done`.
- [ ] Each chapter `ch_N` for N ∈ {1, 2, 3, 4, 5, 6} has a Step-2
      gap report at `design_docs/chapter_reviews/ch_<N>_gaps.md`.
      *Verify:* same loop with `_gaps.md` suffix.
- [ ] Each chapter `ch_N` for N ∈ {1, 2, 3, 4, 5, 6} has a Step-3
      execution log entry in `CHANGELOG.md` referencing
      `chapters/ch_<N>/lectures.tex` and `chapters/ch_<N>/notes.tex`.
      *Verify:* `for n in 1 2 3 4 5 6; do grep -q "chapters/ch_${n}/lectures.tex" CHANGELOG.md; done`.

### Build cleanliness

- [ ] All 12 chapters' `lectures.tex` and `notes.tex` (24 files
      total) build with `pdflatex -interaction=nonstopmode -halt-on-error`
      exit code 0 from a clean working tree. *Verify:* T5's
      `design_docs/build_sweep.md` exists with all 24 rows = clean.
- [ ] No `lectures.pdf` exceeds 40 pages without an explicit
      acknowledgement in the build-sweep doc (per
      `feedback_chapter_review_autonomy.md`'s autonomy ceiling).

### Cross-reference correctness

- [ ] No `chapters/ch_*/lectures.tex` references a non-existent
      chapter (specifically: no `ch_8` references — there is no
      `chapters/ch_8/`). *Verify:*
      `! grep -rE 'ch[._~]8\b|Chapter 8\b' chapters/ch_*/lectures.tex`.
- [ ] AVL / red-black trees are referenced as **ch.~9** (not
      ch.~7 or ch.~7-8 — those errors were fixed in ch_6 Step 3).
      *Verify:* `! grep -rE 'ch\.~7-8|ch\.~7--9.*AVL|AVL.*ch\.~7\b' chapters/ch_*/lectures.tex`.

### Doc completeness

- [ ] `design_docs/architecture.md` exists, all rows of §5
      open-decisions table that were marked Phase-1-blocking are
      resolved (currently: row 1 — pandoc filter — resolved 2026-04-23).
- [ ] `README.md` status callout reflects post-2026-04-23 reality
      (no "pre-Phase-1" language). *Verify:* `! grep -q 'pre-Phase-1' README.md`.
- [ ] `design_docs/milestones/` exists with milestones M1–M7 each
      having a `README.md`. *Verify:*
      `for m in 1 2 3 4 5 6 7; do test -f design_docs/milestones/m${m}_*/README.md; done`.

### Decisions captured

- [ ] Pandoc Lua filter vs manual port verdict captured in
      `design_docs/pandoc_probe.md` with one of `filter` / `manual`
      / `hybrid`. *Verify:* `grep -E '^\*\*Verdict:\*\*' design_docs/pandoc_probe.md`.

### Licensing

- [ ] Single `LICENSE` file (CC BY-NC-SA 4.0, covering content + code)
      exists at repo root, with a scope-statement header naming the
      MIT OCW reference posture and the non-commercial constraint.
      *Verify:* `test -f LICENSE && grep -q 'CC BY-NC-SA 4.0\|NonCommercial-ShareAlike 4.0' LICENSE`.

### Optional-chapter status (explicit, not silent)

- [ ] Optional chapters (ch_7, ch_9–ch_13) are explicitly enumerated
      as **un-augmented and deferred to the post-build content
      audit** in `memory/project_chapter_review_progress.md`. They
      are **not** "in progress" or "missing" — they are intentionally
      ship-as-is until the post-main-build phase. *Verify:* the
      memory file's status table shows `todo` for ch_7 and ch_9–13
      with the "post-build audit" qualifier.

### History

The previous DEFERRED note read: *"address this once architecture.md
is nailed down. It will be a major focus at that point — not a
quick decision."* Architecture.md was settled 2026-04-22 → 23
through the M1 pandoc probe (architecture.md §5 row 1) and the
milestone breakouts. These criteria are the operational answer
that note pointed at.

## Pandoc filter probe

Run during Phase 1 idle time, not deferred to Phase 2 kickoff. One-hour experiment on `chapters/ch_1/lectures.tex` decides whether a Lua filter is worth writing or manual porting suffices. Output of this probe feeds back into architecture.md if it changes the component model.

## coding_practice/ — kept

Folders `cplusplus/`, `psuedo/`, `python/` stay. Purpose: hold prompt material for the ai-workflows question-generation workflow (Phase 4+). Likely to expand to support varying difficulty tiers.

**Open:** whether prompts are persisted as files here or generated dynamically by the workflow each run. Defer until Phase 4 design.
