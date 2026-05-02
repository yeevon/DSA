# T05 — Assess-workflow trigger after fail/partial attempts

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** T04 (assess workflow exists in aiw-mcp), T03 (`QuestionRunner.astro` exists; AC-7 modifies it), M4 T06 (POST /api/attempts mc/short eval), M4 T08 (PATCH /api/attempts/[id]/outcome + pollUntilDone helper)
**Blocks:** T06 (gap report consumes `attempts.llm_tags_json` populated by this trigger)

## Why this task exists

T04 ships the `assess` workflow but nothing invokes it. T05 wires the trigger: every `fail` or `partial` attempt outcome (resolved sync for mc/short, async via PATCH for llm_graded) fires `runWorkflow('assess', {...})` in fire-and-start mode, polls completion via `pollUntilDone`, and PATCHes the `attempts` row with the resulting `llm_tags_json`.

This is the data-pipeline link between question grading and gap-report aggregation.

## What to build

1. **Modify `src/pages/api/attempts.ts`** — at the end of the mc/short sync path, when `outcome ∈ {fail, partial}`, fire `runWorkflow('assess', { question_prompt_md, response_text, outcome, topic_tags })` and start a browser-side polling task (the page polls; not the server). The handler returns the attempt id + outcome immediately; the assess result lands later via a second PATCH.
2. **Modify `src/pages/api/attempts/[id]/outcome.ts`** (M4 T08) — at the end of the llm_graded resolve path, when the resolved outcome is `fail` or `partial`, also fire `runWorkflow('assess', ...)` and let the browser poll. Same shape as the mc/short trigger.
3. **`src/pages/api/attempts/[id]/tags.ts`** (new PATCH route) — body `{ tags: string[] }`. The route:
   - Looks up the attempt by id; 404 if not found.
   - UPDATEs `attempts.llm_tags_json = JSON.stringify({ tags })`.
   - Returns 200 `{ id, tags }`.
   - **Does not validate the tag taxonomy** — the workflow's output is trusted (LLM-validated upstream).
4. **Browser-side polling** in `src/components/review/QuestionRunner.astro` (T03) or wherever the attempt POST returns to:
   - On `outcome ∈ {fail, partial}` and a returned `assess_run_id`: call `pollUntilDone(assess_run_id, { intervalMs: 2000, timeoutMs: 60_000 })`.
   - On completion: extract `tags` from the run artifact, PATCH `/api/attempts/<id>/tags`.
   - On timeout: log + advance (don't block the user); a follow-up sweep can re-trigger.
5. **CHANGELOG entry** under the current dated section.

## Out of scope

- Server-side polling — keep the orchestration browser-side (mirror M4 T08's grade-run polling). Adding a Node worker would violate cs-300's "no background worker in the state service" stance.
- Retry on assess failure — if the workflow fails, log it and advance; T05 doesn't ship retry logic.
- Tag confidence scores — the workflow returns flat tags; T06 handles aggregation.
- `pass` attempts — only `fail` and `partial` trigger the assess workflow (the user is correct; no gap to report).

## Acceptance criteria

- [ ] **AC-1.** `POST /api/attempts` (the mc/short sync path) returns `{ id, outcome, assess_run_id }` when outcome is `fail` or `partial`. When outcome is `pass`, no `assess_run_id` is included in the response.
- [ ] **AC-2.** `PATCH /api/attempts/[id]/outcome` (the llm_graded resolve path) returns `{ id, outcome, assess_run_id }` when the resolved outcome is `fail` or `partial`.
- [ ] **AC-3.** `src/pages/api/attempts/[id]/tags.ts` exists with a PATCH handler. 404 on unknown id; 200 with `{ id, tags }` on success; UPDATEs `attempts.llm_tags_json`.
- [ ] **AC-4 (smoke — non-inferential, LBD-11).** Auditor runs `node scripts/assess-trigger-smoke.mjs` (new). The smoke:
  1. Seeds a `short` question with a known wrong-answer pattern.
  2. Submits a `fail` attempt via `POST /api/attempts`.
  3. Asserts response includes `assess_run_id`.
  4. Polls `getRunStatus(assess_run_id)` until `completed` (or aiw-mcp absent — log NOT RUN).
  5. PATCHes `/api/attempts/<id>/tags` with the artifact's `tags`.
  6. Asserts `attempts.llm_tags_json` row contains the tags.
  7. Emits `[assess-trigger-smoke] all <N> assertions passed ✓`.
- [ ] **AC-5.** When `outcome === 'pass'`: no assess workflow fires. Verify by submitting a passing mc attempt and asserting no `assess_run_id` in response.
- [ ] **AC-6.** When aiw-mcp is unreachable at trigger time: the attempt POST/PATCH still succeeds with the resolved outcome; the response includes `assess_unavailable: true` instead of `assess_run_id`. The user is not blocked by absent aiw-mcp.
- [ ] **AC-7.** `QuestionRunner.astro` (T03) integrates the polling: when a fail/partial outcome arrives with an `assess_run_id`, it polls in the background and PATCHes tags when ready. Page advance does not wait for assess completion.
- [ ] **AC-8.** `npm run check` exits 0.
- [ ] **AC-9.** `npm run build` exits 0.
- [ ] **AC-10.** CHANGELOG has an M5 T05 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `node scripts/assess-trigger-smoke.mjs` (new harness). Pass-line `[assess-trigger-smoke] all <N> assertions passed ✓` per `gate_parse_patterns.md` smoke convention.
- **Type check:** `npm run check`.
- **Build:** `npm run build`.
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "LLM assessment workflow runs async after every fail or partial attempt"

## Dependencies

- Upstream tasks: T04 (assess workflow registered), M4 T06 (POST /api/attempts), M4 T08 (PATCH outcome + pollUntilDone), M4 T03 (run_workflow client pattern), M4 T07 (QuestionGenButton polling pattern as integration template).
- LBDs touched: LBD-2 (assess runs in aiw-mcp; client orchestration is browser-side), LBD-11 (named smoke required).

## Carry-over from prior audits

*(empty)*
