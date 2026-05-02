---
name: check
description: Verify working-tree vs local-branch vs remote-branch state convergence. Use after autopilot/auto-implement runs to confirm pushed state matches local.
allowed-tools: Bash
---

# check

Working-tree vs pushed-state verifier. Reads the current branch + remote tracking ref +
(optionally) the GH Pages deploy state, and reports drift across the surfaces.

## When to use

- After `/autopilot` or `/auto-implement` runs to confirm local + remote agree.
- Before merging `design_branch` to `main` (which triggers the GH Pages deploy via
  `.github/workflows/deploy.yml`).
- When returning to a paused session and unsure whether prior commits pushed.

## When NOT to use

- For diagnosing a halt — use `/triage` instead.
- For test-failure investigation — run the named smoke directly (e.g.
  `node scripts/db-smoke.mjs`).
- For green-path autopilot runs that just landed — `/check` is for verification after
  the fact, not part of the autopilot procedure.

## Inputs

Default targets (auto-detected from working directory):

- Current branch: `git rev-parse --abbrev-ref HEAD`.
- Remote tracking ref: `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (skip if no
  upstream).
- Working-tree state: `git status --short`.
- Local-ahead commits: `git log --oneline @{u}..HEAD` (if upstream exists).
- Remote-ahead commits: `git log --oneline HEAD..@{u}` (if upstream exists).
- CHANGELOG.md latest dated section (if present).

## Procedure

1. Detect current branch + upstream. If no upstream is set, classify as `LOCAL-ONLY` and
   skip remote comparison.
2. Run the five default git inspections above. Categorize each non-empty output.
3. Classify the overall state using `runbook.md` §Classification matrix:
   - **CLEAN-AND-SYNCED** — empty `git status`, zero local-ahead, zero remote-ahead.
   - **AHEAD-NEEDS-PUSH** — empty `git status`, local-ahead > 0, remote-ahead = 0.
   - **BEHIND-NEEDS-PULL** — empty `git status`, local-ahead = 0, remote-ahead > 0.
   - **DIVERGED** — both local-ahead > 0 AND remote-ahead > 0.
   - **DIRTY-WORKING-TREE** — `git status --short` non-empty.
4. Sandbox guard (LBD-15): if `/.dockerenv` exists, `AHEAD-NEEDS-PUSH` is reported
   informationally only — pushing from inside the sandbox is forbidden. The recommended
   action becomes "switch to host shell to push", not `git push`.
5. Produce the report (see Outputs).

## Outputs

Write `runs/check/<timestamp>/report.md` with:

- **State classification** (one of the five categories; one-paragraph summary).
- **Per-surface inventory** (working tree, local branch, remote branch).
- **Sandbox marker** (YES/NO based on `/.dockerenv`).
- **Next-action recommendation** (one ranked next step, or "no action — clean").

## Return schema

3-line `verdict: / file: / section:` per
`.claude/commands/_common/agent_return_schema.md`. Verdict values:
`CLEAN | DRIFT | LOCAL-ONLY`. `file:` is the report path. `section:` is `—`.

## Helper files

- `runbook.md` — state-classification matrix mapped to next-action commands; sandbox
  vs host adaptations per LBD-15.
