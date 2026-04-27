# Chapter 13 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_13/lectures.tex` (377 lines, 9 pp; inventoried in `ch_13.md`) **against** OCW 6.006 Spring 2020 lec3 (Sorting: insertion / selection / merge) + r03 + lec4/r04 (radix glance) and CLRS 3rd-ed Ch 7 (Quicksort) + Ch 8 (Sorting in Linear Time: counting / radix / bucket) + Ch 9 (Medians and Order Statistics) + Ch 8.1 (lower bound for comparison sorts).

**Locked framing (optional-chapter arc, 2026-04-25):** ch_13 is a **post-SNHU optional chapter**, page cap + 3-5 bounded-additions waived.

**Crucial baseline note:** ch_13's title is "extra sorts and list idioms." The chapter is positioned as the **comparative-sorts encyclopedia** for cs-300, but currently covers only 3 sorts (bubble, quickselect, bucket) plus 2 list variants. **Many sorts name-dropped but not implemented**: quicksort, mergesort, insertion sort, introsort, Timsort, dpqsort, counting sort, radix sort, pigeonhole sort, shell sort. Plus the chapter is **the most isolated** of all optional chapters — zero numbered cross-chapter refs, despite heap sort living in ch_7 (perfect cross-link target). This is the biggest augmentation surface alongside ch_10.

**Reference material:**
- OCW lec3.pdf — Sorting: insertion sort + selection sort + merge sort (covered in cs-300 ch_3 likely; ch_13 should reference but not duplicate).
- OCW r03.pdf — sorting recitation.
- OCW lec4.pdf — radix-sort glance + counting-sort-as-stable-sort framing.
- CLRS Ch 7 (Quicksort) — Hoare vs Lomuto partition, randomized analysis, average O(n log n) / worst O(n²), tail-call elimination, stack-depth bound.
- CLRS Ch 8 (Linear-Time Sorts):
  - §8.1 Lower bound: Ω(n log n) for any comparison-based sort, by decision-tree argument.
  - §8.2 Counting sort: O(n + k) for keys in [0, k); stable; not in-place.
  - §8.3 Radix sort: LSD-first via stable counting sort per digit; O(d(n + b)) for d digits, base b.
  - §8.4 Bucket sort: O(n) expected for uniform input.
- CLRS Ch 9 (Medians + Order Statistics): randomized quickselect (covered in ch_13 §13.2 already) + median-of-medians worst-case O(n) selection.
- Production sorts: introsort (`std::sort` — quicksort + heapsort fallback + insertion sort for small ranges), Timsort (Python + Java since 7 — hybrid merge + insertion exploiting natural runs), dual-pivot quicksort (Java 7+ default for primitives — Yaroslavskiy 2009), pdqsort (pattern-defeating quicksort, Rust standard, BlockQuicksort variant), spreadsort, ips4o (in-place super-scalar samplesort).

---

## Structural gaps

Same three structural gaps as ch_7 / ch_9 / ch_10 / ch_11 / ch_12:

### S1 — No opening chapter-map `ideabox` — ADD

ch_13 has a thematic opening ideabox (per inventory) but no structured chapter-map.

**Required:** opening `ideabox` titled "Chapter map":

1. **Where this sits in CS 300** — ch_13 is the **comparative-sorts encyclopedia + list-idioms chapter**. Builds on ch_3 (foundational sorts: insertion / selection / merge — already covered) and ch_7 (heapsort). Closes the loop by enumerating EVERY sort the reader is likely to encounter in production code (introsort = `std::sort`, Timsort = Python/Java, pdqsort = Rust, dpqsort = Java primitives, radix sort everywhere in databases + GPU, counting sort in cache-locality optimizations).
2. **What you add to your toolkit** —
   - **Decision-tree lower bound** Ω(n log n) for comparison sorts.
   - **Linear-time non-comparison sorts** (counting / radix / bucket) and when their assumptions hold.
   - **Hybrid sorts** (introsort / Timsort) and why they beat any single algorithm in practice.
   - **List-specific idioms** (cycle detection, reversal, sorted-merge, list-as-stack, list-as-queue).
   - **Sort-algorithm decision table** for picking the right sort given (a) size, (b) data distribution, (c) stability requirement, (d) memory budget, (e) parallelism.
3. **Looking ahead / forward refs** — past cs-300: external sorting (when data doesn't fit in RAM); GPU sorts (radix on GPU is the standard); approximate sorts (Spreadsort variants); concurrent sorts.

### S2 — No 7-item mastery checklist — ADD

**Required:** 7-item mastery checklist:

1. State the **decision-tree lower bound** Ω(n log n) for any comparison-based sort + sketch the argument.
2. Implement quicksort with both **Lomuto** and **Hoare** partition. Identify which is `std::sort`'s default and why.
3. State counting sort + argue why it's O(n + k) and stable. Identify when counting sort outperforms quicksort (answer: when k = O(n)).
4. State radix sort (LSD form) + argue why it's O(d(n + b)) for d-digit keys in base b. Identify the base-vs-passes tradeoff (more bits per pass = fewer passes but bigger counting-sort buckets).
5. Pick the right sort at first sight: tiny array (insertion), in-place fast (introsort = `std::sort`), stable (Timsort or merge), bounded integer keys (counting / radix), nearly-sorted input (Timsort or insertion). Justify each.
6. Implement Floyd's tortoise-and-hare cycle detection on a singly-linked list + state the cycle-length and start-of-cycle algorithms.
7. State the introsort algorithm (quicksort + heapsort fallback + insertion sort for small ranges) + identify the recursion-depth threshold (typically 2 log₂ n) and small-array threshold (typically 16-32 elements in production C++ STL).

### S3 — Closing `ideabox` reframe — UPDATE

The §13.5 closing ideabox at line 373 exists. **Required:** rewrite to enumerate the chapter's sub-content (every sort + every list idiom covered) per ch_10/ch_11/ch_12 unification convention + add forward-refs (external sorting, GPU sorts, concurrent sorts beyond cs-300).

### S4 — Zero TikZ, zero examplebox — ADD several

**Required:** at least 4 TikZ diagrams + 4 exampleboxes:

1. §13.1 (or NEW §13.0): **comparison-sort decision tree** — a small 3-element decision tree showing the n! leaves for n=3 inputs. Visualizes the Ω(n log n) lower bound.
2. NEW §13.6 (counting sort): **counting array → output construction** diagram showing the prefix-sum + back-fill phases.
3. NEW §13.7 (radix sort): **LSD radix passes** — array states after each digit pass on `[170, 45, 75, 90, 802, 24, 2, 66]` (the canonical CLRS example).
4. §13.4 / §13.5 (lists): **circular DLL with sentinel** structure — the trick that simplifies edge cases.

`examplebox` traces:

- §13.2 (quickselect): worked trace finding median of `[3, 1, 4, 1, 5, 9, 2, 6]` showing partition steps.
- NEW §13.6 (counting sort): full sort of `[2, 5, 3, 0, 2, 3, 0, 3]` showing all phases.
- NEW §13.7 (radix sort): full sort of `[170, 45, 75, 90, 802, 24, 2, 66]` showing all 3 LSD passes.
- NEW §13.10 (Floyd's tortoise-and-hare): trace of cycle detection on a 7-node linked list with cycle starting at node 4.

---

## Per-section gap verdicts

### §13.1 (Bubble sort) — UPDATE / minor

**Current:** Per inventory, bubble sort with short-circuit optimization.

**Additions:**
- **Lower-bound framing** — bubble sort hits the Ω(n²) sort floor among naive comparison sorts. Worth a `notebox` connecting bubble's O(n²) average + worst case to the decision-tree lower bound (which is Ω(n log n) — bubble is suboptimal).
- **Why bubble sort is taught despite being bad** — pedagogically clean (everyone can derive it) + the short-circuit optimization is a nice example of "early-exit when problem state allows."
- Cross-link forward to insertion / selection (in ch_3) and to heap sort (in ch_7) as the better O(n log n) options.

**Recommendation: ADD** ~20 lines (lower-bound framing + cross-links).

### §13.2 (Quickselect) — UPDATE / minor

**Current:** Per inventory, Hoare-partition quickselect + median-of-medians aside + `std::nth_element`.

**Additions:**
- **Median-of-medians depth** — currently aside-only per inventory. Worth promoting to a brief subsection with the algorithm (CLRS §9.3): pick groups of 5, find median of each, recursively find median-of-medians as pivot. O(n) worst-case selection; not just expected.
- **`std::nth_element` cross-link** — cs-300's std-library tour; brief notebox.
- Worked examplebox trace.

**Recommendation: ADD** ~30 lines.

### §13.3 (Bucket sort) — UPDATE / minor

**Current:** Per inventory, bucket sort with non-comparison-sort framing + counting/radix/pigeonhole as related family.

**Additions:**
- **Counting sort family deserves its own NEW section** — currently only mentioned in ch_13 §13.3 as a passing reference. Promote to a NEW §13.6.
- **Radix sort family deserves its own NEW section** — currently only mentioned in ch_13 §13.3. Promote to a NEW §13.7.
- §13.3 itself stays as bucket-sort only with the family-tree framing intact.

**Recommendation: keep §13.3 mostly as-is**, ~10 line update to clarify scope (just bucket sort here; counting in §13.6, radix in §13.7).

### §13.4 (List-container wrapper idiom) — UPDATE / minor

**Current:** Per inventory, head-only vs wrapped list container.

**Additions:**
- **Cross-link to ch_4** (linked lists). Currently inventory says ch_13 has zero cross-chapter refs.
- Brief mention of `std::list` (doubly-linked) and `std::forward_list` (singly-linked) as the STL representatives. ~10 lines.

### §13.5 (Circular linked lists) — UPDATE / minor

**Current:** Per inventory, circular DLL with sentinel-DLL trick.

**Additions:**
- TikZ diagram of the sentinel-DLL structure (S4 item 4).
- Cross-link to ch_4.

**Recommendation: ADD** ~20 lines + the TikZ.

### NEW §13.0 — Comparison-sort lower bound — ADD

**Topic ch_13 doesn't currently cover.** Frames the entire chapter.

**Recommendation: ADD a new opening §13.0 "Comparison-sort lower bound"** with:
- `defnbox` for the decision-tree model.
- The Ω(n log n) proof sketch: any decision tree must have at least n! leaves; height ≥ ⌈log₂(n!)⌉ = Ω(n log n).
- 3-element decision-tree TikZ (S4 item 1).
- A `notebox` distinguishing comparison sorts (Ω(n log n) bound applies) from non-comparison sorts (counting / radix / bucket — which beat the bound by exploiting key structure).

**Estimated add:** ~60 lines.

### NEW §13.6 — Counting sort — ADD

**Recommendation: ADD a new §13.6 "Counting sort"** with:
- `defnbox`: linear-time stable sort for keys in [0, k).
- Algorithm: count occurrences, prefix-sum, place in output array right-to-left (for stability).
- C++ implementation (~20 lines).
- Cost analysis: O(n + k) time, O(n + k) space. When k = O(n), beats comparison sort.
- **Stability proof** — counting sort is stable by construction (right-to-left placement).
- TikZ diagram of the counting-array → output construction (S4 item 2).
- `examplebox` worked trace on `[2, 5, 3, 0, 2, 3, 0, 3]`.
- Use cases: pre-pass for radix sort; integer histograms in image processing; database aggregations.

**Estimated add:** ~80 lines.

### NEW §13.7 — Radix sort — ADD

**Recommendation: ADD a new §13.7 "Radix sort"** with:
- `defnbox`: O(d(n + b)) for d-digit keys in base b. LSD-first preferred for stable behavior.
- LSD radix sort algorithm: stable counting sort on each digit from least to most significant.
- C++ implementation (~25 lines).
- **Base-vs-passes tradeoff** — bigger b ⇒ fewer passes but bigger counting buckets. Production radix sorts often use b = 256 (1 byte per pass).
- TikZ diagram of LSD radix passes on `[170, 45, 75, 90, 802, 24, 2, 66]` (S4 item 3).
- `examplebox` worked trace.
- **MSD radix sort** — alternative for variable-length keys (strings); recursive form. Brief subsection.
- Use cases: GPU sorts (radix is the standard parallel sort), database engine sort (PostgreSQL, BigQuery), Spotify's recommendation pipeline, network packet sorting.

**Estimated add:** ~100 lines.

### NEW §13.8 — Production hybrid sorts (introsort / Timsort / pdqsort / dpqsort) — ADD

**Topic ch_13 name-drops but doesn't cover.** This is the "what `std::sort` actually does" section.

**Recommendation: ADD a new §13.8 "Production hybrid sorts"** with:

- **Introsort** (`std::sort`): quicksort + recursion-depth fallback to heapsort + insertion sort for small ranges. Recursion-depth threshold ≈ 2 log₂ n; small-array threshold typically 16-32. Cite Musser 1997. ~25 lines.
- **Timsort** (Python `list.sort` since 2002, Java `Arrays.sort` for objects since Java 7): hybrid of merge sort + insertion sort that exploits **natural runs** (already-sorted subsequences) in real data. O(n) on already-sorted input; O(n log n) general. Cite Tim Peters' original write-up. ~30 lines.
- **Dual-pivot quicksort (dpqsort)** (Java `Arrays.sort` for primitives since Java 7): two pivots partition into three regions. ~5% faster than single-pivot quicksort empirically. Cite Yaroslavskiy 2009. ~15 lines.
- **Pattern-defeating quicksort (pdqsort)** (Rust `sort_unstable`, modern C++ libs): block-based partition + introsort fallback + smart pivot selection. ~10 lines.
- **Decision tabular**: which language uses which sort by default for which type. Java: dpqsort (primitives) / Timsort (objects); Python: Timsort; Rust: pdqsort (`sort_unstable`) / Timsort (`sort`); C++: introsort (`std::sort`).

**Estimated add:** ~120 lines.

### NEW §13.9 — Sort algorithm decision table — ADD

**Same role as ch_10 §10.15.** Master table picking the right sort given problem characteristics.

**Recommendation: ADD a tabular** with rows = problem-properties (tiny array / nearly-sorted / random / bounded integer keys / strings / massive-doesnt-fit-RAM / requires stability / requires in-place / parallel-friendly) and columns = recommended sort (insertion / Timsort / introsort / counting / radix / external-sort / merge / heapsort / radix-on-GPU). Cells = algorithm + complexity + cs-300 reference. ~40 lines.

### NEW §13.10 — List idioms (cycle detection + reversal + sorted merge + nth-from-end) — ADD

**Current ch_13 has §13.4 + §13.5 covering list-container wrapper + circular DLL** but doesn't cover the **algorithmic list idioms** that interview/textbook prep emphasizes.

**Recommendation: ADD a new §13.10 "Algorithmic list idioms"** with:

- **Floyd's tortoise-and-hare cycle detection** — O(1) space, O(n) time. Subsequent algorithms: cycle-length finding, cycle-start finding (the elegant "reset one pointer" trick). ~35 lines including TikZ-free worked trace + `examplebox` (S4 item 4).
- **In-place reversal** — iterative + recursive forms. ~20 lines.
- **Sorted-merge of two sorted lists** — the merge-sort merge but on linked-list form. ~20 lines.
- **Nth-from-end** — two-pointer trick (advance fast pointer N steps, then advance both until fast hits end). ~15 lines.
- **Detect intersection of two lists** — length-difference + simultaneous-advance trick. ~15 lines.

**Estimated add:** ~110 lines.

### NEW §13.11 — Production references + further reading — ADD

Same role as ch_9 / ch_11 / ch_12 closers:

- `std::sort` → introsort.
- `std::stable_sort` → merge sort (or Timsort variant).
- `std::list::sort` → bottom-up merge sort.
- Python `list.sort` / `sorted` → Timsort.
- Java `Arrays.sort(int[])` → dual-pivot quicksort (Yaroslavskiy).
- Java `Arrays.sort(Object[])` / `Collections.sort` → Timsort.
- Rust `sort_unstable` → pdqsort. Rust `sort` → Timsort variant.
- Boost `boost::sort` → spreadsort (radix-based) + flat_stable_sort.
- ips4o (in-place super-scalar samplesort) — research-grade fast parallel sort.
- CLRS Ch 7 / Ch 8 / Ch 9; Knuth TAOCP Vol 3; Sedgewick "Algorithms" Ch 2.

~25 lines.

---

## Summary table — ADDs by estimated TeX volume

| Section | Add type | Est. lines |
| --- | --- | --- |
| Header (S1) | Opening `ideabox` chapter map | ~25 |
| Header (S2) | 7-item mastery checklist (in S1) | ~15 |
| Closing (S3) | Rewrite §13.5 closing ideabox | ~10 |
| Throughout (S4) | 4 TikZ diagrams + 4 exampleboxes | ~140 |
| §13.1 | Lower-bound framing notebox + cross-links | ~20 |
| §13.2 | Median-of-medians depth + `std::nth_element` notebox | ~30 |
| §13.3 | Scope clarification (~10 lines) | ~10 |
| §13.4 | ch_4 cross-link + STL list-vs-forward_list note | ~10 |
| §13.5 | TikZ + ch_4 cross-link | ~20 |
| NEW §13.0 | Comparison-sort lower bound (Ω(n log n)) | ~60 |
| NEW §13.6 | Counting sort | ~80 |
| NEW §13.7 | Radix sort (LSD + MSD) | ~100 |
| NEW §13.8 | Production hybrid sorts (introsort / Timsort / pdqsort / dpqsort) | ~120 |
| NEW §13.9 | Sort algorithm decision table | ~40 |
| NEW §13.10 | Algorithmic list idioms (Floyd's + reverse + merge + Nth-from-end + intersection) | ~110 |
| NEW §13.11 | Production references | ~25 |
| **Total** | | **~815** |

ch_13 grows from 377 → ~1192 lines, 9 → ~26-30 pages. Triples the chapter; pulls ch_13 from "thinly-named-dropped" to comparable-depth-to-ch_10 territory. Largest absolute add of any optional chapter alongside ch_10's +1206.

## Open decisions for the user

1. **§13.0 placement** — open the chapter with the lower-bound section (default; frames everything that follows), or fold the lower bound into the existing §13.1 bubble sort section as a notebox? Default: NEW §13.0 opener.
2. **§13.10 list idioms depth** — full section with all 5 idioms (default ~110 lines) or notebox-only with one canonical example (Floyd's)? Default: full section. List-algorithm idioms are interview-prep canonical and earn their keep.
3. **§13.8 hybrid-sorts depth** — implement Timsort/introsort/pdqsort/dpqsort full algorithms, or keep them at "explanation + production-citation" depth? Default: explanation depth (no full impls; the production citations are what readers hit in real code). Implementing Timsort fully is its own week of work.

Defaults apply per `feedback_chapter_review_autonomy.md`.

## Step 3 plan

Step 3 (augmentation pass on `chapters/ch_13/lectures.tex`) lands in this order:

1. Insert opening chapter-map `ideabox` + mastery checklist (S1 + S2).
2. Add NEW §13.0 (comparison-sort lower bound + decision-tree TikZ).
3. Update §13.1 (lower-bound framing + cross-links to ch_3 / ch_7).
4. Update §13.2 (median-of-medians subsection + `std::nth_element` notebox + quickselect examplebox).
5. Update §13.3 (scope clarification — bucket only, counting in §13.6, radix in §13.7).
6. Update §13.4 (ch_4 cross-link + STL list-vs-forward_list notebox).
7. Update §13.5 (sentinel-DLL TikZ + ch_4 cross-link).
8. Add NEW §13.6 (counting sort + TikZ + examplebox).
9. Add NEW §13.7 (radix sort LSD + MSD + TikZ + examplebox).
10. Add NEW §13.8 (introsort + Timsort + pdqsort + dpqsort + decision tabular).
11. Add NEW §13.9 (master decision table).
12. Add NEW §13.10 (list idioms — Floyd's + reverse + merge + Nth + intersection + examplebox).
13. Add NEW §13.11 (production references).
14. Rewrite §13.5 closing ideabox per S3 (now becomes a chapter-level closer covering all of §13.0–§13.11).
15. `pdflatex -halt-on-error chapters/ch_13/lectures.tex` two passes — both must exit 0.
16. CHANGELOG entry.

Step 3 happens via builder subagent.
