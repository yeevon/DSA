# M3 — Phase 3: State service

**Maps to:** `interactive_notes_roadmap.md` Phase 3
**Status:** todo (8 tasks broken out 2026-04-24 — see [`tasks/`](tasks/))
**Depends on:** M2 (Astro project + content collections must exist)
**Unblocks:** M4 (question generation needs a place to persist
questions), M5 (review loop reads/writes FSRS state), M6 (code
execution attempts persist through this service)

## Goal

Stand up the local state service that owns SQLite, exposes the API
routes architecture.md §3 specifies, and gates the `interactive`
mode flag. After M3, the static site can detect the local service
at bootstrap and conditionally render interactive UI — but the
interactive UI itself is mostly empty placeholders that the next
milestones fill in.

## Done when

- [ ] SQLite schema from architecture.md §2 exists, owned by
      Drizzle, with `drizzle/` migrations checked in.
- [ ] State service runs as Astro API routes under
      `src/pages/api/` (Path A from architecture.md §4 — Astro
      server). Decision confirmed at M3 start.
- [ ] `GET /api/health` returns 200 in local mode.
- [ ] All routes from architecture.md §3 stubbed and returning
      shape-correct responses, even when their downstream
      milestone isn't built yet:
  - `POST /api/attempts` (M4/M5/M6 will fill in eval logic)
  - `GET /api/review/due?before=...&limit=...` (M5)
  - `POST /api/questions/bulk` (M4)
  - `PATCH /api/fsrs_state/:question_id` (M5)
- [ ] Seeding works: on first boot, `chapters` and `sections`
      tables are populated from `scripts/chapters.json` (post-M2 T5a
      migration; was `_data/chapters.yml` pre-M2) and
      `src/content/lectures/*.mdx` frontmatter (post-M2 amendment
      to architecture.md §2 — was `notes/*.mdx`, now `lectures/*.mdx`
      because lectures owns the section structure). Idempotent.
- [ ] `detectMode()` from architecture.md §4 implemented and
      wired to the page bootstrap; `interactive` UI elements
      (placeholders) only render when both adapter and state
      service are reachable.
- [ ] **Annotations** UI surface works end-to-end (it's the only
      M3-only feature — text selection → POST → list view). This
      is the dogfood test for the schema + API.
- [ ] **Read-status** tracking works: marking a section read
      writes to `read_status`; an indicator renders in the chapter
      nav.

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                              | Status |
|-----|-------------------------------------------------------------------|--------|
| T1  | [Hosting decision: Astro server vs client SQLite](tasks/T1_hosting_decision.md) | todo |
| T2  | [Drizzle schema + initial migration](tasks/T2_drizzle_schema.md)  | todo   |
| T3  | [Astro API route stubs](tasks/T3_api_routes.md)                   | todo   |
| T4  | [Seeding: chapters + sections from MDX](tasks/T4_seeding.md)      | todo   |
| T5  | [`detectMode()` + bootstrap mode flag](tasks/T5_mode_detection.md) | todo  |
| T6  | [Annotations end-to-end (dogfood)](tasks/T6_annotations.md)       | todo   |
| T7  | [Read-status: mark-read indicator](tasks/T7_read_status.md)       | todo   |
| T8  | [Verify M2 public deploy unaffected](tasks/T8_deploy_verification.md) | todo |

See [`tasks/README.md`](tasks/README.md) for ordering guidance, the
critical path (T1 → T2 → T4 → T6 → T8), and status conventions.
Mirror status changes between the per-task file and the table above.

## Open decisions resolved here

- **State service hosting** (architecture.md §5 row 2). Pick Path
  A (Astro server) or Path B (client-side SQLite WASM). Lean: A.
  Document the rationale.

## Out of scope

- **Question generation.** No FastMCP adapter, no ai-workflows
  integration. M4.
- **Answer evaluation logic.** `POST /api/attempts` is stubbed —
  the per-type dispatch from architecture.md §3.2 lands in M4
  (mc, short), M5 (llm_graded), M6 (code).
- **FSRS scheduler.** `PATCH /api/fsrs_state/:question_id`
  accepts and persists the payload, but no scheduling library is
  wired. M5.
- **Code execution subprocess.** M6.
