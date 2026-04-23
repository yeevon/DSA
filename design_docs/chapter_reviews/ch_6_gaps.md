# ch_6 Step-2 gap analysis: Trees and Binary Search Trees

Sources audited: **CLRS Ch 12.1** (What is a BST — definition,
in-order traversal as proof of sorted yield), **Ch 12.2** (Querying
— search, min, max, **successor**, **predecessor**, Theorem 12.2: all
$O(h)$), **Ch 12.3** (Insertion and deletion — already well-covered
in cs-300 §6.5–§6.6), **Ch 12.4** (Randomly built BSTs — **Theorem
12.4: expected height $O(\log n)$**).

ch_6 baseline: **1677 lines, 29 pages PDF**. 40-page ceiling per
autonomy directive leaves ~11 pages headroom. Per the bounded-
additions rule: **3 high-value additions** + must-do fixes proposed.

---

## ADD #1 — §6.4 (or new §6.4.5): Successor / predecessor as Set-ADT operations

**Source:** CLRS Ch 12.2 (`TREE-SUCCESSOR`, `TREE-PREDECESSOR`,
Theorem 12.2 — all five queries SEARCH/MIN/MAX/SUCCESSOR/PREDECESSOR
in $O(h)$ time).

**What's missing:** ch_6 currently uses the in-order successor
*inside* §6.6 (BST removal, two-children case) without ever introducing
**successor and predecessor as first-class operations** the BST
exposes to callers. ch_4 §4.1's Sequence-vs-Set framing introduced
`find_min`, `find_max`, `find_next(k)`, `find_prev(k)` as the **Order
operations** that distinguish the Set ADT from a Dictionary; ch_6 is
the first chapter where these Order operations are *cheap* (BSTs do
them in $O(h)$, vs hash tables' $O(n)$). Naming this is the payoff
of the §4.1 framing.

**Proposal:** Add a new subsection in §6.4 (right after the existing
"Search-plus-parent" examplebox) titled *"Min, max, successor,
predecessor: the Set-ADT order operations BSTs make cheap."*
Contents:
- One-paragraph framing: these are exactly the `find_min` /
  `find_max` / `find_next(k)` / `find_prev(k)` ops from the §4.1
  Set-ADT table; hash tables do them in $O(n)$, BSTs do them in
  $O(h)$ — *this* is why you'd ever pick a BST over a hash table.
- `examplebox` with `treeMin` (walk left until null) + `treeMax`
  (walk right until null), each ~5 lines C++.
- `examplebox` with `treeSuccessor` showing the two cases:
  (a) right subtree non-null → leftmost of right subtree;
  (b) right subtree null → walk up until you come from the left.
  ~12 lines C++ (uses parent pointers, forward-refs §6.9).
- Closing line: this is also the in-order successor used in §6.6's
  removal — same operation, two uses (find-next-key vs replace-on-
  removal).

**Cost estimate:** ~50 lines.

---

## ADD #2 — §6.8: Random BST expected height notebox

**Source:** CLRS Ch 12.4 Theorem 12.4 (expected height of randomly
built BST on $n$ distinct keys is $O(\lg n)$).

**What's missing:** §6.8 (BST Height and Insertion Order) currently
discusses the worst case ($h = n - 1$ for sorted input) and motivates
balancing — but never tells the reader what the **typical** case
looks like for unbalanced BSTs built from random insertions. The
gap is conceptually large: a student finishes §6.8 thinking
"unbalanced BSTs are dangerous, must use AVL," when in fact a BST
built from random insertions has $O(\log n)$ expected height —
which is *why* unbalanced BSTs survive in real codebases as long as
inputs aren't adversarial.

**Proposal:** Add one `notebox` in §6.8 (after the existing
discussion of worst-case insertion order) titled *"Random insertion
gives $O(\log n)$ height in expectation."* Contents:
- State CLRS Theorem 12.4: a randomly built BST on $n$ distinct
  keys has expected height $O(\lg n)$.
- One-paragraph proof sketch (no derivation): the analysis is
  parallel to randomized quicksort — the random rank of the root
  splits the keys into two roughly-balanced subproblems on average.
- One-paragraph practical implication: BSTs **with random or
  adversary-free input** behave like balanced trees on average; the
  reason production code uses red-black / AVL anyway is **worst-case
  guarantees** (and resistance to adversarial input that forces the
  pathological shape).
- One-line bridge to ch_5: this is a parallel to the universal-hashing
  story — random structure makes the average case good; defending
  against the worst case requires more (rotations for trees,
  universal hashing for tables).

**Cost estimate:** ~25 lines.

---

## ADD #3 — §6.8: Tree rotation preview defnbox

**Source:** CLRS Ch 13 (red-black) introductory material; OCW lec6
(BST + AVL).

**What's missing:** §6.8 motivates AVL ("balance is the difference;
balance factor of a node = $\text{height(left)} -
\text{height(right)}$") but never *shows* what a rotation actually
does. A reader leaves §6.8 with the abstract idea that "ch_9 will fix
unbalance somehow" without a mental hook. One small `defnbox`
illustrating a left-rotation closes the loop without doing ch_9's
job.

**Proposal:** Add one `defnbox` in §6.8 (after the random-insertion
notebox from ADD #2) titled *"Rotation: the local fix-up that
preserves the BST invariant."* Contents:
- Definition: a rotation reorganizes three pointers so that one
  node moves up and another moves down; the BST in-order key
  ordering is preserved.
- Tiny ASCII picture of a left-rotation:
  ```
       y                x
      / \              / \
     x   C    ===>    A   y
    / \                  / \
   A   B                B   C
  ```
  Show that the in-order traversal "A x B y C" is the same before
  and after.
- One-line forward-ref: ch_9 (AVL + red-black) uses sequences of
  these rotations to keep $h = O(\log n)$ after every insert/remove.

**Cost estimate:** ~25 lines (most of it the ASCII picture).

---

## Must-do fixes

**FIX A.** **Five wrong cross-refs** to ch_7/ch_7-8 for AVL/red-black
(actual cs-300 chapter is **ch_9**; ch_7 is Heaps, ch_8 doesn't
exist):
- Line 36: "AVL / red-black trees (ch.~7 onward)" → "(ch.~9)"
- Line 60: "week 7+ / ch.~7--9 arc" → "ch.~9 onward"
- Line 1651: "Chapters 7-8 (AVL, red-black)" → "Chapter 9"
- Line 1644: chapter-end notebox prose mentions AVL/red-black
  generically (no chapter number) — leave wording, no fix needed.
- Plus a sweep grep for any other `ch.~7` / `ch.~8` references
  that point at the wrong chapter (verify nothing else slipped).

**FIX B.** **Title subtitle**: *"Trees"* → *"Trees and Binary Search
Trees"* (per inventory item (c) — §6.3–§6.10 are entirely BST
content; current subtitle understates).

**FIX C.** **Stale companion-materials line** (lines 1673–1675): same
pattern as other chapters, already deferred to Phase 2 globally. **No
per-chapter fix.**

---

## Explicitly deferred to post-build optional-content audit

| Topic                                                          | Why deferred                                                        |
|----------------------------------------------------------------|---------------------------------------------------------------------|
| Full AVL / red-black coverage                                  | Lives in ch_9 already                                               |
| 2-3-4 trees / B-trees / on-disk variants                       | ch_11 covers (B-trees)                                              |
| Treap, splay tree, scapegoat tree                              | Not in CLRS Ch 12; classic post-build "alternative BSTs" survey     |
| Threaded BSTs (no parent ptr, no recursion)                    | Niche; classic textbook curiosity                                   |
| Untitled-callout cleanup in §6.6 onward (~16 callouts)         | Cosmetic; defer to a chapter-wide style pass                        |
| Full proof of CLRS Theorem 12.4                                | The notebox sketch is enough; full proof uses Jensen's inequality   |
| Order statistics (k-th smallest in $O(\log n)$ via augmented BST) | CLRS Ch 14.1 — augmentation is post-build material               |

---

## Net delta if approved

- 3 new callouts in lectures.tex: ~+100 lines (~+6%, would land
  ch_6 at ~1780 lines / projected ~31–32 pages — well under the
  40-page ceiling).
- 5 must-do cross-ref fixes: net 0 lines (in-place edits).
- Title subtitle fix: net 0 lines.
- `notes.tex` mirror: small successor/predecessor entry + height
  result in compact form.

**Total:** ~+100 lines. Within ceiling.

Per autonomy directive: proceeding to Step 3 without explicit
approval.
