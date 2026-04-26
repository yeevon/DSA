# jmdl-ai-workflows feature request: document + clean the external-workflow convention hooks

**Filed by:** cs-300 (downstream consumer) — see [`design_docs/milestones/m4_phase4_question_gen/issues/m4_unblock_smoke.md`](design_docs/milestones/m4_phase4_question_gen/issues/m4_unblock_smoke.md) for the four-iteration smoke that surfaced these findings.
**Filed:** 2026-04-25
**Affects:** jmdl-ai-workflows v0.2.0 (M16 shipped the discovery loader; this proposes the follow-on documentation + dispatch cleanup).
**Sibling/predecessor:** the original cs-300-filed `aiw_workflow_discovery_issue.md` (deleted 2026-04-25 once v0.2.0 / M16 shipped). M16 made discovery work; this file is the M16 post-mortem.
**Author note:** delete this file from cs-300's root once the upstream patch ships and cs-300's M4 task specs cite the released version.

---

## Context

cs-300 ran a four-iteration smoke against `aiw-mcp` (v0.2.0) to verify the `AIW_EXTRA_WORKFLOW_MODULES` discovery surface dispatches external workflow modules end-to-end before authoring M4's task breakout. Smokes 1 + 2 + 3 ultimately pass; smoke 3 took **four iterations** to land. Each failed iteration revealed an undocumented contract that cs-300's authoring path had no way to know about. Full transcripts in [`m4_unblock_smoke.md`](design_docs/milestones/m4_phase4_question_gen/issues/m4_unblock_smoke.md).

Two diagnoses, one root:

1. **Documentation gap.** The README's "External workflows from a downstream consumer" pointer + the discovery-issue spec (which cs-300 itself authored, against the same documentation) cover the env-var loader + `register("name", build)` surface. They do **not** call out the four hooks below. A cs-300-shaped consumer reading both surfaces would hit all four iterations the smoke hit — and would not know to look at the framework source.
2. **Layer-leaky dispatch.** `_dispatch._build_initial_state` falls back to `getattr(module, "PlannerInput", None)` — a literal string match against the planner workflow's class name. That's a `surfaces`/`workflows-internal-dispatch` layer reaching into `workflows.planner` by name. Every external workflow has to either supply an `initial_state` hook or name its Input class `PlannerInput`, which is absurd for a `question_gen` / `grade` / `assess` workflow.

## The four undocumented hooks

| # | Hook | Where dispatch reads it | What documentation says | What's actually required |
| --- | --- | --- | --- | --- |
| 1 | Builder return type | `_dispatch._run_workflow:554` calls `builder().compile(checkpointer=checkpointer)` | "build_fn returns a workflow graph object" (informally — discovery issue line 24) | Builder MUST return uncompiled `StateGraph`; eager compile produces `CompiledStateGraph` whose `.compile()` raises |
| 2 | Initial-state convention | `_dispatch._build_initial_state:294–322` checks `getattr(module, "initial_state", None)` then falls back to `getattr(module, "PlannerInput", None)` | Not mentioned in README or discovery issue | Module MUST export `initial_state(run_id, inputs) -> dict` (or have an Input class literally named `PlannerInput`) |
| 3 | MCP tool wire shape | `mcp/server.py:122` declares `async def run_workflow(payload: RunWorkflowInput)` — FastMCP wraps args | README's example invocation is via `claude mcp add ai-workflows ...` (auto-handled); JSON-RPC wire shape never shown | Browser-origin clients must wrap args under `payload`: `{"name":"run_workflow","arguments":{"payload":{"workflow_id":"...","inputs":{...}}}}` |
| 4 | Final-state extraction key | `_dispatch._final_state_key:285–290` reads `getattr(module, "FINAL_STATE_KEY", "plan")` | Not mentioned anywhere | Optional module-level constant; cs-300's smoke set `FINAL_STATE_KEY = "result"` and the resulting `RunWorkflowOutput.plan` was still `null` — possibly a separate bug in the dispatch reader, possibly a misunderstanding by cs-300 reading the source. Worth re-verification on the upstream patch side. |

## Proposal

Two parts: a documentation pass and a small dispatch refactor.

### Part A — Documentation pass (`docs/writing-a-workflow.md`)

Add (or expand, if it exists) the **"External workflows from a downstream consumer"** section to explicitly list the four hooks every external workflow module must satisfy. A worked example consumer module — say a hypothetical `myorg.workflows.planner_lite` — that actually works end-to-end against `aiw-mcp run_workflow`. Specifically:

- Builder return type — single sentence: "Return the uncompiled `StateGraph`; the framework calls `.compile(checkpointer=...)` itself per KDR-009."
- `initial_state(run_id, inputs)` hook — explicit example showing the input dict → state dict translation. Note the legacy `PlannerInput` fallback path is planner-only and external workflows should always use the hook.
- MCP wire shape — show the wrapped JSON-RPC body for browser-origin clients. Mention that the official MCP / FastMCP client SDK handles the wrapping automatically.
- `FINAL_STATE_KEY` — single sentence: "Module-level constant (default `'plan'`) controlling which state field surfaces as `RunWorkflowOutput.plan`."

Plus a one-line pointer at the top of the framework README's `## MCP server` section to the new docs anchor.

### Part B — Dispatch refactor (small, additive)

Replace the `PlannerInput`-literal fallback in `_dispatch._build_initial_state` with a generic Input-class lookup that any external workflow can satisfy:

```python
# ai_workflows/workflows/_dispatch.py — current shape (M16)

def _build_initial_state(module, run_id, inputs) -> dict[str, Any]:
    hook = getattr(module, "initial_state", None)
    if callable(hook):
        return hook(run_id, inputs)
    input_cls = getattr(module, "PlannerInput", None)   # ← LITERAL planner-only name
    if input_cls is None:
        raise ValueError(f"workflow {module.__name__!r} exposes no Input schema")
    return {"run_id": run_id, "input": input_cls(**inputs)}


# ai_workflows/workflows/_dispatch.py — proposed shape

def _build_initial_state(module, run_id, inputs) -> dict[str, Any]:
    hook = getattr(module, "initial_state", None)
    if callable(hook):
        return hook(run_id, inputs)

    # New: workflows declare their Input class via a module-level
    # `INPUT_CLASS` attribute. This replaces the planner-name-literal
    # fallback (KDR-?).
    input_cls = getattr(module, "INPUT_CLASS", None)
    if input_cls is None:
        # Backward-compat: keep the legacy PlannerInput fallback for
        # in-tree planner.py only. External workflows MUST set either
        # `initial_state` or `INPUT_CLASS`.
        input_cls = getattr(module, "PlannerInput", None)
        if input_cls is None:
            raise ValueError(
                f"workflow {module.__name__!r} exposes no Input schema. "
                f"Define either an `initial_state(run_id, inputs) -> dict` "
                f"callable or an `INPUT_CLASS` module attribute pointing at "
                f"a pydantic BaseModel. See docs/writing-a-workflow.md "
                f"§External workflows."
            )
    return {"run_id": run_id, "input": input_cls(**inputs)}
```

The `INPUT_CLASS` form lets external workflows use a clean named Input class (`QuestionGenInput`, `GradeInput`, `AssessInput`) without the layer-leak. The planner stays exactly as-is via the backward-compat branch. The error message points to the new docs section.

### Part C — Verify / fix `FINAL_STATE_KEY` honoring (defect-suspect)

cs-300's smoke set `FINAL_STATE_KEY = "result"` on the stub workflow module; the resulting `RunWorkflowOutput.plan` field came back `null` despite the stub's `_echo` node populating `state["result"]`. Three candidate explanations:

1. The dispatch's `_final_state_key` is read but the value-extraction step still reads `state["plan"]` literally (defect).
2. The state field name has to match what dispatch's terminal-node reader expects, not what `FINAL_STATE_KEY` declares (different convention than the smoke assumed).
3. cs-300's smoke misread the source.

Worth a quick re-verify on the upstream patch side. If (1) is true, this is a one-line dispatch fix. If (2) or (3), the docs proposal in Part A captures the actual convention so future consumers don't trip over it.

## Acceptance criteria

- AC-1: `docs/writing-a-workflow.md` gains an "External workflows from a downstream consumer" section listing all four hooks with at least one working code example.
- AC-2: `_dispatch._build_initial_state` accepts `INPUT_CLASS` module attribute as a planner-name-agnostic Input-schema declaration.
- AC-3: Existing planner workflow continues to work unchanged (backward-compat via the legacy `PlannerInput` fallback in `_build_initial_state`, used only by in-tree workflows).
- AC-4: Hermetic test (`tests/workflows/test_external_module_loader.py` or sibling) showing an external workflow registering + dispatching against `INPUT_CLASS`, not `PlannerInput`. Should mirror cs-300's stub shape.
- AC-5: Error path tested: a module exporting neither `initial_state` nor `INPUT_CLASS` (nor `PlannerInput`) raises a `ValueError` whose message names both legitimate hook surfaces and points at the docs section.
- AC-6: `FINAL_STATE_KEY` honoring re-verified — either fixed (if defect) or documented (if cs-300 misread).
- AC-7: Framework README's `## MCP server` section gains a one-line pointer to the docs anchor (and ideally a one-paragraph block showing the wrapped wire shape for browser-origin consumers using raw JSON-RPC).

## KDR / layer-contract alignment

- **KDR-001 (LangGraph substrate):** unaffected — proposal is dispatch-internal + docs.
- **KDR-002 (MCP portable surface):** unaffected — no MCP schema change. The wire-shape docs change is descriptive, not structural.
- **KDR-005 (primitives layer preserved):** unaffected.
- **KDR-008 (FastMCP schemas as public contract):** unaffected — `RunWorkflowInput` schema unchanged.
- **KDR-009 (LangGraph SqliteSaver owns checkpoints):** documented — the "builder returns uncompiled" finding is exactly KDR-009 in action.
- **KDR-013 (user-owned external code):** strengthened — the cleaner `INPUT_CLASS` surface lets external workflows declare their schema without layer leak, while preserving the user-owned-code contract (no lint, test, or sandbox of imported modules).

`import-linter` 4 contracts unaffected — `_dispatch.py` already imports stdlib + `ai_workflows.workflows`-internal types only.

## Out of scope

- **Per-workflow tier-registry overrides via env var.** Already addressed by M5 T05's `--tier-override` flag.
- **Schema-driven MCP tool generation** — exposing each workflow as its own MCP tool with a per-workflow input schema, instead of the generic `run_workflow(payload)` tool. Larger refactor; revisit when a consumer actually wants per-workflow MCP tool surfacing.
- **Sandboxing / import isolation of downstream modules.** Same out-of-scope rationale as the original discovery issue: solo-developer-substrate framework, full Python privileges acceptable, revisit when multi-user hosting becomes a concern.

## Reversibility

Documentation pass is purely additive. The dispatch refactor adds an optional module attribute (`INPUT_CLASS`) and a backward-compat branch; removing it is one block-deletion. No public-contract change at the MCP layer or the workflow registry's surface.

## Reference: downstream consumer use case (cs-300)

cs-300's M4 milestone is on hold pending this patch. With the patch landed, cs-300's planned `cs300/workflows/question_gen.py` will be:

```python
from cs300.workflows._base import register_workflow
from cs300.workflows.schemas import QuestionGenInput
from langgraph.graph import END, START, StateGraph


def build_question_gen() -> StateGraph:
    g = StateGraph(QuestionGenState)
    # ... TieredNode → ValidatorNode → bulk-insert artifact chain ...
    return g


register_workflow(
    "question_gen",
    build_graph=build_question_gen,
    input_schema=QuestionGenInput,        # → INPUT_CLASS, no `initial_state` boilerplate
    final_state_key="questions",          # → FINAL_STATE_KEY
)
```

Where `cs300.workflows._base.register_workflow` is a thin cs-300-side adapter that:

- Calls `ai_workflows.workflows.register(name, build_graph)` for the registration.
- Sets `module.INPUT_CLASS = input_schema` (post-patch) or supplies an `initial_state` hook (pre-patch fallback) on the calling module.
- Sets `module.FINAL_STATE_KEY = final_state_key`.

The adapter exists only so cs-300's three planned workflows (`question_gen`, `grade`, `assess`) don't each repeat the four-hook boilerplate. It's strictly cs-300-internal; the framework patch is what makes the boilerplate small enough that the adapter's a reasonable convenience rather than a wart-hider.

If the patch ships before cs-300's M4 T01 lands, the adapter can target the clean post-patch surface. If cs-300 needs to ship M4 against the M16-era surface, the adapter pre-shims the eventual cleanup so cs-300's workflow modules don't need a follow-up rewrite.
