---
layout: default
permalink: /practice/ch_3/
---

# Chapter 3 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Linear search variations

**Problem.** Write three versions of linear search over a `vector<int>`:
(a) return the first index of `target` or `-1`; (b) return \emph{all}
indices where `target` appears (as `vector<size_t>`); (c) return the
index of the \emph{closest} value to `target` (smallest absolute
difference). Pseudocode each, then C++.

*Skill:* the canonical linear scan with different bookkeeping —
foundation for every traversal in later chapters.

---

## Drill 2 — Binary search from scratch

**Problem.** Implement iterative binary search on a sorted
`vector<int>`. Invariant: ``if `t` is in `v`, it is in
`v[lo..hi]`.'' Prove in a comment why the loop always terminates. Then:
write a variant that returns the \emph{insertion point} (the index where
`t` would be inserted to keep the vector sorted) — this is
`std::lower_bound`.

*Skill:* loop invariants, `lower_bound` is the 80\% case in interview
and homework problems.

---

## Drill 3 — Big-O reasoning: derive T(n)

**Problem.** I'll give you five C++ snippets (nested loops, halving
loops, paired scans, recursion, etc.). For each: (a) write the exact
step-count $T(n)$ (as a summation if needed); (b) reduce to Big-O;
(c) explain in one sentence \emph{why}. Mark me wrong if I skip (c).

*Skill:* going from code to $O(\cdot)$ claim — high-frequency exam
shape.

---

## Drill 4 — Insertion sort, by hand and by code

**Problem.** Trace insertion sort on `[5, 2, 4, 6, 1, 3]` by hand, showing
the array state after each outer-loop iteration. Then implement in C++
and verify by running (mentally) your code on the same input. Finally:
give one input where insertion sort is $O(n)$ and one where it's $O(n^2)$.

*Skill:* the best-case-vs-worst-case distinction is the whole point
of 3.15.

---

## Drill 5 — Selection sort and stability

**Problem.** Implement selection sort in C++. Then: construct a concrete
size-4 example with a tie in keys where selection sort produces a
different order than insertion sort. Explain which of the two is stable
and why stability matters when sorting by one field after another.

*Skill:* stability is a real property, not a technicality — sort-by-city
then stable-sort-by-name is the canonical pattern.

---

## Drill 6 — Merge two sorted vectors

**Problem.** Given two sorted `vector<int>`s `a` and `b`, return a new
sorted vector with all elements of both. Pseudocode first. Then C++.
Runtime? Memory? This is the \emph{merge} step of merge sort — make
sure your code handles `a` exhausted before `b` and vice versa without
duplicated logic.

*Skill:* the merge step; directly reusable as the core of merge sort
(3.19) and as the merge operation on sorted linked lists in ch.~4.

---

## Drill 7 — Merge sort, top-down

**Problem.** Implement `void mergeSort(vector<int>& v, int lo, int hi)`.
Pseudocode first, showing the three steps (divide, recurse, merge).
Then C++ using your drill-6 merge as a subroutine. Answer: where does
the $O(n \log n)$ come from? Draw the recursion tree for $n=8$ on paper.

*Skill:* the divide-and-conquer template; recurrence $T(n) = 2T(n/2) +
O(n)$ solved concretely.

---

## Drill 8 — Quicksort and pivot choice

**Problem.** Implement Lomuto-partition quicksort on a `vector<int>`.
Pseudocode first. Then: demonstrate the worst case by running on an
already-sorted input of size 6 with first-element pivot. Propose three
fixes (random pivot, median-of-three, shuffle input) and explain which
\texttt{std::sort} uses.

*Skill:* understanding \emph{why} quicksort's worst case exists is
harder than coding the average case. Examiners love this.

---

## Drill 9 — Radix sort (LSD, non-negative integers)

**Problem.** Implement LSD radix sort on a `vector<int>` (assume all
$\geq 0$). Pseudocode first — name the bucket structure, the pass count,
and the stable-sort requirement per pass. Then C++. Finally: explain
why radix sort beats the $\Omega(n \log n)$ comparison lower bound
without contradicting it.

*Skill:* non-comparison sort intuition; connects back to the decision-tree
argument in 3.21.

---

## Drill 10 — Sort choice on a scenario

**Problem.** For each scenario, pick the best sort and justify:
(a) 50-element `vector<int>`, mostly-sorted; (b) 10M-element
`vector<int>` in RAM; (c) 10M-element `vector<int>` that doesn't fit
in RAM; (d) sort student records by GPA, then stable-sort by last name;
(e) sort 1M 5-digit zip codes. Mark me wrong if my choice is right but
my justification is vague.

*Skill:* matching sort to scenario — pure examiner bait.

---

## Drill 11 — ADT vs.\ data structure

**Problem.** Given these interface sketches (I'll name the methods),
identify (a) which \emph{ADT} they describe, (b) two concrete data
structures that could implement it, (c) the Big-O tradeoffs between them.
Examples I'll give: a LIFO container, a FIFO container, a keyed lookup,
a min-extract container, and a sorted-iteration container.

*Skill:* ADT/DS separation — the vocabulary ch.~4–6 assumes you own.

---

## Drill 12 — Full pipeline: read, sort, binary-search

**Problem.** Read integers from stdin until EOF into a `vector<int>`.
Sort them (use your own sort or `std::sort` — defend the choice). Then
enter an interactive loop: read a target, report whether it's in the
vector, using binary search. Combine in a single `main`. State the
total runtime in terms of $n$ inputs and $q$ queries.

*Skill:* building a small end-to-end CLI; the shape of assignment
submissions in CS 300.

---

## Meta-drill — Sort speedrun

Set a 30-minute timer. Implement, from scratch, in C++: insertion sort,
selection sort, merge sort, quicksort. No internet, no notes. After the
timer, Claude reviews: correctness, idiom (pass by ref, bounds, pivot
choice), and picks the one you should re-practice tomorrow.
