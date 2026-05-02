// src/pages/api/attempts.ts
// M4 T06 — POST /api/attempts: evaluate mc/short synchronously;
// llm_graded → 501 (T08); code → 501 (M6).

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../../db/client';
import { questions, attempts } from '../../db/schema';
import { evaluateMc } from '../../lib/evaluators/mc';
import { evaluateShort } from '../../lib/evaluators/short';

export const prerender = false;

interface AttemptBody {
  question_id?: string;
  started_at?: number;
  response?: Record<string, unknown>;
}

export const POST: APIRoute = async ({ request }) => {
  let body: AttemptBody;
  try {
    body = (await request.json()) as AttemptBody;
  } catch {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { question_id, started_at, response: resp } = body;
  if (!question_id || typeof started_at !== 'number' || !resp) {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'question_id, started_at, response required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rows = db.select().from(questions).where(eq(questions.id, question_id)).all();
  if (rows.length === 0) {
    return new Response(
      JSON.stringify({ kind: 'not_found', message: `question '${question_id}' not found` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const question = rows[0];

  if (question.type === 'llm_graded') {
    return new Response(
      JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M4 T08' }),
      { status: 501, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (question.type === 'code') {
    return new Response(
      JSON.stringify({ kind: 'not_implemented', impl_milestone: 'M6' }),
      { status: 501, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let outcome: 'pass' | 'fail' | 'partial' = 'fail';
  try {
    const answerSchema = JSON.parse(question.answerSchemaJson) as Record<string, unknown>;
    if (question.type === 'mc') {
      outcome = evaluateMc(
        answerSchema as { correct_ix: number },
        resp as { chosen_ix: number },
      );
    } else if (question.type === 'short') {
      outcome = evaluateShort(
        answerSchema as { match: 'exact' | 'fuzzy' | 'numeric'; expected: string; tol?: number },
        resp as { text: string },
      );
    } else {
      return new Response(
        JSON.stringify({ kind: 'bad_request', message: `unsupported question type '${question.type}'` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ kind: 'bad_request', message: 'could not evaluate: answer_schema or response malformed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const id = randomUUID();
  const submittedAt = Date.now();
  db.insert(attempts).values({
    id,
    questionId: question_id,
    startedAt: started_at,
    submittedAt,
    responseJson: JSON.stringify(resp),
    outcome,
    llmTagsJson: null,
  }).run();

  return new Response(
    JSON.stringify({ id, outcome, submitted_at: submittedAt }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
