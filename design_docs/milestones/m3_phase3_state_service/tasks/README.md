# M3 tasks

Each task is a discrete, session-sized unit of work that contributes
to closing out [Phase 3](../README.md) (state service). Pick any one
independently unless its **Depends on** field says otherwise.

## Index

| ID  | Task                                                         | Status | Depends on   | Est. session size |
|-----|--------------------------------------------------------------|--------|--------------|-------------------|
| T1  | [Hosting decision: Astro server vs client SQLite](T1_hosting_decision.md) | todo | — | < 1 session |
| T2  | [Drizzle schema + initial migration](T2_drizzle_schema.md)   | todo   | T1           | 1 focused session |
| T3  | [Astro API route stubs (architecture.md §3)](T3_api_routes.md) | todo | T1           | 1 focused session |
| T4  | [Seeding: chapters + sections from MDX](T4_seeding.md)       | todo   | T2           | < 1 session       |
| T5  | [`detectMode()` + bootstrap mode flag](T5_mode_detection.md) | todo   | T1           | < 1 session       |
| T6  | [Annotations end-to-end (dogfood)](T6_annotations.md)        | todo   | T2, T3, T5   | 1–2 sessions      |
| T7  | [Read-status: mark-read indicator](T7_read_status.md)        | todo   | T2, T3, T5   | 1 focused session |
| T8  | [Verify M2 public deploy unaffected](T8_deploy_verification.md) | todo | T6, T7       | < 1 session       |

## Task ordering note

Critical path: **T1 → T2 → T4 → T6 → T8**.

Two parallel branches after T1:

- **Data branch:** T2 (schema) → T4 (seed) feeds T6 + T7.
- **API + UI plumbing branch:** T3 (route stubs) + T5 (mode detection) — both small, run in parallel after T1.

T6 (annotations) is the biggest unknown — text-selection capture, char-offset stability across page rerenders, restoring selection on reload. If T6 grows past one session, decompose into T6a (capture + persist) and T6b (render + restore). T7 is mechanically simpler.

T8 is the safety check: M2's public deploy should be byte-identical for users without the state service running. `detectMode()` returning `'static'` and all interactive UI conditionally hidden is the contract; T8 verifies the deployed `dist/` doesn't bundle interactive-only code paths.

## Conventions

- Mark a task done by setting `**Status:** done` in its file *and*
  flipping the row in the index above. Do both — the index is the
  thing humans scan. (M2 lessons learned: status drift across
  spec/index/README is HIGH-finding meta-audit drift.)
- If a task grows too big mid-execution, decompose into `T{N}a`,
  `T{N}b`. T6 is the most likely candidate.
- If a task gets blocked, change `**Status:**` to `blocked` and add
  a `**Blocked on:**` line explaining why.
- **Code-task verification is non-inferential** (per
  [CLAUDE.md](../../../../CLAUDE.md#auditor-conventions)). Every M3
  task is a code task — build-clean alone is not evidence of
  correctness. Each spec's *Acceptance check* names an explicit
  smoke test the auditor will run; do not skip it.

## Carry-over from M2

- **UI/UX layer** (Canvas-style left-nav + structured chapter pane)
  parked in [`../../nice_to_have.md`](../../nice_to_have.md). T6
  (annotations sidebar) and T7 (mark-read indicator in chapter nav)
  may surface chrome decisions that justify promoting the UI work
  out of `nice_to_have.md` per the rules there. If that trigger
  fires during M3, **stop** and surface to the user — do not
  drive-by adopt the UX work.
