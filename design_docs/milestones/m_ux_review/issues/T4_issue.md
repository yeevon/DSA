# T4 — Mobile chrome reduction — Audit Issues

**Source task:** [`../tasks/T4_mobile_reduction.md`](../tasks/T4_mobile_reduction.md)
**Audited on:** 2026-04-27
**Audit cycle:** 2 (closure pass over cycle 1's MEDIUM + LOW-3; LOW-1 + LOW-2 forward-deferred to T6)
**Audit scope:** Spec-vs-implementation verification of every D1–D6 deliverable
+ AC1–AC10; design-drift check against [`design_docs/architecture.md`](../../../architecture.md)
§1 (Page chrome — Mobile (<1024px) paragraph + Mobile DOM order subsection +
"Mobile chrome reduction (M-UX-REVIEW T4)" subsection),
[ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), [`m_ux_polish/tasks/T7_mobile_drawer.md`](../../m_ux_polish/tasks/T7_mobile_drawer.md)
(focus-trap + Escape + `cs300:drawer-toggle` event contracts), [`m_ux_polish/tasks/T9_layout_polish.md`](../../m_ux_polish/tasks/T9_layout_polish.md)
(sticky-rails + centered-chrome contracts at wide viewports), and the closed
[`../issues/T3_issue.md`](T3_issue.md) (chapter-route eyebrow+H1+tabs structure
T4 layers `<MobileChapterTOC>` onto inside `<header>`); CLAUDE.md non-negotiables
(status-surface lockstep across five surfaces, code-task verification non-
inferential — auditor opens screenshots + cites visual evidence, runs harness
from scratch); zero dependency-manifest touch confirmation; M3 contract
preservation (`cs300:drawer-toggle` event + focus-trap + Escape-to-close +
`aria-expanded` + `aria-hidden` + `body.drawer-open` lifecycle); [`nice_to_have.md`](../../../nice_to_have.md)
§UX-3 (interactive-mode harness extension boundary) + §UX-5 (F12 accent split
boundary).

Fresh `npm run build` re-executed by the auditor (40 prerendered pages, exit
0); fresh `npm run preview` + `python scripts/functional-tests.py` against the
just-built dist (**59/59 cases / 124/124 assertions in 28.2s**); `python
scripts/smoke-screenshots.py` captured **31 screenshots / 3,073,760 bytes**.
Auditor opened `lectures-ch4-375x812.png`, `lectures-ch4-768x1024.png`, and
`lectures-ch4-1280x800.png` and confirmed the mobile DOM order, the tablet
trigger-above-breadcrumb shape, and the desktop three-column shape preservation
visually (citations inline). All Builder gate counts re-verified verbatim.

**Status:** ✅ PASS — cycle 2 closure (LOW-1 + LOW-2 forward-deferred to T6 carry-over).

**Cycle-1 status (historical):** ⚠️ OPEN — 0 HIGH / 1 MEDIUM / 3 LOW. The
MEDIUM was a silent interactive-mode mobile annotations regression introduced
by the right-rail aside hide rule (a deviation beyond spec D1/D2). LOW
findings: (1) explicit `display: none` rule at ≥1024px on the trigger slot
wrapper not documented in architecture; (2) architecture line 125 mobile
paragraph claims "Right-rail TOC moves to a collapsed `<details>` summary at
content top" — only true at 768–1023px, not at <768px (mobile DOM order block
immediately below has the correct shape, but the older sentence is now stale);
(3) `MobileChapterTOC` deviation from spec D2's literal `<RightRailTOC />`
reuse — the Builder's defense holds on selector-collision grounds but the
spec wording wasn't amended in-place to reflect what shipped (cf. T3 cycle 1's
HIGH-1 precedent where AC9 had to be amended to match what was actually
implementable).

---

## Design-drift check

Cross-checked against `design_docs/architecture.md` §1 (Page chrome — Mobile
paragraph + new Mobile DOM order block + new "Mobile chrome reduction
(M-UX-REVIEW T4)" subsection), `design_docs/adr/0002_ux_layer_mdn_three_column.md`,
`design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md`, and
`design_docs/nice_to_have.md` §UX-3 + §UX-5.

| Check | Result | Citation |
| ----- | ------ | -------- |
| New dependency? | None. `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` returns empty (`wc -l` = 0). | n/a |
| New module / boundary crossing? | One new file: `src/components/chrome/MobileChapterTOC.astro` (~178 lines including docstring + scoped CSS). Lives inside the existing `src/components/chrome/` boundary (per architecture.md §1 "Shared layout primitives"). Lateral peer to `RightRailTOC.astro`. No new layer. The component is intentionally distinct from `RightRailTOC.astro` (different selector class `.rhs-toc-mobile` vs `.right-rail-toc`) so neither `ScrollSpy.astro` (line 51 `document.querySelector('.right-rail-toc')`) nor `RightRailReadStatus.astro` (line 78 `document.querySelectorAll('.right-rail-toc [data-read-indicator]')`) sees it. The deviation from spec D2's literal "`<RightRailTOC />` inside the mobile `<details>`" is documented as LOW-3 below. | `src/components/chrome/MobileChapterTOC.astro:1-178`; `src/components/chrome/ScrollSpy.astro:51`; `src/components/chrome/RightRailReadStatus.astro:78-80` |
| Cross-cutting concerns? | M3 events untouched. `cs300:drawer-toggle` event flow preserved (DrawerTrigger fires on click → Drawer.astro listener catches → toggle/open/close). `cs300:read-status-changed` (×11), `cs300:toc-read-status-painted` (×6), `cs300:annotation-added` (×2), `cs300:drawer-toggle` (×4) — counts unchanged from T3 close. The new `data-drawer-state` styling-hook attribute is flipped in lockstep with `aria-expanded` inside `Drawer.astro`'s `open()` (line 222–228) and `close()` (line 242–244) — atomic-write contract verified. | grep across `src/`; `src/components/chrome/Drawer.astro:222-244` |
| Configuration / secrets? | None touched. | n/a |
| Observability? | None touched. | n/a |
| ADR-0002 mobile-chrome contract? | **Partially honoured**, with a documented amendment + an undocumented regression. Honoured: hamburger drawer for left rail; sticky-breadcrumb stacking-context preservation; `data-interactive-only` gating across M3 surfaces. Amendment: ADR-0002 line 75 "annotations pane (refactored from the current always-rendered position into the right rail)" assumed the right rail is visible at every viewport where interactive mode is reachable. **T4 D2 hides the right-rail aside entirely at <768px (`Base.astro:499-501`).** This kills the AnnotationsPane surface at <768px in interactive mode (the pane lives inside the right-rail aside per `lectures/[id].astro:167`; the parent's `display: none` propagates). The architecture.md §1 mobile DOM order block (line 127) documents the right-rail-aside hide but does NOT call out the AnnotationsPane regression. Spec D1/D2 do NOT authorise this hide — D1 says "hide the breadcrumb entirely"; D2 says "Move the on-this-page details below the H1". The hide is an additive Builder deviation. Surfaced as MEDIUM-1 below. | `design_docs/adr/0002_ux_layer_mdn_three_column.md:75`; `src/layouts/Base.astro:491-501`; `src/components/annotations/AnnotationsPane.astro:11,89-93`; `src/pages/lectures/[id].astro:167` |
| M-UX T7 focus-trap / Escape / `aria-expanded` / `cs300:drawer-toggle` contracts? | Preserved. `Drawer.astro` `open()` and `close()` flip `aria-expanded` and `data-drawer-state` atomically (verified via `mobile-existing-drawer-contracts-preserved` test which clicks the trigger, dispatches Escape, and asserts the body class flips through `drawer-open` → not — and that `aria-expanded` AND `data-drawer-state` AND aside `aria-hidden` all flip back together: 4/4 assertions PASS). Focus trap (Tab cycles; Shift+Tab reverses) is unchanged from T7 cycle 2. Backdrop-click close path unchanged. Body-scroll lock unchanged. | `src/components/chrome/Drawer.astro:210-258,276-300`; `scripts/functional-tests.json:1090-1119` |
| architecture.md §1 mobile-paragraph + Mobile DOM order + T4 subsection? | Present, mostly accurate. `architecture.md:125` mentions the trigger reads `☰ Chapters ›` per T4 D3 + sits as its own row above the chrome stack. **One stale sentence (LOW-2):** the same line 125 still reads "Right-rail TOC moves to a collapsed `<details>` summary at content top." That was true pre-T4 (M-UX T7 wrapped the right-rail's TOC in `<details class="toc-mobile-collapse">` at <1024px). Post-T4 it's only true at 768–1023px (tablet); at <768px the right-rail aside is hidden and the on-this-page affordance is `<MobileChapterTOC>` inside `<header>` after `<CollectionTabs>`. The Mobile DOM order block immediately below (lines 127–139) gets it right; line 125 just wasn't refreshed. Doc-only nit; AC10 still PASS on the substantive invariants documented at lines 127–139 + 170–176. | `architecture.md:125,127-139,170-176` |
| Explicit `display: none` at ≥1024px on the drawer-trigger slot? | Implementation has BOTH `:empty { display: none }` (`Base.astro:256-258`) AND an explicit `.chrome > [data-slot="drawer-trigger"] { display: none }` inside the `@media (min-width: 1024px)` block (`Base.astro:331-333`). The architecture.md T4 subsection (line 172) only mentions the `:empty` rule. Builder's docstring in `Base.astro:317-326` explains why both are needed: when DrawerTrigger IS mounted (chapter routes), the slot wrapper has a child element so `:empty` does not match — without the explicit rule the wrapper would land in an implicit grid track at the bottom of the desktop template. Verified visually on `lectures-ch4-1280x800.png` — no top-edge shift, three-column shape unchanged from T3. Surfaced as LOW-1 (architecture amendment to mention both rules). | `src/layouts/Base.astro:256-258,331-333,317-326`; `architecture.md:172` |
| `nice_to_have.md` §UX-3 boundary (interactive-mode Selenium harness extension)? | Untouched. T4 added 9 new functional-test cases — all still hit the static-mode public preview surface (no interactive-mode round-trip, no annotations seed, no `localStorage` annotation persistence assertion). The new `mobile-existing-drawer-contracts-preserved` case clicks the trigger and dispatches Escape via `pre_js`; that's still in-band for the existing harness's six assertion types + the cycle-3 `pre_js` hook (added in T1 cycle 3). No drift into §UX-3 territory. | `scripts/functional-tests.json:1090-1119`; `nice_to_have.md:134` |
| `nice_to_have.md` §UX-5 (F12 accent split) boundary? | Untouched. `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` returns 0 hits. T4 added no accent tokens; the existing `--mux-accent` cascade is unchanged. F12 stays parked under its M5-trigger. | `src/styles/chrome.css` token block unchanged; `nice_to_have.md:207-258` |
| Status-surface lockstep? | All five surfaces flipped: (a) `tasks/T4_mobile_reduction.md:3` `**Status:** ✅ done 2026-04-27`, (b) `tasks/README.md:12` T4 row `✅ done 2026-04-27`, (c) `m_ux_review/README.md:56` task table T4 row `✅ done 2026-04-27`, (d) `m_ux_review/README.md:40` F9 bullet `[x]` + `:41` F10 bullet `[x]` + `:44` No-regression bullet `[x]` (all with citation parentheticals pointing at this issue file), (e) `milestones/README.md:27` M-UX-REVIEW row `active (T1 + T2 + T3 + T4 closed 2026-04-27; T5–T6 outstanding)`. CHANGELOG entry under `2026-04-27` is the first item, tagged `Changed`, naming the milestone + task ID. Dep audit note in CHANGELOG: `Dep audit: skipped --- no manifest changes`. | grepped each file directly |
| Drift class HIGH count? | **0.** No HIGH design drift. The MEDIUM below is a regression beyond spec, not architectural drift per se. | — |

---

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| AC1 — Breadcrumb hidden at 375×812 | ✅ PASS | Functional test `mobile-breadcrumb-hidden-375` passes (1/1 asserts: computed-style `display == none` on `.breadcrumb-bar`). CSS source: `Base.astro:488-490` `@media (max-width: 767.98px) { .chrome > [data-slot="breadcrumb"].breadcrumb-bar { display: none; } }`. Markup source: `Base.astro:535` `<nav class="breadcrumb-bar" data-slot="breadcrumb">` — class is on the outer slot wrapper (not the inner `<nav class="breadcrumb">` Breadcrumb.astro emits) so the entire breadcrumb track vanishes from layout in one rule. Visual confirmation on `lectures-ch4-375x812.png`: top edge shows the drawer trigger (`☰ Chapters ›`) directly above the eyebrow caption — no breadcrumb crumbs, no prev/next chapter buttons. |
| AC2 — Drawer trigger visible at 375×812 | ✅ PASS | Functional test `mobile-drawer-trigger-visible-375` passes (3/3 asserts: computed-style `display == inline-flex` on `#drawer-trigger`; rect width > 0; rect height > 0). CSS source: `DrawerTrigger.astro:104-124` (default `display: none`) + `:173-179` `@media (max-width: 1023.98px) { .drawer-trigger { display: inline-flex; align-items: center; justify-content: center; } }`. Visual confirmation on `lectures-ch4-375x812.png`: trigger button visible at top-left, reads `☰ Chapters ›` with all three glyphs. |
| AC3 — "On this page" `<details>` renders BELOW the chapter H1 at 375×812 | ✅ PASS | Functional test `mobile-toc-below-h1-375` passes (2/2 asserts: pre_js sets `data-t4-mobile-toc-order=ok` if `h1.getBoundingClientRect().top < details.rhs-toc-mobile.getBoundingClientRect().top`; selector cardinality `main header details.rhs-toc-mobile` = 1). DOM source: `lectures/[id].astro:170-181` — `<header>` contains `<p.ch-eyebrow>` → `<h1>` → `<CollectionTabs>` → `<MobileChapterTOC>` in source order. Visual confirmation on `lectures-ch4-375x812.png`: H1 "Lists, stacks, queues, deques" precedes the "ON THIS PAGE" disclosure bar; the article chapter-map callout begins below the bar. |
| AC4 — Collection tabs render below the H1 at 375×812 | ✅ PASS | Functional test `mobile-collection-tabs-below-h1-375` passes (2/2 asserts: pre_js sets `data-t4-tabs-order=ok` if `h1.top < .collection-tabs.top`; cardinality = 1). T3 contract holds at mobile too: the same source order `lectures/[id].astro:172-176` (`<p.ch-eyebrow>` → `<h1>` → `<CollectionTabs>`) renders identically at every breakpoint. Visual confirmation on `lectures-ch4-375x812.png`: H1 above the three-tab segmented control (Lectures filled-accent, Notes + Practice outline). |
| AC5 — `.drawer-trigger` text contains `Chapters` | ✅ PASS | Functional test `drawer-trigger-label-text` passes (2/2 asserts: cardinality `#drawer-trigger .drawer-label` = 1; text-pattern `^Chapters$`). Markup source: `DrawerTrigger.astro:97` `<span class="drawer-label">Chapters</span>`. Visual confirmation on `lectures-ch4-375x812.png`: label clearly readable between the hamburger and the chevron. |
| AC6 — `.drawer-trigger` contains a `.drawer-chevron` with `aria-hidden="true"` | ✅ PASS | Functional test `drawer-trigger-chevron-presence` passes (2/2 asserts: cardinality = 1; `aria-hidden` attribute = `"true"`). Markup source: `DrawerTrigger.astro:98` `<span class="drawer-chevron" aria-hidden="true">›</span>`. The icon span (line 96) and chevron span (line 98) both carry `aria-hidden="true"`; only the visible "Chapters" label and the button's own `aria-label="Open navigation"` reach screen readers, so the announcement stays "Open navigation, collapsed/expanded" without double-announcing the decorative glyphs. |
| AC7 — After clicking the trigger, the chevron has a non-identity computed transform | ✅ PASS | Functional test `drawer-chevron-rotates-on-open` passes (4/4 asserts: pre_js clicks `#drawer-trigger`, then asserts body marker `data-t4-drawer-click=clicked`, trigger `data-drawer-state=open`, trigger `aria-expanded=true`, AND computed-style `transform == matrix(-1, 0, 0, -1, 0, 0)` on `.drawer-chevron` — the canonical 180° rotation matrix). CSS source: `DrawerTrigger.astro:169-171` `.drawer-trigger[data-drawer-state="open"] .drawer-chevron { transform: rotate(180deg); }`. JS source: `Drawer.astro:228` (`open()`) sets `data-drawer-state=open` after `aria-expanded=true`; `Drawer.astro:244` (`close()`) sets `data-drawer-state=closed` after `aria-expanded=false`. Atomic flip verified — both attributes write inside the same synchronous function call. |
| AC8 — M-UX T7 + T9 mobile contracts unchanged: focus-trap, Escape-to-close, `aria-expanded`, `cs300:drawer-toggle` | ✅ PASS | Functional test `mobile-existing-drawer-contracts-preserved` passes (4/4 asserts via `pre_js`: clicks trigger → confirms `body.drawer-open` set; dispatches Escape via `KeyboardEvent` → confirms `body.drawer-open` unset; asserts trigger `aria-expanded=false`, `data-drawer-state=closed`, aside `aria-hidden=true` after the close). The pre-existing `drawer-trigger-visible-mobile` test (M-UX T7 baseline, asserts `aria-controls="drawer"` + width > 0) is unchanged and still PASS — the new label + chevron added pixels to the trigger but didn't break the existing rect probe. The pre-existing `breadcrumb-height-matches-token` test (T3 era, [40, 42]) is unchanged and still PASS at desktop. M3 event listener counts grep-verified unchanged from T3 close. |
| AC9 — At ≥768px the breadcrumb is visible (T3's desktop shape preserved) | ✅ PASS | Functional test `desktop-breadcrumb-visible-1280` passes (2/2 asserts: computed-style `display == block` on `.breadcrumb-bar` at viewport 1280×800; rect height > 0). Visual confirmation on `lectures-ch4-1280x800.png`: top sticky breadcrumb shows `cs-300 / ch_4 — Lists, stacks, queues, deques` on the left and `← ch_3 \| ch_5 →` on the right — T3's split shape preserved verbatim. The new chrome-level `drawer-trigger` slot wrapper is collapsed at ≥1024px (explicit `display: none` per `Base.astro:331-333`) so the desktop top edge does NOT shift relative to T3. Visual confirmation on `lectures-ch4-768x1024.png` (tablet): the trigger sits in its own row ABOVE the breadcrumb (a deliberate change vs the M-UX T7 in-breadcrumb placement at 768–1023px; documented in `Base.astro:96-101` + accepted per spec D1 Option A wording). |
| AC10 — `architecture.md` §1 mobile subsection updated | ✅ PASS (with LOW-2 noted) | Architecture amendments land at three locations: (a) line 125 mobile paragraph mentions the trigger reads `☰ Chapters ›` per T4 D3 and sits as its own row above the chrome stack; (b) lines 127–139 introduce the new "Mobile DOM order (<768px, post M-UX-REVIEW T4 D1 + D2)" subsection with the verbatim drawer-trigger → eyebrow → h1 → tabs → MobileChapterTOC → article order; (c) lines 170–176 introduce the new "Mobile chrome reduction (M-UX-REVIEW T4)" subsection documenting D1 (drawer-trigger extracted from breadcrumb) + D2 (breadcrumb hides at <768px) + D3 (label + chevron rotation contract). The substantive new shape is captured. **Doc-precision nits (LOW-2 below):** line 125 retains the stale "Right-rail TOC moves to a collapsed `<details>` summary at content top" sentence — only true at 768–1023px post-T4, not at <768px (the right-rail aside is hidden then; on-this-page is `<MobileChapterTOC>` after `<CollectionTabs>`). The Mobile DOM order block immediately below corrects it, but the older sentence wasn't refreshed in lockstep. Also LOW-1: the explicit ≥1024px `display: none` on the trigger slot wrapper is implemented but only the `:empty` rule is mentioned in the §1 T4 subsection. |

**AC tally: 10 / 10 PASS** (AC10 with LOW-1 and LOW-2 doc-precision nits noted).

---

## 🔴 HIGH — none

No HIGH findings. Design-drift check is clean; every AC re-verified on a
fresh build + fresh harness exec; status surfaces flipped in lockstep across
all five canonical surfaces (per-task spec, tasks/README.md, milestone README
task table, milestone README `Done when` checkboxes for F9 + F10, milestones
index); zero manifest touches; no F12 token bleed; M3 contracts preserved.

---

## 🟡 MEDIUM

### MEDIUM-1 — Right-rail aside hidden at <768px kills AnnotationsPane in mobile interactive mode

**ID:** `M-UX-REVIEW-T4-ISS-01`
**Severity:** MEDIUM
**Status:** RESOLVED — cycle 2
**Affected:** `src/layouts/Base.astro:499-501` (the `aside[data-slot="right-rail"] { display: none }` rule at `@media (max-width: 767.98px)`); `src/components/annotations/AnnotationsPane.astro:89-93` (mounted inside the right-rail aside per `src/pages/lectures/[id].astro:167`).

**Cycle-2 resolution (2026-04-27).** User picked Option (a) — narrow the hide.
The aside-level `aside[data-slot="right-rail"] { display: none }` rule at
`@media (max-width: 767.98px)` is replaced with two targeted rules
(`Base.astro:528-533`):
`aside[data-slot="right-rail"] :global(.right-rail-toc) { display: none }`
and `aside[data-slot="right-rail"] :global(details.toc-mobile-collapse) { display: none }`.
The `:global(...)` wrap is required because Base.astro's `<style>` block is
scoped — `.right-rail-toc` and `.toc-mobile-collapse` are emitted by
`RightRailTOC.astro` (a child component), so an unscoped descendant selector
on a Base-emitted aside cannot reach them without `:global`. AnnotationsPane
now survives the mobile media query: it remains in DOM with its own
`<details class="annotations-mobile-collapse" data-interactive-only>`
visibility cascade, so static-mode public deploy is unchanged (the
`data-interactive-only` global rule still hides it) and interactive mode at
<768px regains the expand-pane affordance per ADR-0002 line 75 + M-UX T7
line 19. Verified by the new
`mobile-right-rail-aside-stays-rendered-375` regression-guard test (4/4
asserts: cardinality of the aside is 1, computed-style on the aside is
`display: block`, and computed-style on both `.right-rail-toc` and
`details.toc-mobile-collapse` is `display: none`). The case is structurally
the inverse of the original aside-level hide: if a future change reverts to
the broad rule, the aside-level computed-style assertion flips from `block`
to `none` and the test fails. Visual smoke at 375×812 + 1280×800
(`/.smoke/screenshots/lectures-ch4-{375x812,1280x800}.png`) confirms no UX
shift in the visible mobile shape and no desktop regression.

**Finding.** Spec D1 calls for hiding the breadcrumb at <768px. Spec D2 calls
for moving the "on this page" details below the H1. **Neither D1 nor D2
authorises hiding the right-rail aside entirely.** The Builder added
`aside[data-slot="right-rail"] { display: none }` at <768px (Base.astro:499–501)
because the alternative — leaving the right-rail aside visible at <768px —
would have left two TOC surfaces (the existing M-UX T7 `<details
class="toc-mobile-collapse">` inside the aside AND the new `<MobileChapterTOC>`
inside `<header>`) painting at the same viewport. The Builder's chosen fix is
to suppress the entire aside at <768px and rely on `<MobileChapterTOC>` for
the on-this-page affordance.

**Side effect.** `AnnotationsPane.astro` is mounted inside the same right-rail
aside (`lectures/[id].astro:167` `<AnnotationsPane slot="right-rail" …>`). The
parent's `display: none` propagates to every child — so at <768px the
AnnotationsPane is invisible in interactive mode too. M-UX T7 specifically
wrapped AnnotationsPane in `<details class="annotations-mobile-collapse"
data-interactive-only>` so mobile interactive-mode users could expand the pane
to read their annotations on a phone (per ADR-0002 line 75 + T7 spec line 19).
**T4 reverses that capability without authorisation from spec D1/D2 and
without documenting the trade-off in the architecture amendment.**

The static-mode public deploy is unaffected (AnnotationsPane carries
`data-interactive-only`; `body[data-mode="static"]` hides it via the global
gate). The regression is strictly local-dev / interactive-mode at <768px.

**Why this is MEDIUM, not HIGH.** Interactive mode at <768px is not exercised
by the functional-test harness (per nice_to_have §UX-3 — interactive-mode
coverage is parked behind an explicit promotion trigger). The only auditor-
visible failure is structural inspection of the rendered HTML + a careful
read of the `display: none` cascade. Static deploy is the public surface
M-UX-REVIEW protects; interactive-mode mobile is the local-dev surface and
hasn't been formally documented as a post-M-UX contract. But ADR-0002 line 75
+ T7 spec line 19 + T7 cycle-2 disposition (M-UX-T6-ISS-03) all explicitly
treat the mobile annotations-pane affordance as a contract, so silently
removing it without a spec amendment is a regression worth surfacing.

**Action / Recommendation.** Two reasonable directions; user picks:

- **Option (a) — narrow the hide to the TOC, not the entire aside.** Replace
  the `aside[data-slot="right-rail"] { display: none }` rule with a
  more targeted rule that hides only the inner desktop TOC track (e.g.
  `.right-rail-toc { display: none }` and the M-UX T7
  `<details class="toc-mobile-collapse">` wrapper, but leaves the
  AnnotationsPane wrapper visible). The AnnotationsPane's existing
  `<details class="annotations-mobile-collapse" data-interactive-only>`
  surfaces only in interactive mode anyway, so static-mode mobile UX
  is unchanged. Implementation: edit the `@media (max-width: 767.98px)`
  block in `Base.astro:479-502`. Trade-off: more surgical CSS, two extra
  rules.
- **Option (b) — accept the regression, document it.** Keep the aside-level
  hide. Amend `architecture.md` line 127 + the T4 subsection (line 170)
  to call out that `<768px` mobile interactive-mode loses the
  annotations-pane affordance, with a forward pointer (likely
  nice_to_have §UX-3 trigger or a new task in M5) for restoring the
  surface. Trade-off: less code change, accepts a real UX regression.

**My lean:** Option (a). The cost is two extra CSS rules; the gain is
preserving an ADR-0002 contract that T7 deliberately shipped. Option (b) is
defensible only if the user's read of "mobile annotations don't actually get
used in practice" outweighs the principle of not silently dropping a
documented surface.

---

## 🟢 LOW

### LOW-1 — Architecture line 172 omits the explicit ≥1024px `display: none` on the drawer-trigger slot wrapper

**ID:** `M-UX-REVIEW-T4-ISS-02`
**Severity:** LOW (doc precision)
**Status:** DEFERRED — propagated to T6
**Affected:** `architecture.md:172` (the T4 subsection's slot-collapse description).

**Cycle-2 disposition (2026-04-27).** Forward-deferred to T6 typography ADR-0002
amendment cycle. T6 already touches `architecture.md` §1 page-chrome subsection
(per its D5 deliverable), so bundling the dual-rule architecture amendment into
the same file edit avoids a separate touch. Carry-over entry landed at
[`../tasks/T6_typography.md`](../tasks/T6_typography.md) under
`## Carry-over from prior audits` as a `- [ ]` bullet citing this issue file.
See Propagation status footer below.

**Finding.** Architecture line 172 reads "Empty slots collapse via `:empty {
display: none }` so the index page (no drawer consumer) doesn't reserve the
row." That accurately describes one of two collapse rules. The actual
implementation has both:

- `Base.astro:256-258` — `:empty` rule for routes that don't mount
  `<DrawerTrigger>` (index page, landing pages).
- `Base.astro:331-333` — explicit `display: none` inside the
  `@media (min-width: 1024px)` block, because chapter routes DO mount
  `<DrawerTrigger>` so the slot wrapper has a child element (the
  button itself, which is `display: none` at desktop via its own
  media query). `:empty` does not match an element with a hidden
  child, so without the explicit rule the wrapper would land in an
  implicit grid track at the bottom of the desktop template (Builder
  probed `top: 67049px`).

The Builder docstring at `Base.astro:317-326` explains the dual-rule rationale.
The architecture should mirror it.

**Action / Recommendation.** Add a one-sentence amendment to
`architecture.md:172` along the lines of: "On chapter routes (where the
slot is filled by `<DrawerTrigger>` whose own media query sets `display:
none` at ≥1024px), an explicit `.chrome > [data-slot="drawer-trigger"] {
display: none }` inside the `@media (min-width: 1024px)` block keeps the
filled-but-hidden wrapper out of the implicit grid track. `:empty` alone
would not match because the wrapper has a child element." T6 (typography
ADR-0002 amendment) is a natural place to bundle this trivial doc fix
without opening a new task.

### LOW-2 — Architecture line 125 retains the stale "Right-rail TOC moves to a collapsed `<details>` summary at content top" sentence

**ID:** `M-UX-REVIEW-T4-ISS-03`
**Severity:** LOW (doc precision)
**Status:** DEFERRED — propagated to T6
**Affected:** `architecture.md:125` (the §1 mobile-paragraph block above the new Mobile DOM order subsection).

**Cycle-2 disposition (2026-04-27).** Forward-deferred to T6 typography ADR-0002
amendment cycle (same `architecture.md` §1 page-chrome subsection T6 D5 already
touches). Carry-over entry landed at
[`../tasks/T6_typography.md`](../tasks/T6_typography.md) under
`## Carry-over from prior audits` as a `- [ ]` bullet citing this issue file.
See Propagation status footer below.

**Finding.** Pre-T4, the sentence was accurate — at every viewport `<1024px`
the right-rail aside was visible above main and hosted a `<details
class="toc-mobile-collapse">` summary. Post-T4 the sentence holds only at
`768–1023px` (tablet); at `<768px` the right-rail aside is hidden via
`Base.astro:499-501` and the on-this-page affordance is
`<MobileChapterTOC>` rendered inside `<header>` after `<CollectionTabs>`.
The Mobile DOM order block immediately below (lines 127–139) gets it right
— but line 125 wasn't refreshed in lockstep, so a casual reader sees a
single mobile-paragraph claim that contradicts the block right under it.

**Action / Recommendation.** Edit `architecture.md:125` to qualify the
claim: change "Right-rail TOC moves to a collapsed `<details>` summary at
content top." to "At 768–1023px the right-rail TOC moves to a collapsed
`<details>` summary at content top (M-UX T7 layout); at `<768px` it
relocates further to a sibling-of-`<header>` `<MobileChapterTOC>` after
`<CollectionTabs>` — see the Mobile DOM order block immediately below for
the post-T4 mobile shape." Same rule as LOW-1: bundle into T6's
architecture amendment.

### LOW-3 — `MobileChapterTOC` deviation from spec D2's literal `<RightRailTOC />` reuse not amended in spec

**ID:** `M-UX-REVIEW-T4-ISS-04`
**Severity:** LOW (spec wording vs implementation reality)
**Status:** RESOLVED — cycle 2
**Affected:** `tasks/T4_mobile_reduction.md:53-58` (the spec D2 `<details
class="rhs-toc-mobile">` block that names `<RightRailTOC />` inside).

**Cycle-2 resolution (2026-04-27).** D2's example DOM-order block in
`tasks/T4_mobile_reduction.md` is amended in-place (no `_v2`). The
four-line `<details class="rhs-toc-mobile"><summary>On this page</summary>
<RightRailTOC /></details>` listing is replaced with a single-line
`<MobileChapterTOC />` reference plus an inline parenthetical noting that
the component itself emits the `<details class="rhs-toc-mobile">` wrapper +
`<summary>On this page</summary>` internally (citing
`src/components/chrome/MobileChapterTOC.astro:75-88`). Immediately below the
example block, a `> **Cycle-2 amendment (2026-04-27, closes
M-UX-REVIEW-T4-ISS-04):** …` blockquote documents the deviation rationale
(twice-rendering `RightRailTOC` would have collided with ScrollSpy and
RightRailReadStatus selector-paint contracts) and the trade-off (mobile
loses live `[data-current]` highlighting + read-status painting in the
on-this-page affordance — acceptable per the spec's "back button + drawer
give equivalent affordances" framing). Pattern matches T2 cycle 2's LOW-2/4
amendment + T3 cycle 2's HIGH-1 AC9 amendment from the same milestone.

**Finding.** Spec D2 names `<RightRailTOC />` literally inside the mobile
`<details>`:

```
<details class="rhs-toc-mobile">     (T4)
  <summary>On this page</summary>
  <RightRailTOC />
</details>
```

Builder shipped a separate `MobileChapterTOC.astro` instead — a stripped-down
component without `data-anchor`, `data-section-id`, or `data-read-indicator`
attributes (see `MobileChapterTOC.astro:79-87`). Builder's defense in the
component's docstring (lines 13–28) is that twice-rendering `<RightRailTOC />`
would duplicate the selector targets ScrollSpy + RightRailReadStatus query;
half of that defense is correct (RightRailReadStatus uses `querySelectorAll`
on `.right-rail-toc [data-read-indicator]` — line 78–80 — and would paint
both instances), the other half is technically the opposite of what the
docstring claims (ScrollSpy uses a single `document.querySelector` on
`.right-rail-toc` — line 51 — so it would silently shadow the second
instance, not double-paint). Either way the literal spec reuse would have
caused a regression.

**Cost of the deviation.** Mobile `<MobileChapterTOC>` loses live
`[data-current="true"]` highlighting (no scroll-spy) and read-status
painting (no `data-read` indicators). Spec rationale ("the back button +
drawer give equivalent affordances") is about *navigation between chapters*,
not in-chapter section navigation, so the Builder's invocation of that
rationale to justify the cost is a stretch — but the practical alternative
(extending ScrollSpy + RightRailReadStatus to handle two instances cleanly,
which would have meant scoping their selectors and emitting a join key)
would have been an unauthorised scope creep.

**T3 cycle-1 precedent.** When T3's AC9 enumerated a contract that D1
authorised removing, the audit logged a HIGH (M-UX-REVIEW-T3-ISS-01) and the
fix was a one-line in-place spec amendment + cycle-2 amendment blockquote.
Same pattern applies here: spec D2's literal reuse can't be implemented
without regression; the deviation is justified; the spec wording should be
amended in-place to reflect what shipped.

**Why LOW, not HIGH.** Unlike T3 ISS-01, the spec doesn't internally
contradict itself here — D2's literal reuse is implementable, just at the
cost of a regression Builder correctly avoided. The spec wording is stale
relative to what shipped, but no AC says "use exactly `<RightRailTOC />`" —
AC3 just asserts the on-this-page details renders below the H1 (which it
does). The deviation is documented in CHANGELOG + in `MobileChapterTOC.astro`
+ in `architecture.md:139`. The remaining gap is just the spec file itself.

**Action / Recommendation.** Add a one-line amendment to
`tasks/T4_mobile_reduction.md:53-58` (in-place, no `_v2`): replace the
`<RightRailTOC />` line with `<MobileChapterTOC />` and add a brief comment
("D2 originally named `<RightRailTOC />`; Builder extracted a sibling
component during cycle 1 to avoid the ScrollSpy + RightRailReadStatus
selector-collision regression — see issue file LOW-3"). Bundle into the same
amendment cycle as LOW-1 + LOW-2 above.

---

## Additions beyond spec — audited and justified

1. **`MobileChapterTOC.astro` as a separate component (not literal
   `<RightRailTOC />` twice-render).** See LOW-3 above. The deviation is
   justified by selector-collision avoidance against ScrollSpy +
   RightRailReadStatus; the cost (mobile loses scroll-spy + read-status on
   the on-this-page affordance) is a documented trade-off. Logged as LOW-3
   for the spec-text amendment.
2. **Explicit `display: none` at ≥1024px on the drawer-trigger slot
   wrapper.** Defensive belt-and-braces beyond the `:empty` rule the
   architecture mentions. Necessary because the wrapper has a child element
   (the trigger button itself) on chapter routes, so `:empty` doesn't fire.
   Verified visually on `lectures-ch4-1280x800.png` — desktop top edge
   unchanged from T3. Logged as LOW-1 for the architecture amendment.
3. **`aside[data-slot="right-rail"] { display: none }` at <768px.** Beyond
   spec D1/D2. Builder's defense (suppress double-TOC-paint at <768px) is
   the *consequence* of MobileChapterTOC deviation #1 — without #1, this
   addition wouldn't be needed. Carries a real interactive-mode regression
   (annotations gone at <768px). Logged as MEDIUM-1.

No other additions — `Drawer.astro` D3 attribute-flip and `DrawerTrigger.astro`
markup are surgical and authorised by spec D3.

---

## Verification summary

| Gate | Command | Outcome |
| ---- | ------- | ------- |
| Build | `npm run build` | exit 0; 40 prerendered pages (12 lectures + 12 notes + 12 practice + 3 collection landing + 1 index) |
| Preview | `npm run preview` | reachable at `http://localhost:4321/DSA/`; ch_4 lectures HTTP 200 |
| Functional-tests | `python scripts/functional-tests.py` | **59/59 cases / 124/124 assertions in 28.2s** |
| Smoke screenshots | `python scripts/smoke-screenshots.py` | **31 screenshots / 3,073,760 bytes / 15.4s** |
| Manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | empty (`wc -l` = 0) |
| F12 token bleed | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | 0 hits |
| dist size | `stat -c '%s' dist/client/lectures/ch_4/index.html` | 593,597 bytes (vs T3 close 580,627 → +12,970 bytes for the MobileChapterTOC SSR + the new chrome-level slot wrapper) |
| `data-interactive-only` carriers | `grep -o data-interactive-only dist/client/lectures/ch_4/index.html \| wc -l` | 87 (unchanged from T3) |
| `right-rail-toc` carriers | `grep -o right-rail-toc dist/client/lectures/ch_4/index.html \| wc -l` | 4 (unchanged) |
| `rhs-toc-mobile` carriers | `grep -o rhs-toc-mobile dist/client/lectures/ch_4/index.html \| wc -l` | 72 (new T4 — MobileChapterTOC + scoped CSS) |

**Visual evidence opened.**
- `/.smoke/screenshots/lectures-ch4-375x812.png` — confirms drawer trigger
  reads `☰ Chapters ›`, no breadcrumb, eyebrow → H1 → tabs → "ON THIS PAGE"
  → article in DOM order. Spec D1 + D2 + D3 visually verified.
- `/.smoke/screenshots/lectures-ch4-768x1024.png` — tablet shape: drawer
  trigger sits as own row above the breadcrumb (deliberate vs M-UX T7's
  in-breadcrumb placement; documented in `Base.astro:96-101`); breadcrumb
  returns; right-rail aside content (M-UX T7 `<details
  class="toc-mobile-collapse">`) renders above main per pre-T4 mobile flow.
- `/.smoke/screenshots/lectures-ch4-1280x800.png` — desktop three-column
  shape unchanged from T3; no top-edge shift from the new drawer-trigger
  slot (the explicit `display: none` rule at ≥1024px keeps the slot
  wrapper out of the implicit grid track).

---

## Issue log — cross-task follow-up

| ID | Severity | Status | Owner / Next touch point |
| -- | -------- | ------ | ------------------------ |
| `M-UX-REVIEW-T4-ISS-01` | MEDIUM | RESOLVED — cycle 2 | Closed in T4 cycle 2 (Option (a) narrow-hide shipped at `Base.astro:528-533` + new `mobile-right-rail-aside-stays-rendered-375` regression-guard test). |
| `M-UX-REVIEW-T4-ISS-02` | LOW | DEFERRED — T6 | T6 (typography ADR-0002 amendment) carries the architecture.md dual-rule doc fix. Carry-over landed at `tasks/T6_typography.md` `## Carry-over from prior audits`. |
| `M-UX-REVIEW-T4-ISS-03` | LOW | DEFERRED — T6 | T6 (same architecture.md amendment cycle). Carry-over landed at `tasks/T6_typography.md` `## Carry-over from prior audits`. |
| `M-UX-REVIEW-T4-ISS-04` | LOW | RESOLVED — cycle 2 | Closed in T4 cycle 2 (in-place D2 example-block amendment + cycle-2 amendment blockquote in `tasks/T4_mobile_reduction.md`). |

---

## Deferred to nice_to_have

None. The two LOW findings on architecture-doc precision (LOW-1, LOW-2) and
the spec-wording LOW (LOW-3) are all well-bounded edits, not parking-lot
candidates. The MEDIUM is a regression that needs a direction call from the
user, not a deferral.

The §UX-3 boundary (interactive-mode harness extension) is intact — the new
T4 functional-test cases stay within the static-mode preview surface; no
interactive-mode round-trip seeded.

---

## Propagation status

LOW-1 (`M-UX-REVIEW-T4-ISS-02`) and LOW-2 (`M-UX-REVIEW-T4-ISS-03`) were
forward-deferred to T6 typography ADR-0002 amendment cycle (T6 D5 already
touches `architecture.md` §1 page-chrome subsection). **Carry-over entries
landed during cycle 2** — see
[`../tasks/T6_typography.md`](../tasks/T6_typography.md) `## Carry-over
from prior audits` for the two `- [ ]` bullets (one per issue ID, each with
"what to implement" + source link back to this issue file). The target T6
Builder will tick those bullets and the audit re-grade flips ISS-02 + ISS-03
from `DEFERRED` to `RESOLVED`.

MEDIUM-1 (`M-UX-REVIEW-T4-ISS-01`) and LOW-3 (`M-UX-REVIEW-T4-ISS-04`) were
both **closed in cycle 2** — the narrow-hide CSS lands in `Base.astro:528-533`
guarded by the new `mobile-right-rail-aside-stays-rendered-375` test, and
the D2 example-block amendment + cycle-2 blockquote land in
[`../tasks/T4_mobile_reduction.md`](../tasks/T4_mobile_reduction.md). No
forward-deferrals from these two; their work is complete in-cycle.

---

## Cycle 2 (2026-04-27) — closure pass

### Scope

User picked **Option A** from the cycle-1 audit: close MEDIUM-1
(M-UX-REVIEW-T4-ISS-01) via Option (a) narrow-hide and LOW-3
(M-UX-REVIEW-T4-ISS-04) via in-place spec amendment in this cycle. **LOW-1**
(M-UX-REVIEW-T4-ISS-02 — explicit ≥1024px `display: none` on the
drawer-trigger slot wrapper not documented in `architecture.md` line 172)
and **LOW-2** (M-UX-REVIEW-T4-ISS-03 — stale "Right-rail TOC moves to a
collapsed `<details>` summary at content top" sentence at `architecture.md`
line 125) are forward-deferred to T6 typography ADR-0002 amendment cycle —
T6 already touches `architecture.md` §1 page-chrome subsection, so bundling
the dual doc fixes into the same edit avoids a separate touch.

T4 stays `✅ done 2026-04-27` across all five status surfaces — cycle 2 is
closure-only, no re-flip. The no-regression bullet in `m_ux_review/README.md`
moves from **59 cases / 124 assertions** (post-T4 cycle-1 close) to **60
cases / 128 assertions** (post-T4 cycle-2 close) — net delta `+1 case / +4
assertions` from the new `mobile-right-rail-aside-stays-rendered-375`
regression-guard test.

### Files touched

- `src/layouts/Base.astro` — the cycle-1 broad rule
  `.chrome > aside[data-slot="right-rail"] { display: none }` at
  `@media (max-width: 767.98px)` is replaced with two narrow rules
  (`aside[data-slot="right-rail"] :global(.right-rail-toc) { display: none }`
  and `aside[data-slot="right-rail"] :global(details.toc-mobile-collapse)
  { display: none }`). The `:global(...)` wrap is required because Base.astro's
  scoped style block cannot reach class selectors emitted by child components
  (`RightRailTOC.astro` emits `.right-rail-toc` and `.toc-mobile-collapse`).
  The T4 D2 docstring on the prior line (block at `Base.astro:461-477`) is
  refreshed to describe the cycle-2 narrow-hide rationale + the AnnotationsPane
  preservation contract.
- `design_docs/milestones/m_ux_review/tasks/T4_mobile_reduction.md` — D2's
  example DOM-order block updated in-place: the four-line `<details
  class="rhs-toc-mobile">…<RightRailTOC />…</details>` listing replaced with
  a single-line `<MobileChapterTOC />` reference + inline parenthetical
  noting the component renders its own `<details>` wrapper. A cycle-2
  amendment blockquote follows the example block, citing
  M-UX-REVIEW-T4-ISS-04 and explaining the deviation (selector-collision
  avoidance against ScrollSpy + RightRailReadStatus) + the trade-off (mobile
  loses live current-section + read-status painting in the on-this-page
  affordance).
- `design_docs/milestones/m_ux_review/tasks/T6_typography.md` —
  `## Carry-over from prior audits` section's "None" sentence replaced with
  two `- [ ]` bullets, one per forward-deferred LOW (ISS-02 + ISS-03), each
  with concrete "what to implement" text + source link back to this issue
  file. T6 stays `Status: todo` — no status change, only the carry-over
  shape grows.
- `scripts/functional-tests.json` — new test case
  `mobile-right-rail-aside-stays-rendered-375` inserted after
  `mobile-breadcrumb-hidden-375`. Four asserts: (1) cardinality of
  `aside[data-slot="right-rail"]` is 1, (2) computed-style of the aside is
  `display: block` (proves the aside renders, not hidden), (3) computed-style
  of `aside[data-slot="right-rail"] .right-rail-toc` is `display: none`
  (proves the desktop TOC track is hidden), (4) computed-style of
  `aside[data-slot="right-rail"] details.toc-mobile-collapse` is
  `display: none` (proves the M-UX T7 mobile fallback is hidden). If a future
  change reverts to the broad aside-level hide, assertion (2) flips from
  `block` to `none` and the test fails — this case IS the regression-guard.
- `design_docs/milestones/m_ux_review/issues/T4_issue.md` — preamble Status
  flipped ⚠️ OPEN → ✅ PASS — cycle 2 closure; MEDIUM-1 + LOW-3 marked
  RESOLVED — cycle 2 with one-paragraph resolution notes; LOW-1 + LOW-2
  marked DEFERRED — propagated to T6 with cycle-2 disposition notes;
  issue-log table updated; Propagation status footer updated; this Cycle 2
  subsection appended.
- `design_docs/milestones/m_ux_review/README.md` — no-regression bullet
  count updated `59 cases / 124 assertions` → `60 cases / 128 assertions`
  with a one-line cycle-2 delta note.
- `CHANGELOG.md` — `Changed` entry appended under the existing 2026-04-27
  section.

### Gate output (cycle 2 verification)

| Gate | Command | Pass/Fail | Output |
| ---- | ------- | --------- | ------ |
| Build | `npm run build` | ✅ PASS | exit 0; **40 prerendered pages** (12 lectures + 12 notes + 12 practice + 3 collection landing + 1 index); server built in 11.55s. |
| Functional tests | `.venv/bin/python scripts/functional-tests.py` | ✅ PASS | **60/60 cases, 128/128 assertions in 28.6s.** New `mobile-right-rail-aside-stays-rendered-375` (4/4 asserts) PASS. All cycle-1 cases (59 baseline) still PASS verbatim. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py` | ✅ PASS | **31 screenshots / 3,054,220 bytes in 15.3s** — visual smoke at 375×812 + 1280×800 confirms no shift in mobile or desktop shape. |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ no touches | empty diff. No `dependency-auditor` run required. |

### RESOLVED + DEFERRED status flips (issue-log table)

- M-UX-REVIEW-T4-ISS-01 (MEDIUM) — RESOLVED — cycle 2.
- M-UX-REVIEW-T4-ISS-02 (LOW) — DEFERRED — propagated to T6.
- M-UX-REVIEW-T4-ISS-03 (LOW) — DEFERRED — propagated to T6.
- M-UX-REVIEW-T4-ISS-04 (LOW) — RESOLVED — cycle 2.

### What cycle 2 did NOT do (per the user's Option A scope)

- Did NOT touch `architecture.md` (LOW-1 + LOW-2 are T6's job per the
  forward-deferral; T6 already touches `architecture.md` §1 page-chrome
  subsection per its D5).
- Did NOT touch T2 / T3 / T5 specs.
- Did NOT introduce new dependencies (manifest diff empty).
- Did NOT touch ScrollSpy / RightRailReadStatus / AnnotationsPane source —
  the narrow-hide is a Base.astro CSS-only fix; the AnnotationsPane
  visibility cascade now flows naturally through the
  `data-interactive-only` global rule already in place since T7.
- Did NOT commit, push, or open a PR.
- Did NOT run `security-reviewer` / `dependency-auditor` (no manifest touch).

---

## Cycle 2 audit re-grade (2026-04-27)

Auditor independently re-ran every gate from scratch + opened the
narrow-hide CSS in `Base.astro` lines 461–533 + verified the regression-
guard test at `scripts/functional-tests.json:955-987` + read T4 spec D2
amendment at `tasks/T4_mobile_reduction.md:49-62` + read T6 carry-over at
`tasks/T6_typography.md:121-124` + opened the cycle-2 visual evidence at
`.smoke/screenshots/lectures-ch4-{375x812,1280x800}.png`.

### Fix verification (Builder claim → auditor confirmation)

| Builder claim | Auditor finding |
| ------------- | --------------- |
| Fix 1 — broad `aside[data-slot="right-rail"] { display: none }` removed; replaced with two narrow `:global(.right-rail-toc) / details.toc-mobile-collapse` rules at `Base.astro:528-533`. | **Confirmed.** Read `Base.astro:488-534`. Broad aside-level hide is gone. Two new rules use `:global(...)` correctly (Astro scoped-style behaviour cannot reach class selectors emitted by child component `RightRailTOC.astro` without `:global`). Builder docstring at lines 500–527 explains the AnnotationsPane preservation rationale (M-UX T7 line 19 + ADR-0002 line 75). Breadcrumb-hide rule at lines 497–499 preserved verbatim. |
| Fix 2 — T4 spec D2 `<RightRailTOC />` replaced with `<MobileChapterTOC />` in-place; cycle-2 amendment blockquote follows the example block. | **Confirmed.** Read `tasks/T4_mobile_reduction.md:49-62`. Line 54 reads `<MobileChapterTOC />` with parenthetical "(T4 — emits its own `<details class="rhs-toc-mobile">` with `<summary>On this page</summary>`)". Line 62 cycle-2 amendment blockquote cites M-UX-REVIEW-T4-ISS-04 + names ScrollSpy + RightRailReadStatus selector-collision rationale + the trade-off (mobile loses live `[data-current]` highlighting + read-status painting). |
| Fix 3 — T6 carry-over "None" sentence replaced with two `- [ ]` bullets per ISS-02 / ISS-03; T6 stays `Status: todo`. | **Confirmed.** Read `tasks/T6_typography.md:121-124`. Two `- [ ]` bullets present, one per issue ID. Each carries: issue ID + severity tag, concrete what-to-implement wording (the dual-rule architecture amendment for ISS-02; the stale "Right-rail TOC moves to a collapsed `<details>` summary" sentence refresh for ISS-03), back-link to `../issues/T4_issue.md`. T6 line 3 `**Status:** todo` — no premature flip. CLAUDE.md propagation discipline satisfied. |
| Regression-guard test `mobile-right-rail-aside-stays-rendered-375` lands at `scripts/functional-tests.json` with 4 asserts. | **Confirmed.** Read `functional-tests.json:955-987`. Four asserts in order: (1) `count` of `aside[data-slot="right-rail"]` == 1, (2) `computed-style display == block` on the aside, (3) `computed-style display == none` on `.right-rail-toc`, (4) `computed-style display == none` on `details.toc-mobile-collapse`. **Reverse-trip sanity:** if a future change reverts the cycle-2 narrow-hide back to the broad aside-level `display: none`, assertion (2) flips from `block` to `none` and the case fails. The test IS the regression-guard, structurally the inverse of the original aside-level hide. |

### Auditor gate re-run (from-scratch)

| Gate | Command | Outcome |
| ---- | ------- | ------- |
| Build | `npm run build` | exit 0; **40 pages** prerendered; server built in 10.99s. |
| Preview | `npm run preview` | reachable at `http://localhost:4321/DSA/`; ch_4 lectures HTTP 200 / 591,901 bytes (matches expected post-cycle-2 dist size). |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --base-url http://localhost:4321` | **60/60 cases / 128/128 assertions in 28.4s.** New `mobile-right-rail-aside-stays-rendered-375` (4/4) PASS. All cycle-1 baseline cases (59) still PASS verbatim. **Matches Builder claim exactly.** |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --base-url http://localhost:4321` | **31 screenshots / 3,054,220 bytes in 15.3s.** Matches Builder claim verbatim (byte-for-byte). |
| Manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | empty. No `dependency-auditor` re-run required. |
| F12 boundary | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | 0 hits. F12 (`nice_to_have.md` §UX-5) untouched. |

### Visual confirmation

- **`.smoke/screenshots/lectures-ch4-375x812.png`** — drawer trigger `☰ Chapters ›` at top; no breadcrumb; DOM order eyebrow ("CHAPTER 4 · LECTURES") → H1 ("Lists, stacks, queues, deques") → tabs (Lectures filled-accent, Notes + Practice outline) → "ON THIS PAGE" disclosure → article ("Chapter map" callout). Mobile UX shape unchanged from cycle 1 (the narrow-hide affects only interactive-mode AnnotationsPane visibility, not static-mode public surface).
- **`.smoke/screenshots/lectures-ch4-1280x800.png`** — desktop three-column shape preserved: left rail (chapter list) + main (chapter content) + right rail (ON THIS PAGE TOC). Top sticky breadcrumb "cs-300 / CHAPTER 4 · LECTURES" with chapter title centered. No top-edge shift from cycle 1 — the explicit `≥1024px` `display: none` on the drawer-trigger slot wrapper keeps the row out of the implicit grid track.

### Status-surface lockstep — re-verified

| Surface | Path | State |
| ------- | ---- | ----- |
| (a) Per-task spec | `tasks/T4_mobile_reduction.md:3` | `✅ done 2026-04-27` |
| (b) `tasks/README.md` row | `tasks/README.md:12` | `✅ done 2026-04-27` |
| (c) Milestone README task table | `m_ux_review/README.md:56` | `✅ done 2026-04-27` |
| (d) Milestone README `Done when` checkboxes | `m_ux_review/README.md:40,41,44` | F9 `[x]`, F10 `[x]`, no-regression bullet `[x]` (bumped 59/124 → 60/128 with cycle-2 delta note) |
| (e) Milestones index | `milestones/README.md:27` | `active (T1 + T2 + T3 + T4 closed 2026-04-27; T5–T6 outstanding)` |

All five surfaces in lockstep. T6 status correctly stays `todo` — Builder did NOT prematurely flip the target spec, only added carry-over bullets per CLAUDE.md propagation discipline.

### Issue-log re-grade

- **M-UX-REVIEW-T4-ISS-01 (MEDIUM)** — RESOLVED — cycle 2. Narrow-hide shipped at `Base.astro:528-533`; regression-guard test at `functional-tests.json:955-987` (4/4 PASS); reverse-trip semantic confirmed.
- **M-UX-REVIEW-T4-ISS-02 (LOW)** — DEFERRED — propagated to T6. Carry-over bullet at `T6_typography.md:123` with concrete "what to implement" + back-link. Will flip RESOLVED when T6 audit re-grades.
- **M-UX-REVIEW-T4-ISS-03 (LOW)** — DEFERRED — propagated to T6. Carry-over bullet at `T6_typography.md:124` with concrete "what to implement" + back-link. Will flip RESOLVED when T6 audit re-grades.
- **M-UX-REVIEW-T4-ISS-04 (LOW)** — RESOLVED — cycle 2. T4 spec D2 amended in-place at `tasks/T4_mobile_reduction.md:49-62` (no `_v2`, pattern matches T2 cycle 2 LOW-2/4 + T3 cycle 2 HIGH-1).

### Cycle-2 audit verdict

✅ **PASS — FUNCTIONALLY CLEAN.** All four cycle-1 findings dispositioned:
two RESOLVED in-cycle (MEDIUM-1 + LOW-3), two correctly forward-deferred to
T6 (LOW-1 + LOW-2) with carry-over bullets propagated per CLAUDE.md
discipline. Net delta from cycle 1: `+1 functional-test case / +4 asserts`
(60/128 vs 59/124), `-2,930 net dist bytes` not measured separately
(Builder did not claim a dist-size delta for cycle 2), zero new
dependencies, zero new architecture drift. Five status surfaces consistent;
T6 status correctly stays `todo`. T4 closure-pass complete.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-2 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. T4 is a mobile-chrome refactor; surface area narrow (no new client-side state, no localStorage, no fetch).

### Files reviewed

- `src/components/chrome/MobileChapterTOC.astro` — new mobile TOC component; Astro template interpolation only.
- `src/components/chrome/DrawerTrigger.astro` — drawer trigger with label + chevron additions.
- `src/components/chrome/Drawer.astro` — drawer JS island; `data-drawer-state` flip added alongside `aria-expanded`.
- `src/layouts/Base.astro` — mobile media-query blocks; new `drawer-trigger` named slot.
- `src/components/chrome/Breadcrumb.astro` — in-breadcrumb `drawer-trigger` slot removed.
- `src/pages/lectures/[id].astro` (parallel structure on `notes/` + `practice/`) — mount points for DrawerTrigger + MobileChapterTOC.

### Critical

None.

### High

None.

### Advisory (all confirm-only — no actions required)

- **`Drawer.astro:236-244`** — `aria-expanded` and `data-drawer-state` flipped via separate `setAttribute` calls inside the same synchronous `close()` function. No await between them; no race condition under the current single-page non-SPA model. The trigger element is re-queried via `getElementById` on every `open()` / `close()` rather than cached at init time alongside `aside` and `backdrop` — minor robustness note only; cs-300's architecture doesn't mutate the trigger DOM at runtime. Confirm-only.
- **`MobileChapterTOC.astro:83`** — `s.anchor` from MDX frontmatter interpolated into `href={` ` `#${s.anchor}` ` `}`. Anchor value originates from `scripts/build-content.mjs` at build time (developer-controlled pipeline, not user or LLM input). No sanitization concern. Confirm-only.
- **`Base.astro:528-533`** — Two `:global(.right-rail-toc)` and `:global(details.toc-mobile-collapse)` selectors inside the `@media (max-width: 767.98px)` block. `:global(...)` wrapping required because Astro's scoped `<style>` can't pierce child component boundaries; the target elements live inside a child `<aside>`. Rules correctly bounded by the media query — only match at <768px, no leakage outside the mobile breakpoint. Selectors are class-specific enough that there's no risk of accidentally matching non-TOC elements. Confirm-only.
- **`Base.astro:619-625` (T1's `cs300:last-visit` writer, not T4's surface)** — Reviewer flagged the `document.title` capture for completeness. This is **T1 D3 territory**, already covered by T1's cycle-3 security review: ContinueReading.astro reader uses `createElement` + `textContent` / `href` assignment (NOT `innerHTML`), and T1 cycle-3 added an origin check rejecting `javascript:` URIs. Cross-reference: `design_docs/milestones/m_ux_review/issues/T1_issue.md` `## Security review` section. No T4-side action.
- **`DrawerTrigger.astro:96-98`** — All three new spans use static string literals. `drawer-icon` + `drawer-chevron` carry `aria-hidden="true"`; `drawer-label` ("Chapters") is visible text and intentionally NOT aria-hidden. The button's `aria-label="Open navigation"` overrides child text content for the accessible-name computation, so SR users get the authoritative label without dual-announcement of the visible "Chapters" string. ARIA correctness verified.

### Verdict

**SHIP.** No actionable findings on T4 surfaces. The Base.astro localStorage advisory is a cross-reference to T1's surface where the fix already shipped in cycle 3.

### Dependency audit

Skipped — no manifest changes.
