# T6 — Annotations end-to-end (dogfood)

**Status:** todo
**Depends on:** T2 (schema), T3 (API stubs), T5 (mode flag)
**Blocks:** T8

## Why

Annotations are the **only M3-only feature** ([M3 README](../README.md) Done-when). M4–M7 add their own dynamic surfaces; annotations are a self-contained dogfood that exercises the schema + API + mode-detection plumbing end-to-end before the more complex surfaces (questions, code, FSRS) start riding on top.

The user flow:

1. Reader selects text in a chapter page.
2. A floating "Annotate" button appears next to the selection.
3. Clicking it captures `(section_id, offset_start, offset_end, selected_text)` and POSTs to `/api/annotations`.
4. The page side-pane lists all annotations for the current section, with delete buttons.
5. Reload preserves annotations (rendered on next page load via GET).

[Architecture.md §2](../../../architecture.md) defines the `annotations` table (id, section_id, offset_start, offset_end, text, created_at). [§3 + §4](../../../architecture.md): UI conditionally renders on `mode === 'interactive'` per T5.

## Deliverable

- `src/pages/api/annotations.ts` — full implementation (was a 501 stub from T3).
  - `GET /api/annotations?section_id=…` → returns array of annotations for that section.
  - `POST /api/annotations` → body `{ section_id, offset_start, offset_end, text }`, returns the inserted row.
  - `DELETE /api/annotations/:id` → hard delete; returns 204.
- `src/components/annotations/AnnotateButton.astro` — floating button that appears on text selection. Captures range, computes char offsets within the article container, calls POST.
- `src/components/annotations/AnnotationsPane.astro` — sidebar list (one entry per annotation: snippet + delete X).
- Wire both into `src/pages/lectures/[id].astro` (M2 T5b) — the "main" reading surface gets annotations first; notes/practice can follow if useful.
- Both components carry `data-interactive-only` so they hide cleanly in static mode (per T5).
- Smoke script `scripts/annotations-smoke.mjs` that POSTs an annotation, GETs it back, DELETEs it, GETs again to confirm gone.

## Steps

1. Implement the API route (DB-side):
   - GET: `db.select().from(annotations).where(eq(annotations.section_id, ?))`.
   - POST: validate body, generate id (uuid), insert, return inserted.
   - DELETE: `db.delete(annotations).where(eq(annotations.id, ?))`, return 204.
2. Build `AnnotateButton.astro` (UI-side):
   - Listens for `selectionchange` on the article container.
   - When selection has length > 0 and is contained within the article: position the button near the selection's bounding rect.
   - On click: compute char offsets relative to the article's text content. POST. Clear selection. Trigger refresh of `AnnotationsPane`.
3. Build `AnnotationsPane.astro`:
   - On mount, GET `?section_id=…` for each section currently visible (or for the chapter as a whole — pick the simpler one).
   - Renders a vertical list. Each entry: text snippet (truncated to ~80 chars) + a delete button.
   - Pane sits as a fixed sidebar on the right (mobile: collapsed by default).
4. Wire into `[id].astro` lectures route — `<AnnotationsPane>` always present (hidden by T5's CSS in static mode); `<AnnotateButton>` mounted via the layout.
5. Smoke: `node scripts/annotations-smoke.mjs` runs the full POST → GET → DELETE → GET cycle against the live `/api/annotations` route. Plus manual: `npm run dev`, navigate to `/DSA/lectures/ch_1/`, select text, click button, see annotation in pane, reload, see it persisted, delete it, see it gone.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/pages/api/annotations.ts` implements GET + POST + DELETE; no longer returns 501.
- [ ] `src/components/annotations/{AnnotateButton,AnnotationsPane}.astro` both exist.
- [ ] Both components have `data-interactive-only` attributes (T5 contract).
- [ ] **Auditor runs** `node scripts/annotations-smoke.mjs`:
  - POST returns 201/200 with the inserted row + a generated `id`.
  - GET returns array containing that row.
  - DELETE returns 204.
  - GET (post-delete) returns array NOT containing that row.
- [ ] **Auditor runs** `npm run dev`, opens `/DSA/lectures/ch_1/` in a browser, selects text, clicks Annotate, sees the annotation in the side pane, reloads, confirms persistence, deletes, confirms removal. Cite the manual-test result in the audit issue file (per CLAUDE.md non-inferential — clipboard-style "JS island runs" verification).
- [ ] `/DSA/lectures/ch_1/` in static mode (preview, no `/api/health` reachable) — annotations pane is hidden via `data-interactive-only` (T5 plumbing).

## Notes

- **Decompose trigger.** If text-selection capture + char-offset stability proves harder than expected (e.g., MDX rendering produces nested spans that fragment the offset model), split into:
  - **T6a — API + smoke script** (DB layer + curl-verifiable round-trip)
  - **T6b — UI capture + pane render** (the JS island work)
  Per `tasks/README.md` decompose convention.
- **Char offsets are within the article container's `textContent`.** Document that in the spec body so a re-render produces stable offsets even if the DOM tree shape changes (KaTeX rerender, callout re-mount).
- **No range-spanning-callouts edge case.** First implementation can reject multi-block selections; refine later if it bites.
- **UI/UX nice_to_have trigger watch:** if the side pane needs a real layout (chapter-nav left rail to coexist), that's the trigger to promote the [`nice_to_have.md`](../../../nice_to_have.md) UI/UX entry. Stop and ask the user before promoting; do not unilaterally adopt.
