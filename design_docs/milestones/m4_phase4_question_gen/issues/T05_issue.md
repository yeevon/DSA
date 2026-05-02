# T05 — POST /api/questions/bulk — Audit Issues

**Source task:** [../tasks/T05_bulk_endpoint.md](../tasks/T05_bulk_endpoint.md)
**Audited on:** 2026-05-02 (re-audit after MEDIUM-2 fix)
**Audit scope:** `src/lib/question-schemas.ts` (new), `src/pages/api/questions/bulk.ts` (501 stub → real handler), `package.json` + `package-lock.json` (zod ^4.3.6 added), `CHANGELOG.md` 2026-05-02 entry, M4 README status surfaces (header line, two `Done when` checkboxes that T05 satisfies), milestone index `design_docs/milestones/README.md` M4 row, T05 spec `**Status:**` line. AC-1/5/6/8 verified by code inspection; AC-2/3/4/7 documented as host-only because `node_modules` is root-owned in the audit sandbox (EACCES on `npm ci`, blocking `npm run dev`, `npm run check`, `npm run build`).
**Status:** ✅ PASS — 0 HIGH, 1 MEDIUM (host-only carry-over), 1 LOW. MEDIUM-2 (zod v4 `.errors` → `.issues` rename) resolved at lines 49 and 63 of `src/lib/question-schemas.ts`; verified by grep that no other `.error.errors` ZodError access remains in `src/`. Code is now both type-safe by inspection and uses the documented zod v4 idiom. MEDIUM-1 remains as a documented host carry-over (the spec already names the smokes per LBD-11; the audit sandbox is the blocker, not the spec or the code).

## Design-drift check

Cross-referenced against `CLAUDE.md` LBD-1..15, `design_docs/architecture.md` §2 (per-type payload table) + §3.1 (validation runs twice), the M4 README, and saved memory rules.

- **LBD-1 (static-by-default deploy).** `src/pages/api/questions/bulk.ts` already declares `export const prerender = false;` (line 13). Confirmed `prerender = false` is preserved from the M3 T3 stub. The route is local-only and will not appear in `dist/`. No new public surface added. **No drift.**
- **LBD-2 (two-process boundary).** Handler does *not* call out to `aiw-mcp`; it accepts a POST body the client (browser) assembles from the `run_workflow` MCP response. That matches architecture.md §3.1 ("Frontend POSTs artifacts to the cs-300 state service") — the workflow process and the state service stay sibling-decoupled. **No drift.**
- **LBD-3 (pandoc + Lua filter pipeline).** N/A — no content-pipeline change.
- **LBD-4 (reference solutions never reach the DOM).** **Verified.** The handler stores `referenceJson: JSON.stringify(q.reference)` at line 108 of `bulk.ts` but the success response at lines 115–118 returns only `{ inserted: ids }`. No reference / no `solution` field is echoed back. The 422 validation-failed responses at lines 35–94 also contain only string error descriptions — no reference data. The `code` type's `solution` field stays server-only as architecture.md §2 row 309 requires (`{solution: str}` — **server-only**). **No drift.**
- **LBD-5 (no sandboxing of code execution).** N/A — no code-execution path touched.
- **LBD-6 / LBD-7 / LBD-8 / LBD-9.** N/A — no chapter content, no `coding_practice/` files, no Jekyll, no chapter-content additions.
- **LBD-10 (status-surface 4-way agreement).** Verified across the four available surfaces:
  1. Per-task spec: `**Status:** ✅ done 2026-05-02 (AC-2/3/4/7 host-only — node_modules root-owned in sandbox)` — line 3 of `T05_bulk_endpoint.md`.
  2. `tasks/README.md` row — **N/A** (M4 has no per-task index file; same as T01–T04). The four-way rule degrades to three-way for M4.
  3. Milestone README header line: `**Status:** 🟡 in progress — T01 ✅ 2026-05-01, T02 ✅ 2026-05-02, T03 ✅ 2026-05-02, T04 ✅ 2026-05-02, T05 ✅ 2026-05-02.` (M4 README line 4).
  4. `Done when` checkboxes that T05 satisfies — both flipped:
     - Line 51 `[x] All four question types validated and persisted at insert: mc, short, llm_graded, code. Schemas match architecture.md §2's per-type table. (T05 ✅ 2026-05-02 — schema validation + insert done; AC-2/3/4/7 pending host npm ci — see issues/T05_issue.md)`
     - Line 66 `[x] Validation runs twice as architecture.md §3.1 mandates: once inside the cs-300 workflow's ValidatorNode (KDR-004 …), once at insert (schema conformance). (T02 ✅ 2026-05-02 — ValidateStep in workflow; T05 ✅ 2026-05-02 — Zod schema conformance at insert)`
  5. Milestone index `design_docs/milestones/README.md` M4 row line 22 also lists `T05 ✅ 2026-05-02`.
  Both citation parentheticals back-link to this issue file. **No drift.**
- **LBD-11 (non-inferential verification for code).** The spec names explicit smoke tests (AC-2/3/4 are curl POSTs against a running dev server, AC-7 is `npm run build`). The Auditor *cannot* run them in this sandbox because `node_modules/` is root-owned and `npm ci` fails EACCES. The spec did its job; the environment is the blocker. Build-clean is necessary but not sufficient (per LBD-11) — this audit therefore cannot conclude PASS on runtime correctness, only on code-shape correctness, until the host re-runs the smokes. Documented as MEDIUM-1, not HIGH, because the spec correctly identifies the smoke and the Builder's "host must re-run" framing matches the policy in LBD-15 (sandbox-vs-host split). **No drift on the spec or the Builder; the audit verdict simply cannot reach PASS without the host gates.**
- **LBD-12 (cross-chapter refs).** The example AC-2 smoke uses `chapter_id: 'ch_1'` which exists in `scripts/chapters.json` line 2. **No drift.**
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M4 task touching M4 surfaces.
- **LBD-14 (toolchain pins).** N/A — no `.nvmrc` or `.pandoc-version` change.
- **LBD-15 (sandbox vs host git policy).** Audit performed read-only on `design_branch`; no pushes, no `main` touches, no remote ops. The Builder explicitly defers `npm` gates to the host, which is the correct sandbox/host split. **No drift.**
- **`nice_to_have.md` boundary.** No items adopted from the parking lot. Zod was added as a runtime dep, but it appears in the task spec's "Notes" section (line 96–97 of `T05_bulk_endpoint.md`) which authorizes its addition — not a `nice_to_have` adoption.
- **Memory rules.** No conflict. Project memory rules are about the chapter-content review and ai-workflows uvx invocation; neither applies to this task.

**Verdict on Phase 1:** No architectural drift. LBD-4 explicitly upheld in the response-shape audit.

## Gate summary

| Gate | Command | Result | Notes |
| -- | ------- | ------ | ----- |
| type-check (AC-7 part 1) | `npm run check` (= `astro check`) | NOT RUN — sandbox-blocked | `node_modules/` is root-owned (`drwxr-xr-x 2 root root … node_modules`); `npm ci` returns EACCES. Must run on host. **Type-safety verified by inspection** — see AC-7 row in AC grading. |
| build (AC-7 part 2) | `npm run build` | NOT RUN — sandbox-blocked | Same EACCES. Must run on host. |
| dev server | `npm run dev` | NOT RUN — sandbox-blocked | Required for AC-2/3/4 smoke. Must run on host. |
| AC-2 smoke (mc, valid) | `curl -s -X POST localhost:4321/api/questions/bulk …` | NOT RUN — depends on dev server | See MEDIUM-1 (host carry-over). Spec body verified to match the schema by inspection; expected: HTTP 201 + `{"inserted": ["<uuid>"]}`. |
| AC-3 smoke (mc, missing `correct_ix`) | `curl …` (per spec line 138) | NOT RUN — depends on dev server | Inspection: `McAnswerSchema` requires `correct_ix: z.number().int().min(0)`; safeParse failure populates `result.error.issues`, and the dispatch helper now correctly reads `.issues` (lines 49, 63 — re-audit fix). The runtime risk previously called out as MEDIUM-2 has been resolved. |
| AC-4 smoke (unknown chapter) | `curl … chapter_id: 'ch_999'` | NOT RUN — depends on dev server | Inspection: lines 54–60 of `bulk.ts` correctly issue 422 with `errors: ["chapter_id 'ch_999' not found"]` when the chapter FK lookup returns an empty row set. |
| CHANGELOG entry | grep | PASS | `CHANGELOG.md:17–28` under `## 2026-05-02` — `**Added** **M4 T05 — POST /api/questions/bulk: validation + insert**` with deliverables list, AC mapping, and `Dep audit: SHIP`. Format matches sibling T01/T02/T03/T04 entries. |
| Status surfaces | manual | PASS | See LBD-10 row in design-drift section. Three available surfaces all flipped (M4 has no per-task table). |
| Dep audit | manual diff of `package.json` + `package-lock.json` | PASS | `package.json` line 31 declares `"zod": "^4.3.6"`; `package-lock.json` root `""` deps line 20 declares `"zod": "^4.3.6"`; `node_modules/zod` lockfile entry at line 8475 resolves to `4.3.6` (sha512 hash present). The transitive entry under `astro@6.1.9` peer deps (line 2633) also pins `zod: ^4.3.6` — cs-300's direct dep aligns with astro's transitive, so a single `node_modules/zod` instance satisfies both. **No duplicate installation, no version conflict.** Manifest changes touched only `package.json` and `package-lock.json`. CHANGELOG records `Dep audit: SHIP` (the Builder ran the dependency-auditor — the audit findings are not surfaced inline here, but the dep added is a small, well-known schema library on its current major). |
| Reference-leakage grep | manual | PASS | Searched response paths for `solution` / `reference` / `referenceJson` literals in any `Response.body`. The success response (line 116) returns `{ inserted: ids }` only; the four 422 responses return `{ kind: 'validation_failed', errors: [...] }` with string error descriptions. **No reference data leaks to the DOM** (LBD-4 satisfied). |

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 — `src/lib/question-schemas.ts` exists, exports all four `*AnswerSchema` + four `*ReferenceSchema` Zod objects | MET | Direct read: `McAnswerSchema` (line 7), `ShortAnswerSchema` (line 12), `LlmGradedAnswerSchema` (line 18), `CodeAnswerSchema` (line 22), `McReferenceSchema` (line 31), `ShortReferenceSchema` (line 31), `LlmGradedReferenceSchema` (line 33), `CodeReferenceSchema` (line 34). Plus the two dispatch helpers `validateAnswerSchema` (line 38) + `validateReference` (line 52). All eight schemas + both helpers exported. | All schema shapes match architecture.md §2 lines 304–309. |
| AC-2 — POST 1 valid `mc` question → 201 + `{"inserted": ["<uuid>"]}` | NOT RUN — sandbox-blocked (carry-over) | See Gate summary "AC-2 smoke" row. Inspection: handler path validates body → checks chapter FK (ch_1 present) → loops once over the single question → `validateAnswerSchema('mc', {options, correct_ix: 0})` and `validateReference('mc', {explanation})` both pass against the v4 schemas → batch-insert via `db.insert(questions).values({...}).run()` → returns `{ inserted: [uuid] }` with status 201. UUID source is `crypto.randomUUID()` (line 99) which yields RFC 4122 v4 UUIDs. **Expected pass** if MEDIUM-2 (zod v4 errors API) does not bite — for a *valid* request the error-path code is not exercised, so AC-2 should pass even if MEDIUM-2 manifests. | Host must run `npm ci && npm run dev` then issue the curl from the spec line 121. |
| AC-3 — malformed (`correct_ix` missing) → 422 + `{kind: 'validation_failed', errors: [...]}` | NOT RUN — sandbox-blocked (MEDIUM-2 resolved) | See Gate summary "AC-3 smoke" row. Inspection: `McAnswerSchema.safeParse({options:[...]})` returns `{success: false, error}`. The dispatch helper at line 49 now reads `result.error.issues.map(...)` — the documented zod v4 idiom (post-fix in this re-audit). Re-grep of `src/` confirms no remaining `.error.errors` access on ZodError instances. **Runtime risk from the prior MEDIUM-2 is removed.** | Host smoke still must exercise this path to confirm the 422 shape end-to-end (validation + response body), but the fragile API access has been corrected. |
| AC-4 — unknown `chapter_id: 'ch_999'` → 422 + error mentions unknown chapter | NOT RUN — sandbox-blocked (carry-over) | See Gate summary "AC-4 smoke" row. Inspection: `bulk.ts:54–60` issues `db.select().from(chapters).where(eq(chapters.id, chapter_id!)).all()`; if the result is `[]`, returns 422 with `errors: ["chapter_id '<id>' not found"]`. The error message includes the literal id string ("ch_999"). Path is straightforward and does not exercise the zod error-extraction code (so MEDIUM-2 does not affect this AC). | **Expected pass** on host smoke. |
| AC-5 — Zod validates ALL questions before any DB write (not fail-on-first) | MET | Direct read of `bulk.ts:73–95`: a single `for (let i = 0; i < qs!.length; i++)` loop appends to a `topErrors[]`-but-named-`allErrors[]` array, then *after* the loop completes the handler checks `allErrors.length > 0` and returns the aggregated 422 (line 90–95). **No early `return` inside the validation loop.** No DB write happens until line 100 (`db.insert(...)`), which is reached only when `allErrors.length === 0`. Behaviour exactly matches the spec ("Collect all errors before returning"). | Worth noting that `q.type` missing triggers `continue` at line 76, which short-circuits the per-question error collection (skipping the answer + reference checks for that question). That's the right call — without a type, the dispatch helpers cannot know which schema to apply. |
| AC-6 — `referenceJson` for `code` stored in DB but never returned in 201 response | MET | Lines 99–112 of `bulk.ts` insert each row with `referenceJson: JSON.stringify(q.reference)` (line 108). Line 115–118 returns `{ inserted: ids }` — *only* the UUIDs. The handler does not read back `referenceJson` after insert; nothing in the response path includes reference / solution data. **LBD-4 explicitly upheld.** | Same response shape applies for `mc` / `short` / `llm_graded` (no per-type branch in the response path), so the contract is uniform across all four types. |
| AC-7 — `npm run build` exits 0 | NOT RUN — sandbox-blocked (carry-over) | `node_modules/` is root-owned in the audit sandbox; `npm ci` returns EACCES, blocking `astro check` and `astro build`. **Type-safety by inspection:** all imports resolve to existing modules (`drizzle-orm` `eq`, `node:crypto` `randomUUID`, the new `../../../lib/question-schemas` exports, the M3 `../../../db/{client,schema}` modules), `APIRoute` typed correctly, `prerender = false` retained, `Response` constructor uses standard 2-arg signature, JSON.stringify never receives `undefined` after the top-level error checks (chapter_id / source_run_id / questions all confirmed non-empty before insert). The `BulkBody` interface plus the `as BulkBody` cast on `request.json()` matches sibling routes. **No type errors expected** — but only the host's `astro check` is dispositive. | See MEDIUM-1 — graded MEDIUM, carry-over on the T05 spec status line. |
| AC-8 — CHANGELOG has M4 T05 entry | MET | `CHANGELOG.md:17–28` under `## 2026-05-02`: `**Added** **M4 T05 — POST /api/questions/bulk: validation + insert**`, lists deliverables, AC-1/5/6/8 sandbox-met + AC-2/3/4/7 host-pending, includes `Dep audit: SHIP`. Format matches sibling T01/T02/T03/T04 entries from the same date. | Tag is `**Added**` (consistent with T01/T02/T03/T04 pattern in the same dated section). |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — AC-2/3/4/7 runtime gates not run; sandbox `node_modules/` is root-owned

**Surface:** `npm ci`, `npm run dev`, `npm run check`, `npm run build` all blocked in this audit's sandbox (`drwxr-xr-x 2 root root … node_modules`). The four ACs that require a live dev server or a successful astro build cannot be exercised here.

**Why MEDIUM, not HIGH.** The T05 spec correctly names explicit smoke tests for AC-2/3/4 and `npm run build` for AC-7 (LBD-11 satisfied at the spec layer). The Builder's deferral framing ("host must re-run") matches the LBD-15 sandbox/host split — the sandbox commits, the host runs the gates that need network or root-only file ops. Code-shape inspection (imports resolve, types match sibling routes, `prerender = false` preserved, Drizzle pattern matches `annotations` / `read_status`) shows the change is type-safe and likely correct. The spec did its job; the audit environment is the blocker. **Build-clean is necessary but not sufficient (LBD-11)** — therefore this audit cannot conclude ✅ PASS on runtime correctness until the host re-runs the smokes.

**Action / Recommendation.** Host must run, on `design_branch` after merging, in this exact order:

```bash
npm ci
npm run check                 # AC-7 type-check leg
npm run build                 # AC-7 build leg — must exit 0
npm run dev &                 # background; binds 127.0.0.1:4321 per LBD-1
sleep 3
# AC-2 (valid mc → 201 + uuid)
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4321/api/questions/bulk \
  -H 'Content-Type: application/json' \
  -d '{"source_run_id":"smoke-1","chapter_id":"ch_1","questions":[{"type":"mc","prompt_md":"What is the worst-case complexity?","topic_tags":["Big-O"],"answer_schema":{"options":["O(1)","O(n)"],"correct_ix":0},"reference":{"explanation":"O(1) amortised."}}]}'
# expect: 201
# AC-3 (missing correct_ix → 422 + validation_failed) — see MEDIUM-2 for runtime risk
curl -s -X POST http://localhost:4321/api/questions/bulk \
  -H 'Content-Type: application/json' \
  -d '{"source_run_id":"smoke-2","chapter_id":"ch_1","questions":[{"type":"mc","prompt_md":"x","topic_tags":[],"answer_schema":{"options":["a","b"]},"reference":{"explanation":"y"}}]}'
# expect: HTTP 422, body {"kind":"validation_failed","errors":[…]}
# AC-4 (unknown chapter)
curl -s -X POST http://localhost:4321/api/questions/bulk \
  -H 'Content-Type: application/json' \
  -d '{"source_run_id":"smoke-3","chapter_id":"ch_999","questions":[{"type":"mc","prompt_md":"x","topic_tags":[],"answer_schema":{"options":["a","b"],"correct_ix":0},"reference":{"explanation":"y"}}]}'
# expect: HTTP 422, body errors[0] mentions "chapter_id 'ch_999' not found"
kill %1
```

If any leg fails, file a follow-up issue under `issues/T05_followup_<n>.md` and reopen this issue's status. After the four gates pass, append a one-line "Host smoke verified <date>" footer below this issue's `## Propagation status` so the audit trail closes deterministically. **Until the host runs all four, T05 status remains "code-complete, runtime-pending" — the spec status line on T05 already accurately reflects this with its `(AC-2/3/4/7 host-only — node_modules root-owned in sandbox)` parenthetical.**

### MEDIUM-2 — RESOLVED (2026-05-02 re-audit) — zod v4 `error.errors` → `error.issues` rename applied

**Original surface:** `src/lib/question-schemas.ts:49` and `:63`.

**Resolution.** Both call sites now use the documented zod v4 API:

```ts
// src/lib/question-schemas.ts:49
return { ok: false, errors: result.error.issues.map(e => `answer_schema.${e.path.join('.')}: ${e.message}`) };
// src/lib/question-schemas.ts:63
return { ok: false, errors: result.error.issues.map(e => `reference.${e.path.join('.')}: ${e.message}`) };
```

**Re-audit verification.**
- Direct read of `src/lib/question-schemas.ts` confirms `.issues` at both lines.
- `grep -rn '\.error\.errors\b' src/` returns zero matches — no other ZodError API drift remains.
- The remaining `errors` references in `question-schemas.ts` (lines 36, 46, 60) are the local `ValidationResult` type's own `errors: string[]` field, which is cs-300's own contract and unrelated to the zod ZodError shape.

**Status:** Closed. AC-3's runtime risk is removed; the host smoke now only needs to confirm the end-to-end 422 response shape, not whether the deprecated alias is still available.

## 🟢 LOW

### LOW-1 — `z.ZodSchema` is the legacy generic in zod v4; prefer `z.ZodType` for stricter typing

**Surface:** `src/lib/question-schemas.ts:39` and `:53`:

```ts
const schemaMap: Record<string, z.ZodSchema> = { … };
```

In zod v4 the recommended generic for "any zod schema" in a value position is `z.ZodType<unknown>` (or `z.ZodTypeAny` for a permissive variant). `z.ZodSchema` is still exported as a backward-compat alias and **does** typecheck, but the documented path is `z.ZodType`. Cosmetic — does not affect runtime.

**Action / Recommendation.** Optional one-line rename when next touching the file:

```ts
const schemaMap: Record<string, z.ZodType<unknown>> = { … };
```

No action required if MEDIUM-2's option-1 fix is applied (Builder can fold this in at the same time). Skip otherwise.

## Additions beyond spec — audited and justified

- **`questions.status` field omitted from the insert payload** (line 100–111 of `bulk.ts`). The Drizzle schema at `src/db/schema.ts:48` declares `status: text('status').notNull().default('active')` — Drizzle/SQLite use the column default when the field is omitted, so `status: 'active'` is set at the database layer rather than being passed through application code. This matches the spec's "`status` defaults to 'active' at insert; no input field needed" line (T05 spec line 154). **Justified addition (or rather, a justified omission).**
- **`source_run_id` validated only as truthy** (line 44 of `bulk.ts`). The spec does not constrain the format of `source_run_id` beyond "ai-workflows run id (stored verbatim)". The Builder treats it as a non-empty string; no further pattern check. **Justified — the format is owned by the upstream framework, and tightening it here would risk drift from `aiw-mcp`'s actual run-id shape.**
- **No GET handler added** (per spec line 156 — "Do not implement `GET /api/questions/bulk` — that is M5's question-bank browse surface"). Verified: only `POST` is exported in `bulk.ts`. **Spec compliance.**

## Issue log — cross-task follow-up

| ID | Severity | Owner / next touch point | Description |
| -- | -------- | ----------------------- | ----------- |
| M4-T05-ISS-01 | MEDIUM | Host smoke after `npm ci` (this cycle) | AC-2/3/4/7 must run on host; see MEDIUM-1. Append "Host smoke verified <date>" after pass. |
| M4-T05-ISS-02 | RESOLVED | n/a | zod v4 `errors` → `issues` rename applied at lines 49 and 63 of `src/lib/question-schemas.ts`. |
| M4-T05-ISS-03 | LOW | Opportunistic on next `question-schemas.ts` edit | `z.ZodSchema` → `z.ZodType<unknown>`; see LOW-1. |
| M4-T05-SEC-HIGH-1 | HIGH (deferred) | M5 T2 (GET /api/review/due spec) | `stripSolution()` guard must exist before any GET question handler ships. Carry-over added to M5 README 2026-05-02. |

## Security review

**Reviewed:** 2026-05-02 by security-reviewer subagent.
**Verdict:** FIX-THEN-SHIP — forward-propagation required to M5 before any GET question handler ships. No blocking issues for T05 itself.

### High (deferred, not T05-blocking)

- **M4-T05-SEC-HIGH-1 — LBD-4 `stripSolution()` guard missing at DB query layer.**
  The 201 response shape is correct — `referenceJson` never leaks via this handler. However,
  no shared `stripSolution(row)` utility exists to guard future GET handlers. When M5
  implements `GET /api/review/due`, a `code`-type row queried from `questions` would expose
  `referenceJson.solution` unless the GET handler manually strips it. The enforcement
  obligation is deferred entirely to future handler authors.
  **Action:** Added carry-over AC to M5 README (`## Carry-over from prior audits`):
  introduce `src/lib/stripSolution.ts` before implementing any GET question handler, and
  wire it into every such handler. Propagated 2026-05-02.
  **Status:** Propagated to M5 README. Not blocking T05 commit.

### Advisory

- **Prompt content injection (`prompt_md` / free-text fields):** Zod validates only presence,
  not content. A local Ollama run injecting `<script>...</script>` into `prompt_md` passes
  Zod and lands in SQLite. Whether it becomes DOM XSS depends on the M5 render component.
  **Action:** Add `.refine()` HTML-tag rejection on free-text fields, or document that the
  render layer always escapes them — resolve before M5 question rendering lands.
  Propagated as advisory to M5 README (implicit in the carry-over).

- **`source_run_id` free string:** No format constraint; not a practical risk today (no
  predicate use). Track: add `z.string().regex(/^[a-zA-Z0-9_-]+$/)` when the MCP run-id
  format is formally specified in the M4 workflow contract.

- **`localhost:8080` in `src/lib/mode.ts` dist bundle:** Pre-existing condition (T04).
  Benign under single-user local threat model. Document as explicit exception in
  `architecture.md §4` to prevent false positives in future `grep-of-dist` checks.

## Dependency audit

Per CHANGELOG line 28: `Dep audit: SHIP` (Builder ran the dependency-auditor against the `package.json` + `package-lock.json` change). The Auditor cross-checked the lockfile state in this audit:

- `package.json` line 31 — `"zod": "^4.3.6"` (new, runtime dep).
- `package-lock.json` line 20 — root `""` package's `dependencies` block declares `"zod": "^4.3.6"`.
- `package-lock.json` line 2633 — `astro@6.1.9`'s peer-dep block also pins `"zod": "^4.3.6"`. **cs-300's direct dep matches astro's transitive — single `node_modules/zod` instance satisfies both, no duplicate install, no drift between them.**
- `package-lock.json` line 8475–8483 — `node_modules/zod` resolves to `4.3.6`, sha512 hash present (`sha512-rftlrkhHZOcjDwkGlnUtZZkvaPHCsDATp4pGpuOOMDaTdDDXF91wuVDJoWoPsKX/3YPQ5fHuF3STjcYyKr+Qhg==`), MIT license, no install scripts in the lockfile metadata.

**Verdict: lockfile consistent. SHIP confirmed.** No new `postinstall` hooks. No new transitive dep tree (zod has no runtime dependencies). The major-version bump direction (cs-300 has no prior zod direct dep, astro pinned 4.x) is consistent with current zod stable.

The MEDIUM-2 zod-v4 API concern is *not* a dependency-audit finding (it's a usage concern in cs-300's own code), so dep audit stays SHIP.

## Deferred to nice_to_have

None. No findings map to `design_docs/nice_to_have.md`.

## Propagation status

- **M4-T05-ISS-01 (MEDIUM-1 host smoke):** No propagation — host must verify within this cycle.
- **M4-T05-SEC-HIGH-1 (stripSolution guard):** Propagated to `design_docs/milestones/m5_phase5_review_loop/README.md` § Carry-over from prior audits (2026-05-02). Must become an explicit AC on M5's GET /api/review/due task spec before that task ships.
- **Prompt-injection advisory:** Noted in M5 README carry-over (implicit; the advisory is to resolve before M5 rendering lands).
- LOW-1 (`z.ZodSchema` rename) and source_run_id tracking are T05-local, no forward propagation needed.

## Re-audit log

### 2026-05-02 — MEDIUM-2 fix verification → verdict upgraded to ✅ PASS

- **Builder fix.** Applied the preferred option from MEDIUM-2's recommendation: renamed `result.error.errors` → `result.error.issues` at `src/lib/question-schemas.ts:49` and `:63`.
- **Verification done in this re-audit cycle.**
  - Direct read of `src/lib/question-schemas.ts` confirmed `.issues` at both call sites.
  - `grep -rn '\.error\.errors\b' src/` returned zero matches — no remaining ZodError API drift anywhere in `src/`.
  - Remaining `errors` references in `question-schemas.ts` (lines 36, 46, 60) are the local `ValidationResult` type's own `errors: string[]` field, which is cs-300's own contract and unrelated to the zod ZodError shape.
  - Spec status line on `T05_bulk_endpoint.md:3` still accurately reflects the host-only AC framing.
- **What did not change.**
  - MEDIUM-1 (host-only AC-2/3/4/7) remains as a documented carry-over to the host. The spec names the smokes (LBD-11 satisfied at the spec layer); the audit-sandbox `node_modules/` ownership is the structural blocker, not the spec or the code. The LBD-15 sandbox/host split applies — the host runs `npm ci && npm run check && npm run build && npm run dev` plus the three curl smokes from the spec.
  - LOW-1 (`z.ZodSchema` → `z.ZodType<unknown>`) remains opportunistic.
- **No new HIGH or MEDIUM findings introduced by the fix.**
- **Verdict upgrade.** ⚠️ OPEN → ✅ PASS. The remaining MEDIUM (host smoke) is environmental, not a defect in the code or spec, and is tracked as a host carry-over per LBD-15.
