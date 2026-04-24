// src/pages/api/review/due.ts
//
// M3 T3 stub — GET /api/review/due returns review queue items
// ordered by due_at; M5 (FSRS) impl.

import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M5' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  );
