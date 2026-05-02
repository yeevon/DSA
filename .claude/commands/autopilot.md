---
model: claude-sonnet-4-6
thinking: medium
---

# /autopilot

Select the next ready cs-300 task and run the autonomous implementation loop.

---

## Inputs

- roadmap path (`design_docs/roadmap_addenda.md`)
- milestone index (`design_docs/milestones/README.md`)
- current milestone goal (read from the active milestone README)
- working branch (`main`)
- max cycles (default 10)
- gate commands (from `CLAUDE.md` § Verification commands)
- user priority hints

---

## Procedure

1. Run `/queue-pick` to select the next ready task. (`roadmap-selector` agent.)
2. If no task is ready (`NONE_READY`), stop and report the queue state.
3. Run `/auto-implement` on the selected task.
4. Stop on:
   - `BLOCKED`, `SEC-BLOCK`, `SEC-FIX`
   - subagent disagreement
   - missing required verification (LBD-11)
   - user-input requirement
   - cycle-limit reached
5. Do not publish or release. Do not push to `main` without explicit user approval (pushing to `main` triggers GH Pages deploy).
6. Do not continue past the configured cycle limit without approval.

---

## Hard halt triggers

Inherits all hard halts from `/auto-implement`. Additionally:

- `roadmap-selector` returns `NEEDS_INPUT` (queue is ambiguous; user must clarify priority)
- two consecutive `NONE_READY` in a session — stop and surface the queue state instead of looping

---

## Return

```text
verdict: <CLEAN / OPEN / BLOCKED / NONE_READY / HALTED / SEC-BLOCK / SEC-FIX>
file: <repo-relative path to latest durable artifact, or "—">
section: —
```
