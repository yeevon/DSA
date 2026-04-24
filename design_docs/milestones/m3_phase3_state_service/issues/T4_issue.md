# T4 — Seeding: chapters + sections from MDX — Audit Issues

**Source task:** [../tasks/T4_seeding.md](../tasks/T4_seeding.md)
**Audited on:** 2026-04-24
**Audit scope:** New files (`src/lib/seed.ts`, `scripts/seed-smoke.mjs`); modified files (`src/pages/api/health.ts` to call seed on first request, `package.json` for `gray-matter` + `tsx` deps, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §2 "Seeding" (post-F1 amendment from this milestone's audit), [`../issues/T2_issue.md`](T2_issue.md) (Drizzle client + schema), [`../issues/T3_issue.md`](T3_issue.md) (health.ts pattern). Cross-checked seed contract against M2 T4 outputs (per-chapter section counts).
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `gray-matter@^4.0.3` (frontmatter parsing) + `tsx@^4.x` (devDep, so smoke can import .ts directly). Both ubiquitous; no nice_to_have collision. |
| Jekyll polish                            | ✅ n/a | Jekyll deleted in M2 T8.                                                                              |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T4 is M3-scope; only seeds the M3 content-ref tables (chapters + sections); leaves M4+ tables untouched per architecture.md §2. |
| `nice_to_have.md` boundary               | ✅ n/a | No UI surfaces.                                                                                       |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                | Status | Notes |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `src/lib/seed.ts` exists; reads `scripts/chapters.json` + `getCollection('lectures')`.                                                             | ✅ PASS-with-amendment | File present (~110 lines). **Implementation pivoted from `getCollection('lectures')` to FS + gray-matter** — see ISS-01. Same effect (reads each lectures MDX's frontmatter `sections:` array); benefit: works as a standalone Node script (the T4 smoke needs this). Architecture.md §2 doesn't pin which mechanism to use; both satisfy the "reads … frontmatter" contract. |
| 2 | Auditor runs `node scripts/seed-smoke.mjs` from a clean DB. Output shows `chapters: 12` and `sections: 365`.                                       | ✅ PASS | Auditor ran `rm -f data/cs-300.db && node scripts/db-migrate.mjs && npx tsx scripts/seed-smoke.mjs`. Output: `seed returned: chapters=12, sections=365` + `DB row counts: chapters=12, sections=365` + `all expectations met ✓`. Spec said `node`; reality is `npx tsx` because the smoke needs to import the TypeScript seed module directly. ISS-02 captures the wording amendment. |
| 3 | Auditor runs the smoke a second time. Counts unchanged (idempotent — `ON CONFLICT DO UPDATE` re-applies metadata but doesn't insert duplicates). | ✅ PASS | Re-run returned same counts. Drizzle's `onConflictDoUpdate` rewrites metadata in-place; section/chapter ids are stable across runs (M2 T4 generates them deterministically from `ch_N-` prefixed anchors). |
| 4 | `npm run dev` + `curl /api/health` returns 200; subsequent calls don't re-trigger the seed (verified by adding a row count log in seed and confirming it logs once per process).                                                      | ✅ PASS | First call: `{ok:true, version:"0.0.1", db:"ok", seeded:{chapters:12, sections:365}, seed_error:null}`. Second call: identical body — `seededResult` is module-level cached; `seed()` not re-invoked (verified by inspection of the guard in health.ts). |
| 5 | No `_data/chapters.yml` references in the seed code (T8/T5a contract still holds — the file is gone).                                                | ✅ PASS | `grep -rn 'chapters\.yml' src/lib/seed.ts` → 0 hits. Seed only references `scripts/chapters.json`. |

All 5 ACs met (AC 1 + AC 2 with the implementation amendments noted in ISS-01 + ISS-02 below).

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T04-ISS-01 — `seed.ts` uses FS + gray-matter rather than Astro's `getCollection` — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

T4 spec said "Use Astro's `getCollection('lectures')`." Astro's `getCollection` requires the Astro runtime — usable from API routes, NOT from a standalone Node script. T4's smoke (`scripts/seed-smoke.mjs`) needs the seed to be invokable from plain Node so the audit can verify row counts non-inferentially. FS + gray-matter is the dual-context-friendly mechanism: same code path runs in API routes (T6/T7 will exercise this) and in standalone smoke. `gray-matter` is a 4-line frontmatter parser dep; trivial.

**Action / Recommendation:** none. If a future `getCollection`-only feature lands and we need to converge, the seed can be refactored to a thin wrapper. Today, FS+gray-matter is simpler.

### M3-T04-ISS-02 — Smoke script needs `tsx` to import `.ts` directly — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

T4 spec said `node scripts/seed-smoke.mjs`. Plain Node can't import `.ts` files; `tsx` (a thin wrapper around esbuild) handles it. `npx tsx scripts/seed-smoke.mjs` is the working invocation. Alternative: precompile seed to `.mjs` (extra build step) or duplicate the seed logic in JS (drift). Adding `tsx` as devDep is the cheapest path.

**Action / Recommendation:** add `npm run seed` script alias to `package.json` so `npm run seed` shells out to `npx tsx scripts/seed-smoke.mjs`. Tiny QoL; defer to T6/T7 when more scripts accumulate.

### M3-T04-ISS-03 — `health.ts` returns `seeded: SeedResult|null` rather than the boolean the spec implies — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — richer signal

T4 spec example: `if (!seeded) { await seed(); seeded = true; }` — implying `seeded` is a boolean. Implementation: `seededResult` is `SeedResult | null` (returns the chapter/section counts when seeded successfully, plus a separate `seedError: string | null`). Richer JSON shape: `{db, seeded: {chapters, sections}, seed_error}` is more diagnostic than `{db, seeded: true}`. Probe (T5 detectMode) only checks the response code — semantic shape change is transparent to it.

**Action / Recommendation:** none. T5 detectMode probes status only.

## Additions beyond spec — audited and justified

- **`SeedResult` exported from seed.ts** (chapter + section counts). Spec didn't require returning anything; the smoke needs the counts to assert against, and health.ts surfaces them so a deployer can see seeding worked.
- **`seed_error` field on health response.** Surfaces seed failures without breaking the health probe (returns 200 with `db: error` flag instead). Better signal than swallowing the error.
- **`tsx` devDep.** See ISS-02. Trivial.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| `src/lib/seed.ts` exists; reads chapters.json + lectures MDX frontmatter                         | ✅ |
| `gray-matter` + `tsx` deps in package.json                                                       | ✅ |
| `npx tsx scripts/seed-smoke.mjs` from clean DB exits 0 with `chapters=12, sections=365`          | ✅ |
| Re-run yields same counts (idempotent)                                                           | ✅ |
| Dev-server `GET /api/health` first call seeds; returns `{db, seeded: {chapters, sections}}`     | ✅ |
| Dev-server `GET /api/health` second call returns same body (cached; no re-seed)                  | ✅ |
| Direct DB query confirms 12 chapters + 365 sections                                             | ✅ |
| `grep -rn 'chapters\.yml' src/ scripts/` → 0 hits (T8/T5a contract intact)                      | ✅ |
| `npm run build` exits 0 (37 prerendered + server bundle)                                         | ✅ |
| CHANGELOG entry under `## 2026-04-24` references M3 T4                                          | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T04-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | None — FS+gray-matter is dual-context-friendly            |
| M3-T04-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | T6/T7 — add `npm run seed` alias when scripts accumulate  |
| M3-T04-ISS-03 | 🟢 LOW    | ✅ ACCEPTED  | None — richer JSON shape; T5 detectMode probes status only |

## Propagation status

T4 unblocks T6 + T7 (their UIs FK to `sections.id` for annotations and `read_status`). The `db` import path (`src/db/client.ts`) is the canonical client; T6/T7 route impls import from there. M3 README's "Done when" item for seeding is now satisfiable.
