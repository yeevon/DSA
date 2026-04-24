---
layout: default
permalink: /practice/ch_7/
---

# Chapter 7 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Build a max-heap by hand

**Problem.** Starting from an empty max-heap, insert the keys
$[17, 42, 9, 60, 35, 11, 50]$ one at a time. For each insert, draw
(a) the tree after placing the new node in the next slot, and
(b) the tree after percolate-up finishes. Then write out the final
array representation.

*Skill:* the mental model every exam and interview question on heaps
depends on.

---

## Drill 2 — Array-index arithmetic

**Problem.** Given the array `[57, 42, 19, 13, 6, 7, 15]` interpreted
as a zero-indexed heap, answer without coding:
(a) what is the parent of index 5?
(b) the children of index 1?
(c) the last internal (non-leaf) node's index for $n=7$?
(d) the sequence of indices visited by `percolateDown(0)` if
`h[0]` were changed to 4 (walk through the swaps).

*Skill:* index formulas $(i-1)/2$, $2i+1$, $2i+2$ are the whole trick.

---

## Drill 3 — Percolate-up and percolate-down, in C++

**Problem.** Implement `void percolateUp(int i, std::vector<int>& h)`
and `void percolateDown(int i, std::vector<int>& h)` for a max-heap.
In pseudocode, explicitly call out: the termination condition, the
``swap with the larger child'' rule, and what happens when only a
left child exists. Then C++.

*Skill:* the two primitives every heap operation reduces to.

---

## Drill 4 — Max-heap insert and extract

**Problem.** On top of drill 3, implement `void maxHeapInsert(v, x)`
and `int maxHeapExtract(v)`. Test by inserting
$[30, 50, 40, 10, 60]$ into an empty heap, then extracting until
empty and verifying the sequence comes out sorted in descending
order.

*Skill:* the full ``insert / extract'' interface; building block for
heapsort and priority queues.

---

## Drill 5 — Bottom-up heapify

**Problem.** Implement `void heapify(std::vector<int>& a)` that turns
an arbitrary array into a max-heap in place by calling
`percolateDown` from index $\lfloor n/2 \rfloor - 1$ down to $0$.
Test on `[4, 10, 3, 5, 1, 15, 2, 8]`. Explain in a comment why this
is $O(n)$, not $O(n \log n)$.

*Skill:* the geometric-series argument; classic exam question.

---

## Drill 6 — Heapsort

**Problem.** Implement `void heapSort(std::vector<int>& a)` using
your heapify (drill 5) and a size-parameterized `percolateDown`.
Pseudocode first, showing the ``swap with end, shrink heap, percolate
new root down'' loop. Then C++. Verify that the output is sorted
ascending.

*Skill:* the canonical in-place $O(n \log n)$ sort with $O(1)$ auxiliary space.

---

## Drill 7 — Priority queue wrapper

**Problem.** Build `template <class T, class Cmp = std::less<T>>
class PriorityQueue` with `push`, `pop`, `peek`, `size`, `empty`.
Pseudocode the class layout (`vector<T> h_`, `Cmp cmp_`), the
percolate helpers, and the pop-returns-top-then-move-back trick.
Then C++. Show it working as both a max-PQ (default) and a min-PQ
(passing `std::greater<T>`).

*Skill:* the 40-line priority queue; trivially small once you
have the primitives.

---

## Drill 8 — Top-$k$ from a stream

**Problem.** Given a stream of integers and a fixed $k$, maintain
the top $k$ largest values seen so far. Use a \emph{min}-heap of
size $k$: if the incoming element beats the heap's min, pop and
push. Pseudocode, then C++. Total runtime for $n$ inputs, and why
this beats ``sort everything, take the top $k$''.

*Skill:* classic heap use case; shows up in leaderboards, streaming
analytics, top-$k$ queries.

---

## Drill 9 — k-way merge with a heap

**Problem.** Given $k$ already-sorted `vector<int>`s, merge them into
one sorted vector using a min-heap of $(value, listIdx, elemIdx)$
entries. Pseudocode the loop, then C++. Runtime in terms of total
elements $n$ and $k$. Why does this beat repeated pairwise merge?

*Skill:* the priority-queue skeleton for external sorting, merging
log files, and search result aggregation.

---

## Drill 10 — `std::priority_queue` by example

**Problem.** Show three uses of `std::priority_queue` with no
custom class:
(a) max-heap of ints;
(b) min-heap of ints via `std::greater<int>`;
(c) min-heap of `pair<int,string>` keyed on the int, via a custom
comparator (or `std::greater<pair<...>>`).
For each, implement a short program and print the pop sequence. What
does `.top()` return (by value vs.\ by reference)?

*Skill:* STL PQ fluency; avoids re-implementing the wheel.

---

## Drill 11 — Treap insert by rotations

**Problem.** Starting from an empty treap, insert the pairs
`(A, 80), (C, 47), (B, 70)` in that order. At each step: (a) do the
BST-insert-by-key; (b) check the heap invariant on priority; (c) if
violated, rotate (right if the node is a left child, left if right
child). Draw every intermediate tree. No code — pure tracing.

*Skill:* rotation mechanics; the bridge between BST and AVL / RB.

---

## Drill 12 — Heap vs.\ BST, choose one

**Problem.** For each workload, pick heap (priority queue) or
BST (`std::map`) and justify:
(a) ``insert a million job IDs with priorities, repeatedly extract
the highest-priority job'';
(b) ``store student records by ID, occasionally iterate in sorted
order'';
(c) ``event simulator: insert events by scheduled timestamp, always
process the next event'';
(d) ``store (word, count) pairs, find the word with largest count
right now, then update that count''.
Mark me wrong for any answer without a cost-model justification.

*Skill:* the container decision between ``I need the extremum'' vs.\
``I need ordered access'' — the fork from ch. 6 to ch. 7.

---

## Meta-drill — Heap sprint

Set a 45-minute timer. Starting from an empty file, implement: the
two percolate primitives, heapify, `maxHeapInsert`, `maxHeapExtract`,
heapsort, and a templated `PriorityQueue` wrapper. No references.
Claude reviews for: index-arithmetic correctness, the ``larger
child'' rule in percolate-down, and whether the wrapper handles
the empty-pop case safely.
