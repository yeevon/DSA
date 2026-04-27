# Chapter 7 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_7/lectures.tex` (754 lines, 16 pp; inventoried in `ch_7.md`) **against** MIT OCW 6.006 Spring 2020 lec8 (Binary Heaps, 6 pp) + r08 (Recitation 8, 7 pp), and CLRS 3rd-ed Ch 6 (Heapsort) — `\textsc{Heap-Maximum}`, `\textsc{Heap-Extract-Max}`, `\textsc{Heap-Increase-Key}`, `\textsc{Max-Heap-Insert}`, `\textsc{Build-Max-Heap}`, `\textsc{Heapsort}`.

**Locked framing (revised for optional-chapter arc, 2026-04-25):** ch_7 is a **post-SNHU optional chapter**. The required-arc constraints (3–5 bounded adds, 40-page lectures.pdf cap) are **OFF**. The user has explicitly stated this is where they'll spend most of their study time, so the depth bar is "deep enough for actual mastery", not "minimum viable for the SNHU test."

**Reference material read:**
- OCW lec8.pdf (6 pp) — "Binary Heaps": Priority Queue interface (`build`, `insert`, `delete_max`, `find_max`); Priority Queue Sort as a unifying lens (Dynamic Array → Selection Sort, Sorted Dynamic Array → Insertion Sort, Set AVL Tree → AVL Sort, Binary Max Heap → Heap Sort); Array-as-complete-binary-tree perspective with formal index arithmetic (`left=2i+1`, `right=2i+2`, `parent=⌊(i-1)/2⌋`); Max-Heap Property + transitivity proof by induction; `max_heapify_up` and `max_heapify_down` with explicit Θ(log n) bound and correctness arguments; Linear `O(n)` `build_max_heap` with the geometric-series proof using Stirling's approximation; In-place heap-sort via prefix-of-larger-array trick; **Sequence AVL Tree augmented with min/max pointers** as an alternative PQ implementation with same bounds; Set vs. Multiset distinction.
- OCW r08.pdf (7 pp) — full Python `PriorityQueue` base class + `PQ_Array` + `PQ_SortedArray` + `PQ_Heap` subclasses with explicit `max_heapify_up`/`down` code; In-place variant with prefix-array convention; CodePen visualizer link; Four exercises with solutions: (1) draw + heapify + insert/delete trace, (2) **min-element in max-heap is Ω(n)** (search all leaves), (3) max-heap-to-min-heap is `O(n)` via re-running build_max_heap, (4) **k-proximate sorting in `O(n log k)`** via sliding-window heap.
- CLRS 3rd-ed Ch 6 — confirmed: §6.1 Heaps (definitions + index arithmetic), §6.2 Maintaining the heap property (`MAX-HEAPIFY` aka heapify-down), §6.3 Building a heap (`BUILD-MAX-HEAP` with the same Stirling proof), §6.4 The heapsort algorithm, §6.5 Priority queues (`HEAP-MAXIMUM`, `HEAP-EXTRACT-MAX`, `HEAP-INCREASE-KEY`, `MAX-HEAP-INSERT`), exercises including `d`-ary heaps (6.5-9 / 6-2), Young tableaux (6-3), priority queue with `MAX-HEAP-DELETE` (6.5-8).

**OCW/CLRS coverage style:** OCW uses Python-flavored implementations; CLRS uses its own pseudocode. Both share the same algorithm structure and complexity arguments. ch_7's existing C++ implementation is closer to CLRS in spirit; the OCW perspective adds the **Priority-Queue-Sort-as-unifying-framework** lens that ch_7 currently doesn't lead with.

---

## Structural gaps (apply to chapter as a whole)

The Step-1 inventory caught three **structural** gaps that exist regardless of OCW content. ch_1–ch_6 all have these; ch_7 doesn't:

### S1 — No opening chapter-map `ideabox` — ADD

**Current:** ch_7 opens directly into §7.1 (heap motivation) with no orientation block.

**Required (per the ch_1–ch_6 template):** an opening `ideabox` titled "Chapter map" with three sub-blocks:
1. **Where this sits in CS 300** — heaps are the first explicit ADT-from-array construction; sets up the "tree as an array" pattern that B-trees (ch_11) and indexed structures generalize. They're also the canonical example of a structure where the right asymptotic only emerges from a non-obvious analysis (the Θ(n) build).
2. **What you add to your toolkit** — array-as-complete-binary-tree perspective; max-heap / min-heap property as a local invariant that gives a global guarantee; percolate-up / percolate-down as the two universal heap primitives; heap sort as the in-place O(n log n) sort that doesn't need the merge sort merge-buffer; priority queue as the ADT every graph algorithm needs (forward ref to ch_10).
3. **Mastery checklist** — see S2 below.
4. **Looking-ahead / forward refs** — ch_9 (AVL/RB trees as the search-tree alternative for the same Set-with-ordering interface), ch_10 (Dijkstra needs a PQ), ch_13 (heapsort lives in the sort-comparison table alongside quicksort, mergesort, counting sort).

### S2 — No mastery checklist — ADD

**Required:** 7-item mastery checklist following the ch_1–ch_6 pattern (concrete, behavioural items the reader should be able to do without references). Suggested items:

1. Convert an array index `i` to its parent / left-child / right-child indices and back, by hand on a 15-element array.
2. State the max-heap property at a node + explain why it implies the global "all descendants ≤ root" claim by induction.
3. Run `max_heapify_up` and `max_heapify_down` by hand on a 7-element array, distinguishing which one fires on `insert` vs `delete_max`.
4. Sketch the geometric-series proof that `build_heap` is `O(n)` (not `O(n log n)`) — at least the "sum of node heights = O(n)" step.
5. Explain why heap sort is in-place but merge sort is not, and state when you'd pick heap sort over quicksort (worst-case sensitive, no random-access budget) and over merge sort (no heap allocation budget).
6. Sketch the priority-queue interface (`build` / `insert` / `delete_max` / `find_max`) and identify which graph-algorithm problem (ch_10 forward ref) needs each operation.
7. Distinguish max-heap from BST: locate the minimum element of a max-heap (Ω(n) — must search the leaves; OCW r08 exercise 2) vs locate it in a BST (O(log n)).

### S3 — No closing cross-reference `ideabox` — ADD

**Required:** a closing `ideabox` ("The big picture / what's next") that:
- Frames heaps as the first non-trivial Set ADT implementation (a step up from arrays + sorted arrays from ch_1).
- Forward-refs ch_9 (AVL/RB trees as Set with O(log n) operations + ordered iteration — heaps don't support efficient `find` / `successor`, hence the need for AVL/RB).
- Forward-refs ch_10 (Dijkstra + Prim need a PQ; the `decrease_key` operation in min-heap form is the canonical use).
- Forward-refs ch_13 (heap sort in the sort-comparison table).

### S4 — Zero `examplebox` — ADD a few worked traces

**Current:** ch_7 has 0 `examplebox` callouts. The ch_1–ch_6 mean is roughly 4–8 worked examples per chapter.

**Required:** at least 3 `examplebox` worked traces with explicit array states at each step:
- `examplebox` 1: build a max-heap from `[7, 3, 5, 6, 2, 0, 3, 1, 9, 4]` via bottom-up `max_heapify_down` (the OCW r08 exercise 1 array). Show the array after each `max_heapify_down(i)` call.
- `examplebox` 2: heap sort the same array, showing the array state after each `delete_max` step (5–6 frames).
- `examplebox` 3: insert + delete-max trace on a 7-element heap, showing the percolate-up and percolate-down paths and the swaps.

---

## Per-section gap verdicts

For each ch_7 section: **ADD**, **DECIDE**, or **SKIP** (no-gap items omitted). Given the relaxed scope, the bar for ADD is "adds genuine pedagogical value", not "top-5-only."

### §7.1 (heap motivation + percolate primitives) — ADD

**Current:** ch_7 motivates heaps directly. The Step-1 inventory shows §7.1 covers the percolate primitives.

**OCW Lec 8 lead with a different framing:** the **Priority-Queue interface** as the abstract problem (router scheduling, kernel scheduler, discrete-event simulation, **graph algorithms** — explicit forward ref) **before** introducing any data structure. Then `PriorityQueue: Array` (= selection sort) and `PriorityQueue: Sorted Array` (= insertion sort) as motivating-but-bad implementations, with the question "is there a compromise between insert-cheap-but-extract-expensive vs the reverse?" — which is what heaps answer.

**Recommendation: ADD** a Priority-Queue-interface motivation block at the very top of §7.1 (before the existing heap-motivation content), framed as:
- The interface (4 operations).
- Three real examples (router scheduling / kernel scheduler / discrete-event simulation, plus a forward ref to graph algorithms / Dijkstra).
- The "Set interface (not Sequence)" framing: heaps order by key, not by position.
- **`PriorityQueue: Array` and `PriorityQueue: Sorted Array` as the two extremes** — give one paragraph each, then the unification: "a binary heap finds the compromise, with **both** insert and `delete_max` at `O(log n)`."

This makes ch_7 connect to ch_3's sorting analysis (selection / insertion sort are PQ-sort instances) and ch_10's graph algorithms (PQ is the substrate Dijkstra rides on) rather than introducing heaps as a thing-in-itself.

**Estimated add:** ~30 lines of TeX (one `defnbox` for the PQ interface, two `examplebox`es for the array-vs-sorted-array extremes — light touch on those — plus one `ideabox` framing the unification).

### §7.2 (array representation + percolate code) — DECIDE

**Current:** ch_7 covers array representation with index arithmetic + percolate-up/down code. Per Step 1, the existing content is already C++-implementation-heavy (11 `lstlisting` blocks across the whole chapter, several here).

**OCW Lec 8 / CLRS coverage:** Both define array-as-complete-binary-tree, give the index arithmetic (`left=2i+1`, `right=2i+2`, `parent=⌊(i-1)/2⌋`), state the max-heap property, and **prove by induction that the property at every node implies "every node ≥ all its descendants"**. The proof uses induction on `depth(j) - depth(i)` — straightforward but worth including formally.

**Three options:**

- **(A) ADD the formal max-heap property + transitivity proof.** Insert the Lec 8 induction proof as an `examplebox` or `notebox` in §7.2. Justifies the algorithm's correctness arguments later.
- **(B) Keep §7.2 implementation-first; add the proof as an inline `notebox` aside.** Lighter-touch.
- **(C) Skip — the proof is implicit in the percolate-up/percolate-down correctness arguments.** Risky for "deep mastery" framing.

**Recommendation: (A).** ch_7 promised mastery item #2 ("explain why max-heap-property implies all-descendants ≤ root by induction") and the explicit proof belongs in §7.2 where the property is defined.

**Estimated add:** ~20 lines of TeX (one `examplebox` titled "Why the local property implies a global guarantee" with the depth-difference induction).

### §7.3 (heapsort + O(n) build proof + sort comparisons) — DECIDE

**Current:** Per Step 1, ch_7 has an "explicit geometric-series O(n)-heapify proof + heapsort-vs-quicksort-vs-mergesort comparison." Strong content.

**OCW Lec 8 / CLRS extra:**
- The **Priority-Queue-Sort table** that unifies Selection Sort / Insertion Sort / AVL Sort / Heap Sort as instances of the same algorithm with different DS substrates. ch_7's comparison is a separate table; the unification adds a perspective.
- The **"In-Place Priority Queue Sort"** mechanism (prefix-of-larger-array convention with `|Q|` count). Explains why heap sort can be in-place where AVL sort can't.
- The **Sequence-AVL-Tree-as-PQ alternative** — augment with min/max-subtree-pointer for `O(1)` find_max + `O(log n)` delete + `O(n)` build. Same bounds as heap; **simpler-DS argument is what justifies using heap.**

**Recommendation: ADD all three.**
1. Add a "Priority-Queue Sort table" as a `tabular` showing Selection Sort / Insertion Sort / AVL Sort / Heap Sort with their `build` / `insert` / `delete_max` complexities. Frame heap sort's contribution as "the goal row" the prior rows fall short of.
2. Add a `notebox` on the in-place heap-sort prefix trick — what `|Q|` represents, how `insert` absorbs `A[|Q|]`, how `delete_max` decrements `|Q|`. ~15 lines of TeX.
3. Add a `notebox` (or short subsection) on Sequence AVL Tree as PQ alternative — same bounds, but more code + not in-place. Justifies "why heap" for this specific problem. ~20 lines.

**Estimated add:** ~50 lines of TeX.

### §7.4 (priority-queue ADT + std::priority_queue) — ADD

**Current:** Per Step 1, full 40-line templated `PriorityQueue<T, Cmp>` + `std::priority_queue` walk-through. Already substantial.

**OCW Lec 8 / CLRS extra:**
- **`HEAP-INCREASE-KEY`** — the operation that lets you bump a key upward in the heap. Critical for Dijkstra's relaxation step (forward ref to ch_10) and for any "priority changes mid-flight" workflow. Algorithm: write the new (larger) key into the slot, then `max_heapify_up` from that slot.
- **Set vs Multiset distinction** (Lec 8 closing section): Set assumes no duplicate keys; Multiset allows them. Heaps work directly on multisets (use `≤` instead of `<` in the property check).

**Recommendation: ADD both.**
1. Add a `HEAP-INCREASE-KEY` (and the symmetric `HEAP-DECREASE-KEY` for min-heap) subsection with C++ implementation (~20 lines code + 10 lines prose, plus a forward ref to ch_10's Dijkstra).
2. Add a brief `notebox` on Set-vs-Multiset behaviour for heaps. ~8 lines of TeX.

**Estimated add:** ~40 lines of TeX.

### §7.5 (treaps as randomized self-balancing BSTs) — DECIDE

**Current:** Per Step 1, treaps with rotations introduced here. Treaps are **not** in OCW Lec 8 or CLRS Ch 6 — they're a separate topic (CLRS Ch 13 problem 13-4).

**Two options:**

- **(A) Keep §7.5 as a treap-as-extension-of-heap teaser** — argues that if you want both heap-order and BST-order, treaps give you both by combining (priority, key) tuples. Sets up ch_9's AVL/RB trees as the deterministic alternative. Treaps fit pedagogically but they're a CLRS-Ch-13-flavour topic, not a CLRS-Ch-6 topic.
- **(B) Move §7.5 to ch_9 as a "randomised alternative to AVL/RB"** subsection. Cleaner topic separation. ch_7 stays focused on heaps as the priority-queue substrate.

**Recommendation: DECIDE — surface to user.** Treaps fit naturally either place. The argument for keeping in ch_7 is "extends the heap structure"; the argument for moving to ch_9 is "fits the BST-balancing topic family." If the user picks (B), this is a ch_7 SUBTRACT + a ch_9 ADD. If (A), no change; just amplify the §7.5 framing as "this is your introduction to rotations, which generalise to AVL in ch_9."

**Default if no user input:** keep in ch_7 with framing tweaks. Treaps are a real heap variant and they introduce rotations gently before the AVL formalism. Move-to-ch_9 is reversible.

### NEW §7.6 / appendix — Common heap exercises and pitfalls — ADD

**OCW r08 contributes four exercises that don't currently appear in ch_7:**

1. **Min-element in a max-heap is Ω(n)** (r08 exercise 2) — useful as a "what heaps are NOT good for" `warnbox`. Reinforces "heaps are not BSTs."
2. **Max-heap-to-min-heap conversion is `O(n)`** via re-running `build_heap` with flipped property (r08 exercise 3) — short, clean, illustrates that heap structure isn't directional.
3. **k-proximate sorting in `O(n log k)`** via sliding-window heap (r08 exercise 4) — the showcase application of heap sort. Beautiful, and a real "deep mastery" item that connects ch_7 to ch_13's sort comparison.
4. **`HEAPIFY` vs `HEAP-EXTRACT-MAX` interview question** — when a candidate confuses these two, it's almost always because they didn't internalize the percolate-up / percolate-down split.

**Recommendation: ADD a new §7.6 "Heap exercises and pitfalls"** with:
- A `warnbox` on min-element-in-max-heap.
- A short `examplebox` on max-to-min conversion.
- A worked subsection on k-proximate sorting (~40 lines TeX with a `lstlisting` C++ port of the Python algorithm).
- One or two pitfall warnings (off-by-one in index arithmetic; forgetting to bound the recursion when child indices overflow).

**Estimated add:** ~80 lines of TeX (this is the single biggest add).

### NEW §7.7 / appendix — `d`-ary heaps + decrease-key forward ref — ADD

**CLRS 6.5-9 / 6-2 covers `d`-ary heaps:** generalise binary heap to `d` children per node. Tradeoffs: shorter trees (`Θ(log_d n)` height) → faster `insert` / `decrease_key`, but `delete_max` does `d` comparisons per level → `Θ(d log_d n)`. With `d = E/V`, this is **the data structure Dijkstra's actually uses for sparse graphs** in production (Fibonacci heap is the asymptotically-cleaner alternative but rarely beats `d=4` heap in practice).

**Recommendation: ADD a brief §7.7 (single subsection, ~30 lines).** Framing: "Once you have binary heap, the `d`-ary heap generalisation is a one-line algorithmic change with real practical payoff." Forward-ref to ch_10's Dijkstra. Don't go deep on Fibonacci heaps (they're CLRS Ch 19, well past ch_7's scope) — just mention them as "the asymptotically-better alternative that rarely beats `d`-ary in practice."

**Estimated add:** ~30 lines of TeX.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3) | Closing `ideabox` cross-reference | ~20 |
| Throughout (S4) | 3 `examplebox` worked traces | ~60 |
| §7.1 | PQ-interface motivation block | ~30 |
| §7.2 | Max-heap-property transitivity proof | ~20 |
| §7.3 | PQ-sort table + in-place trick + Seq AVL Tree alternative | ~50 |
| §7.4 | `HEAP-INCREASE-KEY` + Set/Multiset note | ~40 |
| §7.5 | (DECIDE — default keep + reframe) | ~5 |
| NEW §7.6 | Heap exercises + pitfalls (incl. k-proximate) | ~80 |
| NEW §7.7 | `d`-ary heaps + Fibonacci forward ref | ~30 |
| **Total** | | **~375** |

ch_7 grows from 754 → ~1130 lines, 16 → ~24–25 pages. Within "deep coverage, no cap" framing. Comparable to ch_9's current 31 pages.

## Open decisions for the user

1. **§7.5 treaps** — keep in ch_7 (default) or move to ch_9? My recommendation: keep with reframing as "first encounter with rotations."
2. **Sequence AVL Tree as PQ alternative (§7.3 add)** — include as a `notebox` aside, or pull into a full subsection? The full-subsection version sets up ch_9's AVL coverage; the aside keeps ch_7 focused. My recommendation: `notebox` aside (~20 lines). Forward-ref to ch_9 carries the heavy lift.
3. **k-proximate sorting (NEW §7.6)** — full worked subsection with C++ port, or summary + pointer to OCW r08? The full version is the showcase deep-mastery example that justifies the chapter being optional-yet-deep. My recommendation: full worked subsection.

If no user input, defaults apply per "auto-approve chapter-review steps" memory norm and Step 3 proceeds against the table above.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_7/lectures.tex`) lands in this order:

1. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
2. Add §7.1 PQ-interface motivation block.
3. Add §7.2 transitivity-proof `examplebox`.
4. Add §7.3 PQ-sort table + in-place trick + Seq AVL Tree note.
5. Add §7.4 `HEAP-INCREASE-KEY` + Set/Multiset note.
6. Add §7.5 framing tweak (default: keep treaps with rotations-introduction framing).
7. Add NEW §7.6 (exercises + k-proximate worked example).
8. Add NEW §7.7 (`d`-ary heaps).
9. Sprinkle the 3 `examplebox` worked traces (S4) across §7.2 / §7.3 / §7.4.
10. Add closing `ideabox` cross-reference (S3).
11. `pdflatex -halt-on-error chapters/ch_7/lectures.tex` to verify build-clean.
12. CHANGELOG entry citing ch_7 augmentation pass.

Step 3 happens via builder subagent; this file is the contract the builder is held against.
