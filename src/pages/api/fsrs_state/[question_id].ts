// src/pages/api/fsrs_state/[question_id].ts
//
// M3 T3 stub — was originally the client-to-server PATCH path for FSRS state.
// M5 T01 moved ts-fsrs.next() server-side: the attempts handler updates
// fsrs_state directly per architecture.md §3.5. This endpoint is no longer the
// cs-300 update path; it remains as a 501 placeholder for any future
// direct-state-update use case (e.g. operator manual override).

import type { APIRoute } from 'astro';

export const prerender = false;

export const PATCH: APIRoute = async () =>
  new Response(
    JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M5' }),
    { status: 501, headers: { 'Content-Type': 'application/json' } },
  );
