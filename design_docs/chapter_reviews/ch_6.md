# ch_6 Step-1 inventory: Trees and Binary Search Trees

`chapters/ch_6/lectures.tex` — 1677 lines, 51 callout boxes (7 defnbox,
7 examplebox, 17 ideabox, 11 notebox, 9 warnbox).
`chapters/ch_6/notes.tex` — 155 lines, compact reference.

This is a Step-1 inventory only. Step 2 (gap analysis vs CLRS Ch 12 +
OCW lec5/lec6) follows separately.

## Structure

10 sections (§6.1–§6.10). **No stub at end** (unlike ch_2 / ch_3 /
ch_5). Numbering is clean — no gaps. Title subtitle: *"Trees"*
(omits "and BSTs" despite §6.3–§6.10 being entirely BST content).

| §     | Title                                            | Anchor topics                                                                                              |
|-------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| 6.1   | Binary Trees: Vocabulary and Shape               | Tree defn, root/leaf/depth/height, full/complete/perfect, BT node struct, unique_ptr notebox                |
| 6.2   | Why Trees Matter: Applications                   | Filesystems, ASTs, expression trees, Huffman, etc. — pure motivation section                                |
| 6.3   | Binary Search Trees (BST)                        | BST invariant, validation bug warn, search code, "BST is binary search with mutability", std::set/std::map  |
| 6.4   | BST Search, Closer Look                          | Iterative + recursive search, real-world data isn't random, search-plus-parent variant, BST-vs-hash picker  |
| 6.5   | BST Insertion                                    | Insert algorithm + recursive variant, sorted-input degeneracy warn, std::set::insert amortized $O(\log n)$ |
| 6.6   | BST Removal                                      | Three-case defnbox, four-case removal logic; **callouts go untitled from here on**                          |
| 6.7   | BST Traversals                                   | Pre/in/post-order, iterative + recursive; multiple untitled callouts                                        |
| 6.8   | BST Height and Insertion Order                   | Insertion-order rule, balance/unbalance, motivates AVL                                                      |
| 6.9   | BST Parent Pointers                              | Parent-pointer struct, search/insert/remove with parents; multiple untitled lstlistings                     |
| 6.10  | Recursive BST Implementations (No Parent Pointers) | Reference-to-pointer idiom; chapter wrap-up untitled notebox at 1644                                       |

Closing wrap-up: untitled `notebox` at line 1643 + `notebox [Forward
links to later chapters]`. The forward-links notebox has **multiple
broken cross-refs** (see below).

## Stylistic patterns

- Same `lstlisting[language=C++]` style as ch_3/ch_4/ch_5.
- **Stylistic regression starting at §6.6**: ~16 callouts switch to
  untitled (`\begin{notebox}` not `\begin{notebox}[Title]`). §6.1–§6.5
  consistently title their callouts. §6.6 onward drops them. Visual
  effect: the chapter feels "rushed" in its second half.
- Callout density: 51 callouts / 1677 lines = **~1 per 33 lines** —
  the lowest density of any chapter (vs ch_4 at 1/22, ch_5 at 1/25).
  The `lstlisting` blocks pick up the slack — many sections rely on
  raw code listings rather than callout-wrapped examples.

## Cross-chapter references — **FIVE wrong, must fix in Step 3**

Verified actual cs-300 chapter map:
- ch_7 = **Heaps and Priority Queues** (NOT AVL/red-black)
- ch_8 = **does not exist** (no `chapters/ch_8/` directory)
- ch_9 = **Balanced Search Trees: AVL and Red-Black** ← what ch_6 means
- ch_10 = Graphs (correct, optional)
- ch_11 = B-Trees (correct, optional)

| Line | Says                                              | Should say                            | Notes                                  |
|------|---------------------------------------------------|---------------------------------------|----------------------------------------|
| 36   | "AVL / red-black trees (ch.~7 onward)"            | "(ch.~9)"                             | Mastery-checklist forward-ref          |
| 60   | "week 7+ / ch.~7--9 arc"                          | "ch.~9 onward"                        | Looking-ahead paragraph in chapter map |
| 1644 | "self-balancing trees (AVL and red-black)" (no §) | (acceptable — no ch num)              | Wording-only, untitled chapter-end notebox |
| 1651 | "Chapters 7-8 (AVL, red-black)"                   | "Chapter 9"                           | Forward-links notebox                  |
| 1655 | "Optional ch.~11 (B-trees / 2-3-4 trees)"         | (correct — leave)                     | ch_11 = B-Trees ✓                      |
| 1661 | "ADT-vs-data-structure decision from ch.~3"       | likely correct (ch_3 covers ADTs)     | Verify in Step 2                       |
| 1666 | "Graphs (opt.\ ch.~10)"                           | (correct — leave)                     | ch_10 = Graphs ✓                       |

Plus: **chapter title subtitle and chapter-map intro reference an
"AVL / red-black trees (ch.~7 onward)" pattern** — five separate
fixes needed across the file. Same "wrote the chapter against a
different chapter map than cs-300 actually uses" issue as ch_3.

## Flagged items

(a) **No stub at §6.11** — chapter ends cleanly at §6.10. **Good.**

(b) **5 wrong cross-refs** to ch_7/ch_7-8 for AVL/red-black, when the
    actual cs-300 chapter is ch_9. Must-do Step-3 fix.

(c) **Title subtitle**: *"Trees"* understates the content. §6.1–§6.2
    cover trees in general; §6.3–§6.10 are entirely BSTs. Either:
    *"Trees and Binary Search Trees"* or leave as-is. Decision in
    Step 2.

(d) **§6.6 onward stylistic regression** — ~16 untitled callouts.
    Could be "fix all" (touch ~16 callouts) or "leave as-is"
    (cosmetic only, the content reads fine). Lean: leave — out of
    scope for content augmentation, defer to a later style pass.

(e) **§6.2 "Why Trees Matter"** is unusually long pure-motivation
    section (~130 lines) with no code. Possible Step-2 question:
    is anything load-bearing missing, or is this section actually
    too long? Lean: leave (motivation chapters reduce flailing).

(f) **No mention of in-order successor/predecessor as Set ADT
    `find_next(k)` / `find_prev(k)` operations** — the ch_4 §4.1
    Sequence/Set framing introduced these as Set-ADT ops; ch_6 §6.6
    uses the in-order successor in removal but doesn't connect it to
    the Set ADT. Step-2 candidate (small notebox).

(g) **No analysis of expected BST height under random insertion**
    (CLRS Ch 12.4 — random BST has expected height $O(\log n)$).
    cs-300 §6.8 only states the worst case ($h = n - 1$ for sorted
    input). Step-2 candidate.

(h) **No tree rotation preview** — §6.8 motivates AVL but doesn't
    even sketch what a rotation looks like. Probably correct (full
    rotations are ch_9 territory), but a one-paragraph "here's what
    a rotation does, you'll see them in ch_9" would close the loop.
    Possible Step-2 candidate; possible defer.

(i) **Stale companion-materials line** (lines 1673–1675): same
    pattern as other chapters, deferred to Phase 2 globally.

(j) **`notes.tex` is well-aligned** with `lectures.tex` — no
    obvious mirror gaps. The compact-reference table cleanly
    summarizes BST vs hash vs sorted array, mirroring ch_5 §5's
    table from the other side.

## Headline

ch_6 is **structurally clean** (no stub) but **factually broken on
cross-refs** (5 wrong ch_7/ch_7-8 forward-refs to AVL/red-black,
which are actually in ch_9). Stylistic regression in §6.6+ (untitled
callouts) is cosmetic — defer. Step-2 will likely propose 2–3
small additions (Set-ADT bridge for in-order successor, expected
random-BST height, possibly rotation preview) plus the must-do
cross-ref fixes.

This is the **last SNHU-required chapter**; after Step 3, the
optional chapters (ch_7/ch_9–ch_13) and the post-build content
audit follow.
