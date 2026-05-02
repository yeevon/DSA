# Spawn-Prompt Template (Canonical Scaffold)

**Canonical reference for:** all slash commands that spawn agents — determines what the
orchestrator passes to each `Agent` call.

This file is the single source of truth for the minimal pre-load set, output budget
directives, and schema reminder for every agent spawn. Slash commands link here instead
of duplicating per-agent rules — changes to the pre-load policy require only this file.

---

## Guiding principle

> **The cost of an under-pre-fed sub-agent is one extra Read call.
> The cost of an over-pre-fed sub-agent is token waste + attention dilution.
> Asymmetry favours under-pre-feeding.**

Pass only what the agent will *certainly* use. Let the agent pull the rest on demand via
its own `Read` tool. Path references are always safe to pass; inlining full content of
large documents is wasteful and should be avoided.

---

## Per-agent minimal pre-load set

### Builder

| Always pass | Never inline |
|---|---|
| Task spec path | Sibling task issue files (content) |
| Project context brief | `architecture.md` content |
| Issue file path (may not exist yet) | `CHANGELOG.md` content |
| Cited LBD identifiers (parsed from spec) | Whole-milestone README content |

**Cycle-N pre-load rule:** on cycle 1 also pass the parent milestone README path; on
cycle N ≥ 2 replace it with the most recent `cycle_{N-1}/summary.md` (path + content).
See `.claude/commands/_common/cycle_summary_template.md` for the authoritative per-cycle
Builder pre-load definition.

**Long-running rule:** when the long-running pattern is active (per
`agent_docs/long_running_pattern.md`), replace the per-cycle summary with `plan.md` (full
content) + `progress.md` (full content). The summary remains in
`runs/<task>/cycle_<N>/` for audit trail but drops out of the Builder pre-load.

### Auditor

| Always pass | Never inline |
|---|---|
| Task spec path | `architecture.md` content (Auditor reads on-demand) |
| Issue file path | Sibling issue file content |
| Parent milestone README path | Whole-milestone README content |
| Project context brief | Full LBD-1..15 table content |
| Current `git diff` | |
| Cited LBD identifiers (parsed from spec) | |

**LBD pre-load rule for the Auditor:** parse the LBD citations from the task spec
(e.g. "LBD-4, LBD-11") and pass *only* the cited LBD identifiers as a compact list. The
Auditor reads the full LBD table in CLAUDE.md on-demand. When no LBDs are cited, pass
the LBD-1..15 table header only as a compact pointer (the Auditor still applies the
universal rules, but the spawn prompt does not pre-load text the Auditor will look up
itself).

### Reviewer spawns (sr-dev, sr-sdet, security-reviewer, dependency-auditor)

| Always pass | Never inline |
|---|---|
| Task spec path | Full source file content |
| Issue file path | Full smoke-script content |
| Project context brief | `architecture.md` content |
| Current `git diff` | |
| List of files touched (aggregated from Builder reports) | |

For dependency-auditor specifically: also pass the list of changed manifests. The
dependency-auditor uses this to decide which manifests to deep-scan vs. skim.

### task-analyzer

| Always pass | Never inline |
|---|---|
| Milestone directory path | Full task spec contents (analyzer reads via own Read) |
| Analysis-output file path | `architecture.md` content |
| Project context brief | Sibling milestone READMEs content |
| Round number | |
| List of task spec filenames | |

### roadmap-selector

| Always pass | Never inline |
|---|---|
| Recommendation file path | Full milestone README contents |
| Project context brief | Full task spec contents |
| Milestone scope (from `$ARGUMENTS`) | `architecture.md` content |

### architect

| Always pass | Never inline |
|---|---|
| Trigger type and finding ID | Full source files |
| Project context brief | Full architecture.md |
| Cited LBD identifiers (the ones being adjudicated) | |

---

## Output budget directives

Include this block verbatim in every spawn prompt, substituting `<BUDGET>` per the table
below:

```
Output budget: <BUDGET> tokens. Durable findings live in the file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

| Agent | Budget |
|---|---|
| `builder` | 4 K |
| `auditor` | 1–2 K |
| `security-reviewer` | 1–2 K |
| `dependency-auditor` | 1–2 K |
| `task-analyzer` | 1–2 K |
| `architect` | 1–2 K |
| `sr-dev` | 1–2 K |
| `sr-sdet` | 1–2 K |
| `roadmap-selector` | 1–2 K |

---

## Schema reminder (include in every spawn prompt)

```
Return per .claude/commands/_common/agent_return_schema.md — exactly 3 lines:
verdict: <token>
file: <path or —>
section: <## header or —>
No prose, no preamble, no chat body outside those three lines.
```

---

## Project context brief

The project context brief is a compact orientation block prepended to every spawn prompt.
For cs-300:

```
Project: cs-300 (Astro courseware + local question-gen / review loop)
Source root: src/ (Astro), chapters/ch_<N>/ (LaTeX), cs300/workflows/ (Python)
Working branch: design_branch (sandbox) | host-authorised branch (host) — per LBD-15
Threat model: single-user, local-machine, GH Pages static deploy; no backend in dist/
Verification: per-task smoke is mandatory for code (LBD-11);
  status-surface 4-way at task close (LBD-10).
Load-bearing: see CLAUDE.md §Load-bearing decisions (LBD-1..15).
```

Keep the brief under 300 tokens. It is read once per spawn; longer briefs add token
overhead without proportionate signal.

---

## Sandbox-vs-host marker (LBD-15)

Every spawn prompt for code-touching agents must include a one-line sandbox marker so the
agent knows whether to expect host-only carry-overs:

```
Sandbox: <YES (design_branch only; node_modules root-owned) | NO (host)>
```

The orchestrator detects this once via `/.dockerenv` at pre-flight and reuses the value
across all spawns in the session.

---

## Token ceilings (advisory)

The orchestrator does not enforce these ceilings as hard limits, but a spawn prompt that
exceeds them indicates a pre-load policy regression and should be investigated:

| Agent | Spawn-prompt ceiling |
|---|---|
| `builder` | 8 000 tokens |
| `auditor` | 6 000 tokens |
| `sr-dev` | 4 000 tokens |
| `sr-sdet` | 4 000 tokens |
| `security-reviewer` | 4 000 tokens |
| `dependency-auditor` | 4 000 tokens |
| `task-analyzer` | 6 000 tokens |
| `roadmap-selector` | 4 000 tokens |

If a ceiling is breached, surface the offender in the cycle summary's `## Notes` section
and revisit the per-agent pre-load set the next time CLAUDE.md is updated.

---

## Stable-prefix discipline

Claude Code caches the **stable prefix** of each sub-agent spawn prompt. A misplaced
cache breakpoint (one that sits *inside* the dynamic context rather than at the end of
the stable block) causes Claude Code to re-cache the entire conversation on every spawn,
producing 5–20× session-cost blowups.

### What the stable prefix is

The stable prefix is the byte-for-byte-identical portion of the spawn prompt that does
**not** change between calls within a session. It consists of:

1. The agent system prompt (the per-agent Markdown body in `.claude/agents/`).
2. The `CLAUDE.md` / non-negotiables block (when prepended by the orchestrator).
3. The tool list (Claude Code locks these at session start; never modified mid-session).

The dynamic context follows **after** the stable prefix, separated by `\n\n`.

Structured as:

```
<stable prefix>

<dynamic context>
```

### Rules (MUST hold for every spawn)

1. **No timestamps, UUIDs, or per-request strings in the prefix.** Any value that changes
   between spawns within a session (wall-clock time, run ID, hostname, random nonce)
   belongs in the dynamic context, never the prefix.

2. **Tool list is fixed at session start; never modified mid-session.** Adding or
   removing MCP tools mid-session invalidates the entire conversation cache. The
   orchestrator must not alter the tool list between spawns within a single session.

3. **Agent system prompt (frontmatter + body) is byte-identical between spawns within a
   session.** The orchestrator reads the agent's `.md` file exactly once at startup and
   passes the same bytes to every spawn. No dynamic interpolation in the system-prompt
   portion.

4. **`\n\n` boundary between prefix and dynamic context.** The orchestrator constructs
   every spawn prompt by concatenating the stable prefix first, then appending `\n\n`,
   then the dynamic context (task-specific data: current diff, issue-file content,
   cycle_summary). This boundary is where Claude Code's cache-detection algorithm splits
   the prompt.

---

## Notes

- This file is the canonical pre-load definition. Updates to per-agent pre-load policy
  land here, not in individual agent spec files.
- Sibling references:
  - `agent_return_schema.md` — verdict tokens.
  - `parallel_spawn_pattern.md` — single-turn fanout.
  - `auditor_context_management.md` — rotation trigger.
  - `integrity_checks.md` — pre-commit safeguards.
  - `cycle_summary_template.md` — per-cycle summary format.
  - `effort_table.md` — per-task effort estimates.
  - `gate_parse_patterns.md` — per-tool footer regexes.
