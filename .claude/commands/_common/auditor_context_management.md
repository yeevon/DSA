# Auditor context management — input-volume rotation trigger

**Summary:** When an Auditor spawn's input volume reaches the 60K-token threshold and the
verdict is OPEN, the orchestrator rotates: the next Auditor spawn receives a compacted
input (cycle_summary.md + current diff + spec path only) instead of the standard pre-load
set. Server-side context-management strategies are deferred — this primitive is client-side
rotation only, because the Claude Code `Task` tool surface does not expose server-side
context-management knobs.

---

## Threshold and tunability

- **Default threshold:** 60 000 input tokens.
- **Override:** set `AUDITOR_ROTATION_THRESHOLD=<integer>` in the environment before
  invoking the orchestrator. Example:
  ```bash
  AUDITOR_ROTATION_THRESHOLD=40000 claude /auto-implement m4 t08
  ```

## Compaction recovery target

The compacted input should be **≤ 30 000 tokens** (cycle_summary.md + current diff + spec
path). If a compacted spawn still exceeds 30K, the diff is too large — the Builder
should be asked to split the change across cycles.

## What is and is not included in the compacted input

**Included:**

- Task spec path (pointer only — Auditor reads on-demand).
- Issue file path (pointer only).
- Current `git diff` (so the Auditor sees the actual code state).
- `runs/<task>/cycle_<N>/summary.md` content (replaces the full prior cycle's chat
  history).
- Cited LBD identifiers (compact pointer per spawn-prompt-template rule).
- Project context brief.

**NOT included after rotation:**

- Prior Builder reports' chat content.
- Prior Auditor verdict text.
- Prior tool-result content (this is what the rotation simulates clearing).
- Whole `architecture.md` content (Auditor reads on-demand — unchanged).
- Whole milestone README content (Auditor reads on-demand — unchanged).
- Prior cycle summaries beyond the most recent one.

## Rotation log

Each rotation event writes a one-line record to
`runs/<task>/cycle_<N>/auditor_rotation.txt`:

```
ROTATED: cycle <N> input_tokens=<value>; cycle <N+1> spawn input compacted (cycle_summary + diff only)
```

Iteration close-out artifacts (e.g. `runs/autopilot-*-iter*-shipped.md`) should include
any rotation events that fired during the iteration.

## Why server-side context-clearing is rejected

Claude Code's `Agent` tool frontmatter accepts a limited set of keys (`name`,
`description`, `tools`, `model`). There is no documented mechanism for the `Agent` tool
surface to read context-management directives from agent frontmatter and pass them through
to the underlying Anthropic SDK. The rotation pattern below is a client-side workaround
that does not depend on SDK-level features.

## Scope: Auditor-only

This rotation trigger applies **only to Auditor spawns**, not to Builder, sr-dev,
sr-sdet, security-reviewer, dependency-auditor, or task-analyzer:

- **Builder** — tool calls are mostly `Edit` + `Write`; result content is success/failure
  metadata (very small). No high-volume Read-heavy pattern.
- **Reviewers (sr-dev, sr-sdet, security-reviewer, dependency-auditor)** — single-pass
  spawns; they read a bounded set of files and return a verdict. No accumulation across
  cycles.
- **task-analyzer** — single-pass spec readiness check; bounded inputs.
- **Auditor** — Read-heavy by design (loads spec + architecture.md + sibling issues
  on-demand across a multi-file task). Accumulated tool-result content can dominate
  input-token cost on long-cycle audits. The rotation targets this pattern specifically.

## Integration points

- `.claude/commands/_common/cycle_summary_template.md` — defines the
  `cycle_<N>/summary.md` format; the compacted input uses this file as its structured
  summary source.
- `.claude/commands/_common/spawn_prompt_template.md` — defines the per-agent minimal
  pre-load set; the rotation builds the compacted input by stripping pre-load entries
  per the "NOT included" list above.

cs-300 does not currently ship orchestration-side telemetry (no `auditor.usage.json`
emitter). The threshold is therefore operator-judged: the orchestrator estimates input
volume from the dynamic context size in cycle N (current diff + cycle summary + issue
file) and rotates when the estimate crosses the threshold **and** the prior verdict was
OPEN. If telemetry infrastructure is added later, the threshold check can be promoted
from operator-judged to mechanical without changing this file's policy.

---

## When to apply

The rotation is invoked at cycle N+1 spawn-prompt construction time when both of the
following hold for cycle N:

1. The Auditor verdict was `OPEN` (not `PASS` — a PASS verdict closes the loop).
2. The Auditor spawn's input volume is at or above the threshold (operator-judged
   absent telemetry).

If either condition is false, use the standard pre-load set per
`.claude/commands/_common/spawn_prompt_template.md`.
