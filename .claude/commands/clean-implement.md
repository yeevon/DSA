---
model: claude-sonnet-4-6
thinking:
  type: adaptive
effort: high
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /clean-implement

You are the **Clean Implementation loop controller** for: $ARGUMENTS

`$ARGUMENTS` is a task identifier — a task ID (e.g. `M4-T01`), spec file path, or feature descriptor.

This loop drives a task to a clean state by cycling **builder → auditor** up to 10 times, then running a **security gate** (security-reviewer + dependency-auditor when relevant) before declaring the task shippable. Your job is orchestration and stop-condition evaluation. All substantive work runs in dedicated subagents.

(This is `Task`-based subagent dispatch, not slash-command chaining. The orchestration loop below stays inlined here so the loop controller never halts after a sub-step returns.)

Read first:

- [`/CLAUDE.md`](../../CLAUDE.md) — project contract (LBD-1..15, threat model, status-surface 4-way, dep-audit gate, glossary).
- [`../agents/_common/non_negotiables.md`](../agents/_common/non_negotiables.md)
- [`../agents/_common/verification_discipline.md`](../agents/_common/verification_discipline.md)
- [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md)
- [`_common/gate_parse_patterns.md`](_common/gate_parse_patterns.md)

---

## Scope vs `/auto-implement` — when to escalate

`/clean-implement` is the interactive default for cs-300 task work. It runs the Builder→Auditor loop + security gate, but **does not invoke the architect** — the assumption is that the user owns the call to escalate when a finding looks load-bearing. If during the loop the auditor / sr-dev / sr-sdet (none of which spawn here, but their findings can surface in user-invoked review) flag a finding whose recommendation reads "this should be a new load-bearing decision" or "violates an unwritten rule", **stop the loop and re-invoke under `/auto-implement`**. `/auto-implement`'s terminal gate spawns architect (Trigger A: new-decision proposal) and the commit ceremony has the decision-isolation rule (Step C1) that lands the architecture-doc + ADR change on its own commit.

`/clean-implement` does not have decision-isolation by design — interactive use lets the user batch decision + code work however they prefer. If you want the architect's judgment on an *external* claim (a blog post, advisory, etc.) without running an autonomy loop, use `/check-claim` instead.

---

## Pre-flight (before any agent spawn) — LBD-15 enforcement

`/clean-implement` is interactive — the user owns each commit. But the **branch policy** is non-negotiable: pushing to `main` triggers the GH Pages deploy via `.github/workflows/deploy.yml`, and per LBD-15 that is a host-only operation. The pre-flight must catch sandbox-running-on-main *before* the user follows the loop's recipe and accidentally lands a commit on the wrong branch.

**Each step below is a separate Bash invocation.** Do not assemble status strings via `$(...)` substitution or `${VAR:-default}` (Claude Code's `Contains expansion` guard prompts the user on those, breaking unattended invocation).

1. **Sandbox detection.** Run `[ -f /.dockerenv ] && echo SANDBOX || echo HOST`. Record the result. Either is allowed for `/clean-implement`, but the branch policy (next step) depends on which side we're on.

2. **Branch check.**
   - Run `git rev-parse --abbrev-ref HEAD`.
   - **Sandbox** (`/.dockerenv` exists): branch must be `design_branch` (or a feature branch off it). **HARD HALT** if the branch is `main` — committing to `main` from inside the sandbox violates LBD-15.
   - **Host** (no `/.dockerenv`): the user owns branch policy; warn but do not halt if the branch is `main` (the user may legitimately be reviewing or hot-fixing). Surface the branch name verbatim so the user can decide.

3. **Working-tree check (advisory).** Run `git status --short`. Unlike `/auto-implement`, a dirty working tree is **NOT** a HARD HALT here — interactive `/clean-implement` is often invoked mid-edit. Surface the dirty files so the user can decide whether to stash them; do not block.

4. **Sandbox-guard runtime check (optional).** If the project ships `scripts/sandbox-guard.sh`, run it as an extra safety net. It exits non-zero if the current branch is `main` and `/.dockerenv` exists. Honour its halt — do not override.

If any halt fires, surface the failing check verbatim and stop before spawning the first subagent.

---

## Agent-return parser convention

After every `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md):

1. Capture the full text return to `runs/<task>/cycle_<N>/agent_<name>_raw_return.txt`.
2. Split on `\n`; expect exactly 3 non-empty lines.
3. Each line must match `^(verdict|file|section): ?(.+)$`.
4. The `verdict` value must be one of the agent's allowed tokens (see schema reference); trailing whitespace on any value is stripped before validation.
5. On any failure: halt, surface `BLOCKED: agent <name> returned non-conformant text — see runs/<task>/cycle_<N>/agent_<name>_raw_return.txt`. **Do not auto-retry.**

---

## Project setup (run once at the start of the first cycle)

Resolve `$ARGUMENTS` to concrete paths (per `CLAUDE.md` §Canonical file locations):

- **Spec path:** `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`. Resolve shorthand by glob: "m4 t1" → first match. If multiple matches, ask the user.
- **Issue file path:** `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`. May not exist on cycle 1.
- **Parent milestone overview:** `design_docs/milestones/m<M>_<name>/README.md`.

Build the **project context brief** — pass verbatim to every subsequent `Task` spawn:

```text
Project: cs-300 (TypeScript/Astro + Python 3.12 + LaTeX, GH Pages static deploy)
Layer rule: chapters/ + cs300/workflows/ → scripts/ → src/ → dist/; aiw-mcp is a sibling local process
Gate commands: `npm run check`, `node scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`
Architecture: design_docs/architecture.md
Decision records: design_docs/adr/
Deferred-ideas file: design_docs/nice_to_have.md (out-of-scope by default)
Changelog convention: CHANGELOG.md, dated sections, tags Added / Changed / Removed / Fixed / Decided / Deferred
Dep manifests: package.json, package-lock.json, pyproject.toml, uv.lock, requirements*.txt, .nvmrc, .pandoc-version, Dockerfile, docker-compose.yml
Load-bearing decisions: LBD-1..LBD-15 (see CLAUDE.md)
Issue file path: <resolved above>
Status surfaces (must flip together at task close): per-task spec **Status:** line,
                   milestone tasks/README.md row, milestone README task-table row,
                   milestone README "Done when" checkboxes
```

If anything is unclear or absent, **stop and ask the user**.

---

## Spawn-prompt scope discipline

**Reference:** [`_common/spawn_prompt_template.md`](_common/spawn_prompt_template.md)

Pass only what each agent will certainly use. Let agents pull the rest on demand via their own `Read` tool. Full-document content inlining is wasteful; path references are always safe.

After every `Task` spawn, capture the spawn-prompt token count (regex proxy: `len(re.findall(r"\S+", text)) * 1.3`, truncated to int) into `runs/<task>/cycle_<N>/spawn_<agent>.tokens.txt` (nested per-cycle directory).

### `runs/<task>/` directory convention

Create `runs/<task-shorthand>/cycle_1/` at the **start of cycle 1**, before spawning the first Builder. Create `runs/<task-shorthand>/cycle_<N>/` at the start of each subsequent cycle. `<task-shorthand>` is `m<MM>_t<NN>` with both M and T zero-padded to two digits.

Per-cycle directory layout (canonical) — see [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md) §Directory layout:

```
runs/<task-shorthand>/
  cycle_1/
    summary.md                  ← cycle-summary (Auditor emits)
    security-review.md          ← security reviewer fragment
    spawn_<agent>.tokens.txt    ← per-spawn token count
    agent_<name>_raw_return.txt ← full text return per agent
    auditor_rotation.txt        ← rotation event log (present only if rotation fired)
  cycle_2/
    ...
  cycle_N/
    ...
```

### Builder spawn — read-only-latest-summary rule

**Cycle 1** — minimal pre-load set:
- Task spec path
- Issue file path (may not exist yet)
- Parent milestone overview path
- Project context brief

**Cycle N (N ≥ 2)** — replace the parent milestone overview with the latest cycle summary:
- Task spec path
- Issue file path
- **Most recent `runs/<task>/cycle_{N-1}/summary.md`** (include path + content inline)
- Project context brief

**Do not include** prior Builder reports' chat content, prior Auditor chat content, or prior cycle summaries beyond `cycle_{N-1}/summary.md`. The summary is the durable carry-forward; earlier chat history is ephemeral and must not re-enter the spawn prompt.

**Remove from inline content (all cycles):** sibling task issue files, architecture-doc content, changelog content.

Output budget directive (include verbatim in the Builder spawn prompt):

```
Output budget: 4K tokens. Durable findings live in the file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

### Auditor spawn — read-only-latest-summary rule

**Cycle 1** — minimal pre-load set:
- Task spec path
- Issue file path
- Parent milestone overview path
- Project context brief
- Current `git diff`
- Cited load-bearing-decision identifiers (parsed from the task spec — e.g. "LBD-4, LBD-11")

**Cycle N (N ≥ 2)** — add the latest cycle summary:
- Task spec path
- Issue file path
- Parent milestone overview path
- Project context brief
- Current `git diff`
- Cited load-bearing-decision identifiers (compact pointer)
- **Most recent `runs/<task>/cycle_{N-1}/summary.md`** (include path + content inline)

**Do not include** prior cycle summaries beyond the most recent one.

**Remove from inline content (all cycles):** whole architecture-doc content (Auditor reads on-demand), sibling issue file content, whole-milestone-overview content.

**Decision-record pre-load rule:** parse LBD citations from the task spec. Pass only those identifiers as a compact list. When no decisions are cited, pass the LBD-1..15 header only.

Output budget directive (include verbatim in the Auditor spawn prompt):

```
Output budget: 1-2K tokens. Durable findings live in the issue file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

### Reviewer spawns (security-reviewer, dependency-auditor)

Minimal pre-load set: task spec path, issue file path, project context brief, current `git diff`, list of files touched (aggregated from Builder reports across all cycles).

**Remove from inline content:** full source file content, full test file content, architecture-doc content.

Output budget directive (include verbatim in each reviewer spawn prompt):

```
Output budget: 1-2K tokens. Durable findings live in the issue file you append;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

---

## Long-running trigger

If `**Long-running:** yes` is in the spec, or this loop reaches cycle 3, initialise:

```text
runs/<task-shorthand>/plan.md      # immutable, written once from the spec
runs/<task-shorthand>/progress.md  # append-only, Auditor updates each cycle
```

See [`/agent_docs/long_running_pattern.md`](../../agent_docs/long_running_pattern.md). After the trigger, the Builder cycle inputs include `plan.md` and `progress.md` instead of preloading prior cycle summaries.

---

## Stop conditions (check after every audit, in priority order)

1. **BLOCKER** — Issue file contains a HIGH issue marked `🚧 BLOCKED` requiring user input. Stop, surface verbatim.
2. **USER INPUT REQUIRED** — Any issue recommends "stop and ask the user" / "user decision needed" **and the auditor's recommendation is genuinely ambiguous** (two or more reasonable paths surfaced; the auditor declines to pick one; the choice is a substantive design lock the user must own). Stop, list all such issues. **Auditor-agreement bypass:** if the auditor surfaced a single clear recommendation and the orchestrator concurs against the spec + load-bearing decisions, stamp it into the issue file as `Locked decision (loop-controller + Auditor concur, YYYY-MM-DD): <one-line summary>`, feed it to the next Builder cycle as a carry-over AC, and continue the loop. Halt only if (a) the auditor presents two or more options without a recommendation, or (b) the recommendation conflicts with a locked decision / prior user decision / the spec, or (c) the recommendation expands scope beyond the spec, or (d) the recommendation defers work to a future task that the user hasn't already agreed exists.
3. **FUNCTIONALLY CLEAN** — Issue file status line reads `✅ PASS` with no OPEN issues. Proceed to the **security gate** below. Only after the security gate passes is the task fully CLEAN.
4. **CYCLE LIMIT** — 10 build → audit cycles without 1–3. Stop, present outstanding issues. **Do not run the security gate against an unclean task.**

**At the start of cycle 1 only:** if the issue file already contains an unresolved BLOCKER from a prior session, treat as condition 1 — don't spawn the Builder against an open blocker.

---

## Loop procedure

For cycles 1..10:

### Step 1 — Builder

Spawn the `builder` subagent via `Task` with the inputs prescribed by the "Builder spawn — read-only-latest-summary rule" section above (cycle 1: include parent milestone overview path; cycle N ≥ 2: replace it with the latest cycle summary content). Wait for completion. Capture the Builder's report.

### Step 2 — Auditor

**Input-volume rotation trigger:** Before spawning the Auditor on cycle N ≥ 2, read `runs/<task>/cycle_{N-1}/auditor.usage.json` (telemetry record from the previous cycle). If input tokens exceed `AUDITOR_ROTATION_THRESHOLD` (default 60 000) AND cycle N-1 verdict was `OPEN` → spawn the Auditor with the **compacted input** (spec path + issue file path + project context brief + current `git diff` + `runs/<task>/cycle_{N-1}/summary.md` content only). Write the rotation event log at `runs/<task>/cycle_{N-1}/auditor_rotation.txt`.

See [`_common/auditor_context_management.md`](_common/auditor_context_management.md) for the full compacted-input shape and rotation rationale.

Otherwise, spawn the Auditor with the **standard input** per the "Auditor spawn" section above.

Spawn the `auditor` subagent via `Task`. Wait for completion.

### Step 3 — Read issue file and evaluate stop conditions

**Read the issue file on disk.** Do not trust the Auditor's chat summary — the issue file is the source of truth. Evaluate the four stop conditions in order. If condition 3 (FUNCTIONALLY CLEAN) triggers, go to the **security gate**. If none trigger and cycles remain, loop to Step 1 targeting only the OPEN issues the audit identified.

**Between Step 1 and Step 2, forbidden:**

- Summary of what the Builder did.
- Verdict on the gates ("gates pass, so the cycle is clean").
- Self-predicted cycle status.
- A "ready for audit" todo update.
- Editing the issue file yourself.

The Auditor is the only thing that can decide whether the task is functionally clean.

---

## Security gate (runs once, after FUNCTIONALLY CLEAN)

The functional audit confirmed the task does what the spec says. The security gate confirms it doesn't introduce risks the spec didn't address. Runs **after** the loop reaches FUNCTIONALLY CLEAN, not on every cycle.

### Step S1 — Security reviewer (always runs)

Spawn `security-reviewer` via `Task` with: task identifier, spec path, issue file path, project context brief (including the cs-300 threat model from `CLAUDE.md`), list of files touched across the whole task (aggregate from all Builder reports), cited LBD identifiers (compact pointer).

The security-reviewer writes findings into the same issue file under `## Security review`. Verdict line: `SHIP | FIX-THEN-SHIP | BLOCK`.

### Step S2 — Dependency auditor (conditional)

Run **only if** the aggregated diff across this task touched any dependency manifest (see project context brief). Check by inspecting Builder reports for manifest edits.

If triggered, spawn `dependency-auditor` via `Task` with: task identifier, list of dep-manifest files changed, project context brief, lockfile paths. Output is appended to the same issue file under a `## Dependency audit` section.

If not triggered, note in the issue file: `Dependency audit: skipped — no manifest changes.`

### Step S3 — Read issue file and evaluate security verdicts

Re-read the issue file. Evaluate in priority order:

1. **SECURITY BLOCKER** — Either reviewer's verdict is `BLOCK`. Stop and surface findings verbatim. The task is **not** CLEAN. Next action is another builder→auditor cycle targeting these findings (security-relevant code changes must be re-audited for functional regressions).
2. **SECURITY FIX-THEN-SHIP** — Either reviewer's verdict is `FIX-THEN-SHIP`. Stop and surface findings. Same Auditor-agreement bypass applies: single clear recommendation + orchestrator concurs → stamp locked decision, re-loop. Halt only on the four conditions from the functional loop (multi-option, decision conflict, scope expansion, deferral to nonexistent task).
3. **CLEAN** — All applicable reviewers' verdicts are `SHIP`. Report the task fully CLEAN.

When re-looping from a security verdict, the Builder's next-cycle inputs include the security findings as carry-over ACs (the Auditor grades them as ACs on re-audit).

### Verdict-vocabulary mapping

| Reviewer verdict (any of `security-reviewer`, `dependency-auditor`) | Command verdict |
| --- | --- |
| any `BLOCK` | `SEC-BLOCK` |
| any `FIX-THEN-SHIP` (and no `BLOCK`) | `SEC-FIX` |
| all `SHIP` | `CLEAN` |

**Cycle-limit case:** if the loop hits 10 cycles without reaching FUNCTIONALLY CLEAN, the security gate does **not** run. Final verdict is `OPEN` (with cycle count `10/10`).

---

## Gate-capture-and-parse convention (required before declaring CLEAN)

**Reference:** [`_common/gate_parse_patterns.md`](_common/gate_parse_patterns.md)

Before declaring the task fully CLEAN (after the security gate passes), the orchestrator independently runs each gate command and captures output to `runs/<task>/cycle_<N>/gate_<name>.txt`.

For each gate (`npm run check`, the matching smoke script, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`):

1. Run the gate command via Bash.
2. Capture stdout + stderr + exit code into `runs/<task>/cycle_<N>/gate_<name>.txt`.
3. Record the exit code in the same file or a companion `gate_<name>.exit` file.
4. Parse the footer line per the regex table in `_common/gate_parse_patterns.md`.

If **any** gate halts: `🚧 BLOCKED: gate <name> output not parseable; see runs/<task>/cycle_<N>/gate_<name>.txt`. **Do not declare the task CLEAN if any gate halts.**

---

## Cycle summary

After every Auditor cycle, the Auditor writes `runs/<task-shorthand>/cycle_<N>/summary.md` using [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md). When long-running is active, the Auditor also appends to `runs/<task-shorthand>/progress.md`.

---

## Reporting

End-of-cycle one-liner for build→audit cycles:

`Cycle N/10 — [FUNCTIONALLY CLEAN | OPEN: <count> issues | BLOCKED: <issue-id> | USER INPUT: <issue-id>]`

End-of-security-gate one-liner:

`Security gate — [CLEAN | SEC-BLOCK: <count> | SEC-FIX: <count>]`

Final-stop summary: stop condition triggered (functional or security), total cycle count (build→audit cycles + re-loops from security), remaining OPEN issues (id + one-liner), what the user needs to do next.

---

## Why the security gate is separate, not per-cycle

Running security-reviewer every cycle would burn tokens on the same code twice — once when it's broken and noisy, once when it's stable. And a Critical-severity security finding before the code even compiles is useless signal. The functional loop gets the code correct; the security gate then checks the corrected code against a threat model the functional Auditor doesn't own.

Security findings still re-enter the functional loop as carry-over ACs — so a security fix doesn't skip the Auditor. No shortcut out the side door.

## Why the reviewers don't run inline

The security-reviewer and dependency-auditor have narrower scopes and more opinionated threat models than the Auditor. Giving them fresh context, their own system prompts, and read-only-ish tooling is what makes their output worth the spend.

---

## Return

```text
verdict: <CLEAN / FUNCTIONALLY-CLEAN / OPEN / BLOCKED / SEC-BLOCK / SEC-FIX>
file: <repo-relative path to latest durable artifact, or "—">
section: —
```
