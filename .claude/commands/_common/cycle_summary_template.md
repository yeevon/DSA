# Cycle Summary Template

**Canonical reference for:** Auditor Phase 5 (cycle-summary emission); slash commands that consume cycle summaries for Builder/Auditor spawn on cycle N ≥ 2.

This file is the single source of truth for the `cycle_<N>/summary.md` template. The Auditor emits one summary file per cycle as a side-effect of its existing Phase 5 work (issue-file write). Orchestrators read **only the latest summary** when constructing cycle N+1 spawn prompts — not the full Builder+Auditor chat history from prior cycles.

---

## Directory layout

Cycle summaries live inside the per-task nested run directory:

```
runs/<task-shorthand>/
  cycle_1/
    summary.md              ← this file (Auditor emits; orchestrator reads)
    builder_handoff.md
    sr-dev-review.md
    sr-sdet-review.md
    security-review.md
    spawn_<agent>.tokens.txt
    agent_<name>_raw_return.txt
    auditor_rotation.txt
    integrity.txt
  cycle_2/
    summary.md
    ...
  cycle_N/
    summary.md
    ...
```

`<task-shorthand>` format: `m<MM>_t<NN>` with both M and T zero-padded to two digits (e.g. `m04_t01`, `m04_t08`, `m09_t01`). This avoids lexical ambiguity between `m4_t1` and `m4_t10`.

The nested `cycle_<N>/summary.md` path is authoritative. The flat form `cycle_<N>_summary.md` is incorrect and must not be used.

---

## Template

The Auditor writes this Markdown structure verbatim (filling in values from the issue file it just wrote in Phase 5):

```md
# Cycle <N> summary — <task>

**Cycle:** <N>
**Date:** <YYYY-MM-DD>
**Builder verdict:** <BUILT / BLOCKED / STOP-AND-ASK>
**Auditor verdict:** <PASS / OPEN / BLOCKED>
**Files changed this cycle:**
- `<path>` — <one-line description>

**Gates run this cycle:**

| Gate | Command | Result |
| --- | --- | --- |
| type | `npm run check` | PASS / FAIL / NOT RUN / BLOCKED / SKIPPED |
| smoke | `node scripts/<name>-smoke.mjs` | … |
| chapter | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | … |
| content build | `node scripts/build-content.mjs` | … |
| build | `npm run build` | … |

**Open issues at end of cycle:** <count by severity + IDs, e.g. "2 HIGH (T03-ISS-01, T03-ISS-02), 1 LOW" — or "none">
**Decisions locked this cycle:** <bullet list of Auditor-agreement-bypass locks, user arbitrations, or LBD carry-overs locked this cycle — or "none">
**Carry-over to next cycle:** <bullet list of explicit ACs the next Builder cycle must satisfy — or "none" if Auditor verdict is PASS>

**Status-surface flips queued (if closing the task):**
- [ ] per-task spec `**Status:**`
- [ ] milestone `tasks/README.md` row
- [ ] milestone README task-table row
- [ ] milestone README `Done when` checkboxes (cite issue file)
```

Project-specific gate rows can be added or removed; the Gate / Command / Result columns are the contract.

---

## Invariants

1. **Extension, not replacement.** The `cycle_<N>/summary.md` is a structured *projection* of the issue file the Auditor already wrote in Phase 5 — they share the same underlying content. The issue file remains the authoritative artifact; `summary.md` is optimised for orchestrator re-read.
2. **Written after the issue file, before forward-deferral propagation.** In Phase 5: write the issue file first, then write `cycle_<N>/summary.md`. Phase 6 (forward-deferral propagation) runs after both.
3. **Orchestrator reads only the latest summary.** On cycle N (N ≥ 2), the orchestrator feeds `cycle_{N-1}/summary.md` to both the Builder and Auditor spawn prompts — not the full chat content of cycles 1..N-1.
4. **Carry-over populated when OPEN.** The `Carry-over to next cycle:` field must be non-empty whenever the Auditor verdict is `OPEN` — it must list the specific ACs the next Builder cycle must satisfy. Empty carry-over on an OPEN verdict is a spec violation.
5. **Directory creation on cycle 1.** The orchestrator creates `runs/<task>/cycle_1/` at the start of cycle 1. Subsequent cycles create `cycle_<N>/`.

---

## Read-only-latest-summary rule (for orchestrators)

### Cycle 1

Builder spawn-prompt input:
- Task spec path
- Parent milestone overview path
- Project context brief
- Issue file path (may not exist yet)

Auditor spawn-prompt input:
- Task spec path
- Issue file path
- Parent milestone overview path
- Project context brief
- Current `git diff`
- Cited load-bearing-decision identifiers (compact pointer)

### Cycle N (N ≥ 2)

Builder spawn-prompt input:
- Task spec path
- Issue file path
- **Most recent `runs/<task>/cycle_{N-1}/summary.md`** (path reference + content)
- Project context brief

**Do not include** prior Builder reports' chat content, prior Auditor chat content, or prior summaries beyond `cycle_{N-1}/summary.md`. The summary is the durable carry-forward; earlier chat history is ephemeral.

Auditor spawn-prompt input:
- Task spec path
- Issue file path
- Parent milestone overview path
- Project context brief
- Current `git diff`
- Cited load-bearing-decision identifiers (compact pointer)
- **Most recent `runs/<task>/cycle_{N-1}/summary.md`** (path reference + content)

**Do not include** prior cycle summaries beyond the most recent one.

---

## Long-running pattern interaction

When the long-running pattern is active for a task (see `agent_docs/long_running_pattern.md`), the cycle summary also feeds the long-running `progress.md` carry-forward — but the cycle-summary content and structure are unchanged. The long-running pattern adds a separate per-task `plan.md` + `progress.md` pair; it does not replace the per-cycle summary.

See [`/agent_docs/long_running_pattern.md`](../../../agent_docs/long_running_pattern.md).

---

## Why orchestrators read only the latest summary

Re-feeding all prior Builder + Auditor chat into cycle N's spawn prompts would balloon input tokens linearly with cycle count, and would let stale findings (already resolved) bias the Auditor. The single most-recent summary captures the load-bearing carry-forward (open issues, locked decisions, ACs for the next cycle) without the noise.
