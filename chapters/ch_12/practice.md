---
layout: default
permalink: /practice/ch_12/
---

# Chapter 12 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Set ADT: three operations

**Problem.** Implement `class IntSet` backed by a sorted
`vector<int>`. Expose `bool contains(int)`, `void add(int)`, and
`void remove(int)`. `add` is a no-op if the element is already
present; `remove` is a no-op if absent. Pseudocode first —
specifically, how `add` keeps the vector sorted. Then C++.

*Skill:* the three-operation core of every set implementation; seeing
them in their simplest form.

---

## Drill 2 — Set operations: union, intersection, difference

**Problem.** On top of drill 1, add `IntSet setUnion(const IntSet&)`,
`IntSet intersect(const IntSet&)`, `IntSet difference(const IntSet&)`
as out-of-place operations. Pseudocode the two-pointer merge pattern
that works because both sides are sorted. Then C++. Runtime in
terms of $|A|, |B|$.

*Skill:* the classic two-pointer merge; reusable for sorted list
algorithms too.

---

## Drill 3 — Hashed set operations

**Problem.** Redo drill 2 using `std::unordered_set<int>` instead.
Pseudocode: ``iterate one side, probe the other''. Which side to
iterate? (Answer: the \emph{smaller} one for intersection — explain
why.) Then C++. Compare runtimes conceptually with the sorted-set
version.

*Skill:* the ``iterate smaller'' optimization; biggest practical
win in set code.

---

## Drill 4 — Subset test

**Problem.** Implement `bool isSubset(const IntSet& A, const IntSet&
B)` returning whether $A \subseteq B$. Pseudocode for the sorted-array
case and the hash-set case separately. Then C++. Runtime for each.

*Skill:* the simplest set query beyond membership.

---

## Drill 5 — `std::set` and `std::unordered_set` fluency

**Problem.** Given a workload of $10^5$ random inserts followed by
$10^5$ random `find`s, write the same code twice — once with
`std::set<int>`, once with `std::unordered_set<int>`. Measure wall
clock. Explain the gap: probe (one cache line) vs.\ tree traversal
(several pointer chases).

*Skill:* intuition for when the hash/ tree choice actually matters;
most students overestimate the constant factor.

---

## Drill 6 — Dedup a vector three ways

**Problem.** Given `vector<int> v` with possible duplicates,
produce a deduplicated vector. Implement three ways:
(a) `set<int> s(v.begin(), v.end())` → copy back;
(b) `sort(v)` + `v.erase(unique(v.begin(), v.end()), v.end())`;
(c) walk the input, inserting into `unordered_set<int>` and emitting
first occurrences.
Compare the orderings of the output and the runtime on $10^6$ ints.

*Skill:* three idioms for the same task; pick by the ordering guarantees
and memory budget.

---

## Drill 7 — Group anagrams using a set

**Problem.** Given `vector<string>`, group anagrams. Use a
`unordered_map<string, vector<string>>` keyed by the sorted-letter
signature. Pseudocode the signature choice (sorted chars vs.\
letter-count tuple) and justify. Then C++. (You did a version in
ch.~5; this time explain why ``set'' and ``map'' are neighbor ADTs.)

*Skill:* the hash-key design step; the bridge between set and map.

---

## Drill 8 — Seen-set in BFS/DFS

**Problem.** On a directed graph, implement cycle detection using
DFS plus a ``currently-on-path'' set and a ``fully-visited'' set.
Pseudocode first — which set is inserted/removed along the recursion
stack? Then C++. This is the three-color DFS, framed as two sets.

*Skill:* the seen-set idiom — the single most common use of sets in
graph code.

---

## Drill 9 — Static vs.\ dynamic set

**Problem.** Describe (no code): when does a static set
(fixed after construction) beat a dynamic one? Give two concrete
scenarios. Then: name three static-set tunings beyond sorted array
(bitset, perfect hash, Bloom filter) and when each is the right
choice.

*Skill:* when the extra flexibility of insert / remove is actually
unnecessary — lets you reach for a more compact structure.

---

## Drill 10 — Filter and map

**Problem.** Implement `template <class P> IntSet filter(const IntSet&
s, P pred)` returning the subset where `pred` is true. Then
`template <class F> IntSet mapSet(const IntSet& s, F f)`. Warn
about the gotcha: `mapSet` can collapse distinct inputs to the same
output — the result may be smaller than the input. Pseudocode, then
C++.

*Skill:* the higher-order set transforms used throughout functional
code.

---

## Drill 11 — Container picker

**Problem.** For each workload, pick `std::set`,
`std::unordered_set`, `std::vector<bool>` (bitset), or sorted-vector-
with-binary-search, and justify:
(a) blacklist of 10 IP addresses;
(b) 10M random 64-bit IDs, only `contains` queries;
(c) 10M sorted timestamps, range queries;
(d) small fixed universe (days of the week); membership check.
Mark me wrong for any answer without mention of the cost model.

*Skill:* the container decision you make every assignment; exam bait.

---

## Drill 12 — Multi-set and why it exists

**Problem.** Describe the difference between `std::set` and
`std::multiset`. Implement (no C++, just pseudocode) a
``histogram from stream'' using `std::multiset` and then redo
the same problem with `std::map<int, int>`. Which is more idiomatic
for counting? Which is a better fit for ``give me the $k$-th-smallest
seen so far''?

*Skill:* knowing when duplicates are data (multiset) vs.\ noise
(ordinary set).

---

## Meta-drill — Set speedrun

Set a 40-minute timer. Implement, from scratch, a sorted-vector
`IntSet` with all of: `contains`, `add`, `remove`, `size`, `union`,
`intersect`, `difference`, `isSubset`. No references. Claude reviews
for: sorted-array invariant maintenance, the two-pointer merge
correctness, and ``iterate-smaller'' discipline in `intersect`.
