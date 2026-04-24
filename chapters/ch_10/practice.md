---
layout: default
permalink: /practice/ch_10/
---

# Chapter 10 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Reuse the standard wrapper
from `chapters/ch_1/practice.md` if priming a fresh session.

---

## Drill 1 — Build a graph by hand

**Problem.** Given vertices $\{A, B, C, D, E\}$ and undirected edges
$\{(A,B), (A,C), (B,D), (C,D), (D,E)\}$, draw the graph. Then write
out (a) its adjacency list, (b) its adjacency matrix. Compute the
degree of every vertex and verify the handshake lemma:
$\sum \deg = 2|E|$.

*Skill:* graph vocabulary + the two main representations.

---

## Drill 2 — Adjacency list in C++

**Problem.** Read a graph from stdin as ``$n\ m$'' followed by $m$
lines of ``$u\ v$''. Store it in `vector<vector<int>>` (undirected).
Provide `addEdge(u, v)`, `hasEdge(u, v)`, and an iterator for
neighbors. Explain the space cost in terms of $n, m$.

*Skill:* the representation used in every graph algorithm in the
chapter.

---

## Drill 3 — BFS with distance and parent

**Problem.** Implement `vector<int> bfsDist(const AdjList&, int s)`
returning the distance from $s$ to every vertex, and a parallel
`parent[]` array for path reconstruction. Pseudocode the queue
invariant: ``when we dequeue $u$, \texttt{dist[u]} is final.'' Then
C++. Run on drill 1's graph starting from $A$.

*Skill:* BFS is the unweighted-shortest-path workhorse.

---

## Drill 4 — DFS, recursive and iterative

**Problem.** Implement DFS two ways: recursive `dfs(u)` with a
`visited[]` array; iterative with an explicit stack. Both should
produce a ``traversal order'' list. Explain why the iterative
version's order can differ from the recursive one, even on the same
graph.

*Skill:* both forms come up — recursive reads cleaner, iterative
avoids stack overflow on deep graphs.

---

## Drill 5 — Cycle detection (directed)

**Problem.** Given a directed graph, detect a cycle using DFS with
three vertex states: \textsc{White} (unseen), \textsc{Gray} (on the
current DFS path), \textsc{Black} (fully processed). A gray-to-gray
edge is a back edge; a back edge means there's a cycle. Pseudocode,
then C++. Test on an acyclic and a cyclic example.

*Skill:* the three-color DFS — the foundation of topological sort
and strongly-connected-components algorithms.

---

## Drill 6 — Dijkstra with a min-heap

**Problem.** Implement Dijkstra's algorithm on a weighted graph
(edges with non-negative weights) using a
`std::priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>>`.
Pseudocode: why the \emph{lazy-delete} (skip if $d >$ \texttt{dist[u]})
is needed. Then C++. Report shortest distances from a source to all
vertices on a hand-drawn 5-node graph.

*Skill:* the algorithm you'll run most often in coursework;
lazy-delete trap is a common exam gotcha.

---

## Drill 7 — Bellman-Ford

**Problem.** Implement Bellman-Ford: relax every edge $V-1$ times;
one more pass to detect negative cycles. Pseudocode, then C++. Run
on a graph with some negative-weight edges. Contrast runtime with
Dijkstra ($O(VE)$ vs.\ $O((V+E)\log V)$) and say when you'd pick
Bellman-Ford anyway.

*Skill:* the negative-edge cousin of Dijkstra; classic
currency-arbitrage / reward-net use case.

---

## Drill 8 — Topological sort, Kahn's version

**Problem.** Implement Kahn's algorithm: compute in-degrees; push
all zero-in-degree vertices into a queue; pop, emit, decrement
neighbors' in-degrees, push new zeros. Detect a cycle if the emitted
count is less than $n$. Pseudocode, then C++. Test on a small DAG
(``get-dressed'' or course-prereq graph).

*Skill:* the BFS-flavored topo; intuitive and handles cycle detection
naturally.

---

## Drill 9 — Topological sort, DFS version

**Problem.** Implement DFS-based topological sort: run DFS; each
time a vertex is \emph{finished}, push it onto a stack; reverse the
stack to get the topo order. Pseudocode, then C++. Contrast with
Kahn's: which is easier to add cycle detection to?

*Skill:* the DFS-flavored topo; shows the connection between
post-order and topological ordering.

---

## Drill 10 — Kruskal's MST

**Problem.** Implement Kruskal's minimum spanning tree: sort edges
by weight; use union-find to add an edge iff its endpoints are in
different components. Pseudocode, then C++. You'll need a tiny
union-find (rank + path compression). Runtime?

*Skill:* MST + a bonus drill on union-find, which shows up in
connectivity problems everywhere.

---

## Drill 11 — Floyd-Warshall, all-pairs shortest path

**Problem.** Implement Floyd-Warshall on a dense weighted graph
(adjacency matrix). Pseudocode the triple loop and explain the $k$-loop
invariant: after iteration $k$, `d[i][j]` is the shortest path using
only intermediate vertices from $\{0, \ldots, k\}$. Then C++. Run on
a 5-vertex example.

*Skill:* the cleanest all-pairs algorithm; connects DP intuition
(successive relaxation) to graph algorithms.

---

## Drill 12 — Algorithm picker

**Problem.** For each scenario, pick an algorithm and justify:
(a) unweighted shortest path from one source;
(b) shortest path with non-negative weights;
(c) shortest path with some negative weights;
(d) detect whether a dependency graph has a cycle;
(e) minimum-cost way to connect a set of cities with roads;
(f) dense graph, need shortest distances between every pair of cities.
Mark me wrong if I pick the right algo for the wrong reason (negative
edges, density, or query type).

*Skill:* algorithm selection under realistic-sounding prompts — the
exam shape for any graph chapter.

---

## Meta-drill — Graph sprint

Set a 60-minute timer. Starting from an empty file, implement: graph
read-in, BFS with distances, DFS, directed-cycle detection, Dijkstra,
Kahn's topo sort. No references. Claude reviews for: correctness,
using the right container (queue vs.\ stack vs.\ PQ), the lazy-delete
trap, and whether the code handles disconnected graphs.
