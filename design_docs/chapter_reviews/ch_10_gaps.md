# Chapter 10 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_10/lectures.tex` (842 lines, 18 pp; inventoried in `ch_10.md`) **against** MIT OCW 6.006 Spring 2020 lec9 (BFS) + lec10 (DFS / Topo) + lec11 (Weighted Shortest Paths / Dijkstra) + lec12 (Bellman-Ford) + recitations r09–r12, and CLRS 3rd-ed Ch 22 (Elementary graph algorithms) + Ch 23 (MST) + Ch 24 (SSSP) + Ch 25 (APSP).

**Locked framing (optional-chapter arc, 2026-04-25):** ch_10 is a **post-SNHU optional chapter**. Page cap + 3-5 bounded-additions rule are **OFF**. Depth bar is "actual mastery."

**Crucial baseline note:** ch_10 is **broad but thin** — survey register, not derivation register. 13 sections covering the entire CLRS Ch 22–25 surface in 18 pages. Comparable scope to ch_9's 31 pages. **Expect the augmentation pass to roughly double the line count** (842 → ~1700+) bringing it closer to ch_9's depth.

**Reference material read:**
- OCW lec9.pdf — Breadth-First Search: graph representations (adjacency-set), BFS by layer, parent-pointer trees, BFS gives single-source shortest paths in unweighted graphs.
- OCW lec10.pdf — Depth-First Search: recursive DFS, parent-pointer DFS tree, **edge classification (tree / back / forward / cross)**, **cycle detection via back-edges**, topological sort via DFS post-order, full-DFS for disconnected graphs.
- OCW lec11.pdf — Weighted Shortest Paths: weighted graph definitions, **DAG shortest paths via relaxation in topological order**, **Dijkstra's algorithm with priority-queue substrate** (forward-ref to ch_7 heap), edge relaxation correctness proof.
- OCW lec12.pdf — Bellman-Ford: negative-weight handling, **|V|−1-round relaxation correctness**, negative-cycle detection (one extra round still relaxes ⇒ negative cycle reachable).
- OCW recitations r09–r12 — graph-algorithm worked traces with adjacency-set Python; r12 has Floyd-Warshall.
- CLRS Ch 22 — BFS (§22.2), DFS (§22.3) with edge classification + cycle detection, **topological sort** (§22.4), **strongly connected components** (§22.5 — Kosaraju via DFS-twice).
- CLRS Ch 23 — MST: **cut property** + **cycle property** (the two structural lemmas that justify both Kruskal and Prim), Kruskal (§23.2), Prim (§23.2).
- CLRS Ch 24 — SSSP: **relaxation as the universal primitive**, DAG shortest paths (§24.2), **Bellman-Ford** (§24.1), **Dijkstra** (§24.3) with the "non-negative-weights-required" proof.
- CLRS Ch 25 — APSP: matrix-multiplication formulation, **Floyd-Warshall** (§25.2) with the dynamic-programming-on-vertex-set framing, **Johnson's algorithm** (§25.3) for sparse all-pairs (Bellman-Ford reweighting + Dijkstra |V| times).

**OCW vs ch_10 coverage style:** OCW uses Python-flavored pseudocode with adjacency-set + parent-pointer DFS/BFS framing. CLRS is the canonical depth reference. ch_10's existing coverage is breadth-first (no pun intended) — it touches every topic but rarely lingers on the proofs / edge-case analyses CLRS belabours.

---

## Structural gaps (apply to chapter as a whole)

Same three structural gaps as ch_7 / ch_9, plus a fourth ch_10-specific one:

### S1 — No opening chapter-map `ideabox` — ADD

ch_10 has a thematic "Why graphs matter" frame pre-§10.1 but no structured chapter-map block.

**Required:** opening `ideabox` titled "Chapter map":

1. **Where this sits in CS 300** — graphs are the **abstraction-substrate chapter**: every problem in this chapter (route-finding, dependency resolution, network flow, SCC) shows up as "real problems in this domain are graph problems in disguise." Builds on ch_6 (BSTs as a special case of trees, which are connected acyclic graphs), ch_7 (priority queue as the substrate Dijkstra rides on), ch_9 (parent-pointer trees as DFS/BFS output, augmented trees as graph-state holders).
2. **What you add to your toolkit** —
   - Two graph representations + when to pick which (adjacency list for sparse, adjacency matrix for dense or APSP).
   - BFS as "shortest paths in unweighted graphs" + the layer structure proof.
   - DFS + edge classification (tree / back / forward / cross) → the four downstream algorithms (cycle detection, topological sort, SCC, articulation points).
   - **Relaxation as the universal SSSP primitive** (Dijkstra, Bellman-Ford, DAG-relax all instances).
   - The cut-property + cycle-property structural lemmas justifying Kruskal + Prim.
   - When to use which algorithm at a glance (decision-table forward ref to NEW §10.14).
3. **Looking ahead / forward refs** — ch_11 (B-trees use graph-like structure for filesystem block layout), ch_12 (set ADT — visited-set / discovered-set machinery powers BFS/DFS). Possibly a reference to follow-on material (network flow / max-bipartite-matching / advanced topics not in cs-300).

### S2 — No 7-item mastery checklist — ADD

**Required:** 7-item mastery checklist:

1. State the BFS algorithm + sketch why it produces shortest paths in unweighted graphs (layer-monotonicity proof).
2. Run DFS on a 6-node directed graph by hand, classifying every edge as tree / back / forward / cross + identifying the topological sort from post-order.
3. State **relaxation** + argue why it's monotonic + sketch why one round of relaxation over all edges in topological order solves DAG shortest paths in O(V + E).
4. State Dijkstra's algorithm + why it requires non-negative edge weights (one-line counterexample on a 3-node graph with a negative edge).
5. State Bellman-Ford's |V|−1-round relaxation correctness + describe negative-cycle detection (one extra round detecting any further relaxation).
6. State the **cut property** + **cycle property** + use them to argue both Kruskal and Prim produce a minimum spanning tree.
7. Pick the right algorithm for a problem at first sight: shortest path in unweighted (BFS), in DAG (DAG-relax), in non-negative-weighted (Dijkstra), with negative weights (Bellman-Ford), all-pairs (Floyd-Warshall, or Johnson for sparse). Justify each choice in one sentence.

### S3 — Closing `ideabox` exists but should be reframed — UPDATE

The §10.13 "Chapter takeaway" closing ideabox per inventory exists. Per the inventory note "Prim conspicuously absent from the unification list" — needs a quick correction. Plus add forward-refs:

- Forward-ref ch_11 (B-trees use graph-flavoured pointer structure for disk-block organization).
- Forward-ref ch_12 (set ADT — visited/discovered sets as BFS/DFS state).
- Mention follow-on direction (max flow, network simplex, planar graphs) without going into them.

### S4 — Zero TikZ figures across 18 pages — ADD several worked diagrams

**Single biggest visual deficit in any optional chapter.** Graphs are the most diagram-dependent topic in CS, and ch_10 has zero TikZ. The 6 `tabular` choosers do real work but readers also need worked graph drawings to internalise the algorithms.

**Required:** at least 6 TikZ graph diagrams (cs-300's existing TikZ machinery handles binary trees in ch_9; needs lightweight extension for general graphs — `\node` + `\draw` with `->` arrows for directed):

1. §10.1 / §10.2: a **vocabulary diagram** — small 5-node graph with both directed + undirected variants, labeled vertices/edges/in-degree/out-degree.
2. §10.5 (BFS): a **6-node BFS layer diagram** showing the source, the layers L0/L1/L2, and the BFS tree (parent pointers).
3. §10.6 (DFS): a **DFS edge-classification diagram** on a 7-node directed graph showing tree edges (solid black), back edges (red dashed), forward edges (blue), cross edges (green).
4. §10.7 / §10.11 (DAGs + topo sort): a **build-system DAG** showing 5-6 modules with dependency edges + the resulting topological order.
5. §10.9 (Dijkstra): a **5-node weighted-graph trace** showing tentative-distance updates frame-by-frame as Dijkstra runs.
6. §10.12 (MST): a **6-node weighted graph** + **its MST** drawn separately, with the cut-property highlighting one edge being added.

Plus 3 corresponding `examplebox` worked traces (§10.5 BFS layer trace, §10.9 Dijkstra trace, §10.10 Bellman-Ford trace with negative-cycle detection).

---

## Per-section gap verdicts

For each ch_10 section: **ADD**, **DECIDE**, or **SKIP**. Given ch_10's broad-but-thin coverage, expect more ADDs than ch_9.

### §10.1–10.4 (vocabulary + representations) — ADD (small)

**Current:** Per inventory, ch_10 has vocab + dense/sparse + adjacency-list + adjacency-matrix coverage.

**OCW + CLRS additions:**
- **Adjacency-set vs adjacency-list** distinction (OCW prefers adjacency-set with a Python `set` per vertex; CLRS uses adjacency-list as a linked list of neighbors). Different time-vs-space tradeoffs for the `has-edge(u, v)` query: adjacency-set is O(1) expected, adjacency-list is O(deg(u)). Worth a `notebox`.
- **In-degree / out-degree formal definitions** for directed graphs.
- The vocabulary TikZ diagram (S4 item 1).

**Recommendation: ADD** ~25 lines (vocab TikZ diagram + adjacency-set notebox).

### §10.5 (BFS) — ADD (substantial)

**Current:** Per inventory, BFS is covered in §10.5.

**OCW Lec 9 / CLRS §22.2 additions:**
- **Layer-monotonicity proof** that BFS produces shortest paths in unweighted graphs. ch_10 likely says "BFS gives shortest paths" but probably without the formal layer argument.
- **Parent-pointer / BFS tree** explicit construction. The tree is what BFS-as-data-structure produces; useful for path reconstruction.
- The 6-node BFS layer TikZ diagram (S4 item 2).
- An `examplebox` worked BFS trace.

**Recommendation: ADD** ~50 lines:
- TikZ diagram + examplebox trace.
- Layer-monotonicity proof in a `notebox`.
- Parent-pointer tree explicit construction subsection.

### §10.6 (DFS) — ADD (substantial)

**Current:** Per inventory, DFS iterative + recursive, but **edge classification is named-but-not-implemented** and SCC is named-but-not-implemented.

**OCW Lec 10 / CLRS §22.3 additions:**
- **Edge classification (tree / back / forward / cross)** — fundamental machinery; powers cycle detection + SCC + articulation points. Currently absent in ch_10. Add a full subsection with the TikZ diagram (S4 item 3) and a `defnbox` for each edge type.
- **Cycle detection** via "back edge exists" — currently named (per inventory: "cycle-detection-via-DFS-recursion-flag") but not implemented. Add the algorithm + 15-line C++ implementation.
- **Topological sort via DFS post-order** — currently in §10.11 (per inventory) but the connection to DFS edge classification belongs here. Cross-link.

**Recommendation: ADD** ~80 lines:
- Edge-classification subsection with TikZ + 4 `defnbox`es.
- Cycle-detection-via-back-edge subsection with C++ implementation.
- Forward-ref §10.11 topological sort connection.

### §10.7 (directed graphs + DAGs) — SKIP / minor

**Current:** Per inventory, DAGs covered.

**Add:** the build-system DAG TikZ diagram (S4 item 4) with a 1-paragraph application: "every modern build system (`make`, Bazel, Cargo) is a DAG topological sort." ~20 lines.

### §10.8–§10.9 (weighted graphs + Dijkstra) — ADD (substantial)

**Current:** Per inventory, Dijkstra is covered with min-heap + stale-entry idiom (good — that's a real implementation detail).

**OCW Lec 11 / CLRS §24.3 additions:**
- **Relaxation as the universal SSSP primitive** — frame Dijkstra, Bellman-Ford, and DAG-relax as instances of "relax every edge in some order; correctness comes from the order." Currently ch_10 likely treats them as separate algorithms; the unification is pedagogically powerful.
- **Why Dijkstra requires non-negative weights** — explicit counterexample on a 3-node graph with a negative edge, showing Dijkstra prematurely commits to a path. CLRS §24.3 figure.
- The 5-node weighted-graph Dijkstra trace TikZ diagram (S4 item 5) + an `examplebox` worked trace.
- **Decrease-key vs lazy-deletion in the heap** — ch_10's "stale-entry idiom" per inventory IS the lazy-deletion approach. Worth a `notebox` contrasting with the textbook decrease-key approach (which requires a more complex heap, like `boost::heap::fibonacci_heap`).

**Recommendation: ADD** ~70 lines:
- Relaxation `defnbox` + unification framing.
- Negative-edge counterexample TikZ + analysis.
- Worked Dijkstra trace examplebox + TikZ diagram.
- Decrease-key vs lazy-deletion notebox.

### §10.10 (Bellman-Ford) — ADD (substantial)

**Current:** Per inventory, Bellman-Ford covered.

**OCW Lec 12 / CLRS §24.1 additions:**
- **|V|−1-round relaxation correctness proof** — by induction on path length: after `k` rounds, all paths of length `≤ k` are correctly relaxed. After `|V|−1` rounds, all simple paths are correctly relaxed.
- **Negative-cycle detection** — one extra round; if any edge still relaxes, a negative cycle is reachable from the source. Currently may be named-only.
- An `examplebox` worked Bellman-Ford trace including a negative-cycle case.

**Recommendation: ADD** ~50 lines.

### §10.11 (topological sort) — UPDATE / connect

**Current:** Per inventory, both Kahn's algorithm + DFS post-order are covered.

**Add:** cross-link §10.11 to §10.6's edge-classification (back-edge ⇒ cycle ⇒ no topo order). Brief framing tweak; ~10 lines.

### §10.12 (MST: Kruskal + Prim + DSU) — ADD (substantial)

**Current:** Per inventory, Kruskal with full DSU (path compression + union by rank) **plus Prim sketch**. Prim is "sketched" — needs full coverage.

**CLRS §23.1 + §23.2 additions:**
- **Cut property** + **cycle property** — the two structural lemmas justifying both Kruskal and Prim. Currently absent. Single most pedagogically valuable add to this section. CLRS Theorem 23.1 + 23.2.
- **Full Prim implementation** — currently only sketched. Full C++ implementation with priority-queue substrate, ~25 lines code.
- The 6-node MST TikZ diagram (S4 item 6) showing the cut property.
- DSU O(α(n)) inverse-Ackermann analysis brief — currently inventory says "full DSU" but unclear if amortized analysis is included.

**Recommendation: ADD** ~80 lines:
- Cut + cycle property defnboxes + sketched proofs.
- Full Prim implementation.
- TikZ MST diagram.
- DSU amortized analysis notebox.

### §10.13 (Floyd-Warshall + tropical-semiring) — SKIP / minor

**Current:** Per inventory, Floyd-Warshall + tropical-semiring view. Already deep — that's a CLRS-level treatment.

**Add:** brief note connecting Floyd-Warshall's DP-on-vertex-set framing to the relaxation primitive from §10.9. ~10 lines.

### NEW §10.14 — Strongly Connected Components — ADD (significant)

**OCW Lec 10 / CLRS §22.5:** SCC via Kosaraju (DFS twice — once on G, once on G transposed in reverse-post-order). Currently named-but-not-implemented per inventory.

**Recommendation: ADD a new §10.14 "Strongly Connected Components"** with:
- `defnbox` for SCC + DAG-of-SCCs.
- Kosaraju's algorithm with full C++ implementation (~30 lines code).
- Tarjan's algorithm as an alternative (`notebox` summary, no full implementation; cite CLRS §22.5 for the depth).
- TikZ diagram showing a directed graph + its SCC condensation.
- Application: 2-SAT solving via SCC, dependency cycle detection in package managers (cargo, npm).

**Estimated add:** ~80 lines.

### NEW §10.15 — Algorithm-selection decision table — ADD

**Current:** ch_10 has 6 `tabular` choosers per inventory but **no master-decision table** consolidating "given a problem, pick this algorithm."

**Recommendation: ADD** a single big decision-table `tabular` (~30 lines TeX) with rows for problem-types (single-pair shortest path / single-source / all-pairs / MST / topo / cycle detect / SCC / connectivity) and columns for graph-properties (unweighted / non-negative / negative-no-cycle / negative-with-cycle / DAG / sparse / dense). Cells = which algorithm + complexity + cs-300 section reference.

Forward-ref this table from the chapter-map ideabox + the mastery checklist.

### NEW §10.16 — A* / Johnson / advanced pointers (forward-direction notebox) — ADD

**Current:** Per inventory, A* and Johnson's algorithm are named-but-not-implemented.

**Recommendation: ADD a closing `notebox`** (~25 lines) covering:
- **A\***: Dijkstra + heuristic; admissibility + consistency. Cite CLRS Ch 24.5 + Russell-Norvig AI textbook.
- **Johnson's algorithm**: APSP for sparse graphs via Bellman-Ford reweighting + |V| Dijkstra runs. CLRS §25.3.
- **Network flow (Ford-Fulkerson, Edmonds-Karp)**: forward direction, not in cs-300, CLRS Ch 26.
- **Planar graphs**: 4-color theorem, planarity testing, mention only.

Don't implement any; just point at the topics + canonical references for the curious reader. Same role as ch_7 §7.7's Fibonacci-heap forward ref.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3) | Re-frame existing closing ideabox + Prim correction | ~10 |
| Throughout (S4) | 6 TikZ diagrams + 3 examplebox traces | ~150 |
| §10.1–10.4 | Vocab TikZ + adjacency-set notebox | ~25 |
| §10.5 | BFS layer-monotonicity proof + parent-tree subsection | ~50 |
| §10.6 | Edge classification subsection + cycle-detection impl | ~80 |
| §10.7 | Build-system DAG application | ~20 |
| §10.8–10.9 | Relaxation framing + neg-edge counterexample + Dijkstra trace + decrease-key notebox | ~70 |
| §10.10 | |V|−1-round proof + negative-cycle detection + worked trace | ~50 |
| §10.11 | DFS edge-classification cross-link | ~10 |
| §10.12 | Cut + cycle properties + full Prim + MST TikZ + DSU notebox | ~80 |
| §10.13 | Floyd-Warshall ↔ relaxation framing | ~10 |
| NEW §10.14 | Strongly Connected Components (Kosaraju + Tarjan ref + 2-SAT) | ~80 |
| NEW §10.15 | Master algorithm-selection decision table | ~30 |
| NEW §10.16 | A* / Johnson / Network-flow forward-direction notebox | ~25 |
| **Total** | | **~730** |

ch_10 grows from 842 → ~1572 lines, 18 → ~36–40 pages. Roughly doubles the chapter; brings depth in line with ch_9.

## Open decisions for the user

1. **TikZ graph drawing machinery** — ch_9 has TikZ binary trees; ch_10 needs general directed-graph drawing. Default: extend the existing TikZ setup with a small graph-style preamble (one `\tikzset{...}` block in `notes-style.tex` adding `vertex/edge` styles). Risk: small, well-understood. **Default: extend in-place during Step 3.**
2. **SCC depth** — Kosaraju (full implementation) is the gap report's recommendation. Alternative: Tarjan's (more elegant single-pass DFS but harder to derive). Default: **Kosaraju full + Tarjan summary** (Kosaraju is easier to derive, both are CLRS).
3. **Network flow / planarity** in §10.16 — depth: notebox-only (default) vs full subsection. The user may want to defer max-flow to a future ch_? if they care about it; cs-300's roadmap doesn't currently include network flow. Default: **notebox-only**, no full content.

Defaults apply per `feedback_chapter_review_autonomy.md`.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_10/lectures.tex`) lands in this order:

1. Apply S0 if any pre-existing typos surfaced (none flagged in inventory — skip).
2. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
3. Add §10.1–10.4 vocab TikZ + adjacency-set notebox.
4. Add §10.5 BFS proof + TikZ + examplebox.
5. Add §10.6 edge-classification subsection + cycle-detection impl + TikZ.
6. Add §10.7 build-system DAG application + TikZ.
7. Add §10.8–10.9 relaxation framing + Dijkstra trace TikZ + counterexample + decrease-key notebox.
8. Add §10.10 Bellman-Ford proof + neg-cycle detection + examplebox.
9. Add §10.11 cross-link to §10.6 edge classification.
10. Add §10.12 cut+cycle properties + full Prim + MST TikZ + DSU notebox.
11. Add §10.13 Floyd-Warshall ↔ relaxation framing.
12. Add NEW §10.14 SCC (Kosaraju full + Tarjan summary + TikZ + 2-SAT app).
13. Add NEW §10.15 master decision table.
14. Add NEW §10.16 A* / Johnson / Network-flow forward-direction notebox.
15. Re-frame existing §10.13 closing ideabox per S3 (Prim correction + forward-refs).
16. Extend `notes-style.tex` with TikZ graph-style preamble if needed.
17. `pdflatex -halt-on-error chapters/ch_10/lectures.tex` two passes — both must exit 0.
18. CHANGELOG entry.

Step 3 happens via builder subagent.
