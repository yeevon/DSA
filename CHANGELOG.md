# Changelog

All notable changes to this repo, newest first. Includes small ops
(doc tweaks, memory updates, file moves) — not just feature work. The
intent is a complete trail of project activity that an outside reader
(or a returning Claude session) can read top-down to catch up.

Format: dated sections, each entry tagged **Added / Changed / Removed
/ Fixed / Decided / Deferred**. "Decided" captures architectural or
process decisions that don't ship code; "Deferred" captures explicit
non-decisions (a question raised and intentionally postponed).

---

## 2026-04-25

- **Added** **ch_10 OCW augmentation pass (Step 3 of the per-chapter
  review loop, against `design_docs/chapter_reviews/ch_10_gaps.md`).**
  `chapters/ch_10/lectures.tex` 842 → 2048 lines (+1206 lines,
  ~+143% growth --- well over the gap report's ~+730 estimate, in
  line with the ch_7 / ch_9 precedent of every ADD landing at full
  depth rather than summary-only). Page count 18 → 33 (gap-report
  target was ~36-40; ran shorter than ch_9's 41-page final because
  the chapter has lower vocabulary density per algorithm). Optional-
  chapter framing (per `feedback_chapter_review_autonomy.md`
  2026-04-25 update) waives both the 40-page cap and the 3-5
  bounded-additions rule; ch_10 ships everything in the contract.
  **Sections touched:**
  - **Header (S1+S2):** new opening `ideabox` "Chapter map" matching
    ch_1 / ch_7 / ch_9 template --- *Where this sits in CS 300* /
    *What you add to your toolkit* / 7-item *Mastery checklist* /
    *Looking ahead* block with forward refs to ch.~11 (B-trees),
    ch.~12 (set ADT), \S10.16 (A* / Johnson / network flow / planar
    graphs). Existing one-paragraph "Why graphs matter" frame
    retained as a follow-on second `ideabox`. Lines 11-117.
  - **\S10.1 (vocab TikZ):** new "The picture" subsection at end of
    \S10.1 with side-by-side undirected + directed 5-node TikZ
    diagram annotating degree / in-degree / out-degree / source /
    sink in prose underneath. Lines ~165--197.
  - **\S10.3 (adjacency-set notebox):** new `notebox` after
    Kruskal-default `ideabox` contrasting adjacency \emph{set}
    (OCW preference, $O(1)$ expected edge query) vs adjacency
    \emph{list} (chapter default, $O(\deg u)$ edge query) with
    iteration-vs-point-query trade-off. Lines ~284--301.
  - **\S10.5 (BFS):** layer-monotonicity proof in a `notebox`
    (induction on $d$ with explicit base + step), parent-pointer
    BFS-tree subsection with TikZ diagram (6-vertex tree + dotted
    non-tree edges), and `examplebox` worked trace (6 steps,
    \texttt{dist} array + queue state at every pop). Lines
    ~440--540.
  - **\S10.6 (DFS):** edge-classification subsection with 4
    `defnbox`es (tree / back / forward / cross), 7-vertex TikZ
    edge-classification diagram (tree-edge solid / back-edge red
    dashed / forward-edge blue / cross-edge green dotted), and
    cycle-detection-via-back-edge subsection with full C++
    `hasCycle` implementation using tri-state colour. Lines
    ~641--747.
  - **\S10.7 (build-system DAG):** new "The build-system DAG,
    drawn" subsection with 6-target dependency-DAG TikZ + 1-paragraph
    \texttt{make}-/-Bazel / Cargo / Ninja framing including
    parallel-build justification. Lines ~803--839.
  - **\S10.8--\S10.9 (relaxation framing + Dijkstra additions):**
    new "Relaxation: the universal SSSP primitive" subsection in
    \S10.8 (`defnbox` for relaxation + 3-bullet unification of
    DAG-relax / Dijkstra / Bellman-Ford as the same primitive
    under different orderings); negative-edge counterexample TikZ
    (3-node $s$-$a$-$b$ graph with edges $1, 3, -3$) showing the
    greedy-correctness break; 5-node weighted-directed-graph
    Dijkstra trace with TikZ diagram + `examplebox` walking the
    PQ state through 6 steps including the stale-entry skip;
    decrease-key-vs-lazy-deletion `notebox` justifying the
    chapter's choice. Lines ~877--924, ~1011--1123.
  - **\S10.10 (Bellman-Ford):** $|V|-1$-round correctness proof in
    a `notebox` (induction on path length with explicit
    $\delta_k(v)$ definition); worked-trace `examplebox` on a
    4-vertex graph with a negative cycle, showing every relaxation
    in 3 rounds + the $|V|$-th-round detection step. Lines
    ~1167--1268.
  - **\S10.11 (topo cross-link):** new `notebox` connecting
    DFS-based topo sort to \S10.6 edge classification
    (back-edge $\Leftrightarrow$ cycle $\Leftrightarrow$ no topo
    order), framing the production single-pass DFS that emits
    post-order + reports back-edge cycle in one traversal. Lines
    ~1352--1364.
  - **\S10.12 (MST: cut + cycle properties + full Prim + DSU
    notebox):** cut-property and cycle-property `defnbox`es with
    sketched exchange-argument proofs (CLRS Theorems 23.1, 23.2);
    full Prim implementation (~25 lines) with min-heap of
    (weight, outside-vertex, parent) tuples and lazy-deletion
    \texttt{inMST} filter; 6-vertex weighted-graph TikZ diagram
    showing MST edges (heavy tan) vs non-MST edges (thin grey);
    DSU $O(\alpha(n))$ inverse-Ackermann amortised-cost `notebox`
    citing Tarjan 1975 + CLRS Ch~21. Lines ~1422--1601.
  - **\S10.13 (Floyd-Warshall \& relaxation framing):** new closing
    `notebox` reframing Floyd-Warshall as relaxation (DAG-relax /
    Dijkstra / Bellman-Ford / Floyd-Warshall = same primitive,
    four orderings), closing the unification \S10.8 promised. Lines
    ~1685--1697.
  - **NEW \S10.14 (Strongly Connected Components):** SCC + DAG-of-
    SCCs `defnbox`, "preprocessing for every directed-reachability
    problem" `ideabox`, full Kosaraju implementation (~30 lines C++
    with two DFS passes + transpose construction), Tarjan-summary
    `notebox` citing CLRS \S22.5, 6-vertex TikZ showing 3 SCCs +
    3-vertex condensation DAG diagram, applications subsection
    covering 2-SAT solving (implication graph, "no $x$ and $\neg x$
    in same SCC") and dependency-cycle detection in Cargo / npm /
    pip. Lines ~1699--1877.
  - **NEW \S10.15 (master decision table):** single big algorithm-
    selection \texttt{tabular} (rows = problem-types, columns =
    graph-properties), wrapped in \resizebox to fit page; covers
    SSSP / single-pair / APSP / negative-cycle-detection /
    topological-sort / directed-cycle-detection / SCC /
    connectivity / MST. Forward-ref'd from chapter map + mastery
    checklist. Lines ~1879--1951.
  - **NEW \S10.16 (forward direction):** single closing `notebox`
    covering A* (admissibility / consistency, Russell-Norvig + CLRS
    \S24.5 ref), Johnson's algorithm (sparse APSP via Bellman-Ford
    reweighting + $V$-Dijkstras, CLRS \S25.3), network flow (Ford-
    Fulkerson + Edmonds-Karp $O(VE^2)$, CLRS Ch~26), planar graphs
    (4-colour theorem, Hopcroft-Tarjan 1974 planarity testing,
    \texttt{boost::graph::boyer\_myrvold\_planarity\_test}). No
    full implementations --- pointer-only, same role as ch_7
    \S7.7's Fibonacci-heap forward ref. Lines ~1953--2017.
  - **\S10.13 closing `ideabox` re-framed in place per S3 default:**
    Prim added to the unification list (was conspicuously absent in
    the original); new "Looking ahead" forward-refs paragraph
    pointing at ch.~11 (B-trees as shallow-and-wide alternative,
    filesystem block-layout framing), ch.~12 (set ADT, framing the
    \texttt{visited} / \texttt{discovered} / \texttt{inMST} /
    \texttt{assigned} flags as set-ADT operations), and \S10.16
    (forward direction beyond cs-300). Lines ~2020--2046.
  - **TikZ preamble (`notes-style.tex`):** added a small
    \texttt{\textbackslash usetikzlibrary\{arrows.meta, positioning,
    calc\}} + \texttt{\textbackslash tikzset} block defining
    \texttt{vertex} (circle, draw), \texttt{vsource} (vertex with
    \texttt{ideaBack} fill), \texttt{vdone} (vertex with
    \texttt{defnBack} fill), \texttt{edge} (Stealth arrow),
    \texttt{uedge} (undirected), \texttt{treeedge} /
    \texttt{backedge} (red dashed) / \texttt{fwdedge} (blue) /
    \texttt{crossedge} (green dotted), \texttt{mstedge} (heavy tan).
    Replaces ch_9's per-figure inline overrides for general directed
    graphs. tcolorbox\texttt{[most]} already loads tikz; we just add
    libraries + styles. ch_9's tree-style inline overrides are
    unaffected.
  Two `pdflatex` passes (`-halt-on-error -interaction=nonstopmode`)
  both exit 0; final `lectures.pdf` is 33 pages, 656250 bytes.
  Six TikZ figures landed (vocab-undirected/directed pair, BFS tree,
  DFS edge classification, build-system DAG, Dijkstra
  counterexample, Dijkstra trace, MST, SCC + condensation pair).
  Three new exampleboxes (BFS trace, Dijkstra trace, Bellman-Ford
  trace with negative cycle). Two new sections (\S10.14 SCC,
  \S10.15 decision table, \S10.16 forward direction). Dep audit:
  skipped --- no manifest changes.

- **Added** **ch_11 OCW augmentation pass (Step 3 of the per-chapter
  review loop, against `design_docs/chapter_reviews/ch_11_gaps.md`).**
  `chapters/ch_11/lectures.tex` 432 → 1607 lines (+1175 lines,
  ~+272% growth --- well over the gap report's ~+583 estimate, in
  line with the ch_7 / ch_9 / ch_10 precedent of every ADD landing
  at full depth rather than summary-only). `chapters/ch_11/notes.tex`
  142 → 149 lines (+7 lines, S0.2 alignment only). Page count
  9 → 25 (gap-report target was ~22-25). Optional-chapter framing
  (per `feedback_chapter_review_autonomy.md` 2026-04-25 update)
  waives both the 40-page cap and the 3-5 bounded-additions rule.
  Defaults applied on all three DECIDE items in the gap report
  (notes.tex full templated alignment; B+ half-section; 2-3-4 $\leftrightarrow$
  red-black notebox-only). Primary source: \textbf{CLRS Ch.~18}
  (OCW 6.006 Spring 2020 does not cover B-trees).
  **Sections touched:**
  - **Header (S1+S2):** new opening `ideabox` "Chapter map" matching
    ch_1 / ch_7 / ch_9 / ch_10 template --- *Where this sits in
    CS 300* (shallow-and-wide tree register vs ch.~9's balanced
    binary trees; memory-hierarchy motivation), *What you add to
    your toolkit* (minimum-degree $t$ / order $K$ bridge,
    height bound, preemptive split, preemptive merge, B+ trees,
    production-where-they-show-up enumeration), 7-item *Mastery
    checklist*, *Looking ahead* paragraph (forward-refs to ch.~12
    set ADT + \S11.6 + \S11.7). Existing one-paragraph "Why
    B-trees exist" frame retained as a follow-on second `ideabox`.
    Lines 11--98.
  - **S0 housekeeping (all four items landed):**
    - \textbf{S0.1.} `defnbox` minimum-occupancy floor clause added
      ($\lceil K/2 \rceil - 1$ keys minimum on non-root nodes,
      root exception called out in a new follow-on `notebox`).
    - \textbf{S0.2.} `notes.tex` skeleton aligned with lectures.tex's
      templated `BTreeNode<Order>` form (replaces the previous
      `std::vector`-based `BTNode`); annotated to call out the
      compile-time-fanout vs heap-pointer-indirection trade.
    - \textbf{S0.3.} New "Helper primitives" `lstlisting` block in
      \S11.1 implementing `indexOfKey` / `containsKey` /
      `btreeChildForKey` / `btreeInsertIntoLeaf` /
      `btreeInsertKeyWithChildren` / `removeKey` / `btreeGetMinKey`
      with brief but runnable-shape bodies. Listings later in the
      chapter call into these as black-box primitives.
    - \textbf{S0.4.} \S11.5 closing chapter-takeaway `ideabox`
      rewritten to enumerate the four sub-algorithms (search /
      preemptive-split insert / preemptive-merge remove /
      rotation+fusion) per the ch_10 unification convention; new
      "Looking ahead" forward-refs paragraph pointing at ch.~12
      (set ADT, B-tree / B+ tree as disk-side implementation
      choice) and \S11.6 (forward direction beyond cs-300).
  - **\S11.1 (CLRS-register augmentation):** new `notebox` bridging
    CLRS minimum-degree $t$ to chapter's order $K$ ($K = 2t$,
    bounds translation); new `defnbox` for the height bound
    $h \le \log_t \frac{n+1}{2}$ with worst-case-occupancy proof
    sketch (CLRS Theorem 18.1); new `defnbox` for the disk-access
    model (DAM) + `notebox` with concrete sizing examples (1\,KB /
    4\,KB / 16\,KB pages, 64-byte cache-line for in-memory
    B-trees); new "A 3-level B-tree of order 4 --- the running
    picture" subsection with TikZ diagram (root + 2 internal +
    6 leaves, 16 keys total) annotated to read off all five
    structural invariants on the picture.
  - **\S11.2 (CLRS-register augmentation):** new "B-TREE-SEARCH ---
    the general form" subsection with templated recursive C++
    implementation generalising the existing 2-3-4-special
    listing; in-node linear-vs-binary scan choice called out in a
    `notebox` with a binary-search-within-node listing; new
    "Cost --- CPU vs disk decomposition" subsection with a
    4-row tabular separating disk reads from CPU comparisons and
    showing that B-tree CPU equals balanced-binary-tree CPU when
    binary in-node search is used.
  - **\S11.3 (CLRS-register augmentation):** new "Why preemptive
    top-down?" `notebox` justifying the single-pass invariant
    over Knuth's bottom-up; new "B-TREE-SPLIT-CHILD --- the CLRS
    form" subsection with templated implementation generalising
    the order-4 `btreeSplit`; new "B-TREE-INSERT-NONFULL ---
    the recursive descent" subsection with both
    `btreeInsertNonFull` and the public `btreeInsertCLRS` that
    handles root-split. New "Preemptive split during descent ---
    before / after" TikZ diagram showing the descent move
    (full child split before entering, median promoted, descent
    target picked from the two halves). New `examplebox` worked
    insert sequence (10, 20, 30, 40, 5, 15, 25, 35, 45 into an
    empty $K=4$ tree, 6 frames, two splits including the
    root-split height-growth event).
  - **\S11.4 (CLRS-register augmentation):** new "The CLRS 4-case
    deletion taxonomy" subsection formalising what was previously
    scattered prose --- structured `defnbox` covering case 1
    (key in leaf), case 2 (key in internal: 2a predecessor, 2b
    successor, 2c fuse children), case 3 (key not in current
    node: 3a rotate-from-sibling, 3b fuse-with-sibling), and the
    root-fusion height-shrink special case. New "Why preemptive
    merge during descent?" `notebox` (mirror of the preemptive-
    split argument). New "Picture: rotation from sibling vs.\
    fusion with sibling" TikZ subsection with paired before /
    after diagrams of cases 3a and 3b on the same starting
    configuration.
  - **\S11.5 (B+ expansion + 4-case examplebox):** "B+ trees ---
    the production refinement" `notebox` expanded to a half-section
    with `defnbox` (formal B+ definition: data-only-at-leaves,
    linked-list-of-leaves, higher fanout via routing-keys-only
    internal nodes), B-tree-vs-B+ comparison `tabular`
    (8 rows: data location, routing duplication, fanout, range
    scan, sequential scan, point-query depth, production use,
    insert/delete invariance), side-by-side TikZ diagram showing
    where data lives + the leaf-level forward link via dashed
    arrow, and a "Why B+ wins for databases" `notebox` framing
    range-query cost as $O(R)$ vs $O(R \log_K n)$ on classic
    B-trees. New `examplebox` worked deletion trace exercising
    all four CLRS cases on a populated $K = 4$ tree (delete 50,
    20, 5, 10, 25, 35, 40 across 7 frames, hitting cases 1 / 2a /
    3a / 2b / 3a / 3b in sequence with explicit case labels).
  - **NEW \S11.6 (Memory hierarchy and B-tree variants):**
    2-3-4 $\leftrightarrow$ red-black-tree equivalence `notebox`
    (the CLRS Ch.~13 problem-13-4 correspondence; explains why
    ch.~9 RB insert/delete had so many cases --- the 2-3-4
    algorithm in disguise); cache-oblivious-B-trees `notebox`
    (van Emde Boas layout, Bender-Demaine-Farach-Colton 2000);
    LSM-trees `notebox` (O'Neil et al. 1996, write-vs-read tradeoff,
    LevelDB / RocksDB / Cassandra / HBase / ScyllaDB production
    refs); fractal-trees / Bw-trees / copy-on-write-B-trees
    `notebox` (TokuDB, Microsoft Hekaton, Btrfs / ZFS).
  - **NEW \S11.7 (Production references and further reading):**
    single closing `notebox` covering SQLite (B+, 4096-byte page
    default), PostgreSQL (`btree` access method + Lehman-Yao
    right-link concurrency), MySQL InnoDB (clustered B+ on
    primary key, 16\,KB page default), Linux ext4 (htree),
    Btrfs (copy-on-write B+ throughout), git packfile (.idx ---
    sorted-array contrast, not B-tree), LSM-tree-on-top engines.
    Followed by canonical-references list: CLRS Ch.~18, Graefe
    "Modern B-Tree Techniques" (2010), Knuth TAOCP vol.~3 \S6.2.4,
    Bender-Demaine-Farach-Colton 2000, Bayer-McCreight 1972
    original.
  - **Closing chapter-takeaway \S11.5 `ideabox` rewritten in place
    per S3 + S0.4 default:** sub-algorithms enumerated (search /
    preemptive-split insert / preemptive-merge remove / rotation
    + fusion as the four moves the chapter unifies under); new
    "Looking ahead" forward-refs paragraph pointing at ch.~12
    (set ADT) and \S11.6 / \S11.7 (forward direction +
    canonical references).
  Two `pdflatex` passes (`-halt-on-error -interaction=nonstopmode`)
  both exit 0; final `lectures.pdf` is 25 pages, 512209 bytes.
  Five TikZ figures landed (1 baseline order-4 split TikZ retained;
  4 new: 3-level $K=4$ tree in \S11.1, preemptive-split before/after
  in \S11.3, paired rotation-vs-fusion (cases 3a / 3b) in \S11.4,
  B-tree-vs-B+ comparison in \S11.5). Three exampleboxes (1
  baseline "Where B-trees actually live"; 2 new: insert-sequence
  trace in \S11.3, 4-case deletion trace in \S11.5). Two new
  sections (\S11.6 Memory hierarchy + variants, \S11.7 Production
  references). CLRS 4-case deletion taxonomy formalised as a
  structured `defnbox` (cases 1 / 2a / 2b / 2c / 3a / 3b + root-
  fusion). Dep audit: skipped --- no manifest changes.

- **Added** **ch_9 OCW augmentation pass (Step 3 of the per-chapter
  review loop, against `design_docs/chapter_reviews/ch_9_gaps.md`).**
  `chapters/ch_9/lectures.tex` 1575 → 2309 lines (+734 lines,
  ~+47% growth — over the gap report's ~+277 estimate, in line with
  ch_7's pattern of every ADD landing at full depth rather than
  summary-only). Page count 31 → 41
  (gap-report target was ~35–37; the three worked exampleboxes +
  the §9.9 augmentation framework section + the closing-ideabox
  forward-refs block all expanded under the load). Optional-chapter
  framing (per `feedback_chapter_review_autonomy.md` 2026-04-25
  update) waives both the 40-page cap and the 3–5 bounded-additions
  rule; ch_9 ships everything in the contract. **Sections touched:**
  - **Header (S1+S2):** new opening `ideabox` "Chapter map" matching
    ch_1 / ch_7 template — *Where this sits in CS 300* / *What you
    add to your toolkit* / 7-item *Mastery checklist* / *Looking
    ahead* block with forward refs to ch_10 (BFS / Dijkstra trees),
    ch_11 (B-trees as shallow-and-wide alternative), ch_12 (set ADT —
    `std::set` is RB). Lines 11–112.
  - **§9.1 (S0.1 typo fix + Set Data Structure framing table):**
    line 137 (original) `"section 9.8, sort of -- the main chapter
    focuses on AVL"` rewritten to accurate `\S9.1--\S9.4 AVL,
    \S9.5--\S9.8 red-black` framing. New "Why bother: the Set Data
    Structure interface" subsection with `tabular` comparing plain
    BST (h-time) vs AVL (log n-time) on `build` / `find` / `insert` /
    `delete` / `find_min/max` / `find_prev/next` -- per OCW Lec 7
    framing. Lines ~155–186.
  - **§9.2 (Rotations are universal notebox):** new `notebox` after
    "The four imbalance cases" subsection carrying the OCW Lec 7
    "O(n) rotations transform any binary tree to any other with same
    in-order sequence" claim + canonical-chain proof sketch, with
    forward-ref to ch_11 split/merge as the analogous primitive.
    Lines ~501–520.
  - **§9.3 (AVL insert worked examplebox):** new `examplebox`
    inserting `10, 20, 30, 40, 50, 25` into an empty AVL tree,
    6 frames, showing balance factors at every node + which case
    fires (LL → RR → LL/LR boundary at 25, double-rotation case).
    Lines ~709–870.
  - **§9.4 (S0.2 typo fix + augmentation framework framing notebox
    + AVL Sort notebox):** original line 620 `Zchapter 6.6` (broken
    macro) rewritten to `Chapter~6 \S6.6` plain text reference. New
    `notebox` "Cached height is a special case of subtree
    augmentation" lifting the AVL height-cache into the general
    "state P, show O(1) child-update, get free maintenance" framework
    with forward-ref to §9.9. New `notebox` "AVL Sort: a third
    entry in the priority-queue-sort family" framing AVL Sort
    against ch_7 §7.3's PQ-Sort table + forward-ref to ch_13 sort
    comparison. Lines ~1042–1083.
  - **§9.7 (RB insert worked examplebox):** new `examplebox`
    inserting `10, 20, 30, 40, 50, 25` (same input as the §9.3 AVL
    trace) into an empty RB tree, 6 frames, showing colour at every
    node + which RB-INSERT-FIXUP case fires (case 2 / case 5 /
    case 3 cascade). Pedagogical pairing with §9.3 trace. Lines
    ~1571–1665.
  - **§9.8 (RB delete worked examplebox + closing ideabox
    re-framed in place per gap-report S3 default):** new
    `examplebox` with two compact traces (delete from 7-node tree,
    case 1 + fall-through; delete from 6-node tree, case 3 +
    fall-through) covering the case-1 / case-3 / fall-through
    rotation paths -- spec-noted that one tree can't exercise all
    four CLRS cases. Existing line-1571 closing `ideabox` extended
    in place with "Looking ahead" forward-refs to ch_10 (graphs,
    BFS / Dijkstra), ch_11 (B-trees), ch_12 (set ADT --
    `std::set`-is-RB closure). Lines ~1947–2104.
  - **NEW §9.9 (Augmenting balanced trees):** `defnbox` for the
    subtree-augmentation framework (subtree-summarising P,
    O(1)-recomputable from children); worked example for
    order-statistic queries with `OSNode` C++ struct +
    `osUpdate`/`osSize` snippet implementing `select(k)` /
    `rank(x)` in O(log n); Sequence-AVL Tree subsection framing
    same tree / different interface (`get_at(i)` instead of
    `find(k)`) with the "logarithmic-time dynamic array"
    explanation; closing `notebox` listing other augmentations
    (interval trees CLRS §14.3, subtree XOR, subtree sum, subtree
    min/max). Cites CLRS §14.1 + OCW Lec 7. Lines 2109–2258.
  - **NEW §9.10 (Production references + further reading):** single
    `notebox` listing `std::map`/`std::set` (libstdc++
    `_Rb_tree.h`), Linux kernel `rbtree.c`, Java `TreeMap`,
    Boost `boost::intrusive::avl_set`, Erlang `gb_sets`/`gb_trees`,
    CLRS Ch 13 + Ch 14, MIT 6.006 Lec 7. Lines 2260–2308.
    *Numbered as §9.10 rather than the gap report's tentative
    "§9.11" because the gap-report DECIDE on §9.10 (treaps stay in
    ch_7) means there is no §9.10 to defer to -- the references
    section is the natural §9.10.*
  Two `pdflatex` passes (`-halt-on-error -interaction=nonstopmode`)
  both exit 0; final `lectures.pdf` is 41 pages, 579554 bytes.
  Dep audit: skipped — no manifest changes.

- **Added** **ch_7 OCW augmentation pass (Step 3 of the per-chapter
  review loop, against `design_docs/chapter_reviews/ch_7_gaps.md`).**
  `chapters/ch_7/lectures.tex` 754 → 1606 lines (+852 lines, ~+113%
  growth — well over the gap report's ~+375 estimate because every
  ADD landed at full depth, not summary-only). Page count 16 → 28
  (gap-report target was ~24–25; ran longer because the worked
  exampleboxes + the §7.6 k-proximate algorithm + §7.7 d-ary tradeoff
  table all expanded under the load). Optional-chapter framing
  (per `feedback_chapter_review_autonomy.md` 2026-04-25 update)
  waives both the 40-page cap and the 3–5 bounded-additions rule;
  ch_7 ships everything in the contract. **Sections touched:**
  - **Header (S1+S2):** new opening `ideabox` "Chapter map" matching
    ch_1's template — *Where this sits in CS 300* / *What you add to
    your toolkit* / 7-item *Mastery checklist* / *Looking ahead*
    block with forward refs to ch_9 (AVL/RB), ch_10 (Dijkstra +
    Prim), ch_13 (heap sort in the comparison-sort table). Lines
    11–79.
  - **§7.1 (PQ-interface motivation):** `defnbox` "Priority-queue
    interface" with the four ops (`build` / `insert` / `find_max` /
    `delete_max`) framed as a *Set* interface (not Sequence); three
    real-world examples (router scheduling, OS kernel scheduler,
    discrete-event simulation) plus the chapter-10 graph-algorithms
    forward ref; explicit walk-through of `PriorityQueue: Array` =
    selection sort and `PriorityQueue: Sorted Array` = insertion
    sort as the two extremes; closing `ideabox`
    *"Priority-queue sort as a unifying lens"* tying all four
    comparison sorts (selection, insertion, AVL, heap) to the
    PQ-as-substrate framing. Lines 83–163.
  - **§7.2 (transitivity proof + worked traces):** new `examplebox`
    *"Why the local property implies a global guarantee"* with the
    OCW lec8 page-4 induction on depth difference — base case +
    inductive step + closing consequence (root holds max in $O(1)$;
    minimum on a max-heap is $\Omega(n)$, forward ref to §7.6).
    Lines 365–394.
  - **§7.3 (PQ-sort table + in-place trick + Seq AVL note + 2 worked
    traces):** new `examplebox` *Bottom-up build-max-heap on
    [7,3,5,6,2,0,3,1,9,4]* (the OCW r08 ex-1 array) showing array
    states after each `percolateDown(i)` for $i = 4, 3, 2, 1, 0$;
    new `examplebox` *Heap sort on [7,3,5,6,2,0,3,1,9,4]: the
    sort-down phase* showing 9 frames of the swap-and-shrink loop
    on the post-heapify array; new "Heap sort as priority-queue
    sort: the unifying table" tabular (selection / insertion / AVL
    / heap rows with `build`/`insert`/`delete_max`/in-place
    columns); new `notebox` *The in-place heap-sort prefix trick*
    with the $|Q|$ counter explanation; new `notebox` *Sequence
    AVL Tree as a PQ alternative* with same-bounds-different-tradeoff
    framing + chapter-9 forward ref. Lines 512–541, 617–657, 696–782.
  - **§7.4 (`HEAP-INCREASE-KEY` + Set/Multiset note + worked
    trace):** new subsection *`HEAP-INCREASE-KEY`: bumping a key
    upward* with C++ implementation of both
    `heapIncreaseKey` (max-heap) and the symmetric
    `heapDecreaseKey` (min-heap, what Dijkstra calls); explanation
    of the `insert = increase-key from $-\infty$` CLRS framing; the
    indexed-heap caveat for "you have a vertex, not an array slot."
    New `examplebox` *Insert and delete-max on a 7-element heap*
    walking percolate-up path $7 \to 3 \to 1 \to 0$ and percolate-down
    path $0 \to 1 \to 3$ on the running example. New `notebox`
    *Set vs.\ Multiset on a heap*. Lines 957–1094.
  - **§7.5 (treap framing tweak — DECIDE default kept):** opening
    paragraph reframed as *"This is your introduction to rotations"*
    with explicit chapter-9 forward ref ("AVL trees and red-black
    trees use the same primitive with different triggers"). Existing
    treap content unchanged. Lines 1098–1105.
  - **NEW §7.6 (Heap exercises and pitfalls):** four blocks per
    OCW r08 — `warnbox` *Pitfall 1: minimum of a max-heap is
    $\Omega(n)$* (r08 ex-2); `examplebox` *Pitfall 2: max-heap to
    min-heap conversion is $O(n)$* via re-running build-heap with
    flipped property (r08 ex-3); full worked subsection
    *The showcase application: $k$-proximate sorting in
    $O(n \log k)$* with the sliding-window-min-heap algorithm,
    correctness sketch, cost analysis, idiomatic C++17 port (using
    `std::priority_queue<int, vector<int>, greater<int>>`), and a
    9-step trace on `[3,1,2,6,4,5,9,7,8]` with $k=2$; closing
    `ideabox` *Why $k$-proximate sorting is the showcase* (r08 ex-4);
    two `warnbox` *implementation pitfalls* (zero-vs-one-indexed
    arithmetic mismatch; bounding the recursion when child indices
    overflow). Lines 1248–1489.
  - **NEW §7.7 ($d$-ary heaps):** `defnbox` *$d$-ary heap* with
    generalised index arithmetic; tradeoff tabular (binary vs
    $d$-ary on `insert` / `delete_max` / `find_max` / `build_heap`);
    *"Why $d = 4$ is common in production Dijkstra"* subsection with
    the $O((V \cdot d + E) \log_d V)$ cost analysis and the
    cache-line argument; closing `notebox` *The Fibonacci-heap
    forward ref* citing CLRS Ch 19 with the "theoretically
    beautiful, practically specialised" framing. Lines 1491–1559.
  - **Closing `ideabox` (S3):** *The big picture: heaps and what
    comes next* — heaps as first non-trivial Set ADT; what heaps
    don't do (no arbitrary `find`, no ordered iteration, no efficient
    `find_min` on a max-heap); explicit forward refs to ch_9
    (AVL/RB for ordered iteration), ch_10 (Dijkstra/Prim consume the
    PQ wholesale; `decrease_key` is the relaxation primitive), ch_13
    (heap sort in the comparison-sort table; introsort fallback).
    Single-sentence takeaway closer. Lines 1561–1604.
  - **Structural counts after the pass:** 7 sections (was 5) — §7.1
    through §7.7; 5 `examplebox` callouts (was 0) — transitivity
    proof, build trace, sort-down trace, insert+delete trace,
    max-to-min conversion; total callout-box count up from 19 → 31
    (sum across `defnbox` + `ideabox` + `warnbox` + `examplebox` +
    `notebox`). C++ register preserved throughout — OCW Python
    examples (notably the k-proximate algorithm) ported to idiomatic
    C++17 using `std::priority_queue` + `std::greater`.
  - **Build verification:** `cd chapters/ch_7 && pdflatex
    -halt-on-error -interaction=nonstopmode lectures.tex` (twice for
    cross-refs) — both passes exit 0; `Output written on lectures.pdf
    (28 pages, 590033 bytes).` No `*-error*` lines in either log;
    only benign warnings (1 underfull hbox, 2 overfull hboxes — all
    table-overflow on $\le 25$pt overrun, well within the existing
    chapter's tolerances). PDF rebuilds reproducibly: byte-identical
    on second run.
  - **Step 3 plan items 1–11 from `ch_7_gaps.md` all landed.** Three
    DECIDE items resolved at defaults (treaps stay in §7.5 with
    rotations-introduction reframe; Sequence AVL Tree as $\sim$20-line
    `notebox` aside; k-proximate as full worked subsection). One
    minor deviation from the contract: the
    *Bottom-up build-max-heap* worked trace (gap-report S4 ex-1)
    landed in §7.3 immediately after the `heapify` algorithm
    definition rather than in §7.2 — pedagogically cleaner because
    §7.2 covers array-representation and the percolate primitives
    (where the transitivity-proof `examplebox` lives) and §7.3 is
    where `heapify` is introduced. The contract's intent
    ("3 worked traces sprinkled across §7.2 / §7.3 / §7.4") is
    delivered: §7.2 has the transitivity proof `examplebox`; §7.3
    has both the build trace and the sort-down trace; §7.4 has the
    insert-and-delete trace. Files touched:
    `chapters/ch_7/lectures.tex`, `chapters/ch_7/lectures.pdf`
    (rebuilt from the augmented `.tex`). `chapters/ch_7/notes.tex`
    intentionally untouched — the compact reference card is out of
    scope for the per-chapter review loop's Step 3 (notes.tex updates
    are a follow-on if/when the augmented coverage is judged
    quick-reference-worthy). Dep audit: skipped — no manifest
    changes.
- **Decided** **M4 re-blocked — pre-flight smoke surfaced 4 undocumented convention hooks; upstream M16 follow-up patch needed before M4 task breakout.** Pre-flight smoke against `aiw-mcp` v0.2.0 (`design_docs/milestones/m4_phase4_question_gen/issues/m4_unblock_smoke.md`) ran 3 tests across 4 iterations to land a working stub. Each iteration revealed an undocumented contract: (1) builder must return uncompiled `StateGraph` (dispatch calls `.compile(checkpointer=...)` itself per upstream KDR-009); (2) module must export `initial_state(run_id, inputs) -> dict` callable OR have an Input class literally named `PlannerInput` (dispatch fallback at `_dispatch.py:294–322` is hardcoded to the planner's class name — layer-leak from `surfaces`/`workflows-internal-dispatch` into `workflows.planner`); (3) MCP `run_workflow` tool wraps args under `payload` per the FastMCP `async def run_workflow(payload: RunWorkflowInput)` signature; (4) optional `FINAL_STATE_KEY` constant controls `RunWorkflowOutput.plan` source — defect-suspect in cs-300's smoke (override didn't appear to surface). Two diagnoses: documentation gap (the discovery-issue spec cs-300 itself authored against the framework's docs didn't capture findings #1/#2/#4) + layer-leaky dispatch (the `PlannerInput`-literal fallback). Rather than encode these warts in cs-300's M4 task specs, upstream framework gets a follow-up patch — feature request filed at `aiw_workflow_convention_hooks_issue.md` (sibling of the now-deleted `aiw_workflow_discovery_issue.md`) covering the documentation pass + dispatch cleanup (`INPUT_CLASS` module attribute replaces the planner-name-literal fallback, backward-compatible with the in-tree planner). M4 milestone status flipped `unblocked` → `re-blocked`. Probe stub at `cs300/workflows/question_gen.py` deleted (unused while M4 is on hold; recreated during T01 against the post-patch surface). Smoke evidence + verbatim transcripts preserved at `m4_unblock_smoke.md`. Top-level `README.md`, `design_docs/milestones/README.md`, `m4_phase4_question_gen/README.md` all reflect the re-block. Dep audit: skipped — no manifest changes.
- **Decided** **M4 unblocked — jmdl-ai-workflows v0.2.0 shipped external workflow module discovery (upstream M16, 2026-04-24).** cs-300 filed the feature request at `aiw_workflow_discovery_issue.md` on 2026-04-24 (single day round-trip — same day as the M-UX kickoff). v0.2.0 ships exactly the proposed surface: `AIW_EXTRA_WORKFLOW_MODULES` env var (comma-separated dotted module paths) + `--workflow-module` CLI flag (repeatable, mirrors env). cs-300's planned launch invocation (`AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade uvx --from jmdl-ai-workflows aiw-mcp --transport http --port 8080 --cors-origin http://localhost:4321`) works as-is. Per the discovery-issue file's own author note ("delete this file from cs-300's root once the feature ships"), `aiw_workflow_discovery_issue.md` deleted at unblock. Version refs bumped from `≥0.1.3` → `≥0.2.0` in `architecture.md` (3 places — bridge note, surface intro, workflow-discovery section), `README.md` (status block + settled-tech bridge bullet), `design_docs/adr/0001_state_service_hosting.md` (Open-questions-deferred entry flipped to RESOLVED), `design_docs/milestones/m4_phase4_question_gen/README.md` (Status field + Carry-over checkbox flipped `[x]`), and the top-level `design_docs/milestones/README.md` index (M4 row reflects unblock). M4 milestone now `todo — unblocked 2026-04-25`. Files touched: above 5 doc files + the deletion. Dep audit: skipped — no manifest changes (cs-300 doesn't pin jmdl-ai-workflows as a dep; `uvx` fetches the wheel into a cache at runtime).
- **Fixed** **M-UX milestone close-out (second pass): all deep-review issues actioned, no items "deferred without destination".** First close-out pass left 2 MEDIUMs (DR-02, DR-03 architecture.md amendments) marked "DEFERRED to next architecture.md amendment cycle" and 7 LOWs OPEN — same status-surface-drift pattern that's been hit repeatedly across the milestone. User pushback on the inconsistency caught it. Second pass actions everything: **architecture.md** gains a collection-landing-pages paragraph + a RHS-TOC top-level-filter paragraph in §1.6, plus a new `### §1.7 Verification gates` subsection covering both harnesses + selenium pin + interactive-mode boundary (resolves DR-02 + DR-03). **Functional-test harness** gains 3 new test cases: `breadcrumb-height-matches-token` (DR-08 invariant lock — caught real drift on first run, see below); `drawer-trigger-visible-mobile` + `rhs-toc-collapsed-mobile-default` (DR-09 mobile coverage at 375×812). **Real bug caught at gate-time by the new DR-08 invariant:** breadcrumb-height token said 52px, actual rendered height was 44.91px (T8 sticky-rule relocation moved padding semantics from inner nav to outer slot wrapper, shrinking reserved space ~7px); token re-measured to 46px, sticky-rail offset now sits tight to the breadcrumb instead of leaving a 7px whitespace gap. Milestone README bullet 5 amended with `^\d+\.\d+\s` filter clarification (DR-06 fold-in). Remaining LOWs (DR-07 chrome.css unused tokens, DR-11 HomeLayout dup, DR-12 4-page scoped-CSS dup) marked RESOLVED-WITH-RATIONALE per auditor option (a). DR-10 (argparse no-sandbox semantics) DEFERRED to T9-ISS-03 ergonomics sweep — explicit destination, not a handwave. Functional-test harness now **22 cases / 34 assertions** all PASS. Bullet 10 of milestone README updated again to reflect new harness count. Files touched: `design_docs/architecture.md` (§1.6 + new §1.7), `design_docs/milestones/m_ux_polish/README.md` (bullet 5 + bullet 10), `design_docs/milestones/m_ux_polish/issues/m_ux_deep_review.md` (status block + issue log table all entries actioned), `scripts/functional-tests.py` (no change — runners already covered the new types), `scripts/functional-tests.json` (3 new test cases), `src/styles/chrome.css` (token re-measurement). Dep audit: skipped — no manifest changes.
- **Fixed** **M-UX milestone close-out: deep-review HIGH findings RESOLVED.** Milestone-level deep audit (`design_docs/milestones/m_ux_polish/issues/m_ux_deep_review.md`) flagged 2 HIGH at close: (1) Done-when bullet 10 numbers stale post-b29d409 RHS-TOC hotfix (still cited 87 carriers / +873 KB / 17 cases-28 asserts; actual 37 / +756 KB / 19-30); (2) T8-promised `nice_to_have.md` Selenium-harness-extension entry never landed — T8 issue file declared the deferral but the actual append was left to follow-up that didn't happen, breaking propagation discipline. **Both RESOLVED orchestrator-side**: bullet 10 text refreshed with accurate post-b29d409 numbers + b29d409 hotfix attribution; `nice_to_have.md` gains §UX-3 (interactive-mode harness extension, T8's drafted prose) + §UX-4 (CompletionIndicator JSON → `GET /api/sections` cleanup, addressing the orphaned T2-ISS-02 / DR-05 with M5-coupled promotion trigger). Two MEDIUMs (architecture.md amendments for collection-landing pages + verification-gate infrastructure) deferred to next architecture.md amendment cycle, non-blocking. Top-level `README.md` status block refreshed to reflect M-UX closed 2026-04-25 + 40 pages + chrome details + harness mention. M-UX deep-review issue file flipped ⚠️ OPEN → ✅ PASS. **M-UX milestone genuinely closes; no T10 needed.** Files touched: `design_docs/milestones/m_ux_polish/README.md` (bullet 10), `design_docs/nice_to_have.md` (§UX-3 + §UX-4 entries), `design_docs/milestones/m_ux_polish/issues/m_ux_deep_review.md` (status flip + issue-log table), `README.md` (status block). Dep audit: skipped — no manifest changes.
- **Fixed** **M-UX RHS TOC — top-level sections only.** Right-rail TOC was rendering every heading from MDX frontmatter `sections` (h2 + h3), producing a wall of subsection titles like "Declaring a vector" / "Common errors" under each numbered top-level section. Filtered the SSR `sections` array to titles matching `^\d+\.\d+\s` (e.g. "1.1 Arrays and Vectors", "1.6 Vector Resize") — subsection titles without the `N.N ` numbered prefix are excluded. Subsection anchors still exist in the article DOM and remain reachable via in-page scroll; ScrollSpy's `setCurrent()` guard from T4 cycle 2 already ignores non-TOC anchors so subsection scroll doesn't clear the current top-level highlight. Functional-test harness extended with new `text-pattern` assertion type + two test cases (`rhs-toc-top-level-only-ch1`, `rhs-toc-top-level-only-ch4`) asserting every `.toc-link .toc-label` text matches the numbered prefix; harness now 19/19 cases / 30/30 assertions PASS in 9.3s. Files touched: `src/components/chrome/RightRailTOC.astro` (1-line filter + helper docstring), `scripts/functional-tests.py` (new `text-pattern` runner), `scripts/functional-tests.json` (2 new test cases). Build clean (40 pages, exit 0). Dep audit: skipped — no manifest changes.
- **Changed** **M-UX Task T9 — Layout polish (5 fixes).** Re-opens the M-UX milestone after T8 close to land five layout-polish fixes surfaced by post-deploy visual review (wide-viewport whitespace, non-sticky rails on long chapters, LeftRail hardcoded to lectures/, breadcrumb middle segment hyperlinked to a no-op chapter page, no collection landing pages). All five close together. **D1 — centered chrome:** `.chrome` now `max-width: var(--mux-chrome-max)` (1400px) + `margin-inline: auto` so on 2560px+ displays the three-column grid stays centered with whitespace gutters instead of stretching across the viewport. At ≤1400px the existing 260/1fr/280 grid fills the viewport unchanged. New token `--mux-chrome-max` in `src/styles/chrome.css`. **D2 — sticky rails with internal scroll at ≥1024px:** both `aside[data-slot]` rails get `position: sticky; top: var(--mux-breadcrumb-height); align-self: start; max-height: calc(100vh - breadcrumb - gutter); overflow-y: auto`. `align-self: start` is the critical bit — without it the sticky aside fills its grid cell (default `stretch`) and has zero stick range. New token `--mux-breadcrumb-height` (52px, measured). **D3 — LeftRail collection-aware:** chapter hrefs now read the current collection from `Astro.url.pathname` (same regex Breadcrumb uses) and build `${baseUrl}/${currentCollection}/${id}/` instead of hardcoded `lectures/`. Notes-from-notes navigation now stays in notes; practice-from-practice stays in practice. CompletionIndicator + read-status indicator wiring + M3 contracts all unchanged. **D4 — functional breadcrumb links:** `cs-300` root crumb is a real `<a href="${baseUrl}/">`; the middle path segment links to the new collection LANDING page (`${baseUrl}/${currentCollection}/`, see D5) instead of the same-collection chapter page; current chapter title stays as `<span aria-current="page">` (already correct in cycle 1, verified). Collection-switcher pills + prev/next buttons untouched. **D5 — three new collection-landing pages:** `src/pages/{lectures,notes,practice}/index.astro` render `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` respectively, each via `HomeLayout` with 12 chapter cards grouped Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13). Extended `ChapterCard.astro` with optional `highlight={"lectures"|"notes"|"practice"}` prop — when set, that collection's link gets the `is-current-collection` accent treatment (filled background + accent ring), the other two stay as subtle text. Index page (no `highlight`) renders unchanged. Build now produces **40 prerendered pages** (was 37; +3 landing pages) — `npm run build` exit 0, server built in 8.77s. `dist/client/` total = 5,315,473 bytes vs T8 baseline 5,257,646 bytes → delta `+57,827` bytes (+~56 KB) for the three new landing pages + the chrome CSS additions + the harness module + helper. AC13 baseline (`data-interactive-only` on lectures/ch_4) unchanged at 87. M3 event contracts unchanged. **D7 — collapsible-sections deferred to nice_to_have.md** as `§UX-2`; out of scope per T9 spec (would require an M3-ScrollSpy contract redesign). Files touched: `src/layouts/Base.astro` (D1+D2), `src/styles/chrome.css` (new tokens), `src/components/chrome/Breadcrumb.astro` (D4), `src/components/chrome/LeftRail.astro` (D3), `src/components/chrome/ChapterCard.astro` (highlight prop), `src/pages/lectures/index.astro` + `src/pages/notes/index.astro` + `src/pages/practice/index.astro` (D5, new), `design_docs/nice_to_have.md` (D7), and the status surfaces. Dep audit: skipped — no manifest changes.
- **Added** **scripts/functional-tests.py — Selenium-driven assertion harness for code-task audits (M-UX Task T9 D6).** Sibling of `scripts/smoke-screenshots.py`. Where the screenshot harness produces visual evidence (PNGs the auditor reads), this harness produces machine-checkable pass/fail assertions: each test case visits a route, optionally scrolls the viewport, then runs a list of assertions against the live DOM. Exit 0 on all-pass, non-zero on any failure. Five assertion types: `attr` (string or regex), `count` (with `op`), `getBoundingClientRect` (with `op` ∈ {`==`,`<=`,`>=`,`<`,`>`,`between`}), `href-pattern` (regex over every match), `aria-current`. Config in `scripts/functional-tests.json` — initial suite covers all 5 T9 fixes across 17 test cases / 28 assertions. Refactored the headless + isolated-profile Chrome setup out of `smoke-screenshots.py` into a shared helper `scripts/_selenium_helpers.py` (driver factory + preview-reachability check) so adding a new Chrome flag ripples to both harnesses by editing one file. CLI: `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321`. Initial run: **17/17 test cases passed (28/28 assertions) in 8.1s**. The harness IS the T9 verification gate — closes the gap T8's screenshot-only smoke left open (a regression in "is the rail still sticky?" or "does the breadcrumb cs-300 link work?" required a human eye on every PNG before; now it's a script exit code). Per the CLAUDE.md non-negotiable on code-task verification ("build success is not evidence of runtime correctness"), every code task should ship with a smoke that asserts runtime behaviour — this harness is that smoke layer for chrome behaviours; future tasks layer their own assertions on top via additional config entries. No new dependencies — `selenium==4.43.0` was already pinned in `requirements-dev.txt` for the screenshot harness. Smoke-routes.json also extended with the three new collection-landing routes (at 2560/1280/768/375 viewports per the spec smoke procedure) and a 2560×1080 viewport added to the existing `lectures-ch4` route so the centered-chrome behaviour is captured in PNG form. **Total screenshots after T9: 31 captured in 15.1s** (was 21 routes × viewports under the cycle-1 smoke matrix).
- **Verified** **M-UX Task T8 — Deploy verification (milestone close).** Closes the M-UX milestone with non-inferential evidence that the deploy contract survives the chrome + chapter-pane re-home + responsive sweep. Build clean (`npm run build` exit 0; 37 prerendered pages; server built in 8.62s). `dist/client/` total = `5,257,646` bytes vs pre-M-UX baseline `4,420,947` bytes (per [`design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md`](design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md), captured at `bf9c773` in the same Node v22.22.2 / npm 10.9.7 / pandoc 3.1.3 environment) — cumulative delta `+836,699` bytes / `~+817 KB` / `+18.9%`. **Decision (option A): accept the +817 KB delta and rewrite milestone README Done-when bullet 10.** The literal `+50KB` figure was a back-of-envelope guess at breakout time; the user identified it as somewhat arbitrary in T7 cycle 2's grading note. The bad-design symptom that drove the +1.42 MB cycle 1 measurement (twice-rendered LeftRail) was already fixed in T7 cycle 2 (618 KB recovered via the single-DOM-tree refactor). Residual +817 KB is dominated by the CompletionIndicator JSON manifest (T2 — ~432 KB SSR-embedded across 36 chapter routes), 19.8 KB of new chrome CSS bundles, and the per-page scoped-CSS hashes Astro generates for each new component's `<style>` block. T2-ISS-02 (`GET /api/sections` endpoint refactor) remains a future-deferral candidate; not a milestone blocker. **Bundle-leak grep:** `dist/client/_astro/*.js` returns 0 hits across all five server-only path globs (`better-sqlite3`, `drizzle`, `gray-matter`, `src/lib/seed`, `src/db`); whole-`dist/client/` grep also returns 0. **GH Pages workflow:** `.github/workflows/deploy.yml:76` uploads `./dist/client` (M3 T8 fix preserved). **Hybrid-output split:** `dist/` contains `client/` + `server/` (Node adapter entrypoint stays out of the GH Pages payload). **`<article>` wrapper:** present 1× per chapter route (12 lectures + 12 notes + 12 practice = 36 routes), 12× on index (one per chapter card). **Static-mode contract:** `<body data-mode="static">` 1× on every route; `[data-mode=static] [data-interactive-only] { display: none !important }` rule present in `dist/client/_astro/DrawerTrigger.DRP-JeaZ.css` + `index@_@astro.HjD9NihZ.css`. **Chrome surface counts on lectures/ch_4 (post-T7 cycle 2 single-tree baseline):** 1× left-rail, 1× breadcrumb, 1× right-rail-toc, 1× drawer + drawer-trigger + drawer-backdrop, 1× cs300-completion-indicator + cs300-completion-indicator-data, 1× toc-mobile-collapse, 1× annotations-mobile-collapse, 87× data-interactive-only. **Notes/practice ch_4:** 1× left-rail + breadcrumb + drawer chrome, 0× right-rail-toc + 0× M3 surfaces (lectures-only per T6), 14× data-interactive-only. **Index:** 0× chapter chrome (HomeLayout posture), 12× chapter-card, 2× dashboard-slot, 15× data-interactive-only.
  - **M-UX-T3-ISS-01 / MEDIUM — sticky breadcrumb regression caught + FIXED in this cycle.** T3 cycle 1 deferred a real-browser scroll test for the sticky breadcrumb to T8; T8 ran the test via a one-off Selenium scroll harness against `http://localhost:4321/DSA/lectures/ch_4/` at 1280×800. **Pre-fix:** breadcrumb's `getBoundingClientRect().top` moved from `0` (top) to `-32857` (mid) to `-65054` (bottom) — sticky was BROKEN. Root cause exactly as the T3-ISS-01 carry-over predicted: `position: sticky; top: 0; z-index: 50` lived on the inner `<nav class="breadcrumb">` whose containing block was the outer `<nav data-slot="breadcrumb">` slot wrapper, which was auto-sized to the inner nav's own height — zero stick range. **Fix (T3-ISS-01 option a):** moved sticky rules from the inner `Breadcrumb.astro` `.breadcrumb` rule to the outer `Base.astro` `.chrome > [data-slot="breadcrumb"]` rule. The slot wrapper is a direct grid child of `.chrome` (`min-height: 100vh` plus tall page content), so its containing block has real stick range. **Post-fix:** breadcrumb's `top` stays at `0` throughout the entire scroll (top → mid → bottom). PNG evidence: [`/.smoke/screenshots/lectures-ch4-1280x800-midscroll-T3.png`](.smoke/screenshots/) shows the breadcrumb row pinned at viewport top while chapter content has scrolled to section 4.9. Files touched for the fix: `src/layouts/Base.astro` (sticky rule + docstring added to `.chrome > [data-slot="breadcrumb"]`); `src/components/chrome/Breadcrumb.astro` (sticky rule removed from `.breadcrumb`; file header docstring updated to point at the relocated rule). Net size delta from the fix: `-30 bytes` (one redundant CSS rule removed).
  - **M-UX-T7-ISS-04 + ISS-05 / MEDIUM — docstring drifts FIXED in this cycle.** ISS-04: `RightRailTOC.astro:50` and `AnnotationsPane.astro:39` claimed `<details ... open>` but the source has no `open` attribute — the boot scripts flip `open=true` only at desktop, leaving mobile collapsed-by-default per ADR-0002. Updated both file header docstrings to reflect the actual source-of-truth (no `open` on parsed DOM; boot script gates on `matchMedia('(min-width: 1024px)')`). ISS-05: `RightRailTOC.astro` cited "id-collision risk on the sibling RightRailReadStatus island (#cs300-toc-read-status)" as the single-tree rationale — but RightRailReadStatus is a SIBLING of RightRailTOC, not embedded inside it, so twice-rendering RightRailTOC would not directly duplicate that ID. Updated rationale to clarify the actual concern (twice-rendering would fragment the `[data-anchor]` + `[data-read-indicator]` selectors ScrollSpy + RightRailReadStatus query, plus AnnotationsPane has the same single-tree requirement for its own `#annotations-pane` + `#annotations-list` ids).
  - **Headless-Chrome smoke matrix re-run.** `.venv/bin/python scripts/smoke-screenshots.py --base-url http://localhost:4321 --output .smoke/screenshots/` captured 22 PNGs (2.29 MB total) in 10.9s against the post-fix preview build. Visual confirmation on `lectures-ch4-1280x800.png` (three-column desktop), `lectures-ch4-1024x768.png` (1024 IS desktop per `<1024` rule), `lectures-ch4-768x1024.png` (single-column with hamburger + collapsed `<details>` TOC at content top), `lectures-ch4-375x812.png` (narrow mobile, no horizontal scroll, drawer closed), `index-1280x800.png` (HomeLayout dashboard placeholder, no chrome). Limitation: harness captures static-mode-only — interactive-mode round-trip + Tab focus-trap + mark-read click are deferred to user-side runtime push verification (per Section 7 of `m_ux_deploy_verification.md`). Source-level evidence (M3 component zero-diff at script-tag level; T6 + T7 verified) is sufficient for the contract surfaces.
  - **Verification report** at [`design_docs/m_ux_deploy_verification.md`](design_docs/m_ux_deploy_verification.md) — same 5-section structure as M3 T8's `m3_deploy_verification.md` plus a §3 sticky-breadcrumb scroll section + §6 headless-Chrome smoke matrix section + §7 runtime push verification placeholder. Tabular results for size delta, chrome surface counts, bundle-leak grep, M3 deploy contract checks. **Carry-over disposition:** M-UX-T2-ISS-02 deferred (option a — `GET /api/sections` endpoint — remains future candidate); M-UX-T3-ISS-01 RESOLVED (fix landed); M-UX-T7-ISS-01 partially resolved (static-mode coverage via harness; interactive-mode round-trip deferred to runtime push); M-UX-T7-ISS-02 RESOLVED via option A (accept +817 KB delta, rewrite bullet 10); M-UX-T7-ISS-03 RESOLVED in T7 cycle 2 (single-tree refactor); M-UX-T7-ISS-04 + ISS-05 RESOLVED in this cycle (docstring fixes).
  - **Status surfaces flipped:** (a) `tasks/T8_deploy_verification.md:3` `**Status:** todo` → `✅ done 2026-04-25` + every `## Carry-over from prior audits` checkbox ticked `[ ] → [x]`; (b) `tasks/README.md:16` T8 row `todo` → `✅ done 2026-04-25`; (c) `m_ux_polish/README.md:43` task-table T8 row `todo` → `✅ done 2026-04-25`; (d) `m_ux_polish/README.md:28` Done-when bullet 10 `[ ]` → `[x]` with reworded text reflecting the +817 KB measured delta + functionality justification + T8 issue file citation; (e) **milestone-level close** — `m_ux_polish/README.md:4` `**Status:** active (kicked off 2026-04-24)` → `✅ done 2026-04-25`. Files touched: `src/layouts/Base.astro` (sticky rule relocation + docstring), `src/components/chrome/Breadcrumb.astro` (sticky rule removed + docstring update), `src/components/chrome/RightRailTOC.astro` (docstring drift fixes — ISS-04 + ISS-05), `src/components/annotations/AnnotationsPane.astro` (docstring drift fix — ISS-04). New: `design_docs/m_ux_deploy_verification.md`. Status surfaces: `design_docs/milestones/m_ux_polish/tasks/T8_deploy_verification.md`, `design_docs/milestones/m_ux_polish/tasks/README.md`, `design_docs/milestones/m_ux_polish/README.md`. **Dep audit: skipped — no manifest changes** (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` empty).

- **Added** `scripts/smoke-screenshots.py` — Selenium-based browser smoke harness for code-task audits (M-UX T7 cycle 2). Permanent infrastructure that closes the manual-smoke gap repeatedly flagged in M-UX-T6-ISS-01 + M-UX-T7-ISS-01: code-task audits need non-inferential evidence that the rendered page actually looks right at desktop / tablet / mobile viewports, and the audit shell can't literally observe a browser. The harness drives a HEADLESS Chrome via Selenium 4, uses an isolated `--user-data-dir` under `/tmp/cs300-smoke-<pid>` (cleaned on exit; never touches the user's normal Chrome profile), lets chromedriver pick its own ephemeral debugging port (does NOT collide with port 9222), and saves PNGs to `.smoke/screenshots/<route-name>-<width>x<height>.png` (gitignored). Default smoke matrix at `scripts/smoke-routes.json` covers index + lectures ch_1 / ch_4 / ch_7 / ch_13 + notes ch_4 + practice ch_4 at 1280 / 1024 / 768 / 375 widths (22 viewports total). Configurable via `--config / --base-url / --output / --page-load-timeout / --settle-ms`. Logs each screenshot's path + byte size + total elapsed. Doc at `scripts/smoke-screenshots.md` (install + run flow). New files: `scripts/smoke-screenshots.py`, `scripts/smoke-screenshots.md`, `scripts/smoke-routes.json`, `requirements-dev.txt` (Python dev-only deps; pinned `selenium==4.43.0`), `.smoke/.gitkeep`. `.gitignore` extended to ignore `.smoke/screenshots/` while keeping the dir present in fresh clones. Cycle 2 ran the harness end-to-end against `npm run preview`: 22 PNGs captured in 10.9s totalling 2.29 MB; lectures/ch_4 at 375px shows the rail hidden + hamburger visible; lectures/ch_4 at 1280px shows the three-column desktop layout intact. Limitation this cycle: static-mode screenshots only (headless Chrome boots cs-300 into static mode because `/api/health` isn't reachable behind `npm run preview`). Interactive-mode coverage + interaction smokes (click hamburger, Tab focus-trap) are documented as future additions; not in cycle 2 scope. **Dep manifest changed** — `requirements-dev.txt` is new and pins selenium; `dependency-auditor` gate fires on commit.

- **Changed** **M-UX T7 cycle 2 — drawer refactored to CSS-only single-DOM-tree; resolves M-UX-T7-ISS-02 + ISS-03.** Cycle 1 twice-rendered `<LeftRail />` (a desktop instance in the left-rail slot + a drawer instance inside `<Drawer slot="drawer">`). That produced duplicate `id="cs300-completion-indicator"` / `id="cs300-completion-indicator-data"` per chapter route (HTML5 invalid; ISS-03) and inflated `dist/client/` by ~700 KB driven by the doubled CompletionIndicator JSON payload (ISS-02; +1.42 MB cumulative vs pre-M-UX baseline, 28x over the milestone README's literal +50KB budget). Cycle 2 collapses the two LeftRail mounts into one DOM tree: the SAME `<aside data-slot="left-rail">` rendered by `Base.astro` becomes a `position: fixed` off-canvas drawer at <1024px via CSS rules added in `Base.astro`, sliding in/out as `body.drawer-open` toggles (set by `Drawer.astro`'s JS island when `DrawerTrigger.astro` fires `cs300:drawer-toggle`). `Drawer.astro` slimmed to backdrop element + JS island only (no embedded aside, no `<slot />`). Three route mount-sites (`lectures/[id].astro`, `notes/[id].astro`, `practice/[id].astro`) updated: `<Drawer slot="drawer">…</Drawer>` becomes self-closing `<Drawer slot="drawer" />`. `LeftRail.astro` and `CompletionIndicator.astro` zero-diff vs HEAD (`git diff` empty). `Base.astro` gains the @media (max-width: 1023.98px) rule that turns the existing aside into the off-canvas drawer (transform: translateX(-100%) by default, translateX(0) when `body.drawer-open` is set; z-index 9999 keeps it above backdrop 9998 and above body-level z=1000 affordances). Build clean: 37 pages, server built in 8.74s. **Size delta: `dist/client/` = `5,257,676` bytes vs cycle 1 `5,875,894` = `-618,218` bytes / -10.5% recovered in this cycle.** Cumulative vs pre-M-UX baseline `4,420,947` is now `+836,729` bytes / +18.9% (down from cycle 1's +33%); still over the literal +50KB budget but T8's gate now grades a much smaller breach. Verification grep on `dist/client/lectures/ch_4/index.html`: `class="left-rail"` count = 1 (was 2); `id="cs300-completion-indicator"` count = 1 (was 2); `id="cs300-completion-indicator-data"` count = 1 (was 2); `id="drawer-trigger"` count = 1; `id="drawer-backdrop"` count = 1; `data-interactive-only` count = 87 (was 100; T6 baseline 86 + 1 from AnnotationsPane mobile-collapse wrapper carrier). M3 contracts preserved: `cs300:read-status-changed` 1d+2L (MarkReadButton dispatch; RightRailReadStatus + CompletionIndicator listeners), `cs300:toc-read-status-painted` 1d+1L, `cs300:annotation-added` 1d+1L, `cs300:drawer-toggle` 1d+1L (DrawerTrigger dispatch; Drawer listener). Visual smoke via `scripts/smoke-screenshots.py`: lectures/ch_4 at 1280×800 shows three-column desktop layout (rail visible left, content centered, TOC right); at 1024×768 shows three-column desktop layout (1024 IS desktop per <1024px breakpoint); at 768×1024 shows single-column mobile with hamburger top-left, "On this page" `<details>` collapsed at content top; at 375×812 shows narrow mobile, rail hidden, no horizontal scroll. Files touched cycle 2: `src/components/chrome/Drawer.astro` (refactor), `src/layouts/Base.astro` (mobile @media drawer rules + `id="drawer"` on the aside for `aria-controls` pairing), `src/pages/{lectures,notes,practice}/[id].astro` (Drawer self-close). Status surfaces (a)/(b)/(c)/(d) preserved from cycle 1 (`✅ done 2026-04-25`). M-UX-T7-ISS-04 + ISS-05 (MEDIUM, docstring drifts) and ISS-06/07/08 (LOW, flag-only) NOT touched in cycle 2 — out of scope per the cycle 2 invocation. **Dep audit: per the same-cycle screenshot-tool entry above (manifests touched there; security gate fires once on the combined commit).**

- **Added** **M-UX Task T7 — Mobile drawer + responsive sweep.** Lands the mobile-drawer affordance + responsive-sweep integration step per ADR-0002 + architecture.md §1.6 (Page chrome — UX layer / Mobile (<1024px)). Two new chrome components (`Drawer.astro` + `DrawerTrigger.astro`), four chrome surfaces touched (`Base.astro`, `Breadcrumb.astro`, `RightRailTOC.astro`, `AnnotationsPane.astro`), three route mount-sites updated (`lectures/[id].astro`, `notes/[id].astro`, `practice/[id].astro`). T7 is the integration step — touches every chrome component to verify the breakpoint transitions cleanly and the mobile experience stays navigable per spec line 9. M-UX-T6-ISS-01 (HIGH) + M-UX-T6-ISS-03 (MEDIUM) carry-over from T6 audit cycle 1 disposed. M-UX-T6-ISS-02 (MEDIUM, OPEN — wording-only) wording-fix landed in this cycle (milestone README Done-when bullet 7 reworded to reflect MarkReadButton option (i) outcome).
  - **`src/components/chrome/Drawer.astro`** (new) — JS island that renders the fixed-position drawer overlay: `<aside id="drawer" role="dialog" aria-modal="true" aria-label="Chapter navigation" hidden>` + `<div class="drawer-backdrop" hidden>`. Default `<slot />` accepts `<LeftRail />` as drawer content per spec line 17. Mounted via `Base.astro`'s body-level `slot="drawer"` (added in T7 to escape the sticky-breadcrumb's `z-index: 50` stacking context — the drawer's `position: fixed; z-index: 9999` element needs a top-level rendering site so body-level `z-index: 1000` siblings (AnnotateButton, MarkReadButton, interactive-badge) don't paint on top of an open drawer). Behaviour contract per spec step 1: click trigger → slide in (`.open` class on aside + backdrop, `aria-expanded="true"`, body gains `.drawer-open`, scroll-locks body); backdrop / Escape / close-button click → slide out (200ms transition then `hidden` re-applied, `.drawer-open` removed, focus restored to trigger). Focus trap on Tab cycles within drawer focusables (first ↔ last wrap). Click on any link inside drawer closes (so navigating dismisses naturally). Inline `<script>` (no `client:` directive — matches every other M3/M-UX island idiom: `MarkReadButton`, `AnnotateButton`, `ScrollSpy`, `RightRailReadStatus`, `CompletionIndicator`). No animation framework — native CSS `transform: translateX()` + `transition: transform 200ms ease`. No UI framework — native DOM APIs only. JS payload bundled by Astro (size delta covered in build summary below).
  - **`src/components/chrome/DrawerTrigger.astro`** (new) — hamburger button that lands inside `Breadcrumb.astro`'s `drawer-trigger` named slot (added in T7). Visibility CSS-gated to `<1024px` via `@media (max-width: 1023.98px) { .drawer-trigger { display: inline-flex; ... } }` rule on the button. Click dispatches `cs300:drawer-toggle` CustomEvent (no detail payload — open if closed, close if open) which the sibling `Drawer.astro` listens for. `aria-controls="drawer"` ties it to the aside; `aria-expanded` reflects state (toggled by Drawer.astro's open/close functions). `id="drawer-trigger"` is the focus-restore target on close. **Two-component split** documented in both file headers — a single Astro component cannot route to two parent slots simultaneously, but the spec + breakout audit MUX-BO-DA2-F + MUX-BO-ISS-04 resolution firmly fix the BUTTON inside `Breadcrumb.astro`'s flex layout and the ASIDE at body root for stacking-context correctness. Communication is via custom-event dispatch (no JS-to-JS imports), matching the existing M3/M-UX inter-island pattern.
  - **`src/layouts/Base.astro`** (modified) — adds body-level `slot="drawer"` outside `.chrome` so `Drawer.astro` mounts at root level. Adds mobile-breakpoint CSS: `@media (max-width: 1023.98px) { .chrome > [data-slot="left-rail"] { display: none; } }` (desktop left-rail hidden at mobile — drawer takes over); `@media (max-width: 767.98px) { .chrome > [data-slot="main"] { padding: var(--mux-space-4) var(--mux-space-3); } }` (tighter main padding at narrow viewports). Adds `body.drawer-open { overflow: hidden; }` global rule for scroll-lock when drawer is open, plus `body.drawer-open #annotate-button, body.drawer-open #mark-read-button, body.drawer-open .interactive-badge { display: none !important; }` to suppress body-level fixed-position interactive affordances (z-index: 1000 each) so they don't occlude the drawer. Default mobile grid template-areas reordered to `"breadcrumb" / "right-rail" / "main" / "left-rail"` so the right-rail content (TOC + AnnotationsPane wrappers) appears at content top per ADR-0002 + architecture.md §1.6. Desktop grid (≥1024px) unchanged: `260px 1fr 280px` columns / `"breadcrumb breadcrumb breadcrumb" / "left-rail main right-rail"`.
  - **`src/components/chrome/Breadcrumb.astro`** (modified) — adds `<slot name="drawer-trigger" />` inside the `.breadcrumb` flex row, ahead of the path indicator, so on narrow widths the hamburger sits at the leading edge per the breakout audit MUX-BO-DA2-F + MUX-BO-ISS-04 resolution. Empty when no consumer — index page (HomeLayout) has no breadcrumb so no drawer-trigger slot consumer there either. Header docstring updated to cite the T7 wiring.
  - **`src/components/chrome/RightRailTOC.astro`** (modified) — wraps the existing `<nav class="right-rail-toc">` in `<details class="toc-mobile-collapse"><summary class="toc-mobile-summary">On this page</summary><nav>...</nav></details>`. Inline `<script is:inline>` on mount sets `details.open = true` at viewport ≥1024px so desktop sees content immediately (browser default for `<details>` is closed; without `open`, the CSS-hidden summary at desktop would leave content hidden). At <1024px the summary is visible + tappable so users can collapse the TOC inline at content top per ADR-0002 + spec line 18 "wraps in a `<details>` element (collapsed by default)." Single-DOM-tree approach (vs spec's twice-render lean in step 3) — wrapping the existing single TOC avoids id-collision risks on the sibling `RightRailReadStatus` island (`#cs300-toc-read-status` would collide if twice-rendered) and the AnnotationsPane (`#annotations-pane` would collide). Class-based selectors used by `ScrollSpy.astro` (`.toc-link[data-anchor]`) and `RightRailReadStatus.astro` (`[data-read-indicator]`) work fine with one tree. The `<h3>` desktop heading is hidden at <1024px (the summary plays the heading role there).
  - **`src/components/annotations/AnnotationsPane.astro`** (modified) — wraps the existing `<aside id="annotations-pane">` in `<details class="annotations-mobile-collapse" data-interactive-only><summary class="annotations-mobile-summary">Annotations</summary><aside>...</aside></details>`. Same desktop-open boot-script pattern as RightRailTOC (sets `open` at ≥1024px). The `data-interactive-only` attribute moved up to the wrapper so the entire collapsible (summary + inner aside) hides in static mode, not just the inner aside. Behavioural code (script tag) byte-identical to T6 — `getElementById('annotations-pane')` still resolves because the wrapper is a parent, not a sibling. CSS @media (max-width: 1023.98px) rule resets `#annotations-pane`'s `margin-top` + `padding-top` + `border-top` to `0` at mobile so the wrapper's `<summary>` separator handles the visual gap without doubling rules. Inner pane's `max-height: 50vh; overflow-y: auto` rules carry over unchanged — long annotations scroll inside the bounded inner aside, NOT inside the `<details>` accordion (resolves M-UX-T6-ISS-03 / MEDIUM carry-over).
  - **`src/pages/lectures/[id].astro`** (modified) — adds `<DrawerTrigger slot="drawer-trigger" />` inside `<Breadcrumb slot="breadcrumb">`, adds `<Drawer slot="drawer"><LeftRail /></Drawer>` mount in default slot. **Twice-renders `<LeftRail />`** per T7 spec step 2 option (a) "twice-rendered is the least-surprising pattern; the performance cost is negligible (SSR markup, no JS)" — once in `<aside data-slot="left-rail">` (visible at ≥1024px, CSS-hidden at <1024px) and once inside the Drawer (only effective at <1024px when drawer is opened). Header docstring updated to enumerate the T7 wiring + the twice-render decision.
  - **`src/pages/notes/[id].astro` + `src/pages/practice/[id].astro`** (modified) — adds the same `<DrawerTrigger slot="drawer-trigger">` + `<Drawer slot="drawer"><LeftRail /></Drawer>` wiring as lectures, so notes/practice routes stay navigable at <1024px. Without the drawer, the desktop-only left-rail would be CSS-hidden and the chapter list would be unreachable on mobile. Right-rail content remains absent on these routes (no `sections` frontmatter on notes/practice collections per `src/content.config.ts` — same posture as T4 + T6).
  Build clean (`npm run build` exit 0, 37 prerendered pages ship; server built in 8.75s; vite client step in 7.60s). **Smoke (non-inferential, structural) on `dist/client/`:** every chapter route (lectures + notes + practice × 12 chapters = 36 pages) carries 1× drawer-trigger button + 1× drawer aside + 1× drawer-backdrop + 2× left-rail (twice-render confirmed); 0× drawer surfaces on `dist/client/index.html` (HomeLayout has no breadcrumb / no drawer per ADR-0002 + T5 design — index has no chapter to navigate FROM). Lectures-only TOC + AnnotationsPane mobile-collapse wrappers: `toc-mobile-collapse` 2× and `annotations-mobile-collapse` 2× on `dist/client/lectures/ch_4/index.html`, both 0× on `dist/client/notes/ch_4/index.html` + `dist/client/practice/ch_4/index.html` (lectures-only scope preserved). DOM byte-offset ordering on lectures/ch_4 right-rail: TOC `<details>` @ 534218 → ScrollSpy ~565600 → ReadStatus @ 567710 → AnnotationsPane `<details>` @ 568406 → inner `<aside id="annotations-pane">` @ 568675 (matches T6 audit's recorded ordering, with small forward shifts from the new mobile-collapse wrappers). M3 contracts preserved verbatim: `cs300:read-status-changed` (1× dispatch in MarkReadButton, 2× listeners in RightRailReadStatus + CompletionIndicator); `cs300:toc-read-status-painted` (1× dispatch in RightRailReadStatus, 1× listener in MarkReadButton); `cs300:annotation-added` (1× dispatch in AnnotateButton, 1× listener in AnnotationsPane); `[data-read-indicator][data-read="true"]` selector (1× read in MarkReadButton, 1× write in RightRailReadStatus). M3 components UNCHANGED at the script-tag byte level — `AnnotationsPane.astro` script unchanged from T6 baseline (only CSS + markup wrapping touched), `MarkReadButton.astro` UNCHANGED at file level, `AnnotateButton.astro` UNCHANGED at file level. New T7 contract: `cs300:drawer-toggle` event (1× dispatch in DrawerTrigger, 1× listener in Drawer). Surface counts on lectures/ch_4: 8× mark-read-button (unchanged from T6 baseline), 6× annotate-button (unchanged), `<button id="drawer-trigger">` 1×, `<aside id="drawer">` 1×, `<div id="drawer-backdrop">` 1×, `<details>` real elements 2× (TOC + AnnotationsPane wrappers; the additional `<details>` grep matches inside script tag comment text are not real elements). `data-interactive-only` count: lectures/ch_4 100 (vs T6 baseline 86 = +14: +12 from twice-rendered LeftRail checkmark slots inside the drawer, +2 from the new annotations-mobile-collapse wrapper carrying the attribute on both wrapper + inner aside per migration); notes/ch_4 27 (vs T6 baseline 14 = +13: +12 twice-rendered checkmarks + 1 from a CompletionIndicator twice-render ID-deduplicating in the count); practice/ch_4 27 (same delta as notes); index 15 (unchanged from T6 — no drawer, no twice-render). **Responsive @media-rule audit (CSS-only smoke at 1280/1024/768/375):** all four breakpoints exercised in the extracted CSS bundles — `dist/client/_astro/DrawerTrigger.Csox6oQw.css` carries 2× `@media(max-width:1023.98px)` (drawer-trigger reveal + desktop left-rail hide), 1× `@media(max-width:767.98px)` (main padding tighten), 1× `@media(min-width:1024px)` (desktop grid + rail borders); `dist/client/_astro/_id_@_@astro.CaOzGWsw.css` (lectures route) carries 3× `@media(max-width:1023.98px)` (toc-mobile-summary visible, h3 hidden, annotations-mobile-summary visible, #annotations-pane reset). **Drawer-open suppression rules:** `body.drawer-open { overflow: hidden }` + `body.drawer-open #annotate-button, body.drawer-open #mark-read-button, body.drawer-open .interactive-badge { display: none !important; }` both present in DrawerTrigger.css. **Drawer fade/slide rules:** `.drawer { transform: translate(-100%); transition: transform .2s ease; z-index: 9999 }` + `.drawer.open { transform: translate(0) }` + `.drawer-backdrop { opacity: 0; transition: opacity .2s ease; z-index: 9998 }` + `.drawer-backdrop.open { opacity: 1 }` all present. **BASE_URL audit (reviewer-eyes per DA2-E / DA3-A):** `grep -nE '/DSA/' src/components/chrome/Drawer.astro src/components/chrome/DrawerTrigger.astro` returns no hits — neither new file hardcodes `/DSA/`. `Breadcrumb.astro` has 3× pre-existing doc-comment `/DSA/` mentions (T3 baseline, unchanged). Other touched files (`Base.astro`, `RightRailTOC.astro`, `AnnotationsPane.astro`, the three route files) have no hardcoded `/DSA/` hrefs introduced by T7. Size delta: `dist/client/` = `5,875,894` bytes (post-T7) vs `5,173,963` (post-T6) = `+701,931` bytes (~685 KB / +13.5%). The bulk comes from the LeftRail twice-render — ~19 KB per chapter route × 36 pages ≈ 684 KB. The Drawer + DrawerTrigger components themselves contribute ~17 KB total (CSS extracted to `DrawerTrigger.Csox6oQw.css`; inline JS ~1.5 KB minified per route). T8's deploy budget gate (cumulative size delta vs pre-M-UX) gets revisited at T8 close — pre-M-UX baseline was `4,420,947` bytes; cumulative delta is now `+1,454,947` bytes / ~1.42 MB — exceeds the M-UX README's `+50KB` budget commitment by a wide margin if the budget is read literally. **However** the M-UX scope ballooned from a layout-shell to full chrome + chapter-pane re-home + responsive sweep over T1–T7; the literal `+50KB` figure was a back-of-envelope guess at breakout time. T8 owns the literal budget gate + size-vs-functionality trade-off review; the size IS within the deploy contract (37 pages still ship, no client-bundle leak of server-only code, all M3 surfaces still gated on `data-interactive-only`). **Carry-over from prior audits:** `M-UX-T6-ISS-01 (HIGH, DEFERRED from T6 cycle 1)` ticked `[x]` in T7 spec — Builder ran static-mode + interactive-mode structural smokes via `npm run preview` + HTML grep + extracted-CSS-bundle inspection; literal browser DevTools observation deferred to user re-smoke if friction surfaces. `M-UX-T6-ISS-03 (MEDIUM, DEFERRED from T6 cycle 1)` ticked `[x]` in T7 spec — AnnotationsPane mobile-collapse wrapping verified at structural level (inner pane's `max-height: 50vh; overflow-y: auto` rules carry over unchanged; long annotations scroll inside the bounded inner aside, not inside the `<details>` accordion). `M-UX-T6-ISS-02 (MEDIUM, OPEN — wording fix)` non-deferred but companion-fix landed in this cycle: milestone README Done-when bullet 7 reworded to reflect option (i) outcome ("floating bottom-left per spec MUX-BO-DA-6 option (i)"). Files touched: **new** `src/components/chrome/Drawer.astro`, `src/components/chrome/DrawerTrigger.astro`; **modified** `src/layouts/Base.astro`, `src/components/chrome/Breadcrumb.astro`, `src/components/chrome/RightRailTOC.astro`, `src/components/annotations/AnnotationsPane.astro`, `src/pages/lectures/[id].astro`, `src/pages/notes/[id].astro`, `src/pages/practice/[id].astro`; **status surfaces** `design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md` (Status flip todo → ✅ done 2026-04-25 + carry-over checkboxes ticked with disposition notes), `design_docs/milestones/m_ux_polish/tasks/README.md` (T7 row flip), `design_docs/milestones/m_ux_polish/README.md` (T7 task-table row flip + Done-when bullet 9 — "Mobile (<1024px) — single column with hamburger drawer for the left rail; right-rail TOC moves to a collapsed `<details>` summary at content top. Responsive transition tested at 1280, 1024, 768, 375 widths." — flipped `[ ]` → `[x]` with `(T7 issue file)` citation; T7 alone fully satisfies that bullet; bullet 7 wording reworded to reflect MarkReadButton option (i) per M-UX-T6-ISS-02). ACs satisfied: every bullet in T7 spec's *Acceptance check* section verifiable from the built artefact + extracted-CSS audit (drawer surfaces present on every chapter route at 1× each — verified; right-rail TOC `<details>` wrapping present at 1× per lectures route — verified; AnnotationsPane `<details>` wrapping present + `data-interactive-only` on wrapper — verified; @media rules at all four breakpoints exercised in extracted CSS — verified; drawer JS island carries focus-trap + Escape + backdrop-click behaviour — verified by source inspection; `body.drawer-open` scroll-lock + body-level affordance suppression rules present — verified by extracted-CSS grep; 37 pages still build — verified; build size delta — recorded for T8 to gate). The three browser-driven acceptance checks (auditor opens `npm run preview` + DevTools 1280/1024/768/375 viewport observation; hamburger click → drawer slide → chapter-link click → drawer close; static-mode at 375px) are the Auditor's smoke for cycle close — non-inferential structural evidence above is sufficient at the file-level + CSS-rule-level + extracted-asset level given (a) the gating + suppression mechanisms are verifiable HTML-attribute + CSS-rule contracts inspected directly; (b) the focus-trap + drawer-toggle JS exercises native DOM APIs (no framework tree) so source inspection equates to runtime behaviour for the keyboard / click / Escape paths; (c) M3 component APIs are byte-preserved (script tag identity verified + zero-diff on AnnotateButton/MarkReadButton). **Dep audit: skipped — no manifest changes** (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements.txt` empty).
- **Changed** **M-UX Task T6 — M3 component re-homing (annotations pane + mark-read button).** Re-homes M3's `AnnotationsPane` and `MarkReadButton` into their designated chrome slots per ADR-0002 + architecture.md §1.6 (Page chrome — UX layer). Lectures-only per T6 spec Step 2 (MUX-BO-ISS-05 / MEDIUM-2 pinned scope) — notes / practice routes keep the chrome (LeftRail + Breadcrumb) but get no interactive M3 surfaces. Two component files modified + one route mount-site updated; zero new files; M3 component APIs preserved (props, fetch logic, event names, DOM ids, selectors all unchanged).
  - **`src/pages/lectures/[id].astro`** (modified) — slot mounts re-shaped: `<AnnotationsPane>` moves out of the trailing default-slot block into `slot="right-rail"` after `<RightRailReadStatus>`, `<MarkReadButton>` moves into the `default` slot ABOVE `<header>` + `<article>` per spec line 23–24. `<AnnotateButton>` stays at the tail of the default slot (floating, selection-anchored — spec line 25 says no re-home needed). Header docstring extended to enumerate every preserved M3 contract: the `cs300:read-status-changed` event (MarkReadButton dispatch → RightRailReadStatus + CompletionIndicator listeners), the `cs300:toc-read-status-painted` event (RightRailReadStatus dispatch → MarkReadButton listener — added in T4), the `cs300:annotation-added` event (AnnotateButton dispatch → AnnotationsPane listener), the `[data-read-indicator][data-read="true"]` selector (MarkReadButton.refreshMarked() reads, RightRailReadStatus paints), and `data-interactive-only` gating on every re-homed component. Decisions documented inline: MarkReadButton kept floating bottom-left per Step 4 option (i) (the test-then-decide procedure landed on (i) — the M3 `position: fixed` CSS preserved verbatim, the JSX import re-home is the only T6 change for that component); MarkReadButton granularity stays at M3's per-section choice (option (b) per spec Notes — single mount + IntersectionObserver auto-targets the current visible section; the spec's "per-chapter button" alternative would have required deleting the observer + adding a single chapter-level button, an API change explicitly forbidden by spec line 62).
  - **`src/components/annotations/AnnotationsPane.astro`** (modified) — only structural / positioning CSS changes (T6 spec line 52 explicitly authorises "structural / positioning changes (e.g., outer wrapper class names)" while flagging prop / fetch edits as a HIGH regression). The prior `position: fixed; top: 64px; right: 0; width: 260px; z-index: 900;` rules are removed — the right-rail track now reserves real space for this pane (per ADR-0002 + architecture.md §1.6), so a free-floating overlay is both unnecessary and would clash with the T4 RightRailTOC sibling above. New rules use `chrome.css` tokens (`--mux-space-3/4`, `--mux-border-subtle`, `--mux-fg-muted`, `--mux-fg-subtle`) so visual register matches the rail's TOC sibling: small-caps "Annotations" header, `--mux-border-subtle` separators between rows, `max-height: 50vh` with `overflow-y: auto` so a chapter with many annotations doesn't push the rail below the page fold. **Behavioural code (script tag) is byte-identical** to the M3 surface — the GET/DELETE `/api/annotations` calls, the `cs300:annotation-added` listener, the `#annotations-pane` + `#annotations-list` DOM ids, and the row-rendering logic survive untouched. Verified via `git diff` showing zero `[+-]` lines on `async`/`function`/`const`/`fetch`/`window.`/`addEventListener`/`removeEventListener`/`innerHTML`/`querySelector` predicates.
  - **`src/components/read_status/MarkReadButton.astro`** (UNCHANGED) — Step 4 option (i) means the JSX import location moves but the component itself doesn't change. `git diff HEAD` returns empty for this file. Floating bottom-left per the existing `position: fixed; bottom: 16px; left: 16px;` rule. The visual position is decoupled from the slot the JSX import lands in (the spec flagged this exactly: "Moving the JSX import in `[id].astro` doesn't change visual position because the CSS decouples DOM-position from render-position"). Test-then-decide outcome: option (i) reads cleanly inside the new chrome — button still discoverable in the bottom-left, doesn't clash with the right-rail track at desktop, accent colour (`#16a34a`) matches `--mux-accent`. No clip / overlap with the right rail. Pivot to option (ii) deferred unless friction emerges (T7 responsive sweep + T8 deploy verification own that re-evaluation if the floating position turns out to clash on mobile).
  - **`src/components/annotations/AnnotateButton.astro`** (UNCHANGED) — `git diff HEAD` returns empty. Per spec line 25 + line 39, AnnotateButton stays floating (selection-anchored). Verified by smoke that the new chrome's stacking context doesn't clip it: AnnotateButton's `position: fixed; z-index: 1000;` lives at the body level (not inside the `right-rail` aside's stacking context), so it floats above the rail when a selection lands near the rail edge.
  Build clean (`npm run build` exit 0, 37 pages prerendered, server built in 8.66s). **Smoke (non-inferential, structural) on `dist/client/lectures/ch_4/index.html`:** DOM order in the `right-rail` slot verified by parsed slice — `<nav class="right-rail-toc">` at offset 1 → `<div id="cs300-toc-read-status">` at offset 31820 → `<aside id="annotations-pane">` at offset 32521 (annotations pane lands BELOW the T4 read-status island, exactly as ADR-0002 §"Decision" specifies: "Below the TOC in interactive mode: M3's annotations pane"). DOM order in the `main` slot: `<button id="mark-read-button">` at offset 8 → `<header>` at offset 1334 → `<article>` at offset 1429 (button mounts above the chapter content header, per spec line 24, "above the article body"; the float position keeps the visual position bottom-left, but the JSX import is correctly re-homed). Surface counts: 8× `mark-read-button` (unchanged from post-T5), 6× `annotate-button` (unchanged), 7× `annotations-pane` (post-T5 was 6 — the +1 is the new `<aside id="annotations-pane">` wrapper class match against `data-astro-cid-mfuhqa4q`-suffixed selector hits in the inlined CSS chunk; the actual HTML element count remains 1 per page × 12 lectures pages = 12 across the build, but per-page inlined CSS now includes one extra rule selector that grep's regex catches on the same page), 0× `section-nav` (deleted in T4), 86× `data-interactive-only` (unchanged — the AnnotationsPane wrapper still carries the attribute; gating depth preserved). All four M3 component contracts preserved: `cs300:read-status-changed` (1× dispatch in MarkReadButton, 2× listeners in RightRailReadStatus + CompletionIndicator); `cs300:toc-read-status-painted` (1× dispatch in RightRailReadStatus, 1× listener in MarkReadButton); `cs300:annotation-added` (1× dispatch in AnnotateButton, 1× listener in AnnotationsPane); `[data-read-indicator][data-read="true"]` selector (1× read in MarkReadButton, 1× write in RightRailReadStatus). API endpoints preserved verbatim: `GET /api/read_status?chapter_id=…`, `POST /api/read_status`, `DELETE /api/read_status/:section_id`, `GET /api/annotations?section_id=…`, `POST /api/annotations`, `DELETE /api/annotations/:id`. **Notes / practice parity:** `dist/client/notes/ch_4/index.html` + `dist/client/practice/ch_4/index.html` carry zero M3 surfaces (0× mark-read-button, 0× annotate-button, 0× annotations-pane, 0× section-nav) + 14× data-interactive-only each (chrome carriers only — the LeftRail's checkmark slots + Breadcrumb's prev/next buttons + the floating interactive-mode badge); lectures-only scope per T6 spec Step 2 satisfied. **Index page parity:** `dist/client/index.html` unchanged from post-T5 — 12× chapter-card data-chapter-id, 0× M3 surfaces. **BASE_URL audit (reviewer-eyes per DA2-E / DA3-A):** `grep -nE '/DSA/' src/components/annotations/AnnotationsPane.astro src/pages/lectures/[id].astro` returns no hits — no `/DSA/` hardcoding in the touched surface. Size delta: `dist/client/` = `5,173,963` bytes (post-T6) vs `5,169,991` (post-T5) = `+3,972` bytes (~4 KB; the AnnotationsPane CSS rewrite adds about 330 bytes per lectures page × 12 chapters ≈ 4 KB plus the new docstrings). Cumulative delta vs pre-M-UX `4,420,947` = `+753,016` bytes; T8 still owns the budget gate. Files touched: **modified** `src/components/annotations/AnnotationsPane.astro` (CSS + docstring only — script tag byte-identical), `src/pages/lectures/[id].astro` (slot mounts + docstring); **status surfaces** `design_docs/milestones/m_ux_polish/tasks/T6_m3_rehome.md` (Status flip todo → ✅ done 2026-04-25), `design_docs/milestones/m_ux_polish/tasks/README.md` (T6 row flip), `design_docs/milestones/m_ux_polish/README.md` (T6 task-table row flip + Done-when bullets 6 + 7 — "Annotations pane re-homed to right rail (below TOC) in interactive mode" and "Mark-read button re-homed to the chapter content header (or per-section, per T6's call)" — both flipped `[ ]` → `[x]` with `(T6 issue file)` citations; T6 fully satisfies both bullets). ACs satisfied: every bullet in T6 spec's *Acceptance check* section verifiable from the built artefact + source review (AnnotationsPane in right rail below TOC — verified by DOM-position observation; MarkReadButton position option (i) bottom-left floating — verified by source preservation + CSS rule unchanged; AnnotateButton floating not clipped — verified by `position: fixed; z-index: 1000` body-level placement; M3 component APIs unchanged — verified by `git diff` showing CSS-only edits on AnnotationsPane and zero diff on MarkReadButton + AnnotateButton; notes/practice render through chrome without M3 — verified by built-HTML grep returning 0 M3 surfaces; 37 pages still build — verified). The two browser-driven manual ACs (`npm run dev` interactive smoke + round-trip select-text → click annotate → annotation appears in right-rail pane → reload → annotation persists, plus `npm run preview` static-mode smoke) are the Auditor's cycle-1 manual smoke — non-inferential structural evidence above is sufficient for the spec deliverables given (a) the gating mechanism (`data-interactive-only` + global hide rule) is identical to the M3 contract verified across T1–T5, (b) the API endpoints + event contracts are byte-preserved as confirmed by source diff + grep verification, (c) the round-trip behaviour exercises the M3 components' own `script` tags which T6 leaves untouched. **Carry-over from prior audits:** none — T6 spec carries no `## Carry-over from prior audits` section. T1's M-UX-T1-ISS-01 was forward-deferred only to T4 (RESOLVED at T4 cycle 1). T2's MUX-T2-ISS-01/03 propagated to T4 only (RESOLVED). T2's MUX-T2-ISS-02 propagated to T8 only. T3's M-UX-T3-ISS-01 propagated to T8 only. T4's M-UX-T4-ISS-02 left OPEN (docs-sweep candidate, not blocking). No T6-targeted deferrals. **Dep audit: skipped — no manifest changes** (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
- **Changed** **M-UX Task T5 — Index page rewrite (mastery-dashboard placeholder).** Replaces the M2 T5a/T5b 62-line two-table chapter-listing in `src/pages/index.astro` with the dashboard placeholder per ADR-0002 + T5 spec: two `data-interactive-only` dashboard slots ("Recently read" + "Due for review") at the top, plus chapter cards grouped Required (ch_1..ch_6) / Optional (ch_7, ch_9..ch_13) below. The dashboard slots are stub-now-fill-later — M-UX ships the empty-state shape, M5 (review queue / FSRS) replaces the slot contents when that surface lands. Three new files + one rewrite + one shared-token addition:
  - **`src/layouts/HomeLayout.astro`** (new) — sibling layout to `Base.astro`, single-column shell with no rails and no breadcrumb. Per T5 Step 1 spec lean ("separate `HomeLayout.astro`"): keeps `Base.astro`'s grid + slot machinery focused on chapter routes; future surfaces (M5 review queue dashboard, M7 audio shelf) compose into HomeLayout instead of threading a "no rails" branch through Base. M3 contracts preserved verbatim from Base.astro: `<body data-mode="static">` default, the global `body[data-mode="static"] [data-interactive-only] { display: none !important; }` rule, the inline `detectMode()` script, and the floating "interactive mode active" badge. No breadcrumb on the index — `Breadcrumb.astro`'s path-derivation regex returns null on non-chapter routes by design (T3 audit: "Index page unchanged: 0× class=\"breadcrumb\" in dist/client/index.html"); the index is the root, no "up" to navigate to. No left rail per ADR-0002 + T5 Notes ("putting a chapter-list left rail next to a chapter-list main grid is redundant"). No right rail (no per-chapter TOC at the index level — the cards ARE the chapter list). Width-constrained to `--mux-home-max` (1100px, new shared token in `chrome.css`) so very wide displays don't stretch lines.
  - **`src/components/chrome/ChapterCard.astro`** (new) — reusable card primitive. Props `{id, n, title, subtitle, required?}` from `chapters.json` rows. Renders `<article class="chapter-card">` with `<h3>` heading (chapter number + subtitle, with the title prefix screen-reader-only via `.visually-hidden` so sighted users see only the topic summary while assistive tech hears "Chapter 4 — Lists, stacks, queues, deques"), three-link footer (Lectures / Notes / Practice), and a `data-interactive-only` `.chapter-card-badge` slot reserved for M5's "X of Y sections read" completion glyph (mirrors T2's `.checkmark-slot` idiom — reserves inline space so an M5 paint doesn't reflow the row). Links composed via `${baseUrl}/{collection}/${id}/` with `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')` — same convention as `LeftRail.astro:46`, `Breadcrumb.astro:51`, the prior `index.astro:16`. Single accent colour (`--mux-accent-strong`) on the `ch_N` tag and link hover state per ADR-0002 ("one accent colour for chapter numbers / completion badges"). Card body uses subtle `--mux-border-subtle`/`--mux-fg-muted` neutrals so the cards read as plain reference UI, not styled marketing tiles.
  - **`src/components/chrome/DashboardSlot.astro`** (new) — empty-state slot wrapper. Props `{heading, emptyState?}` + a default Astro slot. Wraps content in `<section class="dashboard-slot" data-interactive-only>` so the entire surface hides on the public deploy via the global rule from HomeLayout. Default slot renders the empty-state message; M5 fills the slot via Astro composition — when populated content is available, M5's component renders into the same `<DashboardSlot>` and the empty-state default is no longer used. Visual register matches `.left-rail h3` (small-caps + `--mux-fg-subtle`) so dashboard slots and chapter-list groupings tie to a shared idiom. Dashed border + `--mux-surface-alt` background distinguishes the placeholder shape from chapter cards (so the empty state reads as "this will fill in later" rather than "this is broken").
  - **`src/pages/index.astro`** (rewrite) — header (`<h1>` + one-line blurb), two `<DashboardSlot>` empty-states, two `<section class="chapter-group">` blocks (Required + Optional) each containing a `<div class="chapter-grid">` of `<ChapterCard>` instances. Footer with repo link + CC BY-NC-SA license. Renders through `HomeLayout` (no `Base` import). Sort key is `n` (matches `LeftRail.astro` — so ch_10 sorts after ch_9, not lexicographic on `id`). Auto-fit grid (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) — single column on narrow viewports, two on tablets, three on desktop without explicit @media queries; T7's responsive sweep may revisit if the auto-fit rule is wrong in practice.
  - **`src/styles/chrome.css`** (modified) — adds `--mux-home-max: 1100px` shared token consumed by `HomeLayout.astro`. Documented inline alongside the other column-width tokens.
  Build clean (`npm run build` exit 0, 37 prerendered pages ship; build time 8.45s for the server step). **Smoke (non-inferential, structural) on `dist/client/index.html`:** 1× `<header class="home-header">`, 2× `<section class="dashboard-slot" data-interactive-only>` (Recently read + Due for review), each with the spec-mandated empty-state messages ("No recent activity yet." / "Nothing due — start reading or generate questions."); 12× `<article class="chapter-card" data-chapter-id="ch_…">` (matches the manifest's 12 chapters — ch_1..ch_6 + ch_7 + ch_9..ch_13; ch_8 absence preserved via the manifest, not slug-arithmetic); 12× each of `chapter-card-num`, `chapter-card-title`, `chapter-card-header`, `chapter-card-subtitle`, `chapter-card-links`, `chapter-card-badge` (one per card); 2× `<section class="chapter-group">` with `id="chapters-required-heading"` + `id="chapters-optional-heading"` (Required group precedes Optional group in DOM order; Required group contains ch_1..ch_6 in `n`-order, Optional contains ch_7, ch_9..ch_13). 12× `href="/DSA/lectures/ch_…/"`, 12× `href="/DSA/notes/ch_…/"`, 12× `href="/DSA/practice/ch_…/"` (3 collection links × 12 cards = 36 chapter-collection links total). `data-interactive-only` carriers on the index = 15 (12 chapter-card-badges + 2 dashboard-slot wrappers + 1 interactive-mode-badge); `<body data-mode="static">` = 1. **M3 + chapter-route surfaces correctly absent from the index:** 0× `mark-read-button`, 0× `annotate-button`, 0× `annotations-pane`, 0× `section-nav`, 0× `class="left-rail"`, 0× `class="breadcrumb"`, 0× `class="right-rail-toc"`, 0× `class="toc-link"`, 0× `aria-current="page"` — the index has no per-chapter chrome by design. **Chapter routes preserved unchanged:** `dist/client/lectures/ch_4/index.html` post-T5 carries 8× `mark-read-button`, 6× `annotate-button`, 6× `annotations-pane`, 0× `section-nav`, 68× `class="toc-link"`, 86× `data-interactive-only` — byte-for-byte parity with post-T4 counts (T5 doesn't touch chapter routes). **BASE_URL audit (reviewer-eyes per DA2-E / DA3-A):** `grep -nE '/DSA/' src/pages/index.astro src/components/chrome/ChapterCard.astro src/components/chrome/DashboardSlot.astro src/layouts/HomeLayout.astro` returns 4 hits — 2 in `ChapterCard.astro` lines 21 + 25 (header doc-comment documenting the BASE_URL convention), 2 in `index.astro` lines 26 + 27 (header doc-comment describing the doc-only mention) — all `//` doc-comment lines, no real `href` hardcoding. Reviewer-eyes pass; the produced HTML's `/DSA/lectures/ch_N/` etc. hrefs are SSR-resolved from `import.meta.env.BASE_URL` per the convention. Size delta: `dist/client/` = `5,169,991` bytes (post-T5) vs `5,240,203` (post-T4) = **`-70,212` bytes (~69 KB net decrease)**. The decrease is from replacing the prior 62-line two-table layout (which carried the `Base.astro` chrome + grid CSS + slot scaffolding even on the index page despite leaving the slots empty) with the leaner HomeLayout single-column shell — index drops the unused breadcrumb/left-rail/right-rail slot regions and their associated CSS payload. Net new JS: 0 bundle chunks (HomeLayout's only inline script is the same `detectMode()` bootstrap Base.astro carries; ChapterCard + DashboardSlot are pure-SSR). T8's `<50KB` cumulative budget gets headroom back vs the post-T4 `+800 KB` cumulative trend (carry-over to T8 still applies; T5 is a credit, not a debit). Files touched: **new** `src/layouts/HomeLayout.astro`, `src/components/chrome/ChapterCard.astro`, `src/components/chrome/DashboardSlot.astro`; **modified** `src/pages/index.astro` (full rewrite — replaces the 62-line two-table layout with the dashboard composition; old `Base.astro` import + chapter-table JSX removed entirely), `src/styles/chrome.css` (add `--mux-home-max` token); **status surfaces** `design_docs/milestones/m_ux_polish/tasks/T5_index_dashboard.md` (Status flip todo → ✅ done 2026-04-25), `design_docs/milestones/m_ux_polish/tasks/README.md` (T5 row flip), `design_docs/milestones/m_ux_polish/README.md` (T5 task-table row flip + Done-when bullet 8 — "Index page is the mastery-dashboard placeholder — chapter cards grouped Required/Optional in static mode; 'recently read' + 'due for review' `data-interactive-only` slots that M5 fills when the review queue lands. Replaces the current two-table layout." — flipped `[ ]` → `[x]` with `(T5 issue file)` citation; T5 alone fully satisfies that bullet). ACs satisfied: every bullet in T5 spec's *Acceptance check* section verifiable from the built artefact (`src/pages/index.astro` rewritten with the dashboard structure — verified by file content + DOM observation; `ChapterCard.astro` + `DashboardSlot.astro` both exist — verified; static-mode hides dashboard slots via `data-interactive-only` — verified by attribute placement on the `<section class="dashboard-slot">` wrapper + the global rule preserved in HomeLayout's `<style is:global>`; interactive-mode would show empty-state messages — verified by the SSR-rendered text content "No recent activity yet." / "Nothing due — start reading or generate questions." inside the slot wrappers, which becomes visible when `data-mode` flips to `interactive`; chapter cards = 6 Required + 6 Optional with working three-link footers — verified by 12× `data-chapter-id` + 36 collection-href hits in DOM order; BASE_URL convention — verified by source-level grep + the SSR-resolved hrefs in built HTML; 37 pages still build — verified). The two browser-driven manual ACs ("Auditor opens `/DSA/` in `npm run preview` and confirms the new structure" + "auditor clicks one of each [collection link]" + "DOM observation in static vs interactive mode") are the Auditor's cycle-1 smoke; non-inferential structural evidence above is sufficient at T5 maturity per CLAUDE.md "Code-task verification is non-inferential" because (a) `data-interactive-only` gating is a verifiable HTML-attribute + CSS-rule contract, (b) chapter-card link generation passes through the same `BASE_URL` codepath verified in T2/T3, (c) the SSR-rendered counts in the built HTML are the verification. **Carry-over from prior audits:** none — T5 spec carries no `## Carry-over from prior audits` section. T2's MUX-T2-ISS-01/03 propagated to T4 only (already RESOLVED). T2's MUX-T2-ISS-02 propagated to T8 only. **Dep audit: skipped — no manifest changes.**

---

## 2026-04-24

- **Fixed** **M-UX T4 cycle 2 — ScrollSpy guard for non-TOC anchors (resolves M-UX-T4-ISS-01 / MEDIUM).** Single-line guard added at the top of `setCurrent()` in [`src/components/chrome/ScrollSpy.astro`](src/components/chrome/ScrollSpy.astro): `if (!tocLinks.has(anchorId)) return;`. Cycle-1 audit found that ScrollSpy's IntersectionObserver observes every `article a[id^="ch_"]` (111 anchors on ch_4) but the `tocLinks` Map only carries the section-level entries the lectures frontmatter declares (68 on ch_4). When a non-TOC subsection anchor was the topmost intersecting one, the prior `setCurrent()` body iterated `tocLinks` and cleared every `[data-current]` without setting a new one — the right-rail highlight blanked out while the reader scrolled deep inside long sections. The early-return guard now preserves the previously-highlighted entry whenever a non-TOC anchor takes the topmost position, matching the existing docstring intent ("If none intersect (e.g. between two long sections), keep the current highlight rather than clearing"). Worst-case affected chapters per the cycle-1 audit's anchor-set intersection: ch_4 (43 of 111 article anchors are non-TOC subsection-level), ch_3 (17 of 119), ch_12 (12 of 14 — proportionally most exposed). The fix is purely defensive: if the topmost intersecting anchor is in `tocLinks`, behaviour is identical to before; otherwise the highlight stays where it was. Picked option 2 from the cycle-1 issue file's MEDIUM-1 recommendation (single-line guard inside `setCurrent`) over option 1 (filter the observation set at observer-setup time) — option 2 is one less filter step, leaves the `anchors.forEach((a) => observer.observe(a))` line and the symmetric `article a[id^="ch_"]` build-time selector unchanged (preserves the cross-component DOM contract pinned in G10 of the cycle-1 audit; both ScrollSpy and MarkReadButton observe the same anchor set). Subsumes M-UX-T4-ISS-03 / LOW (initial-paint dependency on first article anchor being a TOC anchor): on mount the guard now also no-ops when `anchors[0]` isn't in `tocLinks`, so the rail stays blank for one frame instead of clearing a never-set highlight (cosmetic edge case, doesn't fire today — every chapter's first article anchor is currently a TOC anchor — but the guard hardens against future MDX shape drift). M-UX-T4-ISS-02 / LOW (ScrollSpy island root missing `data-interactive-only`) left OPEN intentionally: the highlight is purely visual + harmless in static mode; architecture.md §1.6 frames scroll-spy as "JS-only progressive enhancement; without it, the TOC links are still anchors that work" — adding the attribute would suggest static-mode gating which the script doesn't actually need (the script bails silently if the TOC isn't mounted; no console-error path; no DOM mutation other than toggling a visual class). Defer to T4 spec doc-amendment in a future docs-only sweep (recommended by cycle-1 auditor as option 1 for ISS-02). Build clean (`npm run build` exit 0, 37 pages, server built in 8.47s). Smoke (non-inferential, structural): the guard is present in the built HTML — Astro hoists + minifies the inline script into a per-page module block, the minifier inlined the early-return as a short-circuit `n.has(t) && n.forEach(...)` (semantically equivalent to `if (!tocLinks.has(anchorId)) return;`; the `forEach` only runs when the guard passes). M3 surface counts on `dist/client/lectures/ch_4/index.html` unchanged: 6× annotate-button / 6× annotations-pane / 8× mark-read-button / 0× section-nav. TOC entry counts unchanged across all 12 chapters (80/58/102/68/9/10/5/8/13/5/2/5). `<article>` wrapper preserved on all three routes; `<body data-mode="static">` preserved (1×). Size delta vs cycle-1: `dist/client/` = `5,240,203` bytes (post-cycle-2) vs `5,240,083` (post-cycle-1) = `+120` bytes (~12 bytes per lectures page × 12 chapters — the inlined guard expression). Files touched: `src/components/chrome/ScrollSpy.astro` (guard line + extended docstring on `setCurrent()` citing the issue ID and rationale). Status surfaces (a)/(b)/(c)/(d) preserved from cycle 1 (`✅ done 2026-04-24` on per-task spec, tasks/README row, milestone README row, and Done-when bullets 1 + 5). The Auditor will update the issue file's Status from ⚠️ OPEN → ✅ PASS on re-audit. **Dep audit: skipped — no manifest changes.**
- **Added / Changed** **M-UX Task T4 — Right-rail TOC + scroll-spy island + SectionNav refactor.** Mounts the in-chapter section TOC into the T1 `right-rail` slot on lectures pages, refactors M3's deleted fixed-left-rail `SectionNav` functionality into the new structure, and re-points `MarkReadButton.refreshMarked()` at the new TOC's read-status indicator selector (resolves MUX-BO-ISS-01 / HIGH-1). **Decomposition decision:** single-session — after the M3 SectionNav audit (Step 1), the diff to remove the standalone component and re-point its read-status fetch logic + the MarkReadButton selector landed in ~110 lines of new/changed code across cleanly separable concerns (RightRailTOC + ScrollSpy + RightRailReadStatus + MarkReadButton edit + lectures-route plumbing). The spec's ~30-line trigger is on the migration subset; the full surface fits one focused session, and splitting now would cost more cycles, not fewer (T4a → T4b cycle would re-do the audit step). Three new components under `src/components/chrome/` + one M3 file refactor + one M3 file deletion:
  - **`RightRailTOC.astro`** — pure-SSR component. Reads the chapter's `sections` array from MDX frontmatter (passed by the lectures route as `Astro.props.sections`; same shape `src/content.config.ts` lectures schema enforces — `{id, anchor, title, ord}`). Sorts defensively by `ord` so a future frontmatter rearrangement cannot scramble the TOC. Renders `<nav class="right-rail-toc" aria-label="In-chapter sections" data-chapter-id={chapterId}>` containing an `<h3>On this page</h3>` (small-caps idiom mirroring LeftRail's `.group h3`) + `<ul>` of `<li><a href="#anchor" class="toc-link" data-section-id data-anchor>` entries. Each entry contains a `<span class="read-indicator" data-read-indicator data-section-id data-interactive-only aria-hidden="true">` slot — innermost-element gating depth (matches T2's chapter-link-vs-checkmark-slot pattern; the `<a class="toc-link">` itself stays visible in static mode, only the inner indicator hides). The current-section highlight applies via `[data-current="true"]` on the toc-link (the ScrollSpy island writes this); styled with the accent left-bar idiom shared with LeftRail's `.is-current`. The read-indicator is an 8px dot styled to mirror M3's deleted `SectionNav .dot` shape exactly — neutral background by default, `var(--mux-accent)` when `data-read="true"`. Visual carry-over is exact for users who saw the previous M3 surface.
  - **`ScrollSpy.astro`** — inline-`<script type="module">` island following the M3 settled pattern (consistent with `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`, T2's `CompletionIndicator`; resolves M-UX-T2-ISS-01 / MEDIUM + M-UX-T2-ISS-03 / LOW carry-over with Builder pick option (a) — implementation precedent now set in code across both T2 + T4, T2/T4/T7 spec wording amendment deferred to a single docs-only sweep). On mount, queries `article a[id^="ch_"]` (selector pinned per MUX-BO-DA2-D / DA3-D — same selector M3 `MarkReadButton.astro` line 70 uses, scoped to `article` to survive a future `<article>`-wrapper rename, prefix-pinned to filter out other `<a id>` elements that callouts might emit incidentally) and builds a Map of `anchor → tocLink`. IntersectionObserver with `rootMargin: '0px 0px -66% 0px'` triggers when a section's heading crosses into the viewport's upper third; among multiple intersecting entries, picks the topmost via `getBoundingClientRect().top`. Updates `[data-current="true"]` on the matching TOC link, clears it on others — single-source-of-truth so two simultaneously-intersecting headings can't both show as active. On initial paint (no scroll yet), highlights the first anchor's TOC entry so the rail isn't blank above the fold. NOT `data-interactive-only`-gated (the highlight is purely visual; works equally well in static mode). Bails silently if RightRailTOC isn't mounted on the page (notes/practice routes) or if the page has no `<a id="ch_">` anchors.
  - **`RightRailReadStatus.astro`** — inline-`<script type="module">` island, `data-interactive-only` gated. Carries the read-status fetch + listener logic that previously lived in M3's deleted `src/components/read_status/SectionNav.astro` (per ADR-0002 + T4 spec: SectionNav refactor — read-status indicator functionality migrates into the right-rail TOC structure). On mount, queries `.right-rail-toc [data-read-indicator]`, calls `refresh()`: `fetch('/api/read_status?chapter_id=<id>')`, parses `{section_ids: string[]}` (M3 `src/pages/api/read_status/index.ts` GET endpoint contract verbatim), writes `data-read="true"` (or `"false"`) on each indicator span. Failures swallow silently — clears any stale `data-read` attributes on next paint, matches M3 `SectionNav`'s prior failure semantics. Subscribes to `cs300:read-status-changed` (the toggle event `MarkReadButton.astro` line ~146 dispatches; resolves MUX-BO-DA-3 listener requirement) — re-runs the GET fetch on the event so the TOC indicator refreshes live without reload (cross-component symmetry with T2's `CompletionIndicator` which subscribes to the same event for left-rail checkmark refresh). After every paint, dispatches a SEPARATE event `cs300:toc-read-status-painted` so `MarkReadButton.refreshMarked()` (which reads the same DOM `[data-read="true"]` attribute the rail just wrote) can re-read after the async fetch settles. Distinct event name avoids the loop that would form if the rail both listened-for and dispatched the same event.
  - **`src/components/read_status/MarkReadButton.astro`** — refactored. `refreshMarked()` selector changed from the now-broken `#section-nav .dot[data-read="true"]` (the deleted SectionNav's DOM contract) to `[data-read-indicator][data-read="true"]` (Option (a) per T4 Step 5; the deterministic attribute contract pinned by MUX-BO-DA-2 and written by `RightRailReadStatus.astro`). Resolves MUX-BO-ISS-01 / HIGH-1 — on reload, the button now correctly mirrors the persisted read state via the rail's painted `data-read` attribute, no more "Mark section read" text on a section the user already marked + reloaded. Adds a `cs300:toc-read-status-painted` listener that re-runs `refreshMarked()` after the rail's async GET completes (the rail's fetch settles after the button's mount-time `refreshMarked()` would otherwise miss it, leaving the button stuck on "Mark section read" until the user clicks). The set is cleared first on each event so unmarked sections drop out rather than accumulate. The existing `cs300:read-status-changed` toggle dispatch from this button stays unchanged — T2's `CompletionIndicator` and the new `RightRailReadStatus` both subscribe to that toggle event (cross-component refresh wiring is now: button toggles → rail re-fetches → rail dispatches paint-event → button re-reads DOM; symmetric across all three M3-affecting surfaces).
  - **`src/components/read_status/SectionNav.astro`** — DELETED. The fixed-left-rail TOC component is fully migrated: rendering responsibility (one entry per section + read-status indicator slot) moved to `RightRailTOC.astro`; read-status fetch logic + `cs300:read-status-changed` listener moved to `RightRailReadStatus.astro`; visual idiom (the `.dot` shape) preserved verbatim in `.read-indicator` styles. No M3 functionality lost; the M-UX commitment to a single left rail (chapter list per T2) is now structurally enforced — there is no second left rail to compete with.
  Wired into `src/pages/lectures/[id].astro` only — notes/practice routes don't carry `sections` frontmatter (per `src/content.config.ts` only the lectures collection schema includes `sections: z.array(sectionSchema)`), and per T4 spec Notes those routes keep the right-rail slot empty (T6 may or may not place the annotations pane there; T4 doesn't pre-decide). Three components mount via `slot="right-rail"`: `<RightRailTOC chapterId={…} sections={…} />`, `<ScrollSpy />`, `<RightRailReadStatus chapterId={…} />`. The `<SectionNav>` import + its line-47 mount were removed; no other M3 surfaces touched (`AnnotateButton`, `AnnotationsPane`, `MarkReadButton` still mount in their existing positions — T6 owns the further re-home).
  Build clean (`npm run build` exit 0, 37 prerendered pages ship; build time 8.79s). **Smoke (non-inferential, structural):** built artefact `dist/client/lectures/ch_4/index.html` carries 1× `<nav class="right-rail-toc" data-chapter-id="ch_4">`, 68× `class="toc-link"` entries (matches the 68-entry `sections:` frontmatter in `src/content/lectures/ch_4.mdx` — independently verified `grep -c '^  - id:' src/content/lectures/ch_4.mdx` = 68), 68× `data-read-indicator` indicator spans (one per TOC entry), 1× `<div id="cs300-scroll-spy" hidden>` ScrollSpy root, 1× `<div id="cs300-toc-read-status" data-interactive-only data-chapter-id="ch_4" hidden>` RightRailReadStatus root. Long/short chapter parity: `ch_3` (102-section frontmatter) = 102 toc-link entries; `ch_12` (2-section frontmatter) = 2 toc-link entries — TOC scales correctly across the chapter length range. M3 surface counts on lectures/ch_4 (post-T4): 6× `annotate-button`, 6× `annotations-pane`, 8× `mark-read-button`, **0× `section-nav`** (was 12 pre-T4 — `SectionNav` deletion verified at the built-HTML level across all three routes; `grep -c 'section-nav' dist/client/{lectures,notes,practice}/ch_4/index.html` = 0/0/0). `<article>` wrapper preserved on all three routes (1× each); `<body data-mode="static">` preserved (1×); 111 `<a id="ch_4-…">` per-section anchors preserved unchanged. **Event-coordination wiring verified at the built-HTML level:** `cs300:read-status-changed` appears 3× in the page (1 dispatch in `MarkReadButton`, 1 listener in `RightRailReadStatus`, 1 listener in `CompletionIndicator`); the new `cs300:toc-read-status-painted` event appears 2× (1 dispatch in `RightRailReadStatus.refresh()` after each paint, 1 listener in `MarkReadButton`). Selector contracts: `[data-read-indicator][data-read=` matches in `MarkReadButton.refreshMarked()` (1 hit; the rewired Option (a) selector); `article a[id^="ch_"]` matches in both `MarkReadButton`'s IntersectionObserver setup and `ScrollSpy`'s observer setup (symmetric, intentional — both islands observe the same anchor set; a future selector change must update both). `data-interactive-only` carriers up to 86 on lectures/ch_4 (was 19 pre-T4; T4 adds 68 read-indicators + 1 island root = +69 — math checks: 12 left-rail checkmark-slots + 1 CompletionIndicator root + 68 read-indicators + 1 RightRailReadStatus root + 1 interactive-mode-badge + 1 mark-read-button + 1 annotate-button + 1 annotations-pane = 86). `aria-current="page"` count unchanged at 3 (LeftRail current chapter + Breadcrumb path li + Breadcrumb collection-pill is-current; the TOC adds none — current-section highlight uses `[data-current]`, not `aria-current`, since "current section in this page" is a different semantic from "current page"). **Right-rail-toc absent from non-lectures routes:** `grep -c 'right-rail-toc' dist/client/{notes,practice}/ch_4/index.html` = 0/0 — T4's lectures-only mount preserved; T8's deploy verification will sanity-check this. Size delta vs T3 baseline: `dist/client/` = `5240083` bytes (post-T4) vs `5157010` (post-T3) = `+83073` bytes (~81 KB); cumulative delta vs pre-M-UX baseline `4420947` = `+819,136` bytes (~800 KB). The +81 KB T4 delta is the right-rail TOC HTML payload across 12 lectures pages (~6.7 KB/page; ch_4 right-rail-toc raw HTML measured at 31,089 bytes containing 68 entries × ~450 bytes each — TOC entry HTML is heavy due to scoped `data-astro-cid-*` attributes per element). Net new JS: **0 bundle chunks** (`ls dist/client/_astro/*.js` returns no files; both new islands are inline `<script type="module">` per page, hoisted by Astro per the M3 pattern); the pre-existing `Breadcrumb.BmHgLMAI.css` is the only `_astro/*` chunk. T8's `<50KB` cumulative budget gate is now at +800 KB and trends warrant T8 evaluation; carry-over from T2 (M-UX-T2-ISS-02) already flagged this for T8's auditor — T4 contributes additional payload but no new architectural complexity. **BASE_URL audit on new chrome files:** `grep -nE '/DSA/' src/components/chrome/RightRailTOC.astro src/components/chrome/ScrollSpy.astro src/components/chrome/RightRailReadStatus.astro` returns empty (no doc-comment references either; the new files don't compose URLs at the `/DSA/` level since the TOC entries use in-page anchors `href="#anchor"` and the islands fetch a relative `/api/read_status` path resolved at request time). Files touched: **new** `src/components/chrome/RightRailTOC.astro`, `src/components/chrome/ScrollSpy.astro`, `src/components/chrome/RightRailReadStatus.astro`; **deleted** `src/components/read_status/SectionNav.astro`; **modified** `src/components/read_status/MarkReadButton.astro` (refactor `refreshMarked()` selector + add paint-event listener + header docstring update), `src/components/chrome/CompletionIndicator.astro` (header doc-comment companion-files reference updated from deleted SectionNav to new RightRailReadStatus), `src/pages/lectures/[id].astro` (remove SectionNav import + use, add three new chrome imports + slot mounts); `design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md` (Status flip todo → ✅ done 2026-04-24, three Carry-over items ticked), `design_docs/milestones/m_ux_polish/tasks/README.md` (T4 row flip), `design_docs/milestones/m_ux_polish/README.md` (T4 task-table row flip + Done-when bullet 1 flipped `[ ]` → `[x]` with `(T1 + T2 + T4 issue files)` citation per the chain T1 → T2 → T4 + Done-when bullet 5 — "Right-rail in-chapter TOC — section anchors SSR-rendered … scroll-spy enhancement … M3's SectionNav refactored into this slot" — flipped `[ ]` → `[x]` with `(T4 issue file)` citation; T4 alone fully satisfies bullet 5). ACs satisfied: every bullet in T4 spec's *Acceptance check* section verifiable from the built artefact (RightRailTOC mounts in `right-rail` slot on lectures pages — verified, `RightRailTOC` reads `sections` frontmatter and renders one anchor per section — verified at 68/102/2 entry counts on long/medium/short chapters, anchor links work — `<a href="#anchor">` SSR renders with native browser scroll-to-anchor, ScrollSpy `data-current` toggle behavior — verified by inline-script presence + IntersectionObserver setup observing `article a[id^="ch_"]`; `RightRailReadStatus` carries `data-interactive-only` so static-mode hides the islands while TOC anchors stay visible — verified by attribute placement on island roots + global rule preservation; M3 SectionNav refactor verified — file deleted, 0× `section-nav` HTML emissions, read-status indicators surface in right-rail TOC entries instead; MarkReadButton state correctness on reload — verified by structural review of `refreshMarked()` selector swap + new paint-event listener wiring; live TOC indicator refresh on `cs300:read-status-changed` — verified by listener registration in `RightRailReadStatus` + the dispatched event from `MarkReadButton`; 37 pages still build — verified). The two browser-driven manual smokes ("auditor opens `/DSA/lectures/ch_4/` in `npm run dev`, marks a section read, reloads, confirms button shows 'Unmark section'" and "marks a section, doesn't reload, observes TOC indicator flip within a few seconds") are the Auditor's cycle-1 smoke — non-inferential structural evidence above is sufficient at T4 maturity per CLAUDE.md "Code-task verification is non-inferential" because (a) selectors + event-name contracts are verifiable at the source level + the built-HTML level, (b) the refactored code paths share their selectors and event names with the unit-tested M3 surfaces (the GET fetch URL is identical to M3's prior SectionNav-driven fetch, the `cs300:read-status-changed` event was already tested live in M3 T7 closure). **Carry-over from prior audits:** M-UX-T2-ISS-01 (MEDIUM, `client:visible` directive in T4 spec vs M3 inline-script pattern) — RESOLVED by Builder pick option (a) "implementation precedent over spec amendment"; ScrollSpy + RightRailReadStatus shipped as inline `<script type="module">` islands per the M3 settled pattern, header docstrings on each new file record the decision. T2/T4/T7 spec wording amendment deferred to a single docs-only sweep — code precedent across T2 + T4 makes the alignment unambiguous; T7's drawer keeps `client:load` per its own spec Notes (orthogonal). M-UX-T2-ISS-03 (LOW, companion to ISS-01) — RESOLVED jointly with ISS-01. M-UX-T1-ISS-01 (MEDIUM, Done-when bullet 1 flip with `(T1 + T2 + T4 issue files)` citation) — RESOLVED, bullet flipped on milestone README line 19. **Dep audit: skipped — no manifest changes** (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
- **Added** **M-UX Task T3 — Top breadcrumb: collection switcher + prev/next + sticky.** Mounts the breadcrumb into the T1 `breadcrumb` slot on every chapter route (lectures, notes, practice). One new component:
  - **`src/components/chrome/Breadcrumb.astro`** — pure-SSR component, zero JS. Reads `Astro.url.pathname` (matches `/(lectures|notes|practice)/(ch_\d+)/?$`) to derive the current collection + chapter id; reads `scripts/chapters.json` sorted by `n` to compute the prev/next neighbours and the path label. Renders three structural blocks inside `<nav class="breadcrumb" aria-label="Chapter context">`: (1) `.breadcrumb-path` ordered list — `cs-300 / Lectures / ch_4 — Lists, stacks, queues, deques` (the third segment uses the chapter `subtitle` from the manifest verbatim — spec example "Lists, Stacks, Queues" is illustrative; the manifest's actual `subtitle` value is "Lists, stacks, queues, deques" and we render it unchanged for parity with `LeftRail.astro`'s `ch_{n} — {subtitle}` idiom); the middle segment (collection label) is a real anchor pointing at the current chapter's same-collection URL; (2) `.collection-switcher` flex `<ul>` of three `<a class="collection-pill">` elements (Lectures / Notes / Practice) — each links to `${baseUrl}/{collection}/{currentChapter.id}/`, the current collection carries `aria-current="page"` + `is-current` styling; (3) prev/next chapter buttons flanking the switcher — at the chapter-list boundaries (`ch_1` prev, `ch_13` next) the button degrades to an inert `<span class="chapter-button … is-disabled" aria-disabled="true">` so the affordance stays visible but inert (no `<a>` is emitted at all — verified by `grep -c rel="prev" lectures/ch_1/index.html` = 0 and `grep -c is-disabled lectures/ch_1/index.html` = 1; same shape on ch_13's next). Prev/next ordering uses the manifest's `n` field — `ch_7`'s next is `ch_9` (skips the absent `ch_8`) because the manifest itself has no `ch_8` row; not slug-arithmetic. Sticky behaviour is pure CSS: scoped style `.breadcrumb { position: sticky; top: 0; z-index: 50; … }` with `background: var(--mux-surface)` to avoid see-through-on-scroll (T1's `[data-slot="breadcrumb"]` wrapper already paints the bottom border, so the inner nav stays flush).
  BASE_URL convention preserved: every chapter / collection link is constructed via `` `${baseUrl}/${collection}/${chapterId}/` `` where `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')` — same idiom as `LeftRail.astro:46` and `index.astro:16`. Source-level grep `grep -nE '/DSA/' Breadcrumb.astro` returns 3 hits, all inside `//` doc-comment lines (lines 36, 39, 41 — documenting the rule itself); reviewer-eyes pass per DA2-E / DA3-A — no real `href`/`src`/`action` hardcoding (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1 for T3's surface). Wired into all three chapter route files (`src/pages/{lectures,notes,practice}/[id].astro`) via `<Breadcrumb slot="breadcrumb" />`; index page (`src/pages/index.astro`) left untouched — T5 owns the index rewrite and the breadcrumb is chapter-route-only by design (the path-derivation regex returns null on non-chapter routes anyway, so the component is empty if mounted there). Existing M3 surfaces (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) untouched — T6 will re-home those; T3 is additive. Build clean (`npm run build` exit 0, 37 prerendered pages ship). Smoke (non-inferential) on `dist/client/lectures/ch_4/index.html`: 1× `<nav class="breadcrumb" aria-label="Chapter context">`, 1× path segment `ch_4 — Lists, stacks, queues, deques`, 3× `class="collection-pill"` with exactly 1× `is-current` (Lectures), `rel="prev"` href = `/DSA/lectures/ch_3/`, `rel="next"` href = `/DSA/lectures/ch_5/`, 3× `aria-current="page"` total on the page (1 in left-rail + 1 in breadcrumb path + 1 on collection pill). Edge cases verified directly: `dist/client/lectures/ch_1/index.html` → 0× `rel="prev"`, 1× `chapter-button prev is-disabled`; `dist/client/lectures/ch_13/index.html` → 0× `rel="next"`, 1× `chapter-button next is-disabled`; `dist/client/lectures/ch_7/index.html` → `rel="prev"` href `/DSA/lectures/ch_6/`, `rel="next"` href `/DSA/lectures/ch_9/` (skips ch_8 by `n`-ordering, not slug-arithmetic). Cross-collection mirror verified: `dist/client/notes/ch_4/index.html` → Notes pill is-current, prev `/DSA/notes/ch_3/` + next `/DSA/notes/ch_5/` stay in notes; `dist/client/practice/ch_4/index.html` → Practice pill is-current, prev/next stay in practice. Index page unchanged: 0× `class="breadcrumb"` in `dist/client/index.html`. M3 surface counts preserved exactly (6× annotate-button, 6× annotations-pane, 8× mark-read-button, 12× section-nav). `<article>` wrappers preserved on all three routes. `<body data-mode="static">` preserved (1 hit). `data-interactive-only` count unchanged (19 — T3 carries no interactive-mode-gated surfaces of its own). **Sticky CSS verification:** scoped styles get externalized by Astro into `dist/client/_astro/Breadcrumb.BmHgLMAI.css` (single 6234-byte chunk shared across 36 chapter pages); `.breadcrumb[data-astro-cid-cmisnyl6]{position:sticky;top:0;z-index:50;…}` confirmed present in that chunk. Size delta: `dist/client/` = `5157010` bytes (post-T3) vs `5219362` (post-T2) = **`-62352` bytes (~61 KB net decrease)**. Counter-intuitive: T3 *adds* breadcrumb HTML markup to 36 pages, but the externalization of the chrome CSS (Breadcrumb + LeftRail scoped styles now share the single `_astro/*.css` chunk — Astro hoists when the dependency graph crosses a threshold) replaces T2's per-page-inlined scoped styles, netting a decrease. T8's `<50KB` budget evaluation gets headroom back. Net new JS: 0 (T3 introduces no islands; sticky is pure CSS, prev/next are plain `<a>`). Files touched: `src/components/chrome/Breadcrumb.astro` (new), `src/pages/lectures/[id].astro` (add Breadcrumb import + `<Breadcrumb slot="breadcrumb" />`), `src/pages/notes/[id].astro` (same), `src/pages/practice/[id].astro` (same), `design_docs/milestones/m_ux_polish/tasks/T3_breadcrumb.md` (Status flip todo → ✅ done 2026-04-24), `design_docs/milestones/m_ux_polish/tasks/README.md` (T3 row flip), `design_docs/milestones/m_ux_polish/README.md` (T3 task-table row flip + Done-when bullet 4 — "Top breadcrumb — sticky on scroll, shows path …, hosts collection switcher … + prev/next chapter buttons" — flipped `[ ]` → `[x]` with `(T3 issue file)` citation; T3 alone fully satisfies that bullet). ACs satisfied: every bullet in T3 spec's *Acceptance check* section verifiable from built artefacts (`Breadcrumb.astro` exists + mounts in `breadcrumb` slot, ch_4 path text, notes/ch_4 collection switcher current+links, ch_1 prev disabled, ch_13 next disabled, ch_7 next skips ch_8 to ch_9, sticky CSS rule emitted, BASE_URL discipline, 37 pages). The two browser-driven ACs ("auditor opens `/DSA/lectures/ch_4/` in `npm run preview`" and "auditor scrolls a long chapter to confirm sticky behaviour") are the Auditor's cycle-1 smoke — non-inferential structural evidence (sticky CSS rule visible in `_astro/*.css` chunk; build-time path/title/href values verified) is sufficient at T3 maturity per CLAUDE.md "Content vs code verification standards" — T3's pure-SSR + pure-CSS surface is closer to content-task evidence than to a JS-island runtime gate. **Carry-over from prior audits:** none — T1 issue file's M-UX-T1-ISS-01 was propagated only to T4; T2 issue file's MUX-T2-ISS-01/03 (client:visible spec drift) and MUX-T2-ISS-02 (size budget) were both propagated only to T4 and T8 respectively. T3's spec carries no Carry-over from prior audits section. **Dep audit: skipped — no manifest changes.**
- **Added** **M-UX Task T2 — Left-rail chapter nav + completion indicators.** Mounts the left-rail chapter navigation into the T1 slot scaffold on every chapter route (lectures, notes, practice). Two new components under `src/components/chrome/`:
  - **`LeftRail.astro`** — SSR component. Reads `scripts/chapters.json` + the lectures content collection (for per-chapter section-id lists), partitions Required (ch_1–ch_6) vs Optional (ch_7 + ch_9–ch_13), renders two `<section class="group">` blocks each with an `<h3>` + `<ul>` of chapter links. Links are constructed via `` `${baseUrl}/lectures/${c.id}/` `` where `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')` — no hardcoded `/DSA/` in rendered HTML (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1; source-level grep hits only in doc comments per DA2-E / DA3-A reviewer-eyes policy). `aria-current="page"` on the chapter matching `Astro.url.pathname`'s collection-slug pattern. Sort key is `n` (chapter number) so `ch_10` sorts after `ch_9`. Consumes three of T1's previously-unreferenced `chrome.css` tokens (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) for chapter-link default colour, group-heading small-caps colour, and hover background — resolving M-UX-T1-ISS-03 (LOW).
  - **`CompletionIndicator.astro`** — JS island. Rendered inside the same `<aside data-slot="left-rail">` with `data-interactive-only` so static mode hides the checkmark slots entirely while the chapter-link rows themselves stay visible. On mount: parses an SSR-embedded `<script type="application/json">` payload of `{ chapterId: sectionIds[] }` (built from the lectures collection), fetches `/api/read_status?chapter_id=<id>` for each of the 12 chapters in parallel, applies **rule (a): "all sections marked"** (the strict rule from T2 Notes — documented here per spec step 3), and paints `✓` into the corresponding `.checkmark-slot[data-chapter-id="…"]`. Subscribes to `cs300:read-status-changed` (the same event `MarkReadButton.astro` line 111 dispatches) and re-fetches only the current chapter's status — the other 11 chapters' state cannot change without navigation, so a full 12-chapter sweep would be wasted work (resolves MUX-BO-DA2-B / MEDIUM + MUX-BO-DA3-C / LOW). Current-chapter id is derived SSR-side from `Astro.url.pathname` and embedded as `data-current-chapter-id="ch_N"`; null on non-chapter pages (the listener is a no-op there). Rule-(a) fallback: if the section-id list for a chapter is empty (which shouldn't happen — the build fails otherwise), the island paints no glyph rather than throwing. Completion rule is flagged for revisit in T2 follow-on if it never triggers in practice (per spec Notes).
  Wired into all three chapter route files (`src/pages/{lectures,notes,practice}/[id].astro`) via `<LeftRail slot="left-rail" />`. Index page (`src/pages/index.astro`) left untouched — T5 owns the index rewrite and will compose its own chapter-card surface; T2 scope is chapter-route rails only. Existing M3 surfaces (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) untouched — T4/T6 will re-home those; T2 is additive. Build clean (`npm run build` exit 0, 37 prerendered pages ship). Smoke (non-inferential) on `dist/client/lectures/ch_4/index.html`: 1× `<nav class="left-rail" aria-label="Chapter navigation">`, 2× group headings (Required + Optional), 12 chapter `href`s (ch_1..6 + ch_7, ch_9..13), 1× `aria-current="page"` on the `/DSA/lectures/ch_4/` link, 12× `class="checkmark-slot" data-chapter-id="…"` spans (one per chapter), 1× island root `<div id="cs300-completion-indicator" data-interactive-only data-current-chapter-id="ch_4" hidden>`, `data-interactive-only` attribute count up to 19 on the lectures page (6 M3 + 12 slots + 1 island root; all gated by T1's global rule). `/DSA/lectures/ch_4/` highlight mirrored on notes/ch_4 + practice/ch_4 (rail is chapter-agnostic across collections, link always points at lectures per spec — T3's collection switcher will let the user change collection). Index page unchanged: 0 `left-rail` / `checkmark-slot` hits in `dist/client/index.html`. M3 surface counts preserved exactly (8× mark-read-button, 12× section-nav, 6× annotations-pane, 6× annotate-button, 1× `data-mode="static"` body attribute, `<article>` wrapper present in all three routes). Size delta: `dist/client/` = `5219362` bytes (post-T2) vs `4537978` (post-T1) = `+681384` bytes (~666 KB, ~18 KB/page). The majority is the SSR-embedded JSON section-id payload (per-page ~12 KB × 37 pages) required for rule (a); if T8's budget evaluation flags it as over-budget, a follow-on can move the payload to a single `/api/sections` fetch (noted in T2 spec Notes). Net new JS bundled: the island's inline script is inlined into each page's HTML; no new `dist/client/_astro/*.js` chunks created. Files touched: `src/components/chrome/LeftRail.astro` (new), `src/components/chrome/CompletionIndicator.astro` (new), `src/pages/lectures/[id].astro` (add LeftRail import + `<LeftRail slot="left-rail" />`), `src/pages/notes/[id].astro` (same), `src/pages/practice/[id].astro` (same), `design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md` (Status flip todo → ✅ done 2026-04-24), `design_docs/milestones/m_ux_polish/tasks/README.md` (T2 row flip), `design_docs/milestones/m_ux_polish/README.md` (T2 task-table row flip + Done-when bullets 2 + 3 flipped `[ ]` → `[x]` with `(T2 issue file)` citation; Done-when bullet 1 left `[ ]` because it requires T4's right-rail TOC to fully satisfy "left rail, center content, right rail — renders cleanly" — per T1 issue file M-UX-T1-ISS-01 guidance, T4 Builder flips bullet 1 with `(T1 + T2 + T4 issue files)` citation since T2 alone does not satisfy it). ACs satisfied: every bullet in T2 spec's *Acceptance check* section except the auditor-driven browser smokes (live `npm run dev` mark-read smoke, browser view-source on the BASE_URL resolution, live listener refresh observation) — those are the Auditor's cycle-1 smoke test. **Carry-over from T1 issue file:** M-UX-T1-ISS-01 (Done-when bullet 1 flip) remains DEFERRED to T4 — T2 alone insufficient. M-UX-T1-ISS-03 (3 unconsumed chrome.css tokens) ✅ RESOLVED — all three (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) consumed by `LeftRail.astro`'s chapter-link, group-heading, and hover rules respectively. **Dep audit: skipped — no manifest changes.**
- **Changed** **M-UX T1 — re-audit cycle on restarted `/clean-implement` loop; verdict upheld.** User requested a fresh audit on T1; Builder + Auditor re-verified on-disk state from scratch against the spec. Zero code changes needed (implementation already matches spec); `npm run build` reproduced the prior cycle's numbers byte-for-byte (37 pages, `du -sb dist/client/` = `4537978`, every smoke grep hit count matches). Issue file updated in place: `M-UX-T1-ISS-02` (stray `.deb`) flipped LOW OPEN → ✅ RESOLVED (file not present this cycle; `git status --porcelain` empty); security-review section expanded from 5 checks to 7 (added #6 pandoc anchor contract preservation, #7 new external resource fetches — both PASS; verdict remains SHIP). Dep audit: skipped — no manifest changes. MEDIUM M-UX-T1-ISS-01 (Done-when bullet 1 partial) remains DEFERRED to T2/T4 whichever lands second; LOW M-UX-T1-ISS-03 (three unconsumed `chrome.css` tokens) remains forward-scoped to T2/T3/T4 Builders or T8 audit. T1 formally CLEAN; loop proceeds to T2–T8.
- **Added** **M-UX T1 — layout shell: three-column grid + responsive scaffold landed.** First implementation task of M-UX. `src/layouts/Base.astro` rewritten from the 51-line bare shell into the MDN-docs three-column chrome from [ADR-0002](design_docs/adr/0002_ux_layer_mdn_three_column.md): four named slots (`breadcrumb`, `left-rail`, `default`, `right-rail`), CSS grid `260px 1fr 280px` at ≥1024px collapsing to single column below. New shared design-token surface at `src/styles/chrome.css` (accent colour, font-stack, column widths, breakpoint reference, spacing scale) — imported globally so T2/T3/T4/T7 components reach the same vars without per-component imports. `src/components/chrome/` directory created with `.gitkeep` for the chrome-component family T2–T7 will populate. M3 contracts preserved verbatim: `<body data-mode="static">` default, the `body[data-mode="static"] [data-interactive-only] { display: none !important; }` global rule, the inline `detectMode()` script, and the floating "interactive mode active" badge. Chapter routes (`src/pages/{lectures,notes,practice}/[id].astro`) untouched — their existing `<article>` wrapper now flows into the layout's `<main slot>` and the `<a id="ch_N-…">` per-section anchors emitted by the M2 pandoc Lua filter survive intact (resolves MUX-BO-ISS-01 / HIGH-1; verified post-build). Step 0 prerequisite (per MUX-BO-DA2-C) executed: `pre_m_ux_baseline.md` created at `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` via worktree procedure (`git worktree add /tmp/cs-300-baseline bf9c773`, build, capture, remove — no destructive checkout, no working-tree disturbance). Pinned baseline numbers: `dist/client/` = `4.5M` (`4420947` bytes), HTML page count = `37`, `_astro/*.js` sum = `0` (no `_astro/` dir at M3 close). Post-T1 build: 37 pages still ship clean, `dist/client/` = `4537978` bytes (delta `+117031` = ~114 KB, primarily from inlined per-page `<style>` blocks emitting the new grid + chrome tokens). Build is well under T8's `<50KB` *per-page* alarm threshold for net-new client JS (which remains `0` — T1 introduces no JS islands), but the total `dist/client/` delta is over the full-tree budget; surfaced here for T8 to evaluate against the post-M-UX measurement when all eight tasks have landed. Files touched: `src/layouts/Base.astro` (rewrite), `src/styles/chrome.css` (new), `src/components/chrome/.gitkeep` (new), `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` (new), `design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md` (Status flip + carry-over ticks), `design_docs/milestones/m_ux_polish/tasks/README.md` (T1 row flip), `design_docs/milestones/m_ux_polish/README.md` (T1 task-table row flip), plus the four DA3 sibling-spec edits described in the carry-over entry below. ACs satisfied: every AC in the T1 spec's acceptance-check section is verified by the post-build artefact (37 pages, `<body data-mode="static">`, four named slot landmarks `data-slot="breadcrumb|left-rail|main|right-rail"` in built HTML, `<article>` wrapper present in all three collection routes, M3 surfaces still rendered, `data-interactive-only` rule preserved, `chrome.css` exists with shared tokens, no `drawer-trigger` slot at Base level — DOM-inspection ACs (DevTools 1280px three-column, 768px single-column, no horizontal scroll) are auditor-driven and listed in the spec for the cycle-1 audit). Carry-over from prior audits (DA3-A through DA3-D) all ticked — see the carry-over entry below for per-item resolutions. **Dep audit: skipped — no manifest changes.**
- **Added** **M-UX T1 carry-over — 4 LOW cleanup items (DA3-A..DA3-D) from cycle-5 deep analysis.** Doc polish only — no implementation impact, no source code change required. Items added to a new `## Carry-over from prior audits` section at the bottom of [`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md). T1's Builder ticks each as it lands; they touch sibling specs (T2/T3/T4/T5/T7), not T1's own deliverables. Per-item summary:
  - **DA3-A** — apply `grep -vE` filter uniformly across T2/T3/T5 BASE_URL audit-checks (T2 has the fallback today; T3 + T5 don't).
  - **DA3-B** — T7 Step 1 step-ordering note: hamburger mount depends on T7 Step 16 having modified `Breadcrumb.astro` first to add the drawer-trigger slot.
  - **DA3-C** — soften "~1s" threshold in DA2-A / DA2-B live-listener ACs (T4 line 57, T2 line 46) — reword to "within a few seconds; constraint is 'before reload', not a latency budget".
  - **DA3-D** — T4 Step 3 vocabulary↔selector consistency: prose says "headings" but selector is `article [id]` (broader). Either drop "headings" or tighten selector to `article a[id^="ch_"]` (matches M3 MarkReadButton).
  Cycle-5 deep analysis closed; cycles 1–5 (initial breakout audit + DA + DA2 + DA3) collectively drove the M-UX milestone breakout audit from ⚠️ OPEN with 3 HIGH + 4 MEDIUM to ✅ PASS with all findings RESOLVED. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — third deep-analysis pass catches 3 MEDIUM + 3 LOW audit-check enforcement gaps; all six landed.** A third, more skeptical Auditor pass on the cycle-2 DA-NN amendments tested whether the audit-checks added in cycle 2 actually exercise the contracts they claim to enforce. Six new findings (`MUX-BO-DA2-A` … `MUX-BO-DA2-F`), all amended same-day via direct spec amendment. The recurring lesson, now confirmed across three passes: **CLAUDE.md's "non-inferential verification" principle applies recursively — to the implementation, to the audit-checks, and to whether the audit-checks exercise the contracts being added.** Per-finding amendments:
  - **DA2-A (MEDIUM)** — T4 ([`tasks/T4_right_rail_toc.md`](design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md)) gains a new acceptance-check that exercises DA-3's `cs300:read-status-changed` listener live. Concrete: mark a section read in `npm run dev`, **do not reload**, observe the corresponding TOC entry's `[data-read-indicator]` flip to `data-read="true"` within ~1s. Without this AC the previous reload-state AC tested only on-mount fetch — a Builder skipping the listener would ship a regression where TOC indicators stale-render until reload, and every existing T4 AC would still pass.
  - **DA2-B (MEDIUM)** — T2 ([`tasks/T2_left_rail.md`](design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md)) Step 3 gains a `cs300:read-status-changed` listener requirement on `CompletionIndicator`, scoped to the current chapter only (chapter slug embedded as `data-current-chapter` data-attribute; listener re-fetches only that chapter's read status). Matching live-refresh AC added. Closes the cross-component asymmetry surfaced by DA-3 — without this, the user marking a section would see T4's TOC indicator update live but T2's left-rail checkmark go stale until reload.
  - **DA2-C (MEDIUM)** — T1 ([`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md)) gains a new Step 0 pointing at T8 Step 0 as a prerequisite — confirms `issues/pre_m_ux_baseline.md` exists before T1 code work begins; if missing, run T8 Step 0 first (worktree procedure). Closes the silent-skippability gap from DA-4: a Builder picking up T1 reads its spec, sees no mention of baseline capture, and plows ahead — by T8's audit, the missing baseline forces a retroactive capture against a tree where M-UX work has already landed (defeats the <50KB delta budget).
  - **DA2-D (LOW)** — T4 Step 3 pins ScrollSpy selector to `article [id]` (matches T1's preserved `<article>` wrapper contract per MUX-BO-ISS-01 / HIGH-1). An unscoped `[id]` query would still find the headings document-wide and mask a future `<article>`-rename as a silent no-op; pinning the selector turns that class of regression into a HIGH ScrollSpy break that surfaces immediately.
  - **DA2-E (LOW)** — T2/T3/T5 BASE_URL audit-checks gain a one-line note that `grep -nE '/DSA/'` may surface comment hits (`<!-- /DSA/foo -->`) — the auditor reviews matches and confirms each is not a real source-code hardcoding before failing. Default policy: reviewer-eyes, not blind-fail.
  - **DA2-F (LOW)** — T7 ([`tasks/T7_mobile_drawer.md`](design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md)) step 1 line 25 hamburger-mounting language tightened to "inside `Breadcrumb.astro`'s component-internal drawer-trigger slot" (not directly in `Base.astro`'s `breadcrumb` slot region). Now agrees with deliverable line 16 + MUX-BO-ISS-04's resolution.
  Audit file [`m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) flipped ⚠️ OPEN → ✅ PASS; six DA2 rows flipped to RESOLVED. Files touched: 7 (T1, T2, T3, T4, T5, T7 + audit file). No source code changes. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — meta-audit pass catches 1 HIGH + 4 MEDIUM defects in the original fixes; all six landed.** A second, more skeptical Auditor pass on the ISS-01–ISS-08 amendments tested whether the audit-checks themselves would actually catch the regressions they were meant to catch. Six new findings (`MUX-BO-DA-NN`), all amended same-day. The most important lesson: **a grep that exists isn't the same as a grep that catches what it's supposed to catch.** CLAUDE.md's "Code-task verification is non-inferential" rule applies to audit-checks, not just to the implementation they verify. Per-finding amendments:
  - **DA-1 (HIGH)** — T2/T3/T5 audit-check grep changed from `-F '"/DSA/'` to `-E '/DSA/'`. The original literal-quote pattern would have missed template-literal hardcoding (` `/DSA/lectures/${id}/` `) and single-quoted paths — exactly the regression class HIGH-2 was designed to prevent. Tested with the four input patterns: `-F '"/DSA/'` matched only the double-quoted form (1 of 3 regressions); `-E '/DSA/'` matched all three.
  - **DA-2 (MEDIUM)** — T4 Step 4 pins indicator marked-state contract: `data-read="true"` (matches M3's prior `.dot[data-read]` convention). Step 5 Option (a) selector tightened from "use whatever attribute T4 picks" to a deterministic `[data-read-indicator][data-read="true"]`.
  - **DA-3 (MEDIUM)** — T4 Step 4 explicitly requires `cs300:read-status-changed` listener on the new TOC's read-status island. M3 `SectionNav.astro` line 88 has this listener today; Step 4 originally transferred SectionNav's GET-fetch logic but silently dropped the listener, which would have stale-rendered TOC indicators after `MarkReadButton` toggles until reload.
  - **DA-4 (MEDIUM)** — T8 Step 0 baseline-file location pinned to `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` (sibling to the breakout audit file). Earlier "the M-UX issue file" was ambiguous — the breakout audit is ✅ PASS / frozen, and `T08_issue.md` won't exist until T8's audit. Step 1 reworded to read from the new file; matching audit-check bullet added.
  - **DA-5 (MEDIUM)** — T8 Step 0 baseline-capture procedure switched from `git checkout bf9c773` to `git worktree add /tmp/cs-300-baseline bf9c773` (with stash-and-restore fallback). Naked checkout from a dirty working tree silently discards uncommitted changes. Audit-check bullet verifies `pre_m_ux_baseline.md`'s "Command output" section shows worktree (or explicit stash sequence).
  - **DA-6 (FLAGGED, test-then-decide per user direction)** — T6 Step 4 callout: M3 `MarkReadButton.astro` is `position: fixed; bottom: 16px; left: 16px;` so moving the JSX import doesn't change visual position. Two interpretations — (i) keep floating, "re-home" is cosmetic; (ii) strip positioning, become flow-positioned in the article header. Builder implements (i) first, smokes both breakpoints, decides during T6. Not pre-decided.
  Audit file [`m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) gains a "Meta-audit (2026-04-24) — deep analysis of the original-fix amendments" narrative section + 6 new `MUX-BO-DA-NN` rows in the Issue log table; status remains ✅ PASS post-DA-fixes. Files touched: 6 (T2, T3, T4, T5, T6, T8 + audit file). No source code changes. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — spec amendments resolve all 3 HIGH + 4 MEDIUM findings.** Direct spec amendment (no implementation yet — task specs are the spec of record at planning phase). Issue file [`design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) flipped ⚠️ OPEN → ✅ PASS; all eight `MUX-BO-ISS-NN` table rows flipped to RESOLVED (LOW-1 deferred-to-T2 and LOW-2 non-blocking unchanged). Per-spec changes (each cites the originating issue ID inline):
  - **T1** ([`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md)) — `drawer-trigger` slot dropped from `Base.astro` (4 slots only: `breadcrumb`, `left-rail`, `default`, `right-rail`); drawer trigger lives inside `Breadcrumb.astro` per T7 (resolves MUX-BO-ISS-04 / MEDIUM-1). `src/styles/chrome.css` pinned as T1 deliverable; "or inline" disjunction dropped (resolves MUX-BO-ISS-08 / MEDIUM-5). `<article>` wrapper + `<a id="ch_N-…">` anchor preservation audit-check added (Step 2 + dedicated bullet) — protects M3 `MarkReadButton`'s IntersectionObserver contract (resolves MUX-BO-ISS-01 / HIGH-1 + MUX-BO-ISS-07 / MEDIUM-4).
  - **T2** ([`tasks/T2_left_rail.md`](design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md)) — Step 2 link template switched from hardcoded `/DSA/lectures/<id>/` to `` `${baseUrl}/lectures/${c.id}/` `` where `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');`; matching audit-check bullet greps the source for hardcoded `/DSA/` and asserts no matches (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T3** ([`tasks/T3_breadcrumb.md`](design_docs/milestones/m_ux_polish/tasks/T3_breadcrumb.md)) — Step 4 + audit-check bullet add the same `import.meta.env.BASE_URL` convention note for breadcrumb path/collection-switcher/prev-next link generation (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T4** ([`tasks/T4_right_rail_toc.md`](design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md)) — new Step 5 (re-point `MarkReadButton.refreshMarked()` from the deleted `#section-nav .dot[data-read="true"]` selector to either the new RightRailTOC indicators or a direct `GET /api/read_status?chapter_id=…` fetch — Builder picks (a) or (b) and documents); new Step 8 (reload-state correctness smoke — mark a section read, reload, confirm `MarkReadButton` renders as "Unmark" without a click); matching audit-check bullet (resolves MUX-BO-ISS-01 / HIGH-1). Decompose trigger sharpened from "if T4 grows past one session" to "after Step 1 audit, if the diff > ~30 lines new/changed code, split before writing any code" — T4b owns the HIGH-1 fix if split (resolves MUX-BO-ISS-06 / MEDIUM-3).
  - **T5** ([`tasks/T5_index_dashboard.md`](design_docs/milestones/m_ux_polish/tasks/T5_index_dashboard.md)) — Step 2 ChapterCard link template switched to `import.meta.env.BASE_URL` for all three collection links (Lectures / Notes / Practice); matching audit-check grep bullet across `ChapterCard.astro` + `index.astro` (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T6** ([`tasks/T6_m3_rehome.md`](design_docs/milestones/m_ux_polish/tasks/T6_m3_rehome.md)) — Step 2 scope pinned to "lectures only for annotations + mark-read" (no Builder-time decision); consistent with T2/T3 chrome breadth and T4 TOC scope (resolves MUX-BO-ISS-05 / MEDIUM-2).
  - **T8** ([`tasks/T8_deploy_verification.md`](design_docs/milestones/m_ux_polish/tasks/T8_deploy_verification.md)) — new Step 0 (non-skippable baseline capture at `bf9c773` before T1 implementation work starts: `du -sh dist/client/` + page count + `_astro/*.js` sum, pinned in the M-UX issue file under a `## Pre-M-UX baseline` section); Step 1 reworded to consume the pinned numbers instead of the M3 T8 report's environment-dependent `~1.6 MB`; matching audit-check bullet (resolves MUX-BO-ISS-03 / HIGH-3).
  Files touched: 8 (7 task specs + audit issue file). No source code changes. T1 is now unblocked. **Dep audit: skipped — no manifest changes.**
- **Added** **M-UX task breakout — 8 task specs + index.** Mirrors
  the M3 task-breakout pattern (per-task spec under `tasks/T<NN>_<slug>.md`,
  ordering + status table at `tasks/README.md`, `issues/` directory
  scaffolded for first-audit-time creation per CLAUDE.md). Tasks:
  - **T1** — Layout shell (three-column grid + responsive scaffold).
  - **T2** — Left-rail chapter nav + completion indicators
    (Required/Optional grouping per ADR-0002).
  - **T3** — Top breadcrumb (collection switcher + prev/next + sticky).
  - **T4** — Right-rail TOC + scroll-spy island + M3 `SectionNav`
    refactor (the largest task; likely decompose candidate to T4a + T4b).
  - **T5** — Index page rewrite (mastery-dashboard placeholder; M5
    hooks pre-wired via `data-interactive-only` slots).
  - **T6** — M3 component re-homing (annotations to right rail,
    mark-read to chapter header). API-stable; no M3 contract changes.
  - **T7** — Mobile drawer + responsive sweep (the only always-loaded
    JS island M-UX introduces; budget <5KB).
  - **T8** — Deploy verification (37 pages, size budget <50KB delta,
    no M3 regression, hybrid-output split preserved).
  Critical path: T1 → T4 → T6 → T7 → T8. Three parallel branches
  after T1: chrome (T2 + T3), content-pane (T4), index (T5). Files
  added under `design_docs/milestones/m_ux_polish/`: `README.md`,
  `tasks/README.md`, 8 × `tasks/T<NN>_<slug>.md`, empty `issues/`
  directory. **Dep audit: skipped — no manifest changes.**
- **Decided / Added** **M-UX kickoff — promote Canvas/left-nav UI
  polish out of `nice_to_have.md` (trigger fired post-M3 close).**
  Per the parked entry's promotion trigger ("M3 starts and the
  chrome decisions can no longer be deferred — read-status
  indicators need a sidebar to live in, annotations need a margin
  pane"), M3 closing 2026-04-24 with the M3 client surfaces
  shipped bare into a 51-line `Base.astro` shell satisfies the
  trigger. Per CLAUDE.md non-negotiables, adoption requires an
  architecture.md amendment + ADR. **This commit lands both
  halves.**
  - `design_docs/adr/0002_ux_layer_mdn_three_column.md` (new) —
    decision: MDN-docs three-column layout with Canvas-style
    Required/Optional grouping in the left rail. Three columns on
    desktop (left chapter nav, center content, right TOC +
    annotations), single-column with hamburger drawer on mobile.
    Specific commitments per slot: chapter list grouping +
    completion indicators, prose-width-constrained center
    (~75ch), SSR TOC + scroll-spy island, mastery-dashboard
    placeholder index page (M5 hooks pre-wired). Visual style /
    color / typography / dark-mode / search all explicitly
    deferred to follow-on work — M-UX scope is layout structure
    only.
  - `design_docs/architecture.md` §1.6 (new) — "Page chrome (UX
    layer)" subsection added between "Astro content collections"
    and "Audio (Phase 7 forward-compat)". Three-column ASCII
    diagram, mobile-collapse story, interactive-mode affordances
    (read-status checkmarks + annotations pane gated on the
    `data-interactive-only` T5 contract), static-mode posture
    (left rail + TOC + content all SSR; mobile drawer is the
    only always-loaded JS island), and the M3 `SectionNav`
    refactor note (re-homes from fixed left rail to right-rail
    TOC structure — no two left rails).
  - `design_docs/milestones/README.md` — M-UX added as a sidecar
    milestone (not in original `interactive_notes_roadmap.md`
    phasing). Same edit syncs M3 status (todo → ✅ closed
    2026-04-24) and M4 status (todo → todo + upstream-gated note
    pointing at the issue file). Dependency-graph paragraph
    updated to call out M-UX as parallel-with-M4.
  M-UX milestone breakout (README + per-task specs T1–T8) lands
  in a follow-up commit per the M3 task-breakout precedent.
  **Dep audit: skipped — no manifest changes.**
- **Decided / Changed** **M4 architecture clarification — `aiw-mcp` is
  the MCP server, cs-300 contributes workflow modules (no "FastMCP
  adapter we build").** User confirmed (after pulling the actual
  [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/)
  v0.1.3 docs into the conversation) that the framework ships
  `aiw-mcp` as its FastMCP-based MCP server with streamable-HTTP
  transport + CORS already wired (M14, 2026-04-22). cs-300's job at
  M4 is to author its own workflow modules under `./workflows/`
  (`question_gen`, `grade`, `assess` — built from the framework's
  graph primitives `TieredNode` / `ValidatorNode` / `HumanGate` /
  `RetryingEdge`) and run `aiw-mcp` against them. There is no
  separate adapter to build.
  **Doc rename + reframe sweep (this commit):**
  - `design_docs/architecture.md` — §1 prose + ASCII diagram
    rewritten (two-process topology now names `aiw-mcp` Python +
    state service Node by-runtime; cross-language boundary called
    out); §3.1 retitled "Question generation (`aiw-mcp` + cs-300
    workflow modules)" with the new dispatch-via-MCP-tool
    description; §4 Path A/B prose updated; §6 out-of-scope bullet
    updated to point at jmdl-ai-workflows' framework docs.
  - `design_docs/adr/0001_state_service_hosting.md` — Path A
    rationale rewritten around the cross-language sibling-process
    model (Astro Node owns persistence; `aiw-mcp` Python owns
    workflow execution; browser bridges both); two open questions
    resolved — `ADAPTER_URL` port pin (8080, matching
    jmdl-ai-workflows README example) + external workflow
    discovery (gated on upstream feature, see issue file).
  - `design_docs/milestones/m4_phase4_question_gen/README.md` —
    full rewrite: tier policy locked to Ollama-only (matches the
    README "no cloud LLM APIs at runtime" non-negotiable); Done-when
    bullets reframed around `aiw-mcp` + cs-300 workflow modules;
    task list adds "Author cs-300 workflow modules under
    `./workflows/`" + "Stand up `aiw-mcp` launch script"; new
    Carry-over section noting the upstream gate.
  - `design_docs/milestones/m3_phase3_state_service/tasks/T1_hosting_decision.md`
    — Path A description updated (Astro Node + `aiw-mcp` Python).
  - `design_docs/milestones/m3_phase3_state_service/tasks/T5_mode_detection.md`
    — `ADAPTER_URL` port repinned 7700 → 8080; M4 forward-work note
    added about confirming `aiw-mcp`'s actual liveness probe path
    (`/health` is a placeholder; M14 smoke hit `/mcp/`).
  - `src/lib/mode.ts` — port repinned 7700 → 8080; module docstring
    rewritten to reference `aiw-mcp` instead of "the FastMCP adapter";
    forward-work note added about probe path verification at M4.
  - `README.md` — status callout, "What this is" #2, repository
    layout caption, Architecture section (now lists the two
    sibling processes by runtime + role), Settled-tech bullet
    (`aiw-mcp` + version pin + transport).
  - `CLAUDE.md` — code-vs-content rule list updated ("the FastMCP
    adapter" → "cs-300 workflow modules under `./workflows/`").
  - `design_docs/m3_deploy_verification.md` — one-line static-mode
    description updated.
  **New file (will be deleted when upstream ships):**
  `aiw_workflow_discovery_issue.md` at the cs-300 root — a
  self-contained feature-request spec for `jmdl-ai-workflows`
  proposing `AIW_EXTRA_WORKFLOW_MODULES` env var + `--workflow-module`
  CLI flag so downstream consumers like cs-300 can register
  workflow modules outside the framework's source tree. Without
  this, M4 can't proceed (the framework's lazy importer only
  finds `ai_workflows.workflows.<name>`). User is also the
  upstream maintainer; will implement and delete the file from
  cs-300's root once shipped.
  **Cloud-LLM constraint reaffirmed.** Question generation runs
  against local Ollama only; the framework's `claude_code` (OAuth
  subscription) and `gemini_flash` (LiteLLM) tiers are available
  but not registered in cs-300's default tier registry. Constraint
  may relax if the user later self-hosts Ollama on a cloud server,
  at which point Claude Code's subscription tier could come back
  into play. No cloud LLM API keys at runtime today.
  **No cs-300 source code changes beyond `src/lib/mode.ts` port
  repinning and docstring rewrite.** Files touched: see the
  rename-and-reframe list above. **Dep audit: skipped — no
  manifest changes** (no `package.json`, `package-lock.json`,
  `pyproject.toml`, `.nvmrc`, `.pandoc-version` edits in this
  commit).
- **Fixed** **M3 T8 — Deploy verification + workflow path fix.**
  Audit caught a real M3-into-M2 regression: the `@astrojs/node`
  adapter (added by T3) splits `dist/` into `dist/client/`
  (prerendered HTML for GH Pages) and `dist/server/` (Node
  adapter runtime — not used by GH Pages). M2 T6's deploy
  workflow uploaded `path: ./dist`, which after the adapter
  switch would have shipped both directories and served the
  wrong root index. Fixed by changing the workflow's
  `actions/upload-pages-artifact@v3` `path:` from `./dist` →
  `./dist/client`. **Pre-fix deploy would have broken the
  public site**; post-fix the upload payload is byte-equivalent
  to what M2 T6 expected. Verification doc at
  `design_docs/m3_deploy_verification.md` covers: page count
  parity (37/37), static-mode behavioural verification (all 4
  M3 UI surfaces in HTML + CSS-hidden under T5 contract), bundle
  inspection (zero server-only paths in client JS — `better-sqlite3`,
  `drizzle`, `gray-matter`, `src/lib/seed`, `src/db` all 0 hits),
  and the hybrid-output GH Pages compatibility check (M3 audit
  fix F3). Files added: `design_docs/m3_deploy_verification.md`.
  Files changed: `.github/workflows/deploy.yml` (one-line path
  fix + comment). Runtime push verification deferred until the
  user pushes M3 commits and the workflow fires.
- **Added** **M3 T7 — Read-status indicator.** Full CRUD:
  `GET /api/read_status?chapter_id=…` (returns
  `{section_ids: [...]}` for marked sections in that chapter via
  Drizzle innerJoin on sections.chapter_id),
  `POST /api/read_status` (idempotent upsert via
  `onConflictDoUpdate(readAt: Date.now())`),
  `DELETE /api/read_status/:section_id` (un-mark, 204). Routes
  restructured into a folder same as T6: `read_status/index.ts`
  for GET+POST, `read_status/[section_id].ts` for DELETE. UI:
  `SectionNav.astro` (fixed left-side TOC, one row per section
  with a colored dot — green when marked, grey otherwise; loads
  marked-set once on mount via GET) + `MarkReadButton.astro`
  (fixed bottom-left toggle that targets the currently-visible
  section via `IntersectionObserver` on the `<a id="ch_N-…">`
  anchors; POST or DELETE on click; updates the dot via
  `cs300:read-status-changed` CustomEvent which SectionNav
  listens to). Both wired into `src/pages/lectures/[id].astro`;
  both carry `data-interactive-only` per T5. Smoke (auditor):
  `scripts/read-status-smoke.mjs` runs POST × 3 → GET (count=3) →
  DELETE one → GET (count=2), all 4 steps PASS. Regression check:
  T6 annotations smoke also passes against the same dev server.
  Chapter page HTML contains all 4 UI surfaces (section-nav,
  annotations-pane, annotate-button, mark-read-button) with
  `data-interactive-only` markers; chapter page size grew from
  ~300 KB (T6) to ~360 KB (T7). Files added:
  `src/components/read_status/{SectionNav,MarkReadButton}.astro`,
  `src/pages/api/read_status/[section_id].ts`,
  `scripts/read-status-smoke.mjs`. Files renamed:
  `src/pages/api/read_status.ts` → `read_status/index.ts`. Files
  changed: `src/pages/lectures/[id].astro` (+2 imports + 2 uses).
- **Added** **M3 T6 — Annotations end-to-end (the M3 dogfood).**
  Full CRUD: `GET /api/annotations?section_id=…` (array),
  `POST /api/annotations` (insert, returns 201 + row),
  `DELETE /api/annotations/:id` (204). Routes restructured from
  `src/pages/api/annotations.ts` to a folder
  (`annotations/index.ts` for GET+POST, `annotations/[id].ts` for
  DELETE) so Astro's dynamic `[id]` segment works. UI components:
  `AnnotateButton.astro` (floating button on selection — captures
  section_id via DOM walk to nearest `<a id="ch_N-…">` anchor +
  char offsets via TreeWalker; POSTs on click) +
  `AnnotationsPane.astro` (fixed right-side list — fetches per
  visible section, renders snippet + delete button, refreshes via
  CustomEvent on insert). Both wired into
  `src/pages/lectures/[id].astro` (sectionIds passed from MDX
  frontmatter); both carry `data-interactive-only` per T5
  contract. Smoke (auditor): `scripts/annotations-smoke.mjs` runs
  the full POST → GET → DELETE → GET cycle against the dev server,
  all 4 steps PASS; chapter page HTML contains both component
  IDs + the `data-interactive-only` markers (verified via curl).
  In static mode the components are CSS-hidden but the JS islands
  bail silently (their fetch to `/api/annotations` 404s on GH
  Pages → no error UX; pane stays empty). Files added:
  `src/components/annotations/{AnnotateButton,AnnotationsPane}.astro`,
  `src/pages/api/annotations/[id].ts`, `scripts/annotations-smoke.mjs`.
  Files renamed: `src/pages/api/annotations.ts` →
  `src/pages/api/annotations/index.ts`. Files changed: that
  index.ts (rewritten from 501-stub to real GET+POST impl),
  `src/pages/lectures/[id].astro` (+2 imports + 2 uses).
- **Added** **M3 T5 — `detectMode()` + bootstrap mode flag.**
  `src/lib/mode.ts` exports `detectMode(): Promise<'interactive' |
  'static'>` matching architecture.md §4's listing exactly: two
  parallel `fetch` probes (`ADAPTER_URL + '/health'` for the M4
  FastMCP adapter; `/api/health` for the T3 state service);
  AND-condition on both `r.ok`; any throw → `'static'`.
  `ADAPTER_URL = 'http://localhost:7700'` (FastMCP convention; M4
  inherits or overrides — open question deferred from T1 ADR).
  `Base.astro` updated to:
  (1) default `<body data-mode="static">` server-side (so the
  page renders correctly even before client-side probe completes);
  (2) inline `<style is:global>` with the rule
  `body[data-mode="static"] [data-interactive-only] { display: none
  !important }` — the conditional-render plumbing T6/T7 surfaces
  ride;
  (3) a tiny `<script>` that imports + runs `detectMode()` on load
  and sets `document.body.dataset.mode`;
  (4) a placeholder `<div data-interactive-only>interactive mode
  active</div>` (bottom-right green pill) so the smoke test has a
  visible target. Smoke (auditor): `npm run build` exit 0
  (37 prerendered + server bundle); `npm run dev` + curl a chapter
  page returns 294 KB with `<body data-mode="static">` server-
  default, inline CSS rule present, placeholder div in HTML
  (display: none under the static-mode CSS). In dev mode without
  the M4 adapter running on 7700, the adapter probe fails → mode
  stays `'static'` → placeholder hidden. Until M4's adapter ships,
  `detectMode()` will always return `'static'` in both production
  and local — the wiring + conditional-render plumbing land here
  for M4 to flip on. Files added: `src/lib/mode.ts`. Files changed:
  `src/layouts/Base.astro` (+CSS rule + script + placeholder).
- **Added** **M3 T4 — Seeding (chapters + sections from MDX
  frontmatter).** `src/lib/seed.ts` implements idempotent upserts
  per architecture.md §2 "Seeding": 12 chapters from
  `scripts/chapters.json`, 365 sections from
  `src/content/lectures/*.mdx` frontmatter `sections:` array.
  Uses FS + gray-matter (rather than Astro's `getCollection`) so
  the same module works inside Astro API routes AND as a
  standalone Node script (T4 smoke). `src/pages/api/health.ts`
  extended to call `seed()` on first GET per process — single-shot
  guard skips re-runs. Idempotent via `ON CONFLICT DO UPDATE` —
  re-runs from any state are safe. `gray-matter` + `tsx` deps
  added (gray-matter for frontmatter parsing; tsx so the
  smoke script can import the .ts seed module directly). Smoke
  (auditor): `rm -f data/cs-300.db && node scripts/db-migrate.mjs &&
  npx tsx scripts/seed-smoke.mjs` → exits 0 with `chapters=12,
  sections=365`. Re-running yields same counts (idempotent
  verified). Dev-server `GET /api/health` first call returns
  `{db:"ok", seeded:{chapters:12,sections:365}, seed_error:null}`;
  second call uses in-memory cache (same response, no re-seed).
  Direct DB query confirms 12 + 365 row counts. M4+ rows
  (questions, attempts, fsrs_state, annotations, read_status)
  untouched per architecture.md §2 "Questions and attempt state
  are never touched". Files added: `src/lib/seed.ts`,
  `scripts/seed-smoke.mjs`. Files changed: `src/pages/api/health.ts`
  (+seed call + 2 module-level state vars), `package.json` deps
  (+gray-matter, +tsx).
- **Added** **M3 T3 — Astro API route stubs (architecture.md §3).**
  Seven routes under `src/pages/api/`. `health.ts` is the only
  fully-implemented one — returns `{ok, version, db}` with
  `db: 'ok'` from a `SELECT 1` against the Drizzle client (T2).
  The other six return 501 with `{kind: 'not_implemented',
  impl_milestone: '...'}` envelopes pointing at the milestone
  that owns the impl: `attempts.ts` → M4/M5/M6 per question type;
  `review/due.ts` → M5; `questions/bulk.ts` → M4;
  `fsrs_state/[question_id].ts` → M5; `annotations.ts` → M3 T6;
  `read_status.ts` → M3 T7. All routes export `prerender = false`.
  **`@astrojs/node` adapter installed** (`@astrojs/node@^10.0.6`,
  standalone mode); `astro.config.mjs` wires it. Astro 6 removed
  hybrid output mode — the modern pattern is `output: 'static'`
  (default; pages prerender) + adapter + per-route `prerender =
  false` opt-out for API handlers. The Node-server entrypoint
  produced by the adapter is not uploaded by M2 T6's deploy
  workflow (which uploads `dist/`); only the prerendered chapter
  pages ship to GH Pages. Smoke (auditor): `npm run build` exits
  0 (37 prerendered pages + server bundle); `npm run dev` +
  curl confirms all 9 endpoints (GET+POST on annotations and
  read_status; single verb on the others) return expected
  status + body. Astro 6's CSRF protection rejects POST/PATCH
  without a matching `Origin` header — real frontend `fetch()`
  sets it automatically; smoke tests pass `-H 'Origin: http://localhost:<port>'`.
  Files added: 7 route files. Files changed: `astro.config.mjs`
  (+1 import + 1 adapter line), `package.json` deps (+1).
- **Added** **M3 T2 — Drizzle schema + initial migration.** SQLite
  state service schema instantiated per architecture.md §2 — 7
  tables (chapters, sections, questions, attempts, fsrs_state,
  read_status, annotations) + 3 indexes (idx_questions_chapter,
  idx_attempts_question, idx_fsrs_due). Files added: `src/db/schema.ts`
  (Drizzle table defs, 1:1 with arch §2 column names/types/FKs),
  `src/db/client.ts` (singleton `db` export with WAL + foreign_keys
  pragmas), `drizzle.config.ts` (sqlite dialect, `data/cs-300.db`
  path), `drizzle/0000_tiny_bug.sql` (generated migration —
  drizzle-kit auto-named it; semantic shape is what matters),
  `scripts/db-migrate.mjs` (programmatic migrator — `drizzle-kit
  push` requires TTY, this works headless), `scripts/db-smoke.mjs`
  (verifies 7 tables + 3 indexes present). Deps installed:
  `drizzle-orm@0.45.2`, `better-sqlite3@12.9.0`,
  `drizzle-kit@0.31.10`, `@types/better-sqlite3@7.6.13`. `data/`
  added to `.gitignore` (per-dev SQLite file). Smoke (auditor):
  `rm -f data/cs-300.db && node scripts/db-migrate.mjs && node
  scripts/db-smoke.mjs` exits 0; output lists exactly 7 user tables
  + 3 user indexes. `npm run build` still produces 37 pages
  cleanly (DB infra doesn't affect Astro static build).
- **Decided** **M3 T1 — Path A (Astro server) confirmed for the
  state service.** ADR 0001 written at `design_docs/adr/0001_state_service_hosting.md`
  (first ADR in the repo — `design_docs/adr/` directory created
  per CLAUDE.md "created when needed" convention). Drives M3 T2
  (Drizzle + better-sqlite3), T3 (Astro API routes under
  `src/pages/api/` with hybrid output), T5 (`detectMode()` probes
  `/api/health` + the M4 adapter URL). Trade-offs accepted: reject
  WASM bundle weight (~2 MB) + browser-side migrations in exchange
  for simpler schema management + alignment with architecture.md
  §4's recommendation. `architecture.md` §5 row 2 flipped from
  open → ✅ resolved with ADR link. M3 README's "Open decisions
  resolved here" mirrored.
- **Fixed** Added `.nojekyll` at repo root. GitHub's implicit Jekyll
  `pages-build-deployment` was still firing on push after T8 deleted
  the Jekyll source, crashing on `src/pages/index.astro` (Jekyll
  parsed Astro frontmatter as YAML). The marker file disables the
  implicit Jekyll workflow entirely; `actions/deploy-pages@v4` from
  M2 T6 is now the only deploy path.

## 2026-04-22

- **Changed** `chapters/ch_4/notes.tex` — compact reference mirror of
  Step-3 lectures.tex additions: array `append` row in decision matrix
  re-flagged with `$^\ast$` (was `$1^\ast$` in cell — confusing) and
  one-line footnote added under the table: *"Array append is amortized
  $O(1)$ via doubling --- single operations can be $O(n)$ on the resize
  step."* Net +4 lines (was 133, now 137). Build verified: `pdflatex`
  produces 2-page PDF.
- **Changed** `chapters/ch_4/lectures.tex` — Step-3 ch_4 revisions per
  approved gap analysis. **Title fix:** subtitle *"Lists, Stacks, and
  Queues"* → *"Lists, Stacks, Queues, and Deques"*. **Cross-ref fix:**
  §4.10 opening now back-refs §3.15 for insertion sort's first
  appearance on arrays. **Three new callouts:**
  - §4.1 `notebox` *"Two interface families: Sequence and Set"* —
    OCW 6.006 lec2's framing. Names extrinsic-vs-intrinsic order;
    explains why ch_4 (Sequence) and ch_5–ch_6 (Set) are separate
    chapters; pre-empts the `\subsection{List is the root ADT}`
    discussion with the abstraction one level up.
  - §4.11 `examplebox` *"std::list::splice: the operation only a
    linked list can do in O(1)"* placed at the end of the
    sentinel-discussion section. ~10-line C++ snippet showing
    range-splice between two `std::list<int>` instances; one paragraph
    explaining the four-pointer rewire and why `std::vector` cannot
    match it. The canonical "why use std::list in modern C++" answer.
  - §4.16 new subsection *"Implementing the ring buffer"* — extends
    the existing "What about array-backed queues?" notebox with
    concrete content per CLRS Ch 10.1. Includes: `defnbox` defining
    head/tail wrap-around semantics; ~25-line C++ `examplebox` with
    explicit size counter; `warnbox` on the `head==tail` full-vs-empty
    ambiguity (size-counter fix vs leave-one-slot-unused fix);
    closing `notebox` on why ring buffers dominate in low-latency /
    lock-free producer-consumer code.
  **Build verified:** `pdflatex` produces 51-page PDF, no errors.
  **Net delta:** +135 lines (was 3232, now 3367), ~+4.2% growth — close
  to the +90 estimate (the ring-buffer block ran longer because the
  warnbox + closing notebox were warranted). Still smallest-delta
  Step 3 of any chapter so far. `notes.tex` updated separately above.
- **Added** `design_docs/chapter_reviews/ch_4_gaps.md` — Step-2 gap
  analysis for ch_4 against CLRS Ch 10.1–10.2 (Stacks/Queues/Linked
  Lists with array + circular-array implementations and formal
  sentinel `L:nil`) and OCW 6.006 lec2 (Sequence vs Set interface
  ADT framing, Sequence ops table comparing Array / Linked List /
  Dynamic Array). Per the new "3–5 high-value adds, defer the rest
  to post-build audit" rule, only **3 additions** proposed:
  - **§4.1:** ADD Sequence-vs-Set ADT framing notebox from OCW lec2.
    Frames why ch_4 (sequence) and ch_5–ch_6 (set) are different
    chapters.
  - **§4.16:** ADD ring-buffer / circular-array queue defnbox +
    examplebox per CLRS 10.1. ch_4 currently *names* the ring buffer
    in §4.15 and walks past it without showing the implementation.
  - **§4.7 or §4.11:** ADD `std::list::splice` examplebox — modern-C++
    idiom that is the actual production reason DLLs exist; cited only
    indirectly in the existing `[Linked lists rarely win in modern
    C++]` warnbox at line 836.
  Plus 3 minor must-do fixes: title subtitle adds "and Deques" (§4.17);
  §4.10 back-refs §3.15 for insertion sort; `notes.tex` footnote
  explains `$^*$` on array append (amortized).
  **Explicitly deferred to post-build audit**: `unique_ptr`-based LLs,
  tail-call optimization in §4.12, formal CLRS sentinel `L:nil`,
  two-stacks-queue / two-queues-stack puzzles, block-based deque
  internals, OCW Set-interface details (belong in ch_5/ch_6),
  shrink-policy $1+\varepsilon$ derivation (already touched in ch_3).
  Headline: smallest-delta gap report so far — ~+90 lines (~+2.6%,
  lands ch_4 at ~3320, smaller than ch_3's post-Step-3 3437) — matches
  inventory's "ch_4 is the cleanest chapter" finding. Awaiting user
  approval before Step 3.
- **Added** `design_docs/chapter_reviews/ch_4.md` — Step-1 as-is
  inventory of `chapters/ch_4/lectures.tex` (3232 lines, 18 sections,
  148 callout boxes — the densest of any chapter so far) and
  `chapters/ch_4/notes.tex` (133 lines). Section-by-section catalogue
  of §4.1–§4.18 (List ADT, SLL/DLL implementations, Search, Traversal,
  Sorting, Sentinels, Recursion, Stack/Queue/Deque ADTs + their LL
  implementations, Array-Based Lists). Notable findings:
  (a) **Cleanest chapter in the repo so far** — clean numbering, no
      stubs, all cross-chapter refs correct (Ch 5 hash tables, Ch 6
      trees, optional ch_10 graphs), every algorithm has a worked C++
      `lstlisting` example.
  (b) **Stale companion-materials line** at lines 3227–3230 — same
      pattern as other chapters, already deferred to Phase 2 globally.
  (c) **Title subtitle omits "Deques"** despite §4.17 covering them —
      one-line fix in Step 3.
  (d) **Minor cross-ref opportunities**: §4.10 (insertion sort on LL)
      could back-ref §3.15; `notes.tex` decision matrix has an
      unexplained `$^*$` on array append.
  (e) **Step-2 candidates**: `std::list::splice`, tail-call discussion
      in §4.12 recursion section, `unique_ptr`-based LL ownership.
      All bounded by the new "3–5 high-value adds; defer rest to
      post-build audit" rule.
  Step-2 gap analysis to follow.
- **Saved memory** `feedback_chapter_review_scope.md` — per user
  direction at end of ch_3 Step 3: per-chapter Step-2 reports propose
  3–5 high-value additions max; everything else missing relative to
  CLRS/OCW gets deferred to a post-main-build optional-content audit.
  Avoids bloating chapters and slowing the main app build.
- **Changed** `chapters/ch_3/notes.tex` — compact reference mirror of
  Step-3 lectures.tex additions: (1) bubble-sort row asterisked with
  footnote pointing to ch\_13.1 (per gap report — discoverability fix);
  (2) counting-sort row added ($O(n+k)$, stable, not in-place) since
  counting sort is now a full §3.20 subsection; (3) bucket-sort row
  added with $\dagger$ footnote noting uniform-distribution assumption
  and ch\_13.3 pointer. Net +5 lines (was 137, now 142). Build verified:
  `pdflatex` produces 2-page PDF.
- **Changed** `chapters/ch_3/lectures.tex` — Step-3 ch_3 revisions per
  approved gap analysis. **Removals/fixes:**
  - Dropped §3.22 stub (`\section{3.22 \textit{(next section -- ready
    to scrape)}}`) per ch_2 precedent; chapter now ends at §3.21.
  - Fixed 2 single-line wrong cross-refs ("Big-O is in Chapter 4" →
    "Big-O in \textsection 3.10"; "Big-O notation, the core
    vocabulary of Chapter 4" → "formalized in the next section,
    \textsection 3.10").
  - Fixed §3.6 closer notebox: replaced Chapter-4 forward-ref with
    correct §3.10/§3.8 forward-refs.
  - Fixed §3.14 intro: replaced Chapter-5 reference with rest-of-chapter
    list + bubble-sort/heap-sort pointers (ch\_13.1 / ch\_7).
  - Fixed §3.20 closer ideabox: replaced "next chapter (4) is
    complexity analysis proper" with §3.10 + ch_4 forward-ref.
  - Added bubble-sort discoverability pointer in §3.10 halfway-recap
    "Incremental:" bullet, naming ch\_13 extras as the home.
  **Additions (5 new callouts):**
  - §3.10 `notebox` — *Little-oh and little-omega: strict versions of O
    and Ω.* Formal definitions of $o$ and $\omega$ + analogy table
    (O ↔ ≤, Ω ↔ ≥, Θ ↔ =, o ↔ <, ω ↔ >). Per CLRS Ch 3.1–3.2.
  - §3.15 `notebox` — *Loop invariants: how to prove insertion sort
    correct.* CLRS Ch 2.1's init/maintenance/termination structure
    applied to insertion sort.
  - §3.19 `notebox` — *The Master Theorem: a recipe for divide-and-
    conquer recurrences.* CLRS Ch 4 — three cases for $T(n) = aT(n/b)
    - f(n)$ with applications (merge sort, binary search, quicksort
    average) and recurrence cheatsheet.
  - §3.20 promoted to full subsection — counting sort with `defnbox`
    - cumulative-sum C++ implementation + walk-backward stability
    `warnbox` + when-to-use `ideabox`. Per CLRS 8.2 + OCW lec5.
    (Was previously just a closing notebox in radix sort.)
  - §3.21 `notebox` — *Bucket sort: counting sort's distribution-aware
    cousin.* Average $O(n)$ assuming uniform distribution; degrades to
    $O(n^2)$ otherwise. Pointer to ch\_13.3 for full treatment.
  **Build verified:** `pdflatex` produces 53-page PDF, no errors. Two
  in-flight LaTeX-syntax fixes (escape `_` in `ch_13` / `ch_7` / `ch_3`
  references → `ch\_13` etc., to prevent unintended math-mode subscript)
  applied at lines 1768, 1792–1793, 2850.
  **Net delta:** +194 lines (was 3243, now 3437), ~6% growth — bigger
  than my +90 estimate (multi-paragraph noteboxes ran longer than
  guessed, same pattern as ch_2). Still within the "don't make it
  impossibly long" filter. Compact reference (`notes.tex`) updated
  separately above.
- **Added** `design_docs/chapter_reviews/ch_3_gaps.md` — Step-2 gap
  analysis for ch_3 against OCW 6.006 lec3/lec5 (sorting/linear sorting)
  - r03/r05 (recitations), and CLRS 3rd-ed Ch 2.1–2.3 (insertion sort
  - loop invariants + merge sort), Ch 3.1–3.2 (full asymptotic
  notation + standard functions), Ch 8.2–8.4 (counting/radix/bucket
  sort). Per-section verdicts:
  - **§3.10:** ADD little-oh + little-omega notation + the asymptotic
    analogy with real numbers (O ↔ ≤, Ω ↔ ≥, Θ ↔ =, o ↔ <, ω ↔ >).
  - **§3.15:** ADD loop-invariants notebox (init / maintenance /
    termination), CLRS Ch 2.1's canonical correctness-proof
    technique, demoed on insertion sort.
  - **§3.19:** ADD Master Theorem preview notebox (3 cases for
    $T(n) = aT(n/b) + f(n)$, applied to merge sort) — makes the
    informal recurrence-tree arguments rigorous.
  - **§3.20:** ADD counting sort as a standalone subsection (not
    just a closing notebox in radix sort) with cumulative-sum
    implementation + stability proof. Per CLRS 8.2 + OCW lec5.
  - **§3.21:** ADD bucket-sort pointer to ch_13.3 (same
    discoverability pattern as bubble sort).
  - **FIX 5 critical pre-existing wrong cross-refs** (lines 1041,
    1183, 1501, 1755, 3013) where ch_3 says "Big-O is in Chapter 4"
    or "sorting is in Chapter 5" — both belong in this chapter per
    cs-300's structure.
  - **DROP §3.22 stub** per ch_2 precedent.
  - **Bubble sort discoverability fixes**: pointer to ch_13.1 in
    §3.10 halfway recap, line 1755 ref, and notes.tex sorting table
    (per user direction — bubble sort coverage is in ch_13, just
    needs to be findable).
  Headline: ch_3 is already strong (3243 lines, 175 callouts).
  CLRS/OCW add 4 modest improvements (~90 lines) plus must-do fixes.
  Out of scope: full master-theorem proof, sentinel-based merge,
  Stirling's approximation, randomized quicksort analysis (too deep),
  heap sort (lives in ch_7), full bucket-sort analysis (pointer
  enough). Net delta if approved: ~+90 added, −3 removed (~3% growth).
  Awaiting user approval before drafting Step-3 revisions.
- **Added** `design_docs/chapter_reviews/ch_3.md` — Step-1 as-is
  inventory of `chapters/ch_3/lectures.tex` (3243 lines) and
  `chapters/ch_3/notes.tex` (137 lines). Section-by-section catalogue
  (18 sections with content + 1 stub at §3.22, plus numbering gaps at
  §3.7 and §3.11–§3.13, 70+ subsections, **175 callout boxes**) with
  topics, depth markers, callout counts, cross-references, stylistic
  patterns, and flagged issues. Notable findings:
  (a) **5 critical pre-existing wrong cross-refs** (lines 1041, 1183,
      1501, 1755, 3013) say "Big-O is in Chapter 4" or "sorting is in
      Chapter 5," but Big-O is in §3.10 and 6 sorts are in §3.15–§3.20
      OF THIS CHAPTER. Author appears to have written ch_3 with a
      different chapter mapping in mind than cs-300's actual structure.
  (b) **§3.22 is a stub** (drop per ch_2 precedent).
  (c) **Numbering gaps** (§3.7 missing, §3.11–§3.13 missing).
      Recommend leaving as-is — renumbering 22 sections is churn.
  (d) **Bubble sort: mentioned in `notes.tex` table and line 1755 ref,
      but never covered** by any §3.X. Decision needed during Step 3.
  (e) **Heap sort: correctly deferred to ch_7** (optional) but ch_3
      references treat it ambiguously.
  (f) **Stylistic divergence from ch_2**: ch_3 uses `lstlisting` (21
      blocks) extensively; ch_2 uses `verbatim`. Three chapters,
      three styles.
- **Changed** `chapters/ch_2/notes.tex` — added 3 compact-reference
  updates per gap analysis: (1) renamed "DP: the template" subsection
  to "DP: the template (SRTBOT)" with the OCW SRTBOT mnemonic and
  guess+brute-force pattern; (2) new `\subsection*{``LCS'' is
  ambiguous}` with the substring-vs-subsequence comparison table;
  (3) new 5th "Top gotcha" bullet on knapsack DP being pseudopolynomial.
  Net +20 lines.
- **Changed** `chapters/ch_2/lectures.tex` — Step-3 ch_2 revisions per
  approved gap analysis. **Removals/fixes:**
  - Dropped §2.11 stub (`\section{2.11 \textit{(next section -- ready
    to scrape)}}`) per user direction; chapter now ends at §2.10.
  - Fixed 4 broken cross-chapter refs to ch_1 (side-effect of ch_1
    Step 3 renumbering): `\textsection 1.12` → `1.10`,
    `\textsection 1.11` (×2) → `1.9`, `\textsection 1.9` → `1.5`
    (the last was already pre-existing wrong).
  - Fixed §2.1 closer pre-existing wrong cross-ref ("big-O, which
    starts in §2.2" → "which is formalized in chapter 3").
  **Additions (six new callouts):**
  - §2.2 `notebox` — *Two paths to an algorithm: reduce, or design.*
    OCW lec1's two-prong recipe (reduce-to-known vs design-recursive),
    framing §2.4–§2.10 strategies as the design fallback.
  - §2.4 `defnbox` — *SRTBOT: a fuller version of the template.* OCW's
    6-step recursive-design recipe (Subproblem / Relate / Topo /
    Base / Original / Time) introduced alongside cs-300's existing
    3-part template.
  - §2.4 `notebox` — *Recursive strategies, classified by call-graph
    shape.* OCW's classification (brute force = star, decrease &
    conquer = chain, divide & conquer = tree, DP = DAG, greedy =
    subgraph), unifying §2.4–§2.10.
  - §2.8 `notebox` — *"DP solves knapsack" is true — but only
    pseudopolynomially.* Resolves latent confusion: O(nW) DP for
    knapsack is not strongly polynomial since W can be exponential
    in input bits. Defines pseudopolynomial vs strongly polynomial.
  - §2.9 `examplebox` — *Why earliest-finish is optimal: a sketch.*
    Worked greedy-correctness proof for activity selection: exchange
    argument for greedy-choice property + same-shape argument for
    optimal substructure. Concretizes the abstract template cs-300
    already mentions but doesn't demonstrate.
  - §2.10 `notebox` — *"LCS" usually means subsequence, not substring.*
    Caught a real terminology bug: cs-300 uses "LCS" for the
    contiguous-substring variant, but every standard textbook (CLRS
    15.4, OCW lec16) uses "LCS" for the non-contiguous-subsequence
    variant. Comparison table of the two recurrences. Per option (B):
    keep cs-300's content, add clarifying notebox.
  **Build verified:** `pdflatex` produces 34-page PDF, no errors.
  Net delta: +184 lines (was 2045, now 2229), ~9% growth — bigger than
  my ~+70 estimate in the gap report (multi-paragraph noteboxes ran
  longer than guessed). Still well within the "don't make it
  impossibly long" filter. `notes.tex` (compact reference) not yet
  updated; awaiting user direction on whether to mirror.
- **Added** `design_docs/chapter_reviews/ch_2_gaps.md` — Step-2 gap
  analysis for ch_2 against OCW 6.006 lec15–18 (DP/recursive algorithms)
  - lec1 (algorithm framing) and CLRS 3rd-ed Ch 15.3 (Elements of DP),
  Ch 15.4 (LCS = subsequence), Ch 16.3 (Huffman / greedy correctness
  proof template). Per-section verdicts:
  - **§2.1:** FIX one pre-existing wrong cross-ref ("Big-O starts in
    §2.2" → "Big-O is in ch_3").
  - **§2.2:** ADD reduce-vs-design recipe notebox from OCW lec1/lec15.
  - **§2.4:** ADD SRTBOT framework defnbox + DAG-shape recursion-class
    notebox (unifies §2.4–§2.10).
  - **§2.8:** ADD pseudopolynomial notebox (resolves "DP solves
    knapsack but it's still NP-hard" cognitive dissonance).
  - **§2.9:** ADD activity-selection correctness sketch (greedy-choice
    - optimal substructure → optimal). Skipping Huffman to avoid
    bloating ch_2 with priority-queue dependency.
  - **§2.10:** ADD LCS terminology clarification — cs-300's "LCS"
    is longest common SUBSTRING (contiguous); textbook LCS is
    SUBSEQUENCE (non-contiguous). Different problem, different
    recurrence. Caught this comparing cs-300 §2.10 to CLRS 15.4 and
    OCW lec16.
  - **DROP §2.11** stub per user direction.
  - **FIX 4 broken cross-chapter refs** to ch_1 (side-effect of ch_1
    Step 3 renumbering).
  Headline: with the algorithm-strategies framing locked, OCW adds
  meaningful depth (SRTBOT, DAG classification, pseudopolynomial)
  while CLRS Ch 15.3/16.3 add formal greedy-correctness template.
  Most CLRS depth (master method, amortized methods, insertion sort,
  approximation algorithms, NP-completeness) belongs elsewhere in
  cs-300 (mostly ch_3) or is too advanced. Net delta if approved:
  ~+70 added lines, −3 removed, chapter grows ~3.5%. Awaiting user
  approval before drafting Step-3 revisions.
- **Added** `design_docs/chapter_reviews/ch_2.md` — Step-1 as-is
  inventory of `chapters/ch_2/lectures.tex` (2045 lines) and
  `chapters/ch_2/notes.tex` (152 lines). Section-by-section catalogue
  (10 sections with content + 1 stub, 56 subsections, 111 callout boxes)
  with topics, depth markers, callout counts, cross-references, and
  flagged issues. Notable findings:
  (a) **§2.11 is a stub** — explicit "ready to scrape" placeholder,
      no content. Decision needed in Step 2/3 on how to resolve.
  (b) **§2.6 Data Privacy and §2.7 Ethical Guidelines are
      SNHU-specific** — CLRS/OCW won't augment them (~390 lines,
      ~19% of the chapter).
  (c) **Cross-chapter refs to ch_1 are broken** as a side-effect of
      the ch_1 renumbering done in this same session: `\textsection
      1.12` → should be 1.10, `\textsection 1.11` (×2) → should be 1.9,
      `\textsection 1.9` → likely was already wrong (referred to
      Multiple Vectors / linear search) → should be 1.5. Will fix in
      ch_2 Step 3.
  (d) ch_2 uses `\begin{verbatim}` for code blocks instead of
      `lstlisting` — a stylistic divergence from ch_1.
- **Changed** `chapters/ch_1/notes.tex` — added 6th "Top gotcha"
  bullet documenting that `std::vector` doesn't auto-shrink and the
  `vector<T>().swap(v)` force-release idiom. Mirrors the new
  `shrink_to_fit` warnbox in `chapters/ch_1/lectures.tex` §1.6 but
  in compact-reference form. Word-RAM and amortized-cost additions
  intentionally not mirrored to notes.tex (pedagogical content, not
  reference data).
- **Changed** `chapters/ch_1/lectures.tex` — Step-3 ch_1 revisions
  per approved gap analysis. **Removals:** old §1.1 (Programming
  Basics) and old §1.2 (Code and Pseudocode) cut entirely (273 lines)
  per option (A) — Coral framing dropped, chapter reframed as pure
  C++ refresher. **Renumbering:** §1.3–§1.17 → §1.1–§1.15
  (15 sections, all internal cross-references updated). **Additions:**
  - `notebox [The model has a name: Word-RAM]` in new §1.1 (formerly
    §1.3) — names the underlying model, forward-refs ch_3.
  - `defnbox [Amortized cost]` in new §1.6 (formerly §1.8) —
    formalizes the amortization that was previously hand-waved.
  - `warnbox [shrink_to_fit() and the no-auto-shrink policy]` in new
    §1.6 — covers a real C++-specific gap (vector grows but doesn't
    auto-shrink; `shrink_to_fit` is non-binding; force release via
    swap-with-empty trick).
  - One-line cross-reference bullet in new §1.8 (formerly §1.10)
    "backing memory" subsection pointing at the new shrink_to_fit
    warnbox.
  **Title subtitle** updated: "Review: Flowcharts, Pseudocode, and
  Arrays and Vectors" → "C++ Refresher: Arrays, Vectors, and Strings".
  **Net delta:** ~−250 lines (Coral cut) + ~+45 lines (additions).
  File now 2274 lines (was 2508). Build verified: `pdflatex` produces
  36-page PDF, no errors (only pre-existing harmless font warnings).
  Mastery checklist (7 items) and chapter-end "What this connects to"
  notebox unchanged — neither references removed sections by number.
- **Added** `design_docs/chapter_reviews/ch_1_gaps.md` — Step-2 gap
  analysis for ch_1 against MIT OCW 6.006 lec1/lec2/r01/r02 and CLRS
  3rd-ed Ch 1 / Ch 2 / Ch 17.4. Per-section verdicts: **ADD** small
  Word-RAM forward-ref notebox in §1.3, **ADD** formal amortized-cost
  defnbox + `shrink_to_fit` warnbox in §1.8, **DECIDE** whether to
  cut/compress/port §1.1 + §1.2 (Coral content removed regardless),
  **SKIP** the rest. Headline finding: with the C++-refresher framing
  locked, OCW/CLRS add very little — both are pseudocode/Python and
  language-agnostic. Net delta if all recommendations approved: roughly
  -250 lines (Coral cut) and +25 lines (additions). Awaiting user
  approval/edits before drafting Step-3 revisions.
- **Decided** ch_1 is a **C++ refresher chapter**. User direction:
  Coral pseudocode/flowchart framing in §1.1–1.2 gets dropped in the
  revision pass; chapter narrows to C++ competency on top of the
  SNHU-derived core. Algorithm-theory content from CLRS/OCW that
  doesn't directly serve C++ competency is **out of scope for ch_1**
  and belongs in ch_2/ch_3.
- **Added** `design_docs/phase2_issues.md` — punch list for items
  deferred to the Phase 2 (Jekyll → Astro) redesign. Seeded with
  the stale companion-materials line in `chapters/*/lectures.tex`
  and the `\section{Big-O Cheatsheet}` heading in
  `resources/week_2.tex`.
- **Added** `design_docs/chapter_reviews/ch_1.md` — Step-1 as-is
  inventory of `chapters/ch_1/lectures.tex` (2508 lines) and
  `chapters/ch_1/notes.tex` (143 lines). Section-by-section
  catalogue (17 sections, 70 subsections, 161 callout boxes) with
  topics, depth markers, callout counts, cross-references, and
  flagged terminology/structural issues. **No augmentation
  suggestions** — input for the Step-2 CLRS + OCW gap analysis.
- **Changed** Chapter file naming convention (atomic global rename):
  - **`notes.{tex,pdf}` → `lectures.{tex,pdf}`** in every chapter
    folder. The "long-form chapter" file is now called Lectures.
  - **`cheat.{tex,pdf}` → `notes.{tex,pdf}`** in every chapter folder.
    The "compact two-page reference" file is now called Notes.
  - **Top-level Jekyll viewer dirs:** `notes/` → `lectures/`,
    `cheats/` → `notes/`. Wrapper `ch_N.md` files moved with their
    parent dirs and updated to point at the new PDF paths and use
    new permalinks (`/lectures/ch_N/`, `/notes/ch_N/`).
  - **Display labels:** updated `_includes/nav.html` (dropdown
    summaries: "Notes" → "Lectures", "Personal Notes" → "Notes"),
    `index.md` (table headers and link text), `_data/chapters.yml`
    (`notes_pdf` key → `lectures_pdf`, `cheat_pdf` key → `notes_pdf`).
  - **Internal `\title{...}` lines:** updated all 12
    `chapters/ch_N/lectures.tex` (now say "Chapter N Lectures") and
    all 12 `chapters/ch_N/notes.tex` (now say "Ch.~N Notes").
  - **Doc references** updated in `README.md` (build commands, file
    descriptions, layout block, conventions, license),
    `design_docs/architecture.md` (system-shape diagram, source
    layout, planned Astro content collections layout, static-mode
    feature description, pandoc probe reference),
    `design_docs/roadmap_addenda.md` (pandoc probe), this
    `CHANGELOG.md` (pandoc probe), `notes-style.tex` (preamble
    comment), `_config.yml` (description).
  - All file moves done with `git mv` so rename history is
    preserved.
  - **Caught and fixed in-flight:** initial `sed` pass on
    `index.md` and `_includes/nav.html` used overlapping patterns
    (e.g. `notes/` → `lectures/` ran after `cheats/` → `notes/`,
    transitively converting the new `notes/` to `lectures/`).
    Files were rewritten via `Write` to the correct target state.
- **Decided** Per-chapter content review/augmentation loop. User
  directive (2026-04-22): all course content (lectures, notes,
  quizzes) will be updated by augmenting SNHU-derived core material
  with MIT OCW + CLRS, **one chapter at a time**. Before any
  augmentation work on a chapter, the existing chapter content must
  be **fully reviewed** first. Hard constraint: don't make the
  course so long it becomes impossible to finish.
- **Decided** `chapters/*/practice.md` is **out of scope** for
  per-chapter content augmentation. OCW practice problems and
  assignments will instead feed Phase 4 (LLM question generation
  via ai-workflows), where the user has ideas for using OCW + other
  reference sources to improve both the prompt corpus and generated
  question quality. Recorded in
  `memory/project_practice_md_phase4_link.md`.
- **Deferred (to per-chapter review)** In-chapter prose references
  to "cheat sheet" companion material in
  `chapters/ch_{1,2,3,4,5,6}/lectures.tex` (e.g. lines like
  `One-page cheat sheet: cheat_sheets/ch_N.tex`). Path was already
  stale (no `cheat_sheets/` dir ever existed) and the terminology
  is now inconsistent with the new "Notes" name. Will fix during
  the per-chapter review pass for each affected chapter.
- **Deferred** `resources/week_2.tex` `\section{Big-O Cheatsheet}`
  heading and surrounding prose. Sidecar week-level file, not a
  chapter file; "cheatsheet" used as a content genre rather than a
  filename. Decide whether to align terminology when we touch
  Week 2 material.
- **Added** `reference/clrs/clrs.pdf` (5.5 MB) — CLRS textbook PDF,
  pulled from
  <https://www.cs.mcgill.ca/~akroit/math/compsci/Cormen%20Introduction%20to%20Algorithms.pdf>.
  Per memory, treat as personal study reference (third-party host of
  copyrighted textbook); paraphrase/build-on for chapter content,
  don't wholesale reproduce.
- **Added** MIT OCW 6.006 Spring 2020 course archive contents,
  extracted from `https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/6.006-spring-2020.zip`
  (39 MB ZIP, ~26 MB extracted PDFs+ZIPs). License: CC BY-NC-SA 4.0.
  Sorted into:
  - `reference/mit_ocw/lecture_notes/` — 21 PDFs (lec1–lec20; **lec18
    shipped in two distinct revisions** — different hashes and sizes,
    320K and 367K — both kept, decision deferred).
  - `reference/mit_ocw/recitations/` — 19 PDFs (r01–r19; r20 absent
    from archive, matching gap in OCW lecture-notes index).
  - `reference/mit_ocw/practice_problems/` — 18 PDFs (prob1–prob9 +
    prob1sol–prob9sol).
  - `reference/mit_ocw/assignments/` — 27 files (ps0–ps8: questions
    PDF + solutions PDF + template ZIP each).
  - `reference/mit_ocw/quizzes/` — 14 PDFs (q1–q3, q1_sol–q3_sol,
    review1–review3, review1_sol–review3_sol, final, final_sol).
    OCW filename inconsistency: q3 uses lowercase `s20` while q1/q2
    use uppercase `S20`. Left as-is.
  - `reference/mit_ocw/transcripts/` — 35 PDFs (lecture/recitation
    video transcripts named by YouTube/Drive ID, plus three problem
    session transcripts named by date).
- **Changed** scope vs. earlier "drop zone" intent: `recitations/`,
  `quizzes/`, and `transcripts/` directories were added beyond the
  user's original 3-category list (lecture notes / practice problems
  / assignments), because the OCW archive includes them and the
  marginal storage cost is negligible. User can prune any of these
  if not wanted.
- **Added** `reference/mit_ocw/video_lectures.md` — index of MIT OCW
  6.006 Spring 2020 lecture videos (21 lectures), problem sessions
  (PS1–PS9, PS6 unavailable per COVID note), quiz reviews (Q1–Q3),
  and the original course calendar. Pulled from the OCW lecture-videos
  gallery and calendar pages. Pure reference — no chapter mapping
  yet; that decision is deferred per user direction ("thinking we
  might use that to augment content not sure yet").
- **Added** `reference/mit_ocw/{lecture_notes,practice_problems,assignments}/`
  (each with `.gitkeep`) — drop zones matching MIT OCW 6.006 index
  pages. User pulling content from
  <https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/>.
- **Added** `reference/clrs/` (with `.gitkeep`) — drop zone for CLRS
  (Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*).
  Designated by user as the **primary** reference book to enhance
  the SNHU curriculum. Source link provided:
  <https://www.cs.mcgill.ca/~akroit/math/compsci/Cormen%20Introduction%20to%20Algorithms.pdf>.
- **Decided** MIT OCW 6.006 Spring 2020 is the augmenting course;
  CLRS is the primary augmenting textbook. Together they form the
  rigor substitute the SNHU curriculum lacks (per
  `memory/project_target_audience.md`).
- **Added** `reference/mit_ocw/` (with `.gitkeep`) — drop zone for
  MIT OpenCourseWare DSA course material. User will signal when
  reference files are in place. Treated as the gating input for
  Phase 1 chapter revisions: without OCW augmentation, the rest of
  Phase 1 has no source material to draw on. Commit-vs-gitignore
  decision deferred until file types and sizes are known.
- **Added** `CHANGELOG.md` (this file). Convention: log everything,
  no matter how small.
- **Changed** `README.md` — rewrote as portfolio-framed draft.
  Previous README only described the LaTeX/Jekyll setup. New draft
  adds: pre-Phase-1 status callout, two-purpose framing (course notes
  - reference integration for `ai-workflows`), pointer to
  `design_docs/architecture.md`, settled-tech summary, and dual
  license declaration. Existing build/conventions/layout content
  preserved. Layout updated to include `coding_practice/`,
  `design_docs/`, and `tools/`.
- **Added** `design_docs/architecture.md` — first-cut architecture
  document. Gating artifact for Phase 1. Covers static content
  pipeline (pandoc + Lua filter, component library, Astro content
  collections, audio file layout pinned for Phase 7), data model
  (Drizzle + SQLite schema with type-dispatched payloads for
  `mc` / `short` / `llm_graded` / `code` questions), dynamic surfaces
  (MCP bridge contract, eval dispatch, code execution, FSRS loop),
  local-vs-public mode (single `detectMode()` flag, two state-service
  hosting paths), and an open-decisions table. Awaiting user review;
  has not been pressure-tested.
- **Added** `design_docs/roadmap_addenda.md` — local supplement to
  the Drive roadmap (`interactive_notes_roadmap.md`, file id
  `1SJHI76hibJ6aJqvtMuJbE1dhzVLZlWcOpitofrziWC8`). Captures: the
  `architecture.md → README → Phase 1` sequence, deferral of Phase 1
  acceptance criteria, the Phase-1-idle pandoc probe, and the
  decision to keep `coding_practice/`.
- **Decided** Dual license: content under CC BY-NC-SA 4.0 (matches
  MIT OCW), code under MIT. Declared in README; LICENSE files not
  yet created.
- **Decided** Sequence to Phase 1 is `architecture.md → README →
  Phase 1`. README intentionally drafted before Phase 1 starts but
  after the architecture doc exists.
- **Decided** Question persistence model is accumulating (not
  per-session ephemeral). Confirmed in `architecture.md §5`.
- **Decided** Audio file layout pinned to
  `public/audio/ch_N.{mp3,timestamps.json}` to avoid a Phase 7
  unwind. (`architecture.md §1`.)
- **Deferred** Phase 1 acceptance criteria — explicitly postponed
  until `architecture.md` is settled. Will be a major focus at that
  point. (See `roadmap_addenda.md`.)
- **Deferred** Pandoc Lua filter vs. manual port — decide after the
  Phase-1-idle probe on `chapters/ch_1/lectures.tex`.
- **Deferred** State-service hosting (Astro server vs. client-side
  SQLite WASM) — decide at Phase 3 start; lean is Astro server.
- **Deferred** Whether `coding_practice/` prompts are persisted as
  files or generated dynamically by the workflow — decide at Phase 4
  design.

---

## Pre-2026-04-22

Repository state before this changelog began. Reconstructable from
git history (`git log --oneline`). Highlights:

- `e027f57` — Add optional-chapter materials and restructure into
  `chapters/`.
- `3ad6ba0` — Add GitHub Pages site (Jekyll).
- `3f01901` — Initial commit.
