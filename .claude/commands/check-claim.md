---
model: claude-sonnet-4-6
thinking:
  type: adaptive
effort: medium
# Per-role effort assignment: see .claude/commands/_common/effort_table.md
---

# /check-claim

The user wants the **architect** subagent to evaluate an external claim against cs-300's load-bearing decisions and threat model: $ARGUMENTS

`$ARGUMENTS` may be:

- A URL to fetch (blog post, GitHub issue, paper, security advisory).
- A quoted claim with no URL.
- A URL + a short summary of what the user wants confirmed (e.g. `https://… "do we need to add CSP headers?"`).

This is the operator-side path to the architect's **Trigger B (external-claim verification)**. The architect uses `WebFetch` / `WebSearch` to read the source, then maps it against cs-300's threat model and load-bearing decisions.

(This is `Task`-based subagent dispatch, not slash-command chaining.)

---

## When to use

- A blog post / framework recommendation / security advisory suggests a pattern; you want to know if it fits cs-300.
- An external best-practice claim is loose ("you should always X"); you want a grounded ADOPT / ADAPT / DECLINE.
- A GitHub issue against a dependency suggests a workaround; you want to know if cs-300 should adopt it.

## When NOT to use

- The claim is internal (a finding from your own `auditor` / `sr-dev` / `sr-sdet`) — that's Trigger A (new-decision proposal); the orchestrator routes to architect from `/auto-implement` automatically. Don't double-route.
- The claim is just curiosity / news — architect's budget shouldn't be spent on non-actionable reading.
- The claim obviously conflicts with an LBD-1..15 you've already settled — surface that yourself; don't burn architect cycles re-confirming the lock.

---

## Procedure

### Step 1 — Resolve the input

Parse `$ARGUMENTS`:

- If it starts with `http://` or `https://`, treat the leading token as a URL.
- If quoted text follows the URL (or stands alone), treat it as the claim summary / focus.
- If only quoted text is provided, treat as the claim body with no URL.

Create `runs/check-claim/<timestamp>/` (timestamp from `date -u +%Y-%m-%dT%H-%M-%SZ`). Record the input verbatim as `runs/check-claim/<timestamp>/input.txt`. This is the durable record of what the user asked.

### Step 2 — Spawn architect

Spawn the `architect` agent via `Task` with:

- **Trigger:** `external-claim`.
- **Source:** the URL (if provided) — architect uses `WebFetch` to read it.
- **Claim summary:** the user's text (if provided) so architect focuses on the right aspect.
- **Output target:** `runs/check-claim/<timestamp>/report.md` (standalone — **not** stitched into a task issue file). The spawn prompt explicitly overrides architect.md's default "append to the issue file" output rule for this trigger.
- **Project context brief** with:
  - cs-300 threat model (single-user, local-machine, GH Pages static deploy; primary attack surfaces from `CLAUDE.md` §Threat model).
  - Load-bearing decisions LBD-1..15 (compact pointer to `CLAUDE.md` §Load-bearing decisions).
  - Layer rule: `chapters/` + `cs300/workflows/` → `scripts/` → `src/` → `dist/`; `aiw-mcp` is a sibling local process.
  - `design_docs/nice_to_have.md` boundary (deferred items do **not** auto-promote on an external-claim review).
  - `design_docs/architecture.md` for deployment shape.
- **Sandbox marker** (per `_common/spawn_prompt_template.md`): include `Sandbox: <YES | NO>` derived from `[ -f /.dockerenv ]`.

Output budget directive (verbatim):

```
Output budget: 1-2K tokens. Durable findings live in the report file you write;
the return is the 3-line schema only — see .claude/commands/_common/agent_return_schema.md
```

### Step 3 — Read architect's report

After the `Task` spawn, parse the agent's return per [`_common/agent_return_schema.md`](_common/agent_return_schema.md). Verdict tokens: `ALIGNED / MISALIGNED / OPEN / PROPOSE-NEW-DECISION`.

Read `runs/check-claim/<timestamp>/report.md`. The standalone report contains:

- Source URL + key quotes (when a URL was provided).
- Internal severity: `ADOPT` / `ADAPT` / `DECLINE` (architect's Trigger B grade).
- One-paragraph reasoning citing the relevant LBD or threat-model item.
- Recommendation, mapped via the verdict table below.

### Step 4 — Surface

Surface the report path + the 3-line verdict + the architect's one-line recommendation. **Do not auto-create a task** to act on the recommendation — that decision is the user's after reading. If the verdict is `PROPOSE-NEW-DECISION`, hand off to the user for ADR drafting (architect's draft is in the report); do **not** spawn `/auto-implement` or anything else.

---

## Verdict-vocabulary mapping (3-line return ↔ internal severity)

| 3-line return verdict | Internal severity (in report) | Meaning |
| --- | --- | --- |
| `ALIGNED` | `ADOPT` | Pattern fits cs-300's threat model + LBDs. Recommend incorporating into a future task. |
| `OPEN` | `ADAPT` | Pattern's spirit applies but adaptation needs user arbitration (two reasonable shapes, or SEMVER consequences differ). |
| `MISALIGNED` | `DECLINE` | Pattern conflicts with a locked decision. Cite the violated LBD or threat-model item. |
| `PROPOSE-NEW-DECISION` | n/a | The external pattern reveals a class of failure cs-300 hasn't locked against; architect drafts a candidate LBD + ADR. User decides whether to accept. |

`PROPOSE-NEW-DECISION` is unusual for an external-claim trigger but possible. Treat as user-decision territory — it does **not** trigger the `/auto-implement` decision-isolation commit ceremony (that is reserved for new decisions surfaced from inside an autonomy loop).

---

## Halt boundaries

This command does not commit, push, merge, tag, or release. It is a single-spawn report command, like `/audit`.

If architect's report itself implies a destructive action (e.g. "remove this dep", "rewrite this layer"), surface the recommendation; do not act. The user invokes `/clean-implement` or `/auto-implement` against a real task spec for any landing work.

---

## Return

```text
verdict: <ALIGNED / MISALIGNED / OPEN / PROPOSE-NEW-DECISION>
file: runs/check-claim/<timestamp>/report.md
section: ## Architect review (YYYY-MM-DD)
```

When architect returns, surface the verdict + report path + one-line recommendation and stop. Single-spawn — do not invoke any other agent.

---

## Why this is a separate command

External-claim review needs different inputs (a URL, not a task spec), produces a different artifact (standalone report, not a task issue file), and shouldn't trigger the autonomy-mode commit ceremony. Bolting it onto `/auto-implement` would muddy the autonomy contract. Bolting it onto `/audit` would imply a task scope that doesn't apply.

Architect's Trigger B is load-bearing for cs-300's stance against unprincipled best-practice adoption (`design_docs/nice_to_have.md` discipline, LBD-5 anti-sandboxing, etc.). Without `/check-claim`, the trigger is documented but unreachable.
