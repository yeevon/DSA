# Milestones

One directory per roadmap phase. Each milestone has its own `README.md`
that names its goal, exit criteria, tasks, the architectural
decisions it must resolve, and what it explicitly defers.

The roadmap that drives the phasing lives in Google Drive
(`interactive_notes_roadmap.md`, file id
`1SJHI76hibJ6aJqvtMuJbE1dhzVLZlWcOpitofrziWC8`). The architecture
that constrains how each phase ships lives in
[`../architecture.md`](../architecture.md). These milestone READMEs
are the *operational* layer — what to do next, in what order, with
what definition of done.

## Index

| #     | Milestone                                                            | Status                | Blocks               |
| ----- | -------------------------------------------------------------------- | --------------------- | -------------------- |
| M1    | [Phase 1 close-out](m1_phase1_closeout/README.md)                    | ✅ closed 2026-04-23 | M2 (now unblocked)   |
| M2    | [Phase 2 — Astro migration](m2_phase2_astro/README.md)              | ✅ closed 2026-04-23 | M3 (now active), M7  |
| M3    | [Phase 3 — State service](m3_phase3_state_service/README.md)        | ✅ closed 2026-04-24 | M4, M5, M6           |
| M4    | [Phase 4 — Question generation](m4_phase4_question_gen/README.md)   | todo — re-blocked 2026-04-25 (M16 follow-up: convention-hooks doc + dispatch cleanup, see [`../../aiw_workflow_convention_hooks_issue.md`](../../aiw_workflow_convention_hooks_issue.md)) | M5 |
| M5    | [Phase 5 — Review loop (FSRS)](m5_phase5_review_loop/README.md)     | todo                  | —                    |
| M6    | [Phase 6 — Code execution](m6_phase6_code_exec/README.md)           | todo                  | —                    |
| M7    | [Phase 7 — Audio narration](m7_phase7_audio/README.md)              | todo                  | —                    |
| M-UX  | [UX polish — chrome + chapter pane](m_ux_polish/README.md)          | ✅ closed 2026-04-25 (re-closed after T9 polish) | —          |

The dependency graph is mostly linear: M1 → M2 → M3 fan-outs to M4
→ M5 (M5 needs question persistence + a review queue) and to M6
(code execution is a question type). M7 runs whenever post-M2
because audio is static assets, not server-side. **M-UX** is a
sidecar (not in the original `interactive_notes_roadmap.md` phasing)
— promoted from `nice_to_have.md` 2026-04-24 after M3 closed and
the M3 client surfaces (annotations, read-status, section nav)
needed a deliberate place to live. See [ADR-0002](../adr/0002_ux_layer_mdn_three_column.md).
Runs in parallel with M4's upstream gate.

## Parallel non-milestone tracks

- **Post-build content audit** — augmenting optional chapters
  (ch_7, ch_9–13) and adding deferred topics from the per-chapter
  gap reports (universal hashing proofs, Bloom filters, treap, etc).
  Per `feedback_chapter_review_scope.md`, this happens **after** the
  main app build (i.e., after M5/M6) and is not on any milestone's
  critical path.

## Conventions

- A milestone README is **operational**, not architectural. If a
  decision needs design rationale, add it to `architecture.md` and
  link from the milestone README.
- "Done when" bullets must be **verifiable**. No "well-tested" or
  "production-quality" — say what you would check.
- Each task should be small enough to land in one focused session.
  If it isn't, decompose first.
- Update the status column in this index when a milestone moves
  (`todo` → `active` → `blocked` / `done`). Don't let the index
  drift from the milestone READMEs.
