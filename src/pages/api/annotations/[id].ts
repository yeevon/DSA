// src/pages/api/annotations/[id].ts
//
// M3 T6 — DELETE /api/annotations/:id (hard delete).

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { annotations } from '../../../db/schema';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  db.delete(annotations).where(eq(annotations.id, id)).run();
  return new Response(null, { status: 204 });
};
