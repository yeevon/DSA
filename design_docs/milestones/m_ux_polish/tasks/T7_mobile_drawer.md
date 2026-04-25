# T7 — Mobile drawer + responsive sweep

**Status:** todo
**Depends on:** T1 (shell), T2 (left rail), T3 (breadcrumb), T4 (right rail), T6 (M3 re-home — all affected components must be in place)
**Blocks:** T8 (deploy verification)

## Why

Per [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the layout collapses to single column with a hamburger drawer for the left rail below 1024px. The right rail's in-chapter TOC moves to a collapsed `<details>` summary at content top. T7 is the integration step — touches every chrome component to verify the breakpoint transitions cleanly and the mobile experience stays navigable.

T7 is the first task that meaningfully introduces always-loaded JS (the drawer toggle). Keep that island small — no UI framework, native DOM APIs only.

## Deliverable

- `src/components/chrome/Drawer.astro` — JS island. Renders a hamburger button in the breadcrumb (visible only at `<1024px` via CSS), hosts the left-rail content in a slide-in drawer element. On button click: drawer slides in; on backdrop click or escape key: drawer slides out. Traps focus while open. `aria-expanded` reflects state.
- `src/components/chrome/Breadcrumb.astro` (from T3) updated — gains a slot for the drawer trigger button. Hamburger visible only at `<1024px`.
- `src/components/chrome/LeftRail.astro` (from T2) updated — content is the same SSR chapter list; at `<1024px` it renders inside the drawer slot instead of the fixed left column.
- `src/components/chrome/RightRailTOC.astro` (from T4) updated — at `<1024px`, wraps in a `<details>` element (collapsed by default) at the top of the content column. Desktop (≥1024px) renders as the fixed right rail per T4.
- `src/components/annotations/AnnotationsPane.astro` (re-homed in T6) — at `<1024px`, also wraps in `<details>` below the TOC's `<details>` (or inside a separate collapsed section). Stays `data-interactive-only`.
- Full responsive sweep across every chrome component — test at 1280 (desktop), 1024 (breakpoint), 768 (tablet), 375 (mobile). Document each breakpoint's observed behaviour in the audit issue file.

## Steps

1. Build `Drawer.astro`:
   - **Step-ordering note (resolves MUX-BO-DA3-B / LOW).** Step 16 lands first — `Breadcrumb.astro` doesn't ship the drawer-trigger slot in its T3 deliverable; T7 adds it. Concretely: do Step 16 (modify `Breadcrumb.astro` to declare a `drawer-trigger` named slot inside its flexbox layout) before Step 1's hamburger mount, otherwise the `<slot name="drawer-trigger" />` target doesn't exist and the hamburger has nowhere to land.
   - Hamburger `<button>` mounted **inside `Breadcrumb.astro`'s component-internal drawer-trigger slot** — not directly in `Base.astro`'s `breadcrumb` slot region. (Resolves MUX-BO-DA2-F / LOW — the placement now agrees with deliverable line 16 "`Breadcrumb.astro` (from T3) updated — gains a slot for the drawer trigger button" and with MUX-BO-ISS-04's resolution that the trigger lives inside `Breadcrumb.astro` so the breadcrumb's flexbox layout owns its placement.) Visibility gated via `@media (max-width: 1023px)` on the button itself.
   - Drawer element: `<aside role="dialog" aria-modal="true" aria-label="Navigation" hidden>` at the root of the body, slides in from the left via CSS `transform: translateX(-100%)` + transition on `open` class.
   - Backdrop: `<div class="drawer-backdrop">` fades in with the drawer.
   - JS island (`client:load` — the drawer must be interactive immediately):
     - Click hamburger → add `.open` to drawer + backdrop, set `aria-expanded="true"`.
     - Click backdrop or press Escape → remove `.open`, set `aria-expanded="false"`.
     - Trap focus within the drawer while open (standard pattern: first + last focusable elements, wrap tab order).
2. Move `LeftRail` content into the drawer at `<1024px`. Options:
   - **(a)** Render `LeftRail` twice, hide the desktop one at `<1024px` and the drawer one at `≥1024px`. Duplicate DOM, simple CSS.
   - **(b)** Render `LeftRail` once, use CSS to move it (e.g., via `display: contents` or a wrapper div that repositions). Single DOM, trickier CSS.
   - Lean: **(a)** — twice-rendered is the least-surprising pattern; the performance cost is negligible (SSR markup, no JS). Audit issue file records the call.
3. Wrap `RightRailTOC` in a responsive wrapper: fixed right rail at `≥1024px`, `<details>` at top of content at `<1024px`. Same twice-render pattern as LeftRail — the `<details>` element is the `<1024px` variant.
4. Same pattern for `AnnotationsPane` — fixed right rail at desktop, collapsed `<details>` at mobile. Still `data-interactive-only`.
5. Responsive typography sweep — verify center column's ~75ch constraint doesn't force horizontal scroll at 375px. Adjust font-size / padding at the smaller breakpoints if needed.
6. Smoke each breakpoint in DevTools: 1280, 1024 (just below), 768, 375. At each, cite observed layout + a screenshot path or DevTools assertion in the audit issue file.
7. Accessibility smoke: `<Tab>` through the mobile drawer — focus stays trapped when open, returns to the hamburger button when closed. Escape key closes the drawer. VoiceOver / screen-reader test (if available) — drawer is announced as "Navigation, expanded" or similar.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] **Auditor opens** `/DSA/lectures/ch_4/` in `npm run preview` and resizes the DevTools viewport to each of: 1280, 1024, 768, 375. Cites observed layout at each:
  - 1280: three-column grid (left rail, center, right rail). Breadcrumb sticky.
  - 1024: desktop layout (three columns) still — the breakpoint is `<1024`, so 1024 is desktop.
  - 768: single column. Hamburger button visible in breadcrumb. Right-rail TOC collapsed in `<details>` at top of content.
  - 375: same as 768. No horizontal scroll. Typography remains readable.
- [ ] **Auditor clicks the hamburger** at 375px width. Drawer slides in from the left with the chapter list. Clicks a chapter link — navigates, drawer closes. Opens drawer again, presses Escape — drawer closes. Opens drawer again, clicks the backdrop — drawer closes. Cite each observation.
- [ ] **Accessibility:** auditor confirms `<Tab>` from the hamburger enters the drawer when open, cycles through chapter links, wraps back to the first focusable element. Escape closes. Focus returns to the hamburger button on close.
- [ ] **Static mode** (preview, no `/api/health`) at 375px: drawer shows chapter list (SSR-rendered, works without the read-status fetch). Right-rail TOC's collapsed `<details>` is present and expands on click. No console errors.
- [ ] M3 interactive surfaces at 375px (when interactive mode reachable): annotations pane is in a collapsed `<details>` after the TOC. Mark-read button still accessible. Annotate button (floating) still works on text selection.
- [ ] All 37 prerendered pages still build (`npm run build` exit 0). Drawer JS is bundled as one small island; cite the approximate file size delta in `dist/client/_astro/`.

## Notes

- **Drawer JS is the only always-loaded island M-UX introduces.** Size budget: target <5KB minified (native DOM APIs, no framework). T8 checks the total `dist/client/` size delta; T7 should not blow it.
- **`client:load` vs `client:visible` for the drawer.** The hamburger needs to be interactive immediately (user might tap it instantly on page load), so `client:load`. Other M-UX islands (ScrollSpy, CompletionIndicator) can stay `client:visible`.
- **Twice-render tradeoff** (Step 2 (a) vs (b)). The duplicate DOM is 12 `<li>` elements + wrapper — negligible. Going with (a) avoids the CSS complexity of `display: contents` + repositioning.
- **Body scroll lock.** When the drawer is open at mobile, the body should not scroll. Standard pattern: add `overflow: hidden` to `<body>` on drawer open, remove on close.
- **Backdrop stacking.** Drawer sits above everything else. Backdrop sits just below the drawer, above the page content. `z-index`: drawer=100, backdrop=90, sticky breadcrumb=50, everything else default.
- **No animation library.** Native CSS transitions only. Drawer slide-in is `transform: translateX()` + `transition: transform 200ms ease`. Backdrop fade is `opacity` + same transition.
- **Don't introduce a responsive CSS framework.** Native `@media` queries are sufficient. Keeps the dep-audit gate quiet.

## Carry-over from prior audits

- [ ] **M-UX-T6-ISS-01 (HIGH, DEFERRED from T6 cycle 1).** Run T6's three browser-driven acceptance smokes inside the T7 `npm run dev` responsive session: (1) `/DSA/lectures/ch_4/` interactive — annotations pane in right rail below TOC + read-status, mark-read button visible bottom-left and clickable, floating annotate button on selection not clipped at 1280px AND 375px; (2) round-trip — select text → click annotate → annotation appears in right-rail pane → reload → annotation persists; (3) `npm run preview` static — annotations pane hidden, mark-read button hidden, no annotate button on selection, page still reads cleanly. Cite each observation per AC. **If option (i) "floating bottom-left" reads cleanly, also confirm Done-when bullet 7 wording (M-UX-T6-ISS-02) — reword the milestone README bullet to reflect the option (i) resolution OR strip `position: fixed` and switch to option (ii) if friction emerges.** Source: [`../issues/T6_issue.md`](../issues/T6_issue.md) HIGH section.
- [ ] **M-UX-T6-ISS-03 (MEDIUM, DEFERRED from T6 cycle 1).** Verify AnnotationsPane reads cleanly inside the mobile collapsed-rail `<details>` at <1024px — long annotations truncate at 80 chars per the M3 script and don't break the accordion; `max-height: 50vh` + `overflow-y: auto` rules behave sensibly inside the collapsed summary. Spec deliverable line 19 already lists the AnnotationsPane mobile-wrap requirement; this carry-over adds the explicit smoke check. Source: [`../issues/T6_issue.md`](../issues/T6_issue.md) MEDIUM section.
