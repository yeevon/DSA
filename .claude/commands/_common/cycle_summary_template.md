# Cycle summary template

Per-cycle summaries are durable handoff artifacts between Builder/Auditor cycles in cs-300.

They are separate from chat history and should be written under the run directory for the task.

Default path:

```text
runs/<task-shorthand>/cycle_<N>/summary.md
```

Use the nested directory form. `<task-shorthand>` is the milestone-task ID, e.g. `m4-t01` or `m-ux-t3`.

---

## Template

```md
# Cycle <N> summary — <task>

**Cycle:** <N>
**Date:** <YYYY-MM-DD>
**Builder verdict:** <BUILT / BLOCKED / STOP-AND-ASK>
**Auditor verdict:** <PASS / OPEN / BLOCKED>
**Files changed this cycle:**
- `<path>` — <one-line description>

**Gates run this cycle:**

| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | PASS / FAIL / NOT RUN / BLOCKED / SKIPPED | … |
| smoke | `node scripts/<name>-smoke.mjs` | … | … |
| chapter | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | … | page count |
| content build | `node scripts/build-content.mjs` | … | … |
| build | `npm run build` | … | dist/ inspection notes |

**Open issues at end of cycle:**
- <count by severity + IDs, or "none">

**Decisions locked this cycle:**
- <decision, or "none">

**Carry-over to next cycle:**
- <specific remaining work, or "none" if Auditor verdict is PASS>

**Status-surface flips queued (if closing the task):**
- [ ] per-task spec `**Status:**`
- [ ] milestone `tasks/README.md` row
- [ ] milestone README task-table row
- [ ] milestone README `Done when` checkboxes (cite issue file)
```

---

## Invariants

- `Carry-over to next cycle` must be non-empty when the Auditor verdict is `OPEN`.
- The summary is written **after** the issue file is updated.
- The summary is written **before** the next Builder cycle starts.
- The summary does not replace the issue file.
- When the long-running pattern is active (cycle ≥ 3 or `**Long-running:** yes`), this summary also feeds `progress.md`. Only the Auditor appends to `progress.md`.

See [`/agent_docs/long_running_pattern.md`](../../../agent_docs/long_running_pattern.md).
