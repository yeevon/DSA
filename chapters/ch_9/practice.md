---
layout: default
permalink: /practice/ch_9/
---

# Chapter 9 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `practice_prompts/ch_1.md` if priming a fresh session.

---

## Drill 1 — Balance factors by hand

**Problem.** Given a BST built from inserting
$[30, 20, 40, 10, 25, 35, 50, 5]$, compute the height and balance
factor of every node. Using convention: empty subtree height is
$-1$. Identify any nodes that \emph{would} violate AVL's
$|\mathrm{bf}| \le 1$ rule. No code.

*Skill:* the height/balance-factor mental model that AVL pivots on.

---

## Drill 2 — Rotations by hand

**Problem.** Draw both rotations carefully.
(a) Right-rotate the tree
`y(x(A, B), C)` at $y$. Show the before and after pictures.
(b) Left-rotate `x(A, y(B, C))` at $x$.
Verify in-order traversal is unchanged on both sides.

*Skill:* rotation is one primitive used by AVL, RB, and treaps.

---

## Drill 3 — AVL node and height update, in C++

**Problem.** Define `struct AVLNode` with `key, height, left, right,
parent`. Implement `int height(AVLNode*)` (using convention `-1` for
null), `int balanceFactor(AVLNode*)`, and `void updateHeight(AVLNode*)`.
Pseudocode first. Then C++.

*Skill:* the housekeeping around the balance invariant; all later
AVL ops depend on `updateHeight` being correct.

---

## Drill 4 — Four imbalance cases

**Problem.** For each of LL, LR, RR, RL, draw a minimum-size
imbalanced tree (4 nodes including the inserted one) and show the
rotation(s) that fix it. State in one sentence how to \emph{recognize}
which case you're in from the newly-inserted node's position relative
to the first unbalanced ancestor.

*Skill:* pattern-matching on the structural shape; the hardest part
of AVL insert.

---

## Drill 5 — AVL insert with retrace

**Problem.** Implement `AVLNode* avlInsert(AVLNode* root, int key)`
that inserts, then walks back up updating heights and rebalancing at
the \emph{first} unbalanced ancestor. Pseudocode the retrace loop
first. Then C++. Test by inserting $[10, 20, 30, 40, 50, 25]$ and
drawing the final tree. Did you see an LR or RL double-rotation?

*Skill:* the ``insert + retrace'' shape, reused in RB.

---

## Drill 6 — AVL remove, with cascading rebalance

**Problem.** Implement `AVLNode* avlRemove(AVLNode* root, int key)`.
Pseudocode: BST remove (two-children → copy successor key, remove
successor), then retrace. Unlike insert, rebalancing may
\textbf{cascade} upward. Explain why. Test by removing $50$ from your
drill-5 tree.

*Skill:* the subtle difference between insert (one fix) and remove
(can cascade all the way to the root).

---

## Drill 7 — Red-black: validate a tree

**Problem.** Given a small tree with colored nodes, check all five
red-black rules: (1) every node is red or black; (2) root is black;
(3) no red-red parent-child; (4) all null leaves black; (5) equal
black-height on all root-to-leaf paths. Pseudocode a validator; then
C++.

*Skill:* the five-rule gauntlet; the invariant you validate in unit
tests of any RB implementation.

---

## Drill 8 — RB insertion cases

**Problem.** Describe — in prose or pseudocode, no full code — each
of the five RB insertion fixup cases (node-is-root, parent-black,
uncle-red recolor, uncle-black zig-zag rotate, uncle-black straight
rotate-and-recolor). For each, state the invariant violation it
addresses and its cost. Then: insert $[10, 20, 30, 15, 25, 5, 1]$
into an empty RB tree and sketch the color of every node at the end.

*Skill:* seeing RB insertion as ``five cases, three of them are
symmetric pairs'' — makes the intimidating algorithm tractable.

---

## Drill 9 — AVL vs.\ red-black decision

**Problem.** For each workload, pick AVL or red-black and justify:
(a) read-heavy lookup table with rare inserts;
(b) write-heavy dictionary with many inserts and removes;
(c) `std::map` implementation in a general-purpose standard library;
(d) a leaderboard where range queries dominate;
(e) competitive-programming contest where minutes matter.
Mark me wrong if I just say ``both are $O(\log n)$.''

*Skill:* picking between two structures with identical asymptotics
based on constant factors and rebalance cost.

---

## Drill 10 — Phone book, why AVL matters

**Problem.** Build a contact-lookup CLI: read $n$ `(name, number)`
pairs into an AVL tree keyed by name. Then accept lookup queries and
return either the number or ``not found''. Test with $n = 10^5$
random pairs and $10^5$ queries. Compare with a raw BST on an
adversarial sorted input. Report wall-clock times.

*Skill:* the real-world motivation for balanced BSTs; bridges ch.~6
and ch.~9 with measured numbers.

---

## Drill 11 — Treap vs.\ AVL

**Problem.** Review the treap from ch.~7 §7.5. Code both a treap and
an AVL tree supporting `insert` and `find`. Run each on (a) $10^6$
random inserts, (b) $10^6$ sorted inserts. Report times and tree
heights. Explain the difference in terms of ``randomized balance''
vs.\ ``enforced balance.'' Which would you pick for a contest?

*Skill:* the practical tradeoff — simplicity of implementation vs.\
deterministic guarantees. Also, \texttt{rand()} hygiene.

---

## Drill 12 — Balance invariant check as a test

**Problem.** Write `bool isAVL(AVLNode*)` that verifies every
subtree is BST-ordered and has $|\mathrm{bf}| \le 1$. Write a similar
`bool isRedBlack(RBNode*)`. Use these as assertions in your insert /
remove test suite. Triggers: what inputs would surface a subtle
rotation bug?

*Skill:* property-based testing for tree invariants; the tool that
catches the 5\% of bugs code review misses.

---

## Meta-drill — AVL from zero

Set a 60-minute timer. Starting from an empty file, implement:
`struct AVLNode`, `height`/`balanceFactor`/`updateHeight`, both
rotations, `avlInsert`, `avlRemove`, and `isAVL`. No references.
Claude reviews for: correctness of the four cases, height-update
discipline, cascade logic on remove, and whether the `parent` pointer
was kept consistent throughout.
