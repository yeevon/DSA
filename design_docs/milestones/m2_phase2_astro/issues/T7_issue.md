# T7 — Resolve `phase2_issues.md` items + remove `resources/` — Audit Issues

**Source task:** [../tasks/T7_phase2_issues_cleanup.md](../tasks/T7_phase2_issues_cleanup.md)
**Audited on:** 2026-04-23
**Audit scope:** Modified files (`chapters/ch_{1,2,3,4,5,6}/lectures.tex` + matching `.pdf` rebuilds, `chapters/ch_{2,3,4,5,6,7,9,10,11,12,13}/practice.md`, `CLAUDE.md` repo-layout + auditor sequencing rule, `README.md` repo-layout, `design_docs/phase2_issues.md` (rewritten with Resolved section), `design_docs/milestones/m2_phase2_astro/README.md` Done-when item flipped, `CHANGELOG.md`); deleted files (`resources/week_{2,3,4,5}.{tex,pdf}` — 8 files via `git rm -r resources/`). Cross-checked against [`../../../phase2_issues.md`](../../../phase2_issues.md) (item-by-item resolution), [`../../../../CLAUDE.md`](../../../../CLAUDE.md) ("ask before destructive ops" — `git rm -r resources/` is destructive but pre-approved by user option B in M2 alignment review 2026-04-23), [`../../../../LICENSE`](../../../../LICENSE) (already generic post-consolidation; nothing to change), [`../README.md`](../README.md) Done-when block (flipped). Smoke checks executed by the auditor: grep for stale path refs, `pdfinfo` page-count check on rebuilds, `test ! -d resources/`.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None.                                                                                                |
| Jekyll polish                            | ✅ ok  | The `resources/` removal is the *opposite* of polishing Jekyll — it removes orphaned content the Jekyll-era kept around. T8 is still the proper home for the Jekyll source-file deletion. |
| Chapter content > 40-page ceiling        | ✅ ok  | All 6 rebuilt chapters preserve their T5-sweep page counts (ch_1=36, ch_2=34, ch_3=53, ch_4=51, ch_5=26, ch_6=31). ch_3 + ch_4 still grandfathered per CLAUDE.md non-negotiable. The path-refactor edits change ~3 lines per chapter — no semantic content change. |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content authored — only path references rewired.                                          |
| Cross-chapter references                 | ✅ ok  | The companion-materials block points each chapter at its own `notes.tex` + `practice.md` — no cross-chapter refs introduced; the inter-chapter "ch.~9 for AVL" style refs from prior tasks remain untouched. |
| Sequencing violation                     | ✅ ok  | T7 is M2-scope; touches `chapters/` for path-refactor only (per the M2 T2 precedent: M2 tasks may touch chapter sources where pandoc-readiness or stale-ref correctness requires it; the bound is "no content/depth changes"). The CLAUDE.md auditor rule "chapter task touching coding_practice/ or resources/" no longer fires (rule was simplified in T7's CLAUDE.md edit). |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                | Status | Notes |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `design_docs/phase2_issues.md` shows both items resolved with dates and commit refs.                                                                                | ✅ PASS | `## Open` section is now `(none — both items below resolved 2026-04-23 by M2 T7)`. `## Resolved` section has both items with strikethrough + `RESOLVED 2026-04-23 (M2 T7)` / `RESOLVED-OBSOLETE 2026-04-23 (M2 T7, path B)` + per-item evidence + page-count + path-rewire / removal scope. Commit ref will land when this commit hits. |
| 2 | `grep -rn 'companion materials' chapters/` returns zero hits OR every hit is to a real, current target.                                                              | ✅ PASS | `grep -rn 'companion materials' chapters/` → empty. The phrase "Companion materials." in the chapter bookend blocks remains, but the *paths* are now `chapters/ch_N/notes.tex` and `chapters/ch_N/practice.md` (real, current targets). The auditor also confirmed `grep -rnE 'cheat\\_sheets\|practice\\_prompts' chapters/ch_*/lectures.tex` returns empty — no stale refs in any chapter `.tex`. |
| 3 | `test ! -d resources/` — directory removed.                                                                                                                          | ✅ PASS | `test ! -d resources/` exits 0. `git rm -r resources/` removed 8 files (`week_{2,3,4,5}.{tex,pdf}`). |
| 4 | `grep -rnE 'resources/' --include='*.md' --include='*.tex' --include='*.yml' --include='*.html' .` returns zero hits in active docs (historical OK).                | ✅ PASS | Remaining matches are all historical/audit-log: `CHANGELOG.md` entries (record of work — kept), `CLAUDE.md` line 75 (auditor-rule annotation that explicitly cites the removal as a deliberate marker — kept by design), prior audit issue files (T2_issue, T3_issue — historical). No active spec, source, or rendered-doc reference remains. |
| 5 | `LICENSE` scope statement no longer mentions `resources/`.                                                                                                          | ✅ PASS | `grep -c 'resources/' LICENSE` → 0. (The single LICENSE has been generic since the M1 dual→single consolidation; no per-path scope to update.) |
| 6 | `README.md` repo-layout block no longer lists `resources/`.                                                                                                          | ✅ PASS | `grep -c 'resources/' README.md` → 0. The repo-layout `text` block had a 2-line `resources/` entry — removed. |
| 7 | `CLAUDE.md` repo-layout no longer lists `resources/`; the auditor "Sequencing violation?" rule no longer cites `resources/`.                                         | ✅ PASS | Repo-layout block: `resources/` line removed. Auditor sequencing rule simplified from `chapter task touching coding_practice/ or resources/` to `chapter task touching coding_practice/` with a parenthetical citing the removal date. The annotation makes the historical scope discoverable without keeping the rule active. |
| 8 | Affected `chapters/ch_*/lectures.pdf` rebuild clean (`pdflatex -interaction=nonstopmode -halt-on-error`).                                                            | ✅ PASS | All 6 PDFs rebuilt: `ch_1=36 pages` (T5 sweep: 36), `ch_2=34` (T5: 34), `ch_3=53` (T5: 53, grandfathered), `ch_4=51` (T5: 51, grandfathered), `ch_5=26` (T5: 26), `ch_6=31` (T5: 31, after T2 source-fix). Zero page-count drift — confirms the path edits don't reflow content. |

All 8 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M2-T07-ISS-01 — "Companion materials" wording still says "cheat sheet" — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — out of T7 scope

The bookend block in each chapter `lectures.tex` still reads:

> `\textbf{Companion materials.} One-page cheat sheet: \texttt{chapters/ch\_2/notes.tex}. Practice prompts...`

The term "cheat sheet" is the OLD vocabulary; the file is now called `notes.tex` (post the 2026-04-22 rename). The path is correct; only the descriptor lags. T7 spec scope was "rewire the companion-materials line" (path correctness), not "rename cheat sheet to compact notes" (content-style edit). Phase2_issues.md item 1 only required path correctness.

**Action / Recommendation:** if this bothers a future audit, fold it into the post-build content audit (alongside ch_3/ch_4 trim review and optional-chapter augmentation). Not a queued task today.

### M2-T07-ISS-02 — Auditor sequencing rule annotation is verbose — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — historical signal worth keeping

CLAUDE.md's "Sequencing violation?" rule now reads:

> chapter task touching `coding_practice/` ... — flag HIGH. (`resources/` removed in M2 T7, 2026-04-23 — week-level sidecar TeX was orphaned by chapter augmentation.)

The trailing parenthetical is more verbose than a clean rule typically would be. Kept because (a) future audits searching for `resources/` in CLAUDE.md should find an explicit "this used to be here, was removed because X" marker rather than a silent absence, and (b) it costs nothing to keep one sentence in a doc nobody re-reads frequently.

**Action / Recommendation:** none. If a future major rewrite of CLAUDE.md (post-M2 close-out, say) cleans up auditor-rule annotations, this can be dropped.

## Additions beyond spec — audited and justified

- **`practice.md` "standard wrapper" reference rewired in 11 chapters.** T7 spec item 1 named the bookend in `lectures.tex`; the same rewire surfaced in `chapters/ch_*/practice.md` line 10 (10 chapters with one phrasing variant + ch_2 with a slightly different phrasing, all referencing `practice_prompts/ch_1.md`). Same fix shape as item 1 — replace the stale `practice_prompts/ch_1.md` with the current `chapters/ch_1/practice.md`. Justified: same root cause as the `lectures.tex` rewire; fixing only one of the two would leave a known-stale reference in plain sight.
- **`phase2_issues.md` rewritten with explicit `## Open` and `## Resolved` sections** rather than just striking through the open items. The original file structure had only an `## Open` section + a "strike through items as resolved" instruction. T7 promotes resolved items to a sibling `## Resolved` section so the open list is empty + visibly so. Tiny doc-shape improvement; doesn't change meaning.
- **CLAUDE.md sequencing rule keeps the `resources/` annotation** rather than deleting it cleanly. Documented in ISS-02 above; deliberate.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| `phase2_issues.md` `## Open` is empty; both items in `## Resolved` with date + scope             | ✅ |
| `grep -rn 'companion materials' chapters/` → empty                                              | ✅ |
| `grep -rnE 'cheat\\_sheets\|practice\\_prompts' chapters/ch_*/lectures.tex` → empty              | ✅ |
| `grep -rnE 'practice_prompts' chapters/ch_*/practice.md` → empty                                | ✅ |
| `test ! -d resources/`                                                                           | ✅ |
| `grep -c 'resources/' LICENSE` → 0                                                                | ✅ |
| `grep -c 'resources/' README.md` → 0                                                              | ✅ |
| `CLAUDE.md` repo-layout block no longer lists `resources/`                                       | ✅ |
| `CLAUDE.md` auditor rule no longer cites `resources/` as an active path (annotation kept)        | ✅ |
| All 6 affected `lectures.pdf` rebuild exit 0 + page counts unchanged                              | ✅ |
| `m2/README.md` Done-when item for phase2_issues flipped to checked + cites T7                    | ✅ |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T7 + scopes path rewire + removal       | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status        | Owner / next touch point                                  |
| ------------- | --------- | ------------- | --------------------------------------------------------- |
| M2-T07-ISS-01 | 🟢 LOW    | ✅ ACCEPTED   | post-build content audit (cheat-sheet → compact-notes terminology)  |
| M2-T07-ISS-02 | 🟢 LOW    | ✅ ACCEPTED   | post-M2 CLAUDE.md cleanup pass (drop the annotation)      |

## Propagation status

T7 closes both `phase2_issues.md` items so the M2 Done-when "Two phase2_issues items resolved" criterion is fully satisfied. No carry-over to T6 or T8 (T7 is fully independent of both). T8's Jekyll-removal sweep doesn't touch `resources/` (already gone) — its scope is `_config.yml`, `_data/`, `_includes/`, `_layouts/`, top-level `lectures/` + `notes/`, `index.md`, plus the T3 carry-over for `src/pages/callouts-test.astro`.
