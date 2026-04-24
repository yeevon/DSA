---
layout: default
permalink: /practice/ch_2/
---

# Chapter 2 — Practice Prompts

Paste any drill into a fresh Claude session. Shape:
**problem → pseudocode → C++ → critique**. Claude withholds answers until
you submit. See `chapters/ch_1/practice.md` for the standard-wrapper prompt
to prime Claude — reuse it verbatim here.

---

## Drill 1 — Recursion anatomy: factorial and sum

**Problem.** Write recursive C++ functions `int factorial(int n)` and
`int sumTo(int n)` (the cumulative sum $1+2+\ldots+n$). Spec both with
preconditions ($n \geq 0$). In your pseudocode, explicitly mark the base
case and the recursive case. Then: for each, write the equivalent
iterative version and argue which you'd ship and why.

*Skill:* the base-case-plus-smaller-subproblem template, the workhorse
of ch.~4 and ch.~6.

---

## Drill 2 — Reverse a vector recursively

**Problem.** Write `void reverseRec(vector<int>& v, int lo, int hi)` that
reverses `v[lo..hi]` in place recursively (swap ends, recurse on the
middle). Call as `reverseRec(v, 0, v.size()-1)`. What's the base case —
`lo >= hi` or `lo == hi`? Trace on a size-5 and size-6 vector by hand.

*Skill:* two-ends recursion, base-case precision.

---

## Drill 3 — Binary search (recursive and iterative)

**Problem.** Write both versions of binary search on a sorted
`vector<int>`. Return the 0-based index of `target` or `-1` if missing.
In pseudocode, show the loop invariant: ``if `target` is in `v`, it is in
`v[lo..hi]`''. Then argue why the midpoint is `lo + (hi - lo) / 2` and
not `(lo + hi) / 2` (integer overflow trap on large indices).

*Skill:* canonical $O(\log n)$ algorithm; feeds BST search in ch.~6 and
`std::lower_bound` everywhere.

---

## Drill 4 — Fibonacci three ways

**Problem.** Implement Fibonacci (1) na\"ive recursive, (2) memoized, (3)
iterative with two rolling variables. For each, state the time and space
complexity. Then: write a back-of-the-envelope estimate for what $n$
would take 10 seconds on each version, assuming $10^8$ simple ops per
second.

*Skill:* understanding why overlapping subproblems are the entry door to
DP; the same argument powers LCS, knapsack, coin change.

---

## Drill 5 — Greedy coin change: when does it work?

**Problem.** Write `int minCoinsGreedy(int amount, const vector<int>& coins)`
that picks the largest coin first, repeats. Test on two systems: US
`{1, 5, 10, 25}` and adversarial `{1, 3, 4}` with target 6. For the
adversarial case, show the greedy answer and the true optimum, and
explain in one paragraph what structural property US coins have that
`{1, 3, 4}` lacks.

*Skill:* greedy-choice property in action; the key insight for separating
greedy-safe problems from DP-required ones.

---

## Drill 6 — Fractional knapsack (greedy works here)

**Problem.** Given items with `(weight, value)` pairs and a capacity `W`,
fractional knapsack: you may take a fraction of any item. Write the
greedy algorithm (sort by `value / weight` descending, take). Prove, in
pseudocode comments, the exchange argument: if a solution leaves a
high-ratio item partially unused while using a lower-ratio item, you can
swap without losing total value.

*Skill:* greedy with a correctness proof sketch — graders like seeing the
reasoning, not just the code.

---

## Drill 7 — Activity selection

**Problem.** Given `n` activities with `(start, finish)` times, pick the
largest subset of non-overlapping activities. Pseudocode first, then C++.
Choose the greedy criterion (earliest finish time) and justify why
"earliest start" and "shortest duration" both fail — give a 3-activity
counterexample for each.

*Skill:* picking the right greedy criterion is often the whole problem.

---

## Drill 8 — DP: longest common substring (contiguous)

**Problem.** Given two strings `a` and `b`, return the length of the
longest substring that appears in both (contiguous — not subsequence).
Write the 2D recurrence on paper first: `dp[i][j] = (a[i-1]==b[j-1]) ?
dp[i-1][j-1] + 1 : 0`. Then code in C++ with a `vector<vector<int>>`.
Track and return the actual substring, not just its length.

*Skill:* stating the recurrence before the code — this is the step most
people skip and then get lost in index-wrangling.

---

## Drill 9 — DP: coin change (minimum coins)

**Problem.** Given coins `{c1, c2, ..., ck}` (each usable unlimited times)
and target `amount`, return the minimum coin count to make `amount`, or
`-1` if impossible. Pseudocode: what's the state? what's the recurrence?
what are the base cases? Then C++ with a `vector<int> dp(amount+1, INF)`.
Handle the unreachable-amount case.

*Skill:* DP when greedy fails (this is the problem that kills greedy);
template-matching practice for recognizing DP.

---

## Drill 10 — Heuristic: move-to-front on linear search

**Problem.** Start with `vector<int> data` and a function
`int& findAndAccess(int key)`. On each successful find, move the element
to the front. Write pseudocode and C++. Then: argue in one paragraph why
this is a \emph{heuristic} (no worst-case guarantee) but wins on
workloads with temporal locality. Bonus: under what access pattern does
it \emph{hurt}?

*Skill:* heuristics aren't second-rate; they're the right tool when the
worst case doesn't matter. Comes up again in cache design.

---

## Drill 11 — Ethics / privacy case

**Problem.** You're asked to build a feature that logs every search query
a student types in the CS 300 LMS so an advisor can see ``what they're
struggling with.'' Write (no code) a short design memo covering:
(a) the \emph{two levers} — what you'll collect and what you'll release,
(b) one harm scenario and the mitigation you'd propose, (c) what
auxiliary data could re-identify students if the log is leaked, (d) a
proposed retention policy. Keep to one page.

*Skill:* the ethics-prompt muscle. Courses like this ask this shape of
question on every data-adjacent assignment.

---

## Drill 12 — Strategy classification

**Problem.** I will give you five fresh problem statements (assignment
scheduling, shortest path in a weighted graph, path of \emph{any} 3-node
walk in a graph, picking contest problems to maximize score within time,
planning a delivery route with known traffic). For each, classify as
\textbf{Greedy}, \textbf{DP}, \textbf{Divide-and-conquer},
\textbf{Heuristic}, or \textbf{Brute force}, \emph{and} name the
structural test that justifies the choice (greedy-choice property,
optimal substructure, overlapping subproblems, etc.). Mark me wrong if
I pick the right strategy for the wrong reason.

*Skill:* the classification muscle is what you'll use on an exam when the
problem doesn't announce its type.

---

## Meta-drill — Timed pseudocode round

Pick three drills at random. Set a 10-minute timer per drill. Goal:
correct pseudocode (no C++) inside the time. Claude grades which
pseudocodes would translate cleanly versus which would crumble on a
corner case.
