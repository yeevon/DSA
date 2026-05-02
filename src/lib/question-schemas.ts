// src/lib/question-schemas.ts
// M4 T05 — Per-type Zod schemas for question answer_schema + reference.
// Mirrors architecture.md §2 payload tables.

import { z } from 'zod';

export const McAnswerSchema = z.object({
  options: z.array(z.string()).min(2),
  correct_ix: z.number().int().min(0),
});

export const ShortAnswerSchema = z.object({
  match: z.enum(['exact', 'fuzzy', 'numeric']),
  expected: z.string(),
  tol: z.number().optional(),
});

export const LlmGradedAnswerSchema = z.object({
  rubric: z.array(z.string()).min(1),
});

export const CodeAnswerSchema = z.object({
  lang: z.string(),
  signature: z.string(),
  test_cases: z.array(z.object({
    input: z.string(),
    expected: z.string(),
  })).min(1),
});

export const McReferenceSchema = z.object({ explanation: z.string() });
export const ShortReferenceSchema = z.object({ explanation: z.string() });
export const LlmGradedReferenceSchema = z.object({ ideal_answer: z.string() });
export const CodeReferenceSchema = z.object({ solution: z.string() });

type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateAnswerSchema(type: string, raw: unknown): ValidationResult {
  const schemaMap: Record<string, z.ZodSchema> = {
    mc: McAnswerSchema,
    short: ShortAnswerSchema,
    llm_graded: LlmGradedAnswerSchema,
    code: CodeAnswerSchema,
  };
  const schema = schemaMap[type];
  if (!schema) return { ok: false, errors: [`unknown type '${type}'`] };
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true };
  return { ok: false, errors: result.error.issues.map(e => `answer_schema.${e.path.join('.')}: ${e.message}`) };
}

export function validateReference(type: string, raw: unknown): ValidationResult {
  const schemaMap: Record<string, z.ZodSchema> = {
    mc: McReferenceSchema,
    short: ShortReferenceSchema,
    llm_graded: LlmGradedReferenceSchema,
    code: CodeReferenceSchema,
  };
  const schema = schemaMap[type];
  if (!schema) return { ok: false, errors: [`unknown type '${type}' for reference`] };
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true };
  return { ok: false, errors: result.error.issues.map(e => `reference.${e.path.join('.')}: ${e.message}`) };
}
