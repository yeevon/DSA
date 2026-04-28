# M-UX-REVIEW tasks

Each task is a discrete, session-sized unit of work that contributes to closing out [M-UX-REVIEW](../README.md) (visual-hierarchy pass on the M-UX chrome, driven by the 2026-04-27 [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) audit). Pick any one independently unless its **Depends on** field says otherwise.

## Index

| ID  | Task                                                                                       | Status | Findings | Depends on | Est. session size |
| --- | ------------------------------------------------------------------------------------------ | ------ | -------- | ---------- | ----------------- |
| T1  | [Home surface — cards, Required label, continue-reading](T1_home_surface.md)               | ✅ done 2026-04-27 | F1, F2, F3 | —        | 1 focused session |
| T2  | [Right-rail TOC hierarchy](T2_right_rail_toc_hierarchy.md)                                 | ✅ done 2026-04-27 | F4         | —        | < 1 session |
| T3  | [Chapter chrome — breadcrumb split, H1 promotion, left-rail trim](T3_chapter_chrome.md)    | ✅ done 2026-04-27 | F5, F6, F8 | —        | 1 focused session |
| T4  | [Mobile chrome reduction + drawer label](T4_mobile_reduction.md)                           | ✅ done 2026-04-27 | F9, F10    | T3 (mobile breadcrumb behaviour follows desktop refactor) | 1 focused session |
| T5  | [Code-block polish — margin, lang tag, copy button](T5_code_block_polish.md)               | ✅ done 2026-04-27 | F7         | —        | < 1 session |
| T6  | [Typography pairing + ADR-0002 amend](T6_typography.md)                                    | ✅ done 2026-04-27 | F11 | —        | < 1 session |

## Task ordering note

Per the review's suggested order of work (review §05), highest user-impact first:

1. **T1** — F1 is the single highest-impact finding ("every visit, every choice"). F2 + F3 are cheap orientation polish that ride on the same surface.
2. **T2** — F4 is the second highest-impact finding ("every chapter page, every scroll").
3. **T3** — F5 unblocks F6 (H1 promotion) and informs T4 (mobile breadcrumb behaviour). F8 is cheap polish that lives on the same component (LeftRail).
4. **T4** — depends on T3 because mobile collapses the same breadcrumb T3 restructures.
5. **T5** — independent code-block polish; can run any time.
6. **T6** — typography pairing; ADR-0002 amend is the gate. Independent of everything else; can run any time.

Three independent branches: **(T1) → (T2) → (T3 → T4)** is the chrome critical path; **T5** and **T6** are parallel and can run any time.

## Conventions

- Mark a task done by setting `**Status:** todo` → `✅ done <date>` in its file *and* flipping the row in the index above *and* the milestone README's task table *and* the `Done when` checkbox in the milestone README that the task satisfies (with citation parenthetical pointing at the per-task issue file). All four flip together (per CLAUDE.md status-surface non-negotiable).
- If a task grows too big mid-execution, decompose into `T{N}a`, `T{N}b`. None of these are obvious split candidates today (all session-sized), but T1 (home surface, three findings) is the most likely if F3's continue-reading island balloons.
- If a task gets blocked, change `**Status:**` to `blocked` and add a `**Blocked on:**` line explaining why.
- **Code-task verification is non-inferential** (per [CLAUDE.md](../../../../CLAUDE.md#auditor-conventions)). Every M-UX-REVIEW task is a code task — build-clean alone is not evidence of correctness. Each spec's *Acceptance check* names an explicit smoke test the auditor will run; do not skip it.
- **Functional-test harness is the gate.** Every task adds at minimum one assertion to `scripts/functional-tests.json` covering its visible contract (the F1 button class, the F4 hierarchy markup, the F5 split structure, the F9 mobile-breadcrumb hide, the F10 drawer-label, the F11 font-family computed style). Build-time + functional-test pass = audit gate.

## Carry-over from prior milestones

None. M-UX closed cleanly (T1–T9) with all carry-over absorbed into T9 + the deep-review file. M-UX-REVIEW inherits the chrome surfaces but not any open audit findings — the 12 findings here are net-new from the 2026-04-27 review pass, not unfinished M-UX work.
