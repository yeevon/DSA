# T07 — Question-gen UI — Audit Issues

**Source task:** [../tasks/T07_question_gen_ui.md](../tasks/T07_question_gen_ui.md)
**Audited on:** 2026-05-02
**Audit scope:** `src/lib/aiw-client.ts` source review, `src/components/questions/QuestionGenButton.astro` source review, `src/pages/lectures/[id].astro` wiring, CHANGELOG.md, status-surface 4-way (per-task spec / M4 README status line + Done-when checkbox / root milestones index row), inter-task contract check against T05's `POST /api/questions/bulk` request/response shape and T02's `question_gen` artifact shape.
**Status:** ✅ PASS — MED-1 propagated to T08 carry-over (option 3: factor `pollUntilDone` helper into `aiw-client.ts` when T08 introduces its own polling loop); host-only ACs documented as carry-over per LBD-15.

## Spec deviation — graded and accepted

**Spec called for `QuestionGenButton.tsx` (React island).** Implementation delivers `QuestionGenButton.astro` (vanilla JS `<script>` block).

- Existing pattern across the codebase: every interactive component in the project today uses `.astro` + vanilla JS — `AnnotationsPane.astro`, `AnnotateButton.astro`, `MarkReadButton.astro`, `RightRailReadStatus.astro`, `RightRailTOC.astro`, `ScrollSpy.astro`, `Drawer.astro`, `MobileChapterTOC.astro`, `LeftRail.astro`, `CompletionIndicator`-rendering components, etc.
- React is **not installed.** Implementing as `.tsx` would have required adding `@astrojs/react`, `react`, `react-dom` to `package.json` and an integration entry to `astro.config.mjs` — a non-trivial dep expansion the spec did not authorise.
- AC-2's verifiable property — "no TS errors / build exits 0 with the file present" — translates cleanly: same gate, different file extension.

The deviation is **accepted** as consistent with the project pattern and explicitly logged here per the spec-authority rule in `CLAUDE.md`. The deviation is also recorded in the CHANGELOG entry, the per-task `**Status:**` line, and the M4 README Done-when bullet — readers downstream of the issue file can find it.

If a future task wants to introduce React for richer client UI, that should be a separate ADR + architecture amendment.

## Design-drift check

- **LBD-1 (static-by-default deploy).** `aiw-client.ts` hardcodes `MCP_URL = 'http://localhost:8080/mcp'`. This URL ends up in the client bundle and ships into `dist/`. Architecture.md §System-shape explicitly diagrams the browser making HTTP calls to the local-only `aiw-mcp` process at `localhost:8080`; the static deploy ships the bundled JS but the call simply fails (caught as `adapter_unreachable`) on the GH Pages public site, which downgrades the UI via `data-interactive-only`. **Not a violation.** LBD-1 forbids env-secrets, local file paths, and API routes in `dist/`; it does not forbid client-side `fetch` URLs to local-only sibling processes — that *is* the M4 architecture.
- **LBD-2 (two-process boundary).** Component calls `aiw-mcp` (port 8080) for `run_workflow` / `get_run_status` and the state service (port 4321 same-origin) for `/api/questions/bulk`. Both calls go through the documented seams. No forking of `jmdl-ai-workflows`, no monkey-patching, no workflow logic baked into the API route. ✅
- **LBD-3 (Lua filter).** N/A — no content-pipeline change.
- **LBD-4 (reference solutions never reach DOM).** The component receives the workflow's `artifact.questions` from `getRunStatus` and POSTs them straight to `/api/questions/bulk`. T05's bulk handler stores `referenceJson` in DB but the 201 response only returns `{ inserted: ids }` (verified at `src/pages/api/questions/bulk.ts:115`), so no `solution` payload is mirrored back to the DOM through this flow. The browser does briefly hold the `artifact.questions` payload (which contains `reference.solution` for `code` questions) in memory between `getRunStatus` and the bulk POST, but it is never rendered into the DOM by this component — the script does not call `innerHTML` / `textContent` with question contents, only `${body.inserted.length} question(s) added`. ✅
- **LBD-5 (no sandboxing).** N/A.
- **LBD-6/7 (chapter ceiling / additions).** N/A — no chapter content change.
- **LBD-8 (no Jekyll polish).** N/A.
- **LBD-9 (`coding_practice/` boundary).** N/A — no `coding_practice/` touch.
- **LBD-10 (status-surface 4-way).** Verified in three available surfaces (M4 has no `tasks/README.md` task-table, so the 4-way reduces to 3 in this milestone):
  - Per-task spec `**Status:**` line: `✅ done 2026-05-02 (spec deviation: .astro not .tsx; AC-2/3/4/6/8/9 host-only)` — flipped.
  - M4 README status header line: `T07 ✅ 2026-05-02` — flipped.
  - M4 README Done-when checkbox for "Question generation UI...": `[x]` with citation parenthetical pointing at this issue file — flipped.
  - Root `design_docs/milestones/README.md` M4 row: includes `T07 ✅ 2026-05-02` — flipped.
  All consistent. ✅
- **LBD-11 (non-inferential verification).** Source-level ACs (AC-1, AC-5, AC-7, AC-10) verified by direct file inspection. Build / runtime ACs (AC-2, AC-3, AC-4, AC-6, AC-8, AC-9) cannot run in this sandbox — `node_modules/` is empty and root-owned (`ls -la node_modules` returns 2 entries; `npm run check` errors with `astro: not found`). These are correctly recorded as NOT RUN with a host-only carry-over. The Builder did not infer correctness from build success; the issue file calls out the non-inferential gap explicitly. ✅
- **LBD-12 (cross-chapter refs).** N/A.
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M4 is post-Phase-1.
- **LBD-14 (toolchain pins).** N/A — `package.json`, `.nvmrc`, `.pandoc-version` all unmodified.
- **LBD-15 (sandbox-vs-host git policy).** N/A — audit phase, no commits.
- **No new dependency** — no manifest change. Dep audit gate not required.

No design drift detected.

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 `aiw-client.ts` exports `runWorkflow` + `getRunStatus` with `payload` wrapper | MET | `src/lib/aiw-client.ts:24-46` (`runWorkflow` body uses `params: { payload: { workflow_id, inputs, ...(run_id ? { run_id } : {}) } }`) and `:48-66` (`getRunStatus` uses `params: { payload: { run_id } }`). `McpError` class exported at `:10-15`. | Source-level check; no runtime needed. |
| AC-2 `QuestionGenButton.tsx` (deviation: `.astro`) exists, no TS errors / `npm run build` exits 0 | PARTIAL — deviation accepted, build NOT RUN | File exists at `src/components/questions/QuestionGenButton.astro`. Type-checked content via reading: `Props` interface + `<script>` types align with `aiw-client.ts` exports. `npm run check` / `npm run build`: NOT RUN (sandbox `node_modules` empty, root-owned). | Deviation graded above. **Host carry-over: run `npm ci && npm run check && npm run build`.** |
| AC-3 Button visible in right rail, interactive mode | NOT RUN | Source wiring verified: `<QuestionGenButton slot="right-rail" chapterId={entry.data.chapter_id} />` mounted in `src/pages/lectures/[id].astro:169-172` after `<AnnotationsPane>`; outer wrapper has `data-interactive-only` (`QuestionGenButton.astro:17`). Runtime visibility is host-only (requires dev server + aiw-mcp running for `mode === 'interactive'`). | Host carry-over: navigate to a chapter page in interactive mode; confirm button paints in right rail. |
| AC-4 Button not rendered in static mode | NOT RUN | Outer wrapper carries `data-interactive-only`; Base.astro:177 + HomeLayout.astro:87 already enforce `body[data-mode="static"] [data-interactive-only] { display: none !important; }`. Source-level gate is correct. | Host carry-over: stop aiw-mcp, reload, confirm button hidden. |
| AC-5 Form has mc, short, llm_graded, code checkboxes | MET | `QuestionGenButton.astro:27-30` — four `<input type="checkbox" class="qg-type" value="...">` lines, exactly the four required values. `mc` and `short` checked by default per spec ("default: mc + short"). | Source-level. |
| AC-6 Spinner visible during polling | PARTIAL | `<div class="qg-spinner" hidden aria-label="Generating…">⏳ Generating…</div>` at `:33`; `spinner.hidden = false` at `:74` before `runWorkflow`; `spinner.hidden = true` in `finally` block at `:133`. Source contract is correct. | Runtime observation host-only. |
| AC-7 MCP body uses `params: { payload: { workflow_id, inputs } }` | MET | `aiw-client.ts:36` (runWorkflow) and `:57` (getRunStatus) both use the `payload` wrapper; consistent with FastMCP wire shape from `m4_unblock_smoke.md` finding #3. | Source-level; same evidence as AC-1. |
| AC-8 "N questions added" message on success | PARTIAL | `:126` `showStatus(\`${body.inserted.length} question${body.inserted.length !== 1 ? 's' : ''} added\`, false)`; auto-dismiss timer at `:127` (3s). Pluralisation correct. | Runtime observation host-only. |
| AC-9 `npm run build` exits 0 | NOT RUN | `node_modules` empty in sandbox; `npm run check` returns `astro: not found`. | Host carry-over. |
| AC-10 CHANGELOG has M4 T07 entry | MET | `CHANGELOG.md:17-27` under `## 2026-05-02` — entry tags `Added`, names files (`src/lib/aiw-client.ts`, `src/components/questions/QuestionGenButton.astro`, `src/pages/lectures/[id].astro`), AC-mapping (1/7, 5/6, 3/4), spec-deviation note, dep-audit note. | Source-level. |

**Summary:** 5 MET, 3 PARTIAL (source contract correct; runtime obs host-only), 2 NOT RUN (host build gate). No UNMET.

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MED-1 — Polling racing window: first `getRunStatus` waits 2s after `runWorkflow` returns, even if the workflow already completed synchronously

**Where:** `src/components/questions/QuestionGenButton.astro:87-93`.

```js
let runStatus;
const deadline = Date.now() + 60_000;
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 2000));
  runStatus = await getRunStatus(run.run_id);
  if (runStatus.status !== 'pending') break;
}
```

The loop sleeps 2s **before** the first `getRunStatus` call. `runWorkflow` already returns `{ run_id, status }` per the spec contract (line 49) — if `status` is already `completed` (which can happen for fast workflows), the script ignores it and waits 2s anyway. Cosmetic; not a correctness defect, but it adds a guaranteed 2s floor to every successful submit.

**Action / Recommendation:** Two reasonable options — surfaced for user pick rather than picked unilaterally per the "present options for simple-fix issues" memory rule:

1. **Use the `runWorkflow` return value as the first poll.** Initialize `runStatus = run` (since `run` already contains `{ run_id, status }`) and check `runStatus.status !== 'pending'` before entering the sleep loop. Same logic, no extra 2s on fast paths.
2. **Move the sleep to the loop tail.** Reorder so `getRunStatus` is called first, then `setTimeout(2000)` only if still pending. Same effect, slightly more refactor.
3. **Defer to T08 / M5.** Both options are micro-optimisations; T08 reuses this polling pattern for `llm_graded` async grading and may want to factor the polling into `aiw-client.ts` (`pollUntilDone(run_id, opts)`) — folding this fix into that refactor is cheaper than touching it twice.

I lean on (3) — the polling logic is small enough that a shared helper at T08 closes both this finding and the duplication that would otherwise emerge there. Want me to record this as a `## Carry-over from prior audits` line on `T08_llm_graded_async.md`?

## 🟢 LOW

### LOW-1 — `section_text` fallback uses `document.querySelector('article')` (first article in document, not the closest ancestor)

**Where:** `src/components/questions/QuestionGenButton.astro:70`.

The spec says "Falls back to the full chapter article if no section context"; the implementation only ever uses the fallback (no per-section traversal). This matches the spec's explicit guidance ("M4 accepts chapter-level text. Per-section granularity is a future T07 cycle 2"), so it's compliant — but the lack of `closest('article, section')` traversal means even if a future call site nests a `<section>` per chapter, the chapter article wins. Flagging because the spec's wording implied an ancestor-first approach with article as fallback; the implementation is fallback-only.

**Action / Recommendation:** Track for future tightening when per-section granularity arrives (M4 explicitly defers this; no action now). If desired, add a one-line comment in the component pointing at the spec section that authorised the simplification.

## Additions beyond spec — audited and justified

- **Empty-types guard.** `:68` adds `if (types.length === 0) showStatus('Select at least one question type.', true)` early-return. Spec is silent; this is a defensive UX guard that prevents an obviously-broken submit. Justified.
- **`run_id` conditional spread.** `aiw-client.ts:36` includes `...(run_id ? { run_id } : {})` so the third optional arg doesn't leak `run_id: undefined` into the wire payload. Defensive; clean wire shape. Justified.
- **`McpError` `instanceof` branch in `catch`.** `:130` distinguishes MCP-typed errors from generic ones (`Unexpected error`) — better diagnostics. Justified.
- **`status.style.color` from CSS variables (`--color-error`, `--color-success`).** `:142` hooks into the project's CSS-variable convention. Justified.
- **Auto-dismiss after 3s** (`:127`) — matches spec design step 4 ("Dismiss after 3s"). Spec'd, not "beyond".
- **`aria-label` on spinner** (`:33`). Accessibility; cheap addition. Justified.

No drive-by refactors. No `nice_to_have.md` adoption. No scope creep.

## Gate summary

| Gate | Command | Result | Notes |
| ---- | ------- | ------ | ----- |
| Type check | `npm run check` | NOT RUN — BLOCKED (sandbox) | `node_modules/` empty + root-owned (`ls -la node_modules` shows 2 entries); `npm run check` returns `sh: 1: astro: not found`. Host must run `npm ci && npm run check`. |
| Build | `npm run build` | NOT RUN — BLOCKED (sandbox) | Same blocker. Host must run `npm ci && npm run build` and inspect `dist/` for the bundled component. |
| Smoke (UI) | navigate to chapter page in interactive mode | NOT RUN — host-only | Requires `bash scripts/aiw-mcp.sh` running + `npm run dev`. Carry-over for host. |
| Content build | `node scripts/build-content.mjs` | NOT RUN — N/A | No `.tex` or pandoc-filter changes; no chapter content touched. |
| Smoke (state-service inter-contract) | `node scripts/db-smoke.mjs` | NOT RUN — N/A | T07 doesn't change the state-service. T05's bulk endpoint contract was verified by source inspection (response shape `{ inserted: ids }`, request shape `{source_run_id, chapter_id, section_id, questions[]}` — both match what T07's component sends/reads). |

**LBD-11 compliance.** AC-2/3/4/6/8/9 are flagged NOT RUN with explicit blocker reasons; the component's per-AC source-level evidence is cited where available; no AC is graded MET on the basis of "build is clean". The non-inferential rule is preserved, and the host-only gates are enumerated as concrete carry-over for the user.

## Dep audit

Dep audit: skipped — no manifest changes.

Verified (in `git status` snapshot at audit start): no diff to `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`. Pure source-only addition.

## Issue log — cross-task follow-up

- **M4-T07-ISS-01** — MEDIUM — Polling first-call 2s sleep wastes the synchronous-completion case. Owner: T08 (recommended folding into a shared `pollUntilDone` helper in `aiw-client.ts`) — pending user decision per options above.
- **M4-T07-HOST-01** — host-only verification gate. Owner: user (host run). Concrete steps: (a) `npm ci`; (b) `npm run check` — expect exit 0; (c) `npm run build` — expect exit 0, inspect `dist/_astro/` for the QuestionGenButton chunk; (d) `bash scripts/aiw-mcp.sh` + `npm run dev`, navigate to a chapter page, confirm button paints in right rail under interactive mode and is hidden in static mode; (e) submit form with `count=1, types=[mc]`, observe spinner, observe "1 question added" status. ACs 2/3/4/6/8/9 are gated on these.


## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `src/lib/aiw-client.ts`, `src/components/questions/QuestionGenButton.astro`, `src/pages/lectures/[id].astro`, `src/pages/api/questions/bulk.ts`, `src/lib/question-schemas.ts`
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical

None.

### High

None.

### Advisory

- **`artifact.questions` passes through browser memory holding `reference.solution` for `code`-type questions before the bulk POST.** The component at `QuestionGenButton.astro:105-116` receives the full workflow artifact (which includes `CodeReferenceSchema`-shaped `reference.solution` strings) and posts it to `/api/questions/bulk`. The solution is never rendered into the DOM by this component — `showStatus` at line 140 uses `.textContent` and only ever writes the inserted-count string. The bulk handler stores `referenceJson` verbatim in SQLite and returns only `{ inserted: ids }`. No leakage to DOM occurs in this flow. Flagged advisory because M5's review UI must continue to respect LBD-4 (strip `solution` before serving question data); nothing in T07 breaks that boundary, but the chain is worth tracking. — **Action:** tracking only; LBD-4 enforcement responsibility is on the M5 review-route handler, not here.

- **`prompt_md` injection advisory (carry-over from T05).** Questions generated by local Ollama flow through `validateAnswerSchema` / `validateReference` (Zod, structural checks) but `prompt_md` is stored as-is with no HTML/script-tag stripping. When M5 renders `prompt_md` as MDX, any script tag or raw HTML injected by the local model would execute as stored self-XSS. T07 does not introduce a new surface here — this was identified at T05 and propagated to M5. — **Action:** tracking only; owner is M5 render route (carry-over already recorded on T05 issue).

### Out-of-scope concerns surfaced and dismissed

- **`localhost:8080` hardcoded in browser bundle ships into `dist/`.** Pre-existing architectural decision (architecture.md §1); the call fails gracefully as `adapter_unreachable` on the static GH Pages deploy; `data-interactive-only` CSS hides the button. Not a violation of LBD-1 (which forbids env-secrets, local file paths, and API routes in `dist/`, not client `fetch` URLs to local sibling processes). Out of scope per cs-300 threat model.
- **Cleartext localhost HTTP for `section_text`.** Single-user, same machine, loopback only. Out of scope per cs-300 threat model.
- **CSRF on `/api/questions/bulk`.** Local-only, no credentials, no cookies. Out of scope per cs-300 threat model.
- **No rate limiting on question-gen trigger.** Single-user local. Out of scope per cs-300 threat model.

### Verdict

`SHIP` — no blocking security concerns. The two advisory items are tracking carry-overs from T05 (already recorded); T07 introduces no new threat-model surfaces beyond what the existing audit correctly identified.

## Deferred to nice_to_have

None.

## Propagation status

MED-1 propagated to `design_docs/milestones/m4_phase4_question_gen/tasks/T08_llm_graded_async.md` § Carry-over from prior audits (2026-05-02). Option 3 chosen: factor `pollUntilDone(run_id, opts)` into `src/lib/aiw-client.ts` when T08 introduces its own grade-run polling loop, then update `QuestionGenButton.astro` to use the helper. Avoids touching T07 twice; T08 owns the consolidation.
