"""question_gen — cs-300 M4 T02 workflow module.

Generates practice questions from a chapter section using Ollama Qwen 14B.
Registered into ``aiw-mcp`` via ``AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen``.

A/B tier override: pass ``tier_overrides={"question-gen-llm": {...}}`` in the
``run_workflow`` MCP call to substitute a different route at run time without
touching this source. See architecture.md §5 "Question-gen model tier" row.
"""
from __future__ import annotations

import json
from typing import Literal, Optional

from pydantic import BaseModel

from ai_workflows.primitives.tiers import LiteLLMRoute, TierConfig
from ai_workflows.workflows import LLMStep, ValidateStep, WorkflowSpec, register_workflow

# ---------------------------------------------------------------------------
# Tier registry
# ---------------------------------------------------------------------------

def question_gen_tier_registry() -> dict[str, TierConfig]:
    return {
        "question-gen-llm": TierConfig(
            name="question-gen-llm",
            route=LiteLLMRoute(model="ollama/qwen2.5:14b"),
        )
    }


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class QuestionGenInput(BaseModel):
    chapter_id: str
    section_id: Optional[str] = None
    section_text: str
    count: int
    types: list[str]


class GeneratedQuestion(BaseModel):
    type: Literal["mc", "short", "llm_graded", "code"]
    prompt_md: str
    topic_tags: list[str]
    answer_schema: dict
    reference: dict


class QuestionGenOutput(BaseModel):
    questions: list[GeneratedQuestion]


# ---------------------------------------------------------------------------
# Prompt function (Tier 2 — prompt_fn avoids str.format() injection on section_text)
# ---------------------------------------------------------------------------

_TYPE_SHAPES = {
    "mc": {
        "answer_schema": {"options": ["<option_a>", "<option_b>", "<option_c>", "<option_d>"], "correct_ix": 0},
        "reference": {"explanation": "<why the correct option is correct>"},
    },
    "short": {
        "answer_schema": {"match": "exact|fuzzy|numeric", "expected": "<expected answer>"},
        "reference": {"explanation": "<explanation>"},
    },
    "llm_graded": {
        "answer_schema": {"rubric": ["<criterion 1>", "<criterion 2>"]},
        "reference": {"ideal_answer": "<ideal answer>"},
    },
    "code": {
        "answer_schema": {
            "lang": "cpp",
            "signature": "<function signature>",
            "test_cases": [{"input": "<input>", "expected": "<expected output>"}],
        },
        "reference": {"solution": "<reference implementation>"},
    },
}


def _build_prompt(state: dict) -> tuple[str | None, list[dict]]:
    types: list[str] = state["types"]
    section_text: str = state["section_text"]
    count: int = state["count"]
    chapter_id: str = state["chapter_id"]

    type_specs = "\n\n".join(
        f"Type: {t}\n"
        f"answer_schema shape: {json.dumps(_TYPE_SHAPES[t]['answer_schema'])}\n"
        f"reference shape: {json.dumps(_TYPE_SHAPES[t]['reference'])}"
        for t in types
        if t in _TYPE_SHAPES
    )

    system = (
        "You are an expert CS educator generating practice questions. "
        "Respond only with a valid JSON object matching the required schema — "
        "no markdown fences, no commentary."
    )

    user = f"""Generate {count} practice question(s) for each of the following types: {types}.

Chapter: {chapter_id}

Section content:
{section_text}

Required output schema:
{{
  "questions": [
    {{
      "type": "<one of {types}>",
      "prompt_md": "<markdown question stem>",
      "topic_tags": ["<tag1>", "<tag2>"],
      "answer_schema": <type-specific object — see shapes below>,
      "reference": <type-specific object — see shapes below>
    }}
  ]
}}

Per-type shapes:
{type_specs}

Rules:
- topic_tags must have ≤ 3 entries.
- For mc questions, correct_ix must index into the options list.
- For code questions, test_cases must be a list of {{input, expected}} objects.
- Do not use reserved field names: run_id, last_exception, _retry_counts.
- Output ONLY valid JSON."""

    return system, [{"role": "user", "content": user}]


# ---------------------------------------------------------------------------
# WorkflowSpec
# ---------------------------------------------------------------------------

_SPEC = WorkflowSpec(
    name="question_gen",
    input_schema=QuestionGenInput,
    output_schema=QuestionGenOutput,
    tiers=question_gen_tier_registry(),
    steps=[
        LLMStep(
            tier="question-gen-llm",
            prompt_fn=_build_prompt,
            response_format=QuestionGenOutput,
        ),
        ValidateStep(
            target_field="questions",
            schema=QuestionGenOutput,
        ),
    ],
)

register_workflow(_SPEC)
