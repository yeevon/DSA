# Chapter 9 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_9/lectures.tex` (1575 lines, 31 pp; inventoried in `ch_9.md`) **against** MIT OCW 6.006 Spring 2020 lec7 (Binary Trees II: AVL, 5 pp) + r07 (recitation 7) + lec6/r06 (Binary Trees I context), and CLRS 3rd-ed Ch 13 (Red-Black Trees) — `LEFT-ROTATE`, `RIGHT-ROTATE`, `RB-INSERT-FIXUP` 5 cases, `RB-DELETE-FIXUP` 4 cases, augmentation methodology (Ch 14).

**Locked framing (revised for optional-chapter arc, 2026-04-25):** ch_9 is a **post-SNHU optional chapter**. The required-arc constraints (3–5 bounded adds, 40-page lectures.pdf cap) are **OFF**. The user has explicitly stated this is where they'll spend most of their study time, so the depth bar is "deep enough for actual mastery."

**Crucial baseline note:** **ch_9 is already the deepest chapter in cs-300** (1575 lines, 31 pp, 37 callouts, 23 listings, 29 TikZ figures). The technical content for AVL (§9.1–§9.4) and red-black (§9.5–§9.8) is comprehensive and CLRS-register. **The augmentation surface is correspondingly smaller than ch_7's.** Most adds are structural scaffolding + a few framing angles OCW leads with that ch_9 doesn't.

**Reference material read:**
- OCW lec7.pdf (5 pp) — "Binary Trees II: AVL": Set + Sequence Data Structure tables (Binary Tree h-time vs AVL log n); height-balance / skew / |skew| ≤ 1; **Rotations Suffice claim** (O(n) rotations transform any binary tree to any other with same traversal order); Fibonacci height bound F(h) ≥ 2^(h/2); 3-case Local Rebalance proof (Cases 1/2 single rotation; Case 3 double rotation when right child has skew −1); Global Rebalance O(log n) rotations bound; **Computing Height via subtree augmentation**; **General "Steps to Augment a Binary Tree" framework** (state subtree property P, show O(1) update from children); Sequence AVL tree (subtree-size augmentation); **AVL Sort** as a sorting algorithm.
- OCW r07 — assumed to mirror Lec 7 with code; not read in detail since ch_9's existing implementation depth already exceeds typical r-PDFs.
- OCW lec6 / r06 — Binary Trees I context for subtree-size augmentation + the Set/Sequence interface unification.
- CLRS 3rd-ed Ch 13 — confirmed: §13.1 properties of red-black trees, §13.2 rotations, §13.3 insertion + 5-case fixup, §13.4 deletion + 4-case fixup, problems 13-1 (Persistent dynamic sets), 13-2 (Join operation on red-black trees), 13-3 (AVL trees), 13-4 (Treaps). Ch 14 (Augmenting Data Structures): order-statistic trees, interval trees, the general augmentation methodology.

**OCW vs ch_9 coverage style:** OCW uses Python-flavored pseudocode + ASCII tree diagrams; ch_9 uses C++ + TikZ trees + CLRS-register prose. ch_9 is **deeper than OCW Lec 7** on most topics (cached-height trick is explicit; bit-stealing for RB colour bits is explicit; production references like `std::_Rb_tree_node` and Linux `rbtree.c` are cited). The augmentation surface is OCW-conceptual-framing, not OCW-technical-depth.

---

## S0 — Pre-augmentation cleanups (existing typos surfaced by Step 1)

The Step-1 inventory caught two pre-existing issues that are unrelated to the augmentation pass but should land in the same Step 3 commit since the file is being touched anyway:

### S0.1 — §9.1 line 137 outdated red-black comment — FIX

**Current:** `"section 9.8, sort of -- the main chapter focuses on AVL"` — written when red-black was a single-section teaser.

**Reality:** §9.5–§9.8 = four-section red-black coverage. The comment contradicts the actual chapter structure.

**Fix:** rewrite line 137 prose to "the main chapter splits roughly evenly: §9.1–§9.4 AVL, §9.5–§9.8 red-black" or similar accurate framing.

### S0.2 — §9.4 line 620 `Zchapter 6.6` typo — FIX

**Current:** rendered PDF shows `"Zchapter 6.6"` — looks like a stale `\Zref` or `\Zchapter` macro that didn't expand cleanly.

**Fix:** replace with the correct `\hyperref` to ch_6 §6.6 (BST self-balancing teaser per the cross-ref) or with a plain `Chapter~6 §6.6` text reference.

These are 2-line fixes; folded into Step 3.

---

## Structural gaps (apply to chapter as a whole)

Same three structural gaps as ch_7:

### S1 — No opening chapter-map `ideabox` — ADD

**Current:** ch_9 opens directly into §9.1 (AVL invariant) with no orientation block.

**Required (per ch_1–ch_6 + ch_7 template):** opening `ideabox` titled "Chapter map" with three sub-blocks:

1. **Where this sits in CS 300** — ch_9 is the **search-tree depth chapter**. ch_6 introduced BSTs (§6.6 hinted at "self-balancing"); ch_7 introduced rotations as a heap-variant (treaps). ch_9 closes the loop: AVL and red-black are the two production-grade self-balancing BSTs. Set up as "what every map / set / ordered-iteration data structure in std + the JDK + the Linux kernel actually uses."
2. **What you add to your toolkit** —
   - Height-balance as a local invariant that gives a global O(log n) guarantee (analogous to the heap property argument from ch_7).
   - **Rotations as a primitive** (the "edit-the-tree-without-changing-traversal-order" move).
   - The **augmentation framework**: state a subtree property P, show O(1) update from children, get the property maintained for free under dynamic operations.
   - Two production-grade balancing schemes (AVL strict / RB looser) and the constant-factor tradeoff between them.
   - Where to read real-world implementations: `std::map` → red-black; Linux `rbtree.c` → red-black; Java `TreeMap` → red-black; AVL is rarer in production but classic in coursework.
3. **Looking ahead / forward refs** — ch_10 (BFS spanning trees + Dijkstra's parent-pointer trees use the same balanced-tree machinery internally for priority queues with decrease-key); ch_11 (B-trees as the "shallow + wide" alternative for disk-based or cache-friendly storage); ch_12 (set ADT — `std::set` is red-black under the hood).

### S2 — No 7-item mastery checklist — ADD

**Required:** 7-item mastery checklist following the ch_1–ch_7 pattern:

1. State the AVL height-balance invariant + sketch the Fibonacci-recurrence proof that h = O(log n).
2. Run a left rotation and a right rotation by hand, identifying the three pointer-relinks each requires; argue why traversal order is preserved.
3. Identify the four AVL rebalance cases (LL / LR / RR / RL) from a worked imbalance and apply the correct one- or two-rotation fix without reference.
4. State the five red-black rules + the black-height bound + sketch why h ≤ 2 lg(n+1).
5. Trace a red-black insertion through Cases 1–3 of `RB-INSERT-FIXUP` on a 7-node tree.
6. Distinguish AVL's strict balance (h ≤ 1.44 lg n) from RB's looser balance (h ≤ 2 lg n) + justify why std and the Linux kernel pick RB despite worse height (insert/delete amortized rotation cost is lower, colour-bit-stealing makes the per-node overhead 0).
7. Apply the augmentation framework to a new property: e.g., subtree size for order-statistic queries (CLRS 14.1) — state P, show O(1) maintenance, run one rotation update.

### S3 — No closing cross-reference `ideabox` — ADD

**Required:** closing `ideabox` ("The big picture / what's next"):
- Frames AVL + RB as **the** production self-balancing BSTs and the augmentation framework as the meta-tool that makes specialised trees (interval trees, order-statistic trees) cheap.
- Forward-refs ch_10 (BFS trees + Dijkstra; parent-pointer trees as a different "tree as algorithm output" lens).
- Forward-refs ch_11 (B-trees as the shallow-and-wide alternative; the same "balanced search tree" problem with different geometric tradeoffs).
- Forward-refs ch_12 (set ADT impl — `std::set` is RB under the hood).

§9.8's existing closing `ideabox` (line 1571) functions thematically as a chapter-level mental-model closer but isn't framed as "looking ahead." Either re-frame the existing one OR add a new closing block after §9.8. **Recommendation: re-frame in place** — extend the line 1571 ideabox with the forward-refs above. Less file churn, preserves the existing thematic content.

### S4 — One `examplebox` chapter-wide; ch_1–ch_7 mean is 4–8 — ADD a few worked traces

**Current:** ch_9 has 1 `examplebox` total across 31 pages. Compensated by 29 TikZ figures, but the figures are abstract diagrams — no concrete-array-state-after-each-step traces.

**Required:** at least 3 `examplebox` worked traces that give array-of-keys + tree-state snapshots:

- `examplebox` 1 (AVL): insert sequence `10, 20, 30, 40, 50, 25` into an empty AVL tree. Show the tree state + skew at each insertion + which rotation case fires (5 frames; LL → LR boundary at insert 25).
- `examplebox` 2 (RB): same insert sequence into a red-black tree. Show colour assignments + which RB-INSERT-FIXUP case fires (5 frames). Pedagogically powerful when read alongside `examplebox` 1: same input, different machinery.
- `examplebox` 3 (RB delete): worked deletion trace of the root from an 8-node RB tree, showing all 4 cases of `RB-DELETE-FIXUP` if possible. (If a single 8-node tree doesn't exercise all 4 cases, use two 6-node trees.)

---

## Per-section gap verdicts

For each ch_9 section: **ADD**, **DECIDE**, or **SKIP**. Given ch_9's existing depth, most sections are SKIP — the chapter already covers the technical content thoroughly.

### §9.1 (AVL invariant + Fibonacci bound) — ADD (small)

**Current:** ch_9 covers the AVL property + Fibonacci height bound rigorously. Per Step 1, this is a `defnbox`-heavy section.

**OCW Lec 7 unique contribution:** the **Set + Sequence Data Structure tables** at the very top of Lec 7. ch_9 currently doesn't have a "what is the AVL tree's place in the data-structure family" framing table. The tables are useful framing because they motivate "why bother with AVL" — Binary Tree gives `h`-time everything, but `h` can be `n` in the worst case. AVL gives `log n` everywhere by maintaining `h = O(log n)`.

**Recommendation: ADD** a Set Data Structure operations table as a `tabular` near the top of §9.1, comparing Binary Tree (h-time) vs AVL Tree (log n-time) on `find`, `insert`, `delete`, `find_min/max`, `find_prev/next`. ~15 lines of TeX. Same idea as ch_7's PQ-Sort framework table — frame the chapter's contribution against the prior baseline.

### §9.2 (rotations) — ADD (small)

**Current:** ch_9 covers rotations with worked walk-throughs (per Step 1, multiple TikZ diagrams in §9.3 walk through rotation cases).

**OCW Lec 7 unique contribution:** the **"Rotations Suffice" theoretical claim** — O(n) rotations can transform any binary tree to any other binary tree with the same traversal order. Proof: repeatedly perform last-possible-right-rotation in traversal order to reach a canonical chain (n-1 rotations), then reverse-rotate to the target. Pure theory; not used algorithmically; but worth a `notebox` because it answers "are rotations powerful enough as a primitive to even possibly maintain balance?" — yes, with O(log n) per operation, not O(n).

**Recommendation: ADD** a `notebox` titled "Rotations are universal" (~12 lines TeX) carrying the claim + proof sketch. Forward-ref ch_11 (B-trees use a different rebalancing primitive — split/merge — which is also universal in the same sense).

### §9.3 + §9.4 (AVL insert/remove, cached-height trick) — SKIP

**Current:** Per Step 1, ch_9 has 7 walk-through TikZ diagrams in §9.3 alone; cached-height trick is explicit; insert and remove are fully worked.

**OCW Lec 7 corresponding content:** Local Rebalance 3 cases, Global Rebalance O(log n) bound, Computing Height augmentation. **All present in ch_9 already.** The OCW 3-case taxonomy (skew of right child = 0 / 1 / −1) is the same as ch_9's LL / LR / RR / RL framing under a different naming convention.

**Recommendation: SKIP** the technical content. **One framing tweak inside §9.4:** the cached-height trick is a specific instance of the **general augmentation framework**. ADD a one-paragraph `notebox` lifting the height-as-augmented-property pattern into the general framework: "state subtree property P, show O(1) maintenance, get amortized maintenance under rotations + leaf-add/leaf-remove for free." This sets up the framework for §9.5+ (red-black uses the same machinery for the colour bit) and for forward-ref to ch_11 (B-tree key-count is also augmented). ~10 lines TeX.

### §9.5–§9.8 (red-black) — SKIP

**Current:** Per Step 1, ch_9 has full RB coverage including 5-rule definition, black-height proof, bit-stealing trick, 5-case insertion fixup, 6-case removal prepare, CLRS-divergence note. §9.8 alone has 11 listings.

**OCW lec7 doesn't cover red-black** (Lec 7 is AVL only). CLRS Ch 13 is the canonical reference and ch_9 already cites the divergences from CLRS notation explicitly.

**Recommendation: SKIP** content adds. **One framing tweak:** the existing §9.8 closing `ideabox` (line 1571) becomes the chapter-level closing box per S3 — extend with forward-refs.

### NEW §9.9 — Augmentation framework + applications (Sequence AVL, order-statistic) — ADD

**OCW Lec 7's "Steps to Augment a Binary Tree"** is a meta-pattern that ch_9 currently uses implicitly (height augmentation in AVL, colour-bit augmentation in RB) but doesn't lift into a reusable framework.

**CLRS Ch 14** turns this into a chapter unto itself with two showcase applications (order-statistic trees + interval trees). Worth a brief subsection in ch_9 since the framework is what makes specialised balanced trees cheap.

**Recommendation: ADD a new §9.9 "Augmenting balanced trees"** with:

- A `defnbox` for the framework: "subtree property P; computable from children in O(1); maintained under rotations + leaf operations; 0 asymptotic overhead per operation."
- A worked example: **subtree-size augmentation** for order-statistic queries (`select(k)` returns the k-th smallest; `rank(x)` returns x's index). ~30 lines including a 15-line C++ snippet for the augmentation update on rotation. Cite CLRS §14.1.
- A **Sequence AVL Tree** subsection: same tree, different use case — instead of `find(k)` by key, use `get_at(i)` by index. Shows that AVL trees support both Set and Sequence interfaces depending on which augmentation you maintain. Forward-ref to OCW Lec 7's Sequence-AVL framing. ~20 lines.
- A `notebox` listing other augmentations as homework: interval-min/max for interval trees (CLRS §14.3), subtree-XOR for parity queries, subtree-sum for prefix-sum range queries.

**Estimated add:** ~80 lines of TeX. Connects ch_9 forward to ch_11 (B-tree key-count is the "size" augmentation, generalised).

### NEW §9.10 — AVL Sort + Treap recap if §7.5 stayed in ch_7 — DECIDE

**OCW Lec 7 closes with "AVL Sort":** any Set data structure defines a sorting algorithm via `build` + `iter`. AVL Sort is `O(n log n)` like merge sort and heap sort but produces an in-order traversal of the tree as the sorted output. ch_7's §7.3 PQ-Sort framework table mentioned AVL Sort but didn't go deep.

**Treaps** are in ch_7 §7.5 currently (per the gap-report decision to keep them there with rotations-introduction framing). If the user later moves treaps to ch_9, this is the home.

**Recommendation:**

- **AVL Sort:** ADD a `notebox` (~10 lines) inside §9.4 (AVL section) framing AVL Sort as the third entry in the PQ-Sort family table from ch_7 §7.3. Forward-ref ch_13's sort comparison.
- **Treaps:** **DECIDE — surface to user.** Default: stays in ch_7 §7.5. If user wants, can move here as §9.10 with treap content + a short stub in ch_7 §7.5 pointing here. Default unchanged.

### NEW §9.11 — Production references + further reading — ADD

**Current:** ch_9 cites `std::_Rb_tree_node`, Linux `rbtree.c`, Java `TreeMap` inline (per Step 1). Worth consolidating into a closing references block.

**Recommendation:** ADD a short `notebox` at end of chapter (just before the closing `ideabox`) listing:

- `std::map` and `std::set` → red-black (libstdc++ `_Rb_tree.h`).
- Linux kernel `include/linux/rbtree.h` + `lib/rbtree.c` — kernel scheduling, memory management.
- Java `java.util.TreeMap` → red-black.
- Boost `boost::intrusive::avl_set` → AVL (rare in production C++ but used).
- Erlang `gb_sets` / `gb_trees` → general balanced trees (a different scheme).
- CLRS Ch 13 (RB), Ch 14 (Augmentation), problem 13-3 (AVL), problem 13-4 (treaps).
- OCW 6.006 Lec 7 (AVL conceptual treatment).

~15 lines of TeX.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3) | Re-frame existing line-1571 ideabox with forward-refs | ~10 |
| Throughout (S4) | 3 `examplebox` worked traces (AVL insert, RB insert, RB delete) | ~80 |
| §9.1 typo fix (S0.1) | Comment cleanup | ~3 |
| §9.4 typo fix (S0.2) | `Zchapter 6.6` → correct ref | ~2 |
| §9.1 | Set Data Structure framing table | ~15 |
| §9.2 | "Rotations are universal" theoretical notebox | ~12 |
| §9.4 | Augmentation-framework framing notebox | ~10 |
| §9.4 | AVL Sort notebox | ~10 |
| NEW §9.9 | Augmentation framework + Sequence AVL + order-statistic | ~80 |
| NEW §9.11 | Production references notebox | ~15 |
| **Total** | | **~277** |

ch_9 grows from 1575 → ~1850 lines, 31 → ~35–37 pages. Smaller delta than ch_7's because ch_9 was already deep.

## Open decisions for the user

1. **Treaps**: keep in ch_7 §7.5 (default) or move to a new ch_9 §9.10? Default: keep in ch_7 with the rotations-introduction framing. **No change unless user redirects.**
2. **Closing `ideabox` (S3)**: re-frame existing line-1571 ideabox in place (default), or add a new one as a separate closing block? Default: re-frame in place.
3. **§9.9 Sequence AVL depth**: brief subsection (default, ~20 lines) or full section with index-arithmetic worked example? Default: brief. The "AVL trees support both Set and Sequence interfaces" point is the load-bearing thing; full implementation depth would duplicate ch_4's vector content.

Defaults apply per `feedback_chapter_review_autonomy.md`.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_9/lectures.tex`) lands in this order:

1. Apply S0.1 + S0.2 typo fixes (housekeeping).
2. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
3. Add §9.1 Set Data Structure framing table.
4. Add §9.2 "Rotations are universal" notebox.
5. Add §9.4 augmentation-framework framing notebox + AVL Sort notebox.
6. Add NEW §9.9 (augmentation framework + Sequence AVL + order-statistic).
7. Add NEW §9.11 (production references notebox).
8. Sprinkle the 3 `examplebox` worked traces (S4) across §9.3 (AVL insert) / §9.6 (RB insert) / §9.7 (RB delete).
9. Re-frame the existing §9.8 line-1571 closing `ideabox` with forward-refs (S3).
10. `pdflatex -halt-on-error chapters/ch_9/lectures.tex` two passes — both must exit 0.
11. CHANGELOG entry.

Step 3 happens via builder subagent against this contract.
