# T7 — Read-status: mark-read indicator

**Status:** todo
**Depends on:** T2 (schema), T3 (API stubs), T5 (mode flag)
**Blocks:** T8

## Why

Per [M3 README](../README.md) Done-when: per-section "mark read" action that writes to the `read_status` table; an indicator (green dot) renders in the chapter nav for marked sections.

Simpler than T6 (annotations) — no text selection, no offset model. Just a button per section + a sidebar nav that reflects state.

[Architecture.md §2](../../../architecture.md) `read_status` table: one row per section, keyed by `section_id`, with `read_at` timestamp.

## Deliverable

- `src/pages/api/read_status.ts` — full implementation (was a 501 stub from T3).
  - `POST /api/read_status` → body `{ section_id }`, upserts a row with current timestamp, returns 204.
  - `DELETE /api/read_status/:section_id` → removes the row (un-mark), returns 204.
  - `GET /api/read_status?chapter_id=…` → returns `{ section_ids: [...] }` for all marked sections in that chapter (used to populate the indicator state on page load).
- `src/components/read_status/MarkReadButton.astro` — small button rendered next to each section heading. State: empty circle (unread) or green dot (read). Clicking toggles.
- `src/components/read_status/SectionNav.astro` — chapter-side TOC list (uses the `sections` frontmatter from each lecture MDX, M2 T4 + M3 T4). Each entry shows a green dot for read sections.
- Both wired into `src/pages/lectures/[id].astro`.
- Both carry `data-interactive-only` per T5.

## Steps

1. Implement `src/pages/api/read_status.ts`:
   - POST: `db.insert(read_status).values({ section_id, read_at: Date.now() }).onConflictDoUpdate({ target: section_id, set: { read_at: Date.now() } })`. Return 204.
   - DELETE: `db.delete(read_status).where(eq(read_status.section_id, ?))`. Return 204.
   - GET: `db.select({ section_id: read_status.section_id }).from(read_status).innerJoin(sections, eq(...)).where(eq(sections.chapter_id, ?))`. Return array.
2. Build `MarkReadButton.astro`:
   - Receives `section_id` as prop.
   - On mount, reads from a chapter-level "marked sections" cache (populated by `SectionNav` via the GET above) — or makes its own GET if simpler.
   - Click handler: POST to mark, DELETE to un-mark, toggle visual state.
3. Build `SectionNav.astro`:
   - Receives the chapter's `sections` array from frontmatter.
   - On mount, GET `/api/read_status?chapter_id=…` once.
   - Renders the section list as a vertical nav with a colored dot per section (green if marked, grey otherwise).
4. Wire into `[id].astro`. Place `MarkReadButton` next to each section header (the M2 T4 / T5b filter emits `<a id="ch_N-section-slug">` anchors — buttons render adjacent to those).
5. Smoke: `scripts/read-status-smoke.mjs` POSTs three sections marked, GETs them, DELETEs one, GETs again to confirm only two remain.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/pages/api/read_status.ts` implements GET + POST + DELETE; no 501.
- [ ] `MarkReadButton.astro` + `SectionNav.astro` exist; both have `data-interactive-only`.
- [ ] **Auditor runs** `node scripts/read-status-smoke.mjs`:
  - POST 3 distinct `section_id`s; each returns 204.
  - GET `?chapter_id=ch_1` returns array of all 3.
  - DELETE one of them returns 204.
  - GET returns array of 2.
- [ ] **Auditor runs** `npm run dev`, opens `/DSA/lectures/ch_1/`, clicks "mark read" on a section header, observes the green dot appear in the side nav and on the button. Reloads, confirms persistence. Clicks again to un-mark, confirms removal.
- [ ] Static-mode preview: nav + buttons hidden via `data-interactive-only`.

## Notes

- **Idempotent POST.** ON CONFLICT DO UPDATE refreshes `read_at` if the user re-marks a section — useful for "when did I last visit this" telemetry, no schema additions needed.
- **GET caching.** `SectionNav` GET runs once per page load; `MarkReadButton`s read from a small client-side cache the nav populates. Avoids one GET per section per page load (would be 80+ on ch_1).
- The `sections` join in GET uses the schema FK `read_status.section_id → sections.id`; confirm Drizzle's `innerJoin` syntax matches your version.
- This is one of the surfaces the [`nice_to_have.md`](../../../nice_to_have.md) UI/UX entry mentioned ("completion checkmark per item"). Same trigger watch as T6 — if the side nav needs a real layout chrome, stop and ask before promoting the UX work.
