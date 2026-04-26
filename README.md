# CS 300 — Data Structures & Algorithms

LaTeX lecture notes, compact study notes, and coach-prompt exercises
for an undergraduate Data Structures & Algorithms course. Source material is
taught in pseudocode; this rewrite ports everything to **C++** (C++17
idioms; `std::vector`, `std::list`, `std::unordered_map`, etc.) and is
supplemented with material aimed at real DSA mastery rather than
course-passing.

> **Status — Milestones 1 + 2 + 3 ✅ closed 2026-04-24, M-UX ✅ closed 2026-04-25.**
> All six SNHU-required chapters (ch_1–ch_6) augmented with CLRS + MIT OCW
> material; site migrated from Jekyll to **Astro 6**, deployed via
> GitHub Actions to <https://yeevon.github.io/DSA/> (now **40 prerendered
> pages** = 36 chapter routes + 3 collection-landing pages + 1
> dashboard index). Content pipeline: `chapters/*.tex` →
> pandoc 3.1.3 + a small Lua filter →
> `src/content/{lectures,notes,practice}/*.mdx` → Astro static build
> with KaTeX math + Shiki syntax highlighting + a 5-component
> callout library matching the LaTeX source 1:1. **State service
> (M3)** runs locally via SQLite (Drizzle ORM) + `@astrojs/node`
> adapter; annotations + read-status surfaces ride a
> `data-interactive-only` CSS contract that hides them on the
> public deploy and lights them up in local mode (where the
> companion `aiw-mcp` server from M4 will eventually run).
> **M-UX (UI/UX polish, T1–T9)** rebuilt the chrome from a 51-line
> bare shell into the MDN-docs three-column layout: left-rail chapter
> nav (collection-aware), sticky breadcrumb with collection switcher
> + prev/next + functional links to collection-landing pages, right-rail
> in-chapter TOC (top-level numbered sections) with IntersectionObserver
> scroll-spy, mobile drawer below 1024px (CSS-only single-DOM-tree per
> T7 cycle 2), mastery-dashboard placeholder index. M3 surfaces (annotations
> pane, mark-read button, read-status indicators, section nav) re-homed
> into the new chrome with all four event contracts (`cs300:read-status-changed`,
> `cs300:toc-read-status-painted`, `cs300:annotation-added`,
> `cs300:drawer-toggle`) preserved. M-UX added a **Selenium verification
> harness** (`scripts/smoke-screenshots.py` + `scripts/functional-tests.py`,
> headless Chrome with isolated `/tmp/cs300-smoke-*` profile) that runs
> 19 functional-test cases / 30 assertions on every code-task gate;
> caught + fixed a real sticky-breadcrumb regression at milestone close.
> Optional chapters (ch_7, ch_9–ch_13) ship as committed-but-
> un-augmented; deeper review is deferred to the post-build
> content audit. **M4 (question generation) — unblocked 2026-04-25,
> next up** — question gen via [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/)'s
> `aiw-mcp` server running cs-300's workflow modules from
> `./workflows/`; the first surface that actually flips
> `detectMode()` to `'interactive'`. The upstream external-workflow-
> module discovery feature cs-300 was waiting on shipped in
> jmdl-ai-workflows v0.2.0 (2026-04-24, upstream M16) — `aiw-mcp`
> now loads `cs300.workflows.*` via the `AIW_EXTRA_WORKFLOW_MODULES`
> env var. Interactive features further out (M5–M7: FSRS
> spaced repetition, in-browser code execution, narrated audio)
> are designed but not built. Two M-UX residuals (collapsible
> chapter sections; CompletionIndicator JSON → `GET /api/sections`
> endpoint, ~432 KB savings) parked in
> [`design_docs/nice_to_have.md`](design_docs/nice_to_have.md)
> §UX-2 / §UX-4 with explicit M5-coupled promotion triggers. See
> [`design_docs/milestones/`](design_docs/milestones/) for the
> operational plan and
> [`design_docs/architecture.md`](design_docs/architecture.md) for
> the system design.

---

## What this is

Two things in one repo:

1. **Course notes.** A rewrite of standard DSA material — arrays,
   lists, hash tables, trees, graphs, sorts — restructured around
   first principles, with C++ context, gotchas, and worked examples.
   Six chapters (7, 9, 10, 11, 12, 13) extend beyond the official
   course path for depth.

2. **Reference integration for [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/).**
   The planned interactive features — question generation, retry /
   validator pairing, cost tracking, evals replay — all come from a
   separate framework. cs-300 contributes its domain-specific
   workflow modules (under `./workflows/`) and runs them via the
   framework's `aiw-mcp` MCP server. cs-300 is the proving ground
   that demonstrates the framework does useful work end-to-end.

---

## How to use it (today)

Read the rendered PDFs (one per chapter under `chapters/ch_N/`), or
browse the GitHub Pages site as a static viewer. Nothing interactive
yet.

Build a chapter's PDFs:

```bash
cd chapters/ch_4
pdflatex -interaction=nonstopmode -halt-on-error lectures.tex
pdflatex -interaction=nonstopmode -halt-on-error notes.tex
```

Required TeX Live packages: `geometry`, `parskip`, `xcolor`,
`pagecolor`, `hyperref`, `titlesec`, `enumitem`, `listings`,
`tcolorbox` (`most`), `titling`, `multicol`, `array`. Optional but
recommended: `libertine`, `inconsolata` (the preamble falls back
gracefully if missing).

---

## Repository layout

> Describes the current pre-migration state. Phase 2 replaces the
> Jekyll bits with Astro under `src/`.

```text
cs-300/
├── notes-style.tex                  # shared LaTeX preamble (callout boxes, listings styles)
│
├── chapters/                        # source of truth — one folder per chapter
│   ├── ch_1/  (required)            # programming basics, arrays, vectors
│   ├── ch_2/                        # algorithms, recursion, greedy, DP
│   ├── ch_3/                        # ADTs, Big-O, sorting
│   ├── ch_4/                        # lists, stacks, queues, deques
│   ├── ch_5/                        # hash tables
│   ├── ch_6/                        # trees and BSTs
│   ├── ch_7/  (optional)            # heaps and priority queues
│   ├── ch_9/                        # AVL and red-black trees
│   ├── ch_10/                       # graphs
│   ├── ch_11/                       # B-trees
│   ├── ch_12/                       # sets
│   └── ch_13/                       # extra sorts and list idioms
│
├── coding_practice/                 # prompt corpus consumed by cs-300 workflow modules
│                                    # (./workflows/ when M4 lands)
│   ├── cplusplus/
│   ├── psuedo/
│   └── python/
│
├── design_docs/
│   ├── architecture.md              # gating doc for Phase 1
│   └── roadmap_addenda.md           # local supplement to the Drive roadmap
│
├── tools/                           # one-off scripts (e.g. source scraping)
│
├── src/                             # Astro app (M2)
│   ├── pages/                       # routes: index + dynamic [id].astro per collection
│   ├── content/                     # generated MDX (gitignored; regenerated by prebuild)
│   ├── content.config.ts            # collection schemas (lectures, notes, practice)
│   ├── layouts/                     # Base.astro shell
│   └── components/callouts/         # 5 LaTeX-env components + CodeBlock
│
├── public/                          # Astro static assets
│   └── audio/                       # Phase 7 audio drop site (currently empty + .gitkeep)
│
├── scripts/
│   ├── pandoc-filter.lua            # MDX-friendly LaTeX → markdown filter
│   ├── build-content.mjs            # prebuild: pandoc each chapter → src/content/*.mdx
│   └── chapters.json                # per-chapter metadata (title, subtitle, n, required)
│
├── .github/workflows/deploy.yml     # Astro build + deploy-pages
├── astro.config.mjs                 # site, base, MDX integration, math plugins
├── tsconfig.json
├── package.json
├── .nvmrc                           # Node 22
└── .pandoc-version                  # pandoc 3.1.3
```

### What each chapter folder contains

Every `chapters/ch_N/` holds:

- **`lectures.tex` / `lectures.pdf`** — the full chapter. Opens with a
  *chapter map* (where this sits in the course, what you'll add to
  your toolkit, 7-item mastery checklist) and closes with a
  *cross-reference box* pointing forward.
- **`notes.tex` / `notes.pdf`** — compact two-page reference: cost
  tables, common patterns, gotchas. Pre-exam / pre-assignment review,
  not a substitute for the lectures.
- **`practice.md`** — twelve self-contained coach prompts. Paste any
  one into a fresh LLM session; it makes you work through
  **problem → pseudocode → C++ → critique**, withholding answers
  until you submit. Each file ends with a meta-drill for timed
  practice.

---

## Architecture

The system is static-by-default. Public deploy is just static HTML.
Two local-only sibling processes light up the interactive features
when present; if they're absent, the UI degrades cleanly to read-only:

- **`aiw-mcp`** (Python) — the MCP server shipped by
  [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/),
  orchestrating cs-300's workflow modules from `./workflows/` over
  the local Ollama (Qwen) tier.
- **State service** (Node) — Astro API routes under `src/pages/api/`
  owning local SQLite via Drizzle.

Full design in
[`design_docs/architecture.md`](design_docs/architecture.md).
Operational plan (milestones M1–M7, each with its own README and
task breakouts) in
[`design_docs/milestones/`](design_docs/milestones/). The phased
roadmap lives in Google Drive (`interactive_notes_roadmap.md`);
local addenda (sequencing, deferred decisions, Phase 1 acceptance
criteria) in
[`design_docs/roadmap_addenda.md`](design_docs/roadmap_addenda.md).

Settled tech worth flagging up front:

- **Site:** Astro (post-Phase-2), static output for GitHub Pages.
- **Content build:** pandoc + a Lua filter, `chapters/*.tex` →
  `src/content/*.mdx`.
- **State:** SQLite (Drizzle ORM), local-only.
- **Bridge:** `aiw-mcp` (jmdl-ai-workflows ≥0.2.0, Python ≥3.12) over the streamable-HTTP transport on port 8080, browser ↔ cs-300 workflow modules. v0.2.0 (2026-04-24) shipped the `AIW_EXTRA_WORKFLOW_MODULES` external-workflow-module discovery feature cs-300 was waiting on; M4 unblocked 2026-04-25.
- **Scheduling:** FSRS via `ts-fsrs`.
- **Audio:** pre-generated TTS MP3s + sentence-timestamp JSON.
- **Question generation:** local Ollama; no cloud LLM APIs at
  runtime.

---

## Conventions

- **Style preamble** (`notes-style.tex`) owns all colors and callout
  boxes. Don't redefine them per chapter.
- **Callout boxes:**
  - `defnbox` — definitions
  - `ideabox` — key ideas, intuitions
  - `warnbox` — gotchas / things to watch for
  - `examplebox` — worked examples
  - `notebox` — asides, tangents, further reading
- **Code listings** go in `lstlisting` with `language=C++` when
  applicable.
- **Chapter bookends:** chapter-opening map and end cross-reference
  box; see `chapters/ch_1/lectures.tex` for the template.
- Chapters 7, 9, 10, 11, 12, 13 are deliberately outside the course's
  required sequence — extra depth, not part of the graded path.

---

## Notes-writing principle

These notes are a **rewrite**, not a copy. Source material is read,
restructured around first principles, and supplemented with C++
context, real-library notes (`std::sort`, `std::unordered_map`, etc.),
and the gotchas worth remembering on a second pass. Scrape-and-paste
from source defeats the point.

---

## License

[Creative Commons Attribution-NonCommercial-ShareAlike 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (CC BY-NC-SA 4.0) for everything in this repo — content and code alike. See [LICENSE](LICENSE) for the full canonical legal text and the scope statement.

This is personal course material that augments the SNHU CS 300 syllabus with concepts referenced from MIT OpenCourseWare 6.006 and CLRS. **Non-commercial use only.** No multi-user deployment. No cloud LLM APIs at runtime — question generation runs against local Ollama.

---

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for everything that's changed,
including small ops.
