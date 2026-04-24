#!/usr/bin/env node
// scripts/build-content.mjs
//
// M2 Task T4 — Pandoc → Astro content pipeline.
//
// For each chapter under chapters/ch_*/:
//   - lectures.tex → pandoc + scripts/pandoc-filter.lua
//                  → src/content/lectures/ch_N.mdx
//                    (with section-list frontmatter parsed from the
//                    pandoc-emitted ch_N-prefixed anchors)
//   - notes.tex    → pandoc + scripts/pandoc-filter.lua
//                  → src/content/notes/ch_N.mdx
//                    (with chapter_id frontmatter only)
//   - practice.md  → straight copy
//                  → src/content/practice/ch_N.mdx
//                    (with chapter_id frontmatter only)
//
// Wired as `prebuild` + `predev` in package.json so `npm run build`
// and `npm run dev` both produce fresh content collections without
// a separate command. Exit non-zero on any pandoc failure.
//
// Per-chapter metadata (title, subtitle, n, required) lands in
// frontmatter from scripts/chapters.json (loaded below). Migrated
// from the Jekyll-era _data/chapters dot yml file in M2 T5 — that
// file is unreferenced after T5 and gets deleted in T8.
//
// Architecture: design_docs/architecture.md §1 (static content
// pipeline) + §2 (sections.anchor seeding contract — section-list
// frontmatter on lectures/*.mdx is the canonical source M3 reads).

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILTER = resolve(REPO_ROOT, 'scripts/pandoc-filter.lua');

// Per-chapter metadata. M2 T5 migrated this from the Jekyll-era
// _data/chapters dot yml file to scripts/chapters.json (colocated
// with the build script). The legacy file is unreferenced after T5
// and gets deleted in T8 (per T8's fail-loud check).
const CHAPTERS_JSON = resolve(REPO_ROOT, 'scripts/chapters.json');
const CHAPTERS_META = JSON.parse(await readFile(CHAPTERS_JSON, 'utf8'));
const CHAPTERS = CHAPTERS_META.map((c) => String(c.n));
const META_BY_ID = Object.fromEntries(CHAPTERS_META.map((c) => [c.id, c]));

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function runPandoc(srcAbs, outAbs, chapterId) {
  await execFileP('pandoc', [
    '--lua-filter', FILTER,
    '--metadata', `chapter_id=${chapterId}`,
    '--metadata', `source_path=${srcAbs}`,
    '-f', 'latex',
    '-t', 'markdown-raw_attribute',
    '--wrap=none',
    srcAbs,
    '-o', outAbs,
  ]);
}

// Walk the pandoc-emitted MDX for header lines of the form
//   `## Title text {#ch_N-section-slug}`
// and capture them in document order as the section index.
function extractSections(mdx, chapterId) {
  const sections = [];
  // ATX-style headers: 1-6 leading #, then the text, then the
  // {#anchor} attribute block pandoc writes.
  const re = /^#+\s+(.+?)\s*\{#(ch_[A-Za-z0-9_-]+)\}/gm;
  let m;
  let ord = 0;
  while ((m = re.exec(mdx)) !== null) {
    const [, title, id] = m;
    if (id.startsWith(`${chapterId}-`)) {
      sections.push({
        id,
        anchor: id,
        // Inline code in titles (e.g. "## `std::vector`") arrives
        // with backticks; strip for plain-text storage. The MDX body
        // still renders them fine because the body uses the original
        // header line, not this stripped copy.
        title: title.replace(/`/g, ''),
        ord: ord++,
      });
    }
  }
  return sections;
}

// MDX-safety pass over the pandoc output. Three cleanups:
//   1. Header anchors: pandoc emits `## Title {#anchor-id}`. MDX's
//      parser reads `{…}` as a JSX expression and chokes on the
//      `#` prefix. Rewrite to a leading `<a id="…">` element.
//   2. HTML comments: pandoc inserts `<!-- -->` to disambiguate
//      adjacent markdown elements. MDX uses `{/* */}` for comments
//      and rejects `<!--`. Convert.
//   3. (Math is handled by remark-math at the integration layer,
//      not here.)
// Run AFTER section extraction (header rewrite drops the `{#…}`
// syntax that extractSections() depends on).
function mdxSafetyRewrite(mdx) {
  let out = mdx.replace(
    /^(#+)\s+(.+?)\s*\{#([^\s}]+)[^}]*\}\s*$/gm,
    '<a id="$3"></a>\n\n$1 $2',
  );
  out = out.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
  return out;
}

// Hand-roll YAML rather than pull a dep. Schema is small + stable
// (see top-of-file comment) and the values we serialize don't have
// chars that need escaping beyond JSON.stringify's quoting.
function injectFrontmatter(body, frontmatter) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - id: ${JSON.stringify(item.id)}`);
        lines.push(`    anchor: ${JSON.stringify(item.anchor)}`);
        lines.push(`    title: ${JSON.stringify(item.title)}`);
        lines.push(`    ord: ${item.ord}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push('---');
  lines.push('');
  return `${lines.join('\n')}\n${body}`;
}

async function buildChapter(n) {
  const chapterId = `ch_${n}`;
  const meta = META_BY_ID[chapterId];
  if (!meta) {
    throw new Error(`[build-content] ${chapterId}: missing metadata in scripts/chapters.json`);
  }
  // Per-chapter metadata merged into every collection's frontmatter
  // so M3's seeding contract (architecture.md §2) and Astro's content-
  // collection schema (T5 src/content/config.ts) both have the
  // canonical title / subtitle / number / required-flag without
  // re-reading the source-of-truth.
  const baseMeta = {
    chapter_id: chapterId,
    n: meta.n,
    title: meta.title,
    subtitle: meta.subtitle,
    required: meta.required,
  };
  const chapterDir = resolve(REPO_ROOT, `chapters/${chapterId}`);

  const lecturesSrc = resolve(chapterDir, 'lectures.tex');
  const notesSrc = resolve(chapterDir, 'notes.tex');
  const practiceSrc = resolve(chapterDir, 'practice.md');

  for (const [path, name] of [[lecturesSrc, 'lectures.tex'], [notesSrc, 'notes.tex'], [practiceSrc, 'practice.md']]) {
    if (!existsSync(path)) {
      throw new Error(`[build-content] ${chapterId}: missing ${name} at ${path}`);
    }
  }

  // Lectures — gets baseMeta + section list (anchors → nav index per
  // architecture.md §2). Section extraction must happen BEFORE the
  // header-anchor rewrite (rewrite drops the `{#…}` syntax that
  // extractSections() depends on).
  const lecturesOut = resolve(REPO_ROOT, `src/content/lectures/${chapterId}.mdx`);
  await runPandoc(lecturesSrc, lecturesOut, chapterId);
  const lecturesMdx = await readFile(lecturesOut, 'utf8');
  const sections = extractSections(lecturesMdx, chapterId);
  const lecturesMdxRewritten = mdxSafetyRewrite(lecturesMdx);
  await writeFile(lecturesOut, injectFrontmatter(lecturesMdxRewritten, { ...baseMeta, sections }));

  // Notes — baseMeta only (lectures owns the section structure)
  const notesOut = resolve(REPO_ROOT, `src/content/notes/${chapterId}.mdx`);
  await runPandoc(notesSrc, notesOut, chapterId);
  const notesMdx = await readFile(notesOut, 'utf8');
  const notesMdxRewritten = mdxSafetyRewrite(notesMdx);
  await writeFile(notesOut, injectFrontmatter(notesMdxRewritten, baseMeta));

  // Practice — straight copy + baseMeta. The source carries pre-
  // existing Jekyll frontmatter (`layout: default` / `permalink:`)
  // that would render as a stray `---` thematic-break block after
  // we prepend our own frontmatter; strip it before injecting.
  const practiceOut = resolve(REPO_ROOT, `src/content/practice/${chapterId}.mdx`);
  const practiceMd = await readFile(practiceSrc, 'utf8');
  const stripped = practiceMd.replace(/^---\n[\s\S]*?\n---\n/, '');
  await writeFile(practiceOut, injectFrontmatter(stripped, baseMeta));

  return { chapterId, sections: sections.length };
}

async function main() {
  console.log('[build-content] starting');
  await ensureDir(resolve(REPO_ROOT, 'src/content/lectures'));
  await ensureDir(resolve(REPO_ROOT, 'src/content/notes'));
  await ensureDir(resolve(REPO_ROOT, 'src/content/practice'));

  const results = [];
  for (const n of CHAPTERS) {
    const r = await buildChapter(n);
    results.push(r);
    console.log(`[build-content] ${r.chapterId}: ${r.sections} sections`);
  }
  console.log(`[build-content] done — ${results.length} chapters processed (${results.length * 3} MDX files generated)`);
}

main().catch((err) => {
  console.error('[build-content] FAILED:', err.message ?? err);
  if (err.stderr) console.error(err.stderr);
  process.exit(1);
});
