# T1 — Phase 1 acceptance criteria — Audit Issues

**Source task:** [../tasks/T1_acceptance_criteria.md](../tasks/T1_acceptance_criteria.md)
**Audited on:** 2026-04-23
**Audit scope:** `design_docs/roadmap_addenda.md` (DEFERRED section replaced with canonical "Phase 1 acceptance criteria" section), `design_docs/milestones/m1_phase1_closeout/README.md` ("Done when" reconciled to point at addenda), `CHANGELOG.md` (T1 entry added). Cross-checked against architecture.md (§5 row 1 already resolved by T2; criteria reference this), `feedback_chapter_review_scope.md` (bounded-additions rule), `feedback_chapter_review_autonomy.md` (40-page ceiling), `project_chapter_review_progress.md` (the canonical record of optional-chapter status the criteria reference). Verification commands embedded in the criteria were spot-checked via bash (results all PASS or expected-FAIL where another M1 task supplies the fix).
**Status:** ✅ PASS (M1-T01-ISS-01 superseded 2026-04-23 — round-trip rule dropped from addenda preamble; Drive doc is now historical only, not actively synced)

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None. Doc-only edit.                                                                                  |
| Jekyll polish                            | ✅ ok  | Doc-only.                                                                                             |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched. (Criteria *reference* cross-chapter correctness as a verification item.) |
| Sequencing violation                     | ✅ ok  | T1 is M1-scope; modifies addenda + M1 README only.                                                    |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced by the criteria.                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                  | Status | Notes |
|---|-----------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `roadmap_addenda.md` has a "Phase 1 acceptance criteria" section with ≥ 6 verifiable checklist items                  | ✅ PASS | Section exists; 14 checklist items grouped under 8 headings, each with a concrete `test`/`grep` verification command. Spot-checked 9 of the commands in bash — all returned the expected results. |
| 2 | The previous "DEFERRED" framing is removed (or rewritten as a historical note pointing at the new section)            | ✅ PASS | Old `## Phase 1 acceptance criteria — DEFERRED` block fully removed. New section closes with a `### History` footer that paraphrases the prior text and explains why the criteria are now authored. |
| 3 | Drive roadmap reflects the same criteria (note in CHANGELOG when ported)                                              | ✅ SUPERSEDED 2026-04-23 | Round-trip rule dropped from `roadmap_addenda.md` preamble (user edit). `roadmap_addenda.md` is now operational canonical; Drive doc is historical only. The "Drive port" subsection has been removed from the acceptance criteria. **ISS-01 RESOLVED-OBSOLETE.** |
| 4 | M1 README's "Done when" list is reconciled — items that belong in the canonical acceptance-criteria section get cross-linked instead of duplicated | ✅ PASS | M1 README's "Done when" replaced with a per-task summary that points at the canonical addenda section. No duplication. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

None active. (ISS-01 below is DEFERRED to user action, not OPEN.)

## 🟢 LOW

None.

## Issue log

### M1-T01-ISS-01 — Drive port pending user action — SUPERSEDED

**Severity:** 🟡 MEDIUM (originally; now obsolete)
**Status:** ✅ RESOLVED-OBSOLETE (2026-04-23)

The user dropped the round-trip-to-Drive rule from `roadmap_addenda.md`'s preamble after this issue was raised. `roadmap_addenda.md` is now the operational canonical roadmap for cs-300; the Drive doc remains as the historical originating doc but is not actively synced. The "Drive port" subsection has been removed from the Phase 1 acceptance criteria, and CLAUDE.md's canonical-locations table has been updated to reflect the new arrangement.

No user action required. This issue is closed by design change, not by satisfying the original AC.

**Original finding (kept for history):** *T1's AC 3 — "Drive roadmap reflects the same criteria" — cannot be satisfied by Claude. The MCP Google Drive adapter exposes only read operations; there is no `update_file` for editing existing Drive docs.*

## Additions beyond spec — audited and justified

- The M1 README's "Done when" was rewritten as a *per-task summary* (T1 produces X, T2 produces Y, …) instead of just deleting it. T1 spec only required reconciliation. Justified: a per-task summary makes M1's task graph immediately legible without reading individual task files; low coupling.
- The criteria added an explicit "Optional-chapter status" item that points at `memory/project_chapter_review_progress.md`. Spec didn't require referencing memory files, but this closes a real gap (otherwise "are optional chapters done?" has no canonical answer). Low cost, high signal.

## Verification summary

| Check                                                                                          | Result |
| ---------------------------------------------------------------------------------------------- | ------ |
| New "Phase 1 acceptance criteria" section in `roadmap_addenda.md`                              | ✅     |
| Old DEFERRED section removed                                                                   | ✅     |
| `for n in 1..6; do test -f design_docs/chapter_reviews/ch_${n}.md`                             | ✅ all 6 present |
| `for n in 1..6; do test -f design_docs/chapter_reviews/ch_${n}_gaps.md`                        | ✅ all 6 present |
| `for n in 1..6; do grep -q "chapters/ch_${n}/lectures.tex" CHANGELOG.md`                       | ✅ all 6 present |
| `grep -rE 'ch[._~]8' chapters/ch_*/lectures.tex`                                                | ✅ none found |
| `grep -rE 'ch\.~7-8\|AVL.*ch\.~7\b' chapters/ch_*/lectures.tex`                                | ✅ none found |
| `grep -c 'pre-Phase-1' README.md`                                                              | 1 (expected; T4 fixes) |
| `for m in 1..7; do test -f design_docs/milestones/m${m}_*/README.md`                           | ✅ all 7 present |
| `grep -E '^\*\*Verdict:\*\*' design_docs/pandoc_probe.md`                                      | ✅ matches HYBRID |
| M1 README "Done when" cross-links to addenda, doesn't duplicate                                | ✅     |
| `CHANGELOG.md` entry under `## 2026-04-23` references M1 Task T1                               | ✅     |

## Issue log — cross-task follow-up

| ID            | Severity  | Status                       | Owner                                        |
| ------------- | --------- | ---------------------------- | -------------------------------------------- |
| M1-T01-ISS-01 | 🟡 MEDIUM | ✅ RESOLVED-OBSOLETE 2026-04-23 | (closed by design change — round-trip rule dropped) |

## Propagation status

No forward-deferral to a future task — ISS-01 is owned by the user, not by another milestone. Surfaced via:

- The "Drive port" item in the canonical acceptance criteria (`design_docs/roadmap_addenda.md`).
- This issue log (M1-T01-ISS-01).
- The cycle status line printed by the loop controller.

When the user performs the port, ISS-01 flips to ✅ RESOLVED here and the corresponding criteria-list item ticks.
