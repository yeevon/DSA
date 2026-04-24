# M1 tasks

Each task is a discrete, session-sized unit of work that contributes
to closing out [Phase 1](../README.md). Pick any one independently
unless its **Depends on** field says otherwise.

## Index

| ID  | Task                                                    | Status | Depends on    | Est. session size |
|-----|---------------------------------------------------------|--------|---------------|-------------------|
| T1  | [Write Phase 1 acceptance criteria](T1_acceptance_criteria.md) | ✅ done (1 user-action open) | — | 1 focused session |
| T2  | [Pandoc probe on `chapters/ch_1/lectures.tex`](T2_pandoc_probe.md) | ✅ done | — | 1 focused session |
| T3  | [Add LICENSE files](T3_license_files.md)                | ✅ done | — | < 1 session       |
| T4  | [Update README status callout](T4_readme_status_sweep.md) | ✅ done | T3 | < 1 session |
| T5  | [PDF build sanity sweep across all 12 chapters](T5_pdf_sanity_sweep.md) | ✅ done (1 deferred to post-build audit) | — | 1 focused session |

## Task ordering note

Nothing strictly enforces an order — but a sensible default:

1. **T2 (pandoc probe)** first if you have time, since its verdict
   shapes M2's task design and you want it landing before drafting
   M2 work in detail.
2. **T1 (acceptance criteria)** second; it benefits from the probe
   verdict but doesn't strictly need it.
3. **T3 (LICENSE) → T4 (README sweep)** next as a back-to-back pair
   — T4 wants to link to T3's files anyway.
4. **T5 (build sweep)** last; it's the safety check before declaring
   M1 done. Run on a clean checkout.

## Conventions

- Mark a task done by setting `**Status:** done` in its file *and*
  flipping the row in the index above. Do both — the index is the
  thing humans scan.
- If a task grows too big mid-execution, decompose it into a new
  `T{N}a`, `T{N}b` rather than letting one file balloon.
- If a task gets blocked, change `**Status:**` to `blocked` and add
  a `**Blocked on:**` line explaining why.
