# T01 — Architecture grounding + cs300 Python package scaffold — Audit Issues

**Source task:** [../tasks/T01_arch_and_package.md](../tasks/T01_arch_and_package.md)
**Audited on:** 2026-05-01 (cycle 1) → re-audited 2026-05-01 (cycle 2)
**Audit scope:** T01 spec + carry-over, architecture.md (§3.1, §5, §6, system-shape diagram, §1 §2 references), milestone README (M4 + index), CHANGELOG.md (top entry), README.md (status callout), roadmap_addenda.md, pyproject.toml, cs300/ package skeleton, AC-8 smoke, status surfaces (3-of-4: T01 spec, M4 task table, M4 "Done when"; cs-300 has no `tasks/README.md` index), repo working-tree cleanliness (untracked Python build artefacts), 5 builder-reported deviations. **Cycle 2 re-verified:** `.gitignore` Python block additions (`*.egg-info/`, `build/`, `uv.lock`), removal of `cs300.egg-info/` + `uv.lock` from disk, M4 README line 65 `ValidatorNode → ValidateStep` flip + freshness note above "Task descriptions" list, architecture.md §6 line 478 closure, AC-8 re-smoke.
**Status:** ✅ PASS — all three open findings resolved 2026-05-01 cycle 2. H1 (working-tree containment), M1 (M4 README Tier-4 residue on the live "Done when" surface), and L1 (architecture.md §6 stale `coding_practice/` open-question note) all RESOLVED. AC-8 re-smoke clean. All 11 ACs PASS on the merits. One LOW noted but non-blocking (L3 — global `build/` ignore is broader than necessary; functionally harmless because nothing is tracked under any `build/` anywhere in the index, and `coding_practice/build/` is already covered explicitly at `.gitignore:113`).

## Design-drift check

**Architecture.md cross-check (§3.1, §5, §1 system-shape diagram):**

- §3.1 (`design_docs/architecture.md:336–344`) cleanly migrated to `WorkflowSpec` / `LLMStep` / `ValidateStep` / `register_workflow(spec)`. `grep -n "TieredNode\|ValidatorNode\|RetryingEdge\|register(\"name"` against architecture.md returns zero hits — Tier-4 surface fully retired in the architecture of record.
- §3.1 input shape now lists `{chapter_id, section_id?, section_text, count, types}` and the surrounding paragraph explains `section_text` as the rendered chapter / section text the browser already has. Decoupling rationale (`aiw-mcp` does not need to read `chapters/` or `src/content/`) is captured.
- `RunWorkflowOutput.artifact` is the canonical field (line 340); `.plan` mentioned only as a deprecated alias preserved through 0.2.x and removed at 1.0.
- §1 system-shape diagram + paragraph (`architecture.md:25, 40`) say `cs300/workflows/*.py` (Python import path), not `./workflows/`. `grep -n "\\./workflows/"` against architecture.md returns zero hits — path-realignment AC complete.
- §5 row 6 `coding_practice/` (`architecture.md:462`) shows `**resolved: dynamic** — question_gen workflow receives section_text directly … No Phase 4 prompt files needed. ✅ 2026-05-01`.
- §6 line 478 still reads "Question prompt corpus shape under `coding_practice/` (Phase 4 open question; see `roadmap_addenda.md`)." This is now stale relative to §5 (the open question is closed). LOW — see L1. **[Cycle 2 update 2026-05-01: RESOLVED.** Line 478 now reads `Question prompt corpus shape under `coding_practice/` (**resolved 2026-05-01**: dynamic — `section_text` flows in from the browser; `coding_practice/` is the user's coding-exercise workspace, unchanged. See architecture.md §5 row 6.)`. The open-question framing is gone; §6 now matches §5.]

**New-dependency check:** `pyproject.toml` declares zero install-time dependencies (only the `[build-system]` requirement of `setuptools>=68`). No new runtime dependency was introduced, so architecture.md's "settled tech / open decisions" tables don't need to grow. The `setuptools>=68` build-time requirement is a deviation from spec (spec shows only `[project]`, no `[build-system]`) — see Additions-beyond-spec section.

**nice_to_have boundary:** `design_docs/nice_to_have.md` exists (12.6 KB, last touched 2026-04-27 by M-UX-REVIEW close). T01 does not adopt anything from it; `grep -n "setuptools\|pyproject\|cs300"` against nice_to_have.md returns no hits. Clear.

**Sequencing check:** Pre-Phase-4 task touching M4 surfaces only — no Jekyll polish, no chapter content, no `coding_practice/` writes. Clear.

**Status-surface drift (CLAUDE.md non-negotiable, four surfaces):**

| Surface | State | Verdict |
| ------- | ----- | ------- |
| (a) Per-task spec `**Status:**` (`tasks/T01_arch_and_package.md:3`) | `✅ done 2026-05-01` | ✅ |
| (b) `tasks/README.md` row | n/a — cs-300 has no `tasks/README.md` index file (milestone READMEs own the task table directly; project precedent across M1–M3) | n/a |
| (c) Milestone README task-table row (`m4_phase4_question_gen/README.md:82`) | `✅ done 2026-05-01` | ✅ |
| (d) Milestone README "Done when" `coding_practice/` checkbox (`m4_phase4_question_gen/README.md:71–76`) | `[x]` with citation parenthetical pointing at T01 + architecture.md §5 + roadmap_addenda.md | ✅ |
| (extra) Milestones index row (`design_docs/milestones/README.md:22`) | `🟡 in progress 2026-05-01 (T01 closed; jmdl-ai-workflows v0.4.0 resolves convention hooks via WorkflowSpec)` | ✅ |

All four required surfaces agree. Builder-reported "milestones index updated" verified.

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| AC-1 §3.1 sheds Tier-4 surface | ✅ | `grep -c "TieredNode\|ValidatorNode\|RetryingEdge\|register(\"name"` against architecture.md = 0. WorkflowSpec / LLMStep / ValidateStep / `register_workflow(spec)` are the only authoring surfaces named (lines 302, 336, 340, 342, 344). |
| AC-2 §3.1 input shape includes `section_text` | ✅ | Line 338 lists `{chapter_id, section_id?, section_text, count, types: [...]}` and the next sentence binds `section_text` to "the rendered text … the browser already has in-page". |
| AC-3 `RunWorkflowOutput.artifact` not `.plan` | ✅ | Line 340 names `.artifact` as the v0.4.0 field and explicitly demotes `.plan` to "deprecated alias preserved through the 0.2.x line and removed at 1.0 — new code uses `.artifact`." |
| AC-4 §5 `coding_practice/` row resolved | ✅ | Line 462 row reads `**resolved: dynamic** … No Phase 4 prompt files needed. ✅ 2026-05-01`. |
| AC-5 `aiw_workflow_convention_hooks_issue.md` deleted | ✅ | `ls` returns "No such file or directory"; `git status` shows `D aiw_workflow_convention_hooks_issue.md` (staged for deletion). No stale links remain in README.md (verified — orphan-link removal landed); references in CHANGELOG entries 17/74/84/2336 are historical narrative (correct). |
| AC-6 `pyproject.toml` declares cs300 + py>=3.12 | ✅ | `[project] name = "cs300"`, `requires-python = ">=3.12"` at lines 16–19. |
| AC-7 `cs300/__init__.py` + `cs300/workflows/__init__.py` exist | ✅ | Both present (427 B + 1092 B). Each carries a docstring citing T01 + the planned-modules list per CLAUDE.md file-header convention. |
| AC-8 smoke (non-inferential) | ✅ | Auditor ran `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 python3 -c "import cs300.workflows; print('ok')"` → stdout `ok`, exit 0. Python 3.12.3, `/usr/bin/python3` (matches `requires-python = ">=3.12"`). |
| AC-9 M4 README round-2 carry-over `[x]` | ✅ | `m4_phase4_question_gen/README.md:162–167` shows the "Upstream gate, round 2 (M16 follow-up — RESOLVED 2026-05-01)" item with `[x]` + WorkflowSpec citation. |
| AC-10 CHANGELOG M4 T01 entry under current dated section | ✅ | `CHANGELOG.md:14–101` carries a richly detailed `## 2026-05-01` → `**Added** **M4 T01 …**` entry covering all 5 sub-actions, the AC checklist, files touched, and the dep-audit deferral note. |
| AC-11 `roadmap_addenda.md` records `coding_practice/` decision | ✅ | `roadmap_addenda.md:105–111` updates the `coding_practice/ — kept` section: "**Resolved 2026-05-01 (M4 T01):** question generation is **dynamic**, not prompt-corpus-driven … No `coding_practice/`-side prompt files are read, persisted, or required for Phase 4." |

All 11 ACs satisfied on the merits.

## 🔴 HIGH

### H1 — Untracked Python build artefacts in working tree (`cs300.egg-info/`, `uv.lock`); not gitignored — RESOLVED 2026-05-01 (cycle 2)

**Evidence.** `git status` reports two untracked items the spec did not authorise:

- `cs300.egg-info/` — contains `PKG-INFO`, `SOURCES.txt`, `dependency_links.txt`, `top_level.txt`. PKG-INFO is dated `2026-05-01 19:42`; the package was **installed in editable mode** (the only way egg-info materialises) at some point during the build cycle.
- `uv.lock` — 126 bytes, names `cs300 0.1.0 source = { editable = "." }` and `requires-python = ">=3.12"`. Generated by `uv sync` / `uv lock` against this `pyproject.toml`. Also dated `2026-05-01 19:42`.

The T01 spec is **explicit** that this should not happen (`tasks/T01_arch_and_package.md:88–91`):

> Editable-install note (for the task spec record, not a deliverable): running the project does NOT require `pip install -e .` because `PYTHONPATH=<repo_root>` is sufficient … The pyproject.toml is for tooling + type-checker discoverability only.

`.gitignore` covers `__pycache__/`, `*.py[cod]`, `.venv/`, `dist/` (lines 49–86) but **not** `*.egg-info/` and **not** `uv.lock`. Both will be picked up by a naïve `git add -A` at commit time and either land in the repo (hard NO — egg-info contains generated PKG-INFO that drifts every install) or trigger a dep-auditor surprise.

This is a containment failure on top of a small scope creep: the act of running an editable install was out of scope (the spec's smoke is the import-path probe, not a build), and the resulting artefacts were not contained.

**Action.** Two fixes, both small, in this same task before commit (do not defer):

1. Add `cs300.egg-info/` and `uv.lock` to `.gitignore` (Python section starting at line 47). The `.gitignore` already has a Python block; append the two patterns there. (Optionally also add `*.egg-info/` and `build/` and `dist/` under cs300-specific paths — Python wheel-builder canonical entries — to harden against future `setuptools` runs.)
2. Delete the two untracked items from disk (`rm -rf cs300.egg-info uv.lock`) so the working tree matches the spec's "tooling-discoverability only" intent.

If the user prefers to **keep** uv as the dependency manager going forward, that is a separate architectural decision (uv lockfile becomes part of the repo), not a T01 scope item — record it as a follow-up against M4 T02/T03 with an architecture.md update, not a quiet-commit here. T01's contract is "no install-time deps, no editable install needed"; honour it.

**Cycle 2 verification (2026-05-01).**

- `ls /home/papa-jochy/Documents/School/cs-300/cs300.egg-info/` → `No such file or directory`, exit 2. ✅ Deleted from disk.
- `ls /home/papa-jochy/Documents/School/cs-300/uv.lock` → `No such file or directory`, exit 2. ✅ Deleted from disk.
- `git -C /home/papa-jochy/Documents/School/cs-300 status --porcelain | grep -E 'egg-info|uv\.lock'` → empty output, exit 1. ✅ Working tree clean of both artefacts; nothing untracked.
- `.gitignore` Python block now carries (lines 57–62, with M4 T01 cycle 2 attribution comment): `*.egg-info/`, `build/`, `uv.lock`. ✅ Future editable-install + `uv sync` runs are contained.
- Containment failure cleared. The `[build-system]` block in `pyproject.toml` (deviation #3 from cycle 1) remains in place — it stays harmless now that its side effects are gitignored.

**One small note (LOW, see L3 below):** the `build/` pattern added to the Python block is broader than the spec finding asked for (only `cs300.egg-info/` + `uv.lock` were strictly required). It is functionally harmless because nothing is tracked under any `build/` anywhere in the index (verified: `git ls-files | grep build` returns no rows), and `coding_practice/build/` was already explicitly gitignored at line 113. But it is a wider blanket than the issue called for and worth flagging.

## 🟡 MEDIUM

### M1 — M4 README still cites `ValidatorNode` / `TieredNode` / `RetryingEdge` / `register("name", build)` after the architecture migration — RESOLVED 2026-05-01 (cycle 2)

**Evidence.** `grep -n "TieredNode\|ValidatorNode\|RetryingEdge"` against `m4_phase4_question_gen/README.md` returns four hits:

- Line 65 (in "Done when" — a **live, ungraded acceptance criterion** for the milestone): `Validation runs twice as architecture.md §3.1 mandates: once inside the cs-300 workflow's ValidatorNode (KDR-004 in the upstream framework), once at insert (schema conformance).`
- Lines 96–99 (in "Task descriptions (original breakout notes)"): `Each module builds a LangGraph StateGraph composing TieredNode (Ollama Qwen) + ValidatorNode + RetryingEdge per the upstream framework conventions … Each calls register("name", build) at module bottom.`
- Line 119 (in "Task descriptions" item 7): `Include retry on workflow timeout (handled at the framework layer via RetryingEdge).`

Architecture.md §3.1 — the document the M4 README "Done when" line 65 cites — no longer mentions `ValidatorNode`. The cross-reference is now broken: a future Builder reading the M4 "Done when" will look at architecture.md §3.1 expecting `ValidatorNode` and find `ValidateStep`, then have to reconcile. The "original breakout notes" header partially excuses lines 96–119 as historical context, but line 65 is in the active acceptance-criteria list and is graded by the M4 close-out audit.

The T01 spec's Deliverable F (M4 README updates) names three changes (carry-over checkbox flip, status callout flip, task table add) and does not require updating "Done when" or "Task descriptions". So strictly the Builder didn't miss a deliverable. **But** CLAUDE.md's design-drift non-negotiable says drift between live acceptance surfaces is HIGH — and a "Done when" referencing a class name the architecture.md no longer carries is exactly that drift in miniature. T01 was the natural opportunity to flip line 65 inline (one-word edit `ValidatorNode` → `ValidateStep`), the same edit the Builder *did* make at architecture.md §2 line 302 (deviation #1 in the builder report).

**Action.** Two viable paths — the user picks:

1. **Inline now (preferred, ~3 minutes).** Edit `m4_phase4_question_gen/README.md` line 65 `ValidatorNode` → `ValidateStep`. Optionally also flip lines 96–99 and 119 (`TieredNode` → `LLMStep` routed to `local_coder` via `TierConfig`; `ValidatorNode` → `ValidateStep`; `RetryingEdge` → "the framework's retry primitive (declarative `retry=` on the spec, internal to `WorkflowSpec`)" — and rename the section header from "Task descriptions (original breakout notes)" to "Task descriptions (post-T01 migration)" so the surface tells the truth about its own freshness). Adds a CHANGELOG line under the existing T01 entry: `M4 README "Done when" + Task descriptions migrated to WorkflowSpec language for cross-doc consistency`.
2. **Defer to T02/T03 close-out.** Flag it as carry-over against the T02 spec ("flip the M4 README to WorkflowSpec language while you're authoring `question_gen.py` against the new surface anyway"). Cheap if T02 lands soon; risky if it slips because the M4 close-out audit will catch the drift either way.

Lean: option 1. The architecture migration is conceptually one edit; splitting it across tasks invites a re-audit ping-pong.

**Cycle 2 verification (2026-05-01).**

- M4 README line 65 now reads `once inside the cs-300 workflow's \`ValidateStep\` (KDR-004 in the upstream framework), once at insert (schema conformance).` ✅ The live "Done when" surface no longer cross-references a class name absent from architecture.md §3.1.
- M4 README lines 91–99 now carry a freshness note above the "Task descriptions" numbered list: `_Note: The task descriptions below were written against jmdl-ai-workflows v0.2.0 / M16 surface (Tier-4 API: \`TieredNode\` / \`ValidatorNode\` / \`RetryingEdge\` / \`register("name", build)\`). The authoritative task specs at \`tasks/\` reflect the v0.4.0 \`WorkflowSpec\` declarative surface (\`LLMStep\` / \`ValidateStep\` / \`register_workflow(spec)\`). These notes are preserved as design history; T01–T08 specs are the live scope._` ✅ Future readers are warned the prose below references a retired surface; the live `tasks/T01–T08` specs are the canonical scope. The header was kept as `## Task descriptions (original breakout notes)` — combined with the disclaimer paragraph this is at least as clear as renaming the header.
- The verbatim `TieredNode` / `ValidatorNode` / `RetryingEdge` strings still appear at lines 95, 104–105, 127 (as called out in cycle 1) — but they now sit *under* the freshness disclaimer at lines 91–99 and are explicitly framed as historical design notes, not live scope. The Builder picked the lighter-touch resolution (option 1's "minimal" variant: line 65 + a contextualising note rather than the full per-line rewrite). Acceptable — the live "Done when" surface (line 65) is the surface CLAUDE.md's design-drift rule cares about, and the historical-notes section is now self-labelled.

## 🟢 LOW

### L1 — architecture.md §6 `Out of scope` still lists `coding_practice/` as a "Phase 4 open question" — RESOLVED 2026-05-01 (cycle 2)

**Evidence.** `architecture.md:478` reads: `Question prompt corpus shape under coding_practice/ (Phase 4 open question; see roadmap_addenda.md).` After T01 the §5 row is closed (`resolved: dynamic … No Phase 4 prompt files needed`). §6 should match.

**Action.** Edit `architecture.md:478` to `Question prompt corpus shape under coding_practice/ — closed 2026-05-01 (M4 T01): question generation is dynamic, no corpus shape exists. See §5 row 6.` Trivial sweep; bundle with M1 (M4 README WorkflowSpec migration) if the user takes that path.

**Cycle 2 verification (2026-05-01).** architecture.md:478 now reads: `Question prompt corpus shape under \`coding_practice/\` (**resolved 2026-05-01**: dynamic — \`section_text\` flows in from the browser; \`coding_practice/\` is the user's coding-exercise workspace, unchanged. See architecture.md §5 row 6.)`. ✅ §6 now matches §5; the open-question framing is removed and a back-reference points readers to the resolution row. Phrasing differs slightly from the cycle-1 suggested text (the Builder kept the original parenthetical structure rather than rewriting as a "closed:" prefix) — semantically equivalent and arguably more readable in context.

### L2 — Builder report's "deviation #5" CHANGELOG dep-audit note

**Evidence.** Builder reports CHANGELOG dep-audit note differs from spec template `Dep audit: skipped — no manifest changes`. Actual CHANGELOG note (lines 95–101): `Dep audit: pyproject.toml is newly created — it is a dep-manifest surface per CLAUDE.md, so the dep-audit gate fires at commit time, not at task-close time … T01 ships zero install-time dependencies, so the dependency-auditor subagent will have nothing to flag at commit; noted here as a forward reminder for the user-initiated commit.`

**Verdict.** The deviation is **correct** and the spec template is **wrong** (the spec template says `Dep audit: skipped — no manifest changes`, but `pyproject.toml` is itself a new manifest, so "no manifest changes" is factually false). The Builder's expanded note matches CLAUDE.md's dep-audit non-negotiable: the gate fires at commit time, not at task-close time, and the Builder was right to defer + flag. No action needed beyond noting the spec-template error here so future Builders don't regress to the wrong template wording.

**Action.** None. (Optionally, a future template-cleanup task could add a "if the task introduces a new manifest, write the dep-audit note as 'pending — fires at commit time, no install-time deps declared'" guidance to CLAUDE.md.)

### L3 — Cycle-2 `.gitignore` Python block adds a broader-than-strictly-required `build/` global pattern (NEW 2026-05-01)

**Evidence.** `.gitignore:57–62` adds three patterns under the Python block: `*.egg-info/`, `build/`, `uv.lock`. The cycle-1 H1 finding asked specifically for `cs300.egg-info/` and `uv.lock`. The Builder broadened to `*.egg-info/` (good — covers any future Python sub-package) and added `build/` (a generic pattern matching every directory named `build/` anywhere in the tree).

`build/` is the canonical setuptools sdist/wheel build directory — appropriate to ignore in a Python block. But:

- `coding_practice/build/` is the CMake output directory under the coding-exercise workspace; it exists on disk but is **not tracked** in git (verified `git ls-files | grep build` returns no rows) and is already explicitly gitignored at `.gitignore:113` (`coding_practice/build/`). The new global `build/` ignore is functionally redundant with the existing explicit rule.
- The pattern would also catch a future `chapters/ch_N/build/`, `scripts/build/`, etc., if any were ever introduced. Today none exist; future tracked directories named `build/` would need an explicit `!path/to/build/` negation to override.

**Verdict.** Functionally harmless today (no tracked file is masked). Slightly over-broad relative to what cycle 1 asked for. Marking LOW for the record so a future audit doesn't re-litigate the choice; not blocking.

**Action.** None required. If the user later introduces a tracked directory named `build/` (e.g., a build-output checked into the repo), drop the global `build/` ignore from the Python block and replace with the canonical pip wheel-builder paths (`cs300/build/` or `dist/`), or rely on the explicit `coding_practice/build/` plus per-package overrides. For now, leave it.

## Additions beyond spec — audited and justified

The Builder's report names 5 deviations. Each audited:

1. **§2 `ValidatorNode` → `ValidateStep` one-word edit (`architecture.md:302`).** ✅ Justified. §2's schema-per-type paragraph cites the workflow-side validator by class name; leaving it at `ValidatorNode` while §3.1 ships `ValidateStep` would have created exactly the cross-section drift M1 above flags. This was the right inline coherence fix. The same logic should have been applied to the M4 README "Done when" line 65 (M1).
2. **README.md status callout refresh + dead-link removal.** ✅ Justified. The pre-T01 status callout still said "M4 re-blocked 2026-04-25" with a live link to `aiw_workflow_convention_hooks_issue.md`. Deleting the issue file without updating the README would have left a broken link in the user-facing entry-point doc. The refresh is mandatory cleanup; arguably this should have been in the spec's Deliverable F as `R — README.md status callout sweep`.
3. **`pyproject.toml` `[build-system]` block beyond spec.** ⚠️ Direct cause of H1. The spec shows `[project]` only (lines 80–86 of `T01_arch_and_package.md`) with the explicit note that the file is for "tooling + type-checker discoverability only" and `pip install -e .` is not required. Adding `[build-system] requires = ["setuptools>=68"] build-backend = "setuptools.build_meta"` plus `[tool.setuptools.packages.find] include = ["cs300*"]` makes the package **buildable / installable**, which is a different intent. Some tooling (e.g., uv sync against a workspace) wants `[build-system]` to be present even for non-installed packages, so this isn't *wrong* per se, but the addition triggered the editable install + lockfile generation that produced H1's untracked artefacts. **Recommendation:** keep the `[build-system]` block (it is conventional and harmless) but fix H1's containment (gitignore + delete). Do NOT remove `[build-system]` — that creates a different drift where some tools (notably `uv pip install -e`) start emitting deprecation warnings.
4. **Milestones index M4 row updated.** ✅ Justified. Status-surface (extra) check above confirms the change (`design_docs/milestones/README.md:22`). The previous row text "🚧 re-blocked 2026-04-25 (M16 follow-up — `aiw_workflow_convention_hooks_issue.md`)" linked to the now-deleted file; the refresh both flips the status to in-progress and drops the dead link. Mandatory cleanup, same rationale as deviation #2.
5. **CHANGELOG dep-audit note.** ✅ Correct (see L2).

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| AC-8 smoke | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 python3 -c "import cs300.workflows; print('ok')"` | stdout `ok`; exit `0`. Python 3.12.3 (matches `requires-python = ">=3.12"`). |
| File-existence: `pyproject.toml` | `ls -la /home/papa-jochy/Documents/School/cs-300/pyproject.toml` | present (1150 B) |
| File-existence: `cs300/__init__.py` | `ls -la /home/papa-jochy/Documents/School/cs-300/cs300/__init__.py` | present (427 B) |
| File-existence: `cs300/workflows/__init__.py` | `ls -la /home/papa-jochy/Documents/School/cs-300/cs300/workflows/__init__.py` | present (1092 B) |
| File-deletion: `aiw_workflow_convention_hooks_issue.md` | `ls -la /home/papa-jochy/Documents/School/cs-300/aiw_workflow_convention_hooks_issue.md` | "No such file or directory"; `git status` shows `D` |
| Architecture.md Tier-4 grep | `grep -n "TieredNode\|ValidatorNode\|RetryingEdge\|register(\"name" architecture.md` | zero hits |
| Architecture.md WorkflowSpec grep | `grep -n "section_text\|RunWorkflowOutput\|register_workflow\|WorkflowSpec\|LLMStep\|ValidateStep" architecture.md` | hits at lines 302, 336, 338, 340, 342, 344 (covers AC-1, AC-2, AC-3 surfaces) |
| Architecture.md path realignment | `grep -n "\\./workflows/\|cs300/workflows/" architecture.md` | only `cs300/workflows/` at lines 25, 40, 336, 344; zero `./workflows/` hits |
| M4 README Tier-4 residue | `grep -n "TieredNode\|ValidatorNode\|RetryingEdge" m4_phase4_question_gen/README.md` | hits at 65, 96, 97, 119 — see M1 |
| Status surfaces | (manual cross-check, table above) | 4-of-4 agree (no `tasks/README.md` in cs-300; n/a) |
| Working-tree cleanliness (cycle 1) | `git status --porcelain` | `?? cs300.egg-info/`, `?? uv.lock` — see H1 |
| **Cycle 2 re-verifications (2026-05-01)** | | |
| AC-8 re-smoke | `PYTHONPATH=/home/papa-jochy/Documents/School/cs-300 python3 -c "import cs300.workflows; print('ok')"` | stdout `ok`; exit `0`. ✅ |
| `cs300.egg-info/` deletion | `ls /home/papa-jochy/Documents/School/cs-300/cs300.egg-info/` | `No such file or directory`; exit 2. ✅ Deleted. |
| `uv.lock` deletion | `ls /home/papa-jochy/Documents/School/cs-300/uv.lock` | `No such file or directory`; exit 2. ✅ Deleted. |
| Working-tree containment | `git status --porcelain \| grep -E 'egg-info\|uv\.lock'` | empty; exit 1. ✅ Both artefacts gone from `?? untracked` list. |
| `.gitignore` patterns | Read `.gitignore:57–62` | `*.egg-info/`, `build/`, `uv.lock` present in Python block with M4 T01 cycle 2 attribution. ✅ |
| M4 README line 65 ValidatorNode → ValidateStep | Read `m4_phase4_question_gen/README.md:64–66` | Line 65 now reads `once inside the cs-300 workflow's \`ValidateStep\` (KDR-004 in`. ✅ |
| M4 README freshness note | Read `m4_phase4_question_gen/README.md:91–99` | Disclaimer paragraph present above the numbered "Task descriptions" list. ✅ |
| architecture.md §6 line 478 closure | Read `architecture.md:478` | Now reads `(\*\*resolved 2026-05-01\*\*: dynamic — \`section_text\` flows in from the browser …)`. ✅ |
| Working-tree (full porcelain) | `git status --porcelain` | `M .gitignore`, `M CHANGELOG.md`, `M README.md`, `D aiw_workflow_convention_hooks_issue.md`, `M design_docs/architecture.md`, `M design_docs/milestones/README.md`, `M design_docs/milestones/m4_phase4_question_gen/README.md`, `M design_docs/roadmap_addenda.md`, `?? cs300/`, `?? design_docs/milestones/m4_phase4_question_gen/issues/T01_issue.md`, `?? design_docs/milestones/m4_phase4_question_gen/tasks/`, `?? pyproject.toml`. ✅ Clean of build artefacts; only T01 deliverables + audit issue file present. |
| CHANGELOG cycle-2 dep-audit note | Read `CHANGELOG.md:101–112` | Cycle-2 bullet says `Dep audit: skipped — no manifest changes (only \`.gitignore\` was touched on the build side).` ✅ Correct — `.gitignore` is not in CLAUDE.md's manifest list. |

## Issue log — cross-task follow-up

| ID | Severity | Owner / next touch point | Status |
| -- | -------- | ------------------------ | ------ |
| M4-T01-ISS-01 | HIGH | T01 (this audit cycle — fix before commit) | **RESOLVED 2026-05-01 (cycle 2)** — `.gitignore` Python block now carries `*.egg-info/`, `build/`, `uv.lock`; `cs300.egg-info/` + `uv.lock` deleted from disk; `git status --porcelain` shows zero stray build artefacts. |
| M4-T01-ISS-02 | MEDIUM | T01 (preferred) or T02 carry-over (acceptable) | **RESOLVED 2026-05-01 (cycle 2)** — M4 README line 65 flipped `ValidatorNode` → `ValidateStep`; lines 91–99 gain a freshness note labelling the numbered "Task descriptions" list as v0.2.0 historical context vs the v0.4.0 `tasks/` specs being the live scope. Builder picked the lighter touch (line 65 + disclaimer) over the full per-line rewrite — defensible: live "Done when" surface fixed, historical-notes section self-labelled. |
| M4-T01-ISS-03 | LOW | Bundle with M4-T01-ISS-02 if option 1 taken; else T02 carry-over | **RESOLVED 2026-05-01 (cycle 2)** — architecture.md:478 now reads `(\*\*resolved 2026-05-01\*\*: dynamic …)` with a back-reference to §5 row 6. §6 now matches §5. |
| M4-T01-ISS-04 | LOW (informational) | n/a | NOTED — CHANGELOG dep-audit note correctly deviated from spec template; spec template was wrong |
| M4-T01-ISS-05 | LOW | Future audit if a tracked `build/` directory is ever introduced | NEW 2026-05-01 (cycle 2) — `.gitignore`'s new global `build/` pattern is broader than the cycle-1 H1 finding strictly required. Functionally harmless today (no tracked file under any `build/` anywhere; `coding_practice/build/` already explicitly ignored). Flagged for future-audit awareness only. |

## Propagation status

No forward-deferrals to a future task at audit close. M1 (M4-T01-ISS-02) and L1 (M4-T01-ISS-03) have an "or defer to T02 carry-over" path; if the user takes that path, the Auditor must:

1. Flip ISS-02 + ISS-03 to `DEFERRED` here with owner = M4 T02.
2. Append a `## Carry-over from prior audits` section to `tasks/T02_question_gen_workflow.md` with the two issue IDs, severities, "what to implement" lines, and back-link to this issue file.

Until that decision lands, both stay OPEN against T01.

**Cycle 2 update 2026-05-01.** Builder took the inline-fix path on both ISS-02 and ISS-03 (and also addressed ISS-01) — no T02 carry-over needed. `tasks/T02_question_gen_workflow.md` is unchanged; no `## Carry-over from prior audits` section was appended (correctly — nothing to propagate). The new ISS-05 (broader `build/` ignore) is informational-only and does not need a target task. T01 issue log fully closed at cycle 2 close.

## Cycle 2 closure (2026-05-01)

All three open findings from cycle 1 (H1, M1, L1) verified RESOLVED. AC-8 re-smoke passes (stdout `ok`, exit 0). One new LOW finding (ISS-05, broader-than-required `build/` ignore) noted but non-blocking. Working tree contains only T01 deliverables + this audit file; no stray build artefacts. CHANGELOG cycle-2 bullet at lines 101–112 records the four cycle-2 changes (`.gitignore`, M4 README, architecture.md, CHANGELOG itself) with a correct `Dep audit: skipped — no manifest changes` note. **Status: ✅ PASS.** T01 is ready for commit; the dep-audit gate will fire at commit time per CHANGELOG line 93–99 (forward reminder is correct — `pyproject.toml` is a new manifest, but ships zero install-time deps so the auditor will have nothing to flag).

## Security review

**Reviewer:** security gate — 2026-05-01
**Scope:** T01 changeset — `pyproject.toml`, `cs300/__init__.py`, `cs300/workflows/__init__.py`, `.gitignore` additions, `aiw_workflow_convention_hooks_issue.md` deletion. Doc-only files excluded (no executable code in `design_docs/`, `README.md`, `CHANGELOG.md`).
**Threat model:** cs-300 local-only single-user (no public backend, no auth surface, no multi-user, self-RCE not a threat).

**Q1 — Does `pyproject.toml` declare anything that runs at install time?**
`[project]` declares `name`, `version`, `requires-python`, `description`. No `[project.scripts]`, no `[project.entry-points]`, no post-install hooks, no runtime `dependencies` key. `[build-system]` requires `setuptools>=68` at build time only — not resolved at `PYTHONPATH`-based import time or by `uvx`. **Clean.**

**Q2 — Do the `__init__.py` files import anything at module load time?**
`cs300/__init__.py` (9 lines): module-level docstring only. No `import` statements. `cs300/workflows/__init__.py` (24 lines): module-level docstring only. No `import` statements. Future planned modules listed in text only — not evaluated as import targets. **Clean.**

**Q3 — Does the `.gitignore` `build/` pattern mask sensitive files already on disk?**
`.gitignore` patterns only affect untracked files. `git ls-files | grep build` returns zero rows — no tracked file under any `build/` path. Pattern is additive-only. **Clean.**

**Q4 — Does deletion of `aiw_workflow_convention_hooks_issue.md` leave dangling references in security-relevant surfaces?**
The file was a developer-facing issue log, never referenced by any API route, script, or filter. Dead links in `README.md` were removed by the builder. **Clean.**

### Advisory

`[build-system] requires = ["setuptools>=68"]` is an unpinned lower-bound. This dep resolves only if `pip install .` or `python -m build` is explicitly invoked — neither is required or documented as a workflow step. If a future task introduces a CI job that builds a wheel, pin setuptools to an exact version and run the dep-audit gate at that point.

| Severity | Count | Items |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Advisory | 1 | `setuptools>=68` unpinned; no action until a build-wheel CI job is introduced |

**Verdict: SHIP.** T01 changeset introduces no executable install-time surface, no module-load-time imports, no masking of tracked files, and no dangling references in API or script surfaces.

## Dependency audit

`pyproject.toml` is a new dep manifest (CLAUDE.md gate). Audited 2026-05-01.

`[project]` declares zero runtime dependencies. `[build-system] requires = ["setuptools>=68"]` is a build-time-only dep; it is never resolved at `PYTHONPATH`-based import time or by `uvx`. No install-time execution surface, no transitive chain to audit.

**Verdict: SHIP.** No manifest changes with runtime dep surface; no CVE exposure. Note: if a future task adds runtime deps to `pyproject.toml`, the full dep-audit gate fires at that task's commit.
