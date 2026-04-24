# jmdl-ai-workflows feature request: external workflow module discovery

**Filed by:** cs-300 (downstream consumer) — see `design_docs/milestones/m4_phase4_question_gen/` for the consuming use case.
**Filed:** 2026-04-24
**Affects:** jmdl-ai-workflows v0.1.3 (feature does not exist; this proposes adding it).
**Author note:** delete this file from cs-300's root once the feature ships in jmdl-ai-workflows and cs-300's M4 task specs cite the released version.

---

## Context

cs-300 is a course-notes repo that wants jmdl-ai-workflows to orchestrate domain-specific workflows (`question_gen`, `grade`, `assess`). These workflows are course-material-specific — they have no general value to other ai-workflows consumers and should not ship inside the wheel.

Per [`docs/writing-a-workflow.md`](https://pypi.org/project/jmdl-ai-workflows/), the documented authoring path is `ai_workflows/workflows/<name>.py` — i.e., inside the package source tree. The dispatch path (per the M3 T04 changelog: "lazy workflow-module importer that emits the registered set on typo") imports `ai_workflows.workflows.<name>` from the `workflow_id` argument; the registry is populated by `register("name", build)` calls that fire at module import time.

A downstream consumer authoring `cs300/workflows/question_gen.py` has no documented way to make `aiw` or `aiw-mcp` discover that module. Today's options are all bad:

- Forking jmdl-ai-workflows and dropping the workflow into the source tree (loses upstream sync; ships domain-specific code in the wheel).
- Monkey-patching `_dispatch._import_workflow_module` at runtime (fragile; breaks on every upstream rename).
- Publishing the consumer (cs-300) as a pip-installable package (overkill for a single-machine course-notes repo).

## Proposal

Add a startup-time module loader that imports a configurable list of extra workflow modules. Each module's `register("name", build)` calls fire at import time; the existing dispatch lookup keeps working unchanged.

Two surfaces:

1. **Env var (primary):** `AIW_EXTRA_WORKFLOW_MODULES` — comma-separated dotted module paths. Read once at `aiw` and `aiw-mcp` startup. Each entry is `importlib.import_module(...)`d; failure raises a clear error naming the failing module + cause.
2. **CLI flag (mirror):** `aiw --workflow-module <dotted>` and `aiw-mcp --workflow-module <dotted>`, repeatable. Composes with the env var (CLI entries appended after env entries, so a CLI flag can shadow / extend an env-var configured baseline).

Both surfaces import each module exactly once. Re-imports are idempotent (Python's import system; the registry's `register` call is documented as no-op on identical re-registration per M3 T01).

## API surface

```python
# ai_workflows/workflows/loader.py (new)

import importlib
import os
from typing import Iterable


class ExternalWorkflowImportError(ImportError):
    """Raised when a module named in AIW_EXTRA_WORKFLOW_MODULES or
    via --workflow-module fails to import."""

    def __init__(self, module_path: str, cause: BaseException) -> None:
        super().__init__(
            f"failed to import external workflow module {module_path!r}: "
            f"{type(cause).__name__}: {cause}"
        )
        self.module_path = module_path
        self.cause = cause


def load_extra_workflow_modules(
    *, cli_modules: Iterable[str] | None = None
) -> list[str]:
    """Import each named module so its `register(...)` calls fire.

    Module sources, in import order:
      1. The `AIW_EXTRA_WORKFLOW_MODULES` env var (comma-separated).
      2. The `cli_modules` argument (CLI source).

    CLI entries land *after* env entries so a `--workflow-module`
    flag can re-import / extend an env-var baseline.

    Returns the list of module names that were successfully imported.
    Raises `ExternalWorkflowImportError` (subclass of `ImportError`)
    on any failure, naming the module + the underlying cause.
    """
```

Wire-up sites (per the four-layer contract: `surfaces` calls the loader; `workflows.loader` imports `importlib` + stdlib only):

- `ai_workflows/cli.py` — root Typer callback (after `configure_logging`, before any subcommand body). Accepts repeatable `--workflow-module` option.
- `ai_workflows/mcp/__main__.py` — `main` function (after `configure_logging`, before `build_server().run()`). Accepts repeatable `--workflow-module` option.

## Acceptance criteria

- AC-1: `AIW_EXTRA_WORKFLOW_MODULES=pkg.workflows.foo aiw run foo --goal '...'` dispatches `foo` (assuming `pkg.workflows.foo` is on `PYTHONPATH` and calls `register("foo", build)`).
- AC-2: Same env var with `aiw-mcp` (stdio + HTTP transports) makes `run_workflow(workflow_id="foo", ...)` succeed.
- AC-3: `aiw --workflow-module pkg.workflows.foo run foo --goal '...'` (no env var) dispatches `foo`.
- AC-4: Multiple comma-separated entries all import; all `register` calls fire.
- AC-5: A non-importable entry raises `ExternalWorkflowImportError` naming the module + the underlying cause; aborts startup (no partial-load state — the registry is not mutated for any module if any one fails).
- AC-6: A module that imports cleanly but fails to register the expected name is NOT a startup error — `aiw run <missing>` still surfaces "workflow 'X' not registered; known: [...]" cleanly (existing M3 T04 behaviour).
- AC-7: Idempotence — re-running `aiw` in the same Python session (e.g. via `pytest.MonkeyPatch.setenv` + repeated `CliRunner.invoke`) does not raise on duplicate registration.
- AC-8: Hermetic tests (no network, no real provider): one test per surface (CLI + MCP) demonstrating the round-trip with a stub workflow registered from `tmp_path` via `sys.path` manipulation.
- AC-9: Docs — `docs/writing-a-workflow.md` gains a "Using your workflow from a downstream consumer" section showing both env-var and CLI-flag surfaces; root `README.md` `## MCP server` section gains a one-line pointer.

## Test plan

- `tests/workflows/test_external_module_loader.py` (new) — six tests:
  - Single env-var module imports + registers.
  - Comma-separated multi-module imports + registers all.
  - CLI-list-only import + register.
  - Env + CLI compose; env imports first, CLI appended.
  - Non-importable module raises `ExternalWorkflowImportError` naming module + cause; registry untouched.
  - Idempotent re-load (second call is a no-op for already-imported modules).
- `tests/cli/test_external_workflow.py` (new) — one test: env-var path drives `aiw run <external>` end-to-end against a stub workflow registered from `tmp_path`.
- `tests/mcp/test_external_workflow.py` (new) — one test mirroring the MCP surface for both stdio + HTTP transports.

All tests hermetic. The `tmp_path` workflow stub registers a one-node `StateGraph` that returns a fixed string — exercises the discovery + dispatch chain without firing a provider call.

## KDR / layer-contract alignment

- KDR-001 (LangGraph substrate): unaffected — loader is import-time only.
- KDR-002 (MCP portable surface): preserved — both surfaces gain the same mechanism; no MCP schema change.
- KDR-005 (primitives layer preserved): unaffected — loader lives under `workflows/` (M2 T01's registry home).
- KDR-008 (FastMCP schemas as public contract): no schema change.
- KDR-009 (LangGraph SqliteSaver owns checkpoints): unaffected.

`ai_workflows/workflows/loader.py` imports stdlib + uses `importlib`. No new layer crossing. `import-linter` 4 contracts kept.

## Out of scope

- **Entry-point group** (`[project.entry-points."ai_workflows.workflows"]`) — defer until a consumer actually wants to publish a wheel. Env var + CLI flag cover the cs-300-style ad-hoc consumer; entry points are a follow-on if/when needed.
- **Workflow hot-reload** — no consumer asks for it.
- **Per-workflow tier-registry overrides via env** — outside this feature; M5 T05 already ships `--tier-override` for the dispatch-time slice.
- **Sandboxing / import isolation** — downstream modules execute with full Python privileges as part of the same process. Acceptable for a solo-developer-substrate framework; revisit when multi-user hosting becomes a concern.

## Reversibility

Pure surface addition. Removing the loader is one file deletion + removing the env-var read + the CLI flag in both surfaces. No schema implications. No public-contract change at the MCP layer.

## Reference: downstream consumer use case (cs-300)

cs-300 will run `aiw-mcp` locally with:

```bash
AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade \
  uvx --from jmdl-ai-workflows aiw-mcp \
    --transport http --port 8080 --cors-origin http://localhost:4321
```

The Astro frontend (running on `localhost:4321`) calls `run_workflow(workflow_id="question_gen", inputs={...})` over the HTTP transport. cs-300 owns its workflow modules at `./workflows/`; the wheel stays domain-agnostic.

The local Ollama daemon backs every cs-300 workflow's LLM tier (matches cs-300's "no cloud LLM APIs at runtime" non-negotiable). The `claude_code` and `gemini_flash` tiers are available but unused by cs-300's default tier registry until that constraint is explicitly relaxed.
