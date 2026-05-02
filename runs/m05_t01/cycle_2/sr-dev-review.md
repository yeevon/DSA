## Sr. Dev review (2026-05-02)

**Reviewed:** 2026-05-02
**Scope:** `src/lib/fsrs.ts`, `src/pages/api/attempts.ts` (lines 132–190), `src/pages/api/attempts/[id]/outcome.ts`
**Purpose:** Cycle-2 re-review — verify 2 must-fix findings from cycle 1 landed.

---

### Finding 1 — `applyAttempt` takes `now` as a parameter

**Status: RESOLVED**

`src/lib/fsrs.ts:77–91` — function signature is `applyAttempt(state, outcome, now: number)`.
`f.repeat(card, new Date(now))` uses the caller-supplied timestamp.

Call sites:
- `src/pages/api/attempts.ts:164` — passes `submittedAt` (captured at `Date.now()` on line 133, before the transaction).
- `src/pages/api/attempts/[id]/outcome.ts:91` — passes `resolvedAt` (captured at `Date.now()` on line 69, before the transaction).

Both are correct. No residual `new Date()` inside `applyAttempt`.

---

### Finding 2 — attempt write + FSRS UPSERT in a single transaction

**Status: RESOLVED**

`src/pages/api/attempts.ts:139–184` — `db.transaction((tx) => { ... })` covers the `tx.insert(attempts)` and the `tx.insert(fsrsState).onConflictDoUpdate(...)` in one synchronous block. Comment on line 135–138 correctly explains the integrity rationale.

`src/pages/api/attempts/[id]/outcome.ts:70–111` — `db.transaction((tx) => { ... })` covers `tx.update(attempts)` and the FSRS UPSERT in one synchronous block.

No partial-write window remains on either path.

---

### No regressions introduced

- `defaultState` fallback (lines 163 / 90) is correctly placed inside the transaction in both handlers, so the read of `fsrsState` and the write back are atomic.
- `resolvedAt` / `submittedAt` are captured **before** entering the transaction, which is correct — it avoids the transaction blocking on `Date.now()` and the timestamp is consistent across both writes within the block.
- No new coupling introduced; both handlers remain self-contained.

---

### Verdict

`SHIP` — both cycle-1 must-fix findings are resolved cleanly with no regressions.
