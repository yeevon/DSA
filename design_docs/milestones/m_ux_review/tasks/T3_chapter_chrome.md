# T3 — Chapter chrome: breadcrumb split, H1 promotion, left-rail trim

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) findings F5 (HIGH, ~2h), F6 (MED, ~30m), F8 (LOW, ~20m)
**Depends on:** —
**Unblocks:** T4 (mobile chrome reduction collapses the same breadcrumb T3 restructures)
**Reference:** [`../README.md`](../README.md), [`m_ux_polish/tasks/T3_breadcrumb.md`](../../m_ux_polish/tasks/T3_breadcrumb.md), [`m_ux_polish/tasks/T9_layout_polish.md`](../../m_ux_polish/tasks/T9_layout_polish.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md)

## Why T3 exists (context)

The chapter chrome currently mixes three different navigation models in one horizontal strip:

> "Reading the bar left-to-right: `cs-300 / Lectures / ch_4 — …` then on the right `‹ch_3 / Lectures / Notes / Practice / ch_5›`. That's breadcrumbs, chapter-prev/next, and a collection segmented control all sharing one row. Three different navigation models." — review F5

The collection control especially gets lost — students switch between Lectures and Notes constantly per the review's reasoning, and that affordance is sized like a footnote. Compounding: the page H1 reads "Chapter 4 — Lectures" (coordinates the user already knows from the URL + breadcrumb + active rail item + the segmented control) instead of the actual topic.

Also on the same chrome surface: the left-rail subtitle copy ("ch_1 — Programming basics, arrays, and vectors") wraps to 2–3 lines per item, which makes mid-chapter rail-scanning noisy when the user just wants to jump from ch_4 to ch_5.

Three findings, all on the chapter chrome (`Breadcrumb.astro` + the chapter route templates + `LeftRail.astro`), so they ship as one task. ~2.5h total.

## Goal

1. **F5 — split the breadcrumb bar.** Crumbs + chapter-prev/next stay on row 1 (left/right of the same row, single role per side). Collection switcher hoists to a new segmented-control row directly below the page H1. Three roles, three rows (counting the H1). Each row reads as one model.
2. **F6 — promote the topic to H1.** "Lists, stacks, queues, deques" becomes the page H1; "Chapter 4 · Lectures" demotes to a small eyebrow caption above. Applies to all three collection chapter routes.
3. **F8 — trim left-rail subtitles.** Default rendering becomes `ch_N — Title` (truncated to one line); full subtitle in the `title=` tooltip. The current chapter keeps the full string for context.

## Spec deliverables

### D1. Breadcrumb split (F5, `src/components/chrome/Breadcrumb.astro`)

Current shape (post-M-UX T9):

```astro
<header class="breadcrumb-bar">
  <nav class="crumbs">
    <a href={...}>cs-300</a> /
    <a href={...collection-landing}>{Collection}</a> /
    <span aria-current="page">ch_4 — Lists, stacks, queues</span>
  </nav>
  <div class="prev-next-collection">
    <a class="prev-chapter" href={...prev}>‹ ch_3</a>
    <nav class="collection-pills">
      <a aria-current="...">Lectures</a>
      <a>Notes</a>
      <a>Practice</a>
    </nav>
    <a class="next-chapter" href={...next}>ch_5 ›</a>
  </div>
</header>
```

New shape — split the collection pills out of the breadcrumb bar:

```astro
<header class="breadcrumb-bar">
  <nav class="crumbs">
    <a href={...}>cs-300</a> /
    <span aria-current="page">ch_4 — Lists, stacks, queues</span>
  </nav>
  <div class="prev-next">
    <a class="prev-chapter" href={...prev}>← ch_3</a>
    <a class="next-chapter" href={...next}>ch_5 →</a>
  </div>
</header>
```

The middle collection segment (`Lectures` / `Notes` / `Practice` link to the landing pages, per M-UX T9 D4) is *removed* from the breadcrumb. The user already knows which collection they're in from the segmented control under the H1 (D2 below) + the URL. Removing the middle segment also fixes the F9 mobile wrap problem T4 follows up on.

The collection pills become a separate component / slot. See D2.

The prev/next chapter pills change from `‹ ch_3` / `ch_5 ›` (text guillemets) to `← ch_3` / `ch_5 →` (arrows) per the review's "before/after" mock — same width, more readable on mobile.

### D2. Collection segmented control under the H1 (F5, F6 — paired)

New component: `src/components/chrome/CollectionTabs.astro`. Renders a segmented-control-style tab strip with the three collection links. Visual treatment: filled accent for the current collection, outline / hover for the others. ~30 lines of CSS in `chrome.css` reusing `--mux-accent` + `--mux-border`.

Slots into `Base.astro` directly under the chapter page H1. Static-mode SSR-rendered; no JS required.

The chapter route templates (`src/pages/lectures/[id].astro`, `src/pages/notes/[id].astro`, `src/pages/practice/[id].astro`) get a structural change in the same edit (paired with F6):

```astro
{/* before — current */}
<h1>Chapter 4 — Lectures</h1>
<p class="ch-subtitle">Lists, stacks, queues, deques</p>

{/* after */}
<p class="ch-eyebrow">Chapter 4 · Lectures</p>
<h1>Lists, stacks, queues, deques</h1>
<CollectionTabs current="lectures" chapterId="ch_4" />
```

`<p class="ch-eyebrow">` styles small + uppercase + tracked + muted (`var(--mux-text-muted)`).

### D3. Left-rail subtitle trim (F8, `src/components/chrome/LeftRail.astro`)

Current: each rail entry renders `ch_N — Title`. The "Title" part is the full chapter subtitle from `chapters.json` (often long enough to wrap — "Programming basics, arrays, and vectors", "Algorithms, recursion, greedy, and DP").

New: render `ch_N — Title` truncated to one line via CSS (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`) on every entry except the current chapter, which keeps the full text wrapping naturally. Add `title={fullSubtitle}` so hover/long-press reveals the full string.

For the current chapter, rendering stays as today (full text, multi-line OK) since it's the one entry the user wants the most context on.

CSS-only; no JS, no markup change beyond the `title=` attribute.

### D4. Functional-test assertions (`scripts/functional-tests.json`)

New test cases:

- `breadcrumb-no-collection-pills` — on `/DSA/lectures/ch_4/`, the `.breadcrumb-bar` does NOT contain `.collection-pills` (or whatever class the previous segmented control used).
- `breadcrumb-prev-next-arrows` — on `/DSA/lectures/ch_4/`, the prev / next chapter elements use `←` / `→` (text-pattern), not `‹` / `›`.
- `collection-tabs-under-h1` — on `/DSA/lectures/ch_4/`, the DOM order in `<main>` is: `.ch-eyebrow` → `<h1>` → `.collection-tabs`. (selector + position assertion, or `getBoundingClientRect.top` ordering.)
- `h1-is-topic-not-coordinates` — on `/DSA/lectures/ch_4/`, `<h1>` text matches the chapter subtitle from `chapters.json` (e.g. `Lists, stacks, queues, deques`); does NOT match `/^Chapter 4/`.
- `eyebrow-has-coordinates` — on `/DSA/lectures/ch_4/`, the `.ch-eyebrow` text matches `/Chapter 4.*Lectures/`.
- `collection-tabs-current-aria` — on `/DSA/lectures/ch_4/`, exactly one `.collection-tabs a` has `aria-current="page"` and its href ends with `/lectures/ch_4/`.
- `collection-tabs-on-notes` — on `/DSA/notes/ch_4/`, the `aria-current` tab is the Notes link.
- `left-rail-truncate-other-chapters` — on `/DSA/lectures/ch_4/`, every `LeftRail` entry that isn't ch_4 has computed `text-overflow: ellipsis` AND `white-space: nowrap`. Current chapter (ch_4) entry doesn't have those styles.
- `left-rail-title-attr-on-other-chapters` — on `/DSA/lectures/ch_4/`, every non-current `LeftRail` entry carries a `title=` attribute matching its full subtitle.

### D5. Architecture.md amendment

`design_docs/architecture.md` §1 page-chrome subsection currently documents the breadcrumb as carrying "collection switcher (Lectures / Notes / Practice)." Update to reflect the new split: breadcrumb carries crumbs + prev/next; collection switcher lives as a sibling component (`CollectionTabs.astro`) directly under the page H1. The H1 invariant changes too: it names the topic, not the coordinates.

## Acceptance checks (functional-test assertions, runnable by the auditor)

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F5 | Breadcrumb bar has no collection-pill children. | `breadcrumb-no-collection-pills` |
| AC2 | F5 | Prev/next chapter elements use `←` / `→`. | `breadcrumb-prev-next-arrows` |
| AC3 | F5 | Collection tabs render directly under the chapter H1 (DOM order: eyebrow → h1 → tabs). | `collection-tabs-under-h1` |
| AC4 | F6 | Chapter `<h1>` is the topic ("Lists, stacks, queues, deques"), not "Chapter 4 …". | `h1-is-topic-not-coordinates` |
| AC5 | F6 | `.ch-eyebrow` carries the coordinates ("Chapter 4 · Lectures"). | `eyebrow-has-coordinates` |
| AC6 | F5 | One collection tab has `aria-current="page"`; href matches the current collection. | `collection-tabs-current-aria`, `collection-tabs-on-notes` |
| AC7 | F8 | Non-current LeftRail entries truncate (ellipsis + nowrap); carry `title=`. | `left-rail-truncate-other-chapters`, `left-rail-title-attr-on-other-chapters` |
| AC8 | F8 | Current LeftRail entry on `/DSA/lectures/ch_4/` is NOT truncated (multi-line render allowed). | (computed-style assertion) |
| AC9 | regression | M-UX T9 AC5 / AC6 / AC7 / AC9 still pass; AC8 obsolete by T3 D1 (cross-collection link migrated to `CollectionTabs.astro` per F5). | (existing T9 cases) |
| AC10 | doc | `design_docs/architecture.md` §1 reflects the breadcrumb split + H1-as-topic invariant. | (doc-content grep) |

> **Cycle-2 amendment (2026-04-27, closes M-UX-REVIEW-T3-ISS-01):** AC9 originally enumerated T9 AC8 as a contract that "still passes." T3 D1 + the spec's "Out of scope" section both explicitly authorise removing the breadcrumb middle segment that T9 AC8 asserted, and the Builder correctly removed the three corresponding T9 cases (`breadcrumb-collection-link-{lectures,notes,practice}`) in cycle 1. The cross-collection-navigation user need that T9 AC8 surfaced is genuinely preserved by T3's new `collection-tabs-{current-aria,on-notes}` cases (different URL contract — chapter routes `/DSA/{collection}/ch_N/` instead of landing pages `/DSA/{collection}/`, but the F5 user need is preserved and arguably improved by staying on the same chapter). AC9 is amended above to remove the AC8 reference and document the obsolescence inline.

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview`.
3. `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — exit 0.
4. `python scripts/smoke-screenshots.py …` — capture visuals at 1280×800 + 2560×1080 of `/DSA/lectures/ch_4/`, `/DSA/notes/ch_4/`, `/DSA/practice/ch_4/`. Auditor opens at minimum one screenshot per collection and confirms:
   - H1 reads as the topic, not the coordinates.
   - Eyebrow caption renders above the H1.
   - Collection tabs render directly under the H1 (NOT in the breadcrumb bar).
   - Breadcrumb bar contains only `cs-300 / ch_4 — …` on the left and prev/next chapter pills on the right.
   - LeftRail entries (other than current) are single-line / truncated.
5. Auditor cross-collection-navigates: click "Notes" tab on `/DSA/lectures/ch_4/`, confirm landing on `/DSA/notes/ch_4/` with the Notes tab now `aria-current`.

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T3 row.
- (c) `m_ux_review/README.md` task table T3 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkboxes for F5, F6, F8 (with citation parenthetical pointing at the per-task issue file).
- (e) `design_docs/architecture.md` §1 reflects the new chrome shape.

## Carry-over from prior audits

None. T3 is net-new from the 2026-04-27 review.

## Out of scope

- F9 / F10 (mobile chrome) — T4. T3 builds the desktop shape T4 then collapses on mobile.
- F11 (typography pairing) — T6.
- New collection-switcher behaviours (e.g. keyboard arrow navigation between tabs). Future polish if friction emerges.
- Animated tab transitions. Out — instant per the M-UX motion rule.
- Removing the breadcrumb middle segment (`Lectures` / `Notes` / `Practice` landing-page link). The link is preserved in two places: the new collection tabs (the visible row directly under the H1) AND the home page card layout (T1 D1). The breadcrumb's middle segment was redundant with the collection tabs — removing it from the breadcrumb is the F5 fix; keeping the link reachable elsewhere is preserved.
