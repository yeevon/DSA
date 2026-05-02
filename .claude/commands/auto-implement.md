---
model: claude-opus-4-7
thinking:
  type: adaptive
effort: high
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /auto-implement

You are the **Autonomous Implementation loop controller** for: $ARGUMENTS

`$ARGUMENTS` is a task identifier — task ID, spec file path, or shorthand like "m4 t1". This command extends `/clean-implement` with the autonomous-mode review surfaces and auto-commit to `design_branch`. Use this only when the user wants the task driven end-to-end without per-cycle approval; for interactive work use `/clean-implement`.

**All substantive work runs in dedicated subagents via `Task` spawns.** Your job is orchestration, stop-condition evaluation, and the terminal commit ceremony — never implement, never audit, never write reviews yourself.

(This is `Task`-based subagent dispatch, not slash-command chaining. The orchestration loop stays inlined here so the loop controller never halts after a sub-step returns.)

---

## Agent-return parser convention

After every `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md):

1. Capture the full text return to `runs/<task>/cycle_<N>/agent_<name>_raw_return.txt`.
2. Split on `\n`; expect exactly 3 non-empty lines.
3. Each line must match `^(verdict|file|section): ?(.+)$`.
4. The `verdict` value must be one of the agent's allowed tokens (see schema reference); trailing whitespace on any value is stripped before validation.
5. On any failure: halt, surface `BLOCKED: agent <name> returned non-conformant text — see runs/<task>/cycle_<N>/agent_<name>_raw_return.txt`. **Do not auto-retry.**

---

## Cache-breakpoint verification (operator-resume step)

**Reference:** [`_common/spawn_prompt_template.md`](_common/spawn_prompt_template.md) §Stable-prefix discipline

After a task completes, the operator may run a cache-breakpoint verifier to confirm the stable-prefix discipline held. If available, output lands at `runs/<task>/cache_verification.txt`.

---

## Spawn-prompt scope discipline

**Reference:** [`_common/spawn_prompt_template.md`](_common/spawn_prompt_template.md)

Pass only what each agent will certainly use. Let agents pull the rest on demand via their own `Read` tool. Full-document content inlining is wasteful; path references are always safe.

After every `Task` spawn, capture the spawn-prompt token count (regex proxy: `len(re.findall(r"\S+", text)) * 1.3`, truncated to int) into `runs/<task>/cycle_<N>/spawn_<agent>.tokens.txt` (nested per-cycle directory).

### `runs/<task>/` directory convention

Create `runs/<task-shorthand>/cycle_1/` at the **start of cycle 1**, before spawning the first Builder. Create `runs/<task-shorthand>/cycle_<N>/` at the start of each subsequent cycle. `<task-shorthand>` is `m<MM>_t<NN>` with both M and T zero-padded to two digits (e.g. `m04_t08`, `m05_t02`).

Per-cycle directory layout (canonical) — see [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md) §Directory layout:

```
runs/<task-shorthand>/
  cycle_1/
    summary.md                  ← cycle-summary (Auditor emits)
    sr-dev-review.md            ← reviewer fragment
    sr-sdet-review.md           ← reviewer fragment
    security-review.md          ← reviewer fragment
    builder.usage.json          ← telemetry (optional)
    auditor.usage.json          ← telemetry (optional)
    gate_<name>.txt             ← gate-output capture
    spawn_<agent>.tokens.txt    ← per-spawn token count
    agent_<name>_raw_return.txt ← full text return per agent
    auditor_rotation.txt        ← rotation event log (present only if rotation fired)
  cycle_2/
    ...
  cycle_N/
    ...
  integrity.txt                 ← pre-commit ceremony (top-level, latest run wins)
  meta.json                     ← pre-task commit SHA
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

**Long-running trigger override** — when `runs/<task>/plan.md` and `runs/<task>/progress.md` exist, replace the cycle-N>=2 `cycle_{N-1}/summary.md` pre-load entry with `plan.md` (immutable) + `progress.md` (cumulative). See [`agent_docs/long_running_pattern.md`](../../agent_docs/long_running_pattern.md).

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

**Decision-record pre-load rule:** parse decision-record citations from the task spec. Pass only those identifiers as a compact list. When no decisions are cited, pass the decision-records grid header only.

**No long-running override for the Auditor spawn** — the Auditor continues to receive standard inputs regardless of the long-running trigger state.

Output budget directive (include verbatim in the Auditor spawn prompt):

```
Output budget: 1-2K tokens. Durable findings live in the issue file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

### Reviewer spawns (sr-dev, sr-sdet, security-reviewer)

Minimal pre-load set: task spec path, issue file path, project context brief, current `git diff`, list of files touched (aggregated from Builder reports across all cycles).

**Remove from inline content:** full source file content, full test file content, architecture-doc content.

Output budget directive (include verbatim in each reviewer spawn prompt):

```
Output budget: 1-2K tokens. Durable findings live in the issue file you append;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

---

## Hard halt boundaries (autonomous-mode non-negotiables)

Read `.claude/agents/_common/non_negotiables.md` before starting.

1. **Push boundary — `design_branch` ONLY (sandbox) / authorised branch ONLY (host).** **HARD HALT** on:
   - any merge to `main`
   - any `git push origin main`
   - any rebase that rewrites `main` history
   - any publish/release command
2. **No subagent runs git mutations or publish.** The orchestrator (this command) is the **only** surface that runs `git commit`. Every subagent prompt forbids these operations. **If any subagent's report claims to have run one of these commands, that's a HARD HALT.**
3. **Load-bearing-decision additions land on isolated commits.** When the architect proposes a new decision (`PROPOSE-NEW-DECISION` verdict), the architecture-doc + decision-record change commits **separately** from the task code change.
4. **Sub-agent disagreement = halt.** When the team's verdicts split (one says BLOCK, others say SHIP), do not auto-resolve. Halt and surface for user.

If at any point the loop attempts to invoke a halted operation, abort the cycle and report the boundary that fired.

---

## Pre-flight (before any agent spawn)

**Important — avoid shell expansion in pre-flight Bash calls.** Each step below is a separate Bash invocation.

1. **Sandbox check.** Run `ls /.dockerenv 2>/dev/null && echo exists || echo absent`. If `exists`: enforce LBD-15 (design_branch only, no push/pull/fetch/merge-to-main).
2. **Branch check.** Run `git rev-parse --abbrev-ref HEAD`. Output must be `design_branch` (inside sandbox) or the user-authorised branch (host). HARD HALT otherwise.
3. **Working tree check.** Run `git status --short`. Output must be empty. HARD HALT on a dirty tree.

If any pre-flight check fails, surface the failure verbatim and halt before spawning the first subagent.

---

## Project setup (run once at the start of cycle 1)

Resolve `$ARGUMENTS` to concrete paths (per `CLAUDE.md` §Canonical file locations):

- **Spec path:** `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`. Resolve shorthand by glob: "m4 t1" → first match. If multiple matches, halt and ask.
- **Issue file path:** `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`. May not exist on cycle 1.
- **Parent milestone overview:** `design_docs/milestones/m<M>_<name>/README.md`.

**Capture pre-task commit SHA:** run `git rev-parse HEAD` and record as `<pre-task-commit>`. Record to `runs/<task-shorthand>/pre_task_commit.txt`.

Build the **project context brief** — pass verbatim to every subsequent `Task` spawn:

```text
Project: cs-300 (TypeScript/Astro + Python 3.12 + LaTeX, GH Pages static deploy)
Layer rule: chapters/ + cs300/workflows/ → scripts/ → src/ → dist/; aiw-mcp is a sibling local process
Gate commands: `npm run check`, `node scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`
Architecture: design_docs/architecture.md
Decision records: design_docs/adr/
Deferred-ideas file: design_docs/nice_to_have.md (out-of-scope by default)
Dep manifests: package.json, package-lock.json, pyproject.toml, uv.lock, requirements*.txt, .nvmrc, .pandoc-version, Dockerfile, docker-compose.yml
Load-bearing decisions: LBD-1..LBD-15 (see CLAUDE.md)
Issue file path: <resolved above>
Status surfaces (must flip together at task close): per-task spec **Status:** line,
                   milestone tasks/README.md row, milestone README task-table row,
                   milestone README "Done when" checkboxes
Autonomy mode: ON — auto-commit design_branch only; HARD HALT on main / publish / decision-conflict.
Sandbox: YES (design_branch only; LBD-15)
```

If anything material is unclear — **halt and surface to the user** before spawning agents.

Write `runs/<task-shorthand>/meta.json`:

```json
{
  "pre_task_commit": "<pre-task-commit>",
  "task": "<task-shorthand>"
}
```

---

## Two-prompt long-running pattern

**Reference:** [`agent_docs/long_running_pattern.md`](../../agent_docs/long_running_pattern.md)

### Trigger check (inline, at project-setup time)

The pattern fires when **either** is true at the start of cycle N:

1. The task spec carries `**Long-running:** yes` under the spec header.
2. `N >= 3` (third Builder cycle on the same task).

### Initializer step (one-shot at first trigger fire)

1. Read the task spec.
2. Write `runs/<task>/plan.md` — extracted from spec `## Why this task exists` + `## What to Build` (high level) + `## Out of scope` + `## Acceptance criteria`. No invented scope.
3. Seed `runs/<task>/progress.md` with heading `# Progress — <task>` and an empty `## Cycle 1` section the Auditor will populate at end of cycle 1.

This is a one-shot, inline orchestrator step — not a separate agent spawn.

### Builder spawn change when trigger is on (cycle N >= 2)

Replace the cycle N>=2 read-only-latest-summary rule with:

- Pass `plan.md` (full content, immutable) + `progress.md` (full content, monotonic).
- Drop `cycle_{N-1}/summary.md` from the Builder's pre-load.

---

## Stop conditions (functional loop, check after every audit, in priority order)

1. **BLOCKER** — Issue file contains a HIGH issue marked `🚧 BLOCKED` requiring user input. Halt, surface verbatim.
2. **USER INPUT REQUIRED** — Any issue recommends "stop and ask the user" / "user decision needed" **and the auditor's recommendation is genuinely ambiguous** (two or more reasonable paths surfaced; the auditor declines to pick one). Halt, list all such issues. **Auditor-agreement bypass:** if the auditor surfaced a single clear recommendation and you concur against the spec + load-bearing decisions + locked decisions, stamp it into the issue file as `Locked decision (loop-controller + Auditor concur, YYYY-MM-DD): <one-line summary>`, feed it to the next Builder cycle as a carry-over AC, and continue the loop. Halt only if (a) the auditor presents two or more options without a recommendation, (b) the recommendation conflicts with a locked decision / prior user decision / the spec, (c) the recommendation expands scope beyond the spec, or (d) the recommendation defers work to a future task that the user hasn't already agreed exists.
3. **FUNCTIONALLY CLEAN** — Issue file status line reads `✅ PASS` with no OPEN issues. Proceed to the **unified terminal gate** below.
4. **CYCLE LIMIT** — 10 build → audit cycles without 1–3. Halt, present outstanding issues. **Do not run the terminal gate against an unclean task.**

**At the start of cycle 1 only:** if the issue file already contains an unresolved BLOCKER from a prior session, treat as condition 1 immediately — don't spawn the Builder against an open blocker.

---

## Functional loop procedure

For cycles 1..10:

### Step 1 — Builder

**Long-running trigger re-check (every cycle):** if the trigger was not already on at cycle 1, re-evaluate it now: if N >= 3 and `runs/<task>/plan.md` does not yet exist, run the initializer step inline before spawning the Builder.

Spawn the `builder` subagent via `Task` with the inputs prescribed by the "Builder spawn — read-only-latest-summary rule" section above. Wait for completion. Capture the Builder's report.

### Step 2 — Auditor

**Input-volume rotation trigger:** Before spawning the Auditor on cycle N ≥ 2, check `runs/<task>/cycle_{N-1}/auditor.usage.json` for input token count. If tokens exceed `AUDITOR_ROTATION_THRESHOLD` (default 60 000) AND cycle N-1 verdict was `OPEN` → spawn the Auditor with **compacted input** (spec path + issue file path + project context brief + current `git diff` + `runs/<task>/cycle_{N-1}/summary.md` content only). Write the rotation event log:

```
# Path: runs/<task>/cycle_{N-1}/auditor_rotation.txt
# Content: ROTATED: cycle <N-1> input_tokens=<value>; cycle <N> spawn input compacted
```

See [`_common/auditor_context_management.md`](_common/auditor_context_management.md) for the full compacted-input shape.

Otherwise, spawn the Auditor with the **standard input** per the "Auditor spawn — read-only-latest-summary rule" section above.

Spawn the `auditor` subagent via `Task`. Wait for completion.

### Step 3 — Read issue file and evaluate stop conditions

**Read the issue file on disk.** Do not trust the Auditor's chat summary — the issue file is the source of truth. Evaluate the four stop conditions in order against what's actually written. If condition 3 (FUNCTIONALLY CLEAN) triggers, go to the **unified terminal gate**. If none trigger and cycles remain, loop to Step 1 targeting only the OPEN issues the audit identified.

**Between Step 1 and Step 2, forbidden:**

- Summary of what the Builder did.
- Verdict on the gates ("gates pass, so the cycle is clean").
- Self-predicted cycle status.
- A "ready for audit" todo update.
- Editing the issue file yourself.

The Auditor is the only thing that can decide whether the task is functionally clean.

---

## Unified terminal gate (runs once, after FUNCTIONALLY CLEAN — parallel)

**Reference:** [`_common/parallel_spawn_pattern.md`](_common/parallel_spawn_pattern.md)

sr-dev, sr-sdet, and security-reviewer run concurrently in a single orchestrator message (three Task tool calls in one assistant turn). Each writes to a fragment file; the orchestrator stitches the fragments into the issue file in a follow-up turn.

### Step G1 — Parallel spawn (three Task tool calls in one assistant turn)

Spawn sr-dev, sr-sdet, and security-reviewer concurrently in a single orchestrator message.

Each agent writes its review to `runs/<task>/cycle_<N>/<agent>-review.md`:
- sr-dev → `runs/<task>/cycle_<N>/sr-dev-review.md`
- sr-sdet → `runs/<task>/cycle_<N>/sr-sdet-review.md`
- security-reviewer → `runs/<task>/cycle_<N>/security-review.md`

Spawn inputs per scope discipline:
- sr-dev: task identifier, spec path, issue file path, project context brief, list of files touched across the whole task, the most recent Auditor verdict.
- sr-sdet: task identifier, spec path, issue file path, project context brief, list of test files touched across the whole task, the most recent Auditor verdict.
- security-reviewer: task identifier, spec path, issue file path, project context brief, list of files touched across the whole task, cited LBD identifiers (compact pointer).

Wait for all three Tasks to complete.

### Step G2 — Read fragments, parse verdicts, apply precedence rule

In a follow-up turn:

1. Read the three fragment files in one multi-Read call.
2. Parse each agent's return-schema verdict line.
3. Apply the precedence rule:
   - **All three SHIP → TERMINAL CLEAN.** Proceed to stitch step (G3) then conditional spawns (G4, G5), then the commit ceremony.
   - **Any reviewer BLOCK → TERMINAL BLOCK.** Halt loop; surface the security-reviewer BLOCK first if applicable, else the offending reviewer's BLOCK verbatim. Next action is another Builder → Auditor cycle targeting these findings.
   - **Any reviewer FIX-THEN-SHIP (no BLOCK) → TERMINAL FIX.** Apply the Auditor-agreement bypass: if all FIX findings carry single clear recommendations and you concur against load-bearing decisions + spec, stamp `Locked terminal decision (loop-controller + reviewer concur, YYYY-MM-DD): <summary>` per finding and re-loop with each as carry-over. Halt only on the same four conditions (multi-option, decision conflict, scope expansion, deferral to nonexistent task).
4. If TERMINAL CLEAN: stitch the three fragment files into the issue file under `## Sr. Dev review`, `## Sr. SDET review`, `## Security review` sections in one Edit pass.

### Step G3 — Stitch fragments into issue file (TERMINAL CLEAN only)

In one Edit pass, append all three `## <Name> review` sections to the issue file in this order: `## Sr. Dev review`, `## Sr. SDET review`, `## Security review`.

### Step G4 — Dependency auditor (conditional, synchronous, post-parallel-batch)

Run **only if** the aggregated diff across this task touched any file in the dependency manifests (`package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`).

If triggered, spawn `dependency-auditor` via `Task` (synchronous — after the parallel batch returns and G3 stitch completes) with: task identifier, list of dep-manifest files changed, project context brief, lockfile path. Output appends under `## Dependency audit` in the issue file.

If not triggered, note in the issue file: `Dependency audit: skipped — no manifest changes.`

### Step G5 — Architect (conditional, on-demand)

Spawn `architect` via `Task` **only if** any of the reviewers flagged a finding whose recommendation reads "this should be a new load-bearing decision" or "violates an unwritten rule". Pass: trigger=`new-decision`, the finding ID, the project context brief.

Architect output appends under `## Architect review` in the issue file.

This is on-demand, not per-cycle.

### Step G6 — Final gate verdict

After G3 stitch (and G4 if triggered, and G5 if triggered), evaluate the final terminal verdict in priority order:

1. **TERMINAL BLOCK** — Any reviewer (including dependency-auditor) returned BLOCK. Halt; surface security-reviewer BLOCK first if applicable. The task is **not** CLEAN. Next action is another Builder → Auditor cycle.
2. **TERMINAL FIX** — Any reviewer returned FIX-THEN-SHIP (no BLOCK). Apply Auditor-agreement bypass or halt for user arbitration.
3. **TERMINAL CLEAN** — All applicable reviewers returned SHIP. Proceed to the **commit ceremony**.

---

## Gate-capture-and-parse convention (required before AUTO-CLEAN stamp)

**Reference:** [`_common/gate_parse_patterns.md`](_common/gate_parse_patterns.md)

Before stamping AUTO-CLEAN, the orchestrator independently runs each gate command and captures output to `runs/<task>/cycle_<N>/gate_<name>.txt`.

For each gate (`npm run check`, the matching smoke script, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`):

1. Run the gate command via Bash.
2. Capture stdout + stderr + exit code into `runs/<task>/cycle_<N>/gate_<name>.txt`.
3. Parse the footer line per the regex table in `_common/gate_parse_patterns.md`.

If **any** gate halts: `🚧 BLOCKED: gate <name> output not parseable; see runs/<task>/cycle_<N>/gate_<name>.txt`. **Do not proceed to AUTO-CLEAN stamp if any gate halts.**

---

## Pre-commit ceremony (runs once, after G6 TERMINAL CLEAN — before commit)

**Reference:** [`_common/integrity_checks.md`](_common/integrity_checks.md)

After all reviewers SHIP (G6 TERMINAL CLEAN) and before the commit ceremony, the orchestrator runs three task-integrity checks. Capture all outputs to `runs/<task-shorthand>/integrity.txt`.

### Check 1 — Non-empty diff

Run `git diff --stat <pre-task-commit>..HEAD`. Assert: output is non-empty. If empty: halt with `🚧 BLOCKED: task-integrity check 1 (empty diff) failed`.

### Check 2 — Non-empty test diff (code tasks only)

Determine task-kind from the spec's `**Kind:**` line. If task-kind contains `code`, run `git diff --stat <pre-task-commit>..HEAD -- scripts/`. Assert: output is non-empty. If empty: halt with `🚧 BLOCKED: task-integrity check 2 (empty test diff for code task) failed`.

### Check 3 — Independent gate re-run

Run the task's primary gate (e.g. `npm run check`). Assert: exit code 0. If any assertion fails: halt with `🚧 BLOCKED: task-integrity check 3 (gate failure) failed`.

**Do not proceed to the commit ceremony if any integrity check halts.**

---

## Commit ceremony (runs once, after TERMINAL CLEAN — autonomous-mode only)

### Step C1 — Decision-record isolation (conditional)

If the architect's verdict was `PROPOSE-NEW-DECISION`: stage only the architecture-doc edit + decision-record file. Commit with message:

```
LBD-<N>: <one-line name> — proposed by architect, isolated for review

Surfaced during M<N> Task <NN> autonomous-mode close-out.

See design_docs/adr/<NNNN>_<name>.md for the full record.

Co-Authored-By: Claude <noreply@anthropic.com>
```

Do NOT push yet.

### Step C2 — Verify diff scope

Run `git status --short` and `git diff --name-only`. Build the union of files-touched from all Builder reports. **HARD HALT** if the working-tree diff includes files not in any Builder report. **HARD HALT** if a toolchain pin file (`.nvmrc`, `.pandoc-version`) was bumped beyond what the spec called for (LBD-14).

### Step C3 — Main task commit

Stage only the files in the Builder-report union: `git add <file1> <file2> ...`. Avoid `git add -A`.

Commit with the standard format:

```
M<N> T<NN>: <title> — autonomous-mode close-out (cycle <N>/10)

<one or two sentences naming what landed, citing the load-bearing decision(s) the task implements>

Cycles run: <N>
Auditor verdict: ✅ PASS
Terminal gate: CLEAN (Sr. Dev: SHIP, Sr. SDET: SHIP, Security: SHIP)
Dependency audit: <SHIP | skipped — no manifest changes>
Architect: <if invoked: verdict + decision-id if proposed>

Files touched:
- <list>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step C4 — No push from sandbox

Inside the sandbox (`/.dockerenv` exists), do NOT run `git push`. The host owns push. LBD-15. Record the commit SHA and report it to the user.

If running on the host (no `/.dockerenv`) and the user has explicitly authorised push, run `git push origin design_branch`. Capture the resulting hash.

### Step C5 — Final report

End-of-task one-liner:

`AUTO-CLEAN — M<N> T<NN> committed: design_branch <hash>; <N> cycles; <decision-id if proposed, else "no new decision proposed">`

---

## Reporting

End-of-cycle one-liner for build → audit cycles:

`Cycle N/10 — [FUNCTIONALLY CLEAN | OPEN: <count> issues | BLOCKED: <issue-id> | USER INPUT: <issue-id>]`

End-of-terminal-gate one-liner:

`Terminal gate — [CLEAN | TERMINAL-BLOCK: <reviewer:count> | TERMINAL-FIX: <reviewer:count>]`

Final-stop summary (whether AUTO-CLEAN or HALT): stop condition triggered, total cycle count, remaining OPEN issues (id + one-liner), commit hash if AUTO-CLEAN, the user action needed if HALT.

---

## Return

```text
verdict: <AUTO-CLEAN / OPEN / BLOCKED / USER-INPUT / CYCLE-LIMIT / HARD-HALT>
file: <issue file path>
section: —
```

---

## Why the unified terminal gate parallelizes all three reviewers

sr-dev, sr-sdet, and security-reviewer each check non-overlapping concerns (code quality, test quality, threat model) and write to non-overlapping fragment files — no shared-state or file-write contention. Spawning all three concurrently reduces wall-clock time from sum-of-three to max-of-three.

## Why this is a separate command from /clean-implement

`/clean-implement` is the manual flow — user reviews each cycle, owns the commit. `/auto-implement` adds the team gate + commit ceremony + hard halt boundaries that only make sense when the user is delegating end-to-end.

## Why architect is conditional in the team gate, not always-on

Architect runs when there's a question to answer — a new-decision proposal or external-claim verification. Running it on every clean task burns budget on a question that wasn't asked.
