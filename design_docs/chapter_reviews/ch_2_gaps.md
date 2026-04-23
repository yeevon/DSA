# Chapter 2 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_2/lectures.tex` + `chapters/ch_2/notes.tex` (per `ch_2.md` inventory) **against** OCW 6.006 lec15–18 (DP framework, recursive algorithms, pseudopolynomial), OCW lec1 (algorithm framing), and CLRS 3rd-ed Ch 15.3 (Elements of DP), Ch 15.4 (LCS), Ch 16.3 (Huffman, for greedy correctness structure).

**Locked framing (per ch_2 chapter map):** ch_2 is the **algorithm-strategies / problem-solving meta-skill** chapter — the bridge from "I can code" to "I can solve a novel problem." Strategy concepts (recursion, greedy, DP, heuristics) live here; specific algorithms (sorting, graph algorithms, hash tables) live in later chapters. Hard constraint from user: don't make the course impossibly long.

**SNHU-only sections (CLRS/OCW won't touch):** §2.6 (Data Privacy) + §2.7 (Ethical Guidelines), ~390 lines / ~19% of chapter weight.

**Reference material read:**
- OCW lec15.pdf (8 pp) — Recursive Algorithms: SRTBOT framework, algorithm-class table by DAG shape, Fibonacci as DP, DAG shortest paths, Bowling.
- OCW lec16.pdf (8 pp) — DP Subproblems: SRTBOT review, **LCS (subsequence)** with full DP, **LIS** with subproblem-constraint trick, Alternating Coin Game with subproblem-expansion trick.
- OCW lec17.pdf (8 pp) — DP III: Bellman-Ford as DP, Floyd-Warshall, Arithmetic Parenthesization, Piano Fingering.
- OCW lec18.pdf (8 pp) — Pseudopolynomial: Rod Cutting, **Subset Sum**, formal **pseudopolynomial / weakly polynomial** definitions, summary table of DP features.
- CLRS Ch 15.3 (Elements of DP, ~10 pp): formal **optimal substructure**, **overlapping subproblems**, **independent subproblems**, longest-simple-path counter-example, memoization vs tabulation tradeoffs.
- CLRS Ch 15.4 (LCS, partial): **CLRS LCS = subsequence** (non-contiguous), with optimal-substructure theorem and `LCS-LENGTH` algorithm. **Different problem from cs-300's LCS = substring (contiguous).**
- CLRS Ch 16.3 (Huffman codes, full proof): canonical greedy correctness via **Lemma 16.2 (greedy-choice property)** + **Lemma 16.3 (optimal substructure)** → Theorem 16.4 (Huffman is optimal). Template for greedy correctness proofs.

---

## Per-section gap verdicts

For each ch_2 section, three buckets: **ADD**, **FIX**, or **SKIP**. (No-gap sections omitted.)

### §2.1 Introduction to Algorithms — FIX (one line)

**Current:** problem vs algorithm, "good algorithm" informal, NP-complete intuitive, P=NP mention.

**OCW lec1:** roughly the same content with formal Word-RAM model, induction-as-correctness, asymptotic table. CLRS Ch 1 has "Algorithms as a technology" framing. Both add depth but the depth belongs in **ch_3** (formal Big-O) for cs-300.

**Pre-existing bug to fix:** §2.1 closer (line 216) says "a *language* for comparing algorithms (big-O, which starts in **§2.2**)." Big-O actually lives in **ch_3** in cs-300, not §2.2. Single-line fix.

**Verdict: FIX one cross-ref. No content additions.**

### §2.2 Problem Solving — ADD (one notebox)

**Current:** 6-step workflow, sock matching (pigeonhole), name tags (radix sort in disguise), 64-person greeting (O(n²) trap), "code first, think later" anti-pattern.

**OCW lec1 / lec15 add:** an explicit two-prong recipe — *"How to Solve an Algorithms Problem"*: either **(1) reduce to a problem you already know** (with a table of known data structures + sort algorithms + graph algorithms — i.e., the cs-300 syllabus itself) **or (2) design your own recursive algorithm** (with classification by recursion-DAG shape: brute force = star, decrease & conquer = chain, divide & conquer = tree, DP = DAG, greedy = subgraph).

**Why it fits:** §2.2 already teaches a problem-solving workflow but doesn't articulate this top-level binary choice. The reduce-vs-design framing is genuinely useful and unifies §2.4–§2.10's strategies under one organizing principle.

**Recommendation: ADD a `notebox` after §2.2's workflow** titled something like *"The two paths to an algorithm: reduce vs. design"*. Brief enumeration of OCW's two prongs, with a forward-ref note that §2.4–§2.10 cover the design strategies. ~12–15 lines.

### §2.3 Computational Problem Solving — SKIP

**Current:** 4 habits of computational thinking, is_prime walkthrough, sum closed-form, workflow ↔ CT mapping.

**OCW/CLRS:** Neither has a "computational thinking" framework — both assume the reader does it implicitly. cs-300's pedagogy here is unique.

**Verdict: SKIP.** Already strong. No augmentation source.

### §2.4 Recursive Definitions — ADD (two small additions)

**Current:** Recursive algorithm / base case / recursive case definitions; **3-part template (base / reduce / combine)**; factorial, cumulative sum, recursive reverse-vector; 3 failure modes; recursion-induction equivalence.

**OCW lec15 adds two things:**

1. **SRTBOT framework** (a fuller 6-step version of the 3-part template):
   - **S**ubproblem definition (in words, in terms of parameters; often subsets like prefixes/suffixes/substrings)
   - **R**elate subproblem solutions recursively (via "guess + brute-force" pattern)
   - **T**opological order (must form a DAG to terminate)
   - **B**ase cases
   - **O**riginal problem (compute from subproblems; use parent pointers to recover the actual solution)
   - **T**ime analysis (sum work over subproblems)

   cs-300's 3-part template (base / reduce / combine) is a subset. SRTBOT adds: explicit subproblem **parameterization in words**, topological-order argument (which is what makes the recursion well-founded), and explicit time analysis as a step. Worth introducing.

2. **Algorithm classification by recursion-DAG shape:**
   | Strategy | Recursion-DAG shape |
   |---|---|
   | Brute Force | Star |
   | Decrease & Conquer | Chain |
   | Divide & Conquer | Tree |
   | Dynamic Programming | DAG |
   | Greedy / Incremental | Subgraph |

   Unifies §2.4–§2.10 strategies under one mental model. Currently cs-300 presents recursion (§2.4–§2.5), heuristics (§2.8), greedy (§2.9), DP (§2.10) without naming the underlying DAG-shape distinction.

**Recommendations:**
- **ADD a `defnbox` introducing SRTBOT** as a fuller version of the 3-part template. Keep cs-300's existing template + recursion definitions. The SRTBOT box says "OCW 6.006 formalizes recursive algorithm design as a 6-step recipe; the 3-part template above is the core (base + reduce + combine = base + relate); SRTBOT adds the subproblem-parameterization, topological-order, original-problem, and time-analysis steps as explicit checks." ~15 lines.
- **ADD a `notebox` with the DAG-shape classification table** in §2.4 (after the "what can go wrong" subsection). Pure forward-ref aid that pays off in §2.5/§2.8/§2.9/§2.10. ~10 lines.

### §2.5 Recursive Algorithms — SKIP (mostly)

**Current:** Naive Fibonacci with recursion-tree explosion (φⁿ ≈ 1.618ⁿ); fixes via memoization + iteration; binary search recursive with Josh Bloch's overflow-safe `mid = lo + (hi-lo)/2`; trace; preconditions.

**OCW lec15 has Fibonacci as a SRTBOT example** with one extra nuance cs-300 doesn't mention: Fibonacci numbers grow to Θ(n) bits long, so each addition costs O(⌈n/w⌉) on a w-bit Word-RAM, giving total cost O(n + n²/w) — not pure O(n). This is genuinely a Big-O subtlety, but it requires the Word-RAM model from ch_3.

**Verdict: SKIP.** The bit-length nuance belongs in ch_3 (Big-O) where Word-RAM gets named. cs-300's "O(φⁿ) → O(n)" treatment is appropriate for an intro chapter.

### §2.6 Data Privacy & §2.7 Ethical Guidelines — SKIP

SNHU-only, ~390 lines. Neither CLRS nor OCW touches this material. Already inventoried as out-of-augmentation-scope. No verdict needed.

### §2.8 Heuristics — ADD (one notebox: pseudopolynomial)

**Current:** 0-1 knapsack as canonical NP-hard ("$2^{30}\approx 10^9$ subsets"); greedy heuristic + ratio-based variant; self-adjusting heuristics; move-to-front worked example.

**OCW lec18 adds a critical concept missing from cs-300**: **pseudopolynomial time**. cs-300 mentions that knapsack DP runs in O(n·W) (line 1426: "If all weights are integers and W is not too large, 0-1 knapsack can be solved exactly in O(n·W) time with dynamic programming") — but doesn't explain why this isn't actually a polynomial-time algorithm.

OCW's framing: "Pseudopolynomial: running time bounded by a constant-degree polynomial in input size **and input integers**. Polynomial only when integers are polynomially bounded in input size (n^O(1))." Subset Sum at O(nT) sounds polynomial but T can be 2^w where w is word size — exponential in input bits.

**Why it matters for §2.8:** The "DP solves knapsack in O(nW)" line currently sits without context. A reader could conclude knapsack is tractable, contradicting the NP-hardness premise of the section. Pseudopolynomial is the missing concept that resolves this.

**Recommendation: ADD a `notebox` titled "DP solves knapsack — but only pseudopolynomially"** after the existing "other two options: DP and branch-and-bound" notebox. ~10 lines defining pseudopolynomial and explaining why O(nW) doesn't make knapsack tractable in general.

### §2.9 Greedy Algorithms — ADD (one worked correctness sketch)

**Current:** Change-making (US works, {1,3,4} fails); fractional knapsack (greedy provably optimal); activity selection (earliest finish); when-greedy-works (matroid mention, greedy-choice property + optimal substructure); 2-step correctness argument template; comparison table.

**CLRS 16.3 Huffman codes** demonstrates the textbook greedy correctness proof structure: **Lemma 16.2 (greedy-choice property)** + **Lemma 16.3 (optimal substructure)** → **Theorem 16.4 (algorithm is optimal)**. cs-300 §2.9 mentions this template (lines 1687–1699) but doesn't *demonstrate* it on any of its three examples.

**Gap:** the abstract template is described but not made concrete. A reader sees "you usually show: (1) greedy-choice property, (2) optimal substructure" without ever seeing what "show" means in practice.

**Recommendation: ADD a brief worked correctness sketch for activity selection** — the cleanest of cs-300's three greedy examples. Show specifically:
- *Greedy-choice property:* there's an optimal solution that includes the activity with earliest finish time. (Exchange argument: if some optimal solution doesn't include it, swap in the earliest-finish activity — the rest of the schedule still fits, total count is the same.)
- *Optimal substructure:* after picking the earliest-finish activity, the remaining problem (activities compatible with it) has the same shape, and an optimal solution there extends to a global optimum.

Keep it as an `examplebox` after the existing activity-selection example. ~25 lines including the exchange-argument proof. Concrete, doesn't bloat.

**SKIP Huffman as a fourth example** — borderline. Huffman is the *canonical* greedy proof example in textbooks but it requires priority queues (forward to ch_7 cs-300) and tree construction (ch_6+). Adding it would push ch_2 toward "specific algorithms" territory and away from the "strategies" framing. Defer.

### §2.10 Dynamic Programming — ADD (terminology fix + 1 notebox)

**Current:** DP + optimal substructure + overlapping subproblems definitions; Fibonacci memoized + tabulated; **LCS** with O(nm) DP + worked trace ("Look" vs "Books") + rolling-array; recognizing DP signals; DP-vs-greedy-vs-D&C table.

**Critical terminology bug:** cs-300 §2.10 names its example "longest common substring (LCS)" — but the **standard textbook "LCS" means longest common SUBSEQUENCE** (non-contiguous, allows gaps). CLRS 15.4 LCS and OCW lec16 LCS are both subsequence, not substring. Same acronym, **different problem, different DP recurrence, different time complexity properties**.

cs-300's recurrence is correct for substring:
$L[i][j] = 0$ if $s[i] \neq t[j]$; $1 + L[i-1][j-1]$ if equal.

The standard subsequence recurrence (CLRS Theorem 15.1):
$c[i,j] = 0$ if $i=0$ or $j=0$; $c[i-1,j-1]+1$ if $x_i = y_j$; $\max(c[i,j-1], c[i-1,j])$ otherwise.

A reader who later encounters "LCS" in CLRS, OCW, or any DP textbook will get a different problem with a different recurrence. **This needs to be fixed.**

**Three options:**
- **(A) Rename throughout** to "Longest Common Substring" (LCStr or LC-Substring). Clarity wins, breaks the "LCS" acronym.
- **(B) Keep cs-300's content but add a clarifying notebox**: "Note: 'LCS' in most textbooks (CLRS Ch 15.4, OCW 6.006 lec16) means longest common *subsequence* (non-contiguous). What we cover here is the longest common *substring* (contiguous) variant. Different problem, different recurrence — make sure you know which one you mean when discussing 'LCS' with anyone outside this chapter."
- **(C) Replace with the standard subsequence LCS** (matching CLRS/OCW). Larger rewrite.

**Recommendation: (B) — clarifying notebox.** Smallest delta, preserves the existing content, prevents student confusion when they see "LCS" elsewhere. ~8 lines.

**Also worth flagging: where does pseudopolynomial go?** §2.10's DP is currently free of pseudopolynomial discussion. If §2.8 gets the pseudopolynomial notebox (per §2.8 recommendation above), §2.10 should also forward-ref it briefly when LCS table size O(nm) is discussed (since for short strings of long characters, n·m can be misleading too).

**Optional: rod cutting as a second DP example?** OCW lec18 / CLRS 15.1 use rod cutting as the canonical introductory DP — single-dimensional state (vs cs-300 LCS's 2D), simpler trace. **Recommendation: SKIP.** cs-300's LCS-substring is already a working 2D-state example with a worked trace; adding rod cutting would bloat without strong rationale.

### §2.11 — DROP (per user direction)

User confirmed: "chapter 2 ended at 2.10." The §2.11 stub line gets removed entirely.

---

## Cross-chapter ref fixes (must do — broken by ch_1 renumbering)

These are not gap-analysis additions — they're side-effect fixes from ch_1 Step 3. Already inventoried in `ch_2.md`:

| Line | Currently | Fix to |
|---|---|---|
| 342 | `\textsection 1.12` (debugging methodology) | `\textsection 1.10` |
| 643 | `\textsection 1.11` (reverse-vector swap) | `\textsection 1.9` |
| 656 | `\textsection 1.11` (same as above) | `\textsection 1.9` |
| 828 | `\textsection 1.9` (linear scan — was already wrong) | `\textsection 1.5` |

---

## Out of scope for ch_2 (parked)

These are real things OCW or CLRS covers that ch_2 does **not** — and **shouldn't** — add. Listing for visibility.

| OCW/CLRS topic | Belongs in cs-300… |
|---|---|
| Word-RAM model formal definition + bit-length analyses | ch_3 (Big-O / cost analysis) |
| Master method / recurrence solving (CLRS Ch 4) | ch_3 |
| CLRS Ch 17 amortized methods (aggregate, accounting, potential) | ch_3 |
| Insertion sort + analysis (CLRS Ch 2.1, 2.2) | ch_3 (sorting is its named topic) |
| Merge sort recursive analysis with recurrence T(n) = 2T(n/2) + O(n) | ch_3 |
| OCW lec3 sorting (sets, sorting, insertion + selection sort) | ch_3 |
| Huffman codes with priority queue (CLRS 16.3) | nice-to-have; defer to ch_7 (heaps) or skip |
| Matroids in depth (CLRS 16.4) | too advanced; cs-300 already mentions the term |
| OCW Bowling, Alternating Coin Game, Arithmetic Parenthesization, Piano Fingering | bloat — interesting examples but ch_2 already has DP coverage |
| OCW DAG SSSP / Bellman-Ford / Floyd-Warshall as DPs | ch_10 (graphs) |
| CLRS Ch 34 NP-completeness deep dive | beyond intro chapter scope |
| CLRS Ch 35 Approximation algorithms | too advanced |
| OCW LIS (longest increasing subsequence) | nice example of subproblem-constraint technique; defer |
| OCW Subset Sum with DP | covered in spirit by knapsack discussion |

---

## Open decisions for you

1. **§2.4 SRTBOT framework — full `defnbox` or just a brief mention?** Recommend `defnbox` (~15 lines). It's a fuller framework than cs-300's 3-part template and worth introducing.

2. **§2.4 DAG-shape classification table — yes/no?** Recommend yes (~10 lines). Unifies §2.4–§2.10.

3. **§2.10 LCS terminology — option (A), (B), or (C)?** Recommend (B): keep cs-300's content + add clarifying notebox. (A) is the cleanest but loses the LCS acronym, (C) is the biggest rewrite.

4. **§2.9 activity-selection correctness sketch — yes/no?** Recommend yes (~25 lines). Makes the abstract greedy-correctness template concrete.

5. **§2.8 pseudopolynomial notebox — yes/no?** Recommend yes (~10 lines). Resolves the "DP solves knapsack but it's still NP-hard" cognitive dissonance currently latent in §2.8.

6. **All cross-chapter ref fixes + drop §2.11 stub** — these are not optional, just confirming they happen as part of Step 3.

---

## Recommended additions, summarized

If you approve everything: **net change to ch_2 is ~+70 added lines + ~3 removed lines (§2.11 stub) + 4 cross-ref fixes**. Chapter grows ~3.5%, gains:
- A unified mental model for strategies (DAG-shape classification)
- The fuller SRTBOT framework alongside the existing 3-part template
- A concrete worked greedy-correctness proof
- The pseudopolynomial concept (resolves a latent confusion)
- LCS terminology clarification (prevents student confusion outside the chapter)

| Section | Action | Size |
|---|---|---|
| §2.1 | Fix "Big-O starts in §2.2" → "Big-O is in ch_3" | ±0 (1 line) |
| §2.2 | Add `notebox`: reduce-vs-design recipe | +12–15 lines |
| §2.4 | Add `defnbox`: SRTBOT framework | +15 lines |
| §2.4 | Add `notebox`: DAG-shape classification | +10 lines |
| §2.8 | Add `notebox`: pseudopolynomial | +10 lines |
| §2.9 | Add `examplebox`: activity-selection correctness sketch | +25 lines |
| §2.10 | Add `notebox`: LCS substring vs subsequence terminology | +8 lines |
| §2.11 | Drop the stub | −3 lines |
| Cross-refs | Fix 4 broken `\textsection` refs to ch_1 | ±0 |

**This is what I think Step 3 should execute.** Push back on any verdicts before saying go.
