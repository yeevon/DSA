---
layout: default
permalink: /practice/ch_4/
---

# Chapter 4 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `practice_prompts/ch_1.md` if priming a fresh session.

---

## Drill 1 — SLL from scratch

**Problem.** Define `struct Node` and `class SLL` with private `head`,
`tail`, `size_t sz`. Implement `append`, `prepend`, `size`, `empty`,
and a `print` that walks the list and outputs
`[1 -> 2 -> 3 -> null]`. Pseudocode each operation (including the empty
vs.\ non-empty branches), then C++. Use `nullptr` everywhere.

*Skill:* node + pointer idiom — the foundation for every linked
structure in the rest of the course.

---

## Drill 2 — SLL insert-after and remove

**Problem.** Add `insertAfter(Node* cur, int x)` and `remove(Node* cur)`
to your drill-1 SLL. Pseudocode: enumerate the three cases for
`insertAfter` (empty list, append-to-tail, middle) and explain why
`remove` is $O(n)$ on an SLL. Then C++. Write a small `main` that builds
`[1,2,3,4,5]`, inserts 99 after 3, removes 1, and prints the result.

*Skill:* pointer-rewiring and case analysis; the step most often
bungled.

---

## Drill 3 — DLL insert and remove

**Problem.** Define `class DLL` with `Node {value, next, prev}`. Implement
`append`, `insertAfter`, `insertBefore`, and `remove(Node*)`. Each write
of `next` should have a twin `prev` write; call this out in your
pseudocode comments. Test by walking the list forward \emph{and}
backward.

*Skill:* the DLL invariant (`n->next->prev == n`) is what makes reverse
traversal and $O(1)$ remove possible.

---

## Drill 4 — Sentinel DLL

**Problem.** Rewrite your DLL from drill 3 with a fixed `head` and `tail`
sentinel (dummy) node. Real nodes sit between. Show that `insertAfter`,
`insertBefore`, and `remove` now each collapse to a single case (no
empty/first/last special-casing). Compare line count and complexity of
the two implementations.

*Skill:* the sentinel idiom — the refactor that makes `std::list`'s
internals readable.

---

## Drill 5 — Linked-list search variations

**Problem.** On an SLL of `int`, implement: (a) find first node with
value `x`, return `Node*` or `nullptr`; (b) count occurrences of `x`;
(c) find the \emph{predecessor} of the first node with value `x`
(needed for SLL remove). Pseudocode first. What's the cost of each?

*Skill:* walker idiom + predecessor-tracking, exactly the shape used by
SLL remove.

---

## Drill 6 — Reverse a linked list in place

**Problem.** Reverse an SLL in place (no new allocation). Pseudocode:
three pointers — `prev`, `cur`, `next` — walking forward, flipping
each link. Then C++. Trace on `[1,2,3,4]` by hand showing pointer
state at each iteration. Finally: write the recursive version. Which
would you ship?

*Skill:* classic pointer-wrangling problem; also a canonical interview
question.

---

## Drill 7 — Sort a linked list

**Problem.** Sort an SLL of ints in ascending order. Pseudocode two
approaches: (a) collect into a `vector`, sort, rebuild; (b) merge sort
directly on the list (find middle, split, recurse, merge). Code (a),
then code (b). Argue which is appropriate when memory is tight.

*Skill:* merge sort on linked lists is the natural fit — no random
access needed, $O(1)$ merge, $O(\log n)$ recursion depth.

---

## Drill 8 — Stack on linked list

**Problem.** Implement `class Stack<int>` using an SLL internally.
Expose `push(x)`, `pop()`, `top()`, `empty()`, `size()`. All ops $O(1)$.
Pseudocode first. Then: rewrite it backed by a `std::vector` and argue
which backing you'd ship for (a) a function call stack, (b) a math
expression evaluator, (c) an undo history.

*Skill:* backing-data-structure decision for the Stack ADT.

---

## Drill 9 — Queue on linked list

**Problem.** Implement `class Queue<int>` using an SLL with both `head`
and `tail` pointers. Enqueue at tail, dequeue at head, both $O(1)$.
Then: attempt the same on a plain `vector` and show why it's $O(n)$.
Finally: sketch how a \emph{ring buffer} over an array gives you $O(1)$
again.

*Skill:* why the backing choice for a Queue is non-obvious; feeds into
\texttt{std::deque} / \texttt{std::queue}.

---

## Drill 10 — Deque + BFS sketch

**Problem.** Implement `class Deque<int>` with $O(1)$ at both ends using
a DLL. Then: sketch pseudocode for BFS on a small graph
(`vector<vector<int>> adj`) using your Deque as a queue. No need to
code BFS — just show which Deque ops it uses.

*Skill:* deque is the workhorse for BFS, sliding-window, and
monotonic-deque problems.

---

## Drill 11 — ``Remove every node where pred(x)'' idiom

**Problem.** On a DLL, implement
`void removeIf(DLL& d, bool (*pred)(int))` that removes every node whose
value satisfies `pred`. Care: the standard trap is deleting `cur` while
still holding it, then crashing on `cur = cur->next`. Pseudocode the
``cache next before delete'' idiom. Then C++.

*Skill:* iterator invalidation during traversal — an iterator- and
pointer-discipline drill.

---

## Drill 12 — Array-based list vs.\ linked list

**Problem.** Given a workload described as a sequence of operations
(e.g., ``append 10 000 ints, then access middle index 500 times, then
insert at position 50 five times''), build rough cost estimates for
both a `std::vector`-based and an `std::list`-based implementation. Then
actually run the workload and compare wall-clock time. Reconcile the
theoretical prediction with reality. What did cache do?

*Skill:* the real-world calibration that Big-O alone misses; also a
reminder that linked lists are often \emph{slower} than their Big-O
advertises.

---

## Meta-drill — Pointer surgery speedrun

Set a 40-minute timer. Starting from an empty file, implement: SLL,
DLL, Stack on SLL, Queue on SLL. All with correct pointer discipline
(no leaks, no dangling pointers in the happy path). Claude reviews
for: correctness, invariants, and whether you used a sentinel where it
would have simplified the code.
