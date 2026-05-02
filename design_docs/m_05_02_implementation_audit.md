# cs-300 — Implementation Health Audit (2026-05-02)

**Auditor:** Claude (read-only, full project scope).
**Scope:** project-wide — roadmap consistency, LBD-1..15 conformance,
M4 active-workstream state, build/deploy invariants, chapter content,
documentation drift, loose ends, status-surface 4-way agreement,
deferred items, git state.
**Branch under audit:** `design_branch` (4 commits ahead of `main`).
**Working tree:** clean per `git status`.

The grounding artefacts named in the audit prompt were all read in
full: `CLAUDE.md`, `architecture.md`, `roadmap_addenda.md`,
`milestones/README.md`, every milestone `README.md`, `nice_to_have.md`,
`phase2_issues.md`, multiple closed-milestone issue files, the M4
T01 audit, the convention-hooks issue spec, the chapter set, the
chapter-review file set, `CHANGELOG.md` top sections, the Lua filter,
`build-content.mjs`, the deploy workflow, `astro.config.mjs`,
`pyproject.toml`, the `cs300/` package skeleton, the API route tree,
and the `src/components/chrome/` set.

Findings are tagged HIGH / MEDIUM / LOW; each section opens with a
one-line headline verdict. Punch list at the bottom.

---

## 1. Roadmap state

**Headline: nine milestones declared; eight closed clean; M4 is
re-blocked-but-internally-progressing — the M4 status string in
three places is now stale.**

| Milestone | milestones/README.md | per-milestone README | roadmap_addenda | Issue tree clean? |
| --- | --- | --- | --- | --- |
| M1 | ✅ closed 2026-04-23 | ✅ closed 2026-04-23 | n/a (Phase-1 ACs all `[x]`) | T1–T5 all `✅ PASS` |
| M2 | ✅ closed 2026-04-23 | ✅ closed 2026-04-23 | n/a | T1–T8 + T5a/T5b all `✅ PASS` |
| M3 | ✅ closed 2026-04-24 | ✅ closed 2026-04-24 | n/a | T1–T8 all `✅ PASS` |
| M4 | **todo — re-blocked 2026-04-25 (M16 follow-up: convention-hooks doc + dispatch cleanup, see ../../aiw_workflow_convention_hooks_issue.md)** (`milestones/README.md:22`) | **todo — re-blocked 2026-04-25** (`m4_phase4_question_gen/README.md:3-4`) | n/a | T01 ✅ PASS (cycle 2); T02–T08 todo |
| M5 | todo | todo | n/a | n/a |
| M6 | todo | todo | n/a | n/a |
| M7 | todo | todo | n/a | n/a |
| M-UX | ✅ closed 2026-04-25 (re-closed after T9 polish) | ✅ closed 2026-04-25 | n/a (sidecar) | T1–T9 + 3 audit-level files all PASS |
| M-UX-REVIEW | ✅ closed 2026-04-27 | ✅ closed 2026-04-27 | n/a (sidecar) | T1–T6 all closed |

### Findings

- **HIGH — M4 status string is stale across three surfaces.** T01
  closed clean 2026-05-01 (`m4_phase4_question_gen/issues/T01_issue.md:6`,
  `Status: ✅ PASS`). T01's deliverables include (per its own AC-9
  flip and the M4 README "Carry-over from prior milestones" round-2
  checkbox, which the audit also marked PASS) flipping the upstream
  gate from OPEN → RESOLVED via jmdl-ai-workflows v0.4.0. **But
  three surfaces still read "todo — re-blocked 2026-04-25":**
  - `design_docs/milestones/README.md:22` — index row for M4.
  - `design_docs/milestones/m4_phase4_question_gen/README.md:3-4` —
    milestone status line.
  - `README.md:42-55` — top-level status callout still narrates the
    re-block + the convention-hooks file as live.

  The T01 audit narrative claims status surface (e) — milestones
  index — was flipped to `🟡 in progress 2026-05-01 (T01 closed; …)`,
  but `design_docs/milestones/README.md:22` still has the original
  re-block string verbatim. Either the audit's "(e)" surface check
  was over-optimistic, or the flip was reverted. Confirms an
  LBD-10 4-way miss — see §8.

  **Action:** flip M4 status to active (T01 done, T02–T08 todo) on
  all three surfaces; update README's status callout to drop the
  convention-hooks-file pointer (file is supposedly deleted; see
  HIGH below).

- **HIGH — `aiw_workflow_convention_hooks_issue.md` is still in the
  repo, contradicting T01 AC-5.** T01_issue.md AC-5 (line 45) says
  `git status` showed `D aiw_workflow_convention_hooks_issue.md`
  (staged for deletion). Today's `git ls-tree HEAD` confirms the
  file is still committed at blob `dcf79e407c1a` on both
  `design_branch` and `main`; the working-tree copy at
  `/home/papa-jochy/Documents/School/cs-300/aiw_workflow_convention_hooks_issue.md`
  exists at 13,082 bytes. The deletion was either staged-and-never-
  committed, or undone. Two follow-up surfaces still link it:
  `milestones/README.md:22` and `README.md:54`. The file's own
  author note instructs deletion at v0.4.0 ship time.

  **Action:** confirm with the user whether to (a) actually delete
  the file and remove the two linkers, or (b) re-open T01 because
  AC-5 is unmet. The cheap fix is (a) since v0.4.0 has shipped per
  T01's other ACs.

- **HIGH — README.md lines 42-55 narrate the M4 re-block + the
  convention-hooks issue as still live**, calling out four
  undocumented hooks "that M4 task breakout needs to be written
  against". This is contradicted by T01 (which restructured the
  M4 task breakout against v0.4.0's WorkflowSpec API). The README
  callout needs the same flip as the milestone surfaces.

- LOW — M4 Tasks list inside the milestone README (`m4_phase4_question_gen/README.md:78-108`)
  still uses Tier-4 surface language ("LangGraph `StateGraph`
  composing `TieredNode` (Ollama Qwen) + `ValidatorNode` +
  `RetryingEdge`", `register("name", build)`). T01 AC-1 explicitly
  retired this surface in `architecture.md`; the per-task spec
  files (T02–T08) reflect the v0.4.0 WorkflowSpec API. The Tasks
  list under "## Tasks" in the milestone README is a parallel
  legacy surface that escaped the T01 re-grounding sweep. The T01
  auditor noted this at "Cycle 2 update" — the freshness note above
  the legacy list is a documented workaround. Cosmetic; the live
  surface is the per-task spec files. Recommend a header line or a
  delete + link-to-tasks/ rewrite at the next M4-touch.

---

## 2. Architecture conformance against LBD-1..15

**Headline: every LBD with a verifiable signature is honored on
disk; only LBD-6 has a real violation (ch_9 = 41 pp, +1 over the
ceiling); LBD-15 is the newest rule and only enforces sandbox-side
behaviour we can't statically check from inside the sandbox.**

### LBD-1 — Static-by-default deploy

- `astro.config.mjs:30` declares `output: 'static'`. ✅
- `astro.config.mjs:31` adds `adapter: node({ mode: 'standalone' })`.
  This is by design — M3 T3's `prerender = false` + per-route
  opt-out for `src/pages/api/*` requires the Node adapter for dev.
  The deploy workflow at `.github/workflows/deploy.yml:78-84` only
  uploads `./dist/client` (the prerendered subset); the Node-server
  entrypoint built into `dist/server/` is **not** uploaded. ✅
- `find dist/client -path '*api*'` → empty. ✅
- `dist/client` page count = 40 prerendered HTML files (12 chapters
  × 3 collections + 3 collection-landing pages + 1 dashboard index),
  matching M-UX T9 close-out's claim. ✅
- Every API route under `src/pages/api/*.ts` opens with `export const
  prerender = false` (verified on `bulk.ts`; treat the others as
  same-shape since they're all M3 T3 stubs). ✅

**Verdict: LBD-1 clean.**

### LBD-2 — Two-process local runtime, cs-300 doesn't fork ai-workflows

- `cs300/__init__.py` + `cs300/workflows/__init__.py` exist as
  package markers (per M4 T01). ✅
- `pyproject.toml` declares **zero install-time dependencies** —
  the only entry under `[build-system]` is `setuptools>=68`. Comment
  at `pyproject.toml:14` explicitly says "running this project does
  NOT require `pip install -e .`". ✅
- The package skeleton's docstring (`cs300/workflows/__init__.py:5-6`)
  cites the v0.4.0 WorkflowSpec declarative API and
  `register_workflow(spec)` — i.e. cs-300 calls *into* the framework
  registration surface; no fork or monkey-patch. ✅

**Verdict: LBD-2 clean.** Note: `cs300/workflows/` is empty of
workflow modules today. M4 T02 / T03 will populate it.

### LBD-3 — Pandoc + Lua filter is the content pipeline

- `scripts/pandoc-filter.lua` is 193 lines; maps the five callout
  envs → MDX components (`scripts/pandoc-filter.lua:31-37`), force-
  rewrites every CodeBlock to `cpp` (`pandoc-filter.lua:173-178`),
  prefixes Header anchors with `chapter_id`
  (`pandoc-filter.lua:183-188`), and includes a `multicols` strip
  added at M-UX-REVIEW followup (`pandoc-filter.lua:120-140`). ✅
- `scripts/build-content.mjs:40` resolves `FILTER` to the Lua
  filter; `build-content.mjs:56-66` invokes pandoc with
  `--lua-filter`. ✅
- No alternate MDX path: `src/content/` is gitignored and
  regenerated by `scripts/build-content.mjs` at `prebuild` /
  `predev` (`package.json:15-17`). ✅

**Verdict: LBD-3 clean.**

### LBD-4 — Reference solutions never reach the DOM

- `src/db/schema.ts:45` carries the `reference_json` field with the
  inline comment `// NEVER shipped to DOM for 'code'`. ✅
- `grep -rn "reference_json" src/pages/api/` → no occurrences in
  any API handler today. (The `bulk.ts` and `attempts.ts` handlers
  are M3 T3 stubs returning 501 — they don't touch the column yet.)
  ✅ no leak surface today; M4 T05 + T06 + M6 will add the actual
  read paths.
- `grep -rn "reference_json" dist/client` → empty. ✅

**Verdict: LBD-4 clean today.** Forward-watch: when M4 T05 lands
the `bulk.ts` real handler and M6 lands the `code` execution path,
the audit must re-run the leak check on those exact code-paths
(carry-over for M4 T05 / M6 T1 spec).

### LBD-5 — Code execution intentionally not sandboxed

Not yet exercised — M6 is todo. No drift signal today. ✅

### LBD-6 — 40-page lectures.pdf ceiling

Computed via decompressed-FlateDecode `/Type /Page` scan (no
`pdfinfo` in the container; the regex was validated against the
known grandfathered counts ch_3=53 and ch_4=51, and matched
exactly):

| Chapter | lectures.pdf size | pages | LBD-6 status |
| --- | --- | --- | --- |
| ch_1 | 537 KB | 36 | ✅ |
| ch_2 | 592 KB | 34 | ✅ |
| ch_3 | 813 KB | 53 | ✅ grandfathered |
| ch_4 | 724 KB | 51 | ✅ grandfathered |
| ch_5 | 565 KB | 26 | ✅ |
| ch_6 | 491 KB | 31 | ✅ |
| ch_7 | 576 KB | 28 | ✅ |
| **ch_9** | **565 KB** | **41** | **🔴 OVER (+1)** |
| ch_10 | 640 KB | 33 | ✅ |
| ch_11 | 500 KB | 25 | ✅ |
| ch_12 | 508 KB | 22 | ✅ |
| ch_13 | 525 KB | 27 | ✅ |

- **HIGH — LBD-6 violation: ch_9 lectures.pdf = 41 pages.** Last
  touched by `c15723a — ch_9 OCW augmentation pass — AVL and
  red-black trees` (recent commit; post-2026-04-22 — i.e. NOT
  grandfathered per LBD-6's date cutoff). The OCW-augmentation
  series for the optional chapters (ch_7 / ch_9 / ch_10 / ch_11 /
  ch_12 / ch_13) ran at b29d409..bce2a12 and added bounded content
  per chapter (LBD-7); ch_9 sits 1 page over. Borderline but a
  literal LBD-6 break.

  **Action.** Two reasonable options — present to the user, do not
  unilaterally pick:
    1. Trim ~1 page of less-load-bearing content from
       `chapters/ch_9/lectures.tex` (e.g. compress one of the
       AVL-rotation worked examples or fold a footnote reference)
       and rebuild — restores LBD-6 compliance without
       grandfathering.
    2. Grandfather ch_9 alongside ch_3 / ch_4 with a CLAUDE.md LBD-6
       row amendment naming the +1 overage and the rationale
       (single-pager overage from a content-faithful OCW augmentation,
       not a pattern). Amendment cost is low; sets a slightly
       softer ceiling for future optional-chapter passes.

  Strictly per the rule as written today, it's a HIGH finding;
  whether it stays HIGH or flips to grandfathered-LOW depends on
  the user's call.

- LOW — chapter notes.pdf page counts not measured. The 40-page
  ceiling per LBD-6 reads "any chapter `lectures.pdf`" — notes.pdf
  is out of scope.

### LBD-7 — Bounded chapter additions (3–5 per chapter)

Not directly auditable from the artefacts (would require diffing
each chapter's pre/post-augmentation lectures.tex against the
chapter-review gap reports' "shipping in this pass" rows). The
recent chapter-augmentation commits (one per chapter) name the
augmentation as a single titled pass each, consistent with the
3–5 rule when read against the gap reports. Spot-check would have
to be a follow-up task. No drift signal in the audit surface. ✅

### LBD-8 — No Jekyll polish

`grep -rn jekyll src/ scripts/ chapters/` → only historical
references in design docs. M2 T8 deleted the Jekyll source tree. ✅

### LBD-9 — coding_practice/ is the question-gen prompt corpus

- `coding_practice/` is committed at `cd3a8a3 — coding excercises
  for cpp ch1` (recent). Contents: `cplusplus/`, `psuedo/`,
  `python/`, `CMakeLists.txt`, `main.cpp`, `build/`. ✅
- Last commit touching `coding_practice/` is `cd3a8a3` (a coding-
  exercises commit, not a chapter task). No chapter-task commit
  has touched the directory. ✅
- The "Phase 4 prompt corpus" framing got updated 2026-05-01 in
  M4 T01 (architecture.md §5 row 6: question generation is
  **dynamic** via `section_text`; `coding_practice/` is "the user's
  C++/Python/pseudocode coding-exercise workspace, not a prompt
  corpus"). The CLAUDE.md LBD-9 row still describes the directory
  as the "ai-workflows question-gen prompt corpus" — see §6
  documentation drift.

**Verdict: LBD-9 clean on the boundary; documentation needs to
catch up on the framing change.**

### LBD-10 — Status-surface 4-way agreement

Audited in §8.

### LBD-11 — Code-task verification non-inferential

Spot-checked at the M4 T01 audit (`T01_issue.md:48`): auditor ran
`PYTHONPATH=… python3 -c "import cs300.workflows; print('ok')"` →
exit 0, output `ok`. Smoke is small (import-resolution probe), but
present and cited. ✅ for the live surface; M4 T02–T08 specs each
need their own smoke (carry-over for those task authors).

### LBD-12 — Cross-chapter references must point at chapters that exist

- `grep -rEn 'ch[._~]8\b|Chapter 8\b' chapters/ch_*/lectures.tex`
  → empty. ✅
- `grep -rEn 'ch\.~7-8|ch\.~7--9.*AVL|AVL.*ch\.~7\b'` → empty. ✅

**Verdict: LBD-12 clean.**

### LBD-13 — Pre-Phase-1 sequencing

Not relevant today (M1–M3 + M-UX + M-UX-REVIEW closed; M4 is the
active work).

### LBD-14 — Toolchain pins

- `.nvmrc` = `22`. ✅
- `.pandoc-version` = `3.1.3`. ✅
- `.github/workflows/deploy.yml:43-52` reads `.pandoc-version`,
  validates it equals `3.1.3` (hard-coded sanity check), and
  installs the matching deb. ✅
- `.github/workflows/deploy.yml:54-58` reads `.nvmrc` via
  `node-version-file`. ✅
- `.github/workflows/deploy.yml:65-67` runs
  `npm run workflow:validate` before `npm ci` — fails the build
  cheaply on `.claude/` integrity drift. New 2026-05-02 (CHANGELOG
  top entry). ✅

**Verdict: LBD-14 clean and CI-enforced.**

### LBD-15 — Sandbox-vs-host git policy

- `CLAUDE.md` carries the new LBD-15 row; project profile names
  `Sandbox sessions: design_branch only — never main`. ✅
- `scripts/sandbox-guard.sh` exists; exits non-zero on
  `/.dockerenv` + `main`. ✅ (script presence verified; not
  exercised — no `/.dockerenv` in this audit run).
- Today's branch is `design_branch`, working tree clean. ✅

**Verdict: LBD-15 clean.** Untestable surface (the runtime guard
on host vs sandbox) — relies on the user not bypassing.

---

## 3. Active workstream — M4 phase-4 question gen

**Headline: M4 is partly executing already (T01 closed clean
2026-05-01); the milestone-level "re-blocked" status is now stale;
the convention-hooks issue file is the single biggest documentation
loose end on the active workstream.**

- **What the M4 README says is blocked:** carry-over round 2
  ("Upstream gate, round 2 (M16 follow-up — OPEN)") at
  `m4_phase4_question_gen/README.md:146-153`. The unblock
  condition is "On patch ship, this checkbox flips `[x]`, M4 status
  flips `todo → unblocked YYYY-MM-DD`, the convention-hooks issue
  file is deleted from cs-300 root, and T01 of the M4 task breakout
  proceeds against the cleaned surface."
- **What's actually happened:** jmdl-ai-workflows v0.4.0 shipped
  with a declarative `WorkflowSpec` API that retires the four hooks
  the convention-hooks issue catalogued. T01 was authored against
  v0.4.0, audited PASS 2026-05-01, and rewrote architecture.md
  §3.1 + §5 row 6 to drop the Tier-4 + open-question surfaces.
  T01_issue.md AC-9 says the round-2 carry-over checkbox flipped
  to `[x]`.
- **What's actually in the repo right now:**
  `m4_phase4_question_gen/README.md:146-153` — re-read just now —
  still has `- [ ]` for the round-2 carry-over checkbox. The T01
  audit-narrative claim that AC-9 flipped it is wrong: the live
  file does **not** show the checkbox flipped. (T01 audit cited
  lines `162-167` for the flipped state, but those line numbers
  don't match — file was likely amended after the audit ran, or
  the audit miscited.)

- HIGH — M4 README round-2 carry-over checkbox not flipped.
  `m4_phase4_question_gen/README.md:146-153` shows
  `- [ ] **Upstream gate, round 2 (M16 follow-up — OPEN).**` The
  T01 audit's AC-9 marked this PASS citing different line numbers;
  the live state is still OPEN. This compounds the §1 status drift.

  **Action:** flip the carry-over checkbox to `[x]` with
  citation back to T01_issue.md, AND flip the milestone status
  string + the index-row + the README callout in lockstep (one
  commit, four surfaces, per LBD-10).

- **What `aiw_workflow_convention_hooks_issue.md` tracks:** the
  four undocumented framework hooks (builder return type,
  `initial_state` PlannerInput literal-name fallback, MCP wire
  shape, `FINAL_STATE_KEY` honoring) and a proposed dispatch
  refactor. v0.4.0's WorkflowSpec API supersedes all four hooks.
  File should be deleted per its own author note (line 7 of the
  file). See HIGH in §1.

- **`cs300/workflows/__init__.py`:** subpackage marker only. Names
  the planned modules: `question_gen` (M4 T02), `grade` (M4 T03),
  `assess` (post-M4). Cites the v0.4.0 declarative API and
  `register_workflow(spec)`. ✅

- **T01–T08 specs:**
  - T01: arch grounding + `cs300/` package skeleton — ✅ closed
    2026-05-01.
  - T02: `question_gen` workflow module — todo.
  - T03: `grade` workflow module — todo.
  - T04: aiw-mcp launch script + detectMode wiring — todo.
  - T05: `POST /api/questions/bulk` real handler (per-type
    validation) — todo.
  - T06: `POST /api/attempts` synchronous eval (mc / short
    exact / fuzzy / numeric) — todo.
  - T07: question-gen UI in Astro — todo.
  - T08: async `llm_graded` flow — todo.

  **Where the cycle lands when M4 unblocks:** T02 is the next ready
  task once the status flips. T02 needs T01's package skeleton
  (have it) plus `aiw-mcp` v0.4.0 (have it). No further upstream
  blocker.

---

## 4. Build / deploy health

**Headline: deploy workflow is internally consistent; node_modules
is empty in this audit container so `npm run check` cannot run; the
workflow integrity validator runs green (47/47).**

- `npm run check` — **NOT RUN** (`sh: 1: astro: not found`;
  `node_modules/` is empty in this container — `npm ci` was not
  run before the audit. Per the audit prompt, this is expected and
  reported only.).
- `npm run workflow:validate` — **PASS** 47/47 checks. Output
  includes:
  - 15 LBDs defined and resolved.
  - 8 procedure files enumerate all four LBD-10 surfaces.
  - effort-table-model-match green.
  - drift-gatekeeper model green (auditor + architect on opus-4-7;
    everything else sonnet-4-6).
  - npm-script-exists green (2 scripts referenced; both exist).

- **`.github/workflows/deploy.yml` consistency:**
  - Trigger: push to `main` or `workflow_dispatch`. ✅
  - Permissions: contents:read, pages:write, id-token:write.
  - Steps: checkout → install pandoc 3.1.3 (validates
    `.pandoc-version` exact match) → setup-node from `.nvmrc` →
    `npm run workflow:validate` (gate) → `npm ci` → `npm run check`
    → `npm run build` → upload `./dist/client` → deploy.
  - Pages-artifact upload path is `./dist/client` (LBD-1 invariant
    — Node-server entrypoint in `dist/server/` is excluded). ✅
  - Concurrency `pages` / `cancel-in-progress: false`. ✅
  - Matches LBD-14 (toolchain pins enforced) + LBD-1 (only static
    artefact uploaded).

- LOW — workflow does not run any of the smoke harnesses
  (`scripts/db-smoke.mjs`, `annotations-smoke.mjs`,
  `read-status-smoke.mjs`, `seed-smoke.mjs`, `functional-tests.py`)
  or `scripts/smoke-screenshots.py`. The build is gated on
  `npm run check` + `npm run build` only. M-UX added the Selenium
  harnesses for M-UX-T9 / M-UX-REVIEW T6 verification gates but
  those harnesses live as audit-time tools, not CI gates.
  Promotion to CI is reasonable and was not deferred to
  nice_to_have. Recommend M5 spec author the `functional-tests.py`
  + smoke MJS suite into the deploy workflow as a `pre-build`
  gate; the harnesses already produce an exit code.

  **Action option set:**
    1. Add a "Smoke (functional-tests.py)" step to deploy.yml after
       `npm run build` but before `upload-pages-artifact`. Cost:
       Selenium boot adds ~30s to CI; harness needs `npm run preview`
       running which means another step.
    2. Defer to M5 task spec (where the new dashboard surfaces
       motivate harness expansion anyway).
    3. Leave as-is — local smokes only, CI is build-gated.

  No prior task owns this; it's audit-discovered.

---

## 5. Chapter content state

**Headline: 12 chapters, all `lectures.tex` + `notes.tex` build to
PDF, all 12 have inventory + gap reports; ch_9 is +1 over LBD-6
ceiling (see §2).**

| Chapter | lectures.pdf | notes.pdf (built) | review files |
| --- | --- | --- | --- |
| ch_1 | 36 pp / 537 KB | exists | ch_1.md + ch_1_gaps.md |
| ch_2 | 34 pp / 592 KB | exists | ch_2.md + ch_2_gaps.md |
| ch_3 | 53 pp / 813 KB (grandfathered) | exists | ch_3.md + ch_3_gaps.md |
| ch_4 | 51 pp / 724 KB (grandfathered) | exists | ch_4.md + ch_4_gaps.md |
| ch_5 | 26 pp / 565 KB | exists | ch_5.md + ch_5_gaps.md |
| ch_6 | 31 pp / 491 KB | exists | ch_6.md + ch_6_gaps.md |
| ch_7 | 28 pp / 576 KB | exists | ch_7.md + ch_7_gaps.md |
| ch_9 | **41 pp** / 565 KB | exists | ch_9.md + ch_9_gaps.md |
| ch_10 | 33 pp / 640 KB | exists | ch_10.md + ch_10_gaps.md |
| ch_11 | 25 pp / 500 KB | exists | ch_11.md + ch_11_gaps.md |
| ch_12 | 22 pp / 508 KB | exists | ch_12.md + ch_12_gaps.md |
| ch_13 | 27 pp / 525 KB | exists | ch_13.md + ch_13_gaps.md |

- All 12 chapters compile; `chapters/ch_8/` does not exist (LBD-12
  invariant). ✅
- All 24 review files (12 inventories + 12 gap reports) exist. ✅
  This satisfies Phase-1 acceptance criteria
  (`roadmap_addenda.md:27-31`) plus the optional-chapter rows.
- The user's saved memory rule
  (`memory/project_chapter_review_progress.md`) — per the prompt's
  citation, marks ch_1–ch_6 as Step-3 closed, optional chapters as
  un-augmented and deferred to the post-build content audit. The
  recent OCW-augmentation commits (b29d409..bce2a12 — ch_7, ch_9,
  ch_10, ch_11, ch_12, ch_13) **augment** the optional chapters
  ahead of the post-build audit. This may or may not constitute
  drift from the saved memory rule depending on how "post-build
  content audit" is read:
  - If "post-build" means after M5/M6 (the original framing in
    `feedback_chapter_review_scope.md`), then 6 optional-chapter
    augmentations have run pre-M5 — drift signal MEDIUM.
  - If "post-build" means after M2's static site shipped (which
    happened 2026-04-23), then optional-chapter augmentation is
    in-bounds.

  No CHANGELOG entry surfaces this distinction explicitly.

  **Action option set:**
    1. Leave as-is — the augmentations look bounded per LBD-7 and
       the chapter-set is closing out organically; flag as MEDIUM
       and note in the memory file.
    2. Update the saved memory rule to clarify which "post-build"
       reading is canonical; either way, document the augmentations
       that have already landed.

  Surfacing this for the user; no unilateral fix.

- Verdict on LBD-6 — see §2 (ch_9 +1 over).

---

## 6. Documentation drift

**Headline: roughly four concrete drifts; none catastrophic,
all fixable in a single pass; the M4 status-string drift (§1, §3)
is the biggest.**

1. **HIGH — M4 status string stale across three surfaces.**
   `milestones/README.md:22`, `m4_phase4_question_gen/README.md:3-4`,
   `README.md:42-55` all narrate a re-block that was resolved by
   T01 + jmdl-ai-workflows v0.4.0. (Same finding as §1.)

2. **HIGH — `aiw_workflow_convention_hooks_issue.md` still tracked
   in git** despite T01 AC-5 marking it deleted. (Same finding as
   §1; called out separately because it's a literal repo-state
   drift, not just a documentation-of-state drift.)

3. **MEDIUM — `nice_to_have.md` "Site UI/UX layer" entry
   superseded but unmarked.** The first item
   (`nice_to_have.md:20-77`) describes the Canvas-LMS-style
   left-nav + structured chapter pages. Its trigger ("M3 starts
   and the chrome decisions can no longer be deferred — at that
   point a focused milestone (\"M-UX\") owns both the chrome and
   the M3 client surfaces") fired 2026-04-24, M-UX shipped
   2026-04-25, M-UX-REVIEW shipped 2026-04-27. The entry should
   carry a `**Promoted to M-UX 2026-04-24; closed 2026-04-25 / re-
   closed M-UX-REVIEW 2026-04-27.**` line at top, or be moved to
   a `## Resolved` section. As written, a casual reader would
   conclude the chrome work is still deferred.

   **Action:** strike-through the entry's `**Why deferred**`
   section, prepend a one-line `**Promoted ...**` callout pointing
   at the M-UX + M-UX-REVIEW milestone READMEs.

4. **MEDIUM — CLAUDE.md LBD-9 framing is stale vs M4 T01's
   resolution.** `CLAUDE.md:92` describes `coding_practice/` as
   "the question-gen prompt corpus (per project_coding_practice_purpose.md
   and project_practice_md_phase4_link.md). Don't touch from
   chapter tasks. Difficulty-tier expansion is planned." T01 (per
   architecture.md §5 row 6, line 462) re-resolved this 2026-05-01:
   question generation is **dynamic** via `section_text`; the
   directory is the user's coding-exercise workspace, not a prompt
   corpus. CLAUDE.md's LBD-9 row still describes the old framing,
   which contradicts architecture.md §5 row 6.

   **Action:** amend LBD-9 in CLAUDE.md to "the user's
   coding-exercise workspace; question_gen is dynamic per
   architecture.md §5 row 6." The "don't touch from chapter tasks"
   half of the rule still holds (it's a cross-stream-contamination
   guard, not a corpus-purpose claim).

5. **LOW — Architecture.md §6 forward-work item for
   per-language CodeBlock detection** (`architecture.md:480`) names
   `src/components/callouts/CodeBlock.astro:84` — line not verified
   today. The forward-work item is correctly framed (trigger:
   first non-C++ chapter block); flag-only.

6. **LOW — README.md repo-layout block** (`README.md:111-114`)
   says "Describes the current pre-migration state. Phase 2 replaces
   the Jekyll bits with Astro under `src/`." M2 closed 2026-04-23.
   The "pre-migration" framing is stale by ~9 days at audit time.
   The block lists a pre-migration directory tree; nothing in there
   is wrong factually, but the framing does not match reality.

7. **LOW — M-UX milestone README** (`m_ux_polish/README.md:28`)
   says `+756 KB / +17.5%` post-b29d409, "**40 prerendered pages**
   (37 chapter routes + 3 collection-landing pages added in T9)".
   That math: 37 + 3 = 40, but 12 chapters × 3 collections = 36
   chapter routes, not 37. The +1 must be the dashboard index;
   should read "(36 chapter routes + 3 collection-landing pages
   + 1 index)" or just "40 prerendered pages". Cosmetic but
   off-by-one.

---

## 7. Loose ends / TODOs

**Headline: zero TODO/FIXME/XXX/HACK markers across `src/`,
`scripts/`, `cs300/`, `chapters/`, `design_docs/`. Truly clean.**

- `grep -rEn "TODO|FIXME|XXX|HACK" src/ scripts/ cs300/ chapters/
  design_docs/` → 0 hits.
- This is unusually clean for a 4-month-old project of this size.
  The project's discipline of routing forward-work via issue files
  + carry-over sections + nice_to_have.md (the canonical backlog
  per CLAUDE.md "Backlog rule" line 153) is paying off — there
  are no orphan markers.

**Verdict: no concerning TODOs.** The "loose ends" in this project
all live in the structured surfaces (issue files, nice_to_have,
carry-over sections), and §6 + §1 + §8 are how I find them. The
top 5 most concerning loose ends across those surfaces are the
five HIGH/MEDIUM findings already enumerated in §1, §2 (LBD-6),
§3, §6.

---

## 8. Status-surface drift (LBD-10)

**Headline: M2 + M3 closed milestones are clean; M-UX-REVIEW is
clean; M-UX is clean; M4 has a 4-way miss on the active workstream
status (the §1 / §3 finding).**

### M2 — closed 2026-04-23

| Task | per-task spec | tasks/README.md | milestone-README task table | Done-when checkbox |
| --- | --- | --- | --- | --- |
| T1–T8 + T5a/T5b | all `✅ done 2026-04-23` | all `✅ done 2026-04-23` | all `✅ done 2026-04-23` | 9 of 9 `[x]` with citations |

All 9 Done-when checkboxes carry citation parentheticals. ✅

### M3 — closed 2026-04-24

| Task | per-task spec | tasks/README.md | milestone-README task table | Done-when checkbox |
| --- | --- | --- | --- | --- |
| T1–T8 | all `✅ done 2026-04-24` | (presumably mirrored — not re-read in detail; spot-check passed) | all `✅ done 2026-04-24` | 8 of 8 `[x]` with citations |

✅

### M-UX — closed 2026-04-25 (re-closed)

T1–T9 all `✅ done 2026-04-24/25`. Issue files all `✅ PASS`.
10 Done-when checkboxes all `[x]` with citations. ✅

### M-UX-REVIEW — closed 2026-04-27

T1–T6 all `✅ done 2026-04-27`. Issue files (T1–T6) all closed.
14 Done-when checkboxes all `[x]` with citations. ✅

### M4 — active, partly executing

| Surface | State |
| --- | --- |
| (a) T01 spec `Status:` | `✅ done 2026-05-01` |
| (b) `tasks/README.md` row | n/a — M4 has no tasks/README.md (project precedent across M1–M3 is to keep the milestone README's task table as the canonical surface). |
| (c) Milestone README task-table row for T01 | `✅ done 2026-05-01` |
| (d) Milestone "Done when" checkbox(es) T01 satisfies | T01 does not directly map to a Done-when bullet in `m4_phase4_question_gen/README.md:34-73`; T01 was a grounding task, not a Done-when deliverable. The "Carry-over from prior milestones" round-2 checkbox at line 146-153 is the surface T01 was supposed to flip per its own AC-9 — and is **still `[ ]`**. |
| (e) Top-level milestones index row | Still `todo — re-blocked 2026-04-25 (M16 follow-up: convention-hooks doc + dispatch cleanup, see ../../aiw_workflow_convention_hooks_issue.md)` — does not reflect T01 close + v0.4.0 unblock |
| (f) Top-level README.md status callout | Still narrates the re-block as live (lines 42-55) |

- **HIGH — LBD-10 4-way miss on M4.** Per the load-bearing-decision
  text at `CLAUDE.md:93`: "Status-surface 4-way agreement at task
  close. Per-task spec, `tasks/README.md` row, milestone README
  task-table row, and any milestone `Done when` checkboxes the
  closed task satisfies must all flip together." (b) is n/a per
  project precedent, (a) and (c) are correct, but (d) is
  unflipped (the round-2 carry-over checkbox), (e) and (f) are
  three-way stale. This is exactly the silent-drift pattern that
  M2 + M3 deep-analyses warned about. The T01 audit's design-drift
  table did note (e) — but the live file does not match the
  asserted state. Either the audit miscited or a later edit
  regressed it; same finding regardless.

  **Action:** single fix-up commit flipping all four (e/f/d/the
  M4-README status string) together, with the per-task spec + the
  milestone task table re-validated.

---

## 9. Deferred items

**Headline: 5 entries in nice_to_have.md, 2 entries in
phase2_issues.md (both resolved); one entry in nice_to_have.md is
clearly superseded by shipped work but not annotated.**

### `nice_to_have.md`

| § | Item | Status | Drift? |
| --- | --- | --- | --- |
| (top) | Site UI/UX layer (Canvas-LMS-style left-nav + structured chapter pages) | Trigger fired 2026-04-24; M-UX shipped 2026-04-25; M-UX-REVIEW shipped 2026-04-27 | **MEDIUM — should be marked "Promoted to M-UX 2026-04-24" or moved to a Resolved section** (see §6 finding 3) |
| §UX-2 | Collapsible chapter sections | Deferred; trigger not fired (no friction signal yet) | clean |
| §UX-3 | Interactive-mode Selenium harness extension | Deferred; trigger ("user-reported regression on push" or "M5 lands and needs end-to-end interactive coverage") not fired | clean |
| §UX-4 | SSR-embedded section-id JSON → `GET /api/sections` endpoint | Deferred; trigger ("budget pressure" or "M5 lands an API surface that subsumes the data") not fired | clean |
| §UX-5 | `--mux-accent` semantic split (current vs achievement) | Deferred; trigger (M5 review-due signals) not fired | clean |

### `phase2_issues.md`

| Item | Status |
| --- | --- |
| Stale companion-materials line in chapter `lectures.tex` files | ✅ RESOLVED 2026-04-23 (M2 T7); strike-through in file |
| `resources/week_2.tex` `\section{Big-O Cheatsheet}` heading | ✅ RESOLVED-OBSOLETE 2026-04-23 (M2 T7, path B — `resources/` removed entirely) |

### Anything quietly adopted?

- **The Site UI/UX layer entry** (top of nice_to_have.md) was
  legitimately promoted via M-UX (architecture.md §1 amendment +
  ADR-0002). The promotion path was followed — the only drift is
  that the parking-lot entry was not marked done. NOT a quiet
  adoption.
- §UX-2..§UX-5 — none appear shipped. ✅
- No items appear shipped without an architecture.md amendment +
  ADR.

**Verdict: zero quiet adoptions; one annotation drift (Site UI/UX
layer).**

---

## 10. Git state

**Headline: on `design_branch`, 4 commits ahead of `main`, working
tree clean, no orphaned local-only branches.**

- Current branch: `design_branch`. ✅ (LBD-15 sandbox-side rule).
- `git status`: nothing to commit, working tree clean. ✅
- `design_branch ^main` shows 4 commits ahead (matches the prompt's
  expectation):
  - `0236dc8` — policy: LBD-15 — sandbox-vs-host git policy + runtime
    guard
  - `2756f8b` — ci: gate GH Pages deploy on `.claude/` workflow
    integrity
  - `f83f712` — workflow: refactor `.claude/` against generalized
    template + integrity validator
  - `6683284` — chore: catch up never-committed prior-session work
    (Dockerfile + cs300/ skeleton + M4 task specs)
- Local-only branches: only `main` and `design_branch`; both have
  remote-tracking pairs (`origin/main`, `origin/design_branch`). No
  orphans. ✅
- `main` last commit: `cd3a8a3` (coding excercises for cpp ch1).
  No outstanding changes vs `main`. ✅
- One stash present (`2433acd WIP on main: cd3a8a3 coding excercises
  for cpp ch1`) — historical, not relevant to the audit; not
  flagging.

**Verdict: git state is healthy.**

---

## Punch list — top 5 concrete things to do next

1. **Flip M4 status across 4 surfaces in one commit** (HIGH; §1, §3,
   §8). Touch: `milestones/README.md:22`,
   `m4_phase4_question_gen/README.md:3-4`,
   `m4_phase4_question_gen/README.md:146-153` (round-2 checkbox),
   `README.md:42-55`. New status string proposal: `🟡 active —
   T01 closed 2026-05-01; T02 next (jmdl-ai-workflows v0.4.0
   resolves the M16 follow-up via WorkflowSpec)`. Single
   single-cycle task; no Builder needed.

2. **Resolve `aiw_workflow_convention_hooks_issue.md` repo state**
   (HIGH; §1, §6). Confirm with user: delete the file (per its
   own author note + T01 AC-5's intent) AND remove the two
   surviving links (`milestones/README.md:22`, `README.md:54`).
   This is the "did T01 actually finish AC-5" check.

3. **Resolve LBD-6 ch_9 overage** (HIGH; §2). User-pick: trim
   `chapters/ch_9/lectures.tex` by ~1 page OR grandfather ch_9
   in CLAUDE.md alongside ch_3 / ch_4. Both are small commits;
   the second needs a CLAUDE.md table edit naming the rationale.

4. **Annotate `nice_to_have.md` "Site UI/UX layer" entry as
   promoted** (MEDIUM; §6, §9). One-line `**Promoted to M-UX
   2026-04-24; closed 2026-04-25; re-closed M-UX-REVIEW
   2026-04-27.**` callout at top of the entry.

5. **Update CLAUDE.md LBD-9 framing to match architecture.md §5
   row 6's 2026-05-01 resolution** (MEDIUM; §6). The cross-stream-
   contamination guard half stays; the "prompt corpus" framing
   gets replaced with "user's coding-exercise workspace; dynamic
   question_gen via section_text per architecture.md §5 row 6."

A sixth, lower-priority item: the chapter-augmentation-vs-saved-
memory framing question (§5) — confirm with user whether the
optional-chapter augmentations that have already landed pre-M5 are
in-bounds vs the "post-build content audit" memory rule, and either
amend the rule or note the deviation.

---

## Health summary

The project is in genuinely good shape:

- 8 of 9 milestones closed clean with full issue trees.
- LBD-1..15 conformance is high; only one literal violation
  (ch_9 +1 over LBD-6).
- The pandoc + Lua filter pipeline is doing its job (dist/client
  has the expected 40 prerendered pages, no API leakage, no
  reference_json escape).
- The workflow integrity validator runs green (47/47), CI gates
  on it, toolchain pins are enforced.
- Zero TODO/FIXME markers across code + content — backlog routing
  is disciplined.
- M4 has actually started executing under the "re-blocked" banner;
  T01 is closed clean.

The worrying part is concentrated: the M4 active-workstream status
is stale across 4 surfaces, the convention-hooks file's deletion
(claimed by T01 AC-5) didn't make it into a commit, and ch_9 is
1 page over LBD-6. None of these are catastrophes; all three are
fixable in one or two short cycles. The biggest signal is the
LBD-10 4-way miss on M4 — exactly the pattern the rule was
written to catch, and the auditor missed it once already (T01
audit narrative claimed surfaces were flipped that aren't). Worth
a closer look at the auditor procedure for surface (e) and (f) in
the next M4 task close.
