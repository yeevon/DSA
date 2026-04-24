# T4 — Seeding: chapters + sections from MDX

**Status:** todo
**Depends on:** T2 (schema)
**Blocks:** T6 + T7 (annotations + read-status reference `sections.id` FK)

## Why

[Architecture.md §2 "Seeding"](../../../architecture.md): on first boot (and after any rebuild), the state service reads:

- `scripts/chapters.json` (M2 T5a migrated this from the Jekyll `_data/chapters.yml`) → upserts `chapters`.
- `src/content/lectures/*.mdx` frontmatter (M2 T4 emits `sections: [{id, anchor, title, ord}, ...]` per chapter; canonical M3 seeding source per the §2 amendment) → upserts `sections`.

Idempotent — every boot can re-run without duplicate inserts. M4+ rows (`questions`, `attempts`, `fsrs_state`, `annotations`, `read_status`) are NOT touched by seeding; only content refs.

## Deliverable

- `src/lib/seed.ts` — exported `seed()` function. Reads `scripts/chapters.json` (require/import; bundled at build time) and `src/content/lectures/*.mdx` frontmatter (via Astro's `getCollection('lectures')`). Upserts both tables idempotently (`INSERT … ON CONFLICT(id) DO UPDATE …` via Drizzle's `onConflictDoUpdate`).
- `src/pages/api/health.ts` (from T3) extended to call `seed()` on first invocation per process — single-shot guard so it doesn't run on every health check. Subsequent boots are idempotent anyway, but skip the no-op work.
- Smoke script `scripts/seed-smoke.mjs` that calls `seed()` directly + queries DB to confirm row counts.

## Steps

1. Author `src/lib/seed.ts`:
   - Import the Drizzle client (T2) and the chapters/sections table refs.
   - Import `chapters.json` directly (it's a build-time JSON).
   - Use Astro's `getCollection('lectures')` for the section list — each entry's `data.sections` is the array T4 (M2) injected.
   - Two inserts: chapters (12 rows from JSON), sections (sum of all `entry.data.sections` arrays — should be ~370 across the corpus per M2 T4 audit counts).
   - `onConflictDoUpdate({ target: <id>, set: { … } })` for both.
2. Wire `seed()` into `health.ts`:
   - Module-level `let seeded = false;` flag.
   - On first GET, if `!seeded` then `await seed()` then `seeded = true`. Return health response.
3. Smoke: `scripts/seed-smoke.mjs` — instantiates the client, calls seed, queries `SELECT COUNT(*) FROM chapters` (expect 12) and `SELECT COUNT(*) FROM sections` (expect ~370 — confirm exact via M2 T4 logs: ch_1=80, ch_2=58, ch_3=102, ch_4=68, ch_5=9, ch_6=10, ch_7=5, ch_9=8, ch_10=13, ch_11=5, ch_12=2, ch_13=5 = 365).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/lib/seed.ts` exists; reads `scripts/chapters.json` + `getCollection('lectures')`.
- [ ] **Auditor runs** `node scripts/seed-smoke.mjs` from a clean DB (`rm data/cs-300.db && drizzle-kit push && node scripts/seed-smoke.mjs`). Output shows `chapters: 12` and `sections: 365`.
- [ ] **Auditor runs** the smoke script a second time without rebuilding. Counts unchanged (idempotent — `ON CONFLICT DO UPDATE` re-applies metadata but doesn't insert duplicates).
- [ ] `npm run dev` + `curl /api/health` returns 200; subsequent calls don't re-trigger the seed (verified by adding a row count log in seed and confirming it logs once per process).
- [ ] No `_data/chapters.yml` references in the seed code (T8/T5a contract still holds — the file is gone).

## Notes

- Section count is **365** based on M2 T4 audit per-chapter counts. If the actual count differs at audit time, that's a regression in M2 T4's frontmatter generation — flag and back-port a fix to `scripts/build-content.mjs` rather than fudging the seeder.
- Sections FK on `chapter_id` — chapters must seed before sections. Order matters even with idempotent upserts.
- Architecture.md §2 says "Questions and attempt state are never touched" by seeding. T4 honours that — only chapters + sections.
