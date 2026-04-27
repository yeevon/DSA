# Chapter 11 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_11/lectures.tex` (432 lines, 9 pp; inventoried in `ch_11.md`) **against** **CLRS 3rd-ed Ch 18 (B-Trees)** as the primary source. **OCW 6.006 Spring 2020 does NOT dedicate a lecture to B-trees** (mentioned only in passing). Secondary references: `Modern B-Tree Techniques` (Goetz Graefe), Linux ext4 / Btrfs design docs, the SQLite + PostgreSQL B-tree implementations.

**Locked framing (optional-chapter arc, 2026-04-25):** ch_11 is a **post-SNHU optional chapter**. Page cap + 3-5 bounded-additions rule are **OFF**. Depth bar is "actual mastery."

**Crucial baseline note:** ch_11 is **the thinnest optional chapter** (432 lines, 9 pp, 17 callouts, 1 TikZ). Domain-citation density is high (production refs cluster in §11.1 — databases, filesystems, KV stores, git packfile) but technical depth is light vs ch_9's CLRS-register treatment of AVL/RB. Plus: the inventory surfaced four pre-existing discrepancies between `lectures.tex` and `notes.tex` that need housekeeping during Step 3.

**Reference material:**
- CLRS 3rd-ed Ch 18 (B-Trees) — confirmed: §18.1 Definition (with the **minimum-degree parameter `t`** convention; ch_11 uses `Order K` instead — same content, different convention), node properties (every internal node except root has at least `t-1` keys, at most `2t-1` keys), height bound `h ≤ log_t((n+1)/2)`. §18.2 Basic operations: B-TREE-SEARCH, B-TREE-CREATE, B-TREE-SPLIT-CHILD, B-TREE-INSERT, B-TREE-INSERT-NONFULL — **the preemptive-top-down-split insertion strategy** that makes insertion single-pass. §18.3 Deletion: **the 4-case deletion taxonomy** (1 = key in leaf; 2 = key in internal node + 3 sub-cases; 3 = key not in current node + 2 sub-cases for ensuring the path has enough keys).
- Per inventory, `chapters/ch_11/notes.tex` exists with content that diverges from `lectures.tex` on (a) the `⌈m/2⌉-1` minimum-keys bound (notes.tex has it; lectures.tex's `defnbox` omits it), (b) implementation approach (notes.tex `std::vector`-based vs lectures.tex `BTreeNode<Order>` templated fixed-array), (c) several lectures.tex helper functions are named-but-unimplemented (illustrative not runnable).
- Per inventory, the §11.5 closing `ideabox` "Chapter takeaway" exists but **omits the chapter's sub-algorithms in its unification list** — different from ch_10's enumeration pattern.

**OCW vs CLRS coverage style:** OCW skips B-trees because they're a systems-flavored topic (CLRS Ch 18 treats them in detail; the "introductory algorithms" curriculum prioritizes binary trees + balanced binary trees as the canonical balanced-tree story). For ch_11 augmentation, **CLRS is the only canonical reference** — no OCW to triangulate against.

---

## S0 — Pre-augmentation cleanups (existing discrepancies surfaced by Step 1)

Four issues from the inventory. Folded into Step 3 housekeeping:

### S0.1 — `defnbox` minimum-keys bound missing — FIX

**Current:** `lectures.tex` `defnbox` for B-tree nodes states the maximum-keys bound (`2t-1` keys, equivalent to `2K` in cs-300's `Order K` convention) but omits the minimum: every internal node except the root has at least `t-1` keys (i.e., `K` in cs-300 convention).

**Fix:** add the minimum-keys clause to the `defnbox` plus a `notebox` calling out the root-exception (root can have 1 to `2K` keys).

### S0.2 — `lectures.tex` vs `notes.tex` impl convention divergence — DECIDE / FIX

**Current:** `lectures.tex` uses `BTreeNode<Order>` templated with a fixed-array; `notes.tex` uses `std::vector`-based `BTNode`. Both are defensible (templated for compile-time fixed fanout = better cache; vector for runtime-tunable fanout = simpler). But the divergence between the two artefacts in the same chapter is confusing.

**Recommendation: DECIDE (default = align both around templated-fixed-array form, since lectures.tex is the primary).** Update notes.tex to either reference the lectures.tex form or use it directly. ~10 lines of notes.tex change.

### S0.3 — Named-but-unimplemented helpers in lectures.tex listings — FIX

**Current:** Per inventory, several insert/remove listings rely on illustrative helpers like `insertNonFull` / `splitChild` / `mergeChildren` that are referenced but not fully implemented in the lstlistings.

**Fix:** add a single `lstlisting` block (or two) that defines the helper signatures with brief implementations. ~30 lines of code. Doesn't need to be production-ready — needs to be runnable-shape so the reader can trace the calls.

### S0.4 — "Chapter takeaway" doesn't enumerate sub-algorithms — UPDATE

**Current:** §11.5 closing `ideabox` exists but omits enumeration of the chapter's sub-algorithms (search / preemptive-split-insert / preemptive-merge-remove / rotation+fusion).

**Fix:** rewrite the closing ideabox to enumerate the sub-algorithms in a unification list (matches ch_10 convention). Folded into S3 below.

---

## Structural gaps (apply to chapter as a whole)

Same three structural gaps as ch_7 / ch_9 / ch_10:

### S1 — No opening chapter-map `ideabox` — ADD

**Required:** opening `ideabox` titled "Chapter map" with three sub-blocks:

1. **Where this sits in CS 300** — ch_11 is the **shallow-and-wide tree chapter**. ch_9 covered AVL + RB as the canonical balanced binary trees (height O(log n), every level branches by 2); ch_11 generalises to balanced K-ary trees (height O(log_K n), every level branches by K). The motivating shift is the **memory hierarchy**: when each level of the tree is a disk seek (or DRAM cache miss, or NVMe read), reducing height by `log_2(K)` is enormous. B-trees are why every modern database, filesystem, and KV store uses them — explicit production references.
2. **What you add to your toolkit** —
   - The **minimum-degree `t` parameter** (or cs-300's `Order K` convention) and the resulting node-occupancy bounds (`K` to `2K` keys per node, root exception).
   - Height bound `h ≤ log_t((n+1)/2)` — derive from the worst-case occupancy.
   - **Preemptive top-down split** as the single-pass insertion strategy.
   - **Preemptive merge / rotation** as the deletion strategy.
   - **B+ trees** — the variant where data lives only at leaves + linked-list-of-leaves enables range queries.
   - When B-trees show up in production: SQLite indexes, PostgreSQL, MySQL InnoDB, ext4 / Btrfs / XFS (filesystem inodes), git packfiles (.idx files), LSM-trees-over-B-trees (LevelDB, RocksDB).
3. **Looking ahead / forward refs** — ch_12 (set ADT — `std::set`/`std::map` use red-black; B-trees are the disk-side analog when persistence matters); the production-database / systems-programming follow-on direction generally.

### S2 — No 7-item mastery checklist — ADD

**Required:** 7-item mastery checklist:

1. State the B-tree node-occupancy invariant + sketch why height is `O(log_K n)`.
2. Run a B-tree search by hand on a 3-level tree of order K=2: identify the in-node scan + descent.
3. Walk through a preemptive top-down split insertion: insert into a tree where the path contains a full node + identify how the split propagates.
4. Identify the four CLRS B-TREE-DELETE cases (key in leaf / key in internal node + subcase 2a/2b/2c / key not in current node + subcase 3a/3b) on a worked example.
5. Distinguish B-tree from B+ tree: data-at-internal-nodes vs data-at-leaves-only + linked-list-of-leaves; argue when the B+ form is preferable (range queries + sequential scans).
6. Pick the right B-tree order `K` for a given memory hierarchy: page size, key+pointer size, target node-fits-in-cacheline-or-page property. Production targets (e.g., SQLite uses ~256-key fanout for 1KB pages; modern OLTP systems target K=64–256 to keep nodes in L2/L3 cache).
7. State why B-trees beat hash tables for filesystem / database indexes (range queries + sequential scans + ordered iteration; hash tables don't support those).

### S3 — Closing `ideabox` rewrite (S0.4 follow-through) — UPDATE

**Required:** rewrite the §11.5 closing `ideabox` to:
- Enumerate the sub-algorithms (search / preemptive-split-insert / preemptive-merge-remove / rotation+fusion) per the ch_10 unification convention.
- Add forward-refs to ch_12 (set ADT impl choices).
- Keep the existing production-references content; just add the enumeration + forward-refs.

### S4 — Only 1 TikZ figure across 9 pages — ADD several worked diagrams

**Current:** ch_11 has 1 TikZ figure (split diagram in §11.3). B-trees benefit hugely from worked diagrams since the operations are visual.

**Required:** at least 4 TikZ B-tree diagrams (using cs-300's existing TikZ machinery or the new graph-style preamble from ch_10):

1. §11.1: a **3-level B-tree of order K=2** with annotated keys + child pointers, showing the structural invariants.
2. §11.3: **preemptive split during top-down insert** — current §11.3 has a basic split diagram; expand to show the preemption (when to split a full node on the way down) with before/after frames.
3. §11.4: **rotation between sibling nodes** (borrow from sibling) + **fusion** (merge with sibling + parent key) — two paired diagrams showing the two deletion-prep strategies.
4. §11.5: **B-tree vs B+ tree comparison** — same-order B-tree side-by-side with B+ tree, highlighting where data lives + the linked-list-of-leaves connection in B+.

Plus 2 corresponding `examplebox` worked traces:
- §11.3: insert sequence into an empty B-tree of order K=2 showing 4-5 frames including a root split.
- §11.5: delete sequence triggering all 3 main CLRS deletion cases (key in leaf / key in internal node / key not in current node + path-fixup).

---

## Per-section gap verdicts

For each ch_11 section: **ADD**, **DECIDE**, or **SKIP**. Given ch_11's thin baseline, expect more ADDs.

### §11.1 (Structure + production citations) — ADD (small)

**Current:** Per inventory, B-tree definition + production-domain citations cluster here.

**CLRS Ch 18.1 additions:**
- **Minimum-degree `t` parameter convention** alongside cs-300's `Order K`. Cite both — readers coming from CLRS will look for `t`.
- **Height bound derivation** `h ≤ log_t((n+1)/2)` — proof by node-occupancy argument (worst case: every node has minimum keys; count nodes per level geometrically).
- **Disk-access cost model** — B-trees were invented for the memory hierarchy. Each node access is one disk read; the goal is to minimise reads ⇒ minimise height ⇒ maximize fanout. Worth a `defnbox` framing the cost model + a `notebox` with concrete numbers (1KB page, 8-byte keys + pointers ⇒ K ≈ 60).

**Recommendation: ADD** ~50 lines:
- `t` ↔ `K` convention bridge (notebox).
- Height bound derivation + `defnbox`.
- Disk-access cost model + concrete numbers notebox.
- 3-level TikZ diagram (S4 item 1).

### §11.2 (Search) — ADD (small)

**Current:** Per inventory, B-tree search via in-node scan + descent.

**CLRS Ch 18.2 addition:**
- **B-TREE-SEARCH pseudocode** — clean recursive form with the in-node `linear-search-or-binary-search` choice + descent. CLRS uses linear search for simplicity; production uses binary within node. Worth a `notebox` calling out the in-node choice.
- **Cost analysis**: O(t log_t n) CPU (linear in-node) vs O(log_2 t * log_t n) = O(log n) (binary in-node). The CPU cost is independent of fanout; **disk cost** is what fanout reduces.

**Recommendation: ADD** ~25 lines (notebox + cost-table tabular).

### §11.3 (Insertion) — ADD (substantial)

**Current:** Per inventory, preemptive-split insert with root-split-as-only-growth event.

**CLRS Ch 18.2 additions:**
- **Why preemptive top-down (not retroactive bottom-up)?** CLRS Ch 18.2 proof sketch: bottom-up split would require a second pass (or a parent-pointer walk) when a split propagates to the root. Top-down preemption avoids this by splitting any full node BEFORE descending into it, ensuring the parent always has room. Worth a `notebox`.
- **B-TREE-SPLIT-CHILD operation** — formal pseudocode for splitting a full child of a non-full parent. The split moves the median key to the parent, splits the children into two halves.
- **B-TREE-INSERT-NONFULL** — recursive insert into a guaranteed-non-full node.
- Expand the §11.3 split TikZ to show preemption (S4 item 2).
- An `examplebox` worked insert sequence.

**Recommendation: ADD** ~70 lines:
- Why preemptive top-down notebox.
- B-TREE-SPLIT-CHILD + B-TREE-INSERT-NONFULL pseudocode (or C++).
- Expanded TikZ + examplebox trace.

### §11.4 (Rotations and Fusion) — ADD (substantial)

**Current:** Per inventory, rotations vs fusion + AVL-rotation-disambiguation.

**CLRS Ch 18.3 additions:**
- **CLRS B-TREE-DELETE 4-case taxonomy** — the formal statement that ch_11 currently sidesteps. Cases: (1) key in leaf node + leaf has at least `t` keys ⇒ just delete; (2) key in internal node — three subcases (2a left-child-has-≥t-keys ⇒ predecessor-replace, 2b right-child-has-≥t-keys ⇒ successor-replace, 2c both children have `t-1` ⇒ merge children + recurse); (3) key not in current node — two subcases (3a sibling-has-≥t-keys ⇒ borrow, 3b no sibling has `t` keys ⇒ merge).
- **Why preemptive merge during descent (not retroactive)** — same logic as preemptive split for insert. Walking down with the invariant "current node has at least `t` keys" simplifies the recursion.
- The two paired TikZ diagrams (S4 item 3): rotation-from-sibling vs fusion-with-sibling.

**Recommendation: ADD** ~60 lines:
- CLRS 4-case taxonomy + sub-cases as a structured `defnbox` or numbered list.
- Why preemptive merge notebox.
- Two paired TikZ diagrams.

### §11.5 (Removal + B+ tree coda) — ADD (substantial)

**Current:** Per inventory, preemptive-merge remove + B+ trees as a `notebox` coda.

**Additions:**
- **B+ tree expansion** — the current single-notebox coda is too thin for a topic that's the actual production form (most database B-trees are B+ trees, not classic B-trees). Expand to a half-section:
  - **Data only at leaves** — internal nodes hold routing keys only.
  - **Linked-list-of-leaves** — enables range queries + sequential scans without re-descending.
  - **Higher fanout** — no data values at internal nodes ⇒ more keys fit per page ⇒ shorter trees.
  - **B+ vs B contrast tabular**.
  - The §11.5 TikZ comparison diagram (S4 item 4).
- **CLRS B-TREE-DELETE worked example** — examplebox with the 4-case taxonomy exercised across multiple frames.

**Recommendation: ADD** ~80 lines:
- B+ tree expansion (~40 lines).
- Comparison TikZ.
- 4-case examplebox trace.

### NEW §11.6 — Memory-hierarchy and production B-tree variants — ADD

**Topic ch_11 hints at via production citations but doesn't go deep.** Worth a dedicated section:

- **2-3 trees ↔ red-black trees equivalence** — beautiful structural theorem (CLRS Ch 13 problem). Each red-black tree corresponds to a 2-3-4 tree with a specific orientation. Worth a `notebox` because it ties ch_11 back to ch_9.
- **Cache-oblivious B-trees** — van Emde Boas layout achieves O(log_B n) without knowing block size B. Forward-direction notebox (CLRS doesn't cover; cite "Cache-Oblivious B-Trees" Bender et al. 2000).
- **LSM-trees** — alternative to B-trees for write-heavy workloads (LevelDB, RocksDB, Cassandra). Notebox-only forward-ref.
- **Fractal trees / Bw-trees** — research B-tree variants. Notebox-only.

**Recommendation: ADD a new §11.6 "Memory hierarchy and B-tree variants"** with the four notebox/short-subsection items. ~50 lines.

### NEW §11.7 — Production references + further reading — ADD

Same role as ch_9's §9.10 — consolidate the production-reference-soup that's currently scattered across §11.1 into a single closing references block:

- **SQLite** — B+ trees with default page size 4096 bytes; configurable.
- **PostgreSQL** — B+ trees (`btree` access method); also has `gist` / `gin` for spatial / inverted indexes.
- **MySQL InnoDB** — clustered B+ tree on primary key.
- **Linux ext4** — htree (B+ tree variant) for directory entries.
- **Btrfs** — copy-on-write B+ trees throughout.
- **git packfile (.idx)** — sorted-array index, not B-tree (different access pattern), but worth contrasting.
- **CLRS Ch 18** — canonical reference.
- **Modern B-Tree Techniques** (Goetz Graefe, 2010 monograph) — production-engineering reference.

~25 lines.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3, S0.4) | Rewrite §11.5 closing ideabox + sub-algorithm enumeration + forward-refs | ~15 |
| S0.1 | `defnbox` minimum-keys clause + root-exception notebox | ~8 |
| S0.2 | `notes.tex` impl convention alignment | ~10 |
| S0.3 | Helper-function implementations in lstlisting | ~30 |
| Throughout (S4) | 4 TikZ diagrams + 2 examplebox traces | ~120 |
| §11.1 | `t` ↔ `K` bridge + height bound + disk-access cost model | ~50 |
| §11.2 | B-TREE-SEARCH + cost analysis tabular | ~25 |
| §11.3 | Preemptive-top-down notebox + SPLIT-CHILD + INSERT-NONFULL | ~70 |
| §11.4 | CLRS 4-case taxonomy + preemptive-merge framing | ~60 |
| §11.5 | B+ tree expansion + 4-case examplebox | ~80 |
| NEW §11.6 | Memory-hierarchy + 2-3-4↔RB + cache-oblivious + LSM forward-ref | ~50 |
| NEW §11.7 | Production references notebox | ~25 |
| **Total** | | **~583** |

ch_11 grows from 432 → ~1015 lines, 9 → ~22-25 pages. Pulls ch_11 out of the "shortest optional chapter" position and brings it closer to ch_10 (33pp post-augmentation) / ch_7 (28pp post-augmentation). Note: actual line growth typically overshoots estimate per ch_7/ch_9/ch_10 precedent (each ran ~700-1200 lines vs ~280-730 estimates).

## Open decisions for the user

1. **`notes.tex` reconciliation depth (S0.2)** — full alignment to lectures.tex's templated-fixed-array form (default), light-touch reference-only update, or leave divergence as-is with a single `notebox` calling it out? Default: full alignment.
2. **B+ tree depth (§11.5)** — half-section (default ~40 lines) or full new §11.5b subsection? Default: half-section. The ch_12 set-ADT chapter will likely cover B+ trees again from the ADT-implementation angle, so we don't need to over-deepen here.
3. **2-3-4 ↔ RB equivalence (§11.6)** — notebox-only (default) or full subsection with worked correspondence example? Default: notebox-only. Beautiful theorem but not load-bearing for B-tree mastery.

Defaults apply per `feedback_chapter_review_autonomy.md`.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_11/lectures.tex`) lands in this order:

1. Apply S0.1 (defnbox minimum-keys clause).
2. Apply S0.2 (notes.tex alignment — small notes.tex edit).
3. Apply S0.3 (helper-function implementations in lstlisting).
4. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
5. Add §11.1 disk-access cost model + height bound + 3-level TikZ.
6. Add §11.2 B-TREE-SEARCH + cost analysis.
7. Add §11.3 preemptive-top-down notebox + SPLIT-CHILD + INSERT-NONFULL + examplebox + expanded TikZ.
8. Add §11.4 CLRS 4-case deletion taxonomy + paired rotation/fusion TikZ.
9. Add §11.5 B+ tree expansion + 4-case examplebox + comparison TikZ.
10. Add NEW §11.6 (memory hierarchy + 2-3-4↔RB + cache-oblivious + LSM forward-ref).
11. Add NEW §11.7 (production references notebox).
12. Rewrite §11.5 closing ideabox per S3+S0.4.
13. `pdflatex -halt-on-error chapters/ch_11/lectures.tex` two passes — both must exit 0.
14. CHANGELOG entry.

Step 3 happens via builder subagent.
