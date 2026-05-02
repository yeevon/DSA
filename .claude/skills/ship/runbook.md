# ship runbook

The runbook documents the pre-flight check matrix, smoke-selection guidance, operator-
approval prompts, and merge-failure modes for the ship Skill. Host-only — merge path
requires explicit operator approval (LBD-15).

## Pre-flight check matrix

Six checks run in order. HALT immediately on the first failure — report the check name
verbatim.

| Check | Command | Failure condition | HALT message |
|---|---|---|---|
| Not in sandbox | `[ -f /.dockerenv ] && echo SANDBOX` | Output is `SANDBOX` | `HALT: sandbox-detected (LBD-15: ship is host-only)` |
| Source branch is host-authorised | `git rev-parse --abbrev-ref HEAD` | Output is `main` or unknown branch | `HALT: wrong-source-branch (got: <branch>)` |
| Clean working tree | `git status --short` | Non-empty output | `HALT: dirty-working-tree` |
| CHANGELOG has content to ship | Tail of CHANGELOG.md latest section | Section is empty | `HALT: changelog-empty` |
| Toolchain pins match | `cat .nvmrc .pandoc-version; node -v; pandoc --version` | Mismatch (LBD-14) | `HALT: toolchain-pin-drift` |
| dist/ empty or --from-clean | `ls dist/ 2>/dev/null` | Non-empty AND --from-clean not passed | `HALT: stale-dist-artefacts` |

## Build + dist-scan

Delegate dist-scan to the `dep-audit` Skill's runbook §dist-scan. Denylist (recap):

```
.env*
OPENAI_API_KEY / ANTHROPIC_API_KEY / ghp_ / github_pat_
/home/<user>/  /Users/  /home/node/
127.0.0.1  localhost:  http://0.0.0.0
*.sqlite3  runs/  design_docs/
```

Any match → `HALT: dist-denylist-hit (<filename>:<line>)`.

## Smoke selection

The `ship` Skill should run the named smokes appropriate to what changed since the last
merge. Use this rubric (see CLAUDE.md §Verification commands):

| If diff touches… | Run smokes |
|---|---|
| `src/` (Astro) | `npm run check && npm run build` |
| `src/db/` or `src/pages/api/` | `node scripts/db-smoke.mjs` |
| `src/components/annotations*` | `node scripts/annotations-smoke.mjs` |
| `src/lib/read-status*` | `node scripts/read-status-smoke.mjs` |
| `scripts/build-content.mjs` or chapter `.tex` | `node scripts/build-content.mjs && pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` |
| `cs300/workflows/*.py` | `uvx --from jmdl-ai-workflows aiw <workflow-name>` (per-invocation; do NOT `pip install` or `uv tool install` for smokes — see saved memory `feedback_aiw_uvx_oneshot.md`) |
| Any UI route | `python scripts/functional-tests.py` (Selenium smoke) |

Unconditional baseline: `npm run check && npm run build`.

## Operator-approval prompts

Surface the following block before asking for approval:

```
--- /ship approval gate ---
Pre-flight: PASS
Build + dist-scan: PASS
Smoke: PASS

Command that WILL run on approval:
  git checkout main && git merge --ff-only <source-branch> && git push origin main

This pushes to main and triggers GH Pages deploy (.github/workflows/deploy.yml).

Type "ship it" to approve, or any other input to abort.
---------------------------
```

Accepted approval tokens (case-insensitive): `ship it`, `yes`, `y`, `approve`.

On `--yes` flag: skip the prompt entirely; log `approval: pre-approved via --yes flag`.

On `--dry-run`: skip the prompt and log `approval: dry-run — skipped`.

## Merge failure modes

| Mode | Detection | Recommended action |
|---|---|---|
| Non-fast-forward | `git merge --ff-only` exits non-zero with "fast-forward" in stderr | Either rebase the source branch onto main first, or use `--no-ff` after operator confirmation |
| Push rejected | `git push origin main` exits non-zero with "rejected" | `git pull --rebase origin main` then re-run ship |
| Auth failure | `git push` stderr contains `403`, `Permission denied`, `key`, or `ssh` | Verify SSH key + GitHub permissions on host; re-run ship |
| Pre-receive hook | `git push` stderr contains `pre-receive hook` | Read the hook message; resolve; re-run ship |

## Out-of-scope reminders

- `ship` does not bump versions. cs-300 has no PyPI / npm publish — there is nothing to
  bump beyond the CHANGELOG dated section, which is the Builder/Auditor's job at task
  close (LBD-10).
- `ship` does not tag releases. The user can `git tag` manually after a successful ship
  if they want a milestone marker, but it's not required.
- `ship` does not poll the GH Actions deploy result. The post-merge note surfaces the
  GH Actions link; watching the deploy is the operator's job.
