# T9 — Layout polish + functional-test harness

**Status:** ✅ done 2026-04-25
**Source:** post-M-UX-close review session, 2026-04-25 — five UX issues surfaced after the T8 deploy gate by visual review of the live build at wide viewports + cross-collection navigation usability.
**Depends on:** T1–T8 (all closed)
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [`../../adr/0002_ux_layer_mdn_three_column.md`](../../adr/0002_ux_layer_mdn_three_column.md)

## Why T9 exists (context)

T8's audit gate verified build cleanliness + 37 pages + size budget + static-mode visual layout via the Selenium screenshot harness. What it did NOT catch: wide-viewport whitespace (the screenshots happened at 1280px and below; 2560px+ behavior was not exercised), non-sticky rails on long chapters (no scroll-state assertion in the harness), and cross-collection navigation friction (LeftRail hardcoded to `lectures/` collection regardless of current path).

Five fixes land in T9. The harness gains a sibling **functional-test** script (`scripts/functional-tests.py`) that runs Selenium-driven assertions (not just screenshots) so future code-task audits surface this class of regression at gate-time, not at deploy review.

## Goal

1. **Centered chrome container** — chrome doesn't float apart on wide viewports.
2. **Sticky rails with internal scroll** — rails follow the user down long chapters; scroll within themselves if their content exceeds viewport height.
3. **LeftRail collection-aware hrefs** — chapter links mirror the current collection (notes-from-notes, practice-from-practice).
4. **Functional breadcrumb links** — `cs-300` → home, collection-name segment → new collection-landing pages, current chapter title stays as `aria-current="page"` text.
5. **Three new collection-landing pages** — `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` each render 12 chapter cards (Required/Optional grouping) with the current-collection link emphasised on each card.
6. **Functional-test harness** — `scripts/functional-tests.py` (Selenium 4 + the existing dev-dep) runs pass/fail assertions against the preview server, exits non-zero on regression. Initial test suite covers the five T9 fixes; future tasks add their own assertions.

## Spec deliverables

### D1. Centered chrome container (`src/layouts/Base.astro`)

- Wrap the existing `.chrome` grid in a centered container (or apply `max-width` directly on `.chrome`): `max-width: 1400px; margin-inline: auto; width: 100%`.
- At ≥1024px and ≤1400px: the existing `260px 1fr 280px` grid template stays (rails snug to content).
- At >1400px: the chrome stays centered, no whitespace bleed between rails and the viewport edge.
- New token in `src/styles/chrome.css`: `--mux-chrome-max: 1400px`.
- Mobile (<1024px) behavior unchanged (single column, drawer).

### D2. Sticky rails with internal scroll (`src/layouts/Base.astro`)

- `aside[data-slot="left-rail"]` and `aside[data-slot="right-rail"]` at ≥1024px gain:
  - `position: sticky;`
  - `top: var(--mux-breadcrumb-height);` — offset for the sticky breadcrumb.
  - `align-self: start;` — critical, otherwise the sticky element fills its grid cell and has no stick range.
  - `max-height: calc(100vh - var(--mux-breadcrumb-height) - var(--mux-space-2));`
  - `overflow-y: auto;`
- New token in `src/styles/chrome.css`: `--mux-breadcrumb-height: 52px` (measured value; adjust if breadcrumb height changes).
- Verify the parent grid container has no `overflow: hidden` (would break sticky).
- Mobile drawer behavior preserved (no sticky on the off-canvas drawer).

### D3. LeftRail collection-aware hrefs (`src/components/chrome/LeftRail.astro`)

- Read current collection from `Astro.url.pathname` via the same regex pattern Breadcrumb uses: `/\/(lectures|notes|practice)\//`. Default to `lectures` if no match.
- Build chapter hrefs as `${baseUrl}/${currentCollection}/${chapter.id}/` instead of the hardcoded `lectures/`.
- No other LeftRail logic changes. Read-status indicator behavior, completion-indicator island, M3 contracts, all unchanged.

### D4. Functional breadcrumb links (`src/components/chrome/Breadcrumb.astro`)

- Path segments rendered as:
  - `cs-300` → `<a href="${baseUrl}/">cs-300</a>` (home crumb)
  - `Lectures` / `Notes` / `Practice` (current collection capitalised) → `<a href="${baseUrl}/${currentCollection}/">…</a>` (link to NEW collection landing page from D5)
  - Current chapter title (`ch_N — subtitle`) → stays as `<span aria-current="page">…</span>` (no link)
- Existing collection-switcher pills + prev/next buttons on the right side of the breadcrumb bar: unchanged.
- The `Lectures`/`Notes`/`Practice` middle segment text MUST reflect the current collection (was always rendered as `Lectures` in the cycle-1 implementation per spec example; verify and fix if needed).

### D5. Three new collection-landing pages

Three files, parallel structure:
- `src/pages/lectures/index.astro` → renders at `/DSA/lectures/`
- `src/pages/notes/index.astro` → renders at `/DSA/notes/`
- `src/pages/practice/index.astro` → renders at `/DSA/practice/`

Each page:
- Uses `HomeLayout.astro` (sibling layout from T5, no chrome rails).
- Header: `<h1>Lectures</h1>` (or `Notes` / `Practice`) + a one-line description.
- Body: `<ChapterCard>` × 12 in Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13) grouping, identical to the index dashboard's structure.
- Each card emphasises the page's collection: extend `ChapterCard.astro` with an optional `highlight={"lectures"|"notes"|"practice"}` prop; if set, that collection's link gets a stronger visual treatment (filled button or accent background); the other two stay as subtle text links.
- Default landing-page card behavior: clicking the card-level link OR the highlighted collection link both go to that collection's chapter page.
- No M3 surfaces (no annotations, no mark-read, no scroll-spy — these pages are static navigation).
- No drawer (single column, like the index).

### D6. Functional-test harness (`scripts/functional-tests.py`)

- New Python script, sibling to `scripts/smoke-screenshots.py`. Reuses the same Selenium WebDriver + headless Chrome + isolated `/tmp/cs300-smoke-*` user-data-dir setup (extract shared logic into a small helper module if it grows).
- Reads a config from `scripts/functional-tests.json` defining test cases. Each test case: `{name, url, viewport, scroll?, asserts: [...] }`. Each assertion: `{type, selector?, expected, ...}`.
- Assertion types (initial set):
  - `attr` — element selector + attribute name + expected value (string equality or regex).
  - `count` — element selector + expected count (integer).
  - `getBoundingClientRect` — element selector + property (`top`/`left`/`width`/etc.) + comparator (`==`/`<=`/`>=`) + expected pixel value (after optional pre-scroll).
  - `href-pattern` — element selector + expected href regex.
  - `aria-current` — element selector + expected `aria-current` attribute presence.
- CLI: `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321`. Exits 0 on all-pass, non-zero on any failure. Prints per-test pass/fail with failure detail (selector, expected, actual).
- Initial test suite (one config file) covers all five T9 fixes — assertions defined in **Acceptance checks** below.
- Brief doc updates in `scripts/smoke-screenshots.md` (or new `scripts/functional-tests.md`) covering install (already done — `requirements-dev.txt`) + run.

### D7. `nice_to_have.md` entry — collapsible sections

Add a single entry under a new `## §UX-2 — Collapsible chapter sections` heading documenting the deferred collapse work: motivation (long chapters), risk (M3 ScrollSpy + IntersectionObserver fires only on visible elements; closed `<details>` content has zero size, observer never fires; breaks scroll-spy + read-tracking), three implementation options (pandoc Lua filter, Astro JS island, manual MDX), trigger for promotion (user friction OR M5 review-queue UI needs sectioned content). Single paragraph each, total ~12 lines.

Create `design_docs/nice_to_have.md` if it doesn't exist (per CLAUDE.md, the file is created only when needed).

## Acceptance checks (functional-test assertions, runnable by the auditor)

The Auditor runs `npm run preview` (or trusts a Builder-supplied `dist/`), then runs `python scripts/functional-tests.py`, and confirms exit 0. Each AC corresponds to one or more assertions in `scripts/functional-tests.json`.

| AC | Assertion (informal) | Test case in config |
| --- | --- | --- |
| AC1 | At 2560×1080, `.chrome`'s `getBoundingClientRect().left + width !== viewport.width` (chrome is centered, not flush to viewport edge); rails are within 100px of content edges. | `chrome-centered-2560` |
| AC2 | At 1024×768, `.chrome` fills viewport (rails snug to viewport edges). | `chrome-fills-1024` |
| AC3 | After `window.scrollTo(0, 2000)` on a long lectures chapter (ch_4), `aside[data-slot="left-rail"].getBoundingClientRect().top` ∈ [0, 100] (rail is sticky-pinned near viewport top, NOT scrolled out). | `left-rail-sticky-after-scroll-ch4` |
| AC4 | After scrolling to mid-chapter, `aside[data-slot="right-rail"].getBoundingClientRect().top` ∈ [0, 100] (sticky right rail). | `right-rail-sticky-after-scroll-ch4` |
| AC5 | On `/DSA/notes/ch_4/`, every LeftRail chapter `<a>` href matches `/DSA/notes/ch_\d+/` (NOT `/DSA/lectures/`). | `leftrail-collection-aware-notes` |
| AC6 | On `/DSA/practice/ch_7/`, every LeftRail chapter `<a>` href matches `/DSA/practice/ch_\d+/`. | `leftrail-collection-aware-practice` |
| AC7 | Breadcrumb `cs-300` segment is an `<a>` with `href="${baseUrl}/"`. | `breadcrumb-cs300-link` |
| AC8 | On `/DSA/notes/ch_4/`, breadcrumb middle segment text is `Notes` (not `Lectures`) AND href is `${baseUrl}/notes/`. | `breadcrumb-collection-link-notes` |
| AC9 | Current chapter title segment in breadcrumb has `aria-current="page"` and is NOT an `<a>` (use a `<span>` or unwrapped text). | `breadcrumb-current-page-no-link` |
| AC10 | `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` each return HTTP 200 and render `<article class="chapter-card">` × 12. | `landing-pages-render-three` |
| AC11 | On `/DSA/lectures/`, each chapter card's "Lectures" link has the highlight class (e.g., `is-current-collection`); the Notes and Practice links do not. | `landing-page-highlight-lectures` |
| AC12 | Build still produces 40 prerendered pages (was 37 + 3 new landing pages). | (build-time grep, not selenium) |
| AC13 | `data-interactive-only` count on `dist/client/lectures/ch_4/index.html` unchanged at 87 (T7 cycle 2 baseline). | (build-time grep) |
| AC14 | M3 contracts unchanged — `cs300:read-status-changed`, `cs300:toc-read-status-painted`, `cs300:annotation-added`, `cs300:drawer-toggle` events still 1d+listener counts unchanged. | (build-time grep) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview` (in background or separate terminal).
3. `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — confirm exit 0.
4. `python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321 --output .smoke/screenshots/` — capture visual evidence at all four breakpoints + the new landing page routes. Add the three new routes (`/DSA/lectures/`, `/notes/`, `/practice/`) to `smoke-routes.json` so they're covered going forward.
5. Auditor opens at minimum: `.smoke/screenshots/lectures-ch4-2560x1080.png` (NEW viewport — verify centered chrome), `lectures-ch4-1280x800-midscroll.png` (verify sticky rails), `lectures-2560x1080.png` (NEW landing page).

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done 2026-04-XX`.
- (b) `tasks/README.md` T9 row.
- (c) `m_ux_polish/README.md` task table T9 row.
- (d) Milestone-level `m_ux_polish/README.md:4` Status: re-flip from the (now-stale) `✅ done 2026-04-25` to `✅ done 2026-04-XX` (T9 close date) — the milestone re-opens for T9 and re-closes when T9 lands. Update the top-level `design_docs/milestones/README.md` similarly.

## Carry-over from prior audits

None. T9 inherits no carry-over (T8 close completed the M-UX audit cycle for T1–T8). All deferred items from T1–T8 are documented in their respective issue files; T9 does not absorb them.

## Out of scope

- Collapsible chapter sections — see D7 / `nice_to_have.md` entry.
- Visual style sweep (palette, typography family) — still deferred per ADR-0002.
- New M3 surfaces (annotation pane redesign, mark-read button redesign).
- Search.
- New chapter content — chapter MDX is untouched.
