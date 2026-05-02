// src/lib/evaluators/mc.ts
// M4 T06 — mc evaluation: compare chosen_ix to correct_ix.

interface McAnswerSchema {
  correct_ix: number;
}

interface McResponse {
  chosen_ix: number;
}

export function evaluateMc(answerSchema: McAnswerSchema, response: McResponse): 'pass' | 'fail' {
  return response.chosen_ix === answerSchema.correct_ix ? 'pass' : 'fail';
}
