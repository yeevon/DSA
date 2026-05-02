---
model: claude-sonnet-4-6
thinking:
  type: adaptive
effort: high
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /clean-tasks

You are the **Clean Task-Generation loop controller** for: $ARGUMENTS

`$ARGUMENTS` is a milestone identifier — a milestone number, milestone slug, or directory path. Examples: `m10`, `m10_<slug>`, `design_docs/milestones/m10_<slug>/`.

You orchestrate three phases:

1. **Generate** the per-task spec files for the milestone if they don't exist yet.
2. **Loop** the `task-analyzer` agent and a fix-application step until the analysis returns no HIGH or MEDIUM findings.
3. **Push down** any LOW findings into each task spec's `## Carry-over from task analysis` section so the Builder sees them at `/clean-implement` time.

The analysis runs in a dedicated `task-analyzer` subagent via `Task`. Fix application runs in main context (you read the analyzer's recommendations and apply Edits inline so the user sees each spec change). Generation runs in main context too, since it's a one-shot synthesis that doesn't need its own agent.

(This is `Task`-based subagent dispatch for analysis only. The orchestration loop below stays inlined here so the loop controller never halts after a sub-step returns.)

---

## Agent-return parser convention

After every `Task` spawn (the `task-analyzer` subagent), parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md):

1. Capture the full text return to `runs/<milestone-shorthand>/round_<N>/agent_task-analyzer_raw_return.txt`.
2. Split on `\n`; expect exactly 3 non-empty lines.
3. Each line must match `^(verdict|file|section): ?(.+)$`.
4. The `verdict` value must be one of `CLEAN`, `LOW-ONLY`, `OPEN` (task-analyzer's allowed tokens); trailing whitespace on any value is stripped before validation.
5. On any failure: halt, surface `BLOCKED: agent task-analyzer returned non-conformant text — see the raw return file`. **Do not auto-retry.**

---

## Project setup (run once at the start)

Resolve `$ARGUMENTS` to a milestone directory:

- Shorthand: `m10` → glob `design_docs/milestones/` for `m10_*/`. Pick the unique match. If multiple matches, ask the user.
- Slug: `m10_<slug>` → resolve to the matching directory under `design_docs/milestones/`.
- Full path: use as-is.

Verify the milestone directory contains a `README.md`. If not, **stop and ask** — the README is the source of truth for task scope.

**Compute the project memory path at runtime** — do not hardcode a username or machine path. **Avoid shell expansion**: `$(pwd | tr / -)` and `${HOME}` substitutions inside a single Bash call trip Claude Code's `Contains expansion` guard and prompt the user, breaking unattended autonomy.

Use **two separate Bash calls** plus orchestrator-side string assembly:

```bash
pwd                # capture working-dir path
printenv HOME      # capture invoking user's home (no expansion)
```

Then in your own thinking: replace every `/` in the captured working-dir path with `-`, and substitute into the form `<HOME>/.claude/projects/<encoded-path>/memory/MEMORY.md`. The resolved string is the `MEMORY_PATH` to use in the project context brief below.

Build the **project context brief** — pass verbatim to every `task-analyzer` spawn:

```text
Project: cs-300 (TypeScript/Astro Node 22 + Python 3.12 + LaTeX, GH Pages static deploy)
Layer rule: chapters/ + cs300/workflows/ → scripts/ (pandoc+lua) → src/ (Astro) → dist/
Gate commands: `npm run check`, `node scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`
Architecture: design_docs/architecture.md
Decision records: design_docs/adr/
Deferred-ideas file: design_docs/nice_to_have.md (out-of-scope by default)
Changelog convention: Under current dated section: Added/Changed/Removed/Fixed/Decided/Deferred — M<N> Task T<NN> (YYYY-MM-DD)
Dep manifests: package.json, package-lock.json, pyproject.toml, uv.lock, .nvmrc, .pandoc-version, Dockerfile, docker-compose.yml
Load-bearing decisions: LBD-1 (static deploy), LBD-2 (two-process local), LBD-3 (pandoc+lua pipeline), LBD-4 (no solutions in DOM), LBD-5 (no sandbox), LBD-6 (40-pp ceiling), LBD-7 (3–5 bounded adds), LBD-8 (no Jekyll polish), LBD-9 (coding_practice off-limits from chapter tasks), LBD-10 (status-surface 4-way), LBD-11 (non-inferential verification), LBD-12 (cross-chapter refs must exist), LBD-13 (pre-phase-1 sequencing), LBD-14 (toolchain pins), LBD-15 (sandbox-vs-host git policy)
Status surfaces (must flip together at task close): per-task spec **Status:** line, milestone tasks/README.md row, milestone README task-table row, milestone README "Done when" checkboxes
Project memory: <MEMORY_PATH computed above; substitute the resolved absolute path>
                   (read for milestone status — on-hold / paused / pending external trigger)
```

---

## Spawn-prompt scope discipline

**Reference:** [`_common/spawn_prompt_template.md`](_common/spawn_prompt_template.md)

Pass only what the `task-analyzer` will certainly use. Let the agent pull full spec contents on demand via its own `Read` tool. Inlining the full text of every spec into the spawn prompt is wasteful and degrades attention; path references are sufficient.

After every `Task` spawn, capture the spawn-prompt token count (regex proxy: `len(re.findall(r"\S+", text)) * 1.3`, truncated to int) into `runs/<milestone-shorthand>/round_<N>/spawn_task-analyzer.tokens.txt`.

### task-analyzer spawn

Minimal pre-load set: milestone directory path, analysis-output file path, project context brief, round number, list of task spec filenames.

**Remove from inline content:** full task spec contents (analyzer reads them via its own Read tool), architecture-doc content, sibling milestone README content.

Output budget directive (include verbatim in the task-analyzer spawn prompt):

```
Output budget: 1-2K tokens. Durable findings live in the task_analysis.md file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

---

## Phase 1 — Generate (run inline; skip if specs already exist)

Check the milestone directory for `T<NN>_*.md` files under `tasks/`. If at least one exists, skip generation and go to Phase 2 — the user has already tasked the milestone out.

If none exist:

1. Read the milestone `README.md` in full. Extract the task-order table (each row names a task slug + kind).
2. Read `design_docs/architecture.md` (especially the load-bearing-decisions section), the cited decision records, and any sibling milestone READMEs the milestone references for grounding.
3. Read at least two recent milestone task specs as templating examples — pick from milestones that already shipped. Match their structural shape (sections: Status / Why this task exists / What to build / Out of scope / Acceptance criteria / Verification plan / Dependencies / Carry-over from prior audits).
4. Write one `design_docs/milestones/<milestone>/tasks/T<NN>_<slug>.md` per row in the task-order table. Each spec must:
   - Cite at least one load-bearing decision from `design_docs/architecture.md`.
   - Set `**Status:** todo`.
   - For code tasks: name an explicit smoke test the Auditor will run (LBD-11).
   - List explicit Out-of-scope items.
   - Include empty `## Carry-over from prior audits` section — populated by `/clean-implement`'s audit cycle later, and possibly by Phase 3 below if LOWs need to be pushed down.
   - **Slice scope:** if the milestone README's task row enumerates ≥ 2 file-disjoint acceptance-criterion groups, emit a `## Slice scope` stub with one row per group. Leave the `Files / symbols` column populated with `<TODO — fill at spec-review time>`. If the task row is not explicitly multi-slice, omit the section.

Do **not** invent scope beyond what the milestone README names. If the README's task row is sparse on a task, write the minimal spec that covers the row + the milestone's exit criteria; do not extrapolate features.

After generation, verify with: `ls design_docs/milestones/<milestone>/tasks/T*.md`. Report the count to the user before entering Phase 2.

### Slice scope section template

When a spec's ACs decompose into file-disjoint slices, append this optional section:

```markdown
## Slice scope (optional — required for parallel-Builder dispatch)

| Slice | ACs | Files / symbols |
|-------|-----|-----------------|
| slice-a | AC-1, AC-2 | `src/foo.ts`, `scripts/foo-smoke.mjs` |
| slice-b | AC-3 | `src/bar.ts`, `scripts/bar-smoke.mjs` |
```

### Slice scope rules

1. The section is **optional**. Specs without it run serial as today.
2. When present, every AC must appear in exactly one slice row. ACs that span multiple files may be grouped into one slice if they cannot be executed in isolation.
3. Slice names are freeform lowercase (e.g. `slice-a`, `core-layer`, `tests-only`).
4. Files must be repo-relative paths. Symbols are optional.
5. A spec with this section is a **candidate for parallel dispatch** in `/auto-implement`'s parallel-Builder path. Tasks without the section always run serial.

---

## Phase 2 — Analyze + fix loop

For rounds 1..5:

### Step 1 — Spawn task-analyzer

Spawn the `task-analyzer` subagent via `Task` with:

- Milestone directory path.
- Analysis-output file path: `design_docs/milestones/<milestone>/issues/task_analysis.md`.
- Project context brief (above).
- Round number (so the analyzer can stamp it into the report).
- List of task specs to analyze (default: every `tasks/T<NN>_*.md` in the milestone dir).

Wait for completion. Capture the agent's return.

### Step 2 — Read the analysis report

**Read the analysis file on disk.** Do not trust the agent's chat summary — the file is the source of truth.

Parse the Summary table to extract `HIGH`, `MEDIUM`, `LOW` counts. Read every finding under each severity heading.

### Step 3 — Evaluate stop conditions (priority order)

1. **STOP-AND-ASK** — Any finding's Recommendation says *"Stop and ask the user"* (typically a HIGH that can't be auto-resolved). Halt the loop, surface the question(s), wait for user input.
2. **CLEAN** — `HIGH = 0` and `MEDIUM = 0` and `LOW = 0`. Loop is done. Report DONE; no Phase 3 work.
3. **LOW-ONLY** — `HIGH = 0` and `MEDIUM = 0` and `LOW > 0`. Proceed to Phase 3 (push LOWs to carry-over) and exit.
4. **OPEN** — `HIGH > 0` or `MEDIUM > 0`. Proceed to Step 4 (apply fixes) and re-loop.
5. **CYCLE LIMIT** — 5 rounds without 2 / 3 / STOP-AND-ASK. Halt; surface the remaining HIGH+MEDIUM findings; ask the user whether to extend or stop.

### Step 4 — Apply fixes (only on OPEN)

For each HIGH and MEDIUM finding:

- If the finding's `Apply this fix:` block is mechanical (literal old_string → new_string), apply it with `Edit` against the cited spec file.
- If the fix has two reasonable options (the analyzer surfaced both), pick the option the analyzer recommended; if no clear recommendation, apply the lower-coupling option and note the choice in your end-of-round report.
- If the fix is non-mechanical (the analyzer marked it `manual — see Recommendation`), apply the Recommendation as best as understood. If you can't apply it confidently, treat the finding as a STOP-AND-ASK and halt the loop.

**Forbidden during Step 4:**

- Editing source code under `src/`, `scripts/`, `cs300/workflows/`, or `chapters/`. Spec edits only.
- Editing the milestone README's task-order table to *avoid* a status-surface MEDIUM finding (fix the spec to match the README's claim, or add a deliverable to update the README; do not silently rewrite the README).
- Adopting items from `design_docs/nice_to_have.md`. Findings about deferred items get their carry-over pushed; the items themselves stay deferred.
- Self-grading pass / fail. Only the analyzer in the next round determines whether the fixes worked.
- Skipping a finding. If you can't fix it, halt with a STOP-AND-ASK.

After applying every HIGH+MEDIUM fix in the current round, increment the round counter and loop back to Step 1.

### Step 5 — Round summary

After each round, emit a one-line summary so the user can follow progress:

`Round <N>/5 — <CLEAN | LOW-ONLY (n LOW) | OPEN (h HIGH, m MEDIUM, l LOW; applied <count> fixes) | STOP-AND-ASK: <one-line>>`

---

## Phase 3 — Push LOWs to spec carry-over (runs once on LOW-ONLY)

For each LOW finding marked `Push to spec: yes`:

1. Open the cited task spec file.
2. Find the `## Carry-over from prior audits` section. If not present, append a new section: `## Carry-over from task analysis`. (Both names are valid; existing audits use the former, this command uses the latter for items pushed down before any audit has run. The `/clean-implement` Builder reads either.)
3. Append the LOW finding as a checkbox item:
   ```markdown
   - [ ] **TA-LOW-NN — <title>** (severity: LOW, source: task_analysis.md round <N>)
         <description>
         **Recommendation:** <recommendation>
   ```
4. Mark the LOW as `pushed=true` in the analysis file (overwrite the analysis file in place with this annotation, OR write a `task_analysis_pushdown_log.md` adjacent — choose whichever is simpler at runtime; both are acceptable, the goal is auditable provenance).

After all LOWs are pushed, report:

`Phase 3 — pushed <count> LOW findings to <m> task spec carry-over sections.`

---

## Stop conditions (full priority list across the run)

In order:

1. **GENERATION-BLOCKED** — Phase 1: milestone README is missing or task-order table can't be parsed. Stop and ask the user.
2. **STOP-AND-ASK** — Phase 2: any finding requires user arbitration. Stop and surface.
3. **CLEAN / LOW-ONLY** — Phase 2 verdict triggers Phase 3 (LOW-ONLY) or exits (CLEAN). Both report DONE.
4. **CYCLE LIMIT** — Phase 2: 5 rounds without convergence. Stop, surface remaining findings, ask the user.
5. **FIX-APPLICATION-BLOCKED** — Phase 2 Step 4: a fix can't be applied confidently. Treat as STOP-AND-ASK.

---

## Reporting

Per-round one-liner during Phase 2 — see Step 5 above.

Final-stop summary:

```text
/clean-tasks <milestone> — <CLEAN | LOW-ONLY | OPEN | STOP-AND-ASK>

Generation: <skipped because specs already existed | wrote N specs>
Loop: <N> rounds run; final verdict <CLEAN | LOW-ONLY | OPEN | CYCLE-LIMIT>.
Pushdown: <skipped | pushed N LOWs to M task specs>
Remaining open: <count, one-liner per HIGH+MEDIUM if any>
Next action: <"task specs are ready for /clean-implement" | "user input required on the listed open findings">
```

---

## Return

```text
verdict: <CLEAN / LOW-ONLY / OPEN / STOP-AND-ASK>
file: <task_analysis.md path>
section: —
```

---

## Why generation, analysis, and fix-application run in different contexts

- **Generation** is one-shot synthesis from the milestone README + recent-milestone templates. It runs inline in the orchestrator's context because it's not iterative and the synthesis benefits from full project-memory context the orchestrator already loaded.
- **Analysis** is read-heavy across the entire codebase. Running it inline would balloon the orchestrator's context with every `Read` and `Grep`. The `task-analyzer` subagent runs with fresh context and a strict read-mostly tool set, so its output stays focused on findings.
- **Fix application** runs in the orchestrator's context because the user wants to see each spec change land via `Edit` (auditable, reversible). A separate "fixer" agent would hide the edits behind a sub-task boundary; that's the wrong shape for design-doc edits where the user often wants to override a fix in flight.

## Why the round limit is 5, not 10

`/clean-implement` allows 10 cycles because each Builder pass may discover new issues only the Auditor surfaces. `/clean-tasks` operates on text only — the same finding categories keep showing up, and a spec that needs more than 5 rounds of analyzer + fix is more likely a milestone-scope problem than a Builder-fixable spec problem. At 5 rounds the orchestrator stops and asks the user, which is the right shape: spec rot resistant to 5 rounds of mechanical fixing usually wants the user, not another loop.

## Why LOW findings push to spec carry-over instead of being fixed in-loop

LOW findings are spec hygiene the Builder can absorb at `/clean-implement` time without blocking. Fixing them in-loop burns rounds on cosmetic improvements (wordsmithing, framing softening, test-isolation hygiene) and tempts the orchestrator into spec rewrites that drift from the milestone README's claim. Pushing them down preserves the LOW's intent (the Builder fixes it as part of the implement cycle) without inflating the loop. The Builder grades each carry-over item as an AC at audit time — same shape as forward-deferred items from prior audits.
