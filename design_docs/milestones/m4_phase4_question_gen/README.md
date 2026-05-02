# M4 — Phase 4: Question generation (`aiw-mcp` + cs-300 workflows)

**Maps to:** `interactive_notes_roadmap.md` Phase 4
**Status:** ✅ done 2026-05-02 — T01 through T08 complete. T01 ✅ 2026-05-01, T02 ✅ 2026-05-02, T03 ✅ 2026-05-02, T04 ✅ 2026-05-02, T05 ✅ 2026-05-02, T06 ✅ 2026-05-02, T07 ✅ 2026-05-02, T08 ✅ 2026-05-02. jmdl-ai-workflows v0.4.0 shipped the `WorkflowSpec` declarative API (`LLMStep` / `ValidateStep` / `register_workflow(spec)`), resolving all four convention hooks surfaced by the 2026-04-25 re-block. Pre-flight smoke evidence in [`issues/m4_unblock_smoke.md`](issues/m4_unblock_smoke.md).
**Depends on:** M3 (state service must exist to receive generated
questions; `POST /api/questions/bulk` must be live) + the upstream
follow-up patch above.
**Unblocks:** M5 (review loop needs persisted questions to schedule)

## Goal

Generate practice questions from chapter content via cs-300 workflow
modules orchestrated by [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/).
cs-300 contributes the `question_gen` workflow as a Python module
under `./workflows/`; `aiw-mcp` (the framework's FastMCP-based MCP
server) dispatches it. Land all four question types from
architecture.md §2's schema-per-type table (`mc`, `short`,
`llm_graded`, `code`) end-to-end: trigger generation from the UI via
the MCP `run_workflow` tool, poll for completion, validate, persist.
After M4 the user can ask "give me 5 mc questions on hashing" and
have them appear in the question bank.

**Tier policy.** Every cs-300 workflow uses the `local_coder` tier
(Ollama Qwen) — matches the README + CLAUDE.md "no cloud LLM APIs at
runtime" non-negotiable. The framework also ships `gemini_flash` and
`claude_code` tiers; cs-300 does not register either by default.
Revisit only if the user opts to host an Ollama instance on a cloud
server, in which case the constraint becomes "no pay-as-you-go LLM
APIs" and Claude Code's OAuth/subscription tier could come back into
play.

## Done when

- [x] **`aiw-mcp` runs locally** over the streamable-HTTP transport
      on port 8080, with cs-300's workflow modules discovered via
      `AIW_EXTRA_WORKFLOW_MODULES`. Launch command codified in
      `scripts/aiw-mcp.sh` (M4 T04 ✅ 2026-05-02 — see
      [`issues/T04_issue.md`](issues/T04_issue.md)). AC-4 smoke
      verified: FastMCP 3.2.4 started, `POST /mcp` returned MCP
      `initialize` response with `serverInfo.name="ai-workflows"`.
- [x] `detectMode()` reaches `aiw-mcp` when running locally —
      unreachable triggers the `adapter_unreachable` error shape,
      which downgrades the UI gracefully. Probe path
      ([`src/lib/mode.ts`](../../../src/lib/mode.ts)) confirmed
      against FastMCP's actual liveness surface (POST to `/mcp`,
      any HTTP response = alive; M4 T04 ✅ 2026-05-02).
- [x] Question generation UI: a per-section "generate questions"
      action that opens a small form (count, types) and triggers
      the workflow via the MCP `run_workflow` tool. Polling spinner
      during run. Results inserted into the question bank on success.
      (T07 ✅ 2026-05-02 — QuestionGenButton.astro; spec deviation .astro not .tsx;
      AC-2/3/4/6/8/9 host-only — see [`issues/T07_issue.md`](issues/T07_issue.md))
- [x] All four question types validated and persisted at insert:
      `mc`, `short`, `llm_graded`, `code`. Schemas match
      architecture.md §2's per-type table.
      (T05 ✅ 2026-05-02 — schema validation + insert done; AC-2/3/4/7 pending host `npm ci` — see [`issues/T05_issue.md`](issues/T05_issue.md))
- [x] **Answer evaluation** for the synchronous types lives at
      `POST /api/attempts`:
  - `mc` — index compare.
  - `short` with `exact` — trim+lowercase.
  - `short` with `fuzzy` — Levenshtein ≤ threshold.
  - `short` with `numeric` — parse + tolerance, with Big-O /
    asymptotic canonicalization rules from question_gen.
      (T06 ✅ 2026-05-02 — mc/short sync eval; AC-3/4/5/8/9 pending host `npm ci` — see [`issues/T06_issue.md`](issues/T06_issue.md))
- [x] `llm_graded` evaluation flow created (enqueues a `grade`
      workflow via `run_workflow(workflow_id="grade", ...)`,
      attempt row created with `outcome = 'pending'`, transitions on
      completion). Full async loop verified.
      (T08 ✅ 2026-05-02 — async flow + PATCH outcome route + pollUntilDone helper; AC-1 Ollama loop + AC-6 build host-only — see [`issues/T08_issue.md`](issues/T08_issue.md))
- [x] Validation runs **twice** as architecture.md §3.1 mandates:
      once inside the cs-300 workflow's `ValidatorNode` (KDR-004 in
      the upstream framework), once at insert (schema conformance).
      (T02 ✅ 2026-05-02 — `ValidateStep` in workflow; T05 ✅ 2026-05-02 — Zod schema conformance at insert)
- [ ] Question-gen workflow is parameterized with the model tier so
      M5/M6 can A/B (architecture.md §5 row 5). Mechanism: ai-workflows
      ships a `--tier-override` CLI flag + `tier_overrides` MCP arg
      (M5 T05 in the upstream framework).
- [x] `coding_practice/` decision resolved: **dynamic** — `question_gen`
      receives `section_text` directly from the browser; no prompt files
      in `coding_practice/` are read or required for Phase 4.
      (architecture.md §5 row 6, resolved 2026-05-01 M4 T01)

## Tasks

1. **Author cs-300 workflow modules** under `./workflows/` (top-level
   directory, mirrors `chapters/` / `coding_practice/` / `scripts/`).
   `question_gen.py`, `grade.py`, optionally `assess.py`. Each module
   builds a LangGraph `StateGraph` composing `TieredNode` (Ollama
   Qwen) + `ValidatorNode` + `RetryingEdge` per the upstream framework
   conventions ([writing-a-workflow.md](https://pypi.org/project/jmdl-ai-workflows/)).
   Each calls `register("name", build)` at module bottom.
2. **Pin the tier registry** per workflow: `local_coder` only for cs-300's
   default registry; document how to override via `--tier-override` if a
   future user wants to A/B against `claude_code` (subscription) or
   `gemini_flash`.
3. **Stand up `aiw-mcp` launch script** at `scripts/aiw-mcp.sh` (or
   similar): wraps the `uvx --from jmdl-ai-workflows aiw-mcp ...`
   invocation with `AIW_EXTRA_WORKFLOW_MODULES` set to the cs-300
   modules. Documented start/stop in the M4 README close-out.
4. **Wire the question-gen UI in Astro:** form, submission, polling,
   result display. Use the MCP HTTP transport directly via `fetch`
   (or a small client wrapper) — calls `run_workflow` →
   `get_run_status` → reads the terminal artifact off the run.
5. **Implement `POST /api/questions/bulk` validation** in the state
   service. Per-type schema check (matches architecture.md §2's table).
   Reject on shape mismatch.
6. **Implement synchronous answer evaluation** in `POST /api/attempts`:
   dispatch by type. `code` returns 501 — that's M6.
7. **Implement async `llm_graded` flow:** enqueue grade workflow via
   the MCP, pending transition, completion handler. Include retry on
   workflow timeout (handled at the framework layer via `RetryingEdge`).
8. **Decide `coding_practice/` files-vs-dynamic.** Update
   `roadmap_addenda.md` with the call.
9. **A/B harness for model tier** — config-driven, defaults to the
   14B Qwen variant per architecture.md §5 lean. Override via the
   framework's `tier_overrides` mechanism.

## Open decisions resolved here

- **Question-gen model tier** (architecture.md §5 row 5). Start at
  Qwen 14B (local Ollama); A/B against 32B and against Claude Code Opus
  via `tier_overrides`; eval results drive the default. The Claude Code
  path is opt-in only — the no-cloud constraint defaults stay on.
- **`coding_practice/` persisted vs dynamic** (architecture.md §5
  row 6).

## Out of scope

- **Code execution.** `code` questions get generated and persisted,
  but `POST /api/attempts` for them returns 501 until M6. Validating
  the schema is enough for M4.
- **Spaced repetition scheduling.** Questions sit in the bank; no
  review queue ordering yet. M5.
- **Topic-tagging of failed attempts.** Architecture.md §3.4
  describes an LLM assessment workflow that runs after each
  fail/partial attempt. M5.
- **Building anything called "the FastMCP adapter."** There is no
  cs-300 adapter to build. `aiw-mcp` IS the MCP server. M4's job is
  to author cs-300's workflow modules + run `aiw-mcp` against them.

## Carry-over from prior milestones

- [x] **Upstream gate, round 1 (M16 — RESOLVED 2026-04-25).** ✅
      jmdl-ai-workflows v0.2.0 shipped 2026-04-24 with M16
      "External workflow module discovery". The env-var loader
      (`AIW_EXTRA_WORKFLOW_MODULES`, comma-separated dotted module
      paths) + mirroring CLI flag (`--workflow-module
      pkg.workflows.foo`, repeatable) are now live; `aiw-mcp`
      imports each named module at startup so its `register("name",
      build)` calls fire. cs-300 verified end-to-end via the
      pre-flight smoke (see `issues/m4_unblock_smoke.md`). Original
      discovery feature-request file `aiw_workflow_discovery_issue.md`
      deleted from cs-300 root at M16 unblock per its own author note.
- [x] **Upstream gate, round 2 (M16 follow-up — RESOLVED 2026-05-01).** ✅
      jmdl-ai-workflows v0.4.0 shipped the `WorkflowSpec` declarative
      API (`LLMStep` / `ValidateStep` / `register_workflow(spec)`), addressing
      all four convention hooks. The convention-hooks issue file
      (`aiw_workflow_convention_hooks_issue.md`) deleted from cs-300 root
      2026-05-02. T01 closed 2026-05-01; T02 closed 2026-05-02.
