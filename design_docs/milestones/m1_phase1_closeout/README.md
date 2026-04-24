# M1 — Phase 1 close-out

**Maps to:** `interactive_notes_roadmap.md` Phase 1
**Status:** ✅ all 5 tasks done 2026-04-23 (M1-T01-ISS-01 Drive port superseded — round-trip rule dropped 2026-04-23)
**Depends on:** — (architecture.md and README are settled)
**Unblocks:** M2 (Astro migration)

## Goal

Close out Phase 1 cleanly so M2 (Jekyll → Astro) can start without
unresolved content questions or build surprises. The SNHU-required
chapter arc (ch_1–ch_6) is already augmented and committed; what
remains is the formal exit criteria, the pandoc probe, the
LICENSE files, and a status sweep.

## Done when

The canonical, verifiable acceptance criteria for Phase 1 live in
[`roadmap_addenda.md` § "Phase 1 acceptance criteria"](../../roadmap_addenda.md#phase-1-acceptance-criteria).
M1 is done when **every box in that checklist is ticked.** The list
below is a per-task summary of what M1 produces *toward* those
criteria — it is operational, not authoritative.

- T1 produces the acceptance criteria themselves (in roadmap_addenda).
- T2 produces `design_docs/pandoc_probe.md` and resolves architecture.md §5 row 1.
- T3 produces `LICENSE-CONTENT` and `LICENSE-CODE`.
- T4 updates `README.md` status callout to remove "pre-Phase-1" language.
- T5 produces `design_docs/build_sweep.md` confirming all 24 chapter PDFs rebuild clean.

When all five tasks land, the canonical checklist should be
fully tickable. The roadmap_addenda section is the one source of
truth — this file points at it instead of duplicating it.

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                    | Status |
|-----|---------------------------------------------------------|--------|
| T1  | [Write Phase 1 acceptance criteria](tasks/T1_acceptance_criteria.md) | todo   |
| T2  | [Pandoc probe on `ch_1/lectures.tex`](tasks/T2_pandoc_probe.md) | todo   |
| T3  | [Add LICENSE files](tasks/T3_license_files.md)          | todo   |
| T4  | [Update README status callout](tasks/T4_readme_status_sweep.md) | todo   |
| T5  | [PDF build sanity sweep (12 chapters)](tasks/T5_pdf_sanity_sweep.md) | todo   |

See [`tasks/README.md`](tasks/README.md) for ordering guidance and
status conventions. Mirror status changes between the per-task file
and the table above.

## Open decisions resolved here

- **Pandoc Lua filter vs manual port** (architecture.md §5 row 1).
  Probe output decides. If output is messy, write the filter; if
  clean, manual port the few stragglers.

## Out of scope

- **Optional chapter augmentation** (ch_7, ch_9–13). Per
  `feedback_chapter_review_scope.md`, deferred to the post-build
  content audit.
- **Phase 2 work itself.** Lua filter *implementation* (vs probe
  decision) is M2.
- **`coding_practice/` cleanup.** Phase 4 territory (M4).
