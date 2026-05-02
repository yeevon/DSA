## Sr. SDET review (2026-05-02)

**Reviewer:** sr-sdet
**Scope:** `scripts/fsrs-smoke.mjs` — cycle-2 state; `T01_issue.md` cycle-2 locked-decision block (decision #3 and #4)
**Cycle-1 findings to resolve:**
1. MEDIUM — fail-path stability discriminating assertion missing.
2. MEDIUM — `partial`/Hard path unverified.

---

### Finding 1 — Fail-path stability assertion

**Status: RESOLVED.**

Assertion added at `scripts/fsrs-smoke.mjs:185-189`:

```js
assert(
  'B (fail): stability < A (pass) stability — Again does not produce a Good-level schedule',
  fsrsB && fsrsA && fsrsB.stability < fsrsA.stability,
  `stab_B=${fsrsB?.stability} stab_A=${fsrsA?.stability}`,
);
```

This is precisely the discriminating assertion recommended in cycle-1 (verbatim match to the recommendation block). The assertion is placed after the existing `reps` check for question B, within the fail-path block, and before the partial-coverage comment. Placement is correct.

Assertion quality check:
- Comparison operands: `fsrsB.stability` (Again-rated) vs `fsrsA.stability` (Good-rated), both computed from the same default-state seed (`stability=0.0`). After the first Good rating, `ts-fsrs` produces stability ~2.0+; after the first Again rating, stability resets to ~0.4. The invariant `stab_B < stab_A` will hold for any correct grade mapping and will fail if the mapping is swapped or if both calls receive the same rating by mistake.
- Null guards: `fsrsB && fsrsA &&` — correctly guards against a missing DB row (which would already have been caught by the earlier `due_at` assertion).
- Detail string: `stab_B=... stab_A=...` — sufficient for diagnosis on failure.
- This is a real discriminating assertion. It catches the exact inversion the cycle-1 review flagged. Not a no-op.

---

### Finding 2 — `partial`/Hard path coverage

**Status: JUSTIFIED DEFERRAL — accepted.**

The deferral is documented in two places:
1. `scripts/fsrs-smoke.mjs:191-204` — comment block explaining why runtime partial coverage is out of scope for this smoke, naming the multi-step dependency (llm_graded PATCH, aiw-mcp, Ollama), citing the AC-3 source-review fallback (`outcomeToRating` switch), and flagging the future follow-up.
2. `T01_issue.md` cycle-2 locked-decision #4 — rationale recorded with explicit scope limit and the condition under which a future smoke should cover it.

The deferral is technically sound:
- The cs-300 mc/short evaluators emit only `pass`/`fail` (verified against `src/pages/api/attempts.ts` — no `partial` outcome is produced in the synchronous path). `partial` arrives only from PATCH `/api/attempts/[id]/outcome` after the llm_graded workflow resolves.
- End-to-end runtime coverage of `partial` requires aiw-mcp + Ollama + a running workflow — multi-process, multi-step. This is a different scope class from a self-contained state-service smoke.
- The cycle-1 recommendation for question C + partial attempt was to add seed rows + HTTP assertions. The orchestrator correctly identified that seeding question C without a mechanism to invoke the PATCH outcome path yields orphan data with no actual test logic — which is worse than no seed at all (false sense of coverage).
- AC-3 states "Outcome→grade mapping documented in module docstring." The spec's intent for AC-3 is documentation correctness, not runtime exercise. Source review of `src/lib/fsrs.ts:6-9` (module docstring) and `fsrs.ts:27-33` (`outcomeToRating` switch) satisfies AC-3 as specified.
- The stability ordering assertion in finding 1 above provides indirect protection: if the Good/Again mapping were swapped, `stab_B < stab_A` would fail. A swapped Hard/Good mapping would not be caught by this smoke, but that is the narrow residual gap, and it is acknowledged explicitly in the smoke comment at line 202-203.

The comment-only documentation (instead of orphan seed rows) is the correct engineering choice for this scope.

---

### AC-to-test mapping

| AC | Test / smoke / inspection | Real surface? | Notes |
| --- | --- | --- | --- |
| AC-4 step 1 (seed) | `fsrs-smoke.mjs:68-101` — direct SQLite insert | YES (real DB) | Unchanged from cycle 1. Still correct. |
| AC-4 step 2 (pass path) | `fsrs-smoke.mjs:153-167` — three assertions | YES | Unchanged. `due_at > initDue`, `stability > 0`, `reps === 1`. |
| AC-4 step 3 (fail path) | `fsrs-smoke.mjs:172-189` — four assertions | YES | Cycle-2 adds the discriminating stability assertion. Now catches mapping inversion. |
| AC-3 (mapping documented) | Auditor source review of `fsrs.ts:6-9` + `fsrs.ts:27-33` | NO (inspection) | Acceptable — AC-3 is a doc/source-shape check. Partial runtime coverage via stability ordering assertion above. |

---

### Smoke coverage summary

Seven total assertions (inferred from the assertion list):
1. POST pass → HTTP 200
2. POST pass → `outcome=pass`
3. A: `due_at > initDue`
4. A: `stability > 0`
5. A: `reps === 1`
6. B: `due_at <= now + 24h`
7. B: `reps === 1`
8. B: `stability < A.stability` (NEW — cycle-2 fix)

That is 8 assertions. The footer will emit `[fsrs-smoke] all 8 assertions passed ✓` on success.

All eight assertions exercise the real POST `/api/attempts` handler via live HTTP and read back from real SQLite. No mocks. The harness is non-inferential (LBD-11 satisfied for the smoke shape).

The smoke remains NOT RUN in sandbox (no `node_modules`). Host carry-over M5-T01-HOST-02 persists. This is a LBD-15 operational constraint, not a finding.

---

### Residual gaps (non-blocking)

- **`partial`/Hard runtime coverage** — deferred by locked decision #4. Not a SDET objection; the deferral is technically justified and documented.
- **No teardown** — orphaned rows per run (flagged LOW in cycle 1). Unchanged. Non-blocking for a single-user local tool.
- **`f.repeat()` vs `f.next()`** — LOW-1 from cycle-1 audit. Outside SDET scope; flagged for the sr-dev review.

---

### Verdict

**SHIP**

Both cycle-1 MEDIUM findings are resolved:
1. The fail-path stability discriminating assertion is present, correctly placed, correctly formed, and non-trivially discriminating.
2. The partial-path deferral is technically justified, documented in the smoke and in the issue file, and the narrow residual gap (Hard/Good mapping inversion uncaught at runtime) is acknowledged explicitly.

The smoke harness satisfies AC-4 at the shape level for the surfaces exercisable without aiw-mcp. Host carry-over M5-T01-HOST-02 (live run + output citation) remains the gate for final AC-4 close.
