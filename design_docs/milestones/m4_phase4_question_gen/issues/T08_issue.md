# T08 — llm_graded async flow — Audit Issues

**Source task:** [../tasks/T08_llm_graded_async.md](../tasks/T08_llm_graded_async.md)
**Audited on:** 2026-05-02
**Audit scope:** Source review of `src/db/schema.ts`, `src/lib/aiw-client.ts`, `src/pages/api/attempts.ts`, `src/pages/api/attempts/[id]/outcome.ts` (new nested dynamic route), `src/components/questions/QuestionGenButton.astro`; CHANGELOG; status-surface 4-way (per-task spec / M4 README status header / M4 README Done-when checkbox / root milestones index); inter-task contract check against T03's `grade` workflow inputs (`attempt_id`, `question_prompt_md`, `rubric_criteria`, `response_text`) and T07's polling pattern; T07 MED-1 carry-over (`pollUntilDone` helper) closure; LBD-4 leakage check on PATCH 200 body; LBD-15 sandbox-vs-host gate accounting.
**Status:** ✅ PASS — host-only ACs (AC-1 full Ollama loop, AC-6 build) recorded as carry-over per LBD-15; T07 MED-1 carry-over closed by extraction of `pollUntilDone` and conversion of `QuestionGenButton.astro`.

## Design-drift check

- **LBD-1 (static-by-default deploy).** No new dependency, no `.env` reading, no API routes leaked into `dist/`. The new `attempts/[id]/outcome.ts` route lives under `src/pages/api/`, has `prerender = false`, and is therefore not emitted into `dist/` (M3 + M4 precedent). The grade workflow is enqueued from a server-side handler (`src/pages/api/attempts.ts`), so the only client-side `fetch` paths are PATCH `/api/attempts/<id>/outcome` (same-origin state service) and `pollUntilDone` (against `localhost:8080` aiw-mcp — pre-existing T07 pattern, accepted as `data-interactive-only`-gated). ✅
- **LBD-2 (two-process boundary).** `attempts.ts` calls `runWorkflow('grade', …)` against `aiw-mcp` for the LLM step and writes the attempt row to its own SQLite (state service) before and after. Workflow logic stays in `cs300/workflows/grade.py` (T03 surface); the API route is an enqueue-and-store seam, not a workflow re-implementation. No fork or monkey-patch of `jmdl-ai-workflows`. ✅
- **LBD-3 (Lua filter / content pipeline).** N/A — no `.tex`, no Lua filter, no chapter content touched.
- **LBD-4 (reference solutions never reach DOM).** PATCH `200` body is `{ id, outcome }` only — no `score`, no `feedback`, no `solution` echoed back (`outcome.ts:71-74`). Server-side `attempts.ts` POST `200` body is `{ id, outcome:'pending', grade_run_id }` for the live path and `{ id, outcome:'fail', error:'grade_unavailable' }` on aiw-mcp failure — none of these include reference data. The grade-workflow inputs sent to aiw-mcp (`question_prompt_md`, `rubric_criteria`, `response_text`) are not solution payloads — `rubric_criteria` is the rubric stored in `answerSchemaJson`, which is never the `referenceJson` blob. ✅
- **LBD-5 (no sandboxing).** N/A — not a code-execution surface.
- **LBD-6 / LBD-7 (chapter ceiling / additions).** N/A — no chapter content change.
- **LBD-8 (no Jekyll polish).** N/A.
- **LBD-9 (`coding_practice/` boundary).** N/A — not touched.
- **LBD-10 (status-surface 4-way agreement at task close).** Verified across the three available surfaces (M4 has no per-milestone `tasks/README.md` task-table — confirmed by `ls`, no such file exists, so the rule reduces to 3-way for M4):
  1. Per-task spec `**Status:**` line (`tasks/T08_llm_graded_async.md:3`): `✅ done 2026-05-02 (AC-1 Ollama loop + AC-6 build host-only; host must run drizzle-kit push for schema migration)` — flipped.
  2. M4 README status header line (`m4_phase4_question_gen/README.md:4`): `T08 ✅ 2026-05-02` — flipped, milestone marked `✅ done 2026-05-02 — T01 through T08 complete`.
  3. M4 README Done-when checkbox `[ ] llm_graded evaluation flow created` (line 65–69): flipped to `[x]` with citation parenthetical pointing at this issue file (`T08 ✅ 2026-05-02 — async flow + PATCH outcome route + pollUntilDone helper; AC-1 Ollama loop + AC-6 build host-only — see [issues/T08_issue.md]`).
  4. Root `design_docs/milestones/README.md` M4 row (line 22): `T08 ✅ 2026-05-02; jmdl-ai-workflows v0.4.0 WorkflowSpec unblocked all convention-hooks; T08 closed llm_graded async flow` — flipped, M4 status now `✅ done 2026-05-02`.
  All consistent. ✅
- **LBD-11 (non-inferential verification).** Source-level ACs (AC-2, AC-3, AC-4, AC-5, AC-7) verified by direct file inspection with line citations below. Build / runtime ACs (AC-1 full Ollama loop, AC-6 `npm run build`) recorded as NOT RUN with explicit blockers (`node_modules` empty + root-owned in sandbox; Ollama loop requires aiw-mcp + Ollama on host). No AC graded MET on the basis of "the build is clean". The Builder did not infer correctness from build success. ✅
- **LBD-12 (cross-chapter refs).** N/A.
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M4 is post-Phase-1.
- **LBD-14 (toolchain pins).** N/A — `.nvmrc` and `.pandoc-version` unmodified.
- **LBD-15 (sandbox-vs-host git policy).** Audit phase, no commits attempted. Branch is `design_branch` per policy. ✅
- **No new dependency** — `git status` snapshot at audit start shows no diff in `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`. Pure source-only addition. Dep audit gate not required.
- **architecture.md §3.5 (`assess.py` topic-tagging).** Explicitly out of scope for M4 per task spec note line 134–136 — implementation correctly does not extend `llmTagsJson` semantics beyond `{score, feedback}`. M5 still owns assess. The column comment in `schema.ts:65` is updated to reflect this dual purpose ("grading score+feedback (M4) or topic tags (M5)"), preserving the architectural seam. ✅

No design drift detected.

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 (smoke — full async loop, Ollama-driven) | NOT RUN — host-only | `attempts.ts:57-98` end-to-end shape verified by inspection: insert pending → `runWorkflow('grade', …)` → store `gradeRunId` → return `{id, outcome:'pending', grade_run_id}`. PATCH route at `outcome.ts:19-75` accepts the manual update path the spec calls out as the "AC-1 alt" if Ollama is absent — that part is verifiable in-sandbox by source review and is correct. | The full live loop (POST → poll `getRunStatus` → PATCH → DB row) requires `bash scripts/aiw-mcp.sh` + Ollama Qwen 14B + `npm run dev` — all host-only per LBD-15. **Host carry-over: M4-T08-HOST-01.** |
| AC-2 (PATCH returns 404 for unknown id) | MET | `outcome.ts:46-52` — `db.select().from(attempts).where(eq(attempts.id, id)).all()`; `if (rows.length === 0)` returns `404` with body `{ kind: 'not_found', message: "attempt '<id>' not found" }`. | Source-level. |
| AC-3 (PATCH idempotent-guarded — 409 on already-resolved) | MET | `outcome.ts:55-61` — `if (attempt.outcome !== 'pending')` returns `409` with body `{ kind: 'conflict', message: "attempt outcome already resolved: '<outcome>'" }`. Idempotency guard fires for any non-pending outcome (`pass`, `fail`, `partial`). | Source-level. Body validation (line 39–44) also rejects non-`{pass,fail,partial}` outcomes with 400 before the lookup. |
| AC-4 (Drizzle schema has `grade_run_id`; `drizzle-kit push` clean) | PARTIAL — schema MET; `drizzle-kit push` host-only | `schema.ts:67` — `gradeRunId: text('grade_run_id'),` (nullable, no `.notNull()`, no default — additive change, matches spec D). The outcome comment at `:64` updated to include `'pending'`. | `drizzle-kit push` requires `npm ci` + a writable SQLite file; not runnable in sandbox. **Host carry-over: M4-T08-HOST-02.** Builder also acknowledged this in the per-task `**Status:**` line ("host must run drizzle-kit push for schema migration"). |
| AC-5 (aiw-mcp unreachable → outcome='fail', `error:'grade_unavailable'`) | MET | `attempts.ts:75-92` — `try { runWorkflow(…) } catch { db.update(attempts).set({outcome:'fail'}).where(…).run(); return new Response(JSON.stringify({id, outcome:'fail', error:'grade_unavailable'}), {status:200, …}) }`. The attempt row is inserted with `outcome='pending'` *before* the try/catch (line 64–73), so on aiw-mcp unreachability the row exists in DB and gets updated to `'fail'`. Response is HTTP 200 with the documented error shape — aligns with spec line 49 ("update the attempt outcome='fail', return {id, outcome:'fail', error:'grade_unavailable'}"). | Source-level. The choice to return 200 (not 5xx) on adapter failure is consistent with M3's `adapter_unreachable` graceful-degradation pattern (M3 T5 `mode.ts`); the failure is graded into the attempt record, not surfaced as a transport error. |
| AC-6 (`npm run build` exits 0) | NOT RUN — sandbox blocker | `npm run check` returns `sh: 1: astro: not found` (`node_modules` empty + root-owned in container). | **Host carry-over: M4-T08-HOST-03.** Same sandbox blocker as T04/T05/T06/T07 — all deferred host-side. |
| AC-7 (CHANGELOG has M4 T08 entry) | MET | `CHANGELOG.md:17-29` under `## 2026-05-02` — entry tagged `Added`, names files (`src/db/schema.ts`, `src/lib/aiw-client.ts`, `src/components/questions/QuestionGenButton.astro`, `src/pages/api/attempts.ts`, `src/pages/api/attempts/[id]/outcome.ts (new)`), describes the async flow, records the 200/200/200 contract, the `gradeRunId` schema addition, the `pollUntilDone` extraction closing T07 MED-1, and the host carry-overs (AC-1 / AC-6). Dep-audit note `skipped — no manifest changes`. | Source-level. |

**Carry-over (T07 MED-1) — `pollUntilDone` helper extracted.** Source: `T07_issue.md` § MED-1, propagated to `T08_llm_graded_async.md` § Carry-over from prior audits (line 109–120):

| Sub-AC | Status | Evidence |
| ------ | ------ | -------- |
| `pollUntilDone(run_id, opts?)` exported from `src/lib/aiw-client.ts` | MET | `aiw-client.ts:73-91`. |
| Checks status immediately (0ms initial delay) | MET | `aiw-client.ts:81-83` — `let status = await getRunStatus(run_id); if (status.status !== 'pending') return status;` runs before any `setTimeout`. |
| Loops with configurable `intervalMs` (default 2000) | MET | `aiw-client.ts:77` (`const intervalMs = opts?.intervalMs ?? 2000`); `:85-88` loop with `await new Promise<void>(r => setTimeout(r, intervalMs))`. |
| Throws `McpError('workflow_failed', 'timeout')` after `timeoutMs` (default 60s) | MET | `aiw-client.ts:78` (`const timeoutMs = opts?.timeoutMs ?? 60_000`); `:79` (`const deadline = Date.now() + timeoutMs`); `:90` (`throw new McpError('workflow_failed', 'timeout')`). |
| `QuestionGenButton.astro` uses `pollUntilDone` instead of ad-hoc loop | MET | `QuestionGenButton.astro:40` (`import { runWorkflow, pollUntilDone, McpError } from '../../lib/aiw-client'`); `:88-94` (`runStatus = await pollUntilDone(run.run_id, { intervalMs: 2000, timeoutMs: 60_000 })`); the prior 60-second `while (Date.now() < deadline) { await setTimeout(2000); … }` block is gone. |

T07 MED-1 carry-over — **CLOSED.**

**Summary:** 4 MET, 1 PARTIAL (AC-4 schema present; `drizzle-kit push` host-only), 2 NOT RUN (AC-1 full Ollama loop, AC-6 build — both host-only sandbox blockers). No UNMET. Carry-over `pollUntilDone` fully satisfied.

## Astro nested-dynamic-route confirmation (Q10 from invocation)

**Path:** `src/pages/api/attempts/[id]/outcome.ts` → `PATCH /api/attempts/:id/outcome`.

Astro's file-system routing supports nested directories with bracketed dynamic segments. `[id]` as a directory name is documented Astro behavior (https://docs.astro.build/en/guides/routing/#dynamic-routes — "Dynamic segments can be used as part of folder names too"). The pattern is correct:

- Folder `[id]` → captures one URL segment as `params.id`.
- File `outcome.ts` inside → static segment.
- Combined route → `/api/attempts/:id/outcome`.

Implementation reads `params.id` at `outcome.ts:20` and validates non-empty (line 21–26). Relative imports adjusted for the extra directory level (`../../../../db/client` and `../../../../db/schema` — 4 `..` ups, vs 3 for the existing `src/pages/api/<dir>/[id].ts` flat-dynamic siblings like `annotations/[id].ts`, `read_status/[section_id].ts`, `fsrs_state/[question_id].ts`). Verified: `find src -type d -name '[*]'` returns exactly the new directory, and the existing flat `[id].ts` siblings (`grep -n` for their import lines) use the 3-up path. No collisions.

Routing pattern: ✅ correct.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### LOW-1 — `outcome.ts` accepts `score` outside `[0, 1]` and unbounded-length `feedback`

**Where:** `src/pages/api/attempts/[id]/outcome.ts:38-44, 63-69`.

The PATCH body validator only checks `outcome ∈ {pass, fail, partial}`. `score` (which T03's `GradeOutput` documents as 0.0–1.0) and `feedback` (free-text, no length cap) are written verbatim into `llmTagsJson`. A misbehaving local-LLM run that produced `score: 42` or `feedback: <50KB>` would round-trip into the DB without complaint. cs-300's threat model is single-user / local, and the call-site is the project's own browser, so this is purely a defensive-validation gap — not a security issue under the documented threat model — but it's a small, cheap addition and worth noting.

**Action / Recommendation:** Two reasonable options — surfaced for user pick (per the "present options for simple-fix issues" memory rule) rather than picked unilaterally:

1. **Add bounds checks at the route layer.** In `outcome.ts`, after the outcome enum check, also assert `typeof score === 'number' && score >= 0 && score <= 1` and `typeof feedback === 'string' && feedback.length <= 4096` (or similar). Return `400 bad_request` on miss.
2. **Defer to M5.** M5 owns the review-loop UI and any richer attempt rendering. If M5 introduces a Zod schema for the grade payload (mirroring T05's per-type question schemas), this gap closes there for free, and T08's loose validation becomes consistent with the rest of the state-service routes (which generally do shape checks but not numeric-range checks).
3. **Tighten in T03's `GradeOutput` schema instead.** `cs300/workflows/grade.py`'s `GradeOutput` is the authoritative shape; if it enforces `Field(ge=0.0, le=1.0)` on `score` (it may already — not re-checked here), then aiw-mcp side validation is the right home. The state-service route then just needs to mirror that constraint.

I lean (2) — M5's review-route work will need a real schema for grade payloads anyway, and adding a one-off validator here that M5 then refactors is duplicative. T08's contract is the route-shape and the async transition; numeric-range tightening is a cheap forward-task line.

### LOW-2 — PATCH route does not verify `grade_run_id` matches an aiw-mcp run before resolving the attempt

**Where:** `src/pages/api/attempts/[id]/outcome.ts:46-69`.

The browser polls aiw-mcp for the grade run, then PATCHes `/api/attempts/:id/outcome` with `{outcome, score, feedback}`. The route trusts that the caller checked the run before submitting. There is no server-side `getRunStatus(attempt.gradeRunId)` cross-check before persisting the resolution. In the documented threat model (single-user local browser, same machine, no third party) this is fine — no attacker is racing the user's PATCH. But it does mean a stale browser tab could PATCH an outcome that doesn't match aiw-mcp's actual run result.

**Action / Recommendation:** Tracking only — out of scope for T08 by spec ("the state service does NOT maintain a polling loop", per task §Async-flow design line 19). The browser-orchestrated model is the architectural choice. M5 may revisit if the review-loop introduces a write-side surface where this matters.

## Additions beyond spec — audited and justified

- **Body-shape validation in `outcome.ts:38-44`.** Spec only required 404/409/transition; the route additionally rejects non-`{pass,fail,partial}` outcome strings with 400. Defensive; reasonable for an external-facing PATCH route. Justified.
- **`score: score ?? null, feedback: feedback ?? null` in `llmTagsJson`.** Stores `null` (not `undefined`) when omitted. Defensive. Justified.
- **Outcome comment in `schema.ts:64` updated to include `'pending'`.** Documentation drift fix; tracks the actual enum values used. Justified.
- **Comment block in `aiw-client.ts:68-72` cites T07 MED-1 as the trigger for `pollUntilDone`.** Useful traceability. Justified.

No drive-by refactors. No `nice_to_have.md` adoption. No scope creep beyond the deliverables list.

## Gate summary

| Gate | Command | Result | Notes |
| ---- | ------- | ------ | ----- |
| Type check | `npm run check` | NOT RUN — BLOCKED (sandbox) | `node_modules/` empty + root-owned (`ls -la node_modules` shows 2 entries, owner `root`); `npm run check` returns `sh: 1: astro: not found`. Host must run `npm ci && npm run check`. |
| Build | `npm run build` | NOT RUN — BLOCKED (sandbox) | Same blocker. Host must run `npm ci && npm run build` and inspect `dist/` for the `outcome.ts` route NOT being emitted (server-only; `prerender = false`). |
| Smoke (state service — PATCH 404) | `curl -X PATCH http://localhost:4321/api/attempts/nope/outcome` (with body `{outcome:'pass'}`) | NOT RUN — host-only | Source verified: route returns 404. Host carry-over. |
| Smoke (state service — PATCH 409 idempotency) | POST a `mc` attempt to make a non-pending row, then PATCH its `/outcome` | NOT RUN — host-only | Source verified. |
| Smoke (full async loop — AC-1) | `npm run dev` + `bash scripts/aiw-mcp.sh` + Ollama Qwen 14B + POST llm_graded → poll → PATCH → DB query | NOT RUN — host-only | Multiple host dependencies (Ollama installed and running, aiw-mcp launched, dev server up). |
| Drizzle migration | `drizzle-kit push` | NOT RUN — host-only | Schema column added (verified at `schema.ts:67`); `drizzle-kit push` is the dev workflow per task spec D + Notes. Host carry-over. |
| Content build | `node scripts/build-content.mjs` | NOT RUN — N/A | No `.tex` or pandoc-filter changes. |

**LBD-11 compliance.** AC-1 / AC-6 are flagged NOT RUN with explicit blocker reasons; per-AC source-level evidence cited where available; no AC graded MET on "build is clean". The non-inferential rule is preserved, and host-only gates are enumerated as concrete carry-over below.

## Issue log — cross-task follow-up

- **M4-T08-ISS-LOW-1** — LOW — `outcome.ts` body validator does not bound-check `score` or limit `feedback` length. Owner: M5 review-loop schema work (preferred) or a one-off route-layer guard now (alternative). Pending user decision per LOW-1 options above.
- **M4-T08-ISS-LOW-2** — LOW — PATCH route does not server-side cross-check `attempt.gradeRunId` against aiw-mcp before resolving. Owner: tracking only; out of scope by spec architecture (browser-orchestrated completion). M5 may revisit.
- **M4-T08-HOST-01** — host-only verification gate for AC-1 (full Ollama loop). Owner: user (host run). Concrete steps: (a) `npm ci`; (b) `bash scripts/aiw-mcp.sh` (port 8080, with Qwen 14B available locally); (c) `npm run dev`; (d) POST a `llm_graded` question via `/api/questions/bulk` (T05 path); (e) POST `/api/attempts` with that `question_id` and `response: {text: "Some free-text answer"}`; (f) confirm 200 `{id, outcome:'pending', grade_run_id:<uuid>}`; (g) browser poll `getRunStatus` until completed (T07 / `pollUntilDone` will do this in-page) or hit aiw-mcp directly with the run_id; (h) PATCH `/api/attempts/<id>/outcome` with `{outcome:'pass', score:0.8, feedback:'Good answer.'}`; (i) confirm 200 `{id, outcome:'pass'}`; (j) `sqlite3 cs-300.db "SELECT outcome, llm_tags_json, grade_run_id FROM attempts WHERE id='<id>'"` and verify `outcome='pass'`, `llm_tags_json` contains `{"score":0.8,"feedback":"Good answer."}`, `grade_run_id` is the run uuid.
- **M4-T08-HOST-02** — host-only `drizzle-kit push` to apply the `grade_run_id` column to the local SQLite. Owner: user (host run). Concrete step: `npx drizzle-kit push` after `npm ci`. Schema is additive + nullable, so no data-loss risk; existing rows get `grade_run_id = NULL`.
- **M4-T08-HOST-03** — host-only `npm run check` + `npm run build` to confirm AC-6. Same as M4-T07-HOST-01 / M4-T06-HOST / etc.; consolidate at the user's discretion (one `npm ci` covers all of them).

## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `src/db/schema.ts`, `src/lib/aiw-client.ts`, `src/pages/api/attempts.ts`, `src/pages/api/attempts/[id]/outcome.ts`, `src/components/questions/QuestionGenButton.astro`
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical / High

None.

### Advisory

- **`response_text` from the browser flows untrimmed into the grade workflow.** `attempts.ts:62` reads `(resp as { text?: string }).text ?? ''` and passes it as `response_text` into `runWorkflow('grade', …)`. T03's `grade.py` workflow uses `prompt_fn` (per CHANGELOG entry, "constructs a structured grading prompt from rubric_criteria and response_text using f-strings (avoids str.format() injection per ADV-2)"), so prompt-format-string injection is already mitigated upstream. A user submitting prompt-injection-style free text against their own local LLM is, under the cs-300 threat model, the user prompt-injecting themselves — out of scope. Tracking only.
- **`llm_tags_json` is written by PATCH from browser-supplied `score` / `feedback`, not from aiw-mcp's authoritative artifact.** Spec line 27 states the browser pulls the result from `getRunStatus(run_id).artifact` and PATCHes the route; the state service trusts the PATCH body. In the single-user local model this is fine; in a hypothetical multi-user world it would be a privilege boundary issue. Out of scope per cs-300 threat model. (Same shape as LOW-2, framed as security advisory rather than functional gap.)
- **PATCH route writes to the DB without authentication.** Local-only, no accounts, no sessions per CLAUDE.md threat model. ✅ in scope; no action.

### Out-of-scope concerns surfaced and dismissed

- **`localhost:8080` aiw-mcp URL ships into the client bundle for `pollUntilDone`** — pre-existing T07 architectural decision; `data-interactive-only` gate hides the surface in static mode. Not an LBD-1 violation (architecture.md §1).
- **CSRF on PATCH `/api/attempts/:id/outcome`** — local-only, no credentials, no cookies. Out of scope.
- **No rate limit on PATCH** — single-user local. Out of scope.
- **No bound on `feedback` length** — graded at LOW-1; not a security boundary in this threat model (no multi-tenant DB, no quota concern at the documented usage scale).

### Verdict

`SHIP` — no blocking security concerns. Two advisory items map to documented threat-model out-of-scope categories.

## Dependency audit

Dep audit: skipped — no manifest changes. Verified: `git status` snapshot at audit start shows no diff to `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`. Source-only addition (one new `.ts` route + edits to four existing files).

## Deferred to nice_to_have

None.

## Propagation status

No forward-deferrals to future task specs. T07 MED-1 carry-over from `T07_issue.md` was implemented in this cycle (`pollUntilDone` extracted and adopted by `QuestionGenButton.astro`), so its propagation arrow is satisfied here rather than re-propagated.

LOW-1 is logged as `## Issue log — cross-task follow-up` only — owner is M5 review-loop schema work (preferred) or a small route-layer guard, pending user pick. Not propagated as a hard `## Carry-over from prior audits` against M5 task specs because M5 hasn't decomposed yet (M5 is `todo` per `design_docs/milestones/README.md`). When M5 decomposes, the user can fold this into the appropriate review-route task spec.

LOW-2 is tracking-only; no propagation.

Host-only AC carry-overs (M4-T08-HOST-01 / -02 / -03) are owner=user, recorded in this issue file as concrete steps. They do not need to land on a future task spec because they are verification gates the user runs on the host, not implementation work for a downstream task.
