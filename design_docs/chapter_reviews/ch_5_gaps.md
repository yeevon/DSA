# ch_5 Step-2 gap analysis: Hash Tables

Sources audited: **CLRS Ch 11.2** (Hash tables — chaining + simple
uniform hashing analysis, Theorems 11.1 and 11.2), **CLRS Ch 11.3.3**
(Universal hashing — adversarial defense, $h_{ab}(k) = ((ak+b) \bmod
p) \bmod m$ construction, Theorem 11.3); **MIT OCW 6.006 Spring 2020
lec4** (Hashing — comparison-model lower bound motivation, direct
access array → hashing as range reduction, universal hashing
expectation derivation, full ops table including direct access
array).

Per the project-level scoping rule (`feedback_chapter_review_scope.md`,
reinforced 2026-04-23): **3 high-value additions** proposed.
Everything else CLRS Ch 11 / OCW lec4 covers that ch_5 doesn't is
explicitly deferred to the post-main-build optional-content audit.

ch_5 is structurally clean (62 callouts, all cross-refs correct,
1554 lines — half the size of ch_4). These additions plug specific
analytical gaps and bridge to the ch_4 Sequence/Set framing; they
don't restructure or balloon the chapter.

---

## ADD #1 — §5.2: Simple uniform hashing analysis notebox

**Source:** CLRS Ch 11.2 Theorems 11.1 + 11.2 (chaining cost analysis
under simple uniform hashing).

**What's missing:** §5.2 (Chaining) currently asserts that find takes
$O(1+\alpha)$ expected time without saying *why* — what the
"expected" is over, what assumption makes it true, or how the
derivation goes. The same pattern repeats in §5.3 / §5.4 / §5.5 (cost
formulas given, derivations omitted). Without the **simple uniform
hashing assumption** stated explicitly, "$O(1)$ expected" is a magic
incantation rather than a theorem. CLRS 11.2 derives it in two short
proofs.

**Proposal:** Add one `notebox` near the end of §5.2 (after the
"degenerate-hash-fn" warnbox) titled *"Why $O(1+\alpha)$? The simple
uniform hashing assumption."* Contents:
- State the **simple uniform hashing assumption** (any key equally
  likely to hash to any of the $m$ slots, independent of where other
  keys hashed to).
- One-paragraph sketch of Theorem 11.1: under the assumption, the
  expected length of $T[h(k)]$ is $\alpha$, so unsuccessful search
  takes $\Theta(1+\alpha)$.
- One sentence on Theorem 11.2: successful search is also
  $\Theta(1+\alpha)$ (the proof differs but the result matches).
- Closing line: open-addressing variants in §5.3–§5.5 use the same
  assumption (which is why they all give $O(1)$ expected); their
  per-strategy formulas come from analyzing different probe
  sequences under it.

**Cost estimate:** ~25 lines. Pure analysis content — no code, no
restructuring.

---

## ADD #2 — New §5.7.5 (or §5.7 subsection): Universal hashing

**Source:** CLRS Ch 11.3.3 (Universal hashing) + OCW lec4 (same
treatment, slightly different notation).

**What's missing:** §5.7 (Common Hash Functions) ends with a
`notebox [Hash randomization: security vs. reproducibility]` that
gestures at "Python hash randomization defends against hash flooding
DoS" — but never explains *how* random hash function selection
provides a probabilistic guarantee against adversarial input. The
formal answer is **universal hashing**: a family $\mathcal{H}$ of
hash functions such that for any two distinct keys, the probability
of collision under a randomly chosen $h \in \mathcal{H}$ is at most
$1/m$. The construction $h_{a,b}(k) = ((ak+b) \bmod p) \bmod m$
(prime $p > u$, random $a,b$) is the canonical example, taught in
both CLRS and OCW.

**Proposal:** Add a new subsection at the end of §5.7 titled
*"Universal hashing: the principled defense against adversarial
input"* (or as §5.7.5). Contents:
- `defnbox [Universal hash family]` — formal definition: for all
  distinct $k, l$, $\Pr_{h \in \mathcal{H}}[h(k) = h(l)] \leq 1/m$.
- One paragraph of motivation: any *fixed* hash function has a
  worst-case input that degrades to $\Theta(n)$ chains (the
  adversarial angle behind hash flooding); universal hashing fixes
  this by randomizing the function, not just the seed.
- `examplebox [The $h_{a,b}$ family]` — ~15 lines of C++ implementing
  $h_{a,b}(k) = ((ak+b) \bmod p) \bmod m$ with $a,b$ chosen at
  process start.
- Brief expectation sketch: under universal hashing, expected chain
  length is $\leq 1 + \alpha$ — same bound as simple uniform hashing,
  but now without the assumption (the guarantee is over hash-function
  choice, not over key distribution).
- Closing line: this is what Python's `hash` randomization, Java's
  `String.hashCode` salt, and Rust's `RandomState` are *trying* to
  approximate (full universal-family construction is overkill for
  most production use; salted hash + good function gets you most of
  the benefit).

**Cost estimate:** ~50 lines. The biggest add of the three; justified
because it's a real conceptual hole — "hash randomization" is named
in §5.7 without the underlying theory.

---

## ADD #3 — §5.1: Hash table as Set-ADT implementation

**Source:** OCW 6.006 lec2 + lec4 (Set interface framing). Bridges
to the *Two interface families: Sequence and Set* notebox added to
ch_4 §4.1 in Step 3.

**What's missing:** §5.1 introduces hash tables as "key → bucket
index" without naming what *interface* they implement. ch_4 §4.1 now
has the Sequence-vs-Set framing; ch_5 should pick up the other side
of that frame. Hash tables (and BSTs in ch_6) implement the **Set
ADT** — `find(k)` / `insert(x)` / `delete(k)` keyed by *intrinsic
key*, no positional ops. The chapter currently says this implicitly
through `std::unordered_map` examples but never names it.

**Proposal:** Add one `notebox` early in §5.1 (after the existing
`defnbox [Hash table]` and before the simplest-table example) titled
*"Hash tables implement the Set ADT."* Contents:
- One paragraph reminding the reader of the Sequence/Set distinction
  from ch_4 §4.1 (with explicit $\textsection 4.1$ back-ref).
- One paragraph: hash tables, BSTs (ch_6), and direct-access tables
  (§5.8) are all **Set** implementations — items are looked up by
  *intrinsic key*, not by position.
- One-line C++ note: `std::unordered_set<K>` is the Set version,
  `std::unordered_map<K,V>` is the Set with associated values
  (a "dictionary" — Set without the order operations, per OCW
  terminology).
- Closes with a forward-ref to §5.8 (direct hashing — the "trivial"
  Set implementation when keys are dense small integers).

**Cost estimate:** ~20 lines.

---

## Must-do fixes

**FIX A.** **Drop §5.10 stub** (`\section{5.10 \textit{(next section
-- ready to scrape)}}` at line 1525). Per ch_2 / ch_3 precedent.

**FIX B.** **Title subtitle**: *"Hash Tables"* → *"Hash Tables and
Cryptographic Hashing"*. Per user direction (2026-04-23): §5.9 is
substantial enough to surface in the title.

---

## Explicitly deferred to post-build optional-content audit

The following CLRS Ch 11 / OCW lec4 topics are real gaps in ch_5
relative to the source material, but are deferred per the
"3–5 high-value adds" rule:

| Topic                                                          | Source                  | Why deferred                                                                                |
|----------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------|
| Open-addressing analysis under uniform hashing (Theorem 11.6)  | CLRS 11.4               | The chaining-only ADD #1 covers the conceptual hole; per-strategy proofs are repetition    |
| Perfect hashing (CLRS 11.5)                                    | CLRS 11.5               | §5.8 already has a `notebox [Perfect hashing: the middle ground]`; full construction is deep |
| Hash function: multiplication method ($\lfloor m(kA \bmod 1) \rfloor$) | CLRS 11.3.2     | `notes.tex` mentions it; lectures don't show it; minor — one of three classics              |
| Bloom filters / approximate-set membership                     | (CLRS doesn't cover)    | Standard "what comes next" topic; clearly post-build audit material                         |
| Cuckoo hashing                                                 | (CLRS doesn't cover)    | Modern open-addressing variant; post-build audit                                            |
| Comparison-model lower-bound framing (Ω(log n) motivation)     | OCW lec4                | Belongs in ch_3 (Big-O / sorting lower bound) more than ch_5; defer                         |
| Direct-access-array → hashing pedagogical arc                  | OCW lec4                | cs-300 introduces hashing top-down (§5.1) and treats direct hashing late (§5.8); restructuring is post-build |
| `notes.tex` ops-comparison table extension (add direct-access row) | OCW lec4 table       | Minor; defer                                                                                |

---

## Net delta if approved

- 3 new callouts in lectures.tex: ~+95 lines (~+6%, would land
  ch_5 at ~1650 lines — still smallest chapter in the lectures arc).
- 2 must-do fixes: ~−1 line net (stub drop offsets subtitle change).
- `notes.tex` mirror updates: TBD per user (likely small footnote
  on §5.7 universal hashing addition).

**Total:** ~+95 lines. Mid-sized gap report — bigger than ch_4's
+90 because universal hashing is a substantial new subsection, not
just a callout. Still well within the bounded-additions rule.

Awaiting user approval before drafting Step-3 revisions.
