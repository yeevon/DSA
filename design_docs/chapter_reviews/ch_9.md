# Chapter 9 — As-Is Review

**Scope:** `chapters/ch_9/lectures.tex` (1575 lines) + `chapters/ch_9/notes.tex` (145 lines). `practice.md` excluded per Phase-4 deferral.

**Purpose:** Step 1 of the per-chapter loop. Inventory of what's currently in ch_9 — topics, depth, callouts, mastery checklist (if any), cross-references — so Step 2 (CLRS + OCW gap analysis) has a baseline to compare against. **No augmentation suggestions in this doc.**

**Subtitle (from `\title`):** *Balanced Search Trees: AVL and Red-Black*

**Source coupling:** ch_9 is one of the **optional / post-SNHU** chapters (the SNHU-required arc covers ch_1–ch_6). Like ch_7, the framing is **depth-first algorithm exposition** — derive the invariant, prove the height bound, then implement the rebalancing primitives. C++ is the implementation language but is no longer the subject. The 40-page `lectures.pdf` ceiling is **waived for optional chapters** under the post-2026-04-25 framing — ch_9 ships at 31 pp / 1575 source lines, well above the SNHU-arc ceiling but consistent with the deep-coverage register the optional chapters now use. CLRS-style reasoning (Fibonacci recurrence on minimum AVL trees, black-height invariant proof, named-case rebalancing taxonomies) is the dominant register.

---

## Chapter map

**Structural note — no opening `ideabox`.** Like ch_7, ch_9 does not open with a "Where this sits / toolkit additions / mastery checklist" `ideabox`. The chapter dives directly into §9.1 with a one-paragraph orienting prose lead that names the problem (BST collapse on sorted input from Ch~6, treap fix from Ch~7.5) and the solution being introduced (AVL — Adelson-Velsky and Landis 1962, the first self-balancing BST published).

**No mastery checklist.** Likewise absent. ch_1–ch_6 each ship a numbered mastery checklist in the opening `ideabox`; ch_9 ships none. Step 2 will need to decide whether one belongs.

**Implicit chapter map (read off the section headings + the §9.1 "Road map" subsection at line 139):**
- §9.1 AVL: invariant definition, balance-factor formula, Fibonacci height bound, stored-height trick, why $\pm 1$ and not something else.
- §9.2 Rotations: left + right primitives, utility helpers (update-height / set-child / replace-child / balance-factor), the `avlRebalance` procedure, the four imbalance cases.
- §9.3 AVL Insertion: BST descent + retrace pattern, four-case taxonomy, Left-Left + Left-Right walk-throughs, full code, cost.
- §9.4 AVL Removal: BST-remove + retrace, two-children shortcut, why removal can cascade $O(\log n)$ rotations, walk-throughs, implementation pitfalls.
- §9.5 Red-Black Trees: five rules, height bound proof, validation example + counterexample, bit-stealing trick.
- §9.6 Red-Black Rotations: same primitive as AVL, no height update needed, side-by-side comparison.
- §9.7 Red-Black Insertion: five named cases (root / parent-black / red-uncle / zig-zag / zig-zig), full fix-up loop, worked sequence.
- §9.8 Red-Black Removal: six named cases (trivially-removable / red-sibling / push-deficit-up / parent-red-swap / zig-zag-straighten / mirror-zig-zag), fall-through rotation, cost analysis.

**Forward refs / looking back:** §9.1 references Ch~6 BST nightmare and Ch~7.5 treap probabilistic fix; §9.2 explicitly references Ch~7.5 ("Rotations were teased in chapter 7.5 with treaps -- same operation, different trigger"); §9.3 references §6.5 raw-BST insert; §9.4 references §6.6 BST-removal four-case algorithm. No dedicated end-of-chapter "looking forward / looking back" `ideabox` (see Closing material below).

---

## Section-by-section inventory (`lectures.tex`)

Legend for "Callouts": `D` = `defnbox`, `I` = `ideabox`, `W` = `warnbox`, `E` = `examplebox`, `N` = `notebox`. Counts are exact.

### 9.1 AVL: The Balanced BST — lines 11–146
- **Subsections (`\subsection*`):** Is it an AVL tree? Check every node. · Height guarantee · Storing height at each node · Updating heights after a change · Why this invariant, and not something else? · Road map for chapter 9
- **Callouts:** D×2, I×1, W×1, E×0, N×0
- **Code listings (`lstlisting`):** 1 — `AVLNode<T>` struct + `height(...)` accessor + `balanceFactor(...)` (templated, parent pointer + cached int height field).
- **Tables (`tabular`):** 1 — 3-row min-height (perfect) vs AVL max-height comparison at $n = 10^3, 10^6, 10^9$.
- **TikZ figures:** 3 — (1) valid AVL example (root 50, leaves 20, 40, 70); (2) invalid example with red-bordered root (50 has bf $= 3$); (3) labeled rectangle-node tree showing height-cache update after insert 55 under 47.
- **Topics:** AVL formal definition with height-balance property; balance factor $\text{bf}(n) = h(\text{left}) - h(\text{right}) \in \{-1, 0, +1\}$; null-subtree-height $= -1$ convention (cited as "same convention as section 6.8"); per-node validation requirement (no eyeballing globally); Fibonacci recurrence $N(h) = N(h-1) + N(h-2) + 1$ for the minimum AVL tree at height $h$; height bound $h \le 1.44 \log_2(n+2)$ with the "1.44× theoretical minimum" framing; comparison table showing 43-comparison worst case at $n = 10^9$; cached-height-as-AVL-prerequisite argument (recomputing height naively is $O(n)$, unaffordable per insert); templated `AVLNode<T>` with `parent` pointer "usually wanted for retrace (section 9.3)"; height-update rule $h(X) = 1 + \max(h(L), h(R))$ with early-exit optimization ("stop as soon as you reach an ancestor whose height didn't change"); concrete insert-55-under-47 cascade trace; "differ-by-at-most-1" as the unique sweet spot (stricter is impossible, looser slows search); preview of red-black weaker invariant ($\sim 2 \log n$ vs $1.44 \log n$); `std::map` red-black mention; chapter §9.2–§9.7 road map; closing `warnbox` against conflating AVL balance factor with red-black colors.
- **Cross-references:** "Chapter 6 laid out the dream... and the nightmare" (line 13); "Chapter 7.5 showed a probabilistic fix with treaps" (line 13); "Same convention as section 6.8" (line 19); "section 9.3" (line 87, retrace forward ref); "section 9.8, sort of -- the main chapter focuses on AVL" (line 137 — note this contradicts §9.5–§9.8 actually being substantial red-black coverage; the prose was written when red-black was a teaser).
- **Depth markers:** Fibonacci-recurrence height proof sketched (not full derivation, but the recurrence is named). Quantitative billion-key worst-case (43 comparisons). Explicit reasoning for *why* $\pm 1$ vs $0$ vs $\pm 2$ is the right strictness.

### 9.2 Rotations: The Only Primitive AVL Needs — lines 147–369
- **Subsections:** Right rotation · Left rotation · Utility: update-height, set-child, replace-child, balance-factor · Right rotation algorithm · Left rotation algorithm · The rebalance procedure · The four imbalance cases · Why rotations alone are sufficient
- **Callouts:** D×1, I×1, W×1, E×0, N×0
- **Code listings:** 4 — (1) `avlUpdateHeight` + `avlBalance` + `avlSetChild` + `avlReplaceChild` housekeeping helpers; (2) `avlRotateRight` (3-pointer rewire, returns new subtree root); (3) `avlRotateLeft` (mirror); (4) `avlRebalance` (six-line procedure that detects all four cases via balance-factor sign-checks).
- **Tables:** 1 — 4-row LL/LR/RR/RL imbalance taxonomy (trigger balance factors + fix).
- **TikZ figures:** 6 — (1, 2) right-rotation at $D$ before/after with $D, B, A, C, E$ nodes; (3, 4) generalized right-rotation with $T_1, T_2, T_3$ subtree boxes; (5, 6) left-rotation at $B$ before/after with subtree boxes.
- **Topics:** Rotation formal definition (BST-order-preserving local subtree reshape); rotation triggered in treaps by priority violation, in AVL by bf $= \pm 2$ — same primitive; right-rotation precondition (left child non-null); in-order sequence preservation proof ($A, B, C, D, E$ before and after); generalization to subtrees ($T_1, T_2, T_3$ ride along unchanged → $O(1)$ per rotation); four-thing checklist `avlSetChild` does (parent's child slot + child's parent pointer + slot selection + height recompute) with "bug eventually" warning if inlined; six-line `avlRebalance` body; double-rotation detection via "child's bf has opposite sign from parent's"; LL/LR/RR/RL "straight vs zig-zag" distinction; "you don't name cases in code -- the balance factors pick the right rotation(s) automatically" closing `ideabox`; rotations-locally-update-heights-but-caller-must-continue-retrace `warnbox`; closing rationale on why rotations alone are sufficient (AVL's tight invariant means violations are at most height-two deep → grandparent-parent-child trio always suffices).
- **Cross-references:** Section 9.1 (`AVLNode<T>` struct, cached height field); section 9.3 ("or wherever the insert algorithm lives"); chapter 7.5 ("Rotations were teased in chapter 7.5 with treaps").
- **Depth markers:** In-order preservation walked through symbolically. Four-cases-collapsed-into-six-lines-of-code claim with the actual code shown. "Two rotations for any imbalance" theorem stated (proof gestured at, not formalized).

### 9.3 AVL Insertion — lines 370–605
- **Subsections:** Retrace: what changes when · The four insertion cases (by imbalance shape) · Left-Left example · Left-Right example (the double-rotation case) · The insertion algorithm, with retrace · Cost · Why the ``first unbalanced ancestor'' is enough · Phone book: why AVL matters
- **Callouts:** D×1, I×1, W×1, E×0, N×0
- **Code listings:** 1 — full `avlInsert` (BST descent loop + retrace `for (n = node->parent; n; n = n->parent) avlRebalance(...)`).
- **Tables:** 2 — (1) 4-row LL/LR/RR/RL insertion-case table (shape / signal / fix); (2) 3-row cost table (BST descent / retrace / per-ancestor rebalance) summing to $O(\log n)$.
- **TikZ figures:** 7 — (1, 2, 3) Left-Left walk-through: before insert 12 / after insert 12 with red-bordered violating root / after right-rotate fix; (4, 5, 6, 7) Left-Right walk-through: before insert 38 / after insert 38 / after step-1 left-rotate at 30 (intermediate Left-Left state) / after step-2 right-rotate at 50 final balanced state.
- **Topics:** Three-step AVL-insertion definition (BST insert → retrace → rebalance on first $\pm 2$ ancestor); cascading-height behavior on retrace (height stops propagating at first ancestor whose height didn't change, but balance-factor checks continue all the way up); "walk to root, call avlRebalance everywhere" canonical recipe rationale; LL/LR/RR/RL insertion-case taxonomy (mirroring §9.2's rebalance taxonomy); concrete Left-Left walk-through inserting 12 → 40-rooted tree, single right-rotate fix; concrete Left-Right walk-through inserting 38 → 50-rooted tree, double-rotation fix (left at 30, then right at 50); full templated `avlInsert` code with phase-1 BST insertion + phase-2 retrace; inline comment on parent-pointer consistency through rotations; equal-key handling sends to right subtree (with a "not stable" warning); cost table summing to $O(\log n)$, $O(1)$ aux space; "first unbalanced ancestor restores everywhere" theorem stated (not proved, "worth knowing"); insertion's "rebalancing freebie" vs removal cascade contrast; descend-with-intent / ascend-to-repair pattern as the pattern shared with red-black insert + B-tree split + persistent DS (closing `ideabox`); phone-book-from-sorted-input motivating example (raw BST → height $N-1$ catastrophe; AVL → height $\approx \log_2 N$); equal-key-stability warnbox.
- **Cross-references:** Section 9.2 (`avlRebalance` procedure); section 6.5 ("the raw BST insert in section 6.5: identical descent cost").
- **Depth markers:** Both LL and LR worked examples include the *intermediate* state mid-double-rotation, not just before/after. "First unbalanced ancestor" theorem named explicitly. Phone-book sorted-input pathological case cited as the canonical AVL motivator.

### 9.4 AVL Removal — lines 606–778
- **Subsections:** The two-children shortcut · The algorithm · Why removal can cascade · Walk-through: simple rotation after removal · Walk-through: successor case · Cost · Implementation pitfalls
- **Callouts:** D×1, I×1, W×2, E×0, N×1
- **Code listings:** 1 — `avlRemoveNode` (case-1 two-children copy-successor recursion + case-2 root-handling + cases-3-and-4 splice via `avlReplaceChild` + retrace loop) plus `avlRemoveKey` wrapper using `bstSearch`.
- **Tables:** 1 — 3-row cost table (BST search+remove / retrace / rotations-along-retrace) summing to $O(\log n)$.
- **TikZ figures:** 4 — (1, 2) simple-rotation walk-through removing 93 from 21-rooted tree, before / after right-rotate at 21; (3, 4) successor-case walk-through removing 84 from 84-rooted tree, before / after copy-89-data-and-remove-leaf-89.
- **Topics:** Removal's worse-rotation-count vs insertion ($O(\log n)$ vs at-most-2); three-step AVL-removal definition (BST-remove → retrace → continue-to-root); two-children-via-in-order-successor reduction (successor has $\le 1$ child → recursive call lands in leaf or one-child case → rebalance handles itself); full `avlRemoveNode` code with the four BST-removal cases collapsed (two-children recurses; root + non-root both splice via `avlReplaceChild`); "retrace walks all the way to root, can't stop at first fix" emphasis; cascading-rotation rationale (single rotation can shorten subtree by 1 → expose new imbalance one level up → propagate); concrete simple-rotation walk-through (remove 93 → bf$(21) = 2$ → Left-Left because bf$(10) = 0 \ge 0$ → right-rotate); concrete successor walk-through (remove 84 → copy 89's data → remove leaf 89 → no rotations needed); cost table; "insertion freebie vs removal cascade asymmetry" closing `ideabox`, framed as "fundamental to self-balancing trees; red-black has it too as black-height-decreased-by-one"; two implementation-pitfall warnboxes (don't-stop-at-first-rotated-ancestor; save-parent-pointer-before-delete-or-dereference-freed-memory); production-bug-density notebox advocating an invariant-checking test suite.
- **Cross-references:** Chapter 6 ("the standard four-case algorithm from chapter 6"); section 6.6 referenced by name ("Zchapter 6.6 showed" — line 620, typo "Zchapter"); section 9.2 (`avlReplaceChild` reused).
- **Depth markers:** Cascading-rotation explanation traces the actual mechanism (rotation reduces height → exposes new imbalance) rather than just citing the bound. Production-debugging advice (build invariant-checking test suite) is practitioner content. Note: line 620 has a typo "Zchapter 6.6" that ships in the rendered PDF; surfaced as an inventory finding, not a recommendation.

### 9.5 Red-Black Trees: A Second Balanced BST — lines 779–908
- **Subsections:** The five rules, one by one · Why five rules? · Example: validating a red-black tree · Counterexample: a red-red violation · The bit-stealing trick · Looking ahead
- **Callouts:** D×2, I×1, W×1, E×0, N×0
- **Code listings:** 0
- **Tables:** 1 — 4-row structure-vs-worst-height-vs-overhead comparison (perfect BBST / AVL / red-black / raw BST).
- **TikZ figures:** 2 — (1) valid red-black example (20 black root, 10 red, 30 red, leaves 5, 15, 25, 40 all black); (2) red-red violation counterexample (10 red with red child 5, both red-bordered).
- **Topics:** Red-black framing as "the other famously self-balancing BST" — `std::map`, `std::set`, Java `TreeMap`, Linux CFS scheduler, "most production ordered-map structures"; AVL-vs-RB three-axis comparison (invariant / rebalancing cost / who uses); five-rule formal definition (every-node-colored / root-black / no-red-red / null-children-are-black-leaves / equal-black-heights); height bound $h \le 2 \log_2(n+1)$ stated and proved at-the-blackboard level (rules 3+5 combined: longest = alternating reds-and-blacks $\le$ 2× shortest = all-black); five-rules walk-through (rule 1 = administrative; rule 2 = convenience for case logic; rule 3 = no-cluster; rule 4 = sentinel; rule 5 = balance); black-height bh$(n)$ formal definition; perfect / AVL / RB / raw-BST height + per-node-overhead comparison table with "1 color bit usually stolen from pointer" depth claim; AVL-vs-RB practitioner rationale (color bit < int height field, RB needs fewer rotations, RB amortized cost lower on mixed workloads); valid-RB worked validation walking through all 5 rules on the example tree; red-red counterexample; bit-stealing trick (`uintptr_t(parent) | 1` for red, mask for black, "standard technique in `std::_Rb_tree_node`"); "minimal set forcing $O(\log n)$ height with weakest constraints" closing `ideabox`; insertion-cases-preview / removal-cases-preview pointers to §9.6–§9.8; understand-rules-don't-memorize closing warnbox.
- **Cross-references:** Chapter 9.1 (AVL invariant contrast); §9.6, §9.7, §9.8 forward refs.
- **Depth markers:** Bit-stealing pointer-tag trick is real production-implementation depth, with the actual `std::_Rb_tree_node` reference. Height-bound proof is given inline, not deferred. Rule-by-rule rationale ("derive don't memorize") is the CLRS register.

### 9.6 Red-Black Rotations — lines 909–1053
- **Subsections:** Utility helpers · Left rotation algorithm · Right rotation algorithm · Side-by-side with AVL rotation · Example: a rotation as standalone visualization · When rotations alone aren't enough
- **Callouts:** D×1, I×1, W×1, E×0, N×1
- **Code listings:** 3 — (1) `Color` enum + `RBNode<T>` struct + `rbSetChild` + `rbReplaceChild` (no `avlUpdateHeight` analog — RB doesn't cache height); (2) `rbRotateLeft` (no height recompute); (3) `rbRotateRight` (mirror).
- **Tables:** 1 — 5-row AVL-vs-RB rotation side-by-side (pointer rewires / cached field / trigger / preserves BST ordering / preserves balance).
- **TikZ figures:** 2 — (1, 2) left-rotation at $X$ before/after with $X, Y, A, B, C$ subtrees.
- **Topics:** Rotations identical to AVL mechanically — only differences are auxiliary state (color vs height) and trigger (red-red or black-height violation vs $\pm 2$ bf); colors are *not* rotated — node identities don't change, only edges; precondition (right-rotate needs left child non-null, etc.); helper-signature mirrors AVL's minus the height-update call; full templated `RBNode<T>` with `Color::Red` default ("new nodes default red — see 9.7"); `rbRotateLeft` / `rbRotateRight` 3-pointer-rewire bodies; AVL-vs-RB 5-axis comparison table; standalone-rotation in-order-preservation visual ($A, X, B, Y, C$ before and after); rotations-alone-don't-restore-RB-invariants explanation (rotated red node may violate rule 2 or rule 3) → must combine with explicit recoloring; "rotations change structure, recolorings change color state" framing; "every self-balancing BST ever invented uses rotations" universality `ideabox` (AVL, red-black, splay, weight-balanced, scapegoat, treap, AA-tree, 2-3-4 tree); never-conditionally-skip-rotation warnbox (corrupts black-heights); production-implementations-inline-rotations notebox citing `std::map`, Java `TreeMap`, Linux `rbtree.c` ("Linux's is the cleanest -- one of the best ways to internalize the operations").
- **Cross-references:** Section 9.2 (AVL rotation primitives); section 9.7 (where rotations + recolorings compose).
- **Depth markers:** Cross-structural universality claim (8 named self-balancing BSTs share rotations as the shape primitive). Specific implementation-reading recommendation (Linux `rbtree.c`) is practitioner content.

### 9.7 Red-Black Insertion — lines 1054–1285
- **Subsections:** Why color new nodes red? · Terminology: parent, uncle, grandparent · The five cases · Case 3 in detail: uncle is red · Cases 4 and 5: uncle is black · The full fix-up loop · Cost · A worked insertion sequence
- **Callouts:** D×2, I×1, W×1, E×0, N×1
- **Code listings:** 2 — (1) `rbGrandparent` + `rbUncle` family-relationship helpers; (2) full `rbBalance` fix-up loop (while-true with case 1 root recolor / case 2 parent-black early return / case 3 uncle-red recolor-and-recurse / case 4 zig-zag straightening / case 5 zig-zig final fix) plus `rbInsert` driver.
- **Tables:** 1 — 4-row insertion cost table (BST descent / fix-up loop / rotations-per-insertion / recolorings-per-insertion) summing to $O(\log n)$.
- **TikZ figures:** 5 — (1, 2) case-3 uncle-red recolor before/after ($G$ goes red, $P$ + $U$ go black); (3, 4) case-4 zig-zag straightening ($n$ right child of $P$, $P$ left child of $G$, then left-rotate at $P$ → relabeled into case-5 shape); (5) case-5 final zig-zig fix ($P$ becomes root, $n$ + $G$ red).
- **Topics:** Three-step RB-insert (BST insert → color red → fix-up); rationale for coloring new nodes red (red breaks only rule 3 which is local; black would break rule 5 which cascades globally); parent / grandparent / uncle terminology with formal `defnbox`; family-relationship helpers; five-case taxonomy (case 1 root → black; case 2 parent black → done; case 3 uncle red → recolor-and-recurse; case 4 zig-zag → straighten then case 5; case 5 zig-zig → recolor + rotate $g$); pattern observation ("cases 3 and 5 recolor; cases 4 and 5 rotate; case 3 recurses; cases 4 and 5 terminate $O(1)$"); case-3 recolor walk-through with black-height-preservation argument; case-4 zig-zag straightening with $n$-becomes-$p$ relabel; case-5 zig-zig recolor + right-rotate-at-$g$; full `rbBalance` while-loop with refetch-after-rotation pattern; `rbInsert` driver delegating BST insert + colors red + calls `rbBalance`; cost table — at most 2 rotations regardless of recoloring count, $O(\log n)$ recolorings worst case (case 3 cascade); "case-3 recursion = violation walks up; rotation terminates the cascade; recoloring is workhorse, rotations are cleanup" closing `ideabox`; worked insertion sequence inserting 22, 11, 33, 55, 44 (case 2 / case 2 / case 3 cascade / case 4+5); cases-4-and-5-are-sequential-not-alternative warnbox; preview of removal as "the next section" notebox.
- **Cross-references:** Section 9.6 (`rbRotateLeft`, `rbRotateRight`); chapter 6 (`bstInsert` reused unchanged); section 9.8 (preview).
- **Depth markers:** Black-height preservation argued symbolically through case 3 (path through $P$ and $U$ gain a black, path through $G$ loses one, net zero). Worked five-insertion sequence triggers four of the five cases with explicit color states at each step. AVL-vs-RB rotation-count contrast (RB caps at 2 even with $O(\log n)$ recolorings).

### 9.8 Red-Black Tree: Removal — lines 1286–1573
- **Subsections:** Step 1: High-level remove · Why red is easy, black is hard · Utility functions · Step 2: Prepare-for-removal, the six cases · Why this many cases? · Cost analysis · Putting it all together
- **Callouts:** D×0, I×4, W×2, E×1, N×2
- **Code listings:** 11 — (1) `rbRemove` BST-search + dispatch; (2) `rbRemoveNode` two-children-via-predecessor reduction + black-node-prep-before-bst-remove + `rbPredecessor`; (3) `rbSibling` + `rbIsRed` + `rbIsBlack` + `rbBothChildrenBlack` (null-counts-as-black helpers); (4) `rbPrepareForRemoval` driver with case-by-case dispatch + fall-through rotation; (5) `rbTryCase1` (red node or root → trivially removable); (6) `rbTryCase2` (red sibling → rotate to make black sibling); (7) `rbTryCase3` (parent black + sibling all-black → recolor sibling red + recurse on parent); (8) `rbTryCase4` (parent red + sibling all-black → swap parent + sibling colors); (9) `rbTryCase5` (zig-zag with red inner nephew, $n$ left child → rotate at sibling); (10) `rbTryCase6` (mirror, $n$ right child); (11) full `rbRemove` + `rbRemoveNode` recap.
- **Tables:** 0
- **TikZ figures:** 0
- **Topics:** "Most intricate operation in any RB implementation"; 4-step big-picture `ideabox` (BST-remove with predecessor swap → red-removal-is-free → black-removal-violates-rule-5 → six-case fix-up); `rbRemove` BST-search dispatch; `rbRemoveNode` two-children-via-predecessor recursion; `rbPrepareForRemoval` *runs before* `bstRemove` (order-matters warnbox: need `n` in place to identify sibling/parent/nephews); rule-3-vs-rule-5 vulnerability analysis (rule 3 safe if you replace with the correct child; rule 5 breaks on black-node removal); "double-black token" textbook framing vs the six-case operational view this chapter takes; null-counts-as-black helpers (`rbIsRed`, `rbIsBlack` returns `!n || ...`); six-case dispatcher with terminal (1, 3, 4) vs transitional (2, 5, 6) classification; per-case "what each case is really trying to do" `examplebox` (the only `examplebox` in the chapter); case 1 (red or root → done); case 2 (red sibling → rotate at parent + recolor → falls through to cases 3–6); case 3 (parent + sibling subtree all black → recolor sibling red, recurse on parent — "this is where the $O(\log n)$ cost comes from" `ideabox`); case 4 (parent red + sibling subtree all black → swap parent ↔ sibling colors → done); case 5 (zig-zag, $n$ left child → rotate at sibling); case 6 (mirror); fall-through rotation (sibling inherits parent's color, parent black, outer red nephew black, rotate at parent); CLRS-presents-four-cases-not-six divergence warnbox (textbook treatment varies, operations identical, only bookkeeping differs); cost analysis (BST search $O(\log n)$ + two-children reduction $O(\log n)$ + at-most-3 rotations + case-3 cascade $O(\log n)$ recolorings = $O(\log n)$ total, $O(\log n)$ stack depth — can be iterative with parent pointers); AVL-vs-RB removal contrast notebox ($O(\log n)$ rotations vs at-most-3, "classic reason `std::map` chose red-black"); "BST + bookkeeping; do-the-BST-thing → fix-locally → propagate-one-level-up; insert propagates with uncle-red; removal propagates with case 3" closing chapter-level mental model `ideabox`.
- **Cross-references:** Chapter 6 (`bstSearch`, `bstRemove`); section 9.6 (`rbRotateLeft`, `rbRotateRight`); section 9.7 (insertion case 4 mirror reference).
- **Depth markers:** "Order matters" warnbox makes the prep-before-remove invariant explicit. Case-3-as-the-$O(\log n)$-source `ideabox` isolates *the* cost driver. CLRS-divergence warnbox explicitly tells the reader the case numbering will shift if they cross-reference (real cross-source orientation, not pretending the chapter is canonical). Final closing `ideabox` (line 1571) functions thematically as a chapter-level closer, pulling AVL + RB + insertion + removal under one mental model.

---

## Closing material (after §9.8)

**No closing summary section.** Like ch_7, ch_9 ends with §9.8's terminal `ideabox` and `\end{document}`. No "what this connects to" forward-ref box. No companion-materials line.

**Implicit chapter closer.** The last `ideabox` of §9.8 (line 1571, "The mental model to keep") functions thematically as a chapter-level closer — it explicitly unifies AVL + red-black insert + red-black remove under "BST + bookkeeping, propagate one level up." But it is not labeled or scoped as a chapter-level closer; it's a §9.8 closer that happens to be the last `ideabox` in the chapter.

---

## `notes.tex` (compact reference, 145 lines)

**Layout:** Two-column `multicols`. Title: "Ch.~9 Notes — AVL and Red-Black Trees". Single-page reference, no chapter map, no narrative — definitions, case tables, gotchas.

**Subsections:** Why balanced BSTs · AVL: the invariant · AVL node · Rotations (BST-order-preserving swap) · The four AVL imbalance cases · AVL insert · AVL remove · Red-black: the five rules · RB insertion fix-up, case summary · RB removal (the hard one) · AVL vs.\ red-black · Top gotchas

**Tables:** 2 — (1) 4-row LL/RR/LR/RL AVL imbalance cases (shape / fix); (2) 5-row AVL-vs-RB comparison (height / search / insert / remove / used-by).

**Code listings:** 1 — `AVLNode` struct (key + cached height + left/right/parent pointers).

**Top gotchas (5 listed):**
1. Forgetting to update cached heights after a rotation.
2. Reading balance factor with null children as height $0$ instead of $-1$.
3. Applying rotations at the wrong pivot — read the cases as "name from grandparent down."
4. Treating remove-retrace as "one rotation fixes it" — it can cascade all the way to the root.
5. In RB: forgetting to reset root to black after a case-3 recolor propagates it upward.

**Coverage relative to `lectures.tex`:**
- **Covered:** §9.1 (AVL invariant + height-bound + cached-height + node struct), §9.2 (rotations as BST-order-preserving primitive + LL/RR/LR/RL fix table), §9.3 (insertion two-step + rotation termination), §9.4 (removal two-step + cascade warning), §9.5 (five rules + height bound), §9.7 (RB insertion three named cases — uncle red / uncle black zig-zag / uncle black straight — collapsing the 5 lecture cases into 3), §9.8 (RB removal one-paragraph six-case sketch + double-black token), AVL-vs-RB summary table, top-gotchas list.
- **Not covered (intentionally — out of scope for a quick-reference card):** §9.1 Fibonacci recurrence proof + 1.44 constant + min/AVL height comparison table + per-node validation example + invariant-strictness rationale; §9.2 utility helpers + full rotation code + four-case rebalance procedure; §9.3 worked LL + LR walk-throughs + full insertion code + cost table + first-unbalanced-ancestor theorem + phone-book motivation; §9.4 worked simple-rotation + successor walk-throughs + full removal code + implementation pitfalls; §9.5 valid + counterexample TikZ + bit-stealing trick; §9.6 utility helpers + AVL-vs-RB rotation comparison table + standalone rotation visualization; §9.7 worked five-insert sequence + full `rbBalance` code + cases-4-and-5-sequential warning; §9.8 full six-case implementation + driver + CLRS divergence warning + cost analysis.

**Density:** Quick-reference card — heavy on case tables and the AVL-vs-RB chooser, light on rationale. The RB removal subsection is one paragraph + "six cases (red sibling, black sibling + red-nephew variants, black sibling + black nephews → push deficit up)" — teaser-density compared to its full §9.8 treatment.

---

## Cross-references inside ch_9

- §9.1 → §9.2 (rotations forward), §9.3 (retrace forward, parent pointer rationale), §9.8 ("section 9.8, sort of -- the main chapter focuses on AVL" — line 137; the prose was written when red-black was a teaser, contradicts §9.5–§9.8 actually being four substantial sections).
- §9.2 → §9.1 (`AVLNode<T>` struct + cached height field), §9.3 (retrace caller).
- §9.3 → §9.2 (`avlRebalance` reused).
- §9.4 → §9.2 (`avlReplaceChild` reused), §9.3 (retrace pattern).
- §9.5 → §9.6, §9.7, §9.8 (rotations + insert + remove forward).
- §9.6 → §9.2 (AVL rotation primitives, mechanically identical), §9.7 (where rotations + recolorings compose).
- §9.7 → §9.6 (`rbRotateLeft`, `rbRotateRight`), §9.8 (preview).
- §9.8 → §9.6 (rotation primitives), §9.7 (case-4 mirror reference).

## Forward- / backward-references to other chapters

- **Ch_6 (BSTs):** §9.1 cites Ch~6 BST nightmare on sorted input; §9.1 cites "section 6.8" for null-subtree-height $= -1$ convention; §9.3 contrasts with "the raw BST insert in section 6.5"; §9.4 cites "the standard four-case algorithm from chapter 6" and "Zchapter 6.6" (typo, should be "Chapter 6.6"); §9.7 reuses `bstInsert` from chapter 6; §9.8 reuses `bstSearch` and `bstRemove` from chapter 6.
- **Ch_7 (heaps + treaps):** §9.1 cites "Chapter 7.5 showed a probabilistic fix with treaps"; §9.2 cites "Rotations were teased in chapter 7.5 with treaps -- same operation, different trigger."
- **No forward refs to ch_10+.** ch_9 is a leaf in the chapter dependency graph as it currently sits — closes into itself with no "and next, hash tables" / "and next, graphs" pointer.

---

## Stylistic patterns observed

1. **No per-section closing "big picture" `ideabox`.** Like ch_7. Each section places `ideabox`es at thematic high-points (§9.1 stored-height-makes-AVL-practical; §9.2 balance-factors-pick-the-rotation-automatically; §9.3 descend-with-intent-ascend-to-repair; §9.4 insertion-freebie-vs-removal-cascade-asymmetry; §9.5 minimal-rule-set; §9.6 rotations-are-the-universal-shape-primitive; §9.7 case-3-walks-up-rotation-terminates; §9.8 four `ideabox`es including the chapter-level mental-model closer). 11 `ideabox`es total — denser than ch_7's 5.
2. **Near-zero `examplebox`.** 1 total (§9.8 line 1378, "What each case is really trying to do" per-case english summary). Like ch_7, the chapter prefers inline trace tables + TikZ for worked examples over boxed `examplebox`-style examples. ch_1 has 36 `examplebox`es; ch_9 has 1.
3. **Heavy TikZ for tree diagrams.** 29 TikZ figures — by far the most of any chapter (ch_7 had 8). §9.2 has 6 (rotation generalizations); §9.3 has 7 (LL + LR walk-throughs with intermediate states); §9.7 has 5 (case-3 + case-4 + case-5 walk-throughs); §9.8 has 0 (pure code-and-prose for the six-case removal).
4. **Dense `tabular` use for case taxonomies and cost analyses.** 8 tables across 7 sections (§9.8 has none — its case analysis is per-case prose + the `examplebox`).
5. **CLRS register.** Fibonacci recurrence on minimum AVL trees (§9.1), formal black-height invariant proof (§9.5), CLRS-divergence warnbox in §9.8 acknowledging the textbook treatment fuses removal cases differently — the prose voice is "derive then implement, and tell the reader where other sources differ."
6. **Cross-implementation references.** `std::map` (§9.1, §9.5, §9.8); Java `TreeMap` (§9.5, §9.6); Linux kernel CFS scheduler (§9.5); Linux `rbtree.c` ("the cleanest" production implementation, §9.6); `std::_Rb_tree_node` bit-stealing trick (§9.5). Practitioner-density is high.
7. **Modern C++ depth.** Templated `AVLNode<T>` and `RBNode<T>`, `Color` `enum class`, default member initializers, `nullptr`-checks throughout — beyond the C++-refresher register of ch_1–ch_6.
8. **No mastery checklist, no opening chapter-map `ideabox`.** Both standard ch_1–ch_6 framing devices are absent (matching ch_7).
9. **Insert-vs-remove asymmetry is named explicitly.** Both for AVL (§9.4 closing `ideabox`) and red-black (§9.8 closing notebox cites the rotation-count gap as why `std::map` chose RB). Pattern is treated as a fundamental property of self-balancing trees, not a quirk.
10. **One typo in shipped PDF:** "Zchapter 6.6" at line 620 (§9.4 "The two-children shortcut" subsection). Surfaced as inventory finding.

---

## Counts at a glance

| Metric | Count |
|---|---|
| Sections (numbered 9.1–9.8) | 8 |
| Subsections (`\subsection*`, unnumbered) | 56 |
| `defnbox` (definitions) | 10 |
| `ideabox` (key ideas) | 11 |
| `warnbox` (gotchas) | 10 |
| `examplebox` (worked examples) | 1 |
| `notebox` (asides) | 5 |
| **Total callout boxes** | **37** |
| `lstlisting` (code blocks) | 23 |
| `tabular` (tables) | 8 |
| `tikzpicture` (figures) | 29 |
| Mastery checklist items | 0 (no checklist) |
| Lines (`lectures.tex`) | 1575 |
| Pages (`lectures.pdf`) | 31 |
| Lines (`notes.tex` compact) | 145 |
