#!/usr/bin/env node
// scripts/db-smoke.mjs
//
// M3 T2 — Sanity check: list user tables in the SQLite DB.
// Expects exactly 7 tables matching architecture.md §2.

import Database from 'better-sqlite3';

const DB_PATH = process.env.CS300_DB_PATH ?? 'data/cs-300.db';

const sqlite = new Database(DB_PATH, { readonly: true });
const rows = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%' ORDER BY name")
  .all();

console.log(`[db-smoke] ${DB_PATH}: ${rows.length} user tables`);
for (const r of rows) console.log(`  - ${r.name}`);

const expected = ['annotations', 'attempts', 'chapters', 'fsrs_state', 'questions', 'read_status', 'sections'];
const got = rows.map((r) => r.name);
const missing = expected.filter((e) => !got.includes(e));
const extra = got.filter((g) => !expected.includes(g));

if (missing.length || extra.length) {
  console.error(`[db-smoke] FAIL — missing=${missing.join(',')} extra=${extra.join(',')}`);
  process.exit(1);
}
console.log('[db-smoke] all 7 tables present ✓');

const indexes = sqlite
  .prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all();
console.log(`[db-smoke] ${indexes.length} user indexes:`);
for (const i of indexes) console.log(`  - ${i.name} on ${i.tbl_name}`);

const expectedIndexes = ['idx_attempts_question', 'idx_fsrs_due', 'idx_questions_chapter'];
const gotIndexes = indexes.map((i) => i.name);
const missingIdx = expectedIndexes.filter((e) => !gotIndexes.includes(e));
if (missingIdx.length) {
  console.error(`[db-smoke] FAIL — missing indexes: ${missingIdx.join(',')}`);
  process.exit(1);
}
console.log('[db-smoke] all 3 indexes present ✓');

sqlite.close();
