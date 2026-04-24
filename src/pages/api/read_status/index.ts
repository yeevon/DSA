// src/pages/api/read_status/index.ts
//
// M3 T7 — read-status CRUD per architecture.md §3.4.
// GET /api/read_status?chapter_id=… → { section_ids: [...] } for
// all marked sections in that chapter (joined via sections.chapter_id).
// POST /api/read_status → upsert { section_id }; refreshes read_at.

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { readStatus, sections } from '../../../db/schema';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const chapterId = url.searchParams.get('chapter_id');
  if (!chapterId) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'chapter_id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const rows = db
    .select({ sectionId: readStatus.sectionId })
    .from(readStatus)
    .innerJoin(sections, eq(sections.id, readStatus.sectionId))
    .where(eq(sections.chapterId, chapterId))
    .all();
  return new Response(JSON.stringify({ section_ids: rows.map((r) => r.sectionId) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

interface PostBody {
  section_id?: string;
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
  const { section_id } = body;
  if (!section_id) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'section_id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  db.insert(readStatus)
    .values({ sectionId: section_id, readAt: Date.now() })
    .onConflictDoUpdate({ target: readStatus.sectionId, set: { readAt: Date.now() } })
    .run();
  return new Response(null, { status: 204 });
};
