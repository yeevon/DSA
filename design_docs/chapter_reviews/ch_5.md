# ch_5 Step-1 inventory: Hash Tables

`chapters/ch_5/lectures.tex` — 1554 lines, 62 callout boxes (9 defnbox,
16 examplebox, 21 ideabox, 11 notebox, 7 warnbox).
`chapters/ch_5/notes.tex` — 136 lines, compact reference.

This is a Step-1 inventory only. Step 2 (gap analysis vs CLRS Ch 11
+ OCW lec4) follows separately and will propose a small set of
additions per the project-level scoping rule.

## Structure

9 sections with content (§5.1–§5.9), 1 stub at §5.10. Numbering is
clean — no gaps. Title subtitle: *"Hash Tables"* (omits crypto
hashing despite substantial §5.9 coverage).

| §     | Title                                  | Anchor topics                                                                                              |
|-------|----------------------------------------|------------------------------------------------------------------------------------------------------------|
| 5.1   | Hash Tables: The Big Idea              | Defn, simplest table, collisions, $O(1)$ avg caveat, STL preview, chapter roadmap                          |
| 5.2   | Chaining                               | Defn, full implementation, degenerate-hash-fn warning, contrast with open addressing                       |
| 5.3   | Linear Probing                         | Defn, insert + search code, tombstones (intro), primary clustering ideabox, key takeaways                  |
| 5.4   | Quadratic Probing                      | Defn, insert + triangular-number probing, may-not-visit-every-bucket warn, "nobody uses pure quadratic"    |
| 5.5   | Double Hashing                         | Defn, insert code, powers-of-2-incompatible warn, two-hash-fns-from-one trick, why-not-always-used         |
| 5.6   | Hash Table Resizing                    | Defn, full resize impl, vector amortization parallel, real-world load thresholds                           |
| 5.7   | Common Hash Functions                  | Modulo / mid-square / djb2 implementations, custom-hasher example, hash randomization (security)           |
| 5.8   | Direct Hashing                         | Defn, ASCII-counting impl, "direct hashing is the ceiling", negative-keys warn, perfect-hashing notebox    |
| 5.9   | Hashing for Cryptography               | Cryptographic hash defn, SHA-256 verify, MD5/SHA-1 broken warn, naive-vs-correct password hashing          |
| 5.10  | **STUB**                               | `\section{5.10 \textit{(next section -- ready to scrape)}}` — drop per ch_2/ch_3 precedent                 |

Closing wrap-up: `ideabox [Chapter 5 in retrospect]` + `notebox
[Forward links to later chapters]` (Ch 6 BSTs, opt ch 10 graphs, DP
memoization, std::unordered_map vs std::map, ch_4 LL-as-chaining
callback) — cross-chapter refs **match cs-300's actual structure**,
no fixes needed.

## Stylistic patterns

- Same `lstlisting[language=C++]` style as ch_3/ch_4. 16 examplebox
  blocks, almost all with code.
- Every section opens with a `defnbox`, then mixes other callouts.
  Each section closes with an `ideabox` (key takeaways or contrast).
- Callout density is **lower than ch_3/ch_4**: 62 callouts in 1554
  lines = ~1 per 25 lines (vs ch_4's 1 per 22, ch_3's 1 per 20).
- Smaller chapter overall: **less than half the size of ch_4** (1554
  vs 3367 lines).

## Cross-chapter references — all correct

| Line          | Says                                        | Actual chapter | Status |
|---------------|---------------------------------------------|----------------|--------|
| 64, 188, 1531, 1542 | "Chapter 6 ... BSTs / red-black trees" | ch_6           | ✓ correct |
| 301, 1544 | "from chapter 4" / "Linked lists from ch.~4"   | ch_4           | ✓ correct |
| 1534 | "opt.\ ch.~10" (graph algorithms / visited sets) | ch_10 (extras) | ✓ correct |

No broken cross-refs to fix.

## Flagged items

(a) **§5.10 is a stub** (line 1525): drop per ch_2/ch_3 precedent.
    Step-3 fix.

(b) **Title subtitle omits cryptography**: says *"Hash Tables"* but
    §5.9 (78 lines) covers cryptographic hashing as a substantial
    arc. Either: subtitle → *"Hash Tables and Cryptographic Hashing"*,
    or: leave as-is (cryptographic hashing is framed as a "different
    beast" in `notes.tex`, so calling it out in the subtitle might
    be misleading). **Decision needed in Step 2.**

(c) **Stale companion-materials line** (lines 1550–1552): same
    pattern as other chapters, already deferred to Phase 2 globally.
    No per-chapter fix.

(d) **`notes.tex` is well-aligned** with `lectures.tex` — no
    obvious mirror gaps. The compact-reference table (lines 96–104)
    cleanly summarizes the four collision strategies; the
    HT-vs-BST-vs-sorted-array table (lines 106–117) frames the ch_5
    → ch_6 transition correctly.

(e) **Probability and expected-analysis is asserted, not derived.**
    Chaining cost given as $O(1 + \alpha)$, linear probing as
    $\frac{1}{2}(1 + 1/(1-\alpha))$ — without the simple uniform
    hashing assumption derivation that CLRS Ch 11.2 walks through.
    Possible Step-2 candidate; possible defer.

(f) **No mention of universal hashing** (CLRS Ch 11.3). The
    standard answer to "what if an adversary picks keys to make
    your hash function degenerate" — relevant given §5.7's hash
    randomization notebox already gestures at hash flooding.
    Possible Step-2 candidate.

(g) **No `std::unordered_set`** mention — only
    `std::unordered_map`. Minor: the set/map distinction would
    naturally pair with the Sequence/Set ADT framing just added to
    §4.1 in ch_4 Step 3. One-line addition.

(h) **No Bloom filter / approximate-set-membership mention** —
    standard "where do you go after hash tables" topic. Likely
    out of scope; defer to post-build optional-content audit.

(i) **§5.4 (quadratic probing) doesn't connect "triangular numbers
    cover all slots when capacity is power of 2"** to the §5.5
    "powers of 2 are incompatible with double hashing" warning.
    The chapter discusses both but doesn't bridge them. Minor.

## Headline

ch_5 is **structurally clean**: all cross-refs correct, well-aligned
with `notes.tex`, every algorithm has a worked C++ example. The
single stub at §5.10 is a known drop. Smaller and less dense than
ch_3/ch_4 — leaves room for a focused Step-2 add list (likely 2–3
high-value additions: probably the uniform-hashing analysis and
universal hashing, both from CLRS Ch 11). Cryptographic-hashing
section is unusually deep for an intro chapter; not a gap, but worth
flagging in subtitle decision.
