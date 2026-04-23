# ch_4 Step-2 gap analysis: Lists, Stacks, Queues, Deques

Sources audited: **CLRS Ch 10.1** (Stacks and queues, array
implementations) and **Ch 10.2** (Linked lists, sentinels);
**MIT OCW 6.006 Spring 2020 lec2** (Data Structures: Sequence
interface, Set interface, Array Sequence, Linked List Sequence,
Dynamic Array Sequence, Amortized Analysis).

Per the project-level scoping rule (`feedback_chapter_review_scope.md`):
3 high-value additions proposed. Everything else CLRS Ch 10 / OCW lec2
covers that ch_4 doesn't is explicitly deferred to the post-main-build
optional-content audit, not added now.

ch_4 is already the cleanest chapter in the repo (148 callouts, all
cross-refs correct, no stubs). These additions plug specific concrete
gaps; they don't restructure or expand depth broadly.

---

## ADD #1 — §4.1: Sequence ADT vs Set ADT framing notebox

**Source:** OCW lec2 (Data Structures), specifically the "two main
interfaces: Sequence and Set" framing.

**What's missing:** §4.1 currently introduces "List ADT" and notes
that stacks and queues are "restricted lists." OCW lec2 generalizes
this one level: the abstract distinction is **Sequence interface**
(extrinsic order — items at positions $i = 0, 1, \ldots, n-1$) vs
**Set interface** (intrinsic order by key). Lists, stacks, queues,
deques are all special-case Sequence interfaces; ch_5 (hash tables)
and ch_6 (BSTs) implement the Set interface. Naming this distinction
explicitly in §4.1 frames the entire ch_4 → ch_5 → ch_6 arc.

**Proposal:** Add one `notebox` early in §4.1 (before "List is the
root ADT" subsection) titled *"Two interface families: Sequence
and Set."* Two short paragraphs + one comparison table (Sequence
ops: `get_at(i)`, `insert_at(i,x)`, `insert_first/last`, etc.; Set
ops: `find(k)`, `insert(x)`, `delete(k)`, etc.). Closes with: "ch_4
covers Sequence implementations; ch_5–ch_6 cover Set implementations."

**Cost estimate:** ~25 lines. Pure framing — doesn't change any
existing content.

---

## ADD #2 — §4.16 (or new §4.16.5): Ring-buffer / circular-array queue

**Source:** CLRS Ch 10.1 (Queues, Figure 10.2 + ENQUEUE/DEQUEUE
pseudocode with wrap-around).

**What's missing:** §4.15 mentions "use a ring buffer" for an
array-backed queue, and §4.16 implements a queue on a singly linked
list with head + tail. But the ring-buffer / circular-array queue —
the canonical CLRS implementation, the thing `std::queue` defaults to
under the hood (via `std::deque`), and the structure used in OS
kernels for bounded producer-consumer queues — is **never actually
shown**. ch_4 names it and walks past it.

**Proposal:** Add either (a) a `defnbox` + `examplebox` block
inside §4.16 right after the SLL-queue implementation, titled
*"Array-backed queue: the ring buffer,"* OR (b) a small new
subsection at the end of §4.16. Contents:
- Ring-buffer mental model: array of fixed capacity $n$,
  `head` and `tail` indices that wrap modulo $n$.
- C++ implementation (~25 lines) of `enqueue` and `dequeue` with
  the modular arithmetic.
- The full-vs-empty disambiguation (CLRS uses "head == tail" for
  empty and a `length` counter; alternative is to leave one slot
  unused so `(tail+1) % n == head` means full).
- One-line note: this is what bounded producer-consumer queues
  use, and what `std::queue`'s default `std::deque` backing is
  doing block-wise.

**Cost estimate:** ~40 lines. Lands the concept that §4.15/§4.16
already gesture at without showing.

---

## ADD #3 — §4.7 (or §4.11): `std::list::splice` examplebox

**Source:** Modern C++ idiom; not in CLRS or OCW pseudocode. Justified
by ch_4's heavy C++ orientation and the existing
`\texttt{std::list::insert}` examplebox at line 1412.

**What's missing:** ch_4 motivates the DLL throughout §4.6–§4.8 with
"O(1) splice given a pointer." `std::list::splice` is the production-C++
operation that exposes that capability — moving a range of nodes
between two lists (or within one list) in O(1) without copying or
allocating. It's *the* answer to "why would you ever use `std::list`
in modern C++ given that vectors usually win?" cs-300 has a
`warnbox [Linked lists rarely win in modern C++]` at line 836 but
doesn't cite the one operation where they actually do.

**Proposal:** Add one `examplebox` titled *"`std::list::splice`:
the operation only a linked list can do in O(1)."* Contents: a
~10-line C++ snippet showing two `std::list<int>` instances and a
splice call moving a range from one to the other; one-paragraph
explanation that this is O(1) regardless of range size (it just
relinks the boundary pointers); one-line note that vectors cannot
do this without copying $O(k)$ elements.

**Best location:** §4.11 (Sentinel/Dummy Nodes), since splice is
inherently a sentinel-friendly operation and §4.11 already discusses
the circular-sentinel layout that makes splice clean in `std::list`.
Alternative: §4.7 right after the existing `std::list::insert`
examplebox.

**Cost estimate:** ~20 lines.

---

## Must-do fixes (not "additions" — minor cleanups)

These are tiny, no decision needed:

**FIX A.** §4.0 title subtitle: *"Lists, Stacks, and Queues"* →
*"Lists, Stacks, Queues, and Deques"* (since §4.17 covers deques).

**FIX B.** §4.10 (Sorting Linked Lists), opening prose: add a
back-reference to §3.15 where insertion sort was first introduced
on arrays. One sentence: "Insertion sort was first analyzed on
arrays in §3.15 — here we adapt it to a linked-list traversal."

**FIX C.** `chapters/ch_4/notes.tex` decision matrix (lines 95–107):
the array `append` row shows `$1^*$` with no footnote. Add a one-line
footnote: *"$^*$Amortized — see §4.18 doubling."*

---

## Explicitly deferred to post-build optional-content audit

The following CLRS Ch 10 / OCW lec2 topics are real gaps in ch_4
relative to the source material, but are deferred per the
"3–5 high-value adds" rule:

| Topic                                                          | Source                  | Why deferred                                                                                |
|----------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------|
| `unique_ptr`-based linked lists (modern C++ ownership)         | (cs-300 idiom)          | Real modern-C++ gap, but consistent with ch_1's "C++ refresher" leaving ownership light     |
| Tail-call optimization in §4.12 recursive LL ops              | (compiler theory)       | Useful note but borderline-out-of-scope for an intro DSA chapter                            |
| Formal sentinel `L:nil` convention (CLRS Ch 10.2 style)        | CLRS 10.2 sentinels     | cs-300's §4.11 covers sentinels concretely already; CLRS-style is restatement, not addition |
| "Implement a queue with two stacks" / "stack with two queues"  | CLRS exer 10.1-6/-7     | Classic interview puzzle, not load-bearing; great post-build add                            |
| Block-based deque internals (`std::deque`'s actual layout)     | (STL impl detail)       | §4.17 already gestures at it; full treatment is implementation trivia                       |
| Set ADT operation table (`find_min`/`find_max`/`find_next/prev`) | OCW lec2 Set Interface | Fits in ch_5 / ch_6 better than ch_4                                                        |
| Dynamic-array deletion: shrink at $r < r_d$ resize policy      | OCW lec2 + CLRS 17.4    | ch_3 §3.6 already touches this; full $1+\varepsilon$ derivation is post-build               |

---

## Net delta if approved

- 3 new callouts in lectures.tex: ~+85 lines (~+2.6%, would land
  ch_4 at ~3320 lines, smaller than ch_3 at 3437).
- 3 must-do fixes: ~+5 lines net.
- `notes.tex` footnote: ~+2 lines.

**Total:** ~+90 lines, no removals. Smallest-delta gap report so far —
matches the inventory's "ch_4 is the cleanest chapter" headline.

Awaiting user approval before drafting Step-3 revisions.
