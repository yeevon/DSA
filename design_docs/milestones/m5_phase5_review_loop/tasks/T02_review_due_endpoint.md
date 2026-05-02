# T02 — `GET /api/review/due` endpoint + `stripSolution()` helper

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** T01 (fsrs_state populated by every attempt; default state seeded at question-gen time)
**Blocks:** T03 (review page reads from this endpoint)

## Why this task exists

The `/review` page (T03) needs a single source for "what's due now". This task ships the endpoint that joins `fsrs_state` (for scheduling) with `questions` (for renderable content), filters by `due_at < ?`, orders by `due_at` ascending, and returns the rows the page renders.

This task also delivers the `stripSolution()` helper required as carry-over from M4 T05's security review — without it, code-type questions would leak `referenceJson.solution` to the DOM, violating LBD-4. T02 is the first GET endpoint that returns question data; the helper must land here, not deferred further.

## What to build

1. **`src/lib/stripSolution.ts`** — utility per the carry-over below:
   - Accepts a question row (or partial row) of any of the four types (mc / short / llm_graded / code).
   - For `type === 'code'`: sets `referenceJson` to `null` (do **not** mutate; return a new object).
   - For all other types: passes through unchanged.
   - Module docstring cites LBD-4 + the M4-T05-SEC-HIGH carry-over source.
2. **`src/pages/api/review/due.ts`** (new) — `GET` handler:
   - Query params: `before` (ms timestamp, default `Date.now()`), `limit` (integer, default 20, max 100).
   - SQL (Drizzle): `SELECT * FROM fsrs_state INNER JOIN questions ON fsrs_state.question_id = questions.id WHERE fsrs_state.due_at < ? AND questions.status = 'active' ORDER BY fsrs_state.due_at ASC LIMIT ?`.
   - Apply `stripSolution()` to every returned row before serialising.
   - Response 200 body: `{ "due": [{ id, type, prompt_md, topic_tags, answer_schema, reference, due_at, fsrs_state: {...} }, ...] }`. The shape mirrors what the per-type render components expect.
   - 400 on bad query params; 500 on DB error.
3. **CHANGELOG entry** under the current dated section.

## Out of scope

- Pagination tokens / cursor-based pagination — `before + limit` is sufficient for cs-300's single-user scale.
- Per-section filtering — out of scope unless T03 surfaces a UX need; if that surfaces, file as carry-over.
- Mutation of `fsrs_state` from this endpoint — read-only; updates happen via T01's POST/PATCH writes.
- Server-Sent Events / streaming — the endpoint returns a flat JSON list.

## Acceptance criteria

- [ ] **AC-1.** `src/lib/stripSolution.ts` exists, exports a default function with the signature `(row: QuestionRow) => QuestionRow`. For `type === 'code'`, the returned row's `referenceJson` is `null`. For other types, the input is passed through unchanged.
- [ ] **AC-2.** `src/pages/api/review/due.ts` exists with `GET` handler.
- [ ] **AC-3 (smoke — non-inferential, LBD-11).** Auditor runs `node scripts/review-due-smoke.mjs` (new). The smoke:
  1. Seeds three questions (one of each: mc, short, code), each with a `fsrs_state.due_at` in the past.
  2. `curl -s 'http://localhost:4321/api/review/due?before=<future_ts>&limit=10'`.
  3. Asserts response 200, `due[]` length 3, each item has the expected shape.
  4. **Asserts the code-type item's `reference` field is `null`** (LBD-4 enforcement).
  5. Emits `[review-due-smoke] all <N> assertions passed ✓` on success.
- [ ] **AC-4.** Endpoint correctly applies `before` (only past-due rows returned) and `limit` (caps result count at the parameter, max 100 even if requested higher).
- [ ] **AC-5.** Endpoint returns 400 with `{ kind: 'bad_request', message: '...' }` on a non-numeric `before` or `limit > 100`.
- [ ] **AC-6.** `stripSolution()` is wired into **every** GET handler that returns question data (currently only this endpoint exists; future GETs must use the helper — flag in the helper's module docstring).
- [ ] **AC-7.** `npm run check` exits 0.
- [ ] **AC-8.** `npm run build` exits 0.
- [ ] **AC-9.** CHANGELOG has an M5 T02 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `node scripts/review-due-smoke.mjs` (new harness; emits `[review-due-smoke] ... ✓` footer per `gate_parse_patterns.md`).
- **Type check:** `npm run check`.
- **Build:** `npm run build`.
- **Security gate (LBD-4):** the smoke's AC-3 step 4 is the gate; the security-reviewer agent re-checks at the terminal gate that `stripSolution()` is wired into every code path that returns question data.
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "Review queue UI — pulls from GET /api/review/due"

## Dependencies

- Upstream tasks: T01 (fsrs_state must be populated for any due query to return rows).
- LBDs touched: LBD-1 (the GET endpoint is local-only; must not appear in `dist/`), LBD-4 (reference-solution stripping is the explicit security boundary), LBD-2 (state-service is local Node + SQLite), LBD-11 (smoke required).

## Carry-over from prior audits

- [ ] **M4-T05-SEC-HIGH — `stripSolution()` helper required before any GET question handler.**
  Source: `design_docs/milestones/m4_phase4_question_gen/issues/T05_issue.md` § Security review.
  The `questions` table stores `referenceJson` for all types, including `code` (where
  `referenceJson.solution` must never reach the DOM per LBD-4). `POST /api/questions/bulk`
  correctly omits `referenceJson` from its 201 response, but no shared stripping guard
  exists at the DB query layer. T02 ships `src/lib/stripSolution.ts` and wires it into
  `GET /api/review/due` (the first GET that returns question data). All future GETs that
  return question data must use the same helper. **AC-1 + AC-3 step 4** explicitly cover this.
  Severity: HIGH if T02 ships without the guard or its smoke check.
