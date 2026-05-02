# Workflow architecture review — cs-300 `.claude/` restoration

**Verdict:** MISALIGNED
**Reviewed on:** 2026-05-02
**Reviewer:** architect agent
**Scope:** `.claude/agents/` (9 agents + 3 _common), `.claude/commands/` (7 slash commands + 8 _common primitives), `.claude/skills/` (6 SKILL.md), `CLAUDE.md`, `agent_docs/long_running_pattern.md`

---

## Summary

The restored workflow is structurally sound: each agent has a distinct role, the 3-line return schema is enforced consistently across orchestrators, and the seven LBD-1..15 anchors propagate into the project-context brief that every spawn carries. The Builder→Auditor loop, the unified terminal gate (sr-dev + sr-sdet + security-reviewer in parallel), and the conditional dependency-auditor / architect spawns map cleanly onto cs-300's threat model and verification discipline. **However, two material misalignments break the contract for cs-300 specifically:** (1) `/clean-implement` has no LBD-15 sandbox/branch/working-tree pre-flight or commit ceremony — yet `CLAUDE.md` § Autonomous-mode boundary names it as a workflow that runs Builder → Auditor → security gate to a clean state. The user could land commits to `main` inside the sandbox via `/clean-implement` because nothing in the command stops them. (2) The architect agent declares two triggers (`new-decision` + `external-claim`) but only `new-decision` is wired into any orchestrator. `external-claim` is documented but unreachable through the workflow. The mechanical-sweep MEDIUMs (broken-link inline verdicts on three agents; oversize `project-development` description) are real and should be fixed in the same touch-up pass.

---

## Findings by severity

### 🔴 HIGH

#### H1 — `/clean-implement` lacks LBD-15 enforcement (Q3)

**File:** `.claude/commands/clean-implement.md`

`/clean-implement` is documented in `CLAUDE.md` as the **default cs-300 implementation command** ("Builder → Auditor loop with security gate, up to 10 cycles. **The default cs-300 implementation command.**"). It has no sandbox check, no branch check, no working-tree check, no commit ceremony, and no reference to `scripts/sandbox-guard.sh`. Compare:

- `/auto-implement.md` lines 169–177 (`## Pre-flight`): explicit `/.dockerenv` probe, `git rev-parse --abbrev-ref HEAD` HARD HALT outside `design_branch`, `git status --short` HARD HALT on dirty tree.
- `/autopilot.md` lines 58–68: identical pre-flight inlined.
- `/clean-implement.md`: zero such checks.

The skill `project-development/SKILL.md` and `CLAUDE.md` § Workflow routing both name `/clean-implement` as the **interactive default**. If the user runs `/clean-implement m4 t9` from the sandbox while accidentally on `main`, nothing in the workflow halts them. The orchestrator does not run `git commit` itself in `/clean-implement` (the user owns the commit), but the user can absolutely follow the recipe and commit-then-`git push origin main`, which fires the GH Pages deploy — exactly what LBD-15 exists to prevent.

**Action / Recommendation.** Add a `## Pre-flight` section to `/clean-implement.md` mirroring `/auto-implement.md` lines 169–177, but **without** the dirty-tree HARD HALT (interactive use can legitimately start mid-edit). At minimum: sandbox probe + branch HARD HALT outside `design_branch` (sandbox) or the user-authorised branch (host). The branch-policy enforcement is non-negotiable per LBD-15 regardless of who owns the commit.

#### H2 — Architect's `external-claim` trigger is unreachable through the workflow (Q1, Q2)

**Files:** `.claude/agents/architect.md` (lines 51–62), `.claude/commands/auto-implement.md` (line 351), `.claude/commands/clean-implement.md`, `.claude/commands/autopilot.md`

`architect.md` documents two triggers as load-bearing — Trigger A (`new-decision`) and Trigger B (`external-claim` — fetch a blog post/issue/paper, ADOPT/ADAPT/DECLINE against the threat model). The agent description (line 3) explicitly names both: *"...used at mid-loop decision points where a reviewer's finding implies a new load-bearing decision, **or when an external best-practice claim has surfaced**..."*.

But the only orchestrator-level invocation of architect is `/auto-implement.md` Step G5 (line 351), and it hardcodes `trigger=new-decision`. No command surfaces an `external-claim` invocation; there is no slash command to run it ad-hoc. The description in `auto-implement.md` line 498 mentions both kinds but the procedure only fires one.

This is a real architectural gap, not just docs: the architect's web-research capability (WebSearch/WebFetch tools — see frontmatter line 4) exists for `external-claim` work; without an orchestrator path it sits unused. Worse, the `effort_table.md` allocates Opus 4.7 to architect partly because of this branch.

**Action / Recommendation.** Two reasonable options — present to the user before picking:

1. **Add an ad-hoc `/check-claim` slash command** that spawns `architect` with `trigger=external-claim` and a user-supplied URL. Lowest-coupling fix; preserves the agent's full surface.
2. **Delete the `external-claim` branch from `architect.md`** and remove WebSearch/WebFetch from its tool list. Simpler agent, but loses cs-300's only structured way to evaluate external best-practice claims against the LBDs.

Option 1 is the better fit for a workflow that takes architectural decisions seriously — the trigger exists because external pressure to adopt a pattern is a real failure mode. But it's not load-bearing for any milestone in flight; option 2 is defensible if external-claim review never actually happens.

### 🟡 MEDIUM

#### M1 — Three agents inline verdict tokens but don't link the schema (mechanical sweep already flagged; confirmed)

**Files:** `.claude/agents/auditor.md` line 193, `.claude/agents/builder.md` line 118, `.claude/agents/dependency-auditor.md` line 149

`agent_return_schema.md` is documented as the *single source of truth* for verdict tokens (its docstring), and 6 of 9 agents link it explicitly in their return blocks (architect, task-analyzer, sr-dev, sr-sdet, security-reviewer, roadmap-selector). Auditor, Builder, and dependency-auditor still inline verdict tokens without the `[agent_return_schema.md]` link.

If a verdict-token vocabulary is updated in `agent_return_schema.md` (e.g. adding a new `OPEN-WITH-CARRYOVER` token), three agent prompts could drift silently. The orchestrator's parser convention (auto-implement.md lines 22–29) reads tokens from `agent_return_schema.md`'s table — if the per-agent prompt diverges, agent-emitted verdicts may parse as non-conformant and HARD HALT.

**Action / Recommendation.** In each of the three agents, replace the inline verdict block with the same `Three lines, exactly. No prose summary, no preamble, no chat body before or after — see [agent_return_schema.md](...)` paragraph the other six already use. Mechanical Edit; ~3 minutes.

#### M2 — `/clean-implement` has no commit ceremony or LBD-decision-isolation rule (Q4)

**File:** `.claude/commands/clean-implement.md`

`auto-implement.md` Step C1 ("Decision-record isolation, conditional") implements Rule 2 of `non_negotiables.md` — when architect returns `PROPOSE-NEW-DECISION`, the architecture-doc + ADR commit lands separately from the task-code commit. `clean-implement.md` does not run architect (terminal gate is security-reviewer + dependency-auditor only — line 229) and has no commit ceremony, so the rule is effectively silent.

**Question to think about:** is decision-isolation enforceable at all in `/clean-implement`? Architect doesn't fire, so the trigger is missing. But the broader concern remains: a `/clean-implement` run could surface a finding that *should* prompt a new LBD, and the workflow has no path to catch it. The user might just paper-over the finding with a code change.

**Action / Recommendation.** Either (a) document explicitly that `/clean-implement` is for tasks where new-LBD discovery is not expected and the user owns the call to escalate to `/auto-implement` if a finding looks load-bearing, or (b) add a conditional architect spawn to `/clean-implement`'s security gate when a finding's recommendation reads "this should be a new load-bearing decision." Option (a) preserves the interactive-vs-autonomous split; option (b) makes `/clean-implement` more comprehensive at the cost of one more spawn point. Option (a) is the simpler and likely-correct call given cs-300's milestone cadence.

#### M3 — `project-development/SKILL.md` description is 452 chars (mechanical sweep already flagged; confirmed)

**File:** `.claude/skills/project-development/SKILL.md` line 3

Skill description is 452 characters. `_common/skills_pattern.md` line 31 mandates ≤ 200 chars trigger-led. The skill triggers correctly per Anthropic's progressive-disclosure rule; the over-long description risks truncation in description matching and is the only Skill of six that exceeds the cap (next-largest is dep-audit at 196 chars, still under).

**Action / Recommendation.** Compress to ~150 chars. Suggestion: *"Use when planning, implementing, auditing, or queueing cs-300 tasks via the .claude/ workflow (`/clean-tasks`, `/queue-pick`, `/clean-implement`, `/auto-implement`, `/audit`, `/autopilot`, `/implement`)."* That's 191 chars and preserves the trigger surface.

#### M4 — Status-surface 4-way (LBD-10) is enforced by Builder + Auditor only; no cross-check at terminal gate (Q5)

**Files:** `.claude/agents/builder.md` line 87 (writes the flips), `.claude/agents/auditor.md` line 116 (verifies the flips), `.claude/commands/_common/cycle_summary_template.md` lines 67–71 (queues them)

Builder owns the writes; Auditor owns the verification. Sr-dev / sr-sdet / security-reviewer don't re-check, and the pre-commit ceremony (`integrity_checks.md`) doesn't validate that the four surfaces actually flipped — it checks for non-empty diff, non-empty smoke diff, and gate re-run.

This is *consistent* with the documented contract — "Auditor verifies all four; silent drift across them is HIGH per surface" (CLAUDE.md). But the 4-way check landed in cs-300 specifically because **M2 + M3 deep-analyses caught silent drift** — i.e., the project's history says even the Auditor missed flips that didn't land. A cross-check at integrity-check time (a fourth check: "if the spec's `**Status:**` flipped to `✅`, verify the milestone's tasks/README + task-table + Done-when checkboxes also changed in this diff") would be cheap and catch loop-internal drift.

**Action / Recommendation.** Two reasonable options:

1. **Trust the Auditor; do nothing.** The 4-way check is in CLAUDE.md and the auditor's prompt; if the Auditor misses it, that's a bug in Opus reasoning, not a workflow gap.
2. **Add a Check 4 to `integrity_checks.md`** that fires when the spec's `**Status:**` flipped to `✅` in this task's diff: grep that the milestone tasks/README row changed and the task-table row changed. Cost: ~20 lines in `integrity_checks.md`, runs only on closing tasks.

Option 1 is fine; option 2 is the defense-in-depth call. cs-300's history (M2, M3 caught drift) argues for option 2 if it can be done cheaply.

### 🟢 LOW

#### L1 — `non_negotiables.md` "Approved subagent team" lists 9 agents; CLAUDE.md and `agent_return_schema.md` agree

Cross-reference passed. Note for future maintenance: when a 10th agent is added, three places need updating (`non_negotiables.md` table line 23, `agent_return_schema.md` table, CLAUDE.md § Subagents available).

#### L2 — Long-running pattern (Q7) is correctly wired

Trigger fires on `**Long-running:** yes` OR `N >= 3`. `/auto-implement.md` lines 230–249 and `/clean-implement.md` lines 171–180 both implement the trigger. `cycle_summary_template.md` lines 130–133 documents the interaction with the per-cycle summary correctly. Auditor's Phase 5 (auditor.md line 172) writes `progress.md` only when the pattern is active. Builder reads but doesn't write either file (per agent_docs/long_running_pattern.md). All consistent.

One minor note: `agent_docs/long_running_pattern.md` line 56 uses `<task-shorthand>` without specifying the zero-padded form (`m04_t01`), while `cycle_summary_template.md` line 33 enforces zero-padding. The two would clash on a task with a non-padded path. Suggest: update long_running_pattern.md to cite the zero-padded format from cycle_summary_template.md.

#### L3 — Verification-discipline (LBD-11) coverage (Q6) is solid

`verification_discipline.md` enforces named-smoke-per-code-task. The Auditor's Phase 2 (auditor.md line 88) re-runs gates and grades the spec for missing smokes as HIGH. `integrity_checks.md` Check 3 re-runs the named smoke before commit. `gate_parse_patterns.md` enforces fail-closed on each gate's footer. sr-sdet's Lens 5 (sr-sdet.md line 50) names every cs-300 smoke surface explicitly. No gap visible.

#### L4 — Decision-isolation rule (Q4) is consistent across `auto-implement.md` Step C1 and `non_negotiables.md` Rule 2

Both reference each other in spirit: Step C1 implements Rule 2's "Keep the decision change separate from unrelated implementation changes." auto-implement.md line 162 names the rule as load-bearing under "Hard halt boundaries"; the architect agent's prompt (architect.md line 29) restates it for the agent's perspective. autopilot.md line 50 inherits the rule. clean-implement.md is silent (covered under M2 above).

---

## Per-question summary

| Question | Status |
| --- | --- |
| Q1 — Agent role boundaries | Mostly clear. sr-dev / sr-sdet / auditor have explicit "don't duplicate" clauses. **Gap:** architect's `external-claim` trigger is unwired (H2). |
| Q2 — Trigger conditions | Consistent for `new-decision`, dep-audit, parallel terminal gate, task-analyzer. **Gap:** `external-claim` (H2). |
| Q3 — LBD-15 sandbox/host | `/auto-implement` and `/autopilot` enforce it; `/clean-implement` does not (H1). |
| Q4 — Decision-isolation | Consistent in auto-implement / autopilot / non_negotiables / architect. Silent in `/clean-implement` (M2). |
| Q5 — Status-surface 4-way | Builder writes, Auditor verifies. No defense-in-depth at integrity-check time (M4 — borderline). |
| Q6 — Verification-discipline | Solid (L3). |
| Q7 — Long-running pattern | Wired correctly. Minor zero-padding consistency note (L2). |

---

## Required decisions

The following must land before — not inside — the H1/H2 fixes:

1. **H2 option call.** Does cs-300 need an ad-hoc external-claim review path (option 1, add `/check-claim`), or does the workflow drop the architect's external-claim branch (option 2)? Architect's WebSearch/WebFetch tool grant only makes sense if the user can actually invoke that branch; otherwise it's dead surface.

2. **M4 option call.** Add Check 4 to integrity_checks.md (cheap defense-in-depth backed by M2/M3 history), or trust the Auditor's existing 4-way check (CLAUDE.md / LBD-10 are already explicit)?

These are not architecture decisions in the LBD sense — they don't introduce or supersede a load-bearing rule. They're workflow-shape decisions the user owns.

---

## Recommended next steps

1. **Fix H1 first.** Add a `## Pre-flight` section to `/clean-implement.md` matching `/auto-implement.md` lines 169–177 (sandbox probe + branch HARD HALT). Drop the dirty-tree HARD HALT for interactive use — the user often invokes `/clean-implement` mid-edit.
2. **Fix M1 in the same touch-up.** Add `agent_return_schema.md` link to auditor / builder / dependency-auditor return blocks. Mechanical Edit, ~3 minutes.
3. **Fix M3 in the same touch-up.** Compress `project-development/SKILL.md` description to ≤ 200 chars.
4. **Surface H2 + M4 to the user for arbitration.** Present the two options for each; let the user pick before any further edit.
5. **L2 cosmetic.** Update `agent_docs/long_running_pattern.md` line 56 to cite the zero-padded `m04_t01` form per `cycle_summary_template.md` line 33.

No new ADR required. None of the findings imply a new load-bearing decision; they're all workflow hygiene against existing LBDs (LBD-10, LBD-11, LBD-15) and existing rules (Rule 2 of non_negotiables.md).

---

## Verdict

**MISALIGNED** — the workflow architecture is fundamentally correct (single-source-of-truth schema, fragment-file parallelism, decision-isolation, verification-discipline) but two material gaps (H1 + H2) leak through. None require an ADR; all are touch-up work. The mechanical-sweep MEDIUMs (M1, M3) are real and should be bundled with H1's fix.
