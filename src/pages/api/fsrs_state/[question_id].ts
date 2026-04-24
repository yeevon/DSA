// src/pages/api/fsrs_state/[question_id].ts
//
// M3 T3 stub — PATCH /api/fsrs_state/:question_id upserts the
// FSRS scheduling state per architecture.md §3.4. M5 impl
// (ts-fsrs runs client-side; this endpoint persists the result).

import type { APIRoute } from 'astro';

export const prerender = false;

export const PATCH: APIRoute = async () =>
  new Response(
    JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M5' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  );
