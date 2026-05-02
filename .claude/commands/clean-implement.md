---
model: claude-sonnet-4-6
thinking: high
---

# /clean-implement

You are the **Clean Implementation loop controller** for: $ARGUMENTS

`$ARGUMENTS` is a task identifier — a task ID (e.g. `M4-T01`), spec file path, or feature descriptor.

This loop drives a task to a clean state by cycling **builder → auditor** up to 10 times, then running a **security gate** (security-reviewer + dependency-auditor when relevant) before declaring the task shippable. Your job is orchestration and stop-condition evaluation. All substantive work runs in dedicated subagents.

Read first:

- [`/CLAUDE.md`](../../CLAUDE.md) — project contract (LBD-1..14, threat model, status-surface 4-way, dep-audit gate, glossary).
- [`../agents/_common/non_negotiables.md`](../agents/_common/non_negotiables.md)
- [`../agents/_common/verification_discipline.md`](../agents/_common/verification_discipline.md)
- [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md)
- [`_common/gate_parse_patterns.md`](_common/gate_parse_patterns.md)

---

## Project setup (run once at the start of the first cycle)

Load conventions from `CLAUDE.md`. Extract into a **project context brief** included verbatim in every Task spawn:

- **Task spec location** — `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md`.
- **Issue file location** — `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md` (created on first audit).
- **Architecture docs** — `design_docs/architecture.md`, `design_docs/adr/*.md`, plus the LBD-1..14 anchor list.
- **Deferred-ideas file** — `design_docs/nice_to_have.md`.
- **Gate commands** — pick the relevant ones from `CLAUDE.md` § Verification commands for the touched surface.
- **Changelog conventions** — `CHANGELOG.md`, dated sections, tags Added / Changed / Removed / Fixed / Decided / Deferred.
- **Dependency manifests** — `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`.
- **Threat model** — `CLAUDE.md` § Threat model.
- **Status-surface 4-way (LBD-10)** — per-task spec, milestone `tasks/README.md`, milestone README task-table row, milestone README `Done when` checkboxes.

If anything is unclear or absent, **stop and ask the user**.

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
2. **USER INPUT REQUIRED** — Any issue recommends "stop and ask the user" / "user decision needed". Stop, list all such issues.
3. **FUNCTIONALLY CLEAN** — Issue file status line reads `✅ PASS` with no OPEN issues. Proceed to the **security gate** (below). Only after the security gate passes is the task fully CLEAN.
4. **CYCLE LIMIT** — 10 build→audit cycles without 1–3. Stop, present outstanding issues. Do **not** run the security gate against an unclean task.

**At the start of cycle 1 only:** if the issue file already contains an unresolved BLOCKER from a prior session, treat as condition 1 — don't spawn the Builder against an open blocker.

---

## Loop procedure

For cycles 1..10:

### Step 1 — Builder

Spawn the `builder` subagent with: task identifier, spec path, issue file path, the project context brief, parent/index doc path, carry-over items, and (when long-running active) `plan.md` + `progress.md` paths. Wait for completion. Capture the Builder's report.

### Step 2 — Auditor

Spawn the `auditor` subagent with: task identifier, spec path, issue file path, architecture docs and ADR paths, gate commands, deferred-ideas file path, the Builder's report, the diff/changed-files reference, and the current cycle number. Wait for completion.

### Step 3 — Read issue file and evaluate stop conditions

**Read the issue file on disk.** Do not trust the Auditor's chat summary — the issue file is the source of truth. Evaluate the four stop conditions in order. If condition 3 (FUNCTIONALLY CLEAN) triggers, go to the **security gate**. If none trigger and cycles remain, loop to Step 1 targeting only the OPEN issues the audit identified.

**Between Step 1 and Step 2, forbidden:**
- Summary of what the Builder did.
- Verdict on the gates.
- Self-predicted cycle status.
- Editing the issue file yourself.

The Auditor is the only thing that can decide whether the task is functionally clean.

---

## Security gate (runs once, after FUNCTIONALLY CLEAN)

The functional audit confirmed the task does what the spec says. The security gate confirms it doesn't introduce risks the spec didn't address. Runs **after** the loop reaches FUNCTIONALLY CLEAN, not on every cycle.

### Step S1 — Security reviewer (always runs)

Spawn `security-reviewer` with: task identifier, spec path, issue file path, the project context brief (including the cs-300 threat model from `CLAUDE.md`), list of files touched across the whole task (aggregate from all Builder reports), and architecture docs + ADR paths.

The security-reviewer appends findings to the same issue file under a `## Security review` section using the SHIP / FIX-THEN-SHIP / BLOCK verdict ladder.

### Step S2 — Dependency auditor (conditional)

Run **only if** the aggregated diff across this task touched any dependency manifest (see project context brief). Check by comparing git state against the task's starting ref, or by inspecting the Builder reports for manifest edits.

If triggered, spawn `dependency-auditor` with: task identifier, list of dep-manifest files changed, project context brief, and lockfile paths. Output is appended to the same issue file under a `## Dependency audit` section.

If not triggered, note in the issue file: `Dependency audit: skipped — no manifest changes.`

### Step S3 — Read issue file and evaluate security verdicts

Re-read the issue file. Evaluate in priority order:

1. **SECURITY BLOCKER** — Security reviewer verdict is `BLOCK`, or dependency auditor verdict is `BLOCK`. Stop and surface findings verbatim. The task is **not** CLEAN. Next action is another builder→auditor cycle targeting these findings, not a retry of the security gate alone — security-relevant code changes must be re-audited for functional regressions.
2. **SECURITY FIX-THEN-SHIP** — Either reviewer's verdict is `FIX-THEN-SHIP`. Stop and surface findings. Same re-loop rule as above: the functional Auditor must see the security fixes, not just the security reviewer.
3. **CLEAN** — All applicable reviewers' verdicts are `SHIP`. Report the task fully CLEAN.

When re-looping from SECURITY BLOCKER or SECURITY FIX-THEN-SHIP, the Builder's next-cycle inputs include the security findings as carry-over ACs (the Auditor will grade them as ACs on re-audit, which is exactly what you want — security fixes get the same "re-verify the whole scope" treatment as any other change).

### Verdict-vocabulary mapping

The reviewers use a `SHIP / FIX-THEN-SHIP / BLOCK` ladder; this command's final return uses `SEC-BLOCK / SEC-FIX / CLEAN`. Translation:

| Reviewer verdict (any of `security-reviewer`, `dependency-auditor`) | Command verdict |
| --- | --- |
| any `BLOCK` | `SEC-BLOCK` |
| any `FIX-THEN-SHIP` (and no `BLOCK`) | `SEC-FIX` |
| all `SHIP` | `CLEAN` |

**Cycle-limit case:** if the loop hits 10 cycles without reaching FUNCTIONALLY CLEAN, the security gate does **not** run. Final verdict is `OPEN` (with cycle count `10/10`), not `CYCLE-LIMIT` — the same `OPEN` verdict that mid-loop OPEN issues produce. The cycle count + outstanding-issues list distinguishes "user gave up" from "user paused for input."

---

## Reporting

End-of-cycle one-liner for build→audit cycles:

`Cycle N/10 — [FUNCTIONALLY CLEAN | OPEN: <count> issues | BLOCKED: <issue-id> | USER INPUT: <issue-id>]`

End-of-security-gate one-liner:

`Security gate — [CLEAN | SEC-BLOCK: <count> | SEC-FIX: <count>]`

Final-stop summary: stop condition triggered (functional or security), total cycle count (build→audit cycles + re-loops from security), remaining OPEN issues (id + one-liner), what the user needs to do next.

---

## Cycle summary

After every Auditor cycle, the Auditor writes `runs/<task-shorthand>/cycle_<N>/summary.md` using [`_common/cycle_summary_template.md`](_common/cycle_summary_template.md). When long-running is active, the Auditor also appends to `runs/<task-shorthand>/progress.md`.

---

## Why the security gate is separate, not per-cycle

Running security-reviewer every cycle would burn tokens on the same code twice — once when it's broken and noisy, once when it's stable. And a Critical-severity security finding before the code even compiles is useless signal. The functional loop gets the code correct; the security gate then checks the corrected code against a threat model the functional Auditor doesn't own.

Security findings still re-enter the functional loop as carry-over ACs — so a security fix doesn't skip the Auditor. No shortcut out the side door.

## Why the reviewers don't run inline

The security-reviewer and dependency-auditor have narrower scopes and more opinionated threat models than the Auditor. Giving them fresh context, their own system prompts, and read-only-ish tooling is what makes their output worth the spend. Running their logic inside the Auditor's context would dilute both.

---

## Return

```text
verdict: <CLEAN / FUNCTIONALLY-CLEAN / OPEN / BLOCKED / SEC-BLOCK / SEC-FIX>
file: <repo-relative path to latest durable artifact, or "—">
section: —
```
