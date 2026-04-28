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
//
// Per M-UX-REVIEW T2 D1 (2026-04-27): emit `level: 1 | 2` per entry
// so the right-rail TOC can render H1 + H2 with a clear visual split
// (UI-review F4). Heading-depth mapping after the chapter source is
// run through pandoc:
//   - `\section{4.1 The List ADT}`     → MDX `# 4.1 ...`  (depth 1)
//   - `\subsection{The contract: …}`   → MDX `## …`        (depth 2)
//   - `\subsubsection{…}`              → MDX `### …`       (depth 3)
// Top-level numbered titles always match `^\d+\.\d+\s` (e.g. "4.1 ").
// Subsection titles do not. We keep depth ≤ 2 (drop H3 and below —
// too granular for a rail per spec) and assign:
//   level: 1  if title matches /^\d+\.\d+\s/  (the numbered top-level)
//   level: 2  otherwise  (H2 subsection under a numbered top-level)
// Reverses the M-UX b29d409 frontmatter-side filter (which dropped
// every non-`^\d+\.\d+\s` title outright); RightRailTOC.astro now
// renders both levels and styles them via `data-level`.
function extractSections(mdx, chapterId) {
  const sections = [];
  // ATX-style headers: 1-6 leading #, then the text, then the
  // {#anchor} attribute block pandoc writes. Captures the depth
  // (number of `#`) so we can drop H3+ entries below.
  //
  // Note: the trailing `\}` is intentionally strict — it does NOT
  // match `{#anchor .unnumbered}` (pandoc emits this for
  // `\subsection*{...}` starred headers). Loosening to allow the
  // class block would balloon the rail far beyond the M-UX-REVIEW
  // T2 spec's "~37 → ~60" envelope (chapters with heavy
  // `\subsection*` use — ch_5/ch_3/etc. — would jump to 50–120
  // entries each, regressing the b29d409 bundle savings by far
  // more than the spec's expected ~80 KB). T2 scope is the H1/H2
  // visual split; the unnumbered-subsection round-trip is out of
  // scope and stays as-is until a future task explicitly authors
  // it.
  const re = /^(#+)\s+(.+?)\s*\{#(ch_[A-Za-z0-9_-]+)\}/gm;
  const TOP_LEVEL_TITLE = /^\d+\.\d+\s/;
  let m;
  let ord = 0;
  while ((m = re.exec(mdx)) !== null) {
    const [, hashes, rawTitle, id] = m;
    if (!id.startsWith(`${chapterId}-`)) continue;
    const depth = hashes.length;
    // Drop H3 and below — keep the rail focused on chapter section
    // (`\section`) + immediate subsection (`\subsection`) entries.
    if (depth > 2) continue;
    // Inline code in titles (e.g. "## `std::vector`") arrives with
    // backticks; strip for plain-text storage. The MDX body still
    // renders them fine because the body uses the original header
    // line, not this stripped copy.
    const title = rawTitle.replace(/`/g, '');
    const level = TOP_LEVEL_TITLE.test(title) ? 1 : 2;
    sections.push({
      id,
      anchor: id,
      title,
      level,
      ord: ord++,
    });
  }
  return sections;
}

// MDX-safety pass over the pandoc output. T5b extended pass.
// Cleanups:
//   1. Header anchors: pandoc emits `## Title {#anchor-id}`. MDX's
//      parser reads `{…}` as a JSX expression and chokes on the
//      `#` prefix. Rewrite to a leading `<a id="…">` element.
//   2. HTML comments: pandoc inserts `<!-- -->` to disambiguate
//      adjacent markdown elements. MDX uses `{/* */}` for comments
//      and rejects `<!--`. Convert.
//   3. Brace escape: chapter prose and pandoc's math-as-text output
//      both contain literal `{` and `}` (set notation, math like
//      `${a, b}$`, etc.). MDX reads every `{` as a JSX expression
//      opener and crashes on the contents. Walk the document with
//      a small state machine that escapes braces in plain-text
//      contexts but skips them inside:
//        - YAML frontmatter at top of file
//        - fenced code blocks (``` ... ```)
//        - inline code spans (`...`)
//        - inline math (`$...$`) and display math (`$$...$$`) — leave
//          intact for remark-math to parse later
//        - JSX/HTML tags emitted by step 1 above (`<a id=…>`,
//          `<Definition title=…>`, etc. from the Lua filter)
// Run AFTER section extraction (header rewrite drops the `{#…}`
// syntax that extractSections() depends on).
function mdxSafetyRewrite(mdx) {
  let out = mdx.replace(
    /^(#+)\s+(.+?)\s*\{#([^\s}]+)[^}]*\}\s*$/gm,
    '<a id="$3"></a>\n\n$1 $2',
  );
  out = out.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
  out = escapeBraces(out);
  return out;
}

function escapeBraces(mdx) {
  const lines = mdx.split('\n');
  const result = [];
  let inFrontmatter = false;
  let frontmatterDone = false;
  let inFence = false;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];

    // Frontmatter handling: top-of-file `---\n...\n---`. Pass through
    // as-is — never escape inside YAML.
    if (li === 0 && line === '---') {
      inFrontmatter = true;
      result.push(line);
      continue;
    }
    if (inFrontmatter) {
      result.push(line);
      if (line === '---') {
        inFrontmatter = false;
        frontmatterDone = true;
      }
      continue;
    }

    // Fenced code blocks: opening / closing fence is `^```` (with or
    // without language tag). Pass through code lines verbatim.
    if (/^```/.test(line)) {
      inFence = !inFence;
      result.push(line);
      continue;
    }
    if (inFence) {
      result.push(line);
      continue;
    }

    // Indented code blocks (4-space prefix). Markdown-strict rule;
    // pandoc emits these for some constructs. Pass through.
    if (/^    /.test(line) && !/^    [-*+]/.test(line)) {
      result.push(line);
      continue;
    }

    result.push(escapeLineBraces(line));
  }
  return result.join('\n');
}

function escapeLineBraces(line) {
  let out = '';
  let i = 0;
  while (i < line.length) {
    const c = line[i];

    // Already-escaped brace: pass the backslash + brace through.
    if (c === '\\' && i + 1 < line.length && (line[i + 1] === '{' || line[i + 1] === '}')) {
      out += line.slice(i, i + 2);
      i += 2;
      continue;
    }

    // Inline code span: from one backtick to the next on the same line.
    // Pass through verbatim so e.g. `vector<T>` and `{key: val}` in
    // code don't get mangled.
    if (c === '`') {
      const end = line.indexOf('`', i + 1);
      if (end < 0) {
        // Unmatched backtick — treat the rest of the line as text.
        out += escapeRest(line.slice(i));
        return out;
      }
      out += line.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    // Math: pass through `$...$` (inline) and `$$...$$` (display)
    // verbatim so remark-math sees the original LaTeX. Display first.
    if (c === '$' && line[i + 1] === '$') {
      const end = line.indexOf('$$', i + 2);
      if (end < 0) {
        out += line.slice(i);
        return out;
      }
      out += line.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    if (c === '$') {
      const end = line.indexOf('$', i + 1);
      if (end < 0) {
        // Unmatched $ — treat as literal $.
        out += '$';
        i += 1;
        continue;
      }
      out += line.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    // JSX / HTML tag: `<Name ...>` or `<Name>` or `<Name/>` or
    // `</Name>` — pass through verbatim. Bracketed prose (`< 5`) is
    // distinguished by the next char being non-alphabetic / non-slash.
    if (c === '<' && /[A-Za-z\/]/.test(line[i + 1] || '')) {
      const end = line.indexOf('>', i);
      if (end < 0) {
        // Tag spans multiple lines (rare in our output) — pass the
        // rest through and continue without escape.
        out += line.slice(i);
        return out;
      }
      out += line.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    // MDX comment: `{/* ... */}` — pass through verbatim.
    if (c === '{' && line[i + 1] === '/' && line[i + 2] === '*') {
      const end = line.indexOf('*/}', i);
      if (end < 0) {
        // Comment opens but doesn't close on this line; escape and
        // bail (rare).
        out += '\\{';
        i += 1;
        continue;
      }
      out += line.slice(i, end + 3);
      i = end + 3;
      continue;
    }

    if (c === '{') {
      out += '\\{';
      i += 1;
      continue;
    }
    if (c === '}') {
      out += '\\}';
      i += 1;
      continue;
    }

    out += c;
    i += 1;
  }
  return out;
}

function escapeRest(text) {
  return text.replace(/([{}])/g, '\\$1');
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
        // M-UX-REVIEW T2 D1: visual-hierarchy level (1 = top-level
        // numbered, 2 = subsection). Consumed by RightRailTOC.astro
        // to set the `data-level` attr that drives the H1/H2 split.
        lines.push(`    level: ${item.level}`);
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
  // Also runs through mdxSafetyRewrite() so LaTeX-flavoured author
  // notation (`\emph{lazy-delete}`, `\texttt{dist[u]}`, etc.) and
  // any prose braces don't trip MDX's JSX expression parser.
  const practiceOut = resolve(REPO_ROOT, `src/content/practice/${chapterId}.mdx`);
  const practiceMd = await readFile(practiceSrc, 'utf8');
  const stripped = practiceMd.replace(/^---\n[\s\S]*?\n---\n/, '');
  const practiceRewritten = mdxSafetyRewrite(stripped);
  await writeFile(practiceOut, injectFrontmatter(practiceRewritten, baseMeta));

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
