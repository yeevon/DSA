---
model: claude-sonnet-4-6
thinking: medium
---

# /audit

Run a standalone audit against a task, diff, artifact, or completed implementation in cs-300: $ARGUMENTS

`$ARGUMENTS` is a task identifier — a task ID (e.g. `M4-T01`), spec file path, or "current branch".

---

## Inputs

- task spec path (`design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`)
- issue/audit path (`design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`)
- changed files / diff (use `git diff` against the milestone start ref)
- project context brief (LBD-1..14 anchors, gate commands, threat model — see `CLAUDE.md`)
- artifact to audit, if not source code

---

## Procedure

1. Read [`/CLAUDE.md`](../../CLAUDE.md), [`../agents/_common/non_negotiables.md`](../agents/_common/non_negotiables.md), [`../agents/_common/verification_discipline.md`](../agents/_common/verification_discipline.md).
2. Spawn the `auditor` subagent with the inputs above.
3. The auditor:
   - Loads full task scope, not only the diff (architecture.md, ADRs, sibling tasks, manifests, CI config).
   - Runs Phase 1 design-drift check against LBD-1..14, ADRs, memory rules.
   - Reruns the configured gates from `CLAUDE.md` § Verification commands.
   - Grades each AC (including carry-over) individually.
   - Runs the critical sweep (status-surface 4-way per LBD-10, doc drift, scope creep, gate integrity).
   - Updates the issue file in place using the structure in `CLAUDE.md` § Auditor — issue file structure.
   - Writes a cycle summary if this audit is part of a Builder/Auditor loop, and appends `progress.md` if long-running is active.
   - Propagates forward-deferrals (carry-over on target spec + propagation footer here).

---

## Return

```text
verdict: <PASS / OPEN / BLOCKED>
file: <repo-relative path to issue file>
section: —
```
