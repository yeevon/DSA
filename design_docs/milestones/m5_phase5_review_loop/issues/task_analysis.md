# M5 Tasks T01–T06 — Batch task analysis (Round 2)

**Milestone:** [../README.md](../README.md)
**Analyzed on:** 2026-05-02
**Round:** 2 (stress-test after round-1 fixes)
**Overall readiness:** LOW-ONLY — all five round-1 findings (H-1, M-2, M-3, M-4, M-5) are confirmed resolved. No new HIGH or MEDIUM findings introduced by the edits. Remaining open items are LOW only.

---

## Scope summary

| Task | Deliverable | Round-2 status |
|---|---|---|
| T01 | `ts-fsrs` integration into `POST /api/attempts` | READY |
| T02 | `GET /api/review/due` + `stripSolution()` helper | READY |
| T03 | `/review` page (Astro + Selenium smoke) | READY |
| T04 | `assess` workflow module in `cs300/workflows/` | READY |
| T05 | Assess-workflow trigger after fail/partial | READY |
| T06 | `/gaps` page | READY |

---

## Round-1 fix verification

### H-1 — T01 server-side FSRS vs architecture.md §3.5 — RESOLVED

`architecture.md §3.5` now reads (lines 404–419):

> FSRS library (`ts-fsrs` npm package) runs **server-side** in the state service. After each attempt's outcome is resolved … the same handler calls `ts-fsrs.next(state, grade)` and UPDATEs the `fsrs_state` row … in one transaction.

The outcome→grade mapping table (`pass → Good`, `partial → Hard`, `fail → Again`) is present in the doc. The `PATCH /api/fsrs_state/[question_id].ts` stub is noted explicitly as "no longer the cs-300 update path — kept as a 501 placeholder." T01 spec's `src/lib/fsrs.ts` server-side design now matches the architecture doc exactly. No drift remains.

L-2 (mapping undocumented in architecture.md) is also resolved by the same amendment.

### M-2 — T03 AC-6 Selenium smoke ownership — RESOLVED

T03 AC-6 now reads: "**Builder must add a `test_review_page` case to `scripts/functional-tests.py`** that exercises the /review flow … The gate BLOCKS if Auditor runs an unmodified `scripts/functional-tests.py`." The Auditor verification line adds `grep -n test_review_page scripts/functional-tests.py` as a pre-check. Ownership is unambiguous.

### M-3 — T05 missing T03 in `Depends on:` — RESOLVED

T05's `**Depends on:**` line now explicitly lists T03: "T04 (assess workflow exists in aiw-mcp), T03 (`QuestionRunner.astro` exists; AC-7 modifies it), M4 T06 …" The conditional nature of AC-7 is also expressed in the depends-on annotation.

### M-4 — T06 `/api/questions/generate` non-existent endpoint — RESOLVED

T06 § What to build item 2 now reads: "The button replicates the M4 T07 `QuestionGenButton.astro` pattern: call `runWorkflow('question_gen', { chapter_id, topic_tags: [tag_name], count: N, types: [...] })` via `src/lib/aiw-client.ts` directly … There is no `/api/questions/generate` endpoint — that pattern does not exist; the trigger is the runWorkflow → pollUntilDone → bulk-insert sequence M4 T07 already established." AC-4 uses the same correct pattern.

### M-5 — T04 explicit `scripts/aiw-mcp.sh` deliverable — RESOLVED

T04 § What to build item 2 now reads: "**Update `scripts/aiw-mcp.sh`** to append `cs300.workflows.assess` to the `AIW_EXTRA_WORKFLOW_MODULES` env var (current value: `cs300.workflows.question_gen,cs300.workflows.grade` — the launch script lists modules explicitly, not via wildcard, so registration is not automatic). The Builder must edit `scripts/aiw-mcp.sh` directly; no other registration path exists."

---

## Remaining LOW findings (unchanged from round 1)

### L-1 — T04: `gate_parse_patterns.md` has no `aiw run` smoke row

T04 acknowledges: "not required for T04." The uvx oneshot stdout + exit code is sufficient per the spec. No action at T04 build time; carry forward as a post-ship note.

### L-3 — T03: Builder must not set `prerender = false` on `review.astro`

AC-8 asserts `dist/review/index.html` produced. The page is a static shell with client-side fetch — `prerender` must NOT be explicitly set to `false`. Easy to get right; flagged for Builder awareness.

### L-4 (new, LOW) — M1 carry-over: `tasks/README.md` does not exist for M5

All six specs include "(if present)" on the `tasks/README.md` LBD-10 surface flip. That hedge is accurate and sufficient. The Builder must not create the file gratuitously — it is legitimately absent for M5. Document "tasks/README.md absent for M5 — surface flip skipped" in each issue file at close.

---

## Per-task AC review (summary — no changes from round 1)

All ACs remain testable as documented in round 1. No AC wording introduced new ambiguity.

| Task | ACs testable? | Named smoke? | Note |
|---|---|---|---|
| T01 | Yes (9 ACs) | `node scripts/fsrs-smoke.mjs` (new) | dep-audit gate on ts-fsrs add |
| T02 | Yes (9 ACs) | `node scripts/review-due-smoke.mjs` (new) | LBD-4 enforcement via smoke step 4 |
| T03 | Yes (9 ACs) | `python scripts/functional-tests.py` (new test_review_page case) | grep pre-check required |
| T04 | Yes (7 ACs) | `uvx --from jmdl-ai-workflows aiw run assess ...` | no gate_parse row needed |
| T05 | Yes (10 ACs) | `node scripts/assess-trigger-smoke.mjs` (new) | AC-7 conditional on T03 |
| T06 | Yes (8 ACs) | `node scripts/gaps-smoke.mjs` (new) | |

---

## Architecture / decision anchors

- LBDs touched across all tasks: LBD-1, LBD-2, LBD-4, LBD-10, LBD-11, LBD-14
- H-1 drift resolved: `architecture.md §3.5` now matches T01's server-side design
- ADRs cited: none directly (ADR-0001 implicitly respected)
- No new LBD conflicts introduced by round-1 edits

---

## Dependencies check (round 2 — no changes needed)

| Task | Cited upstream | Status |
|---|---|---|
| T01 | M3 fsrs_state table + PATCH route | YES |
| T01 | M4 T06 POST /api/attempts | YES |
| T01 | M4 T08 PATCH outcome | YES |
| T02 | T01 | depends on T01 |
| T03 | T01, T02, M4 T07 components | depends on T01+T02 |
| T04 | M4 T02 question_gen, M4 T03 grade, M4 T04 aiw-mcp.sh | YES |
| T05 | T04, T03 (now listed), M4 T06, M4 T08 | T04+T03 depend chain |
| T06 | T05, M4 T07 (correct pattern now) | T05 depend chain |

---

## Risk flags

| Area | Finding |
|---|---|
| Security | T02 carries LBD-4 (`stripSolution`) — HIGH if shipped without the guard. Spec + smoke cover it explicitly. |
| Dep manifests | T01 adds `ts-fsrs` to `package.json` + `package-lock.json` — dep-audit gate mandatory, called out in T01. |
| Release (`dist/`) | API routes for review/due, gaps, attempts/[id]/tags must have `prerender = false`; page shells (review.astro, gaps.astro) must not. Verify post-build. |
| Long-running | All tasks: LOW likelihood. T03 is most complex but fits one cycle. |
| Architecture drift | None remaining. |

---

## Builder sequencing

Dependency order enforced by specs: T01 → T02 → T03; T04 → T05 → T06. T04 can start in parallel with T01. All specs are ready to enter the Builder loop.
