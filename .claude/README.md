# cs-300 Claude workflow

This directory contains the cs-300 instantiation of the project-development workflow.

## Contents

- `agents/` — subagent prompts.
- `agents/_common/` — shared rules every subagent reads (`non_negotiables.md`, `verification_discipline.md`).
- `commands/` — slash-command procedures.
- `commands/_common/` — shared command templates (`cycle_summary_template.md`, `effort_table.md`, `gate_parse_patterns.md`).
- `skills/` — `project-development/SKILL.md`.

## Project contract

The workflow defers to [`/CLAUDE.md`](../CLAUDE.md) for project rules: load-bearing decisions LBD-1..14, threat model, status-surface 4-way (LBD-10), code-vs-content verification (LBD-11), the dependency audit gate, and the autonomous-mode boundary.

## Subagents (in `agents/`)

| Agent | Purpose |
| --- | --- |
| `task-analyzer` | Readiness check before implementation. |
| `builder` | In-scope implementation only — no drive-by refactors. |
| `auditor` | Design-drift, gate re-run, AC grading, status-surface check. |
| `security-reviewer` | cs-300 threat-model review (LBD-1, LBD-4, LBD-5). |
| `dependency-auditor` | Supply-chain / install-time / CVE / lockfile review. |
| `architect` | ADR / `architecture.md` amendments and design-drift judgment. |
| `roadmap-selector` | Picks next ready task. |
| `sr-dev` | Senior-developer pass. |
| `sr-sdet` | Senior SDET / verification-quality pass (LBD-11). |

## Slash commands (in `commands/`)

| Command | Purpose |
| --- | --- |
| `/clean-tasks` | Normalise / repair task specs before implementation. |
| `/queue-pick` | Select next ready task from the milestone tree. |
| `/clean-implement` | **Default cs-300 implementation command.** Builder→Auditor loop + security gate, up to 10 cycles. |
| `/auto-implement` | Autonomous multi-cycle implementation under hard boundaries. |
| `/autopilot` | `/queue-pick` + `/auto-implement`. |
| `/implement` | Lightweight single-pass implementation. |
| `/audit` | Standalone audit. |

## Long-running work

When a task opts in (`**Long-running:** yes`) or reaches cycle 3, the orchestrator initialises:

```text
runs/<task-shorthand>/plan.md      # immutable
runs/<task-shorthand>/progress.md  # append-only, Auditor updates
runs/<task-shorthand>/cycle_<N>/summary.md
```

See [`/agent_docs/long_running_pattern.md`](../agent_docs/long_running_pattern.md).

## Provenance

This workflow is the cs-300 instantiation of a generalized project-development template (referenced 2026-05-02 from a host-local working copy at `~/prj/generalized_claude_workflow/`, which is mounted read-only into the dev container at the same path — see `Dockerfile` / `docker-compose.yml`). Project-specific values — LBDs, threat model, gate commands, file paths, the security gate inside `/clean-implement` — are filled in from cs-300's roadmap, architecture, and saved memory rules. The generalized template itself is not vendored into this repo; the workflow files here are the source of truth.
