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

## §UX-3 — Interactive-mode Selenium harness extension

**What.** Extend `scripts/smoke-screenshots.py` (or
`scripts/functional-tests.py`) with a `--mode=interactive` flag
that boots against `npm run dev` (where `/api/health` is reachable
and `detectMode()` flips to `'interactive'`). Add ActionChains-driven
interaction smokes: hamburger click → drawer slide-in observed,
drawer-link-click → drawer closes, Tab focus-trap inside open drawer,
Esc closes, backdrop-click closes, round-trip select → annotate →
reload → annotation persists in the rail, mark-read button click →
read-indicator dot paints + bullet flips state.

**Status today.** Static-mode-only harness is sufficient for
layout-at-viewport coverage; the interactive-mode round-trip is
structurally inferable (M3 component scripts byte-identical at the
source level — verified across T6 + T7 + T8 audits) but never
literally smoke-tested end-to-end.

**Why deferred.** Real signal is "user reports interactive-mode
regression on push" or "M5 lands and needs end-to-end interactive
coverage as part of its DoD." Either trigger justifies the harness
extension; pre-trigger work is speculative.

**Trigger to promote.** As above.

**Cost of promotion.** ~1 focused session — extend
`_selenium_helpers.py` to also support `npm run dev`, add the
interaction-matrix config block, add `--mode` switch + a couple of
ActionChains helper functions.

**Surfaced 2026-04-25** by M-UX T8 (deferral declared) +
propagated by the M-UX milestone-level deep review (M-UX-DR-04).

## §UX-4 — Replace SSR-embedded section-id JSON with `GET /api/sections` endpoint

**What.** `src/components/chrome/CompletionIndicator.astro` currently
inlines a per-page `<script type="application/json">` payload mapping
every chapter id to its section-id list. The payload is the same on
every page (12 chapters × ~57 sections each → ~12 KB JSON × 36 chapter
routes ≈ ~432 KB cumulative in `dist/client/`). Move the data behind a
new `GET /api/sections` endpoint that the island fetches once per
chapter on mount, the same way `RightRailReadStatus` already fetches
`/api/read_status?chapter_id=…`. This shrinks the static bundle by
~432 KB (~10% of current `dist/client/`).

**Status today.** Acceptable cost vs the alternative (a new API
contract in the M3 surface that doesn't exist yet); the +432 KB sits
inside the +756 KB cumulative M-UX delta and isn't blocking anything.

**Why deferred.** The cleanest landing is alongside M5's review-queue
work — M5 will likely need the same per-section data for its scheduling
surface, so building the endpoint as part of M5's API design avoids
double-implementing it. Pre-M5, the savings aren't worth the
M3-style API design + implementation cost.

**Trigger to promote.** Either (a) measurable budget pressure (e.g.
cumulative `dist/client/` approaches a hosting-tier limit), or (b) M5
lands an API surface that subsumes the data, at which point
CompletionIndicator switches to the M5 endpoint as a near-free
follow-up.

**Cost of promotion.** ~1 session if M5 already added a
section-list endpoint that returns the same shape; ~2–3 sessions if
the endpoint has to be designed + added in isolation (pick a
schema, add the route handler, update CompletionIndicator's fetch +
event-listener wiring, regen Drizzle schema if it touches state, update
functional-test harness with a fetch-vs-inline assertion).

**Surfaced 2026-04-25** by M-UX T2 (M-UX-T2-ISS-02) +
re-surfaced at milestone close by the M-UX deep review (M-UX-DR-05).

---

## §UX-5 — `--mux-accent` semantic split (current vs achievement)

**What.** The single `--mux-accent` colour token currently signals
seven different things: chapter-number tag, current section in the
right-rail TOC, current item in the left rail, current collection
pill, "Mark read" button, completion indicator, and the
interactive-mode badge. The 2026-04-27
[`UI_UX_Review.pdf`](UI_UX_Review.pdf) F12 finding (LOW) flags
that this overloads the accent — when everything is green, nothing
is. Proposed split: `--mux-current` for "where you are now"
(neutral fill, no semantic weight); `--mux-achievement` for "what
you've completed / what's due / what changed" (keep the green).

**Status today.** Acceptable visual debt. The chrome shipped via
M-UX with one colour because ADR-0002 explicitly deferred the
visual style sweep ("M-UX uses the system font stack + one accent
colour"). M-UX-REVIEW T6 picks up the typography half of that
deferral but leaves the colour half intact for the §UX-5 reasons
below.

**Why deferred.** The split's value comes from contrasting
*current* (a chrome-state signal — passive) against *achievement*
(an event signal — completed, due, recently changed). M5 hasn't
landed yet; in pre-M5 static + interactive mode, the only event
signals are read-status (binary — read / unread, mostly painted
in the left-rail completion indicators + right-rail per-section
indicators, both already visible enough) and the interactive-mode
badge (one-time, small). There's no review-due, no streak, no
recency surface to *contrast* the "current" state against. Splitting
the accent before that contrast exists is purely a refactor with
no visual-design payoff — the user sees the same green either way.

**Trigger to promote.** M5 ships AND introduces a review-due / FSRS
queue surface that paints in the chrome (e.g. dot indicators on
chapter cards, queue counts in the left rail, due-soon badges on
section anchors). At that point the accent collision becomes
observable — a "due for review" indicator shouldn't read the same
as "this is the current chapter." Pre-promotion, capture the
M5 surface list and decide whether the split needs two tokens
(`--mux-current` + `--mux-achievement`) or three (separating
"due-soon" from "completed").

**Cost of promotion.** ~1 session — define the new token(s) in
`src/styles/chrome.css`, sweep the seven existing `--mux-accent`
consumers in the chrome components (each maps to either current or
achievement), update ADR-0002's "Color palette" deferral entry
similarly to T6's typography amendment, add functional-test
assertions confirming the right consumer carries the right token.

**Surfaced 2026-04-27** by the
[`UI_UX_Review.pdf`](UI_UX_Review.pdf) F12 finding (LOW); review
recommendation explicitly named M5 as the trigger ("Best done
after M5 lights up completion").
