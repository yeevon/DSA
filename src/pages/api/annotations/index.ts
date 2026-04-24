// src/pages/api/annotations/index.ts
//
// M3 T6 — annotations CRUD per architecture.md §3.4.
// GET /api/annotations?section_id=… → array for that section.
// POST /api/annotations → insert; returns the row.

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../../../db/client';
import { annotations } from '../../../db/schema';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const sectionId = url.searchParams.get('section_id');
  if (!sectionId) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'section_id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const rows = db.select().from(annotations).where(eq(annotations.sectionId, sectionId)).all();
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

interface PostBody {
  section_id?: string;
  offset_start?: number;
  offset_end?: number;
  text?: string;
}

export const POST: APIRoute = async ({ request }) => {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const { section_id, offset_start, offset_end, text } = body;
  if (!section_id || typeof offset_start !== 'number' || typeof offset_end !== 'number' || !text) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'section_id + offset_start + offset_end + text required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const row = {
    id: randomUUID(),
    sectionId: section_id,
    offsetStart: offset_start,
    offsetEnd: offset_end,
    text,
    createdAt: Date.now(),
  };
  db.insert(annotations).values(row).run();
  return new Response(JSON.stringify(row), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
