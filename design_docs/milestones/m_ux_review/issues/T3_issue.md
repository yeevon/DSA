# T3 — Chapter chrome — Audit Issues

**Source task:** [`../tasks/T3_chapter_chrome.md`](../tasks/T3_chapter_chrome.md)
**Audited on:** 2026-04-27
**Audit cycle:** 1
**Audit scope:** spec-vs-implementation verification of every D1–D5 deliverable
+ AC1–AC10, including the carry-over `M-UX T9 AC5/AC6/AC7/AC8/AC9 still pass`
predicate in AC9; design-drift check against [`design_docs/architecture.md`](../../../architecture.md)
§1 (page chrome diagram + new "Chapter chrome shape (M-UX-REVIEW T3)"
subsection), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md),
[`m_ux_polish/tasks/T3_breadcrumb.md`](../../m_ux_polish/tasks/T3_breadcrumb.md),
[`m_ux_polish/tasks/T9_layout_polish.md`](../../m_ux_polish/tasks/T9_layout_polish.md),
[`nice_to_have.md`](../../../nice_to_have.md) §UX-5 (F12) boundary; CLAUDE.md
non-negotiables (status-surface lockstep, code-task verification non-inferential
— auditor opens screenshots, runs harness from scratch); zero dependency-manifest
touch confirmation; M3 contract preservation (event names + listener counts +
`data-interactive-only` carrier shape); M-UX T9 contract preservation analysis
(specifically the removed `breadcrumb-collection-link-{lectures,notes,practice}`
cases vs the new `collection-tabs-{current-aria,on-notes}` cases). Fresh
`npm run build` re-executed (40 prerendered pages, exit 0); fresh
`npm run preview` + `python scripts/functional-tests.py` against the just-built
dist (50/50 cases / 102/102 assertions in 23.4s); `python scripts/smoke-screenshots.py`
captured 31 screenshots / 3,070,497 bytes; auditor opened
`lectures-ch4-1280x800.png`, `lectures-ch4-2560x1080.png`, `notes-ch4-1280x800.png`,
`practice-ch4-1280x800.png` and confirmed the eyebrow / topic-as-H1 / tabs / split-
breadcrumb / truncated-rail shape visually without zoom (citations inline). Manual
cross-collection-navigation smoke verified by inspecting the rendered ch_4 lectures
HTML for the `aria-current="page"` Notes-tab href and confirming the corresponding
`/DSA/notes/ch_4/` HTML emits the Notes tab as `aria-current` (citations inline).
Removed-test-cases re-extracted from `git show HEAD:scripts/functional-tests.json`
and contract-compared to the new tabs cases.

**Status:** ✅ PASS — cycle 2 closure (LOW-2 deferred to nice_to_have §UX-5).
Cycle 2 (2026-04-27) closed M-UX-REVIEW-T3-ISS-01 (HIGH-1, AC9 in-place spec
amendment + cycle-2 amendment blockquote, option (a)), M-UX-REVIEW-T3-ISS-02
(MEDIUM-1, architecture.md §1 line 143 paragraph rewritten with the correct
reachability story), and M-UX-REVIEW-T3-ISS-03 (LOW-1, `breadcrumb-height-matches-token`
bound tightened `[40, 44]` → `[40, 42]`; the suite still passes 50/50 cases /
102/102 assertions against the tighter bound). M-UX-REVIEW-T3-ISS-04 (LOW-2,
`CollectionTabs.astro` accent-overload mirroring the LeftRail current-chapter
idiom) stays OPEN flag-only, parked under `nice_to_have.md` §UX-5 trigger
(post-M5 F12 promotion task picks it up alongside `.chapter-link.is-current`).
T3 stays `✅ done 2026-04-27` across all five status surfaces — cycle 2 is
closure-only, no re-flip.

### Cycle history

- **Cycle 1 (2026-04-27).** ⚠️ OPEN — 1 HIGH + 1 MEDIUM + 2 LOW; AC1–AC8 + AC10
  PASS; AC9 PARTIAL (spec-internal contradiction navigated correctly by the
  Builder but undocumented inside the spec).
- **Cycle 2 (2026-04-27).** ✅ PASS — closure pass against user-picked Option A
  (HIGH-1 + MEDIUM-1 + LOW-1 fixed; LOW-2 stays parked).

---

## Design-drift check

Cross-checked against `design_docs/architecture.md` (§1 page chrome — diagram
+ "Chapter chrome shape (M-UX-REVIEW T3)" subsection + "Collection-landing
pages" amendment), `design_docs/adr/0002_ux_layer_mdn_three_column.md`,
`design_docs/milestones/m_ux_polish/tasks/T9_layout_polish.md` (the prior
breadcrumb contract), and `design_docs/nice_to_have.md` §UX-5 (F12 boundary).

| Check | Result | Citation |
| ----- | ------ | -------- |
| New dependency? | None. `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` returns empty (`wc -l` = 0). | n/a |
| New module / boundary crossing? | One new file: `src/components/chrome/CollectionTabs.astro`. Lives inside the existing `src/components/chrome/` boundary (per architecture.md §1 "Shared layout primitives"). Lateral peer to `Breadcrumb.astro` / `LeftRail.astro` / `RightRailTOC.astro`. No new layer crossed. | `src/components/chrome/CollectionTabs.astro:1-128` |
| Cross-cutting concerns? | Untouched. M3 events `cs300:read-status-changed` (×11 references), `cs300:toc-read-status-painted` (×6), `cs300:annotation-added` (×2), `cs300:drawer-toggle` (×4) — counts unchanged from T2 close. `data-interactive-only` carrier on ch_4 dist remains 87 (`grep -o "data-interactive-only" dist/client/lectures/ch_4/index.html \| wc -l` = 87). | grep across `src/` |
| Configuration / secrets? | None touched. | n/a |
| Observability? | None touched. | n/a |
| ADR-0002 right-rail / left-rail / breadcrumb composition contract? | Honoured. Right-rail untouched. Left-rail still hosts Required + Optional groups + per-chapter checkmark slot; T3 D3 only adds CSS (`text-overflow: ellipsis`) + a `title=` attribute on non-current entries. Breadcrumb retains its slot contract (mounts in `Base.astro` `breadcrumb` slot, hosts the drawer-trigger named slot for T7's hamburger), only the inner shape changes. | `Breadcrumb.astro:166-244`, `LeftRail.astro:115-170` |
| architecture.md §1 page-chrome ASCII diagram accurate to shipped chrome? | ✅ Updated correctly. Line 108 reads `cs-300 / ch_4 ─ Lists, Stacks, Queues          [← ch_3 \| ch_5 →]` — only crumbs left + arrow prev/next right (no Lectures/Notes/Practice middle segment, no collection-pill control). Lines 110–112 show the eyebrow → topic-as-H1 → tabs row in the center column above the chapter content. Matches the rendered ch_4 lectures HTML verbatim. | `architecture.md:106-122` |
| architecture.md §1 "Chapter chrome shape (M-UX-REVIEW T3)" subsection? | ✅ Present. Line 147 introduces the subsection; line 149 documents row 1 (breadcrumb crumbs + arrow chapter prev/next, collection-switcher pills + middle path segment removed); line 150 documents row 2 (eyebrow + topic-as-H1 + tabs) including the H1 invariant ("the page H1 names the chapter TOPIC, not the coordinates"); line 152 documents the cross-collection link preservation contract; line 154 documents the LeftRail truncation contract. | `architecture.md:147-154` |
| architecture.md §1 "Collection-landing pages" paragraph amendment? | ✅ Present. Line 143 amended in-place with the T3 D1 note: middle path segment removed, landing pages remain reachable via the new tabs (clicking a non-current tab navigates to the same chapter in the target collection). The paragraph correctly identifies that the home-page card grid is the cross-cutting entry point, BUT the paragraph's claim that landing pages are reachable via the tabs is technically incorrect — tabs link to `/DSA/{collection}/ch_N/` (chapter routes), not `/DSA/{collection}/` (landing pages). Surfaced as MEDIUM-1 below. | `architecture.md:143` |
| `nice_to_have.md` §UX-5 (F12 accent split) boundary? | Untouched by T3. `git diff HEAD -- design_docs/nice_to_have.md` shows the file gained §UX-5 at T1 (already in place pre-T3); T3 added no new tokens. `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` returns empty — no F12 token bleed. F12 stays parked under its M5-trigger. | `nice_to_have.md:207-258`; `src/styles/chrome.css` token block lines 26–100 unchanged |
| Status-surface lockstep? | All five surfaces flipped: (a) `tasks/T3_chapter_chrome.md:3` `**Status:** ✅ done 2026-04-27`, (b) `tasks/README.md` T3 row `✅ done 2026-04-27`, (c) `m_ux_review/README.md` task table T3 row `✅ done 2026-04-27`, (d) `m_ux_review/README.md` `Done when` F5 / F6 / F8 bullets `[x]` + No-regression bullet `[x]` with the post-T3 50/102 baseline cited, (e) milestones index (`milestones/README.md:27`) M-UX-REVIEW row reads `active (T1 + T2 + T3 closed 2026-04-27; T4–T6 outstanding)`. | grepped each file directly |
| Drift class HIGH count? | **0.** No architecture drift, no F12-token bleed, no manifest churn, no boundary crossing. | — |

---

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| AC1 — Breadcrumb bar has no collection-pill children | ✅ PASS | Functional test `breadcrumb-no-collection-pills` 2/2 asserts (`.breadcrumb .collection-switcher` count = 0; `.breadcrumb .collection-pill` count = 0). Source code: `Breadcrumb.astro:220-223` documents the removal in-comment ("collection-switcher `<ul class="collection-switcher">` REMOVED. Hoisted to `CollectionTabs.astro` mounted directly under the chapter H1"). The component frontmatter no longer declares `COLLECTIONS`, `COLLECTION_LABEL`, or `collectionLandingHref`; only the prev/next-chapter sort + `chapterHref()` helper remain. |
| AC2 — Prev/next chapter elements use `←` / `→` (not `‹` / `›`) | ✅ PASS | Functional test `breadcrumb-prev-next-arrows` 4/4 asserts (text-pattern `←` on `.breadcrumb .chapter-button.prev` with `all: true`; text-pattern `→` on `.breadcrumb .chapter-button.next`; cardinality 1/1 each). Source: `Breadcrumb.astro:210` (`<span aria-hidden="true">←</span>`), `:233` (`<span aria-hidden="true">→</span>`). Visual confirmation on `.smoke/screenshots/lectures-ch4-1280x800.png` — top-right corner shows `← ch_3` and `ch_5 →` button pair. |
| AC3 — Collection tabs render directly under the chapter H1 (DOM order: eyebrow → h1 → tabs) | ✅ PASS | Functional test `collection-tabs-under-h1` 4/4 asserts. The case uses a `pre_js` body-attribute trick to capture rendered `getBoundingClientRect().top` of the three elements and asserts `et < ht && ht < tt` then sets `data-t3-order="ok"`. Visual confirmation: `lectures-ch4-1280x800.png` shows eyebrow "CHAPTER 4 · LECTURES" above H1 "Lists, stacks, queues, deques" above the three-tab row. The `<header>` element in `src/pages/lectures/[id].astro:150-157` has `<p class="ch-eyebrow">{title} · Lectures</p>` → `<h1>{subtitle}</h1>` → `<CollectionTabs current="lectures" chapterId={…} />` in source order. Same shape in `notes/[id].astro:53-58` and `practice/[id].astro:55-60`. |
| AC4 — Chapter `<h1>` is the topic ("Lists, stacks, queues, deques"), not "Chapter 4 …" | ✅ PASS | Functional test `h1-is-topic-not-coordinates` 2/2 asserts (text-pattern `Lists, stacks, queues, deques` matches `main header h1` with `all: true`; cardinality 1). Source: each chapter route renders `<h1>{entry.data.subtitle}</h1>` where `entry.data.subtitle` is the chapter topic from the lectures/notes/practice frontmatter. Visual confirmation: lectures + notes + practice ch_4 screenshots all show the same topic in 24–32px bold serif as the page H1, no "Chapter 4" prefix. |
| AC5 — `.ch-eyebrow` carries the coordinates ("Chapter 4 · Lectures") | ✅ PASS | Functional test `eyebrow-has-coordinates` 1/1 asserts (text-pattern `(?i)Chapter 4.*Lectures` on `main header .ch-eyebrow` — case-insensitive because `chrome.css:184` sets `text-transform: uppercase`). Source: `lectures/[id].astro:154` `<p class="ch-eyebrow">{entry.data.title} · Lectures</p>`; CSS at `chrome.css:179-186` (small + bold + tracked + uppercase + `--mux-fg-subtle` color). Visual confirmation: 1280×800 + 2560×1080 screenshots show the eyebrow as small-caps muted text immediately above the H1. The other two routes mirror with " · Notes" / " · Practice" — verified in the rendered HTML for all three collections. |
| AC6 — One collection tab has `aria-current="page"`; href matches the current collection | ✅ PASS | Functional tests `collection-tabs-current-aria` 3/3 asserts (count of `[aria-current="page"]` = 1; href-pattern `/DSA/lectures/ch_4/$`; total tab count = 3) + `collection-tabs-on-notes` 2/2 asserts (on `/DSA/notes/ch_4/`, count = 1; href-pattern `/DSA/notes/ch_4/$`). Source: `CollectionTabs.astro:69` sets `aria-current={c === current ? 'page' : undefined}` so exactly one tab carries it. Manual cross-collection-navigation smoke verified inline: rendered `/DSA/lectures/ch_4/` HTML emits `<a href="/DSA/lectures/ch_4/" class="collection-tab is-current" aria-current="page">Lectures</a>` with sibling `<a href="/DSA/notes/ch_4/" class="collection-tab">Notes</a>`; rendered `/DSA/notes/ch_4/` HTML emits `<a href="/DSA/notes/ch_4/" class="collection-tab is-current" aria-current="page">Notes</a>`. The Notes-tab click on the lectures route lands on the corresponding notes route, with the Notes tab now `aria-current`. |
| AC7 — Non-current LeftRail entries truncate (ellipsis + nowrap); carry `title=` | ✅ PASS | Functional tests `left-rail-truncate-other-chapters` 3/3 asserts (computed `text-overflow: ellipsis` + `white-space: nowrap` on `.chapter-link:not(.is-current) .chapter-label`; `white-space: normal` on `.chapter-link.is-current .chapter-label`) + `left-rail-title-attr-on-other-chapters` 3/3 asserts (`title=` regex match on non-current; count `[title]` ≥ 11; count `is-current[title]` = 0). Auditor on-disk verification: `grep -oc 'title="ch_' /tmp/ch4.html` = 11 (= 12 chapters − 1 current); `grep -oc 'class="chapter-link is-current"'` = 1; `grep -oc 'class="chapter-link"'` = 11 (non-current entries; `is-current` adds the suffix and is matched separately). Source: `LeftRail.astro:128` + `:153` (`title={isCurrent ? undefined : fullLabel}`); CSS at `LeftRail.astro:251-255` (`.chapter-link:not(.is-current) .chapter-label`); `.chapter-label` gains `min-width: 0` at `:238` so the flex child can shrink below intrinsic content width and the ellipsis actually engages. |
| AC8 — Current LeftRail entry on `/DSA/lectures/ch_4/` is NOT truncated (multi-line render allowed) | ✅ PASS | Functional test `left-rail-truncate-other-chapters` asserts `white-space: normal` on `aside[data-slot="left-rail"] .chapter-link.is-current .chapter-label`. Source: `LeftRail.astro:251` selector is `.chapter-link:not(.is-current) .chapter-label` — the current entry is excluded by selector specificity rather than by an opt-in rule, so the default `.chapter-label` block-flow `white-space: normal` cascades. Visual confirmation: `notes-ch4-1280x800.png` shows "ch_4 — Lists, stacks, queues, deques" wrapping to two lines inside the current-chapter accent-bg pill while ch_1 / ch_2 / ch_3 / ch_5 / ch_6 / ch_7 / ch_9 / ch_10 / ch_11 / ch_12 / ch_13 each sit on a single line with trailing ellipsis on the longer ones. |
| AC9 — M-UX T9 AC5 / AC6 / AC7 / AC8 / AC9 still pass — LeftRail collection-aware hrefs, breadcrumb cs-300 link, current-page no-link contract preserved | ⚠️ PARTIAL — see HIGH-1 | T9 AC5 (`leftrail-collection-aware-notes`), AC6 (`leftrail-collection-aware-practice`), AC7 (`breadcrumb-cs300-link`), AC9 (`breadcrumb-current-page-no-link`) all PASS in the harness. **T9 AC8 (`breadcrumb-collection-link-{notes,lectures,practice}` cases) cannot pass — the surface AC8 asserted (the `<a>` inside `.breadcrumb-path li:nth-child(2)` linking to `/DSA/{collection}/`) is intentionally removed by T3 D1 per F5.** The Builder removed the three corresponding test cases in the same edit. The T3 spec is internally inconsistent here: AC9 enumerates AC8 as a contract that "still passes" while D1 + the "Out of scope" section both authorise removing the surface AC8 was about. Builder resolution treats spec D1 + Out-of-scope as superseding the AC9 enumeration; this is the only coherent reading but leaves the spec contradicting itself. Surfaced as HIGH-1 below — fix is a one-line spec amendment to AC9 to read `M-UX T9 AC5/AC6/AC7/AC9 still pass; AC8 obsolete by T3 D1 (cross-collection link migrated to CollectionTabs.astro per F5)`. |
| AC10 — `design_docs/architecture.md` §1 reflects the breadcrumb split + H1-as-topic invariant | ✅ PASS | §1 ASCII diagram updated (lines 106–122) — eyebrow + topic-as-H1 + tabs in the center column; breadcrumb shows only `cs-300 / ch_4 — Lists, Stacks, Queues          [← ch_3 \| ch_5 →]`. New "Chapter chrome shape (M-UX-REVIEW T3, supersedes M-UX T3 + T9 single-row breadcrumb)" subsection at line 147 documents row 1 (breadcrumb), row 2 (eyebrow + H1 + tabs) with the explicit H1 invariant, the cross-collection link preservation, and the LeftRail truncation contract. The "Collection-landing pages" paragraph at line 143 was amended in-place with the T3 D1 entry-point migration note (NOTE: this paragraph contains a small inaccuracy — see MEDIUM-1; AC10 itself still PASS on the substantive invariants documented). |

**AC tally: 9 / 10 PASS, 1 PARTIAL.**

The PARTIAL on AC9 is a spec-internal contradiction the Builder navigated correctly (consistent with T3 D1 + Out-of-scope), not an implementation defect. HIGH-1 below proposes the spec amendment.

---

## 🔴 HIGH

### HIGH-1 — T3 spec AC9 enumerates T9 AC8 as a contract that "still passes," but T3 D1 + the spec's own "Out of scope" section both authorise removing the surface AC8 asserted

**What.** T3 spec [`tasks/T3_chapter_chrome.md`](../tasks/T3_chapter_chrome.md) line 134 (AC9):

> "M-UX T9 AC5 / AC6 / AC7 / AC8 / AC9 still pass — LeftRail collection-aware hrefs, breadcrumb cs-300 link, current-page no-link contract preserved. (existing T9 cases)"

The originating M-UX T9 AC8 contract (`m_ux_polish/tasks/T9_layout_polish.md:110`):

> "On `/DSA/notes/ch_4/`, breadcrumb middle segment text is `Notes` (not `Lectures`) AND href is `${baseUrl}/notes/`."

This was a **landing-page** href contract (`/DSA/notes/`, not `/DSA/notes/ch_4/`) — clicking the breadcrumb middle segment on a chapter page took the user back to the collection landing index. T3 D1 explicitly removes that surface (the middle `<li><a>{collectionLabel}</a></li>` from the breadcrumb's path `<ol>`) and the spec's own "Out of scope" section (lines 165–168) confirms this is intentional.

In the same edit, the Builder removed the three obsolete test cases (`breadcrumb-collection-link-{lectures,notes,practice}`) that asserted T9 AC8 against the now-removed selector `.breadcrumb-path li:nth-child(2) a`. The removal is documented in `Breadcrumb.astro:81-87` ("their selectors no longer exist; new T3 tests cover the same link contract on the tabs"), in the CHANGELOG entry, and in the `m_ux_review/README.md` no-regression bullet (line 44).

The Builder's framing — "the new tabs cases (`collection-tabs-current-aria`, `collection-tabs-on-notes`) preserve the cross-collection link contract" — is not literally true at the URL level: the new tabs link to **chapter routes** (`/DSA/notes/ch_4/`), while the removed AC8 cases asserted a link to **collection-landing pages** (`/DSA/notes/`). These are different URLs with different navigational meanings. So strictly, T9 AC8 cannot still pass; T3 D1 destroyed the contract by design.

**Why HIGH (not MEDIUM).** This is a CLAUDE.md auditor non-negotiable: the audit graded each AC individually, and AC9's plain-text predicate "M-UX T9 AC5 / AC6 / AC7 / AC8 / AC9 still pass" is FALSE on the literal AC8 reading. The spec is internally inconsistent — D1 + Out-of-scope authorise the deletion AC9 then asserts must not have happened. A future reader (Builder of T4, the milestone-close auditor, or anyone reviewing the cycle log six months from now) hitting the AC9 line will conclude the audit was negligent. The fix is small (one-line spec amendment), so the cost of leaving the contradiction in place is greater than the cost of fixing it.

**Action / Recommendation.** Two reasonable directions; user input required to pick:

- **(a) Amend AC9 in T3 spec to drop AC8 and cite the migration.** Rewrite line 134 to read:
  > "M-UX T9 AC5 / AC6 / AC7 / AC9 still pass — LeftRail collection-aware hrefs, breadcrumb cs-300 link, current-page no-link contract preserved. T9 AC8 (breadcrumb middle-segment landing-page link) is OBSOLETE per T3 D1 + the F5 finding — the cross-collection one-click navigation contract migrates to `CollectionTabs.astro` (the tabs link to chapter routes in the target collection rather than the collection landing index, which is the F5-authorised UX change). Landing-page reachability from chapter routes via the breadcrumb is intentionally removed; the home-page card grid (T1 D1) remains the cross-cutting landing-page entry point, and direct URL navigation continues to work."
  Then add a `## Cycle 1 amendment (2026-04-27)` blockquote below the AC table documenting the change-of-record. Owner: any subsequent Builder editing the T3 spec, or the user authorising a docs-only spec amendment.

- **(b) Add an explicit AC11 "T9 AC8 obsolete" with rationale + the migrated-contract test cases as evidence.** Same factual content as (a), preserves AC9 as-is for the cycle history but adds a sibling AC that the audit can grade explicitly. Slightly more spec churn; arguably clearer for the next reader.

Either reading is fine; (a) is shorter and matches the M-UX T2 cycle-2 pattern (in-place spec amendment + cycle blockquote, see `T2_issue.md` LOW-2 / LOW-4 resolutions). **Default recommendation: (a).** Without a fix, the spec stays internally inconsistent; the Builder's navigation of the contradiction is correct but undocumented inside the spec itself.

**Trigger to act.** No external trigger — the contradiction exists in the closed spec. Best fixed at the T3 close audit (here) or at the T4 close audit (which depends on T3's chrome shape). Latest acceptable fix: M-UX-REVIEW close.

**Resolution (cycle 2, 2026-04-27).** RESOLVED via option (a) — the in-place AC9 amendment + cycle-2 amendment blockquote, mirroring the M-UX T2 cycle-2 in-place spec amendment pattern. T3 spec line 134 (the AC table AC9 row) now reads `M-UX T9 AC5 / AC6 / AC7 / AC9 still pass; AC8 obsolete by T3 D1 (cross-collection link migrated to CollectionTabs.astro per F5).` — drops the AC8 enumeration and cites the F5 / D1 authorisation directly inline. Immediately after the AC table, a `> **Cycle-2 amendment (2026-04-27, closes M-UX-REVIEW-T3-ISS-01):** …` blockquote documents the change-of-record: AC8's surface was authorised gone by T3 D1 + Out-of-scope, the three corresponding T9 cases were correctly removed in cycle 1, and the F5 user need is genuinely preserved by the new `collection-tabs-{current-aria,on-notes}` cases (different URL contract — chapter-route vs landing-page — but the F5 cross-collection-navigation user need is preserved + arguably improved by staying on the same chapter). The spec is now internally consistent: D1 + Out-of-scope + AC9 + the cycle-2 blockquote all tell the same story.

---

## 🟡 MEDIUM

### MEDIUM-1 — Architecture.md §1 line 143 incorrectly claims collection-landing pages "remain reachable from chapter pages via the new collection tabs" — they don't

**What.** `architecture.md:143` (the "Collection-landing pages" paragraph amended at T3) reads in part:

> "**Breadcrumb-link entry point amended at M-UX-REVIEW T3 (2026-04-27):** the middle path segment (`Lectures` / `Notes` / `Practice`) was previously the navigational entry point from chapter pages; T3 D1 removed that segment from the breadcrumb because it shared the row with two other navigation models. The collection-landing pages remain reachable from chapter pages via the new collection tabs (`CollectionTabs.astro` — clicking a non-current tab navigates to the same chapter in the target collection; the landing pages themselves remain the home-page card-grid entry point + the collection switcher's chapter-route landing target)."

The bracketed parenthetical correctly notes that tabs link to chapter routes, not landing pages — but the sentence's main clause asserts landing pages remain reachable "from chapter pages via the new collection tabs," which contradicts the parenthetical. After T3 D1, **no** in-app surface on a chapter route links to `/DSA/lectures/`, `/DSA/notes/`, or `/DSA/practice/`. Verified by `grep -rEn "\\\$\\{baseUrl\\}/(lectures|notes|practice)/" src/` returning only the three `ChapterCard.astro` lines (`:156`, `:159`, `:162`), all of which build chapter-route hrefs (`/DSA/{collection}/${id}/`), not landing-page hrefs.

The functional impact is small — the collection-landing pages are reachable by:
1. Going back to the home page (the only surface that arguably "links" to landing pages is the home `<header>` blurb / breadcrumb — and even that is gone post-T3, replaced by the chapter-card grid which links to chapter routes).
2. Direct URL navigation (typing `/DSA/notes/` in the address bar).
3. Browser history.

T3 spec's "Out of scope" line 168 is more accurate: "the link is preserved in two places: the new collection tabs (the visible row directly under the H1) AND the home page card layout (T1 D1)." But this too is technically incorrect about the link target — both surfaces link to chapter routes, not landing pages. The collection-landing pages are now an SSR-rendered surface that has lost all in-app entry points from chapter pages. Whether this is a UX regression or an intentional simplification depends on what "reachability" means in F5's intent — the F5 finding cared about cross-collection NAVIGATION (jumping from lectures→notes), not landing-index reachability.

**Why MEDIUM (not HIGH).** The architecture doc claim is factually inaccurate. But:
1. The user-experience effect is marginal: landing pages are SSR-rendered and remain reachable via the home page or direct URL, just not from a chapter page in one click.
2. The functional test harness now has zero coverage of "landing pages stay reachable" — a future task that accidentally breaks landing-page rendering won't fire any current case (the `landing-page-{lectures,notes,practice}-renders` cases at `functional-tests.json:158-191` still exist and assert chapter-card cardinality at the landing URL, so SSR rendering itself is covered; but the landing-page **reachability from chapter pages** is no longer tested anywhere).
3. The T3 spec's own "Out of scope" justification is the operative scope authorisation; the architecture-doc inaccuracy is a documentation-quality issue, not an implementation regression.

**Action / Recommendation.** Two reasonable directions; user input optional (the Builder can pick the closer-to-truth wording without a user check):

- **(a) Edit line 143 to reflect the actual reachability state.** Replace the offending sentence with: "T3 D1 removed the middle path segment from the breadcrumb (it shared the row with two other navigation models). Collection-landing pages no longer have a one-click entry point from chapter routes; they remain reachable via the home page or direct URL navigation. Cross-collection chapter navigation (the F5 user need) migrates to the new `CollectionTabs.astro` row under the H1, which links to the same chapter in the target collection (a stricter / more useful contract than the prior breadcrumb middle-segment landing-page link)." Owner: any subsequent M-UX-REVIEW Builder editing §1, or a docs-only sweep at milestone close.

- **(b) Same edit AND add a regression-guard test case** that asserts the home-page card grid links to chapter routes (already covered by the T1 cases — `home-card-action-classes` + `home-card-progress-carrier` + `home-card-h3-chapter-label` + `home-card-subtitle-blurb`); plus a new case asserting `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` each return 200 + render `<article class="chapter-card">` × 12 (already covered by `landing-page-{lectures,notes,practice}-renders`). Net: no new test cases needed — current harness already covers the landing-page SSR reachability that matters; the docs-only fix in (a) is sufficient.

**Default recommendation: (a).** Single-paragraph edit; no test churn. The harness already covers the reachability that has user-meaning (SSR exists at the URL); what was lost is a one-click in-app entry point from chapter routes, which the F5 finding implicitly authorised the loss of.

**Resolution (cycle 2, 2026-04-27).** RESOLVED via option (a) — the docs-only paragraph rewrite at `architecture.md` line 143. The "Collection-landing pages (M-UX T9 D5)" paragraph now states the correct reachability story: after T3 D1, no chrome surface on a chapter route links directly to `/DSA/{lectures,notes,practice}/`; the cross-collection user need (jump to a different collection's chapter) is served by `CollectionTabs.astro` chapter-to-chapter (not chapter-to-landing-page), and the home + landing-page card grid (T1 D2 + M-UX T9 D5) remains the entry point for landing-page navigation. The 40-page total + the dist size pointer to m_ux_polish/README.md stay; only the reachability sentence changed. No test churn — the existing `landing-page-{lectures,notes,practice}-renders` cases continue to cover landing-page SSR rendering, and the new wording correctly states that the in-app one-click reachability from chapter routes is intentionally gone (matching what the harness reflects).

---

## 🟢 LOW

### LOW-1 — `chrome.css` `--mux-breadcrumb-height` re-measurement comment claims the breadcrumb shrunk to 40.91px, but the harness bound is `[40, 44]` not `[40, 42]`

**What.** `src/styles/chrome.css:87-99` (the cycle-2 / T3 update on the `--mux-breadcrumb-height` token) reads:

> "M-UX T9 D2 — sticky-rail offset. Re-measured 2026-04-27 at M-UX-REVIEW T3 close: removing the collection-switcher pills + the middle path segment from the breadcrumb (T3 D1, F5) shrank the rendered height from 44.91px (post-T9) to 40.91px (post-T3). Token rounded to 42px (1px hairline buffer, same convention as T9). … Historical: T9 era token = 46px (44.91px measured); pre-T9 hand-measured = 52px."

The comment claims the actual rendered height is 40.91px, but the corresponding test case (`breadcrumb-height-matches-token` at `functional-tests.json:274-286`) asserts the breadcrumb's rendered height is `between [40, 44]` — a 4-pixel band rather than the tighter `[40, 42]` band a precise re-measurement would justify. This is a slight over-relaxation: a future change that adds 3px of vertical padding to the breadcrumb would still pass (43px ∈ [40, 44]) without firing the height-vs-token regression guard the test was designed to catch.

The token itself (42px) is correctly chosen (40.91px rounded up + 1px hairline buffer per the T9 convention); only the test bound is slightly looser than the comment suggests it should be.

**Why LOW.** Bound is still tight enough to catch the typical regression scenarios (10–20% padding tweaks). The 4-pixel band is the same width as the T9 era band (`[44, 48]` was 4px wide) and the same convention M-UX T9 used; T3 didn't introduce a precision regression, it kept the existing convention. The chrome.css comment overstates the precision but doesn't claim the test is tighter than it is.

**Action / Recommendation.** Two equally-reasonable options:

- **(a) Tighten the test bound to `[40, 42]` to match the comment's precision claim.** Minimal change in `functional-tests.json:283`. Future-proof a 1px regression that the looser bound would let through. Owner: any subsequent Builder editing the T3-area test cases.
- **(b) Leave the bound at `[40, 44]` and adjust the comment to match.** Edit `chrome.css:90` to read "shrank … from 44.91px to ~41.5px (rounded down to 40 in the test bound's lower bound + a 4px wiggle range to mirror the T9 convention)." Comment-only change.

**Default recommendation: (a).** Tighter bound, smaller change, and the test is the contract the comment describes. **Owner:** flag-only on this audit; no carry-over to T4 (T4 mobile reduction will likely change breadcrumb height again at <768px and will need a re-measurement of its own).

**Resolution (cycle 2, 2026-04-27).** RESOLVED via option (a) — bound tightened `[40, 44]` → `[40, 42]` at `scripts/functional-tests.json:283`. Re-ran `.venv/bin/python scripts/functional-tests.py` against the rebuilt dist: `breadcrumb-height-matches-token (1/1 asserts)` PASS, full suite still 50/50 cases / 102/102 assertions. The 40.91px rendered measurement now sits inside a 2-pixel band (still tolerant of sub-pixel rendering variance, no longer 4× looser than the chrome.css comment's precision claim suggests) — a future change that adds 2px+ of breadcrumb vertical padding will now trip the regression guard, where previously it took 3px+ to fire. No fall-back to the comment-relaxation alternative was required.

### LOW-2 — `CollectionTabs.astro` `is-current` styling is identical to the LeftRail current-chapter highlight, doubling the F12 accent-overload pressure

**What.** `CollectionTabs.astro:118-127` defines `.collection-tab.is-current` as:

```css
background: var(--mux-accent-bg);
color: var(--mux-fg);
border-color: var(--mux-accent);
font-weight: 600;
box-shadow: inset 0 0 0 1px var(--mux-accent);
```

This is intentionally identical to the LeftRail `.chapter-link.is-current` rule (`LeftRail.astro:222-229`) — same accent-bg, same accent-coloured ring. The component docstring at `CollectionTabs.astro:23-25` documents this as a deliberate design choice ("'current' reads identically across both surfaces").

The F12 finding (LOW, parked in `nice_to_have.md` §UX-5) flagged that `--mux-accent` is already overloaded — it currently signals chapter-number tag, current section in the right-rail TOC, current item in the left rail, current collection pill (now tab), Mark-read button, completion indicator, interactive-mode badge. T3 adds one more "current" surface using the same colour. Strictly, the count of accent-overloaded surfaces doesn't change (the previous breadcrumb-collection-pill `is-current` rule lived in `Breadcrumb.astro` and was deleted at T3 D1); but the visual prominence of the accent on the tab row is greater than the prior pill row (filled background + ring vs the prior pill which was a smaller `padding: 2px 12px` element), so the F12 pressure it adds is non-zero.

**Why LOW.** F12 is explicitly parked under its M5 trigger — "current vs achievement" has no second axis to express until M5 lights up review-due / completion signals. T3 maintains the existing "current-everywhere-uses-accent" convention; it doesn't break a contract. The Builder's choice to mirror the LeftRail current-chapter idiom (accent-bg + ring) on the new tabs is the correct precedent-following decision.

**Action / Recommendation.** No action required pre-M5. When M5 lands and unlocks F12 (per `nice_to_have.md` §UX-5 trigger), the F12 token split should affect `.collection-tab.is-current` + `.chapter-link.is-current` together (same idiom, same fix). Logged here as a pointer for the F12 promotion task. **Owner:** flag-only on this audit; the F12 promotion task (post-M5) will pick this up via the `nice_to_have.md` §UX-5 promotion check.

---

## Additions beyond spec — audited and justified

### A1 — `--mux-breadcrumb-height` token updated 46 → 42px in the same edit

T3 spec D4 line 116 anticipated the breadcrumb-shrink ("the breadcrumb shrunk 4px from D1 removals") but D1 itself doesn't name the token update. The token lives in `chrome.css:99` and is consumed by Base.astro's sticky-rail offset rule (per the §1.6 sticky-rail contract).

**Justified.** The spec D4 explicitly cited the existing test bound update (`[44, 48]` → `[40, 44]`) but the token MUST be updated in the same edit or the rails would over-offset by 4px below the now-shorter breadcrumb. Builder's note in the chrome.css comment block (`:87-99`) documents the rationale and keeps the historical lineage (T9 era 46px, pre-T9 hand-measured 52px). The change is mandatory to prevent the rail-offset-vs-breadcrumb-height drift that M-UX T9 deep-review caught at `46px` token vs `44.91px` measured (the existing precedent for re-measurement on chrome shape changes).

### A2 — Spec D4 names "~9 new test cases"; Builder shipped exactly 9 added + 3 removed = +6 net, and re-bounded one existing case

`functional-tests.json` post-T3 = 50 cases / 102 assertions; T2 baseline was 44 / 84. Delta `+9 - 3 = +6 cases`, `+24 - 6 = +18 assertions`. The three removed cases (`breadcrumb-collection-link-{lectures,notes,practice}`) targeted selectors T3 D1 explicitly removes (the `.breadcrumb-path li:nth-child(2) a` middle-segment link) and have no surviving DOM target post-T3.

**Justified.** Removing the obsolete cases is mandatory — they would fail otherwise, blocking the audit gate. Builder's CHANGELOG + the `m_ux_review/README.md` no-regression bullet (line 44) explicitly document the removals + the migration story (link contract moved to the new tabs cases). The +9 added matches the spec D4 enumeration verbatim. The contract migration story is partially correct (see HIGH-1 — the new tabs cases assert a different URL contract than the removed cases, but the F5 user need is genuinely preserved by the new contract).

### A3 — `breadcrumb-height-matches-token` re-bounded `[44, 48]` → `[40, 44]` in the same edit

Spec D4 mentions this update inline ("plus the existing `breadcrumb-height-matches-token` re-bounded …"). Builder kept the same 4-pixel wiggle band (`[N, N+4]`) the T9 era used, just shifted down to match the new shorter breadcrumb. See LOW-1 above for the precision discussion.

**Justified.** Mandatory test-bound update — without it, the existing case would fail post-T3 (breadcrumb is now 40.91px rendered, was 44.91px). The 4-pixel band convention follows T9 precedent.

### A4 — `Breadcrumb.astro` frontmatter cleanup (removed `COLLECTIONS`, `COLLECTION_LABEL`, `collectionLandingHref`)

T3 spec D1 names the markup change but doesn't enumerate the dead-code cleanup. Builder removed the three now-orphaned declarations from the component frontmatter (`Breadcrumb.astro:114-160` per the docstring trail).

**Justified.** Hygiene cleanup; no behavioural change. The deletions are documented in the component docstring at `:115-120` ("trimmed `COLLECTIONS`, `COLLECTION_LABEL`, and the `collectionLandingHref` helper because the breadcrumb no longer renders a middle path segment or the collection switcher"). The `Collection` type alias remains because the URL-pattern parse + the prev/next-chapter link helper still need it. Clean.

---

## Verification summary

### Gates

| Gate | Command | Pass/Fail | Output |
| ---- | ------- | --------- | ------ |
| Build | `npm run build` | ✅ PASS | "Completed in 826ms"; **40 prerendered pages** confirmed (12 lectures + 12 notes + 12 practice + 3 collection-landing + 1 dashboard index). Vite/Astro exit 0. |
| Preview | `npm run preview` (background) | ✅ reachable | `wget -q -O /tmp/ch4.html http://localhost:4321/DSA/lectures/ch_4/` returned 581,415 bytes of SSR HTML (Astro v6.1.9, all `[data-level="1" \| "2"]` chrome.css rules + the new `.ch-eyebrow` rule + the `.collection-tab` ruleset inlined). |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ PASS | **50/50 cases, 102/102 assertions in 23.4s.** All nine new T3 cases pass: `breadcrumb-no-collection-pills` (2/2), `breadcrumb-prev-next-arrows` (4/4), `collection-tabs-under-h1` (4/4), `h1-is-topic-not-coordinates` (2/2), `eyebrow-has-coordinates` (1/1), `collection-tabs-current-aria` (3/3), `collection-tabs-on-notes` (2/2), `left-rail-truncate-other-chapters` (3/3), `left-rail-title-attr-on-other-chapters` (3/3). The re-bounded `breadcrumb-height-matches-token` (1/1) passes against the new `[40, 44]` band. T1 + T2 + M-UX T9 carry-over cases all pass: `chrome-centered-2560` (2/2), `chrome-fills-1024` (2/2), `left-rail-sticky-after-scroll-ch4` (1/1), `right-rail-sticky-after-scroll-ch4` (1/1), `leftrail-collection-aware-{notes,practice}` (1/1 each), `breadcrumb-cs300-link` (2/2), `breadcrumb-current-page-no-link` (3/3), `landing-page-{lectures,notes,practice}-renders` (1/1 each), `landing-page-highlight-{lectures,notes,practice}` (2/2 each), `rhs-toc-h1-numbered-ch{1,4}` (1/1 each), `right-rail-toc-h1-h2-mix` (2/2), `right-rail-toc-h1-bold` (1/1), `right-rail-toc-h2-indented` (2/2), `right-rail-scroll-spy-on-h2` (2/2), `home-card-action-classes` (3/3), `home-card-progress-carrier` (2/2), `home-card-h3-chapter-label` (2/2), `home-card-subtitle-blurb` (4/4), `home-required-heading` (4/4), `home-required-subtitle` (1/1), `landing-required-heading-{lectures,notes,practice}` (3/3 each), `home-continue-reading-{empty,populated}` (2/2 each), `landing-continue-reading-{empty,populated}-{lectures,notes,practice}` (2/2 each), `home-continue-reading-rejects-javascript-uri` (2/2), `drawer-trigger-visible-mobile` (2/2), `rhs-toc-collapsed-mobile-default` (1/1). |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321` | ✅ PASS | **31 screenshots / 3,070,497 bytes in 15.3s.** Cited screenshots opened by auditor (paths absolute): `/home/papa-jochy/Documents/School/cs-300/.smoke/screenshots/lectures-ch4-1280x800.png`, `…/lectures-ch4-2560x1080.png`, `…/notes-ch4-1280x800.png`, `…/practice-ch4-1280x800.png`. |
| Visual hierarchy (1280×800 lectures) | open `.smoke/screenshots/lectures-ch4-1280x800.png` | ✅ PASS | H1 reads "Lists, stacks, queues, deques" (the topic) — confirmed; eyebrow reads "CHAPTER 4 · LECTURES" (uppercase, tracked, muted) — confirmed; collection tabs render directly under H1 with Lectures filled-accent and Notes/Practice outline — confirmed; breadcrumb reads only `cs-300 / ch_4 — Lists, stacks, queues, deques` on left + `← ch_3 / ch_5 →` on right (no Lectures/Notes/Practice middle segment, no collection-pill control) — confirmed; LeftRail ch_4 (current) renders with full multi-line text inside the accent-bg pill while ch_1/ch_2/ch_3/ch_5/ch_6/ch_7/ch_9/ch_10/ch_11/ch_12/ch_13 each sit on a single line with trailing ellipsis on the longer ones — confirmed. |
| Visual hierarchy (1280×800 notes) | open `.smoke/screenshots/notes-ch4-1280x800.png` | ✅ PASS | Notes-route mirrors lectures: same eyebrow / topic-as-H1 / tabs (Notes filled-accent now) / split-breadcrumb / truncated-LeftRail shape. Eyebrow reads "CHAPTER 4 · NOTES". |
| Visual hierarchy (1280×800 practice) | open `.smoke/screenshots/practice-ch4-1280x800.png` | ✅ PASS | Practice-route mirrors: eyebrow "CHAPTER 4 · PRACTICE"; H1 "Lists, stacks, queues, deques"; tabs row (Practice filled-accent); split-breadcrumb with arrows; truncated LeftRail. |
| Visual hierarchy (2560×1080 lectures) | open `.smoke/screenshots/lectures-ch4-2560x1080.png` | ✅ PASS | Wide-viewport: chrome centered (chrome max-width = 1400px per T9 D1); eyebrow + topic-as-H1 + tabs row legible above the chapter-content prose; breadcrumb shape unchanged (no collection middle segment or pills); LeftRail truncation visible on non-current entries. |
| Manual cross-collection-navigation smoke | inspect rendered `/DSA/lectures/ch_4/` and `/DSA/notes/ch_4/` HTML | ✅ PASS | On `/DSA/lectures/ch_4/`: `<a href="/DSA/lectures/ch_4/" class="collection-tab is-current" aria-current="page">Lectures</a>` + `<a href="/DSA/notes/ch_4/" class="collection-tab">Notes</a>` + `<a href="/DSA/practice/ch_4/" class="collection-tab">Practice</a>` — clicking Notes goes to `/DSA/notes/ch_4/`. On `/DSA/notes/ch_4/`: `<a href="/DSA/notes/ch_4/" class="collection-tab is-current" aria-current="page">Notes</a>` — Notes tab now `aria-current`. Cross-collection navigation contract verified end-to-end. |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ no touches | empty diff (`wc -l` = 0). No `dependency-auditor` run required. |
| F12 boundary | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | ✅ empty | no F12 token bleed. F12 stays parked under its M5 trigger per `nice_to_have.md` §UX-5. |
| nice_to_have.md untouched by T3 | `git diff HEAD -- design_docs/nice_to_have.md` | ✅ T3-clean | The diff shows the §UX-5 entry was added at T1 (pre-T3); T3 added no new entries and modified no existing ones. |
| ch_4 byte-size delta | `stat -c '%s' dist/client/lectures/ch_4/index.html` | ✅ captured | **581,415 bytes** post-T3 (T2 baseline = 580,627; delta = +788 bytes / +0.14%). Negligible — T3 is a markup-shape edit + a small CSS rule, not a content-volume change. |
| Carrier count | `grep -o "data-interactive-only" dist/client/lectures/ch_4/index.html \| wc -l` | ✅ captured | **87** — unchanged from T2 close. M3 gating contract preserved verbatim. |
| Status surfaces | per-task spec / `tasks/README.md` / `m_ux_review/README.md` (task table + Done-when bullets F5 / F6 / F8 + No-regression) / milestones index | ✅ all five flipped + consistent | T3 spec line 3: `**Status:** ✅ done 2026-04-27`. `m_ux_review/tasks/README.md` T3 row: `✅ done 2026-04-27`. `m_ux_review/README.md` task table T3 row: `✅ done 2026-04-27`. `m_ux_review/README.md` `Done when` F5 / F6 / F8 bullets all `[x]` with citation parenthetical pointing at `(T3 issue file)`; No-regression bullet `[x]` with `50 cases / 102 assertions` cited. `milestones/README.md:27` M-UX-REVIEW row: `active (T1 + T2 + T3 closed 2026-04-27; T4–T6 outstanding)`. No drift across surfaces. |

### Doc-content greps (AC10 substantive checks)

- `architecture.md` §1 ASCII diagram shows `← ch_3` / `ch_5 →` arrow glyphs (not `‹ ch_3` / `ch_5 ›` guillemets) — ✅ (line 108).
- `architecture.md` §1 ASCII diagram shows the eyebrow / topic-as-H1 / tabs row in the center column — ✅ (lines 110–112).
- `architecture.md` §1 ASCII diagram has no Lectures/Notes/Practice middle segment in the breadcrumb row — ✅ (line 108).
- `architecture.md` §1 has a "Chapter chrome shape (M-UX-REVIEW T3)" subsection — ✅ (line 147).
- §1 subsection mentions "H1 invariant (UI-review F6, T3 D2): the page H1 names the chapter TOPIC, not the coordinates" — ✅ (line 150).
- §1 subsection mentions cross-collection link preservation via `CollectionTabs.astro` — ✅ (line 152).
- §1 subsection mentions LeftRail truncation contract — ✅ (line 154).
- §1 "Collection-landing pages" paragraph amendment present — ✅ (line 143; substantive but slightly over-claims reachability — see MEDIUM-1).

### M3 contract preservation

- `cs300:read-status-changed` dispatchers + listeners: count unchanged from T2 close (4 dispatchers + 4 listeners across `RightRailReadStatus.astro`, `MarkReadButton.astro`, `RightRailTOC.astro`, `DrawerTrigger.astro`).
- `cs300:toc-read-status-painted`: 1 dispatcher + 1 listener, unchanged.
- `cs300:annotation-added`: 1 dispatcher + 1 listener, unchanged.
- `cs300:drawer-toggle`: 1 dispatcher + 1 listener, unchanged.
- `[data-read-indicator][data-read="true"]` selector unchanged in `MarkReadButton.astro`.
- `data-interactive-only` carrier count on ch_4: 87 — unchanged from T2 close (per T2 issue file AC8).
- LeftRail `<span class="checkmark-slot" data-chapter-id={c.id} data-interactive-only>` shape unchanged at `LeftRail.astro:131` + `:156`.

### M-UX T9 contract analysis (the critical claim from the controller brief)

Re-extracted the three removed cases from `git show HEAD:scripts/functional-tests.json`:

```json
{ "name": "breadcrumb-collection-link-notes",   "url": "/DSA/notes/ch_4/",
  "asserts": [ {selector: ".breadcrumb-path li:nth-child(2) a", href-pattern: "/DSA/notes/$"},
               {selector: ".breadcrumb-path li:nth-child(2) a", textContent: "^Notes$"} ] }
{ "name": "breadcrumb-collection-link-lectures", url: "/DSA/lectures/ch_4/",
  asserts: [ href-pattern "/DSA/lectures/$"; textContent "^Lectures$" ] }
{ "name": "breadcrumb-collection-link-practice", url: "/DSA/practice/ch_4/",
  asserts: [ href-pattern "/DSA/practice/$"; textContent "^Practice$" ] }
```

The new tabs cases (`collection-tabs-current-aria` on `/DSA/lectures/ch_4/`, `collection-tabs-on-notes` on `/DSA/notes/ch_4/`):

- href-pattern: `/DSA/{collection}/ch_4/$` (chapter route in target collection — different URL from the removed cases).
- selector: `.collection-tabs a[aria-current="page"]` (different DOM location — under the H1, not in the breadcrumb).
- text content: not asserted on the tabs cases; the tabs render `Lectures` / `Notes` / `Practice` per `CollectionTabs.astro:49-53` `COLLECTION_LABEL` map.

**Conclusion.** The new tabs cases assert a DIFFERENT URL contract than the removed cases — chapter-route vs landing-page. The Builder's "moved location, same contract" framing in `m_ux_review/README.md:44` and the CHANGELOG entry is misleading at the URL level; the F5 user need (cross-collection navigation in one click) is preserved (and arguably improved — staying on the same chapter is a tighter navigation than landing on a different page), but the literal T9 AC8 contract (`href = /DSA/{collection}/`) is destroyed by design. The spec authorisation for this destruction lives in T3 D1 + the spec's "Out of scope" section; T3 spec AC9's enumeration of T9 AC8 as "still passes" is internally inconsistent with that authorisation. See HIGH-1 for the proposed spec amendment.

---

## Issue log — cross-task follow-up

| ID | Severity | Description | Status | Owner / next touch point |
| -- | -------- | ----------- | ------ | ------------------------ |
| M-UX-REVIEW-T3-ISS-01 | HIGH | T3 spec AC9 enumerates M-UX T9 AC8 as a contract that "still passes," but T3 D1 + Out-of-scope both authorise removing the surface AC8 asserted; spec is internally inconsistent. | RESOLVED — cycle 2 | T3 spec AC9 line 134 amended in-place + cycle-2 amendment blockquote added immediately after the AC table (option (a)). |
| M-UX-REVIEW-T3-ISS-02 | MEDIUM | `architecture.md` §1 line 143 incorrectly claims collection-landing pages "remain reachable from chapter pages via the new collection tabs" — tabs link to chapter routes, not landing pages. | RESOLVED — cycle 2 | `architecture.md` line 143 paragraph rewritten with the correct reachability story (option (a)); no test churn required. |
| M-UX-REVIEW-T3-ISS-03 | LOW | `chrome.css` `--mux-breadcrumb-height` re-measurement comment claims 40.91px rendered but `breadcrumb-height-matches-token` test asserts `[40, 44]` (4-pixel band), looser than the comment's precision suggests. | RESOLVED — cycle 2 | `functional-tests.json:283` bound tightened `[40, 44]` → `[40, 42]` (option (a)); full suite still 50/50 cases / 102/102 assertions. |
| M-UX-REVIEW-T3-ISS-04 | LOW | `CollectionTabs.astro` `.is-current` styling adds an accent-overload surface; mirrors LeftRail `.chapter-link.is-current` by design. | OPEN — flag only, F12-trigger-driven | F12 promotion task post-M5 picks up the `.collection-tab.is-current` token-split alongside `.chapter-link.is-current` per `nice_to_have.md` §UX-5. Owner: future F12 promotion task. |

---

## Deferred to nice_to_have

None.

The two `nice_to_have.md` boundaries this audit checked were both verified untripped:
- **§UX-4 (SSR-embedded section-list endpoint trigger).** T3 is markup-shape + CSS only; no `dist/client/` size pressure (ch_4 delta = +788 bytes from T2 baseline; cumulative `dist/client/` size unchanged in any meaningful way). M5 hasn't shipped, so no API-surface subsumption either. §UX-4 stays parked.
- **§UX-5 (F12 accent semantic split).** No new `--mux-current` / `--mux-achievement` / `--mux-toc-h2-color` token introduced; `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` returns empty. The new `.collection-tab.is-current` rule consumes existing `--mux-accent` / `--mux-accent-bg` tokens (LOW-2 above documents the fact that the F12 promotion task will pick this up alongside the LeftRail rule when M5 lights up). §UX-5 stays parked under its M5 trigger.

Neither boundary trip — no `## Deferred to nice_to_have` entries needed.

---

## Propagation status

**No forward-deferrals to T4 / T5 / T6.**

- HIGH-1 (spec contradiction) is a T3-spec-internal fix, not a forward task. No carry-over.
- MEDIUM-1 (architecture.md §1 line 143 inaccuracy) is a docs-only fix the Builder can make in-place without needing a future task to own it. No carry-over.
- LOW-1 (test bound precision) is a flag-only finding that any subsequent T3-area test maintainer can pick up; no specific carry-over to T4–T6 because none of those tasks edit `breadcrumb-height-matches-token`.
- LOW-2 (CollectionTabs accent overload) is F12-trigger-driven and lives under `nice_to_have.md` §UX-5; no per-task carry-over needed (the F12 promotion task post-M5 picks it up automatically alongside the LeftRail current-chapter rule).

**No "Carry-over from prior audits" section appended to T4 / T5 / T6 specs.** This audit propagates nothing forward.

---

## Open questions for the user

1. **HIGH-1 fix direction.** Two options proposed (in-place AC9 amendment vs new AC11 with explicit "T9 AC8 obsolete" rationale). Default recommendation: (a) — shorter, matches the M-UX T2 cycle-2 in-place spec amendment pattern. **User input requested.** → **Resolved cycle 2:** user picked Option A (HIGH-1 + MEDIUM-1 + LOW-1 in cycle 2; LOW-2 stays parked). Option (a) for HIGH-1 fix shape applied.

2. **Cycle 2 scope.** The HIGH-1 fix is small (one paragraph + one blockquote in the T3 spec); the MEDIUM-1 fix is small (one paragraph in `architecture.md`). Both could land in a single cycle-2 closure pass mirroring the T2 pattern, or they could ride on a future docs-only sweep. **User to decide whether to authorise cycle 2 here or carry the OPEN findings forward.** → **Resolved cycle 2:** authorised; cycle 2 ran and closed all three open items in scope.

---

## Cycle 2 (2026-04-27) — closure pass

### Scope

User picked **Option A** from the cycle-1 audit: close HIGH-1 (M-UX-REVIEW-T3-ISS-01), MEDIUM-1 (M-UX-REVIEW-T3-ISS-02), and LOW-1 (M-UX-REVIEW-T3-ISS-03) in this cycle. **LOW-2** (M-UX-REVIEW-T3-ISS-04 — `CollectionTabs.astro` accent overlap with LeftRail current-chapter) stays OPEN flag-only, parked under `nice_to_have.md` §UX-5; the F12 promotion task post-M5 picks it up alongside `.chapter-link.is-current`.

T3 stays `✅ done 2026-04-27` across all five status surfaces — cycle 2 is closure-only, no re-flip. The no-regression bullet's case/assertion count in `m_ux_review/README.md` stays at 50 cases / 102 assertions (LOW-1 only tightened an existing case bound, didn't add or remove cases).

### Files touched

- `design_docs/milestones/m_ux_review/tasks/T3_chapter_chrome.md` — AC9 row in the AC table rewritten to drop the obsolete T9 AC8 enumeration; cycle-2 amendment blockquote added immediately after the AC table.
- `design_docs/architecture.md` — line 143 "Collection-landing pages (M-UX T9 D5)" paragraph rewritten with the correct reachability story; the dist-size figure replaced with a pointer to `m_ux_polish/README.md` for the running figure.
- `scripts/functional-tests.json` — `breadcrumb-height-matches-token` `expected` bound tightened `[40, 44]` → `[40, 42]`.
- `design_docs/milestones/m_ux_review/issues/T3_issue.md` — preamble Status flipped ⚠️ OPEN → ✅ PASS — cycle 2 closure (LOW-2 deferred); each fix's section gained a "Resolution (cycle 2, 2026-04-27)" paragraph; issue-log table flipped ISS-01/02/03 to RESOLVED — cycle 2; this Cycle 2 subsection appended.
- `CHANGELOG.md` — `Changed` entry appended under the existing 2026-04-27 section.

### Gate output (cycle 2 verification)

| Gate | Command | Pass/Fail | Output |
| ---- | ------- | --------- | ------ |
| Build | `npm run build` | ✅ PASS | "Completed in 782ms"; **40 prerendered pages** confirmed; server built in 11.36s; exit 0. |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ PASS | **50/50 cases, 102/102 assertions in 23.8s.** `breadcrumb-height-matches-token (1/1 asserts)` PASS against the new `[40, 42]` bound — 40.91px rendered measurement comfortably inside the tighter band. All other cases (T1 + T2 + T3 + M-UX T9 carry-over) still PASS verbatim. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321` | ✅ PASS | **31 screenshots / 3,070,497 bytes in 15.4s** — byte-for-byte parity with cycle 1 (no markup or CSS change in cycle 2; the only test-harness change was the rect bound tightening, which doesn't affect rendered output). |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ no touches | empty diff. No `dependency-auditor` run required. |

### RESOLVED status flips (issue-log table)

- M-UX-REVIEW-T3-ISS-01 (HIGH) — RESOLVED — cycle 2.
- M-UX-REVIEW-T3-ISS-02 (MEDIUM) — RESOLVED — cycle 2.
- M-UX-REVIEW-T3-ISS-03 (LOW) — RESOLVED — cycle 2.
- M-UX-REVIEW-T3-ISS-04 (LOW) — OPEN — flag only, F12-trigger-driven (parked under `nice_to_have.md` §UX-5; no carry-over).

### What cycle 2 did NOT do (per the user's Option A scope)

- Did not touch LOW-2 / F12 / `--mux-current` / `--mux-achievement` / accent semantic split — F12 stays parked under `nice_to_have.md` §UX-5 trigger.
- Did not touch T4–T6 specs — no forward-deferrals from cycle 1 propagated to those tasks.
- Did not touch any other source code outside the three fixes above.
- Did not introduce any new dependencies (`git diff --stat HEAD -- <manifests>` empty).
- Did not commit, push, or open a PR.

---

## Cycle 2 audit re-grade (2026-04-27)

**Verdict.** ✅ PASS — closure pass landed clean. M-UX-REVIEW-T3-ISS-01 / -02 / -03
RESOLVED; M-UX-REVIEW-T3-ISS-04 stays OPEN flag-only as authorised. Mirrors the
T1 / T2 cycle-2 pattern.

### Auditor-side verification (re-run from scratch, not inferential)

| Fix | Verification | Result |
| --- | ------------ | ------ |
| HIGH-1 (M-UX-REVIEW-T3-ISS-01) — AC9 in-place spec amendment, option (a). | `grep -n "AC8" tasks/T3_chapter_chrome.md` | line 133 (the standalone AC8 row, unrelated) + line 134 (new AC9 wording: "M-UX T9 AC5 / AC6 / AC7 / AC9 still pass; AC8 obsolete by T3 D1 …") + line 137 (Cycle-2 amendment blockquote referencing M-UX-REVIEW-T3-ISS-01). The AC9 row no longer enumerates T9 AC8 as still-passing; the obsolescence is documented inline + in the blockquote. The Cycle-2 blockquote sits immediately after the AC table (line 137, two lines below the AC10 row at 135). |
| MEDIUM-1 (M-UX-REVIEW-T3-ISS-02) — `architecture.md` line 143 reachability paragraph rewrite, option (a). | `architecture.md:143` read directly | The sentence "remain reachable from chapter pages via the new collection tabs" (the cycle-1 inaccuracy) is gone. The new paragraph explicitly states "After T3 D1, no chrome surface on a chapter route links directly to `/DSA/{lectures,notes,practice}/` — the cross-collection user need (jump to a different collection's chapter) is served by `CollectionTabs.astro` chapter-to-chapter, and the home + landing-page card grid (T1 D2 + M-UX T9 D5) remains the entry point for landing-page navigation." Total **40 pages** preserved; the dist-size pointer to `m_ux_polish/README.md` for the running cumulative figure is preserved. ASCII diagram unchanged; "Chapter chrome shape (M-UX-REVIEW T3)" subsection at line 147 unchanged. |
| LOW-1 (M-UX-REVIEW-T3-ISS-03) — `breadcrumb-height-matches-token` bound tightened, option (a). | `grep -n -A 14 "breadcrumb-height-matches-token" scripts/functional-tests.json` | `"expected": [40, 42]` confirmed at line 283 (was `[40, 44]`); operator `between` unchanged; selector + viewport + url unchanged. The case still PASSes (1/1 asserts) inside the full 50/50 cases / 102/102 assertions run against the just-built dist — 40.91px rendered measurement comfortably inside the tighter 2-pixel band. |
| LOW-2 (M-UX-REVIEW-T3-ISS-04) — stays OPEN, F12-trigger-driven. | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | Empty output — zero hits. F12 token boundary untouched; no new `--mux-current` / `--mux-achievement` token introduced; `nice_to_have.md` §UX-5 stays parked; no carry-over needed. |

### Gates (re-run from scratch)

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | ✅ PASS — "Completed in 765ms"; **40 prerendered pages** confirmed via `find dist/client -name "index.html" \| wc -l = 40`; server built in 11.27s; Astro exit 0. |
| Preview reachability | `wget -q -O /tmp/ch4-cycle2-audit.html http://localhost:4321/DSA/lectures/ch_4/ && stat -c '%s'` | ✅ 581,415 bytes — byte-for-byte parity with cycle 1 measurement. |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ PASS — **50/50 cases, 102/102 assertions in 23.8s.** All nine T3 cases (`breadcrumb-no-collection-pills`, `breadcrumb-prev-next-arrows`, `collection-tabs-under-h1`, `h1-is-topic-not-coordinates`, `eyebrow-has-coordinates`, `collection-tabs-current-aria`, `collection-tabs-on-notes`, `left-rail-truncate-other-chapters`, `left-rail-title-attr-on-other-chapters`) PASS. The re-bounded `breadcrumb-height-matches-token (1/1 asserts)` PASSes against `[40, 42]` (the LOW-1 fix). All T1 + T2 + M-UX T9 carry-over cases PASS. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321` | ✅ PASS — **31 screenshots / 3,070,497 bytes in 15.3s** — byte-for-byte parity with the Builder's cycle-2 claim and with cycle 1 (rendered output unchanged; the LOW-1 fix is test-harness-only). |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ empty — zero touches; no `dependency-auditor` run required. |
| F12 boundary | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | ✅ empty — F12 stays parked. |

### Status-surface lockstep (re-verified)

- **(a)** `tasks/T3_chapter_chrome.md:3` — `**Status:** ✅ done 2026-04-27` ✅
- **(b)** `tasks/README.md:11` — T3 row `✅ done 2026-04-27` ✅
- **(c)** `m_ux_review/README.md:55` — task table T3 row `✅ done 2026-04-27` ✅
- **(d)** `m_ux_review/README.md` `Done when` — F5 (line 36), F6 (line 37), F8 (line 39), No-regression (line 44, citing 50 cases / 102 assertions baseline) all `[x]` with citation parenthetical pointing at the per-task issue file ✅
- **(e)** `milestones/README.md:27` — M-UX-REVIEW row reads `active (T1 + T2 + T3 closed 2026-04-27; T4–T6 outstanding)` ✅
- Issue file preamble — `**Status:** ✅ PASS — cycle 2 closure (LOW-2 deferred to nice_to_have §UX-5)` ✅

No re-flip occurred (T3 was already `✅ done 2026-04-27` at cycle 1 close); cycle 2 is closure-only across the four originating surfaces, plus the issue-file preamble Status flip ⚠️ OPEN → ✅ PASS. Five surfaces consistent.

### AC re-grade (post-cycle-2)

| AC | Cycle 1 | Cycle 2 | Notes |
| -- | ------- | ------- | ----- |
| AC1 | ✅ PASS | ✅ PASS | Unchanged. |
| AC2 | ✅ PASS | ✅ PASS | Unchanged. |
| AC3 | ✅ PASS | ✅ PASS | Unchanged. |
| AC4 | ✅ PASS | ✅ PASS | Unchanged. |
| AC5 | ✅ PASS | ✅ PASS | Unchanged. |
| AC6 | ✅ PASS | ✅ PASS | Unchanged. |
| AC7 | ✅ PASS | ✅ PASS | Unchanged. |
| AC8 | ✅ PASS | ✅ PASS | Unchanged. |
| AC9 | ⚠️ PARTIAL | ✅ PASS | Spec internally consistent post-cycle-2. AC9 enumerates T9 AC5 / AC6 / AC7 / AC9 (drops AC8); the Cycle-2 amendment blockquote at line 137 documents the AC8-obsolete rationale. Functional-test harness still PASSes the four still-asserted T9 contracts (`leftrail-collection-aware-{notes,practice}`, `breadcrumb-cs300-link`, `breadcrumb-current-page-no-link`); the migrated cross-collection-navigation contract is covered by `collection-tabs-{current-aria,on-notes}` (different URL contract — chapter route, not landing page — but the F5 user need is preserved). |
| AC10 | ✅ PASS | ✅ PASS | Substantive AC10 invariants still met. The line-143 reachability paragraph (the MEDIUM-1 inaccuracy) is now correct. |

**Tally post-cycle-2: 10 / 10 PASS.** No PARTIAL, no FAIL.

### Findings count post-cycle-2

- **HIGH:** 0 (cycle 1 had 1; resolved).
- **MEDIUM:** 0 (cycle 1 had 1; resolved).
- **LOW:** 1 OPEN (M-UX-REVIEW-T3-ISS-04, F12-trigger-driven, parked under `nice_to_have.md` §UX-5; cycle 1 had 2, LOW-1 resolved).

### FUNCTIONALLY-CLEAN signal

T3 is FUNCTIONALLY CLEAN at cycle 2 close. The single remaining OPEN finding (LOW-2 / M-UX-REVIEW-T3-ISS-04) is a flag-only F12-promotion pointer with no per-task carry-over — the post-M5 F12 promotion task picks it up automatically alongside `LeftRail.astro`'s `.chapter-link.is-current` rule via the `nice_to_have.md` §UX-5 trigger. No HIGH, no MEDIUM, no implementation regression, no architecture drift, no manifest touches, no status-surface drift. M-UX-REVIEW T3 is closed.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-2 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. T3 is a chrome-shape refactor (no localStorage, no fetch, no new client-side state). Surface area very narrow.

### Files reviewed

- `src/components/chrome/CollectionTabs.astro` — new component; renders three collection `<a>` elements with `aria-current` on the current tab.
- `src/components/chrome/Breadcrumb.astro` — collection-pill removal, arrow-glyph swap, orphaned CSS/frontmatter cleanup.
- `src/components/chrome/LeftRail.astro` — `title=` attribute on non-current rows, CSS truncation.
- `src/pages/{lectures,notes,practice}/[id].astro` — eyebrow + topic-as-H1 + CollectionTabs mount across all three collection routes.

### Critical

None.

### High

None.

### Advisory (all confirmations — no actions required)

- **`CollectionTabs.astro:57-58`** — `chapterId` interpolated into the href via `tabHref()`. Source: `Astro.props` set at build time from MDX frontmatter (`entry.data.chapter_id`), ultimately `chapters.json`. No user-input path at runtime in a static deploy; Astro auto-escapes `{...}` template attributes. Clean. (If `chapterId` ever becomes runtime-derived from a URL segment in a server-rendered route, `tabHref` would need explicit validation against the `COLLECTIONS` closed set and a chapter-id allowlist — future-state concern only.)
- **`LeftRail.astro:128-129`** — `title={isCurrent ? undefined : fullLabel}` where `fullLabel` is `chapters.json`-sourced. Astro auto-escapes attribute values. No injection vector.
- **`Breadcrumb.astro:192` + `:203`** — `currentChapter.subtitle` / `prevChapter.subtitle` / `nextChapter.subtitle` interpolated into text nodes + `aria-label` attributes. All `chapters.json`-sourced, build-time constant. Astro auto-escaped.
- **No `set:html` / `Fragment set:html` / `dangerouslySetInnerHTML` / `innerHTML =`** found in any T3 file.
- **No `localStorage` / `fetch` / `sendBeacon` / `cookie` / `IndexedDB`** additions in any T3 file.
- **No off-device URLs introduced.** `import.meta.env.BASE_URL` is the only external reference; resolves at build time to a developer-controlled deploy prefix.
- **`CollectionTabs.astro:69` ARIA correctness.** `aria-current={c === current ? 'page' : undefined}` renders the attribute as absent when `undefined` — exactly one tab carries `aria-current="page"`, never two. The `is-current` CSS class follows the same predicate. Consistent.

### Verdict

**SHIP.** No actionable findings. All advisories are positive confirmations that the chrome refactor introduced no new injection vectors or off-device data paths.

### Dependency audit

Skipped — no manifest changes.
