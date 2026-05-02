# triage runbook

The runbook documents the halt-classification taxonomy and detection patterns for the
triage Skill. It provides option matrices (2–3 ranked next-actions per halt class) so
the operator has concrete commands. Worked examples cover cycle-limit and user-input-
ambiguity halts.

## Halt classifications

Detection signal per halt class:

| Classification | Detection signal |
|---|---|
| Cycle limit | Issue body contains `cycle limit` or `10/10`; last commit prefix is an in-progress save |
| BLOCKER | Issue `**Status:**` line contains `🚧 BLOCKED`; a HIGH finding with no resolution |
| USER INPUT REQUIRED | Issue or auditor return contains `USER INPUT REQUIRED` or `user arbitration` |
| Sub-agent disagreement | Auditor return has `verdict: BLOCK` from one reviewer and `verdict: SHIP` from another |
| Pre-flight failure | No task commit; no Builder spawn; `runs/<task>/cycle_1/` directory absent |

Detection regexes (Python-compatible, case-insensitive):

- Cycle limit: `r'cycle\s+limit|10/10\s+cycles'`
- BLOCKER: `r'🚧\s*BLOCKED|HIGH.*requires user action'`
- USER INPUT REQUIRED: `r'USER INPUT REQUIRED|user arbitration'`
- Sub-agent disagreement: `r'verdict:\s*BLOCK'` paired with `r'verdict:\s*SHIP'`
- Pre-flight failure: absence of `runs/<task>/cycle_1/` directory

## Option matrices

Ranked by blast radius (rank 1 = lowest). One table per halt class. The "host" /
"sandbox" suffix indicates whether the action is allowed in the current environment per
LBD-15.

**Cycle limit:**

| Rank | Option | Command (sandbox + host) |
|---|---|---|
| 1 | Resume with a fresh cycle | `/auto-implement m<M> t<NN>` — Builder re-reads carry-over |
| 2 | Decompose ACs into sub-tasks | Edit spec; re-run `/clean-tasks m<M>` |
| 3 | Manual fix | Edit source; run named smoke; commit |

**BLOCKER:**

| Rank | Option | Command |
|---|---|---|
| 1 | Resolve blocker | Address HIGH finding; clear `🚧 BLOCKED`; re-run `/auto-implement` |
| 2 | Downgrade finding | Edit issue if mis-classified HIGH; re-run auditor |
| 3 | Skip task | Mark `🚫 Skipped` in milestone README task table; advance queue |

**USER INPUT REQUIRED:**

| Rank | Option | Command |
|---|---|---|
| 1 | Answer the question | Provide decision; re-run `/auto-implement` with explicit instruction |
| 2 | Update spec | Edit task spec to remove ambiguity; re-run `/auto-implement` |
| 3 | Accept recommendation | Endorse auditor default; re-run |

**Sub-agent disagreement:**

| Rank | Option | Command |
|---|---|---|
| 1 | Lens-specialisation bypass | Different lenses (sr-dev vs sr-sdet) = Builder re-loop, not HARD HALT |
| 2 | User arbitration | Read both verdicts; instruct Builder with the higher-priority concern |
| 3 | Re-scope | Edit spec to remove scope ambiguity; re-run from cycle 1 |

**Pre-flight failure:**

| Rank | Option | Command (host) | Command (sandbox, LBD-15) |
|---|---|---|---|
| 1 | Check branch + sandbox | `git rev-parse --abbrev-ref HEAD` — confirm authorised branch | Confirm `design_branch`; never `main` |
| 2 | Clean working tree | Commit or stash untracked files; re-run `/auto-implement` | Same — commit on `design_branch` |
| 3 | Confirm tools available | `node -v`; `npm -v`; `pandoc --version` | Same — sandbox tools also need verification |

## Example reports

### Example 1 — Cycle limit

```
runs/triage/2026-05-02T10-00-00/report.md

## Halt signature

Command: /auto-implement. Task: M4 T08. Cycle: 10/10.
Classification: Cycle limit — Builder reached 10 cycles without satisfying all ACs.

## Run-state inventory

spec:  design_docs/milestones/m4_phase4_question_gen/tasks/T08_llm_graded_async.md
issue: design_docs/milestones/m4_phase4_question_gen/issues/T08_issue.md
runs:  runs/m4-t08/cycle_10/summary.md

## Sandbox marker: YES (design_branch only per LBD-15)

## Next-action options

1. Resume: /auto-implement m4 t08 — Builder re-reads carry-over.
2. Decompose: split remaining ACs into sub-tasks; re-run /clean-tasks m4.
3. Manual: edit files directly; run named smoke; commit on design_branch.
```

### Example 2 — User-input ambiguity

```
runs/triage/2026-05-02T11-00-00/report.md

## Halt signature

Command: /autopilot. Task: M5 T03. Cycle: 3/10.
Classification: USER INPUT REQUIRED — auditor surfaced ambiguous AC on FSRS
parameter set (default vs custom); no authoritative answer in spec.

## Run-state inventory

spec:  design_docs/milestones/m5_phase5_review_loop/tasks/T03_review_due_endpoint.md
issue: design_docs/milestones/m5_phase5_review_loop/issues/T03_issue.md

## Sandbox marker: YES (design_branch only per LBD-15)

## Next-action options

1. Answer: reply with explicit FSRS parameters; re-run /auto-implement m5 t03.
2. Update spec: add FSRS parameter set to T03 spec; re-run from cycle 1.
3. Accept default: auditor recommended ts-fsrs default; endorse and re-run.
```
