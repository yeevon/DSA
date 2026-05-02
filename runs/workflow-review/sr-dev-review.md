# Workflow consistency review — sr-dev pass
**Verdict:** FIX-THEN-SHIP
**Reviewed:** 2026-05-02
**Scope:** `.claude/agents/*.md` (9), `.claude/agents/_common/*.md` (3), `.claude/commands/*.md` (7), `.claude/commands/_common/*.md` (8), `.claude/skills/*/SKILL.md` + `runbook.md` (6 skills / 10 files), `CLAUDE.md`, `agent_docs/long_running_pattern.md`

---

## Summary

The workflow is internally sound. The agent-return schema, verdict ladders, tool lists, model assignments, and `CLAUDE.md`-grounded threat model are all self-consistent. The mechanical sweep that preceded this review confirmed zero broken file links and matching verdict declarations. The lenses below surface a small set of genuine fixable inconsistencies — the most impactful being a multi-file path ambiguity in how the analysis artifact is named that would cause `roadmap-selector` to mis-classify every milestone as unanalysed even after `/clean-tasks` has run, and a pervasive LBD-count truncation in 11 files that omits the sandbox-vs-host policy decision. Everything else is advisory or a clarification nit.

---

## Findings

### BLOCK — None

### FIX

#### F1 — LBD-1..14 truncation in 11 workflow files (missing LBD-15) [Lens 1, Lens 3]

**Files affected:**
- `.claude/agents/builder.md` — lines 14, 105
- `.claude/agents/auditor.md` — lines 14, 50, 158
- `.claude/agents/architect.md` — lines 71, 170
- `.claude/agents/sr-dev.md` — line 59
- `.claude/agents/task-analyzer.md` — lines 67, 178
- `.claude/agents/_common/non_negotiables.md` — lines 122, 302
- `.claude/commands/audit.md` — lines 17, 19
- `.claude/commands/clean-implement.md` — lines 21, 147
- `.claude/commands/_common/effort_table.md` — lines 7, 13
- `.claude/skills/project-development/SKILL.md` — line 15
- `.claude/README.md` — line 15

**Issue:** CLAUDE.md defines 15 load-bearing decisions (LBD-1..LBD-15). LBD-15 is the sandbox-vs-host git policy — arguably the single most operationally load-bearing rule for autonomous mode. All 11 files above tell agents to enforce "LBD-1..14" when the actual ceiling is 15. An Auditor or Builder that reads the drift table as "1..14" will not self-check for LBD-15 violations and will not cite the decision correctly in findings.

The same inconsistency appears in `clean-implement.md` line 147 specifically: "When no decisions are cited, pass the LBD-1..14 header only" — the counterpart in `spawn_prompt_template.md` (line 59) correctly says "LBD-1..15 table header only".

**Action:** Change every `LBD-1..14` occurrence to `LBD-1..15`. The three files that already correctly say `LBD-1..15` (`clean-implement.md` project-context-brief block at line 60, `auto-implement.md` at line 201, `spawn_prompt_template.md` at line 59/152, `parallel_spawn_pattern.md` at line 120) serve as the model. Note: the `non_negotiables.md` inconsistency is self-contained within that file — lines 55/83/84 correctly cite LBD-15 under Rule 1, but lines 122 and 302 truncate to 14. Fix those two lines.

---

#### F2 — Task-analysis artifact path is inconsistent across three authoritative files [Lens 1, Lens 2]

**Files affected:**
- `CLAUDE.md` line 189 (canonical file-location table): `design_docs/milestones/m<M>_<name>/issues/T<NN>_analysis.md`
- `.claude/commands/_common/agent_return_schema.md` line 52: `design_docs/milestones/m<M>_<name>/task_analysis.md` (no `issues/` sub-directory)
- `.claude/commands/clean-tasks.md` line 155: `design_docs/milestones/<milestone>/issues/task_analysis.md` (milestone-wide, not per-task)
- `.claude/agents/roadmap-selector.md` lines 40, 52, 129: checks for `T<NN>_analysis.md` per task, but `/clean-tasks` never writes that form

**Issue:** The three authoritative sources disagree on whether the analysis artifact is per-task (`T<NN>_analysis.md`) or milestone-wide (`task_analysis.md`), and on whether it lives directly under the milestone directory or under `issues/`. Concrete runtime failure: `roadmap-selector` Filter 1b declares a milestone unanalysed if `T<NN>_analysis.md` is missing — but `/clean-tasks` writes `issues/task_analysis.md` (one file per milestone), never per-task files. Every milestone that has been cleaned by `/clean-tasks` will therefore be permanently flagged as unanalysed by `roadmap-selector`, causing a `NEEDS-CLEAN-TASKS` infinite loop in `/autopilot`.

**Action:** Settle on one canonical shape. The design intent from `task-analyzer.md` Phase 4 already acknowledges both forms: "typically `issues/T<NN>_analysis.md` for a single task, or `issues/task_analysis.md` for a milestone-wide analysis." The path that `/clean-tasks` actually writes (`issues/task_analysis.md`) is the operative one. Update:
1. `agent_return_schema.md` line 52 — change the artifact path to `design_docs/milestones/m<M>_<name>/issues/task_analysis.md`.
2. `roadmap-selector.md` lines 40, 52, 129 — replace the per-task `T<NN>_analysis.md` check with the milestone-wide `issues/task_analysis.md` check. Filter 1b hardened check should read: "no `issues/task_analysis.md`, OR the verdict in that file is `OPEN`, OR carry-over has `🚧 BLOCKED` items".
3. `CLAUDE.md` line 189 — update the canonical location table row to `design_docs/milestones/m<M>_<name>/issues/task_analysis.md`.

---

#### F3 — `/clean-tasks` return token `DONE` conflicts with `/autopilot`'s expected `CLEAN`/`LOW-ONLY` [Lens 1, Lens 6]

**Files affected:**
- `.claude/commands/clean-tasks.md` line 255: `verdict: <DONE / OPEN / STOP-AND-ASK>`
- `.claude/commands/autopilot.md` lines 132, 138, 164, 200, 214: expects `CLEAN` and `LOW-ONLY`

**Issue:** `/clean-tasks` declares its return token as `DONE` (maps to both `CLEAN` and `LOW-ONLY` task-analyzer verdicts). `/autopilot`'s Step C, Step D, and reporting section all expect `CLEAN` or `LOW-ONLY` directly from the procedure. When `/autopilot` inlines the `/clean-tasks` procedure, it reads the final verdict word from the running procedure — but the procedure declares `DONE` while the orchestrator's match arms check `CLEAN`/`LOW-ONLY`. If implemented literally, `/autopilot` will never trigger its "Step C succeeded, return to Step A" branch.

There's an argument that autopilot inlines the procedure and thus reads the internal task-analyzer verdicts (`CLEAN`/`LOW-ONLY`) rather than the top-level clean-tasks return — but this is ambiguous enough to cause a bug when a future LLM re-reads these files independently.

**Action:** Two options:
- Option A (simpler): Change `/clean-tasks` return schema to `verdict: <CLEAN / LOW-ONLY / OPEN / STOP-AND-ASK>` to match the task-analyzer vocabulary autopilot expects. Remove `DONE` throughout `clean-tasks.md`.
- Option B: Add a note in both files clarifying that "DONE = CLEAN or LOW-ONLY" and that autopilot's branch checks are against the task-analyzer sub-verdicts, not the clean-tasks top-level return. Update `autopilot.md` Step C to say "On `CLEAN` or `LOW-ONLY` (i.e., `DONE`)".

Option A is cleaner; it removes a vocabulary mismatch with no loss of expressive power since `DONE` was a lossy alias anyway.

---

#### F4 — `dependency-auditor` section header missing date suffix [Lens 1, Lens 2]

**Files affected:**
- `.claude/agents/dependency-auditor.md` line 151: `section: "## Dependency audit"` (no date)
- `.claude/commands/_common/agent_return_schema.md` line 51: `## Dependency audit (YYYY-MM-DD)` (with date)
- `CLAUDE.md` line 452: `## Dependency audit` (no date in issue-file structure template)

**Issue:** The agent returns a section name without a date, but the schema says the section header should include `(YYYY-MM-DD)`. The orchestrator in `/auto-implement` uses the `section:` value to locate where to stitch the fragment into the issue file. If the agent-written section and the schema differ, the stitching Edit call either produces a duplicate section or misses the target. `security-reviewer` correctly includes the date (line 110); `dependency-auditor` does not.

`CLAUDE.md`'s issue-file template (line 452) also omits the date, which is inconsistent with the schema — but that template predates the terminal-gate reviewers and is incomplete anyway (it lacks `## Sr. Dev review` and `## Sr. SDET review` entirely).

**Action:** Two options:
- Option A: Add `(YYYY-MM-DD)` to `dependency-auditor.md` line 151 to match the schema.
- Option B: Drop the date from `agent_return_schema.md` for both `security-reviewer` and `dependency-auditor` for consistency with how `CLAUDE.md` documents the sections.

Option A is safer (date-stamping aids the audit trail). Also add `## Sr. Dev review`, `## Sr. SDET review`, and `## Architect review` stubs to CLAUDE.md's issue-file structure template to document the auto-implement additions.

---

#### F5 — `agent_docs/long_running_pattern.md` uses dash-separated shorthand format inconsistent with rest of fleet [Lens 3]

**File:** `agent_docs/long_running_pattern.md` line 63

**Issue:** Defines `<task-shorthand>` as "the lowercased milestone-task ID (e.g. `m4-t01`, `m-ux-t3`, `m3-t05`)" — using dash separators. The entire `.claude/` fleet uses zero-padded underscore form `m<MM>_t<NN>` (e.g. `m04_t01`), explicitly chosen "to avoid lexical ambiguity between `m4_t1` and `m4_t10`" per `cycle_summary_template.md` line 33. The Auditor cites this pattern in `auditor.md` line 170. If a Builder or orchestrator reads `long_running_pattern.md` and uses `m4-t01` as the directory name, the Auditor will not find the expected `runs/m04_t01/` directory, breaking `progress.md` append and cycle-summary retrieval.

**Action:** Update `agent_docs/long_running_pattern.md` line 63 from:
```
`<task-shorthand>` is the lowercased milestone-task ID (e.g. `m4-t01`, `m-ux-t3`, `m3-t05`).
```
to:
```
`<task-shorthand>` is `m<MM>_t<NN>` with both M and T zero-padded to two digits (e.g. `m04_t01`, `m04_t08`). This avoids lexical ambiguity between `m4_t1` and `m4_t10`.
```
(matching the phrasing in `cycle_summary_template.md` line 33).

---

### Advisory

#### A1 — `scripts/orchestration/` dead reference in `auditor_context_management.md` [Lens 2, Lens 5]

**File:** `.claude/commands/_common/auditor_context_management.md` line 93

**Quote:** "cs-300 does not currently have orchestration-side telemetry (no `auditor.usage.json` or helper scripts under `scripts/orchestration/`)."

**Issue:** `scripts/orchestration/` does not exist in cs-300. The reference is accurate in saying the path doesn't exist, but naming a non-existent path in a reference document creates a confusing dead link if a future reader tries to look it up.

**Action:** Remove the parenthetical mention of `scripts/orchestration/` or replace with a note like "(no telemetry scripts exist yet)". Low-stakes but easy cleanup.

---

#### A2 — `ship/runbook.md` cites `uv run pytest cs300/workflows/` against a surface that has no test files [Lens 5]

**File:** `.claude/skills/ship/runbook.md` line 47

**Quote:** `| cs300/workflows/*.py | uv run pytest cs300/workflows/ if a test surface exists |`

**Issue:** `cs300/workflows/` contains `grade.py` and `question_gen.py` but no `test_*.py` files. The smoke selection table is conditioned on "if a test surface exists" — so the gate would silently not run. Per `feedback_aiw_uvx_oneshot.md`, workflow modules are smoked via `uvx --from jmdl-ai-workflows aiw ...`, not via `pytest`. The `/clean-implement` verification discipline and `verification_discipline.md` both cite `uvx` as the correct boundary; no workflow-module task smoke should use `pytest` directly.

**Action:** Replace `uv run pytest cs300/workflows/` with the correct smoke pattern: `uvx --from jmdl-ai-workflows aiw <workflow-name>` (per `feedback_aiw_uvx_oneshot.md`). Update the row to reflect the real surface.

---

#### A3 — `CLAUDE.md` issue-file structure template incomplete for auto-implement terminal gate [Lens 6]

**File:** `CLAUDE.md` lines 435-459

**Issue:** The issue-file structure in CLAUDE.md ends at `## Propagation status` and does not include `## Sr. Dev review`, `## Sr. SDET review`, or `## Architect review` sections. These are stitched into the issue file by `/auto-implement`'s terminal gate. An Auditor reading the CLAUDE.md template as the complete issue-file spec will not look for these sections, and a new team member reading CLAUDE.md won't know the full issue-file shape after an autonomous-mode close-out.

**Action:** Add stubs for the three terminal-gate sections to the CLAUDE.md issue-file structure template (after `## Dependency audit`):
```
## Sr. Dev review   (populated by sr-dev at terminal gate)
## Sr. SDET review  (populated by sr-sdet at terminal gate)
## Architect review (populated by architect when triggered)
```

---

#### A4 — `/autopilot` raw_return directory and flat recommendation file use identical prefix, creating confusing path layout [Lens 6]

**File:** `.claude/commands/autopilot.md` lines 25, 97

**Issue:** `runs/autopilot-<ts>-iter<N>/agent_<name>_raw_return.txt` (directory) and `runs/autopilot-<ts>-iter<N>.md` (flat file) share the prefix `autopilot-<ts>-iter<N>`. On a real filesystem these can coexist but the path layout section (lines 181-184) only shows flat files, not the subdirectory for raw returns. A reader constructing the `runs/` tree mentally will be confused about whether `iter<N>` is a file or a directory.

**Action:** Either (a) move raw returns into the same flat-file scheme (`runs/autopilot-<ts>/iter<N>_agent_<name>_raw_return.txt`) or (b) update the path-convention section to explicitly show both the flat `.md` files and the `iter<N>/` subdirectories for raw returns. Either is fine; just pick one and make the convention block match.

---

#### A5 — `effort_table.md` says `auditor` gets Opus 4.7 but the description mentions 14 LBD anchors [Lens 3]

**File:** `.claude/commands/_common/effort_table.md` line 13

**Quote:** "Opus headroom pays for itself when the cs-300 LBDs are dense (14 anchors)"

**Issue:** There are now 15 LBD anchors. Minor, but this is the same family as F1 and is in the same file that already needs updating.

**Action:** Change "14 anchors" to "15 anchors" when fixing F1 in this file.

---

## Architecture notes

- The LBD-1..14 truncation (F1) is the most pervasive single issue. It affects 11 files. Because LBD-15 is the sandbox-vs-host boundary that `auto-implement` and `autopilot` are built around, agents that don't cite it correctly when checking for drift will not catch violations autonomously.
- The analysis-artifact path mismatch (F2) is the most operationally impactful: it breaks the `roadmap-selector` Filter 1b check in a way that would cause `/autopilot` to loop `NEEDS-CLEAN-TASKS` forever on any milestone that has already been cleaned.
- The `/clean-tasks` return token mismatch (F3) would cause silent branch-mismatch in `/autopilot`'s Step C, though only when the procedures are read by an LLM that doesn't infer the equivalence.
- The `long_running_pattern.md` shorthand format (F5) is a correctness issue under the stated rationale in `cycle_summary_template.md` — the reason for the padded-underscore format (lexical ambiguity) is documented and the old-format examples contradict it.
