# M2 tasks

Each task is a discrete, session-sized unit of work that contributes
to closing out [Phase 2](../README.md) (Jekyll → Astro migration).
Pick any one independently unless its **Depends on** field says
otherwise.

## Index

| ID  | Task                                                              | Status | Depends on    | Est. session size |
|-----|-------------------------------------------------------------------|--------|---------------|-------------------|
| T1  | [Scaffold Astro project](T1_scaffold_astro.md)                    | todo   | —             | < 1 session       |
| T2  | [Build pandoc Lua filter (HYBRID)](T2_lua_filter.md)              | todo   | —             | 1–2 sessions      |
| T3  | [Callout component library](T3_callout_components.md)             | todo   | T1            | 1 focused session |
| T4  | [Pandoc → Astro build pipeline](T4_build_pipeline.md)             | todo   | T1, T2        | 1 focused session |
| T5a | [Chapter-listing index + chapters.json migration](T5a_content_collections.md) | ✅ done 2026-04-23 | T1, T4 | 1 focused session |
| T5b | [Dynamic chapter routes + pandoc → MDX safety bridge](T5b_dynamic_routes.md)  | ✅ done 2026-04-23 | T5a, T2, T3, T4 | 1–2 sessions      |
| T6  | [Replace GitHub Pages workflow](T6_pages_workflow.md)             | todo   | T1, T3, T4, T5b | < 1 session      |
| T7  | [Resolve `phase2_issues.md` items](T7_phase2_issues_cleanup.md)   | todo   | T2 (or T4)    | < 1 session       |
| T8  | [Delete Jekyll scaffolding](T8_delete_jekyll.md)                  | todo   | T6 (one green cycle) | < 1 session |

**T5 decompose note (2026-04-23):** original T5 was split into T5a (data/index, no MDX dependency) and T5b (schema + dynamic routes + pandoc → MDX brace-escape work) when the MDX parser surfaced multiple incompatibilities with pandoc-emitted markdown. Per the original T5 spec's decompose trigger.

## Task ordering note

Two reasonable orderings depending on whether you prefer to sequence
build infrastructure first (safer) or content pipeline first (gets
to a visible result faster):

**Infra-first (recommended):**

1. **T1 (scaffold)** — get the Astro project on disk; verify a hello-world page builds.
2. **T2 (Lua filter)** — pure-script work, no Astro coupling. Can run in parallel with T3.
3. **T3 (components)** — needs T1 only; can run while T2 is in flight.
4. **T4 (pipeline)** — joins T2's filter to T1's project.
5. **T5 (collections + routes)** — wires T4's output into Astro routing.
6. **T6 (workflow)** — flips deploy to Node-based once T5 is rendering.
7. **T7 (phase2_issues cleanup)** — independent; can land any time after T2 or T4 (depends on whether the source touches need filter coverage).
8. **T8 (delete Jekyll)** — only after T6 has been green for one full deploy cycle.

**Content-first (if you want a visible chapter rendered ASAP):**

1. T1 → T2 → T3 in parallel where possible.
2. T4 → T5 → render `ch_1/lectures.tex` end-to-end. Stop and verify before doing the other 11 chapters.
3. T6 → T7 → T8 last.

## Conventions

- Mark a task done by setting `**Status:** done` in its file *and*
  flipping the row in the index above. Do both — the index is the
  thing humans scan.
- If a task grows too big mid-execution, decompose it into a new
  `T{N}a`, `T{N}b` rather than letting one file balloon. T2 is the
  most likely candidate (filter authoring + 12-chapter sweep + version pin).
- If a task gets blocked, change `**Status:**` to `blocked` and add
  a `**Blocked on:**` line explaining why.
- **Code-task verification is non-inferential** (per
  [CLAUDE.md](../../../CLAUDE.md#auditor-conventions)). Every M2 task
  is a code task — build-clean alone is not evidence of correctness.
  Each spec's *Acceptance check* names an explicit smoke test the
  auditor will run; do not skip it.
