# T01 — `ts-fsrs` integration into POST /api/attempts

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** M3 (`fsrs_state` table + PATCH route), M4 T06 (POST /api/attempts mc/short eval), M4 T08 (llm_graded async flow + outcome PATCH)
**Blocks:** T02 (review-due endpoint reads from fsrs_state), T03, T05

## Why this task exists

M5's review loop needs spaced-repetition state per question. The M3 `fsrs_state` table exists but is unused — every attempt currently lands without updating the schedule. T01 wires `ts-fsrs.next(state, grade)` into the existing `POST /api/attempts` handler so the schedule advances on every attempt, and seeds default `fsrs_state` for every newly-generated question.

The architecture decision (FSRS vs SM-2 — `architecture.md` §5 row 3) is resolved here: **FSRS via `ts-fsrs`** is the default. SM-2 is the fallback only if `ts-fsrs` produces surprises during integration; if that fork happens, raise it as a `STOP-AND-ASK` to the user — do not silently swap.

## What to build

1. **`npm install ts-fsrs`** — adds the dep to `package.json` + `package-lock.json` (triggers dep-audit gate). Pin to a specific minor version; record the version in the CHANGELOG.
2. **`src/lib/fsrs.ts`** — thin wrapper around `ts-fsrs.next()`:
   - `applyAttempt(state, outcome): { state, due_at }` — maps cs-300 outcomes (`pass | fail | partial`) to FSRS grades (`Good | Again | Hard`) and returns the updated state.
   - `defaultState(now): FsrsState` — returns the default-init state for a brand-new question.
   - Unit-shape: pure function, no DB access.
3. **Modify `src/pages/api/attempts.ts`** — after the existing outcome resolution (sync for mc/short, async via PATCH for llm_graded), call `applyAttempt()` and UPDATE the `fsrs_state` row for `question_id`. For the llm_graded path, the FSRS update happens in `PATCH /api/attempts/[id]/outcome.ts` (T08's route) — not in the POST handler — because that's where the final outcome lands.
4. **Modify the question-gen flow (M4 T05 `POST /api/questions/bulk`)** — on insert, also UPSERT a default `fsrs_state` row per new question with `defaultState(now)`. Existing M4 generation flow inserts question rows but doesn't seed fsrs_state.
5. **CHANGELOG entry** under the current dated section.

## Out of scope

- Migration of historical attempts (no fsrs_state for pre-M5 attempts) — `M5-T01` only updates state going forward.
- Per-user state — single-user system (LBD-1, LBD-2). The `fsrs_state` schema has no user_id.
- Custom FSRS parameters (request retention, max interval, weights) — use `ts-fsrs` library defaults. If the user later wants custom parameters, that is a follow-up task.
- SM-2 fallback implementation — only fires if integration surprises arise; not built proactively.

## Acceptance criteria

- [ ] **AC-1.** `package.json` lists `ts-fsrs` under `dependencies`. `package-lock.json` reflects the exact version.
- [ ] **AC-2.** `src/lib/fsrs.ts` exists and exports `applyAttempt(state, outcome)` + `defaultState(now)`.
- [ ] **AC-3.** Outcome→grade mapping is documented in `src/lib/fsrs.ts` module docstring: `pass → Good`, `fail → Again`, `partial → Hard`.
- [ ] **AC-4 (smoke — non-inferential, LBD-11).** Auditor runs `node scripts/fsrs-smoke.mjs` (new). The smoke:
  1. Seeds two test questions and a default `fsrs_state` row each.
  2. POSTs a `pass` attempt for question A → `fsrs_state.due_at` shifts forward, `state.stability` increases.
  3. POSTs a `fail` attempt for question B → `fsrs_state.due_at` shifts to a near-term timestamp (re-review soon), `state.stability` decreases.
  4. Asserts both transitions explicitly with `[fsrs-smoke] all <N> assertions passed ✓` footer on success.
- [ ] **AC-5.** `POST /api/questions/bulk` (M4 T05) now upserts `fsrs_state` for each newly-inserted question. Verify by inserting a question via curl and reading `SELECT * FROM fsrs_state WHERE question_id = ?` — row exists with `defaultState`.
- [ ] **AC-6.** `PATCH /api/attempts/[id]/outcome.ts` (M4 T08) calls `applyAttempt()` after writing the resolved outcome, then UPDATEs `fsrs_state` for the underlying question. (For mc/short, this lives in the POST handler instead.)
- [ ] **AC-7.** `npm run check` exits 0.
- [ ] **AC-8.** `npm run build` exits 0.
- [ ] **AC-9.** CHANGELOG has an M5 T01 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `node scripts/fsrs-smoke.mjs` (new harness; emits `[fsrs-smoke] ... ✓` footer per `gate_parse_patterns.md`).
- **Type check:** `npm run check`.
- **Build:** `npm run build`.
- **Dep audit gate:** `package.json` + `package-lock.json` change triggers `dependency-auditor` agent (per CLAUDE.md non-negotiable).
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**` (todo → ✅ done)
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "ts-fsrs integrated. Each POST /api/attempts (in addition to the M4 dispatch logic) runs ts-fsrs.next(state, grade) and PATCHes the new state. Grade mapping documented" + "FSRS state initialized for every newly-generated question" + "FSRS-vs-SM-2 decision resolved"

## Dependencies

- Upstream tasks: M3 (`fsrs_state` table schema + PATCH route), M4 T06 (POST /api/attempts mc/short), M4 T08 (PATCH /api/attempts/:id/outcome).
- LBDs touched: LBD-2 (state service / two-process boundary; FSRS update is local-only Node SQLite work), LBD-11 (named smoke required), LBD-14 (toolchain pin — `ts-fsrs` is a new dep, not a toolchain bump).

## Carry-over from prior audits

*(empty)*
