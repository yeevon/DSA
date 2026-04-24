---
layout: default
permalink: /practice/ch_13/
---

# Chapter 13 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Bubble sort with early exit

**Problem.** Implement bubble sort on `vector<int>` with the
``swapped / early exit'' optimization — if a pass makes zero swaps,
the array is sorted and we stop. Pseudocode first. Then C++.
Show the best case ($O(n)$, already sorted) and the worst case
($O(n^2)$, reversed).

*Skill:* the textbook teaching sort; mostly instructive, not
production-quality.

---

## Drill 2 — Bubble sort vs.\ insertion sort

**Problem.** Implement both and benchmark on three inputs: random,
nearly-sorted, and reverse-sorted, each of size $10^4$. Report times
and explain: which one is strictly better? In what ways is bubble
sort educational but never the right production choice?

*Skill:* seeing why bubble sort exists only as a teaching tool.

---

## Drill 3 — Quickselect (find $k$-th smallest)

**Problem.** Implement `int quickselect(vector<int>& a, int k)` that
returns the $k$-th smallest element (0-indexed). Use Lomuto
partition, recursing into only the side that contains $k$.
Pseudocode first. Then C++. Expected runtime?

*Skill:* the Las Vegas algorithm for order statistics; median,
percentile, top-$k$ all reduce to this.

---

## Drill 4 — `std::nth_element` vs.\ hand-rolled

**Problem.** Redo drill 3 using `std::nth_element(a.begin(),
a.begin() + k, a.end())`. Benchmark against your hand-rolled
version on a random input of $10^6$ ints. Explain why
`std::nth_element` uses introselect (quickselect that falls back to
median-of-medians when recursion depth gets bad).

*Skill:* standard-library fluency; the production answer to
``give me the $k$-th smallest.''

---

## Drill 5 — Top-$k$, two approaches

**Problem.** Given a large `vector<int>` and small $k$, return the
$k$ largest elements. Implement (a) using `std::nth_element` plus
a small sort; (b) using a min-heap of size $k$ (ch.~7 style).
Compare runtimes and memory. Which wins on a streaming input
(one element at a time)?

*Skill:* matching tool to workload — static batch vs.\ stream.

---

## Drill 6 — Bucket sort on $[0, 1)$

**Problem.** Given `vector<double>` with values in $[0, 1)$,
implement bucket sort: partition into $n$ buckets by index
$\lfloor n \cdot x \rfloor$, insertion-sort each bucket, concatenate.
Pseudocode first. Then C++. When is this $O(n)$ average, and when
does it degenerate?

*Skill:* non-comparison sort for real-valued, roughly-uniform inputs.

---

## Drill 7 — Counting sort

**Problem.** Given `vector<int>` where values are in $[0, k]$ with
$k$ small (say $\le 1000$), implement counting sort: tally, then
emit. Pseudocode the stable version (walk the input, place into
output using running counts). Then C++. Runtime in terms of $n$ and
$k$; stability matters when?

*Skill:* the simplest linear-time sort, and a building block of
radix sort.

---

## Drill 8 — Radix sort, LSD

**Problem.** Implement LSD radix sort on `vector<unsigned int>`
using 8 bits per pass (four passes for 32-bit ints). Each pass is a
stable counting sort on one byte. Pseudocode first. Then C++.
Benchmark against `std::sort` on $10^6$ ints.

*Skill:* the fastest-in-practice sort for integer keys; one of the
few places non-comparison wins.

---

## Drill 9 — Custom List wrapper

**Problem.** Implement `template <class T> class List` backed by a
singly-linked list (or DLL) with `push_front`, `push_back`,
`pop_front`, `pop_back`, `size`, `empty`, and a basic forward
iterator. Include the rule of 5 (destructor, copy ctor, copy assign,
move ctor, move assign). Pseudocode the copy and destructor first;
then C++.

*Skill:* a realistic container implementation exercise; rule of 5
discipline.

---

## Drill 10 — Sentinel-based doubly linked list

**Problem.** Redo drill 9 as a DLL with a single sentinel node that
points to itself when empty. Show that `insertBefore`, `insertAfter`,
`remove` each collapse to a single case (no empty / first / last
special-casing). Compare line count and readability with the
``head + tail pointers + nullptrs'' version.

*Skill:* the sentinel idiom — the refactor every real list
implementation uses internally.

---

## Drill 11 — Circular list + Josephus problem

**Problem.** Implement a circular singly-linked list. Use it to
solve the classic Josephus problem: $n$ people stand in a circle,
every $k$-th person is eliminated until one remains; return the
survivor's index. Pseudocode the ``skip $k-1$, remove next'' loop
first. Then C++. Runtime?

*Skill:* circular list termination (back to the start, not
\texttt{nullptr}); Josephus is the canonical interview exercise for
this structure.

---

## Drill 12 — Container picker, sorting edition

**Problem.** For each scenario, pick the best sort and justify:
(a) 100 ints, mostly sorted;
(b) $10^7$ random ints that fit in RAM;
(c) $10^6$ floating-point numbers in $[0,1)$;
(d) $10^6$ 8-bit pixel values;
(e) $10^6$ records sorted by a string field, then by a numeric field
(stable required);
(f) ``find the 100 largest in a $10^9$ stream.''
Mark me wrong if my justification is vague.

*Skill:* the sort-picker muscle — the most common exam shape for a
sort chapter.

---

## Meta-drill — Niche algorithms sprint

Set a 50-minute timer. Implement, from scratch: bubble sort with
early exit, quickselect, counting sort, a sentinel-DLL with
rule-of-5. No references. Claude reviews for: correctness, memory
hygiene on the DLL, partition-stopping correctness in quickselect,
and whether counting sort is stable as written.
