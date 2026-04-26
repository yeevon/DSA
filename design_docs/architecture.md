# Architecture

Gating artifact for Phase 1 of `interactive_notes_roadmap.md`. Defines the parts of the system that require deliberate design; leans on the roadmap for constraints and settled decisions rather than restating them.

Scope is intentionally tight. The site is static by default. The only genuinely dynamic surfaces are: question generation (over the local `aiw-mcp` server from `jmdl-ai-workflows`, running cs-300's workflow modules), question rendering and answer capture, code execution for coding questions, and the FSRS review loop over persisted attempt state. Everything else is a pandoc + Astro content pipeline that terminates in static HTML.

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
│  ┌───────────────┐   HTTP    ┌──────────────────────────────────────────┐ │
│  │ browser       │◀─────────▶│ aiw-mcp (Python)                         │ │
│  │ (Astro bundle)│           │   = jmdl-ai-workflows MCP server,        │ │
│  │               │           │     orchestrating cs-300 workflow        │ │
│  │               │           │     modules (./workflows/*.py) over      │ │
│  │               │           │     local Ollama (Qwen) tier             │ │
│  │               │           └──────────────────────────────────────────┘ │
│  │               │   HTTP    ┌──────────────────────────────────────────┐ │
│  │               │◀─────────▶│ state service (Node, Astro API routes)   │ │
│  │               │           └──────────────────────────────────────────┘ │
│  └───────────────┘                              │                         │
│                                                 ▼                         │
│                                        SQLite (local file)                │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

Two local-only processes — separate language runtimes, separate persistence:

1. **`aiw-mcp` (Python).** The MCP server shipped by [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/) (≥0.2.0, FastMCP-based, KDR-008 in the upstream framework). cs-300 contributes workflow modules — `question_gen`, `grade`, `assess` — that register into the framework's workflow registry; ai-workflows' four-layer substrate (`primitives → graph → workflows → surfaces`) handles dispatch, retry, cost tracking, checkpointing, and the MCP transport. Browser reaches it over the streamable-HTTP transport added at jmdl-ai-workflows M14 (CORS-allowlisted to `http://localhost:4321`). External-workflow-module discovery (`AIW_EXTRA_WORKFLOW_MODULES` env var + `--workflow-module` CLI flag) shipped at jmdl-ai-workflows M16 in v0.2.0 (2026-04-24); cs-300's workflow modules under `./workflows/` are loaded via that surface — no fork, no monkey-patch, wheel stays domain-agnostic.
2. **State service (Node).** The Astro dev server itself, via API routes under `src/pages/api/`. Owns SQLite via Drizzle (M3); see §4.

There is no separate "FastMCP adapter we build." `aiw-mcp` IS the MCP server. cs-300 authors workflows + sets the agent (tier registry) per workflow + runs `aiw-mcp` against them. The framework abstracts the orchestration — see [ADR-0001](adr/0001_state_service_hosting.md) for the cross-language sibling-process rationale. (The original cs-300-filed feature request for external workflow module discovery was deleted 2026-04-25 once jmdl-ai-workflows v0.2.0 shipped the feature; see the **Workflow discovery** subsection below for the live wire-up.)

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
- Map `lstlisting` → `<CodeBlock lang="cpp">`. *(M2 T2/T5b implementation detail, 2026-04-23: the filter unconditionally sets `cpp` and clears any source-derived attrs because the chapter set is uniformly C++17 and pandoc preserves the lstlisting options as fence attributes that Shiki then mis-reads as the language hint. Per-class language detection — the original "preserve language hint" wording — is deferred until a non-C++ block lands; tracked at §6 below as a forward-work item against the post-build optional-content audit.)*
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

### Page chrome (UX layer)

Resolved in [ADR-0002](adr/0002_ux_layer_mdn_three_column.md), 2026-04-24, after M3 closed and the M3 surfaces (annotations, read-status, section nav) needed a deliberate place to live. M-UX milestone owns the implementation; this subsection documents the contract every future surface should compose into.

**Three-column desktop grid (≥1024px):**

```
┌────────────────────────────────────────────────────────────────────┐
│ top breadcrumb (sticky)                                            │
│   cs-300 / Lectures / ch_4 ─ Lists, Stacks, Queues   [‹ prev | next ›] │
├──────────────┬─────────────────────────────────────┬───────────────┤
│ left rail    │ center                              │ right rail    │
│              │                                     │               │
│ Required     │ chapter content (max-width ~75ch)   │ § TOC         │
│  ✓ ch_1      │   prose, callouts, code blocks      │   §1 Intro    │
│  ✓ ch_2      │                                     │   §2 …  ←now  │
│  → ch_4      │                                     │   §3 …        │
│    ch_5      │                                     │               │
│    ch_6      │                                     │ ─ annotations │
│              │                                     │   (interactive│
│ Optional     │                                     │    mode only) │
│    ch_7      │                                     │               │
│    ch_9 …    │                                     │               │
└──────────────┴─────────────────────────────────────┴───────────────┘
```

**Mobile (<1024px):** single column. Left rail collapses to hamburger drawer in the breadcrumb bar. Right-rail TOC moves to a collapsed `<details>` summary at content top. Annotations pane stays gated on `data-interactive-only` per [§4](#4-local-vs-public-mode).

**Interactive-mode affordances** (all gated via the M3 T5 `data-interactive-only` CSS contract):

- Per-chapter completion indicator (Canvas-style checkmark) in the left rail, derived from the `read_status` table.
- Annotations pane in the right rail (re-homed from the M3 always-rendered position).
- "Recently read" + "due for review" sections on the index page (M5 fills these in when the review queue lands).

**Static-mode posture** (public GH Pages deploy):

- Left rail + right-rail TOC + chapter content all SSR-rendered. Fully navigable without JS.
- Mobile drawer requires JS (one always-loaded island). Single graceful degradation: without JS, the drawer button is hidden and the left rail isn't reachable on mobile — desktop is unaffected.
- Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work.

**Shared layout primitives** live under `src/components/chrome/` (shell, breadcrumb, left rail, right rail, drawer). Existing component trees (`src/components/{annotations,read_status,callouts}/`) keep their interfaces; M-UX T6 re-homes the M3 components into the new chrome slots without changing their APIs.

**M3 `SectionNav` refactor.** Current implementation (T7) ships `SectionNav` as a fixed left rail. Per ADR-0002, M-UX T4 pulls its functionality into the right-rail TOC structure. The old left-rail position becomes the chapter-list nav. No two left rails.

**Collection-landing pages (M-UX T9 D5).** Each of the three collections also has a list-landing page rendered via `HomeLayout.astro`: `/lectures/`, `/notes/`, `/practice/`. These render the same chapter-card grid the index page uses (Required ch_1–ch_6 / Optional ch_7, ch_9–ch_13), with the home collection's link highlighted on each card via the `highlight` prop on `ChapterCard.astro`. The breadcrumb's middle path segment (`Lectures` / `Notes` / `Practice`) on chapter routes links to these landing pages. Total prerendered surface post-M-UX: **40 pages** = 36 chapter routes (12 chapters × 3 collections) + 3 collection-landing pages + 1 dashboard index. Cumulative `dist/client/` size delta vs pre-M-UX baseline: +756 KB / +17.5%.

**Right-rail TOC filter (M-UX b29d409).** TOC filters MDX `sections` frontmatter to top-level numbered sections (`^\d+\.\d+\s` regex — e.g. "1.1 Arrays and Vectors", "1.6 Vector Resize") so subsection titles ("Declaring a vector", "Common errors") stay reachable in-article via in-page scroll without cluttering the rail. ScrollSpy's `setCurrent()` guard ignores non-TOC anchors so subsection scroll doesn't blank the current top-level highlight.

### §1.7 Verification gates (M-UX-introduced infra)

Every code task in cs-300 must satisfy CLAUDE.md's "Code-task verification is non-inferential" non-negotiable: build success is not evidence of runtime correctness. M-UX added two harness scripts that the auditor runs at every code-task gate plus the milestone-close gate:

- **`scripts/smoke-screenshots.py`** (M-UX T7 cycle 2) — Selenium 4 driving headless Chrome (`--headless=new`) with isolated `/tmp/cs300-smoke-*` user-data-dir + ephemeral debugging port (zero conflict with the user's interactive Chrome). Captures PNGs across the smoke route matrix in `scripts/smoke-routes.json` at 4–5 viewports per route (375, 768, 1024, 1280, 2560). Output: `.smoke/screenshots/` (gitignored). Auditor opens 3+ screenshots per audit and cites visual evidence inline.
- **`scripts/functional-tests.py`** (M-UX T9 D6) — Selenium-driven assertion harness reading `scripts/functional-tests.json`. Six assertion types: `attr` (string/regex match on attribute), `count` (selector cardinality), `rect` / `getBoundingClientRect` (with `op` ∈ {`==`,`<=`,`>=`,`<`,`>`,`between`} after optional pre-scroll), `href-pattern` (regex over href), `aria-current` (presence + value), `text-pattern` (regex over `textContent`). Exits 0 on all-pass, non-zero on any failure. Currently 19 test cases / 30 assertions covering the M-UX chrome contracts (centered-chrome wide-viewport, sticky rails after scroll, LeftRail collection-aware hrefs, breadcrumb functional links, RHS-TOC top-level filter, landing-page card highlights).
- **`scripts/_selenium_helpers.py`** — shared Chrome flag set + `assert_preview_reachable()` helper used by both harnesses.
- **`requirements-dev.txt`** — `selenium==4.43.0` pin (dep-audit clean: 0 CVEs across 15 transitive packages, wheel SHA256 verified at T7 gate).

**Boundary.** The harness runs against `npm run preview` (static mode) by default — captures layout-at-viewport behaviour for every chapter route + the index + the three collection-landing pages. **Interactive-mode coverage** (annotation round-trip, mark-read paint, drawer keyboard navigation, focus-trap) is NOT yet exercised by the harness — deferred to `nice_to_have.md §UX-3` with explicit promotion trigger ("user-reported interactive-mode regression on push" or "M5 lands and needs end-to-end interactive coverage as part of its DoD").

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
  source_run_id TEXT NOT NULL,      -- aiw-mcp / ai-workflows run id, for evals replay
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

`answer_schema_json`, `reference_json`, `response_json` are the shapes that vary by question type. Locked per type so validators (both the generation-time `ValidatorNode` inside the cs-300 workflow module and the submission-time eval in the app) can be type-dispatched.

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

- `scripts/chapters.json` → upserts `chapters`. (Migrated from the Jekyll-era `_data/chapters.yml` in M2 T5a; that file was deleted in M2 T8.)
- `src/content/lectures/*.mdx` frontmatter (`sections:` array, generated by `scripts/build-content.mjs` from pandoc-emitted `ch_N-` prefixed header anchors) → upserts `sections`. (Amended 2026-04-23 from `notes/*.mdx`; lectures owns the header structure, so the section list lives there. Notes + practice carry chapter metadata only — they do not feed seeding.)

Seeding is idempotent. Questions and attempt state are never touched.

---

## 3. Dynamic surfaces

Four dynamic surfaces, each with a clear contract. Everything else is static rendering.

### 3.1 Question generation (`aiw-mcp` + cs-300 workflow modules)

cs-300 contributes the `question_gen` workflow as a Python module under `./workflows/` that registers with ai-workflows' workflow registry on import. The module is a LangGraph `StateGraph` composed of `TieredNode` (Ollama Qwen tier) + `ValidatorNode` (KDR-004 in the upstream framework) + `RetryingEdge` (KDR-006). M4 owns authoring this module and the matching `grade` / `assess` modules.

Frontend calls the `run_workflow` MCP tool on `aiw-mcp` with `{workflow_id: 'question_gen', inputs: {chapter_id, section_id?, count, types: [...]}}`. The MCP server returns `{run_id, status, ...}` per the `RunWorkflowOutput` schema; long-running runs come back as `status: 'pending'` with `awaiting: 'gate'` if a `HumanGate` is wired (cs-300's question_gen does not pause by default — generation is short and direct).

Frontend polls via `list_runs(workflow_id='question_gen')` or `get_run_status(run_id)` until `status == 'completed'`. Completed runs surface artifacts via the workflow's terminal state read.

Frontend POSTs artifacts to the cs-300 state service (`POST /api/questions/bulk`), which validates and inserts. **Validation happens twice**: once inside the cs-300 workflow's `ValidatorNode` (LangGraph-level, per KDR-004 in the upstream framework), once at insert (schema conformance against `questions.answer_schema_json`). Redundant on purpose; the upstream framework is an external surface and could change shape.

**Workflow discovery.** ai-workflows v0.2.0 (2026-04-24, M16) shipped the env-var loader (`AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade`) and the mirroring CLI flag (`--workflow-module cs300.workflows.question_gen`, repeatable). cs-300 launches `aiw-mcp` with that env var pointing at `cs300.workflows.question_gen` etc.; each module's `register("name", build)` call fires at import time and the existing dispatch lookup keeps working unchanged. M4 unblocked 2026-04-25; the original feature request at `aiw_workflow_discovery_issue.md` was deleted at unblock time per its own author note ("delete this file once the feature ships").

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

### 3.4 Reader state (Phase 3)

Two surfaces M3 owns end-to-end (the M3 dogfood — exercise the schema + API + mode-detection plumbing before M4+ heavier surfaces ride on top).

**Annotations.**

- `GET /api/annotations?section_id=…` → array of annotations for that section.
- `POST /api/annotations` → body `{ section_id, offset_start, offset_end, text }`, returns the inserted row.
- `DELETE /api/annotations/:id` → 204.

Char offsets are within the article container's `textContent`. UI gates on `mode === 'interactive'` per §4.

**Read-status.**

- `GET /api/read_status?chapter_id=…` → `{ section_ids: [...] }` for all marked sections in that chapter.
- `POST /api/read_status` → body `{ section_id }`, upserts a row with current timestamp; returns 204.
- `DELETE /api/read_status/:section_id` → un-mark; 204.

POST is idempotent (`ON CONFLICT DO UPDATE` refreshes `read_at`). UI gates on `mode === 'interactive'` per §4.

### 3.5 Review loop (Phase 5)

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

**Path A — Astro server (recommended).** Run `astro dev` or `astro preview` locally. Astro API routes under `src/pages/api/` own SQLite via Drizzle. Two processes in local mode: Astro server (Node, :4321) + `aiw-mcp` (Python sibling process running cs-300's workflow modules over the streamable-HTTP transport, port 8080).

**Path B — Client-side SQLite.** `@sqlite.org/sqlite-wasm` + OPFS for persistence. One process in local mode for state (just `aiw-mcp` running the cs-300 workflows). GH Pages deploy unchanged. Tradeoff: WASM bundle ~2MB, schema migrations run in browser, slightly awkward ops.

Path A is cleaner for schema management and likely how we'll ship. Path B is a fallback if running a second process is too heavy.

---

## 5. Open decisions

These block nothing immediately but need resolution before the phase that depends on each.

| decision                                 | block       | lean                        | decide by      |
|------------------------------------------|-------------|-----------------------------|----------------|
| Pandoc Lua filter vs manual port (Ch 1)  | Phase 2     | **resolved: HYBRID** (small filter + native pandoc) — see [`pandoc_probe.md`](pandoc_probe.md) | ✅ 2026-04-23 |
| State service: Astro server vs client SQLite | Phase 3 | **resolved: Path A (Astro server)** — see [ADR 0001](adr/0001_state_service_hosting.md) | ✅ 2026-04-24 |
| FSRS vs SM-2                             | Phase 5     | FSRS (`ts-fsrs`)            | Phase 5 start  |
| Code language: C++ only vs C+++Python    | Phase 6     | C++ baseline, Python later  | Phase 6 start  |
| Question-gen model tier (14B/32B/Claude) | Phase 4     | 14B start, A/B via tier_overrides | Phase 4 eval |
| `coding_practice/` persisted vs dynamic  | Phase 4     | —                           | Phase 4 design |

Resolved here:
- **Question persistence model:** accumulating (roadmap's "almost certainly" confirmed).
- **Answer evaluation surface:** mixed — mc, short (exact/fuzzy/numeric), llm_graded, code. Schema in §2 carries all four.
- **Audio file layout:** `public/audio/ch_N.{mp3,timestamps.json}`, pinned now to avoid Phase 7 unwind.
- **Pandoc version pin:** **3.1.3** (recorded in [`../.pandoc-version`](../.pandoc-version), 2026-04-23 via M2 T2). The HYBRID verdict and the Lua filter at `scripts/pandoc-filter.lua` are calibrated against this version; major-version bumps require re-running the M2 T2 raw-passthrough sweep at [`m2_raw_passthrough_sweep.md`](m2_raw_passthrough_sweep.md) and re-verifying the filter's per-class behaviour.

---

## 6. Out of scope for this doc

Not because unimportant — because already settled elsewhere or deferred to their phase:

- jmdl-ai-workflows internals (LangGraph substrate, FastMCP server, retry/cost primitives — closed surface from this repo's view; framework docs at <https://pypi.org/project/jmdl-ai-workflows/>; cs-300 is a downstream consumer that contributes workflow modules per §3.1).
- TTS provider choice (Phase 7 open question).
- Question prompt corpus shape under `coding_practice/` (Phase 4 open question; see `roadmap_addenda.md`).
- Phase 1 content acceptance criteria (deferred; see `roadmap_addenda.md`).
- **Per-language `<CodeBlock>` syntax detection** (forward-work item, M2 T2/T5b implementation deferred). The Lua filter at `scripts/pandoc-filter.lua` currently maps every `CodeBlock` to `cpp` since the SNHU-required arc (ch_1–ch_6) is uniformly C++17; pseudo-code in ch_2 renders close enough as cpp. When the post-build optional-content audit augments ch_7 / ch_9–ch_13, any chapter that introduces a non-C++ block (Python, shell, SQL, etc. — none today) must reintroduce per-class language detection in the filter: read the source `\begin{lstlisting}[language=…]` opt-arg if present and set the `CodeBlock.classes` accordingly, falling back to `cpp` only when no hint exists. Trigger: first non-C++ chapter block. Owner: post-build content audit Builder. See `design_docs/m2_raw_passthrough_sweep.md` "Forward link" for the pandoc-side counterpart.
