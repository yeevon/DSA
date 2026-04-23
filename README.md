# CS 300 — Data Structures & Algorithms

LaTeX lecture notes, compact study notes, and coach-prompt exercises
for an undergraduate Data Structures & Algorithms course. Source material is
taught in pseudocode; this rewrite ports everything to **C++** (C++17
idioms; `std::vector`, `std::list`, `std::unordered_map`, etc.) and is
supplemented with material aimed at real DSA mastery rather than
course-passing.

> **Status — pre-Phase-1.** Content (LaTeX lectures, compact notes,
> practice prompts) is the only thing that works today. The site
> renders via Jekyll on GitHub Pages as a placeholder; Phase 2
> replaces it with Astro. Interactive features (LLM-generated practice
> questions, FSRS spaced repetition, in-browser code execution,
> narrated audio) are designed but not built. See
> [`design_docs/architecture.md`](design_docs/architecture.md).

---

## What this is

Two things in one repo:

1. **Course notes.** A rewrite of standard DSA material — arrays,
   lists, hash tables, trees, graphs, sorts — restructured around
   first principles, with C++ context, gotchas, and worked examples.
   Six chapters (7, 9, 10, 11, 12, 13) extend beyond the official
   course path for depth.

2. **Reference integration for `ai-workflows`.** The planned
   interactive features — question generation, retry / validator
   pairing, cost tracking, evals replay — all come from a separate
   framework. cs-300 is the proving ground that demonstrates the
   framework does useful work end-to-end.

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
├── coding_practice/                 # prompt corpus for ai-workflows question generation
│   ├── cplusplus/
│   ├── psuedo/
│   └── python/
│
├── resources/                       # week-level sidecar TeX
│   └── week_{2,3,4,5}.{tex,pdf}
│
├── design_docs/
│   ├── architecture.md              # gating doc for Phase 1
│   └── roadmap_addenda.md           # local supplement to the Drive roadmap
│
├── tools/                           # one-off scripts (e.g. source scraping)
│
└── (Jekyll site: index.md, _config.yml, _data/, _includes/, _layouts/, assets/, lectures/, notes/)
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
Two local-only processes — a FastMCP adapter wrapping `ai-workflows`
and a state service over local SQLite — light up the interactive
features when present; if they're absent, the UI degrades cleanly to
read-only.

Full design in
[`design_docs/architecture.md`](design_docs/architecture.md). The
phased roadmap lives in Google Drive
(`interactive_notes_roadmap.md`); local addenda (sequencing, deferred
decisions) in
[`design_docs/roadmap_addenda.md`](design_docs/roadmap_addenda.md).

Settled tech worth flagging up front:

- **Site:** Astro (post-Phase-2), static output for GitHub Pages.
- **Content build:** pandoc + a Lua filter, `chapters/*.tex` →
  `src/content/*.mdx`.
- **State:** SQLite (Drizzle ORM), local-only.
- **Bridge:** HTTP FastMCP adapter for browser ↔ ai-workflows.
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

Dual licensed (settled per roadmap; LICENSE files to follow):

- **Content** — `chapters/`, `resources/`, `lectures/`, `notes/`,
  generated PDFs:
  [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
  (matches MIT OCW).
- **Code** — build scripts, future Astro components, future MCP
  adapter, ai-workflows integration glue: MIT.

No commercial use. No multi-user deployment. No cloud LLM APIs at
runtime — question generation runs against local Ollama.

---

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for everything that's changed,
including small ops.
