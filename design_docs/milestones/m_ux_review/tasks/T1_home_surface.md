# T1 — Home surface: card actions, Required label, continue-reading

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) findings F1 (HIGH, ~2h), F2 (MED, ~30m), F3 (MED, ~1h)
**Depends on:** —
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), [`design_docs/architecture.md` §1 page chrome](../../../architecture.md)

## Why T1 exists (context)

The home surface (`src/pages/index.astro` + the three collection-landing pages from M-UX T9 + the shared `ChapterCard.astro`) is what every visit lands on first. The 2026-04-27 review found three issues there:

- **F1 (HIGH).** Each chapter card has three jobs (open Lectures / Notes / Practice) but renders them as three identical low-contrast text links separated by spaces. A first-time visitor has to *read* the card to discover it offers three destinations. Compounding: every card is visually identical, the chapter-number tag (`ch_4`) is doing all the differentiation work in 12px mono. Buttons should look like buttons.
- **F2 (MED).** The most consequential piece of information on the home page — *which six chapters are graded* — renders as 12px uppercase tracked subtext. A student scanning to "what do I have to do?" has to look twice. Should be H2-weight with a one-line subtitle that does real work ("6 graded chapters, ~25 hours of reading"), not the current tautological "SNHU CS 300 syllabus."
- **F3 (MED).** The mastery-dashboard slots (`recently-read`, `due-for-review`) are correctly gated `data-interactive-only` per the M-UX T5 contract — but that means the static-mode home page (the only mode most visitors see) has *nothing* about the user. No last-read marker, no resume link, no bookmark. For a 200-hour study product, that's a missed orientation cue. A localStorage-backed "Continue reading" strip costs nothing structural and replaces the empty space until M5 lights up the SQLite-backed surface.

All three land on the same surface (home + three landing pages + `ChapterCard.astro`) so they ship as one task. ~3.5h total per the review's effort estimates.

## Goal

1. **F1 — chapter cards telegraph their three jobs.** Lectures / Notes / Practice render as visually-distinct buttons (filled-primary + outline pair), each card gains a one-line subtitle below the title (the chapter blurb), and a section-progress bar SSRs at 0/N (interactive-mode lights it up later via the existing `read_status` event flow).
2. **F2 — Required / Optional reads as a section header.** Promote from 12px tracked subtext to H2 weight; replace "SNHU CS 300 syllabus." with a subtitle that names a concrete unit of effort.
3. **F3 — Static-mode "Continue reading" strip.** New island under `src/components/home/` (or wherever fits) reads from localStorage, renders a last-visited-chapter card at the top of the index page, and is invisible if no localStorage entry exists. localStorage write happens on every chapter route via a tiny always-loaded snippet in `Base.astro`.

## Spec deliverables

### D1. Chapter card action buttons (F1, `src/components/chrome/ChapterCard.astro`)

Current shape (from M-UX T5 + T9):

```astro
<article class="chapter-card">
  <header>
    <span class="ch-tag">ch_4</span>
    <h3>Lists, stacks, queues, deques</h3>
    <p class="ch-subtitle">Chapter 4</p>
  </header>
  <nav class="ch-collections">
    <a href={...lectures}>Lectures</a>
    <a href={...notes}>Notes</a>
    <a href={...practice}>Practice</a>
  </nav>
</article>
```

Replace `<nav class="ch-collections">` body with three buttons styled as a primary + two outline buttons. The card-level `highlight` prop (added in M-UX T9 D5) determines which collection is the primary; on the index page (no `highlight`), the primary defaults to `lectures` (the most common destination for a first chapter visit per the review's reasoning).

- **Markup:** `<a class="ch-action ch-action--primary" href={lecturesHref}>Lectures</a>` for the highlighted/default-primary collection; `<a class="ch-action ch-action--outline" …>` for the other two.
- **Styling (`src/styles/chrome.css`):** new `.ch-action` token class (~30 lines of CSS — padding 8px 12px, border-radius var(--mux-radius-md), filled = `--mux-accent` background + white text, outline = transparent background + 1px `--mux-border` + body text colour). Hover/focus state on both. Mobile-friendly tap target ≥44px height.
- **Subtitle line below the H3** (one of two compounded F1 fixes). The card already has `<p class="ch-subtitle">Chapter 4</p>` — replace with the chapter blurb from `scripts/chapters.json` (read via the existing prop-passing chain). Add `subtitle` field to chapters.json if not already present (per-chapter one-liners; ch_4 → "Linear, ordered collections — the foundation for trees and graphs"). One field per chapter, ~12 entries.
- **Section progress bar (also F1).** Add `<div class="ch-progress" data-interactive-only data-chapter-id={ch.id}>` below the subtitle. SSR-rendered as `0 / N sections` with a 0%-fill bar (the bar shape exists; it just shows zero in static mode). Interactive mode: existing `RightRailReadStatus` already fetches read counts; extend the same fetch to populate the home-card progress on mount via the `cs300:read-status-changed` event the chrome already broadcasts. **No new API surface.**
- **Preserve the M3 + T9 contracts.** The card-level link, the `highlight` prop behaviour, the `data-interactive-only` carriers — all unchanged. The progress bar is one more `data-interactive-only` carrier.

### D2. Required / Optional section headers (F2, `src/pages/index.astro` + `src/pages/{lectures,notes,practice}/index.astro`)

All four landing surfaces share the same `<section class="ch-group">` structure today (`<header class="ch-group-eyebrow">REQUIRED</header><p class="ch-group-sub">SNHU CS 300 syllabus.</p>`). Promote both surfaces:

- **Header:** `<h2 class="ch-group-heading">Required</h2>` (was `<header class="ch-group-eyebrow">REQUIRED</header>`). Style: 1.5rem, semibold, body colour. Drop the all-caps tracked treatment; the header text reads naturally.
- **Subtitle:** "6 graded chapters, ~25 hours of reading" for Required; "Depth chapters; outside the graded path." stays for Optional but bumps to body-size weight (was 12px).
- **Spacing:** ~1.25rem above each `.ch-group` (was ~0.5rem). Sections feel like sections.
- **Don't break the existing functional-test assertions** — the four landing pages each render `<article class="chapter-card">` × 12 (M-UX T9 AC10 / AC11 / AC12). Heading text changes are fine; structural classes stay.

### D3. Continue-reading strip (F3)

Three pieces:

- **Writer (always-loaded, `src/layouts/Base.astro`).** A small `<script>` block (≤20 lines, no external deps) that runs on every chapter route. On `pageshow` (or DOMContentLoaded), reads `Astro.url.pathname` + `document.title` + the current scroll position via `requestAnimationFrame`, writes a single `localStorage["cs300:last-visit"] = JSON.stringify({path, title, scrollY, ts})` entry. Update `scrollY` on a debounced scroll listener (≤4 writes/sec). Invisible to the user. Strictly local to the browser; not shipped to the state service. Skips writes on the index + the three collection-landing pages (no chapter context to record). The script ships in static mode + interactive mode — it's a localStorage primitive, not an interactive surface.
- **Reader island (new, `src/components/home/ContinueReading.astro`).** Renders an empty `<aside data-slot="continue-reading">` in SSR. A tiny `<script>` block in the same component reads `localStorage["cs300:last-visit"]`, and if present, populates the slot with a card linking back to the recorded path + title (and a "Resume from where you left off" eyebrow). If absent, leaves the slot empty (CSS `:empty { display: none }`). One DOM mutation, no framework.
- **Wiring on the four landing surfaces.** Add `<ContinueReading />` at the top of each of the four landing pages (`src/pages/index.astro`, `src/pages/lectures/index.astro`, `src/pages/notes/index.astro`, `src/pages/practice/index.astro`). Above the Required section.

When M5 lands, the SQLite-backed dashboard slot replaces this — the localStorage primitive then becomes redundant and gets removed in M5's task. Until then, the page actually knows you. **No new API surface, no SQLite touch.**

### D4. Architecture.md amendment (F3 follow-up)

`design_docs/architecture.md` §1 (the page-chrome subsection) gains one paragraph documenting the localStorage primitive — what it stores, where it lives, when it's cleared (it isn't — it overwrites; M5 supersedes), and the contract that the writer skips landing pages so chapter-resume is the only signal.

The existing architecture invariants stay intact: no client-side persistence beyond browser-local hints, no migration story (single-key, no schema), and no role in the public deploy beyond rendering the strip if the user has visited a chapter on this device before.

### D5. New `chapters.json` `subtitle` field

If [`scripts/chapters.json`](../../../../scripts/chapters.json) doesn't already carry per-chapter one-liners (it has `id`, `title`, `n`, `required` per M-UX T2), add a `subtitle` string to each row. 12 entries, one each. Suggested copy lives in `chapters/ch_N/lectures.tex` "Chapter map" ideabox openings (already exists for ch_1, ch_4, ch_7, ch_9, ch_10, ch_11, ch_12, ch_13 per CHANGELOG); for ch_2/3/5/6 write a one-liner from the chapter title + a sentence of body. Keep ≤80 chars per subtitle so cards don't wrap to three lines.

### D6. Functional-test assertions (`scripts/functional-tests.json`)

New test cases:

- `home-card-action-classes` — on `/`, every `.chapter-card` contains exactly one `.ch-action--primary` and exactly two `.ch-action--outline`.
- `home-card-progress-carrier` — on `/`, every `.chapter-card` contains exactly one `[data-slot="ch-progress"]` (or whichever attribute D1 picks) carrying `data-interactive-only` + `data-chapter-id`.
- `home-required-heading` — on `/`, the Required group's heading is an `<h2>` with text `Required` (was an `<header>`); the Optional group's heading is `<h2>` with text `Optional`.
- `home-required-subtitle` — on `/`, the Required group's subtitle text matches `/graded chapters/` (rules out the old "SNHU CS 300 syllabus.").
- `landing-required-heading-lectures` — same heading assertion on `/DSA/lectures/`.
- `landing-required-heading-notes` — same on `/DSA/notes/`.
- `landing-required-heading-practice` — same on `/DSA/practice/`.
- `home-continue-reading-empty-by-default` — on `/` with cleared localStorage, `<aside data-slot="continue-reading">` either doesn't render or is `:empty` (no resume card).
- `home-continue-reading-populated` — after visiting `/DSA/lectures/ch_4/` then `/`, `<aside data-slot="continue-reading"> a` href ends with `/DSA/lectures/ch_4/`. (Uses Selenium's `driver.get` to seed localStorage, then navigates.)

All assertions use the existing assertion types (`count`, `attr`, `text-pattern`, `href-pattern`). No new harness machinery.

## Acceptance checks (functional-test assertions, runnable by the auditor)

The Auditor runs `npm run preview`, then `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321`, and confirms exit 0. Each AC corresponds to one or more assertions defined above.

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F1 | Every `.chapter-card` on `/` has one `.ch-action--primary` and two `.ch-action--outline`. | `home-card-action-classes` |
| AC2 | F1 | Every `.chapter-card` carries one `data-slot="ch-progress"` with `data-interactive-only` + `data-chapter-id`. | `home-card-progress-carrier` |
| AC3 | F1 | Every `.chapter-card` `<p class="ch-subtitle">` text is the per-chapter blurb from `chapters.json` (regex matches each chapter's known subtitle). | `home-card-subtitle-blurb` |
| AC4 | F2 | Required / Optional group headings on all four landing surfaces are `<h2>` (not `<header>` / `<span>` / `<p>`). | `home-required-heading`, `landing-required-heading-{lectures,notes,practice}` |
| AC5 | F2 | Required-group subtitle on `/` matches `/graded chapters/` regex. | `home-required-subtitle` |
| AC6 | F3 | After clearing localStorage, `<aside data-slot="continue-reading">` is empty / display:none on `/`. | `home-continue-reading-empty-by-default` |
| AC7 | F3 | After visiting `/DSA/lectures/ch_4/` then loading `/`, the resume card links back to `/DSA/lectures/ch_4/`. | `home-continue-reading-populated` |
| AC8 | F1, F2, F3 | M-UX T9 AC10 / AC11 / AC12 still pass — landing pages still render `<article class="chapter-card">` × 12, highlight class still on the right collection link, build still produces 40 prerendered pages. | (existing T9 cases) |
| AC9 | architecture | `design_docs/architecture.md` §1 has a paragraph mentioning `cs300:last-visit` (or the chosen key) + localStorage. | (doc-content grep, not selenium) |
| AC10 | F1 | `scripts/chapters.json` has a `subtitle` string for every chapter id present in the file. | (build-time JSON validate) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview` (background or separate terminal).
3. `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — confirm exit 0 (existing M-UX assertions + new T1 assertions).
4. `python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321 --output .smoke/screenshots/` — capture visual evidence at all four breakpoints + the four landing pages. Auditor opens at minimum: `index-1280x800.png`, `lectures-1280x800.png`, `notes-1280x800.png`, `practice-1280x800.png` to verify F1 button styling + F2 heading weight + F3 strip render.
5. Auditor verifies the localStorage primitive: navigate to `/DSA/lectures/ch_4/` in DevTools, scroll, return to `/`, confirm the resume card renders and its link points back. Then `localStorage.clear()` + reload `/`, confirm the strip disappears.

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T1 row.
- (c) `m_ux_review/README.md` task table T1 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkboxes for F1, F2, F3 + the architecture.md note + the no-regression bullet (with citation parenthetical pointing at the per-task issue file).
- (e) Top-level `design_docs/milestones/README.md` if M-UX-REVIEW changes status (e.g. `todo` → `active`).

## Carry-over from prior audits

None. T1 is net-new from the 2026-04-27 review.

## Out of scope

- F4 (right-rail TOC hierarchy) — T2.
- F5 / F6 / F8 (chapter chrome) — T3.
- F9 / F10 (mobile) — T4.
- F7 (code blocks) — T5.
- F11 (typography) — T6.
- F12 (accent semantic split) — `nice_to_have.md` §UX-5.
- M5-style review-due / "next up" surfaces — those are M5's slots (already gated `data-interactive-only` per M-UX T5).
- Multi-device sync of the continue-reading strip — single-device localStorage by design; M5 supersedes for cross-device.
