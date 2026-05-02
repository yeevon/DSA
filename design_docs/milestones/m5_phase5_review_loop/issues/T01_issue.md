# T01 — `ts-fsrs` integration into POST /api/attempts — Audit Issues

**Source task:** [../tasks/T01_fsrs_integration.md](../tasks/T01_fsrs_integration.md)
**Audited on:** 2026-05-02
**Audit scope:** Source review of `src/lib/fsrs.ts` (new), `src/pages/api/attempts.ts` (mc/short FSRS update), `src/pages/api/attempts/[id]/outcome.ts` (llm_graded FSRS update), `src/pages/api/questions/bulk.ts` (default-state seeding), `scripts/fsrs-smoke.mjs` (new); `package.json` + `package-lock.json` dep state; CHANGELOG entry; status-surface 3-way (per-task spec / M5 README task table N/A — none in this milestone / M5 README "Done when" checkboxes); architecture.md §3.5 alignment; LBD-1..15 drift sweep; LBD-15 sandbox-vs-host gate accounting; `runs/m05_t01/` artifacts.
**Status:** ✅ PASS — host-only ACs (AC-1 lockfile materialisation, AC-4 smoke run, AC-7 type check, AC-8 build) recorded as carry-over per LBD-15.

## Design-drift check

- **LBD-1 (static-by-default deploy).** New dep `ts-fsrs` is consumed only by `src/lib/fsrs.ts`, which is imported into `src/pages/api/{attempts.ts, attempts/[id]/outcome.ts, questions/bulk.ts}` — all `prerender = false` API routes. Routes do not appear in `dist/`. `fsrs.ts` itself is not imported by any browser-rendered Astro component or `src/pages/*.astro` static page (verified by grep — only the three API routes import it). architecture.md §3.5 explicitly resolves the placement decision in favour of server-side. ✅
- **LBD-2 (two-process boundary).** FSRS computation lives in the state-service process (Node/Astro API routes hitting Drizzle/SQLite). No call to `aiw-mcp` from the FSRS path. The async llm_graded path keeps grade-resolution at `aiw-mcp` and FSRS-update at the state service — same seam as M4 T08. ✅
- **LBD-3 (Lua filter / content pipeline).** N/A — no `.tex`, no Lua filter, no chapter content touched.
- **LBD-4 (reference solutions never reach DOM).** PATCH `/api/attempts/[id]/outcome` 200 body unchanged at `{ id, outcome }`; POST `/api/attempts` 200 body unchanged at `{ id, outcome, submitted_at }` (mc/short) or `{ id, outcome:'pending', grade_run_id }` (llm_graded). FSRS state is written server-side only — never echoed in any response. POST `/api/questions/bulk` 201 body remains `{ inserted: ids }` (just IDs, no `referenceJson`). ✅
- **LBD-5 (no sandboxing).** N/A — not a code-execution surface.
- **LBD-6 / LBD-7 (chapter ceiling / additions).** N/A.
- **LBD-8 (no Jekyll polish).** N/A.
- **LBD-9 (`coding_practice/` boundary).** N/A.
- **LBD-10 (status-surface agreement at task close).** Verified across the three available surfaces (M5 has no per-milestone `tasks/README.md` — confirmed `ls design_docs/milestones/m5_phase5_review_loop/tasks/` returns task specs only; rule reduces to 3-way for M5):
  1. Per-task spec `**Status:**` line (`tasks/T01_fsrs_integration.md:3`): `✅ done 2026-05-02 (no issue file — cycle 1)` — flipped at Builder time. The "no issue file" parenthetical is now stale (this file exists), but the close-state itself is correct. Logged as LOW.
  2. M5 README `Done when` checkboxes: three flipped to `[x]` with `(T01 — 2026-05-02)` citation parentheticals — `ts-fsrs integrated`, `FSRS state initialized for every newly-generated question`, `FSRS-vs-SM-2 decision resolved`. Verified in the diff.
  3. Root `design_docs/milestones/README.md`: not modified this cycle. Spot-checked — M5 row is not yet flipped (other M5 tasks remain), which is correct (T01 doesn't close the milestone).
  All consistent. ✅ The premature Builder-time status flip is acceptable here because the user retained it; flagged LOW for the stale parenthetical only.
- **LBD-11 (non-inferential verification).** Source-level ACs (AC-2, AC-3, AC-5, AC-6, AC-9) verified by direct file inspection with line citations below. AC-1 (lockfile), AC-4 (smoke), AC-7 (`npm run check`), AC-8 (`npm run build`) recorded as NOT RUN with explicit blockers (`node_modules` empty in sandbox; lockfile not regenerated because `npm install` cannot run). No AC graded MET on the basis of "the build is clean". ✅
- **LBD-12 (cross-chapter refs).** N/A.
- **LBD-13 (pre-Phase-1 sequencing).** N/A — M5 is post-Phase-1.
- **LBD-14 (toolchain pins).** `.nvmrc` and `.pandoc-version` unmodified. New dep is `ts-fsrs ^4.0.0` (a runtime library, not a toolchain bump). ✅
- **LBD-15 (sandbox-vs-host git policy).** Branch is `design_branch`, no commit attempts in audit phase. Builder correctly identified `npm install` and gate runs as host-only. ✅
- **architecture.md §3.5 (server-side FSRS placement).** `fsrs.ts` runs server-side; `ts-fsrs` is not imported into any client-bundled module. The historical client-side path is documented in §3.5 as superseded. Outcome→grade mapping in `fsrs.ts:6-9` matches §3.5 table verbatim (`pass→Good`, `partial→Hard`, `fail→Again`). ✅
- **architecture.md §5 row 3 (FSRS vs SM-2).** Decision resolved in favour of FSRS via `ts-fsrs`. M5 README "Done when" checkbox flipped with citation. ✅
- **Dep manifest changes — dep-audit gate.** `package.json` adds `"ts-fsrs": "^4.0.0"` to `dependencies` (`package.json:31`). `package-lock.json` is **not** updated (sandbox cannot run `npm install`). The dep-audit gate must run on host post-`npm install` — flagged as host-only carry-over. The Builder's CHANGELOG entry calls this out explicitly (`Dep audit: ts-fsrs ^4.0.0 added to dependencies — host must run dependency-auditor before merging to main.`). ✅ for accounting; gate itself is deferred.

No design drift detected.

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 (`package.json` lists `ts-fsrs`; `package-lock.json` reflects exact version) | PARTIAL — host-only completion | `package.json:31` adds `"ts-fsrs": "^4.0.0"` to `dependencies`. `package-lock.json` does NOT contain `ts-fsrs` (verified `grep -c ts-fsrs package-lock.json` → 0). | Sandbox cannot run `npm install` (root-owned `node_modules`). **Host carry-over: M5-T01-HOST-01.** |
| AC-2 (`src/lib/fsrs.ts` exports `applyAttempt(state, outcome)` + `defaultState(now)`) | MET | `src/lib/fsrs.ts:70-84` (`applyAttempt`) and `src/lib/fsrs.ts:93-103` (`defaultState`). Both exported. Pure functions, no DB access (verified — only imports are `ts-fsrs` types/values, no Drizzle/sqlite). | Source-level. |
| AC-3 (Outcome→grade mapping documented in module docstring) | MET | `src/lib/fsrs.ts:6-9` — module-level comment block: `pass → Rating.Good (4)`, `fail → Rating.Again (1)`, `partial → Rating.Hard (2)`. Implementation matches in `outcomeToRating` (`fsrs.ts:27-33`). Matches architecture.md §3.5 table. | Source-level. |
| AC-4 (smoke `node scripts/fsrs-smoke.mjs` — non-inferential, LBD-11) | NOT RUN — host-only | `scripts/fsrs-smoke.mjs` exists; `[fsrs-smoke] all <N> assertions passed ✓` footer at line 188. Smoke shape verified: seeds two questions (one for `pass`, one for `fail`), seeds default `fsrs_state` rows (line 99-101), POSTs attempts (line 106, 125), reads back `fsrs_state` (line 144-145), asserts `due_at` advance + `stability` increase for pass (line 153-167) and `due_at` near-term + `reps` increment for fail (line 172-181). | In-sandbox `node scripts/fsrs-smoke.mjs` fails at `Cannot find package 'better-sqlite3'` (no `node_modules`). Live run also requires the state service on `127.0.0.1:4321`. **Host carry-over: M5-T01-HOST-02.** |
| AC-5 (`POST /api/questions/bulk` upserts `fsrs_state` for each inserted question) | MET | `src/pages/api/questions/bulk.ts:117-138` — after `db.insert(questions)…`, calls `defaultState(now)` and `db.insert(fsrsState).values({...}).onConflictDoUpdate({ target: fsrsState.questionId, set: {...} }).run()` with the same default-state values. Runs once per inserted question inside the existing `for` loop. | Source-level. UPSERT is symmetric (insert + onConflictDoUpdate carry the same payload), which is correct for a brand-new default state seed. |
| AC-6 (`PATCH /api/attempts/[id]/outcome.ts` calls `applyAttempt()` and UPDATEs `fsrs_state`) | MET | `src/pages/api/attempts/[id]/outcome.ts:74-107` — after writing the resolved outcome to `attempts`, reads existing `fsrs_state` row (or manufactures `defaultState(resolvedAt)`), calls `applyAttempt(currentState, outcome)`, UPSERTs into `fsrs_state` for `attempt.questionId`. mc/short path is parallel: `src/pages/api/attempts.ts:145-178` does the same UPSERT for synchronous outcomes. | Source-level. Both async and sync paths covered. |
| AC-7 (`npm run check` exits 0) | NOT RUN — host-only | In-sandbox `npm run check` fails immediately at `sh: 1: astro: not found` (no `node_modules`; `astro` CLI absent). | **Host carry-over: M5-T01-HOST-03.** |
| AC-8 (`npm run build` exits 0) | NOT RUN — host-only | Same blocker as AC-7. | **Host carry-over: M5-T01-HOST-04.** |
| AC-9 (CHANGELOG entry) | MET | `CHANGELOG.md` adds an `Added` entry under `## 2026-05-02` (lines 17-37) listing files changed, ACs satisfied, deviations from spec, and dep-audit deferral. | Source-level. |

## 🔴 HIGH — none

## 🟡 MEDIUM — none

## 🟢 LOW

### LOW-1 — `f.repeat()` used instead of `ts-fsrs.next()` named in the spec

The task spec (`tasks/T01_fsrs_integration.md:18` and §3.5 of architecture.md) names `ts-fsrs.next(state, grade)` as the call. The implementation in `src/lib/fsrs.ts:79` uses `f.repeat(card, now)` and indexes `log[rating].card` to extract the equivalent of `next(state, rating)`. Functionally equivalent in `ts-fsrs ^4.x` (`repeat` returns the full `RecordLog` keyed by all four ratings; `next` returns just one). No correctness drift, but the implementation does not match the literal API named in the spec.

**Action / Recommendation.** Two options:
1. **Switch to `f.next(card, now, rating)`** for literal alignment with spec/architecture.md. (Smaller diff, no behavior change.)
2. **Leave as `f.repeat()`** and add a one-line comment in `fsrs.ts` near the call explaining the equivalence.

Either is fine — this is a wording mismatch, not a behaviour bug. Recommend option 1 next host-side cycle for documentation cleanliness.

### LOW-2 — Stale parenthetical on per-task spec status line

The spec status line reads `✅ done 2026-05-02 (no issue file — cycle 1)`. The parenthetical is now incorrect because this issue file exists. Builder pre-emptively flipped status before audit (acceptable per orchestrator policy when the user retains the change), but the parenthetical should be updated.

**Action / Recommendation.** Edit `tasks/T01_fsrs_integration.md:3` from `✅ done 2026-05-02 (no issue file — cycle 1)` to `✅ done 2026-05-02 (cycle 1 audit ✅ PASS — see ../issues/T01_issue.md; host-only carry-overs M5-T01-HOST-01..04)`. Defer to next host-side touchpoint or a follow-up cycle.

### LOW-3 — Smoke harness assumes `data/cs-300.db` exists

`scripts/fsrs-smoke.mjs:24` defaults `DB_PATH` to `data/cs-300.db`. If the host runs the smoke against a fresh checkout without seeding, `Database(DB_PATH)` will create an empty SQLite file with no `chapters` / `questions` / `fsrs_state` tables, and the first `INSERT` will fail with a confusing error. The smoke does paper over the missing `ch_1` row (`fsrs-smoke.mjs:60-66`), but not over missing tables.

**Action / Recommendation.** Either (a) prepend a `node scripts/seed-smoke.mjs` step in the smoke's docstring (current line 16-18 mentions "seeded DB" but doesn't say which seed), or (b) run schema migration + seed inline if the table is missing. Defer to host-side smoke run; if AC-4 passes on first host run with a normal `seed-smoke` precursor, this is moot.

## Additions beyond spec — audited and justified

- **`src/lib/fsrs.ts` exports `FsrsState` interface** (line 17-24). Not in the spec. Justified: the wrapper has to convert between Drizzle row shape and `ts-fsrs` `Card` shape; exposing the row shape as a type makes the API ergonomic and helps callers (the three API routes) avoid duplicating the field list. Low risk.
- **mc/short path also handles missing-fsrs-state row** (`attempts.ts:148-158`). Spec (line 22) implicitly assumed `fsrs_state` would always exist for any question that has an attempt, because AC-5 (T05 bulk) seeds it. The implementation defends against a missing row via `defaultState(submittedAt)`. This guards pre-M5 questions (the spec's "Out of scope: Migration of historical attempts" notes that historical questions don't have `fsrs_state` rows). Without the guard, an attempt against a pre-M5 question would 500. Justified — small forward-compat addition.
- **Same defensive default in PATCH outcome** (`outcome.ts:78-87`). Same justification.

## Gate summary

| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | NOT RUN — sandbox `node_modules` permission | `sh: 1: astro: not found`. Host carry-over M5-T01-HOST-03. |
| smoke | `node scripts/fsrs-smoke.mjs` | NOT RUN — sandbox `node_modules` permission | `Cannot find package 'better-sqlite3'`. Smoke harness exists with correct shape; footer string `[fsrs-smoke] all <N> assertions passed ✓` present at line 188. Host carry-over M5-T01-HOST-02. |
| chapter | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | NOT RUN — N/A | No chapter content touched. |
| content build | `node scripts/build-content.mjs` | NOT RUN — N/A | No content pipeline change. |
| build | `npm run build` | NOT RUN — sandbox `node_modules` permission | Same blocker as `npm run check`. Host carry-over M5-T01-HOST-04. |
| dep-audit | `dependency-auditor` against staged manifest diff | NOT RUN — host-only | `package.json` modified (`ts-fsrs ^4.0.0` added); `package-lock.json` not regenerated in sandbox. Builder's CHANGELOG entry flags this. Host carry-over M5-T01-HOST-05. |

Source-level review (LBD-11 fallback for in-sandbox audit) confirmed correctness of the four touched API surfaces, the wrapper, and the smoke harness shape. No correctness inference from gate success — gates simply did not run.

## Issue log — cross-task follow-up

| ID | Severity | Owner / next touch point |
| -- | -------- | ------------------------ |
| M5-T01-HOST-01 | MEDIUM (host-only) | Host: run `npm install` to regenerate `package-lock.json` with the `ts-fsrs ^4.0.0` resolution. |
| M5-T01-HOST-02 | MEDIUM (host-only) | Host: run `node scripts/fsrs-smoke.mjs` after seeding the local DB and starting the state service (`astro dev`). Cite output footer to close AC-4. |
| M5-T01-HOST-03 | MEDIUM (host-only) | Host: run `npm run check` and confirm exit 0 to close AC-7. |
| M5-T01-HOST-04 | MEDIUM (host-only) | Host: run `npm run build` and confirm exit 0 + `dist/` clean of `ts-fsrs` (server-side only) to close AC-8. |
| M5-T01-HOST-05 | MEDIUM (host-only) | Host: run `dependency-auditor` against the staged manifest diff once the lockfile is regenerated. Required before any merge to `main` (CLAUDE.md non-negotiable). |
| M5-T01-LOW-01 | LOW | Next host-side cycle (or T02 builder): swap `f.repeat()` for `f.next(card, now, rating)` in `src/lib/fsrs.ts:79` for literal alignment with task spec + architecture.md §3.5 wording. |
| M5-T01-LOW-02 | LOW | Next host-side touchpoint: update stale parenthetical on `tasks/T01_fsrs_integration.md:3` to point at this issue file. |
| M5-T01-LOW-03 | LOW | Smoke author / T02 builder: tighten `scripts/fsrs-smoke.mjs` docstring to name the seed precondition explicitly. |

## Security review

Not run this cycle (no security-gate trigger inside `/clean-implement` cycle 1). Quick threat-model self-check against `CLAUDE.md` § Threat model:

- **(1) Reference-solution leakage to DOM (LBD-4).** Not exposed — FSRS state contains no reference data; PATCH/POST 200 bodies unchanged. ✅
- **(3) Question-content injection / `validate-twice`.** Out of scope; FSRS update doesn't touch `referenceJson` or `answerSchemaJson`. ✅
- **(6) `dist/` cleanliness.** API routes have `prerender = false`; `ts-fsrs` is consumed only by API routes and `src/lib/fsrs.ts`, neither of which lands in `dist/`. To confirm, host should grep `dist/` for `ts-fsrs` post-build (zero hits expected). ✅ pending host build.
- **(7) Supply-chain / install-time RCE.** New dep `ts-fsrs`. Triggers `dependency-auditor` on host; deferred via M5-T01-HOST-05.

Defer formal security gate to host-side (paired with dep-audit re-run after `npm install`).

## Dependency audit

Manifest changes detected: `package.json` (`+ts-fsrs ^4.0.0`). `package-lock.json` NOT regenerated (sandbox limitation). `pyproject.toml`, `uv.lock`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml` all unchanged.

Dep-audit gate not runnable in sandbox without lockfile. Builder's CHANGELOG entry explicitly defers this to host. Marked as M5-T01-HOST-05; required before any merge to `main`.

## Deferred to nice_to_have

None — no findings map to `nice_to_have.md`.

## Propagation status

No forward-deferrals filed against future task specs. Host carry-overs (M5-T01-HOST-01..05) are LBD-15 sandbox/host operational artifacts, not task-spec content drift; they live in this issue file and CHANGELOG.

LOW-1 / LOW-2 / LOW-3 do not warrant inflicting carry-over on T02 — they're cleanup against this task's surfaces and can be picked up at the next host touchpoint without spec amendment.

---

## Cycle 2 — Locked terminal decisions (bypass applied 2026-05-02)

Cycle-1 terminal gate returned 2× FIX-THEN-SHIP from sr-dev + sr-sdet (security-reviewer SHIP). All findings were single-recommendation, no decision conflict, no scope expansion, no deferral to nonexistent task. Auditor-agreement bypass applied per `auto-implement.md` Step G2; orchestrator stamped 4 locked decisions and re-looped:

1. **Locked terminal decision (loop-controller + sr-dev concur, 2026-05-02): `applyAttempt` takes `now` as an explicit parameter.**
   `src/lib/fsrs.ts:applyAttempt(state, outcome, now)` now threads the timestamp explicitly. Both call sites (`src/pages/api/attempts.ts` mc/short path, `src/pages/api/attempts/[id]/outcome.ts` llm_graded path) pass the `submittedAt` / `resolvedAt` they already hold. The function is now pure and unit-testable with fixed timestamps.

2. **Locked terminal decision (loop-controller + sr-dev concur, 2026-05-02): attempt INSERT/UPDATE + `fsrs_state` UPSERT wrapped in `db.transaction(tx => {...})`.**
   Both API handlers wrap the two writes in a Drizzle synchronous transaction. A crash between the statements no longer leaves the schedule out of sync with the attempt history.

3. **Locked terminal decision (loop-controller + sr-sdet concur, 2026-05-02): fail-path stability assertion added to `scripts/fsrs-smoke.mjs`.**
   New assertion `fsrsB.stability < fsrsA.stability` discriminates a swapped Again/Good grade mapping (which the prior assertions could not catch).

4. **Locked terminal decision (loop-controller + sr-sdet concur, 2026-05-02): `partial`/Hard runtime coverage deferred.**
   The cs-300 mc/short evaluators emit only `pass`/`fail`; `partial` arrives only via llm_graded PATCH. End-to-end runtime coverage requires aiw-mcp + Ollama and is multi-step. AC-3's mapping for `partial`→`Hard` is verified by Auditor source review of `outcomeToRating` (the discriminating stability assertion above already catches mapping inversions for the two end cases). Documented as a follow-up smoke if a future cycle needs runtime `partial` coverage.

Cycle 2 will re-spawn Auditor + sr-dev + sr-sdet to verify these fixes; security-reviewer already SHIP'd cycle 1 (no security-relevant changes in the fixes).

### Cycle 2 — Auditor verification (2026-05-02)

**Verdict: ✅ PASS** (host-only ACs unchanged from cycle 1).

| Locked decision | Verified at | Notes |
| --- | --- | --- |
| 1. `applyAttempt(state, outcome, now)` explicit `now` param | `src/lib/fsrs.ts:77-81` | Signature is `(state, outcome, now: number)`. Module docstring updated (`fsrs.ts:64-76`). Both call sites pass a `number` Unix ms (not `Date`): `src/pages/api/attempts.ts:164` passes `submittedAt`; `src/pages/api/attempts/[id]/outcome.ts:91` passes `resolvedAt`. No call sites missed (`grep -rn "applyAttempt" src/` returns exactly the two API routes plus the export). |
| 2. Attempt write + `fsrs_state` UPSERT wrapped in `db.transaction((tx) => {...})` | `attempts.ts:139-184`, `outcome.ts:70-111` | Both blocks use `db.transaction((tx) => {...})` with all four DB ops (`tx.insert`/`tx.update`/`tx.select`/`tx.insert…onConflictDoUpdate`) routed through `tx`. No `db.` references inside either callback (verified by inspection). No `await` inside either transaction body — Drizzle/better-sqlite3 sync transactions used correctly. The async/await on `request.json()` and `runWorkflow()` are both well outside the transaction blocks. |
| 3. Fail-path stability assertion in smoke | `scripts/fsrs-smoke.mjs:185-189` | New assertion `fsrsB.stability < fsrsA.stability` is genuinely discriminating: a swapped Again↔Good mapping would fail this check (Again-rated state would have higher stability than Good-rated state). Counts toward AC-4 step 3 alongside the existing `due_at` and `reps` checks. |
| 4. `partial`/Hard runtime coverage deferred | `scripts/fsrs-smoke.mjs:191-204` | Deferral documented inline with rationale (mc/short evaluators emit only pass/fail; partial only via llm_graded PATCH; AC-3 mapping verified by source review of `outcomeToRating` + the discriminating stability assertion catches end-case inversions). Acceptable per locked decision #4. |

**Regression sweep.**
- `src/pages/api/questions/bulk.ts` unchanged in cycle 2 (only uses `defaultState`, which retains its original `(now: number)` signature).
- No new imports / no new modules / no `dist/` impact (still all `prerender = false` API routes).
- LBD-1..15 sweep unchanged from cycle 1 — no new drift introduced by the four fixes.
- Status-surface 3-way still consistent (no surface flipped in cycle 2; same as cycle-1 verdict).
- Host-only carry-overs M5-T01-HOST-01..05 unchanged (sandbox still cannot run `npm install` / `astro check` / `astro build` / smoke / dep-audit).
- LOW-1 (`f.repeat` wording vs spec's `f.next`) unchanged — still cosmetic.
- LOW-2 (stale parenthetical on spec status line) unchanged.
- LOW-3 (smoke seed-precondition docstring) unchanged.

**Gate re-run (cycle 2).**

| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | NOT RUN — sandbox `node_modules` permission | `sh: 1: astro: not found` (verified). Host carry-over M5-T01-HOST-03 still applies. |
| smoke | `node scripts/fsrs-smoke.mjs` | NOT RUN — sandbox limitation | `better-sqlite3` not installed in sandbox + state service not running. Host carry-over M5-T01-HOST-02 still applies. |
| build | `npm run build` | NOT RUN — same blocker | Host carry-over M5-T01-HOST-04 still applies. |

Source-level verification of all four locked decisions confirms the fixes landed correctly without regressing prior cycle-1 surfaces. Cycle 2 verdict: **✅ PASS**.

## Dependency audit (2026-05-02)

**Reviewed:** 2026-05-02
**Manifests reviewed:** `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`
**Lockfile state:** drift — `package.json` adds `"ts-fsrs": "^4.0.0"` but `package-lock.json` was NOT regenerated in-sandbox (root-owned `node_modules`). Host must run `npm install` before merge to `main`.

### Dependency changes

| Dep | From | To | Direct? | Notes |
| --- | --- | --- | --- | --- |
| `ts-fsrs` | — (new) | `^4.0.0` | Yes (`dependencies`) | FSRS algorithm library; consumed only by `src/lib/fsrs.ts` → API routes |

### Install-time / postinstall RCE check

`npm view ts-fsrs scripts` returns build/check/test/docs scripts only — no `install`, `preinstall`, or `postinstall` hook. No native-compilation step, no network fetch at install time. Clean.

### Typosquat / legitimacy check

- **Maintainer:** `ishiko732 <ishiko732@gmail.com>` — the established maintainer of `open-spaced-repetition/ts-fsrs` on GitHub. The `open-spaced-repetition` org is the recognized home for FSRS algorithm implementations; `ts-fsrs` is its primary TypeScript implementation.
- **First published:** 2023-03-05 (over 2 years ago). Version history is deep (80+ published versions), with consistent cadence through 2026.
- **Repository:** `git+https://github.com/open-spaced-repetition/ts-fsrs.git`. Homepage matches. No mismatch between package metadata and expected maintainer.
- **Typosquat risk:** None — the name `ts-fsrs` is canonical; no lookalike packages with similar names and different maintainers found via `npm view`.

### License check

`ts-fsrs` is **MIT**. cs-300 is CC-BY-NC-SA 4.0. MIT is permissive — no copyleft, no SSPL/AGPL conflict. `ts-fsrs` is consumed server-side only (API routes, `prerender = false`) and does not land in `dist/`. No license drift. Clean.

### Known CVEs

`npm audit` cannot run in sandbox (no `node_modules`; `ts-fsrs` not yet installed). No CVEs for `ts-fsrs` appear in public advisory databases as of knowledge cutoff (2025-08). Host carry-over: run `npm audit --json` after `npm install` and confirm no `high`/`critical` findings for `ts-fsrs` or any transitive dep it introduces.

### Abandonment / ownership change

Published 2023-03-05; actively maintained through 2026-03-31 (most recent publish). Single maintainer (`ishiko732`) has held the package since first publish — no ownership transfer. Maintainer is the author of the upstream FSRS TypeScript spec. Not abandoned; not a transfer risk.

### Toolchain pin drift (LBD-14)

`Dockerfile` and `docker-compose.yml` show as modified in git status. Checked diff — Dockerfile changes are in scope (not a silent toolchain bump). `.nvmrc` (Node 22) and `.pandoc-version` (3.1.3) are unchanged. No LBD-14 violation.

### Critical

None.

### High

None.

### Advisory

- **Lockfile not materialized.** `package-lock.json` does not contain `ts-fsrs`. Host must run `npm install` before any merge to `main`, then re-run `npm audit --json` and confirm no `high`/`critical` results. Recorded as M5-T01-HOST-05 in the issue log above.

### Verdict

`FIX-THEN-SHIP` — no security or supply-chain concern with `ts-fsrs` itself; the only open item is the lockfile that cannot be regenerated in-sandbox. Host `npm install` + `npm audit` clean-run closes this gate. Do not merge to `main` until both are confirmed.
