# M-UX-REVIEW — visual-hierarchy pass on the M-UX chrome

**Maps to:** sidecar — second UX milestone, follow-up to the closed [M-UX](../m_ux_polish/README.md). Driven by the 2026-04-27 [`UI_UX_Review.pdf`](../../UI_UX_Review.pdf) audit (4 HIGH / 6 MED / 2 LOW findings, ~18h estimated work).
**Status:** ✅ closed 2026-04-27
**Depends on:** M-UX (✅ closed 2026-04-25) — every task in this milestone edits surfaces M-UX shipped.
**Unblocks:** —
**Reference:** [`UI_UX_Review.pdf`](../../UI_UX_Review.pdf), [ADR-0002](../../adr/0002_ux_layer_mdn_three_column.md)

## Why this milestone exists (context)

M-UX delivered the structural three-column chrome (ADR-0002) and the M3 surfaces re-homed inside it. T9 added the functional-test harness to lock in the layout contracts. The 2026-04-27 review found that the chrome is structurally correct but the *visual hierarchy* doesn't yet match the user's actual decisions (which chapter, where in it, have I read this). Twelve findings, mostly CSS / single-template edits, none requiring an architecture rewrite. The reviewer summarises:

> "Most of this list is 4–8 hours of work. None of it requires a redesign, an ADR rewrite, or a milestone slip. The architecture is sound. What the chrome needs is for the visual hierarchy to match the user's actual decisions."

This milestone runs in parallel with the M4 hold (M4 re-blocked 2026-04-25 on jmdl-ai-workflows convention-hooks follow-up). It's the second UX sidecar after M-UX — same operational shape (no roadmap phasing change, no ADR rewrite, all changes contained to the chrome / styles / index surfaces).

## Goal

Address every in-scope finding from the 2026-04-27 review:

1. **Home surface signals action and progress** — chapter cards telegraph their three jobs, Required/Optional grouping reads as a section header (not eyebrow caption), and a static-mode "Continue reading" strip gives the page a sense of the user.
2. **Right-rail TOC has hierarchy** — H1 vs H2 readable at a glance, no longer a flat 60-item wall.
3. **Chapter chrome reads as one model per row** — breadcrumb + collection-switcher + prev/next no longer share a strip; H1 names the topic (not the coordinates); left rail trims redundant subtitle copy.
4. **Mobile chrome stops stacking five layers of nav** — breadcrumb hides under 768px, collection control attaches to the H1, "On this page" moves below the H1, drawer trigger gains a "Chapters" label + chevron state.
5. **Code blocks breathe** — outer margin, language tag, copy button.
6. **Typography is pinned** — Inter (or Source Sans 3) for body + JetBrains Mono for code, ADR-0002 amended from "deferred" to the chosen pairing.

F12 (`--mux-accent` semantic split between *current* and *complete*) defers to [`nice_to_have.md`](../../nice_to_have.md) §UX-5 — the trigger is M5 lighting up review-due / completion signals, after which the visual contention the finding describes will be evaluable. Per the review's own ordering note: "Best done after M5 lights up completion."

## Done when

- [x] **F1 — Chapter card actions read as buttons.** ChapterCard renders Lectures / Notes / Practice as visually-distinct buttons (filled + outline pair), the chapter-number tag has a subtitle, and a section-progress bar SSRs at 0/N (interactive-mode lights it up later). (T1 issue file — AC1–AC3)
- [x] **F2 — Required / Optional reads as a section header.** The home page (`src/pages/index.astro`) and the three collection landing pages all promote `Required` / `Optional` from 12px tracked subtext to an H2-weight header with a one-line subtitle that does real work ("6 graded chapters, ~25 hours of reading"). (T1 issue file — AC4–AC5)
- [x] **F3 — Static-mode "Continue reading" strip lands on the index.** localStorage-backed; survives the static deploy; replaced by the SQLite-backed surface when M5 lands. Architecture.md §1 amended with a one-line pointer to the new client-side persistence mechanism. (T1 issue file — AC6–AC7, AC9 + architecture.md §1)
- [x] **F4 — Right-rail TOC has H1/H2 hierarchy.** Top-level numbered sections (`4.1`, `4.2`) render bold; H2 subsections render indented + muted. Same DOM, two CSS rules, no scroll-spy contract change. (T2 issue file)
- [x] **F5 — Breadcrumb bar split.** Crumbs + chapter-prev/next + collection switcher no longer share a single horizontal strip; the collection switcher hoists to a proper segmented control under the page H1. (T3 issue file)
- [x] **F6 — Page H1 names the topic.** "Lists, stacks, queues, deques" promotes to H1; "Chapter 4 · Lectures" demotes to eyebrow caption above. Applies to all three collection chapter routes. (T3 issue file)
- [x] **F7 — Code blocks polished.** ~8px outer margin, language tag in top-right, copy button (single button island). (T5 issue file)
- [x] **F8 — Left-rail subtitle trim.** `ch_N — Title` truncated; full subtitle in `title=` tooltip; current chapter keeps the full string. (T3 issue file)
- [x] **F9 — Mobile chrome reduction.** At <768px breadcrumb hides (drawer + back button cover navigation); collection control attaches to the H1 as a tab strip; "On this page" moves below the H1. (T4 issue file)
- [x] **F10 — Drawer trigger gains label + chevron.** Hamburger gets a "Chapters" label and a chevron that flips when the drawer opens (CSS-animated, same DOM). (T4 issue file)
- [x] **F11 — Web-font pairing pinned.** Inter or Source Sans 3 for body, JetBrains Mono for code. ADR-0002 "Open questions deferred" entry for typography flips from deferred to the chosen pairing with a one-paragraph rationale. (T6 issue file — Source Sans 3 + JetBrains Mono pinned 2026-04-27, ADR-0002 typography deferral resolved, +118.6 KB bundle delta)
- [x] **F12 — Accent split.** Logged in [`nice_to_have.md`](../../nice_to_have.md) §UX-5 with explicit M5 trigger; not implemented this milestone (deferral is the deliverable — closed via parking-lot entry, not via implementation).
- [x] **No regression of M-UX contracts.** `scripts/functional-tests.py` still exits 0 — T6 close at **68 cases / 143 assertions** all green (post-T5 baseline was 64 / 137; T6 delta `+4 cases / +6 assertions` for the F11 typography-pinning coverage: `body-font-source-sans-3` (1 assert — `pre_js` reads `getComputedStyle(document.body).fontFamily`, mirrors it onto a body data-attribute, regex assertion checks the primary family `^["']?Source Sans 3["']?` first), `mono-font-jetbrains` (1 assert — same `pre_js` idiom against the first `.code-block pre`, regex `JetBrains Mono`), `font-loaded-not-fallback` (3 asserts — async `pre_js` awaits `document.fonts.ready` then sets three body data-attributes from `document.fonts.check('1em "Source Sans 3"')` and `'1em "JetBrains Mono"'` returns; assertions confirm fonts.ready resolved + both web fonts loaded successfully not falling back silently to the system stack), `mono-on-chapter-tag` (1 assert — same pattern on `article.chapter-card .chapter-card-num` at `/DSA/`, regex `JetBrains Mono` against the chapter-number tag's computed font-family). T5 close was at 64 cases / 137 assertions (post-T4-cycle-2 baseline was 60 / 128; T5 delta `+4 cases / +9 assertions` for the F7 code-block-polish coverage: `code-block-language-tag` (3 asserts — count `.code-block` ≥1, count `.code-block-lang` ≥1, text-pattern `^C\+\+$`), `code-block-copy-button` (2 asserts — count + `type="button"` attr), `code-block-margin` (2 asserts — computed `margin-block-start` + `margin-block-end` ≥8px), `code-block-copy-functional` (2 asserts — `pre_js` click + `data-state` regex `^(copied|failed)$` per spec D4 since headless Chrome rejects clipboard write without `--enable-features=Clipboard`; either swap state proves the click handler fired). T4 cycle-2 detail: cycle-1 close was at 59 / 124; cycle 2 added one regression-guard case `mobile-right-rail-aside-stays-rendered-375` at 4 asserts to lock in the M-UX-REVIEW-T4-ISS-01 narrow-hide fix. T4 deltas vs the post-T3 baseline (50 cases / 102 assertions): nine new T4 cases added at viewport 375×812 unless noted — `mobile-breadcrumb-hidden-375` (1 — computed-style `display == none` on `.breadcrumb-bar`), `mobile-drawer-trigger-visible-375` (3 — computed-style `display == inline-flex` + rect width/height > 0), `mobile-toc-below-h1-375` (2 — pre_js body-attr DOM-order check via getBoundingClientRect.top + count), `mobile-collection-tabs-below-h1-375` (2 — same DOM-order pattern, tabs vs h1, but at mobile viewport so the assertion holds at every breakpoint), `drawer-trigger-label-text` (2 — count + `^Chapters$` text-pattern), `drawer-trigger-chevron-presence` (2 — count + `aria-hidden="true"`), `drawer-chevron-rotates-on-open` (4 — pre_js click + `data-drawer-state="open"` + `aria-expanded="true"` + computed-style `transform == matrix(-1, 0, 0, -1, 0, 0)` for the rotate(180deg) matrix), `mobile-existing-drawer-contracts-preserved` (4 — pre_js click then dispatch Escape; assert the drawer-open path AND the close-via-Escape path AND aria-expanded flips back AND data-drawer-state flips back AND aside aria-hidden returns to true), `desktop-breadcrumb-visible-1280` (2 — computed-style `display == block` + rect height > 0 at viewport 1280×800). Net change: `+9 cases`, `+22 assertions`. The existing `drawer-trigger-visible-mobile` test (M-UX T7 baseline, asserts width > 0 + `aria-controls="drawer"`) is unchanged and still PASS — the new label + chevron added pixels to the trigger but didn't break the existing rect probe. The existing `breadcrumb-height-matches-token` test (T3 era, [40, 42]) is unchanged and still PASS — the breadcrumb height at desktop is unaffected by the T4 mobile-only hide rule + the T4 drawer-trigger slot is `display: none` at ≥1024px so it doesn't push the breadcrumb down. M3 events unchanged. T5 layered its assertions on top of the post-T4 baseline (see T5 delta above); T6 layered its own on top of the post-T5 baseline. (T4 issue file — baseline post-T4 cycle-2 = 60 cases / 128 assertions; cycle-1 was 59 / 124. T5 close = 64 cases / 137 assertions. T6 close = 68 cases / 143 assertions.)
- [x] **Status surfaces flip in lockstep at each task close.** Per-task spec, `tasks/README.md` row, milestone-table row in this README, the `Done when` checkbox above (with citation parenthetical pointing at the per-task issue file) — all four flip together. The Auditor's design-drift check verifies all four (per CLAUDE.md non-negotiables).

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                                                       | Status | Findings | Est. session size |
| --- | ------------------------------------------------------------------------------------------ | ------ | -------- | ----------------- |
| T1  | [Home surface — cards, Required label, continue-reading](tasks/T1_home_surface.md)         | ✅ done 2026-04-27 | F1, F2, F3 | 1 focused session |
| T2  | [Right-rail TOC hierarchy](tasks/T2_right_rail_toc_hierarchy.md)                           | ✅ done 2026-04-27 | F4 | < 1 session |
| T3  | [Chapter chrome — breadcrumb split, H1 promotion, left-rail trim](tasks/T3_chapter_chrome.md) | ✅ done 2026-04-27 | F5, F6, F8 | 1 focused session |
| T4  | [Mobile chrome reduction + drawer label](tasks/T4_mobile_reduction.md)                     | ✅ done 2026-04-27 | F9, F10 | 1 focused session |
| T5  | [Code-block polish — margin, lang tag, copy button](tasks/T5_code_block_polish.md)         | ✅ done 2026-04-27 | F7 | < 1 session |
| T6  | [Typography pairing + ADR-0002 amend](tasks/T6_typography.md)                              | ✅ done 2026-04-27 | F11 | < 1 session |

Mirror status changes between the per-task file, `tasks/README.md`, this table, and the `Done when` checklist above.

## Open decisions resolved here

- **F12 (accent semantic split) is deferred, not in-scope.** The reviewer flags the trigger ("Best done after M5 lights up completion") — without M5's review-due signals, "current" vs "complete" has no second axis to express. Logged in `nice_to_have.md` §UX-5; promotion-trigger = M5 ships and produces a review-due affordance the chrome surfaces.
- **ADR-0002 typography amendment lands inline within T6** (not a separate ADR-prep task). The amendment is small (one section flip), the choice is bounded, and front-loading it as a standalone task is procedural overhead.

## Out of scope

- **F12** — accent split (per above; in `nice_to_have.md` §UX-5).
- **Search.** Still deferred per ADR-0002 + `nice_to_have.md`. Review didn't surface a search finding.
- **Dark mode.** Still deferred per ADR-0002. The web-font pairing in T6 uses CSS custom properties so a future dark-mode flip is a variable swap.
- **Per-section completion indicator refinement** ("fully read" vs "X of Y sections"). Out of M-UX-REVIEW scope; M-UX T2 owns that question and shipped one rule.
- **New chrome surfaces.** No new components beyond the copy-button island in T5 + the continue-reading strip island in T1. Everything else is CSS / template edits.
- **M4-blocked surfaces.** Question-bank UI, generate-questions buttons, review pane content — all wait for M4. M-UX-REVIEW touches none of them.
- **New chapter content.** Chapter MDX is untouched.
