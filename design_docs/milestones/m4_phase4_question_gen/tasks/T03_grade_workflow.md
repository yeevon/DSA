# T03 — grade workflow module

**Status:** ✅ done 2026-05-02
**Depends on:** T01 (cs300 package), T02 (establishes the pattern to follow)
**Blocks:** T08 (llm_graded async flow enqueues this workflow)

## Why

`llm_graded` questions require an LLM to evaluate the student's free-text response against
a rubric. `grade.py` is the cs-300 workflow module that handles this evaluation. T08 wires
the async flow; T03 delivers the module itself.

## Workflow design

**Input / output:**

```python
class GradeInput(BaseModel):
    attempt_id: str              # cs-300 attempt row id; threaded through for tracing
    question_prompt_md: str      # the question's prompt_md (context for grading)
    rubric_criteria: list[str]   # strings from answer_schema.rubric
    response_text: str           # student's submitted text

class GradeOutput(BaseModel):
    outcome: str        # first field → result.artifact; 'pass' | 'fail' | 'partial'
    score: float        # 0.0–1.0
    feedback: str       # one-paragraph explanation for the student
```

**Prompt strategy:** `prompt_fn` (Tier 2) — constructs a structured grading rubric prompt
from `rubric_criteria` and `response_text`. Returns a system prompt that establishes the
grader role and a user message containing the question + response + rubric checklist.

**Tier:** `local_coder` → Ollama Qwen 14B (`"ollama/qwen2.5:14b"`).

## Deliverables

1. **`cs300/workflows/grade.py`**
   - `grade_tier_registry() -> dict[str, TierConfig]` — key `"grade-llm"`.
   - `GradeInput`, `GradeOutput` pydantic models.
   - `_build_grade_prompt(state: dict) -> tuple[str | None, list[dict]]` — `prompt_fn`.
   - `WorkflowSpec` with `name="grade"`, `LLMStep(tier="grade-llm",
     prompt_fn=_build_grade_prompt, response_format=GradeOutput)` +
     `ValidateStep(target_field="outcome", schema=GradeOutput)`.
   - `register_workflow(_SPEC)` at module bottom.

2. **CHANGELOG entry.**

## Acceptance criteria

- [ ] **AC-1.** `cs300/workflows/grade.py` exists and imports cleanly (exit 0).
- [ ] **AC-2 (smoke — non-inferential).** Auditor runs:
  ```bash
  PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 \
  AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.grade \
    uvx --from jmdl-ai-workflows aiw show-inputs grade
  ```
  Output lists: `attempt_id`, `question_prompt_md`, `rubric_criteria`, `response_text`.
  Exit 0.
- [ ] **AC-3.** `GradeOutput.outcome` is the first field.
- [ ] **AC-4.** `outcome` type annotation constrains values to
  `Literal['pass', 'fail', 'partial']` or `str` with a validator.
- [ ] **AC-5.** `grade_tier_registry()` uses `"ollama/qwen2.5:14b"`.
- [ ] **AC-6.** `register_workflow` fires at import time (module-level call).
- [ ] **AC-7.** No direct `import langgraph`.
- [ ] **AC-8.** CHANGELOG has an M4 T03 entry.

## Notes

- `ValidateStep` targets `"outcome"` specifically, not the full `GradeOutput` model, so
  partial state is acceptable (score and feedback land as separate fields). If the
  framework requires the full model, switch target to the composite. Confirm against the
  framework's behavior at smoke time.
- `attempt_id` is threaded through the workflow for tracing only — the grade workflow does
  not call back to the state service. T08 owns the state-service write after polling.
- An `assess.py` workflow (topic-tagging of failed attempts) is listed in the M4 README
  as optional. It is deferred to M5, which owns the review loop and topic-tag display. Do
  not author `assess.py` in T03.
