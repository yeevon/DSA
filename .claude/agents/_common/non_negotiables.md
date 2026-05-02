# Autonomous-mode boundaries — shared non-negotiables

These rules apply to every cs-300 subagent.

They define what subagents may not do during autonomous or semi-autonomous project work.

The orchestrator owns workflow control. Subagents provide implementation, review, analysis, and recommendations inside their assigned role.

Project-specific values are defined in [`/CLAUDE.md`](../../../CLAUDE.md). When a value below references the project profile, look it up there.

---

## Project values used by this file

| Setting | Project value |
| --- | --- |
| Default branch | `main` |
| Working branch | `main` (single-user; feature branches are optional) |
| Release command | static GH Pages — pushing to `main` triggers `.github/workflows/deploy.yml` |
| Package managers | `npm` (Node 22) · `uv` (Python 3.12) |
| Architecture decision location | `design_docs/adr/*.md` |
| Architecture source of truth | `design_docs/architecture.md` |
| Approved subagent team | `task-analyzer`, `builder`, `auditor`, `security-reviewer`, `dependency-auditor`, `architect`, `roadmap-selector`, `sr-dev`, `sr-sdet` |

If those values are missing, stop and ask the orchestrator before proceeding.

---

## Rule 1 — No git mutations or release operations

Subagents must not run branch-mutating, history-mutating, tag-mutating, or release/publish commands.

Forbidden commands include:

- `git commit`
- `git push`
- `git merge`
- `git rebase`
- `git reset --hard`
- `git tag`
- `git branch -D`
- `git checkout -B`
- `git clean -fd`
- `npm publish` / `pnpm publish` / `yarn publish`
- `uv publish`
- `docker push`
- `gh release create`

Pushing to `main` triggers the GH Pages deploy. Never trigger that as a subagent.

If a subagent believes a git operation is needed, it must describe the needed action in its report. It must not run the command.

### Allowed git commands

Read-only git inspection is allowed when needed:

- `git status`
- `git diff` / `git diff --stat`
- `git log` / `git show`
- `git branch --show-current`
- `git rev-parse`

Do not use read-only commands as a workaround to perform mutation through shell tricks or aliases.

### Hard halt triggers

Halt immediately and report if any of the following occurs or is requested:

- merge to `main` from outside without explicit user instruction
- push to `main`
- force-push
- release/publish command
- tag creation or movement
- destructive reset/clean
- branch deletion
- toolchain bump (`.nvmrc`, `.pandoc-version`) outside explicit task scope
- subagent claims it already committed, pushed, merged, tagged, or published

A subagent report claiming it performed a forbidden operation is a hard halt.

---

## Rule 2 — Architecture decision changes must be isolated

When a finding requires a new architecture decision or an amendment to an existing one, do not bury that change inside normal implementation work.

Examples for cs-300:

- new architecture rule (e.g., changing the static-by-default deploy posture)
- changed layer boundary (e.g., bypassing the Lua filter)
- new dependency policy
- changed code-execution model (LBD-5)
- changed reference-solution exposure rule (LBD-4)
- changed chapter-content ceiling (LBD-6, LBD-7)
- new attack surface

Required behaviour:

1. Write or propose the decision change at `design_docs/adr/<NNNN>_<slug>.md`, or amend `design_docs/architecture.md`.
2. Include rationale and impact.
3. Keep the decision change separate from unrelated implementation changes.
4. Let the orchestrator decide how and when to commit it.

Decision changes are blocking when:

- implementation would violate a current load-bearing decision (LBD-1..14 in `CLAUDE.md`)
- the task cannot complete without the new decision
- multiple agents disagree on the decision
- the change touches release, security, dependency, or data-handling behaviour

---

## Rule 3 — Subagent team decision rule

When multiple subagents collaborate on a question, they must align before work proceeds.

Disagreement means halt for orchestrator or user input.

Do not average conflicting conclusions.

Do not let the Builder proceed while the Auditor, Security Reviewer, Dependency Auditor, Architect, or SDET reports a material blocker.

### Material disagreement examples

Halt when agents disagree about:

- whether an acceptance criterion is satisfied
- whether a change violates architecture or a load-bearing decision
- whether a dependency is acceptable
- whether a security finding is real
- whether verification is sufficient
- whether scope was expanded
- whether release readiness was proven
- whether a blocker requires user input

### Non-material disagreement examples

The orchestrator may proceed when disagreement is only about:

- wording / formatting preference
- naming preference with no API impact
- optional refactor style
- non-blocking improvement idea

When in doubt, treat it as material and halt.

---

## Rule 4 — Scope boundaries are binding

Subagents must not expand task scope.

Forbidden behaviour:

- adding features not requested
- adopting `nice_to_have.md` items without an explicit trigger
- refactoring unrelated code
- changing public behaviour outside the task
- fixing nearby issues without approval
- rewriting docs or tests beyond what the task requires
- changing architecture to make implementation easier

If extra work appears necessary, report it as recommended follow-up, not as part of the current implementation.

---

## Rule 5 — No secrets or private data in artifacts

Subagents must not write secrets or private data into committed files, logs, fixtures, docs, or generated artifacts.

cs-300 has no real secrets today (single-user / local / no cloud LLM keys), but the rule still applies forward.

Forbidden content includes:

- API keys / access tokens
- passwords / private keys
- real `.env` values
- session cookies
- private URLs or internal endpoints unless explicitly part of the project
- credentials copied from local config
- absolute local paths or `127.0.0.1` references in `dist/`

Use safe placeholders if examples are needed:

- `<API_KEY>`
- `<TOKEN>`
- `<PASSWORD>`
- `<PRIVATE_URL>`

If a secret is discovered in project files, stop and report it. Do not copy the secret into the report.

---

## Rule 6 — Verification claims must be evidence-based

Subagents must not claim a task is verified unless they ran or inspected concrete evidence.

Acceptable verification evidence:

- command run with result (`pdflatex`, `npm run check`, `npm run build`, `node scripts/<smoke>.mjs`, `python scripts/functional-tests.py`)
- file inspection tied to acceptance criteria
- manual smoke result with exact steps
- reviewer/auditor finding with cited artifact

Unacceptable claims:

- looks good
- should work
- seems fine
- probably fixed
- build passing should cover it

If verification was not run, say so directly:

```text
NOT RUN — <reason>
```

---

## Rule 7 — User approval required for destructive or external-impact actions

Subagents must not perform actions that can destroy work, publish artifacts, notify external systems, spend money, or change production/stateful external resources.

Requires explicit user/orchestrator approval:

- deleting files not clearly generated by the task
- destructive database operations (the local SQLite is user data — do not drop/recreate without explicit approval)
- any push to `main` (triggers GH Pages deploy)
- external API calls with side effects
- modifying production config
- changing credentials / secrets
- force-pushing or rewriting history
- removing tests or verification gates

When unsure, stop and ask.

---

## Rule 8 — Output contract is binding

If the invoking command requires a specific return schema, the subagent must follow it exactly.

Do not add prose before or after a strict schema.

Do not summarise when the command asks for only a verdict and artifact path.

Do not hide blockers in a narrative paragraph.

If the required schema cannot represent the result, return the closest valid blocking verdict and write details to the required durable artifact.

Default strict return:

```text
verdict: <see per-agent ladder below>
file: <repo-relative path to durable artifact, or "—">
section: —
```

Per-agent verdict ladders (each agent file is authoritative — this list is for orchestrators):

| Agent | Verdict ladder |
| --- | --- |
| `builder` | `BUILT / BLOCKED / STOP-AND-ASK` |
| `auditor` | `PASS / OPEN / BLOCKED` |
| `security-reviewer` | `SHIP / FIX-THEN-SHIP / BLOCK` |
| `dependency-auditor` | `SHIP / FIX-THEN-SHIP / BLOCK` |
| `architect` | `APPROVE / REVISE / BLOCKED` |
| `sr-dev` | `APPROVE / REVISE / BLOCKED` |
| `sr-sdet` | `PASS / OPEN / BLOCKED` |
| `task-analyzer` | `READY / NOT_READY / NEEDS_CLARIFICATION` |
| `roadmap-selector` | `SELECTED / NONE_READY / NEEDS_INPUT` |

The orchestrator reads durable artifacts directly. The chat return is control data, not the full report.

---

## Rule 9 — Stop conditions

Stop and return control to the orchestrator when:

- required project profile values are missing
- the task spec is ambiguous in a way that affects implementation
- an acceptance criterion is unsatisfiable
- the issue/audit file conflicts with the task spec
- implementation would violate a load-bearing decision (LBD-1..14)
- verification cannot be run or cannot prove the changed behaviour
- there is a material subagent disagreement
- a forbidden git/release/destructive operation would be required
- secrets are found
- user approval is required

Do not improvise around stop conditions. Stopping early is correct behaviour when proceeding would hide risk.
