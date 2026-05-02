---
name: project-development
description: Use the cs-300 project-development workflow — task analysis, implementation, audit, security gate, long-running carry-forward, and status-surface 4-way discipline. Trigger when the user asks to plan, implement, audit, queue, or continue structured project work using this repository's .claude workflow (any of /clean-tasks, /queue-pick, /clean-implement, /auto-implement, /audit, /autopilot, /implement) or asks about Builder/Auditor mode.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# cs-300 project development workflow

Use this skill when the user asks to plan, implement, audit, or continue structured cs-300 work using the `.claude/` workflow.

---

## Read first

- [`/CLAUDE.md`](../../../CLAUDE.md) — project contract: LBD-1..14, threat model, status-surface 4-way, dep-audit gate, glossary.
- [`../../agents/_common/non_negotiables.md`](../../agents/_common/non_negotiables.md)
- [`../../agents/_common/verification_discipline.md`](../../agents/_common/verification_discipline.md)
- [`../../../agent_docs/long_running_pattern.md`](../../../agent_docs/long_running_pattern.md)

---

## Use cases

- Create or normalise task specs (`/clean-tasks`).
- Pick the next ready task (`/queue-pick`).
- Implement a task through the Builder→Auditor loop with security gate (`/clean-implement` — the cs-300 default).
- Run autonomous multi-cycle implementation under hard boundaries (`/auto-implement`).
- Run queue-pick + auto-implement together (`/autopilot`).
- Audit an existing change (`/audit`).
- Lightweight one-off implementation (`/implement`).
- Continue long-running work using `runs/<task>/plan.md` and `runs/<task>/progress.md`.
- Propagate carry-over from audits onto target task specs.
- Keep status surfaces (per-task spec, `tasks/README.md`, milestone task table, milestone "Done when") synchronised.

---

## Workflow routing

| User intent | Recommended command / agent |
| --- | --- |
| "clean up these tasks" / "make these specs ready" | `/clean-tasks` → `task-analyzer` |
| "pick next task" | `/queue-pick` → `roadmap-selector` |
| "implement this task" (default) | `/clean-implement` |
| "run autonomously" | `/auto-implement` |
| "continue the queue autonomously" | `/autopilot` |
| "audit this" / "review this change" | `/audit` → `auditor` |
| "review architecture" / "I need an ADR" | `architect` |
| "review tests / verification" | `sr-sdet` |
| "review dependencies" | `dependency-auditor` |
| "review security" | `security-reviewer` |
| "senior dev pass" | `sr-dev` |
| small one-off change | `/implement` |

---

## Boundaries

This skill does not replace project rules. `CLAUDE.md` is the project contract.

Subagents must obey the shared non-negotiables.

No subagent may commit, push, merge, rebase, tag, publish, release, or run destructive git operations. Pushing to `main` triggers the GH Pages deploy and requires explicit user approval.

---

## Long-running work

When a task opts in with `**Long-running:** yes` or reaches cycle 3, use:

```text
runs/<task-shorthand>/plan.md      # immutable, written once
runs/<task-shorthand>/progress.md  # append-only, Auditor updates each cycle
runs/<task-shorthand>/cycle_<N>/summary.md
```

See [`../../../agent_docs/long_running_pattern.md`](../../../agent_docs/long_running_pattern.md).

---

## Done means verified (LBD-11)

Do not claim completion from plausible reasoning.

Completion requires concrete verification mapped to ACs. For code tasks, build-clean is necessary but not sufficient — the spec must name a smoke test the Auditor reruns and cites.
