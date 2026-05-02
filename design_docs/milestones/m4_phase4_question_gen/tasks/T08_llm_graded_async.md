# T08 — llm_graded async flow

**Status:** ✅ done 2026-05-02 (AC-1 Ollama loop + AC-6 build host-only; host must run drizzle-kit push for schema migration)
**Depends on:** T03 (grade workflow), T06 (attempts handler stubs llm_graded as 501),
T07 (UI can reuse polling pattern)
**Blocks:** nothing (M4 terminal task)

## Why

M4's "Done when" requires: "llm_graded evaluation flow created (enqueues a grade workflow
via run_workflow(...), attempt row created with outcome = 'pending', transitions on
completion). Full async loop verified."

T06 left llm_graded as a 501 stub. T08 implements it end-to-end.

## Async flow design

The state service does NOT maintain a polling loop to check grade run completion — that
would require a background worker in Node. Instead, the browser orchestrates the completion:

```
POST /api/attempts (llm_graded)
  → state service: insert attempt row (outcome='pending', grade_run_id stored)
  → state service: call run_workflow('grade', {...}) on aiw-mcp
  → return {id, outcome:'pending', grade_run_id}

browser polls aiw-client.getRunStatus(grade_run_id) every 2s
  → when completed: PATCH /api/attempts/:id/outcome
      {outcome: 'pass'|'fail'|'partial', grade_run_id}
  → state service: UPDATE attempts SET outcome=?, llm_tags_json=? WHERE id=?
  → return 200 {outcome}
```

The state service calls `run_workflow` synchronously from the POST handler (fire-and-start,
not fire-and-forget: we need the `run_id` back to store and return). The run is
asynchronous on the aiw-mcp side — it may take 10–30s. The POST handler returns
immediately after getting the run_id back from aiw-mcp.

## Deliverables

### A — `src/pages/api/attempts.ts` extension (llm_graded path)

Replace the `llm_graded` 501 branch with:
1. Insert attempt row with `outcome = 'pending'`.
2. Call `aiw-mcp run_workflow('grade', {attempt_id, question_prompt_md, rubric_criteria, response_text})`.
   Use `src/lib/aiw-client.ts`'s `runWorkflow` helper (a server-side `fetch` from the
   Node.js API route — `aiw-mcp` is localhost so this is fine).
3. If `run_workflow` fails (aiw-mcp unreachable): update the attempt `outcome = 'fail'`,
   return `{id, outcome:'fail', error: 'grade_unavailable'}`.
4. Store `grade_run_id` in a new `grade_run_id TEXT` column on the `attempts` table
   (Drizzle schema migration needed — see Notes).
5. Return `{id, outcome:'pending', grade_run_id}`.

### B — `PATCH /api/attempts/[id]/outcome.ts`

New route. Body: `{ outcome: 'pass' | 'fail' | 'partial', score: float, feedback: str }`.

1. Look up attempt by id; 404 if not found.
2. Verify `outcome === 'pending'` before allowing the transition (idempotency guard).
3. UPDATE attempt: `outcome = body.outcome`, `llmTagsJson = JSON.stringify({score, feedback})`.
4. Return 200 `{id, outcome}`.

### C — Browser-side polling in `QuestionGenButton.tsx` (or a new `AttemptSubmitter.tsx`)

When an llm_graded submission returns `outcome: 'pending'`:
- Poll `getRunStatus(grade_run_id)` every 2s (max 120s timeout for grading).
- On completion: call `PATCH /api/attempts/:id/outcome` with the grade result from
  `result.artifact` (`{outcome, score, feedback}`).
- Update the UI: show outcome + feedback.

T08 may add this logic to `QuestionGenButton.tsx` or extract a small `useAttempt` hook.
Scope: the minimum that makes the full loop visible in the UI.

### D — Drizzle schema migration

Add `grade_run_id TEXT` to the `attempts` table in `src/db/schema.ts` and run
`drizzle-kit push` to apply. The column is nullable (non-llm_graded attempts never set it).

### E — CHANGELOG entry.

## Acceptance criteria

- [ ] **AC-1 (smoke — full async loop).** Auditor:
  1. Starts `npm run dev` + `bash scripts/aiw-mcp.sh`.
  2. Inserts an `llm_graded` question via POST /api/questions/bulk.
  3. POSTs to `/api/attempts` with `response: {text: "Some free-text answer"}` for that
     question.
  4. Response: 200 `{id, outcome:'pending', grade_run_id: "<run-uuid>"}`.
  5. Polls `GET /api/...` or directly calls `getRunStatus` for the grade run until
     `status === 'completed'` (aiw-mcp + Ollama must be running for this smoke to fully
     pass; if Ollama is absent, use `outcome: 'pending'` response + verify the PATCH route
     accepts a manual update as AC-1 alt).
  6. PATCHes `/api/attempts/<id>/outcome` with `{outcome:'pass', score:0.8,
     feedback:'Good answer.'}`.
  7. Response: 200 `{id, outcome:'pass'}`.
  8. Queries DB: `attempts` row has `outcome='pass'`, `llm_tags_json` contains score +
     feedback.
- [ ] **AC-2.** `PATCH /api/attempts/:id/outcome` returns 404 for unknown id.
- [ ] **AC-3.** PATCH is idempotent-guarded: attempting to PATCH an already-resolved
  attempt (outcome ≠ 'pending') returns 409.
- [ ] **AC-4.** Drizzle schema has `grade_run_id` column on `attempts` table; `drizzle-kit
  push` completes without error.
- [ ] **AC-5.** If aiw-mcp is unreachable when POST /api/attempts fires:
  attempt is inserted with `outcome = 'fail'`; response has `error: 'grade_unavailable'`.
- [ ] **AC-6.** `npm run build` exits 0.
- [ ] **AC-7.** CHANGELOG has an M4 T08 entry.

## Carry-over from prior audits

- [ ] **M4-T07-ISS-MED-1 — Factor `pollUntilDone` helper into `src/lib/aiw-client.ts`.**
  Source: `design_docs/milestones/m4_phase4_question_gen/issues/T07_issue.md` § MED-1.
  T07's `QuestionGenButton.astro` polling loop sleeps 2s before the first `getRunStatus`
  call, ignoring any status already returned by `runWorkflow`. T08 introduces a second
  polling loop for the grade run. Before implementing T08's browser-side polling (§ C),
  extract a shared `pollUntilDone(run_id: string, opts?: { intervalMs?: number; timeoutMs?: number }): Promise<RunStatus>` helper in `src/lib/aiw-client.ts` that:
  - Checks the status immediately (0ms initial delay) by calling `getRunStatus` once.
  - If still pending, loops with a configurable `intervalMs` (default 2000ms).
  - Throws a `McpError('workflow_failed', 'timeout')` after `timeoutMs` (default 60s).
  Then update `QuestionGenButton.astro` to use `pollUntilDone` (removes the ad-hoc loop).
  Severity: MEDIUM if T08 ships its own duplicate polling loop without addressing this.

## Notes

- Server-side `fetch` from the Astro API route to aiw-mcp: Node's built-in `fetch` (Node
  18+) is available in Astro's server context. No extra http library needed.
- Drizzle migration: `drizzle-kit push` is the dev workflow (no SQL migration file needed
  for local dev per M3 T2 precedent). The `grade_run_id` column addition is additive and
  non-breaking.
- The 120s polling timeout for grading: set a `Date.now() + 120_000` deadline in the
  browser and show "grading timed out" if the run is still pending after that. The
  underlying aiw-mcp run continues; the user can manually PATCH the outcome later.
- `llmTagsJson` column stores grading metadata (score, feedback) — not actual LLM topic
  tags (those are M5). The column name is an inherited artifact from M3's schema; use it
  as the storage for grading results in M4.
- The `assess.py` workflow (topic tagging after failed attempts — architecture.md §3.5)
  is explicitly out of scope for M4. M5 owns it.
