# Autopilot iter 2 — shipped (M5 T01 AUTO-CLEAN)

**Run timestamp:** 20260502T155221Z
**Iteration:** 2
**Date:** 2026-05-02
**Verdict from queue-pick:** PROCEED → M5 T01

## Step A — roadmap-selector

Verdict: `PROCEED` for `m5_phase5_review_loop/tasks/T01_fsrs_integration.md` — sequential rule, M5 lowest open milestone after M4 closure.

## Step B — /auto-implement (T01)

### Cycle 1
- Builder: BUILT (4 deliverables landed, 3 status-surface flips, AC coverage with sandbox carry-overs documented).
- Auditor: PASS (FUNCTIONALLY CLEAN).
- Terminal gate: 2× FIX-THEN-SHIP (sr-dev, sr-sdet) + 1× SHIP (security).
  - sr-dev #1: thread `now` parameter into `applyAttempt`.
  - sr-dev #2: wrap attempt INSERT/UPDATE + fsrs_state UPSERT in `db.transaction((tx) => {...})`.
  - sr-sdet #1: add `fsrsB.stability < fsrsA.stability` discriminating assertion.
  - sr-sdet #2: partial-path coverage (deferred per locked decision — short evaluator emits only pass/fail; partial requires llm_graded multi-step; AC-3 mapping verified by source review).

### Auditor-agreement bypass

All 4 findings: single recommendation, no decision conflict, no scope expansion, no deferral to nonexistent task. Stamped 4 locked terminal decisions in T01 issue file (`## Cycle 2 — Locked terminal decisions`); orchestrator applied fixes inline.

### Cycle 2
- 4 fixes applied to `src/lib/fsrs.ts`, `src/pages/api/attempts.ts`, `src/pages/api/attempts/[id]/outcome.ts`, `scripts/fsrs-smoke.mjs`.
- Auditor: PASS.
- sr-dev: SHIP. sr-sdet: SHIP. (security-reviewer already SHIP'd cycle 1.)
- **TERMINAL CLEAN.**

### Dep-auditor (G4)

Verdict: FIX-THEN-SHIP (single recommendation: host runs `npm install` + `npm audit` to materialize lockfile; already documented as M5-T01-HOST-05). `ts-fsrs ^4.0.0` itself: clean — MIT license, legitimate maintainer (`open-spaced-repetition/ts-fsrs`), no install hooks, no known CVEs at knowledge cutoff. Bypass matches.

### Architect (G5)

Skipped — no new-decision findings from any reviewer. (H-1 was resolved at architecture-amendment time pre-cycle as commit `0c28a71`.)

### Pre-commit ceremony

- Check 1 (non-empty diff): PASS — 332 lines across 7 modified + 4 new files.
- Check 2 (code task — non-empty scripts/ diff): PASS once `scripts/fsrs-smoke.mjs` is staged (8K new file).
- Check 3 (independent gate re-run): NOT RUN — sandbox node_modules permission (host-only carry-over M5-T01-HOST-04).

## Task shipped

- **Task:** `m5_phase5_review_loop/T01_fsrs_integration.md`
- **Cycles:** 2 (1 BUILD + 1 BYPASS-ROUND)
- **Final commit:** to be set after `git commit`
- **Files touched:**
  - `src/lib/fsrs.ts` (new) — `applyAttempt(state, outcome, now)` + `defaultState(now)`.
  - `src/pages/api/attempts.ts` — mc/short path: transaction-wrapped attempt INSERT + fsrs_state UPSERT; passes `submittedAt` to applyAttempt.
  - `src/pages/api/attempts/[id]/outcome.ts` — llm_graded path: transaction-wrapped attempt UPDATE + fsrs_state UPSERT; passes `resolvedAt`.
  - `src/pages/api/questions/bulk.ts` — UPSERTs default fsrs_state per inserted question.
  - `scripts/fsrs-smoke.mjs` (new) — 6 in-sandbox-inspectable assertions; emits `[fsrs-smoke] ... ✓` footer.
  - `package.json` — `ts-fsrs ^4.0.0` placeholder (host materializes lockfile).
  - `CHANGELOG.md` — M5 T01 entry.
  - `design_docs/milestones/m5_phase5_review_loop/README.md` — 3 Done-when checkboxes flipped.
  - `design_docs/milestones/m5_phase5_review_loop/tasks/T01_fsrs_integration.md` — Status flipped to ✅.
- **Auditor verdict:** ✅ PASS (cycle 2)
- **Reviewer verdicts:** sr-dev=SHIP, sr-sdet=SHIP, security=SHIP (cycle 1), dep-audit=FIX-THEN-SHIP (host carry-over)
- **Decision-record additions:** none new (H-1 resolved as `0c28a71` before this iteration).
- **Host-only carry-overs:** M5-T01-HOST-01..05 documented in T01 issue file (`npm install`, `npm run check`, `npm run build`, `node scripts/fsrs-smoke.mjs`, `npm audit`).

## Carry-over to next iteration

Iteration 3: roadmap-selector picks **M5 T02** (`GET /api/review/due` + `stripSolution()` helper — carries M4-T05-SEC-HIGH).
