// src/lib/seed.ts
//
// M3 T4 — Idempotent seeding for the state service.
//
// Sources (per architecture.md §2 "Seeding"):
//   - scripts/chapters.json (M2 T5a migration of the Jekyll yml)
//     → upserts `chapters` (id, n, title, subtitle, required).
//   - src/content/lectures/*.mdx frontmatter `sections:` array
//     (M2 T4 generates this from pandoc-emitted ch_N- prefixed
//     header anchors)
//     → upserts `sections` (id, chapter_id, anchor, title, ord).
//
// Reads via FS + gray-matter rather than Astro's getCollection so
// the same module works inside Astro API routes (T3 health.ts) AND
// as a standalone Node smoke (`scripts/seed-smoke.mjs`).
//
// Idempotent — every boot can re-run; ON CONFLICT DO UPDATE
// refreshes metadata without producing duplicates. M4+ rows
// (questions, attempts, fsrs_state, annotations, read_status) are
// NOT touched — only content refs.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { db } from '../db/client';
import { chapters as chaptersTable, sections as sectionsTable } from '../db/schema';

// __dirname equivalent for ESM, then walk up to repo root.
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const CHAPTERS_JSON = join(REPO_ROOT, 'scripts', 'chapters.json');
const LECTURES_DIR = join(REPO_ROOT, 'src', 'content', 'lectures');

interface ChapterMeta {
  id: string;
  n: number;
  title: string;
  subtitle: string;
  required: boolean;
}

interface SectionMeta {
  id: string;
  anchor: string;
  title: string;
  ord: number;
}

interface LectureFrontmatter {
  chapter_id: string;
  sections: SectionMeta[];
}

export interface SeedResult {
  chapters: number;
  sections: number;
}

export function seed(): SeedResult {
  const chapterMetas: ChapterMeta[] = JSON.parse(readFileSync(CHAPTERS_JSON, 'utf8'));

  // Upsert chapters first (sections FK to chapters.id).
  for (const c of chapterMetas) {
    db.insert(chaptersTable)
      .values({
        id: c.id,
        n: c.n,
        title: c.title,
        subtitle: c.subtitle,
        required: c.required ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: chaptersTable.id,
        set: { n: c.n, title: c.title, subtitle: c.subtitle, required: c.required ? 1 : 0 },
      })
      .run();
  }

  // Walk lectures/*.mdx frontmatter for the section list.
  const lectureFiles = readdirSync(LECTURES_DIR).filter((f) => f.match(/^ch_\d+\.mdx$/));
  let sectionCount = 0;
  for (const f of lectureFiles) {
    const content = readFileSync(join(LECTURES_DIR, f), 'utf8');
    const parsed = matter(content);
    const fm = parsed.data as LectureFrontmatter;
    if (!fm.chapter_id || !fm.sections) continue;
    for (const s of fm.sections) {
      db.insert(sectionsTable)
        .values({
          id: s.id,
          chapterId: fm.chapter_id,
          anchor: s.anchor,
          title: s.title,
          ord: s.ord,
        })
        .onConflictDoUpdate({
          target: sectionsTable.id,
          set: { chapterId: fm.chapter_id, anchor: s.anchor, title: s.title, ord: s.ord },
        })
        .run();
      sectionCount++;
    }
  }

  return { chapters: chapterMetas.length, sections: sectionCount };
}
