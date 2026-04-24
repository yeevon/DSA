# T5 — PDF build sanity sweep — Audit Issues

**Source task:** [../tasks/T5_pdf_sanity_sweep.md](../tasks/T5_pdf_sanity_sweep.md)
**Audited on:** 2026-04-23
**Audit scope:** `design_docs/build_sweep.md` (new, 60 lines), `CHANGELOG.md` (T5 entry), the actual `pdflatex` outputs captured at `/tmp/build_sweep.log` (24 lines, one per file). Cross-checked against `feedback_chapter_review_autonomy.md` (40-page ceiling), T5 spec's own "anything ≥ 40 is a flag, not a hard fail — it predates the ceiling" qualifier, `feedback_chapter_review_scope.md` (post-build content audit as the natural home for chapter trimming), and the `roadmap_addenda.md` Phase 1 acceptance criteria § "Build cleanliness" (which T5 directly satisfies).
**Status:** ✅ PASS (1 pre-existing condition deferred to post-build content audit)

## Design-drift check

| Drift category                           | Result | Notes                                                                                                                |
| ---------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None.                                                                                                                |
| Jekyll polish                            | ✅ ok  | Doc-only.                                                                                                            |
| Chapter content > 40-page ceiling        | ⚠️ pre-existing | ch_3 (53), ch_4 (51) exceed ceiling. **Not introduced by T5.** T5 measured and surfaced; pre-dates the ceiling. T5 spec explicitly accommodates as "flag, not hard fail." See ISS-01. |
| Chapter additions beyond bounded rule    | ✅ n/a | T5 makes no chapter changes.                                                                                          |
| Cross-chapter references                 | ✅ n/a | T5 makes no chapter changes.                                                                                          |
| Sequencing violation                     | ✅ ok  | T5 is M1-scope; touches no surfaces beyond the build sweep.                                                           |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; closest analog is `memory/feedback_chapter_review_scope.md`'s post-build content audit (referenced in disposition). |
| Configuration / secrets                  | ✅ ok  | None.                                                                                                                |
| Observability                            | ✅ ok  | n/a.                                                                                                                  |

No HIGH drift findings attributable to T5. The over-40 condition is a pre-existing state T5 measured, not introduced.

## AC grading

| # | Acceptance criterion                                                                                                  | Status | Notes |
|---|-----------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | All 24 chapter files (12 lectures + 12 notes) build with `pdflatex -halt-on-error` exit code 0                        | ✅ PASS | Sweep log shows EXIT=0 on all 24 files. |
| 2 | Page counts captured per file                                                                                          | ✅ PASS | All 24 page counts in `build_sweep.md` results table. |
| 3 | No `lectures.pdf` exceeds 40 pages without an explicit acknowledgement in the build-sweep doc                          | ✅ PASS | ch_3 (53) and ch_4 (51) both flagged with explicit acknowledgement section in `build_sweep.md` naming each, dating each to the 2026-04-22 augmentation pass, and proposing disposition (deferred to post-build content audit). The criterion permits over-40 *with* acknowledgement; both are acknowledged. |
| 4 | `design_docs/build_sweep.md` exists with the full table + verdict                                                      | ✅ PASS | File exists. Verdict line at top: "All 24 chapter files build clean. Two `lectures.pdf` flags exceed the 40-page autonomy ceiling — both pre-existing conditions, explicitly acknowledged below." |
| 5 | Any breakage that was found has been fixed and committed                                                               | ✅ PASS | No breakage found. Vacuously satisfied. |

## 🔴 HIGH

None attributable to T5. (See drift-check note: the over-40 condition pre-exists T5 and is not introduced by it.)

## 🟡 MEDIUM

None active. (ISS-01 below is DEFERRED to the post-build content audit, not OPEN against any milestone task.)

## 🟢 LOW

None.

## Issue log

### M1-T05-ISS-01 — ch_3 and ch_4 lectures.pdf exceed 40-page autonomy ceiling (pre-existing, surfaced not introduced by T5)

**Severity:** 🟡 MEDIUM (downstream risk: Phase 1 acceptance criterion item under "Build cleanliness" requires explicit acknowledgement, which is satisfied today; but the ceiling is a non-negotiable in CLAUDE.md and the over-40 state will reappear in every future build-sweep until trimmed)
**Status:** ⚠️ DEFERRED-POST-BUILD-AUDIT

The 40-page ceiling from `feedback_chapter_review_autonomy.md` was set partway through the chapter augmentation pass — *after* ch_3 and ch_4 had already grown to 53 and 51 pages respectively via the per-chapter Step-3 augmentations recorded in CHANGELOG 2026-04-22. T5 spec acknowledges this lineage: *"Anything ≥ 40 is a flag, not a hard fail — it predates the ceiling."*

Two paths exist to bring these under 40:

1. **Trim content.** Reverse some of the augmentation deltas (counting-sort full subsection in ch_3, ring-buffer queue subsection in ch_4) — but those were the highest-value adds in their respective Step-2 gap reports. Reversal would lose pedagogically.
2. **Move content to companion docs.** Spin off a new `chapters/ch_3/extras.tex` / `chapters/ch_4/extras.tex` for the longest subsections, leaving the main `lectures.tex` under 40 pages. Adds a third file per chapter.

Neither path is a single-task fix; both would be churn in pre-M2 work. The natural home is the **post-build content audit** (per `feedback_chapter_review_scope.md`), which already plans a coherent re-pass over chapter content (depth additions + trimming + optional-chapter augmentation) after the main app build is done.

**Action / Recommendation:** No action in M1. When the post-build content audit kicks off (after M5/M6 per `milestones/README.md`'s parallel-track note), include "evaluate chapter-trimming for ch_3 and ch_4 to bring under 40 pages OR formally raise the ceiling to 55 pages" in the audit's task list. Until then, every build-sweep will surface the same flag — the explicit-acknowledgement clause in T5 AC 3 is the pressure-relief valve that keeps the ceiling from blocking ongoing work.

## Additions beyond spec — audited and justified

- The build-sweep doc includes a "Source-drift check" section explicitly verifying that the optional chapters (ch_7, ch_9–ch_13) — which had not been rebuilt since the 2026-04-22 rename pass — all build clean. T5 spec mentioned these as the highest-risk for silent breakage but didn't require a separate verification line. Justified: closes a real risk affirmatively rather than implicitly.
- The doc names which Phase 1 acceptance criteria items T5 satisfies. T5 spec didn't require this cross-link, but it makes the canonical-criteria checklist easier to tick.

## Verification summary

| Check                                                                  | Result |
| ---------------------------------------------------------------------- | ------ |
| `design_docs/build_sweep.md` exists                                    | ✅     |
| Verdict line at top of `build_sweep.md`                                | ✅     |
| Per-file results table covers all 24 source files                      | ✅ 24/24 rows |
| All EXIT=0                                                             | ✅ 24/24 |
| Over-40 cases explicitly acknowledged (ch_3, ch_4)                     | ✅     |
| Optional chapters (ch_7, ch_9–ch_13) included in sweep                 | ✅ all 12 source files |
| `CHANGELOG.md` entry under `## 2026-04-23` references M1 Task T5       | ✅     |
| Phase 1 acceptance criterion "Build cleanliness" tickable              | ✅ — T5 satisfies it |

## Issue log — cross-task follow-up

| ID            | Severity  | Status                          | Owner                                   |
| ------------- | --------- | ------------------------------- | --------------------------------------- |
| M1-T05-ISS-01 | 🟡 MEDIUM | ⚠️ DEFERRED-POST-BUILD-AUDIT     | Post-build content audit (per `feedback_chapter_review_scope.md`) |

## Propagation status

The post-build content audit is not a milestone with per-task spec files; it lives in project memory (`feedback_chapter_review_scope.md`) as the parking-lot for everything intentionally deferred from the per-chapter loop. Per CLAUDE.md, items mapping to the deferred-ideas file (analog: this memory entry) are recorded under a "Deferred to nice_to_have" section, not forward-deferred to a task. cs-300 doesn't have `nice_to_have.md` yet, so this finding is logged in the issue log above with explicit owner. No additional propagation file edits performed — the disposition is also captured in `build_sweep.md` itself, which the post-build audit will read when it kicks off.
