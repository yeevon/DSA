# Skill-extraction pattern

This file documents the Skill-extraction pattern — the process of promoting a reusable
agent capability into a standalone `.claude/skills/<name>/` Skill. The pattern follows
Anthropic's Agent Skills progressive-disclosure model: ~100 tokens of metadata at session
start; full SKILL.md loads on trigger; helper files load only when referenced.

---

## When to extract

Extract an agent capability into a Skill when it satisfies all three criteria:

1. The capability is reusable across contexts — it can fire in main context, not only
   during a spawned agent run.
2. The trigger can be described in 200 characters or fewer, trigger-led ("Use when…",
   "Run when…").
3. The full procedure benefits from progressive disclosure — a short metadata block at
   session start plus a helper file that loads only when the procedure fires.

Capabilities that are tightly agent-specific (severity grading, threat-model framing,
final-verdict authority) stay in the agent prompt. Operational shortcuts with a clear
run-this-command recipe are the best extraction candidates.

---

## The 4-rule Skill structure

Every Skill under `.claude/skills/` must satisfy:

- **Frontmatter.** `name:` (kebab-case, matches directory name) and `description:`
  (≤ 200 chars, trigger-led so routing is unambiguous — e.g. "Run when package.json or
  package-lock.json change").
- **Body ≤ 5K tokens.** SKILL.md covers: when to use, when NOT to use, the step-by-step
  procedure, and references to helper files. Helper files (e.g. `runbook.md`) live
  alongside SKILL.md and load only when the Skill body references them.
- **Helper-file references, not inline copies.** Per progressive-disclosure discipline,
  if an inline code block exceeds 20 lines, move it to a helper file.
- **No silent agent-prompt duplication.** When a Skill is extracted from an agent prompt,
  the agent prompt replaces the inlined capability with a one-line pointer to the Skill
  (`## Operational shortcuts` section).

---

## How to validate

The operator-side validation for a new Skill:

1. Confirm `SKILL.md` frontmatter has `name:` + `description:` ≤ 200 chars.
2. Proxy-check body size: `wc -w SKILL.md` × 1.3 ≤ 5000 tokens.
3. Confirm the source agent prompt contains an `## Operational shortcuts` section
   pointing to the Skill (when extracted from an existing agent).
4. The omit-the-Skill regression test (verify Claude underperforms without the Skill
   loaded) is a useful manual one-shot but is not Auditor-gated.

For a periodic audit of all Skills + slash commands, see
`.claude/commands/audit-skills.md`.

---

## Live Skills (cs-300)

- `project-development` — cs-300 task analysis / implementation / audit / security gate
  workflow.
- `check` — pre-flight gate runner before commit.
- `dep-audit` — supply-chain audit on dep-manifest changes.
- `ship` — pre-publish checklist (advisory; cs-300's "publish" is the GH Pages deploy).
- `sweep` — periodic backlog sweep.
- `triage` — incoming-issue triage.

When a new Skill is added or an existing one is materially changed, run
`/audit-skills` to re-validate the four-rule structure across the directory.
