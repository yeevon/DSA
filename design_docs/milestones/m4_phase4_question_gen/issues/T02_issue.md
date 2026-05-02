# T02 — question_gen workflow module — Audit Issues

**Source task:** [../tasks/T02_question_gen_workflow.md](../tasks/T02_question_gen_workflow.md)
**Audited on:** 2026-05-02
**Audit scope:** `cs300/workflows/question_gen.py` (new file, 161 lines), `CHANGELOG.md` 2026-05-02 section, status-surface flips (M4 README, milestones index, root README, architecture.md), and the residual-HIGH cleanup from the 2026-05-02 implementation-health audit (deletion of `aiw_workflow_convention_hooks_issue.md`, M4 status reflows). No TS / Astro source touched; Python-only changeset.
**Status:** ✅ PASS

---

## Design-drift check

Cross-referenced against `CLAUDE.md` (LBD-1..15), `design_docs/architecture.md` §3.1 + §5, and the M4 milestone README.

| Anchor | Verdict | Evidence |
| --- | --- | --- |
| **LBD-1 (static-by-default deploy)** | clean | T02 lives under `cs300/workflows/`, never imported from `src/`. No API route, no `.env`, no `127.0.0.1` references introduced. The build pipeline (`scripts/build-content.mjs` → `dist/`) is untouched. |
| **LBD-2 (two-process boundary; no fork)** | clean | `cs300/workflows/question_gen.py:17–18` imports `WorkflowSpec` / `LLMStep` / `ValidateStep` / `register_workflow` from `ai_workflows.*` and registers via the framework's public `register_workflow(_SPEC)` surface. No fork, no monkey-patch, no upstream framework files copied. Module discovered via `AIW_EXTRA_WORKFLOW_MODULES` per architecture.md §3.1 line 344. |
| **LBD-3 (pandoc + Lua filter is THE content path)** | N/A | T02 does not touch `scripts/pandoc-filter.lua`, `scripts/build-content.mjs`, MDX, or any chapter `.tex`. |
| **LBD-4 (reference solutions never reach the DOM)** | clean (forward-deferred to T05/T07) | T02 is a generation-side workflow only. `GeneratedQuestion.reference: dict` (line 50) carries `solution` / `explanation` / `ideal_answer` for the four types — same shape architecture.md §2 mandates. Stripping the `solution` from any DOM-bound payload is the responsibility of `POST /api/questions/bulk` (T05) and the question-render path (T07). T02 stays in scope. |
| **LBD-5 (no sandboxing creep on code execution)** | N/A | T02 does not exec subprocesses; M6 owns code execution. |
| **LBD-6 / LBD-7 (chapter scope)** | N/A | No chapter source touched. |
| **LBD-8 (no Jekyll polish)** | N/A | No Jekyll surfaces touched. |
| **LBD-9 (`coding_practice/` left alone)** | clean | `git diff` confirms zero `coding_practice/` edits. T01 already resolved the `coding_practice/` decision as **dynamic** (architecture.md §5 row 6); T02 honours that — `section_text` flows in from the browser via `QuestionGenInput`, no prompt files read. |
| **LBD-10 (status-surface 4-way)** | clean | See **Status-surface check** below. All available surfaces flip together; the surfaces that don't exist for M4 (per-task `tasks/README.md`, milestone task table) are correctly N/A and were already that way prior to T02. |
| **LBD-11 (non-inferential verification for code)** | clean | Spec names AC-2 (`aiw show-inputs question_gen`) as the explicit smoke and AC-1 as the import smoke; both rerun fresh below with cited output. |
| **LBD-12 (cross-chapter refs)** | N/A | No chapter cross-refs in `question_gen.py`. |
| **LBD-13 (pre-Phase-1 sequencing)** | N/A | T02 is Phase 4 work, post-M3. |
| **LBD-14 (toolchain pins)** | clean | No change to `.nvmrc`, `.pandoc-version`, `pyproject.toml`, `uv.lock`, `package.json`, `package-lock.json`, `Dockerfile`, or `docker-compose.yml`. |
| **LBD-15 (sandbox-vs-host git)** | clean | Audit ran inside the sandbox on `design_branch`. No `git push` / `pull` / `fetch` performed. |
| **architecture.md §3.1** | matched | §3.1 (line 336) names exactly the v0.4.0 surface T02 uses: `WorkflowSpec` declarative API, `LLMStep` (Ollama Qwen 14B via `TierConfig`/`LiteLLMRoute`), `ValidateStep` for shape-checking, `register_workflow(spec)` at import time. The 2026-05-02 architecture rewrite (CHANGELOG line 43–48) and T02 implementation are mutually consistent. |
| **architecture.md §5 "Question-gen model tier" row** | matched | T02's tier registry keys `"question-gen-llm"` with default `LiteLLMRoute(model="ollama/qwen2.5:14b")`; A/B override path documented in the module docstring (lines 6–8) and points at the framework's `tier_overrides` MCP arg. Matches the spec's "Tier override" section. |
| **`nice_to_have.md` boundary** | clean | T02 implements only what the spec mandates; no nice-to-have items pulled in. |

**No drift.** All design anchors satisfied.

---

## Status-surface check (LBD-10)

| Surface | Pre-T02 | Post-T02 | Verdict |
| --- | --- | --- | --- |
| 1. Per-task spec `**Status:**` line (`tasks/T02_question_gen_workflow.md:3`) | `todo` | ✅ done 2026-05-02 | flipped |
| 2. `tasks/README.md` row | does not exist for M4 | does not exist for M4 | N/A (consistent with T01 audit; cs-300 has no per-milestone `tasks/README.md`) |
| 3. Milestone README task-table row | M4 README has no formal task table; carries narrative status line at top | narrative status line names T02 ✅ 2026-05-02 (`README.md:4`); round-2 carry-over checkbox `[x]` (`README.md:147`); coding_practice Done-when checkbox `[x]` (`README.md:71`) | flipped (no formal table to flip; narrative + carry-overs serve the same role) |
| 4. M4 milestone README "Done when" checkboxes T02 satisfies | none of the 8 still-`[ ]` Done-when bullets are exclusively-T02 (each requires T03–T08 follow-up to fully tick) | unchanged | correct — T02 alone does not complete any single Done-when item; flipping them would be premature |
| Bonus: `design_docs/milestones/README.md` index row | `todo — re-blocked 2026-04-25` | `🟡 in progress 2026-05-02 (T01 ✅, T02 ✅)` | flipped |
| Bonus: root `README.md` M4 callout | dead-link narrative | T01/T02 progress narrative | flipped |
| Bonus: `aiw_workflow_convention_hooks_issue.md` (cs-300 root) | present (residual; should have been deleted at T01 close) | absent (verified via `ls`) | resolved per CHANGELOG line 33–34 |

All four LBD-10 surfaces are in their correct post-T02 state. No silent drift.

---

## AC grading

| AC | Status | Evidence | Notes |
| --- | --- | --- | --- |
| AC-1 — module imports cleanly | ✅ MET | `PYTHONPATH=… uvx --from jmdl-ai-workflows python -c "import cs300.workflows.question_gen; print('ok')"` → `ok` (exit 0). | Smoke rerun this audit. |
| AC-2 — `aiw show-inputs question_gen` lists 5 inputs | ✅ MET | Rerun output cited verbatim under **Gate summary** below. Lists `chapter_id (str, required)`, `section_id (Optional, optional, default None)`, `section_text (str, required)`, `count (int, required)`, `types (list, required)`. Exit 0. | The optional rendering for `section_id` is `Optional, optional, default None` — equivalent to the spec's `(str, optional)` framing; framework's renderer prints the typing wrapper. |
| AC-3 — `QuestionGenOutput.questions` is the FIRST field | ✅ MET | `question_gen.py:53–54` — `class QuestionGenOutput(BaseModel): questions: list[GeneratedQuestion]`. Single field, trivially first. `result.artifact` will therefore carry the questions list per architecture.md §3.1 line 340. | |
| AC-4 — tier registry returns `"question-gen-llm" → LiteLLMRoute(model="ollama/qwen2.5:14b")` | ✅ MET | `question_gen.py:24–30` — `question_gen_tier_registry()` returns `{"question-gen-llm": TierConfig(name="question-gen-llm", route=LiteLLMRoute(model="ollama/qwen2.5:14b"))}`. | Wraps the route in `TierConfig` (framework requirement); the LLM model string is exact match. |
| AC-5 — `LLMStep` uses `prompt_fn=` not `prompt_template=` | ✅ MET | `question_gen.py:148–152` — `LLMStep(tier="question-gen-llm", prompt_fn=_build_prompt, response_format=QuestionGenOutput)`. No `prompt_template=` token anywhere in the file. | |
| AC-6 — `prompt_fn` references `state['types']` AND `state['section_text']` | ✅ MET | `question_gen.py:86–89` — `types: list[str] = state["types"]; section_text: str = state["section_text"]; count: int = state["count"]; chapter_id: str = state["chapter_id"]`. Both required references present (plus `count` and `chapter_id` for completeness). | |
| AC-7 — `ValidateStep(target_field="questions", schema=QuestionGenOutput)` | ✅ MET | `question_gen.py:153–156` — `ValidateStep(target_field="questions", schema=QuestionGenOutput)`. | |
| AC-8 — `register_workflow(_SPEC)` at module top level | ✅ MET | `question_gen.py:160` — bare `register_workflow(_SPEC)` at column 0, after the `_SPEC = WorkflowSpec(...)` block. Not inside a `def` or `if __name__` guard. Confirmed firing on import via the AC-1 smoke (the framework's registry observes the registration and `aiw show-inputs question_gen` resolves the workflow by name in AC-2). | |
| AC-9 — no direct `import langgraph` | ✅ MET | `grep -n "langgraph" question_gen.py` exit 1 (no matches). Only framework-public imports: `pydantic`, `typing`, `json`, `__future__`, `ai_workflows.primitives.tiers`, `ai_workflows.workflows`. | |
| AC-10 — CHANGELOG has M4 T02 entry | ✅ MET | `CHANGELOG.md:17–30` — dated 2026-05-02 section, "Added — M4 T02 — `question_gen` workflow module" entry covering deliverables, design points (prompt_fn rationale, tier registry, ValidateStep), AC-2 smoke confirmation, and dep-audit note. | |

**10/10 ACs MET. No partial, no unmet, no carry-over deferrals.**

---

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### LOW-1 — Spec "imports only from pydantic, typing, ai_workflows.*" allows-list omits stdlib helpers actually used

The deliverables list at `T02_question_gen_workflow.md:71–73` says: *"Imports only from `pydantic`, `typing`, `ai_workflows.workflows`, `ai_workflows.primitives.tiers`."* The implementation also imports `json` (used to render dict shape examples inside the prompt — `question_gen.py:12`) and `from __future__ import annotations` (line 10, harmless `__future__` hint).

These are stdlib utility imports, not new external dependencies — they don't add supply-chain surface, don't bypass the framework, and `json.dumps` of a literal `_TYPE_SHAPES` constant is the cleanest way to embed a JSON shape example in the prompt string. Reading the spec's intent ("don't pull external deps in beyond the framework + pydantic"), the additions are aligned, not violations.

**Action / Recommendation.** Pure spec-language hygiene. Either:
1. Edit `T02_question_gen_workflow.md:71–73` post-hoc to read *"Imports only from `pydantic`, `typing`, `ai_workflows.*`, plus stdlib utilities (`json`, `__future__`)"*, OR
2. Leave as-is and rely on the LBD/dep-audit gate to police real new dependencies. Stdlib additions are not the same risk surface.

Either is fine; no implementation change needed. Logged for transparency only.

### LOW-2 — Prompt instructs the LLM to avoid framework-reserved field names

`question_gen.py:132` includes the line `- Do not use reserved field names: run_id, last_exception, _retry_counts.` in the user prompt. This is defensive (the spec **Notes** section names six reserved fields including three more — `_non_retryable_failures`, `_mid_run_tier_overrides`, `_ollama_fallback_fired`).

The current prompt rule constrains the LLM's output JSON keys (which would land in `topic_tags` strings, `answer_schema` keys, etc.) — those don't intersect with framework-reserved state fields anyway. The clause is safety theatre rather than a functional guard, but it costs <30 tokens.

**Action / Recommendation.** Optional. Leave as-is (cheap defence-in-depth) or drop the line for cleaner prompts. Either acceptable.

---

## Additions beyond spec — audited and justified

| Addition | Justification |
| --- | --- |
| `from __future__ import annotations` (line 10) | Makes the `tuple[str \| None, list[dict]]` return annotation work on Python <3.10; harmless on 3.12. Standard practice. |
| `import json` (line 12) | Required to embed literal JSON shape examples in the prompt — see `_TYPE_SHAPES` and `json.dumps(...)` calls at lines 92–94. |
| `_TYPE_SHAPES` module-level dict (lines 61–82) | Centralises the per-type shape examples used in the prompt. Implements the spec's "include the per-type JSON shape in the prompt" requirement (line 78–79) cleanly without duplicating literals across the prompt builder. |
| Module docstring lines 6–8 (A/B override mechanism) | Required by spec deliverable list line 86 ("Module-level comment explaining the A/B override mechanism"). |

No drive-by refactors, no opportunistic scope creep.

---

## Gate summary

| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | NOT RUN — Python-only task, no TS changes; `node_modules` unavailable in this sandbox per LBD-15 constraint | T02 touched zero `.ts` / `.astro` / `.mjs` source. Astro type-check is non-applicable. |
| import smoke (AC-1) | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 uvx --from jmdl-ai-workflows python -c "import cs300.workflows.question_gen; print('ok')"` | PASS | stdout: `ok`; exit 0. |
| AIW workflow smoke (AC-2) | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen uvx --from jmdl-ai-workflows aiw show-inputs question_gen` | PASS | stdout: `Inputs for workflow 'question_gen' (pass via --input KEY=VALUE):\n  - chapter_id (str, required)\n  - section_id (Optional, optional, default None)\n  - section_text (str, required)\n  - count (int, required)\n  - types (list, required)`; exit 0. |
| `langgraph` direct-import grep (AC-9) | `grep -n "langgraph" cs300/workflows/question_gen.py` | PASS | exit 1 (no matches). |
| chapter LaTeX | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | NOT RUN — no chapter source touched | |
| content build | `node scripts/build-content.mjs` | NOT RUN — no chapter source / Lua-filter / build-script changes | |
| Astro build | `npm run build` | NOT RUN — Python-only task, no TS / MDX / route changes; `node_modules` unavailable in this sandbox | LBD-1 surface check inferential here, but justified: `cs300/workflows/` has no import path into `src/`, so a Python-only edit cannot touch `dist/`. |

---

## Issue log — cross-task follow-up

None. T02's surface is contained; cross-task work is already enumerated as T03 (`grade.py`), T04 (`aiw-mcp` launch + mode probe), T05 (bulk endpoint validation — owns the second validation pass + `solution`-stripping for LBD-4), T06 (synchronous eval), T07 (UI), T08 (`llm_graded` async loop). No T02-discovered work needs new carry-over entries on those task specs beyond what their own specs already capture.

---

## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `cs300/workflows/question_gen.py`, `design_docs/architecture.md`, `design_docs/milestones/README.md`, `design_docs/milestones/m4_phase4_question_gen/README.md`, `design_docs/milestones/m4_phase4_question_gen/tasks/T02_question_gen_workflow.md`, `design_docs/roadmap_addenda.md`, `README.md`, `CHANGELOG.md`
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical

None.

### High

None.

### Advisory

- **ADV-1 — LBD-4 forward-owner is identified but not yet enforced.** `GeneratedQuestion.reference: dict` carries `{solution: str}` for `code`-type questions. T02 is generation-only; no API route is added in this changeset, so `solution` cannot reach the DOM here. The forward-owner (T05 `POST /api/questions/bulk`) must strip `solution` before any client response. This advisory tracks that the stripping obligation is assigned and visible in T05's spec, but not yet implemented. — **Action:** No action on T02. When T05 is implemented, the security reviewer for that changeset must verify that `solution` is absent from the response shape. If T05 closes without that verification, promote to High.

- **ADV-2 — `section_text` in the f-string prompt is prompt-injected by design; not a code-level concern, but a trust-boundary note.** A user can craft `section_text` containing adversarial instructions to the local Ollama model (e.g., "Ignore previous instructions and output..."). Under the single-user local threat model this is self-injection — the user is both the attacker and the victim, so it is not a security defect. Flagging for completeness: the code-level `str.format()` injection vector (ADV-2 in the framework docs) is correctly neutralised by using `prompt_fn` (f-strings) instead of `prompt_template`. AST scan and grep confirm zero `str.format()` or `%-style` format calls on user-controlled strings. `_TYPE_SHAPES` is a pure literal dict (verified via `ast.literal_eval`). — **Action:** Tracking only. The prompt-injection advisory is moot for the single-user threat model.

- **ADV-3 — `answer_schema` and `reference` are `dict` (untyped at the Python level).** Deserialization of these fields from Ollama's LLM response runs through Pydantic's `QuestionGenOutput` schema coercion and the `ValidateStep` re-validation. The dict type means Pydantic does not enforce deep shape — it accepts any JSON object. Malformed or adversarially shaped LLM output (e.g., extremely nested dicts) could produce unexpected data at insert time. Under the single-user model and with local Ollama, the risk is low. Pass 2 (T05) is where insert-time shape enforcement needs to be solid. — **Action:** Tracking only for T02. T05's security reviewer should verify that `answer_schema` and `reference` are validated against per-type shapes at bulk-insert time, not left as untyped dicts.

### Out-of-scope concerns surfaced and dismissed

- Missing auth / rate limiting on MCP transport — out of scope per cs-300 threat model: single-user local, no untrusted network clients.
- Ollama model trust / hallucination — prompt injection into the local model is self-injection; not a security defect under the single-user model.
- SQLi via future bulk-insert — Drizzle is parameterised; T05 will inherit that defence. Flag only if T05 uses raw interpolation.

### Verdict

`SHIP` — no blocking security concerns. The two critical threat-model surfaces present in this changeset (prompt-construction injection via `section_text` and reference-solution leakage via `GeneratedQuestion.reference`) are both correctly handled at the T02 layer: f-string composition neutralises the `str.format()` injection vector; the absence of any API route in this changeset means `solution` cannot reach the DOM. Three advisory items are tracked forward to T05 (solution-stripping enforcement) and T07 (UI rendering path). No manifest changes; dep audit not required.

---

## Dependency audit

`Dep audit: skipped — no manifest changes (module imports resolved via uvx/jmdl-ai-workflows runtime; pyproject.toml unchanged).`

Verified: no edits to `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, or `docker-compose.yml` in this changeset. All new imports (`pydantic`, `ai_workflows.primitives.tiers`, `ai_workflows.workflows`, `json`, `typing`, `__future__`) resolve via the existing jmdl-ai-workflows uvx runtime + Python stdlib.

---

## Deferred to nice_to_have

None.

---

## Propagation status

No forward-deferrals filed against future task specs. T02's scope is self-contained; cross-task work that interacts with T02 (LBD-4 stripping, second validation pass, UI dispatch, async grade loop) was already specified in the existing T03–T08 specs at M4 milestone scaffold time and does not need additional carry-over entries from this audit.

---

## Verdict

**✅ PASS.** All 10 ACs MET. No HIGH, no MEDIUM. Two LOW observations (spec-language hygiene + optional prompt cleanup) — neither blocks close-out. Status surfaces are 4-way consistent; the residual-HIGH cleanup from the 2026-05-02 implementation-health audit (deletion of `aiw_workflow_convention_hooks_issue.md`, M4 status reflows, architecture.md v0.4.0 update) is verified resolved alongside T02. Security review clean; the `prompt_fn`-over-`prompt_template` choice correctly defuses ADV-2. Dep audit skipped — no manifest changes.
