# Agent Return-Value Schema (3-line verdict / file / section)

**Canonical reference for:** all slash commands that spawn agents; all 9 agent prompts.

This file is the single source of truth for the 3-line return-value schema used across
the cs-300 autonomy fleet. Slash commands link here instead of duplicating the per-agent
verdict table — changes to verdict tokens require only this file to be updated.

---

## Schema format

Every agent returns exactly three lines, no more, no less:

```
verdict: <one of the agent's allowed tokens — see table below>
file: <repo-relative path to the durable artifact written, or "—" if none>
section: <"## Section header" just written, or "—" if a standalone file or no file>
```

- No prose summary, no preamble, no chat body before or after the three lines.
- A return that includes anything outside the three-line schema is **non-conformant**.
- The orchestrator halts the autonomy loop and surfaces the malformed return for user
  investigation. **No auto-retry on non-conformant return** — a schema violation signals
  a deeper problem with the agent prompt or reasoning.

---

## Orchestrator-side parser convention

After every `Task` spawn, the orchestrator:

1. Captures the agent's full text return into
   `runs/<task>/cycle_<N>/agent_<name>_raw_return.txt` (durable record for debugging).
2. Splits the return on `\n`; expects exactly 3 non-empty lines.
3. Each line matches `^(verdict|file|section): ?(.+)$`.
4. The `verdict` value must be one of the agent's allowed tokens (see table below).
5. On any failure: halt the loop, surface
   `BLOCKED: agent <name> returned non-conformant text — see
   runs/<task>/cycle_<N>/agent_<name>_raw_return.txt for full output`. Do not auto-retry.

---

## Per-agent verdict tokens and durable artifacts

| Agent | Verdict tokens | Durable artifact (`file:` field) | Section header (`section:` field) |
|---|---|---|---|
| `builder` | `BUILT` / `BLOCKED` / `STOP-AND-ASK` | `runs/<task>/cycle_<N>/builder_handoff.md` | `—` |
| `auditor` | `PASS` / `OPEN` / `BLOCKED` | `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md` | `—` (auditor writes the entire issue file) |
| `security-reviewer` | `SHIP` / `FIX-THEN-SHIP` / `BLOCK` | `runs/<task>/cycle_<N>/security-review.md` | `## Security review (YYYY-MM-DD)` |
| `dependency-auditor` | `SHIP` / `FIX-THEN-SHIP` / `BLOCK` | `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md` (or `CHANGELOG.md` `### Security`) | `## Dependency audit (YYYY-MM-DD)` |
| `task-analyzer` | `CLEAN` / `LOW-ONLY` / `OPEN` | `design_docs/milestones/m<M>_<name>/issues/task_analysis.md` | `—` |
| `architect` | `ALIGNED` / `MISALIGNED` / `OPEN` / `PROPOSE-NEW-DECISION` | `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md` | `## Architect review (YYYY-MM-DD)` |
| `sr-dev` | `SHIP` / `FIX-THEN-SHIP` / `BLOCK` | `runs/<task>/cycle_<N>/sr-dev-review.md` | `## Sr. Dev review (YYYY-MM-DD)` |
| `sr-sdet` | `SHIP` / `FIX-THEN-SHIP` / `BLOCK` | `runs/<task>/cycle_<N>/sr-sdet-review.md` | `## Sr. SDET review (YYYY-MM-DD)` |
| `roadmap-selector` | `PROCEED` / `NEEDS-CLEAN-TASKS` / `HALT-AND-ASK` | `runs/queue-pick-<ts>.md` (or invoker-named recommendation file) | `—` |

(`section:` is `—` for agents that write a whole standalone file. The orchestrator reads
the entire file for those.)

---

## Notes

- `PROPOSE-NEW-DECISION` (architect verdict) covers any new load-bearing decision (LBD-N) or ADR
  the architect proposes. The decision record goes under `design_docs/adr/<NNNN>_<slug>.md`.
- Sub-agents may not run `git commit`, `git push`, `git merge`, `git rebase`, `git tag`,
  or any release/publish command. The verdict line reports an outcome; the orchestrator
  performs all git mutations. See CLAUDE.md §Autonomous-mode boundary (LBD-15).
- Sibling `_common/` references: `spawn_prompt_template.md` (per-agent pre-load),
  `parallel_spawn_pattern.md` (single-turn fanout), `gate_parse_patterns.md` (per-tool
  footer regexes), `integrity_checks.md` (pre-commit safeguards), `effort_table.md`
  (per-task effort), `cycle_summary_template.md` (per-cycle summary format),
  `auditor_context_management.md` (rotation trigger).

---

## Why a fixed 3-line schema

- **Parseability:** the orchestrator never has to read or summarize prose. Halt vs continue is a regex match.
- **Durable artifact discipline:** every agent must point at a file the orchestrator can re-open later. Findings live in files, not chat.
- **No auto-retry:** schema violations almost always mean the agent's reasoning drifted (mis-ranked findings, wrote into the wrong file, missed an input). Auto-retrying hides drift; halting surfaces it.
