"""cs-300 workflow modules consumed by ``aiw-mcp`` (jmdl-ai-workflows).

Each module here will declare a ``WorkflowSpec`` (jmdl-ai-workflows
v0.4.0 declarative API) and call ``register_workflow(spec)`` at import
time. The framework's ``AIW_EXTRA_WORKFLOW_MODULES`` env-var loader
imports every named module on ``aiw-mcp`` startup so the registrations
fire and the workflows become dispatchable via the ``run_workflow``
MCP tool.

Planned modules (authored in subsequent M4 tasks):

- ``question_gen`` (M4 T02) — generates practice questions from
  ``section_text`` for the four types in architecture.md §2 (``mc``,
  ``short``, ``llm_graded``, ``code``).
- ``grade`` (M4 T03) — async grading workflow for ``llm_graded``
  attempts.
- ``assess`` (post-M4) — topic-tagging of failed attempts; feeds the
  M5 review-loop gap-report aggregation per architecture.md §3.5.

Established by M4 T01 (2026-05-01) — see
``design_docs/milestones/m4_phase4_question_gen/tasks/T01_arch_and_package.md``.
This file is a subpackage marker only; the workflow modules themselves
land in T02/T03.
"""
