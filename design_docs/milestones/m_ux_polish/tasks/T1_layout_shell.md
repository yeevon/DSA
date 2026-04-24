# T1 — Layout shell: three-column grid + responsive scaffold

**Status:** todo
**Depends on:** —
**Blocks:** T2, T3, T4, T5, T6, T7, T8 (everything)

## Why

[ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md) commits to an MDN-docs three-column layout (left chapter nav, center content, right TOC + annotations) on desktop and a single column with hamburger drawer on mobile. T1 lands the shell — the grid, the breakpoint, the slot scaffolding — that every other M-UX task plugs into. No real content in the slots yet; T2–T6 fill them.

The current `src/layouts/Base.astro` is 51 lines: `<header>cs-300</header>` + `<main>{ slot }</main>`. T1 replaces it with the shell.

## Deliverable

- `src/layouts/Base.astro` rewritten — three-column CSS grid on `≥1024px`, single column below. Five named slots: `breadcrumb`, `left-rail`, `default` (center / chapter content), `right-rail`, `drawer-trigger`. Slots default to empty/null so chapters that don't fill them render cleanly.
- `src/styles/chrome.css` (or inline in `Base.astro` `<style>` — pick one and document) — the three-column grid rules, breakpoint media query, prose-width constraint on the center column (~75ch / ~720px), generous line-height (≥1.6), CSS custom properties for the few colours the layout needs (defer the palette decision per ADR-0002 — system font + one accent only).
- `src/components/chrome/` directory created with empty `.gitkeep` (T2–T7 populate). Subsequent M-UX components live here.
- Each existing chapter route (`src/pages/lectures/[id].astro`, `notes/[id].astro`, `practice/[id].astro`) verified to render through the new shell without breakage. No content-area changes — the existing slot content still flows into `default`.
- T5 contract preserved: `body[data-mode="static"] [data-interactive-only] { display: none !important }` rule survives the rewrite.

## Steps

1. Audit the existing `Base.astro` — list every existing prop, slot, and `<head>` tag (KaTeX CSS, Shiki, generator meta, the M3 `data-mode` script, the `data-interactive-only` rule). Catalogue what must survive the rewrite.
2. Replace `Base.astro` body with the new shell:
   - Single root `<div class="chrome">` using CSS grid.
   - Five named slot regions; each wrapped in a `<div data-slot="...">` for predictable selectors and accessible landmarks (`<aside>` for left + right rails, `<nav>` for breadcrumb, `<main>` for center).
   - CSS grid template: desktop columns `260px 1fr 280px` (or similar — pick + record), single column below 1024px.
3. Inline the M3 `data-mode` script + `data-interactive-only` CSS rule unchanged. T1 must not regress T5's mode-detection contract.
4. Smoke each chapter route: `npm run dev`, open `/DSA/lectures/ch_1/`, `/DSA/notes/ch_1/`, `/DSA/practice/ch_1/`. Center column renders the chapter content. Left/right rails are empty (slots not yet populated) but reserved space is visible at desktop width. Mobile (375px in DevTools): single column, no horizontal scroll.
5. Run `npm run build` — verify 37 pages still ship, no build errors.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/layouts/Base.astro` renders the three-column grid at `≥1024px`. Auditor opens DevTools at 1280px width on `/DSA/lectures/ch_1/`, confirms three named regions are visible (left rail, center, right rail) — even if left/right are visually empty (slot content lands in T2/T4).
- [ ] At `<1024px` (auditor toggles to 768px in DevTools), layout collapses to single column. No horizontal scroll. Center content remains readable.
- [ ] `<body data-mode="static">` still rendered server-side as default (T5 contract). Auditor curls a built page from `dist/client/` and confirms.
- [ ] `data-interactive-only` CSS rule still hides matched elements in static mode. Auditor adds a `<div data-interactive-only>SHOULD-BE-HIDDEN</div>` to a chapter MDX and confirms it's not visible in static mode at preview.
- [ ] `npm run build` produces 37 prerendered pages. No new build errors. `dist/client/` size delta within reason (T8 owns the formal budget; T1 just confirms no order-of-magnitude regression).
- [ ] Existing M3 components (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) still render somewhere on the chapter pages — possibly in their original positions, possibly broken visually. T1 does not re-home them (T6's job); it just confirms they don't disappear.

## Notes

- **Decompose trigger.** If the responsive grid + slot scaffold + Base.astro rewrite together exceed one session, split into T1a (shell + grid) + T1b (slot wiring + chapter route verification).
- **CSS approach decision.** ADR-0002 doesn't pin CSS-in-component vs separate file. T1 picks: inline `<style>` in `Base.astro` for the layout grid (small surface, owned-by-Base), separate `src/styles/chrome.css` for any rule that's shared between Base and a `chrome/` component (avoids duplication when T2/T3/T4 need the same colour token). Document the rule at the top of whichever file lands.
- **Don't introduce new dependencies.** No CSS framework (Tailwind, etc.). Native CSS grid + media queries are sufficient — keeps the dep-audit gate quiet and matches the project's "no new dep without ADR" non-negotiable.
- **Future surfaces** (M5 review queue, M6 Monaco, M7 audio player) will plug into named slots. T1's slot naming is the contract those surfaces compose against — name them deliberately.
- **CSS custom properties** for colours: define them in `:root` so dark-mode adoption (deferred per ADR-0002) is a one-rule swap.
