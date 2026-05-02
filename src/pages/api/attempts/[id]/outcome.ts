// src/pages/api/attempts/[id]/outcome.ts
// M4 T08 — PATCH /api/attempts/:id/outcome — transition pending → resolved.
// Called by the browser after polling getRunStatus for the grade run.
// Idempotency guard: returns 409 if attempt is already resolved (outcome ≠ 'pending').

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client';
import { attempts } from '../../../../db/schema';

export const prerender = false;

interface OutcomeBody {
  outcome?: string;
  score?: number;
  feedback?: string;
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'id required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: OutcomeBody;
  try {
    body = (await request.json()) as OutcomeBody;
  } catch {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { outcome, score, feedback } = body;
  if (!outcome || !['pass', 'fail', 'partial'].includes(outcome)) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: "outcome must be 'pass', 'fail', or 'partial'" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rows = db.select().from(attempts).where(eq(attempts.id, id)).all();
  if (rows.length === 0) {
    return new Response(
      JSON.stringify({ kind: 'not_found', message: `attempt '${id}' not found` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const attempt = rows[0];

  // Idempotency guard: only allow transition from 'pending'.
  if (attempt.outcome !== 'pending') {
    return new Response(
      JSON.stringify({ kind: 'conflict', message: `attempt outcome already resolved: '${attempt.outcome}'` }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }

  db.update(attempts)
    .set({
      outcome,
      llmTagsJson: JSON.stringify({ score: score ?? null, feedback: feedback ?? null }),
    })
    .where(eq(attempts.id, id))
    .run();

  return new Response(
    JSON.stringify({ id, outcome }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
