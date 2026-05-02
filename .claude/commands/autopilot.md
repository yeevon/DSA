---
model: claude-opus-4-7
thinking:
  type: adaptive
effort: high
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /autopilot

You are the **Autonomous Queue-Drain orchestrator** for: $ARGUMENTS

`$ARGUMENTS` is optional. If empty, drain the entire open queue. If a milestone-list shorthand (e.g. "m4 m5") is given, scope the drain to those milestones only.

This command is the meta-loop on top of `/queue-pick`, `/clean-tasks`, and `/auto-implement`. It loops over (queue-pick → clean-tasks-if-needed → auto-implement) until the queue drains, the user-supplied scope is exhausted, or a halt fires. **It does not chain via the `Skill` tool** (Skill chaining returns after one call, breaking the outer loop); instead, the orchestrator reads `.claude/commands/auto-implement.md` and `.claude/commands/clean-tasks.md` and executes their procedures inline as part of this single conversation.

**This is the autonomy command.** It auto-commits to `design_branch` (sandbox) or the authorised host branch, runs every team gate, and only stops on halt boundaries or queue exhaustion. Use `/queue-pick` for the manual one-shot version.

---

## Agent-return parser convention

After every `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md):

1. Capture the full text return to `runs/autopilot-<run-timestamp>-iter<N>/agent_<name>_raw_return.txt`.
2. Split on `\n`; expect exactly 3 non-empty lines.
3. Each line must match `^(verdict|file|section): ?(.+)$`.
4. The `verdict` value must be one of the agent's allowed tokens (see schema reference); trailing whitespace on any value is stripped before validation.
5. On any failure: halt, surface `BLOCKED: agent <name> returned non-conformant text — see the raw return file`. **Do not auto-retry.**

---

## Spawn-prompt scope discipline

**Reference:** [`_common/spawn_prompt_template.md`](_common/spawn_prompt_template.md)

Pass only what each agent will certainly use. Let agents pull the rest on demand via their own `Read` tool. Full-document content inlining is wasteful; path references are always safe.

---

## Hard halt boundaries (autonomous-mode non-negotiables)

Same as `/auto-implement`'s set, restated so this orchestrator is self-contained.

1. **Push boundary — `design_branch` ONLY (sandbox) / authorised branch ONLY (host).** **HARD HALT** on:
   - any merge to `main` / any `git push origin main` / any rebase rewriting `main` history
   - any publish/release invocation
   - any toolchain-pin bump (`.nvmrc`, `.pandoc-version`) beyond what a task spec calls for (LBD-14)
2. **No subagent runs git mutations or publish.** The orchestrator is the only surface that performs `git commit`. A subagent report claiming to have run one of these = HARD HALT (rogue behaviour).
3. **Load-bearing-decision additions land on isolated commits.** When the architect proposes a new decision, that change commits separately from the task code change.
4. **Sub-agent disagreement = halt.** When the team's verdicts split (one BLOCK, one SHIP), do not auto-resolve. Halt + surface.
5. **Per-task halt = stop the outer loop.** If `/auto-implement` halts mid-task (cycle limit, BLOCKER, USER INPUT, security BLOCK, team disagreement), the outer loop stops. Do not skip the failing task and pick the next one — the user owns the decision.

If at any point the loop attempts to invoke a halted operation, abort the iteration and report the boundary that fired.

---

## Pre-flight (run once, before iteration 1)

**Important — avoid shell expansion in pre-flight Bash calls.** Each step below is a **separate** Bash invocation.

1. **Sandbox check.** Run `ls /.dockerenv 2>/dev/null && echo exists || echo absent`. If `exists`, enforce LBD-15 (design_branch only, no push/pull/fetch/merge-to-main).
2. **Branch check.** Run `git rev-parse --abbrev-ref HEAD`. Output is `design_branch` (sandbox) or the user-authorised branch (host). HARD HALT otherwise.
3. **Working tree check.** Run `git status --short`. Output is empty. HARD HALT on a dirty tree.
4. **Memory path computation.** Run `pwd` (no expansion) and capture the working-directory path. Then in your own thinking, replace every `/` with `-` and substitute into the form `$HOME/.claude/projects/<encoded-path>/memory/MEMORY.md`. Run `printenv HOME` (separate Bash call) to get `$HOME`. Run `ls -la <fully-resolved-path>` (literal path) to verify the file exists. HARD HALT if missing.
5. **Resolve milestone scope** from `$ARGUMENTS` (empty = all open; otherwise the supplied list).

Surface every pre-flight failure verbatim and halt before iteration 1.

---

## Outer loop — drain the queue

For iteration `N` from 1 upward (no hard cap; halt on the boundaries above or queue-exhaust below):

### Step A — Roadmap selection (queue-pick logic, inlined)

#### Read-only-latest-shipped rule (iteration N ≥ 2)

On iteration 1, spawn the `roadmap-selector` with only the project context brief and the recommendation-file path.

On iteration N ≥ 2, spawn the `roadmap-selector` with:
- The project context brief.
- The recommendation-file path.
- The content of the most recent iter-shipped artifact (`runs/autopilot-<run-timestamp>-iter<N-1>-shipped.md`) for context on what the prior iteration delivered.
- **Do NOT** carry prior iteration chat history into this spawn.

1. Build the **project context brief** for `roadmap-selector`:
   ```text
   Project: cs-300 (TypeScript/Astro + Python 3.12 + LaTeX, GH Pages static deploy)
   Memory path: <MEMORY_PATH from pre-flight>
   Architecture: design_docs/architecture.md
   Roadmap: design_docs/roadmap_addenda.md
   Deferred-ideas file: design_docs/nice_to_have.md (out-of-scope by default)
   Milestone scope: <from $ARGUMENTS, or "all open">
   ```
2. Recommendation file path: `runs/autopilot-<run-timestamp>-iter<N>.md`.
3. Spawn the `roadmap-selector` subagent via `Task`. Wait for completion.
4. **Read the recommendation file on disk.** Verdict line is the source of truth.

Branch on verdict:

- **PROCEED** with `<task>` → go to Step B.
- **NEEDS-CLEAN-TASKS** with `<milestone>` → go to Step C.
- **HALT-AND-ASK** → surface verbatim, halt the outer loop.

### Step B — Drive the task (auto-implement procedure, inlined)

**Read `.claude/commands/auto-implement.md` and execute its full procedure inline against the recommended task.** That file is the authoritative procedure; do not paraphrase it. Execute every step in order:

- Pre-flight (already covered by this orchestrator's pre-flight; skip the duplicates if state still holds).
- Project setup with the resolved task ID.
- Functional loop (1..10 Builder → Auditor cycles).
- Stop-condition evaluation each cycle. Auditor-agreement bypass applies.
- Unified terminal gate (sr-dev + sr-sdet + security-reviewer parallel, dependency-auditor + architect conditional).
- Pre-commit ceremony (integrity checks).
- Commit ceremony (decision-record isolation if applicable + main task commit — no push from sandbox per LBD-15).

**On `AUTO-CLEAN`:** record the task in the run log (see Step E reporting), then return to Step A (next iteration). The working tree is clean again.

**On any halt** (cycle limit, BLOCKER, USER INPUT, security BLOCK, security FIX-THEN-SHIP without bypass match, team BLOCK, team divergence, decision conflict): halt the outer loop with that procedure's halt surface verbatim. Do not skip the task.

### Step C — Harden the milestone's specs (clean-tasks procedure, inlined)

**Read `.claude/commands/clean-tasks.md` and execute its full procedure inline against the recommended milestone.** Execute every step in order:

- Project setup (re-use the memory path + project context brief).
- Phase 1 — Generate task specs from the overview if missing.
- Phase 2 — Spawn `task-analyzer`, read `task_analysis.md`, evaluate stop conditions, apply HIGH+MEDIUM fixes inline, re-loop. Up to 5 rounds.
- Phase 3 — Push LOWs to spec carry-over (only on LOW-ONLY).

**On `CLEAN` or `LOW-ONLY`:** the milestone's specs are now hardened; record the milestone in the run log, then return to Step A.

**On any halt** (GENERATION-BLOCKED, STOP-AND-ASK, CYCLE LIMIT without convergence, FIX-APPLICATION-BLOCKED): halt the outer loop with the surface verbatim.

### Step D — Iteration boundary

After Step B's `AUTO-CLEAN` or Step C's `CLEAN`/`LOW-ONLY`:

1. Re-verify the working tree is clean (`git status --short` empty). If dirty, HARD HALT.
2. Re-verify branch is still `design_branch` (or the authorised host branch). HARD HALT otherwise.
3. **Write the iter-shipped artifact** at `runs/autopilot-<run-timestamp>-iter<N>-shipped.md`:

   ```markdown
   # Autopilot iter <N> — shipped

   **Run timestamp:** <YYYY-MM-DDTHHMMSSZ>
   **Iteration:** N
   **Date:** YYYY-MM-DD
   **Verdict from queue-pick:** <PROCEED | NEEDS-CLEAN-TASKS | HALT-AND-ASK>

   ## Task shipped (if PROCEED)
   - **Task:** <milestone>/<task spec filename>
   - **Cycles:** N
   - **Final commit:** <sha> on `design_branch`
   - **Files touched:** <list>
   - **Auditor verdict:** PASS
   - **Reviewer verdicts:** sr-dev=<verdict>, sr-sdet=<verdict>, security=<verdict>, dependency=<verdict>
   - **Decision-record additions (if any):** <decision-id + record-file, isolated commit sha>

   ## Milestone work (if NEEDS-CLEAN-TASKS)
   - **Milestone:** <milestone>
   - **/clean-tasks rounds:** N
   - **Final stop verdict:** <CLEAN | LOW-ONLY>
   - **Specs hardened:** <list of task spec filenames>

   ## Halt (if HALT-AND-ASK)
   - **Halt reason:** <one paragraph>
   - **User-arbitration question(s):** <bullet list>

   ## Carry-over to next iteration
   - *(empty for routine iterations)*
   ```

4. Increment `N`; return to Step A.

#### Path convention

```
runs/
  autopilot-20260502T152243Z-iter1.md            (kick-off recommendation file)
  autopilot-20260502T152243Z-iter1-shipped.md    (close-out artifact, Step D)
  autopilot-20260502T152243Z-iter2.md
  autopilot-20260502T152243Z-iter2-shipped.md
  ...
```

### Queue-exhaust condition

`Step A` returning `HALT-AND-ASK` with a "no eligible candidates after sequential walk" surface and an empty open-task list is the queue-drained signal. Report `QUEUE DRAINED` and exit cleanly.

---

## Step E — Reporting

### Per-iteration one-liner

After each Step A/B/C completion, emit one line so the user can follow progress:

`Iter N — <PROCEED <task> → AUTO-CLEAN <hash> | NEEDS-CLEAN-TASKS <milestone> → LOW-ONLY (n LOWs) | HALT-AND-ASK: <one-liner>>`

### Final report

When the outer loop terminates, emit a structured summary:

```
/autopilot — <DRAINED | HALT: <reason> | SCOPE-EXHAUSTED>

Iterations run: N
Tasks shipped: <count>
  - <milestone/task> @ design_branch <sha>
  - ...
Milestones cleaned: <count>
  - <milestone> → <CLEAN | LOW-ONLY (n LOWs)>
Decision-record additions: <count>
  - <decision-id> "<name>" — design_branch <isolated commit hash>
Halt reason (if any): <single paragraph; verbatim from the failing step's halt surface>
Recommendation files: runs/autopilot-<run-timestamp>-iter*.md
```

---

## Return

```text
verdict: <DRAINED / HALTED / SCOPE-EXHAUSTED>
file: <latest iter-shipped artifact path, or "—">
section: —
```

---

## Why /autopilot reads + executes inline instead of Skill-chaining

`Skill("/auto-implement")` returns control after one task completes — the outer loop never sees iteration 2. The project rule is "composite commands that loop must inline the full procedure." Inlining a multi-hundred-line procedure into this file would create drift between `/autopilot.md`, `/auto-implement.md`, and `/clean-tasks.md`. The middle path: this orchestrator **reads the procedure files at runtime** and executes their steps inline. Reading a markdown file is not Skill chaining; the procedure files stay authoritative; this orchestrator stays compact.

## Why the outer loop halts on the first per-task failure

Skipping a failing task and continuing to the next one would silently lose work and surface a broken task only at the end of a long run. Halting at the first failure means the user sees the issue immediately, can decide whether to retry / fix / skip, and re-runs `/autopilot` with the same scope (the queue-pick walk is deterministic — already-shipped tasks are skipped because their `**Status:** ✅` line is set).

## Why the sandbox pre-flight check exists

`/auto-implement` and `/autopilot` both have destructive blast radius — they edit source code, run gates, and commit. LBD-15 requires `design_branch` inside the sandbox and no push/pull/fetch/merge from inside the container. The pre-flight check catches accidental host-vs-sandbox confusion before any changes land.
