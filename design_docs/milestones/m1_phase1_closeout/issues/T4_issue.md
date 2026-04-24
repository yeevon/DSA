# T4 — Update README status callout — Audit Issues

**Source task:** [../tasks/T4_readme_status_sweep.md](../tasks/T4_readme_status_sweep.md)
**Audited on:** 2026-04-23
**Audit scope:** `README.md` (status callout + Architecture-section paragraph edited), `CHANGELOG.md` (T4 entry). Cross-checked against the actual repo state — `chapters/ch_*` directories, `design_docs/milestones/` content, T3's already-shipped LICENSE link insertion, the `feedback_no_jekyll_polish.md` rule (don't add Jekyll improvements pre-M2).
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                   |
| ---------------------------------------- | ------ | ----------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None.                                                                   |
| Jekyll polish                            | ✅ ok  | README *describes* current Jekyll state factually; doesn't *improve* it. |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content.                                                     |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content.                                                     |
| Cross-chapter references                 | ✅ n/a | No chapter content.                                                     |
| Sequencing violation                     | ✅ ok  | T4 is M1-scope.                                                         |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist.                                                     |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                       | Status | Notes |
|---|----------------------------------------------------------------------------|--------|-------|
| 1 | Status callout reflects post-2026-04-23 state — no "pre-Phase-1" language  | ✅ PASS | `grep -c "pre-Phase-1" README.md` = 0. New callout reads "Milestone 1 (Phase 1 close-out, in progress)" with explicit ch_1–ch_6 augmented + optional chapters deferred-to-post-build framing. |
| 2 | Pointer to `design_docs/milestones/` exists in status callout or Architecture section | ✅ PASS | `grep -c "design_docs/milestones" README.md` = 2 — once in the new status callout, once in the Architecture section paragraph that already named architecture.md and roadmap_addenda.md. |
| 3 | LICENSE links exist in License section (assumes T3 done)                   | ✅ PASS | `grep -cE "LICENSE-(CONTENT\|CODE)" README.md` = 2. T3 cycle 2 already wired both. |
| 4 | No other lines in README contradict current repo state                     | ✅ PASS | Sweep confirmed: optional chapter list "(7, 9, 10, 11, 12, 13)" matches the actual `chapters/ch_{7,9,10,11,12,13}` dirs (6 found). Jekyll references remain factual ("Phase 2 replaces the Jekyll bits with Astro under `src/`" is accurate forward-pointing language, not stale). The Architecture section's "Settled tech worth flagging up front" bullets all match architecture.md. No other contradictions found. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

None.

## Additions beyond spec — audited and justified

- The Architecture section pointer to `design_docs/milestones/` was added as a *new sentence* in the existing "Full design in… The phased roadmap lives in Google Drive…" paragraph, alongside architecture.md and roadmap_addenda.md. T4 spec called for "a one-line pointer near the top of the Architecture section"; this is similar in spirit but better integrated. Justified: keeps the Architecture-section hierarchy of "design → ops plan → roadmap" coherent.
- Status callout adds the ch_7+ optional-chapter status framing ("ship as committed-but-un-augmented; deferred to post-build content audit"). Not in T4 spec but factually accurate per `memory/project_chapter_review_progress.md` and the bounded-additions rule. Closes a real reader-confusion gap (someone reading README cold would otherwise wonder "what about ch_7+?").

No additions add architectural coupling.

## Verification summary

| Check                                                              | Result |
| ------------------------------------------------------------------ | ------ |
| `grep -c "pre-Phase-1" README.md`                                  | 0 ✅   |
| `grep -c "design_docs/milestones" README.md`                       | 2 ✅   |
| `grep -cE "LICENSE-(CONTENT\|CODE)" README.md`                      | 2 ✅   |
| Optional chapter list `(7, 9, 10, 11, 12, 13)` matches `chapters/ch_*` dirs | ✅ 6/6 dirs found |
| Jekyll references remain factual / forward-pointing (not Jekyll polish) | ✅     |
| `CHANGELOG.md` entry under `## 2026-04-23` references M1 Task T4    | ✅     |

## Issue log

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| —  | —        | —      | —     |

No findings raised.

## Propagation status

No forward-deferrals.
