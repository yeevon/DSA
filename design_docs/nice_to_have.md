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
