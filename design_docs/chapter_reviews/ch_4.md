# ch_4 Step-1 inventory: Lists, Stacks, Queues, Deques

`chapters/ch_4/lectures.tex` — 3232 lines, 148 callout boxes (16 defnbox,
33 examplebox, 50+ ideabox, 19 notebox, 30+ warnbox).
`chapters/ch_4/notes.tex` — 133 lines, compact reference.

This is a Step-1 inventory only. Step 2 (gap analysis vs CLRS / OCW)
follows separately and will propose a small set of additions per the
project-level scoping rule (~3–5 high-value adds; everything else
defers to a post-build optional-content audit).

## Structure

Clean numbering: 18 sections, §4.1 through §4.18, no gaps, no stubs.
Title subtitle: *"Lists, Stacks, and Queues"* (omits "Deques" even
though §4.17 covers them — minor).

| §     | Title                                  | Anchor topics                                                                                              |
|-------|----------------------------------------|------------------------------------------------------------------------------------------------------------|
| 4.1   | The List ADT                           | List defn, contract operations, restricted-access lists, `std::list/vector/forward_list`, "the plan"       |
| 4.2   | SLL: Append and Prepend                | Node struct, head/tail wrapper, `nullptr`, O(1) endpoint inserts                                           |
| 4.3   | SLL: Insert-After                      | Three cases, `curNode` arg, mapping to `std::list`                                                         |
| 4.4   | SLL: Remove                            | RemoveAfter, predecessor-based removal, `delete` discipline, "remove given just victim" trick             |
| 4.5   | Linked List Search                     | Walker idiom, return-pointer, cache hostility, predecessor variant, recursive variant                      |
| 4.6   | Doubly Linked Lists                    | DLL node, invariants, append/prepend, `std::list` is circular DLL                                          |
| 4.7   | DLL: Insert-After                      | Three cases, picture of interior splice, insertBefore for free, four writes vs SLL two                     |
| 4.8   | DLL: Remove                            | Four independent checks, picture, "remove during a walk" idiom, return-the-node ownership variant          |
| 4.9   | Linked List Traversal                  | Forward/reverse loops, never-deref-in-condition, array vs LL traversal speed, STL range-for                |
| 4.10  | Sorting Linked Lists                   | DLL insertion sort, SLL insertion sort, why merge sort is the LL sort                                      |
| 4.11  | Sentinel (Dummy) Nodes                 | Two-sentinel branchless DLL remove, empty-list invariant flip, circular+sentinel pattern                   |
| 4.12  | Recursion on Linked Lists              | Recursive traverse / reverse / search, "recursion is a stack", stack-overflow risk                         |
| 4.13  | Stack ADT                              | LIFO, undefined pop-on-empty, `std::stack`, "stack is the call stack"                                      |
| 4.14  | Stacks via Linked Lists                | Choose-the-cheap-end, full singly-linked stack class, copy/move semantics, amortization brief              |
| 4.15  | Queue ADT                              | FIFO, `std::queue`, BFS-uses-queue note, dangling-tail caveat                                              |
| 4.16  | Queues via Linked Lists                | Head+tail SLL, dangling tail bug, array-backed queue mention                                               |
| 4.17  | Deque ADT                              | Both ends, `std::deque` is *not* a linked list, can't build O(1) deque on SLL                              |
| 4.18  | Array-Based Lists                      | Dynamic array list, doubling amortization, +1-growth-mistake warn, prepend O(n), iterator invalidation     |

Closing wrap-up: `ideabox [Chapter 4 wrap-up]` + `notebox [Forward
links to later chapters]` (Ch 5 hash tables, Ch 6 trees, optional
Ch 10 graphs, stack/queue reuse) — cross-chapter refs **match
cs-300's actual structure**, no fixes needed.

## Stylistic patterns

- Heavy `lstlisting[language=C++]` use (33 examplebox blocks, almost
  all with code) — same idiom as ch_3, opposite of ch_2's `verbatim`.
- Every section opens with a `defnbox`, then mixes
  `examplebox`/`ideabox`/`warnbox`. Closing sections have an `ideabox
  [Where this is going]` or `[The bigger lesson]`.
- Callout density is the highest of any chapter so far (148 in 3232
  lines = ~1 per 22 lines, vs ch_3's 175 in 3437 = ~1 per 20).
- Pictures (ASCII / textual diagrams) used in §4.7 and §4.8 to walk
  through the splice — load-bearing, not decoration.

## Cross-chapter references — all correct

| Line          | Says                                        | Actual chapter | Status |
|---------------|---------------------------------------------|----------------|--------|
| 12, 72, 262, 852, 1627, 3201, 3210 | "Chapter 5 ... hash tables" | ch_5 | ✓ correct |
| 64, 2218, 3213 | "Chapter 6 ... trees / BSTs"               | ch_6           | ✓ correct |
| 3217 | "Optional ch.~10 (graphs)"                          | ch_10 (extras) | ✓ correct |

No broken cross-refs to fix. (Contrast ch_3: had 5 wrong cross-refs
saying "Big-O is in Chapter 4" / "sorting is in Chapter 5".)

## Flagged items

(a) **Companion-materials line stale** (lines 3227–3230): references
    `cheat_sheets/ch_4.tex` (path never existed) and
    `practice_prompts/ch_4.md` (now `coding_practice/`). Already on
    the deferred-to-Phase-2 list for all chapters; no per-chapter fix
    needed.

(b) **Title subtitle omits "Deques"**: says *"Lists, Stacks, and
    Queues"* but §4.17 covers Deques. One-line fix during Step 3.

(c) **`notes.tex` decision matrix** (lines 95–107): missing the array
    `append` `$1^*$` footnote explanation (the `$^*$` means amortized,
    but the table doesn't say so). Minor — consider during Step 3.

(d) **Insertion sort on linked lists in §4.10**: covers the topic
    well but doesn't cross-ref §3.15 (where insertion sort is first
    introduced on arrays). One-line forward/back-ref would help.

(e) **No mention of `std::list::splice`** in §4.7 or §4.11, despite
    being *the* canonical "why DLL exists" demonstration in modern
    C++. Possible Step-2 candidate; possible defer-to-audit.

(f) **Recursion on linked lists (§4.12) doesn't mention tail-call
    optimization**, which is the actual reason "recursion on LL
    rarely optimized in C++" is a problem. May be too deep for an
    intro chapter; defer judgment to Step 2.

(g) **No discussion of `unique_ptr`-based linked lists** anywhere —
    raw pointers and manual `delete` throughout. This is a real
    modern-C++ gap, but consistent with how ch_1's "C++ refresher"
    framing left ownership patterns lightly covered. Decision needed
    in Step 2.

## Headline

ch_4 is **the strongest chapter in the repo so far**: clean
numbering, all cross-refs correct, no stubs, dense and well-organized
callouts, every algorithm has a worked C++ example. Step-2 gap
analysis will likely propose a small number of additions (1–3) and
no critical fixes.
