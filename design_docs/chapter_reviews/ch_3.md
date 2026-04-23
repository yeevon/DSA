# Chapter 3 — As-Is Review

**Scope:** `chapters/ch_3/lectures.tex` (3243 lines, but **§3.22 is a stub** + numbering gaps — see Issues) + `chapters/ch_3/notes.tex` (137 lines, formerly `cheat.tex`). `practice.md` excluded per Phase-4 deferral.

**Purpose:** Step 1 of the per-chapter loop. Inventory of what's currently in ch_3 — topics, depth, callouts, mastery checklist, cross-references — so Step 2 (CLRS + OCW gap analysis) has a baseline. **No augmentation suggestions in this doc.**

**Subtitle (from `\title`):** *Introduction to Data Structures*

**Source coupling:** SNHU course-derived. ch_3 is the **load-bearing chapter** ch_2 keeps forward-referring to: it owns formal Big-O (§3.10), formal Word-RAM-style cost analysis (§3.9), and 6 sorting algorithms (§3.15–3.20). However, the author appears to have written ch_3 assuming Big-O and sorting would be in *later* chapters — multiple cross-refs say "see Chapter 4 for Big-O" and "see Chapter 5 for sorting algorithms," which is wrong relative to cs-300's actual structure (see Issues).

---

## Chapter map (verbatim from opening `ideabox`)

**Where this sits.** "Chapter 3 is the longest chapter in the course and the densest conceptually. It does four things in sequence: (1) grounds data representation (bits, ASCII) so the later structures have a floor; (2) introduces **data structures** as named shapes for storing data; (3) introduces **abstract data types** as the interface-level view; (4) builds the vocabulary of **algorithm runtime**: linear vs. binary search, Big-O, and the sorting zoo."

**Toolkit additions promised:**
- A map of the course (the seven structures named and contrasted)
- ADT thinking (contract vs. implementation)
- Big-O fluency (read/write/justify complexity claims)
- Seven sorting algorithms with tradeoffs (incremental, divide-and-conquer, non-comparison)

**Mastery checklist (7 items, current bar):**
1. Translate between bits, hex, and ASCII (e.g., `0x41` → `'A'`).
2. State each ADT's interface and give one concrete data structure that implements it.
3. Linear vs. binary search runtimes, worst case, and preconditions.
4. State Big-O definition from memory and apply to a small example.
5. Order the growth hierarchy: $1, \log n, n, n \log n, n^2, 2^n$.
6. For each sort, give best/avg/worst, stable?, in-place?, and the one-sentence runtime explanation.
7. Pick the right sort for: small/nearly-sorted, huge/RAM-bound, integer keys with bounded range, must be stable.

**Looking ahead:** "Chapters 4-6 spend their entire budget building two or three of the structures from the list here (linked lists, hash tables, BSTs)." This forward-ref is **correct** relative to cs-300's structure (per README).

---

## Section-by-section inventory (`lectures.tex`)

Legend: `D`=`defnbox`, `I`=`ideabox`, `W`=`warnbox`, `E`=`examplebox`, `N`=`notebox`. Closing `[Big picture]` ideabox included in I-count.

### §3.1 Representing Information as Bits — lines 69–263
- **Subsections:** Bits & bytes · Why bits · ASCII (def + table) · Subset of ASCII table · What ASCII can't do (Unicode/UTF-8) · Connecting bits back to data structures
- **Callouts:** D×4, I×2, W×1, E×3, N×1
- **Topics:** Bit + byte formal definitions; nibbles + words + C++ type sizes (`char`=1, `int`=4, pointer/`size_t`=8); five interpretations of `01000001` (unsigned/signed int, ASCII, nibble pair, bitfield); character encoding general def; ASCII (7-bit, 0–127); ASCII table by range (control / digits / uppercase / lowercase / punctuation); **three patterns to memorize** (`'0'`=48 so `c-'0'` converts; case differs by 32 so `c^32` toggles; space=32 is the printable boundary); digit-char-to-int worked example; case conversion w/o `cctype` worked example; Unicode/UTF-8 intro (code points up to 10FFFF, UTF-8 backward-compat with ASCII); `char` vs Unicode warning (UTF-8 char can be multi-byte, `char16_t`/`char32_t`/`std::u8string`/ICU mention); connection to data structures.
- **Depth markers:** ASCII bit-tricks (`c^32` for case toggle) is genuinely useful low-level knowledge. UTF-8 framing goes beyond intro CS. Doesn't cover endianness, two's complement signed-integer detail, or floating-point IEEE 754 — those are intentionally out of scope.

### §3.2 Data Structures — lines 265–475
- **Subsections:** The seven structures · Why so many · Concrete shift problem · How to pick · STL mapping
- **Callouts:** D×7, I×2, W×1, E×2, N×1
- **Topics:** Data structure formal def; **seven structures named with one-paragraph defs each** — Record (struct/class), Array/vector (O(1) access, O(n) middle insert), Linked list (O(1) insert with pointer, O(k) k-th access), Binary tree, Hash table, Heap, Graph; comparison table (access/insert-mid/good-for); shift-problem worked examples (array O(n), linked list O(1) given the node); 4-step practical decision procedure; mapping concept→STL types; "build vs use" notebox.
- **Depth markers:** "$O(1)$ linked list insert has a hidden assumption" warnbox is good — separates the structural cost from the find cost. STL mapping table is correct and useful.

### §3.3 Relation Between Data Structures and Algorithms — lines 477–671
- **Subsections:** Direction 1 (different structure, different algorithm) · Direction 2 (algorithms use structures as scratch) · Putting them together
- **Callouts:** D×0, I×4, W×3, E×3, N×2
- **Topics:** Two-direction relationship framing; append-to-linked-list O(1) vs append-to-array O(1) amortized; **first explicit "amortized" mention** with one-sentence definition; insert-at-front comparison table; "Same name is misleading" warnbox (push_back fast on vector, find expensive on vector but O(1) on unordered_map); top-5 salespersons example using fixed-size array; comparison of running-top-k structures (array, min-heap, sorted linked list, BST); 3-step "design" workflow.
- **Depth markers:** Two-direction framing is genuinely good pedagogy. Top-k example previews heap usage from ch_7.

### §3.4 Abstract Data Types — lines 673–854
- **Subsections:** Why the separation matters · Standard ADTs · C++ adaptors · Using ADTs to keep caller code honest
- **Callouts:** D×1, I×3, W×3, E×2, N×2
- **Topics:** ADT formal def (operations + behavior, no implementation); ADT vs DS one-line distinction; printer analogy; replaceability/reasoning/teamwork benefits; **cost as part of contract** warnbox (std::map vs std::unordered_map); 9-row standard ADT table (List, dynamic array, stack, queue, deque, bag, set, priority queue, dictionary/map); `std::stack` template parameter example showing same ADT over different containers; library ADT/structure mapping table; `reverseInPlace` template using stack ADT; **ADT-first habit** (name the ADT before picking the structure).
- **Depth markers:** ADT/DS separation is treated rigorously. "Cost is part of the contract" is a non-obvious refinement.

### §3.5 Applications of ADTs — lines 856–1032
- **Subsections:** Abstraction as productivity lever · ADTs in standard libraries · Why CS 300 still has you build them · Choosing the right ADT
- **Callouts:** D×1, I×3, W×2, E×1, N×3
- **Topics:** Abstraction formal def; 3 benefits (less code to write/read/debug); low-level vs high-level stack worked example; **abstraction doesn't erase cost** warnbox (std::map O(log n) vs std::unordered_map O(1)); table of std-lib ADTs in C++ vs Python vs Java; how-much-control-do-languages-give-you notebox; CS-300-builds-by-hand rationale; "in real projects, library first" warnbox; problem-shape→ADT mapping table.
- **Depth markers:** Cross-language comparison table (C++/Python/Java) is unusual at intro level.

### §3.6 Searching and Algorithm Runtime — lines 1034–1189
- **Subsections:** Linear search · Why linear (when fine) · Runtime as function of input size · Ignoring constants · Searching/structures/algorithms together
- **Callouts:** D×1, I×3, W×2, E×1, N×3
- **Topics:** Linear search def + C++ implementation; STL `std::find` notebox; best/worst/average case (1, n, n/2); **linear search on a linked list is still O(n)** warnbox; "order of growth" informal intro; concrete numbers table (N=10³ to 10⁹ at 1µs each); **"fast enough is always fast enough for what?"** warnbox; ignoring constants justification; structure-known→algorithm-better table (linear, binary, hash, BST).
- **Depth markers:** Concrete wall-time table (10⁹ ops = 17 minutes) makes O(n) viscerally real.
- **⚠️ Wrong cross-ref (line 1041):** "the idea that turns into Big-O in **Chapter 4**" — Big-O is in **§3.10 of this chapter**.
- **⚠️ Wrong cross-ref (line 1183):** "**Chapter 4** formalizes the 'on the order of' idea into Big-O notation" — same issue.

### §3.7 (missing) — numbering gap

§3.6 ends and §3.8 begins; no §3.7 exists. No in-body refs to §3.7 either. SNHU course numbering quirk preserved as-is.

### §3.8 Binary Search — lines 1191–1353
- **Subsections:** The idea · Binary search in C++ · Recursive binary search · Why O(log n) · Bigger lesson
- **Callouts:** D×1, I×4, W×3, E×2, N×2
- **Topics:** Phone-book intuition; binary search formal def; **two preconditions warnbox** (sorted + random access — "no binary search on std::list"); iterative C++ implementation with **overflow-safe `mid = lo + (hi-lo)/2`**; **Bloch 2006 attribution** notebox; recursive binary search; halving derivation of O(log n); **dramatic comparison table** (10⁹ items → 30 binary ops vs 17 minutes linear); "log bar" intuition (log₂ of 1B ≤ 30); sorting-isn't-free warnbox (one binary search on freshly sorted array doesn't beat linear); structure+precondition=algorithm pattern; STL `std::binary_search` / `std::lower_bound` notebox.
- **Depth markers:** Bloch attribution + concrete wall-time comparison table.

### §3.9 Constant-Time Operations — lines 1355–1502
- **Subsections:** What counts as constant time · Why fixed size matters · Counting the right things · Hidden-loop trap · Rule of thumb
- **Callouts:** D×1, I×4, W×2, E×3, N×1
- **Topics:** Constant-time op formal def; why-count-operations-not-seconds; **8-row table of typically O(1) operations** with reasons; operations that *look* simple but aren't (string concat, copy, compare, count); **"It's one line ≠ It's O(1)"** warnbox; **arbitrary-precision arithmetic isn't O(1)** ideabox (Python int vs C++ int); what-to-count-by-algorithm; **hidden-loop trap warnbox** (string concat in a loop is O(n²)); 3-question rule of thumb (allocates? copies? calls a loop?).
- **Depth markers:** Hidden-loop trap is a real engineering concern, not just textbook material. Python-vs-C++ arithmetic comparison is unusually mature.
- **⚠️ Wrong cross-ref (line 1501):** "is Big-O notation, the core vocabulary of **Chapter 4**" — Big-O is in §3.10 (the very next section).

### §3.10 Growth of Functions and Complexity — lines 1504–1746
- **Subsections:** Best/worst case + T(N) · Upper/lower bounds · Asymptotic notation · How to read · Growth hierarchy · In practice
- **Callouts:** D×3, I×4, W×1, E×3, N×1
- **Topics:** Best/worst case T(N) formal def; linear search two-sided picture; upper/lower bound formal defs; bounds for messy T(N) example; **formal asymptotic notation defnbox** (O, Ω, Θ with c·g(N) condition for N ≥ N₀); mental picture for each (O = doesn't grow faster, Ω = doesn't grow slower, Θ = exactly); $c$ and $N_0$ rationale; concrete derivation that $3N²+10N+17 = O(N²)$; **3 common traps warnbox** (Big-O ≠ worst case; Big-O doesn't promise tightness; constants are not mysteries); **growth hierarchy table** ($O(1)$ through $O(n!)$); gaps-between-classes ideabox (at N=100: O(N²)=10⁴, O(2ⁿ)=10³⁰, O(n!)=10¹⁵⁷); production-Big-O usage notebox.
- **Closing "halfway recap" ideabox** (lines 1691–1746): explicit "consolidate before sorting" — recaps §3.1-3.10 in 5 buckets and previews §3.14-3.21 split into incremental/D&C/non-comparison.
- **Depth markers:** Formal Big-O treatment with all three of O/Ω/Θ. Quantitative growth hierarchy with worked numbers. Halfway-recap is genuinely good pedagogy.

### §3.11–§3.13 (missing) — numbering gap

§3.10 ends and §3.14 begins; no §3.11/12/13 exist. No in-body refs. SNHU course quirk preserved.

### §3.14 Sorting: Introduction — lines 1748–1900
- **Subsections:** Why sorting is its own field · Fundamental constraint · What makes sorts differ · Faster-than-comparison sorts · In C++
- **Callouts:** D×3, I×3, W×0, E×2, N×3
- **Topics:** Sorting formal def; what sorting unlocks (binary search, dedup, set ops, k-th smallest, human consumption); **access constraint** def (can only observe/swap two at a time); swap as atomic move; **5 properties to compare sorts** (time, space, stability, adaptivity, access pattern); **Ω(n log n) lower bound for comparison sorts mentioned**; non-comparison sorts can beat the bound; STL `std::sort` (introsort), `std::stable_sort`, `std::partial_sort`.
- **Depth markers:** Lower bound mentioned (full proof later in §3.21).
- **⚠️ Wrong cross-ref (line 1755):** "the following sections and **Chapter 5** walk through specific algorithms (bubble sort, selection sort, insertion sort, quicksort, merge sort, heap sort)" — sorts are in **§3.15–3.20 of this chapter**. Plus **bubble sort is mentioned but never covered**, and **heap sort is mentioned but only has a section in ch_7 (optional)**.

### §3.15 Insertion Sort — lines 1902–2071
- **Subsections:** The idea · Insertion sort in C++ · Worst-case O(n²) · Best case O(n) · Nearly sorted lists · Why this matters · Properties
- **Callouts:** D×1, I×4, W×1, E×4, N×2
- **Topics:** Insertion sort def + card-sorting analogy; swap-based and shift-based C++ implementations; worst-case Σi = n(n-1)/2 = Θ(n²); best-case Θ(n) on already-sorted; **nearly-sorted analysis** (constant c misplaced → still O(n)); examples of nearly-sorted lists; **real-world niche** ideabox (small n in introsort, streaming input); 6-row properties table; **stability needs strict <** warnbox.
- **Depth markers:** Adaptive analysis is rigorous. Stability subtlety with `<` vs `<=` is good practical detail.

### §3.16 Selection Sort — lines 2073–2208
- **Subsections:** Selection sort in C++ · Why always Θ(n²) · Where it's better than insertion · vs insertion sort · When to reach
- **Callouts:** D×1, I×3, W×3, E×1, N×1
- **Topics:** Selection sort def + C++ implementation; **`i + 1 < size()` to avoid unsigned underflow** warnbox; counting comparisons (n-1 + n-2 + ... = Θ(n²)); **always Θ(n²) regardless of input** ideabox; selection sort isn't adaptive warnbox; **redeeming feature: only n-1 swaps total** (vs insertion's Θ(n²)); when-swap-cost-dominates use case (large structs, flash memory wear); insertion-vs-selection 6-row comparison table; **selection sort isn't stable** worked example with subscripted equal elements; pocket rubric for picking insertion/selection/`std::sort`.
- **Depth markers:** Subscripted equal-element example for stability is concrete. Flash-memory-wear use case is a real engineering scenario.

### §3.17 Shell Sort — lines 2210–2398
- **Subsections:** Core insight · Interleaved lists and the gap · Shell sort in C++ · Choice of gap sequence · Why this beats plain insertion · Properties · When to use
- **Callouts:** D×2, I×4, W×2, E×2, N×1
- **Topics:** Donald Shell 1959 attribution; insight: insertion sort is slow because elements move 1 slot at a time; **gap K** def + interleaved sublists; gap-of-3 worked example on 9-element list; C++ implementation with `insertionSortGap` helper; **must end with gap=1** warnbox; **gap sequence** def + 4-row sequence table (halving = O(n²), Hibbard $2^k-1$ = O(n^{3/2}), Sedgewick = O(n^{4/3}), Ciura = empirical-best); **strange fact: Shell sort's exact worst case is open for some sequences**; why-the-gap-matters explanation; properties table; not-stable warnbox; rare-modern-use niches (embedded, educational, no-STL).
- **Depth markers:** Genuinely interesting that an everyday algorithm has unproven asymptotics. Multiple gap-sequence comparison is more depth than typical intro coverage.

### §3.18 Quicksort — lines 2400–2604
- **Subsections:** Idea (partition + recurse) · Hoare partition · Average vs worst · Pivot selection · Properties · Why "quick" if O(n²)?
- **Callouts:** D×1, I×4, W×3, E×1, N×2
- **Topics:** **Tony Hoare 1959 attribution** (sorting Russian words for machine translation); quicksort def (3 steps); **why partitioning works** (left ≤ pivot ≤ right means no merge needed → in-place); **Hoare-style partition** in C++ with two-pointer convergence; **pivot-index caveat warnbox** (Hoare returns j where pivot might be either side; recursive calls use `[low, mid]` and `[mid+1, high]`); **Lomuto vs Hoare comparison** notebox; average-case Θ(n log n) derivation (depth × work-per-level); **worst-case Θ(n²) on bad pivots**; pivot-selection 5-row strategy table (first/last = disastrous, middle = okay, random = expected n log n, median-of-three = robust, **introsort = guaranteed n log n via heap-sort fallback**); properties table; not-stable warnbox; **why "quick" if O(n²)?** — small constant + cache-friendly inner loop, in practice beats merge sort.
- **Depth markers:** Hoare attribution + Lomuto comparison + introsort explanation = real production-engineering depth.

### §3.19 Merge Sort — lines 2606–2819
- **Subsections:** Idea (recurse then merge) · Merge step · Merge sort in C++ · Runtime · Memory cost · Properties · vs Quicksort · Timsort
- **Callouts:** D×1, I×3, W×2, E×2, N×3
- **Topics:** **John von Neumann 1945 attribution**; merge sort def (4 steps); **two halves of D&C** ideabox (quicksort = hard work before recurse; merge sort = hard work after recurse); merge step C++ implementation with two pointers; **stability lives in `<=`** warnbox; recursive driver implementation; recursion-tree argument for Θ(n log n) **independent of input order**; **merge sort isn't in-place** warnbox (O(n) extra memory); one-time-buffer-allocation engineering note; properties table (Adaptive: not natively, Timsort yes); 7-row quicksort-vs-merge-sort comparison; **when to reach for each** ideabox (in-place vs stable vs linked-list vs external sort); **Timsort notebox** (Python `sorted` and Java's `Arrays.sort` for objects — most-commonly-run sort in the world).
- **Depth markers:** Von Neumann attribution. Timsort note is genuinely current. External sorting mentioned as a real use case.

### §3.20 Radix Sort — lines 2821–3016
- **Subsections:** The trick (sort by one digit at a time) · LSD algorithm · Tracing example · Runtime · Handling negatives and bases · Properties · When to reach · Counting sort
- **Callouts:** D×1, I×4, W×2, E×2, N×2
- **Topics:** Radix sort def; **why it works (stability of digit pass)** ideabox; LSD algorithm in C++ with bucket-distribute-and-gather; **stability of gather is essential** warnbox; **traced 4-step worked example** (170, 45, 75, 90, 802, 24, 2, 66 → sorted in 3 passes); $O(n \cdot d)$ derivation, $d$ = digits; **"beats n log n" comes with fine print** warnbox (constant factor, only works on decomposable keys, not in-place); negatives via post-process into two buckets; **radix = base**, base 256 (one byte at a time) standard for binary integer keys; properties table; niche-but-powerful use cases; **counting sort notebox** (one-pass cousin, $O(n+k)$).
- **Depth markers:** Base-256 mention is hardware-aware. Counting-sort cousin completes the non-comparison story.

### §3.21 Overview of Fast Sorting Algorithms — lines 3018–3207
- **Subsections:** Speed classification · Ω(n log n) lower bound · Comparison vs non-comparison sorts · Best/avg/worst side by side · Picking a fast sort · Extended comparison table
- **Callouts:** D×2, I×4, W×1, E×0, N×1
- **Topics:** Fast sort def (avg ≤ n log n); 7-row speed table (selection/insertion/shell are slow; quicksort/merge/heap/radix are fast); **n log n frontier** ideabox; **Ω(n log n) lower bound formal proof** via decision-tree argument (n! permutations need log₂(n!) = Θ(n log n) comparisons); comparison vs non-comparison sorts table; **why radix can beat the bound** + universality tradeoff explanation; best/avg/worst side-by-side table; **Θ(n) heap-sort best case explanation** (build phase only, full sort still Θ(n log n)); **6-step pocket decision tree** (just use std::sort → stability? → worst-case bounded? → integer keys? → mostly sorted? → tiny n?); **extended comparison table** (7 sorts × 6 properties); **"O notation hides constants"** warnbox (quicksort 2-3× faster per element than merge sort due to cache behavior).
- **Depth markers:** Ω(n log n) decision-tree proof is rigorous. Cache-behavior explanation is practical engineering depth.

### §3.22 (stub) — line 3209

`\section{3.22 \textit{(next section -- ready to scrape)}}`. Same pattern as ch_2's §2.11 stub. Drop per user direction.

---

## Closing material (after §3.22 stub)

### "What this connects to" notebox (lines 3211–3236)
Forward refs to:
- **Ch_4 (linked lists):** "every performance comparison is 'compared to a vector...'"
- **Ch_5 (hash tables):** "hash lookup is O(1) expected" — depends on §3.10 expected-vs-worst-case fluency
- **Ch_6 (BSTs):** O(h) = O(log n) balanced or O(n) degenerate
- **Sorting in later work:** `std::sort` = §3.18, `std::stable_sort` = §3.19

### Companion-materials line (lines 3238–3241)
Same stale references as other chapters: `cheat_sheets/ch_3.tex` and `practice_prompts/ch_3.md`. Already logged in `phase2_issues.md`.

---

## `notes.tex` (compact reference, 137 lines, formerly `cheat.tex`)

**Layout:** Two-column `multicols`. Title: "Ch.~3 Notes — Data Structures, Big-O, Sorting".

**Subsections:** ADT vs DS · The seven structures · Searching · Big-O in one sentence · Growth hierarchy · Constant-time operations · Sorting comparison · "Which sort do I pick?" · Ω(n log n) lower bound · Stable vs unstable · In-place · Quicksort: watch the pivot · Top gotchas

**Tables:**
- ADT → typical DS (7 rows)
- Searching (linear / binary)
- **Sorting comparison** (8 sorts × 5 properties — *includes bubble sort which doesn't appear in lectures.tex*)
- Top gotchas (5 items)

**Coverage relative to `lectures.tex`:**
- **Covered:** §3.2 (seven structures), §3.4 (ADT vs DS), §3.6 (linear search), §3.8 (binary search), §3.9 (constant-time), §3.10 (Big-O, growth hierarchy), §3.14–§3.21 (sorting, including the lower bound).
- **Not covered (intentionally — out of scope for compact):** §3.1 (bits/ASCII), §3.3 (algorithm/structure two-direction relationship), §3.5 (ADT applications), full sort algorithm details (compact has the table, lectures has the implementations).

**⚠️ notes.tex inconsistency: lists bubble sort** in the sorting comparison table (line 80) even though lectures.tex never covers bubble sort.

---

## Cross-references inside ch_3

Internal `\textsection 3.X` references appear throughout. Verified accurate after Step-1 read:
- §3.1 → §3.2 (bits → structures)
- §3.2 → §3.3, §3.4 (structures → relationship → ADTs)
- §3.6 → §3.8 (linear → binary)
- §3.9 → §3.10 (constant-time → Big-O)
- §3.10 closing recap references §3.1–§3.10 as a unit
- §3.14 → §3.15–§3.21 (sort intro → individual sorts)
- §3.15–§3.20 cross-reference each other in tradeoff discussions
- §3.21 → §3.18, §3.19 (decision tree references quicksort/merge sort)

## Forward-references to other chapters (where ch_3 plants seeds)

- **Ch_4 (linked lists):** linked-list traversal is O(n); insert-at-front O(1); merge sort works on linked lists
- **Ch_5 (hash tables):** hash table O(1) expected; collision handling extends from §3.1 mention
- **Ch_6 (BSTs):** O(log n) balanced, O(n) degenerate
- **Ch_7 (heaps, optional):** heap sort, priority queues — *referenced repeatedly without explicit chapter number; ch_3's tables list heap sort but no §3.X covers it*

---

## Stylistic patterns observed

1. **`lstlisting` for code, with `language=C++`** — ch_3 uses `\begin{lstlisting}[basicstyle=\ttfamily\small,frame=single,language=C++]` extensively (21 blocks). ch_2 used `verbatim` instead. ch_3 is closer to ch_1's style.
2. **Each section closes with either `[Big picture]` or `[Where this is going]` ideabox/notebox** — consistent. The "where this is going" pattern (forward-pointing) is used more in ch_3 than in ch_1/ch_2.
3. **Numbered + unnumbered subsections mixed** — ch_3 uses `\subsection*{...}` (unnumbered) for sub-divisions like "Insert-at-front is the sharper example" inside §3.3. This breaks the consistent numbering ch_1 and ch_2 use.
4. **Real-world attributions throughout** — Bloch (binary search overflow), Tony Hoare (quicksort), Donald Shell (Shell sort), John von Neumann (merge sort). Gives the chapter historical weight.
5. **Concrete wall-time tables** — §3.6 (linear search at 10⁹ items = 17 min), §3.8 (binary search comparison), §3.10 (gaps between classes). Quantification beats abstract "this is faster."
6. **6-step pocket decision tree** in §3.21 — the kind of compact actionable framing that's worth keeping.
7. **STL mentions in nearly every section** — `std::find`, `std::binary_search`, `std::sort`, `std::stable_sort`, `std::list::sort`, etc. Reinforces "use the library, build for understanding."

---

## Issues flagged for the per-chapter review

### Critical: multiple wrong cross-refs to ch_4/ch_5

**ch_3 was apparently written assuming Big-O and sorting would be in *later* chapters,** but cs-300's actual structure puts both squarely in ch_3:

| Line | Currently says | Should say |
|---|---|---|
| 1041 | "the idea that turns into Big-O in **Chapter 4**" | "in **§3.10**" (later in this chapter) |
| 1183 | "**Chapter 4** formalizes the 'on the order of' idea into Big-O notation" | "**§3.10** formalizes..." |
| 1501 | "is Big-O notation, the core vocabulary of **Chapter 4**" | "...the next section, **§3.10**" |
| 1755 | "the following sections and **Chapter 5** walk through specific algorithms (bubble sort, selection sort, insertion sort, quicksort, merge sort, heap sort)" | "the rest of this chapter walks through..." (and bubble + heap sort scope decisions — see below) |
| 3013 | "The next chapter (4) is complexity analysis proper: Big-O, growth-of-function techniques, and recurrence relations" | Big-O is **§3.10 of this chapter**; ch_4 in cs-300 is lists/stacks/queues per README. Whole sentence needs rewrite. |

These are pre-existing internal inconsistencies, not side-effects of any renumbering. The author wrote ch_3 thinking the SNHU source's chapter mapping was being preserved, but cs-300 consolidated.

### §3.22 is a stub

Same pattern as ch_2's §2.11: `\section{3.22 \textit{(next section -- ready to scrape)}}`. **Drop per user direction (already established for ch_2).**

### Section numbering gaps: §3.7 and §3.11–§3.13

§3.6 → §3.8 (no §3.7); §3.10 → §3.14 (no §3.11–§3.13). SNHU course numbering quirk preserved as-is in cs-300. **Decision needed:** renumber to fill gaps (e.g., §3.7→§3.7 stays at content-of-3.8, etc.) or leave as-is. Recommend leaving as-is — renumbering ch_3's 22 sections is a lot of churn for a cosmetic fix, and no in-body refs to the missing numbers exist.

### Bubble sort: covered in ch_13, not ch_3 (discoverability issue)

**Correction to earlier inventory note:** bubble sort IS covered in cs-300, just not in ch_3. Full coverage in `chapters/ch_13/lectures.tex` §13.1 — definition, C++ implementation with shrinking inner loop, cost analysis (best/avg/worst with short-circuit optimization), "Why you'll never use bubble sort" warnbox framing it as teaching-tool only, defense notebox, and 4 actual use cases. Plus practice drills in `chapters/ch_13/practice.md`. ch_13 ("extra sorts and list idioms" per README) also covers Quickselect, Bucket Sort, List ADT, and Circular Lists — it's the deliberate home for specialized/teaching-only material.

The actual ch_3 issue is **discoverability** — three places in ch_3 reference bubble sort without telling the reader it lives in ch_13:

| Location | Currently | Fix |
|---|---|---|
| `lectures.tex` line 1732 (§3.10 halfway recap) | "Incremental: bubble, insertion, selection, shell" — implies ch_3 covers all four | Add "(bubble sort is in ch_13)" or similar pointer |
| `lectures.tex` line 1755 (§3.14 intro) | "the following sections and Chapter 5 walk through specific algorithms (bubble sort, selection sort, ...)" | Already flagged as wrong-Chapter-5 ref. Fix should also note bubble is in ch_13. |
| `notes.tex` line 80 (compact sorting table) | bubble sort row with no pointer | Add asterisk + footnote, or row note pointing at ch_13 |

**Decision needed (smaller than originally estimated):** add discoverability fixes (~5 lines total). **Do NOT add a §3.X for bubble sort** — ch_13's coverage is appropriate and complete.

### Heap sort: mentioned, deferred to ch_7

- `notes.tex` line 86: heap sort in comparison table.
- `lectures.tex` §3.21 comparison tables include heap sort.
- §3.18 and §3.19 reference heap sort in tradeoff discussions.
- **No §3.X covers heap sort** — ch_7 (Heaps and Priority Queues, marked optional in README) is the natural home.

This is **correct deferral** — heap sort needs heaps first. But ch_3's references should be explicit about the forward-ref ("we'll see heap sort in ch_7 once we have heaps") rather than treating it as already-covered.

### Stylistic divergence from ch_2: `lstlisting` vs `verbatim`

ch_3 uses `\begin{lstlisting}[basicstyle=\ttfamily\small,frame=single,language=C++]` (21 blocks); ch_2 uses `\begin{verbatim}` (3 blocks); ch_1 uses `lstlisting` plain. Three chapters, three styles. May want unification during Phase 2 migration to MDX.

### Companion-materials line is stale

Same as ch_1/ch_2 — `cheat_sheets/ch_3.tex` and `practice_prompts/ch_3.md` don't exist. Already logged in `phase2_issues.md`.

### Mastery checklist coverage

All 7 items addressable from existing content. Item 6 specifies "for each sort (insertion, selection, shell, quicksort, merge, radix)" — note it **doesn't include heap sort or bubble sort**. The mastery bar implicitly accepts the heap-sort-deferred-to-ch_7 and bubble-sort-deferred-to-ch_13 scope, which matches reality. The discoverability fix (above) makes the cross-chapter scope visible to readers.

---

## Counts at a glance

| Metric | Count |
|---|---|
| Sections (numbered 3.1–3.21 + stub 3.22, gaps at 3.7, 3.11–3.13) | 18 with content + 1 stub |
| Subsections | 70+ |
| `\subsection*` (unnumbered sub-divisions) | 6 |
| `defnbox` | 32 |
| `ideabox` (incl. closers) | 53 |
| `warnbox` | 29 |
| `examplebox` | 33 |
| `notebox` | 28 |
| `lstlisting` | 21 |
| `verbatim` | 3 |
| **Total callout boxes** | **175** |
| Mastery checklist items | 7 |
| Lines (`lectures.tex`) | 3243 |
| Lines (`notes.tex` compact) | 137 |
| Wrong cross-chapter refs (Big-O/sorting → "Chapter 4/5") | 5 |
