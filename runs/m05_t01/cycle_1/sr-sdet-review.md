## Sr. SDET review (2026-05-02)

**Reviewer:** sr-sdet
**Scope:** `scripts/fsrs-smoke.mjs` (shape review — in-sandbox; smoke cannot execute)
**AC under review:** AC-4 (LBD-11 smoke requirement)

---

### AC-to-test mapping

| AC | Test / smoke / inspection | Real surface? | Notes |
| --- | --- | --- | --- |
| AC-4 step 1 (seed two questions + fsrs_state) | `fsrs-smoke.mjs:68-101` — direct SQLite insert, not via bulk API | YES (real DB) | Seeds both questions and fsrs_state rows at `now - 60s` so `due_at` is in the past. Real surface for the schema; bypasses the bulk endpoint by design (acceptable — keeps smoke self-contained, noted as intentional at line 50). |
| AC-4 step 2 (pass → due_at shifts forward, stability increases) | `fsrs-smoke.mjs:153-167` — three assertions: `due_at > initDue`, `stability > 0`, `reps === 1` | YES (real API call + real DB read-back) | Both `due_at` advance and `stability > 0` are checked. BEFORE value (`initDue`) is captured at line 93 before the POST. Delta is verified correctly. |
| AC-4 step 3 (fail → due_at near-term, stability decreases) | `fsrs-smoke.mjs:172-181` — two assertions: `due_at <= now + 24h`, `reps === 1` | YES (real API call + real DB read-back) | PARTIAL — see Lens 1 gap below. |
| AC-3 (mapping documented) | Auditor source-level check in issue file | NO (inspection only) | No smoke assertion. Acceptable — AC-3 is a doc-shape check; smoke is for runtime behaviour (AC-4). |

---

### Lens analysis

**Lens 1 — passes-for-wrong-reason (HIGH concern, MEDIUM finding).**

AC-4 step 3 requires `state.stability` **decreases** after a `fail` (Again) attempt. The smoke asserts `reps === 1` and `due_at <= now + 24h` — but **does not assert that `fsrsB.stability < initStability`**. The `initStability` seeded for question B is `0.0` (`insertFsrs.run(Q_FAIL_ID, initDue)` at line 100; `stability = 0.0` per the column order at line 95-98).

After an Again rating, `ts-fsrs` resets stability to a small positive value (typically ~0.4). So `fsrsB.stability` will be **greater than 0.0** post-fail, not less. The spec says "stability decreases" — this is slightly loose wording; for a first-time Again, stability goes from the seed `0.0` to the library's minimum reset value. The spec's intent is "remains near-minimum / does not grow large like a Good rating would." The smoke's missing assertion means the test cannot distinguish between a correct Again-reset (stability ~0.4) and a mistakenly applied Good-rating (stability ~2.0+).

The smoke does capture `fsrsA.stability > 0` for the pass case. A symmetric assertion is absent for the fail case. If the grade mapping were inverted (Again applied to question A, Good to question B), the fail assertions (`due_at <= now + 24h`, `reps === 1`) would **still pass** because a Good-rated first card also lands within 24 hours by default (typically 1 day). The test cannot catch that inversion.

**Recommendation:** Add an assertion comparing `fsrsB.stability` against `fsrsA.stability`. The meaningful invariant is that Again stability is substantially below Good stability. Concrete assertion:

```js
assert(
  'B (fail): stability < A (pass) stability — Again does not produce a Good-level schedule',
  fsrsB && fsrsA && fsrsB.stability < fsrsA.stability,
  `stab_B=${fsrsB?.stability} stab_A=${fsrsA?.stability}`,
);
```

This is a real discriminating assertion: it would catch a swapped grade mapping.

**Lens 2 — coverage gaps (MEDIUM).**

The smoke covers `pass` (Good) and `fail` (Again). `partial` (Hard) is absent. AC-3 documents all three mappings; the smoke tests only two. For a first release, covering the boundary cases (best and worst) is the minimum viable check. The Hard path is omitted.

**Recommendation:** Add a third question C and a partial attempt asserting `stability_C` is between `stability_B` and `stability_A`, and `due_at_C` is between the two extremes. Flag as MEDIUM — the two-outcome smoke is non-trivial and catches the core paths, but `partial` coverage is a gap against the stated AC-3 surface.

**Lens 3 — mock overuse.**

No mocks. The smoke uses real `better-sqlite3` for seeding, real `fetch` calls to the live state service, and real `better-sqlite3` read-back. Nothing is stubbed. The HTTP calls go to the real `POST /api/attempts` handler. Correct.

**Lens 4 — fixture hygiene.**

The smoke does **not** clean up seeded rows (questions, fsrs_state) after assertions. The seed uses `SOURCE_RUN_ID = 'fsrs-smoke-${Date.now()}'` and random UUIDs, so re-runs do not collide. The orphaned rows accumulate in `data/cs-300.db` but are benign for a single-user local tool. No test isolation risk. Acceptable for this project context; a `DELETE FROM questions WHERE source_run_id = ?` teardown would be cleaner but is not a correctness issue.

**Lens 5 — prerequisite documentation.**

Header comment at lines 16-18 states:
> Requires the state service (Astro dev or start) at CS300_API_BASE (default http://127.0.0.1:4321) and a seeded DB with at least one chapter row ('ch_1').

The prerequisite (`npm run dev` or `npm start`) is named. AC-4 in the task spec names the smoke and the Auditor's issue file (M5-T01-HOST-02) repeats "after seeding the local DB and starting the state service (`astro dev`)". The documentation is adequate. The Auditor's LOW-3 observation about naming the seed script explicitly (`node scripts/seed-smoke.mjs`) is valid but minor.

**Lens 6 — footer / naming hygiene.**

Success footer at line 188: `[fsrs-smoke] all ${assertions} assertions passed ✓` — matches `^\[fsrs-smoke\] .*✓\s*$`. Failure path at line 185: `[fsrs-smoke] FAIL — ${failures}/${assertions} assertions failed` followed by `process.exit(1)` — matches convention. Naming is correct.

---

### Gaps

1. **MEDIUM — Fail-path stability assertion absent.** The smoke cannot distinguish a correct Again-reset from a misapplied Good rating because no `stability` bound is checked for question B. The test passes for a wrong reason on the fail branch (Lens 1).
2. **MEDIUM — `partial` / Hard path unverified.** AC-3 documents three mappings; the smoke exercises two. (Lens 2).
3. **LOW — No teardown.** Orphaned rows accumulate per run. Non-blocking for a single-user local tool. (Lens 4).

---

### Recommended tests

1. Add to the fail-path assertions block (after `reps` check):
   ```js
   assert(
     'B (fail): stability < A (pass) stability — grade mapping not swapped',
     fsrsB && fsrsA && fsrsB.stability < fsrsA.stability,
     `stab_B=${fsrsB?.stability} stab_A=${fsrsA?.stability}`,
   );
   ```
2. Add question C + partial attempt + three assertions (stability in (stab_B, stab_A), due_at within a week, reps === 1) to cover the Hard path.
3. (Optional) Add `DELETE FROM questions WHERE source_run_id = ?` teardown after the summary block.

---

### Verdict

**FIX-THEN-SHIP** — The fail-path MEDIUM gap (no `stability` delta assertion) means the smoke does not fully satisfy AC-4 step 3 as written. The spec says "stability decreases" — the smoke does not assert that invariant, creating a passes-for-wrong-reason risk if the grade mapping is swapped or misconfigured. The missing `partial` assertion is a secondary MEDIUM. Both gaps are localised to `scripts/fsrs-smoke.mjs` and are small additions; no implementation changes are required.

The two recommended assertions should be added to `scripts/fsrs-smoke.mjs` and the smoke re-run on host before AC-4 is marked MET.
