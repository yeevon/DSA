# Gate-output parse patterns + result labels (single source of truth)

**Canonical reference for:** `.claude/commands/auto-implement.md` §Gate-capture-and-parse convention, `.claude/commands/clean-implement.md` §Gate-capture-and-parse convention, and any agent / report that summarises gate results using the standard labels.

This file has two concerns:

1. **Parsing infrastructure** — how the orchestrator captures gate stdout/stderr/exit code and decides PASS vs FAIL fail-closed before stamping AUTO-CLEAN.
2. **Result-label conventions** — the canonical labels (PASS / FAIL / NOT RUN / BLOCKED / SKIPPED) used in agent reports and cycle summaries.

---

## Per-gate footer-line regex

Each gate command produces a deterministic footer line on success. The orchestrator captures the full stdout + stderr of each gate to `runs/<task>/cycle_<N>/gate_<name>.txt` and scans that file for the footer line before stamping AUTO-CLEAN (or CLEAN in `/clean-implement`).

cs-300 gate table:

| Gate name | Command | Pass-line regex | Fail-line regex (any match → FAIL) | Pass condition |
|---|---|---|---|---|
| `check` | `npm run check` | `^Result \(\d+ files?\): \d+ errors?` (with the error count = 0) | `^Result \(\d+ files?\): [1-9]\d* errors?` | Exit code 0; pass-line shows `0 errors` |
| `smoke-db` | `node scripts/db-smoke.mjs` | `^\[db-smoke\] .*✓\s*$` | `^\[db-smoke\] FAIL` | Pass-line present, no fail-line, exit 0 |
| `smoke-annotations` | `node scripts/annotations-smoke.mjs` | `^\[annotations-smoke\] .*✓\s*$` | `^\[annotations-smoke\] FAIL` | Pass-line present, no fail-line, exit 0 |
| `smoke-read-status` | `node scripts/read-status-smoke.mjs` | `^\[read-status-smoke\] .*✓\s*$` | `^\[read-status-smoke\] FAIL` | Pass-line present, no fail-line, exit 0 |
| `smoke-seed` | `node scripts/seed-smoke.mjs` | `^\[seed-smoke\] .*✓\s*$` | `^\[seed-smoke\] FAIL` | Pass-line present, no fail-line, exit 0 |
| `functional-tests` | `python scripts/functional-tests.py` | `^OK$` or `^Ran \d+ tests in` | `^FAIL` or `\bFAILED\b` | Pass-line present, no fail-line, exit 0 |
| `build-content` | `node scripts/build-content.mjs` | `^\[build-content\] done — \d+ chapters? processed` | `^\[build-content\] FAILED:` | Pass-line present, no fail-line, exit 0 |
| `chapter` | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | `^Output written on .* \(\d+ pages?` | `^! ` (LaTeX error marker) | Pass-line present, exit 0; page count parsed and checked against 40-pp ceiling (LBD-6) |
| `build` | `npm run build` | `^\d+:\d+:\d+ \[build\] Complete!` (Astro build footer) | `\berror\b` in stderr block | Exit code 0; build footer line present |

### Notes

- Match is applied to each line of the captured file individually (not the full blob as a single string). Trim leading/trailing whitespace from each line before matching.
- The `[<name>] ✓` smoke pattern is the cs-300 convention: every smoke harness writes `[<name>] <description> ✓` on success and `[<name>] FAIL — <reason>` on failure. New smoke scripts must follow this convention to plug into the parser without a regex update.
- For the `npm run check` gate: Astro's `tsc --pretty` output ends with `Result (<N> files): <errors> errors, <warnings> warnings, <hints> hints`. Zero errors is a pass; any non-zero error count is a failure regardless of exit code.
- For smoke scripts: if the pass-line regex above does not match the current script output, the parser fails closed (BLOCKED, not PASS). Update this table when a smoke script's footer changes.
- For `pdflatex`: the page count in the footer is parsed and compared against 40 pages (LBD-6). A page count > 40 is a FAIL even if pdflatex exits 0 (unless the chapter is grandfathered: `ch_3` ≤ 53 pp, `ch_4` ≤ 51 pp).
- Exit code ≠ 0 overrides the pass-line — always halt on non-zero exit, regardless of footer text.

---

## Halt condition (fail-closed parsing)

The orchestrator **halts with**:

```
BLOCKED: gate <name> output not parseable; see runs/<task>/cycle_<N>/gate_<name>.txt
```

when **any** of the following are true:

1. The captured file is empty (zero bytes or whitespace only).
2. The footer line is absent — no line in the file matches the gate's footer regex.
3. The exit code captured alongside the output is non-zero (even if a footer line is present).
4. The footer line is present but indicates failures (e.g. `FAIL` in a functional-tests footer, or a non-zero error count in the check footer).

**The fail-closed default is the load-bearing safety property here.** Without it, a Builder that silently ate the gate's output (or a gate that crashed before printing anything) would let the orchestrator stamp AUTO-CLEAN on broken code.

---

## Capture format

Each captured file has the following structure (plain text, no special encoding):

```
EXIT_CODE=<integer>
STDOUT:
<full stdout of the gate command>
STDERR:
<full stderr of the gate command, may be empty>
```

The `EXIT_CODE=` line is always line 1 of the file. The `STDOUT:` and `STDERR:` labels are literal separator lines. The orchestrator reads line 1 to extract the exit code and scans lines 3 onward (or until the `STDERR:` separator) for the footer-line regex.

> **Shorthand capture** (acceptable alternative when the Bash tool captures stdout and stderr together in a single blob): store the combined output as-is, and record the exit code in a companion file `runs/<task>/cycle_<N>/gate_<name>.exit`. The parser then reads the exit companion file for the exit code and the main capture file for footer scanning.

---

## Extension hooks for task-specific smoke tests

Custom gates (e.g. a workflow CLI smoke test, a per-task scenario test) follow the same capture convention. Add a row to the table above when a new gate type is introduced:

When a task spec's `## Verification plan` section names a specific command, its footer-line regex is added here before the task closes. Tasks that reuse an existing gate do not need a new row — they inherit the parent gate's pattern.

---

## Result labels (for reports and cycle summaries)

Agents, cycle summaries, and end-of-run reports use these labels consistently when summarising gate output:

| Label | Meaning |
|---|---|
| `PASS` | Gate ran and passed (footer matched, exit code 0, no failure marker). |
| `FAIL` | Gate ran and failed (footer indicates failure, or non-zero exit, or footer-failure word). |
| `NOT RUN` | Gate did not run; reason required (e.g. doc-only task). |
| `BLOCKED` | Gate could not run because required setup / input is unavailable (e.g. Ollama not running). |
| `SKIPPED` | Gate was intentionally skipped by project rule or user instruction. |

---

## Required gate-summary shape

```md
| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | PASS / FAIL / NOT RUN / BLOCKED / SKIPPED | <short note> |
| smoke | `node scripts/<name>-smoke.mjs` | … | … |
| chapter | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | … | page count check |
| content build | `node scripts/build-content.mjs` | … | end-to-end pandoc + filter |
| build | `npm run build` | … | dist/ inspection |
```

The `Notes` column is optional in the cycle-summary template (which uses three columns) but required in the end-of-cycle audit/report surface, where it explains any non-PASS result.

---

## Failure note standard

Keep failure notes short and actionable.

Good:

- `FAIL — pdflatex error at chapters/ch_5/lectures.tex line 432`
- `FAIL — db-smoke: annotations.text column missing after schema migration`
- `BLOCKED — selenium WebDriver not available in this env`
- `NOT RUN — documentation-only task, no code surface`
- `SKIPPED — user explicitly skipped functional-tests.py for this cycle`

Bad:

- `bad`
- `broken`
- `probably fine`
- `not needed`
- `Builder said it passed`

---

## Exit behaviour

A failed required gate blocks completion. A skipped or not-run required gate requires an explicit reason and usually blocks completion unless the project rules say otherwise. The Auditor decides whether missing verification is acceptable for the task type.

The orchestrator does **not** trust a label alone — it always re-derives PASS/FAIL from the captured file via the parsing rules above. Agent-reported labels are a presentation surface, not a substitute for fail-closed parsing.

- **Content tasks** may rely on `pdflatex` + render-check (LBD-11 carve-out for content).
- **Code tasks** require a named smoke; "build passes" is not enough (LBD-11).

---

## Why parsing and labelling live in the same file

Without the parsing rules, the labels are aspirational — anyone can claim PASS. Without the labels, the parsing rules don't compose with the report surface. Keeping them together means a single read tells the orchestrator both "how do I decide PASS" and "what do I write in the report."
