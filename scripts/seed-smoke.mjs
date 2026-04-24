#!/usr/bin/env node
// scripts/seed-smoke.mjs
//
// M3 T4 — Standalone smoke for src/lib/seed.ts.
// Runs the seed function directly (via tsx since seed.ts is TS),
// then queries the DB to confirm expected row counts (12 chapters,
// 365 sections per M2 T4 actuals).
//
// Run via: npx tsx scripts/seed-smoke.mjs
// Or:      node --import tsx scripts/seed-smoke.mjs

import Database from 'better-sqlite3';

const DB_PATH = process.env.CS300_DB_PATH ?? 'data/cs-300.db';
const EXPECTED_CHAPTERS = 12;
const EXPECTED_SECTIONS = 365;

const { seed } = await import('../src/lib/seed.ts');

console.log('[seed-smoke] running seed (idempotent — safe to re-run)...');
const result = seed();
console.log(`[seed-smoke] seed returned: chapters=${result.chapters}, sections=${result.sections}`);

const sqlite = new Database(DB_PATH, { readonly: true });
const chapterCount = sqlite.prepare('SELECT COUNT(*) AS c FROM chapters').get().c;
const sectionCount = sqlite.prepare('SELECT COUNT(*) AS c FROM sections').get().c;
sqlite.close();

console.log(`[seed-smoke] DB row counts: chapters=${chapterCount}, sections=${sectionCount}`);

let ok = true;
if (chapterCount !== EXPECTED_CHAPTERS) {
  console.error(`[seed-smoke] FAIL — chapters expected ${EXPECTED_CHAPTERS}, got ${chapterCount}`);
  ok = false;
}
if (sectionCount !== EXPECTED_SECTIONS) {
  console.error(`[seed-smoke] FAIL — sections expected ${EXPECTED_SECTIONS}, got ${sectionCount}`);
  ok = false;
}

if (!ok) process.exit(1);
console.log('[seed-smoke] all expectations met ✓');
