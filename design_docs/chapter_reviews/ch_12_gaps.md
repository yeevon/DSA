# Chapter 12 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_12/lectures.tex` (300 lines, 6 pp; inventoried in `ch_12.md`) **against** OCW 6.006 Spring 2020 r01 (Set-from-Sequence), lec4 (Hashing) + r04, lec5 (Direct-Access Arrays) + r05, and CLRS 3rd-ed Ch 11 (Hash Tables) + Ch 12 (BSTs as Sets) + Ch 13 (RB as Ordered Set) + Ch 21 (Disjoint-Set Data Structure).

**Locked framing (optional-chapter arc, 2026-04-25):** ch_12 is a **post-SNHU optional chapter**. Page cap + 3-5 bounded-additions rule are **OFF**. Depth bar is "actual mastery."

**Crucial baseline note:** ch_12 is the **shortest optional chapter** (300 lines, 6 pp, 13 callouts, 0 TikZ). The chapter is positioned as a **survey + impl-picker** for the Set ADT, but the impl rows in its tables (hash table / red-black tree / B-tree / sorted array / bitset) are mostly cell-labels with no cross-chapter forward-refs to where those impls actually live in cs-300 (ch_5 hash / ch_9 RB / ch_11 B-tree). **Biggest single gap: the chapter doesn't tie back to the rest of the book.**

**Reference material:**
- OCW r01.pdf — Set-from-Sequence reduction exercise (covered in ch_1's gap analysis already; relevant here as the conceptual foundation: "a set is just a sequence with the contains-key operation prioritised").
- OCW lec4.pdf + r04.pdf — Hashing: hash functions, collision resolution, set-via-hash. cs-300's ch_5 covers this; ch_12 should forward-ref.
- OCW lec5.pdf + r05.pdf — Direct-Access Arrays: O(1) lookup when key universe is small (the bitset / characteristic-vector representation).
- CLRS Ch 11 — Hash Tables (covered in ch_5).
- CLRS Ch 12 — BSTs as Sets (relevant baseline; covered in ch_6 / extended in ch_9).
- CLRS Ch 13 — Red-Black Trees as Ordered Sets (covered in ch_9).
- CLRS Ch 21 — Disjoint-Set Data Structure (Union-Find): union by rank + path compression + Ackermann inverse analysis. Already exercised in ch_10 §10.12 (Kruskal's MST) but the set-ADT framing belongs in ch_12.
- Production references for ch_12: `std::set` / `std::map` (RB), `std::unordered_set` / `std::unordered_map` (open-addressing hash), `std::multiset` / `std::multimap` (RB with duplicates), `std::bitset` (fixed-size), `boost::dynamic_bitset` (runtime-size), `absl::flat_hash_set` / Swiss Tables, Bloom filter (probabilistic), Cuckoo hashing.

---

## Structural gaps

Same three structural gaps as ch_7 / ch_9 / ch_10 / ch_11:

### S1 — No opening chapter-map `ideabox` — ADD

ch_12 has a one-paragraph thematic ideabox (line 11) but no structured chapter-map block.

**Required:** opening `ideabox` titled "Chapter map":

1. **Where this sits in CS 300** — ch_12 is the **ADT-meta chapter**: it's not an algorithm or data structure unto itself, it's the survey of "given the Set abstract data type, here are the impls we already have in cs-300, how to pick between them, and where the corner cases live." Builds on ch_5 (hash tables) / ch_9 (red-black trees) / ch_11 (B-trees) — three different ways to implement a set, each with different time/space/ordering tradeoffs.
2. **What you add to your toolkit** —
   - The Set ADT itself (`contains` / `insert` / `erase` + the structural ops `union` / `intersection` / `difference` / `subset`).
   - The **impl decision matrix**: which Set implementation to pick given (a) ordered vs unordered iteration; (b) point-query vs range-query workload; (c) static vs dynamic; (d) memory budget; (e) duplicate-key allowance.
   - **Multiset** — duplicates allowed; same impl machinery with `≤` instead of `<` in comparisons.
   - **Bitset / characteristic vector** — when the key universe is small + dense, direct-access array form (one bit per possible key).
   - **Disjoint-set union (Union-Find)** — the set partition impl that powers Kruskal's MST in ch_10; the partition-of-disjoint-sets is itself a set-of-sets ADT.
   - **Bloom filter** — probabilistic set membership; one-sided error (false positives, no false negatives).
3. **Looking ahead / forward refs** — past the cs-300 boundary toward set theory proper (powerset, partial orders, lattices); production directions (concurrent sets, RCU, lock-free hash sets).

### S2 — No 7-item mastery checklist — ADD

**Required:** 7-item mastery checklist:

1. Pick the right Set impl at first sight: ordered iteration (RB), unordered O(1) lookup (hash), small-universe (bitset), append-only-with-membership-queries (Bloom filter), partition (Union-Find), static/sealed (perfect hash). Justify each in one sentence.
2. Implement set union / intersection / difference on (a) two `std::set`s (sorted-merge, O(|A|+|B|)) vs (b) two `std::unordered_set`s (probe one against the other, O(|A|·|B|·hash) worst case but typically O(|A|+|B|) expected). Explain the algorithmic difference.
3. State the multiset distinction (duplicates allowed) + identify which set ops change behavior: union (sum-multiplicities or max-multiplicities — both valid; pick one and stick), intersection (min-multiplicities), difference (max-of-zero-or-difference).
4. Implement a **bitset** as `std::vector<uint64_t>` + bit-twiddling indexing; argue why it's O(1) point-query / O(n/64) iteration / O(n) space (where n is universe size).
5. State the **Disjoint-Set Union** invariants + sketch the path-compression + union-by-rank optimization + state the inverse-Ackermann amortized bound (O(α(n)) per op).
6. State the **Bloom filter** false-positive-rate formula (≈ (1 − e^(-kn/m))^k for k hash functions, n elements, m bits) + identify the use cases (network filters, cache pre-checks, DB existence-tests).
7. Identify which `std::` containers are sets vs maps vs multisets and the underlying data structure of each (RB / hash / etc.). Distinguish "associative" (ordered) from "unordered associative" in the C++ STL nomenclature.

### S3 — Closing `ideabox` exists, needs reframing — UPDATE

The line-296 closing `ideabox` exists. **Required:** rewrite to enumerate the chapter's content (Set ADT + ops + multiset + bitset + DSU + Bloom) per the ch_10 / ch_11 unification convention + add forward-refs (concurrent sets / lock-free hash / lattice theory beyond cs-300).

### S4 — Zero TikZ + only one examplebox — ADD several diagrams + traces

**Required:** at least 3 TikZ diagrams + 2-3 exampleboxes:

1. **Venn diagram** for set operations (§12.2) — three labeled circles with shaded intersections + difference + symmetric difference. Visual baseline for the prose.
2. **Bitset** representation (§12.3 or NEW §12.4) — universe `{0..63}`, word-level bit layout, point-query as `(word >> bit) & 1`, set as `word |= (1 << bit)`.
3. **Disjoint-Set Union** representation (NEW §12.5) — parent-pointer forest, union-by-rank merging two trees, path-compression flattening.

`examplebox` traces:

- §12.2: union / intersection / difference of two small sets `{1,3,5,7}` and `{3,4,5,6}` worked through both impls (sorted-merge on `std::set` + hash-probe on `std::unordered_set`). Show the time-cost difference.
- §12.4 (NEW): bitset operations on a 64-bit word — set bit 5, query bit 5, count bits (popcount).
- §12.5 (NEW): DSU operations on 8 elements — sequence of `union` / `find` calls showing path compression in action.

---

## Per-section gap verdicts

### §12.1 (Set ADT) — ADD (small)

**Current:** Per inventory, three-op core (`add`/`remove`/`contains`) + keys-vs-elements + subset.

**Additions:**
- **Forward-refs to existing impls in cs-300**: ch_5 (hash table impl with O(1) expected ops), ch_9 (RB tree impl with O(log n) ordered ops), ch_11 (B-tree impl for shallow-and-wide / disk-friendly), ch_6 (BST as the unbalanced baseline). Currently these are table-cell labels only; promote to a `notebox` with explicit forward-refs.
- **Set ADT vs Sequence ADT contrast** (per OCW r01): Set is the "contains-key" interface; Sequence is the "get-by-index" interface. cs-300's ch_1–ch_4 covered Sequence; this chapter is the Set counterpart. Useful framing.

**Recommendation: ADD** ~25 lines (forward-refs notebox + Set-vs-Sequence framing).

### §12.2 (Set Operations) — ADD (substantial)

**Current:** Per inventory, union/intersection/difference via STL `<algorithm>` on sorted ranges + hand-rolled `std::unordered_set` loops + "iterate smaller set" optimization + filter/map.

**Additions:**
- **Algorithmic difference between impls**: sorted-merge (linear in |A|+|B|) vs hash-probe (linear in |A|·hash-cost). Worth a `defnbox` formalising.
- **Symmetric difference** (XOR of sets) — currently absent per inventory. Common operation; STL has it (`std::set_symmetric_difference`).
- **Subset testing** — per inventory it's mentioned but probably brief. Algorithm: probe every element of A against B; O(|A| · contains-cost-on-B). Worth an explicit subsection.
- **Power set** — set of all subsets. 2^n cardinality. C++ enumeration via `for (uint64_t mask = 0; mask < (1ULL << n); ++mask)`. Brief.
- The Venn TikZ diagram + the union/intersection/difference examplebox.

**Recommendation: ADD** ~70 lines (algorithmic-difference defnbox + symmetric difference + subset + power set + TikZ + examplebox).

### §12.3 (Static vs Dynamic) — UPDATE / minor

**Current:** Per inventory, four-bullet immutability rationale (thread safety / optimization / sharing / hashability) + C++ static-set idioms (const-wrap, `constexpr std::array`, gperf placeholder) + cross-language survey.

**Additions:**
- **Perfect hashing** — gperf placeholder per inventory; promote to a real subsection with the FKS (Fredman-Komlós-Szemerédi) two-level hash construction (CLRS §11.5). Static set with O(1) worst-case lookup. Cite gperf as the production tool.
- **Sealed / frozen sets** in modern languages: Python's `frozenset`, Rust's `BTreeSet` with no mutation methods, Java's `Set.of(...)`. Brief notebox.

**Recommendation: ADD** ~30 lines (perfect-hashing subsection + sealed-set notebox).

### NEW §12.4 — Multiset (duplicates allowed) — ADD

**Current:** Per inventory, `std::multiset` named in two tables but no dedicated section. Real gap.

**Recommendation: ADD a new §12.4 "Multiset"** with:

- `defnbox` distinguishing Set (no duplicates) from Multiset (duplicates allowed).
- **STL multiset / multimap walkthrough** — `std::multiset<K>` is RB-backed, ordered, allows duplicates. Three operation differences from `std::set`:
  - `count(k)` returns 0 or more (vs 0 or 1 in set).
  - `erase(k)` removes ALL occurrences (vs 0 or 1).
  - `equal_range(k)` returns the [begin, end) range for all occurrences.
- **Multiset operations**: union (sum-multiplicities convention; the alternative max-multiplicities is also defensible — pick one and document), intersection (min-multiplicities), difference (max-of-0-or-difference). Brief tabular contrasting set ops vs multiset ops.
- **Implementation note**: heaps from ch_7 already work directly on multiset semantics (use `≤` instead of `<` per ch_7's gap analysis Set/Multiset note). Cross-link.

**Estimated add:** ~50 lines.

### NEW §12.5 — Bitset / characteristic vector — ADD

**Current:** Bitset only in notes.tex per inventory; not in lectures.tex.

**Recommendation: ADD a new §12.5 "Bitset"** with:

- `defnbox`: bitset = direct-access array indexed by key, one bit per possible key. O(1) point-query, O(n) iteration, O(n) space where n = universe size.
- **Use case**: when key universe is small and dense (e.g., "set of ASCII characters" = 128 bits, "set of vertex IDs in a graph with |V|=1000" = 1000 bits = 125 bytes).
- **Implementation**: `std::bitset<N>` for compile-time-fixed N; `std::vector<uint64_t>` for runtime-sized; `boost::dynamic_bitset` as the production-grade runtime-sized version.
- **Set operations on bitsets**: union = `|=`, intersection = `&=`, difference = `& ~`, symmetric difference = `^=`. **All O(n/word_size)** — extremely fast in practice.
- The bitset TikZ diagram + an `examplebox` showing word-level bit-twiddling.
- **Forward-direction notebox**: roaring bitmaps (compressed bitset for sparse universes; used in PostgreSQL, Druid, Lucene).

**Estimated add:** ~60 lines.

### NEW §12.6 — Disjoint-Set Union (Union-Find) — ADD

**Current:** Already covered in ch_10 §10.12 (Kruskal's MST) per ch_10 inventory. But the ADT-framing belongs in ch_12, not ch_10's MST section.

**Recommendation: ADD a new §12.6 "Disjoint-Set Union"** with:

- `defnbox`: partition of N elements into K disjoint sets. Operations: `make-set(x)`, `find(x)` (returns representative of x's set), `union(x, y)` (merges x's set with y's set).
- **Use case**: connectivity tracking, Kruskal's MST (already in ch_10 — cross-link), Tarjan's offline SCC, online dynamic graph connectivity.
- **Implementation**: parent-pointer forest. Two optimizations:
  - **Union by rank** (or by size): always attach the shorter tree to the taller. Keeps depth ≤ log n.
  - **Path compression**: during `find(x)`, point every node on the path directly to the root. Flattens the tree.
- **Amortized analysis**: with both optimizations, O(α(n)) per operation, where α is the inverse Ackermann function. α(n) ≤ 4 for any n ≤ 2^65536. Effectively constant. Cite CLRS Ch 21 + Tarjan's original 1975 paper.
- The DSU TikZ diagram + an `examplebox` showing 8-element sequence with path compression.
- **Cross-link to ch_10 §10.12** — the Kruskal's-MST application is already there; this section is the ADT framing.

**Estimated add:** ~70 lines.

### NEW §12.7 — Bloom filter — ADD

**Current:** Bloom filter in notes.tex per inventory; not in lectures.tex.

**Recommendation: ADD a new §12.7 "Bloom filter"** with:

- `defnbox`: probabilistic Set with one-sided error. `contains(x)` returns `false` (definitely not in set) or `maybe true` (in set OR false positive). Never false negative.
- **Construction**: m-bit array + k independent hash functions. `insert(x)`: set bits at positions `h_1(x), ..., h_k(x)`. `contains(x)`: check all k positions are set; if any is 0, x is definitely not in set.
- **False-positive rate**: `(1 − e^(-kn/m))^k` for n elements. Optimal k ≈ (m/n) ln 2.
- **Use cases**:
  - Network packet filtering (Squid web cache, CDN edge filtering).
  - Database existence pre-check (avoid disk read if Bloom says "definitely not").
  - LSM-tree compaction (RocksDB / LevelDB use Bloom per SST file).
  - DNS resolver negative cache.
- **Variants**: counting Bloom filter (supports delete), cuckoo filter (better false-positive rate at same space).
- **Implementation**: brief C++ snippet using `std::vector<uint64_t>` + a couple of hash functions.

**Estimated add:** ~50 lines.

### NEW §12.8 — Production references + further reading — ADD

Same role as ch_9 §9.10 / ch_11 §11.7:

- `std::set` / `std::map` → red-black (cross-link ch_9).
- `std::unordered_set` / `std::unordered_map` → open-addressing hash (cross-link ch_5).
- `std::multiset` / `std::multimap` → red-black with duplicates.
- `std::bitset` (fixed) / `boost::dynamic_bitset` (runtime).
- `absl::flat_hash_set` / Google Swiss Tables — modern open-addressing hash with SIMD probe.
- `phmap::flat_hash_set` (parallel-hashmap) — concurrent hash-set.
- Roaring bitmaps — compressed bitset.
- CLRS Ch 11 (hash) + Ch 12 (BST) + Ch 21 (DSU).
- "Bloom filters: A survey" (Broder + Mitzenmacher 2004).

~25 lines.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3) | Rewrite §12.3 closing ideabox + sub-content enumeration | ~10 |
| Throughout (S4) | 3 TikZ diagrams + 3 examplebox traces | ~110 |
| §12.1 | Forward-refs notebox + Set vs Sequence framing | ~25 |
| §12.2 | Algorithmic-difference defnbox + symdiff + subset + power set | ~70 |
| §12.3 | Perfect-hashing subsection + sealed-set notebox | ~30 |
| NEW §12.4 | Multiset full section | ~50 |
| NEW §12.5 | Bitset / characteristic vector | ~60 |
| NEW §12.6 | Disjoint-Set Union (Union-Find) | ~70 |
| NEW §12.7 | Bloom filter | ~50 |
| NEW §12.8 | Production references + further reading | ~25 |
| **Total** | | **~540** |

ch_12 grows from 300 → ~840 lines, 6 → ~18-20 pages. Triples the chapter — biggest absolute % growth alongside ch_11. Brings ch_12 in line with ch_10's pre-augmentation depth (which was 18 pp). Consistent with "deep coverage" framing.

## Open decisions for the user

1. **DSU section depth (§12.6)** — full section with TikZ + examplebox (default) vs notebox-only with cross-link to ch_10. ch_10 already has the Kruskal-application impl; the question is whether to repeat the ADT framing here. Default: full section here (the ADT-framing angle is what ch_12 is about, and ch_10's coverage is application-flavored not ADT-flavored).
2. **Bloom filter depth (§12.7)** — full section with rate formula + use cases (default) vs notebox-only forward-direction. Default: full section. Bloom filter is a real production set variant that earns its keep.
3. **Multiset operations convention** — "sum multiplicities" or "max multiplicities" for union? Both are valid; CLRS doesn't legislate. Default: **document both, recommend "sum"** (matches `std::multiset::merge` and is more common in production).

Defaults apply per `feedback_chapter_review_autonomy.md`.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_12/lectures.tex`) lands in this order:

1. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
2. Add §12.1 forward-refs notebox + Set-vs-Sequence framing.
3. Add §12.2 algorithmic-difference defnbox + symmetric difference + subset + power set + Venn TikZ + examplebox.
4. Add §12.3 perfect-hashing subsection + sealed-set notebox.
5. Add NEW §12.4 (multiset).
6. Add NEW §12.5 (bitset + TikZ + examplebox).
7. Add NEW §12.6 (DSU + TikZ + examplebox + cross-link to ch_10 §10.12).
8. Add NEW §12.7 (Bloom filter).
9. Add NEW §12.8 (production references).
10. Rewrite §12.3 closing ideabox per S3.
11. `pdflatex -halt-on-error chapters/ch_12/lectures.tex` two passes — both must exit 0.
12. CHANGELOG entry.

Step 3 happens via builder subagent.
