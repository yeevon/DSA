# T1 — Write Phase 1 acceptance criteria

**Status:** ✅ done 2026-04-23 (Drive-port AC superseded — round-trip rule dropped 2026-04-23; see [issues/T1_issue.md](../issues/T1_issue.md))
**Depends on:** —
**Blocks:** declaring M1 done; M2 verifying its inputs are stable

## Why

`design_docs/roadmap_addenda.md` currently says Phase 1 acceptance
criteria are **DEFERRED** until architecture.md is settled.
Architecture.md is settled now. Without exit criteria, there's no
crisp answer to "is Phase 1 done?" — which means M2 might start
expecting content that hasn't been finished, or wait on content
that's already done.

Per the addenda: *"It will be a major focus at that point — not a
quick decision."*

## Deliverable

A new section in `design_docs/roadmap_addenda.md` titled
**"Phase 1 acceptance criteria"** that replaces the "DEFERRED"
section. The criteria are a **verifiable checklist** — each item
something a future Claude or human can answer yes/no without
judgment calls.

~~Once written here, port the section back to the Drive roadmap.~~
*(Round-trip rule dropped 2026-04-23 — `roadmap_addenda.md` is now
operational canonical; Drive doc is historical only.)*

## Steps

1. Re-read inputs:
   - `design_docs/chapter_reviews/ch_{1..6}.md` and `_gaps.md` — what
     was the augmentation scope per chapter, what got deferred
   - `memory/feedback_chapter_review_scope.md` — the bounded-additions
     rule and the ch_1–ch_6 vs optional split
   - `memory/project_chapter_review_progress.md` — the 6/12 done state
   - `CHANGELOG.md` 2026-04-22 / 2026-04-23 entries — the actual record
2. Draft criteria covering at least:
   - **Required-arc augmentation:** ch_1–ch_6 each have completed
     Step 1 (inventory) → Step 2 (gap report) → Step 3 (revisions
     applied + builds clean + CHANGELOG logged).
   - **Build cleanliness:** all 12 chapters' `lectures.pdf` and
     `notes.pdf` rebuild from source on a clean checkout. (T5 verifies
     this.)
   - **Cross-ref correctness:** no chapter `lectures.tex` references
     a non-existent or wrong-subject chapter (e.g., ch_3 and ch_6
     each had this bug pre-augmentation).
   - **Doc completeness:** architecture.md, README, CHANGELOG,
     design_docs/milestones/ all exist and are non-stale.
   - **Pandoc probe verdict:** captured in `design_docs/pandoc_probe.md`
     with one of `filter` / `manual` / `hybrid`. (T2.)
   - **LICENSE files:** present at repo root. (T3.)
   - **Optional-chapter status:** explicitly enumerated as deferred
     to post-build content audit, not "in progress" or "missing."
3. Write the section into `roadmap_addenda.md`. Keep the bullet
   verifiable; avoid "well-rounded" / "production-quality" / "done
   enough."
4. ~~Port to the Drive doc.~~ *(Round-trip rule dropped 2026-04-23.)*

## Acceptance check

- [ ] `roadmap_addenda.md` has a "Phase 1 acceptance criteria"
      section with ≥ 6 verifiable checklist items.
- [ ] The previous "DEFERRED" framing is removed (or rewritten as a
      historical note pointing at the new section).
- [x] ~~Drive roadmap reflects the same criteria.~~ **SUPERSEDED
      2026-04-23** — round-trip rule dropped from the addenda
      preamble; `roadmap_addenda.md` is now the operational
      canonical, Drive doc is historical only.
- [ ] M1 README's *"Done when"* list is reconciled — any items that
      now belong in the canonical acceptance-criteria section get
      cross-linked there instead of duplicated.

## Notes

- The criteria belong in `roadmap_addenda.md`, not in this task file
  or M1's README. Those are *operational* (what to do); the addenda
  is *canonical* (what counts as done).
- Resist the urge to expand the criteria to cover M2+ work. Phase 1
  is chapter content; M2 has its own acceptance criteria in its own
  README.
