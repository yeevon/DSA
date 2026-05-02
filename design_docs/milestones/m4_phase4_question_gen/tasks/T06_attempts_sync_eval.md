# T06 — POST /api/attempts — mc + short synchronous evaluation

**Status:** todo
**Depends on:** T05 (questions must exist in DB to create an attempt against them)
**Blocks:** T07 (UI submits attempts here), T08 (llm_graded path extends this handler)

## Why

`src/pages/api/attempts.ts` is a 501 stub since M3 T3. T06 implements the synchronous
evaluation types: `mc` and `short` (with `exact`, `fuzzy`, and `numeric` match modes).
`llm_graded` and `code` remain 501 in this task; T08 and M6 own those paths respectively.

## Contract

**Request:**
```ts
POST /api/attempts
Content-Type: application/json

{
  "question_id": "uuid-of-question",
  "started_at": 1746123456789,       // ms epoch; client-provided
  "response": {
    // mc:
    "chosen_ix": 2
    // short:
    "text": "O(n log n)"
    // llm_graded / code:
    "text": "..."  // → 501 for now (T08 / M6)
  }
}
```

**Response (success 200):**
```ts
{
  "id": "attempt-uuid",
  "outcome": "pass" | "fail" | "partial",
  "submitted_at": 1746123460000
}
```

For `llm_graded` (T08): `outcome: "pending"` + `"grade_run_id": "run-xyz"`.
For `code` (M6): `501 Not Implemented`.

## Evaluation logic

### `mc`

```ts
const { chosen_ix } = response;
const { correct_ix } = JSON.parse(question.answerSchemaJson);
outcome = (chosen_ix === correct_ix) ? 'pass' : 'fail';
```

### `short`

Dispatch on `match` field of `answer_schema_json`:

- **`exact`**: `trim().toLowerCase()` equality.
  ```ts
  outcome = response.text.trim().toLowerCase() === expected.trim().toLowerCase()
    ? 'pass' : 'fail';
  ```

- **`fuzzy`**: Levenshtein distance ≤ threshold. Threshold = `answer_schema.tol ?? 2`
  (default tolerance 2 chars). Implement a simple iterative Levenshtein — no external lib.
  ```ts
  outcome = levenshtein(normalize(response.text), normalize(expected)) <= tol
    ? 'pass' : 'fail';
  // normalize: trim + lowercase
  ```

- **`numeric`**: Parse + tolerance check with Big-O / asymptotic canonicalization.
  Architecture.md §3.2 defers the canonicalization rule details to the question_gen workflow,
  but T06 implements the core:
  - Parse both `response.text` and `expected` as numbers via `parseFloat()`.
  - If both parse successfully: `Math.abs(parsed_response - parsed_expected) <= (tol ?? 0)`
    → 'pass' or 'fail'.
  - **Big-O canonicalization**: if either string contains `O(`, strip whitespace and compare
    normalized forms (e.g. `"O( n )"` → `"O(n)"`, `"O(n log n)"` → `"O(nlogn)"` after
    removing spaces inside the parens). Exact match after normalization → 'pass'.
  - Unresolvable (non-numeric, non-Big-O, no parse) → 'fail'.

## Deliverables

1. **`src/lib/evaluators/mc.ts`** — `evaluateMc(answerSchema, response) → outcome` function.
2. **`src/lib/evaluators/short.ts`** — `evaluateShort(answerSchema, response) → outcome`
   function, with `levenshtein()` + `normalizeAsymptotic()` helpers inline.
3. **`src/pages/api/attempts.ts`** — replace 501 stub:
   - Parse + validate request body (question_id, started_at, response).
   - Fetch question row from DB; 404 if not found.
   - Dispatch by `question.type`:
     - `mc` → `evaluateMc(...)` → insert + return 200.
     - `short` → `evaluateShort(...)` → insert + return 200.
     - `llm_graded` → 501 stub body `{kind: 'not_implemented', impl_milestone: 'M4 T08'}`.
     - `code` → 501 stub body `{kind: 'not_implemented', impl_milestone: 'M6'}`.
   - On success: insert into `attempts` table (id: randomUUID, questionId, startedAt,
     submittedAt: Date.now(), responseJson: JSON.stringify(response), outcome,
     llmTagsJson: null). Return 200 with `{id, outcome, submitted_at}`.
4. **CHANGELOG entry.**

## Acceptance criteria

- [ ] **AC-1 (smoke — mc pass).** Auditor inserts an mc question (via T05 or direct DB
  insert), then:
  ```bash
  curl -s -X POST http://localhost:4321/api/attempts \
    -H 'Content-Type: application/json' \
    -d '{"question_id":"<uuid>","started_at":1746000000000,"response":{"chosen_ix":0}}'
  ```
  Where `correct_ix = 0` in the question's `answer_schema_json`. Response: 200,
  `{"outcome":"pass", ...}`.
- [ ] **AC-2 (smoke — mc fail).** Same question, `chosen_ix: 1` → `outcome: "fail"`.
- [ ] **AC-3 (smoke — short exact).** Insert a `short` question with
  `{match: "exact", expected: "O(n)"}`. Submit `{text: " O(N) "}` → `outcome: "pass"`
  (trim+lowercase).
- [ ] **AC-4 (smoke — short fuzzy).** `{match: "fuzzy", expected: "binary", tol: 2}`.
  Submit `{text: "binry"}` (1 edit) → `outcome: "pass"`. Submit `{text: "linker"}` (4 edits)
  → `outcome: "fail"`.
- [ ] **AC-5 (smoke — short numeric Big-O).** `{match: "numeric", expected: "O(n log n)"}`.
  Submit `{text: "O(n log n)"}` → pass. Submit `{text: "O(nlogn)"}` → pass (after
  normalization). Submit `{text: "O(n)"}` → fail.
- [ ] **AC-6.** `llm_graded` → 501 response with `impl_milestone: 'M4 T08'`.
- [ ] **AC-7.** `code` → 501 response with `impl_milestone: 'M6'`.
- [ ] **AC-8.** Attempt row is persisted in `attempts` table after AC-1 smoke
  (auditor queries `SELECT * FROM attempts` via drizzle studio or direct sqlite3 CLI).
- [ ] **AC-9.** `npm run build` exits 0.
- [ ] **AC-10.** CHANGELOG has an M4 T06 entry.

## Notes

- No external Levenshtein library — implement the standard DP algorithm (O(mn), a few
  lines). Keeps the dep surface clean.
- `outcome` for `short` is always `'pass'` or `'fail'` — never `'partial'`. The
  `'partial'` value is reserved for `llm_graded` (score between 0 and 1, but not full
  pass).
- The Big-O normalization is intentionally narrow for M4: strip spaces inside `O(...)` and
  lowercase. Full canonicalization (e.g. recognizing `O(n·log(n))` ≡ `O(n log n)`) defers
  to the question_gen workflow prompt engineering in M5.
- `started_at` is client-provided (the browser records when the user first saw the
  question). `submitted_at` is server-set to `Date.now()` at handler invocation.
