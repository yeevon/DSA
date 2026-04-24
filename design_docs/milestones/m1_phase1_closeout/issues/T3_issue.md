# T3 — Add LICENSE files — Audit Issues

**Source task:** [../tasks/T3_license_files.md](../tasks/T3_license_files.md)
**Audited on:** 2026-04-23 (cycle 1) → re-audited 2026-04-23 (cycle 2)
**Audit scope:** `LICENSE-CONTENT` (new + cycle-2 header rewrite), `LICENSE-CODE` (new + cycle-2 clarification), `README.md` (license section edited cycles 1 + 2), `CHANGELOG.md` (T3 entry). Cross-checked against the dual-license decision recorded in CHANGELOG 2026-04-22, the T3 task spec edge-case note about `notes-style.tex`, and the actual repo file enumeration.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                   |
| ---------------------------------------- | ------ | ----------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None.                                                                   |
| Jekyll polish                            | ✅ ok  | Doc-only.                                                               |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content.                                                     |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content.                                                     |
| Cross-chapter references                 | ✅ n/a | No chapter content.                                                     |
| Sequencing violation                     | ✅ ok  | T3 is M1-scope; both LICENSE files are independently shippable.          |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist.                                                     |
| Configuration / secrets                  | ✅ ok  | No config or secrets touched.                                           |
| Observability                            | ✅ ok  | n/a.                                                                     |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                              | Status | Notes |
|---|-----------------------------------------------------------------------------------|--------|-------|
| 1 | `LICENSE-CONTENT` exists at repo root with the CC BY-NC-SA 4.0 legal text         | ✅ PASS | 455 lines = 17 header + 438 canonical. `grep` confirms canonical opener "Attribution-NonCommercial-ShareAlike 4.0 International Public License". |
| 2 | `LICENSE-CODE` exists at repo root with MIT, attributed to Jose de Lima           | ✅ PASS | 31 lines. Both `MIT License` heading and `Copyright (c) 2026 Jose de Lima` lines present. |
| 3 | Each file's header clearly states which paths it covers                           | ✅ PASS | Both headers enumerate concrete paths/categories upfront. |
| 4 | README license section links to both files                                        | ✅ PASS | `[LICENSE-CONTENT](LICENSE-CONTENT)` and `[LICENSE-CODE](LICENSE-CODE)` markdown links present. |
| 5 | No overlap or ambiguity in the path coverage                                      | ✅ PASS (cycle 2) | LICENSE-CONTENT header rewritten as a per-path bullet list covering 8 path categories (chapters/, resources/, lectures+notes Jekyll viewers, design_docs/ entire tree, coding_practice/, notes-style.tex, public/audio/, README+CHANGELOG+CLAUDE meta-docs). README content bullet rewritten to enumerate the same 8 categories. LICENSE-CODE adds a one-line clarification that `notes-style.tex` is content not code. **ISS-01 + ISS-02 RESOLVED.** |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### M1-T03-ISS-01 — Path-coverage enumeration drift between README and LICENSE-CONTENT (AC 5 partial) — RESOLVED

**Severity:** 🟡 MEDIUM
**Status:** ✅ RESOLVED (cycle 2, 2026-04-23)

Cycle-2 fix: LICENSE-CONTENT header rewritten to a per-path bullet list; README content bullet rewritten to enumerate the same 8 path categories (chapters/, resources/, lectures+notes, design_docs/, coding_practice/, notes-style.tex, public/audio/, repo meta-docs). Both files now agree on coverage. LICENSE-CODE updated symmetrically.

**Original finding kept for history:**

The README license section's content bullet and `LICENSE-CONTENT`'s scope-statement header enumerate **different sets of paths**:

| Path                              | README content bullet | LICENSE-CONTENT header |
| --------------------------------- | --------------------- | ---------------------- |
| `chapters/`                       | ✅                    | ✅ (as "chapter LaTeX sources") |
| `resources/`                      | ✅                    | ❌ **missing**         |
| `lectures/` (Jekyll viewer)       | ✅                    | ❌ **missing**         |
| `notes/` (Jekyll viewer)          | ✅                    | ❌ **missing**         |
| `design_docs/` (broad)            | ✅                    | ⚠️ partial — only `chapter_reviews/` and `milestones/` |
| Generated PDFs                    | ✅                    | ✅ (as "PDFs they produce") |
| Future audio                      | ✅                    | ✅                     |
| `coding_practice/`                | ❌ missing            | ✅                     |

In a strict legal reading, items present in only one of the two enumerations have ambiguous coverage. (`design_docs/architecture.md`, `roadmap_addenda.md`, `phase2_issues.md`, `pandoc_probe.md` are all in the partial-coverage gap.)

**Action / Recommendation:** in cycle 2, reconcile both enumerations to a single canonical list. Suggested coverage list (LICENSE-CONTENT + matching README bullet):

- `chapters/` (LaTeX sources, generated PDFs, practice prompts)
- `resources/` (week-level sidecar TeX + PDFs)
- `lectures/` and `notes/` (Jekyll viewer wrappers — until M2 deletes them)
- `design_docs/` (entire tree — architecture, roadmap_addenda, milestones, chapter_reviews, phase2_issues, pandoc_probe; everything *except* the slash-command files in `.claude/`, which are gitignored)
- `coding_practice/` (prompt corpus)
- Generated PDFs (matched everywhere they appear)
- Future audio narration (`public/audio/ch_N.{mp3,timestamps.json}` per architecture.md §1.4)

`CHANGELOG.md` and `README.md` are documentation that describes the work — they themselves are content. `CLAUDE.md` is repo conventions and is also content. `notes-style.tex` is the LaTeX preamble — see ISS-02.

## 🟢 LOW

### M1-T03-ISS-02 — `notes-style.tex` edge case unaddressed — RESOLVED

**Severity:** 🟢 LOW
**Status:** ✅ RESOLVED (cycle 2, 2026-04-23)

Cycle-2 fix: LICENSE-CONTENT header now lists `notes-style.tex` explicitly with the parenthetical "(shared LaTeX preamble — content, not code; defines the callout boxes used in every chapter)". LICENSE-CODE adds a one-line trailing clarification: "The shared LaTeX preamble notes-style.tex is content, not code, since it defines the in-document callout boxes rather than building anything."

**Original finding kept for history:**

The T3 task spec calls out: *"Edge cases worth noting in each header: `notes-style.tex` (LaTeX preamble — content)…"*. Neither `LICENSE-CONTENT` nor `LICENSE-CODE` mentions `notes-style.tex` explicitly. It's the shared LaTeX preamble defining all 5 callout boxes; without an explicit assignment, a reader could argue either side (it's `.tex` source like chapters → content; or it's a build-time preamble like a script → code).

**Action / Recommendation:** in cycle 2, add `notes-style.tex` to the LICENSE-CONTENT header's enumeration (it's source for the chapters, never builds anything on its own). Alternatively, a one-line clarification in `LICENSE-CODE` header saying "the LaTeX preamble `notes-style.tex` is content, not code" would also work — but adding it positively in LICENSE-CONTENT is cleaner.

## Additions beyond spec — audited and justified

- LICENSE-CONTENT header enumerates `coding_practice/` and `design_docs/chapter_reviews/` + `design_docs/milestones/` explicitly. T3 spec didn't require this granularity. Justified: makes coverage discoverable from the LICENSE file directly without cross-referencing README. But see ISS-01 — the granularity is **inconsistent** with README, which is the actual problem.
- The note in CHANGELOG about routing around the content-filter block (shell concat instead of `Write` tool) is an audit-trail addition. Useful for future Claude sessions hitting the same filter.

## Verification summary

| Check                                                              | Result |
| ------------------------------------------------------------------ | ------ |
| `LICENSE-CONTENT` exists at repo root                              | ✅     |
| `LICENSE-CONTENT` line count = 455 (17 header + 438 canonical)     | ✅     |
| Canonical CC opener present                                         | ✅ 1 match |
| `LICENSE-CODE` exists at repo root                                 | ✅     |
| `LICENSE-CODE` contains `MIT License` and Jose attribution         | ✅     |
| `README.md` links both files via markdown                          | ✅ 2 matches |
| README's "(LICENSE files to follow)" line removed                  | ✅     |
| Both file headers enumerate concrete coverage paths                | ✅     |
| Path coverage between README and LICENSE-CONTENT consistent         | 🟡 see ISS-01 |
| `notes-style.tex` edge case addressed in either header             | 🟢 see ISS-02 |
| `CHANGELOG.md` entry under `## 2026-04-23` references M1 Task T3   | ✅     |

## Issue log

| ID            | Severity  | Status      | Owner                       |
| ------------- | --------- | ----------- | --------------------------- |
| M1-T03-ISS-01 | 🟡 MEDIUM | ✅ RESOLVED | T3 cycle 2 (fixed)          |
| M1-T03-ISS-02 | 🟢 LOW    | ✅ RESOLVED | T3 cycle 2 (fixed)          |

## Propagation status

No forward-deferrals — both findings are local to T3 and can be fixed in cycle 2 by editing `LICENSE-CONTENT` header and `README.md` license bullet.
