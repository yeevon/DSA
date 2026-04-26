# M-UX tasks

Each task is a discrete, session-sized unit of work that contributes to closing out [M-UX](../README.md) (UI/UX polish — chrome + chapter pane). Pick any one independently unless its **Depends on** field says otherwise.

## Index

| ID  | Task                                                                  | Status | Depends on   | Est. session size |
| --- | --------------------------------------------------------------------- | ------ | ------------ | ----------------- |
| T1  | [Layout shell — three-column grid + responsive scaffold](T1_layout_shell.md) | ✅ done 2026-04-24 | — | 1 focused session |
| T2  | [Left-rail chapter nav + completion indicators](T2_left_rail.md)      | ✅ done 2026-04-24 | T1 | 1 focused session |
| T3  | [Top breadcrumb — collection switcher + prev/next + sticky](T3_breadcrumb.md) | ✅ done 2026-04-24 | T1 | < 1 session |
| T4  | [Right-rail TOC + scroll-spy island + SectionNav refactor](T4_right_rail_toc.md) | ✅ done 2026-04-24 | T1 | 1–2 sessions |
| T5  | [Index page rewrite — mastery-dashboard placeholder](T5_index_dashboard.md) | ✅ done 2026-04-25 | T1, T2 | 1 focused session |
| T6  | [M3 component re-homing — annotations + mark-read](T6_m3_rehome.md)    | ✅ done 2026-04-25 | T4           | 1 focused session |
| T7  | [Mobile drawer + responsive sweep](T7_mobile_drawer.md)                | ✅ done 2026-04-25 | T1, T2, T3, T4, T6 | 1 focused session |
| T8  | [Deploy verification — 37 pages, size budget, no regressions](T8_deploy_verification.md) | ✅ done 2026-04-25 | T7 | < 1 session |
| T9  | [Layout polish + functional-test harness](T9_layout_polish.md) | ✅ done 2026-04-25 | T1–T8 | 1–2 sessions |

## Task ordering note

Critical path: **T1 → T4 → T6 → T7 → T8**.

Three parallel branches after T1:

- **Chrome branch:** T2 (left rail) + T3 (breadcrumb) — both small, run after T1.
- **Content-pane branch:** T4 (right rail + TOC + SectionNav refactor) — biggest unknown; likely candidate to decompose into T4a (SSR TOC + slot) + T4b (scroll-spy island + SectionNav refactor) if it grows.
- **Index branch:** T5 (dashboard placeholder) — depends on T1's shell + T2's chapter list shape (so the cards group consistently).

T6 (M3 re-home) waits for T4 because the annotations pane needs the right rail to exist. T7 (responsive sweep) is the integration step — touches every component to verify the breakpoints; runs after the layout is assembled. T8 is the deploy gate.

## Conventions

- Mark a task done by setting `**Status:** done` in its file *and* flipping the row in the index above. Do both — the index is the thing humans scan. (M2 + M3 lessons learned: status drift across spec/index/README is HIGH-finding meta-audit drift.)
- If a task grows too big mid-execution, decompose into `T{N}a`, `T{N}b`. T4 is the most likely candidate.
- If a task gets blocked, change `**Status:**` to `blocked` and add a `**Blocked on:**` line explaining why.
- **Code-task verification is non-inferential** (per [CLAUDE.md](../../../../CLAUDE.md#auditor-conventions)). Every M-UX task is a code task — build-clean alone is not evidence of correctness. Each spec's *Acceptance check* names an explicit smoke test the auditor will run; do not skip it. For UI-shape tasks, the smoke is "auditor opens `npm run preview` in a browser, navigates the chapter routes, observes the layout matches the ADR-0002 commitments at the named breakpoints, cites a screenshot or DevTools assertion."

## Carry-over from prior milestones

- **M3 `SectionNav` refactor** owned by T4 — the M3 T7 implementation positioned `SectionNav` as a fixed left rail. ADR-0002 commits to a single left rail (chapter list); T4 pulls `SectionNav`'s functionality into the right-rail TOC structure.
- **M3 annotations + mark-read pane re-home** owned by T6 — the M3 T6/T7 components currently render in their original positions; T6 re-homes them into the M-UX chrome slots without changing their APIs.
