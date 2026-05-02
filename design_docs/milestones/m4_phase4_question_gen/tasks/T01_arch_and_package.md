# T01 — Architecture grounding + cs300 Python package scaffold

**Status:** ✅ done 2026-05-01
**Depends on:** M3 (closed 2026-04-24), jmdl-ai-workflows ≥ 0.4.0
**Blocks:** T02, T03 (workflow modules need the package to exist)

## Why

Two grounding actions before any M4 implementation:

1. **Architecture drift.** `design_docs/architecture.md` §3.1 was written against the
   jmdl-ai-workflows v0.2.0 / M16 Tier-4 surface (`TieredNode`, `ValidatorNode`,
   `RetryingEdge`, `register("name", build_fn)` escape hatch). v0.4.0 ships the
   `WorkflowSpec` declarative API (`LLMStep`, `ValidateStep`, `register_workflow(spec)`) as
   the primary authoring path — Tier 4 is preserved but explicitly an escape hatch for
   non-standard topologies. cs-300's §3.1 must reflect the surface T02/T03 will actually use.

2. **Python package absent.** The cs300 Python package (`cs300/workflows/*.py`) does not
   exist yet. The unblock smoke (2026-04-25) confirmed `PYTHONPATH=.` is sufficient for
   `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen` to resolve — but that requires
   `cs300/__init__.py` + `cs300/workflows/__init__.py` on disk. T02 and T03 can't land
   without the package skeleton.

3. **Convention-hooks issue file.** `aiw_workflow_convention_hooks_issue.md` (repo root)
   was tagged "delete once the upstream patch ships." v0.4.0 closes all four hooks. Delete it.

4. **coding_practice/ decision.** architecture.md §5 lists this as an M4 open decision.
   The actual `coding_practice/` content is user coding exercises in C++/Python/pseudocode
   (not ai-workflows prompt files). Resolution: question generation is **dynamic** —
   the workflow receives `section_text` directly and generates from it; no static prompt corpus
   is consumed. `coding_practice/` remains the user's coding exercise workspace unchanged.
   Document the call in `design_docs/roadmap_addenda.md` and architecture.md §5.

## Deliverables

### A — architecture.md §3.1 update

Replace the paragraph opening "The module is a LangGraph `StateGraph` composed of
`TieredNode`..." with WorkflowSpec language:

- Module is a `WorkflowSpec` (v0.4.0 declarative API); uses `LLMStep` (routed to
  `local_coder` / Ollama Qwen tier via `TierConfig`) + `ValidateStep`; no direct
  `import langgraph`.
- `register_workflow(spec)` at module bottom (not the Tier-4 `register("name", build_fn)`).
- Discovery subsection: update `register("name", build)` references to `register_workflow(spec)`.
- Input shape: update `{chapter_id, section_id?, count, types}` →
  `{chapter_id, section_id?, section_text, count, types}`. The `section_text` field carries
  the rendered chapter/section text the frontend has in-page; the workflow generates from it.
  This decouples the Python workflow from the repo filesystem.
- Drop the stale paragraph referencing the convention-hooks issue file (resolved; the
  "Workflow discovery" subsection text that pre-dated v0.4.0 should match the current docs).
- Artifact field: `RunWorkflowOutput.artifact` (not `.plan`); `.plan` is a deprecated alias
  preserved through the 0.2.x line, removed at 1.0. New code uses `.artifact`.

### B — architecture.md §5 open decision row

Mark the `coding_practice/` row resolved: "**resolved: dynamic** — question_gen workflow
receives `section_text` directly; `coding_practice/` is the user's C++/Python/pseudocode
coding-exercise workspace, not a prompt corpus. No Phase 4 prompt files needed."

### C — aiw_workflow_convention_hooks_issue.md — delete

Per its own author note: "delete this file from cs-300's root once the upstream patch ships."
v0.4.0 resolves all four hooks via the WorkflowSpec API. Delete it.

### D — Python package scaffold

```
cs300/
  __init__.py                # package marker; one-line cs-300 namespace docstring
  workflows/
    __init__.py              # subpackage marker; lists planned modules
```

No logic — markers only. T02 and T03 add the workflow files.

### E — pyproject.toml

Minimal `[project]` declaration for the `cs300` package:
```toml
[project]
name = "cs300"
version = "0.1.0"
requires-python = ">=3.12"
# No install-time dependencies — ai-workflows is the runtime, loaded separately via uvx.
```

Editable-install note (for the task spec record, not a deliverable): running the project
does NOT require `pip install -e .` because `PYTHONPATH=<repo_root>` is sufficient for the
uvx isolation model the launch script uses (confirmed by unblock smoke 1). The pyproject.toml
is for tooling + type-checker discoverability only.

### F — M4 README updates

- Flip carry-over `[ ]` → `[x]` for "Upstream gate, round 2 (M16 follow-up — OPEN)".
- Update `**Status:**` from "todo — re-blocked 2026-04-25..." to "🟡 in progress — T01 of
  the M4 task breakout underway. jmdl-ai-workflows v0.4.0 resolves all four convention hooks.
  aiw_workflow_convention_hooks_issue.md deleted 2026-05-01."
- Add task table (see § Task table format below).

### G — CHANGELOG entry

Under today's dated section (`## [Unreleased]` or current date heading):

```
### Added
- M4 T01 — Architecture grounding + Python package scaffold (T01).
  cs300/ Python package skeleton (pyproject.toml + __init__.py files).
  architecture.md §3.1 updated to WorkflowSpec language (v0.4.0);
  §5 coding_practice/ decision resolved (dynamic). Convention-hooks issue
  file deleted (upstream resolved in v0.4.0). M4 status flipped to in-progress.
  Files touched: design_docs/architecture.md, design_docs/roadmap_addenda.md,
  aiw_workflow_convention_hooks_issue.md (deleted), cs300/__init__.py,
  cs300/workflows/__init__.py, pyproject.toml,
  design_docs/milestones/m4_phase4_question_gen/README.md, CHANGELOG.md.
  Dep audit: skipped — no manifest changes.
```

## Acceptance criteria (auditor grades each individually)

- [ ] **AC-1.** `design_docs/architecture.md` §3.1 no longer uses `TieredNode`,
  `ValidatorNode`, `RetryingEdge`, or `register("name", build_fn)` as the primary
  authoring surface; uses `WorkflowSpec`, `LLMStep`, `ValidateStep`,
  `register_workflow(spec)` instead.
- [ ] **AC-2.** architecture.md §3.1 input shape includes `section_text`; the frontend
  description reflects that the browser sends the rendered text of the section.
- [ ] **AC-3.** architecture.md §3.1 references `RunWorkflowOutput.artifact` (not `.plan`).
- [ ] **AC-4.** architecture.md §5 `coding_practice/` row is resolved (dynamic generation).
- [ ] **AC-5.** `aiw_workflow_convention_hooks_issue.md` is gone from the repo root
  (`ls design_docs/../aiw_workflow_convention_hooks_issue.md` fails).
- [ ] **AC-6.** `pyproject.toml` exists at repo root, declares `cs300` package,
  `requires-python = ">=3.12"`.
- [ ] **AC-7.** `cs300/__init__.py` and `cs300/workflows/__init__.py` both exist.
- [ ] **AC-8 (smoke — non-inferential).** Auditor runs:
  ```bash
  PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 \
    python3 -c "import cs300.workflows; print('ok')"
  ```
  Output is `ok`, exit 0.
- [ ] **AC-9.** M4 README carry-over checkbox for round 2 is `[x]`.
- [ ] **AC-10.** CHANGELOG has an M4 T01 entry under the current dated section.
- [ ] **AC-11.** `roadmap_addenda.md` records the `coding_practice/` decision.

## Notes

- Architecture.md §3.1 still mentions cs-300 workflow modules live under `./workflows/`
  (conceptual top-level). The actual Python import path is `cs300.workflows.*` (inside the
  `cs300/` package at repo root). The Builder should align any text that says `./workflows/`
  to `cs300/workflows/` so the path is unambiguous.
- The `local_coder` tier model string for Ollama Qwen: use `"ollama/qwen2.5:14b"` (matches
  architecture.md §5 "14B start" lean + jmdl-ai-workflows tier docs convention).
  This value appears first in T02's tier registry — T01 just establishes the architectural
  intent in the doc update.
- Do not update the architecture.md §6 "jmdl-ai-workflows internals" note — it correctly
  says this is a closed surface.
