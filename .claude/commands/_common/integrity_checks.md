# Task-integrity checks (single source of truth)

**Canonical reference for:** `.claude/commands/auto-implement.md` §Pre-commit ceremony.
**Depends on:** `.claude/commands/_common/gate_parse_patterns.md` (per-gate footer-line
regexes).

Three pre-commit safeguards the orchestrator runs **after all reviewers SHIP** and
**before** stamping AUTO-CLEAN. Each check has a distinct failure-mode signature so the
halt message names the specific check that fired.

---

## Check 1 — Non-empty diff

**Command:**

```
git diff --stat <pre-task-commit>..HEAD
```

**Pass condition:** output is non-empty (at least one insertion OR deletion line).

**Failure-mode signature:** output is an empty string (or whitespace only).

**Halt message:**

```
🚧 BLOCKED: task-integrity check 1 (empty diff) failed; see runs/<task>/integrity.txt
```

**Why this check exists:** A Builder + Auditor cycle can converge on "done" with no
meaningful change (e.g. comment-only edits that survive type-check, or a prior-cycle
change that was later reverted). An empty diff after a claimed AUTO-CLEAN is a strong
signal of a loop-behaviour bug and requires user review before the commit lands.

---

## Check 2 — Non-empty test diff (code tasks only)

**Command:**

```
git diff --stat <pre-task-commit>..HEAD -- scripts/
```

(cs-300 keeps verification harnesses under `scripts/*-smoke.mjs` and
`scripts/functional-tests.py`; there is no project-wide `tests/` tree as of M4.)

**Task-kind determination (cs-300 specs do NOT carry a `**Kind:**` field — use the
diff itself):** classify the task from `git diff --name-only <pre-task-commit>..HEAD`:

- **Content task** (LBD-11): the diff is restricted to chapter `.tex`/`.pdf` files
  under `chapters/`, `design_docs/**`, `*.md`, `*.txt`, or `CHANGELOG.md`. `pdflatex`
  + render check are sufficient. **Check 2 is bypassed.**
- **Code task** (LBD-11): the diff touches anything under `src/`, `scripts/`,
  `cs300/workflows/`, `notes-style.tex`, `astro.config.mjs`, `tsconfig.json`,
  `package.json`, or any other executable surface. The spec must name an explicit
  smoke test. **Check 2 applies.**
- **Mixed task:** if both content-only and code paths appear in the diff, treat as a
  code task (the more rigorous bar wins).

**Pass condition:** for a code task, `git diff --stat ... -- scripts/` is non-empty (a
new or updated smoke harness landed, OR an existing one was extended).

**Bypass condition:** task is a content-only task → skip Check 2 entirely; it does not
apply and cannot block.

**Bypass exception:** if the task spec explicitly states "no test-surface change" with a
documented reason (e.g. "drive-by typo fix in inline comment"), the orchestrator surfaces
the bypass and asks the user to confirm before continuing. This exception requires
explicit user approval — never auto-bypass.

**Halt message:**

```
🚧 BLOCKED: task-integrity check 2 (empty smoke-script diff for code task) failed;
see runs/<task>/integrity.txt
```

**Why this check exists:** A Builder can satisfy Check 1 by editing a comment or
docstring in production code. Check 2 ensures that code tasks also have verifiable test
coverage — specifically that something changed in `scripts/`. It does not check
*adequacy* of tests (that is the Auditor's + sr-sdet's job); it checks *presence*.

---

## Check 3 — Independent gate re-run (named smoke)

**Command:** the smoke command named in the task spec's `## Verification plan` section
(LBD-11). Examples:

- `npm run check`
- `node scripts/db-smoke.mjs`
- `node scripts/annotations-smoke.mjs`
- `node scripts/read-status-smoke.mjs`
- `node scripts/seed-smoke.mjs`
- `python scripts/functional-tests.py`
- `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex`
- `node scripts/build-content.mjs`
- `npm run build`

**Pass condition:** exit code 0 **and** the smoke's output matches the per-tool footer
pattern in `.claude/commands/_common/gate_parse_patterns.md`.

**Failure-mode signature:** exit code ≠ 0, OR footer line missing, OR footer line
contains a failure marker per the per-tool pattern.

**Halt message:**

```
🚧 BLOCKED: task-integrity check 3 (<smoke command> failure) failed; see
runs/<task>/integrity.txt
```

**Why this check exists:** The Auditor's gate run is not the last word. A regression can
be introduced between the Auditor's run and the commit ceremony (e.g. a status-surface
edit touching a tracked file with hidden side effects). Running the smoke independently
and immediately before AUTO-CLEAN stamp closes that window.

---

## Captured output location

Capture the stdout + stderr + exit code of all three checks into:

```
runs/<task-shorthand>/integrity.txt
```

Format (append each check's output):

```
=== Check 1: git diff --stat <pre-task-commit>..HEAD ===
<stdout, may be empty>
EXIT_CODE=<integer>

=== Check 2: git diff --stat <pre-task-commit>..HEAD -- scripts/ ===
TASK_KIND=<value from spec or README>
CODE_TASK=<true|false>
<stdout, may be empty>
EXIT_CODE=<integer>

=== Check 3: <named smoke command> ===
<stdout + stderr>
EXIT_CODE=<integer>
```

This file is the durable debug record for any integrity-check failure surfaced to the user.

---

## When to run

After all reviewers return SHIP (sr-dev, sr-sdet, security-reviewer, plus
dependency-auditor when manifests changed) and the gate-capture-and-parse section is
clean, and **before** the commit ceremony. If any check fails, do NOT proceed to the
commit; halt with the named BLOCKED message.

The gate-capture-and-parse convention and the task-integrity checks are complementary,
not redundant:

- Gate-capture-and-parse: verifies each gate tool's *own output* is trustworthy (fail
  closed on empty or unparseable stdout — guards against the Builder claiming "gates
  pass" with no actual output).
- Task-integrity: verifies the *task's output* is meaningful (non-empty diff, smoke-script
  coverage present, named smoke still green at commit time).

---

## Sandbox-vs-host adaptation (LBD-15)

When the orchestrator runs inside the Docker sandbox (`/.dockerenv` exists), Check 3 may
be blocked because `node_modules` is root-owned and `npm`-based smokes cannot run. In
that case:

1. Mark Check 3 as `NOT RUN — host-only (sandbox node_modules permission)` in
   `integrity.txt`.
2. Surface the unrun smoke as a host-only carry-over in the commit message and the issue
   file's `## Carry-over from prior audits` section of the next task.
3. Never auto-bypass Check 3 silently — the user must see that a smoke was deferred.

Content-task smokes (`pdflatex`, `node scripts/build-content.mjs`) are not blocked by
the sandbox; run them normally.

---

## Relationship to other checks

| Check | Layer | What it catches |
|---|---|---|
| Agent return-schema parser | Orchestrator-side return validation | Malformed agent verdict lines |
| Gate-capture-and-parse | Gate-tool output validation | Builder claims "gates pass" with empty / failure output |
| Integrity Check 1 (non-empty diff) | Task-output validation | Loop converged with no meaningful change |
| Integrity Check 2 (non-empty smoke diff) | Task-output validation | Code task shipped with no smoke coverage change |
| Integrity Check 3 (independent smoke re-run) | Late regression catch | Regression introduced between Auditor run and commit |
