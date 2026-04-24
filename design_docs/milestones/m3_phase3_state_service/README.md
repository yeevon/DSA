# M3 — Phase 3: State service

**Maps to:** `interactive_notes_roadmap.md` Phase 3
**Status:** todo
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
      tables are populated from `_data/chapters.yml` +
      `src/content/notes/*.mdx` frontmatter (architecture.md §2
      "Seeding"). Idempotent.
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

1. Confirm Path A vs Path B (architecture.md §4) — lean is Path A.
   Document the call in this milestone's README.
2. `npm install drizzle-orm drizzle-kit better-sqlite3`. Set up
   `drizzle.config.ts` + initial migration matching architecture.md
   §2's schema.
3. Implement Astro API routes per architecture.md §3, stubbed
   where downstream-milestone logic is missing. Each stub returns
   `501 Not Implemented` with a clear error shape.
4. Implement seeding (`src/lib/seed.ts`) that reads the content
   collections + chapters.yml at first boot. Idempotent upserts.
5. Implement `detectMode()` at `src/lib/mode.ts` per architecture.md
   §4 listing.
6. Build the **annotations** end-to-end: text selection captures
   `(section_id, offset_start, offset_end, text)`; POST persists;
   GET lists annotations for a section; render in a sidebar pane.
7. Build the **read-status** indicator: a per-section "mark read"
   action that POSTs to a new route (add to architecture.md §3 if
   not present), and a green dot in the chapter nav for marked
   sections.
8. Verify the public deploy (M2) is unaffected: `detectMode()`
   returns `'static'`, all interactive UI hidden, build artifact
   identical.

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
