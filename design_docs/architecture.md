# Architecture

Gating artifact for Phase 1 of `interactive_notes_roadmap.md`. Defines the parts of the system that require deliberate design; leans on the roadmap for constraints and settled decisions rather than restating them.

Scope is intentionally tight. The site is static by default. The only genuinely dynamic surfaces are: question generation (over the ai-workflows MCP adapter), question rendering and answer capture, code execution for coding questions, and the FSRS review loop over persisted attempt state. Everything else is a pandoc + Astro content pipeline that terminates in static HTML.

## System shape

```
┌─────────────────────────── local dev machine ─────────────────────────────┐
│                                                                           │
│  chapters/ch_N/{lectures.tex,notes.tex,practice.md}                       │
│           │                                                               │
│           ▼ pandoc + Lua filter (build time)                              │
│  src/content/{lectures,notes,practice}/ch_N.mdx                           │
│           │                                                               │
│           ▼ astro build                                                   │
│  dist/  ── static HTML + React islands + client bundle ───▶ GH Pages      │
│                                                                           │
│  (local-only, runtime)                                                    │
│  ┌───────────────┐   HTTP    ┌────────────────┐   stdio   ┌────────────┐  │
│  │ browser       │◀─────────▶│ FastMCP adapter│◀─────────▶│ ai-workflows│  │
│  │ (Astro bundle)│           │ (this repo)    │           │ (separate  │  │
│  │               │           │                │           │  repo)     │  │
│  │               │   HTTP    ┌────────────────┐           └────────────┘  │
│  │               │◀─────────▶│ state service  │──▶ SQLite (local file)   │
│  └───────────────┘           └────────────────┘                           │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

Two local-only processes: the FastMCP adapter (wraps ai-workflows) and the state service (owns SQLite). The state service could be the Astro dev server itself via API routes; see §4.

Public deploy is just `dist/`. No adapter, no state service. Feature detection at bootstrap toggles the interactive UI off.

---

## 1. Static content pipeline

### Source layout (unchanged from today)

```
chapters/ch_N/
  lectures.tex   # full chapter, LaTeX w/ custom environments
  notes.tex      # two-page reference, LaTeX
  practice.md    # coach prompts, markdown
```

`notes-style.tex` defines the custom environments (`defnbox`, `ideabox`, `warnbox`, `examplebox`, `notebox`) and listing styles. These are the atoms the pipeline has to preserve.

### Pandoc + Lua filter

One Lua filter, one pandoc invocation per `.tex` file. Filter responsibilities:

- Map LaTeX environments → MDX components:
  - `defnbox` → `<Definition>`
  - `ideabox` → `<KeyIdea>`
  - `warnbox` → `<Gotcha>`
  - `examplebox` → `<Example>`
  - `notebox` → `<Aside>`
- Map `lstlisting` → `<CodeBlock lang="…">`. Preserve language hint.
- Strip preamble-only commands; pandoc's default LaTeX reader handles the rest.
- Emit section anchors as `<a id="ch_N-section-slug">`. These are the stable refs used by SQLite `sections.anchor`, read-status tracking, and annotation targeting.

Writing the filter is the first concrete build task once this doc is agreed. Pandoc-on-`ch_1/lectures.tex`-without-filter is the Phase 1 idle probe; its output determines how much the filter has to do.

Markdown practice files skip pandoc entirely — copied into `src/content/practice/` and rendered as MDX directly.

### Component library

Lives in `src/components/callouts/`. Minimal props: `title?`, `children`. Styling owned by the component, not the consumer. These map 1:1 with the LaTeX callout boxes — the content model is the same, only the renderer changes.

`<CodeBlock>` is the only interactive-capable callout in static mode: syntax highlighting, copy button. In local mode it gains a "send to editor" action for coding-practice questions (§3 code path).

### Astro content collections

Three collections, one per source family:

```
src/content/
  lectures/  # chapter bodies (one MDX per chapter)
  notes/     # two-page refs
  practice/  # coach prompts
```

Per-chapter metadata stays in `_data/chapters.yml` for now (migrate into content-collection frontmatter at Phase 2 cutover — trivial port).

### Audio (Phase 7 forward-compat)

TTS MP3s and sentence-timestamp JSON live alongside MDX:

```
src/content/lectures/ch_N.mdx
public/audio/ch_N.mp3
public/audio/ch_N.timestamps.json
```

Phase 7 adds an `<AudioPlayer>` island component that consumes the JSON to drive sentence highlighting. Static assets, no runtime generation. Noted here to pin the file layout decision early so Phase 2 doesn't pick something Phase 7 has to unwind.

---

## 2. Data model

SQLite file, local only. Accumulating model (roadmap open question resolved: §5 of this doc).

### Tables

```sql
-- Content refs. Seeded from chapters.yml + pandoc output on first boot
-- and on rebuilds. Rows are stable; only content under them changes.

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,              -- 'ch_1'
  n INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  required INTEGER NOT NULL         -- bool
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,              -- 'ch_1-arrays' (chapter-slug)
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  anchor TEXT NOT NULL,             -- DOM anchor
  title TEXT NOT NULL,
  ord INTEGER NOT NULL
);

-- Questions. One row per generated question. Answer schema + reference
-- solution are type-specific JSON blobs; validated by the workflow
-- before insert. 'status' lets retroactive review (Phase 4 initial ship
-- is gateless; post-M11 adds gate).

CREATE TABLE questions (
  id TEXT PRIMARY KEY,              -- uuid
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  section_id TEXT REFERENCES sections(id),    -- nullable; chapter-wide OK
  type TEXT NOT NULL,               -- 'mc' | 'short' | 'llm_graded' | 'code'
  topic_tags TEXT NOT NULL,         -- JSON array
  prompt_md TEXT NOT NULL,
  answer_schema_json TEXT NOT NULL, -- type-specific
  reference_json TEXT NOT NULL,     -- NEVER shipped to DOM for 'code'
  source_run_id TEXT NOT NULL,      -- ai-workflows run id, for evals replay
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'  -- 'active' | 'archived'
);

CREATE INDEX idx_questions_chapter ON questions(chapter_id, status);

-- Attempts. One row per submission. LLM tags populated async after
-- submission by the assessment workflow (Phase 5).

CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  started_at INTEGER NOT NULL,
  submitted_at INTEGER NOT NULL,
  response_json TEXT NOT NULL,      -- type-specific
  outcome TEXT NOT NULL,            -- 'pass' | 'fail' | 'partial'
  llm_tags_json TEXT                -- nullable; filled by assessment job
);

CREATE INDEX idx_attempts_question ON attempts(question_id, submitted_at DESC);

-- FSRS state per question. One row per question; upserted on each attempt.

CREATE TABLE fsrs_state (
  question_id TEXT PRIMARY KEY REFERENCES questions(id),
  due_at INTEGER NOT NULL,
  stability REAL NOT NULL,
  difficulty REAL NOT NULL,
  last_review_at INTEGER,
  lapses INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_fsrs_due ON fsrs_state(due_at);

-- Reader state.

CREATE TABLE read_status (
  section_id TEXT PRIMARY KEY REFERENCES sections(id),
  read_at INTEGER NOT NULL
);

CREATE TABLE annotations (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id),
  offset_start INTEGER NOT NULL,    -- char offset in rendered text
  offset_end INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### Schema-per-type payloads

`answer_schema_json`, `reference_json`, `response_json` are the shapes that vary by question type. Locked per type so validators (both the generation-time validator in ai-workflows and the submission-time eval in the app) can be type-dispatched.

| type         | answer_schema_json                              | reference_json                                  | response_json                |
|--------------|-------------------------------------------------|-------------------------------------------------|------------------------------|
| `mc`         | `{options: [...], correct_ix: int}`             | `{explanation: str}`                            | `{chosen_ix: int}`           |
| `short`      | `{match: 'exact'\|'fuzzy'\|'numeric', expected: str, tol?: float}` | `{explanation: str}`       | `{text: str}`                |
| `llm_graded` | `{rubric: [criteria...]}`                       | `{ideal_answer: str}`                           | `{text: str}`                |
| `code`       | `{lang: str, signature: str, test_cases: [...]}` (test_cases shape: `{input, expected}`) | `{solution: str}`  — **server-only** | `{source: str}`              |

Notes:
- `reference_json` for `code` is served only by the state service when the question renders; the full solution never hits the DOM. Test-case inputs/expected *do* ship to the client for display-on-failure.
- `numeric` match handles Big-O / asymptotic answers via canonicalization; rule details defer to question_gen workflow.

### ORM

Drizzle. Rationale: lighter than Prisma, no runtime query engine, TypeScript-first, SQL feels like SQL. Migration story: check-in `drizzle/` artifacts, `drizzle-kit push` in dev.

### Seeding

On first boot (and after any rebuild), the state service reads:
- `_data/chapters.yml` → upserts `chapters`
- `src/content/notes/*.mdx` frontmatter → upserts `sections`

Seeding is idempotent. Questions and attempt state are never touched.

---

## 3. Dynamic surfaces

Four dynamic surfaces, each with a clear contract. Everything else is static rendering.

### 3.1 Question generation (ai-workflows bridge)

Frontend calls `POST /mcp/run_workflow` on the FastMCP adapter with `{workflow: 'question_gen', inputs: {chapter_id, section_id?, count, types: [...]}}`. Adapter invokes ai-workflows, returns `{run_id}`.

Frontend polls `GET /mcp/runs/:id` until `status == 'completed'` or `status == 'failed'`. Completed runs surface artifacts via `GET /mcp/runs/:id/artifacts` — the questions themselves.

Frontend POSTs artifacts to state service (`POST /api/questions/bulk`), which validates and inserts. **Validation happens twice**: once in ai-workflows (self-consistency, per roadmap), once at insert (schema conformance). Redundant on purpose; the adapter is external-to-this-repo surface.

Error shape for MCP calls:
```ts
type McpError =
  | { kind: 'adapter_unreachable' }        // feature-detection trigger
  | { kind: 'workflow_failed'; reason: string; run_id: string }
  | { kind: 'validation_failed'; errors: string[] }
```

### 3.2 Answer evaluation

Dispatched by question type at `POST /api/attempts`:

- `mc` → compare `chosen_ix` to `correct_ix`. Constant-time, no LLM.
- `short` with `exact` → string equality after trim+lowercase.
- `short` with `fuzzy` → Levenshtein ≤ threshold.
- `short` with `numeric` → parse + tolerance check.
- `llm_graded` → enqueue a `grade` workflow on ai-workflows; attempt row created with `outcome = 'pending'` until the grading run completes. Async.
- `code` → §3.3.

Outcome is persisted immediately (except `llm_graded`, which has a pending→terminal transition).

### 3.3 Code execution

Local subprocess. C++ is the baseline language (matches course); Python is a second-class path for pseudocode-substitute questions (roadmap open question lean: C++ primary).

Flow:

1. Frontend submits `{question_id, source}` to `POST /api/attempts` on state service.
2. State service fetches `reference_json` for the question (contains `solution`, `test_cases`). Solution is used nowhere in this flow — only for future "show solution" UI after submission.
3. State service writes `source` + a test harness to a temp dir.
4. Spawn compiler (`g++ -O0 -std=c++17`) with timeout (5s wall, compiled once).
5. For each test case: run binary with `input` on stdin, capture stdout, diff against `expected`. Per-case timeout 2s wall.
6. Aggregate outcome: pass iff all cases pass. Return `{outcome, per_case: [{input, expected, got, pass}]}`.

No sandbox (personal machine, per roadmap). `ulimit -v` guards memory runaway. Temp dir cleaned up per attempt.

### 3.4 Review loop (Phase 5)

FSRS library (`ts-fsrs` npm package) runs client-side after each attempt:

```
attempt submitted → outcome + rating (pass/fail/partial maps to FSRS grade)
                 → ts-fsrs.next(state, grade) → new_state
                 → PATCH /api/fsrs_state/:question_id
```

Review queue UI queries `GET /api/review/due?before=<now>&limit=N` → ordered by `due_at`.

LLM assessment (topic tagging of failed attempts) runs async as a separate ai-workflows workflow after each `fail`/`partial` attempt. Populates `attempts.llm_tags_json` on completion. Gap report aggregates over these tags.

---

## 4. Local-vs-public mode

Single runtime flag: `interactive`. Set once at app bootstrap.

```ts
// src/lib/mode.ts
export async function detectMode(): Promise<Mode> {
  try {
    const [adapter, state] = await Promise.all([
      fetch(ADAPTER_URL + '/health').then(r => r.ok),
      fetch('/api/health').then(r => r.ok),
    ]);
    return adapter && state ? 'interactive' : 'static';
  } catch { return 'static'; }
}
```

All interactive UI conditionally renders on `mode === 'interactive'`. Static mode exposes: lecture reading, notes (compact references), practice markdown, audio player (Phase 7 — audio is static assets so it works in both modes). Hidden in static mode: question generation UI, review queue, code editor, annotations, read-status indicators.

Build artifact is identical in both modes. No separate "local build" — the public and local sites are the same `dist/`. Feature detection alone flips the UI.

### State service hosting

Two viable paths; deferred decision (see §5):

**Path A — Astro server (recommended).** Run `astro dev` or `astro preview` locally. Astro API routes under `src/pages/api/` own SQLite via Drizzle. Two processes in local mode: Astro server + FastMCP adapter.

**Path B — Client-side SQLite.** `@sqlite.org/sqlite-wasm` + OPFS for persistence. One process in local mode (just the FastMCP adapter). GH Pages deploy unchanged. Tradeoff: WASM bundle ~2MB, schema migrations run in browser, slightly awkward ops.

Path A is cleaner for schema management and likely how we'll ship. Path B is a fallback if running a second process is too heavy.

---

## 5. Open decisions

These block nothing immediately but need resolution before the phase that depends on each.

| decision                                 | block       | lean                        | decide by      |
|------------------------------------------|-------------|-----------------------------|----------------|
| Pandoc Lua filter vs manual port (Ch 1)  | Phase 2     | **resolved: HYBRID** (small filter + native pandoc) — see [`pandoc_probe.md`](pandoc_probe.md) | ✅ 2026-04-23 |
| State service: Astro server vs client SQLite | Phase 3 | Astro server                | Phase 3 start  |
| FSRS vs SM-2                             | Phase 5     | FSRS (`ts-fsrs`)            | Phase 5 start  |
| Code language: C++ only vs C+++Python    | Phase 6     | C++ baseline, Python later  | Phase 6 start  |
| Question-gen model tier (14B/32B/Claude) | Phase 4     | 14B start, A/B via tier_overrides | Phase 4 eval |
| `coding_practice/` persisted vs dynamic  | Phase 4     | —                           | Phase 4 design |

Resolved here:
- **Question persistence model:** accumulating (roadmap's "almost certainly" confirmed).
- **Answer evaluation surface:** mixed — mc, short (exact/fuzzy/numeric), llm_graded, code. Schema in §2 carries all four.
- **Audio file layout:** `public/audio/ch_N.{mp3,timestamps.json}`, pinned now to avoid Phase 7 unwind.

---

## 6. Out of scope for this doc

Not because unimportant — because already settled elsewhere or deferred to their phase:

- ai-workflows internals (closed surface from this repo's view; see `interactive_notes_roadmap.md` Phase 4 for the workflow spec location).
- TTS provider choice (Phase 7 open question).
- Question prompt corpus shape under `coding_practice/` (Phase 4 open question; see `roadmap_addenda.md`).
- Phase 1 content acceptance criteria (deferred; see `roadmap_addenda.md`).
