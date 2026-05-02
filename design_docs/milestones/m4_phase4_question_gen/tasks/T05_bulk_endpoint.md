# T05 — POST /api/questions/bulk — validation + insert

**Status:** ✅ done 2026-05-02 (AC-2/3/4/7 host-only — node_modules root-owned in sandbox)
**Depends on:** T01 (schema shapes documented), T02 (output schema defines what bulk receives)
**Blocks:** T07 (UI POSTs generated questions here after polling completes)

## Why

`src/pages/api/questions/bulk.ts` is a 501 stub since M3 T3. M4 replaces it with the real
handler: validate each question against the per-type schema from architecture.md §2, then
batch-insert into the `questions` Drizzle table.

## Contract

**Request:**
```ts
POST /api/questions/bulk
Content-Type: application/json

{
  "source_run_id": "qg-run-123",          // ai-workflows run id (stored verbatim)
  "chapter_id": "ch_4",
  "section_id": "ch_4-hashing",           // optional; null → chapter-wide
  "questions": [
    {
      "type": "mc",
      "prompt_md": "What is the worst-case...",
      "topic_tags": ["hashing", "Big-O"],
      "answer_schema": { "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "correct_ix": 0 },
      "reference": { "explanation": "Hash table lookup is amortised O(1)." }
    }
    // ... more questions
  ]
}
```

**Response (success 201):**
```ts
{ "inserted": ["uuid-1", "uuid-2", ...] }
```

**Response (validation failure 422):**
```ts
{ "kind": "validation_failed", "errors": ["question[1].answer_schema.correct_ix: required"] }
```

**Response (unknown chapter/section 422):**
```ts
{ "kind": "validation_failed", "errors": ["chapter_id 'ch_99' not found"] }
```

## Per-type schema validation

Implement Zod schemas in `src/lib/question-schemas.ts` that mirror architecture.md §2's
per-type table. Validation is run in the route handler before any DB write.

```ts
// src/lib/question-schemas.ts

import { z } from 'zod';

export const McAnswerSchema = z.object({
  options: z.array(z.string()).min(2),
  correct_ix: z.number().int().min(0),
});

export const ShortAnswerSchema = z.object({
  match: z.enum(['exact', 'fuzzy', 'numeric']),
  expected: z.string(),
  tol: z.number().optional(),
});

export const LlmGradedAnswerSchema = z.object({
  rubric: z.array(z.string()).min(1),
});

export const CodeAnswerSchema = z.object({
  lang: z.string(),
  signature: z.string(),
  test_cases: z.array(z.object({
    input: z.string(),
    expected: z.string(),
  })).min(1),
});

export const McReferenceSchema = z.object({ explanation: z.string() });
export const ShortReferenceSchema = z.object({ explanation: z.string() });
export const LlmGradedReferenceSchema = z.object({ ideal_answer: z.string() });
export const CodeReferenceSchema = z.object({ solution: z.string() });

// discriminated by type
export function validateAnswerSchema(type: string, raw: unknown) { ... }
export function validateReference(type: string, raw: unknown) { ... }
```

Note: Zod is already a dep (included with Astro's validation utilities, or installable via
`npm install zod`). Check `package.json` first; if absent, add it.

## Deliverables

1. **`src/lib/question-schemas.ts`** — per-type Zod schemas + dispatch helpers.
2. **`src/pages/api/questions/bulk.ts`** — replace 501 stub with the real handler:
   - Parse + validate request body (`source_run_id`, `chapter_id`, `section_id?`,
     `questions[]`).
   - Look up `chapter_id` in DB (reject 422 if not found).
   - Look up `section_id` if provided (reject 422 if not found).
   - For each question: validate `answer_schema` + `reference` via per-type Zod schema.
     Collect all errors before returning (don't stop on first).
   - If all questions are valid: batch insert into `questions` table. Each row gets a
     `crypto.randomUUID()` as `id`, `createdAt: Date.now()`, `status: 'active'`.
     `answerSchemaJson` and `referenceJson` are stored as `JSON.stringify(...)`.
   - Return 201 with `{"inserted": [ids]}`.
3. **CHANGELOG entry.**

## Acceptance criteria

- [ ] **AC-1.** `src/lib/question-schemas.ts` exists and exports all four
  `*AnswerSchema` + `*ReferenceSchema` Zod objects.
- [ ] **AC-2 (smoke — non-inferential).** Auditor starts `npm run dev` and runs:
  ```bash
  curl -s -X POST http://localhost:4321/api/questions/bulk \
    -H 'Content-Type: application/json' \
    -d '{
      "source_run_id": "smoke-1",
      "chapter_id": "ch_1",
      "questions": [{
        "type": "mc",
        "prompt_md": "What is the worst-case complexity?",
        "topic_tags": ["Big-O"],
        "answer_schema": {"options":["O(1)","O(n)"],"correct_ix":0},
        "reference": {"explanation":"O(1) amortised."}
      }]
    }'
  ```
  Response: HTTP 201, body contains `{"inserted": ["<uuid>"]}`. Auditor confirms the
  uuid is a valid UUID (36 chars, hyphen-delimited).
- [ ] **AC-3.** Auditor sends a malformed request (missing `correct_ix`) → 422, body has
  `kind: 'validation_failed'` + non-empty `errors[]`.
- [ ] **AC-4.** Auditor sends `chapter_id: 'ch_999'` → 422, error mentions unknown chapter.
- [ ] **AC-5.** Zod validates ALL questions before any DB write (not fail-on-first).
- [ ] **AC-6.** `referenceJson` for `code` type is stored in DB but never returned in
  the 201 response body (per architecture.md §2 "NEVER shipped to DOM for 'code'").
  The 201 body contains only inserted UUIDs.
- [ ] **AC-7.** `npm run build` exits 0 (TypeScript + Astro build pass).
- [ ] **AC-8.** CHANGELOG has an M4 T05 entry.

## Notes

- Zod: check `package.json` for an existing dep. Astro 4+ does not bundle Zod by default,
  but it is a direct dep of many Astro integrations. If absent, add `zod` as a dep.
  Dep audit required if adding to package.json (per CLAUDE.md non-negotiable).
- `topic_tags` is stored as `JSON.stringify(array)` in the `text` column. The Drizzle
  schema uses `text` for this column — no Drizzle-level array support needed.
- `status` defaults to `'active'` at insert; no input field needed.
- The handler must set `prerender = false` (already set on the stub).
- Do not implement `GET /api/questions/bulk` — that is M5's question-bank browse surface.
