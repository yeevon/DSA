# Long-running task pattern — cs-300

Two-file carry-forward pattern for multi-cycle implementation work.

This pattern is used when a task cannot be completed cleanly in one or two implementation cycles. It supplements the normal per-cycle summary with:

1. An immutable task plan.
2. A cumulative progress file.

The goal is to keep long-running work grounded without forcing the Builder, implementer, or orchestrator to reconstruct state from prior chat history.

---

## Ownership

| Artifact | Owner | Rule |
| --- | --- | --- |
| `plan.md` | Orchestrator (the slash-command controller, e.g. `/clean-implement`) | Written once, then immutable |
| `progress.md` | Auditor | Append-only; updated after every cycle |
| `cycle_<N>/summary.md` | Auditor | Per-cycle snapshot, retained for audit trail |

The Builder reads the artifacts but does not own them.

The Builder may report what changed, what remains, and what is blocked, but the Auditor turns that into durable progress history.

---

## Trigger

The pattern fires when either condition is true at the start of cycle `N`:

1. The task spec opts in:

```md
**Long-running:** yes
```

2. The task reaches cycle 3 or later:

```text
N >= 3
```

For cycles before the trigger fires, the normal cycle-summary process is enough.

Once the trigger fires, the long-running pattern stays active for the rest of that task.

---

## File location

When the trigger fires, create the long-running files under the task run directory:

```text
runs/<task-shorthand>/
  plan.md
  progress.md
  cycle_1/summary.md
  cycle_2/summary.md
  cycle_3/summary.md
```

`<task-shorthand>` is the lowercased milestone-task ID (e.g. `m4-t01`, `m-ux-t3`, `m3-t05`).

---

## `plan.md`

Written once by the orchestrator when the trigger fires. Immutable after creation unless the user explicitly changes the task scope.

The plan is sourced from the task spec. It must not invent scope.

### Required contents

```md
# Plan — <task>

## Goal
<One paragraph describing the task goal.>

## Deliverables
1. <Deliverable 1>
2. <Deliverable 2>
3. <Deliverable 3>

## Acceptance criteria
- [ ] AC1
- [ ] AC2
- [ ] AC3

## Out of scope
- <Excluded item 1>
- <Excluded item 2>

## Locked decisions
- <Decision already made before implementation starts (LBD anchor / ADR)>

## Source references
- Task spec: `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`
- Issue / audit log: `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`
- Milestone README: `design_docs/milestones/m<M>_<name>/README.md`
```

### Source sections

Extract `plan.md` from these task-spec sections:

```text
## Why this task exists
## What to build
## Acceptance criteria
## Out of scope
## Verification plan
## Dependencies
## Carry-over from prior audits
```

### Hard rules

- Do not add new requirements.
- Do not silently remove ACs.
- Do not convert nice-to-have items into required deliverables.
- Do not rewrite locked project decisions.
- Do not use `plan.md` to hide ambiguity.
- If the task spec is unclear, stop and ask before seeding the plan.

---

## `progress.md`

Append-only. Updated at the end of every cycle by the Auditor.

### Required shape

```md
# Progress — <task>

## Cycle 1 (<YYYY-MM-DD>)

### Landed
- `<path>` — <one-line description>

### Verified
- `<command>` — PASS / FAIL: <reason>
- Not run — <reason>

### Deferred to next cycle
- <specific remaining work>

### Locked decisions made this cycle
- <decision>

### Blockers
- <blocker, or "None">

### Audit notes
- <finding, risk, or reviewer note>

### Status-surface state (LBD-10, only if closing)
- [ ] per-task spec `**Status:**`
- [ ] milestone `tasks/README.md` row
- [ ] milestone README task-table row
- [ ] milestone README `Done when` checkboxes
```

Each new cycle appends a new section:

```md
## Cycle <N> (<YYYY-MM-DD>)
```

Do not rewrite prior cycle sections except to correct a factual error. If that happens, note the correction explicitly.

---

## Per-cycle summaries

The long-running files supplement the normal per-cycle summaries; they don't replace them.

| File | Purpose |
| --- | --- |
| `cycle_<N>/summary.md` | Detailed record of one cycle (template: [`.claude/commands/_common/cycle_summary_template.md`](../.claude/commands/_common/cycle_summary_template.md)) |
| `progress.md` | Cumulative state across all cycles |
| `plan.md` | Immutable scope and target |

---

## Builder cycle spawn behavior

Before trigger:

```text
task spec
issue/audit file
prior cycle summary, if any
project context brief
```

After trigger:

```text
task spec
issue/audit file
plan.md
progress.md
project context brief
```

The prior cycle's `summary.md` does not need to be preloaded because its important carry-forward state is reflected in `progress.md`.

---

## Initializer step

When the trigger fires, the orchestrator performs a one-time initialization:

1. Read the task spec.
2. Read the issue/audit file if it exists.
3. Create `runs/<task-shorthand>/` if needed.
4. Write `plan.md` from the task spec.
5. Seed `progress.md`.
6. Continue with the normal Builder cycle.

Default seeded `progress.md`:

```md
# Progress — <task>

## Cycle <N> (<YYYY-MM-DD>)

### Landed
- Pending Auditor update.

### Verified
- Pending Auditor update.

### Deferred to next cycle
- Pending Auditor update.

### Locked decisions made this cycle
- Pending Auditor update.

### Blockers
- Pending Auditor update.

### Audit notes
- Pending Auditor update.
```

This initializer is an orchestrator step. Do not spawn a separate agent just to create these files unless the command requires it.

---

## Scope-change rule

`plan.md` is immutable because it represents the task as understood when long-running work began.

If the user changes the task scope later:

1. Do not silently edit the original plan.
2. Add an explicit scope-change note to `progress.md`.
3. Update the task spec or issue/audit file.
4. If the scope change is large, create a new task instead of mutating the current one.

Recommended progress entry:

```md
### Scope change
- User approved scope change on <YYYY-MM-DD>: <description>
- Source updated: `<TASK_SPEC_PATH>` / `<TASK_ISSUE_PATH>`
- Impact: <new deliverable / removed deliverable / changed AC>
```

Only update `plan.md` if the user explicitly says the original plan should be amended. If amended, add an amendment note at the top:

```md
> Amended on <YYYY-MM-DD> by explicit user instruction. Original task scope changed.
```

---

## Blocker rule

If a cycle ends blocked, `progress.md` must say exactly what is blocked and what input is needed.

```md
### Blockers
- BLOCKED: <specific blocker>
- Needed from user: <specific decision/input>
- Safe next action: <what can continue, or "None">
```

Do not continue implementation by guessing around a blocker.

---

## Verification rule

Every cycle records verification status:

```md
### Verified
- `npm run check` — PASS
- `node scripts/db-smoke.mjs` — PASS
- `pdflatex -halt-on-error chapters/ch_5/lectures.tex` — FAIL: missing macro
- Not run — <reason>
```

Use concrete commands, not vague claims like "tests look good" / "should work" / "build appears fine."

---

## Handoff rule

When this pattern is active, the Builder return schema does not change. The durable state lives in `plan.md`, `progress.md`, and the cycle summary.

Do not use chat history as the durable handoff.

---

## Why this pattern exists

Long-running AI-assisted implementation fails when state is carried only in chat. This pattern prevents:

- forgotten ACs
- re-litigating settled decisions
- accidental scope expansion
- losing track of partial work
- relying on stale cycle summaries
- forcing the Builder to infer project state from prior conversation
- unreviewed changes becoming invisible across cycles

The plan keeps the target stable. The progress file keeps the current state visible. Together they make long-running work resumable, auditable, and less dependent on context-window luck.
