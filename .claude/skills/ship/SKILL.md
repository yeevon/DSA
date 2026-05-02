---
name: ship
description: Pre-merge-to-main checklist for cs-300. Host-only — runs build + dist secret-scan + (on operator approval) merge to main, which triggers GH Pages deploy. Forbidden in autonomy mode.
allowed-tools: Bash
---

# ship

Pre-merge-to-main Skill. Walks build + dist-scan + smoke gates and halts on any non-clean
result. The actual merge-to-main + push (which triggers the GH Pages deploy via
`.github/workflows/deploy.yml`) requires explicit operator approval.

## ⚠️ Host-only — autonomy-mode forbidden

`/ship` MUST NOT be invoked by `/autopilot`, `/auto-implement`, or any orchestrator
agent. Per LBD-15 (sandbox-vs-host git policy): only the operator merges to `main`, and
only on the host (not in the Docker autonomy sandbox). If a sub-agent / orchestrator
attempts to invoke `/ship`, that is a HARD HALT.

The Skill's procedure body refuses to proceed past the dist-scan unless an operator has
explicitly typed approval.

## When to use

- Pre-merge for landing a batch of `design_branch` commits onto `main` (which triggers
  the GH Pages deploy).
- Smoke-testing a release candidate against a clean build before merging.

## When NOT to use

- Inside `/autopilot` / `/auto-implement` — those flows must NEVER touch the merge-to-main
  path (LBD-15).
- For dep-audit / dist secret-scan without intent to merge — use the `dep-audit` Skill.
- For verifying on-disk vs pushed-state — use `/check` instead.

## Inputs

Default targets:

- `package.json` — read `name` + `version` + dependency set.
- `CHANGELOG.md` — read latest dated section (must NOT be `[Unreleased]` or empty for
  the cycle being shipped).
- `dist/` — built artefacts (created by `npm run build`).
- Branch state: must be on a host-authorised branch with a clean working tree.

Optional flags:

- `--dry-run` — run all gates but skip the merge-to-main step even on operator approval.
- `--from-clean` — `rm -rf dist/` before `npm run build` to avoid stale artefacts.
- `--yes` — pre-approve the merge step (skips the typed-token approval prompt).

Precedence: `--dry-run` overrides everything; `--yes` skips the approval prompt;
otherwise typed-token prompt is the default.

## Procedure

1. **Pre-flight (sanity)** — six checks:
   - Verify NOT in the sandbox (`! [ -f /.dockerenv ]`). HALT immediately if in sandbox.
   - Verify current branch is `design_branch` (or another host-authorised feature
     branch). HALT if on `main` already or on an unknown branch.
   - Verify working tree is clean (`git status --short` empty).
   - Verify `CHANGELOG.md`'s latest dated section is non-empty (something to ship).
   - Verify Node + pandoc pins match `.nvmrc` + `.pandoc-version` (LBD-14).
   - Verify `dist/` is empty or `--from-clean` was passed.
   - HALT on any failure with the failing-check name verbatim (see `runbook.md`
     §Pre-flight check matrix).

2. **Build + dist-scan (delegates to dep-audit Skill logic):**
   - If `--from-clean` was passed, run `rm -rf dist/` first.
   - Run `npm run build`.
   - Run the `dist-scan` denylist from `dep-audit` runbook §dist-scan.
   - HALT on any denylist hit.

3. **Smoke gate:**
   - Run the named smokes appropriate to the changeset. At minimum:
     - `npm run check` (Astro typecheck).
     - The smokes named in any task spec landed since the last merge — see
       `runbook.md` §Smoke selection.
   - HALT on any failure.

4. **Operator-approval prompt:**
   - Surface the report so far + the exact `git checkout main && git merge ...` +
     `git push origin main` command line that WOULD be run.
   - Wait for explicit operator approval (typed token like "ship it" or `--yes` flag).
   - On `--dry-run`, skip this step and exit `DRY-RUN-CLEAN`.
   - If no approval, exit with verdict `OPERATOR-WITHHELD-APPROVAL`.

5. **Merge + push:**
   - Run `git checkout main && git merge --ff-only design_branch` (or the named source
     branch). Fall back to `--no-ff` only if the operator explicitly requests it.
   - Run `git push origin main` — this triggers `.github/workflows/deploy.yml`.
   - Capture output. HALT on non-zero exit.

6. **Post-merge verification:**
   - Note the commit SHA pushed. Surface `gh run list -w deploy.yml --limit 1` to the
     operator so they can watch the deploy. Do not block waiting for the deploy.

## Outputs

Write `runs/ship/<timestamp>/report.md` with:

- **Pre-flight summary** — six-check pass/fail.
- **Build + dist-scan summary** — build status, denylist matches.
- **Smoke summary** — exit-codes per named smoke run.
- **Approval status** — APPROVED / WITHHELD / DRY-RUN.
- **Merge status** — MERGED / SKIPPED / FAILED — with exact git exit code if attempted.
- **Post-merge note** — pushed SHA + GH Actions link.

## Return schema

3-line `verdict: / file: / section:` per
`.claude/commands/_common/agent_return_schema.md`. Verdict values:
`SHIPPED | DRY-RUN-CLEAN | OPERATOR-WITHHELD-APPROVAL | HALTED`. `file:` = report path.
`section:` = `—`.

## Helper files

- `runbook.md` — full pre-flight check matrix; smoke-selection guidance per task kind;
  example operator-approval prompts; merge-failure modes.
