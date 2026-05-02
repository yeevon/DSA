#!/usr/bin/env node
// scripts/fsrs-smoke.mjs
// M5 T01 — Non-inferential smoke for the FSRS integration.
// Verifies that POST /api/attempts advances fsrs_state correctly
// for both a 'pass' (Good) and a 'fail' (Again) outcome.
//
// AC-4 assertions:
//  1. Seeds two test questions + default fsrs_state rows each.
//  2. POSTs a 'pass' attempt for question A → due_at shifts forward,
//     stability increases.
//  3. POSTs a 'fail' attempt for question B → due_at ≈ now (re-review
//     soon), stability ≈ 0 (reset toward minimum).
//  4. Footer: [fsrs-smoke] all <N> assertions passed ✓
//
// Run: node scripts/fsrs-smoke.mjs
// Requires the state service (Astro dev or start) at CS300_API_BASE
// (default http://127.0.0.1:4321) and a seeded DB with at least one
// chapter row ('ch_1').

import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

const BASE = process.env.CS300_API_BASE ?? 'http://127.0.0.1:4321';
const DB_PATH = process.env.CS300_DB_PATH ?? 'data/cs-300.db';

let assertions = 0;
let failures = 0;

function assert(label, condition, detail = '') {
  assertions++;
  if (condition) {
    console.log(`[fsrs-smoke]   PASS: ${label}`);
  } else {
    console.error(`[fsrs-smoke]   FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failures++;
  }
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  return { status: r.status, body: json };
}

// ── Seed two mc questions directly into SQLite (bypass bulk endpoint
//    to keep the smoke self-contained and avoid chapter/section deps
//    beyond 'ch_1', which is inserted by the seed script).
const sqlite = new Database(DB_PATH);

const SOURCE_RUN_ID = `fsrs-smoke-${Date.now()}`;
const Q_PASS_ID = randomUUID();
const Q_FAIL_ID = randomUUID();
const now = Date.now();

// Ensure ch_1 exists (seed may not have run).
const chRow = sqlite.prepare("SELECT id FROM chapters WHERE id = 'ch_1'").get();
if (!chRow) {
  sqlite.prepare(
    "INSERT OR IGNORE INTO chapters (id, n, title, subtitle, required) VALUES ('ch_1', 1, 'Test Chapter', NULL, 1)"
  ).run();
  console.log('[fsrs-smoke] inserted ch_1 placeholder');
}

const insertQ = sqlite.prepare(`
  INSERT INTO questions (id, chapter_id, section_id, type, topic_tags, prompt_md,
    answer_schema_json, reference_json, source_run_id, created_at, status)
  VALUES (?, 'ch_1', NULL, 'mc', '[]', ?, ?, '{}', ?, ?, 'active')
`);

insertQ.run(
  Q_PASS_ID,
  'Question A (pass test)',
  JSON.stringify({ correct_ix: 0 }),
  SOURCE_RUN_ID,
  now,
);
insertQ.run(
  Q_FAIL_ID,
  'Question B (fail test)',
  JSON.stringify({ correct_ix: 1 }),
  SOURCE_RUN_ID,
  now,
);
console.log(`[fsrs-smoke] seeded questions: A=${Q_PASS_ID.slice(0, 8)} B=${Q_FAIL_ID.slice(0, 8)}`);

// Seed default fsrs_state for both questions directly (mirrors what
// POST /api/questions/bulk now does via defaultState()).
// We seed at 'now - 1 min' so due_at is in the past (immediately reviewable).
const initDue = now - 60_000;
const insertFsrs = sqlite.prepare(`
  INSERT OR REPLACE INTO fsrs_state
    (question_id, due_at, stability, difficulty, last_review_at, lapses, reps)
  VALUES (?, ?, 0.0, 5.0, NULL, 0, 0)
`);
insertFsrs.run(Q_PASS_ID, initDue);
insertFsrs.run(Q_FAIL_ID, initDue);
console.log('[fsrs-smoke] seeded fsrs_state rows (stability=0, difficulty=5, due_at=now-1min)');
sqlite.close();

// ── POST 'pass' attempt for question A ──────────────────────────────
console.log('[fsrs-smoke] posting pass attempt for question A...');
const passResp = await post('/api/attempts', {
  question_id: Q_PASS_ID,
  started_at: now - 5000,
  response: { chosen_ix: 0 },   // correct → outcome='pass'
});

assert(
  'POST /api/attempts (pass) returns HTTP 200',
  passResp.status === 200,
  `got ${passResp.status}`,
);
assert(
  'POST /api/attempts (pass) outcome=pass',
  passResp.body.outcome === 'pass',
  JSON.stringify(passResp.body),
);

// ── POST 'fail' attempt for question B ──────────────────────────────
console.log('[fsrs-smoke] posting fail attempt for question B...');
const failResp = await post('/api/attempts', {
  question_id: Q_FAIL_ID,
  started_at: now - 5000,
  response: { chosen_ix: 0 },   // wrong (correct_ix=1) → outcome='fail'
});

assert(
  'POST /api/attempts (fail) returns HTTP 200',
  failResp.status === 200,
  `got ${failResp.status}`,
);
assert(
  'POST /api/attempts (fail) outcome=fail',
  failResp.body.outcome === 'fail',
  JSON.stringify(failResp.body),
);

// ── Read back fsrs_state from SQLite ────────────────────────────────
const sqlite2 = new Database(DB_PATH, { readonly: true });
const fsrsA = sqlite2.prepare('SELECT * FROM fsrs_state WHERE question_id = ?').get(Q_PASS_ID);
const fsrsB = sqlite2.prepare('SELECT * FROM fsrs_state WHERE question_id = ?').get(Q_FAIL_ID);
sqlite2.close();

console.log('[fsrs-smoke] fsrs_state after attempts:');
console.log('  A (pass):', JSON.stringify(fsrsA));
console.log('  B (fail):', JSON.stringify(fsrsB));

// Pass: due_at should have shifted forward (> initDue) and reps > 0.
assert(
  'A (pass): due_at advanced past initial due_at',
  fsrsA && fsrsA.due_at > initDue,
  `due_at=${fsrsA?.due_at} vs initDue=${initDue}`,
);
assert(
  'A (pass): stability > 0 after Good rating',
  fsrsA && fsrsA.stability > 0,
  `stability=${fsrsA?.stability}`,
);
assert(
  'A (pass): reps incremented to 1',
  fsrsA && fsrsA.reps === 1,
  `reps=${fsrsA?.reps}`,
);

// Fail: due_at should be near-term (within 24 h of now) and stability
// should remain at or near the Again-reset minimum.
const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;
assert(
  'B (fail): due_at is within 24 h (re-review soon)',
  fsrsB && fsrsB.due_at <= now + TWENTY_FOUR_H,
  `due_at=${fsrsB?.due_at} now=${now}`,
);
assert(
  'B (fail): reps incremented to 1',
  fsrsB && fsrsB.reps === 1,
  `reps=${fsrsB?.reps}`,
);
// Discriminating assertion against a swapped grade mapping
// (sr-sdet cycle-1 finding #1): an Again rating must produce a
// substantially lower stability than a Good rating on the same seed.
assert(
  'B (fail): stability < A (pass) stability — Again does not produce a Good-level schedule',
  fsrsB && fsrsA && fsrsB.stability < fsrsA.stability,
  `stab_B=${fsrsB?.stability} stab_A=${fsrsA?.stability}`,
);

// ── 'partial' / Hard path coverage note (sr-sdet cycle-1 finding #2) ─
// The cs-300 mc/short evaluators only emit 'pass' or 'fail'. The 'partial'
// outcome arrives via the llm_graded async path (PATCH /api/attempts/[id]/outcome)
// after the grade workflow completes. End-to-end runtime coverage of 'partial'
// therefore requires aiw-mcp + Ollama running and a multi-step orchestration
// (POST → poll → PATCH partial). That extends beyond this smoke's scope.
//
// AC-3 mapping for 'partial' (Hard) is verified by source review of
// src/lib/fsrs.ts (outcomeToRating switch). The discriminating stability
// ordering (B fail < A pass) above already catches grade-mapping inversions
// for the two end-cases; a swapped Hard/Good mapping would require a
// dedicated llm_graded smoke (file as M5 follow-up if a future cycle needs
// runtime partial coverage).
console.log('[fsrs-smoke] partial-path coverage: source review (AC-3); runtime end-to-end deferred to a future llm_graded smoke');

// ── Summary ─────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(`[fsrs-smoke] FAIL — ${failures}/${assertions} assertions failed`);
  process.exit(1);
} else {
  console.log(`[fsrs-smoke] all ${assertions} assertions passed ✓`);
}
