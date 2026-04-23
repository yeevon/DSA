# Chapter 1 — Gap Analysis (Step 2)

**Compares:** `chapters/ch_1/lectures.tex` + `chapters/ch_1/notes.tex` (as inventoried in `ch_1.md`) **against** MIT OCW 6.006 Spring 2020 lec1/lec2 + r01/r02, and CLRS 3rd-ed Ch 1, Ch 2, Ch 17.4 (Dynamic Tables).

**Locked framing (from Step 1 review):** ch_1 is a **C++ refresher** built on the SNHU-derived core. Algorithm-theory content (formal Big-O, sorting algorithms, induction proofs, interface taxonomy) belongs in cs-300 ch_2 / ch_3 / ch_4 — **not in ch_1**. The "don't make it impossibly long" filter is binding.

**Reference material read:**
- OCW lec1.pdf (5 pp) — "Introduction": problem/algorithm definitions, induction-as-correctness, asymptotic table, Word-RAM model, Static Array primitive, "How to solve an algorithms problem" recipe.
- OCW lec2.pdf (5 pp) — "Data Structures": Sequence/Set interfaces, Array/Linked-List/Dynamic-Array implementations, **formal amortized cost definition**, dynamic-array shrink strategy.
- OCW r01.pdf (7 pp) — recitation 1: same content as lec1 in prose form, **rigorous O / Ω / Θ definitions**, formal Word-RAM model, induction proof of birthday matching, 6 asymptotics-math exercises.
- OCW r02.pdf (10 pp) — recitation 2: full Python implementations of `Array_Seq`, `Linked_List_Seq`, `Dynamic_Array_Seq` with `_compute_bounds` / `_resize` / table-doubling factor `r=2`. Cycle-detection (Floyd's) and Set-from-Sequence exercises.
- CLRS 3rd-ed ToC — confirmed: Ch 1 (Role of Algorithms), Ch 2 (Insertion Sort + Analyzing/Designing), Ch 3 (Growth of Functions), Ch 10 (Elementary Data Structures), Ch 17 (Amortized Analysis incl. 17.4 Dynamic Tables).

**OCW/CLRS coverage style:** OCW uses Python-flavored pseudocode (`StaticArray`, `Dynamic_Array_Seq`); CLRS uses its own pseudocode. Neither is C++-specific. Implementation code does not port directly — only **concepts** transfer.

---

## Per-section gap verdicts

For each ch_1 section that has anything to consider, three buckets: **ADD**, **DECIDE**, or **SKIP** (no-gap sections omitted entirely).

### §1.1 Programming Basics — DECIDE

**Current:** ~170 lines on what a program is, statements, variables, assignment, I/O, cursor/newlines. Heavy Coral framing.

**With Coral dropped (locked decision):** removes the interpreter-vs-compiler defnbox is fine to keep (still C++-relevant), the variable definition stays, `=` vs `==` warning stays. The Coral input/output parallelogram material and the Coral-vs-C++ comparison examples evaporate.

**OCW/CLRS coverage:** Neither has a "programming basics" section. Both **assume the reader knows programming**. Per CLRS preface: "You should have some programming experience. In particular, you should understand recursive procedures and simple data structures such as arrays and linked lists."

**Three options:**

- **(A) Cut §1.1 and §1.2 entirely.** Chapter opens at §1.3 (Arrays and Vectors general concept) or §1.4 (Vectors in C++). Justification: a C++ refresher assumes you've programmed before. SNHU's earlier courses cover this; if a reader needs variables-and-assignment, they're below the C++-refresher prerequisite.
- **(B) Compress §1.1 + §1.2 to a single tight "C++ basics" preamble** (one or two pages): variable declaration, `=` vs `==`, `std::cin/cout`, `std::string` literal vs identifier, escape sequences. Pure C++ syntax, no Coral, no pseudocode-vs-code framing. Serves readers who programmed in another language and need the C++ syntax cheat-sheet.
- **(C) Keep §1.1's structural shape but rewrite all examples in C++.** Roughly a port of the current content with Coral replaced by C++.

**Recommendation: (A).** Cleanest fit with "C++ refresher, don't bloat." If a reader genuinely doesn't know what a variable is, they need a different course, not a refresher. (B) is a defensible compromise but risks scope drift. (C) preserves the most material but rewards readers who didn't need §1.1 to begin with.

**Open question for you to decide.**

### §1.2 Code and Pseudocode — DECIDE (coupled with §1.1)

**Current:** Why text not pictures · Pseudocode definition · Coral code vs Coral flowcharts.

**With Coral dropped:** the entire premise of the section vanishes. Pseudocode-vs-code is interesting in an *algorithms* course (where pseudocode is the lingua franca) but not in a C++ *refresher*.

**Recommendation: cut §1.2 entirely.** If pseudocode shows up later (cs-300 ch_2 algorithms, ch_3 data-structures) it can be introduced there. CLRS does exactly this in its preface: "Algorithms are described in English and in a pseudocode designed to be readable by anyone who has done a little programming" — pseudocode is a tool the algorithms chapters use, not a topic in its own right.

### §1.3 Arrays and Vectors (general concept) — ADD (1 small forward ref)

**Current:** Motivation · Indexing · Zero-based · Arrays vs vectors. Includes the address-arithmetic explanation of O(1) indexing.

**Gap:** OCW lec1 + r01 give the formal name for the underlying model: **Word-RAM** (memory is an addressable sequence of machine words; processor can read/write any address in O(1); word size w ≥ log₂ n so addresses cover memory). ch_1 derives the O(1) intuition without naming the model.

**Recommendation: ADD a small forward-ref notebox** in §1.3 after the address-arithmetic ideabox. One paragraph: "The model under the hood — addressable memory, O(1) word read/write — has a name: the Word-RAM model. Chapter 3 uses this language when it makes Big-O analysis formal." That's it. No formal Word-RAM definition in ch_1; the formalism is ch_3 territory.

### §1.4–§1.7 Vectors / Iteration / Multiple vectors — SKIP

**Current:** Comprehensive C++-specific coverage. All idioms and gotchas already addressed.

**OCW/CLRS coverage:** OCW covers the same ground in Python (`Array_Seq` class, `iter_seq` generator) and adds the Sequence-interface formalism. CLRS Ch 10.1–10.2 covers stacks/queues/linked-lists in pseudocode.

**Verdict: nothing to add.** The Sequence/Set interface taxonomy is genuinely useful but it's a *data-structures* concept, not a C++-language concept. It belongs in cs-300 ch_3 (where the chapter title is "Data structures, ADTs, Big-O, sorting"). Trying to import it into ch_1 conflates the C++-syntax bar with the algorithmic-thinking bar — exactly what the C++-refresher framing exists to avoid.

### §1.8 Vector Resize — ADD (formal amortized cost + shrink discussion)

**Current:** Already explicit about size-vs-capacity, geometric reallocation, amortized O(1). Already calls itself out as "what intro texts omit." Mentions `reserve()` but doesn't discuss shrinking.

**Gap 1 — formal amortized-cost definition.** OCW lec2 gives a one-liner: *"Operation has amortized cost T(n) if k operations cost at most kT(n)."* CLRS 17.1–17.3 develops three formal techniques (aggregate, accounting, potential method); CLRS 17.4 applies them to dynamic tables. ch_1 currently waves at amortization without defining it.

**Recommendation: ADD a small `defnbox [Amortized cost]`** with the OCW-style one-line definition. Do **not** import the CLRS three-method machinery — that's ch_3 territory ("ch_3 cost analysis chapter formalizes the perf intuitions you used here"). Just the definition + a one-line "ch_3 will derive *why* push_back is O(1) amortized; for now you only need the conclusion."

**Gap 2 — what about shrinking?** ch_1 covers `pop_back` but doesn't address: when you've popped enough that capacity is way over size, does the vector release memory? Answer (C++-specific): **no, std::vector does not auto-shrink.** `shrink_to_fit()` is a non-binding *request*. Contrast with Python's list which does auto-shrink (OCW lec2's `r_d = 1/4` policy — though that's their teaching example, not strictly Python's policy).

**Recommendation: ADD a `warnbox [shrink_to_fit() and the no-auto-shrink policy]`** in §1.8. Three lines: `std::vector` doesn't shrink capacity automatically (unlike Python list / Java ArrayList depending on impl). `shrink_to_fit()` exists but is non-binding (the implementation is allowed to ignore it). If you really need bounded memory, swap with an empty vector to force a release.

### §1.9 push_back / back / pop_back — SKIP

**Current:** Three back-end ops, vector-as-stack mapping, exception-safety rationale for `void` pop_back, deque cross-ref, CSV-reading worked example, gotchas.

**OCW/CLRS:** Stack as Sequence interface special case (`insert_last` + `delete_last`); CLRS Ch 10.1 has stacks formally.

**Verdict: nothing to add.** ch_1 already nails this. The Sequence-interface framing belongs in ch_3 / ch_4.

### §1.10 Modifying / Copying / Comparing — SKIP (one minor)

**Current:** Value semantics formal definition, deep-copy O(n) cost, std::move mention, lexicographic compare aside, floating-point compare warning, reallocation invalidates iterators.

**Verdict: nothing material to add.** Optional minor — the "backing memory" subsection could link forward to the new `shrink_to_fit` warnbox added to §1.8 (Gap 2 above). Single sentence, not a callout.

### §1.11 Swapping — SKIP

**Current:** Why naive fails, temp pattern, std::swap (with O(1) swap-pointers note for vector/string), reverse-vector-in-place worked example.

**OCW/CLRS:** Both use swap as a primitive without defining it.

**Verdict: nothing to add.** Already complete.

### §1.12 Debugging Example — SKIP

**Current:** Three-bug walkthrough of reverse-vector loop with hand-traces, 4-step debugging methodology.

**OCW/CLRS:** Neither covers debugging methodology (CLRS preface explicitly defers "engineering issues" out of scope).

**Verdict: nothing to add.** This is genuinely original content that neither reference has. Keep as-is. (The §1.11/§1.12 overlap flagged in the inventory is internal restructuring, not a CLRS/OCW gap.)

### §1.13 Arrays vs. Vectors — SKIP

**Current:** Side-by-side syntax, memory-corruption demo (`weights[3]` clobbers `age`), 7-row feature table, array decay, std::array as middle ground.

**OCW/CLRS:** OCW conflates static and dynamic arrays into a single `StaticArray` Python class. CLRS Ch 10 doesn't distinguish C arrays from std::vector.

**Verdict: nothing to add.** ch_1's content is C++-specific and absent from both references.

### §1.14 2D Arrays — SKIP

**Current:** Row-major formal def, cache-locality 10× difference, three function-signature forms, `int**` doesn't take a 2D array, vector-of-vectors with non-contiguous heap rows, flat 1D `vector<T>` with `r*C+c` as the "real" matrix form.

**OCW/CLRS:** Neither covers C-language 2D-array signatures. CLRS Ch 28 does matrix operations but assumes data is just there.

**Verdict: nothing to add.** Strong existing coverage that exceeds typical intro-DSA bar.

### §1.15–§1.17 C-strings, string lib, cctype — SKIP

**Current:** Comprehensive C-specific coverage including buffer-overflow / security framing in §1.15, three `strcmp` traps in §1.16, signed-char UB in §1.17.

**OCW/CLRS:** Neither covers C strings (Python, pseudocode).

**Verdict: nothing to add.** Pure C++/C content; no augmentation source.

---

## Out of scope for ch_1 (would belong elsewhere)

These are real things OCW or CLRS covers that ch_1 does **not** — and **shouldn't** — add. Listing them so we know they're seen and parked.

| OCW/CLRS topic | Where it belongs in cs-300 |
|---|---|
| Birthday-matching problem (intro algorithm-design example) | ch_2 (algorithm strategies) — if at all |
| Insertion sort (CLRS 2.1) | ch_3 (sorting) |
| "How to solve an algorithms problem" recipe (OCW lec1) | ch_2 (algorithm strategies) |
| Designing algorithms / divide-and-conquer (CLRS 2.3) | ch_2 |
| Formal O / Ω / Θ definitions (OCW r01, CLRS Ch 3) | ch_3 (formal Big-O is the chapter's named topic) |
| Asymptotics math exercises (n^a vs c^n, log manipulations, Stirling) | ch_3 mastery checklist material |
| Word-RAM model formal definition with byte-addressing limits | ch_3 (with forward-ref notebox in ch_1 §1.3 per recommendation above) |
| Algorithm correctness via induction (OCW lec1 birthday proof) | ch_2 or ch_3 |
| Sequence interface (build / get_at / insert_first / etc.) | ch_3 (data structures + ADTs) — the chapter literally lists "ADTs" in its subtitle |
| Set interface (find / find_min / find_next / etc.) | ch_3 (ADT framing) and ch_5 (hash tables) / ch_6 (BSTs) for implementations |
| Linked List Sequence implementation (OCW r02 Python) | ch_4 (lists, stacks, queues) |
| Dynamic Array implementation with `_resize` policy | ch_3 or ch_4 |
| CLRS 17.1–17.3 amortization techniques (aggregate / accounting / potential) | ch_3 — only the *definition* lands in ch_1 §1.8 per recommendation |
| Cycle detection in linked list (Floyd's two-pointer) | ch_4 (linked-list-specific algorithm) |
| Set-from-Sequence implementation exercise | ch_3 or ch_4 |

---

## Open decisions for you

1. **§1.1 + §1.2 disposition.** Recommend (A) cut both. (B) compress to a tight "C++ basics" preamble is the reasonable alternative. (C) port-in-place is the most conservative. **Picking one shapes Step 3 (revision) significantly.**

2. **Word-RAM forward ref in §1.3 — yes/no.** Recommend yes (small notebox, names the model with a pointer to ch_3). No-cost option: skip it; the existing address-arithmetic ideabox already does the explanation work without naming the model.

3. **§1.8 formal amortized-cost defnbox + shrink_to_fit warnbox — yes/no.** Recommend yes for both. Total addition: ~12 lines for the defnbox, ~8 lines for the warnbox. These are the only material C++-specific gaps the reference material exposes.

---

## Recommended additions, summarized

If you approve everything: **net change to ch_1 is ~20 added lines + ~170 removed lines (Coral content in §1.1–1.2)**. Chapter likely shrinks by ~6%, gains in C++-refresher focus, and loses no real DSA content. Substantially smaller delta than the user might have feared.

| Section | Action | Size |
|---|---|---|
| §1.1 | Cut entirely (recommend), or compress (alt), or port (alt) | -150 to -170 lines (option A) |
| §1.2 | Cut entirely (recommend) | -100 to -110 lines |
| §1.3 | Add Word-RAM forward-ref notebox | +5 lines |
| §1.8 | Add `defnbox [Amortized cost]` | +12 lines |
| §1.8 | Add `warnbox [shrink_to_fit and no auto-shrink]` | +8 lines |
| §1.10 | Optional one-sentence cross-ref to the new shrink_to_fit warnbox | +1 line |
| Other sections | No changes | 0 |

**This is what I think Step 3 should execute.** Push back on any of the verdicts before saying go.
