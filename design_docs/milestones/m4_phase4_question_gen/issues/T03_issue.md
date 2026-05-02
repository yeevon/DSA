# T03 — grade workflow module — Audit Issues

**Source task:** [../tasks/T03_grade_workflow.md](../tasks/T03_grade_workflow.md)
**Audited on:** 2026-05-02
**Audit scope:** `cs300/workflows/grade.py` (new, 118 lines), `CHANGELOG.md` 2026-05-02 entry, T03 spec status surface, M4 README status line, LBD drift sweep, AC re-runs (import smoke + `aiw show-inputs grade`).
**Status:** ✅ PASS

---

## Design-drift check

Cross-referenced against `CLAUDE.md` (LBD-1..15), `design_docs/architecture.md`, ADR-0001 (state-service hosting), the M4 milestone README, the M4 T02 audit (`T02_issue.md`), and saved memory rules. No drift detected:

- **LBD-1 (static-by-default deploy).** `grade.py` is a Python workflow module under `cs300/workflows/`; nothing it produces lands in `dist/`. Spot-check of `dist/` shape (`dist/client`, `dist/server`) confirms unchanged shape. No API route, `.env`, local path, `127.0.0.1`, or Ollama URL ships in static output.
- **LBD-2 (two-process boundary).** Module follows the cs-300 pattern T02 established: declares a `WorkflowSpec`, calls `register_workflow(_SPEC)` at import time, and is loaded by `aiw-mcp` via `AIW_EXTRA_WORKFLOW_MODULES`. No fork or monkey-patch of `jmdl-ai-workflows`; cs-300 contributes a workflow module, not framework changes. Tier-2 `prompt_fn` is the framework-supported extension point.
- **LBD-3 (pandoc + Lua filter).** Untouched. N/A.
- **LBD-4 (reference solutions never reach DOM).** `grade.py` does not handle `questions.reference_json` or any `solution` field. `GradeOutput` carries `outcome` / `score` / `feedback` only — no leakage path. Confirmed via `grep -rn "solution\|reference_json" grade.py` → no matches. LBD-4 enforcement remains a T05 (`POST /api/questions/bulk`) / T07 (question-render UI) responsibility, unchanged by this task.
- **LBD-5 (no sandboxing on code execution).** N/A — not a code-execution path.
- **LBD-6 / LBD-7 (chapter ceiling / bounded chapter additions).** N/A — workflow code, not chapter content.
- **LBD-8 (no Jekyll polish).** N/A.
- **LBD-9 (`coding_practice/` cross-stream isolation).** Confirmed — `grade.py` does not touch `coding_practice/`.
- **LBD-10 (status-surface 4-way agreement).** See dedicated section below — passes.
- **LBD-11 (non-inferential code verification).** Spec named an explicit smoke (`aiw show-inputs grade`). Re-run produced exit 0 with the four expected fields cited in the Gate summary. AC-1 import smoke also re-run cleanly.
- **LBD-12 (cross-chapter references).** N/A.
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M4 task.
- **LBD-14 (toolchain pins).** No `.nvmrc` / `.pandoc-version` change. No new dependency added — module imports only from `pydantic` (already in tree via `jmdl-ai-workflows`) and `ai_workflows.{primitives.tiers, workflows}` (provided by the `jmdl-ai-workflows` runtime).
- **LBD-15 (sandbox-vs-host git policy).** Audit-only — no commits, push, pull, fetch, merge, or tag operations performed.
- **`nice_to_have.md` boundary.** No items adopted from `nice_to_have.md`. Out-of-spec scope is confined to (a) the `ValidateStep(target_field="outcome", ...)` choice — explicitly authorised by the spec note; (b) the structured grading prompt — within the `_build_grade_prompt` deliverable.
- **Memory rules.** No conflict with `feedback_aiw_uvx_oneshot.md` (smoke uses `uvx --from jmdl-ai-workflows ...`, never `pip` or `uv tool install`).

No drift findings.

---

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1: imports cleanly | MET | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 uvx --from jmdl-ai-workflows python -c "import cs300.workflows.grade; print('ok')"` → stdout `ok`, exit 0. | Re-run by Auditor. |
| AC-2: `aiw show-inputs grade` lists the four input fields | MET | `aiw show-inputs grade` output: `Inputs for workflow 'grade' (pass via --input KEY=VALUE):` followed by `- attempt_id (str, required)`, `- question_prompt_md (str, required)`, `- rubric_criteria (list, required)`, `- response_text (str, required)`. Exit 0. | Re-run by Auditor — full output captured in Gate summary. |
| AC-3: `GradeOutput.outcome` is the FIRST field | MET | `cs300/workflows/grade.py:44–47` — `class GradeOutput(BaseModel):` body opens with `outcome: Literal["pass", "fail", "partial"]` then `score: float` then `feedback: str`. | Pydantic field order = source order; `outcome` is line 1 of the class body. Maps to `result.artifact` per spec. |
| AC-4: `outcome` Literal or str+validator | MET | `grade.py:45` — `outcome: Literal["pass", "fail", "partial"]`. | Cleaner of the two acceptable options. |
| AC-5: `grade_tier_registry()` uses `"ollama/qwen2.5:14b"` | MET | `grade.py:24–30` — `LiteLLMRoute(model="ollama/qwen2.5:14b")` inside `TierConfig(name="grade-llm", ...)`. | Matches the `local_coder` lean documented in M4 README. |
| AC-6: `register_workflow` at module level | MET | `grade.py:117` — `register_workflow(_SPEC)` is a top-level statement (column 0, no enclosing `def` or `if __name__`). | Fires at import time, which is exactly what `AIW_EXTRA_WORKFLOW_MODULES` requires. |
| AC-7: no `import langgraph` | MET | `grep -n "^import langgraph\|^from langgraph" cs300/workflows/grade.py` → no matches (exit 1). Imports are scoped to `pydantic` and `ai_workflows.{primitives.tiers, workflows}`. | Framework abstracts LangGraph in v0.4.0 — correct. |
| AC-8: CHANGELOG entry | MET | `CHANGELOG.md:17–27` — under `## 2026-05-02`, dedicated **Added** bullet for "M4 T03 — `grade` workflow module" describing module purpose, schema (with `outcome` Literal), `prompt_fn` / Tier-2 rationale (ADV-2), `ValidateStep` choice, T08 wiring note, AC-2 smoke citation, dep-audit line. | Comprehensive. |

All 8 ACs MET.

---

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

None.

---

## Additions beyond spec — audited and justified

1. **`ValidateStep(target_field="outcome", schema=GradeOutput)` accepted by the framework on a scalar field.** The spec hedged: "If the framework requires the full model, switch target to the composite. Confirm against the framework's behavior at smoke time." The `aiw show-inputs grade` smoke succeeded (exit 0) with the spec'd composition, demonstrating the framework accepts a scalar `target_field`. Per the spec note, this is acceptable as-is — no MEDIUM finding. If a future runtime exercise (T08) surfaces a validator that rejects scalar targets at execution time, the spec's pre-authored fallback ("switch target to the composite") covers it without re-opening this task.
2. **Structured JSON-schema grading prompt with explicit rules** (`grade.py:68–90`). Within scope of the "constructs a structured grading rubric prompt" deliverable. Mirrors the T02 pattern (rules block + "Output ONLY valid JSON") and the T02 audit accepted that pattern. Use of f-strings (no `str.format()`) avoids the ADV-2 framework advisory's injection footgun on `response_text` (student-controllable input).
3. **Module docstring** (`grade.py:1–10`) cites the registration env-var, the A/B tier-override mechanism, and the T08 boundary. Within scope of the CLAUDE.md Documentation discipline rule ("every new module … gets a header comment citing the task and its relationship to other files").

No additions beyond spec require trimming.

---

## Gate summary

| Gate | Command | Result | Notes |
| -- | ------- | ------ | ----- |
| Type check | `npm run check` | NOT RUN — Python-only task, no TS changes | Per audit prompt. Node modules not installed in sandbox. |
| Lint | — | NOT RUN — no project-wide linter | Per `CLAUDE.md` Verification commands. |
| Import smoke (AC-1) | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 uvx --from jmdl-ai-workflows python -c "import cs300.workflows.grade; print('ok')"` | PASS | stdout: `ok`. Exit 0. |
| `aiw show-inputs` smoke (AC-2) | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.grade uvx --from jmdl-ai-workflows aiw show-inputs grade` | PASS | Output: `Inputs for workflow 'grade' (pass via --input KEY=VALUE):` then `- attempt_id (str, required)`, `- question_prompt_md (str, required)`, `- rubric_criteria (list, required)`, `- response_text (str, required)`. Exit 0. |
| langgraph-grep (AC-7) | `grep -n "^import langgraph\|^from langgraph" cs300/workflows/grade.py` | PASS | No matches (exit 1 = no hits, intended). |
| Build | `npm run build` | NOT RUN — workflow module change has no `dist/` impact | LBD-1 verified by inspection of `dist/{client,server}` shape (unchanged). `grade.py` is consumed by `aiw-mcp` at local runtime only. |
| Content build | `node scripts/build-content.mjs` | NOT RUN — no chapter content touched | LBD-3 N/A. |

---

## Status-surface check (LBD-10)

| Surface | Expected | Observed | Status |
| -- | -- | -- | -- |
| Per-task spec `**Status:**` | `✅ done 2026-05-02` | `tasks/T03_grade_workflow.md:3` reads `**Status:** ✅ done 2026-05-02` | ✅ |
| `tasks/README.md` row | N/A | M4 has no `tasks/README.md` | N/A |
| Milestone README task table | N/A | M4 README has a numbered `## Tasks` list, not a status table | N/A |
| Milestone README `Done when` boxes T03 satisfies | None — T03 alone does not close any `Done when` item (the `llm_graded` async-flow item closes when T08 lands) | M4 README `Done when` `llm_graded` row remains `[ ]`, correctly | ✅ |
| Milestone README status line (bonus surface) | T03 mentioned | M4 README:4 reads `🟡 in progress — T01 ✅ 2026-05-01, T02 ✅ 2026-05-02, T03 ✅ 2026-05-02` | ✅ |

No status-surface drift.

---

## Issue log — cross-task follow-up

None opened by this audit.

Existing context (informational, not findings against T03):

- **T08 (llm_graded async flow)** owns the runtime integration of `grade` via `run_workflow`. T03 ships the module; end-to-end runtime exercise is T08's job. The T08 spec is already wired with `grade` in its dependency chain (M4 README §Tasks item 7 + T03 `Blocks: T08`). No additional propagation needed.
- **LBD-4 forward-owner** remains T05 (`POST /api/questions/bulk` validation strips `solution` before any DOM-bound response) and T07 (question-render UI). Tracked in `T02_issue.md` advisories; not a T03 surface.

---

## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `cs300/workflows/grade.py`, `design_docs/milestones/m4_phase4_question_gen/tasks/T03_grade_workflow.md`, `CHANGELOG.md` (M4 T03 entry), `design_docs/milestones/m4_phase4_question_gen/README.md`
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical

None.

### High

None.

### Advisory

- **ADV-1 — `_build_grade_prompt` uses f-strings; ADV-2 pattern from T02 is upheld.** The three user-adjacent values interpolated into the LLM prompt — `question_prompt_md`, `response_text`, and `rubric_list` (derived from `rubric_criteria`) — are all composed via an f-string at lines 68–90. Zero `str.format()` calls and zero `%-style` format calls appear anywhere in the file (grep confirms). The JSON schema literal inside the f-string uses `{{` / `}}` escaping to avoid f-string misinterpretation; this is correct. A student could craft `response_text` or `question_prompt_md` containing adversarial Ollama instructions ("Ignore previous instructions…"). Under the single-user local threat model this is self-injection — the user is both attacker and victim and the only consequence is a mis-graded local practice attempt. Not a code-level security defect. **Action:** Tracking only; consistent with T02 ADV-2 disposition.
- **ADV-2 — `attempt_id` is declared in `GradeInput` but never inserted into the LLM prompt.** Field declared at line 38 as a pass-through tracer (spec: "threaded through for tracing only — the grade workflow does not call back to the state service"). `_build_grade_prompt` reads only `rubric_criteria`, `response_text`, and `question_prompt_md` from state (lines 55–57); `attempt_id` is never interpolated. Correct design — no student-trace data leaks into prompt text. **Action:** No action needed; confirms correct implementation.
- **ADV-3 — `GradeOutput.feedback` is student-facing free text produced by the local LLM; no reference-solution data is present.** `GradeOutput` has three fields: `outcome` (`Literal["pass","fail","partial"]`), `score` (`float`), `feedback` (`str`). None correspond to `questions.reference_json.solution` or any other question-private data. The workflow receives `rubric_criteria` (public, question-design-side metadata) and `response_text` (student-authored), not the reference solution. LBD-4 is not implicated at the T03 layer. T05 (`POST /api/questions/bulk`) and T07 (question-render UI) remain the forward-owners for LBD-4 enforcement, consistent with T02 ADV-1 tracking. **Action:** Tracking only; no action at T03. Confirmed not regressed.
- **ADV-4 — No `import langgraph`, no subprocess calls, no `exec`/`eval`, no `os.system`, no `importlib` dynamic loading.** AST-level grep on `cs300/workflows/grade.py` returns zero matches for all six patterns. Imports limited to `__future__.annotations`, `typing.Literal`, `pydantic.BaseModel`, and the `ai_workflows.*` framework public surface (`LiteLLMRoute`, `TierConfig`, `LLMStep`, `ValidateStep`, `WorkflowSpec`, `register_workflow`). AC-7 satisfied. **Action:** No action needed.
- **ADV-5 — No hardcoded secrets or local-path references.** The only URL-adjacent string is `"ollama/qwen2.5:14b"` in `LiteLLMRoute(model=…)` at line 28 — a LiteLLM model identifier, not an HTTP URL or `127.0.0.1` address. No `.env` values, no tokens, no Ollama base-URL references, no absolute filesystem paths. The `dist/` artifact is not affected by this Python module (never imported from `src/`). **Action:** No action needed.

### Out-of-scope concerns surfaced and dismissed

- Missing auth / rate-limiting on the grade workflow — out of scope per cs-300 threat model: single-user local, no multi-user surface.
- "Sandbox the LLM call" — out of scope under LBD-5; Ollama runs locally and is the user's own process.

### Verdict

`SHIP` — no blocking security concerns. `_build_grade_prompt` correctly uses f-strings (not `str.format()` or `%-interpolation`), matching the ADV-2 pattern T02 established. `GradeOutput` contains zero reference-solution or private-question data — LBD-4 is not implicated at this layer. No subprocess calls, no `langgraph` import, no secrets, no local-path references. Five advisory items tracked; all are moot under the single-user local threat model or correctly deferred to downstream tasks (T05, T07). No manifest changes; dep audit not required.

---

## Dependency audit

Dep audit: skipped — no manifest changes. (`grade.py` imports only from `pydantic` and `ai_workflows`, both already resolved by the `jmdl-ai-workflows` runtime; no `pyproject.toml` / `uv.lock` / `package.json` / `package-lock.json` / `requirements*.txt` / `.nvmrc` / `.pandoc-version` / Dockerfile / `docker-compose.yml` changes.)

---

## Deferred to nice_to_have

None.

## Propagation status

No new forward-deferrals introduced by this changeset. ADV-1 (LBD-4 forward-owner — T05 must strip `solution`) and ADV-3 (`GradeOutput` contains no reference data — T05/T07 remain the enforcement boundary) are continuation of T02's ADV-1 / ADV-3 dispositions; already recorded in `T02_issue.md`. No edits to T05, T07, or T08 spec files required from this audit.
