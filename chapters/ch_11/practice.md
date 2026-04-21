---
layout: default
permalink: /practice/ch_11/
---

# Chapter 11 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `practice_prompts/ch_1.md` if priming a fresh session.

---

## Drill 1 — Build a 2-3-4 tree by hand

**Problem.** Starting from an empty 2-3-4 tree (order 4), insert the
keys $[10, 20, 30, 40, 50, 60, 70]$ one at a time. Show the tree
after each insert, including every split (push the median up). No
code — this is hand-tracing.

*Skill:* the invariant-preserving insert-by-split idiom in its
simplest form.

---

## Drill 2 — Node skeleton, in C++

**Problem.** Define `struct BTNode` holding `bool isLeaf`,
`vector<int> keys`, and `vector<BTNode*> children`. Provide a helper
`bool isFull(BTNode*, int order)` and `int findKeyIndex(BTNode*, int
key)` that returns the index of the key or the first index with
`keys[i] > key`. Pseudocode, then C++.

*Skill:* the layout that makes insert, search, and split implementable.

---

## Drill 3 — Search

**Problem.** Implement `BTNode* btSearch(BTNode*, int)` that does a
linear (or binary) scan within each node, descending to the
appropriate child. Pseudocode, then C++. Runtime in terms of tree
height $h$ and order $m$?

*Skill:* the read-only traversal; the pattern insert and remove
reuse.

---

## Drill 4 — The split operation

**Problem.** Implement `void splitChild(BTNode* parent, int idx, int
order)` that splits the full child at index `idx` into two,
pushing its median key up into `parent`. Pseudocode first — call out
every vector operation (copy, erase, insert). Then C++. Test on a
hand-constructed full node.

*Skill:* the single primitive that makes B-tree grow; the hardest
helper to get right.

---

## Drill 5 — Insert (preemptive split)

**Problem.** Implement `void btInsert(BTNode*& root, int key, int
order)`. Preemptive approach: on the descent, split any full node
before entering it. At the leaf, just insert in sorted position.
Handle the root-split case (root grows tree upward). Pseudocode,
then C++. Test on drill 1's insertion sequence and verify the shape
matches your hand trace.

*Skill:* the algorithm as written in every real implementation;
simpler than the ``split on the way back up'' variant.

---

## Drill 6 — Rotation (sibling borrow)

**Problem.** Implement `void rotateLeft(BTNode* parent, int idx)`
and `void rotateRight(BTNode* parent, int idx)` that borrow one key
from a sibling through the parent. Pseudocode, then C++. Draw the
before/after pictures for a hand-example.

*Skill:* the key-recirculation helper used during removal when a
sibling is lendable.

---

## Drill 7 — Fusion (merge)

**Problem.** Implement `void fuse(BTNode* parent, int idx)` that
merges children `idx` and `idx+1` into one, pulling the separator
key down from the parent. Pseudocode, then C++. What happens if the
parent becomes empty? (Answer: if parent is the root, the fused
node becomes the new root — tree shrinks by one level.)

*Skill:* the primitive that lets B-trees shrink.

---

## Drill 8 — Remove from a leaf

**Problem.** Implement the easy case: remove a key from a leaf node
where the leaf still has $\ge \lceil m/2 \rceil - 1$ keys after
removal. Pseudocode first, then C++. Test on a prebuilt tree.

*Skill:* starting with the benign case before tackling the fixup.

---

## Drill 9 — Remove with preemptive merge

**Problem.** Implement full `btRemove`. On the descent, ensure the
child you're about to enter has at least $\lceil m/2 \rceil$ keys —
if not, rotate from a sibling if possible, else fuse with one. At
the leaf, delete directly. For internal-node removal, replace the
key with an in-order predecessor (from the left subtree) or successor
(from the right subtree). Pseudocode, then C++.

*Skill:* the hardest B-tree operation; the cost-per-level discipline
pays off because you never need to walk back up.

---

## Drill 10 — Height calculation

**Problem.** Write `int btHeight(BTNode*)` (with convention ``empty
tree = 0, single leaf = 1''). Run it on a tree of $n = 10^6$ keys
for order $m = 4$ and for order $m = 64$. Report the heights and
explain why the taller-tree shape chosen by $m=4$ still has
logarithmic depth.

*Skill:* the $\log_m n$ height claim; real-world magnitude check.

---

## Drill 11 — B-tree vs.\ red-black

**Problem.** For each scenario, pick B-tree or red-black BST and
justify:
(a) an on-disk database index, $10^9$ keys, every read is a disk
block;
(b) an in-memory associative container in a standard library;
(c) a real-time write-heavy log store;
(d) an embedded device with 4 KB of RAM and 100 keys.
Mark me wrong for any answer without mention of node size vs.\
block size.

*Skill:* why B-trees are the disk data structure and RB is the RAM
data structure.

---

## Drill 12 — B+ sketch

**Problem.** Describe (no code) how a B+ tree differs from a B-tree:
internal nodes store only routing keys; all data sits in the leaves,
which are linked in a list. Sketch pseudocode for a range query
`keysInRange(lo, hi)` that exploits the leaf list. Runtime?

*Skill:* B+ is what every production SQL database ships; recognizing
the refinement matters.

---

## Meta-drill — B-tree sprint

Set a 90-minute timer. Starting from an empty file, implement, for
order 4 (2-3-4 tree): `BTNode`, `btSearch`, `splitChild`, `btInsert`,
`fuse`, `rotateLeft`/`Right`, and `btRemove`. No references. Claude
reviews for: invariant maintenance (min keys per node), pointer /
vector hygiene, and whether preemptive split / merge is actually
preemptive (no post-hoc fixups).
