# Chapter 1 — As-Is Review

**Scope:** `chapters/ch_1/lectures.tex` (2508 lines) + `chapters/ch_1/notes.tex` (143 lines, formerly `cheat.tex`). `practice.md` excluded per Phase-4 deferral.

**Purpose:** Step 1 of the per-chapter loop. Inventory of what's currently in ch_1 — topics, depth, callouts, mastery checklist, cross-references — so Step 2 (CLRS + OCW gap analysis) has a baseline to compare against. **No augmentation suggestions in this doc.**

**Subtitle (from `\title`):** *Review: Flowcharts, Pseudocode, and Arrays and Vectors*

**Source coupling:** Built on top of the SNHU course's introductory zyBook material, which uses **Coral** (a teaching pseudocode language with flowchart and code forms) as the on-ramp before C++. References to "the textbook" and Coral appear throughout 1.1–1.4.

---

## Chapter map (verbatim from opening `ideabox`)

**Where this sits.** Ch_1 is "the runway." Every later chapter assumes fluency with `std::vector`, knowing when indexing is O(1), and being able to trace a loop by hand.

**Toolkit additions promised:**
- Mental model of contiguous storage (arrays + `std::vector`): what's fast (back-end ops, random access), what's slow (insert/erase in middle).
- Iteration patterns: running best, counter, in-place transform, paired scan.
- Value semantics in C++ (copy/compare/pass-by-ref, cost of accidental deep copy).
- C-string survival + `std::string` / `cctype` upgrades.

**Mastery checklist (7 items, current bar):**
1. Loop scanning `vector<int>` keeping running max + index where it occurred, in one pass.
2. Big-O of `push_back`, `pop_back`, `insert(begin(), x)`, `erase(it)`, `at(i)` — and *why*.
3. Why `resize(n)` and a `push_back` loop produce same end state but differ in init values + perf.
4. Swap two vector elements with and without `std::swap`; explain why `a = b; b = a;` fails.
5. Convert a parallel-vectors design into a `vector<Struct>` and explain the tradeoff.
6. Reverse a `vector` in place correctly first try (loop bound `n/2`, swap by temp).
7. Read C-string char-by-char, classify with `cctype`, explain why `strcmp` returns `int`, not `bool`.

**Looking-ahead (forward refs):** Ch2 = problem-solving strategies, Ch3 = formal Big-O, Ch4 = linked lists (with vector as the comparison baseline).

---

## Section-by-section inventory (`lectures.tex`)

Legend for "Callouts": `D` = `defnbox`, `I` = `ideabox`, `W` = `warnbox`, `E` = `examplebox`, `N` = `notebox`. Counts are exact. The closing `ideabox [The big picture for X.Y]` is included in the I-count but called out separately.

### 1.1 Programming Basics — lines 60–226
- **Subsections:** What a program is · Statements & execution order · Variables · Assignment · Input · Output (with subsubsection: Cursor & newlines)
- **Callouts:** D×3, I×1, W×1, E×3, N×0  (closes with "big picture for 1.1")
- **Topics:** Compiler vs interpreter; statement-by-statement execution; variable as `(name, type, value)` triple; `=` as "becomes," not equality; `=` vs `==` trap; standard input/output streams; Coral input parallelogram → C++ `cin >>`; output cursor + escape sequences (`\n`, `\t`, `\\`, `\"`).
- **Depth markers:** Conceptual / introductory. Heavy Coral framing. Example walkthrough of "wage / salary" program traces execution by hand.
- **Coral-specific content:** Yes — flowchart shapes (rectangles, parallelograms, diamonds), Coral input/output statements compared to C++.

### 1.2 Code and Pseudocode — lines 228–331
- **Subsections:** Why text not pictures · Pseudocode · Coral code vs Coral flowcharts
- **Callouts:** D×1, I×1, W×1, E×1, N×0
- **Topics:** Why textual languages won; pseudocode definition + conventions (kept: one-stmt-per-line, named vars, control-flow keywords, indentation; dropped: types, semicolons, lib calls); pseudocode is not a language; Coral as stricter executable pseudocode; same-program-three-notations comparison (pseudocode / Coral / C++).
- **Depth markers:** Conceptual + comparative. Sets up the "design in pseudocode, then translate" habit.

### 1.3 Arrays and Vectors (general concept) — lines 333–437
- **Subsections:** Motivation (one name, many values) · Indexing · Zero-based indexing · Arrays vs vectors
- **Callouts:** D×1, I×2, W×1, E×1, N×1
- **Topics:** Array def (fixed-length, ordered, same-type, indexable); bracket notation; **address arithmetic for O(1) access** (`start + i × element_size`); zero-based justification (offset, not cardinal); off-by-one errors (with explicit "C++ UB on out-of-range, no exception/error"); arrays vs vectors comparison table (C-style array, `std::array`, `std::vector`); explicit "vectors are not linked lists" callout (forward to Ch4).
- **Depth markers:** Includes the **why** of O(1) (memory model), not just the claim.

### 1.4 Vectors (in C++) — lines 439–590
- **Subsections:** Declaring · Accessing elements · Size/looping/`size_t` · Initialisation · Common errors
- **Callouts:** D×2, I×2, W×1, E×1, N×1
- **Topics:** `#include <vector>`; angle-bracket type parameter as **template parameter**; `std::` prefix vs `using namespace std;` (with footgun explanation); `.at()` (bounds-checked) vs `[]` (UB); 1-based input → 0-based index translation example; classic indexed loop with `size_t`; `size_t` definition (unsigned, signed/unsigned warning); range-based for as cleaner default; four init patterns (default-constructed, fill-value, brace-list, empty); empty + push_back as the most common project pattern; named common errors (missing `#include`, missing `std::`, OOB with `[]`, signed/unsigned).
- **Depth markers:** Drops Coral training wheels here. Type system foundations introduced (template parameter, `size_t`).

### 1.5 Array / Vector Iteration Drill — lines 592–723
- **Subsections:** Pattern 1 (running best) · Pattern 2 (running counter) · Pattern 3 (one selection-sort pass) · Range-based form
- **Callouts:** D×0, I×4, W×1, E×0, N×1
- **Topics:** Three named iteration patterns (with the textbook drills as instances); find max with seed-from-first-element + index-of-max variant; "never seed max with 0" (negative-only counter-example); count negatives + running sum/product variants; **selection-sort as Pattern 1 + swap**; range-based forms.
- **Depth markers:** Names the patterns explicitly so they're reusable. Selection-sort intro (in-place) here as a worked example, full sort coverage deferred to Ch3.

### 1.6 Iterating Through Vectors — lines 725–881
- **Subsections:** Anatomy of canonical loop · Empty/infinite loops · Common errors · Standard-library alternative
- **Callouts:** D×0, I×3, W×2, E×0, N×2
- **Topics:** Three-piece loop dissection (init/condition/update); `<` vs `<=` trap with terminate-with-throw output; `++i` vs `i++` (iterator/cost rationale); reverse-iteration with `size_t` is **infinite loop** (with two safe-pattern fixes); algorithm header preview (`accumulate`, `max_element`, `count_if` with lambda); 30-second iterator preview (`begin`, `end`, one-past-the-end convention); when to write loop vs call algorithm.
- **Depth markers:** Real STL exposure here (lambdas in `count_if`); iterator concept previewed without formalism.

### 1.7 Multiple Vectors — lines 883–1022
- **Subsections:** Parallel-vectors technique · Short-circuiting · Why parallel vectors are a smell · When parallel vectors are okay
- **Callouts:** D×1, I×1, W×1, E×0, N×0
- **Topics:** Parallel vectors with same-index-same-row convention; flag-based short-circuit (textbook style) → `break` and `std::find` (better); **linear search definition + O(n) cost note** (forward ref: hash tables / BSTs exist to beat this); parallel vectors as a smell (drift, doesn't scale); refactor to vector-of-structs (`Bid` example matches CS 300 projects); when SoA is actually justified (scratch data; SIMD/cache).
- **Depth markers:** Anti-pattern → correct-pattern migration explicit. SoA vs AoS aside.

### 1.8 Vector Resize — lines 1024–1176
- **Subsections:** Declaring without size · `resize(n)` · `resize` vs `push_back` · **Size, capacity, `reserve()` (what intro texts omit)** · Related operations
- **Callouts:** D×1, I×2, W×1, E×1, N×0
- **Topics:** Empty declaration (any access is invalid); `resize(n)` semantics for grow/shrink/no-op (default-init values); two ways to read N user values; rule of thumb (resize for known-N, push_back for streaming); **size vs capacity formal definition** with explicit "this is what intro texts omit"; geometric reallocation behind `push_back` → amortized O(1); `reserve()` to skip intermediate reallocations; `resize` vs `reserve` mix-up bug; `clear`, `pop_back`, `empty()` quick ref (with note that `empty()` is preferred over `size() == 0` for habit-forming reasons).
- **Depth markers:** **First explicit "amortized" mention.** Drops further into the weeds than typical intro material.

### 1.9 push_back, back, pop_back — lines 1178–1305
- **Subsections:** Three back-end ops · Vector as a stack · Why back fast/front slow · Worked example · Small gotchas
- **Callouts:** D×1, I×3, W×1, E×1, N×0
- **Topics:** Defines the back interface formally (push_back / back / pop_back / front, all O(1) amortized); **`pop_back` returns void with exception-safety rationale**; vector-as-stack mapping (push_back↔push, back↔top, pop_back↔pop); grocery-list reverse-order demo (LIFO); push_front would be O(n), use `std::deque` instead (forward ref: Ch4); CSV-reading worked example (the recurring CS 300 pattern); gotchas (back/pop_back on empty = UB; push_back invalidates references).
- **Depth markers:** Explains exception-safety reasoning behind `void` return — beyond intro level.

### 1.10 Modifying, Copying, Comparing Vectors — lines 1307–1470
- **Subsections:** Modifying in loop · Shifting patterns (direction matters) · Vector copy with `=` · Vector compare with `==` · Backing memory
- **Callouts:** D×1, I×3, W×2, E×2, N×1
- **Topics:** Read-then-write in loop; range-based for must use `int& x` to mutate; left-shift (forward, safe) vs right-shift (smears unless walked backward) worked examples with traces; **value semantics formal definition** (contrast with Python/Java reference semantics); deep-copy O(n) cost; `const&` and `std::move` mentioned as habits; element-wise `==`; lexicographic `<`/`>`/`<=`/`>=` aside; **floating-point `==` warning** with `abs(a - b) < eps` recommendation; reallocation invalidates references/iterators.
- **Depth markers:** Floating-point gotcha is unusual for an intro chapter; `std::move` mention is C++11+ semantics.

### 1.11 Swapping Two Variables — lines 1472–1579
- **Subsections:** Why naive fails · Temp-variable pattern · `std::swap` · Swapping list elements
- **Callouts:** D×1, I×1, W×2, E×4, N×1
- **Topics:** Swap definition; broken `x=y; y=x;` walkthrough; correct three-line temp pattern; `std::swap` as the preferred form; **`std::swap` for `vector`/`string` is O(1) (swaps internal pointers)**; "don't shadow `std::swap`" warning; reverse-vector-in-place worked example (loop bound `v.size() / 2`, integer-division handles odd length); off-by-one if loop runs to `v.size()`; `std::reverse` in `<algorithm>` exists (forward ref to sort algorithms).
- **Depth markers:** O(1) swap-pointers note for vector/string is non-obvious.

### 1.12 Debugging Example: Reversing a Vector — lines 1581–1701
- **Subsections:** Buggy starting point · Bug 1 (off-by-one mirror) · Bug 2 (assignment ≠ swap) · Bug 3 (loop too long) · The methodology
- **Callouts:** D×0, I×1, W×2, E×3, N×1
- **Topics:** Three-bug sequential walkthrough; each bug exposed only after fixing the previous; hand-traces of the vector contents after each iteration; explicit 4-step debugging methodology (read the error → trace by hand → fix one bug at a time → use `.at()` during dev); integer-division handling of odd-length vectors; "instrument, don't stare" big-picture takeaway.
- **Depth markers:** **Meta-skill chapter** — teaching the *process* of debugging loop bugs, scaling to later sort/search/graph algorithms.

### 1.13 Arrays vs. Vectors — lines 1703–1834
- **Subsections:** Syntax side-by-side · Why arrays are dangerous · Feature comparison · When arrays still show up
- **Callouts:** D×1, I×1, W×2, E×2, N×0
- **Topics:** C array vs vector declaration/access side-by-side; **memory-corruption demo** (`weights[3]` clobbers neighboring `age` variable); 7-row feature comparison table; **array decay** formal definition (size info lost on pass/assign, `sizeof / sizeof[0]` only works in declaring scope); inevitable-array contexts (string literals, `argv`, legacy C APIs, embedded/perf); `std::array<T, N>` as the safe fixed-size middle ground; "you can't call `.size()` on a raw array" warning.
- **Depth markers:** Memory-corruption-by-overflow is concrete. Array decay is a formal language-level concept.

### 1.14 Two-Dimensional Arrays — lines 1836–1966
- **Subsections:** Declaring/using · Iterating loop order matters · Passing to function · vector-of-vector alternative · Higher dimensions
- **Callouts:** D×1, I×3, W×1, E×4, N×1
- **Topics:** **Row-major order definition** (`r * C + c` offset, rightmost index changes fastest); brace-init showing visible row shape; standard `for r { for c { ... } }`; **cache performance** (row-first vs column-first can differ 10× on large matrices); three equivalent function-signature forms (`int a[2][3]`, `int a[][3]`, `int (*a)[3]`); **`int**` does NOT take a 2D array** (12 contiguous ints ≠ 3 pointers to 4 ints); vector-of-vectors with non-contiguous rows + heap-per-row caveat; **flat `vector<int>` with manual `r*C+c` indexing as the "real" matrix form** (one allocation, contiguous, same big-O); higher-dim stack-blow warning.
- **Depth markers:** Cache locality rationale is uncommon in intro DSA. Three function-signature forms is C-language depth.

### 1.15 Char Arrays / C Strings — lines 1968–2109
- **Subsections:** Declaring · Why printing works · Three common bugs · You cannot assign · vs `std::string`
- **Callouts:** D×1, I×1, W×4, E×2, N×1
- **Topics:** **Null-terminated string formal definition** (length not stored, scan for `\0`); three equivalent declarations (sized, inferred, char-by-char); reserved-slot-for-null requirement; `char[3] = "Amy"` silent-drop warning; `cout` reads-until-`\0` semantics; three explicit common bugs (loop to array size / loop past array / overwrite null) with worked examples and undefined-behavior callout; array name not lvalue → `strcpy`/`strncpy`; `strcpy` doesn't bounds-check destination (**buffer overflow + classic security vuln framing**); 6-row C-string vs `std::string` table; `.c_str()` to bridge to legacy C APIs.
- **Depth markers:** Security-vulnerability framing for buffer overflow is unusual at intro level.

### 1.16 String Library Functions — lines 2111–2291
- **Subsections:** Modifying · Inspecting · Three `strcmp` traps · Transform pattern · Modern C++ translation
- **Callouts:** D×1, I×1, W×4, E×3, N×0
- **Topics:** **`str` / `mem` / `n` naming convention** (str = null-terminated, mem = explicit length, n = bounded variant); modifying functions table (`strcpy`, `strncpy`, `strcat`, `strncat`); destination-first arg order; `strcpy` no destination check; array-name assignment doesn't copy (only OK in declaration); inspecting functions table (`strlen`, `strcmp`, `strncmp`, `strchr`, `strstr`); three `strcmp` traps (`==` compares pointers; missing `== 0`; `strlen` on un-null'd buffer); transform-in-place pattern with `strlen`-in-loop O(n) hoisting tip; idiomatic null-byte-stop loop; **C → modern C++ translation table** (7 rows: `strcpy → =`, `strcat → +=`, `strlen → .size()`, etc.).
- **Depth markers:** Naming-convention rule is genuinely useful systematization. Translation table positions C-strings as legacy-only.

### 1.17 cctype — lines 2293–2445
- **Subsections:** Classification · Conversion · Case-insensitive compare · C++20 ranges + lambdas · Parsing pattern
- **Callouts:** D×1, I×1, W×1, E×4, N×0
- **Topics:** **`<ctype.h> → <cctype>` rule** (C-prefix C++ headers); 9-row classification function table (`isalpha`, `isdigit`, `isalnum`, `isspace`, `isblank`, `islower`/`isupper`, `isxdigit`, `ispunct`, `isprint`, `iscntrl`); `int` in / `int` out, nonzero-as-true; `toupper`/`tolower` (no-op on non-letters → can apply unconditionally); **`unsigned char` cast is required (negative-`char` UB on platforms with signed `char`, accented letters)**; case-insensitive C-string compare worked example; `std::transform` + lambda alternative (C++20-flavored); phone-number digit-extraction parsing example.
- **Depth markers:** The signed-char UB is a legitimate gotcha that surprises pros, not just beginners.

---

## Closing material (after §1.17)

### Summary section (6 bullets, lines 2447–2481)
1. Prefer safe abstractions (`vector` > arrays, `string` > `char[]`, `.at()` > `[]` while debugging).
2. Indices are contracts (`size_t` is unsigned, `v.size()-1` underflows on empty, 2D = `r*C+c`).
3. Copy is not free (vector copy O(n), pass `const&`, use `std::move` for transfer).
4. Algorithms over loops (`accumulate`, `max_element`, `count_if`, `find`, `reverse`, `swap`, `transform`).
5. Debug by tracing, not staring.
6. Vectors are the runway for the whole course.

### "What this connects to" notebox (lines 2483–2501)
Forward refs to Ch2 (problem-solving / loops as strategy), Ch3 (formal Big-O over the perf intuitions), Ch4 (linked lists vs contiguous), Ch5+ (stacks/queues/deques built on `push_back`/`pop_back`).

### Companion-materials line (lines 2503–2506)
> "A one-page cheat sheet for this chapter lives at `cheat_sheets/ch_1.tex`; twelve drill prompts you can paste into a fresh Claude session live at `practice_prompts/ch_1.md`."

**Status:** Both paths are stale — `cheat_sheets/` has never existed; `practice_prompts/` either. Real paths after rename: `chapters/ch_1/notes.tex` (compact reference, formerly `cheat.tex`) and `chapters/ch_1/practice.md`. Plus the term "cheat sheet" is now inconsistent with the renamed convention. **Logged in CHANGELOG as deferred to per-chapter review.**

---

## `notes.tex` (compact reference, 143 lines, formerly `cheat.tex`)

**Layout:** Two-column `multicols`. Title: "Ch.~1 Notes — Arrays, Vectors, C-Strings". Single-page reference, no chapter map, no narrative — pure tables and snippets.

**Subsections:** Vector declaration & init · Element access · Operation complexity · Canonical loops · Iteration patterns · `resize` vs `push_back` · Value semantics · Swap · Arrays vs vectors · 2D containers · C-strings vs `std::string` · `<cctype>` quick ref · Top gotchas

**Tables:**
- Element access (5 rows: `v[i]`, `v.at(i)`, `v.front()`, `v.back()`, `v.size()`)
- Operation complexity (8 rows, with O() column + reason)
- Arrays vs vectors (6-row comparison)
- C-strings vs std::string (6-row comparison)
- `<cctype>` (4-row quick ref)

**Code listings:** Vector init patterns · canonical for-loops (4 forms) · swap (3 forms) · 2D containers (raw + vector-of-vector)

**Top gotchas (5 listed):**
1. `v.size() - 1` when `v` is empty → underflow to huge unsigned.
2. Modifying vector while iterating invalidates iterators.
3. `strcmp` returns 0 on equality.
4. Row-major 2D: rows outer, cols inner.
5. Parallel vectors drift out of sync.

**Coverage relative to `lectures.tex`:**
- **Covered:** §1.4 (vectors), §1.5 (iteration patterns — named identically), §1.7 (parallel-vectors gotcha line), §1.8 (`resize` vs `push_back`), §1.10 (value semantics), §1.11 (swap), §1.13 (arrays vs vectors), §1.14 (2D, abbreviated), §1.15 (C-strings, abbreviated), §1.17 (cctype quick ref).
- **Not covered (intentionally — out of scope for a quick-reference card):** §1.1 (programming basics), §1.2 (pseudocode/Coral), §1.3 (general array concept), §1.6 anatomy of canonical loop (just shows the 4 forms), §1.9 push/back/pop semantics rationale, §1.12 debugging methodology, §1.16 full string-library function listing.

**Density:** Genuinely a quick-reference card — no prose, no rationale, just "if you forgot the syntax, here it is."

---

## Cross-references inside ch_1

- §1.5 Pattern 3 references §1.11 (swap) and forward to "selection sort" (Ch3).
- §1.6 references §1.5 patterns; previews `<algorithm>`.
- §1.7 forward-refs hash tables / BSTs (Ch5/Ch6) for beating O(n) linear search.
- §1.8 cross-refs §1.4 capacity concept introduced here, used later.
- §1.9 forward-refs Ch4 `std::stack` and `std::deque`.
- §1.11 forward-refs `std::reverse` and sort algorithms (Ch3).
- §1.12 references §1.11 (swap) — debugging the same reverse-loop pattern.
- §1.13 forward-refs `std::array`.
- §1.14 forward-refs matrix/numerical work (no specific later chapter, but prepares cache-locality intuition).
- §1.15–1.17 forward-ref `std::string` use throughout the course; §1.16 closes with "use `std::string` for new code, this is for legacy."

## Forward-references to other chapters (where ch_1 plants seeds)

- **Ch_2:** "loops as problem-solving strategies" (§1.5 patterns reframed as recursion/greedy/DP).
- **Ch_3:** Big-O formalization of the perf intuitions (§1.4 amortized hint, §1.7 linear-search O(n), §1.8 amortization, §1.10 O(n) copy, §1.11 vector swap O(1) explanation, §1.16 strlen-in-loop O(n²) hoisting).
- **Ch_4:** Linked lists as the alternative to contiguous storage (§1.3 "vectors are not linked lists," §1.9 deque for two-ended O(1)).
- **Ch_5+:** Stacks/queues/deques built on `push_back`/`pop_back` (§1.9 stack-via-vector mapping).

---

## Stylistic patterns observed

1. **Every section closes with an `ideabox [The big picture for X.Y]`** (or `[Big picture]`). Consistent.
2. **Each section opens with a 1–2 sentence orienting paragraph** before the first subsection.
3. **Coral references concentrate in §1.1–1.2**, fade after §1.3 once C++ takes over.
4. **"What intro texts omit" phrasing** appears (§1.8 explicit, §1.16 implicit). Author already augmenting beyond zyBook level.
5. **Modern C++ asides** sprinkled throughout (`std::move`, C++20 ranges/lambdas, `static_cast<unsigned char>`).
6. **CS 300 project context anchors** several sections (Bid struct in §1.7; CSV-read pattern in §1.9; `std::vector` choice in §1.4).
7. **Worked examples typically use traces** — not just code snippets but step-by-step state evolution (§1.10 shifts, §1.12 debugging, §1.5 patterns).
8. **Warnboxes outnumber definition boxes** — emphasis is on what-to-avoid, not just what-things-are.

---

## Issues flagged for the per-chapter review (terminology, content)

1. ~~**Stale companion-materials line at end (lines 2503–2506).**~~
   **Resolved 2026-04-22:** User direction — don't worry about it
   here; the entire site/structure changes in Phase 2. Punted to
   `design_docs/phase2_issues.md` as an open item to handle during
   the Phase 2 redesign.
2. ~~**Coral framing in §1.1–1.2.**~~
   **Resolved 2026-04-22 — DROP.** User direction: "this was
   supposed to be a c++ refresher chapter." Coral content in
   §1.1–1.2 (interpreter-vs-compiler aside excepted) gets removed
   in the revision pass. Chapter is reframed as a pure C++ refresher
   on top of the SNHU-derived core. This shapes Step 2 — content from
   OCW/CLRS that drifts away from C++ competency (algorithm theory,
   formal complexity, etc.) is **out of scope** for ch_1 and belongs
   in ch_2/ch_3 instead.
3. **§1.5 selection-sort intro vs Ch_3 sorts:** Selection-sort appears here as a worked example (Pattern 3). Need to make sure Ch_3 doesn't repeat the same intro from scratch.
4. **§1.11 reverse-vector worked example vs §1.12 debug-the-reverse-vector:** Two consecutive sections both center on the reverse-vector loop. §1.11 gives the right answer; §1.12 walks through three bugs to get there. Order-and-overlap may need a re-look during revision.
5. **§1.4 has both a "common errors" subsection (1.4) and §1.6 has another:** Some duplication (e.g., signed/unsigned warnings appear in both). Acceptable given the "review" framing but worth noting.
6. **Mastery checklist coverage:** All 7 items are clearly addressable from the existing content. No checklist item lacks supporting material.

---

## Counts at a glance

| Metric | Count |
|---|---|
| Sections (numbered 1.1–1.17) | 17 |
| Subsections (numbered) | 70 |
| Subsubsections | 1 (§1.1.6 Cursor and newlines) |
| `defnbox` (definitions) | 17 |
| `ideabox` (key ideas, including 17 "big picture" closers) | 35 |
| `warnbox` (gotchas) | 31 |
| `examplebox` (worked examples) | 36 |
| `notebox` (asides) | 11 |
| `lstlisting` (code blocks) | 31 |
| **Total callout boxes** | **161** |
| Mastery checklist items | 7 |
| Lines (`lectures.tex`) | 2508 |
| Lines (`notes.tex` compact) | 143 |
