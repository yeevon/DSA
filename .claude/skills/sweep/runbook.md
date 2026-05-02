# sweep runbook

The runbook provides spawn-prompt templates for the three reviewers invoked by the sweep
Skill, the precedence rule for aggregating SHIP / FIX-THEN-SHIP / BLOCK verdicts into a
single SWEEP verdict, and one CLEAN and one FIX-THEN-SHIP example consolidated report.

## Spawn-prompt templates

Use these minimal-preload prompts when spawning reviewers in parallel. Each template
references only what the reviewer needs; full agent prompts load from
`.claude/agents/<name>.md`.

**sr-dev prompt:**

> You are sr-dev. Review the attached diff for correctness, layer discipline, and
> LBD-1..15 compliance.
> Files touched: `<files-list>`. Diff: `<diff-content>`.
> Write your review fragment to `runs/sweep/<timestamp>/sr-dev-review.md`.
> Return 3 lines per `.claude/commands/_common/agent_return_schema.md`:
> `verdict: SHIP | FIX-THEN-SHIP | BLOCK`, `file: <path>`, `section: —`.

**sr-sdet prompt:**

> You are sr-sdet. Review the attached diff for verification coverage (named smokes per
> LBD-11), edge cases, and AC coverage.
> Files touched: `<files-list>`. Diff: `<diff-content>`.
> Write your review fragment to `runs/sweep/<timestamp>/sr-sdet-review.md`.
> Return 3 lines per `.claude/commands/_common/agent_return_schema.md`:
> `verdict: SHIP | FIX-THEN-SHIP | BLOCK`, `file: <path>`, `section: —`.

**security-reviewer prompt:**

> You are security-reviewer. Review the attached diff against the cs-300 threat model
> (single-user, local-machine, GH Pages static deploy). Focus on: reference-solution
> leakage (LBD-4), MDX/HTML injection through pandoc Lua filter, question-content
> injection from local LLM, annotation rendering self-XSS, code-execution subprocess
> integrity, what ends up in `dist/`, supply-chain / install-time RCE, path handling in
> the content pipeline.
> Files touched: `<files-list>`. Diff: `<diff-content>`.
> Write your review fragment to `runs/sweep/<timestamp>/security-review.md`.
> Return 3 lines per `.claude/commands/_common/agent_return_schema.md`:
> `verdict: SHIP | FIX-THEN-SHIP | BLOCK`, `file: <path>`, `section: —`.

## Precedence rule

Aggregate the three reviewer verdicts using this strict hierarchy:

| Condition | SWEEP verdict |
|---|---|
| Any reviewer returns BLOCK | `SWEEP-BLOCK` |
| Any reviewer returns FIX-THEN-SHIP (no BLOCK) | `SWEEP-FIX` |
| All three return SHIP | `SWEEP-CLEAN` |

Rule source: mirrors the auto-implement terminal-gate aggregation; full reference at
`.claude/commands/_common/parallel_spawn_pattern.md` §Precedence rule.

## Example reports

### Example 1 — `SWEEP-CLEAN`

```
runs/sweep/2026-05-02T12-00-00/report.md

## Sweep verdict: SWEEP-CLEAN

Base ref: HEAD. Files: src/lib/aiw-client.ts.

| Reviewer | Verdict | Fragment |
|---|---|---|
| sr-dev | SHIP | runs/sweep/2026-05-02T12-00-00/sr-dev-review.md |
| sr-sdet | SHIP | runs/sweep/2026-05-02T12-00-00/sr-sdet-review.md |
| security-reviewer | SHIP | runs/sweep/2026-05-02T12-00-00/security-review.md |

All three reviewers returned SHIP. No action required.
```

### Example 2 — `SWEEP-FIX`

```
runs/sweep/2026-05-02T13-00-00/report.md

## Sweep verdict: SWEEP-FIX

Base ref: main. Files: src/pages/api/attempts.ts.

| Reviewer | Verdict | Fragment |
|---|---|---|
| sr-dev | SHIP | runs/sweep/2026-05-02T13-00-00/sr-dev-review.md |
| sr-sdet | FIX-THEN-SHIP | runs/sweep/2026-05-02T13-00-00/sr-sdet-review.md |
| security-reviewer | SHIP | runs/sweep/2026-05-02T13-00-00/security-review.md |

sr-sdet returned FIX-THEN-SHIP: missing edge-case smoke for empty response.text in
the llm_graded path. Address the finding before committing.
```
