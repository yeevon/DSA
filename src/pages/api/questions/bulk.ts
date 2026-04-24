// src/pages/api/questions/bulk.ts
//
// M3 T3 stub — POST /api/questions/bulk receives ai-workflows
// generated questions (validated twice per architecture.md §3.1).
// M4 impl.

import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () =>
  new Response(
    JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M4' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  );
