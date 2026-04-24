# T2 — Drizzle schema + initial migration

**Status:** ✅ done 2026-04-24 (1 cycle — see [`../issues/T2_issue.md`](../issues/T2_issue.md))
**Depends on:** T1 (Path A confirmed = Astro server owns SQLite)
**Blocks:** T4 (seeding needs the schema), T6 + T7 (data-layer surfaces)

## Why

[Architecture.md §2](../../../architecture.md) defines the SQLite schema (chapters, sections, questions, attempts, fsrs_state, read_status, annotations) + indexes. M3 needs that schema actually instantiated as Drizzle ORM definitions with a checked-in migration so subsequent tasks can `drizzle-kit push` and have a real DB to talk to.

Drizzle was settled in architecture.md §2: *"Drizzle. Rationale: lighter than Prisma, no runtime query engine, TypeScript-first, SQL feels like SQL. Migration story: check-in `drizzle/` artifacts, `drizzle-kit push` in dev."*

## Deliverable

- `npm install drizzle-orm drizzle-kit better-sqlite3` (+ types).
- `drizzle.config.ts` at repo root pointing at `src/db/schema.ts` + `drizzle/` migrations dir + the SQLite file path (gitignored locally; per-dev).
- `src/db/schema.ts` — TypeScript schema definitions for all 7 tables + 3 indexes per architecture.md §2. Strictly that schema; no extras (M4+ may add columns later).
- `drizzle/0000_initial.sql` (or generated equivalent) checked in.
- `src/db/client.ts` — exports a singleton Drizzle client (`drizzle(new Database(DB_PATH))`) so API routes import one client.
- `data/cs-300.db` (or wherever the path lands) gitignored via `.gitignore`.

## Steps

1. Install deps; `npm run build` still passes (Astro doesn't load the DB yet).
2. Author `src/db/schema.ts` matching architecture.md §2 *exactly* — column names, types, indexes, foreign keys. JSON columns (`topic_tags`, `answer_schema_json`, `reference_json`, `response_json`, `llm_tags_json`) typed as `text` per Drizzle SQLite convention.
3. `drizzle.config.ts`: set `dialect: 'sqlite'`, `schema`, `out: './drizzle'`, `dbCredentials.url: 'data/cs-300.db'`.
4. `drizzle-kit generate` → produces `drizzle/0000_initial.sql`. Inspect it; confirm DDL matches architecture §2.
5. `drizzle-kit push` (or `drizzle-kit migrate`) → applies to a local DB file. Verify file exists.
6. `src/db/client.ts` — export a default client.
7. Add `data/` to `.gitignore` (the SQLite file is per-dev state, not source).
8. Smoke: a tiny `scripts/db-smoke.mjs` that imports the client + runs a no-op query (e.g. `SELECT name FROM sqlite_master WHERE type='table'`) and prints the table list. Run it; confirm 7 tables.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `npm install` (cold) brings in `drizzle-orm`, `drizzle-kit`, `better-sqlite3`. `package.json` deps reflect.
- [ ] `src/db/schema.ts` defines all 7 tables (chapters, sections, questions, attempts, fsrs_state, read_status, annotations) + 3 indexes (`idx_questions_chapter`, `idx_attempts_question`, `idx_fsrs_due`). Auditor diffs against architecture.md §2; column names/types/FKs match exactly.
- [ ] `drizzle/0000_initial.sql` exists and contains `CREATE TABLE` for all 7 tables.
- [ ] **Auditor runs** `node scripts/db-smoke.mjs` and confirms output lists exactly 7 user tables (no junk; no missing).
- [ ] `data/` is gitignored; `git check-ignore -v data/cs-300.db` matches.
- [ ] `npm run build` still exits 0 (DB infrastructure doesn't break Astro static build).

## Notes

- **Don't add columns architecture.md doesn't have.** M4 (questions ingestion) adds workflow-specific fields if needed — those land in their own migration `0001_*.sql`.
- `better-sqlite3` chosen over `sqlite3` (callback-based) — Drizzle's docs recommend it for sync-friendly Node code. If install fails on the local platform, `bun:sqlite` is a fallback but requires Bun runtime; defer to T1 ADR if it comes up.
- The DB file path (`data/cs-300.db`) is convention; if the user prefers a different location, override in T1 ADR.
