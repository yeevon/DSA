# T06 — `/gaps` page (aggregate llm_tags_json across failed attempts)

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** T05 (attempts.llm_tags_json populated for fail/partial), M4 T07 (question-gen UI client wiring)
**Blocks:** —

## Why this task exists

The terminal surface of M5: aggregate the user's weak topics across all attempts and surface them so the user knows what to study. For each tag in `attempts.llm_tags_json`, count the number of `fail`/`partial` attempts that carry it, sort by frequency, and offer a "generate questions on this tag" action that calls the M4 question-gen workflow.

## What to build

1. **`src/pages/api/gaps.ts`** (new) — `GET` handler:
   - SQL: aggregate over `attempts` joined with `questions`. For each row where `llm_tags_json` is non-null and `outcome IN ('fail', 'partial')`, expand the `tags` array, count occurrences, group by tag.
   - Drizzle approach: pull all matching rows into Node, do the aggregation in JS (cs-300's SQLite is small; this is fine for single-user scale). For larger scale, a `json_each` query would be the SQL-native version — note in the module docstring.
   - Response 200: `{ "gaps": [{ tag: string, count: number, sample_question_ids: string[] }, ...] }` ordered by `count` descending.
2. **`src/pages/gaps.astro`** — page route `/gaps`:
   - Fetches `/api/gaps` on mount.
   - Renders a list: each row shows tag name, count, and a "Generate questions on this tag" button.
   - The button replicates the M4 T07 `QuestionGenButton.astro` pattern: call `runWorkflow('question_gen', { chapter_id, topic_tags: [tag_name], count: N, types: [...] })` via `src/lib/aiw-client.ts` directly (browser-to-aiw-mcp), then poll via `pollUntilDone(run.run_id, ...)`, then `POST /api/questions/bulk` with the artifact's questions to persist them. There is no `/api/questions/generate` endpoint — that pattern does not exist; the trigger is the runWorkflow → pollUntilDone → bulk-insert sequence M4 T07 already established.
   - On generation completion, append to a "newly generated" section so the user can see what they got.
3. **`src/components/gaps/GapList.astro`** — the gap list component (or inline in `gaps.astro` if simple enough).
4. **CHANGELOG entry** under the current dated section.

## Out of scope

- Tag taxonomy normalisation (synonyms, near-duplicates) — out of scope; the LLM may produce overlapping tags. If this becomes a UX problem, file as carry-over.
- Per-chapter gap filtering — out of scope unless the gap list grows unwieldy.
- Time-windowed gap tracking ("gaps in the last 7 days") — single-user scale doesn't need this.
- Embedding-based clustering of tags — out of scope.
- Difficulty-tier-aware aggregation — out of scope; T06 reports raw frequencies.

## Acceptance criteria

- [ ] **AC-1.** `src/pages/api/gaps.ts` exists with `GET` handler returning the aggregated shape.
- [ ] **AC-2.** `src/pages/gaps.astro` exists at `/gaps`. `npm run dev` + browser navigation to `/gaps` shows the list.
- [ ] **AC-3 (smoke — non-inferential, LBD-11).** Auditor runs `node scripts/gaps-smoke.mjs` (new). The smoke:
  1. Seeds three attempts: two fail with tags `["hashing", "Big-O"]`, one fail with tag `["hashing"]`.
  2. `curl -s 'http://localhost:4321/api/gaps'`.
  3. Asserts response 200, `gaps[]` length 2 (tags: `hashing` count=3, `Big-O` count=2), ordered by count desc.
  4. Emits `[gaps-smoke] all <N> assertions passed ✓` on success.
- [ ] **AC-4.** The "Generate questions" button calls `runWorkflow('question_gen', { topic_tags: [tag_name], ... })` via `src/lib/aiw-client.ts` (the M4 T07 pattern), polls via `pollUntilDone`, then `POST /api/questions/bulk` to persist. After completion, the new question count appears in a "newly generated" section. The smoke can stub aiw-mcp absence and assert the button surfaces a graceful error rather than blocking the page.
- [ ] **AC-5.** The endpoint correctly skips attempts where `llm_tags_json` is null (i.e. `pass` attempts and unprocessed attempts).
- [ ] **AC-6.** `npm run check` exits 0.
- [ ] **AC-7.** `npm run build` exits 0.
- [ ] **AC-8.** CHANGELOG has an M5 T06 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `node scripts/gaps-smoke.mjs` (new harness; emits `[gaps-smoke] ... ✓` footer per `gate_parse_patterns.md`).
- **Type check:** `npm run check`.
- **Build:** `npm run build`.
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "Gap report UI: aggregate view over llm_tags_json across all attempts, ordered by tag frequency among failures"

## Dependencies

- Upstream tasks: T05 (attempts.llm_tags_json populated), M4 T07 (question-gen client wiring is the integration template for the "generate questions" button).
- LBDs touched: LBD-1 (page is static shell + client fetch), LBD-2 (state service local), LBD-11 (smoke required).

## Carry-over from prior audits

*(empty)*
