---
layout: default
permalink: /practice/ch_1/
---

# Chapter 1 — Practice Prompts

Paste any one of these into a fresh Claude session. Each mimics the shape of
a CS 300 assignment: **problem statement → pseudocode → C++ implementation →
critique**. Claude should make you write the pseudocode *first* and only
reveal its version after yours. **Mastery > length** — if a drill needs to
go long because you're struggling, let it.

The standard wrapper (first paragraph) is the same for every drill; the
problem varies. You can either paste just the drill number's problem, or
paste the whole wrapper + problem if you're starting from a blank session.

---

## Standard wrapper

Include with any drill below if Claude needs priming.

> You are my CS 300 coach. For the problem I give you, I want to practice the
> full course assignment workflow:
>
> 1. I write **pseudocode first** (English-ish, language-agnostic, one step
>    per line).
> 2. You critique the pseudocode: correctness, completeness (edge cases,
>    empty input, single element), clarity. Do **not** give me the answer —
>    point out what's missing and let me fix it.
> 3. When my pseudocode is solid, I write the **C++ implementation** using
>    `std::vector` / `std::string` / `<cctype>` as appropriate (no raw
>    arrays or `char*` unless the problem says so).
> 4. You critique the C++: correctness, idiom (`size_t`, `const&` params,
>    range-for, `<algorithm>`), Big-O, and any undefined behavior.
> 5. You give me 2–3 test cases (including an edge case) and ask me to
>    **trace the code by hand** on one of them. Mark me wrong if I skip
>    the trace and just run it.
>
> Never reveal your pseudocode or code until I've submitted mine. If I ask
> for a hint, give the smallest possible one.

---

## Drill 1 — Running max with index

**Problem.** Given a `vector<int>` of length $\geq 1$, return the value of
the largest element *and* the 0-based index where it first occurs. If the
max appears multiple times, return the smallest index.

*Skill:* single-pass linear scan with two tracked state variables.
*Watch for:* what happens on a size-1 vector; what `max` initializes to.

---

## Drill 2 — Count matching values

**Problem.** Given a `vector<int>` and an `int target`, return how many
elements equal the target. Then generalize: given a lambda
`bool (*pred)(int)`, return how many elements satisfy the predicate.
Compare your hand-rolled version to `std::count_if`.

*Skill:* counter pattern, lifting a concrete loop into a higher-order one.

---

## Drill 3 — Reverse in place

**Problem.** Write `void reverseInPlace(vector<int>& v)` without using
`std::reverse`. Then answer: what's the correct loop bound, and why is it
$n/2$ and not $n$? Trace a size-4 and a size-5 vector by hand.

*Skill:* two-pointer swap; the classic off-by-one trap from section 1.12.

---

## Drill 4 — Append-only histogram

**Problem.** Read integers from stdin until EOF. Build a vector where
`counts[k]` is the number of times value `k` appeared in the input. You
don't know the largest value in advance. When is `resize(n)` the right move?
When is `push_back` after growing by-hand the right move? Write it both
ways and compare.

*Skill:* `resize` vs. `push_back` judgment — the `k` might exceed current
size.

---

## Drill 5 — Parallel vectors → struct

**Problem.** Start with three parallel vectors
`vector<string> names; vector<int> ages; vector<double> gpas;`.
You're told to add a fourth attribute, `major`, and to sort all four
*together* by gpa descending. First do it with the parallel-vector design.
Then refactor to `vector<Student>` and redo the sort. Which version would
you defend in a code review, and why?

*Skill:* spotting when parallel vectors stop scaling; introducing a struct;
`std::sort` with a comparator.

---

## Drill 6 — 2D grid: row vs column sum

**Problem.** Given an $R \times C$ grid as `vector<vector<int>>`, write
two functions: `vector<int> rowSums(const Grid&)` and
`vector<int> colSums(const Grid&)`. Then argue which is cache-friendlier
in C++ and by roughly how much on a $10{,}000 \times 10{,}000$ grid. Write
the *wrong* (column-major) loop order for `rowSums` to make sure you can
recognize it.

*Skill:* nested-loop order + memory layout reasoning. This shows up again
in matrix-heavy DSA problems.

---

## Drill 7 — In-place transform with `<cctype>`

**Problem.** Write `string toSnakeCase(const string& s)` that converts
`"HelloWorldExample"` to `"hello_world_example"`. Spec: uppercase letters
(except the first character) become `_` plus their lowercase; everything
else is copied as-is. Use `<cctype>`. Cast to `unsigned char` before
calling `tolower` / `isupper`.

*Skill:* character classification, building a string incrementally, the
`unsigned char` cast gotcha.

---

## Drill 8 — C-string audit

**Problem.** Read this snippet (I'll give it to you in the session) that
uses `strcpy`, `strcat`, `strcmp`, and fixed-size `char[32]` buffers. For
each line, identify: does it risk a buffer overflow? undefined behavior?
a wrong-direction `strcmp` test? Then rewrite the whole function using
`std::string` and point out which bugs *can't even be expressed* in the
new version.

*Skill:* reading legacy C code, converting to modern C++, understanding
what `std::string` buys you in safety (not just ergonomics).

---

## Drill 9 — Shift elements left by k

**Problem.** Given a `vector<int>& v` and an `int k` with $0 \leq k \leq
\text{size}$, shift every element `k` positions to the left, dropping the
first `k`. The resulting vector should be `size - k` long. Do it without
allocating a new vector. Does it matter which direction you iterate?

*Skill:* in-place shifting, direction-of-loop reasoning (section 1.10).
*Watch for:* what if `k == 0` or `k == size`?

---

## Drill 10 — Read-until-sentinel into vector

**Problem.** Read integers from stdin until a sentinel value `-1` is read
(the `-1` is *not* stored). Return the vector. Then return the running
average printed after each insertion. Is `reserve` helpful here? What about
numerical stability of the running average for a long input?

*Skill:* input-driven growth, running statistics, when `reserve` pays.

---

## Drill 11 — Debug: buggy reverse

**Problem.** Start this drill by asking me to write a *buggy* reverse
myself (don't peek at a clean version first). Then critique mine. If mine
is correct, you show me a version with three bugs (off-by-one, assignment
instead of swap, loop bound twice too large — the section 1.12 bugs) and
ask me to find them by tracing a size-5 vector by hand.

*Skill:* debugging via trace, not via running the code.

---

## Drill 12 — Mixed-skill mini project

**Problem.** Read student records from stdin in the form
`name,age,gpa` (one per line, CSV-ish). Parse into a
`vector<Student>`. Then: (a) sort by gpa descending, (b) filter to just
students with gpa $\geq 3.5$, (c) print the top 3 (or all of them if
fewer than 3). Parsing: use `std::string::find` and `substr`; *don't* use
`strtok` or raw C-strings.

*Skill:* end-to-end mini pipeline — parse, store, transform, output. Closest
in shape to the real assignments. When you can do this unaided, you're done
with ch. 1.

---

## Meta-drill — Timed pseudocode round

Pick any three drills above at random. Set a 10-minute timer per drill.
Your goal: produce *correct* pseudocode (no C++ yet) within the time. At
the end, have Claude grade which of the three pseudocodes would have
translated cleanly to C++ and which would have collapsed on a corner case.
This is the rep that matters most for exams.
