# T04 — `assess` workflow module in `cs300/workflows/`

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** M4 T03 (grade workflow shape — input/output contract template), M4 T04 (aiw-mcp launch script + AIW_EXTRA_WORKFLOW_MODULES env var)
**Blocks:** T05 (trigger wires assess against POST/PATCH attempts handlers)

## Why this task exists

After every `fail` or `partial` attempt, the cs-300 review loop needs to tag the question with weak-topic labels so the gap report (T06) can aggregate them. The tagger is an LLM-driven workflow registered into `aiw-mcp` (sibling Python process per LBD-2), invoked async via `runWorkflow('assess', {...})`.

This task ships the workflow module itself — no client wiring (T05 owns that) and no UI (T06 owns the gap-report consumer).

## What to build

1. **`cs300/workflows/assess.py`** — a `WorkflowSpec` registered via the same pattern as M4 T02's `question_gen` and M4 T03's `grade`:
   - **Input schema:** `{ question_prompt_md: str, response_text: str, outcome: 'fail' | 'partial', topic_tags: list[str] }`. The question's existing `topic_tags` (from M4 generation) are provided so the workflow can extend rather than re-derive.
   - **Steps:**
     1. `LLMStep` — prompt the local Ollama model with the question prompt + response + existing topic tags + the outcome; ask for the specific topics the response missed.
     2. `ValidateStep` — confirm the LLM output is a JSON array of strings.
   - **Output schema:** `{ tags: list[str] }` — the tag list the assessor judges as the response's gaps. May overlap with input `topic_tags` (LLM may confirm an existing tag is missed) or extend it.
2. **Register the workflow** — `cs300/workflows/assess.py` exports the `WorkflowSpec` object the way `grade.py` and `question_gen.py` do. **Update `scripts/aiw-mcp.sh`** to append `cs300.workflows.assess` to the `AIW_EXTRA_WORKFLOW_MODULES` env var (current value: `cs300.workflows.question_gen,cs300.workflows.grade` — the launch script lists modules explicitly, not via wildcard, so registration is not automatic). The Builder must edit `scripts/aiw-mcp.sh` directly; no other registration path exists.
3. **Prompt template** — store the prompt as a Python string with `{question_prompt_md}`, `{response_text}`, `{outcome}`, `{topic_tags}` placeholders. Keep it under 200 lines.
4. **CHANGELOG entry** under the current dated section.

## Out of scope

- Async polling client — T05 wires the trigger; T04 ships the workflow only.
- Tag taxonomy curation (which tags are "valid") — the workflow returns whatever the LLM produces; the gap report (T06) handles aggregation.
- Embedding-based similarity grouping for tags — out of scope; T06 may surface this need.
- Tag persistence outside `attempts.llm_tags_json` — the column exists from M3, no schema change.
- Cloud LLM fallback (Anthropic / OpenAI) — local Ollama only per cs-300's threat model.

## Acceptance criteria

- [ ] **AC-1.** `cs300/workflows/assess.py` exists with a `WorkflowSpec` named `assess`.
- [ ] **AC-2.** The workflow registers under `aiw-mcp` when launched via `bash scripts/aiw-mcp.sh` (M4 T04). Verify with `curl -s http://localhost:8080/mcp -d '{"jsonrpc":"2.0","id":1,"method":"list_workflows","params":{"payload":{}}}'` — the response includes `"assess"`.
- [ ] **AC-3 (smoke — non-inferential, LBD-11).** Auditor runs:
  ```bash
  uvx --from jmdl-ai-workflows aiw run assess \
    --inputs '{"question_prompt_md":"Worst-case complexity of hash table lookup?","response_text":"O(n)","outcome":"fail","topic_tags":["hashing","Big-O"]}'
  ```
  Asserts the run completes (`status: completed`) and the artifact JSON contains a `tags` field that is a non-empty list of strings. cs-300's `feedback_aiw_uvx_oneshot.md` memory rule applies — no `pip install` / `uv tool install` for smoking; uvx oneshot only.
- [ ] **AC-4.** Prompt template lives in `cs300/workflows/assess.py` (not externally; the workflow is self-contained per the M4 T02/T03 pattern).
- [ ] **AC-5.** Module docstring cites the task and relationship to `cs300/workflows/grade.py` (sibling workflow with similar shape).
- [ ] **AC-6.** `npm run check` exits 0 (no TS impact, but verifies no accidental Astro breakage).
- [ ] **AC-7.** CHANGELOG has an M5 T04 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `uvx --from jmdl-ai-workflows aiw run assess ...` (per AC-3). `gate_parse_patterns.md` does not yet have a row for `aiw run` smokes — the orchestrator captures stdout + exit code; the pass-line is the workflow run JSON (`"status": "completed"`). If the orchestrator wants to add a regex row for `aiw run`, that's a follow-up; not required for T04.
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "LLM assessment workflow runs async after every fail or partial attempt (architecture.md §3.4). Topic tags land in attempts.llm_tags_json"

## Dependencies

- Upstream tasks: M4 T02 (question_gen workflow as the registration shape template), M4 T03 (grade workflow as the closest input-shape template), M4 T04 (aiw-mcp launch + AIW_EXTRA_WORKFLOW_MODULES).
- LBDs touched: LBD-2 (no fork of `jmdl-ai-workflows`; workflow modules register via the documented extension point), LBD-11 (named smoke required).

## Carry-over from prior audits

- [ ] **TA-LOW-1 — `gate_parse_patterns.md` has no `aiw run` smoke row** (severity: LOW, source: `issues/task_analysis.md` round 1+2 §L-1; acknowledged in T04 spec verification plan).
      The cs-300 gate-parse table lists rows for the `[<name>] ... ✓` smoke convention but no row for `uvx --from jmdl-ai-workflows aiw run <workflow>` smokes. T04's smoke (AC-3) is a `uvx` oneshot whose pass-line is the workflow run JSON (`"status": "completed"` + non-empty `tags` field). The orchestrator captures stdout + exit code directly; deterministic enough that a regex row is not blocking.
      **Recommendation:** Builder may optionally add a row to `.claude/commands/_common/gate_parse_patterns.md` covering `aiw run` smokes (pass condition: stdout JSON contains `"status": "completed"`; exit 0). Not required for T04 close — file as a follow-up if a future task introduces another `aiw run` smoke.
