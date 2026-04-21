# CS 300 — Data Structures & Algorithms: Study Notes

Personal LaTeX study notes, cheat sheets, and practice prompts for a
university-level Data Structures & Algorithms course. Lectures and
readings are in a separate course platform; this repo is my
\emph{rewritten} version of the same material -- restructured,
supplemented with C++ context, and indexed for review.

All implementation examples target **C++** (C++17 idioms;
`std::vector`, `std::list`, `std::unordered_map`, etc.).

---

## Repository layout

```
cs-300/
├── notes-style.tex          # shared LaTeX preamble (colors, boxes, fonts)
├── week_1/ch_1/notes.tex    # flowcharts, pseudocode, arrays & vectors
├── week_1/ch_2/notes.tex    # algorithms, recursion, greedy, DP
├── week_2/ch_3/notes.tex    # data structures, ADTs, Big-O, sorting
├── week_3/ch_4/notes.tex    # lists, stacks, queues, deques
├── week_4/ch_5/notes.tex    # hash tables
├── week_5/ch_6/notes.tex    # trees and BSTs
├── optional/                # deeper-dive chapters outside the required path
│   ├── ch_7/  ch_9/         # AVL / red-black trees
│   ├── ch_10/               # graphs: BFS, DFS, Dijkstra, MST, topo sort
│   ├── ch_11/               # B-trees / 2-3-4 trees
│   ├── ch_12/               # set ADT
│   └── ch_13/               # bubble / bucket / quickselect / list idioms
├── cheat_sheets/            # one/two-page reference per chapter
│   └── ch_1.tex .. ch_6.tex
└── practice_prompts/        # self-coach drill prompts per chapter
    └── ch_1.md  .. ch_6.md
```

### What each artifact is for

- **`week_N/ch_M/notes.tex`** — the full chapter. Opens with a
  \emph{chapter map} (where this sits in the course, what you'll add to
  your toolkit, 7-item mastery checklist) and closes with a
  \emph{cross-reference box} pointing forward to later chapters.

- **`cheat_sheets/ch_M.tex`** — a compact two-page reference: cost
  tables, common patterns, gotchas. Intended as pre-exam / pre-assignment
  review, not a substitute for the notes.

- **`practice_prompts/ch_M.md`** — twelve self-contained coach prompts
  per chapter. Paste any one into a fresh LLM session; it makes you work
  through the assignment-shaped pipeline **problem → pseudocode → C++ →
  critique**, withholding answers until you submit. Each file also ends
  with a meta-drill for timed practice.

---

## Building the PDFs

Every `notes.tex` and every cheat sheet is self-contained and uses the
shared preamble via `\input{../../notes-style.tex}` (two levels up for
chapter notes, one level up for cheat sheets).

```bash
# Single chapter
cd week_3/ch_4
pdflatex -interaction=nonstopmode -halt-on-error notes.tex

# Single cheat sheet
cd cheat_sheets
pdflatex -interaction=nonstopmode -halt-on-error ch_4.tex
```

Required TeX Live packages: `geometry`, `parskip`, `xcolor`,
`pagecolor`, `hyperref`, `titlesec`, `enumitem`, `listings`,
`tcolorbox` (`most`), `titling`, `multicol`, `array`.
(Optional but recommended: `libertine` and `inconsolata` for the fonts
the preamble prefers — the preamble falls back gracefully if they're
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
  standard bookends; see `week_1/ch_1/notes.tex` for the template.
- `optional/` chapters are deliberately outside the course's required
  sequence — extra depth, not part of the graded path.

---

## Notes-writing principle

These notes are a **rewrite**, not a copy. Source material is read,
restructured around first principles, and supplemented with C++
context, real-library notes (`std::sort`, `std::unordered_map`, etc.),
and the gotchas I want to remember on a second pass. Scrape-and-paste
from source defeats the point.
