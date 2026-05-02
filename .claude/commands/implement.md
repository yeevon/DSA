---
model: claude-sonnet-4-6
thinking:
  type: adaptive
effort: medium
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /implement

The user wants the **builder** subagent to implement: $ARGUMENTS

Spawn the `builder` agent via `Task` with:

- **Task identifier** from `$ARGUMENTS`. Resolve shorthand by glob: "m4 t1" → first match against `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`. If multiple matches, ask the user.
- **Spec path** (`design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`).
- **Issue file path** (`design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`) — may not exist yet on the first pass.
- **Parent milestone overview path** (`design_docs/milestones/m<M>_<name>/README.md`).
- **Project context brief** naming gate commands (`npm run check`, `node scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`), the architecture layer rule (`chapters/ + cs300/workflows/ → scripts/ → src/ → dist/`), the load-bearing decisions (LBD-1..15 from `CLAUDE.md`), the `design_docs/nice_to_have.md` boundary, the changelog convention (under current dated section: Added/Changed/Removed/Fixed/Decided/Deferred — M<N> Task T<NN>), and the status surfaces (per-task spec `**Status:**`, milestone `tasks/README.md` row, milestone README task-table row, milestone README `Done when` checkboxes).

After the `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md). Verdict tokens: `BUILT / BLOCKED / STOP-AND-ASK`.

When the builder returns, surface its report and stop. **Do not run the auditor** — that's `/clean-implement`'s job. If the user wants the full loop, they invoke `/clean-implement` (or `/auto-implement` for autonomous mode).

---

## Boundaries

Do not use this command for:

- large, ambiguous work
- architecture-changing work (route to `architect` + ADR)
- release-affecting work (`dist/` changes, GH Pages workflow edits)
- multi-cycle work (use `/clean-implement` instead)
- chapter content augmentation (those need full `/clean-implement` with the 40-pp / bounded-additions checks)

If the work creeps into any of the above mid-implementation, stop and route to `/clean-implement`.

---

## Return

```text
verdict: <BUILT / BLOCKED / STOP-AND-ASK>
file: <builder report or handoff path>
section: —
```
