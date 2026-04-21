# CS 300 — Data Structures & Algorithms: Study Notes

Personal LaTeX study notes, cheat sheets, and practice prompts for a
university-level Data Structures & Algorithms course. Lectures and
readings are in a separate course platform; this repo is my
*rewritten* version of the same material — restructured, supplemented
with C++ context, and indexed for review.

All implementation examples target **C++** (C++17 idioms;
`std::vector`, `std::list`, `std::unordered_map`, etc.).

---

## Repository layout

```text
cs-300/
├── notes-style.tex           # shared LaTeX preamble
│
├── chapters/                 # all chapter sources, one folder per chapter
│   ├── ch_1/  (required)     # programming basics, arrays, vectors
│   ├── ch_2/                 # algorithms, recursion, greedy, DP
│   ├── ch_3/                 # data structures, ADTs, Big-O, sorting
│   ├── ch_4/                 # lists, stacks, queues, deques
│   ├── ch_5/                 # hash tables
│   ├── ch_6/                 # trees and BSTs
│   ├── ch_7/  (optional)     # heaps and priority queues
│   ├── ch_9/                 # AVL and red-black trees
│   ├── ch_10/                # graphs
│   ├── ch_11/                # B-trees
│   ├── ch_12/                # sets
│   └── ch_13/                # extra sorts and list idioms
│
├── resources/                # week-level sidecar TeX (not chapter-scoped)
│   └── week_{2,3,4,5}.{tex,pdf}
│
├── index.md                  # GitHub Pages home
├── _config.yml               # Jekyll configuration
├── _data/chapters.yml        # chapter metadata used by nav and index
├── _includes/nav.html        # three-dropdown top nav
├── _layouts/{default,pdf}.html
├── assets/style.css
├── notes/ch_N.md             # viewer wrappers → chapters/ch_N/notes.pdf
└── cheats/ch_N.md            # viewer wrappers → chapters/ch_N/cheat.pdf
```

### What each chapter folder contains

Every `chapters/ch_N/` holds exactly five files:

- **`notes.tex` / `notes.pdf`** — the full chapter. Opens with a
  *chapter map* (where this sits in the course, what you'll add to
  your toolkit, 7-item mastery checklist) and closes with a
  *cross-reference box* pointing forward.
- **`cheat.tex` / `cheat.pdf`** — a compact two-page reference:
  cost tables, common patterns, gotchas. Intended as pre-exam /
  pre-assignment review, not a substitute for the notes.
- **`practice.md`** — twelve self-contained coach prompts per chapter.
  Paste any one into a fresh LLM session; it makes you work through
  the **problem → pseudocode → C++ → critique** pipeline, withholding
  answers until you submit. Each file ends with a meta-drill for
  timed practice. Rendered by Jekyll at `/practice/ch_N/`.

---

## Building the PDFs

Every `notes.tex` and `cheat.tex` is self-contained and uses the
shared preamble via `\input{../../notes-style.tex}` (two levels up
from either file lands at the repo root).

```bash
# Single chapter's notes and cheat sheet
cd chapters/ch_4
pdflatex -interaction=nonstopmode -halt-on-error notes.tex
pdflatex -interaction=nonstopmode -halt-on-error cheat.tex
```

Required TeX Live packages: `geometry`, `parskip`, `xcolor`,
`pagecolor`, `hyperref`, `titlesec`, `enumitem`, `listings`,
`tcolorbox` (`most`), `titling`, `multicol`, `array`.
(Optional but recommended: `libertine` and `inconsolata` for the
fonts the preamble prefers — it falls back gracefully if they're
missing.)

---

## Conventions

- **Style preamble** (`notes-style.tex`) owns all colors and callout
  boxes. Do not redefine them per chapter.
- **Callout boxes**:
  - `defnbox` — definitions
  - `ideabox` — key ideas, intuitions
  - `warnbox` — gotchas / things to watch for
  - `examplebox` — worked examples
  - `notebox` — asides, tangents, further reading
- **Code listings** go in `lstlisting` with `language=C++` when
  applicable.
- **Chapter-opening map** and **end cross-reference box** are the
  standard bookends; see `chapters/ch_1/notes.tex` for the template.
- Chapters 7, 9, 10, 11, 12, 13 are deliberately outside the course's
  required sequence — extra depth, not part of the graded path.

---

## Notes-writing principle

These notes are a **rewrite**, not a copy. Source material is read,
restructured around first principles, and supplemented with C++
context, real-library notes (`std::sort`, `std::unordered_map`, etc.),
and the gotchas I want to remember on a second pass. Scrape-and-paste
from source defeats the point.
