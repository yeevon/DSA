#!/usr/bin/env node
// scripts/annotations-smoke.mjs
//
// M3 T6 — Smoke test for /api/annotations CRUD.
// Runs POST → GET → DELETE → GET cycle against the dev server.
// Requires the dev server running (default port 4321; override
// with PORT env var). Uses a real section_id from ch_1.

import { argv, env } from 'node:process';

const PORT = env.PORT ?? '4321';
const ORIGIN = `http://localhost:${PORT}`;
const SECTION_ID = argv[2] ?? 'ch_1-arrays-and-vectors-general-concept';

async function api(method, path, body) {
  const res = await fetch(`${ORIGIN}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed };
}

console.log(`[annotations-smoke] section_id=${SECTION_ID}`);

// 1. POST
const post = await api('POST', '/api/annotations', {
  section_id: SECTION_ID,
  offset_start: 0,
  offset_end: 10,
  text: 'smoke test annotation',
});
console.log(`[1] POST → status ${post.status}, id=${post.body?.id}`);
if (post.status !== 201 || !post.body?.id) {
  console.error('[annotations-smoke] FAIL — POST did not return 201 + id');
  process.exit(1);
}
const annotationId = post.body.id;

// 2. GET — should include the inserted row
const get1 = await api('GET', `/api/annotations?section_id=${SECTION_ID}`);
console.log(`[2] GET → status ${get1.status}, count=${get1.body?.length}`);
const found = get1.body?.find((a) => a.id === annotationId);
if (!found) {
  console.error('[annotations-smoke] FAIL — GET did not include the inserted row');
  process.exit(1);
}

// 3. DELETE
const del = await api('DELETE', `/api/annotations/${annotationId}`);
console.log(`[3] DELETE → status ${del.status}`);
if (del.status !== 204) {
  console.error('[annotations-smoke] FAIL — DELETE did not return 204');
  process.exit(1);
}

// 4. GET — should NOT include the row
const get2 = await api('GET', `/api/annotations?section_id=${SECTION_ID}`);
console.log(`[4] GET (post-delete) → status ${get2.status}, count=${get2.body?.length}`);
const stillThere = get2.body?.find((a) => a.id === annotationId);
if (stillThere) {
  console.error('[annotations-smoke] FAIL — DELETE did not remove the row');
  process.exit(1);
}

console.log('[annotations-smoke] all 4 steps passed ✓');
