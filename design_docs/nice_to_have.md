# nice_to_have.md — deferred parking lot

Items that are real ideas but **out of scope by default**. Per
[`../CLAUDE.md`](../CLAUDE.md):

> Items listed here are out of scope by default. Adoption requires
> an architecture.md update plus an ADR — not a task.

No milestones, no tasks, no drive-by adoption. An audit that
catches scope creep from this file flags HIGH. The bar to promote
an item out of this file is deliberately high — list things here
you might want eventually, not things you'll get to soon.

Each entry names the item, what it is, why it's deferred, and the
**trigger** that would justify promotion (architecture.md amendment
+ ADR).

---

## Site UI/UX layer (Canvas-LMS-style left-nav + structured chapter pages)

**What:** redesign the deployed Astro site's chrome — a left
sidebar with chapter list (grouped Required / Optional, current
chapter highlighted), top breadcrumb with prev/next chapter
navigation + collection switcher (Lectures / Notes / Practice),
section-aware main pane with anchor TOC (using the section-list
frontmatter T4 already emits), and an `index.astro` landing page
that's a real entry point rather than a chapter-listing table.
Reference visual: a Canvas LMS module page (left rail + main
content with structured cards + completion checkmarks per item).
~1–2 sessions of work plus CSS.

**Status today:** the site is functional but visually plain —
basically the markdown body of each chapter wrapped in a minimal
HTML shell (`<header>cs-300</header>` + `<main>`). Reads correctly,
no navigation aids beyond the index page's two tables.

**Why deferred:**

- **Not Phase-N-blocking.** Per the [`../CLAUDE.md`](../CLAUDE.md#glossary)
  blocking definition: no later milestone is blocked by this (M3+
  reads/writes via API routes, not via the chrome layout); no two
  items within M2 fail without it (M2 acceptance was about
  "Astro shipped and content renders," all met).
- **Couples naturally with M3.** The Canvas-style layout has
  per-section completion checkmarks + sidebar progress indicators
  — those are state-service surfaces (read-status, annotations)
  that M3 owns. Building the chrome before M3 means either (a)
  shipping it without those affordances and retrofitting later,
  or (b) front-loading M3-shape decisions into UX work. Both are
  worse than waiting.
- **Real but not urgent.** The site is for personal study; the
  reader is the same person who built it; raw markdown rendering
  is functionally fine for "open the chapter, read it, close the
  tab." Cosmetic polish has diminishing returns until the
  interactive surfaces (M3+) start needing real UI hooks.

**Trigger to promote:** any of the following:

- M3 starts and the chrome decisions can no longer be deferred
  (read-status indicators need a sidebar to live in, annotations
  need a margin pane, etc.) — at that point a focused milestone
  ("M-UX") owns both the chrome and the M3 client surfaces.
- Multi-user use case emerges (someone else reading the site
  reports navigation friction).
- The site needs to be presentable to an external audience
  (course showcase, portfolio link).

**Cost of promotion:** new ADR documenting the layout decisions
(sidebar vs top-nav, in-chapter TOC pane vs scroll-spy, completion-
indicator state model), architecture.md amendment in §1 (add a UX
layer subsection), then a milestone breakout — ~1–2 focused
sessions of CSS + Astro layout work.

**Surfaced 2026-04-23** during M2 close-out. User explicit:
"updating and making the ui prettier and more user friendly" goes
in nice_to_have.

---

## §UX-2 — Collapsible chapter sections

**What:** wrap each chapter section (`<section>` rooted at the
section anchor in the rendered MDX) in a `<details>` element so
the user can collapse sections they're not currently reading,
shortening the visual length of long chapters (ch_4: 80 sections,
ch_3 / ch_4 lectures.pdf: 51–53 pages).

**Status today:** chapter pages render every section open. On
viewports without much vertical space (1280×800 or smaller) the
user scrolls a lot to land on the section they want — the right-
rail TOC + sticky-rail polish (T9 D2) helps with navigation but
doesn't shorten the content itself.

**Why deferred:** breaks the M3 ScrollSpy + read-tracking
contracts. M3's ScrollSpy uses `IntersectionObserver` to detect
which section is currently visible; collapsed `<details>` content
has zero size, so the observer never fires for closed sections,
breaking "current section" highlight + the read-status auto-mark.
A real fix has to coordinate `<details>` open/close with the
ScrollSpy + read-tracking islands — a non-trivial integration.
Three implementation routes:

  1. **Pandoc Lua filter** (`scripts/pandoc-filter.lua`) — wrap
     each `\section{}` in `<details><summary>`. Renders SSR; no
     JS needed for the basic collapse. M3 islands need an open-on-
     scroll-into-view escape hatch.
  2. **Astro JS island** — render plain sections SSR, hydrate a
     client-side script that wraps each `<h2>` heading in a
     toggle. Avoids the pandoc-filter risk of breaking the math /
     callout passthrough; adds a hydration cost.
  3. **Manual MDX** — author each chapter's MDX with explicit
     `<details>` blocks. Most flexible per-chapter; doesn't scale
     to the optional chapters' 80+ sections each.

**Trigger to promote:** user friction reading long chapters
without collapse, OR M5's review-queue UI lands and needs a
section-by-section "study mode" that toggles section visibility.
Either trigger justifies the M3-contract redesign cost.

**Cost of promotion:** ADR (record the chosen implementation
route + the M3-contract redesign), architecture.md amendment in
§1.6 (note the section-collapse interaction with ScrollSpy),
then a milestone breakout — likely ~1 focused session if route
(1) is chosen.

**Surfaced 2026-04-25** by M-UX T9 (D7) as a deferred-from-T9
follow-on. T9 polished the chrome (centered, sticky rails,
collection-aware navigation, landing pages, functional-test
harness); collapsible sections were considered but kept out of
T9 scope to avoid touching the M3 ScrollSpy + read-tracking
contracts in a polish task.
