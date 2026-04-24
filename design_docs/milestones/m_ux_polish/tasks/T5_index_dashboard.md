# T5 — Index page rewrite: mastery-dashboard placeholder

**Status:** todo
**Depends on:** T1 (shell), T2 (chapter-list shape — cards reuse Required/Optional grouping)
**Blocks:** T7 (responsive sweep), T8 (deploy verification)

## Why

Per [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the index page becomes the mastery-dashboard host. Current `src/pages/index.astro` is 62 lines of two-table chapter listing — replace with chapter cards grouped Required / Optional in static mode, plus `data-interactive-only` slots for "recently read" + "due for review" that M5 will fill when the review queue lands.

This is "real entry point rather than chapter-listing table" from the parked nice_to_have.md entry. M-UX ships the placeholder shape; M5 fills the dashboard data.

## Deliverable

- `src/pages/index.astro` rewritten — replaces the current two-table layout with:
  - A short `<h1>` + one-line description ("CS 300 — Data Structures & Algorithms · LaTeX-sourced lecture notes + interactive practice").
  - **`data-interactive-only` dashboard slots** at the top (hidden in static mode):
    - "Recently read" — empty-state placeholder ("No recent activity yet"). Stub renders the empty state; M5 wires the real content.
    - "Due for review" — empty-state placeholder ("Nothing due — start reading or generate questions"). Same stub-now-fill-later pattern.
  - **Chapter cards section** (always visible, both modes):
    - Required group (ch_1–ch_6): grid of cards, each showing chapter number, title, subtitle, "Lectures · Notes · Practice" link triplet, optional completion badge in interactive mode.
    - Optional group (ch_7, ch_9–ch_13): same shape.
  - Footer: existing site footer (license, repo link).
- `src/components/chrome/ChapterCard.astro` (new) — reusable card component. Used by the index page's chapter grid; could later be reused on a "Recently read" populated state.
- `src/components/chrome/DashboardSlot.astro` (new) — empty-state slot wrapper with `data-interactive-only`. Takes a heading + an empty-state message + a slot for M5 content. M5 fills the slot via Astro composition or by rendering a populated component into it.
- The index page renders through the same `Base.astro` shell from T1 — but with a **different layout variant**: no left rail (this IS the chapter list), no right rail (no per-chapter TOC at the index level). Use a Base.astro prop or a sibling layout (`HomeLayout.astro`) — pick one and document.

## Steps

1. Decide: separate `HomeLayout.astro` vs. `Base.astro` with a `variant="home"` prop. Lean: **separate `HomeLayout.astro`** that imports the same chrome primitives but composes them differently (no rails). Keeps `Base.astro`'s logic simple — chapter pages always have rails.
2. Build `ChapterCard.astro`:
   - Props: `{id, n, title, subtitle, required}` from `chapters.json` row.
   - Renders a card with chapter number prominent, title, subtitle, and three small links (Lectures / Notes / Practice). Hrefs are `` `${baseUrl}/lectures/${id}/` ``, `` `${baseUrl}/notes/${id}/` ``, `` `${baseUrl}/practice/${id}/` `` where `const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');` — matches the existing `src/pages/index.astro` convention. **Do not hardcode `/DSA/` in the produced HTML.** (Resolves MUX-BO-ISS-02 / HIGH-2.)
   - `data-interactive-only` slot for an optional completion badge (M5 may surface "X of Y sections read").
3. Build `DashboardSlot.astro`:
   - Props: `{heading, emptyState}` + a default slot.
   - Wraps content in `<section data-interactive-only class="dashboard-slot">` so the whole slot hides in static mode.
   - Default slot contents = empty-state message; M5 renders populated content via Astro slot composition when it lands.
4. Rewrite `src/pages/index.astro`:
   - Read `scripts/chapters.json`, partition Required / Optional, sort by `n`.
   - Render two `DashboardSlot`s at top (recently read, due for review), then two `<section>`s of `ChapterCard` grids (Required, Optional).
   - Use the new `HomeLayout.astro` (or `Base.astro` variant — per Step 1).
5. Smoke (local): `npm run dev`, navigate `/DSA/`. Confirm dashboard slots show empty-state messages (interactive mode) or are hidden entirely (static mode). Chapter cards render in two grouped grids. Each card's three collection links work.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/pages/index.astro` rewritten — no longer the two-table layout. Auditor opens `/DSA/` in `npm run preview` and confirms the new structure: dashboard slots (hidden in static) + Required cards + Optional cards.
- [ ] `src/components/chrome/ChapterCard.astro` and `src/components/chrome/DashboardSlot.astro` both exist.
- [ ] **Static mode** (preview, no `/api/health` reachable) — dashboard slots are hidden via `data-interactive-only`. Auditor cites the DOM observation.
- [ ] **Interactive mode** (`npm run dev` with state service reachable) — dashboard slots show empty-state messages ("No recent activity yet", "Nothing due"). Auditor cites the DOM observation.
- [ ] Chapter cards: 6 in Required group (ch_1–ch_6), 6 in Optional group (ch_7, ch_9–ch_13). Each card has working links to `/DSA/lectures/<id>/`, `/DSA/notes/<id>/`, `/DSA/practice/<id>/`. Auditor clicks one of each.
- [ ] **BASE_URL convention** (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1). Auditor `grep -nE '/DSA/' src/components/chrome/ChapterCard.astro src/pages/index.astro` returns no matches — every chapter / collection link uses `import.meta.env.BASE_URL`. The `-E` is deliberate: a `-F '"/DSA/'` literal-string match would miss template-literal hardcoding like `` `/DSA/lectures/${id}/` `` (no leading double-quote) and single-quoted `'/DSA/...'` paths. View-source on `dist/client/index.html` shows the SSR-resolved `/DSA/...` hrefs (SSR resolution is fine — only source-code hardcoding is the regression).
- [ ] All 37 prerendered pages still build (`npm run build` exit 0). The index page itself prerenders correctly.

## Notes

- **No M5 work in M-UX.** T5 ships the empty-state placeholders. M5 fills the slots when the review queue lands. Don't try to wire FSRS or attempts here — that's M5's scope.
- **`ChapterCard` reuse.** The card component is shaped for both index-page use and possible "recently read" use (M5 may render a list of `ChapterCard`s into the dashboard slot). Keep the props minimal so M5 can pass a subset.
- **No left rail on the index page.** ADR-0002 says index page is the chapter-list dashboard — putting a chapter-list left rail next to a chapter-list main grid is redundant. The mobile drawer (T7) on the index page can either skip the chapter-list entirely or surface it as a quick-jump link.
- **Visual restraint.** Per ADR-0002, M-UX is layout structure only — no color palette decisions, no typography sweep. Cards use the system font, one accent colour for chapter numbers / completion badges.
- **Accessibility.** Each card is a `<article>` with an `<h3>` heading (chapter number + title). Group sections are `<section>` with `<h2>` ("Required" / "Optional") so the page reads as a clear hierarchy.
