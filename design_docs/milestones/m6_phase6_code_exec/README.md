# M6 — Phase 6: Code execution

**Maps to:** `interactive_notes_roadmap.md` Phase 6
**Status:** todo
**Depends on:** M3 (state service owns the attempt flow), M4
(`code` questions exist in the bank with `test_cases` in
`reference_json`)
**Unblocks:** —

## Goal

Make `code` question type fully functional: user writes C++ in a
Monaco editor, submits, the state service spawns a subprocess,
runs the test cases, returns per-case pass/fail. The `code` path
of `POST /api/attempts` (which returned 501 in M4) gets its real
implementation here.

## Done when

- [ ] **Monaco editor** integrated as a React island. C++ syntax
      highlighting, basic IntelliSense, "send to editor" action
      from `<CodeBlock>` (architecture.md §1 "Component library"
      promised this) wired up.
- [ ] `POST /api/attempts` for `code` questions runs the full
      flow from architecture.md §3.3:
  1. Fetch `reference_json` for the question.
  2. Write `source` + harness to a temp dir.
  3. `g++ -O0 -std=c++17` with 5s wall timeout (compile once).
  4. For each test case: run binary with stdin, diff stdout
     against expected, 2s wall per case.
  5. Aggregate `{outcome, per_case: [{input, expected, got, pass}]}`.
- [ ] Per-case results render in the UI: green check / red X,
      expected-vs-got diff for fails.
- [ ] `ulimit -v` (or equivalent) guards memory runaway as
      architecture.md §3.3 requires.
- [ ] Temp dir cleaned up per attempt (no leak after 100 runs).
- [ ] `reference_json.solution` is **never** sent to the DOM
      (architecture.md §2 footnote — server-only).
- [ ] Compiler/runtime errors surfaced clearly (a compile fail is
      `outcome='fail'` with the compiler stderr in `per_case[0]`).
- [ ] Code-language decision resolved (architecture.md §5 row 4).
      C++ baseline live; Python pathway either implemented or
      explicitly deferred.

## Tasks

1. Pick a Monaco wrapper for React/Astro (e.g.
   `@monaco-editor/react`). Install, render as an island,
   verify C++ tokenization.
2. Implement the temp-dir + harness writer. Harness reads stdin,
   writes stdout, exits non-zero on assertion failure.
3. Implement the subprocess runner with timeouts (use Node's
   `child_process.spawn` with `timeout` option; verify SIGKILL
   semantics; verify temp dir cleanup in `finally`).
4. Wire `POST /api/attempts` for `code`: dispatch from the M4
   handler stub.
5. Render `per_case` results in the question UI.
6. `ulimit -v` enforcement — wrap the spawn in a small shell
   script or use a `setrlimit`-capable Node binding.
7. Decide C++ only vs C+++Python (architecture.md §5 row 4). If
   Python: add second compile-or-interpret path; if not:
   document the deferral.
8. Add `code` questions to the question-gen workflow's output if
   not already (M4 may have stubbed `code` generation).

## Open decisions resolved here

- **Code language: C++ only vs C+++Python** (architecture.md §5
  row 4). Lean: C++ baseline, Python deferred.

## Out of scope

- **Sandboxing.** Personal machine, per architecture.md §3.3.
  `ulimit -v` is the only guard. No Docker, no firejail, no gVisor.
- **Performance benchmarking.** Pass/fail is the target; nothing
  measures execution time as a grading criterion.
- **Other languages.** Anything beyond C++ (and possibly Python)
  is post-build audit material.
