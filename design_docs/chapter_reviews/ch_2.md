# Chapter 2 — As-Is Review

**Scope:** `chapters/ch_2/lectures.tex` (2045 lines, but **§2.11 is a stub** — see Issues) + `chapters/ch_2/notes.tex` (152 lines, formerly `cheat.tex`). `practice.md` excluded per Phase-4 deferral.

**Purpose:** Step 1 of the per-chapter loop. Inventory of what's currently in ch_2 — topics, depth, callouts, mastery checklist, cross-references — so Step 2 (CLRS + OCW gap analysis) has a baseline. **No augmentation suggestions in this doc.**

**Subtitle (from `\title`):** *Introduction to Algorithms*

**Source coupling:** SNHU course-derived (zyBook-style structure). §2.6 (Data Privacy) and §2.7 (Ethical Guidelines) are SNHU-specific professional-ethics content not present in CLRS or OCW 6.006 — they cover ~400 lines (~20% of chapter weight).

---

## Chapter map (verbatim from opening `ideabox`)

**Where this sits.** "Chapter 1 taught you how to *type* a loop; chapter 2 teaches you how to *decide which loop to write* when you haven't been given one. This is the bridge between 'I can code' and 'I can solve a novel problem.' Every later chapter is a specific data structure; this chapter is the *meta-skill* of picking an algorithmic strategy in the first place."

**Toolkit additions promised:**
- Vocabulary: problems vs algorithms, what makes one "better" (correctness, speed, memory, simplicity).
- Recursive mindset: base case + smaller subproblem.
- Three named strategies: heuristic, greedy, dynamic programming.
- Ethics / data-privacy framework for data-driven design decisions.

**Mastery checklist (7 items, current bar):**
1. State the two ingredients every recursive function needs; show what goes wrong if either is missing.
2. Write `factorial(n)` and `binarySearch(v, t)` recursively *and* iteratively; argue when each form is appropriate.
3. Explain why naive recursive Fibonacci is exponential while iterative/memoized is linear — in terms of the recursion tree, not hand-waving.
4. Given a new problem, classify it as candidate for greedy, DP, or neither, and defend with a structural test (greedy-choice property, optimal substructure, overlapping subproblems).
5. Walk through the fractional-knapsack greedy proof and know why 0/1 isn't greedy-solvable.
6. Identify overlapping subproblems in an LCS-like problem; write the 2D recurrence before touching code.
7. Name at least one privacy or ethics consideration that could change a design decision.

**Looking-ahead (forward refs):** Ch3 = formal Big-O, sorting algorithms (insertion/selection are incremental; merge/quicksort are divide-and-conquer; radix is non-comparison heuristic). "Expect ch_3 to be easier if your ch_2 recursion intuitions are solid."

---

## Section-by-section inventory (`lectures.tex`)

Legend: `D`=`defnbox`, `I`=`ideabox`, `W`=`warnbox`, `E`=`examplebox`, `N`=`notebox`. Closing `[Big picture]` ideabox included in I-count.

### 2.1 Introduction to Algorithms — lines 67–222
- **Subsections:** Problems vs algorithms · Why this matters · What makes an algorithm "good" · NP-complete problems
- **Callouts:** D×3, I×3, W×0, E×2, N×1
- **Topics:** Problem (input + question + output spec, what not how) vs algorithm (finite, unambiguous steps, how) — defined as separate concepts; FindMax as worked example showing same problem, different algorithms; Real-world domain → common-algorithm table (DNA/LCS, search/binary, navigation/Dijkstra, scheduling/topo-sort, build/DFS, autocomplete/edit-distance); efficient = polynomial growth (informal); polynomial-vs-exponential intuition (2^40 minutes vs 2^60 years); NP-complete intuitive definition (no known poly algo, none proven impossible, all-or-nothing equivalence); P=NP as "most famous open problem"; clique problem example; what-to-do-when-NP-hard (approximation/heuristic/special-case).
- **Depth markers:** First mention of P=NP. Polynomial-as-cutoff justification. NP-complete framed as "skill of recognition saves you from hunting impossible algorithm."

### 2.2 Problem Solving — lines 224–363
- **Subsections:** Matching socks · Sorting name tags · 64-person greeting · A usable workflow
- **Callouts:** D×1, I×3, W×1, E×3, N×1
- **Topics:** Solution approach defined; matching-socks example (pigeonhole principle aside); name-tag sorting (presented as accidental radix sort — "almost every clever approach you invent is a known algorithm"); 64-person greeting: $\binom{64}{2}=2016$ pairs at 30s each = 16.8 hours, "every X with every other X" → O(n²) flag; **6-step workflow**: restate problem, solve tiny by hand, pseudocode/English approach, estimate cost, translate to C++, test on tiny example.
- **Depth markers:** Pigeonhole + combinatorial-trap callouts. "Code first, think later" anti-pattern warnbox. Cross-ref to ch_1 §1.12 debugging methodology (currently broken — see Issues).

### 2.3 Computational Problem Solving — lines 365–542
- **Subsections:** input>process>output model · Four habits of CT · is n prime? · sum 1 to 100 · The loop revisited
- **Callouts:** D×1, I×3, W×0, E×3, N×1
- **Topics:** I/P/O model as universal program shape; **four habits of computational thinking**: decomposition, pattern recognition, algorithms, abstraction (defined as interacting moves, not waterfall); is_prime walkthrough showing all 4 habits with √n optimization (with notebox proving why √n suffices); sum 1-to-100 closed form $n(n+1)/2$ as pattern-recognition payoff (O(1) vs O(n)); workflow ↔ CT-concept mapping table.
- **Depth markers:** Pattern recognition framed as "the most valuable habit." √n primality proof. Closed-form sum framed as algebra-from-pattern-recognition.

### 2.4 Recursive Definitions — lines 544–741
- **Subsections:** Anatomy of every recursive function · factorial · cumulative sum · reverse vector recursive · what can go wrong · when to reach for recursion · recursion and induction
- **Callouts:** D×3, I×3, W×3, E×4, N×0
- **Topics:** Recursive algorithm / base case / recursive case formal definitions; **3-part template** (base / reduce / combine); factorial example (with `long long` overflow warnbox at 21!); cumulative_sum example (notes that closed form $n(n+1)/2$ is better — recursion here is pedagogy); recursive `reverse_list(v, lo, hi)` (cross-ref to ch_1 reverse-vector — currently broken ref to old §1.11); 3 failure modes (missing base, recursing on same/larger input, stack overflow); recursive-data-shines ideabox (trees/lists/grids/graphs); recursion-induction equivalence with factorial inductive proof.
- **Depth markers:** Stack-overflow practical depth ("tens of thousands to millions of frames"); explicit recursion ↔ induction proof structure.

### 2.5 Recursive Algorithms — lines 743–940
- **Subsections:** Fibonacci cautionary tale · Binary search · Tracing binary search · Preconditions and edge cases · Side-by-side comparison
- **Callouts:** D×2, I×3, W×3, E×3, N×3
- **Topics:** Fibonacci sequence definition; naive recursive `fib` with explicit recursion-tree showing duplicate work, $O(\phi^n)\approx 1.618^n$; **`fib(50)` takes minutes, `fib(60)` won't finish today**; two fixes (memoization + iteration) introduced as preview of DP; binary search formal definition + recursive C++ implementation; **`mid = lo + (hi - lo)/2`** overflow-safe pattern (with explicit Josh Bloch / JDK 2006 attribution); concrete trace (search 42 in 7-element list); `O(\log n)` derivation from "halves the range each call"; precondition warnings (must be sorted; off-by-one on mid±1); `std::binary_search` / `std::lower_bound` notebox; side-by-side table (Fibonacci vs binary search across 5 dimensions); "branching plus overlap = exponential" diagnostic.
- **Depth markers:** Real-world Josh Bloch overflow story — historical depth. Explicit recursion-tree drawing. STL alternatives flagged.

### 2.6 Data Privacy — lines 942–1144 (**SNHU-SPECIFIC, ~200 lines**)
- **Subsections:** "Alertness" as professional habit · Company XYZ scenario · Two levers (collection/release) · Tradeoffs are real · A short history of breaches · What this means for CS 300 and beyond
- **Callouts:** D×4, I×2, W×0, E×1, N×2
- **Topics:** Confidential data + data breach formal definitions; alertness reflexes for developers (4 items: ask if data needed, who sees it, lock screen, check diff); Company XYZ unencrypted-spreadsheet scenario with 4-failure breakdown; minimize-collection-risk + minimize-release-risk as two levers; **eBay vs Target architectural-segmentation comparison**; tradeoffs table (5 precaution-vs-cost rows); **4-question privacy checklist**; breach-history table (8 famous incidents: Target/Snowden/eBay/Sony/Anthem/Ashley Madison/Equifax/Facebook); habits-for-CS-300 list (gitignore credentials, env vars for tokens, think about data lifecycle, treat test data with respect).
- **Depth markers:** Professional-practice content, not algorithm content. References real breach incidents with scale numbers. Moves the "why CS 300 matters" framing toward responsible engineering.

### 2.7 Ethical Guidelines — lines 1146–1333 (**SNHU-SPECIFIC, ~190 lines**)
- **Subsections:** One-line summary · Five categories (ASA framework) · Connecting to CS 300 · Classic ways analyses go bad · A short CS 300 reproducibility checklist
- **Callouts:** D×2, I×2, W×4, E×0, N×0
- **Topics:** Ethics + data analytics defined; ASA Ethical Guidelines for Statistical Practice as the framework; **transparent assumptions / reproducible results / valid interpretations** triad as the compressed compass; 5 ASA categories (professional integrity / data and methods integrity / responsibilities to public/client / responsibilities to research subjects / allegations of misconduct); CS 300 mappings table (6 rows from "transparent assumptions → document time complexity" to "don't retaliate → call out rounding"); 4 classic-bad-analysis warnboxes (p-hacking, cherry-picked baselines, hidden methods, proxy variables for protected attributes); **5-item reproducibility checklist** for CS 300 (seed randomness, record env, version dataset, rerun pipeline, commit code with results).
- **Depth markers:** ASA-as-source is a real professional reference. p-hacking and proxy-variable warnings go beyond intro CS treatment.

### 2.8 Heuristics — lines 1335–1521
- **Subsections:** Knapsack canonical example · Greedy heuristic for knapsack · Self-adjusting heuristics · Move-to-front worked example · When to reach for a heuristic
- **Callouts:** D×4, I×3, W×2, E×3, N×2
- **Topics:** Heuristic + heuristic-algorithm formal definitions; **0-1 knapsack** definition + NP-hardness ("$2^{30}\approx 10^9$ subsets at 30 items"); greedy-by-value heuristic + worked counter-example (3 items: greedy gets \$95, optimal gets \$102); ratio-based greedy as smarter heuristic (still imperfect); DP and branch-and-bound as alternatives mentioned; **self-adjusting heuristic** definition (splay/AVL/LRU previews); move-to-front list with worked sequence (search 42 → 5 comparisons → moved → next search 1 comparison); skewed-vs-uniform workload analysis; "when to reach" decision table.
- **Depth markers:** Knapsack-as-NP-hard introduced concretely. Self-adjusting structures as a category — a unifying framing not common in intro books.

### 2.9 Greedy Algorithms — lines 1523–1743
- **Subsections:** Making change · Fractional knapsack · Activity selection · When greedy works · Greedy vs other strategies
- **Callouts:** D×4, I×4, W×2, E×4, N×1
- **Topics:** Greedy algorithm + locally-vs-globally-optimal formal definitions; US-coin change (greedy correct) + `{1,3,4}` counter-example (greedy wrong: 4+1+1 vs optimal 3+3); fractional knapsack (greedy by value/weight provably optimal — vs 0-1 from §2.8); **activity selection** (definition + greedy by earliest finish + worked vacation-day example); why earliest-finish (vs shortest or earliest-start); **matroid structure** + greedy-choice property + optimal substructure as the two underlying conditions; 2-step correctness argument template (greedy-choice property + optimal substructure); 5-row strategy comparison table (greedy / DP / D&C / backtracking / branch&bound).
- **Depth markers:** Matroid mention (without definition — appropriate intro level). Real correctness-proof template, not just "trust me." Concrete greedy fails to balance against the wins.

### 2.10 Dynamic Programming — lines 1745–2008
- **Subsections:** Fibonacci fixed · LCS · Space optimization (rolling-array) · Recognizing DP problems · DP vs greedy vs D&C
- **Callouts:** D×3, I×3, W×1, E×3, N×1
- **Topics:** DP + overlapping subproblems + optimal substructure formal definitions; Fibonacci fixed two ways: top-down memoization with `memo[n]` cache, bottom-up tabulation with rolling 2-variable form; **top-down vs bottom-up** comparison; **longest common substring** problem (distinct from LCS-subsequence); recurrence $L[i][j] = 0 \text{ if } s[i]\neq t[j]; 1+L[i-1][j-1] \text{ if equal}$; full C++ implementation $O(nm)$; worked trace `"Look"` vs `"Books"` showing the table; **rolling-array trick** ($O(nm)$ time, $O(m)$ memory — DNA strings example); 3 signals a problem is DP; "designing the state is the hard part" warnbox; DP-vs-greedy-vs-D&C comparison table.
- **Depth markers:** LCS recurrence formal LaTeX derivation. Rolling-array as space-optimization pattern. Real applications (DNA, git rename, plagiarism).

### 2.11 (stub) — line 2010
- **Content:** Single line: `\section{2.11 \textit{(next section -- ready to scrape)}}`
- **Status:** Placeholder, no content. **Open issue — see Issues section below.**

---

## Closing material (after §2.10 / §2.11 stub)

### "What this connects to" notebox (lines 2012–2039)
Forward refs to:
- **Ch_3 (Big-O):** "naive Fibonacci is exponential, memoized is linear" claim becomes precise $O(2^n)$ vs $O(n)$.
- **Ch_3 sorting:** insertion/selection = incremental; merge/quicksort = D&C (recursive); analyses reuse §2.5 recursion-tree reasoning.
- **Ch_6 BSTs:** binary search reappears as inner loop of BST search; `std::lower_bound` everywhere.
- **DP later:** longest-path-in-DAG, knapsack, edit distance, string alignment all use the §2.10 template.
- **Ch_10 graphs:** Dijkstra and Kruskal's MST run on greedy from §2.9; Huffman coding for compression too.
- **Ethics throughout:** §2.6/2.7 framing reappears in semester-long discussion-board prompts.

### Companion-materials line (lines 2041–2043)
> "One-page cheat sheet: `cheat_sheets/ch_2.tex`. Practice prompts: `practice_prompts/ch_2.md`."

**Status:** Stale paths (same as ch_1). Already logged in `phase2_issues.md`.

---

## `notes.tex` (compact reference, 152 lines, formerly `cheat.tex`)

**Layout:** Two-column `multicols`. Title: "Ch.~2 Notes — Algorithms, Recursion, Strategies".

**Subsections:** Problem vs algorithm · What makes an algorithm "good" · Recursion anatomy · Binary search recursive · Recursion gotchas · Heuristic / greedy / DP · Greedy when it works · DP template · Recognizing the strategy · Data privacy & ethics · Ethics checklist · Top gotchas

**Tables:**
- Heuristic vs greedy vs DP (one-paragraph each)
- Strategy recognition (4 trigger-phrases → strategy)

**Code listings (lstlisting):** factorial recursive, recursive binary search

**Top gotchas (4 listed):**
1. Claiming greedy is optimal without checking the greedy-choice property
2. Writing DP without defining the state first
3. Naive recursion on overlapping subproblems (Fibonacci trap)
4. Using a heuristic result as if it were optimal

**Coverage relative to `lectures.tex`:**
- **Covered:** §2.1 (problem/algorithm), §2.4 (recursion anatomy + factorial), §2.5 (binary search + Fibonacci-trap warning), §2.8 (heuristic def), §2.9 (greedy-when-works), §2.10 (DP template + recognition), §2.6/2.7 (privacy + ethics — explicit subsections).
- **Not covered (intentionally — out of scope for a quick-ref card):** §2.2 problem-solving workflow, §2.3 computational thinking habits, §2.5 binary-search trace, §2.6 breach history, §2.7 ASA categories detail.

**Density:** Tighter than ch_1's notes.tex. Includes the privacy/ethics content (which is conceptually important enough to deserve a quick-reference entry).

---

## Cross-references inside ch_2

- §2.2 workflow step 6 → §2.3 (computational thinking) and §1.12 debugging methodology (**broken — see Issues**).
- §2.3 closes with workflow ↔ CT mapping back to §2.2.
- §2.4 references §1.11 reverse-vector loop (**broken — see Issues**), forward-refs §2.5 algorithms.
- §2.5 binary search references §1.9 linear scan (**broken AND likely pre-existing wrong ref — see Issues**).
- §2.5 Fibonacci forward-refs §2.10 DP.
- §2.8 forward-refs §2.9 greedy.
- §2.9 references §2.8 0-1 knapsack as the canonical "greedy fails" example.
- §2.10 references §2.5 recursion and §2.9 greedy throughout.

## Forward-references to other chapters (where ch_2 plants seeds)

- **Ch_3:** Big-O formalism (informal claims throughout); sorting algorithms map to ch_2 strategies (insertion/selection incremental, merge/quick D&C, radix non-comparison heuristic).
- **Ch_6:** Binary search reappears in BST search.
- **Ch_5/Ch_6:** Hash tables / BSTs as the way to beat the linear scan.
- **Later DP:** edit distance, knapsack, longest-path-in-DAG.
- **Ch_10 (optional):** Dijkstra, Kruskal MST, Huffman as greedy applications.
- **Ethics throughout the course:** §2.6/§2.7 framing applies to every project.

---

## Stylistic patterns observed

1. **Code blocks use `verbatim`, not `lstlisting`** (counter to ch_1 which uses `lstlisting` with `language=C++`). No syntax highlighting in the rendered PDF for ch_2 code blocks.
2. **Each section closes with `[Big picture]` ideabox** (not `[The big picture for X.Y]` like ch_1's first 8 sections — only the unnumbered form is used here, matching ch_1's later sections).
3. **Heavy use of worked examples with concrete numbers** (8 specific breach incidents, Josh Bloch overflow attribution, US coin denominations, the "Look"/"Books" LCS trace, etc.).
4. **Cross-strategy comparison tables** appear in §2.8, §2.9, §2.10 — three different views of the same greedy/DP/D&C/heuristic landscape. Possibly redundant by §2.10.
5. **Real-world historical anchors** (Bloch overflow 2006, eBay vs Target architectural decisions, ASA framework) — gives concrete weight to abstract claims.
6. **§2.6 and §2.7 are content of a different *kind*** than §2.1–§2.5 and §2.8–§2.10. Algorithm chapters are scaffolded around recurrences; ethics chapters are scaffolded around real-incident analysis. This is intentional given the SNHU course shape.

---

## Issues flagged for the per-chapter review

### Critical: cross-chapter references to ch_1 are broken

Side-effect of the ch_1 renumbering executed in Step 3. Four broken refs:

| ch_2 location | Currently says | Was meant for | Should now say |
|---|---|---|---|
| Line 342 (§2.2 workflow) | `\textsection 1.12 methodology` | old §1.12 Debugging Example | `\textsection 1.10` |
| Line 643 (§2.4 reverse_list) | "the reversal loop from `\textsection 1.11`" | old §1.11 Swapping Two Variables | `\textsection 1.9` |
| Line 656 (§2.4 reverse_list) | "Compare to the loop in `\textsection 1.11`" | old §1.11 | `\textsection 1.9` |
| Line 828 (§2.5 binary search) | "linear $O(n)$ scan from `\textsection 1.9`" | **Pre-existing bad ref** — old §1.9 was `push_back/back/pop_back`, not linear search. Linear search was defined in old §1.7 Multiple Vectors. | `\textsection 1.5` (where Multiple Vectors lives now) |

These should be fixed in **Step 3 of ch_2** revisions, not as ad-hoc patches now (per the per-chapter loop discipline). Logging here so they aren't forgotten.

### §2.11 is a stub

Line 2010 contains `\section{2.11 \textit{(next section -- ready to scrape)}}` — explicit placeholder, no content. The author marked it "ready to scrape" — meaning source material from the SNHU zyBook is identified but not yet ported in. **Open question for Step 2 / Step 3:** what was §2.11 supposed to contain? Need to either fill from SNHU source, drop the stub, or repurpose for OCW/CLRS-derived content.

### §2.6 and §2.7 are SNHU-only

CLRS and OCW 6.006 don't have privacy/ethics content. Step 2 gap analysis will not propose changes here. Worth noting: ~390 lines (~19% of the chapter) is content that augmentation sources do not touch.

### Possible redundancy: greedy/DP/D&C comparison

§2.8 (heuristic vs alternatives), §2.9 (greedy vs other strategies), and §2.10 (DP vs greedy vs D&C) all surface very similar comparison tables. By §2.10 the third table may feel redundant. Worth a re-look during revision.

### Companion-materials line is stale

Same as ch_1 — references `cheat_sheets/ch_2.tex` and `practice_prompts/ch_2.md` which don't exist. Already logged in `phase2_issues.md` for Phase-2 redesign.

### Subtle: ch_2 chapter map says Big-O is in §2.2

Line 216 in the §2.1 closer says: "you can look at a new problem, say 'that's a search on sorted data, so binary search is O($\log n$)' -- and pick up the right tool without rediscovering it. ... a *language* for comparing algorithms (big-O, which starts in **§2.2**)". Big-O actually lives in **ch_3** in cs-300, not §2.2. Pre-existing minor framing inconsistency; flag for revision pass.

---

## Counts at a glance

| Metric | Count |
|---|---|
| Sections (numbered 2.1–2.11, but 2.11 is a stub) | 11 (10 with content) |
| Subsections | 56 |
| Subsubsections | 0 |
| `defnbox` | 29 |
| `ideabox` (incl. closers) | 23 |
| `warnbox` | 18 |
| `examplebox` | 27 |
| `notebox` | 14 |
| `lstlisting` | 0 (ch_2 uses `verbatim` for code) |
| **Total callout boxes** | **111** |
| Mastery checklist items | 7 |
| Lines (`lectures.tex`) | 2045 |
| Lines (`notes.tex` compact) | 152 |
| Cross-chapter refs to ch_1 (currently broken) | 4 |
