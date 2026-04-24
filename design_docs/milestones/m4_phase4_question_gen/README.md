# M4 — Phase 4: Question generation (ai-workflows bridge)

**Maps to:** `interactive_notes_roadmap.md` Phase 4
**Status:** todo
**Depends on:** M3 (state service must exist to receive generated
questions; `POST /api/questions/bulk` must be live)
**Unblocks:** M5 (review loop needs persisted questions to schedule)

## Goal

Generate practice questions from chapter content via the
`ai-workflows` framework. Land all four question types from
architecture.md §2's schema-per-type table (`mc`, `short`,
`llm_graded`, `code`) end-to-end: trigger generation from the UI,
poll for completion, validate, persist. After M4 the user can ask
"give me 5 mc questions on hashing" and have them appear in the
question bank.

## Done when

- [ ] **FastMCP adapter** runs locally and exposes the three
      endpoints architecture.md §3.1 names:
      `POST /mcp/run_workflow`, `GET /mcp/runs/:id`,
      `GET /mcp/runs/:id/artifacts`.
- [ ] `detectMode()` reaches the adapter when running locally —
      adapter unreachable triggers the `adapter_unreachable` error
      shape, which downgrades the UI gracefully.
- [ ] Question generation UI: a per-section "generate questions"
      action that opens a small form (count, types) and triggers
      the workflow. Polling spinner during run. Results inserted
      into the question bank on success.
- [ ] All four question types validated and persisted at insert:
      `mc`, `short`, `llm_graded`, `code`. Schemas match
      architecture.md §2's per-type table.
- [ ] **Answer evaluation** for the synchronous types lives at
      `POST /api/attempts`:
  - `mc` — index compare.
  - `short` with `exact` — trim+lowercase.
  - `short` with `fuzzy` — Levenshtein ≤ threshold.
  - `short` with `numeric` — parse + tolerance, with Big-O /
    asymptotic canonicalization rules from question_gen.
- [ ] `llm_graded` evaluation flow created (enqueues a `grade`
      workflow, attempt row created with `outcome = 'pending'`,
      transitions on completion). Full async loop verified.
- [ ] Validation runs **twice** as architecture.md §3.1 mandates:
      once in ai-workflows (self-consistency), once at insert
      (schema conformance).
- [ ] Question-gen workflow is parameterized with the model tier
      so M5/M6 can A/B (architecture.md §5 row 5).
- [ ] `coding_practice/` decision resolved: prompts persisted as
      files vs generated dynamically (architecture.md §5 row 6).
      Document the call.

## Tasks

1. Stand up the FastMCP adapter (separate process; this repo
   bridges to `ai-workflows`). Health endpoint, three workflow
   endpoints, error shape per architecture.md §3.1.
2. Author the `question_gen` workflow in `ai-workflows`. Inputs:
   `{chapter_id, section_id?, count, types[]}`. Outputs:
   per-type-validated artifacts.
3. Wire the question-gen UI in Astro: form, submission, polling,
   result display. Use TanStack Query (or fetch + state) for the
   polling loop.
4. Implement `POST /api/questions/bulk` validation in the state
   service. Per-type schema check. Reject on shape mismatch.
5. Implement synchronous answer evaluation in
   `POST /api/attempts`: dispatch by type. `code` returns 501 —
   that's M6.
6. Implement async `llm_graded` flow: enqueue grade workflow,
   pending transition, completion handler. Include retry on
   workflow timeout.
7. Decide `coding_practice/` files-vs-dynamic. Update
   `roadmap_addenda.md` with the call.
8. A/B harness for model tier — config-driven, defaults to 14B
   per architecture.md §5 lean.

## Open decisions resolved here

- **Question-gen model tier** (architecture.md §5 row 5). Start at
  14B; A/B against 32B and Claude via tier_overrides; eval results
  drive the default.
- **`coding_practice/` persisted vs dynamic** (architecture.md §5
  row 6).

## Out of scope

- **Code execution.** `code` questions get generated and
  persisted, but `POST /api/attempts` for them returns 501 until
  M6. Validating the schema is enough for M4.
- **Spaced repetition scheduling.** Questions sit in the bank;
  no review queue ordering yet. M5.
- **Topic-tagging of failed attempts.** Architecture.md §3.4
  describes an LLM assessment workflow that runs after each
  fail/partial attempt. M5.
