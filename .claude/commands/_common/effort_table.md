# Effort table

Default model + thinking-effort guidance for cs-300 commands and agents.

cs-300 is a single-user, local-first side project. Sonnet 4.6 is the default across the fleet — cost / latency favours it when the loop runs many cycles, and most roles are mechanical given a clean spec.

**Two exceptions earn Opus 4.7: `auditor` and `architect`.** These are the drift gatekeepers — they protect against silent LBD-1..14 violations, status-surface drift, and architecture decay. The whole loop is built around the auditor catching what the builder missed, and the architect catching what the auditor's role doesn't cover. Cheaping out here defeats the point of having the loop at all. The other reviewers (`security-reviewer`, `dependency-auditor`, `sr-dev`, `sr-sdet`) run narrower checklists against the auditor's already-graded output, so Sonnet is fine for them.

Tune the values in each agent or command frontmatter when needed.

| Role / command | Model | Thinking | Notes |
| --- | --- | --- | --- |
| `auditor` | **opus-4-7** | (adaptive) | **Drift gatekeeper.** Re-runs gates, checks LBD-1..14 drift, status-surface 4-way, AC grading individually. Opus headroom pays for itself when the cs-300 LBDs are dense (14 anchors) and silent drift is HIGH-severity. |
| `architect` | **opus-4-7** | (adaptive) | **Architecture protector.** ADR drafting / `architecture.md` amendments / load-bearing-decision judgment. Fires rarely but the output binds the rest of the project, so the cycle to write it should not be the cheap one. |
| `task-analyzer` | sonnet-4-6 | (adaptive) | Reads task scope, dependencies, risks; mostly checklist work against the recommended task spec shape. |
| `builder` | sonnet-4-6 | (adaptive) | Implements strictly against task spec and carry-over. Mechanical given a clean spec; the auditor is the counterweight. |
| `security-reviewer` | sonnet-4-6 | (adaptive) | Reviews against the cs-300 threat model (LBD-1, LBD-4, LBD-5). Checklist-driven. |
| `dependency-auditor` | sonnet-4-6 | (adaptive) | Reviews dep / package / distribution impact via npm/pip/uv tooling. |
| `roadmap-selector` | sonnet-4-6 | (adaptive) | Selects next ready task from the milestone tree. |
| `sr-dev` | sonnet-4-6 | (adaptive) | Senior implementation/design review. Nice-to-have on top of the auditor. |
| `sr-sdet` | sonnet-4-6 | (adaptive) | Senior test-strategy review (LBD-11). Narrow checklist over the auditor's output. |
| `/clean-tasks` | sonnet-4-6 | high | Spec rewrites benefit from reasoning headroom. |
| `/clean-implement` | sonnet-4-6 | high | Orchestrator + security gate; multi-cycle loop control. (Spawns the Opus auditor.) |
| `/auto-implement` | sonnet-4-6 | high | Autonomous multi-cycle implementation under hard boundaries. (Spawns the Opus auditor.) |
| `/queue-pick` | sonnet-4-6 | medium | Just spawns `roadmap-selector`. |
| `/autopilot` | sonnet-4-6 | medium | Just chains `/queue-pick` + `/auto-implement`. |
| `/implement` | sonnet-4-6 | medium | Lightweight single-pass. |
| `/audit` | sonnet-4-6 | medium | Just spawns the Opus `auditor`; the orchestrator wrapper itself is light. |

## When to manually escalate other roles to Opus 4.7

Override the model on a single invocation (don't change the file) when:

- a Builder cycle has produced the same wrong output for 3+ rounds — escalate the **next builder** invocation
- `security-reviewer` or `dependency-auditor` reports a finding that materially conflicts with the auditor's grading and the resolution isn't obvious — escalate that reviewer's re-run
- a long-running task crosses architecture + security + release surfaces simultaneously and Sonnet keeps producing partial reports

The auditor and architect are already on Opus, so they don't need escalation — if their judgment seems off, that's a signal to push back on the *task* (clarify the spec, add an ADR), not to upgrade the model further.

## When to consider Haiku 4.5

For purely mechanical sub-jobs that are not currently called out — log scraping, file-existence checks, mechanical CHANGELOG entries — Haiku is enough. None of the agents in this workflow currently fit cleanly; revisit if a new one is added.
