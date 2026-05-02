---
model: claude-sonnet-4-6
thinking: high
---

# /auto-implement

Run autonomous multi-cycle implementation under strict boundaries on cs-300: $ARGUMENTS

`$ARGUMENTS` is a task identifier — a task ID (e.g. `M4-T01`), spec file path, or queue selection instruction.

---

## Hard boundary

Only the orchestrator (this loop controller) may run `git commit` or `git push`, and only on `main` (cs-300's working branch).

Subagents must not run commit, push, merge, rebase, tag, publish, or destructive git commands. See [`../agents/_common/non_negotiables.md`](../agents/_common/non_negotiables.md) for the full forbidden list.

Read first:

- [`/CLAUDE.md`](../../CLAUDE.md)
- [`../agents/_common/non_negotiables.md`](../agents/_common/non_negotiables.md)
- [`../agents/_common/verification_discipline.md`](../agents/_common/verification_discipline.md)

---

## Inputs

- task identifier or queue selection instruction
- task spec path
- issue/audit path
- working branch (`main` by default for cs-300)
- max cycles (default 10 — same as `/clean-implement`)
- gate commands (from `CLAUDE.md` § Verification commands)
- project context brief (LBD-1..14 anchors, threat model, dep-audit gate)

---

## Procedure

1. Verify current branch is `main` (or the user-specified working branch).
2. Verify there are no unrelated dirty changes — record any user-owned changes and stop if they would be committed by mistake.
3. Read the task spec and project context.
4. Check the long-running trigger (`**Long-running:** yes` in the spec, or anticipated cycle count ≥ 3). Initialise `runs/<task>/plan.md` and `runs/<task>/progress.md` if active.
5. Run the Builder cycle (spawn `builder` subagent — see [`../agents/builder.md`](../agents/builder.md)).
6. Run the Auditor cycle (spawn `auditor` subagent — see [`../agents/auditor.md`](../agents/auditor.md)).
7. If verdict is `PASS`, run the security gate (`security-reviewer`, plus `dependency-auditor` if a manifest changed). Same gate as `/clean-implement` § Security gate.
8. If the security gate returns `SHIP`, the task is fully CLEAN. Update status surfaces (LBD-10 — all four), prepare a commit message, ask the user before running `git commit` (see Commit-readiness below).
9. If the verdict is `OPEN`, propagate carry-over and continue the next cycle if cycles remain.
10. If the verdict is `BLOCKED`, `SEC-BLOCK`, `SEC-FIX`, or there is material subagent disagreement, **stop**.
11. Commit/push only if the user has explicitly authorised it for this task. The orchestrator is allowed to run the command; it must still ask first.

---

## Hard halt triggers

- attempt to merge or push `main` without explicit user instruction
- publish/release command (`npm publish` / `uv publish` / `docker push` / `gh release create`)
- toolchain pin bump (`.nvmrc` / `.pandoc-version`) outside explicit task scope (LBD-14)
- subagent disagreement (auditor vs security-reviewer vs dep-auditor on a finding)
- unresolved HIGH audit finding
- missing required verification (LBD-11 — code task without a named smoke)
- dirty working tree containing unrelated user changes
- subagent claims it performed a forbidden git/release operation

---

## Commit-readiness

When a task is ready to commit, prepare a message that cites:

- task ID + short title (e.g. `M4 Task T01 — arch and package`)
- relevant LBD anchors / ADRs touched
- ACs satisfied
- verification summary (gate results table)
- `Dep audit:` line per `CLAUDE.md` § Dependency audit gate

Do not let subagents commit directly. Ask the user before pushing — pushing to `main` triggers the GH Pages deploy.

---

## Return

```text
verdict: <CLEAN / OPEN / BLOCKED / HALTED / SEC-BLOCK / SEC-FIX>
file: <repo-relative path to latest durable artifact, or "—">
section: —
```
