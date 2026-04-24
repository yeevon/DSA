# T2 — Drizzle schema + initial migration — Audit Issues

**Source task:** [../tasks/T2_drizzle_schema.md](../tasks/T2_drizzle_schema.md)
**Audited on:** 2026-04-24
**Audit scope:** New files (`src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `drizzle/0000_tiny_bug.sql` + `drizzle/meta/`, `scripts/db-migrate.mjs`, `scripts/db-smoke.mjs`); modified files (`package.json` deps, `package-lock.json`, `.gitignore` `data/` entry, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §2 (table/column/index spec — diffed line-by-line), [`../issues/T1_issue.md`](T1_issue.md) (Path A confirmed, drives Drizzle + better-sqlite3 choice), [`../../../adr/0001_state_service_hosting.md`](../../../adr/0001_state_service_hosting.md). Smoke checks executed by the auditor: `rm data/cs-300.db && node scripts/db-migrate.mjs && node scripts/db-smoke.mjs`; full `npm run build`.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `drizzle-orm@0.45.2` + `better-sqlite3@12.9.0` (deps), `drizzle-kit@0.31.10` + `@types/better-sqlite3@7.6.13` (devDeps). All 4 sanctioned by ADR 0001 (Path A) + architecture.md §2 ("Drizzle … rationale … `better-sqlite3`"). |
| Jekyll polish                            | ✅ n/a | No Jekyll surface (deleted in M2 T8).                                                                 |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T2 is M3-scope; Path A confirmed by T1; Drizzle is the architectural choice.                          |
| `nice_to_have.md` boundary               | ✅ n/a | No UI surfaces; nice_to_have entry untouched.                                                         |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                  | Status | Notes |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `npm install` (cold) brings in `drizzle-orm`, `drizzle-kit`, `better-sqlite3`. `package.json` deps reflect.                                                                          | ✅ PASS | All four deps present in `package.json`: `drizzle-orm@^0.45.2` + `better-sqlite3@^12.9.0` (deps), `drizzle-kit@^0.31.10` + `@types/better-sqlite3@^7.6.13` (devDeps). |
| 2 | `src/db/schema.ts` defines all 7 tables + 3 indexes. Auditor diffs against architecture.md §2; column names/types/FKs match exactly.                                                   | ✅ PASS | All 7 tables defined: chapters (5 cols), sections (5 cols + FK chapter_id), questions (11 cols + FKs chapter_id/section_id + idx_questions_chapter on (chapter_id, status)), attempts (7 cols + FK question_id + idx_attempts_question on (question_id, submitted_at)), fsrs_state (7 cols + FK question_id + idx_fsrs_due on (due_at)), read_status (2 cols + FK section_id), annotations (6 cols + FK section_id). Diffed against arch §2 — column names + SQL types match exactly. JSON columns typed as `text` per Drizzle SQLite convention. |
| 3 | `drizzle/0000_initial.sql` exists and contains `CREATE TABLE` for all 7 tables.                                                                                                       | ✅ PASS-with-note | File present at `drizzle/0000_tiny_bug.sql` (drizzle-kit auto-generated the suffix; semantic shape is what matters). Contains `CREATE TABLE` for all 7 + `CREATE INDEX` for all 3. ON DELETE/UPDATE = no action (Drizzle default; arch §2 doesn't pin cascades). See ISS-01 for the auto-name nit. |
| 4 | Auditor runs `node scripts/db-smoke.mjs` and confirms output lists exactly 7 user tables (no junk; no missing).                                                                       | ✅ PASS | Auditor ran `rm -f data/cs-300.db && node scripts/db-migrate.mjs && node scripts/db-smoke.mjs`. Output: 7 tables (annotations, attempts, chapters, fsrs_state, questions, read_status, sections) + bonus check on 3 indexes (idx_attempts_question, idx_fsrs_due, idx_questions_chapter). Smoke script also asserts the full set via `expected` arrays — fails loud on any drift. |
| 5 | `data/` is gitignored; `git check-ignore -v data/cs-300.db` matches.                                                                                                                  | ✅ PASS | `.gitignore` line 100: `data/`. `git check-ignore` confirms (DB file not in git status). |
| 6 | `npm run build` still exits 0 (DB infrastructure doesn't break Astro static build).                                                                                                  | ✅ PASS | `37 page(s) built in 8.11s`; no errors. DB module not yet imported by any page — T3 wires it. |

All 6 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T02-ISS-01 — Migration filename `0000_tiny_bug.sql` (drizzle-kit auto-suffix) — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

`drizzle-kit generate` auto-names migrations with a random adjective+noun suffix (`0000_tiny_bug.sql`). T2 spec used the placeholder `0000_initial.sql` for clarity. The actual filename is harmless — Drizzle's migrator reads `drizzle/meta/_journal.json` for the apply-order, not the filename. Renaming the file to `0000_initial.sql` would also require updating the journal entry; not worth the friction.

**Action / Recommendation:** none. If a future migration author wants to override, drizzle-kit accepts `--name` flag.

### M3-T02-ISS-02 — `db-migrate.mjs` over `drizzle-kit push` — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

T2 spec step 5 said `drizzle-kit push`; in practice that command requires a TTY (interactive prompts for destructive changes confirmation) and fails in headless CI / non-interactive shells. T2 instead ships `scripts/db-migrate.mjs` using the programmatic migrator (`migrate()` from `drizzle-orm/better-sqlite3/migrator`) which applies the same generated migration files non-interactively.

**Action / Recommendation:** add `npm run db:migrate` as a script alias in `package.json` (T3 will likely want this anyway when wiring the seed). Doc-level: T2 spec wording could be amended to mention the migrator script over `push`, but it's a minor in-task implementation detail.

### M3-T02-ISS-03 — `better-sqlite3` major version is 12 (T2 spec didn't pin) — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

`better-sqlite3@12.9.0` installed today. Drizzle's `better-sqlite3` adapter supports v9-v12 per their docs. T2 spec didn't pin a version. Future major bumps may require an adapter version bump too.

**Action / Recommendation:** none today. If a future audit hits adapter incompatibility, document in T2 spec or a follow-up issue.

## Additions beyond spec — audited and justified

- **`scripts/db-migrate.mjs` over `drizzle-kit push`** (see ISS-02). Headless-friendly; spec-spirit preserved.
- **`scripts/db-smoke.mjs` extended to assert 3 indexes** in addition to the 7 tables T2 spec asked for. Cheap belt-and-braces against schema drift; matches arch §2's full table-and-index spec.
- **`src/db/client.ts` sets WAL + foreign_keys pragmas.** Spec didn't require; included because (a) WAL gives concurrent reader throughput which matters once T3's API routes share the connection, and (b) `foreign_keys = ON` is SQLite's safer default (it's OFF without the pragma). Both are 2-line additions; reversible.
- **`CS300_DB_PATH` env override** in client + migrate + smoke scripts. Spec used the hard-coded `data/cs-300.db`; env override lets T6/T7 smoke tests use ephemeral DBs without clobbering dev state. Cheap.

## Verification summary

| Check                                                                                        | Result |
| -------------------------------------------------------------------------------------------- | ------ |
| `npm install` cold; `drizzle-orm`, `drizzle-kit`, `better-sqlite3`, `@types/better-sqlite3` all present | ✅ |
| `src/db/schema.ts` defines all 7 tables + 3 indexes; column names/types/FKs match arch §2     | ✅ |
| `drizzle/0000_*.sql` exists + contains `CREATE TABLE` × 7 + `CREATE INDEX` × 3                | ✅ |
| Auditor `rm -f data/cs-300.db && node scripts/db-migrate.mjs && node scripts/db-smoke.mjs`    | ✅ exit 0 |
| smoke output: exactly 7 user tables (annotations, attempts, chapters, fsrs_state, questions, read_status, sections) | ✅ |
| smoke output: 3 user indexes (idx_attempts_question, idx_fsrs_due, idx_questions_chapter)     | ✅ |
| `data/` gitignored                                                                           | ✅ |
| `npm run build` still exits 0; 37 pages                                                      | ✅ |
| CHANGELOG entry under `## 2026-04-24` references M3 T2                                       | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T02-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | None — drizzle-kit auto-name; journal manages apply-order |
| M3-T02-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | T3 — add `npm run db:migrate` alias when wiring seed      |
| M3-T02-ISS-03 | 🟢 LOW    | ✅ ACCEPTED  | None — track if a future major bump breaks the adapter    |

## Propagation status

T2 unblocks T4 (seeding needs the schema), T6 + T7 (data-layer surfaces). The Drizzle client export at `src/db/client.ts` is the canonical import point; T3 (API routes), T4 (seed), T6/T7 (route impls) all import `db` from there.
