---
model: claude-sonnet-4-6
thinking: medium
---

# /queue-pick

Select the next ready cs-300 task from the milestone tree.

---

## Inputs

- roadmap (`design_docs/roadmap_addenda.md`)
- milestone index (`design_docs/milestones/README.md`)
- milestone-task directories (`design_docs/milestones/m<N>_<name>/tasks/T<NN>_<slug>.md`)
- current project priority (the active milestone's goal)
- blocked / deferred items
- current branch / context

---

## Procedure

1. Read [`/CLAUDE.md`](../../CLAUDE.md), the milestone index, and the active milestone README.
2. Spawn the `roadmap-selector` agent (see [`../agents/roadmap-selector.md`](../agents/roadmap-selector.md)).
3. The selector:
   - Excludes tasks with unresolved HIGH blockers in their issue files.
   - Excludes `nice_to_have.md` items unless explicitly promoted.
   - Excludes pre-Phase-1 work touching M2+ surfaces (LBD-13).
   - Excludes chapter tasks reaching into `coding_practice/` (LBD-9).
   - Prefers tasks that are dependency-ready and Phase-N-blocking for the current milestone.
   - Returns the selected task path and rationale.

---

## Return

```text
verdict: <SELECTED / NONE_READY / NEEDS_INPUT>
file: <repo-relative path to selection artifact, or "—">
section: <selected task spec path or "—">
```
