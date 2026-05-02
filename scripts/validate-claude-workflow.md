# `validate-claude-workflow.mjs` — what it covers and what it doesn't

Companion to [`validate-claude-workflow.mjs`](validate-claude-workflow.mjs).
Run with `node scripts/validate-claude-workflow.mjs` (or via the
`workflow:validate` npm script). The script exits non-zero on the first
failed check and prints a list.

The script enforces **static integrity** of the `.claude/` workflow
tree. It catches drift the human auditor would catch on a paper review.
It does **not** simulate the orchestrator end-to-end.

## What the script does enforce

47 checks across these categories:

1. **File existence** — all 26 required workflow files (CLAUDE.md, 9
   agents, 2 agent `_common`, 7 commands, 3 command `_common`, 1 skill,
   1 long-running pattern doc, 1 README, `runs/.gitkeep`) exist.
2. **Agent frontmatter** — each agent has `name`, `description`,
   `tools`, `model` and the `name:` field matches the filename stem.
3. **Command frontmatter** — each command has a `model:` field.
4. **Link resolution** — every relative markdown link `[…](…)` inside a
   workflow file resolves to a real file on disk. Placeholder paths
   (anything containing `<…>`) are skipped because they're template
   fill-ins, not real references.
5. **Agent-name references** — every backtick-wrapped agent name in
   CLAUDE.md, README.md, SKILL.md, `_common/non_negotiables.md`, all
   commands, and other agent files resolves to an actual agent file.
6. **LBD references** — every `LBD-<N>` citation in any workflow file
   resolves to a row in the LBD table in CLAUDE.md (range syntax like
   `LBD-1..14` is recognised and skipped).
7. **Dependency-manifest list** — the canonical 9-manifest list is
   identical across CLAUDE.md, `_common/verification_discipline.md`,
   and `dependency-auditor.md`.
8. **Verdict-ladder consistency** — each agent declares a return-verdict
   block (`verdict: <X / Y / Z>`). The set of declared ladders matches
   the table in `_common/non_negotiables.md` exactly, agent-by-agent.
9. **Effort-table model match** — the model column in
   `_common/effort_table.md` matches the actual `model:` frontmatter on
   each of the 9 agent files and 7 command files (16 rows).
10. **Drift-gatekeeper policy** — `auditor` and `architect` are on
    `claude-opus-4-7`; every other agent and every command is on
    `claude-sonnet-4-6`. (The two drift gatekeepers earn the headroom;
    cs-300's deliberate split per `effort_table.md`.)
11. **`npm run …` references** — every `npm run <name>` mentioned in any
    workflow file is a real script in `package.json`.
12. **Status-surface 4-way (LBD-10)** — the 8 procedure files that
    actually drive task close (CLAUDE.md, auditor, builder,
    task-analyzer, clean-tasks, clean-implement, cycle_summary_template,
    long_running_pattern) all enumerate the four surfaces.

If any check fails, the script prints the failing check, the file path,
and a one-line detail.

## What the script does NOT enforce

These need a real exercise of the workflow on a synthetic task. The
script is a paper review; below is what a live dry-run would prove.

### A. Builder/Auditor handoff on a fake task

Create a throwaway task spec (e.g.,
`design_docs/milestones/m_test/tasks/T01_smoke.md`) with one trivial
AC ("add a `// no-op` comment to `scripts/db-smoke.mjs`"). Run
`/clean-implement m-test-T01`.

Verify:

- Builder produces a code change matching the AC and nothing else.
- Builder's chat return is exactly the strict schema
  (`verdict: BUILT / file: <path> / section: —`).
- Auditor runs `npm run check` and the relevant smoke from scratch and
  cites the output.
- Auditor writes `design_docs/milestones/m_test/issues/T01_issue.md`
  with the documented section structure.
- Auditor's verdict is `PASS` (since the AC is trivial), the loop
  proceeds to the security gate.
- Security-reviewer appends `## Security review` and verdict `SHIP`.
- Dependency-auditor does NOT run (no manifest changed) and the
  orchestrator records `Dependency audit: skipped — no manifest changes`.
- Status surfaces flip according to LBD-10.

Tear down by deleting the throwaway milestone directory and reverting
the no-op edit.

### B. Security gate fires only after FUNCTIONALLY CLEAN

Same fake task, but seed the issue file with a HIGH `🚧 BLOCKED`
finding before the loop starts. Run `/clean-implement m-test-T01`.

Verify:

- The orchestrator stops at cycle 1 with the BLOCKER condition (per
  `clean-implement.md` § Stop conditions, condition 1).
- The security gate does NOT run (no security-reviewer artifact in the
  issue file).
- Builder is not spawned against the open blocker.

### C. Dependency-auditor manifest detection

Create a fake task that adds a single benign `devDependency` (e.g.,
`prettier`) to `package.json` and `package-lock.json`. Run
`/clean-implement` through to security gate.

Verify:

- During the security gate, `dependency-auditor` IS spawned.
- It produces a `## Dependency audit` section.
- Its verdict is `SHIP` (prettier is widely used) and the orchestrator
  reports `CLEAN`.
- Bonus: tamper with `package.json` to add a typosquat candidate (e.g.,
  `prettier-fmt` or some unknown single-maintainer package). Verify the
  agent flags it as Critical or High.

### D. `progress.md` append-only across cycles

Create a fake task with `**Long-running:** yes`. Run
`/clean-implement` for 2 cycles (e.g., make the first cycle FAIL by
referencing a non-existent file in the AC, then fix it on cycle 2).

Verify:

- After cycle 1, `runs/m-test-T01/plan.md` exists and is unchanged
  from initial seed.
- After cycle 1, `runs/m-test-T01/progress.md` has a `## Cycle 1` block.
- After cycle 2, `progress.md` has BOTH a `## Cycle 1` and a
  `## Cycle 2` block. Cycle 1's content is unchanged.
- The Builder did not touch `progress.md`. (Inspect the diff if
  uncertain — `git diff` if `runs/` is committed, otherwise check
  modification times.)
- `plan.md` is byte-identical to the post-init version.

### E. Auditor reruns gates from scratch (gate integrity)

Make the Builder report a passing gate that doesn't actually pass.
The Auditor should catch this and flag it as HIGH on gate integrity.

Concrete recipe: edit a fake task to require `npm run check` to PASS,
then add a deliberate type error to `src/components/callouts/Aside.astro`,
and have the Builder claim `type: PASS`. The Auditor should run
`npm run check` itself, catch the failure, and write a HIGH gate-integrity
finding to the issue file.

### F. Cycle-limit behaviour

Manufacture a task that the Builder genuinely can't satisfy in 10 cycles
(e.g., "implement a feature that contradicts LBD-1"). Verify:

- The orchestrator stops after exactly 10 builder→audit cycles.
- The security gate does NOT run on an unclean task.
- Final verdict is `OPEN`, not `CLEAN` and not `CYCLE-LIMIT`.
- The remaining-issues list is non-empty in the chat report.

## Running the static checks

Default:

```bash
node scripts/validate-claude-workflow.mjs
```

Or if added to `package.json`:

```bash
npm run workflow:validate
```

Exit codes:

- `0` — all checks passed.
- `1` — one or more failures.
- `2` — script error (a bug in the validator, not in the workflow).

## When to run

- Before committing changes to anything under `.claude/` or
  `agent_docs/long_running_pattern.md`.
- After editing `CLAUDE.md`'s LBD table, threat model, dependency-audit
  gate manifest list, or verification commands.
- On a periodic cadence — at minimum, before invoking
  `/auto-implement` or `/autopilot` for the first time after a
  workflow change.

## Extending the validator

When you add a new agent / command / `_common` file:

1. Add it to the `required` map in
   `validate-claude-workflow.mjs` § "1. file existence".
2. If it's an agent, add a row to the verdict-ladder table in
   `_common/non_negotiables.md`.
3. If it's an agent or a command, add a row to
   `_common/effort_table.md` with the chosen model + thinking effort.
4. Re-run the validator.

Keep new checks under ~50 LOC each. The script is intentionally a paper
review — when a check needs to actually exercise the orchestrator,
document it as a manual-exercise scenario in this file instead.
