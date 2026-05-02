// src/lib/fsrs.ts
// M5 T01 — Thin wrapper around ts-fsrs for the cs-300 review loop.
// Placement: server-side only (architecture.md §3.5 — FSRS update lives
// in the state service, never in static dist/).
//
// Outcome→grade mapping (AC-3):
//   pass    → Rating.Good  (4) — answer was correct
//   fail    → Rating.Again (1) — answer was wrong; re-review soon
//   partial → Rating.Hard  (2) — answer was partially correct
//
// Both exports are pure functions with no DB access; callers are
// responsible for persisting the returned state.

import { createEmptyCard, fsrs, Rating, type Card, type RecordLog } from 'ts-fsrs';

// FsrsState is the shape we store in the `fsrs_state` table (schema.ts).
export interface FsrsState {
  stability: number;
  difficulty: number;
  due_at: number;       // Unix ms
  last_review_at: number | null;
  lapses: number;
  reps: number;
}

// Map cs-300 attempt outcomes to FSRS Rating values.
function outcomeToRating(outcome: 'pass' | 'fail' | 'partial'): Rating {
  switch (outcome) {
    case 'pass':    return Rating.Good;
    case 'fail':    return Rating.Again;
    case 'partial': return Rating.Hard;
  }
}

// Convert an FsrsState row into the ts-fsrs Card shape.
function stateToCard(s: FsrsState): Card {
  const base = createEmptyCard();
  return {
    ...base,
    stability: s.stability,
    difficulty: s.difficulty,
    due: new Date(s.due_at),
    last_review: s.last_review_at != null ? new Date(s.last_review_at) : base.last_review,
    lapses: s.lapses,
    reps: s.reps,
  };
}

// Convert a ts-fsrs Card back into our FsrsState shape.
function cardToState(card: Card): Omit<FsrsState, 'due_at'> & { due_at: number } {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    due_at: card.due.getTime(),
    last_review_at: card.last_review != null ? card.last_review.getTime() : null,
    lapses: card.lapses,
    reps: card.reps,
  };
}

const f = fsrs();

/**
 * applyAttempt — advance FSRS state given a cs-300 outcome.
 *
 * `now` is threaded explicitly so the attempt's own timestamp anchors the
 * FSRS schedule rather than wall-clock at call time. Callers (POST /api/attempts
 * for mc/short, PATCH /api/attempts/[id]/outcome for llm_graded) pass the
 * `submitted_at` they already hold; this keeps the function pure and makes
 * unit-testing with fixed timestamps trivial.
 *
 * @param state   Current FsrsState from the `fsrs_state` table.
 * @param outcome cs-300 outcome: 'pass' | 'fail' | 'partial'.
 * @param now     Unix ms timestamp anchoring the FSRS schedule.
 * @returns       Updated FsrsState and the new due_at (Unix ms).
 */
export function applyAttempt(
  state: FsrsState,
  outcome: 'pass' | 'fail' | 'partial',
  now: number,
): { state: FsrsState; due_at: number } {
  const card = stateToCard(state);
  const rating = outcomeToRating(outcome);

  // ts-fsrs.repeat returns a RecordLog keyed by Rating.
  const log: RecordLog = f.repeat(card, new Date(now));
  const next = log[rating].card;

  const newState = cardToState(next);
  return { state: newState, due_at: newState.due_at };
}

/**
 * defaultState — initial FsrsState for a brand-new question.
 * Uses ts-fsrs's createEmptyCard() so the first review is scheduled
 * immediately (due_at = now).
 *
 * @param now  Unix ms timestamp for the creation time.
 */
export function defaultState(now: number): FsrsState {
  const card = createEmptyCard(new Date(now));
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    due_at: card.due.getTime(),
    last_review_at: null,
    lapses: card.lapses,
    reps: card.reps,
  };
}
