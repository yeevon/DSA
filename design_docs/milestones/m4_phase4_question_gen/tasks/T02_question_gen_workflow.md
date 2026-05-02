# T02 — question_gen workflow module

**Status:** todo
**Depends on:** T01 (cs300 package skeleton must exist)
**Blocks:** T04 (launch script smoke needs at least one real module), T05 (bulk endpoint
validation mirrors the output schema here), T07 (UI calls this workflow)

## Why

cs-300's primary M4 deliverable is the `question_gen` workflow module. The frontend
calls `run_workflow(workflow_id='question_gen', ...)` on `aiw-mcp`; the workflow produces
all four question types the app supports. T02 is the Python implementation.

## Workflow design

**API surface (jmdl-ai-workflows v0.4.0 WorkflowSpec):**

```python
# cs300/workflows/question_gen.py — module path for AIW_EXTRA_WORKFLOW_MODULES

class QuestionGenInput(BaseModel):
    chapter_id: str              # 'ch_4'
    section_id: Optional[str]    # 'ch_4-hashing', nullable → chapter-wide
    section_text: str            # rendered text of the section; frontend extracts it
    count: int                   # number of questions per requested type
    types: list[str]             # subset of ['mc', 'short', 'llm_graded', 'code']

class GeneratedQuestion(BaseModel):
    type: Literal['mc', 'short', 'llm_graded', 'code']
    prompt_md: str               # markdown question stem
    topic_tags: list[str]        # ≤ 3 tags
    answer_schema: dict          # type-specific JSON blob (see architecture.md §2)
    reference: dict              # type-specific reference solution

class QuestionGenOutput(BaseModel):
    questions: list[GeneratedQuestion]   # first field → result.artifact
```

**Per-type answer_schema + reference shapes (architecture.md §2):**

| type | answer_schema | reference |
|---|---|---|
| `mc` | `{options: list[str], correct_ix: int}` | `{explanation: str}` |
| `short` | `{match: 'exact'\|'fuzzy'\|'numeric', expected: str, tol?: float}` | `{explanation: str}` |
| `llm_graded` | `{rubric: list[str]}` | `{ideal_answer: str}` |
| `code` | `{lang: str, signature: str, test_cases: list[{input: str, expected: str}]}` | `{solution: str}` |

The LLM call receives the full `section_text` and a prompt instructing it to generate
`count` questions for each requested type in the above shapes. A single `LLMStep` covers
all types in one call (simpler than FanOut; the Qwen 14B context window can handle a
chapter section + the structured output spec).

**Prompt strategy:** `prompt_fn` (Tier 2) rather than `prompt_template` (Tier 1) — the
prompt is multi-part and should explicitly enumerate the requested types + the required
JSON shape per type. Using `prompt_fn` also avoids the `str.format()` injection advisory
(ADV-2 in the framework docs) since `section_text` is user-adjacent content.

**Tier:** `local_coder` → Ollama Qwen 14B (`"ollama/qwen2.5:14b"`).
cs-300 never calls a cloud LLM API at runtime (architecture.md §3.1 non-negotiable).

**Tier override (A/B harness per architecture.md §5 "Question-gen model tier" row):**
The `WorkflowSpec.tiers` dict is the tier registry. The framework's `tier_overrides` MCP
argument lets a caller substitute a different route at run time without touching the
workflow source — that is the A/B mechanism. T02 wires the default (14B); the user
experiments by passing `tier_overrides={"question-gen-llm": {...}}` in the MCP call.
No extra harness code is needed — document this in a module-level comment.

## Deliverables

1. **`cs300/workflows/question_gen.py`** — the workflow module.
   Required shape:
   - Imports only from `pydantic`, `typing`, `ai_workflows.workflows`,
     `ai_workflows.primitives.tiers`.
   - `question_gen_tier_registry() -> dict[str, TierConfig]` — returns one entry keyed
     `"question-gen-llm"` with `LiteLLMRoute(model="ollama/qwen2.5:14b")`.
   - `QuestionGenInput`, `GeneratedQuestion`, `QuestionGenOutput` pydantic models.
   - `_build_prompt(state: dict) -> tuple[str | None, list[dict]]` — the `prompt_fn`.
     Must enumerate `state['types']`, include the per-type JSON shape in the prompt, and
     pass `state['section_text']` as the content to generate from.
   - `WorkflowSpec` with `name="question_gen"`, `input_schema=QuestionGenInput`,
     `output_schema=QuestionGenOutput`, `tiers=question_gen_tier_registry()`, and a step
     sequence of `LLMStep(tier="question-gen-llm", prompt_fn=_build_prompt,
     response_format=QuestionGenOutput)` + `ValidateStep(target_field="questions",
     schema=QuestionGenOutput)`.
   - `register_workflow(_SPEC)` at module bottom.
   - Module-level comment explaining the A/B override mechanism.

2. **CHANGELOG entry** under current dated section.

## Acceptance criteria (auditor grades each individually)

- [ ] **AC-1.** `cs300/workflows/question_gen.py` exists and imports cleanly
  (`python3 -c "import cs300.workflows.question_gen"`, PYTHONPATH=repo root, exit 0).
- [ ] **AC-2 (smoke — non-inferential).** Auditor runs:
  ```bash
  PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 \
  AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen \
    uvx --from jmdl-ai-workflows aiw show-inputs question_gen
  ```
  Output lists: `chapter_id (str, required)`, `section_id (str, optional)`,
  `section_text (str, required)`, `count (int, required)`, `types (list, required)`.
  Exit 0.
- [ ] **AC-3.** `QuestionGenOutput.questions` is the **first** field (so `result.artifact`
  contains the questions list after a completed dispatch).
- [ ] **AC-4.** `question_gen_tier_registry()` returns a dict with key
  `"question-gen-llm"` and `LiteLLMRoute(model="ollama/qwen2.5:14b")`.
- [ ] **AC-5.** `LLMStep` uses `prompt_fn=` (not `prompt_template=`).
- [ ] **AC-6.** `prompt_fn` references `state['types']` and `state['section_text']`
  (confirmed by reading the source, not inferring).
- [ ] **AC-7.** `ValidateStep` targets `"questions"` with `schema=QuestionGenOutput`.
- [ ] **AC-8.** `register_workflow(_SPEC)` is called at module top level (not inside a
  function — must fire on import).
- [ ] **AC-9.** No direct `import langgraph` in the module.
- [ ] **AC-10.** CHANGELOG has an M4 T02 entry.

## Notes

- The `ValidateStep` here validates the shape of `questions` at the LangGraph-layer
  boundary. The second validation (at POST /api/questions/bulk) validates at insert time.
  Both are mandated per architecture.md §3.1 "Validation runs twice."
- Reserved state field names to avoid in schemas: `run_id`, `last_exception`,
  `_retry_counts`, `_non_retryable_failures`, `_mid_run_tier_overrides`,
  `_ollama_fallback_fired` (from framework docs writing-a-workflow.md).
- The `code` question type: the `answer_schema.test_cases` shape is
  `{input: str, expected: str}`. The `reference.solution` is the reference implementation.
  The workflow generates these via the LLM; validation at T05 confirms conformance.
- `RetryPolicy` for the `LLMStep`: accept the framework default for now. If Qwen 14B
  consistently mis-generates the structured output, T02's cycle 2 can add explicit retry
  policy tuning.
- If Ollama is not running during the AC-2 smoke, `aiw show-inputs` still works — it reads
  the schema, not the LLM. The smoke does NOT require Ollama to be up.
