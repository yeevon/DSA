# T3 — Top breadcrumb: collection switcher + prev/next + sticky

**Status:** todo
**Depends on:** T1 (shell + `breadcrumb` slot)
**Blocks:** T7 (responsive sweep), T8 (deploy verification)

## Why

Per [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the top breadcrumb is the secondary navigation surface — the path indicator + collection switcher + prev/next chapter buttons. Sticky on scroll so it stays visible during long chapter reads. Lives in the `breadcrumb` slot from T1.

## Deliverable

- `src/components/chrome/Breadcrumb.astro` — SSR component. Reads `Astro.url.pathname` + `scripts/chapters.json` to compute the path (collection + chapter), renders:
  - **Path:** `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues` (each segment a link except the last).
  - **Collection switcher:** three pill-style links — Lectures, Notes, Practice — with the current one marked. Each links to the same chapter slug in the target collection.
  - **Prev / Next chapter buttons:** arrow buttons on either side. Disabled state at chapter-list boundaries (no prev on ch_1, no next on the last optional chapter). Respects `n` ordering from `chapters.json`.
- Sticky behaviour: CSS `position: sticky; top: 0` on the `<nav>` element. No JS required — pure CSS.
- Wire into the `Base.astro` `breadcrumb` slot from T1.

## Steps

1. Compute path from `Astro.url.pathname`. Pattern: `/DSA/{collection}/{chapter_id}/`. Extract collection ∈ {`lectures`, `notes`, `practice`} and chapter_id (e.g. `ch_4`).
2. Look up the chapter's title + n in `chapters.json`. Build the breadcrumb segments: `[ "cs-300", title-case(collection), "ch_N — title" ]`.
3. Compute prev/next:
   - Sort chapters by `n` ascending.
   - Prev = chapter at index `currentIndex - 1` if exists, else null (button rendered disabled).
   - Next = chapter at index `currentIndex + 1` if exists, else null. Note: ch_8 doesn't exist in this corpus (per CLAUDE.md non-negotiables — chapter map is ch_1–7, ch_9–13). The `n` ordering naturally skips it because there's no ch_8 row in `chapters.json`.
4. Render:
   - `<nav class="breadcrumb" aria-label="Chapter context">` outermost.
   - Inside: prev button | path links + current | collection switcher | next button. Use a flexbox row.
5. Style: sticky `top: 0`, background colour from `chrome.css` to avoid see-through-on-scroll, subtle bottom border to separate from content. Collection switcher pills are simple buttons with active-state highlighting.
6. Smoke (local): navigate `/DSA/lectures/ch_4/` — breadcrumb shows correct path, collection pill "Lectures" is active, "Notes" pill links to `/DSA/notes/ch_4/`. Prev button goes to ch_3, next to ch_5. Scroll the page — breadcrumb stays at top.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/components/chrome/Breadcrumb.astro` exists and renders in the `Base.astro` `breadcrumb` slot at the top of every chapter page.
- [ ] **Auditor opens** `/DSA/lectures/ch_4/` in `npm run preview`, confirms breadcrumb reads `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues` (or whatever ch_4's actual title is per `chapters.json`).
- [ ] **Auditor opens** `/DSA/notes/ch_4/`, confirms collection switcher's "Notes" pill is active and links to lectures/practice point at the same chapter slug (`/DSA/lectures/ch_4/` and `/DSA/practice/ch_4/`).
- [ ] **Auditor opens** `/DSA/lectures/ch_1/`, confirms prev button is disabled / hidden (no chapter before ch_1).
- [ ] **Auditor opens** `/DSA/lectures/ch_13/`, confirms next button is disabled / hidden (no chapter after ch_13).
- [ ] **Auditor opens** `/DSA/lectures/ch_7/`, confirms next button points at ch_9 (skipping the absent ch_8 — verifies the `n`-ordering, not slug-arithmetic).
- [ ] **Auditor scrolls** any long chapter (ch_3 or ch_4 — both 50+ pages of LaTeX) and confirms the breadcrumb stays visible at the top of the viewport (sticky behaviour). Cite the scrolled-state observation in the audit issue file.
- [ ] All 37 prerendered pages still build (`npm run build` exit 0).

## Notes

- **No JS required.** Sticky is pure CSS. Path computation is at SSR time. Collection-switcher links are plain `<a>` elements. Prev/next buttons are `<a>` elements with computed `href`. The whole component is JS-free, which keeps the always-loaded JS budget smaller.
- **Collection-switcher absent-collection case.** Every chapter has all three collections per the M2 build pipeline (lectures.tex, notes.tex, practice.md → MDX). T3 doesn't need to defensively handle "this chapter has no notes" — if it ever happens, the broken link surfaces the missing content immediately.
- **Mobile breadcrumb.** On mobile, the path may need to truncate (long chapter titles) and the prev/next buttons become the primary affordance. T7 owns the responsive sweep; T3 ships the desktop shape and trusts T7 to refine.
- **Sticky overlap with M3 `data-mode` script.** The mode script flips `body.dataset.mode` after `DOMContentLoaded`. Sticky works regardless of mode. No interaction.
- **Future surface hooks.** When M5's review-queue UI lands, the breadcrumb is the natural place for a "review (3 due)" badge. T3 leaves the structure flexible (the `<nav>` can absorb a third group). Don't add the slot now — YAGNI per CLAUDE.md.
