"""grade — cs-300 M4 T03 workflow module.

Evaluates a student's free-text response against a rubric using Ollama Qwen 14B.
Registered into ``aiw-mcp`` via ``AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.grade``.

A/B tier override: pass ``tier_overrides={"grade-llm": {...}}`` in the
``run_workflow`` MCP call to substitute a different route at run time.
T08 enqueues this workflow after a ``llm_graded`` attempt is submitted;
the state-service write happens in T08 after polling completes.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from ai_workflows.primitives.tiers import LiteLLMRoute, TierConfig
from ai_workflows.workflows import LLMStep, ValidateStep, WorkflowSpec, register_workflow

# ---------------------------------------------------------------------------
# Tier registry
# ---------------------------------------------------------------------------

def grade_tier_registry() -> dict[str, TierConfig]:
    return {
        "grade-llm": TierConfig(
            name="grade-llm",
            route=LiteLLMRoute(model="ollama/qwen2.5:14b"),
        )
    }


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class GradeInput(BaseModel):
    attempt_id: str
    question_prompt_md: str
    rubric_criteria: list[str]
    response_text: str


class GradeOutput(BaseModel):
    outcome: Literal["pass", "fail", "partial"]
    score: float
    feedback: str


# ---------------------------------------------------------------------------
# Prompt function
# ---------------------------------------------------------------------------

def _build_grade_prompt(state: dict) -> tuple[str | None, list[dict]]:
    rubric_criteria: list[str] = state["rubric_criteria"]
    response_text: str = state["response_text"]
    question_prompt_md: str = state["question_prompt_md"]

    rubric_list = "\n".join(f"  - {c}" for c in rubric_criteria)

    system = (
        "You are an expert CS educator grading a student's response. "
        "Evaluate objectively against the rubric criteria provided. "
        "Respond only with a valid JSON object matching the required schema — "
        "no markdown fences, no commentary."
    )

    user = f"""Grade the following student response.

Question:
{question_prompt_md}

Student response:
{response_text}

Rubric criteria:
{rubric_list}

Required output schema:
{{
  "outcome": "pass" | "fail" | "partial",
  "score": <float 0.0–1.0>,
  "feedback": "<one-paragraph explanation for the student>"
}}

Rules:
- outcome must be exactly one of: "pass", "fail", "partial"
- score 1.0 = fully correct, 0.0 = completely incorrect, values in between for partial credit
- feedback must address which rubric criteria were met and which were not
- Output ONLY valid JSON."""

    return system, [{"role": "user", "content": user}]


# ---------------------------------------------------------------------------
# WorkflowSpec
# ---------------------------------------------------------------------------

_SPEC = WorkflowSpec(
    name="grade",
    input_schema=GradeInput,
    output_schema=GradeOutput,
    tiers=grade_tier_registry(),
    steps=[
        LLMStep(
            tier="grade-llm",
            prompt_fn=_build_grade_prompt,
            response_format=GradeOutput,
        ),
        ValidateStep(
            target_field="outcome",
            schema=GradeOutput,
        ),
    ],
)

register_workflow(_SPEC)
