# ADR 0002 — Site UX layer: MDN three-column chrome with Canvas-style chapter grouping

**Status:** Accepted
**Date:** 2026-04-24
**Decided by:** M-UX kickoff (cs-300 owner)
**Supersedes:** —
**Superseded by:** —

## Context

[`design_docs/nice_to_have.md`](../nice_to_have.md) parked the "Canvas-LMS-style left-nav + structured chapter pages" item with an explicit promotion trigger:

> M3 starts and the chrome decisions can no longer be deferred (read-status indicators need a sidebar to live in, annotations need a margin pane, etc.) — at that point a focused milestone ("M-UX") owns both the chrome and the M3 client surfaces.

M3 closed 2026-04-24 with `SectionNav`, `MarkReadButton`, `AnnotateButton`, and `AnnotationsPane` shipped. Those components live without a chrome layer — they render bare into the existing minimal `Base.astro` shell (51 lines: `<header>cs-300</header>` + `<main>`) and a roughly two-table `index.astro` (62 lines). The site is functional but visually plain; the M3 surfaces compete with the prose for screen real estate without a deliberate place to live.

Per CLAUDE.md non-negotiables, `nice_to_have.md` adoption requires architecture.md amendment + ADR. This ADR is the first half; architecture.md §1.6 amendment + the M-UX milestone breakout follow.

User direction (2026-04-24): "I like MDN-docs and Canvas style — not super picky about the UI, just want clean easy to read and navigate feel."

## Options considered

### Option A — MDN-docs three-column with Canvas-style left-rail grouping (decided)

Three columns on desktop (≥1024px):

- **Left rail** — chapter navigation grouped Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13), current chapter highlighted, per-chapter completion indicator (Canvas-inspired checkmark).
- **Center** — chapter content, prose-width-constrained (~75ch).
- **Right rail** — in-chapter section TOC (SSR from MDX frontmatter, scroll-spy enhanced); annotations pane below in interactive mode.

Below 1024px: collapses to single column with hamburger drawer for the left rail. Right-rail TOC moves to a collapsed `<details>` summary at content top.

**Pros:**

- MDN doc layout is the de-facto standard for technical reference content; readers don't need to learn a new pattern.
- Right-rail TOC + scroll-spy keeps section context visible without burning content width.
- Three columns naturally accommodate M3's annotations pane (right rail in interactive mode) — no awkward bare components.
- Static-mode render is fully SSR; no JS required for navigation.
- Scales to future surfaces: M6 Monaco editor could replace the right rail on `code` question pages; M7 audio player anchors below the breadcrumb without disturbing the columns.

**Cons:**

- More CSS than the current bare layout (rough estimate: 200–400 lines of grid + responsive rules).
- Mobile drawer adds one always-loaded JS island.

### Option B — Canvas-LMS literal two-column

Left rail (chapter list + module groups), main content. No right rail.

**Pros:** closer to the parked entry's literal naming; simpler responsive story.
**Cons:** no natural home for in-chapter TOC (forces top-of-page inline TOC or a floating widget); annotations pane competes with main content.

### Option C — Stripe-docs (sticky breadcrumb + collapsed sidebar)

Top breadcrumb sticky on scroll; left sidebar collapsed by default.

**Pros:** maximum content width; minimalist aesthetic.
**Cons:** hides navigation by default — adds friction for a study workflow where the reader jumps between chapters / sections frequently.

### Option D — GitHub-docs (collapsible left tree)

Tree-view nav (chapters → sections), expandable. Right rail TOC.

**Pros:** maximally information-dense left rail.
**Cons:** tree-view interactions add JS complexity; chapters are flat section lists, not deep trees — the tree affordance pays nothing.

## Decision

**Option A.** MDN-docs three-column on desktop, single-column with drawer on mobile. Canvas-style chapter grouping in the left rail (Required / Optional + completion indicators).

Specific commitments:

- **Left rail** — sticky on desktop, drawer on mobile. Chapter list grouped: "Required" (ch_1–ch_6) and "Optional" (ch_7, ch_9–ch_13). Current chapter highlighted. Per-chapter completion indicator (Canvas-inspired checkmark) gated via `data-interactive-only` (M3 T5 contract) — derived from `read_status` table; "fully read" vs "X of Y sections" is M-UX T2's call.
- **Center** — chapter content, max-width ~75ch (~720px), generous line-height (1.6+), responsive typography. Existing callout components (`<Definition>`, `<KeyIdea>`, `<Gotcha>`, `<Example>`, `<Aside>`, `<CodeBlock>`) render unchanged.
- **Right rail** — in-chapter section TOC, SSR from MDX frontmatter (`sections` array T4 already emits), scroll-spy enhancement as a JS island that toggles `data-current` via `IntersectionObserver`. Below the TOC in interactive mode: M3's annotations pane (refactored from the current always-rendered position into the right rail).
- **Mobile (≤1024px)** — single column. Left rail becomes a drawer (hamburger button in the breadcrumb bar). Right-rail TOC moves to a collapsed-by-default `<details>` summary at the top of the content.
- **Index page** — mastery-dashboard placeholder. Static mode renders chapter cards grouped Required / Optional. Interactive mode adds "recently read" + "due for review" sections — `data-interactive-only` slots that M5 fills in when the review queue lands. Replaces the current two-table layout.
- **Top breadcrumb** — sticky on scroll. Path: `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues`. Collection switcher (Lectures / Notes / Practice) lives here. Prev / Next chapter buttons flank the breadcrumb.

**Refactor note.** M3's `SectionNav` component (currently positioned as a fixed left rail per its T7 implementation) gets pulled into the right-rail TOC structure. The old left-rail position is replaced by the chapter-list nav. No two left rails.

## Consequences

**Positive:**

- M3's interactive surfaces (annotations, read-status indicators) get a natural home in the chrome — no bare components floating in the page.
- Reader gets standard MDN-style navigation; no new pattern to learn.
- Static-mode site is dramatically more navigable (chapter list + section TOC always rendered SSR, no JS required).
- M5's review-queue surface has a place to live (index page becomes the dashboard host with M5 hooks pre-wired).
- Three-column layout scales to future surfaces (M6 editor pane, M7 audio player) without re-shaping the chrome.

**Negative:**

- More CSS than the current bare layout — rough budget 200–400 lines split across the layout shell + responsive sweep.
- Mobile drawer adds one JS island to the always-loaded set.
- M3's `SectionNav` component needs to be refactored / re-homed (one-time churn).

**Trade-offs accepted:**

- Three columns over two: gain TOC + annotations slot, pay layout complexity. Worth it for a reference-content site.
- Reject Stripe-style minimalism: the workflow is "open chapter, jump around sections, annotate" not "skim once." Visible navigation is correct.
- Reject color/typography sweep in this milestone: layout structure first; bikeshedding visual choices in the same effort delays the load-bearing work. Visual polish goes in a follow-on (`nice_to_have.md` post-M-UX if friction emerges).

## Implementation references

- M-UX T1: layout shell — new `Base.astro` structure (three-column grid, responsive breakpoint, drawer scaffold).
- M-UX T2: left-rail chapter nav (SSR-rendered chapter list + Required / Optional grouping + current-highlight + completion indicators).
- M-UX T3: top breadcrumb (collection switcher + prev/next + sticky behaviour).
- M-UX T4: right-rail TOC + scroll-spy island. M3 `SectionNav` refactor lands here.
- M-UX T5: index page rewrite (mastery-dashboard placeholder; M5 hooks pre-wired).
- M-UX T6: M3 component re-homing — annotations pane to right rail, `MarkReadButton` to chapter content header.
- M-UX T7: mobile drawer + responsive sweep.
- M-UX T8: deploy verification — site still ships 37 pages, build size budget, no regressions on M3 surfaces.

(Specific task specs land in `design_docs/milestones/m_ux_polish/tasks/` in the M-UX breakout commit, separate from this ADR.)

## Open questions deferred to later tasks

- **Visual style — typography (resolved 2026-04-27 in M-UX-REVIEW T6).** Body: Source Sans 3. Mono: JetBrains Mono. Both self-hosted as variable woff2 in `public/fonts/` (latin subset; Source Sans 3 ships an italic file in addition so prose italic renders in the matched cut), declared via `@font-face` in `src/styles/chrome.css` with `font-display: swap`. Bundle delta at T6 close: +118,556 bytes total (97,676 woff2 + ~20,880 inline CSS replicated across 40 prerendered HTML files), inside the M-UX cumulative `dist/client/` budget. Rationale: cs-300 is a 200-hour reading product rendering body prose + KaTeX math + code listings + monospace tags side-by-side; the system font stack renders these inconsistently across macOS / Windows / Android, breaking visual rhythm at the same character size. Pinning the pair removes that class of cross-device polish drift. Source Sans 3 was chosen over Inter (the other F11-cleared option) because cs-300 is reading-product-shaped rather than UI-shaped, and Source Sans 3's reading-tuned letterforms suit long-form chapter prose. **Color palette** remains system-default + `--mux-accent`; **dark mode** remains deferred per the original entry (the `--mux-font-body` / `--mux-font-mono` tokens make dark-mode / theme work a single-rule swap when the trigger fires).
- **Search.** No search surface today; cs-300 site is small enough to navigate via the chapter nav. Defer to `nice_to_have.md` post-M-UX if friction emerges.
- **Dark mode.** Defer to follow-on. CSS custom properties used for the few colours M-UX introduces so dark-mode is a CSS-variable swap when adopted.
- **Per-section completion derivation** — "fully read" vs "X of Y sections marked." M-UX T2 owns this call when it implements the indicator.
- **Animation / transition discipline.** Drawer slide-in is the only required motion; everything else (sticky breadcrumb, current-section TOC highlight) is instant. M-UX T7 owns the drawer animation; revisit if user reports motion-related friction.
