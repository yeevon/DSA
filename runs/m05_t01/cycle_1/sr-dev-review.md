## Sr. Dev review (2026-05-02)

**Reviewed:** 2026-05-02
**Scope:** `src/lib/fsrs.ts`, `src/pages/api/attempts.ts` (mc/short FSRS path), `src/pages/api/attempts/[id]/outcome.ts` (llm_graded FSRS path), `src/pages/api/questions/bulk.ts`, `scripts/fsrs-smoke.mjs`; Auditor issue file read to avoid duplication.

### Must-fix issues

None.

### Should-fix issues

- **`applyAttempt` bakes `new Date()` as `now` internally, making the function impure and non-testable in isolation.** (`src/lib/fsrs.ts:76`) The call `const now = new Date()` inside `applyAttempt` means the reviewer timestamp is always wall-clock time, not the attempt's own `submitted_at`. In practice this is a few milliseconds off for mc/short, but for the llm_graded path the PATCH can arrive many minutes after the attempt was submitted — the `due_at` will be anchored to PATCH time rather than submission time, which is the right choice, but it is accidental and undocumented. Regardless, baking `now` inside a pure-function wrapper makes it impossible to unit-test with a fixed timestamp without monkey-patching. **Action:** Thread `now: Date` (or `now: number`) as an explicit parameter. Callers already have `submittedAt` / `resolvedAt` — they can pass it. Zero downstream breakage: both call sites would pass the timestamp they already hold. No behavior change for the mc/short path; llm_graded path becomes explicitly correct.

- **FSRS UPDATE is not wrapped with the attempt INSERT in a single transaction for the mc/short path.** (`src/pages/api/attempts.ts:134-178`) The `db.insert(attempts)` at line 134 and the `db.insert(fsrsState)...onConflictDoUpdate` at line 160 are two separate `.run()` calls. If the process crashes or the second statement throws (e.g., schema mismatch on a partial migration), the attempt row is persisted with no matching `fsrs_state` update — the state diverges. The `defaultState` fallback in subsequent attempts would re-initialize rather than continue the schedule, silently resetting the review history. Same structural issue at `outcome.ts:66-107` (attempt UPDATE then FSRS UPSERT). **Action:** Wrap each pair in `db.transaction(() => { ... })`. Drizzle/better-sqlite3 supports synchronous transactions; neither code path uses `await` between the two statements, so no async complication. This is a data-integrity fix, not a cosmetic one.

### Non-blocking improvements

- **`f.repeat()` vs `f.next()` wording mismatch** (`src/lib/fsrs.ts:79`) — already filed as M5-T01-LOW-01 by the Auditor. Not re-raised here; covered.

- **`cardToState` return type annotation is redundant noise.** (`src/lib/fsrs.ts:50`) The return type `Omit<FsrsState, 'due_at'> & { due_at: number }` is structurally identical to `FsrsState` — `due_at: number` is already the type in `FsrsState`. Simplify to `: FsrsState`. No semantic change.

- **`stateToCard` creates a full `createEmptyCard()` and spreads it only to overwrite every field immediately.** (`src/lib/fsrs.ts:37-47`) The spread is safe but wastes an allocation. Minor; not a blocking concern for a single-user local service.

- **Smoke exit code on the failure branch is 1** (`scripts/fsrs-smoke.mjs:186`) which is correct. Worth noting: if the `fetch` itself throws (network unreachable before the state service is up), the unhandled rejection exits with a non-zero code but prints no `[fsrs-smoke]` footer line. The `gate_parse_patterns.md` regex looks for the footer — a raw network error will cause the gate parser to see no footer and correctly flag as failed, but the operator will see a cryptic Node stack instead of a structured message. Low priority but a `try/catch` around the `post()` calls with a `[fsrs-smoke] FAIL — state service unreachable` message would make host-side debugging faster.

### Architecture notes

- The FSRS update intentionally sits in the state-service (Node/Drizzle) rather than in `aiw-mcp`, which is correct per architecture.md §3.5 and LBD-2. No seam violation detected.
- `ts-fsrs` is consumed only by `src/lib/fsrs.ts`, which is only imported by the three `src/pages/api/` routes (`attempts.ts`, `attempts/[id]/outcome.ts`, `questions/bulk.ts`). All three have `prerender = false`. No exposure in `dist/`. LBD-1 satisfied.
- The `FsrsState` interface export from `fsrs.ts` is the right abstraction boundary — callers interact with the row shape without reaching into `ts-fsrs` internals. Consistent with the single-responsibility of the wrapper module.

### Verdict

`FIX-THEN-SHIP` — the missing transaction wrapping (should-fix #2) is a data-integrity risk: a crash between the two SQLite statements leaves attempt and fsrs_state out of sync, and the silent `defaultState` fallback on the next attempt would mask the divergence permanently. The `now` parameter threading (should-fix #1) is needed for the function to be correctly testable and for the llm_graded behavior to be explicitly correct rather than accidentally correct. Both are small, targeted changes that do not touch the API contract.
