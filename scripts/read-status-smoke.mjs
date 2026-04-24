#!/usr/bin/env node
// scripts/read-status-smoke.mjs
//
// M3 T7 — Smoke test for /api/read_status CRUD.
// Marks 3 sections from ch_1, GETs them back, DELETEs one,
// GETs again to verify only 2 remain.

import { env } from 'node:process';

const PORT = env.PORT ?? '4321';
const ORIGIN = `http://localhost:${PORT}`;

const SECTION_IDS = [
  'ch_1-arrays-and-vectors-general-concept',
  'ch_1-the-motivation-one-name-many-values',
  'ch_1-zero-based-indexing',
];

async function api(method, path, body) {
  const res = await fetch(`${ORIGIN}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: res.status, body: parsed };
}

console.log(`[read-status-smoke] marking 3 sections from ch_1`);

// 1. POST 3 sections
for (const id of SECTION_IDS) {
  const r = await api('POST', '/api/read_status', { section_id: id });
  if (r.status !== 204) {
    console.error(`[read-status-smoke] FAIL — POST ${id} → ${r.status}`);
    process.exit(1);
  }
}
console.log(`[1] POST × 3 → all 204`);

// 2. GET — should return all 3
const get1 = await api('GET', '/api/read_status?chapter_id=ch_1');
console.log(`[2] GET → status ${get1.status}, count=${get1.body?.section_ids?.length}`);
if (get1.status !== 200 || get1.body?.section_ids?.length !== 3) {
  console.error('[read-status-smoke] FAIL — GET did not return 3 marked sections');
  process.exit(1);
}

// 3. DELETE one
const del = await api('DELETE', `/api/read_status/${encodeURIComponent(SECTION_IDS[0])}`);
console.log(`[3] DELETE one → status ${del.status}`);
if (del.status !== 204) {
  console.error('[read-status-smoke] FAIL — DELETE did not return 204');
  process.exit(1);
}

// 4. GET — should return 2
const get2 = await api('GET', '/api/read_status?chapter_id=ch_1');
console.log(`[4] GET (post-delete) → status ${get2.status}, count=${get2.body?.section_ids?.length}`);
if (get2.body?.section_ids?.length !== 2) {
  console.error('[read-status-smoke] FAIL — GET should return 2, got ' + get2.body?.section_ids?.length);
  process.exit(1);
}
if (get2.body.section_ids.includes(SECTION_IDS[0])) {
  console.error('[read-status-smoke] FAIL — deleted section still present');
  process.exit(1);
}

console.log('[read-status-smoke] all 4 steps passed ✓');
