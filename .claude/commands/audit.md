---
model: claude-opus-4-7
thinking:
  type: adaptive
effort: high
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /audit

The user wants the **auditor** subagent to audit: $ARGUMENTS

Spawn the `auditor` agent via `Task` with:

- **Task identifier** from `$ARGUMENTS`. Resolve shorthand by glob: "m4 t1" → first match against `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`. If multiple matches, ask the user.
- **Spec path** + **issue file path** per `CLAUDE.md` §Canonical file locations.
- **Architecture docs:** `design_docs/architecture.md` (especially the load-bearing-decisions section LBD-1..15) and any ADR the task cites from `design_docs/adr/`.
- **Gate commands:** `npm run check`, `node scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build` (pick relevant ones per the task surface).
- **Project context brief** with the load-bearing decisions (LBD-1..15 from `CLAUDE.md`), the architecture layer rule, the `design_docs/nice_to_have.md` boundary, and the status surfaces (per-task spec `**Status:**` line, milestone `tasks/README.md` row, milestone README task-table row, milestone README `Done when` checkboxes).
- **Builder report context:** if `/audit` was invoked standalone (no prior Builder spawn this session), pass `"No prior Builder report — audit from current state"` so the agent knows to verify against the working tree directly.

After the `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md). Verdict tokens: `PASS / OPEN / BLOCKED`.

When the auditor returns, surface the issue file path + status line and stop. **Do not invoke the Builder** — that's `/clean-implement`'s job. If the user wants the full loop, they invoke `/clean-implement` (or `/auto-implement` for autonomous mode).

---

## Return

```text
verdict: <PASS / OPEN / BLOCKED>
file: <repo-relative path to issue file>
section: —
```
