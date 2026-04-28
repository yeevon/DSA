# T2 — Right-rail TOC hierarchy

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) finding F4 (HIGH, ~3h)
**Depends on:** —
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), [`design_docs/architecture.md` §1.6 right-rail TOC filter](../../../architecture.md)

## Why T2 exists (context)

The right-rail TOC is the single most-used affordance in chapter reading per the review ("every chapter page, every scroll"). Today it lists ~30 items at a single visual level — H1 sections (4.1, 4.2, 4.3) are indistinguishable from H2 subsections at a glance. The rail becomes a wall instead of a map.

The fix is two CSS rules with the existing DOM. The MDX frontmatter already carries the section list; M-UX b29d409 already filtered the rail to top-level `^\d+\.\d+\s` entries (per architecture.md §1.6). What's missing is *visual hierarchy within those entries* — bold/dense headers vs indented/muted children — and re-introducing the H2 children that the M-UX filter currently drops, but as visually-secondary entries that don't crowd the rail.

This is a small, sharp change. ~3h estimated, mostly because the MDX frontmatter generator (`scripts/build-content.mjs`) needs to emit `level: 1 | 2` per entry and the scroll-spy `IntersectionObserver` thresholds may need a per-level pass. No DOM-shape change beyond a `data-level` attribute.

## Goal

Restore H2 entries to the right-rail TOC (currently filtered out) and render H1 vs H2 with a clear visual split:

- **H1 (e.g. "4.1 The List ADT")** — bold, body-colour, no indent, ~0.5rem top margin separating from the previous H2 group.
- **H2 (e.g. "The contract: operations")** — indented ~1rem, muted colour (`var(--mux-text-muted)` or new `--mux-toc-h2-color` token), regular weight.

The scroll-spy contract stays identical: `IntersectionObserver` toggles `data-current` on the closest TOC entry to the viewport's reading position. Both H1 and H2 can be `data-current` (whichever is most-recently entered).

## Spec deliverables

### D1. MDX frontmatter emits per-entry levels (`scripts/build-content.mjs`)

The pandoc-emitted MDX header anchors carry their HTML heading level (H2, H3, H4 in the pandoc output). The build script today walks the AST and writes `sections: [{ id, anchor, title }]` to frontmatter, and the M-UX filter drops everything that doesn't match `^\d+\.\d+\s` to keep the rail short.

Replace with: emit every section anchor (H1 + H2) into the frontmatter as `sections: [{ id, anchor, title, level: 1 | 2 }]`, where `level: 1` = the chapter's numbered top-level (`^\d+\.\d+\s`) and `level: 2` = the H2 subsections under it. Drop H3 and below (still too granular for a rail). The total entry count rises from ~37 (post-filter) toward ~60–70 (ch_4 ships at 68: 18 H1 + 50 H2) — but this is fine, the rail is sticky-scrollable per M-UX T9 D2 and the visual hierarchy makes the increased count readable rather than oppressive.

> **Cycle-2 amendment (2026-04-27).** This paragraph originally said "H2 + H3" (mis-named the pandoc heading depths) and "~60" (loose upper bound). Pandoc emits `\section{...}` → `# ...` (MDX H1, depth=1) and `\subsection{...}` → `## ...` (MDX H2, depth=2); the Builder mapped H1 → `level: 1` / H2 → `level: 2` correctly despite the wording. Spec text amended to match the implementation and the actual ch_4 count. See `../issues/T2_issue.md` LOW-2 + LOW-4 for the cycle-1 finding and the cycle-2 closure note.

### D2. RightRailTOC renders the level (`src/components/chrome/RightRailTOC.astro`)

- **Markup change.** Each `<li>` gets `data-level="1"` or `data-level="2"`. Existing classes / IDs / scroll-spy hooks unchanged.
- **CSS (`src/styles/chrome.css`).** Two rules:
  - `[data-slot="right-rail"] li[data-level="1"] { font-weight: 600; padding-left: 0; margin-top: 0.5rem; }`
  - `[data-slot="right-rail"] li[data-level="2"] { font-weight: 400; padding-left: 1rem; color: var(--mux-text-muted); }`
- **First H1 in the rail** doesn't need the top margin (no previous group to separate from); use `:first-child` to suppress.
- **`data-current` styling** unchanged — the existing accent-bar treatment paints whichever level the scroll-spy lands on.

### D3. ScrollSpy thresholds (no contract change, `src/components/chrome/ScrollSpy.astro`)

The current scroll-spy uses one `IntersectionObserver` with thresholds calibrated for top-level sections. With H2 children added, thresholds should still work — but verify the "what counts as current" rule still picks the most-specific entry. The simple fix: when both an H1 and its H2 child are intersecting the reading band, prefer the H2 (it's the more-specific anchor); when only the H1 is intersecting, use the H1. The existing implementation walks anchors top-to-bottom; the last-intersecting wins, which already does this naturally.

If verification finds the simple rule breaks (e.g. small H2 sections trigger H1 instead), add a `data-level` check in the scroll-spy logic to prefer level=2 when both fire on the same observer call. Otherwise leave alone.

### D4. Verify M-UX filter rule isn't load-bearing elsewhere

The b29d409 commit dropped subsection TOC entries to shrink the bundle by ~117 KB (per `m_ux_polish/README.md` line 28). Re-introducing H2 entries grows the bundle back. Capture the `dist/client/lectures/ch_4/index.html` byte size before and after the change; expect a partial regression of that 117 KB savings (likely ~80 KB since H2 entries are short labels). Document the new size in the issue file. The +80 KB sits inside the M-UX +756 KB cumulative delta and isn't budget-blocking.

`data-interactive-only` carrier counts on `dist/client/lectures/ch_4/index.html` will rise from 37 (per the M-UX T9 baseline) toward ~60 because each H2 entry that shows a "you read this" indicator is one more carrier. Update the M-UX T9 AC13 baseline in this task's issue file with the new expected count + the same-DOM justification.

### D5. Functional-test assertions (`scripts/functional-tests.json`)

New test cases:

- `right-rail-toc-h1-h2-mix` — on `/DSA/lectures/ch_4/`, the rail contains both `li[data-level="1"]` (count >= 4 — chapters 4 has at least 4.1, 4.2, 4.3, 4.4) AND `li[data-level="2"]` (count >= 4 — at least four H2 subsections in ch_4).
- `right-rail-toc-h1-bold` — on `/DSA/lectures/ch_4/`, the computed `font-weight` of the first `li[data-level="1"]` is `>= 600`.
- `right-rail-toc-h2-indented` — on `/DSA/lectures/ch_4/`, the computed `padding-left` of the first `li[data-level="2"]` is `> 0` (≥1rem in px).
- `right-rail-scroll-spy-on-h2` — after `window.scrollTo(0, <approx-mid-h2-y>)`, exactly one `li[data-current]` is present, and its `data-level` is `2` (we're on a subsection, not the parent H1).

### D6. Architecture.md amendment

`design_docs/architecture.md` §1.6 currently documents the M-UX b29d409 filter rule ("TOC filters MDX `sections` frontmatter to top-level numbered sections"). T2 reverses that decision — update §1.6 to reflect the new contract: TOC emits H1 + H2 with `data-level`, scroll-spy prefers the most-specific intersecting level, H3+ is excluded. Re-cite the byte-size delta vs the b29d409 baseline.

## Acceptance checks (functional-test assertions, runnable by the auditor)

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F4 | Right-rail TOC on `/DSA/lectures/ch_4/` contains both `li[data-level="1"]` (≥4) and `li[data-level="2"]` (≥4). | `right-rail-toc-h1-h2-mix` |
| AC2 | F4 | Computed `font-weight` of `li[data-level="1"]` is ≥600. | `right-rail-toc-h1-bold` |
| AC3 | F4 | Computed `padding-left` of `li[data-level="2"]` is ≥16px (or whichever rem-equivalent the CSS picks). | `right-rail-toc-h2-indented` |
| AC4 | F4 | Scroll-spy lands on `data-level="2"` when scrolling into a subsection. | `right-rail-scroll-spy-on-h2` |
| AC5 | F4 | M-UX T9 AC4 still passes — sticky right rail, no regression. | (existing T9 case) |
| AC6 | F4 | M3 events `cs300:read-status-changed` + `cs300:toc-read-status-painted` still fire on the H1 entries (existing contract unchanged). | (existing T9 case + spot-grep) |
| AC7 | doc | `design_docs/architecture.md` §1.6 mentions `data-level` and the H1/H2 split, supersedes the b29d409 top-level-only rule. | (doc-content grep) |
| AC8 | size | `dist/client/lectures/ch_4/index.html` byte size delta vs b29d409 baseline (37 KB context window) is captured in this task's issue file. | (build-time du) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview`.
3. `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — exit 0.
4. `python scripts/smoke-screenshots.py …` — capture visuals at 1280×800 + 2560×1080 of `/DSA/lectures/ch_4/` (long chapter, exercises both levels). Auditor opens the screenshot and confirms the H1 bold / H2 indent split is visually obvious without zooming in.
5. Auditor manually scrolls a chapter and confirms scroll-spy lands on the correct level (open `/DSA/lectures/ch_4/`, scroll until "The contract: operations" subsection enters the reading band, observe TOC `data-current` paints on that H2 entry, not the parent H1).

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T2 row.
- (c) `m_ux_review/README.md` task table T2 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkbox for F4 + no-regression bullet (with citation parenthetical pointing at the per-task issue file).
- (e) `design_docs/architecture.md` §1.6 reflects the new contract.

## Carry-over from prior audits

None. T2 is net-new from the 2026-04-27 review.

## Out of scope

- The M-UX-T2-ISS-02 / §UX-4 SSR-embedded section-list endpoint replacement — still parked in `nice_to_have.md`. T2 grows the SSR JSON slightly (more anchors per chapter) but the magnitude (~80 KB additional) doesn't change the §UX-4 trigger.
- New scroll-spy types (e.g. nested observers per level). The simple "last-intersecting wins" rule should suffice; only escalate if D3's verification finds it broken.
- TOC filter changes beyond the H1/H2 split (e.g. user-configurable depth). Out.
- Annotations-pane refactor — that's M-UX T6's surface, untouched by T2.
