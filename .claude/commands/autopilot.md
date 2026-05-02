---
model: claude-sonnet-4-6
thinking: medium
---

# /autopilot

You are the **Autonomous Queue-Drain orchestrator** for cs-300.

`$ARGUMENTS` is optional. If empty, drain the entire open queue. If a milestone shorthand
is given (e.g. `m4`), scope the drain to that milestone only.

This command is the meta-loop on top of `/queue-pick` and `/auto-implement`. It loops
over (queue-pick → auto-implement) until the queue drains, the supplied scope is
exhausted, or a halt fires.

**It does not invoke `/auto-implement` via the `Skill` tool.** Skill-chaining returns
after one call, which breaks the outer loop. Instead, the orchestrator reads
`.claude/commands/auto-implement.md` at runtime and executes its procedure inline as
part of this single conversation. The auto-implement file stays authoritative; this
orchestrator stays compact; no drift.

---

## Hard halt boundaries

Inherits all hard halts from `/auto-implement`. Additionally:

- `roadmap-selector` returns `NEEDS_INPUT` — queue is ambiguous; surface and stop.
- **Sandbox branch guard (LBD-15).** If `/.dockerenv` exists, the working branch must be
  `design_branch`. HARD HALT on any attempt to commit or push to `main` from inside the
  sandbox.
- **Per-task halt = stop the outer loop.** If `/auto-implement` halts mid-task (cycle
  limit, BLOCKED, SEC-BLOCK, unresolved HIGH, subagent disagreement), stop the outer
  loop. Do not skip the failing task and pick the next one — the user owns that decision.
- **No subagent runs git mutations.** The orchestrator is the only surface that performs
  `git commit`. A subagent report claiming to have committed = HARD HALT.

---

## Pre-flight (run once, before iteration 1)

1. **Branch check.** `git rev-parse --abbrev-ref HEAD` → must be `design_branch` (sandbox)
   or the user-authorised branch (host). HARD HALT otherwise.
2. **Working tree check.** `git status --short` → must be empty. HARD HALT on dirty tree.
3. **Sandbox detection.** Check whether `/.dockerenv` exists. If yes, enforce LBD-15
   (design_branch only, no push/pull/fetch/merge-to-main). Record result for Step B.
4. **Resolve scope** from `$ARGUMENTS` (empty = all open milestones).

Surface every pre-flight failure verbatim and halt before iteration 1.

---

## Outer loop — drain the queue

For iteration `N` from 1 upward (no hard cap; halt on the boundaries above or
queue-exhaust below):

### Step A — Select next task (queue-pick, inlined)

1. Spawn the `roadmap-selector` agent with the project context brief:
   ```
   Roadmap: design_docs/roadmap_addenda.md
   Milestone index: design_docs/milestones/README.md
   Scope: <from $ARGUMENTS, or "all open">
   ```
2. Branch on the agent's verdict:
   - **`selected: <path>`** → go to Step B with that task spec.
   - **`selected: NONE_READY`** → report `QUEUE DRAINED` and exit the loop cleanly.
   - **`selected: NEEDS_INPUT`** → surface verbatim, HALT the outer loop.

### Step B — Drive the task (auto-implement, inlined)

**Read `.claude/commands/auto-implement.md` and execute its full procedure inline against
the task selected in Step A.** That file is authoritative; do not paraphrase it.

Key steps from that procedure:
- Verify branch / working tree (pre-flight already done; re-check if state could have
  drifted).
- Read the task spec and project context (CLAUDE.md, LBD-1..15, threat model).
- Builder → Auditor cycle loop (up to 10 cycles).
- Security gate (security-reviewer + dependency-auditor when manifests changed).
- Commit ceremony: orchestrator runs `git commit` on `design_branch`; includes
  task ID, ACs satisfied, gate results, dep-audit line.

**On `CLEAN`** (audit PASS + security SHIP): commit, emit the Step D one-liner, then
**return to Step A** (next iteration). The working tree is clean — next iteration's
pre-flight passes implicitly.

**On any halt** (BLOCKED, SEC-BLOCK, cycle limit, unresolved HIGH, subagent
disagreement): surface the halt verbatim and stop the outer loop. Do not continue
to the next task.

### Step C — Iteration boundary (after each CLEAN)

1. Re-verify `git status --short` is empty. HARD HALT if dirty.
2. Re-verify branch is still `design_branch` (or the authorised host branch).
3. Increment `N`; return to Step A.

---

## Reporting

### Per-iteration one-liner (emit after each Step B CLEAN)

```
Iter N — <task spec filename> → CLEAN <short-sha>
```

### Final report (on queue drain or halt)

```
/autopilot — <DRAINED | HALTED: <reason> | SCOPE-EXHAUSTED>

Iterations run: N
Tasks shipped:
  - <milestone/task> @ design_branch <sha>
  - ...
Halt reason (if any): <one paragraph>
```

---

## Return

```text
verdict: <DRAINED / HALTED / SCOPE-EXHAUSTED / NEEDS_INPUT>
file: —
section: —
```
