// src/db/schema.ts
//
// M3 T2 — Drizzle ORM schema for the cs-300 state service.
// 1:1 mapping of the 7 tables + 3 indexes from architecture.md §2.
// JSON columns (topic_tags, *_json) typed as text; the application
// layer encodes/decodes per the type-dispatched payload tables in
// architecture.md §2.

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// Content refs. Seeded from scripts/chapters.json + lectures/*.mdx
// frontmatter (M3 T4). Rows are stable; only content under them
// changes.

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),               // 'ch_1'
  n: integer('n').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  required: integer('required').notNull(),   // bool (0/1)
});

export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),               // 'ch_1-arrays'
  chapterId: text('chapter_id').notNull().references(() => chapters.id),
  anchor: text('anchor').notNull(),          // DOM anchor
  title: text('title').notNull(),
  ord: integer('ord').notNull(),
});

// Questions. One row per generated question (M4+). Answer schema +
// reference solution are type-specific JSON blobs; validated by the
// workflow before insert.

export const questions = sqliteTable(
  'questions',
  {
    id: text('id').primaryKey(),
    chapterId: text('chapter_id').notNull().references(() => chapters.id),
    sectionId: text('section_id').references(() => sections.id),
    type: text('type').notNull(),                    // 'mc' | 'short' | 'llm_graded' | 'code'
    topicTags: text('topic_tags').notNull(),         // JSON array
    promptMd: text('prompt_md').notNull(),
    answerSchemaJson: text('answer_schema_json').notNull(),
    referenceJson: text('reference_json').notNull(), // NEVER shipped to DOM for 'code'
    sourceRunId: text('source_run_id').notNull(),    // ai-workflows run id
    createdAt: integer('created_at').notNull(),
    status: text('status').notNull().default('active'), // 'active' | 'archived'
  },
  (t) => [index('idx_questions_chapter').on(t.chapterId, t.status)],
);

// Attempts. One row per submission (M5/M6). LLM tags populated async
// after submission by the assessment workflow.

export const attempts = sqliteTable(
  'attempts',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id').notNull().references(() => questions.id),
    startedAt: integer('started_at').notNull(),
    submittedAt: integer('submitted_at').notNull(),
    responseJson: text('response_json').notNull(),
    outcome: text('outcome').notNull(),              // 'pass' | 'fail' | 'partial' | 'pending'
    llmTagsJson: text('llm_tags_json'),              // nullable; grading score+feedback (M4) or topic tags (M5)
    gradeRunId: text('grade_run_id'),                // nullable; set for llm_graded attempts
  },
  (t) => [index('idx_attempts_question').on(t.questionId, t.submittedAt)],
);

// FSRS state per question (M5). One row per question; upserted on
// each attempt.

export const fsrsState = sqliteTable(
  'fsrs_state',
  {
    questionId: text('question_id').primaryKey().references(() => questions.id),
    dueAt: integer('due_at').notNull(),
    stability: real('stability').notNull(),
    difficulty: real('difficulty').notNull(),
    lastReviewAt: integer('last_review_at'),
    lapses: integer('lapses').notNull().default(0),
    reps: integer('reps').notNull().default(0),
  },
  (t) => [index('idx_fsrs_due').on(t.dueAt)],
);

// Reader state — M3 surfaces (T6 + T7).

export const readStatus = sqliteTable('read_status', {
  sectionId: text('section_id').primaryKey().references(() => sections.id),
  readAt: integer('read_at').notNull(),
});

export const annotations = sqliteTable('annotations', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => sections.id),
  offsetStart: integer('offset_start').notNull(),    // char offset in rendered text
  offsetEnd: integer('offset_end').notNull(),
  text: text('text').notNull(),
  createdAt: integer('created_at').notNull(),
});
