---
model: claude-sonnet-4-6
thinking: high
---

# /clean-tasks

Normalise, create, or repair cs-300 task specs so they are ready for implementation: $ARGUMENTS

`$ARGUMENTS` is a milestone path, a single task spec path, or a task idea.

---

## Inputs

- roadmap (`design_docs/roadmap_addenda.md`)
- milestone path (`design_docs/milestones/m<N>_<name>/`)
- task spec path or task idea
- architecture / decision docs (`design_docs/architecture.md`, `design_docs/adr/`)
- deferred-scope document (`design_docs/nice_to_have.md`)
- user priority or milestone goal

---

## Procedure

1. Read [`/CLAUDE.md`](../../CLAUDE.md), the milestone README, and any existing task specs / issue files in the same milestone.
2. Identify missing or weak sections in the target spec(s).
3. Ensure each task spec has the cs-300 shape below.
4. For each spec being created or substantially rewritten, spawn the `task-analyzer` agent on the result. It produces `design_docs/milestones/m<M>_<name>/issues/T<NN>_analysis.md` and returns one of `READY / NOT_READY / NEEDS_CLARIFICATION`.
5. Translate the analyzer's verdict to this command's return ladder:
   - `READY` → `READY`
   - `NOT_READY` → `UPDATED` (spec was rewritten but still has gaps the analyzer flagged; surface the gaps)
   - `NEEDS_CLARIFICATION` → `NEEDS_INPUT` (stop and ask the user)
6. Do not add implementation details beyond what is needed to make the task actionable.
7. Do not promote `nice_to_have.md` items without an explicit trigger and an ADR.
8. If the spec needs an architecture decision before implementation, route to the `architect` agent — don't bake the decision into the task.

---

## Recommended task spec shape

```md
# T<NN> — <title>

**Status:** todo / in progress / ✅ done <YYYY-MM-DD> / 🚧 blocked
**Long-running:** yes / no
**Milestone:** [m<N>_<name>](../README.md)

## Why this task exists
<One paragraph: user/system outcome.>

## What to build
<Concrete deliverables — named files / modules / surfaces.>

## Out of scope
- <Explicitly excluded item 1>
- <Explicitly excluded item 2>

## Acceptance criteria
- [ ] AC1 — testable
- [ ] AC2 — testable
- [ ] AC3 — testable

## Verification plan
- Code surface (LBD-11): <named smoke command>
- Content surface: <pdflatex / build-content / link check>
- Status-surface flips on close (LBD-10):
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkboxes (cite issue file)

## Dependencies
- Upstream tasks: <list>
- ADRs / LBDs touched: <list>

## Carry-over from prior audits
<Empty by default; populated by Auditor forward-deferrals.>
```

For chapter-content tasks, also explicitly cite:

- the 40-pp `lectures.pdf` ceiling target (LBD-6)
- the 3–5 bounded additions list (LBD-7)
- valid cross-chapter references only (LBD-12 — `ch_1`–`ch_7`, `ch_9`–`ch_13`)

---

## Output

Write or update task specs in place at `design_docs/milestones/m<N>_<name>/tasks/T<NN>_<slug>.md`. If the spec needed substantive rewriting, also produce a one-paragraph diff summary.

If a task is too large for one implementation loop, decompose into multiple specs and update the milestone README task table accordingly.

---

## Return

```text
verdict: <READY / UPDATED / NEEDS_INPUT>
file: <repo-relative path to durable artifact, or "—">
section: —
```
