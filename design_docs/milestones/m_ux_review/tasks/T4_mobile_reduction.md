# T4 — Mobile chrome reduction + drawer label

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) findings F9 (HIGH, ~3h), F10 (MED, ~30m)
**Depends on:** T3 (mobile breadcrumb behaviour collapses the same desktop bar T3 restructures)
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [`m_ux_polish/tasks/T7_mobile_drawer.md`](../../m_ux_polish/tasks/T7_mobile_drawer.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md)

## Why T4 exists (context)

On a 375pt-wide phone the user currently sees, top to bottom: hamburger, breadcrumb (wrapped to two lines), collection segmented control (wrapped), "On this page" `<details>`, *then* the chapter title. Three separate navigation surfaces stacked before the content begins. The hamburger reveals the left rail; the segmented control toggles collection; the details toggles the TOC. Different models, different layers, no hierarchy.

> "On a 375pt-wide phone the user sees… three navigation surfaces stacked on top of each other." — review F9

Compounding: the hamburger trigger is a bare `☰` glyph with no label. First-open users don't know what's inside.

T4 lands after T3 because T3 restructures the desktop breadcrumb shape — the mobile collapse builds on the new desktop structure (single role per row).

## Goal

1. **F9 — reduce the mobile chrome stack.** At <768px, hide the breadcrumb entirely (the drawer trigger + back button cover navigation); collection control attaches to the H1 as a tab strip (already moved there in T3); "On this page" `<details>` moves below the H1 (currently above it). Result: hamburger → H1 → collection tabs → On this page → content. Four layers down to four sensible, ordered layers.
2. **F10 — drawer trigger gains label + chevron state.** Hamburger renders as `☰ Chapters` with a chevron `›` that flips to `‹` when the drawer is open. CSS-animated, same DOM.

## Spec deliverables

### D1. Mobile breadcrumb hide (F9, `src/styles/chrome.css`)

Single CSS rule. At `@media (max-width: 767px)`:

```css
.breadcrumb-bar { display: none; }
```

The drawer trigger (currently inside the breadcrumb bar per M-UX T7) needs to survive this. Two options:

- **Option A** — extract `DrawerTrigger.astro` from inside `Breadcrumb.astro` to be a sibling of the breadcrumb in `Base.astro`. At <768px the breadcrumb hides but the trigger stays visible at the top of the page.
- **Option B** — keep `DrawerTrigger.astro` inside `Breadcrumb.astro` but use `display: contents` on the breadcrumb at <768px and `display: none` on its non-trigger children. Hacky.

Pick A. It's cleaner and gives the trigger a stable parent (Base.astro) regardless of viewport.

The prev/next chapter affordance loses its mobile placement — the drawer's chapter list IS the prev/next surface on mobile (you just tap the next chapter). Acceptable; the review explicitly says "the back button + drawer give equivalent affordances."

### D2. "On this page" below the H1 (F9, `src/layouts/Base.astro` or chapter route templates)

Currently the mobile right-rail `<details summary="On this page">` renders above the chapter H1 (inside the breadcrumb area or as a separate top-of-content element). Move it to render directly below the collection tabs (which T3 placed below the H1).

Mobile DOM order in `<main>` becomes:

```
<aside data-slot="continue-reading"> (only on landing pages, T1 surface)
<p class="ch-eyebrow">…</p>          (T3)
<h1>topic</h1>                       (T3)
<CollectionTabs />                   (T3)
<MobileChapterTOC />                 (T4 — emits its own
                                     `<details class="rhs-toc-mobile">`
                                     with `<summary>On this page</summary>`)
<article>chapter content</article>
```

Desktop (≥768px) keeps the right rail in its existing column position; the mobile `<details>` block hides via media query.

> **Cycle-2 amendment (2026-04-27, closes M-UX-REVIEW-T4-ISS-04):** D2 originally said `<RightRailTOC />` inside the mobile `<details class="rhs-toc-mobile">`. The Builder shipped a stripped-down `<MobileChapterTOC />` sibling component instead, because twice-rendering `RightRailTOC.astro` would have made `ScrollSpy.astro` + `RightRailReadStatus.astro` selectors paint twice (both instances would receive `data-current` updates from the same `IntersectionObserver`, and `RightRailReadStatus`'s `querySelectorAll('.right-rail-toc [data-read-indicator]')` would fragment its single paint surface across two TOC trees). The trade-off: mobile users lose live `[data-current="true"]` highlighting + read-status painting in the on-this-page affordance — acceptable per the spec's "the back button + drawer give equivalent affordances" framing of mobile navigation. The D2 example block above is amended to reflect the shipped component (`<MobileChapterTOC />`, which itself emits the `<details class="rhs-toc-mobile"><summary>On this page</summary><nav>…</nav></details>` structure internally — see `src/components/chrome/MobileChapterTOC.astro:75-88`).

### D3. Drawer trigger label + chevron (F10, `src/components/chrome/DrawerTrigger.astro`)

Current markup is roughly `<button class="drawer-trigger">☰</button>`.

New:

```astro
<button class="drawer-trigger" data-drawer-state="closed" aria-expanded="false">
  <span class="drawer-icon">☰</span>
  <span class="drawer-label">Chapters</span>
  <span class="drawer-chevron" aria-hidden="true">›</span>
</button>
```

CSS rule on `[data-drawer-state="open"] .drawer-chevron` rotates 180° (or the unicode swap to `‹` via `::before`). The existing drawer-toggle JS island already manages `aria-expanded` and the `data-drawer-state` attribute; add the chevron animation as a CSS transition on the rotation.

The "Chapters" label hides at very small viewports (e.g. <360px) if it crowds, via media query — keep the icon + chevron visible.

### D4. Mobile keyboard / focus behaviour (preserved)

The M-UX T7 cycle 2 focus-trap + `Escape`-to-close + initial-focus behaviour stays intact. T4 doesn't add new focus surfaces; verify that the new chevron visual is `aria-hidden="true"` so screen readers don't double-announce it on top of the existing `aria-expanded`.

### D5. Functional-test assertions (`scripts/functional-tests.json`)

New / updated test cases:

- `mobile-breadcrumb-hidden-375` — at viewport 375×812, `.breadcrumb-bar` has computed `display: none` (or is absent / not visible).
- `mobile-drawer-trigger-visible-375` — at viewport 375×812, `.drawer-trigger` is visible (computed `display !== 'none'`, `getBoundingClientRect.height > 0`).
- `mobile-toc-below-h1-375` — at 375×812, the chapter route DOM order has `details.rhs-toc-mobile` AFTER the chapter `<h1>` (compare `getBoundingClientRect.top`).
- `mobile-collection-tabs-below-h1-375` — at 375×812, `.collection-tabs` renders below the chapter `<h1>` (verifies T3's placement holds at mobile too).
- `drawer-trigger-label-text` — `.drawer-trigger .drawer-label` text is `Chapters`.
- `drawer-trigger-chevron-presence` — `.drawer-trigger .drawer-chevron` exists with `aria-hidden="true"`.
- `drawer-chevron-rotates-on-open` — after clicking `.drawer-trigger`, the trigger has `data-drawer-state="open"` AND the computed `transform` of `.drawer-chevron` is non-identity (rotation applied).
- `mobile-existing-drawer-contracts-preserved` — M-UX T7 contracts: `.drawer-trigger[aria-expanded]` toggles correctly, `Escape` closes, focus traps inside the drawer when open. (existing T7 / T9 cases re-run.)

### D6. Architecture.md amendment

`design_docs/architecture.md` §1 mobile subsection currently reads "Below 1024px: collapses to single column with hamburger drawer for the left rail." Update the mobile DOM order paragraph to reflect the new ordering (eyebrow → h1 → collection tabs → on-this-page → content) and the breadcrumb-hide-at-768px rule.

## Acceptance checks (functional-test assertions, runnable by the auditor)

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F9 | Breadcrumb hidden at 375×812. | `mobile-breadcrumb-hidden-375` |
| AC2 | F9 | Drawer trigger visible at 375×812. | `mobile-drawer-trigger-visible-375` |
| AC3 | F9 | "On this page" `<details>` renders BELOW the chapter H1 at 375×812. | `mobile-toc-below-h1-375` |
| AC4 | F9 | Collection tabs render below the H1 at 375×812 (T3 contract holds at mobile). | `mobile-collection-tabs-below-h1-375` |
| AC5 | F10 | `.drawer-trigger` text contains `Chapters`. | `drawer-trigger-label-text` |
| AC6 | F10 | `.drawer-trigger` contains a `.drawer-chevron` with `aria-hidden="true"`. | `drawer-trigger-chevron-presence` |
| AC7 | F10 | After clicking the trigger, the chevron has a non-identity computed `transform`. | `drawer-chevron-rotates-on-open` |
| AC8 | regression | M-UX T7 + T9 mobile contracts unchanged: drawer focus-trap, Escape-to-close, `aria-expanded`, `cs300:drawer-toggle` event still fires. | (existing T7 / T9 cases) |
| AC9 | regression | At ≥768px, breadcrumb is visible (T3's desktop shape preserved). Spot-check viewport 1280×800. | `desktop-breadcrumb-visible-1280` |
| AC10 | doc | `design_docs/architecture.md` §1 mobile subsection reflects new DOM order + breadcrumb-hide-at-768px rule. | (doc-content grep) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview`.
3. `python scripts/functional-tests.py …` — exit 0.
4. `python scripts/smoke-screenshots.py …` — capture 375×812 + 768×1024 of `/DSA/lectures/ch_4/`. Auditor opens both and confirms:
   - At 375: no breadcrumb visible. Drawer trigger reads "☰ Chapters ›" (icon + label + chevron). H1 dominates the top of the screen.
   - At 768: breadcrumb returns; chrome reads as the desktop shape.
5. Auditor manually opens drawer at 375 and confirms: chevron rotates / flips, label hides if very narrow, focus traps inside, Escape closes.

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T4 row.
- (c) `m_ux_review/README.md` task table T4 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkboxes for F9, F10 (with citation parenthetical pointing at the per-task issue file).
- (e) `design_docs/architecture.md` §1 mobile DOM order updated.

## Carry-over from prior audits

None. T4 is net-new from the 2026-04-27 review.

## Out of scope

- Drawer animation curve / timing changes. Out — single CSS transition for the chevron is enough.
- Search affordance on mobile. Still deferred per ADR-0002 + nice_to_have.md.
- New mobile-only surfaces (e.g. bottom-nav). Out — drawer + breadcrumb-hide is sufficient.
- Tablet-specific behaviour (768–1023px). The current contract treats this as "desktop minus right rail"; T4 doesn't change that.
- Prev/next-chapter buttons on mobile. The drawer covers chapter navigation; explicit prev/next pills aren't needed mobile-side per F9's reasoning.
