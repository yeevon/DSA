# Sr. SDET Review — Workflow Testability Sweep

**Verdict:** FIX-THEN-SHIP
**Reviewed:** 2026-05-02
**Scope:** `.claude/commands/auto-implement.md`, `.claude/commands/clean-implement.md`,
`.claude/commands/_common/integrity_checks.md`, `.claude/commands/_common/gate_parse_patterns.md`,
`.claude/commands/_common/auditor_context_management.md`, `.claude/commands/_common/cycle_summary_template.md`,
`.claude/agents/auditor.md` (Phase 4), `.claude/agents/security-reviewer.md`,
`scripts/*-smoke.mjs` (footer lines verified by direct read)

---

## Summary

The workflow's structural skeleton is coherent: stop-condition detection, integrity
checks, and gate-capture plumbing are all mechanically well-formed. The critical flaw
is that the footer-line regexes in `gate_parse_patterns.md` do not match the actual
output lines the four smoke scripts produce. If the fail-closed parser is taken
seriously (and it must be — that is the stated safety property), every smoke gate will
halt with BLOCKED on the first run. No task touching a state-service or annotation
handler can AUTO-CLEAN today without manual regex bypasses. All other questions are
Advisory or have minor gaps, not show-stoppers. The smoke-footer mismatch is the single
FIX item.

---

## Findings by Severity

### BLOCK — none

### FIX — F1: Smoke-script footer regexes do not match actual output

**File:** `.claude/commands/_common/gate_parse_patterns.md` — gate table rows for
`smoke-db`, `smoke-annotations`, `smoke-read-status`, `smoke-seed`

**Evidence (from direct read of scripts):**

| Script | Actual final console.log line | Regex in gate_parse_patterns.md |
|---|---|---|
| `scripts/db-smoke.mjs` | `[db-smoke] all 3 indexes present ✓` | `^db-smoke: (all tests pass\|OK)` |
| `scripts/annotations-smoke.mjs` | `[annotations-smoke] all 4 steps passed ✓` | `^annotations-smoke: (all tests pass\|OK)` |
| `scripts/read-status-smoke.mjs` | `[read-status-smoke] all 4 steps passed ✓` | `^read-status-smoke: (all tests pass\|OK)` |
| `scripts/seed-smoke.mjs` | `[seed-smoke] all expectations met ✓` | `^seed-smoke: (all tests pass\|OK)` |

None of the four patterns match. The `gate_parse_patterns.md` file itself acknowledges
a fallback: "if the exact footer-line regex above does not match the current script
output, fall back to exit-code-only check and note the mismatch in the gate summary".
However, it also says "Update this table when a smoke script's footer stabilises." The
footer lines are stable (these scripts have been in use since M3). The table was never
updated to reflect the actual output.

**Impact:** Under the fail-closed rule ("footer line absent → BLOCKED"), all four smoke
gates will report BLOCKED rather than PASS on any task that touches state-service or
annotation surfaces, causing false BLOCKED halts in the autonomous loop. The fallback
to exit-code-only works but the mismatch is logged as a finding in every gate summary,
creating noise and eroding trust in the parse-pass signal.

**Recommended fix:**
Update the four rows in `gate_parse_patterns.md` to match actual output:

```
smoke-db        | ^[db-smoke] .*(present|passed|met) | Footer present, exit 0
smoke-annotations | ^\[annotations-smoke\] .* passed  | Footer present, exit 0
smoke-read-status | ^\[read-status-smoke\] .* passed  | Footer present, exit 0
smoke-seed        | ^\[seed-smoke\] .* met             | Footer present, exit 0
```

Or more precisely:

```
smoke-db          ^\\[db-smoke\\] all \\d+ indexes present
smoke-annotations ^\\[annotations-smoke\\] all \\d+ steps passed
smoke-read-status ^\\[read-status-smoke\\] all \\d+ steps passed
smoke-seed        ^\\[seed-smoke\\] all expectations met
```

Also verify the `build-content` pattern. The script emits:
`[build-content] done — N chapters processed (N MDX files generated)`.
The table pattern `^build-content: (done|OK|wrote \d+ files)` does NOT match that
line (prefix is `[build-content]` with brackets, and the line reads "done —" not
"done" followed by end of pattern boundary). Update to:
`^\[build-content\] done —`

---

### Advisory — A1 (Q1): Stop-condition BLOCKER detection is mechanically sound but
USER INPUT REQUIRED detection is partially inferential

**File:** `auto-implement.md` and `clean-implement.md` §Stop conditions

**Analysis:** BLOCKER (condition 1) is clearly mechanical: grep the issue file for
`🚧 BLOCKED` in the `**Status:**` line. FUNCTIONALLY CLEAN (condition 3) is mechanical:
grep for `✅ PASS` in the `**Status:**` line. CYCLE LIMIT (condition 4) is a counter.

USER INPUT REQUIRED (condition 2) is the only partially inferential one. The trigger
requires the orchestrator to judge whether the auditor "presented two or more options
without picking one." This is not a structured field in the issue file; the orchestrator
must parse free-prose recommendations. The four halt sub-conditions (multi-option,
decision-conflict, scope-expansion, deferral-to-nonexistent-task) are described in
prose, not as tagged issue-file tokens. A sufficiently terse Auditor can omit the
"stop and ask" phrase while still presenting multi-option text, causing the orchestrator
to miss the halt signal.

**Verdict:** Advisory, not a FIX. The condition is detectable with reasonable diligence;
a strict-parse sentinel like a `## USER-INPUT-REQUIRED` section header in the issue
file would make it mechanical, but this is a hardening improvement, not a current
failure mode.

---

### Advisory — A2 (Q2): Check 2 (non-empty test diff) is correctly cs-300-adapted;
no bypass exception requires user approval regardless of context

**File:** `integrity_checks.md` §Check 2

**Analysis:** Check 2 explicitly names `scripts/` as the cs-300 test root and
distinguishes content tasks (bypass allowed) from code tasks (check applies). This is
correct and cs-300-specific. The "bypass exception" for tasks with an explicit
"no test-surface change" note does require user confirmation — the file says "the
orchestrator surfaces the bypass and asks the user to confirm before continuing.
This exception requires explicit user approval — never auto-bypass." This is
appropriately strict.

**Minor gap:** the file says the task kind is determined from "the spec's `**Status:**`
block plus the milestone README's task-table row." The `**Status:**` line does not
carry kind metadata — it only carries `todo` / `✅ done <date>`. Kind is expressed
in some task specs as `**Kind:** code` or similar, but this is not a universal
convention. If a spec lacks a `**Kind:**` line, the orchestrator cannot parse task
kind from the status block. Recommending the orchestrator fall back to "check whether
`scripts/` was touched at all" is safer than relying on a field that may not exist.

**No blocking impact** — fallback to exit-code-only plus a manual determination works
in practice. Advisory only.

---

### Advisory — A3 (Q3): gate_parse_patterns.md patterns are project-specific and
non-placeholder for most gates; the smoke mismatch (F1 above) is the only blocker

**File:** `gate_parse_patterns.md`

**Analysis:** The `check`, `chapter`, `functional-tests`, and `build` gates have
reasonable patterns that correspond to actual tool output. The `chapter` gate correctly
parses `Output written on ... (\d+) pages` from pdflatex, which is accurate. The
`functional-tests` gate pattern `^(OK|Ran \d+ tests in)` matches Python unittest
output correctly.

The `build` gate pattern `^(dist\/|build complete|astro build)` is coarse but
functional — Astro's CLI does produce lines starting with `dist/` during the build
summary. The fallback to exit-code-only for any non-matching line is appropriate given
how noisy `npm run build` output is.

The mismatch is isolated to the four smoke scripts documented in F1 above.

---

### Advisory — A4 (Q4): Rotation trigger is "operator-judged" absent telemetry;
this is workable but degrades gracefully to no-rotation in automated sessions

**File:** `auditor_context_management.md`

**Analysis:** The file explicitly states "cs-300 does not currently have
orchestration-side telemetry" and that "the threshold is therefore operator-judged."
In `/auto-implement` (autonomous mode), the orchestrator is supposed to check
`runs/<task>/cycle_{N-1}/auditor.usage.json`. If that file is absent (which it will be
whenever telemetry wasn't written), the rotation check cannot fire.

Is "operator-judged" implementable? In `/auto-implement`, the orchestrator is a
Claude Code instance with no direct token-count introspection API. It can proxy the
estimate via the documented word-count heuristic (`len(re.findall(r"\S+", text)) * 1.3`)
applied to the cycle-summary + current-diff size. This is computable. The file says so
explicitly. The heuristic is coarse but acceptable — the cost of a missed rotation is
only a slightly over-budgeted Auditor spawn, not a correctness failure.

**Verdict:** Advisory. The rotation pattern degrades gracefully (no rotation = slightly
larger Auditor context, not a halt). The absence of `auditor.usage.json` means the
rotation fires on the heuristic proxy, which is documented and implementable. Not a
FIX item.

---

### Advisory — A5 (Q5): Cycle-summary template is precise enough for mechanical
verification with one identified gap

**File:** `cycle_summary_template.md`

**Analysis:** The template is tight: it names every required field with a specific
format, requires `Carry-over to next cycle:` to be non-empty when the verdict is OPEN
(Invariant 4), and specifies that the status-surface flip checklist must appear when
closing a task. An Auditor can produce a summary that "looks right" only if:

(a) it fills in all fields, and
(b) the gate-result table rows match a recognized set.

The **only gap** is the `**Files changed this cycle:**` field. The template requires
"a one-line description" per file, but does not require the list to be exhaustive or
cross-checked against the diff. An Auditor that lists three files changed while the
diff shows twelve would pass a surface-level template check. The integrity_checks.md
Check 1 catches "no diff at all", but not "partial file list in summary."

**Verdict:** Advisory. The template is sufficient for its primary purpose (carry-forward
context). The file-list exhaustiveness gap is a quality risk, not a structural failure
of the summary format.

---

### Advisory — A6 (Q6): LBD-10 status-surface check is named in auditor Phase 4
but lacks a mechanical search prescription

**File:** `auditor.md` Phase 4, line 116

**Analysis:** Phase 4 says: "All four surfaces must agree at audit close: per-task
spec `**Status:**`, milestone `tasks/README.md` row, milestone README task-table row,
milestone README `Done when` checkboxes." Each disagreeing surface is HIGH.

The check is named, the four surfaces are enumerated, and the severity is stated. What
is missing is a mechanical prescription: the Phase 4 text does not say "grep the
spec file for `**Status:**` line and verify it reads `✅ done`" or "read
`tasks/README.md` and find the row matching this task ID and verify the status cell."
An Auditor that trusts the Builder's claim that status was updated would pass this
check without actually reading the files.

The fix would be one sentence: "Verify by reading each file and citing the exact line
seen." In practice, the Auditor instruction "**Never trust the Builder's report as
ground truth. Re-verify every claim.**" provides partial coverage, but it is not
specific to the status-surface check.

**Verdict:** Advisory. The check is present and named; the Auditor is instructed to
re-verify everything. Adding a "cite the exact line" prescription would close the gap
mechanically but the current form is not incorrect, merely less specific than it
could be.

---

### Advisory — A7 (Q7): Reference-solution leakage (LBD-4) IS explicitly named as
primary attack surface #1 in security-reviewer.md

**File:** `security-reviewer.md` §What actually matters, item 1

**Analysis:** Item 1 of the "What actually matters" section is:

> "Reference-solution leakage (LBD-4). `questions.reference_json` contains the full
> solution for `code`-type questions. Architecture explicitly says the solution must
> never reach the DOM. For every API handler that returns question data: is
> `reference_json` in the response shape at all? If yes, is `solution` stripped?"

This is specific, named, cites the exact JSON field, and prescribes the check
("For every API handler..."). Not buried in generic secrets language. This is correct
and complete.

**Verdict:** No action required.

---

### Advisory — A8 (Q8): Parallel-Builder overlap detection does not exist in
auto-implement.md — the reviewed Q8 premise is a phantom

**File:** `auto-implement.md` (full read)

**Analysis:** There is no "§Parallel-Builder" section in `auto-implement.md`. The
command runs a single Builder per cycle. The parallel dispatch in the terminal gate
applies to sr-dev, sr-sdet, and security-reviewer — not to Builders. There is no
`git -C <worktree-path> diff --name-only HEAD` overlap detection anywhere in the
workflow files.

This is not a bug in the workflow. The reviewed question assumed a feature that was
not implemented. The question's premise is incorrect. No overlap detection is needed
or claimed; the workflow is sequential-Builder by design.

**Verdict:** No action required.

---

## Recommended Fixes

| Priority | File | Change |
|---|---|---|
| FIX (required) | `.claude/commands/_common/gate_parse_patterns.md` | Update 4 smoke-script footer-line regexes to match actual script output (see F1 above) |
| FIX (required) | `.claude/commands/_common/gate_parse_patterns.md` | Update `build-content` footer-line regex from `^build-content: (done\|OK\|wrote \d+ files)` to `^\[build-content\] done —` |
| Advisory | `.claude/agents/auditor.md` Phase 4 LBD-10 paragraph | Add "Verify by reading each file directly and citing the exact line seen" to the status-surface check instruction |
| Advisory | `.claude/commands/_common/integrity_checks.md` §Check 2 | Replace "parse the spec's `**Status:**` block" with "parse the spec's `**Kind:**` line; if absent, infer from whether the diff touches `src/`, `scripts/`, or `cs300/workflows/`" |
