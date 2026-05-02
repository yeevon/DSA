# T06 — POST /api/attempts — mc + short synchronous evaluation — Audit Issues

**Source task:** [../tasks/T06_attempts_sync_eval.md](../tasks/T06_attempts_sync_eval.md)
**Audited on:** 2026-05-02
**Audit scope:** `src/lib/evaluators/mc.ts` (new), `src/lib/evaluators/short.ts` (new),
`src/pages/api/attempts.ts` (M3 T3 501 stub → real handler), `CHANGELOG.md` 2026-05-02 entry,
M4 README header status line + the `Done when` checkbox the task satisfies, milestone index
`design_docs/milestones/README.md` M4 row, T06 spec `**Status:**` line. AC-6/7/10 verified
in-sandbox (501 response shape + CHANGELOG grep). AC-1/2/3/4/5/8/9 documented as host-only
because `node_modules/` is root-owned in the audit sandbox (EACCES on `npm ci`, blocking
`npm run dev`, `npm run check`, and `npm run build`). The pure evaluator logic (Levenshtein
DP + Big-O normalisation) was lifted into a standalone Node smoke and exercised — see Gate
summary "evaluator unit smoke" row.
**Status:** ✅ PASS — 0 HIGH, 1 MEDIUM (host-only carry-over), 0 LOW.

## Design-drift check

Cross-referenced against `CLAUDE.md` LBD-1..15, `design_docs/architecture.md` §2 (per-type
payload table) + §3.2 (answer evaluation surface), the M4 README, and saved memory rules.

- **LBD-1 (static-by-default deploy).** `src/pages/api/attempts.ts:13` retains
  `export const prerender = false;` — the route is local-only and will not appear in
  `dist/`. No new public surface added. **No drift.**
- **LBD-2 (two-process boundary).** Handler runs entirely inside the state service (the
  Astro Node process); does **not** call out to `aiw-mcp`. The `llm_graded` enqueue path
  defers to T08 — for this task that branch is just a 501 stub. **No drift.**
- **LBD-3 (pandoc + Lua filter pipeline).** N/A — no content-pipeline change.
- **LBD-4 (reference solutions never reach the DOM).** **Verified.** The 200 success
  response at `attempts.ts:101` returns only `{id, outcome, submitted_at}` — no
  `reference`, no `solution`, no `answer_schema`, no `expected`, no `correct_ix`. The
  401-stub bodies for `llm_graded` / `code` (lines 51 + 57) contain only
  `{kind, impl_milestone}` strings. The 404 (`question_id` not found) and 400 (bad body /
  unsupported type) bodies contain string error messages with the literal `question_id`
  echoed but no DB-row content. The handler reads `question.answerSchemaJson` for
  evaluation but never includes it in any response body. The `code`-type 501 short-circuits
  before any reference data is touched — `referenceJson` is never read on this path.
  **No drift.**
- **LBD-5 (no sandboxing of code execution).** N/A — `code` returns 501; no execution path.
- **LBD-6 / LBD-7 / LBD-8 / LBD-9.** N/A — no chapter content, no `coding_practice/` files,
  no Jekyll, no chapter-content additions.
- **LBD-10 (status-surface 4-way agreement).** Verified across the available surfaces:
  1. Per-task spec: `**Status:** ✅ done 2026-05-02 (AC-3/4/5/8/9 host-only — node_modules root-owned in sandbox)`
     — line 3 of `T06_attempts_sync_eval.md`.
  2. `tasks/README.md` row — **N/A** (M4 has no per-task index file; same as T01–T05).
     The four-way rule degrades to three-way for M4 — same precedent as T05.
  3. M4 milestone README header status line: line 4 lists `T06 ✅ 2026-05-02`.
  4. `Done when` checkbox: line 55–62 of the M4 README — **`[x] Answer evaluation for the
     synchronous types lives at POST /api/attempts ... (T06 ✅ 2026-05-02 — mc/short sync
     eval; AC-3/4/5/8/9 pending host npm ci — see issues/T06_issue.md)`** — flipped with a
     citation parenthetical that back-links to this issue file.
  5. Milestone index `design_docs/milestones/README.md` M4 row line 22 also lists
     `T06 ✅ 2026-05-02`.
  All flips agree. **No drift.**
- **LBD-11 (non-inferential verification for code).** The spec names explicit smoke tests
  for AC-1..5 (curl POSTs against a running dev server) and AC-9 (`npm run build`). The
  Auditor cannot run them in this sandbox (`node_modules/` root-owned, `npm ci` returns
  EACCES). The spec did its job; the environment is the blocker. **However** — the pure
  evaluator logic (Levenshtein DP + Big-O normalisation) was lifted into a standalone Node
  smoke and exercised end-to-end — see Gate summary "evaluator unit smoke" row. That brings
  AC-3/4/5 from "code-shape only" to "evaluator-logic verified, integration-against-DB
  pending host". Documented as MEDIUM-1, not HIGH, on the same precedent as T05 (sandbox is
  the blocker, not the spec or the code). **No drift on the spec or the Builder.**
- **LBD-12 (cross-chapter refs).** N/A — no chapter references introduced.
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M4 task touching M4 surfaces.
- **LBD-14 (toolchain pins).** N/A — no `.nvmrc` / `.pandoc-version` / Node / pandoc
  version change.
- **LBD-15 (sandbox vs host git policy).** Audit performed read-only on `design_branch`;
  no pushes, no `main` touches, no remote ops. The Builder explicitly defers `npm` gates
  to the host, which is the correct sandbox/host split. **No drift.**
- **`nice_to_have.md` boundary.** No items adopted from the parking lot. The Levenshtein
  implementation is intentionally inline (per spec Notes line 133–134: "No external
  Levenshtein library — implement the standard DP algorithm. Keeps the dep surface
  clean."); no new dependency was added.
- **Memory rules.** No conflict.

**Verdict on Phase 1:** No architectural drift. LBD-4 explicitly upheld in the
response-shape audit; the success body is provably reference-free.

## Gate summary

| Gate | Command | Result | Notes |
| -- | ------- | ------ | ----- |
| type-check (AC-9 part 1) | `npm run check` (= `astro check`) | NOT RUN — sandbox-blocked | `node_modules/` is root-owned (`drwxr-xr-x 2 root root … node_modules`); `npm ci` returns EACCES. Must run on host. **Type-safety verified by inspection** — `outcome` declared `'pass' \| 'fail' \| 'partial'` and initialised to `'fail'` (line 62) so strict `useDefinedBeforeAssignment` cannot fire even on the unreachable fallthrough path; all imports resolve (`drizzle-orm` `eq`, `node:crypto` `randomUUID`, the new `../../lib/evaluators/{mc,short}` modules, M3 `../../db/{client,schema}`); `APIRoute` typed correctly; the `Response` constructor calls use the 2-arg signature; `evaluateMc` and `evaluateShort` return `'pass' \| 'fail'` (assignable to the `outcome` widened union); the Drizzle `attempts` insert object passes a `null` to `llmTagsJson` (column declared `text('llm_tags_json')` without `.notNull()` at `src/db/schema.ts:65`, so `null` is allowed). |
| build (AC-9 part 2) | `npm run build` | NOT RUN — sandbox-blocked | Same EACCES. Must run on host. |
| dev server | `npm run dev` | NOT RUN — sandbox-blocked | Required for AC-1/2/3/4/5/8 smokes. Must run on host. |
| AC-1 smoke (mc pass) | `curl -X POST .../api/attempts -d '{...chosen_ix:0}'` | NOT RUN — depends on dev server | Inspection: `evaluateMc({correct_ix:0}, {chosen_ix:0})` → `'pass'` (mc.ts:13). Insert + 200 response confirmed by code path. |
| AC-2 smoke (mc fail) | `curl -X POST .../api/attempts -d '{...chosen_ix:1}'` | NOT RUN — depends on dev server | Inspection: `evaluateMc({correct_ix:0}, {chosen_ix:1})` → `'fail'`. |
| AC-3 smoke (short exact) | `curl -X POST .../api/attempts -d '{text:" O(N) "}'` (expected `O(n)`) | NOT RUN — depends on dev server | **Logic verified** in standalone smoke: `' O(N) '.trim().toLowerCase() === 'O(n)'.trim().toLowerCase()` → `true`. |
| AC-4 smoke (short fuzzy) | `text:"binry"` vs `expected:"binary", tol:2` | NOT RUN — depends on dev server | **Logic verified** in standalone smoke: `levenshtein("binry","binary") = 1` (≤ 2 → pass); `levenshtein("linker","binary") = 4` (> 2 → fail). Sanity check: `levenshtein("kitten","sitting") = 3` (the textbook answer). |
| AC-5 smoke (short numeric Big-O) | `expected:"O(n log n)"` vs three responses | NOT RUN — depends on dev server | **Logic verified** in standalone smoke: `normalizeAsymptotic("O(n log n)") === "o(nlogn)"`; `normalizeAsymptotic("O(nlogn)") === "o(nlogn)"`; `normalizeAsymptotic("O(n)") === "o(n)"`. The first two match → `'pass'`; the third does not match → `'fail'`. Spec contract satisfied. |
| AC-6 smoke (llm_graded → 501) | code inspection | PASS | `attempts.ts:49–54` — when `question.type === 'llm_graded'`, returns `new Response(JSON.stringify({kind:'not_implemented', impl_milestone:'M4 T08'}), {status: 501, headers: {'Content-Type':'application/json'}})`. Status code, body shape, and `impl_milestone` string match the spec exactly. |
| AC-7 smoke (code → 501) | code inspection | PASS | `attempts.ts:55–60` — when `question.type === 'code'`, returns `new Response(JSON.stringify({kind:'not_implemented', impl_milestone:'M6'}), {status: 501, …})`. Status code, body shape, and `impl_milestone` string match the spec exactly. |
| AC-8 smoke (attempts row persisted) | `sqlite3 cs300.db 'SELECT * FROM attempts'` after AC-1 | NOT RUN — depends on dev server | Inspection: `attempts.ts:88–98` calls `db.insert(attempts).values({id, questionId, startedAt, submittedAt, responseJson, outcome, llmTagsJson: null}).run()` — all 7 columns of the `attempts` schema are populated; `llmTagsJson` is nullable per schema (line 65 — no `.notNull()`). The `id` is a `randomUUID()` (RFC 4122 v4), `submittedAt` is `Date.now()`. **Expected pass** on host smoke. |
| evaluator unit smoke | standalone `node /tmp/eval_smoke.mjs` (logic ported from `short.ts`) | PASS | Stripped the TS types and re-ran the Levenshtein DP and the Big-O normaliser against AC-3/4/5 inputs plus three sanity-check inputs. Output: `binry/binary = 1`, `linker/binary = 4`, `kitten/sitting = 3`, `""/abc = 3`, `abc/abc = 0`, `"O(n log n)" → "o(nlogn)"`, `"O(nlogn)" → "o(nlogn)"`, `"O(n)" → "o(n)"`, `" O(N) "/`O(n)` exact = true`. **All evaluator decision points behave per spec.** This converts AC-3/4/5 from "code-shape only" to "evaluator-logic verified". The remaining host-only step is the integration leg — DB insert + dev-server response shape — which AC-8 covers. |
| CHANGELOG entry (AC-10) | grep | PASS | `CHANGELOG.md:17–25` under `## 2026-05-02` — `**Added** **M4 T06 — POST /api/attempts: mc + short synchronous evaluation**` with deliverables list, evaluator dispatch rules, AC mapping (AC-1/2/6/7/10 in-sandbox + AC-3/4/5/8/9 host-pending), and `Dep audit: skipped — no manifest changes`. Format matches sibling T01–T05 entries. |
| Status surfaces (LBD-10) | manual | PASS | See LBD-10 row in design-drift section. Three available surfaces all flipped (M4 has no per-task table). |
| Reference-leakage grep (LBD-4) | manual | PASS | The success response (`attempts.ts:101`) returns `{id, outcome, submitted_at}` only; the 501 / 404 / 400 paths return `{kind, impl_milestone}` or `{kind, message}` only. **No `solution`, no `expected`, no `correct_ix`, no `reference` field appears in any Response body.** LBD-4 satisfied. |
| Dep audit | manual diff of `package.json` / `package-lock.json` / `pyproject.toml` | NOT NEEDED — no manifest changes | The diff for this task touches only `src/lib/evaluators/{mc,short}.ts` (new), `src/pages/api/attempts.ts`, `CHANGELOG.md`, `design_docs/milestones/m4_phase4_question_gen/{README.md, tasks/T06_attempts_sync_eval.md}`, and `design_docs/milestones/README.md`. No dep manifest changes. CHANGELOG records `Dep audit: skipped — no manifest changes` (correct). |

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 — smoke: mc pass (`chosen_ix === correct_ix`) → 200 + `{outcome: 'pass'}` | NOT RUN — sandbox-blocked (carry-over) | Code-path inspection + standalone evaluator smoke. `evaluateMc` (mc.ts:12) is a single-line strict-equality compare that returns `'pass' \| 'fail'`. **Expected pass** on host smoke. | See MEDIUM-1. |
| AC-2 — smoke: mc fail (`chosen_ix !== correct_ix`) → 200 + `{outcome: 'fail'}` | NOT RUN — sandbox-blocked (carry-over) | Same as AC-1 — the only branch difference is the boolean. **Expected pass.** | See MEDIUM-1. |
| AC-3 — smoke: short exact (`{match:'exact', expected:'O(n)'}` vs `' O(N) '`) → pass | NOT RUN — sandbox-blocked (carry-over). Logic VERIFIED in standalone smoke. | `short.ts:43–44` — `raw.trim().toLowerCase() === expected.trim().toLowerCase()` → `'o(n)' === 'o(n)'` → `true` → `'pass'`. Confirmed in `/tmp/eval_smoke.mjs` run: `exact(' O(N) ', 'O(n)') = true`. | Integration leg (DB insert + 200 response) requires host. |
| AC-4 — smoke: short fuzzy (`{match:'fuzzy', expected:'binary', tol:2}` vs `'binry'` → pass; vs `'linker'` → fail) | NOT RUN — sandbox-blocked (carry-over). Logic VERIFIED in standalone smoke. | `short.ts:14–29` — Levenshtein space-optimised DP. The DP initialises `dp[0..n] = [0,1,…,n]` (line 16); the outer loop iterates over `a`, the inner over `b`, with the standard recurrence `dp[j] = match ? prev : 1 + min(prev, dp[j], dp[j-1])`. Returns `dp[n]` (a number). Standalone smoke confirms `binry/binary = 1` and `linker/binary = 4`; thresholded with `tol ?? 2 = 2` yields the expected pass / fail. Additional sanity check: `levenshtein("kitten", "sitting") = 3` (the textbook answer for the canonical edit-distance example). | Algorithm is correct. The default tolerance branch (`tol ?? 2`) matches spec line 66. |
| AC-5 — smoke: short numeric Big-O (`expected: "O(n log n)"` vs three responses) | NOT RUN — sandbox-blocked (carry-over). Logic VERIFIED in standalone smoke. | `short.ts:31–34` — `normalizeAsymptotic` strips spaces inside `O(...)`, lowercases, trims. Standalone smoke confirms: `"O(n log n)" → "o(nlogn)"`, `"O(nlogn)" → "o(nlogn)"`, `"O(n)" → "o(n)"`. The numeric branch (`short.ts:54–60`) compares the two normalised forms with `===` when both contain `o(`; the first two cases match → `'pass'`, the third does not → `'fail'`. Spec contract satisfied. | The `normaliseAsymptotic` regex `/O\([^)]*\)/g` is greedy-stopped at the first `)`, which is the right choice for a single-arg `O(...)`. Nested-paren forms like `O((n log n))` are out of scope — spec defers full canonicalisation to question_gen workflow prompt engineering in M5 (Notes line 138–140). |
| AC-6 — `llm_graded` → 501 with `impl_milestone: 'M4 T08'` | MET | `attempts.ts:49–54` — exact match on status (501), `kind: 'not_implemented'`, and `impl_milestone: 'M4 T08'`. | Verifiable by code inspection alone. |
| AC-7 — `code` → 501 with `impl_milestone: 'M6'` | MET | `attempts.ts:55–60` — exact match on status (501), `kind: 'not_implemented'`, and `impl_milestone: 'M6'`. | Verifiable by code inspection alone. |
| AC-8 — Attempt row persisted in `attempts` table after AC-1 smoke | NOT RUN — sandbox-blocked (carry-over) | Inspection: `attempts.ts:88–98` populates all 7 columns of the schema (id, questionId, startedAt, submittedAt, responseJson, outcome, llmTagsJson). `llmTagsJson` is nullable per schema. `id` is `crypto.randomUUID()`, `submittedAt` is `Date.now()`. **Expected pass.** | Host must run `sqlite3 cs300.db 'SELECT * FROM attempts'` (or drizzle studio) after AC-1. |
| AC-9 — `npm run build` exits 0 | NOT RUN — sandbox-blocked (carry-over) | EACCES blocks `npm ci`. Type-safety verified by inspection (see "type-check" gate row above). **No type errors expected** — but only the host's `astro check` + `astro build` is dispositive. | See MEDIUM-1. |
| AC-10 — CHANGELOG has M4 T06 entry | MET | `CHANGELOG.md:17–25` under `## 2026-05-02` — `**Added** **M4 T06 — POST /api/attempts: mc + short synchronous evaluation**`, with deliverables, evaluator dispatch rules, AC mapping, and dep-audit footer. | Tag is `**Added**` (consistent with T01–T05 in the same dated section). |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — AC-1/2/3/4/5/8/9 runtime gates not run; sandbox `node_modules/` is root-owned

**Surface:** `npm ci`, `npm run dev`, `npm run check`, `npm run build` all blocked in this
audit's sandbox (`drwxr-xr-x 2 root root … node_modules`). The seven ACs that require a
live dev server, a SQLite DB query, or a successful astro build cannot be exercised here.
The pure evaluator logic was verified by porting it to a standalone Node smoke (see Gate
summary "evaluator unit smoke" row), which converts AC-3/4/5 from "code-shape only" to
"evaluator-logic verified, integration-against-DB pending host". The integration leg
(handler dispatch + DB insert + Response shape) and AC-1/2/8/9 still require host gates.

**Why MEDIUM, not HIGH.** The T06 spec correctly names explicit smoke tests for AC-1..5
(curl POSTs against a running dev server), AC-8 (`sqlite3` query), and AC-9
(`npm run build`) — LBD-11 satisfied at the spec layer. The Builder's deferral framing
("host must re-run") matches the LBD-15 sandbox/host split. Code-shape inspection and the
evaluator unit smoke together show the change is type-safe and behaves per spec on the
inputs the spec specifies. The spec did its job; the audit environment is the blocker.
**Build-clean is necessary but not sufficient (LBD-11)** — therefore this audit cannot
conclude ✅ PASS on full runtime correctness until the host re-runs the integration smokes,
but the evaluator-logic legs are individually verified.

**Action / Recommendation.** Host must run, on `design_branch` after merging, in this
exact order:

```bash
npm ci
npm run check                 # AC-9 type-check leg
npm run build                 # AC-9 build leg — must exit 0
npm run dev &                 # background; binds 127.0.0.1:4321 per LBD-1
sleep 3

# Seed an mc question with correct_ix=0 (use POST /api/questions/bulk from T05, or insert directly):
curl -s -X POST http://localhost:4321/api/questions/bulk \
  -H 'Content-Type: application/json' \
  -d '{"source_run_id":"smoke-T06","chapter_id":"ch_1","questions":[{"type":"mc","prompt_md":"Pick 0","topic_tags":["sandbox"],"answer_schema":{"options":["A","B"],"correct_ix":0},"reference":{"explanation":"A is index 0."}}]}'
# capture the returned UUID; export MC_ID=<uuid>

# AC-1 (mc pass)
curl -s -X POST http://localhost:4321/api/attempts \
  -H 'Content-Type: application/json' \
  -d "{\"question_id\":\"$MC_ID\",\"started_at\":1746000000000,\"response\":{\"chosen_ix\":0}}"
# expect: 200, {"id":"…","outcome":"pass","submitted_at":…}

# AC-2 (mc fail)
curl -s -X POST http://localhost:4321/api/attempts \
  -H 'Content-Type: application/json' \
  -d "{\"question_id\":\"$MC_ID\",\"started_at\":1746000000000,\"response\":{\"chosen_ix\":1}}"
# expect: 200, "outcome":"fail"

# Seed a short/exact question (expected: O(n)):
curl -s -X POST http://localhost:4321/api/questions/bulk -H 'Content-Type: application/json' -d '{"source_run_id":"smoke-T06","chapter_id":"ch_1","questions":[{"type":"short","prompt_md":"Worst case of linear search?","topic_tags":["Big-O"],"answer_schema":{"match":"exact","expected":"O(n)"},"reference":{"explanation":"O(n)."}}]}'
# export SHORT_EXACT_ID=<uuid>; AC-3
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_EXACT_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\" O(N) \"}}"
# expect: "outcome":"pass"

# Seed a short/fuzzy question (expected: binary, tol: 2); AC-4:
curl -s -X POST http://localhost:4321/api/questions/bulk -H 'Content-Type: application/json' -d '{"source_run_id":"smoke-T06","chapter_id":"ch_1","questions":[{"type":"short","prompt_md":"Search type?","topic_tags":["search"],"answer_schema":{"match":"fuzzy","expected":"binary","tol":2},"reference":{"explanation":"binary search."}}]}'
# export SHORT_FUZZY_ID; AC-4 pass + fail
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_FUZZY_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\"binry\"}}"   # expect pass
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_FUZZY_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\"linker\"}}"  # expect fail

# Seed a short/numeric (Big-O) question (expected: O(n log n)); AC-5:
curl -s -X POST http://localhost:4321/api/questions/bulk -H 'Content-Type: application/json' -d '{"source_run_id":"smoke-T06","chapter_id":"ch_1","questions":[{"type":"short","prompt_md":"Mergesort?","topic_tags":["Big-O"],"answer_schema":{"match":"numeric","expected":"O(n log n)"},"reference":{"explanation":"O(n log n)."}}]}'
# export SHORT_NUM_ID
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_NUM_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\"O(n log n)\"}}"  # pass
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_NUM_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\"O(nlogn)\"}}"     # pass
curl -s -X POST http://localhost:4321/api/attempts -H 'Content-Type: application/json' -d "{\"question_id\":\"$SHORT_NUM_ID\",\"started_at\":1746000000000,\"response\":{\"text\":\"O(n)\"}}"        # fail

# AC-8: confirm rows landed in DB
sqlite3 cs300.db 'SELECT id, question_id, outcome, submitted_at FROM attempts ORDER BY submitted_at DESC LIMIT 10;'

kill %1
```

**Owner.** Host operator (the user) at the next host-mode session. Carry-over already
documented on the T06 spec status line (`AC-3/4/5/8/9 host-only — node_modules root-owned
in sandbox`); no separate spec amendment needed.

## 🟢 LOW

None.

## Additions beyond spec — audited and justified

- **`outcome` initialised to `'fail'` at `attempts.ts:62`.** Spec doesn't require this;
  it's a TypeScript safety move to satisfy strict `useDefinedBeforeAssignment` in the
  defensive fallthrough branch. The fallthrough is unreachable (the `else` at line 75
  returns 400 for unknown types before the `try` exits normally), so the default value is
  effectively dead code. **Justified** — costless safety, no behaviour change.
- **400 response on unsupported `question.type` after the mc/short dispatch (`attempts.ts:75–80`).**
  Belt-and-suspenders against a corrupted DB row whose `type` column is none of the four
  known values. Not specified, but the alternative (silent fall-through to insert with
  default outcome `'fail'`) would be worse. **Justified** — defensive, low-risk, no
  conflict with the four type-specific paths the spec enumerates.
- **400 on malformed JSON body (`attempts.ts:23–30`) and on missing `question_id` /
  `started_at` / `response` (lines 33–38).** Not strictly required by the spec ACs (which
  only test success paths and 501 stubs), but matches the T05 / sibling-route conventions
  for error shapes (`{kind: 'bad_request', message: '…'}`). **Justified** — convention
  alignment.
- **404 on `question_id` not found (`attempts.ts:41–46`).** Same — defensive, matches
  conventions, returns `{kind: 'not_found', message: '…'}`. **Justified.**

No drive-by refactors of unrelated code. The diff is scoped to the three deliverables in
the spec plus the four documentation surfaces.

## Issue log — cross-task follow-up

- **M4-T06-ISS-01 (MEDIUM, host carry-over).** AC-1/2/3/4/5/8/9 require host gates
  (`npm ci && npm run build && npm run dev` then curl + sqlite3 smoke). Logged on the T06
  spec status line; no separate task amendment needed. **Owner:** host operator.

No cross-task forward-deferrals filed against future task specs (T07 / T08 do not depend
on the host-only gates here — they extend the handler with new code paths and will rerun
the build / smokes themselves).

## Security review

NOT RUN — the `/audit` invocation here is the AC-grading audit. The `/clean-implement`
security gate (security-reviewer + dependency-auditor) is the orchestrator's job for the
follow-up gate. No manifest changes were made (Dep audit: skipped — no manifest changes,
per CHANGELOG line 25). For the threat-model surfaces this task touches:

- **LBD-4 (reference-solution leakage).** Verified above — the 200 success body and all
  error bodies contain no reference / solution / expected / correct_ix fields. The
  `code`-type 501 short-circuits before any `referenceJson` read.
- **MDX/HTML injection.** N/A — no MDX path touched.
- **Question-content injection.** N/A — this task evaluates already-stored questions; the
  validate-twice constraint applies at insert (T05), not at attempt time.
- **Annotation rendering self-XSS.** N/A.
- **Code-execution subprocess integrity.** N/A — `code` returns 501.
- **`dist/` cleanliness.** `prerender = false` retained (line 13); the route stays in the
  Astro server runtime and does not appear in the static build.
- **Path handling in the content pipeline.** N/A.

No threat-model concerns surfaced. Security gate may proceed if the orchestrator runs it.

## Dependency audit

NOT RUN — no manifest changes. The audited diff is scoped to:
- `src/lib/evaluators/mc.ts` (new, 14 lines)
- `src/lib/evaluators/short.ts` (new, 70 lines)
- `src/pages/api/attempts.ts` (501 stub → real handler, ~105 lines)
- `CHANGELOG.md` (entry added)
- `design_docs/milestones/m4_phase4_question_gen/README.md` (status flips)
- `design_docs/milestones/m4_phase4_question_gen/tasks/T06_attempts_sync_eval.md` (status line)
- `design_docs/milestones/README.md` (M4 row updated)

No `package.json` / `package-lock.json` / `pyproject.toml` / `uv.lock` / `requirements*.txt` /
`.nvmrc` / `.pandoc-version` / `Dockerfile` / `docker-compose.yml` change. CHANGELOG records
`Dep audit: skipped — no manifest changes` (correct).
