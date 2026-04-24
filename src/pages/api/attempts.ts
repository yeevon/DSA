// src/pages/api/attempts.ts
//
// M3 T3 stub — POST /api/attempts dispatches by question type per
// architecture.md §3.2. mc/short land in M4; llm_graded in M5;
// code in M6. Stub returns 501 until then.

import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () =>
  new Response(
    JSON.stringify({
      kind: 'not_implemented',
      impl_milestone: 'M4 (mc, short) | M5 (llm_graded) | M6 (code)',
    }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  );
