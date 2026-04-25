# T3 — Top breadcrumb — Audit Issues

**Source task:** [../tasks/T3_breadcrumb.md](../tasks/T3_breadcrumb.md)
**Audited on:** 2026-04-24
**Audit cycle:** 1 of up to 10 (first cycle — issue file created)
**Audit scope:** spec-vs-implementation re-verification of every T3 spec deliverable + every auditor-smoke acceptance check; design-drift re-check against [`design_docs/architecture.md`](../../../architecture.md) §1.6 (Page chrome — UX layer); ADR-0002 §"Decision" (top-breadcrumb commitment); CLAUDE.md non-negotiables (BASE_URL discipline, status-surface flips, cross-chapter ref discipline — no ch_8); T1/T2 issue-file carry-over (no items targeted T3); status-surface flips on all four surfaces (per-task spec, tasks/README, milestone README task table, Done-when bullet 4); gate re-run by rebuilding from scratch (`npm run build` — auditor did not trust the Builder's `dist/client/`); BASE_URL hardcoding sweep per MUX-BO-ISS-02 / DA-1 / DA3-A; sticky-CSS positioning context against the T1 grid layout; spec-deviation adjudication (manifest subtitle vs spec path example); M3 surface preservation; `nice_to_have.md` boundary. Fresh `npm run build` re-executed by the auditor reproduces the Builder's reported numbers exactly: `du -sb dist/client/` = `5157010`, page count `37`, 1× breadcrumb per chapter page, 0× breadcrumb on `index.html`, M3 surface counts (6× annotate-button, 6× annotations-pane, 8× mark-read-button, 12× section-nav) preserved, 19× `data-interactive-only` (unchanged from T2), `<article>` wrapper present in all three routes.
**Status:** ✅ PASS

## Design-drift check

No drift detected. Cross-checked against:

- **architecture.md §1.6 (Page chrome — UX layer).** The architecture commitment "Top breadcrumb (sticky on scroll) — path indicator (`cs-300 / Lectures / ch_4 — …`), collection switcher (Lectures / Notes / Practice), prev/next chapter buttons" — implemented. The static-mode posture commitment "Sticky breadcrumb is pure CSS; no JS required" — implemented (Breadcrumb.astro is zero-JS, sticky lands as `position: sticky; top: 0; z-index: 50` in the externalised `_astro/Breadcrumb.BmHgLMAI.css` chunk; the component renders three plain `<a>` links in the collection switcher and one `<a>` each for prev/next + two inert `<span>` boundaries — no script tag in the component). Boundary chapters degrade gracefully (no `<a>` emitted at chapter-list edges per MDN-style "disabled link" pattern).
- **ADR-0002 §"Decision" — top-breadcrumb commitment.** "Top breadcrumb — sticky on scroll. Path: `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues`. Collection switcher (Lectures / Notes / Practice) lives here. Prev / Next chapter buttons flank the breadcrumb." — every ADR commitment fulfilled. The path-segment-and-switcher-and-prev/next ordering matches the ADR diagram. Future surface hooks (T7 hamburger, M5 review-queue badge) are accommodated by the flex-row structure but not pre-implemented (YAGNI per CLAUDE.md).
- **CLAUDE.md cross-chapter ref discipline.** The 12 chapters surfaced via prev/next derive from `scripts/chapters.json` via `[...chapters].sort((a, b) => a.n - b.n)` ([Breadcrumb.astro:65](../../../../src/components/chrome/Breadcrumb.astro#L65)). The manifest itself contains `ch_1..ch_7, ch_9..ch_13` — no `ch_8`. ch_7's next correctly resolves to ch_9 (`<a href="/DSA/lectures/ch_9/" rel="next" aria-label="Next chapter: ch_9 — AVL and red-black trees">` in `dist/client/lectures/ch_7/index.html`); ch_9's prev correctly resolves to ch_7 (`<a href="/DSA/lectures/ch_7/" rel="prev" aria-label="Previous chapter: ch_7 — Heaps and priority queues">` in `dist/client/lectures/ch_9/index.html`). The skip is data-driven (`n`-ordering on the manifest), not slug-arithmetic — flips a slug-arithmetic regression class into a HIGH if a future Builder ever re-introduces it. Cross-checked against the cs-300 chapter map in CLAUDE.md ("ch_1–7, ch_9–13 only — NO ch_8") — full match.
- **CLAUDE.md BASE_URL discipline (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1 + MUX-BO-DA3-A).** `grep -nE '/DSA/' src/components/chrome/Breadcrumb.astro` returns 3 hits (lines 36, 39, 41) — all inside `//` doc-comment lines that document the BASE_URL convention itself. No source-level `href`/`src`/`action` hardcoding (`grep -nE 'href=["\x27]/DSA/' src/components/chrome/Breadcrumb.astro` returns empty). Reviewer-eyes per DA3-A reviewer policy passes. Built artefacts resolve `${import.meta.env.BASE_URL}` to `/DSA/` correctly (e.g. `<a href="/DSA/lectures/ch_4/" class="collection-pill is-current"`).
- **`nice_to_have.md` boundary.** No silent adoption of dark mode / search / typography sweep / animation work. T3 uses only the chrome.css tokens introduced by T1 and consumed in T2 + T3 (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`, `--mux-accent-bg`, `--mux-accent`, `--mux-border-subtle`, plus the spacing scale). No new deps.
- **Dependencies.** `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` returns empty. CHANGELOG records `Dep audit: skipped — no manifest changes` — correct.
- **Status-surface discipline (all four).** Verified one-for-one against CLAUDE.md non-negotiables:
  - (a) Per-task spec status: `**Status:** ✅ done 2026-04-24` ([T3_breadcrumb.md:3](../tasks/T3_breadcrumb.md#L3)) ✅
  - (b) `tasks/README.md` row: `T3 ... ✅ done 2026-04-24` ✅
  - (c) Milestone README task table: `T3 ... ✅ done 2026-04-24` ✅
  - (d) Milestone README Done-when bullet 4 ("Top breadcrumb — sticky on scroll, shows path …, hosts collection switcher … + prev/next chapter buttons"): flipped `[ ] → [x]` with `(T3 issue file)` citation. T3 alone fully satisfies bullet 4 — every clause of the bullet is structurally present in the built artefacts (sticky CSS rule, path text, collection switcher with three pills, prev/next chapter buttons with disabled boundaries). Bullet 1 (three-column desktop layout) correctly left `[ ]` per T1 issue file M-UX-T1-ISS-01 — T4 still must land before "renders cleanly on every chapter route" predicate is fully satisfied (right rail still empty).

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| **Spec deliverable 1a** — Path renders `cs-300 / Lectures / ch_4 — <subtitle>` (each segment a link except the last) | ✅ PASS | Built `dist/client/lectures/ch_4/index.html` emits `<ol aria-label="Breadcrumb path"><li><span class="path-root">cs-300</span></li><li><a href="/DSA/lectures/ch_4/">Lectures</a></li><li aria-current="page"><span class="path-current">ch_4 — Lists, stacks, queues, deques</span></li></ol>`. Three segments: root (`cs-300`, plain span), middle (`Lectures`, real anchor at the same chapter URL — clickable), last (`ch_4 — <subtitle>`, plain span with `aria-current="page"` on the parent `<li>`). The middle segment's anchor target is the current chapter in the current collection — defensible self-link to the current page (gives the user a "reset to top of chapter" affordance even though it's the page they're already on; not surfaced as an issue). See **spec-deviation adjudication** below for the manifest-subtitle vs spec-example wording call. |
| **Spec deliverable 1b** — Collection switcher renders three pills (Lectures / Notes / Practice) with current marked | ✅ PASS | Built artefact: `<ul class="collection-switcher" aria-label="Collection switcher">` containing 3× `<a class="collection-pill">` with exactly 1× `is-current` per page. On `lectures/ch_4/index.html` the Lectures pill carries `class="collection-pill is-current" aria-current="page"`; on `notes/ch_4/index.html` the Notes pill carries it; on `practice/ch_4/index.html` the Practice pill carries it. Cross-collection mirror correct: each pill links to `${baseUrl}/{collection}/{currentChapter.id}/` — clicking "Notes" from `/DSA/lectures/ch_4/` lands on `/DSA/notes/ch_4/` (verified by `<a href="/DSA/notes/ch_4/" class="collection-pill" data-astro-cid-cmisnyl6>Notes</a>`). |
| **Spec deliverable 1c** — Prev/Next chapter buttons with disabled state at boundaries; respects `n` ordering | ✅ PASS | Verified across the three critical edges: (i) `lectures/ch_1/index.html` has `<span class="chapter-button prev is-disabled" aria-disabled="true">` (no `<a>`, `rel="prev"` count = 0) and a real `<a class="chapter-button next" href="/DSA/lectures/ch_2/" rel="next">`; (ii) `lectures/ch_13/index.html` has `<span class="chapter-button next is-disabled" aria-disabled="true">` (`rel="next"` count = 0) and a real `<a class="chapter-button prev" href="/DSA/lectures/ch_12/" rel="prev">`; (iii) `lectures/ch_7/index.html` has `<a href="/DSA/lectures/ch_9/" rel="next" aria-label="Next chapter: ch_9 — AVL and red-black trees">` — ch_8 correctly skipped via `n`-ordering on the manifest, not slug-arithmetic. The ordering uses the manifest's `n` field ([Breadcrumb.astro:65](../../../../src/components/chrome/Breadcrumb.astro#L65)) — same key as `LeftRail.astro:51`, so both chrome surfaces agree on neighbour identity. |
| **Spec deliverable 2** — Sticky behaviour: `position: sticky; top: 0` on the `<nav>`; pure CSS (no JS) | ⚠️ PARTIAL — CSS rule present, but parent positioning context (auto-sized grid track) may neutralise stickiness; see MEDIUM-1 below | The CSS rule is correct: `dist/client/_astro/Breadcrumb.BmHgLMAI.css` contains `.breadcrumb[data-astro-cid-cmisnyl6]{position:sticky;top:0;z-index:50;background:var(--mux-surface);…}`. No JS required for sticky behaviour (the component is zero-JS — `grep -c '<script' src/components/chrome/Breadcrumb.astro` = 0). However, the **parent positioning context** is fragile: the inner `<nav class="breadcrumb">` is a child of `<nav data-slot="breadcrumb">` which is a CSS Grid item at `grid-area: breadcrumb` inside `.chrome` (a `display: grid; min-height: 100vh` container). On desktop the grid is `grid-template-areas: "breadcrumb breadcrumb breadcrumb" "left-rail main right-rail"` with implicit auto-sized rows; on mobile it's a four-row stack with auto-sized rows. The breadcrumb grid track is **auto-sized to the breadcrumb's content height** — meaning the sticky element's containing block has zero scroll-room beyond its own height. Whether sticky actually sticks under scroll depends on whether the browser treats the grid item as `align-self: stretch` and gives the sticky element the full grid-container height to traverse. This is the well-known "sticky inside an auto-row grid item" edge case. Auditor cannot run a real-browser scroll test from this shell — the rule lands but the runtime behaviour is unverified. See MEDIUM-1 for the recommendation. |
| **Spec deliverable 3** — Wire into `Base.astro` `breadcrumb` slot from T1; lectures, notes, practice all show the breadcrumb | ✅ PASS | All three chapter routes mount `<Breadcrumb slot="breadcrumb" />`: [`lectures/[id].astro:38`](../../../../src/pages/lectures/[id].astro#L38), [`notes/[id].astro:30`](../../../../src/pages/notes/[id].astro#L30), [`practice/[id].astro:32`](../../../../src/pages/practice/[id].astro#L32). Built artefacts confirm: 1× breadcrumb on every chapter page across all 36 chapter routes (12 chapters × 3 collections), 0× on `dist/client/index.html`. The mount lands inside `Base.astro`'s `<nav data-slot="breadcrumb" aria-label="Breadcrumb">` slot wrapper — note the **double-`<nav>` nesting** (Base's slot wrapper is `<nav>` + Breadcrumb's component-internal is `<nav class="breadcrumb">`). Two `<nav>` landmarks in the same accessibility tree. Surfaced as LOW-1 — minor a11y concern, not blocking. |
| **Acceptance check 1** — `Breadcrumb.astro` exists and renders in `Base.astro` `breadcrumb` slot at the top of every chapter page | ✅ PASS | File exists (317 lines, ~9.4 KB). Built HTML on every chapter page: `<nav data-slot="breadcrumb" aria-label="Breadcrumb"> <nav class="breadcrumb" aria-label="Chapter context">…` — the slot wrapper is the first child of `.chrome`, which is the first child of `<body>`, so the breadcrumb is structurally at the top of every chapter page. |
| **Acceptance check 2** — Auditor opens `/DSA/lectures/ch_4/`, confirms breadcrumb reads `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues` (or whatever ch_4's actual title is per `chapters.json`) | ✅ PASS (non-browser equivalent) | Built artefact emits `cs-300 / Lectures / ch_4 — Lists, stacks, queues, deques` — the `<subtitle>` from the manifest verbatim. **Spec explicitly authorises** this deviation via "or whatever ch_4's actual title is per `chapters.json`" — see spec-deviation adjudication below. Auditor cannot DevTools-inspect from this shell, but the path text is fully verifiable from the built HTML; T8 owns the integrated browser smoke. |
| **Acceptance check 3** — Auditor opens `/DSA/notes/ch_4/`, confirms collection switcher's "Notes" pill is active and links to lectures/practice point at the same chapter slug | ✅ PASS (non-browser equivalent) | `dist/client/notes/ch_4/index.html`: `<a href="/DSA/notes/ch_4/" class="collection-pill is-current" aria-current="page">Notes</a>` — Notes pill is active. The Lectures pill points at `/DSA/lectures/ch_4/` and the Practice pill points at `/DSA/practice/ch_4/` — same chapter slug, different collection. Verified with grep. Cross-collection mirror is symmetric across all three routes. |
| **Acceptance check 4** — Auditor opens `/DSA/lectures/ch_1/`, confirms prev button is disabled / hidden | ✅ PASS | `dist/client/lectures/ch_1/index.html`: 1× `chapter-button prev is-disabled` span, 0× `rel="prev"`, 1× `aria-disabled="true"` on the prev span. The button stays visible (per the spec's "disabled / hidden" — Builder picked "visible but inert", consistent with MDN's accessibility guidance for disabled link affordances) but cannot be clicked. The next button on ch_1 is a real link to ch_2 (`<a class="chapter-button next" href="/DSA/lectures/ch_2/" rel="next">`). |
| **Acceptance check 5** — Auditor opens `/DSA/lectures/ch_13/`, confirms next button is disabled / hidden | ✅ PASS | `dist/client/lectures/ch_13/index.html`: 1× `chapter-button next is-disabled` span, 0× `rel="next"`. The prev button on ch_13 is a real link to ch_12 (`<a class="chapter-button prev" href="/DSA/lectures/ch_12/" rel="prev">`). Symmetric with ch_1. |
| **Acceptance check 6** — Auditor opens `/DSA/lectures/ch_7/`, confirms next button points at ch_9 (skipping the absent ch_8 — verifies the `n`-ordering, not slug-arithmetic) | ✅ PASS — critical edge | `dist/client/lectures/ch_7/index.html`: `<a href="/DSA/lectures/ch_9/" rel="next" aria-label="Next chapter: ch_9 — AVL and red-black trees">`. The skip is correct, the aria-label confirms the human-facing label, and the chapter `n`s line up (ch_7 → n=7, ch_9 → n=9; index in sorted-by-`n` array is 6 → 7, so currentIndex+1 lands at ch_9 row, not a ch_8 row that doesn't exist). Cross-checked the reverse direction: ch_9's prev is ch_7 (`<a href="/DSA/lectures/ch_7/" rel="prev">`). Slug-arithmetic regression class would emit `/DSA/lectures/ch_8/` here; the manifest-driven approach correctly emits `/DSA/lectures/ch_9/`. |
| **Acceptance check 7** — Auditor scrolls a long chapter (ch_3 or ch_4) and confirms the breadcrumb stays visible at the top of the viewport (sticky behaviour) | ⚠️ DEFER (auditor-driven, browser-required) — see MEDIUM-1 | Auditor cannot run a real-browser scroll test from this shell. Static evidence: the sticky CSS rule is present in the externalised CSS chunk; the component renders inside the T1 grid layout with no `overflow:hidden` ancestor (`.chrome`, `<body>`, `<html>` all default `overflow: visible`); the sticky element's `top: 0` references the viewport top. **Risk noted in MEDIUM-1:** the parent grid item (`<nav data-slot="breadcrumb">`) is auto-sized to its content height by the implicit grid-row-track, which may cap the sticky element's stickiness range to its own height (the classic "sticky inside an auto-sized grid item" edge case). T8 owns the integrated browser smoke; if T8's browser-driven verification flags lost stickiness, the fix is to reserve more vertical room on the grid track or to apply `position: sticky` on the slot wrapper rather than the component-internal `<nav>` — see MEDIUM-1 recommendation. |
| **Acceptance check 8** — BASE_URL convention: `grep -nE '/DSA/' src/components/chrome/Breadcrumb.astro` returns no real source-level hardcoding (doc-comment hits OK per DA3-A reviewer-eyes) | ✅ PASS | `grep -nE '/DSA/' src/components/chrome/Breadcrumb.astro` returns 3 hits, all inside `//` doc-comment lines (lines 36, 39, 41 — documenting the BASE_URL convention). `grep -nE 'href=["\x27]/DSA/' src/components/chrome/Breadcrumb.astro` returns empty (no source-level `href` hardcoding). Reviewer-eyes per DA3-A reviewer-eyes policy passes. |
| **Acceptance check 9** — All 37 prerendered pages still build (`npm run build` exit 0) | ✅ PASS | Auditor re-ran `npm run build` from scratch this cycle. Output: "Server built in 8.73s. Complete!" — no warnings, no errors, exit 0. `find dist/client -name '*.html' \| wc -l` = 37. Same page count as T1 + T2. |
| **Carry-over from prior audits** — none. T3 spec carries no Carry-over from prior audits section; T1 issue file's M-UX-T1-ISS-01 was forward-deferred only to T4 (per T1 Propagation status footer), and T2 issue file's MUX-T2-ISS-01/02/03/04 were forward-deferred to T4/T8 (per T2 Propagation status footer) | ✅ N/A | No carry-over to tick. The Builder's "no carry-over" claim is correct. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — Sticky positioning context: parent grid item is auto-sized; sticky behaviour may not extend through scroll

**Surface:** [`src/components/chrome/Breadcrumb.astro:184`](../../../../src/components/chrome/Breadcrumb.astro#L184) (the `.breadcrumb { position: sticky; top: 0; z-index: 50; }` rule) interacts with [`src/layouts/Base.astro:111–177`](../../../../src/layouts/Base.astro#L111-L177) (the `.chrome` CSS grid). The sticky element's containing block is its parent grid item `<nav data-slot="breadcrumb">`, which is sized by the breadcrumb grid track. Both desktop (`grid-template-areas: "breadcrumb breadcrumb breadcrumb" "left-rail main right-rail"`) and mobile (`grid-template-areas: "breadcrumb" "left-rail" "main" "right-rail"`) layouts use **auto-sized rows** (no explicit `grid-template-rows`), so the breadcrumb track is exactly as tall as the breadcrumb element itself.

**Why this matters:** `position: sticky` only sticks **within the height of its containing block**. If the containing block (the grid track) is the same height as the sticky element, sticky has zero scroll-room — the moment the user scrolls, the entire grid item scrolls out of the viewport along with the sticky element. This is the well-documented "sticky inside an auto-sized grid item" edge case. (Modern browsers may treat the grid item as `align-self: stretch` and effectively extend sticky's range to the full grid container, but the behaviour is browser- and grid-shape-specific — the rule alone is not sufficient evidence the breadcrumb sticks under scroll.)

**Severity rationale:** MEDIUM, not HIGH — (i) the CSS rule itself is correct and the spec deliverable language is satisfied; (ii) build-clean alone is necessary but not sufficient for code-task verification per CLAUDE.md, and the auditor cannot run a real-browser scroll test from this shell; (iii) the spec lists the scroll observation as an **auditor-driven smoke** that the auditor explicitly cannot perform from this environment; (iv) T8 owns the integrated browser-driven verification, where this risk gets re-exercised. Surfacing as MEDIUM so the T8 auditor knows to test scroll-stickiness specifically rather than assuming the rule is enough.

**Action / Recommendation:** Two reasonable directions, presented as options per CLAUDE.md "Present options for simple-fix issues":

1. **Defer to T8 browser smoke (recommended at this maturity).** T8's deploy-verification audit runs `npm run preview` in a real browser; the T8 auditor explicitly tests scroll-stickiness on a long chapter (ch_3 or ch_4 — both 50+ pages of LaTeX). If sticky fails to extend through scroll, the T8 audit flips to OPEN with a HIGH on this surface and a follow-on Builder picks the fix. T3 close is correct as-is.
2. **Pre-emptive fix now.** Apply `position: sticky` to the `<nav data-slot="breadcrumb">` slot wrapper (in `Base.astro`) instead of the inner `<nav class="breadcrumb">` — the slot wrapper sits directly inside `.chrome` (the grid container itself), and sticky on a direct grid container child has well-defined behaviour relative to the grid container's full height. Or, reserve a `grid-template-rows: auto 1fr` and have sticky element span the full row. Either change is small but touches T1's deliverable surface (Base.astro) — not a T3 task as scoped.

**Owner:** T8's deploy-verification auditor exercises the integrated browser smoke; if stickiness fails, T8 owns the follow-on. T3 stays ✅ PASS.

## 🟢 LOW

### LOW-1 — Double `<nav>` nesting: T1's slot wrapper + T3's component-internal `<nav>` create two adjacent `<nav>` landmarks

**Surface:** The Builder's `<nav class="breadcrumb" aria-label="Chapter context">` ([Breadcrumb.astro:109](../../../../src/components/chrome/Breadcrumb.astro#L109)) mounts inside Base.astro's `<nav data-slot="breadcrumb" aria-label="Breadcrumb">` ([Base.astro:197](../../../../src/layouts/Base.astro#L197)) slot wrapper. Built artefact: `<nav data-slot="breadcrumb" aria-label="Breadcrumb"> <nav class="breadcrumb" aria-label="Chapter context">…</nav> </nav>`. Two nested `<nav>` landmarks in the same accessibility tree.

**Severity rationale:** LOW — (i) both `<nav>` elements carry distinct `aria-label`s ("Breadcrumb" vs "Chapter context") so screen readers can disambiguate; (ii) the WAI-ARIA spec doesn't forbid nested `<nav>` landmarks; (iii) Lighthouse / axe / wave a11y tooling may surface this as a lint hint but not as a violation; (iv) the source of the nesting is T1's choice to make the slot wrapper a `<nav>` rather than a generic `<div>` — T3 inherits the constraint. T7's responsive sweep / T8's accessibility check is the natural place to re-evaluate.

**Action / Recommendation:** Two reasonable directions:

1. **Keep as-is (recommended).** Two nav landmarks with distinct labels is acceptable per WAI-ARIA. No change.
2. **Demote one to a generic element.** Either change Base.astro's slot wrapper from `<nav data-slot="breadcrumb">` to `<div data-slot="breadcrumb" role="navigation" aria-label="…">` (or just `<div>`), or change Breadcrumb.astro's component-internal element from `<nav class="breadcrumb">` to `<div class="breadcrumb">`. The latter preserves T1's landmark; the former is a T1 follow-on. T7 or T8 picks.

**Owner:** T7 (responsive sweep — the place where a11y gets re-exercised at integration) or T8 (deploy verification with axe/lighthouse). T3 stays ✅ PASS.

### LOW-2 — Externalised `_astro/Breadcrumb.BmHgLMAI.css` chunk includes LeftRail + Breadcrumb scoped styles + the chapter callout styles

**Surface:** Astro's bundler emitted a single `dist/client/_astro/Breadcrumb.BmHgLMAI.css` chunk containing the scoped styles for **all** chrome components plus the M2 callout components (Definition / KeyIdea / Gotcha / Example / Aside / CodeBlock). The naming-after-Breadcrumb is incidental — Astro picks the alphabetically-first or import-graph-tip filename for the chunk name. Net result: T3's "extracted scoped styles" claim in the CHANGELOG is technically correct, but the chunk holds more than just T3's CSS. Size delta: post-T3 `dist/client/` = `5,157,010` vs post-T2 `5,219,362` = `−62,352` bytes (~61 KB *decrease*), driven by the externalisation replacing per-page-inlined `<style>` blocks across 36 chapter pages.

**Severity rationale:** LOW — the size delta direction is favourable (the build got *smaller*, which is good for T8's `<50KB` budget gate). The naming is a cosmetic artefact, not a regression. Surfacing only because the CHANGELOG entry's framing ("Astro externalised chrome CSS into a shared `_astro/Breadcrumb.*.css` chunk") is slightly understated — the chunk is broader.

**Action / Recommendation:** No change. T8's audit will re-measure the integrated `dist/client/` size against the pre-M-UX baseline; the favourable T3 delta gives T8 headroom to evaluate.

**Owner:** T8.

### LOW-3 — The "Lectures" middle path-segment links to the current page (self-link)

**Surface:** [`Breadcrumb.astro:115–117`](../../../../src/components/chrome/Breadcrumb.astro#L115-L117) renders the middle breadcrumb segment as `<a href={chapterHref(currentCollection, currentChapter.id)}>{collectionLabel}</a>`. On `/DSA/lectures/ch_4/` the "Lectures" anchor's href is `/DSA/lectures/ch_4/` — the user's current URL. Clicking it reloads the same page. Spec says "each segment a link except the last" so the link is structurally correct, but a self-link that resolves to the current page is a minor anti-pattern (not a hard a11y or UX violation; some style guides accept it as "scroll to top of page" even though that's not what `href` semantically does without a hash).

**Severity rationale:** LOW — the spec demands a link, the link is correct per the spec, and the user-visible effect is at worst a redundant page reload. ADR-0002 doesn't speak to this case.

**Action / Recommendation:** Two reasonable directions, presented as options:

1. **Leave as-is.** Spec says link, Builder shipped a link. No change.
2. **Demote to a non-link span when the segment matches the current page (i.e. when there's no "parent collection landing page" to navigate to).** Cleaner. One-line change in Breadcrumb.astro lines 115–117: render `<span>` if `currentCollection === ${self}`. T7 or follow-on picks.

**Owner:** T7 (responsive sweep) or T8. T3 stays ✅ PASS.

## Additions beyond spec — audited and justified

- **`<span aria-hidden="true">‹</span>` / `<span aria-hidden="true">›</span>` chevron glyphs in prev/next buttons.** Not in the spec, but the spec calls them "arrow buttons" (line 16). The chevrons satisfy that wording; `aria-hidden="true"` keeps them out of the screen-reader announcement (the `aria-label` on the `<a>` element carries the human-facing text). Justified.
- **`aria-label="Previous chapter: ch_3 — Data structures, ADTs, Big-O, sorting"` on the prev anchor (and symmetric on next).** Not in the spec, but a clear a11y win — the link text (`ch_3`) alone is sparse; the aria-label gives the screen-reader user the chapter title context. Justified per WAI-ARIA best practice.
- **`rel="prev"` / `rel="next"` on the chapter buttons.** Not in the spec, but a HTML/SEO-spec-aligned hint that downstream tooling (browser pre-fetch, search engines, accessibility tree) uses for ordering. Zero coupling; pure standards alignment. Justified.
- **`tabular-nums` font-variant on `.chapter-button-label`.** Cosmetic — keeps the chapter number digits aligned across prev/next buttons. Justified, matches LeftRail's `font-variant-numeric` idiom.
- **`box-shadow: inset 0 0 0 1px var(--mux-accent)` on `.collection-pill.is-current`.** Inset accent ring matching the LeftRail current-chapter idiom (consistent visual language across chrome surfaces). Justified.
- **`flex-wrap: wrap` on `.breadcrumb`.** Lets the breadcrumb-controls drop to a second row when the path text is long enough to overflow. Defensive against ch_10 ("Graphs: BFS, DFS, shortest paths") on narrow desktop widths. Justified, no scope creep — pure layout hygiene; T7 will refine the responsive shape.

No invented scope. No drive-by refactors. No `nice_to_have.md` adoption. No new dependencies.

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| Full project build from scratch | `npm run build` | ✅ clean — prebuild + astro build both exit 0; 37 pages rendered; "Server built in 8.73s"; no warnings |
| Page count | `find dist/client -name '*.html' \| wc -l` | ✅ 37 |
| Breadcrumb on every chapter page (12 chapters × 3 collections = 36) | `grep -c 'class="breadcrumb"'` per built file | ✅ 1 hit each — full 36-page sweep |
| Breadcrumb absent from index | `grep -c 'class="breadcrumb"' dist/client/index.html` | ✅ 0 |
| Path text on lectures/ch_4 | `grep -oE 'ch_4 — [^<]*' dist/client/lectures/ch_4/index.html \| head -1` | ✅ `ch_4 — Lists, stacks, queues, deques` (manifest subtitle, spec authorises deviation) |
| Collection switcher: 3 pills, 1 current per page | `grep -oE 'collection-pill[^"]*' dist/client/lectures/ch_4/index.html` | ✅ 3 pills, exactly 1× `is-current` per chapter page across all 36 routes |
| Collection switcher cross-mirror correct | grep on `notes/ch_4` + `practice/ch_4` for `is-current` pill | ✅ Notes pill `is-current` on `/notes/ch_4/`, Practice pill `is-current` on `/practice/ch_4/` |
| Prev/next links on lectures/ch_4 | `grep -oE 'rel="(prev\|next)" aria-label="[^"]*"'` | ✅ `rel="prev"` href `/DSA/lectures/ch_3/`; `rel="next"` href `/DSA/lectures/ch_5/` |
| Prev disabled on ch_1 | `grep -oE 'chapter-button prev[^"]*' dist/client/lectures/ch_1/index.html` + `grep -c rel="prev"` | ✅ `chapter-button prev is-disabled` (1 hit), `rel="prev"` count = 0 |
| Next disabled on ch_13 | `grep -oE 'chapter-button next[^"]*' dist/client/lectures/ch_13/index.html` + `grep -c rel="next"` | ✅ `chapter-button next is-disabled` (1 hit), `rel="next"` count = 0 |
| ch_7 → ch_9 skip across missing ch_8 | `grep -oE 'href="[^"]*ch_9/" rel="next"' dist/client/lectures/ch_7/index.html` | ✅ `href="/DSA/lectures/ch_9/" rel="next"` — manifest-driven, not slug-arithmetic |
| ch_9 → ch_7 reverse skip | `grep -oE 'href="[^"]*ch_7/" rel="prev"' dist/client/lectures/ch_9/index.html` | ✅ `href="/DSA/lectures/ch_7/" rel="prev"` |
| Cross-collection prev/next stays in collection (notes/ch_4) | `grep -oE 'href="[^"]*" rel="(prev\|next)"' dist/client/notes/ch_4/index.html` | ✅ both stay in `/DSA/notes/...` |
| Cross-collection prev/next stays in collection (practice/ch_4) | `grep -oE 'href="[^"]*" rel="(prev\|next)"' dist/client/practice/ch_4/index.html` | ✅ both stay in `/DSA/practice/...` |
| Sticky CSS rule in externalised chunk | `grep -oE '\.breadcrumb\[[^]]+\]\{position:sticky;top:0;z-index:50' dist/client/_astro/Breadcrumb.BmHgLMAI.css` | ✅ rule present (caveat: parent grid track is auto-sized — see MEDIUM-1) |
| BASE_URL discipline — no source `/DSA/` href hardcoding | `grep -nE 'href=["\x27]/DSA/' src/components/chrome/Breadcrumb.astro` | ✅ empty (3 doc-comment hits only, all inside `//` lines per DA3-A reviewer-eyes) |
| M3 surfaces preserved exactly | `grep -oE 'mark-read-button\|section-nav\|annotations-pane\|annotate-button' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` | ✅ 6 / 6 / 8 / 12 — matches T2 baseline |
| `<article>` wrapper preserved on all three routes | `grep -c '<article' lectures/ch_4/ notes/ch_4/ practice/ch_4/index.html` | ✅ 1 / 1 / 1 |
| `<body data-mode="static">` SSR default preserved | `grep -c 'data-mode="static"' dist/client/lectures/ch_4/index.html` | ✅ 1 |
| `data-interactive-only` count unchanged | `grep -oE 'data-interactive-only' \| wc -l` | ✅ 19 (unchanged from T2; T3 adds no interactive-mode-gated surfaces) |
| `aria-current="page"` count on lectures/ch_4 | `grep -oE 'aria-current="page"' \| wc -l` | ✅ 3 (1 LeftRail current chapter + 1 breadcrumb path li + 1 collection pill is-current) |
| Manifest unchanged | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` | ✅ empty |
| Status surface (a) per-task | `head -3 T3_breadcrumb.md` | ✅ `**Status:** ✅ done 2026-04-24` |
| Status surface (b) tasks/README | grep `^\| T3 ` | ✅ `✅ done 2026-04-24` |
| Status surface (c) milestone README task table | grep `^\| T3 ` | ✅ `✅ done 2026-04-24` |
| Status surface (d) Done-when bullet 4 | `grep -nE 'Done when\|^- \[' README.md` | ✅ `[x]` with `(T3 issue file)` citation |
| Size delta vs T2 baseline | `du -sb dist/client/` post-T3 minus post-T2 | ✅ −62,352 B (favourable; ~61 KB decrease driven by CSS chunk externalisation) |
| Net new JS bundle | `ls dist/client/_astro/` | ✅ only `Breadcrumb.BmHgLMAI.css` (no `*.js` chunks added — T3 introduces no islands) |

## Spec-deviation adjudication — manifest subtitle vs spec example

**Spec line 14 + 38** specifies the path-text example as `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues`. The manifest (`scripts/chapters.json`) records `"subtitle": "Lists, stacks, queues, deques"`. The Builder rendered the manifest subtitle verbatim ("Lists, stacks, queues, deques"), not the spec example.

**Adjudication: PASS — deviation justified, no finding logged.**

Reasoning: Spec line 38 reads "*confirms breadcrumb reads `cs-300 / Lectures / ch_4 — Lists, Stacks, Queues` (or whatever ch_4's actual title is per `chapters.json`)*" — the parenthetical explicitly authorises the manifest-driven outcome. The manifest is the source of truth (single edit point if a title changes), and using it preserves consistency with [`LeftRail.astro:155`](../../../../src/components/chrome/LeftRail.astro) which uses the same `ch_{n} — {subtitle}` idiom. The Builder's documented choice (CHANGELOG entry: "spec example 'Lists, Stacks, Queues' is illustrative; the manifest's actual `subtitle` value is 'Lists, stacks, queues, deques' and we render it unchanged for parity with `LeftRail.astro`'s `ch_{n} — {subtitle}` idiom") is correct.

## Edge-case verification verdicts

| Edge | Verdict | Evidence |
| ---- | ------- | -------- |
| **ch_1 prev disabled** | ✅ PASS | `<span class="chapter-button prev is-disabled" aria-disabled="true">` in `dist/client/lectures/ch_1/index.html`; 0× `rel="prev"` |
| **ch_13 next disabled** | ✅ PASS | `<span class="chapter-button next is-disabled" aria-disabled="true">` in `dist/client/lectures/ch_13/index.html`; 0× `rel="next"` |
| **ch_7 → ch_9 skip across missing ch_8** | ✅ PASS — critical | `<a href="/DSA/lectures/ch_9/" rel="next" aria-label="Next chapter: ch_9 — AVL and red-black trees">`. Reverse direction also correct (ch_9 prev = ch_7). |
| **Collection switcher cross-mirror** | ✅ PASS | `lectures/ch_4`/`notes/ch_4`/`practice/ch_4` each carry the correct `is-current` pill and prev/next stay in the same collection (`/DSA/notes/ch_3/` from `/DSA/notes/ch_4/`, etc.). |
| **Sticky CSS context** | ⚠️ PARTIAL — see MEDIUM-1 | CSS rule present + correct + zero-JS; parent grid item auto-sized (sticky range may be neutralised by the auto-row track height). T8 owns the integrated browser smoke. |

## Issue log

| ID | Severity | Description | Status | Owner / next touch |
| -- | -------- | ----------- | ------ | ------------------ |
| M-UX-T3-ISS-01 | MEDIUM | Sticky positioning context risk: parent grid item is auto-sized; sticky range may be neutralised | DEFERRED to T8 | T8 deploy-verification auditor exercises the integrated browser scroll smoke; if stickiness fails, T8 owns the follow-on fix on `Base.astro` slot wrapper |
| M-UX-T3-ISS-02 | LOW | Double `<nav>` nesting (slot wrapper + component-internal) creates two adjacent `<nav>` landmarks | OPEN — flag-only | T7 (responsive sweep, a11y re-exercise) or T8 (axe/lighthouse pass) |
| M-UX-T3-ISS-03 | LOW | Externalised `_astro/Breadcrumb.*.css` chunk includes LeftRail + callout styles (chunk naming is cosmetic) | OPEN — flag-only | T8 |
| M-UX-T3-ISS-04 | LOW | "Lectures" middle path-segment is a self-link to the current page | OPEN — flag-only | T7 or T8 |

## Deferred to nice_to_have

N/A. No findings map to `nice_to_have.md`. The four entries currently parked there (visual style sweep, search, dark mode, animation discipline) are explicitly out of scope for M-UX per ADR-0002 "Open questions deferred"; T3 did not silently adopt any of them.

## Propagation status

**M-UX-T3-ISS-01 (MEDIUM, DEFERRED to T8).** Target: T8's deploy-verification audit owns the integrated browser-driven scroll-stickiness smoke. T8 spec already requires a browser smoke pass on chapter routes; this audit appends a Carry-over from prior audits entry to T8's spec naming the specific check. **Carry-over block appended to** [`T8_deploy_verification.md`](../tasks/T8_deploy_verification.md) — see footer entry below.

**M-UX-T3-ISS-02, ISS-03, ISS-04 (LOW, OPEN flag-only).** No carry-over blocks created — these are flag-only forward-looking notes for T7/T8. If T8's audit catches them as integration findings, T8 picks them up incidentally.

**Audit verdict propagation.** This cycle-1 audit returns `FUNCTIONALLY CLEAN` to the invoker. T3 closes cleanly with one MEDIUM finding tracked here for downstream pickup (T8) and three LOWs tracked flag-only. No HIGH findings. No source-code changes required for the audit verdict; the MEDIUM finding is about runtime sticky-CSS behaviour that is unverifiable from this shell and is the natural T8 integration check.

**Override / disagreement with Builder report.** None on factual claims. The Builder's smoke claims were verified independently and reproduce byte-for-byte: `du -sb dist/client/` = `5,157,010` (matches), page count = `37` (matches), `<nav class="breadcrumb" aria-label="Chapter context">` 1 hit per chapter page (matches), 3 pills + 1 `is-current` per page (matches), `rel="prev"` / `rel="next"` hrefs on ch_4 (matches), `is-disabled` on ch_1 prev / ch_13 next (matches), ch_7 → ch_9 skip via `n`-ordering (matches), collection switcher mirrors across notes/practice (matches), index has zero breadcrumb (matches), sticky CSS rule present in `_astro/Breadcrumb.BmHgLMAI.css` (matches), M3 surfaces preserved (6/6/8/12 — matches), BASE_URL discipline (3 doc-comment hits, no real hardcoding — matches). The Builder's spec-deviation flag (manifest subtitle vs spec example) was independently adjudicated as PASS — the spec parenthetical at line 38 explicitly authorises the deviation. The MEDIUM-1 sticky-context risk is *not* contradicted by the Builder's claims (the CSS rule is present, as the Builder said) — it's a deeper observation about the parent positioning context that the Builder's grep-based smoke could not exercise.

## Carry-over written to target task specs

This audit appended one Carry-over entry:

- **[`design_docs/milestones/m_ux_polish/tasks/T8_deploy_verification.md`](../tasks/T8_deploy_verification.md)** — gains a new `## Carry-over from prior audits` entry referencing M-UX-T3-ISS-01 (sticky positioning context risk; T8 auditor must exercise scroll-stickiness on a long chapter in `npm run preview` and cite the observation).

## Security review

**Reviewed on:** 2026-04-24
**Reviewer:** security-reviewer subagent (M-UX T3 cycle 1 gate)
**Verdict:** SHIP
**Files inspected:** `src/components/chrome/Breadcrumb.astro`, `src/pages/{lectures,notes,practice}/[id].astro`, `scripts/chapters.json`, `astro.config.mjs`, `.github/workflows/deploy.yml`.

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | `Astro.url.pathname` regex + interpolation safety | CLEAN — `Breadcrumb.astro:73` regex `/\/(lectures\|notes\|practice)\/(ch_\d+)\/?$/`; captured groups rendered exclusively via Astro's `{...}` auto-escaped interpolation (in href attributes via `chapterHref()` and in text content). End-anchored `$`; alternation constrains collection to a closed three-string set; chapter-id capture is `ch_\d+`. No raw HTML can be produced from matched values. |
| 2 | Hrefs constructed from `chapters.json` | CLEAN — `chapterHref(collection, chapterId)` at `Breadcrumb.astro:96–98` builds `${baseUrl}/${collection}/${chapterId}/` from three project-controlled inputs: `BASE_URL` (build-time `/DSA/`), `collection` (closed-set literal from `COLLECTIONS` const), `chapterId` (resolved from repo-committed `scripts/chapters.json`). No user-controlled string flows into any `href`. |
| 3 | `set:html` usage | CLEAN — full read of the 317-line `Breadcrumb.astro`: zero `set:html` instances. All dynamic content uses Astro `{...}` auto-escaped interpolation. |
| 4 | `import.meta.env` usage | CLEAN — sole reference at `Breadcrumb.astro:51` is `import.meta.env.BASE_URL` (Astro public built-in, set to `/DSA/` in `astro.config.mjs:29`). No `*_SECRET`/`*_KEY`/`OLLAMA_*`/`DATABASE_*` accessed. |
| 5 | New external resource fetches | CLEAN — no new `<link>` external href, no CDN `<script src>`, no `fetch()`/`XMLHttpRequest`/dynamic `import()` of remote URLs, no web-font `@import`. `astro.config.mjs` integrations unchanged. |
| 6 | `data-interactive-only` + mode-gate integrity | CLEAN — T3 adds zero `data-interactive-only` attributes (count remains 19, matches T2 baseline). Breadcrumb's `<style>` block is scoped (no `is:global`) — cannot bleed into the global `[data-interactive-only]` rule or `[data-mode]` selectors in `Base.astro`. `<body data-mode="static">` SSR default at `Base.astro:195` untouched. |
| 7 | Disabled-span injection safety | CLEAN — `Breadcrumb.astro:136–139` (prev disabled) and `:167–170` (next disabled) contain only static HTML character references (`<span aria-hidden="true">‹/›</span>`) and static string literals (`prev`/`next`); no `{...}` interpolation, no `set:html`, no user-controlled string. |
| Additional | Static output + GH Pages artifact scope | CLEAN — `astro.config.mjs:30` `output: 'static'`; `deploy.yml:74–76` uploads only `./dist/client`. API routes excluded. T3 modifies neither file; no regression. |

### Advisory

None. The regex at `Breadcrumb.astro:73` is end-anchored (`$`) but not start-anchored (`^`); under the threat model this is not a finding because (a) `Astro.url.pathname` is evaluated at SSR render time over `getStaticPaths()`-generated paths (not arbitrary attacker URLs), and (b) Astro auto-escapes all `{...}` expressions in any case. Not flagged.

### Verdict

**SHIP.** Eight checks PASS, zero advisories. T3 is pure-SSR, zero-JS, project-data-only — minimum attack surface for a navigation element.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
