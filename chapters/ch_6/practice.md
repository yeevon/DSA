---
layout: default
permalink: /practice/ch_6/
---

# Chapter 6 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Build a BST by hand

**Problem.** Starting from an empty BST, insert the keys
$[50, 30, 70, 20, 40, 60, 80, 35]$ one at a time. Draw the tree after
each insertion. Then: find $35$, reporting the path from root to node.
Finally: remove $30$ (two children) and redraw. No code — this is pure
hand-tracing.

*Skill:* the mental model every BST exam question depends on.

---

## Drill 2 — BST search and insert, in C++

**Problem.** Implement `TreeNode* bstSearch(TreeNode*, int)` and
`void bstInsert(TreeNode*&, int)`. Pseudocode first, covering: base
case (empty tree), recursive case (go left / go right), duplicate
handling (document your policy). Then C++. Use `TreeNode*&` for insert
so you can mutate the parent's pointer.

*Skill:* reference-to-pointer idiom; the cleanest way to write mutating
tree ops in C++.

---

## Drill 3 — BST remove, four cases

**Problem.** Implement `bool bstRemove(TreeNode*& root, int key)`. In
pseudocode, enumerate the four cases (leaf / left-only / right-only /
two children) with the exact pointer rewire for each. For the
two-children case, explain why you use the in-order successor and
walk through the ``find successor, copy its key, remove it'' idiom. Then
C++. Test on the drill-1 tree.

*Skill:* the #1 exam question for ch.~6.

---

## Drill 4 — Three traversals

**Problem.** Implement recursive pre-order, in-order, and post-order
traversals that print the keys. Run them on the drill-1 tree and verify
that in-order is the sorted sequence. Then rewrite \emph{in-order}
iteratively using an explicit `std::stack<TreeNode*>`. Why might you
prefer the iterative version?

*Skill:* the three traversals + the iterative-in-order idiom, which
recurs in many tree algorithms.

---

## Drill 5 — Height and depth

**Problem.** Write `int height(TreeNode*)` (returns $-1$ on empty,
$0$ on a single node, $1 + \max(\text{left}, \text{right})$ recursively).
Then: `int depthOf(TreeNode* root, int key)` that returns the depth of
the node with the given key or $-1$. Pseudocode both, then C++.

*Skill:* height/depth are the inputs to every balance argument.

---

## Drill 6 — Count and validate

**Problem.** Write `int countNodes(TreeNode*)` and
`bool isValidBST(TreeNode*)`. The `isValidBST` is trickier than it
looks: checking ``left < root \&\& right > root'' locally is NOT
sufficient. Use the min/max-bounded recursive approach: pass down
`(minAllowed, maxAllowed)`. Explain in pseudocode why the local-check
version is wrong.

*Skill:* the \emph{global} BST invariant vs.\ the \emph{local}
parent/child rule. Classic bug.

---

## Drill 7 — Balanced-tree construction

**Problem.** Given a sorted `vector<int>`, build a balanced BST. Recipe:
pick the middle, make it root, recurse on left half and right half.
Pseudocode first, then C++. What's the height you get? Prove it's
$\lfloor \log_2 n \rfloor$.

*Skill:* why ``insertion order matters'' from the notes — this drill is
the ``correct'' order.

---

## Drill 8 — Insertion-order degenerates the tree

**Problem.** Show by hand: inserting $[1, 2, 3, 4, 5]$ into an empty
BST produces a tree of height 4 (a right-only chain). Then: implement a
function that detects whether a BST has degenerated (height
$\geq 2 \log_2 n$). What remedy do real libraries use?
(Answer: self-balancing trees — AVL, red-black.)

*Skill:* the motivation for the next three chapters in one concrete
example.

---

## Drill 9 — Min, max, successor

**Problem.** Write `TreeNode* findMin(TreeNode*)` and
`TreeNode* findMax(TreeNode*)` (loop left / right to the end). Then:
`TreeNode* successor(TreeNode* node)` returning the in-order successor
of `node`. Handle both cases: node has a right subtree (leftmost of it);
node has no right subtree (walk up to first ancestor where we came from
the left — requires parent pointers OR a second search from root).

*Skill:* min/max/successor are the primitives every higher-level tree
algorithm calls. Successor is the subtle one.

---

## Drill 10 — BST from pre-order traversal

**Problem.** Given a pre-order traversal of a BST (e.g., $[50, 30, 20,
40, 70, 60, 80]$), reconstruct the tree. Pseudocode: the first element
is root; walk until the first element $>$ root — that's the start of
the right subtree. Recurse. Then C++. Runtime?

*Skill:* reverse-engineering a tree from a traversal is an exam and
interview favorite.

---

## Drill 11 — Delete the entire tree

**Problem.** Write `void deleteTree(TreeNode*&)` that frees every node
and sets the root pointer to `nullptr`. Pseudocode: why is post-order
the only correct order? (Pre-order deletes root first, then tries to
recurse into already-freed memory.)

*Skill:* manual memory management on a hierarchy; pairs with the
recursion/traversal drills.

---

## Drill 12 — BST vs.\ hash choice

**Problem.** For each scenario, pick `std::map` (BST/red-black) or
`std::unordered_map` (hash), and justify:
(a) store student IDs, look up by ID;
(b) store student IDs, iterate in sorted order;
(c) store student IDs, find all IDs in range [1000, 2000];
(d) store student IDs, find the student with the smallest ID $\geq$ a
given number;
(e) store arbitrary `string` keys, very fast point lookup.
Mark me wrong for any answer without a justification rooted in the
cost model.

*Skill:* the container decision you make on every assignment from
ch.~6 on.

---

## Meta-drill — BST sprint

Set a 45-minute timer. Starting from an empty file, implement: node
struct, insert, search, remove (all four cases), in-order traversal,
height, findMin/findMax, successor. No references. Claude reviews for:
correctness (especially remove's two-children case), `TreeNode*&` vs.\
`TreeNode*` discipline, memory hygiene.
