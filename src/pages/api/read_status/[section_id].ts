// src/pages/api/read_status/[section_id].ts
//
// M3 T7 — DELETE /api/read_status/:section_id (un-mark).

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { readStatus } from '../../../db/schema';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.section_id;
  if (!id) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'section_id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  db.delete(readStatus).where(eq(readStatus.sectionId, id)).run();
  return new Response(null, { status: 204 });
};
