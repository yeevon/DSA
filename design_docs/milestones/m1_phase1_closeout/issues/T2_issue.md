# T2 — Pandoc probe — Audit Issues

**Source task:** [../tasks/T2_pandoc_probe.md](../tasks/T2_pandoc_probe.md)
**Audited on:** 2026-04-23 (cycle 1) → re-audited 2026-04-23 (cycle 2)
**Audit scope:** `design_docs/pandoc_probe.md` (new + cycle-2 amendment), `design_docs/architecture.md` §5 row 1 (edited), `CHANGELOG.md` (entry added + cycle-2 amendment), `design_docs/milestones/m2_phase2_astro/README.md` (carry-over appended). Cross-checked against architecture.md §1 (static content pipeline / pandoc + Lua filter promise), `roadmap_addenda.md` (one-hour budget + filter-vs-port framing), `notes-style.tex` (env definitions probed), and the actual probe outputs at `/tmp/probe.{md,html,stderr,html.stderr}`.
**Status:** ✅ PASS — both deferrals RESOLVED 2026-04-23 by M2 T2 (see ISS-02 + ISS-03 below).

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `pandoc` is a system binary (already installed); no new package in any manifest                       |
| Jekyll polish                            | ✅ ok  | Probe doc lives in `design_docs/`; no Jekyll surface touched                                          |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched                                                                            |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched                                                                            |
| Cross-chapter references                 | ✅ n/a | No chapter content touched                                                                            |
| Sequencing violation                     | ✅ ok  | T2 is M1-scope; touches a Phase-2-relevant decision (Lua filter) but only **decides**, doesn't build |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist yet (correct — only created when needed)                                           |

No HIGH drift findings. Audit can proceed to AC grading.

## AC grading

| # | Acceptance criterion                                                       | Status | Notes |
|---|----------------------------------------------------------------------------|--------|-------|
| 1 | `design_docs/pandoc_probe.md` exists with a clear verdict at the top       | ✅ PASS | Verdict line is line 3, opens with **HYBRID** + one-sentence rationale |
| 2 | Each of the five callout types is named with concrete evidence of how it rendered | ✅ PASS (cycle 2) | Cycle 2 added per-env rendering snippets for `defnbox` (line 81) and `notebox` (line 89) of `pandoc_probe.md`, complementing the cycle-1 `ideabox` (60), `warnbox` (64), `examplebox` (68). All 5 envs now individually evidenced. **ISS-01 RESOLVED.** |
| 3 | `lstlisting` language preservation documented yes/no                       | ✅ PASS | Documented as "completely lost"; concrete before/after shown |
| 4 | Section anchor strategy documented (built-in vs needs-filter)              | ✅ PASS | Documented with HTML evidence; verdict: pandoc auto-slugs but lacks `ch_N-` prefix → needs filter pass |
| 5 | Architecture.md §5 row 1 status updated                                    | ✅ PASS | Row 1 now: "**resolved: HYBRID** (small filter + native pandoc) — see [`pandoc_probe.md`](pandoc_probe.md)" with date stamp |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### M1-T02-ISS-01 — Two of five callout types lack their own rendering snippet (AC 2 partial) — RESOLVED

**Severity:** 🟡 MEDIUM
**Status:** ✅ RESOLVED (cycle 2, 2026-04-23)

Cycle-2 amendment to `design_docs/pandoc_probe.md` added per-env rendering snippets for `defnbox` and `notebox` pulled directly from `/tmp/probe.md` (lines 81 and 89 of the amended probe doc). All 5 envs now individually evidenced; AC 2 fully met. CHANGELOG entry amended to reflect 5/5 ACs after cycle 2.

**Original finding:** *The acceptance criterion reads: "Each of the five callout types is named with concrete evidence of how it rendered." The probe doc names all 5 but `defnbox` and `notebox` only appeared inside the title-loss section, not via a rendering snippet of their own.*

## 🟢 LOW

### M1-T02-ISS-02 — Pandoc version not pinned — RESOLVED (M2 T2, 2026-04-23)

**Severity:** 🟢 LOW
**Status:** ✅ RESOLVED — M2 T2 pinned to `3.1.3` in `.pandoc-version` at repo root; `architecture.md` §5 ("Resolved here") records the pin and cites the sweep doc + filter so future audits see it.

**Original finding:** *The probe doc itself acknowledges: "Pandoc version: stock `apt`-installed (Ubuntu) — `pandoc --version` not pinned for the probe; M2 should pin a specific minor in CI." The probe verdict could shift across pandoc majors.*

### M1-T02-ISS-03 — Stray `` ```{=html} `` raw passthrough block not investigated — RESOLVED (M2 T2, 2026-04-23)

**Severity:** 🟢 LOW
**Status:** ✅ RESOLVED — M2 T2 sweep across all 24 chapter sources documented in `design_docs/m2_raw_passthrough_sweep.md`. Only **1** raw block found across the corpus (the original ch_1 stray at line 496 of generated MDX — pandoc's HTML-comment disambiguation, harmless under `-raw_attribute` writer). Sweep also surfaced an unrelated parse failure on `chapters/ch_6/lectures.tex` (nested-tabular pattern) — fixed in the same M2 T2 commit by refactoring to side-by-side `minipage` blocks; pdflatex still exit 0, lectures.pdf still 31 pages.

**Original finding:** *`/tmp/probe.md` line 496 contains a raw HTML passthrough fence. The probe doc notes the occurrence but doesn't identify the upstream tcolorbox construct that triggered pandoc's fallback. Single occurrence in ch_1 — frequency across the other 11 chapters is unknown.*

## Additions beyond spec — audited and justified

- The probe doc has an "Effort estimate for M2" section (~50–100 lines for the filter, < 1 day) that wasn't in the spec's deliverable list. Justified: directly informs M2's task-design effort estimate and prevents over- or under-scoping the filter task. Low coupling.
- The probe doc references the harmless `\input{../../notes-style.tex}` warning. Spec didn't require this; included because a future reader would otherwise wonder if it mattered. Low cost.

No additions add architectural coupling.

## Verification summary

| Check                                                              | Result |
| ------------------------------------------------------------------ | ------ |
| `design_docs/pandoc_probe.md` exists                               | ✅     |
| `design_docs/architecture.md` §5 row 1 marks HYBRID + links probe  | ✅     |
| `CHANGELOG.md` entry under `## 2026-04-23` references M1 Task T2   | ✅     |
| `pandoc … -t markdown` exit 0                                       | ✅     |
| `pandoc … -t html5 --standalone` exit 0                            | ✅     |
| All 5 env names appear in probe doc                                | ✅     |
| `lstlisting` discussion present                                    | ✅     |
| Section anchor discussion present                                  | ✅     |

## Issue log — cross-task follow-up

| ID            | Severity  | Status      | Owner                                 |
| ------------- | --------- | ----------- | ------------------------------------- |
| M1-T02-ISS-01 | 🟡 MEDIUM | ✅ RESOLVED  | T2 cycle 2 (fixed)                    |
| M1-T02-ISS-02 | 🟢 LOW    | ✅ RESOLVED | M2 T2 (2026-04-23, .pandoc-version)    |
| M1-T02-ISS-03 | 🟢 LOW    | ✅ RESOLVED | M2 T2 (2026-04-23, sweep + ch_6 fix)   |

## Propagation status

M2 has no per-task spec files yet (M2's `README.md` is the milestone spec; tasks haven't been broken out). Per CLAUDE.md's forward-deferral rule, carry-over normally appends to the **target task's spec**. Pragmatic interim: append a *"Carry-over from prior audits (pre-task-breakout)"* section to `m2_phase2_astro/README.md` capturing M1-T02-ISS-02 and M1-T02-ISS-03 with explicit redistribution-on-task-breakout note.

Performed in this audit:

- ✅ `design_docs/milestones/m2_phase2_astro/README.md` — appended carry-over section (see edit immediately following this file).

When M2's task-breakout step happens, the redistributor reads this carry-over, assigns each item to the appropriate concrete task, and removes the pre-task-breakout section.
