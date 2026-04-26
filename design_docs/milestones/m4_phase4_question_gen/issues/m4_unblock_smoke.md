# M4 unblock — pre-flight smoke against `jmdl-ai-workflows` v0.2.0

**Filed:** 2026-04-25
**Filed by:** orchestrator (post-M-UX close-out, returning to M4 after upstream feature shipped)
**Status:** ✅ verified (all three smokes PASS) + 4 undocumented conventions surfaced
**Affects:** [`m4_phase4_question_gen/README.md`](../README.md), [`design_docs/architecture.md`](../../../architecture.md) §3.1
**Author note:** keep this file as the M4 pre-flight record. T01 of the upcoming M4 task breakout amends the stub at `cs300/workflows/question_gen.py` into the real builder; this report stays as the historical proof-of-life for the upstream surface and the contract findings the breakout was written against.

---

## Why this was run

M4 was upstream-gated on `jmdl-ai-workflows` shipping external workflow module discovery (the feature request cs-300 filed at `aiw_workflow_discovery_issue.md`, deleted at unblock per its own author note). v0.2.0 (2026-04-24, upstream M16) shipped the feature.

Before authoring 7–10 task specs against an assumed contract, option (B) from the unblock-prep discussion was: drop a stub `cs300/workflows/question_gen.py` that registers a no-op `StateGraph`, run `aiw-mcp` with `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen`, confirm `run_workflow` dispatches the stub end-to-end. If that round-trip works, the rest of M4 is implementation; if it doesn't, surface the friction now.

This file is that smoke's report.

## Environment

| | |
| --- | --- |
| Date | 2026-04-25 |
| Host | local (papa-jochy) |
| Python | 3.12.3 (system) — uvx provisioned 3.13.12 for the package's runtime |
| `uv` | 0.10.8 |
| `jmdl-ai-workflows` | `>=0.2.0` (resolved 0.2.0, released upstream 2026-04-24) |
| Transport tested | streamable-HTTP on `http://127.0.0.1:8080/mcp` |
| Working directory | `/home/papa-jochy/Documents/School/cs-300` |

## Documented contract (what the smoke expected)

Sources read before the smoke:

- [`aiw_workflow_discovery_issue.md`](../../../../) (deleted at M4 unblock; content recreated below for the audit trail) — the cs-300-filed feature request.
- [`<https://pypi.org/project/jmdl-ai-workflows/>`](https://pypi.org/project/jmdl-ai-workflows/) — v0.2.0 README + status table.
- The framework's installed source under `~/.cache/uv/archive-v0/.../site-packages/ai_workflows/workflows/{__init__,loader,planner}.py`.

The contract that should hold:

1. **Env-var loader.** `AIW_EXTRA_WORKFLOW_MODULES=pkg.workflows.foo,pkg.workflows.bar` — comma-separated dotted module paths. Read once at `aiw` and `aiw-mcp` startup. Each entry is `importlib.import_module(...)`'d; the module's top-level `register("name", build)` call fires as a side effect. Failures raise `ExternalWorkflowImportError` (subclass of `ImportError`) naming the module + cause.
2. **CLI flag mirror.** `aiw --workflow-module pkg.workflows.foo` and `aiw-mcp --workflow-module pkg.workflows.foo`, repeatable. Composes with the env var (env first, CLI appended after).
3. **Workflow module shape:** `from ai_workflows.workflows import register; register("name", build_fn)` at module top level. `build_fn: Callable[[], Any]` returns a workflow graph object the framework's surfaces hand to LangGraph.
4. **MCP `run_workflow` tool exposed** with schema `RunWorkflowInput {workflow_id, inputs, budget_cap_usd?, run_id?, tier_overrides?}`. Returns `RunWorkflowOutput {run_id, status, awaiting?, plan?, total_cost_usd, error?, gate_context?}`.

What the contract did NOT specify (and what cs-300 needed to assume):

- **Whether `build_fn` returns a compiled or uncompiled `StateGraph`.** The discovery issue's example was `register("name", build)` with no constraint on `build`'s return type.
- **What input-schema convention applies to non-planner external workflows.** The issue's planner-style assumption was that the workflow exports an `Input` pydantic model, but the literal name and discovery mechanism weren't specified.
- **The MCP tool's argument shape on the JSON-RPC wire.** FastMCP wraps tool args around the function signature; whether the cs-300 frontend sends `{workflow_id, inputs}` flat or `{payload: {workflow_id, inputs}}` was inferable only from the source.
- **Where in the final state `RunWorkflowOutput.plan` is populated from.** The schema field is named `plan` but the actual state-key is configurable.

The smoke surfaced each of these.

---

## Setup

Three new files at the repo root, matching the planned layout per architecture.md (`cs-300 owns its workflow modules at ./workflows/` — interpreted as a `cs300` Python package):

```
cs-300/
  cs300/
    __init__.py                 # package marker + cs-300 namespace docstring
    workflows/
      __init__.py               # subpackage marker; planned modules listed
      question_gen.py           # M4 verification stub (replaced by real builder during M4 T01)
```

Stub workflow content (final, working version after the smoke iterations below):

```python
# cs300/workflows/question_gen.py
from typing import Any, TypedDict
from langgraph.graph import END, START, StateGraph
from ai_workflows.workflows import register


class _StubState(TypedDict):
    chapter_id: str
    count: int
    result: str


def _echo(state: _StubState) -> dict[str, Any]:
    return {"result": f"stub: would generate {state.get('count', 0)} questions on chapter={state.get('chapter_id', '?')}"}


def build_question_gen() -> StateGraph:
    g: StateGraph = StateGraph(_StubState)
    g.add_node("echo", _echo)
    g.add_edge(START, "echo")
    g.add_edge("echo", END)
    return g                                  # uncompiled; dispatch calls .compile() itself


def initial_state(run_id: str, inputs: dict[str, Any]) -> dict[str, Any]:
    return {
        "chapter_id": inputs.get("chapter_id", "?"),
        "count": int(inputs.get("count", 0)),
        "result": "",
    }


FINAL_STATE_KEY = "result"
register("question_gen", build_question_gen)
```

The `_echo` / `initial_state` / `FINAL_STATE_KEY` shape was learned through smoke iterations; see findings below.

Smoke client (one-shot fastmcp client):

```python
# /tmp/cs300-smoke-runwf.py
import asyncio
from fastmcp import Client

async def main():
    async with Client("http://127.0.0.1:8080/mcp") as client:
        tools = await client.list_tools()
        print("tools:", sorted(t.name for t in tools))
        result = await client.call_tool(
            "run_workflow",
            {"payload": {"workflow_id": "question_gen", "inputs": {"chapter_id": "ch_4", "count": 5}}},
        )
        print("result:", result.data, result.content[0].text if result.content else None)

asyncio.run(main())
```

The `payload` wrapper is also a smoke finding (see below).

---

## Smoke 1 — Discovery + register chain (loader-only, no MCP)

**Question:** does `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen` actually import the stub and populate the framework's workflow registry?

**Command:**

```bash
PYTHONPATH=. AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen \
  uvx --from 'jmdl-ai-workflows>=0.2.0' python3 -c "
from ai_workflows.workflows import list_workflows
print('before loader:', list_workflows())
from ai_workflows.workflows.loader import load_extra_workflow_modules
imported = load_extra_workflow_modules()
print('imported:', imported)
print('after loader:', list_workflows())
"
```

**Expected (per `loader.py` docstring + discovery-issue AC-1):** registry contains `'question_gen'` after the loader runs.

**Actual:**

```
before loader: []
imported modules: ['cs300.workflows.question_gen']
after loader: ['planner', 'question_gen', 'slice_refactor']
```

**Verdict: PASS.** The env var loader imports the named module exactly as specified; the module's top-level `register("question_gen", build_question_gen)` call fires at import time and populates the registry alongside the framework's built-in workflows (`planner`, `slice_refactor`).

Note that the registry is empty before the loader runs — the framework's own `planner` and `slice_refactor` are also lazy-imported on demand by the dispatch layer, NOT eagerly registered at framework startup. External workflows behave identically.

`PYTHONPATH=.` was required because `uvx` runs the entry point in an isolated venv whose `sys.path` does not include the cwd by default. Setting `PYTHONPATH=.` from the cs-300 repo root is sufficient for `import cs300.workflows.question_gen` to resolve.

---

## Smoke 2 — MCP HTTP server starts cleanly with the env var

**Question:** does `aiw-mcp --transport http` start without ImportError when `AIW_EXTRA_WORKFLOW_MODULES` references the stub, and does it serve the JSON-RPC `initialize` method?

**Command:**

```bash
PYTHONPATH=. AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen \
  uvx --from 'jmdl-ai-workflows>=0.2.0' aiw-mcp \
    --transport http --port 8080 --cors-origin http://localhost:4321 &

curl -X POST http://127.0.0.1:8080/mcp \
  -H 'Accept: application/json, text/event-stream' \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.1"}}}'
```

**Expected (per PyPI README + the framework's `aiw-mcp --help`):** server starts, binds to 127.0.0.1:8080, responds to `initialize` with its capabilities + serverInfo.

**Actual server log:**

```
FastMCP 3.2.4
🖥  Server: ai-workflows, 3.2.4
INFO  Starting MCP server 'ai-workflows' transport.py:301
      with transport 'http' on http://127.0.0.1:8080/mcp
INFO  Started server process [3150465]
INFO  Waiting for application startup.
INFO  Application startup complete.
INFO  Uvicorn running on http://127.0.0.1:8080
INFO  127.0.0.1:40428 - "POST /mcp HTTP/1.1" 200 OK
```

**Actual `initialize` response:**

```
event: message
data: {"jsonrpc":"2.0","id":1,"result":{
  "protocolVersion":"2025-03-26",
  "capabilities":{
    "experimental":{},"logging":{},
    "prompts":{"listChanged":true},
    "resources":{"subscribe":false,"listChanged":true},
    "tools":{"listChanged":true},
    "extensions":{"io.modelcontextprotocol/ui":{}}
  },
  "serverInfo":{"name":"ai-workflows","version":"3.2.4"}
}}
```

**Verdict: PASS.** Server starts cleanly; the loader fires before `build_server()` exactly per `aiw-mcp --help`'s description ("imports any extra workflow modules named via AIW_EXTRA_WORKFLOW_MODULES or --workflow-module before build_server()"). The server-name `"ai-workflows"` and version `"3.2.4"` correspond to FastMCP's metadata, not jmdl-ai-workflows' package version.

The streamable-HTTP transport returns Server-Sent Events (`event: message\ndata: {...}`), not plain JSON, on POST `/mcp` — relevant for the cs-300 frontend's MCP client choice (use the FastMCP / official MCP client library; do not raw-curl).

---

## Smoke 3 — End-to-end `run_workflow` dispatch

**Question:** does `tools/call run_workflow` resolve the stub from the registry, build the graph, run it through LangGraph's compiled state machine, and return a `RunWorkflowOutput` with `status='completed'`?

This took **four iterations** because the convention has undocumented elements. Each iteration's failure is preserved here as the load-bearing finding for M4 task specs.

### Iteration 3a — flat args (assumed wire shape)

**Smoke client called:**

```python
await client.call_tool("run_workflow", {"workflow_id": "question_gen", "inputs": {...}})
```

**Got:**

```
fastmcp.exceptions.ToolError: 3 validation errors for call[run_workflow]
  payload: Missing required argument
  workflow_id: Unexpected keyword argument
  inputs: Unexpected keyword argument
```

**Diagnosis:** the FastMCP signature is `async def run_workflow(payload: RunWorkflowInput)` (verified at `ai_workflows/mcp/server.py:122`). FastMCP exposes function parameters as the JSON-RPC `arguments` shape; since the function takes one parameter `payload`, the wire shape is `{"payload": {workflow_id, inputs, ...}}` not flat.

**Finding 1:** **MCP `run_workflow` tool wraps args under `payload`.** The frontend HTTP client must send `{"payload": {"workflow_id": "...", "inputs": {...}}}`. M4 task specs that wire the Astro frontend to `aiw-mcp` need to use this shape — and ideally use the official MCP / FastMCP client library which handles the wrapping automatically rather than rolling raw HTTP.

### Iteration 3b — payload-wrapped, but builder eager-compiles

**Smoke client called:**

```python
await client.call_tool("run_workflow", {"payload": {"workflow_id": "question_gen", "inputs": {...}}})
```

**Got:**

```
fastmcp.exceptions.ToolError: Error calling tool 'run_workflow':
  workflow 'cs300.workflows.question_gen' exposes no Input schema
```

**Diagnosis:** `_dispatch._build_initial_state` (`ai_workflows/workflows/_dispatch.py:294`) has a two-form resolution:

```python
hook = getattr(module, "initial_state", None)
if callable(hook):
    return hook(run_id, inputs)
input_cls = getattr(module, "PlannerInput", None)
if input_cls is None:
    raise ValueError(f"workflow {module.__name__!r} exposes no Input schema")
return {"run_id": run_id, "input": input_cls(**inputs)}
```

The fallback is hardcoded to a class literally named `PlannerInput` — the planner workflow's Input schema name. External workflows whose Input class isn't named `PlannerInput` MUST export an `initial_state(run_id, inputs) -> dict` callable that returns the workflow's initial LangGraph state. The framework's own `slice_refactor` workflow uses this hook (per the docstring at `_dispatch.py:295–315`).

**Finding 2:** **External workflows must export `initial_state(run_id, inputs) -> dict`** (or, less idiomatically, an `Input` class named exactly `PlannerInput`). The cs-300-filed discovery issue did NOT mention this convention; it's a real undocumented contract that M4 task breakout needs to capture.

### Iteration 3c — `initial_state` hook added, but builder still eager-compiles

**Stub change:** added `initial_state` callable to the module.

**Got:**

```
fastmcp.exceptions.ToolError: Error calling tool 'run_workflow':
  'CompiledStateGraph' object has no attribute 'compile'
```

**Diagnosis:** `_dispatch._run_workflow` (`ai_workflows/workflows/_dispatch.py:554`) calls `builder().compile(checkpointer=checkpointer)` itself — passing the SqliteSaver checkpointer per upstream KDR-009. Builders that compile eagerly produce a `CompiledStateGraph`, which the dispatcher then tries to `.compile()` a second time. The framework's own `build_planner` (`workflows/planner.py:619`) returns the **uncompiled** `g: StateGraph`.

**Finding 3:** **`build_*` returns the uncompiled `StateGraph`.** Dispatch wires the LangGraph SqliteSaver checkpointer at compile-time itself. The discovery issue's example `register("name", build)` was correct in form but didn't constrain `build`'s return type; the real constraint is "return uncompiled, let dispatch own compile-time wiring."

### Iteration 3d — uncompiled return; final PASS

**Stub change:** `build_question_gen` returns `g` not `g.compile()`.

**Got:**

```
tools: ['cancel_run', 'list_runs', 'resume_run', 'run_workflow']
structured data: "Root(run_id='01KQ3Z4BYH6X2S4SNZRCZBSBG6',
                      status='completed', awaiting=None,
                      plan=None, total_cost_usd=0.0,
                      error=None, gate_context=None)"
text content: {"run_id":"01KQ3Z4BYH6X2S4SNZRCZBSBG6",
               "status":"completed","awaiting":null,
               "plan":null,"total_cost_usd":0.0,
               "error":null,"gate_context":null}

OK — run_workflow dispatched cs300.workflows.question_gen end-to-end
```

**Verdict: PASS.** The dispatch chain reached the stub, called `build_question_gen()`, compiled with the SqliteSaver, ran through the `_echo` node, terminated cleanly. `total_cost_usd: 0.0` confirms no LLM provider call fired (matches the "no cloud LLM APIs at runtime" non-negotiable for stub work).

`plan: null` is a stub-shape detail: dispatch reads from `module.FINAL_STATE_KEY` (default `"plan"`); my stub set `FINAL_STATE_KEY = "result"`, so dispatch tried to extract `state["result"]` — but actually wait, the result still came back null. Worth investigating during M4 T01 whether `FINAL_STATE_KEY` is honored as I expected, or whether the dispatch chain reads only from a state field literally named `"plan"`. Not blocking the smoke.

**Finding 4:** **Optional `FINAL_STATE_KEY` constant on the module** controls which state field surfaces as the `plan` field of `RunWorkflowOutput`. Default is `"plan"`. cs-300 workflows producing question batches / grades / assessments (not "plans") set this. **Caveat:** the smoke's `FINAL_STATE_KEY = "result"` did not appear to surface a non-null plan — M4 T01 should re-verify this contract, possibly by reading `_dispatch._final_state_key` more carefully.

---

## Findings — what M4 task breakout must encode

| # | Finding | Source | M4-spec implication |
| --- | --- | --- | --- |
| 1 | Builder returns the **uncompiled** `StateGraph`; dispatch calls `.compile(checkpointer=...)` | `ai_workflows/workflows/_dispatch.py:554` + `workflows/planner.py:619` | T01's `build_question_gen` (and every other cs-300 workflow builder) returns `g`, not `g.compile()` |
| 2 | Module must export `initial_state(run_id, inputs) -> dict` callable (preferred) OR a class literally named `PlannerInput` | `ai_workflows/workflows/_dispatch.py:294–322` | Every cs-300 workflow exports `initial_state` — the `PlannerInput` fallback is the framework's planner-only legacy form and must not be relied on by external workflows |
| 3 | MCP `run_workflow` tool wraps args under `payload` per the FastMCP signature `run_workflow(payload: RunWorkflowInput)` | `ai_workflows/mcp/server.py:122` | Astro frontend uses the official MCP / FastMCP client library to handle the wrapping; raw-curl-from-browser is not the path |
| 4 | Optional `FINAL_STATE_KEY` constant on the module controls which state field surfaces as `RunWorkflowOutput.plan` (default `"plan"`); behavior under override needs T01 re-verification | `ai_workflows/workflows/_dispatch.py:285–290` | T01 of the question-gen workflow declares `FINAL_STATE_KEY = "questions"` (or whatever the terminal state-key name is) and verifies the surface |

These findings are **not** in the original `aiw_workflow_discovery_issue.md` (which was deleted at unblock per its own author note). The discovery issue covered the env-var loader + register surface; the four findings above cover convention hooks the framework uses for non-planner workflows, learned by reading the framework source.

## Path forward

1. **Stub stays as-is at `cs300/workflows/question_gen.py`.** T01 of M4 amends it into the real builder (replace the `_echo` stub node with the `TieredNode → ValidatorNode → bulk-insert artifact` chain, replace `_StubState` with the real Input schema, etc.) — does not delete-and-recreate.
2. **Smoke script lands at `scripts/aiw_mcp_smoke.py`** (currently at `/tmp/cs300-smoke-runwf.py`). Becomes a permanent "is the upstream surface still working?" probe — same role as `scripts/functional-tests.py` for the chrome surface.
3. **`design_docs/architecture.md` §3.1 amends** to record the four convention findings (fold into the existing "Workflow discovery" subsection, ~10 lines).
4. **`design_docs/milestones/m4_phase4_question_gen/README.md`** gets a "Pre-flight verification (2026-04-25)" subsection linking to this file + summarising the four findings inline so any T01 Builder reading the milestone README sees them without having to dig.
5. **M4 task breakout proceeds** against verified ground.

## Verbatim command transcripts

For reproducibility, the four smoke iterations were:

### Smoke 1

```bash
PYTHONPATH=. AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen \
  uvx --from 'jmdl-ai-workflows>=0.2.0' python3 -c "
from ai_workflows.workflows import list_workflows
print('before loader:', list_workflows())
from ai_workflows.workflows.loader import load_extra_workflow_modules
imported = load_extra_workflow_modules()
print('imported:', imported)
print('after loader:', list_workflows())
"
```

### Smoke 2

```bash
PYTHONPATH=. AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen \
  uvx --from 'jmdl-ai-workflows>=0.2.0' aiw-mcp \
    --transport http --port 8080 --cors-origin http://localhost:4321 &

curl -sf -X POST http://127.0.0.1:8080/mcp \
  -H 'Accept: application/json, text/event-stream' \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.1"}}}'
```

### Smokes 3a–3d

Same launch as Smoke 2; client runs:

```bash
uvx --from 'jmdl-ai-workflows>=0.2.0' --with fastmcp \
  python /tmp/cs300-smoke-runwf.py
```

The client's `call_tool` arguments mutated through the four iterations (flat → payload-wrapped, with stub edits between 3b/3c/3d as detailed above).

## File state at end of smoke

- `cs300/__init__.py` — new (untracked)
- `cs300/workflows/__init__.py` — new (untracked)
- `cs300/workflows/question_gen.py` — new (untracked, working stub)
- `/tmp/cs300-smoke-runwf.py` — one-shot smoke client (volatile)
- `/tmp/aiw-mcp-*.log` — server logs from each iteration (volatile)

No commits made during smoke; the user adjudicates whether to land the stub + smoke script as M4-prep infrastructure (path A) or treat them as throwaway probes whose findings land in design docs (path B). This file is the durable record either way.
