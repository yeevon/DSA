# check runbook

The runbook documents the state-classification matrix for the check Skill, mapping each
of the five states to a concrete next-action command. It also covers git invocations
and the sandbox-vs-host adaptation per LBD-15.

## Classification matrix

| State | Condition | Next action (host) | Next action (sandbox, LBD-15) |
|---|---|---|---|
| CLEAN-AND-SYNCED | empty `git status`, local-ahead=0, remote-ahead=0 | No action needed. | No action needed. |
| AHEAD-NEEDS-PUSH | empty `git status`, local-ahead>0, remote-ahead=0 | `git push origin <branch>` | Switch to host shell to push — sandbox cannot push (LBD-15). |
| BEHIND-NEEDS-PULL | empty `git status`, local-ahead=0, remote-ahead>0 | `git pull --ff-only` | Switch to host shell to pull — sandbox cannot fetch (LBD-15). |
| DIVERGED | local-ahead>0 AND remote-ahead>0 | Inspect diff; rebase or merge with care; `git log --oneline @{u}..HEAD` | Switch to host shell to reconcile. |
| DIRTY-WORKING-TREE | `git status --short` non-empty | Commit or stash changes first; re-run `/check`. | Same — commit on `design_branch`. |

## Git invocations

Detection sequence — run each command in order:

```bash
git rev-parse --abbrev-ref HEAD
```

Example output: `design_branch`

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
```

Example output: `origin/design_branch`. If this exits non-zero: no upstream — classify
`LOCAL-ONLY`, skip remote checks.

```bash
git status --short
```

Empty output = clean working tree. Any output = `DIRTY-WORKING-TREE`.

```bash
git log --oneline @{u}..HEAD
```

Empty = not ahead. One or more lines = local-ahead count.

```bash
git log --oneline HEAD..@{u}
```

Empty = not behind. One or more lines = remote-ahead count.

```bash
git diff @{u}..HEAD --stat
```

Use for the per-surface inventory section of the report.

## Sandbox-vs-host (LBD-15)

cs-300 splits git operations between sandbox and host:

- **Sandbox** (`/.dockerenv` exists): commits only, on `design_branch` (or feature
  branch off it). No push, pull, fetch, merge-to-main, tag pushes.
- **Host** (no `/.dockerenv`): user runs push, pull, fetch, merge-to-main, tags.

The `check` Skill detects which side it's running on via `[ -f /.dockerenv ] && echo
sandbox || echo host` and chooses the next-action recommendation accordingly. It
**never** runs the recommended action itself — `check` is a reporter, not an executor.

## Notes

- cs-300 has no PyPI / wheel-publish surface. The publish event is the GH Pages deploy
  triggered by a push to `main` via `.github/workflows/deploy.yml`. The `check` Skill
  does not attempt to verify the GH Pages state; that's `gh api` territory and out of
  scope.
- The CHANGELOG.md inspection is read-only. `check` does not edit the changelog;
  changelog discipline is enforced by Builder/Auditor at task close (LBD-10).
