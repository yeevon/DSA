# Chapter 7 — As-Is Review

**Scope:** `chapters/ch_7/lectures.tex` (754 lines) + `chapters/ch_7/notes.tex` (135 lines). `practice.md` excluded per Phase-4 deferral.

**Purpose:** Step 1 of the per-chapter loop. Inventory of what's currently in ch_7 — topics, depth, callouts, mastery checklist (if any), cross-references — so Step 2 (CLRS + OCW gap analysis) has a baseline to compare against. **No augmentation suggestions in this doc.**

**Subtitle (from `\title`):** *Heaps and Priority Queues*

**Source coupling:** ch_7 is one of the **optional / post-SNHU** chapters (the SNHU-required arc covers ch_1–ch_6). The framing differs from the C++-refresher lens of ch_1–ch_6: ch_7 is **depth-first algorithm exposition** — derive the data structure from the workload, prove the cost bound, then implement. C++ is the implementation language but is no longer the subject. CLRS-style reasoning (geometric-series amortization, ADT contracts, randomized analysis) is the dominant register.

---

## Chapter map

**Structural note — no opening `ideabox`.** Unlike ch_1–ch_6, ch_7 does not open with a "Where this sits / toolkit additions / mastery checklist" `ideabox`. The chapter dives directly into §7.1 with a one-paragraph orienting prose lead. Surfaced as a finding, not invented.

**No mastery checklist.** Likewise absent. ch_1–ch_6 each ship a numbered mastery checklist in the opening `ideabox`; ch_7 ships none. Step 2 will need to decide whether one belongs.

**Implicit chapter map (read off the section headings):**
- §7.1 Heaps: motivation, max-heap property, percolate up/down primitives, STL `priority_queue` preview.
- §7.2 Array representation: index arithmetic, why arrays beat pointers, percolate-up/down code, insert/extract code.
- §7.3 Heapsort: bottom-up heapify (with the $O(n)$ proof), sort-down phase, comparison vs quicksort/mergesort.
- §7.4 Priority queue ADT: contract, separate-priority vs self-priority APIs, full templated C++ implementation, `std::priority_queue` walk-through.
- §7.5 Treaps: rotations, insert via rotate-up, delete via $-\infty$ trick, expected-$O(\log n)$ analysis, comparison vs AVL/red-black/skip list.

**Forward refs / looking back:** §7.1 references Ch~6 BST contrast; §7.5 explicitly references Ch~6 BST collapse and Ch~6.10 self-balancing-trees teaser. No dedicated end-of-chapter "looking forward / looking back" `ideabox` (see Closing material below).

---

## Section-by-section inventory (`lectures.tex`)

Legend for "Callouts": `D` = `defnbox`, `I` = `ideabox`, `W` = `warnbox`, `E` = `examplebox`, `N` = `notebox`. Counts are exact.

### 7.1 Heaps: The Big Idea — lines 11–160
- **Subsections (`\subsection*`):** What a heap is *not* · Why not just use a sorted list? · The canonical use case: priority queues · The two core operations · Insert: percolate up · Remove (max): replace-and-percolate-down · In the C++ STL
- **Callouts:** D×2, I×1, W×1, E×0, N×0
- **Code listings (`lstlisting`):** 2 — (1) `std::priority_queue<int>` push/top/pop demo; (2) `std::priority_queue<int, vector<int>, greater<int>>` min-heap declaration.
- **Tables (`tabular`):** 1 — 5-row Big-O comparison (sorted array / sorted linked list / unsorted array / balanced BST / **max-heap**) across peek / remove / insert.
- **TikZ figures:** 3 — insert-42 walk-through (initial heap, attach 42 as right child of 40, post-swap state).
- **Topics:** Max-heap property formal definition (parent $\ge$ both children, root holds max); min-heap as mirror; explicit "heap is not a BST" warning (siblings unordered relative to each other → no in-order, no search); BST left/parent/right vs heap left/parent/right invariants contrast; sorted-array / sorted-list / BST baselines and why heap dominates the "give me extremum, occasionally insert" workload; priority-queue ADT preview with five real-world examples (OS scheduler, support queue, Dijkstra/A*/Prim, event simulation, top-$k$); percolate-up / percolate-down formal definition with completeness as the height-bound justification; insert algorithm (place at next slot → bubble up); extract-max algorithm (save root → move last to root → percolate down); STL preview (`std::priority_queue` defaults to max-heap on `vector`; `std::greater` for min-heap); roadmap to §7.2–§7.5.
- **Cross-references:** "the BST from chapter 6" (line 33); forward refs to §7.2 (storage), §7.3–§7.4 (formalize percolate primitives + ADT), §7.5 (build PQ on top).
- **Depth markers:** Cost-table justifies *why* heap wins, not just the bounds. Five-example PQ motivation list is broader than typical intro framing.

### 7.2 Heaps Stored in Arrays — lines 161–297
- **Subsections:** Example · Why arrays beat pointers here · Percolate-up, array version · Percolate-down, array version · Insert and extract, array versions
- **Callouts:** D×1, I×1, W×1, E×0, N×1
- **Code listings:** 3 — (1) `maxHeapPercolateUp(int i, vector<int>&)`; (2) `maxHeapPercolateDown(int i, vector<int>&)` with three-subtlety guard; (3) `maxHeapInsert` + `maxHeapExtract` paired implementations.
- **Tables:** 2 — (1) 7-slot index/value table for the 57-rooted example heap; (2) 4-row pointer-tree vs array-heap comparison (per-node overhead, cache, allocations, generality).
- **TikZ figures:** 1 — labeled binary tree with index annotations `\tiny(0)`–`\tiny(6)`.
- **Topics:** Array-representation formal definition with parent / leftChild / rightChild index formulas; completeness requirement (every slot corresponds to an actual node); concrete index-formula verification on the 7-node example; pointer-tree vs array-heap memory and cache argument with **explicit "1M-int heap = 28MB pointer overhead vs 0 array overhead"** quantitative claim; percolate-up array implementation (loop halves index → $O(\log n)$); percolate-down array implementation with three explicit subtleties (check left first / right may not exist / swap with the *larger* child); off-by-one warning on `(i-1)/2` integer-division parent formula; insert/extract paired with a "two functions, three lines of logic" framing; **zero-indexed vs one-indexed `notebox`** (root-at-1 convention from CLRS-style textbooks) with cleaner $i/2$, $2i$, $2i+1$ math but C++ defaults to zero-indexed.
- **Cross-references:** Refers back to "the binary tree in chapter 6" (line 163, contrast with `TreeNode` pointer struct).
- **Depth markers:** Quantitative pointer-overhead figure is concrete. The three-subtlety enumeration on percolate-down is real defensive-coding, not pedagogical hand-waving. Zero/one-indexed convention note is the kind of "you'll trip over this in CLRS" aside.

### 7.3 Heapsort — lines 298–437
- **Subsections:** Heapify: bottom-up heap construction · Why heapify is $O(n)$, not $O(n \log n)$ · The sort-down phase · Walk-through · Cost analysis · Heapsort vs.\ quicksort vs.\ mergesort
- **Callouts:** D×1, I×1, W×1, E×0, N×1
- **Code listings:** 2 — (1) `heapify` loop ($\lfloor n/2 \rfloor - 1$ down to 0, calls `maxHeapPercolateDown`); (2) `heapSort` driver (heapify + swap-and-shrink loop).
- **Tables:** 4 — (1) heapify trace on `[11,21,12,13,19,15]`; (2) sort-down trace step by step (5 swaps, final sorted state); (3) cost-analysis table (heapify $O(n)$ + sort-down $O(n \log n)$ = $O(n \log n)$, $O(1)$ aux); (4) heapsort vs quicksort vs mergesort (worst case / space / stable).
- **TikZ figures:** 0
- **Topics:** Two-phase heapsort overview (heapify in place → sort down); heapify formal definition (call percolateDown on every internal node in reverse index order); last-internal-node index $\lfloor n/2 \rfloor - 1$ derivation; **the $O(n)$ proof for bottom-up heapify** with the explicit geometric-series sum $\sum_{i=0}^{\lfloor \log n \rfloor} (n/2^{i+1}) \cdot i = O(n)$; "most nodes are near the bottom where percolate-down has nothing to do" intuition; sort-down phase overloads `percolateDown` to take an explicit size parameter (suffix is sorted-off, not removed); 6-element walk-through from `[11,21,12,13,19,15]` to `[11,12,13,15,19,21]`; final cost-analysis table with the $O(1)$ in-place killer feature highlighted; quicksort/mergesort/heapsort tradeoff table; **stability warning** (heapsort is not stable, percolate swaps disturb equal-key order); **introsort `notebox`** (`std::sort_heap`, `std::make_heap`, `std::partial_sort`, and the introsort-falls-back-to-heapsort design rationale).
- **Cross-references:** Section uses `maxHeapPercolateDown` from §7.2.
- **Depth markers:** Explicit geometric-series proof for $O(n)$ heapify. Introsort design-rationale note is real practitioner content.

### 7.4 The Priority Queue ADT — lines 438–610
- **Subsections:** Two conventions for ``priority'' · Contract summary · Why heaps are the default implementation · Mapping PQ operations to heap operations · Implementation sketch in C++ · Using `std::priority_queue`
- **Callouts:** D×1, I×1, W×1, E×0, N×0
- **Code listings:** 4 — (1) separate-priority API sketch (`pq.pushWithPriority(jobPointer, priorityNumber)`); (2) self-priority API sketch (`Customer{name, waitScore}` push); (3) **40-line full templated `PriorityQueue<T, Cmp>` class** with private percolateUp/percolateDown using comparator-based "lower priority" semantics; (4) `std::priority_queue` worked example (max-heap, min-heap via `greater`, custom comparator on `pair<int,string>` jobs).
- **Tables:** 3 — (1) 5-row contract table (push / pop / peek / isEmpty / size with pre/post-conditions); (2) 6-row backing-structure comparison (unsorted array / sorted array / sorted linked list / balanced BST / **binary heap** / Fibonacci heap) on push / pop / peek; (3) PQ-op-to-heap-op mapping (push → maxHeapInsert; pop → maxHeapExtract; peek/isEmpty/size constant-time).
- **TikZ figures:** 0
- **Topics:** ADT definition (specification of operations + contracts, separate from implementation); priority-queue formal definition (push / pop / peek / isEmpty / size); explicit list of what the ADT does *not* promise (arbitrary search, ordered iteration, range queries, positional access); FIFO-among-equal-priorities aside (often not guaranteed); separate-priority API motivation (same object in multiple PQs with different keys); self-priority API motivation (priority intrinsic to item) — `std::priority_queue` is the latter; contract pre/post-conditions table; pop-on-empty UB in C++, Java's `PriorityQueue` returns null or throws `NoSuchElementException` (`poll` vs `remove`); heap-as-default-PQ argument with Fibonacci-heap "better asymptotically, worse constants" caveat; PQ-op-to-heap-op direct correspondence; **40-line templated `PriorityQueue<T, Cmp>` implementation** with `std::less` default and the cmp_(a,b) == "a has lower priority" semantics; `std::priority_queue` real usage (max, min, custom-comparator on pairs); **`top()` returns `const reference` warning** (no in-place priority change → must pop+push or use indexed heap / `std::multiset` / hand-rolled heap with side-index); ADT abstraction-of-implementation closing `ideabox`.
- **Cross-references:** Refers back to §7.1 (PQ motivation), §7.2 (`maxHeapInsert` / `maxHeapExtract`).
- **Depth markers:** Java-vs-C++ pop-on-empty cross-language comparison. Fibonacci-heap mention with "complex, big constants" rejection. Custom-comparator template syntax with `decltype(cmp)`. The `const-ref top()` rationale for why priority updates need a side-channel is genuine design-pattern depth.

### 7.5 Treaps: Heap + BST — lines 611–754
- **Subsections:** The missing primitive: rotations · Treap insert · Treap delete · Cost analysis · Treaps vs.\ AVL vs.\ red-black
- **Callouts:** D×2, I×1, W×0, E×0, N×1
- **Code listings:** 0
- **Tables:** 2 — (1) treap operations cost (search/insert/delete with expected vs worst-case columns); (2) 4-row balanced-tree comparison (AVL / red-black / treap / skip list) on balance guarantee, implementation complexity, real-world users.
- **TikZ figures:** 4 — (1) pre-rotation tree at `y` with children `x`, `C` and grandchildren `A`, `B`; (2) post-right-rotation tree rooted at `x`; (3) treap mid-insert state (`A,80` / `C,47` / `B,70` heap violation); (4) treap post-rotate-right at `C` (`A,80` / `B,70` / `C,47`).
- **Topics:** Self-balancing-tree motivation (chapter 6.10's teaser); treap formal definition (main key in BST order + random priority in heap order); **uniqueness of the tree shape given (key, priority) pairs** — the highest-priority-must-be-root forces structure; "tree shape = BST with keys inserted in random-priority order" → expected $O(\log n)$ height; randomization-without-caller-cooperation framing; rotations as the BST-order-preserving alternative to heap swaps; right-rotation formal definition (+ left-rotation as mirror); rotation in-order invariant proof ($A < x < B < y < C$ before and after); rotations as universal self-balancing primitive (AVL, red-black, treaps share mechanics, differ in invariant); treap-insert algorithm (BST insert → assign random priority → rotate-up while priority > parent); rotation-direction-is-forced rule (left child → rotate right; right child → rotate left); worked example inserting `(B,70)` under `(A,80) > (C,47)`; treap-delete via $-\infty$ trick (assign lowest priority → rotate with higher-priority child until leaf → unhook); rotating-with-higher-priority-child rule (lower would create new violation); cost analysis (expected $O(\log n)$, worst $O(n)$ on bad RNG); treap vs AVL vs red-black vs skip list comparison (`std::map` is red-black, Linux kernel uses red-black, Redis/LevelDB use skip lists); 30-line treap vs 300-line red-black implementation-effort claim; randomization-as-design-pattern closing `ideabox` (quicksort, hash-function-seeded hashing, skip lists, treaps); skip-list-and-probabilistic-DS `notebox` (random secondary key generalizes to HyperLogLog, Count-Min sketches).
- **Cross-references:** Refers back to "Chapter 6 ended with a warning" + "Chapter 6.10 teased self-balancing trees (AVL, red-black) as the rigorous fix" (line 613).
- **Depth markers:** Random-priority-determines-shape uniqueness argument is graduate-level reasoning, not intro. Cross-structural pattern (rotations underlie AVL/red-black/treap; randomization underlies quicksort/hash/skip-list/treap) is meta-level. Skip list / Redis / LevelDB references are practitioner depth.

---

## Closing material (after §7.5)

**No closing summary section.** Unlike ch_1's 6-bullet wrap-up, ch_7 ends with §7.5's `notebox` and the `\end{document}`. No "what this connects to" forward-ref box. No companion-materials line.

**No "looking forward / looking back" `ideabox`.** The closing `ideabox` of §7.5 (line 731, "randomization as design pattern") functions thematically as a chapter-level closer but is not labeled or scoped as one — it's a §7.5 closer that happens to be the last `ideabox` in the chapter.

---

## `notes.tex` (compact reference, 135 lines)

**Layout:** Two-column `multicols`. Title: "Ch.~7 Notes — Heaps and Priority Queues". Single-page reference, no chapter map, no narrative — tables and snippets.

**Subsections:** What a heap is · Array representation · Why array beats pointers · Percolate up (insert fixup) · Percolate down (extract fixup) · Insert / extract · Cost table · Heapify (bottom-up build) · Heapsort · Priority queue ADT · `std::priority_queue` · Treap (sneak preview of balance) · Top gotchas

**Tables:** 2 — (1) 3-row pointer-tree vs array-heap (per-node overhead / cache / allocations); (2) 4-row cost table (sorted array / unsorted array / balanced BST / **heap**) on peek / pop / push.

**Code listings:** 3 — (1) percolate-up while loop; (2) percolate-down while loop with larger-child guard; (3) `std::priority_queue` max + min declarations.

**Top gotchas (4 listed):**
1. Index arithmetic off-by-one: `(i-1)/2`, not `i/2`. Must use int division.
2. Swapping with the smaller child in `percolateDown` — creates a new violation below.
3. Using a heap where you need ordered traversal or search (use a BST / `std::map`).
4. Treating `pop()` on empty as safe — UB in C++.

**Coverage relative to `lectures.tex`:**
- **Covered:** §7.1 (heap-vs-BST framing, cost-table baselines), §7.2 (array representation, parent/child formulas, pointer-vs-array argument, percolate-up/down code), §7.3 (heapify, heapsort, $O(n)$ vs $O(n \log n)$ note, in-place + not-stable), §7.4 (PQ ADT operations + uses, `std::priority_queue` declarations, `top()` const-ref gotcha), §7.5 (treap one-paragraph sneak preview).
- **Not covered (intentionally — out of scope for a quick-reference card):** §7.1 worked insert/extract walk-throughs; §7.2 zero-vs-one-indexed convention note; §7.3 geometric-series proof, sort-down trace, heapsort-vs-quicksort-vs-mergesort table, introsort note; §7.4 separate-vs-self-priority API distinction, contract pre/post-conditions, full templated `PriorityQueue<T, Cmp>` implementation, custom-comparator usage; §7.5 rotations, treap-insert/delete walk-throughs, AVL/red-black/skip-list comparison table, randomization-design-pattern closer.

**Density:** Genuinely a quick-reference card — heavy on syntax + tables, light on rationale. The treap subsection is teaser-only ("sneak preview of balance"), unlike its full §7.5 treatment.

---

## Cross-references inside ch_7

- §7.1 → §7.2 (storage), §7.3 (formal percolate primitives), §7.4 (PQ ADT on top), §7.5 (treaps).
- §7.2 → §7.1 (BST contrast from previous section).
- §7.3 → §7.2 (`maxHeapPercolateDown` reused).
- §7.4 → §7.1 (PQ motivation), §7.2 (`maxHeapInsert` / `maxHeapExtract`).
- §7.5 → §7.2 (rotations as alternative to heap swaps); plus rotation-mechanics shared with AVL/red-black.

## Forward- / backward-references to other chapters

- **Ch_6 (BSTs):** §7.1 contrasts heap-vs-BST invariants directly; §7.2 contrasts pointer-`TreeNode` storage with array-heap storage; §7.5 explicitly cites "Chapter 6 ended with a warning" (BST collapse on sorted input) and "Chapter 6.10 teased self-balancing trees (AVL, red-black)" as motivation for treaps.
- **No forward refs to ch_8+.** ch_7 is a leaf in the chapter dependency graph as ch_7 currently sits — heaps + PQs + treaps closing into themselves with no "and next, hash tables" / "and next, graphs" pointer. (ch_8 is absent from the cs-300 chapter map; ch_9 is AVL.)

---

## Stylistic patterns observed

1. **No per-section closing "big picture" `ideabox`.** ch_1–ch_6 close every section with one; ch_7 places `ideabox`es at thematic high-points only (§7.1 trade-generality-for-speed; §7.2 completeness-as-array-prerequisite; §7.3 bottom-up-heapify-cheats-worst-case; §7.4 ADT-separates-what-from-how; §7.5 randomization-as-design-pattern). 5 `ideabox`es total vs 17 in ch_1.
2. **Zero `examplebox`.** All worked examples are inline with `tabular` traces or TikZ figures — none are wrapped in `examplebox`. ch_1 has 36 `examplebox`es; ch_7 has 0. The chapter prefers inline inline-trace tables over boxed worked examples.
3. **Heavy TikZ for tree diagrams.** 8 TikZ figures (3 in §7.1 insert walk-through, 1 in §7.2, 4 in §7.5 rotation + treap-insert). ch_1 uses none.
4. **Dense `tabular` use for cost-comparison tables.** 12 tables across 5 sections — most are Big-O comparisons or trace tables.
5. **CLRS register.** Geometric-series proof for heapify (§7.3), expected-vs-worst-case columns for treaps (§7.5), formal pre/post-conditions on the PQ ADT (§7.4) — the prose voice is "derive then implement," not "syntax then drill."
6. **Cross-language references.** Java's `PriorityQueue` `poll`-vs-`remove` UB behavior cited in §7.4. CLRS root-at-index-1 convention noted in §7.2. Real practitioner systems cited in §7.5 (Linux kernel red-black, Redis skip list, LevelDB skip list).
7. **Modern C++ depth.** §7.4 ships a full templated class with `std::move`, `std::less` default template parameter, `decltype(cmp)`, and lambda comparators — beyond ch_1's "you'll learn this someday" hints.
8. **No mastery checklist, no opening chapter-map `ideabox`.** Both standard ch_1–ch_6 framing devices are absent.

---

## Counts at a glance

| Metric | Count |
|---|---|
| Sections (numbered 7.1–7.5) | 5 |
| Subsections (`\subsection*`, unnumbered) | 29 |
| `defnbox` (definitions) | 7 |
| `ideabox` (key ideas) | 5 |
| `warnbox` (gotchas) | 4 |
| `examplebox` (worked examples) | 0 |
| `notebox` (asides) | 3 |
| **Total callout boxes** | **19** |
| `lstlisting` (code blocks) | 11 |
| `tabular` (tables) | 12 |
| `tikzpicture` (figures) | 8 |
| Mastery checklist items | 0 (no checklist) |
| Lines (`lectures.tex`) | 754 |
| Pages (`lectures.pdf`) | 16 |
| Lines (`notes.tex` compact) | 135 |
