---
layout: default
permalink: /practice/ch_5/
---

# Chapter 5 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Simple hash function and table (chaining)

**Problem.** Implement a hash table of `(int key, string value)` with
capacity 7, using chaining. Use division hashing $h(k) = k \bmod 7$.
Expose `insert(k, v)`, `find(k) -> string*`, and `remove(k)`.
Pseudocode the bucket-as-linked-list idea first, then C++. Use
`std::vector<std::list<...>>` as the internal storage.

*Skill:* smallest complete hash table; every other drill builds on this.

---

## Drill 2 — Trace collisions by hand

**Problem.** Given capacity 7, $h(k) = k \bmod 7$, and the insertion
sequence $[13, 20, 6, 7, 27, 34, 41]$: draw the resulting table under
(a) chaining, (b) linear probing, (c) quadratic probing with step
$i^2$. Then attempt `find(20)` and `find(100)` on each; count the number
of probes. Nothing goes into code here — it's hand-tracing.

*Skill:* this is the most common exam question shape for ch.~5. If you
can't do it on paper, you don't understand it.

---

## Drill 3 — Linear probing, in code

**Problem.** Implement a hash table with open addressing + linear
probing. Capacity 11, division hashing. Handle the three slot states:
`EMPTY`, `OCCUPIED`, `TOMBSTONE`. Explain in your pseudocode why
deletion can't just mark a slot `EMPTY` — show the failure scenario.

*Skill:* tombstones are the surprise trap in open addressing.

---

## Drill 4 — Double hashing

**Problem.** Implement double hashing: $h_1(k) = k \bmod m$, $h_2(k) =
1 + (k \bmod (m - 2))$ with $m$ prime. Insert the drill-2 keys into a
capacity-11 table. Compare the probe count to linear probing on the
same sequence. Why must $h_2$ never return 0?

*Skill:* double hashing is the ``textbook-correct'' open-addressing
scheme; worth doing once by hand.

---

## Drill 5 — Load factor and resize

**Problem.** Extend your chaining table from drill 1: when
$\alpha > 0.75$, resize to next prime $\geq 2\times$ current capacity
and \emph{rehash} every element into the new table. Pseudocode the
resize procedure first. Then C++. Watch for: old indexes are invalid;
you must recompute $h(k) \bmod \text{new\_capacity}$ for every element.

*Skill:* the amortization argument that makes ``$O(1)$ expected''
honest.

---

## Drill 6 — Count character frequencies (direct hashing)

**Problem.** Given a `std::string`, return a `std::array<int, 256>`
where entry `c` is the number of times character `c` appears. Use
direct hashing (character code = index). Pseudocode first. Then:
rewrite using `std::unordered_map<char, int>` and compare performance
/ memory.

*Skill:* direct hashing is the simple tool for dense small key spaces;
``reach for `unordered_map` anyway'' is sometimes wrong.

---

## Drill 7 — Two-sum with a hash set

**Problem.** Given `vector<int> nums` and `int target`, return indices
$(i, j)$ such that $nums[i] + nums[j] = target$. $O(n)$ expected using
a hash map from value $\to$ index. Pseudocode, then C++.

*Skill:* classic hash-as-complement-lookup; the prototype for a huge
family of interview / homework problems.

---

## Drill 8 — Anagram grouping

**Problem.** Given `vector<string> words`, group them by anagram class.
Return `vector<vector<string>>`. Pseudocode the hash key: sort-the-letters
vs.\ letter-count-tuple. Choose one, justify. Then C++. Runtime in terms
of $n$ words and $k$ max word length.

*Skill:* picking the right hash key is often the whole problem.

---

## Drill 9 — LRU cache sketch (hash + DLL)

**Problem.** Design `class LRUCache` with capacity $C$. Operations:
`get(key)` returns value or `-1`; `put(key, value)` inserts or updates.
Both $O(1)$. Use a `std::unordered_map<int, Node*>` plus a DLL. Pseudocode
the invariant: map holds pointers into the DLL; DLL ordering is MRU at
head, LRU at tail. Explain why neither data structure alone suffices.

*Skill:* the canonical hash + list combo; the shape of many caching and
de-duplication systems.

---

## Drill 10 — When hash tables are the wrong tool

**Problem.** I'll describe three workloads. For each, decide hash table,
BST, sorted vector, or something else, and justify:
(a) ``store 1M entries, query whether a key exists'';
(b) ``store 1M entries, query all keys in range [L, R]'';
(c) ``store 1M entries, repeatedly find the min key.''
Mark me wrong if I pick hash for (b) or (c).

*Skill:* knowing hash tables' \emph{weaknesses} — they have no order.

---

## Drill 11 — Hash flooding (brief security angle)

**Problem.** Explain, in pseudocode or prose (no need to code the
attack), how an attacker can degrade a poorly-chosen hash function to
$O(n^2)$ by feeding keys that all collide. Then: name two defenses
(randomized seed per table, switch to a keyed hash like SipHash).
Why does Rust's `HashMap` use a random seed by default?

*Skill:* hash tables have adversarial worst cases. Relevant for any
service exposed to user input.

---

## Drill 12 — `std::unordered_map` vs.\ `std::map`

**Problem.** Given the same workload (100k insertions of `(int, int)`
followed by 100k lookups), write the same code twice:
`std::unordered_map<int, int>` and `std::map<int, int>`. Pseudocode
first. Run both. Measure and explain: which is faster, why, and what
cost model (probe vs.\ tree traversal) explains the difference?

*Skill:* in production C++, you pick between these two containers every
week. Intuition trumps vibes here.

---

## Meta-drill — Hash-table build from zero

Set a 60-minute timer. Build a working hash map `class HashMap<int,
string>` with: division hashing, chaining, `insert`, `find`, `erase`,
resize-at-$0.75$, rehash. No references. Claude reviews for:
correctness, tombstone discipline (if you chose open addressing),
iterator invalidation on resize, and exception safety.
