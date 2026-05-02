// src/pages/api/attempts/[id]/outcome.ts
// M4 T08 — PATCH /api/attempts/:id/outcome — transition pending → resolved.
// Called by the browser after polling getRunStatus for the grade run.
// Idempotency guard: returns 409 if attempt is already resolved (outcome ≠ 'pending').
// M5 T01 — after writing the resolved outcome, call applyAttempt() and
// UPSERT fsrs_state for the underlying question (llm_graded path).

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client';
import { attempts, fsrsState } from '../../../../db/schema';
import { applyAttempt, defaultState } from '../../../../lib/fsrs';

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

  // M5 T01 — wrap attempt UPDATE + fsrs_state UPSERT in a single transaction
  // so a crash between the two statements cannot leave the schedule out of sync
  // with the resolved outcome (sr-dev review #2).
  const resolvedAt = Date.now();
  db.transaction((tx) => {
    tx.update(attempts)
      .set({
        outcome,
        llmTagsJson: JSON.stringify({ score: score ?? null, feedback: feedback ?? null }),
      })
      .where(eq(attempts.id, id))
      .run();

    // Read current fsrs_state (or manufacture a default), apply outcome, UPSERT.
    const existingFsrs = tx.select().from(fsrsState).where(eq(fsrsState.questionId, attempt.questionId)).all();
    const currentState = existingFsrs.length > 0
      ? {
          stability: existingFsrs[0].stability,
          difficulty: existingFsrs[0].difficulty,
          due_at: existingFsrs[0].dueAt,
          last_review_at: existingFsrs[0].lastReviewAt ?? null,
          lapses: existingFsrs[0].lapses,
          reps: existingFsrs[0].reps,
        }
      : defaultState(resolvedAt);
    const { state: nextState } = applyAttempt(currentState, outcome as 'pass' | 'fail' | 'partial', resolvedAt);
    tx.insert(fsrsState).values({
      questionId: attempt.questionId,
      dueAt: nextState.due_at,
      stability: nextState.stability,
      difficulty: nextState.difficulty,
      lastReviewAt: nextState.last_review_at,
      lapses: nextState.lapses,
      reps: nextState.reps,
    }).onConflictDoUpdate({
      target: fsrsState.questionId,
      set: {
        dueAt: nextState.due_at,
        stability: nextState.stability,
        difficulty: nextState.difficulty,
        lastReviewAt: nextState.last_review_at,
        lapses: nextState.lapses,
        reps: nextState.reps,
      },
    }).run();
  });

  return new Response(
    JSON.stringify({ id, outcome }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
