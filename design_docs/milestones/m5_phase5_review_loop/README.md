# M5 — Phase 5: Review loop (FSRS + LLM assessment)

**Maps to:** `interactive_notes_roadmap.md` Phase 5
**Status:** todo
**Depends on:** M3 (`fsrs_state` table + PATCH route), M4
(persisted questions to schedule, attempts to grade)
**Unblocks:** —

## Goal

Stand up the spaced-repetition layer: every attempt updates FSRS
state for that question, the review queue surfaces what's due, and
failed/partial attempts get LLM-tagged for the gap report. After
M5, the user can answer questions in due-date order and see a
running picture of their weak topics.

## Done when

- [ ] `ts-fsrs` integrated. Each `POST /api/attempts` (in addition
      to the M4 dispatch logic) runs `ts-fsrs.next(state, grade)`
      and PATCHes the new state. Grade mapping documented:
      pass / fail / partial → FSRS grade.
- [ ] Review queue UI — a `/review` page that:
  - Pulls from `GET /api/review/due?before=<now>&limit=N`.
  - Renders one question at a time (any of the four types).
  - Submits, transitions to next due item.
  - Shows count remaining, accuracy this session, est. time.
- [ ] FSRS state initialized for every newly-generated question
      (M4 generation now upserts `fsrs_state` with default
      stability/difficulty per the library defaults).
- [ ] **LLM assessment workflow** runs async after every `fail`
      or `partial` attempt (architecture.md §3.4). Topic tags
      land in `attempts.llm_tags_json`.
- [ ] **Gap report** UI: aggregate view over `llm_tags_json`
      across all attempts, ordered by tag frequency among
      failures. "You're missing 12 questions tagged
      `open-addressing`" type output.
- [ ] FSRS-vs-SM-2 decision resolved (architecture.md §5 row 3 —
      lean is FSRS via `ts-fsrs`). Document the call.

## Tasks

1. `npm install ts-fsrs`. Wire its `next()` call into the
   `POST /api/attempts` handler from M4. Verify state transitions
   on synthetic attempts.
2. Implement `GET /api/review/due` — query
   `fsrs_state WHERE due_at < ? ORDER BY due_at LIMIT ?` joined
   with `questions` to return the renderable question + state.
3. Build the `/review` page: question rendering (delegates to the
   per-type render component shipped in M4), submit, advance,
   session summary at the end.
4. Author the LLM assessment workflow in `ai-workflows`. Input:
   `{question_prompt, response, outcome}`. Output: `{tags: [...]}`.
5. Wire the assessment workflow trigger: after each
   `fail`/`partial` attempt completes, enqueue. Result PATCHes the
   `attempts` row.
6. Build the `/gaps` page: aggregate query over
   `attempts.llm_tags_json`, sort by tag frequency, link each
   tag to a "generate questions on this tag" action that calls
   the M4 question-gen workflow.

## Open decisions resolved here

- **FSRS vs SM-2** (architecture.md §5 row 3). Default to FSRS;
  pick SM-2 only if `ts-fsrs` has surprises during integration.

## Carry-over from prior audits

- [ ] **M4-T05-SEC-HIGH — `stripSolution()` helper required before any GET question handler.**
  Source: `design_docs/milestones/m4_phase4_question_gen/issues/T05_issue.md` § Security review.
  The `questions` table stores `referenceJson` for all types, including `code` (where
  `referenceJson.solution` must never reach the DOM per LBD-4). The `POST /api/questions/bulk`
  handler correctly omits `referenceJson` from its 201 response, but no shared stripping guard
  exists at the DB query layer. Before implementing `GET /api/review/due` (Task 2) or any other
  GET endpoint that returns question rows, add a `src/lib/stripSolution.ts` utility that:
  - Accepts a question row (or partial row).
  - For `type === 'code'`: strips `referenceJson` (or at minimum sets `referenceJson` to `null`).
  - For all other types: passes through unchanged.
  Wire it into every handler that returns question data. Make it an explicit AC on Task 2's spec.
  Severity: HIGH if GET handler ships without the guard.

## Out of scope

- **Cross-device sync.** Local SQLite only, per architecture.md §2
  preamble.
- **Multi-user.** Single-user system, per the roadmap and README's
  "no multi-user deployment" note.
- **Per-section review** (vs per-question). Out of scope unless
  the gap report makes it natural to add later.
