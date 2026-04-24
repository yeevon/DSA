# T4 — Right-rail TOC + scroll-spy island + SectionNav refactor

**Status:** todo
**Depends on:** T1 (shell + `right-rail` slot)
**Blocks:** T6 (annotations re-home), T7 (responsive sweep), T8 (deploy verification)

## Why

Per [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the right rail hosts the in-chapter section TOC + (in interactive mode) the annotations pane. The TOC is SSR-rendered from MDX frontmatter — the `sections` array T4 of M3 already populates. A scroll-spy JS island highlights the current section as the user scrolls.

This task also handles the **M3 `SectionNav` refactor** flagged in ADR-0002: M3's T7 implementation positioned `SectionNav` as a fixed left rail. M-UX commits to a single left rail (chapter list per T2). T4 pulls `SectionNav`'s functionality into the right-rail TOC structure and removes the old left-rail position.

Likely candidate for decomposition into T4a (SSR TOC + slot wiring) + T4b (scroll-spy island + SectionNav refactor) per `tasks/README.md`.

## Deliverable

- `src/components/chrome/RightRailTOC.astro` — SSR component. Reads the chapter MDX's `sections` frontmatter (the array M3 T4 emits with `{id, anchor, title}` per section). Renders `<nav aria-label="In-chapter sections">` with a `<ul>` of section anchor links.
- `src/components/chrome/ScrollSpy.astro` — JS island layered on the SSR TOC. On mount, sets up an `IntersectionObserver` for each section's anchor element. Toggles a `data-current="true"` attribute on the matching TOC link as sections scroll into view. `data-interactive-only` (the SSR TOC works without it; this is enhancement only).
- **M3 `SectionNav` refactor:** existing `src/components/read_status/SectionNav.astro` (positioned as fixed left rail) is removed or repurposed. Its read-status indicator functionality folds into the new RightRailTOC — each TOC entry gets a `data-section-id` attribute and the existing M3 read-status fetch logic gets re-pointed at the TOC entries instead of a separate left-rail list.
- Wire `RightRailTOC` + `ScrollSpy` into the `Base.astro` `right-rail` slot from T1. Lectures route only initially (notes/practice may not need a TOC — short pages).

## Steps

1. Audit the existing M3 `SectionNav.astro` — list its props, fetch logic, and read-status indicator behaviour. Catalogue what survives the refactor.
2. Build `RightRailTOC.astro`:
   - Astro frontmatter reads `Astro.props.sections` (the MDX-derived array; `[id].astro` passes it through).
   - Renders `<nav class="toc"><ul>` with one `<li><a href="#anchor" data-section-id="...">Title</a></li>` per section.
   - Per-entry read-status indicator slot (a `<span data-read-indicator data-section-id="..."></span>` inside each `<li>`) — populated by an inline read-status JS island, not by `ScrollSpy`. The indicator carries `data-interactive-only`.
3. Build `ScrollSpy.astro`:
   - JS island, `client:visible`.
   - On mount, query `[id]` headings inside the article container that match TOC entries.
   - `IntersectionObserver` with a rootMargin tuned so a section is "current" when its heading is in roughly the upper third of the viewport.
   - On change, update `[data-current]` on the corresponding TOC link.
4. Re-point read-status indicators (M3 functionality):
   - Remove the standalone fixed-left `SectionNav.astro` from the lectures route.
   - The TOC's per-entry `[data-read-indicator]` spans get the same fetch logic SectionNav used (GET `/api/read_status?chapter_id=...`, mark indicators for sections in the response). Inline JS island, `client:visible`, `data-interactive-only`.
   - **Indicator marked-state contract (pinned per MUX-BO-DA-2).** When a section is marked read, the indicator span gets `data-read="true"`; when un-marked, the attribute is set to `"false"` (or removed). Matches M3's prior `.dot[data-read="true"]` convention so Step 5 Option (a) has a deterministic selector to bind to: `[data-read-indicator][data-read="true"]`. Don't invent a new attribute name (`data-marked`, etc.) without updating Step 5 in the same PR.
   - **Refresh listener (pinned per MUX-BO-DA-3).** The same JS island that does the initial GET also registers `window.addEventListener('cs300:read-status-changed', …)` — this is the same event `MarkReadButton` already fires on toggle (`MarkReadButton.astro` line 111: `dispatchEvent(new CustomEvent('cs300:read-status-changed'))`, **no `detail` payload**). M3's `SectionNav.astro` line 88 has this listener today; transferring the fetch logic without the listener silently drops cross-component refresh (TOC indicator goes stale until reload after the user marks a section). Listener handler: re-run the GET fetch and update each indicator's `data-read` attribute. (Don't try to read `event.detail` — there isn't one. If T4 wants to optimize away the second fetch, that's a separate change to `MarkReadButton`'s dispatch + an M3 contract edit — out of scope for the listener fix.)
5. **Re-point `MarkReadButton.refreshMarked()` at the new TOC's read indicators** (resolves MUX-BO-ISS-01 / HIGH-1). M3's `src/components/read_status/MarkReadButton.astro` lines 48–56 currently scrapes the read state from `#section-nav .dot[data-read="true"]` — an undocumented DOM contract with the soon-to-be-removed `SectionNav.astro`. Once T4 deletes/re-homes `SectionNav`, that selector resolves to nothing and `markedSet` stays empty until the user clicks the button — the visible "Mark / Unmark" toggle state is silently wrong. Pick one of:
   - **(a) Re-point at the new TOC** — change the selector in `refreshMarked()` to `[data-read-indicator][data-read="true"]` (the contract pinned in Step 4 per MUX-BO-DA-2). The indicator population island writes `data-read="true"` on marked sections; this selector reads the same attribute. No "pick whatever attribute" — Step 4 owns the contract.
   - **(b) Direct fetch fallback** — change `refreshMarked()` to issue a single `GET /api/read_status?chapter_id=<currentChapter>` on mount and populate `markedSet` from the response. Removes the cross-component DOM dependency entirely.
   - Pick one and document the pick in the T4 issue file. Either way, the existing `cs300:read-status-changed` CustomEvent listener on the new TOC stays wired so cross-component refresh still works.
6. Update `src/pages/lectures/[id].astro` — remove the `<SectionNav>` import + use, add `<RightRailTOC>` + `<ScrollSpy>` to the `right-rail` slot. Pass the chapter's `sections` array as a prop.
7. Smoke (local): `npm run dev`, navigate `/DSA/lectures/ch_4/`. TOC shows section list. Scroll the page — current section's TOC link gets visual highlight (cite a screenshot or DevTools assertion). Mark a section read via M3's `MarkReadButton` (still in place) — refresh, see the read indicator on the corresponding TOC entry.
8. **MarkReadButton state correctness smoke** (resolves MUX-BO-ISS-01 / HIGH-1). Open `/DSA/lectures/ch_4/` in `npm run dev`, mark a section read, **reload the page**, scroll to that same section. Confirm `MarkReadButton` renders as **"Unmark section"** (not "Mark section read") **without requiring a click** — the on-mount state must reflect the persisted read status.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/components/chrome/RightRailTOC.astro` exists and renders in the `Base.astro` `right-rail` slot on lectures pages.
- [ ] `RightRailTOC` reads the chapter's `sections` frontmatter and renders one anchor link per section.
- [ ] **Auditor opens** `/DSA/lectures/ch_4/` in `npm run preview`, confirms the TOC lists every section in the chapter (cross-check against `src/content/lectures/ch_4.mdx` frontmatter).
- [ ] Anchor links work — clicking a TOC entry scrolls to the matching section heading.
- [ ] `src/components/chrome/ScrollSpy.astro` is present and `data-interactive-only`-gated. Auditor opens DevTools in `npm run dev` (interactive mode), scrolls a long chapter, confirms the `[data-current="true"]` attribute moves to the appropriate link as headings scroll past the viewport's upper third.
- [ ] In static mode (preview, no `/api/health` reachable), TOC links still work (anchors are SSR), no console errors from the absent JS island data fetches.
- [ ] **M3 `SectionNav` refactor verified.** Auditor confirms the old fixed-left-rail `SectionNav` is gone from the lectures route. Read-status indicators surface in the right-rail TOC entries instead. Cite the before/after observation.
- [ ] **MarkReadButton state correctness on reload** (resolves MUX-BO-ISS-01 / HIGH-1). Auditor opens `/DSA/lectures/ch_4/` in `npm run dev`, marks a section read via the floating button, **reloads the page**, scrolls to the same section. The `MarkReadButton` must render as "Unmark section" without requiring a click — i.e., `refreshMarked()` correctly reads the persisted state at mount time, not from the deleted `#section-nav .dot` selector. Auditor cites the manual-test result and notes in the T4 issue file which option (a) or (b) the Builder picked.
- [ ] All 37 prerendered pages still build (`npm run build` exit 0). Notes + practice routes don't break (they have no `sections` frontmatter or use a different shape — TOC slot stays empty there).

## Notes

- **Decompose trigger (concrete, decided in the first 15 minutes per MUX-BO-ISS-06 / MEDIUM-3).** After Step 1 (audit M3 `SectionNav.astro`), if the diff to remove the standalone `SectionNav` and re-point its read-status indicator + fetch logic at the new RightRailTOC entries plus the `MarkReadButton.refreshMarked()` re-point in Step 5 looks larger than ~30 lines of new/changed code, split before writing any code:
  - **T4a:** RightRailTOC SSR + slot wiring + lectures-route plumbing (no scroll-spy, no read-status indicators, no MarkReadButton coupling fix). T6 depends on T4a only — once the slot exists, annotations re-home is unblocked.
  - **T4b:** ScrollSpy island + SectionNav refactor + read-status indicator port + `MarkReadButton.refreshMarked()` re-point (MUX-BO-ISS-01 / HIGH-1 owner).
  - Reactive splitting after the session has started costs more — the audit-step is short enough to hit the trigger early. If you start writing code without splitting, commit to landing both halves in one task.
- **Sections frontmatter shape.** Per M3 T4 closure, `src/content/lectures/*.mdx` has a `sections: [{id, anchor, title, ord}]` frontmatter array. T4 of M-UX consumes this. If the shape has drifted, surface that as the first finding in the T4 issue file before implementing.
- **Notes / practice routes.** `notes.tex` is two-page reference; `practice.md` is a flat coach-prompt list. Neither has a meaningful section list. T4 keeps the `right-rail` slot empty there (`<RightRailTOC>` only renders on lectures). M3's annotations pane (T6 re-homes it) may still want the right rail on notes/practice — T6 owns that call.
- **`SectionNav.astro` deletion vs. preservation.** If the M3 component has any non-TOC behaviour T4 doesn't replicate, preserve it as a sub-component and import from RightRailTOC. If it's purely "render section list with read indicators," delete the file. Audit the diff carefully before deleting — per CLAUDE.md, removed M3 functionality is a HIGH-finding regression.
- **IntersectionObserver rootMargin tuning.** Initial value `-30% 0px -50% 0px` (top-third trigger). Adjust if scroll-spy feels jittery. Pin the value in T4's audit issue file with the rationale.
- **No scroll-jacking.** Anchor links use the browser's native smooth-scroll if the user has it enabled; we don't override.
