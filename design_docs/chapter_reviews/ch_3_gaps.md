# Chapter 3 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_3/lectures.tex` + `chapters/ch_3/notes.tex` (per `ch_3.md` inventory) **against** OCW 6.006 lec3 (sorting), lec5 (linear sorting), r03 (master theorem + sorting recap), r05 (counting + radix + tuple sort), and CLRS 3rd-ed Ch 2.1–2.3 (Insertion sort, Analyzing algorithms, Designing algorithms / merge sort), Ch 3.1 (Asymptotic notation — full O / Ω / Θ / o / ω), Ch 8.2 (Counting sort), Ch 8.3 (Radix sort), Ch 8.4 (Bucket sort).

**Locked framing (per ch_3 chapter map):** ch_3 is the **load-bearing chapter** that owns formal Big-O (§3.10), constant-time analysis (§3.9), and 6 sorting algorithms (§3.15–§3.20). It's already 3243 lines — the densest chapter in the course. Hard constraint: don't make it impossibly long. Augmentation should be **selective**, not bulk.

**Reference material read:**
- OCW lec3.pdf (6 pp) — Sorting: Set interface motivation for sorting, permutation sort baseline, selection/insertion/merge sort with **rigorous T(n) recurrence derivation via substitution and recurrence-tree methods**.
- OCW lec5.pdf (5 pp) — Linear Sorting: comparison-sort lower bound, **direct access array sort**, **counting sort** (stable, O(n+u)), **tuple sort** (lex-sort via stable subroutine), **radix sort** as tuple-sort + counting sort.
- OCW r03.pdf (7 pp) — recap of selection/insertion/merge sort + **Master Theorem** (formal statement with 3 cases) + 9 worked recurrence exercises.
- OCW r05.pdf (5 pp) — comparison-sort lower bound + counting sort (chain implementation AND cumulative-sum implementation) + tuple sort + radix sort + linear-time variants.
- CLRS Ch 2.1–2.3 (~20 pp) — insertion sort with **loop invariants** (initialization / maintenance / termination), **rigorous T(n) cost analysis** via summing c_i × t_j, divide-and-conquer + merge sort with sentinel-based MERGE, recursion-tree derivation.
- CLRS Ch 3.1–3.2 (~15 pp) — formal **O / Ω / Θ / o / ω** with set-membership definitions; Theorem 3.1; **asymptotic-analogy with real numbers** (O ↔ ≤, Ω ↔ ≥, Θ ↔ =, o ↔ <, ω ↔ >); polynomials, logs, factorials, **Stirling's approximation**, golden ratio.
- CLRS Ch 8.2–8.4 (~10 pp) — counting sort with cumulative-sum array + stability proof; radix sort Lemma 8.3; bucket sort with uniform-distribution analysis.

---

## Per-section gap verdicts

### §3.1 Bits & ASCII — SKIP

**Current:** Bit/byte defs, encoding, ASCII table, char arithmetic shortcuts, UTF-8 mention.

**OCW/CLRS:** Neither covers ASCII/bits — both assume the reader knows representation.

**Verdict: SKIP.** Already strong, no augmentation source.

### §3.2–§3.5 Data Structures + ADTs — SKIP

**Current:** Seven structures named, ADT-vs-DS distinction, std-lib mapping, applications.

**OCW lec2 (already read for ch_2):** Sequence/Set interface formalism. Equivalent to cs-300's ADT treatment, just framed differently. cs-300's ADT-as-contract framing is at least as strong.

**Verdict: SKIP.** No material augmentation.

### §3.6 Searching — SKIP (just fix the wrong cross-ref)

**Current:** Linear search def + C++, runtime-as-function-of-input, ignoring constants.

**OCW:** Same intuitive treatment.

**Verdict: SKIP.** Just fix the wrong "Chapter 4" cross-refs (lines 1041, 1183) → "§3.10."

### §3.8 Binary Search — SKIP

**Current:** Two preconditions, overflow-safe `mid`, Bloch 2006 attribution, halving derivation, dramatic comparison table.

**OCW r03:** Binary search appears as a recurrence example (T(n) = T(n/2) + O(1) → O(log n)).

**Verdict: SKIP.** cs-300's coverage is more depth than what OCW does on this topic.

### §3.9 Constant-Time Operations — FIX (one cross-ref)

**Current:** Constant-time op def, when-fixed-size matters, hidden-loop trap.

**Verdict: FIX** the wrong "Chapter 4" cross-ref (line 1501) → "§3.10."

### §3.10 Growth of Functions — ADD (little-oh / little-omega + analogy)

**Current:** Best/worst case T(N), upper/lower bounds, **O / Ω / Θ formal defs**, growth hierarchy table.

**CLRS Ch 3.1 adds two pieces:**

1. **Little-oh (o) and little-omega (ω) notation.** O is upper bound (may be tight); o is *strict* upper bound (definitely not tight). Same for Ω vs ω.
   - Definition: $f(n) = o(g(n))$ iff for *every* positive constant $c > 0$, there exists $n_0$ such that $f(n) < c \cdot g(n)$ for all $n \geq n_0$. Equivalently, $\lim_{n\to\infty} f(n)/g(n) = 0$.
   - cs-300 doesn't have these. Useful for stating "this algorithm is *strictly* faster" claims like "$2n = O(n^2)$" but "$2n = o(n^2)$" (the former is loose; the latter is precise).

2. **Asymptotic-analogy with real numbers** — the cleanest possible mental model:
   - $O$ ↔ $\leq$
   - $\Omega$ ↔ $\geq$
   - $\Theta$ ↔ $=$
   - $o$ ↔ $<$
   - $\omega$ ↔ $>$

   cs-300 §3.10's "mental picture" ideabox describes O/Ω/Θ in words but doesn't draw the analogy.

**Recommendation: ADD a `notebox` titled "Little-oh and little-omega: when the bound is strictly looser"** in §3.10 after the existing O/Ω/Θ defnbox. Include both the formal definitions and the 5-relation analogy table. ~15–20 lines. Genuinely useful — the analogy alone is worth the addition.

### §3.14 Sorting Introduction — FIX (cross-ref + bubble-sort pointer)

**Current:** Sorting def, what sorting unlocks, access constraint, 5 properties, Ω(n log n) lower bound mention.

**OCW lec3 adds the Set-interface motivation** explicitly: "given a sorted array, we can leverage binary search to make an efficient set data structure." cs-300 mentions "binary search" in the unlocks list but doesn't tie it to the Set ADT. Worth a single sentence cross-ref to §3.4 (ADT chapter). Light touch.

**Verdict: FIX** the wrong cross-ref (line 1755 says "Chapter 5 walk through specific algorithms (bubble sort, ...)") AND add the bubble-sort pointer ("bubble sort is in ch_13"). Also optionally add 1 sentence connecting "sorted array → binary search → Set ADT" back to §3.4.

### §3.15 Insertion Sort — ADD (loop-invariants notebox)

**Current:** Insertion sort def + card analogy, swap-based and shift-based C++ implementations, worst-case Σi = n(n-1)/2 derivation, best-case O(n) on already-sorted, nearly-sorted analysis, properties table.

**CLRS Ch 2.1 demonstrates the formal correctness-proof technique** of **loop invariants** using insertion sort as the canonical example:

> *"At the start of each iteration of the for loop of lines 1–8, the subarray A[1..j-1] consists of the elements originally in A[1..j-1], but in sorted order."*

CLRS proves correctness by showing **initialization** (invariant holds before first iteration), **maintenance** (each iteration preserves the invariant), and **termination** (when the loop exits, the invariant + exit condition imply the desired result).

cs-300 doesn't formally use loop invariants anywhere. The intuitive correctness arguments throughout §3.15-3.20 are fine for an intro chapter, but the loop-invariant framework is a real algorithmic-thinking tool that scales to harder algorithms (binary search, BST insert, Dijkstra).

**Recommendation: ADD a `notebox` titled "Loop invariants: the formal correctness-proof technique"** in §3.15, after the existing properties table. Brief: state the 3-part structure (init / maintain / terminate), demo it on insertion sort's outer loop in 3 lines each. ~20 lines. Useful intellectual scaffolding that pays off in later chapters (BST, graph algorithms).

### §3.16 Selection Sort — SKIP

**Current:** Already comprehensive (n² comparisons + n-1 swaps + insertion-vs-selection table + flash-memory use case + stability counter-example).

**Verdict: SKIP.** No augmentation source has more depth.

### §3.17 Shell Sort — SKIP

**Current:** Donald Shell attribution, gap-sequence comparison table, exact worst case for some sequences is open.

**OCW/CLRS:** Don't cover Shell sort.

**Verdict: SKIP.**

### §3.18 Quicksort + §3.19 Merge Sort — ADD (Master Theorem preview)

**Current:** Both sections invoke recurrence-tree reasoning informally. Quicksort §3.18 says "depth × work-per-level = log n × n = n log n"; Merge sort §3.19 has a similar depth-times-level argument.

**CLRS Ch 4 + OCW r03 add the Master Theorem** — the formal recurrence-solving tool that justifies these claims for the whole class of $T(n) = aT(n/b) + f(n)$ recurrences. The 3 cases:
- Case 1: $f(n) = O(n^{\log_b a - \varepsilon})$ → $T(n) = \Theta(n^{\log_b a})$ (work at leaves dominates)
- Case 2: $f(n) = \Theta(n^{\log_b a})$ → $T(n) = \Theta(n^{\log_b a} \log n)$ (work balanced)
- Case 3: $f(n) = \Omega(n^{\log_b a + \varepsilon})$ + regularity → $T(n) = \Theta(f(n))$ (work at root dominates)

For merge sort specifically: $T(n) = 2T(n/2) + \Theta(n)$ → case 2 with $a = 2, b = 2, f(n) = n$ → $\Theta(n \log n)$.

**Recommendation: ADD a `notebox` in §3.19** (merge sort, since it's the cleanest application) titled "**The Master Theorem: a formal tool for divide-and-conquer recurrences**." Brief: state the recurrence form, give the 3 cases with intuition (leaves dominate / balanced / root dominates), apply to merge sort. ~20–25 lines. Useful tool that makes §3.18/§3.19 derivations rigorous instead of hand-wavy.

**Skip the full CLRS Ch 4 treatment** (substitution method, recursion-tree method, master-method proof) — too deep for ch_3. Just the master-theorem statement + 1 application is enough.

### §3.20 Radix Sort — ADD (Counting Sort as a standalone algorithm)

**Current:** Radix sort def, "why it works (stability of digit pass)", LSD algorithm in C++, traced 4-step example, $O(nd)$ derivation, **counting sort mentioned briefly in a closing notebox**.

**OCW lec5 + CLRS Ch 8.2 cover counting sort as a first-class algorithm**, not just as radix sort's cousin. Two implementations:
- **Chain version** (OCW): each direct-access slot holds a queue; insert + read.
- **Cumulative-sum version** (CLRS): count occurrences, prefix-sum to get positions, walk input *backward* to place elements stably.

cs-300's brief notebox mention undersells counting sort. It's a legitimate $O(n + k)$ sorting algorithm that's the right tool when keys are bounded small integers (grades 0–100, ASCII characters, pixel intensities, etc.).

**Recommendation: ADD a new subsection after §3.20.4** (or just after the radix sort properties table): **"Counting sort: radix sort's standalone cousin."** Cover: definition, when to use (small-bounded-integer keys), one C++ implementation (cumulative-sum version since it's less obvious than the chain version), $O(n + k)$ analysis, **stability proof** (by walking input backward). ~30–40 lines. Genuinely upgrades cs-300's non-comparison sort coverage.

### §3.21 Overview of Fast Sorting Algorithms — ADD (bucket sort pointer)

**Current:** Speed classification, **Ω(n log n) decision-tree proof**, comparison-vs-non-comparison framing, best/avg/worst tables, 6-step pocket decision tree, extended comparison table.

**ch_13 §13.3 covers Bucket Sort.** Same situation as bubble sort — covered in extras chapter, but ch_3 doesn't tell you that. The §3.21 references mention "counting, bucket sort" as non-comparison sorts but never point to where bucket sort is covered.

**Recommendation: ADD a brief pointer ("bucket sort is in ch_13.3")** in §3.21's comparison-vs-non-comparison subsection. ~3 lines.

CLRS Ch 8.4's full bucket-sort treatment (uniform-distribution assumption + indicator random variables analysis) is more depth than ch_3 needs. The pointer to ch_13 is sufficient.

### §3.22 — DROP (per ch_2 precedent)

`\section{3.22 \textit{(next section -- ready to scrape)}}`. Same as ch_2 §2.11.

---

## Cross-chapter ref fixes (must do — pre-existing wrong refs)

These are NOT side-effects of any renumbering — they're original-source bugs where ch_3 was written assuming a different chapter mapping than cs-300 actually uses:

| Line | Currently | Fix |
|---|---|---|
| 1041 | "the idea that turns into Big-O in **Chapter 4**" | "in **§3.10**" |
| 1183 | "**Chapter 4** formalizes the 'on the order of' idea into Big-O notation" | "**§3.10** formalizes..." |
| 1501 | "is Big-O notation, the core vocabulary of **Chapter 4**" | "...the next section, **§3.10**" |
| 1755 | "the following sections and **Chapter 5** walk through specific algorithms (bubble sort, selection sort, insertion sort, quicksort, merge sort, heap sort)" | "the rest of this chapter walks through insertion, selection, shell, quicksort, merge, and radix sort. (Bubble sort lives in ch_13's extras; heap sort waits for ch_7 once we have heaps.)" |
| 3013 | "The next chapter (4) is complexity analysis proper: Big-O, growth-of-function techniques, and recurrence relations" | Drop entirely (Big-O is THIS chapter, ch_4 is lists/stacks/queues per README). Replace with a forward-ref appropriate to ch_4's actual content. |

---

## Bubble-sort + bucket-sort discoverability fixes (per ch_3.md inventory)

Forward-ref pointers to ch_13:

| Location | Add |
|---|---|
| `lectures.tex` line 1732 (§3.10 halfway recap) | After "Incremental: bubble, insertion, selection, shell —", add: "(bubble sort is covered in ch_13's extras chapter, since it's pedagogy-only.)" |
| `lectures.tex` §3.21 non-comparison sort subsection | Add 1-line pointer: "Bucket sort, the third non-comparison sort, lives in ch_13.3." |
| `notes.tex` line 80 (sorting comparison table) | Add an asterisk or footnote on the bubble-sort row: "* See ch_13.1 for the algorithm." |

---

## Out of scope for ch_3 (parked)

| OCW/CLRS topic | Why parked |
|---|---|
| OCW Set interface as motivation for sorting | Restructuring §3.4-§3.5 framing too invasive; current §3.14 mention is enough |
| OCW permutation sort baseline | Pedagogical only; cs-300 reaches "$\Omega(n \log n)$ is the bar" via the decision-tree proof |
| OCW direct-access-array sort + tuple sort | Tuple-sort idea is already implicit in radix sort's digit-by-digit construction; cs-300's radix sort treatment is sufficient |
| CLRS Ch 2.2 detailed cost-analysis (summing $c_i \cdot t_j$) | Useful pedagogy but ch_3 already has rigorous derivations; would bloat |
| CLRS sentinel-based MERGE | Implementation detail; cs-300's MERGE is fine |
| CLRS Ch 3.2 Stirling's approximation, factorials, golden ratio | Math foundation — could go in chapter notes or appendix; ch_3 mention via §3.21 lower-bound proof is enough |
| CLRS Ch 4 full master-theorem proof | Just the statement + 1 application is enough; full proof too deep |
| CLRS Ch 4.3-4.6 substitution / recursion-tree method | Cost-analysis depth — ch_3 doesn't need to derive them, just use master theorem |
| CLRS Ch 6 Heapsort | Heap sort lives in ch_7 in cs-300 |
| CLRS Ch 7 detailed Quicksort analysis (randomized version, formal proof) | Too deep for intro chapter |
| CLRS Ch 8.4 full Bucket Sort analysis (indicator random variables) | Pointer to ch_13.3 is sufficient |
| CLRS Ch 9 Selection problem (k-th element) | Out of scope; quickselect is in ch_13.2 |
| CLRS Ch 17 Amortized Analysis methods | §3.3 has the one-sentence definition which is appropriate for intro |

---

## Open decisions for you

1. **§3.10 little-oh / little-omega + analogy notebox** — yes/no? Recommend yes (~15–20 lines). The 5-relation analogy with real numbers is the cleanest mental model for the asymptotic notations.

2. **§3.15 loop-invariants notebox** — yes/no? Recommend yes (~20 lines). Genuinely useful intellectual scaffolding for ch_6 BST proofs and ch_10 graph algorithms.

3. **§3.19 Master Theorem preview notebox** — yes/no? Recommend yes (~20–25 lines). Makes the §3.18/§3.19 recurrence claims rigorous.

4. **§3.20 Counting Sort as a standalone subsection** — yes/no? Recommend yes (~30–40 lines). Counting sort deserves more than a closing notebox.

5. **§3.21 Bucket sort pointer to ch_13.3** — yes/no? Recommend yes (~3 lines).

6. **All cross-chapter ref fixes + bubble-sort discoverability fixes + drop §3.22 stub** — these are not optional, just confirming they happen as part of Step 3.

---

## Recommended additions, summarized

If you approve everything: **net change to ch_3 is ~+90 added lines + minor text edits**. Chapter grows ~3% (from 3243 to ~3330 lines). Gains:

- The full asymptotic notation family (5 notations) with the cleanest mental model
- Loop invariants as a formal correctness-proof tool (scales to later chapters)
- Master Theorem for divide-and-conquer recurrences (makes §3.18/§3.19 rigorous)
- Counting sort as a first-class algorithm (not just radix sort's cousin)
- Discoverability fixes so students can find bubble + bucket sort in ch_13
- 5 critical cross-ref bug fixes that have been latent in the source

| Section | Action | Size |
|---|---|---|
| §3.6, §3.9, §3.14, §3.21, end-of-chapter | Fix 5 wrong "Chapter 4" / "Chapter 5" cross-refs | ±0 (5 lines edited) |
| §3.10 | Add `notebox`: little-oh / little-omega + analogy | +15–20 lines |
| §3.10 §1732 (halfway recap) | Add bubble-sort pointer to ch_13 | +1 line |
| §3.15 | Add `notebox`: loop invariants | +20 lines |
| §3.19 | Add `notebox`: Master Theorem preview | +20–25 lines |
| §3.20 | Add subsection: Counting sort standalone | +30–40 lines |
| §3.21 | Add bucket-sort pointer to ch_13.3 | +3 lines |
| §3.22 | Drop the stub | −3 lines |
| `notes.tex` line 80 | Asterisk on bubble-sort row + footnote | +2 lines |

**This is what I think Step 3 should execute.** Push back on any verdicts before saying go.
