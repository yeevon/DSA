// src/pages/api/questions/bulk.ts
// M4 T05 — POST /api/questions/bulk: validate + batch-insert
// generated questions. architecture.md §3.1: schema conformance
// validation runs here; workflow ValidateStep is the upstream leg.

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '../../../db/client';
import { chapters, sections, questions } from '../../../db/schema';
import { validateAnswerSchema, validateReference } from '../../../lib/question-schemas';

export const prerender = false;

interface QuestionInput {
  type?: string;
  prompt_md?: string;
  topic_tags?: unknown;
  answer_schema?: unknown;
  reference?: unknown;
}

interface BulkBody {
  source_run_id?: string;
  chapter_id?: string;
  section_id?: string | null;
  questions?: QuestionInput[];
}

export const POST: APIRoute = async ({ request }) => {
  let body: BulkBody;
  try {
    body = (await request.json()) as BulkBody;
  } catch {
    return new Response(
      JSON.stringify({ kind: 'validation_failed', errors: ['invalid JSON body'] }),
      { status: 422, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { source_run_id, chapter_id, section_id, questions: qs } = body;

  const topErrors: string[] = [];
  if (!source_run_id) topErrors.push('source_run_id required');
  if (!chapter_id) topErrors.push('chapter_id required');
  if (!Array.isArray(qs) || qs.length === 0) topErrors.push('questions[] must be a non-empty array');
  if (topErrors.length > 0) {
    return new Response(
      JSON.stringify({ kind: 'validation_failed', errors: topErrors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const chapterRow = db.select().from(chapters).where(eq(chapters.id, chapter_id!)).all();
  if (chapterRow.length === 0) {
    return new Response(
      JSON.stringify({ kind: 'validation_failed', errors: [`chapter_id '${chapter_id}' not found`] }),
      { status: 422, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (section_id) {
    const sectionRow = db.select().from(sections).where(eq(sections.id, section_id)).all();
    if (sectionRow.length === 0) {
      return new Response(
        JSON.stringify({ kind: 'validation_failed', errors: [`section_id '${section_id}' not found`] }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // Collect ALL per-question validation errors before returning.
  const allErrors: string[] = [];
  for (let i = 0; i < qs!.length; i++) {
    const q = qs![i];
    if (!q.type) { allErrors.push(`question[${i}].type required`); continue; }
    if (!q.prompt_md) allErrors.push(`question[${i}].prompt_md required`);
    if (!Array.isArray(q.topic_tags)) allErrors.push(`question[${i}].topic_tags must be an array`);

    const answerResult = validateAnswerSchema(q.type, q.answer_schema);
    if (!answerResult.ok) {
      for (const e of answerResult.errors) allErrors.push(`question[${i}].${e}`);
    }
    const refResult = validateReference(q.type, q.reference);
    if (!refResult.ok) {
      for (const e of refResult.errors) allErrors.push(`question[${i}].${e}`);
    }
  }

  if (allErrors.length > 0) {
    return new Response(
      JSON.stringify({ kind: 'validation_failed', errors: allErrors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const ids: string[] = [];
  for (const q of qs!) {
    const id = randomUUID();
    db.insert(questions).values({
      id,
      chapterId: chapter_id!,
      sectionId: section_id ?? null,
      type: q.type!,
      topicTags: JSON.stringify(q.topic_tags ?? []),
      promptMd: q.prompt_md!,
      answerSchemaJson: JSON.stringify(q.answer_schema),
      referenceJson: JSON.stringify(q.reference),
      sourceRunId: source_run_id!,
      createdAt: Date.now(),
    }).run();
    ids.push(id);
  }

  return new Response(
    JSON.stringify({ inserted: ids }),
    { status: 201, headers: { 'Content-Type': 'application/json' } },
  );
};
