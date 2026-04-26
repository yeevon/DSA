# T9 — Layout polish + functional-test harness — Audit Issues

**Source task:** [../tasks/T9_layout_polish.md](../tasks/T9_layout_polish.md)
**Audited on:** 2026-04-25
**Audit cycle:** 1 (first audit)
**Audit scope:** full-project — task spec, milestone README, tasks/README, top-level
milestones/README, ADR-0002, architecture.md §1.6, nice_to_have.md (§UX-2),
CHANGELOG, every modified/new file (Base.astro, chrome.css, Breadcrumb.astro,
LeftRail.astro, ChapterCard.astro, lectures/index.astro, notes/index.astro,
practice/index.astro, scripts/functional-tests.py, functional-tests.json,
_selenium_helpers.py, smoke-screenshots.py [refactor], smoke-routes.json,
smoke-screenshots.md), independent build + harness re-run + mutation test +
4 screenshots opened.
**Status:** ✅ PASS (HIGH M-UX-T9-ISS-01 RESOLVED orchestrator-side post-audit; bullet 10 numbers updated to 40 pages / +873 KB / +20.2% post-T9 with citation chain extended to T9 issue file. All 14 ACs and 7 D-deliverables PASS.)

---

## Design-drift check

Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1.6 (Page chrome — UX layer)
and [`../../../adr/0002_ux_layer_mdn_three_column.md`](../../../adr/0002_ux_layer_mdn_three_column.md).

- **No new dependency.** `selenium==4.43.0` already pinned in `requirements-dev.txt`
  from M-UX T7 cycle 2. `git diff HEAD -- package.json package-lock.json
  requirements-dev.txt .nvmrc .pandoc-version` is empty. Builder claim
  "no manifest churn" verified.
- **No new module / boundary crossing.** `scripts/_selenium_helpers.py` is a
  sibling-script helper inside the existing `scripts/` ops dir; no new layer
  introduced. The two new chrome surfaces (sticky rails, centered chrome) are
  CSS-only on the existing Base.astro `.chrome` grid contract; the three new
  pages compose `HomeLayout` + `ChapterCard` (both pre-existing) + `chapters.json`
  (the existing manifest). No new layer, no new chrome component family.
- **Architecture.md §1.6 conformance.** §1.6's diagram shows the three-column
  grid; Builder's centering at >1400px does not change column widths — just
  centers the grid container. §1.6 does not enumerate viewport widths above
  1024px so adding centering at 1400px is policy that aligns with the ADR
  ("max-width ~75ch" centerline reading constraint extends naturally to
  capping the chrome itself on wide displays).
- **ADR-0002 conformance.** ADR commits (lines 73–78) to:
  - Left rail "sticky on desktop, drawer on mobile" — D2 lands the desktop
    sticky behaviour (`position: sticky; top: var(--mux-breadcrumb-height)
    align-self: start`); drawer behaviour preserved verbatim from T7 cycle 2.
  - Right-rail TOC "below the TOC in interactive mode" — D2 makes the right
    rail also sticky, matches the ADR's "rails follow the user down long
    chapters" intent (paraphrasing the chrome contract).
  - Three collections (Lectures / Notes / Practice) — D5's three landing pages
    materialise the closed set into navigable URLs, no drift.
- **No `nice_to_have.md` adoption beyond §UX-2.** Builder added §UX-2
  (collapsible sections) per spec D7 — explicitly authorised. The §UX-2 entry
  has the four required sections (What / Status / Why deferred / Trigger /
  Cost) and a `Surfaced 2026-04-25` provenance line. No drive-by adoption of
  any other parked item.
- **AC2 calibration (audited separately below).** Builder's relaxation from
  spec literal "width == 1024" to "width ∈ [1000, 1024]" is acceptable —
  intent (rails snug to viewport edges) is preserved; `left == 0` is still
  asserted; the ~15px shortfall is the headless-Chrome scrollbar gutter, a
  known artefact of the test environment, not a layout regression. Logged as
  LOW for spec-text amendment so the ACT calibration is documented at the
  source.

**Verdict:** no design drift. **Phase 1 PASS.**

---

## AC grading (14 ACs from T9 spec acceptance-checks table)

| AC | Status | Notes |
| -- | ------ | ----- |
| AC1 — `chrome-centered-2560` | ✅ PASS | Functional harness asserts `.chrome` width ≤ 1400 AND left ≥ 100 at 2560×1080. Both pass; screenshot `lectures-ch4-2560x1080.png` visually confirms centered chrome with left/right whitespace gutters and three-column grid intact. |
| AC2 — `chrome-fills-1024` | ✅ PASS (with calibration note) | Width asserted in `[1000, 1024]` instead of literal 1024 due to headless-Chrome vertical-scrollbar gutter. `left == 0` still asserted. Screenshot `lectures-ch4-1024x768.png` visually confirms rails are snug to viewport edges (no centering, no margin). Calibration is acceptable; spec text could be amended to make the test environment explicit (LOW finding M-UX-T9-ISS-02). |
| AC3 — `left-rail-sticky-after-scroll-ch4` | ✅ PASS | Harness scrolls 2000px on ch_4, asserts `aside[data-slot="left-rail"]`'s `top` ∈ [0, 100]. Passes. |
| AC4 — `right-rail-sticky-after-scroll-ch4` | ✅ PASS | Same mechanic as AC3 for the right rail. Passes. |
| AC5 — `leftrail-collection-aware-notes` | ✅ PASS | On `/DSA/notes/ch_4/`, every `aside[data-slot="left-rail"] a.chapter-link` href matches `/DSA/notes/ch_\d+/$`. Passes. |
| AC6 — `leftrail-collection-aware-practice` | ✅ PASS | On `/DSA/practice/ch_7/`, every chapter-link href matches `/DSA/practice/ch_\d+/$`. Passes. |
| AC7 — `breadcrumb-cs300-link` | ✅ PASS | One `.breadcrumb-path a.path-root` element with href matching `/DSA/$`. Built HTML confirms `<a class="path-root" href="/DSA/">cs-300</a>`. |
| AC8 — `breadcrumb-collection-link-notes` | ✅ PASS | Middle segment href is `/DSA/notes/$`, textContent is `Notes`. Sibling assertions for lectures + practice (added beyond spec literal — Builder added two extra coverage cases) also pass. |
| AC9 — `breadcrumb-current-page-no-link` | ✅ PASS | `.breadcrumb-path .path-current` has `aria-current="page"`; zero `a[aria-current="page"]` inside `.breadcrumb-path`; one `span.path-current[aria-current="page"]`. Built HTML confirms `<span class="path-current" aria-current="page">ch_4 — …</span>`. |
| AC10 — `landing-pages-render-three` | ✅ PASS | Spec compresses three landing-page checks into one row; Builder split them into three separate test cases (`landing-page-{lectures,notes,practice}-renders`), each asserting 12 `article.chapter-card`. All three pass. Independent grep on built HTML: 12 `<article ... chapter-card>` per landing page. |
| AC11 — `landing-page-highlight-lectures` | ✅ PASS | 12 `article.chapter-card .chapter-card-links a.is-current-collection` on `/DSA/lectures/`, all matching `/DSA/lectures/ch_\d+/$`. Builder also added sibling assertions for notes + practice. |
| AC12 — Build still produces 40 prerendered pages | ✅ PASS | Independent `npm run build` produced 40 pages (counted via `find dist/client -name index.html`). 37 (T8 baseline) + 3 (D5 landing pages) = 40. Server built in 8.82s. |
| AC13 — `data-interactive-only` count on lectures/ch_4 unchanged at 87 | ✅ PASS | `grep -oc 'data-interactive-only' dist/client/lectures/ch_4/index.html` = 87. Matches T7 cycle 2 baseline. |
| AC14 — M3 contracts unchanged | ✅ PASS | `grep -roh 'cs300:read-status-changed\|cs300:toc-read-status-painted\|cs300:annotation-added\|cs300:drawer-toggle' dist/client` shows: `cs300:annotation-added` 24, `cs300:drawer-toggle` 72, `cs300:read-status-changed` 60, `cs300:toc-read-status-painted` 24. Source-tree grep over `src/`: 5 / 7 / 12 / 8 hits respectively (dispatch + listener call sites). All four event names still present; T8 baseline preserved. |

---

## D-deliverable disposition (7 spec deliverables)

| D# | Deliverable | Status | Evidence |
| -- | ----------- | ------ | -------- |
| D1 | Centered chrome container | ✅ PASS | `chrome.css` adds `--mux-chrome-max: 1400px`; `Base.astro` `.chrome` rule adds `max-width: var(--mux-chrome-max); margin-inline: auto; width: 100%`. AC1 + 2560×1080 screenshot confirm. |
| D2 | Sticky rails with internal scroll | ✅ PASS | `Base.astro` ≥1024px @media block adds `position: sticky; top: var(--mux-breadcrumb-height); align-self: start; max-height: calc(100vh - …); overflow-y: auto` to both rails. `--mux-breadcrumb-height: 52px` token added. AC3 + AC4 confirm. |
| D3 | LeftRail collection-aware hrefs | ✅ PASS | `LeftRail.astro` derives `currentCollection` from `Astro.url.pathname` via the same regex as Breadcrumb (`/(lectures\|notes\|practice)\/(ch_\d+)\/?$/`). Default = `lectures` (defensive). AC5 + AC6 confirm. |
| D4 | Functional breadcrumb links | ✅ PASS | `Breadcrumb.astro` `cs-300` segment is now `<a class="path-root" href="/DSA/">`; middle segment is `<a href="/DSA/${currentCollection}/">${COLLECTION_LABEL[currentCollection]}</a>`; current chapter remains `<span class="path-current" aria-current="page">`. AC7 + AC8 + AC9 + sibling lectures/practice tests confirm. |
| D5 | Three new collection-landing pages | ✅ PASS | Three new `src/pages/{lectures,notes,practice}/index.astro` files, each using `HomeLayout`, importing `ChapterCard` with `highlight={collection}`, rendering 12 cards (Required ch_1–ch_6 / Optional ch_7, ch_9–ch_13). `ChapterCard.astro` extended with optional `highlight?: Collection` prop; default behaviour (no `highlight`) produces zero `is-current-collection` markup on the index page (independently verified — `grep -oE 'a class="is-current-collection"' dist/client/index.html` = 0). AC10 + AC11 + sibling notes/practice highlight tests confirm. |
| D6 | Functional-test harness | ✅ PASS | `scripts/functional-tests.py` (500 lines, full module docstring, five assertion runners). Re-run independently against `npm run preview`: `17/17 test cases passed (28/28 assertions) in 8.1s` exit 0. **Mutation test**: changed `landing-page-lectures-renders` expected `12 → 99`, harness exit code = 1, surfaced `count: 'article.chapter-card' expected == 99, actual=12`. Original config restored. Harness is non-inferentially correct. |
| D7 | nice_to_have §UX-2 entry | ✅ PASS | Single new entry under `## §UX-2 — Collapsible chapter sections`. Documents motivation (long chapters), risk (M3 ScrollSpy + read-tracking break on closed `<details>`), three implementation routes (pandoc Lua filter / Astro JS island / manual MDX), trigger (user friction OR M5 review-queue study-mode), cost (ADR + arch §1.6 amendment + ~1 session). 49 lines, single paragraph each as spec requires. No drive-by adoption beyond §UX-2. |

---

## 🔴 HIGH

### M-UX-T9-ISS-01 — Done-when bullet 10 in milestone README references stale "37 prerendered pages" + "+817 KB / +18.9%" delta after T9 closed at 40 pages / +894 KB / ~+20.2%.

**Severity:** HIGH (per CLAUDE.md "Status-surface discipline" — stale claims on a `Done when` bullet that the audit verifies are HIGH-finding meta-audit drift; the rule was added precisely after M2 + M3 caught this same class of drift).

**Where:** [`design_docs/milestones/m_ux_polish/README.md:28`](../README.md). The bullet currently reads:

> Deploy contract preserved — site **still ships 37 prerendered pages** … `dist/client/` cumulative size delta vs pre-M-UX baseline measured at **+817 KB / +18.9%** …

After T9: site ships 40 pages (3 new landing pages + 37 chapter routes), `dist/client/` total `5,315,473` bytes vs pre-M-UX baseline `4,420,947` = **+894,526 bytes / ~+873 KB / ~+20.2%**. The bullet was T8's claim; T9 reopened the milestone, added 3 routes + chrome CSS additions, and the bullet text wasn't refreshed at close.

**Why it matters:** the bullet is the closing claim a future reader uses to verify the milestone exit criteria. It now reads false-on-its-face: someone running `find dist/client -name 'index.html' | wc -l` after `git pull` gets 40, not 37; the literal "+50KB" budget reference, the "+817 KB" measurement, and the "37 pages" claim are all stale.

**Action / Recommendation:** rewrite bullet 10's prefix from "site still ships 37 prerendered pages" to "site ships 40 prerendered pages (37 chapter routes + 3 collection-landing pages added in T9)" and refresh the size delta to "+873 KB / +20.2% (T9 added +57,827 bytes for the 3 landing pages + chrome CSS)". Add a parenthetical citation to T9's issue file (this file). Ticket-style fix; ~3 lines of edit on `m_ux_polish/README.md`.

**Owner:** T9 close — Builder addresses inline before this audit closes (cheaper than carry-over).

---

## 🟡 MEDIUM

(none)

---

## 🟢 LOW

### M-UX-T9-ISS-02 — AC2 calibration (`chrome-fills-1024` width threshold relaxed from `==1024` to `[1000, 1024]`) is undocumented in the spec.

**Severity:** LOW (the calibration is functionally correct — the screenshot at 1024×768 visually confirms rails snug to viewport edges; the relaxation accommodates the headless-Chrome vertical-scrollbar gutter, which is environmental, not a layout drift).

**Where:** [`tasks/T9_layout_polish.md:104`](../tasks/T9_layout_polish.md) (AC2 row in the acceptance-checks table) and [`scripts/functional-tests.json:32`](../../../../scripts/functional-tests.json) (test case `chrome-fills-1024`).

The spec literal says "At 1024×768, `.chrome` fills viewport (rails snug to viewport edges)." The harness asserts `width between [1000, 1024]` rather than `width == 1024`. The visual verification (`.smoke/screenshots/lectures-ch4-1024x768.png`) shows rails at the viewport edges — the ~15px shortfall is the rendered scrollbar inset, not a layout gap.

**Action / Recommendation:** amend the AC2 row in the spec to add a "Note: harness asserts width ∈ [1000, 1024] to accommodate the rendered scrollbar gutter; left == 0 is the load-bearing assertion." parenthetical. One-line spec edit. No code change. Optional follow-on: add a third assertion on AC2 that `right == viewport.width - scrollbar` to make the snug-to-edge claim explicit on both sides.

**Owner:** T9 close (alongside M-UX-T9-ISS-01) — Builder amends the spec inline.

### M-UX-T9-ISS-03 — `--no-sandbox` CLI flag default is `True` and the `--no-sandbox` flag toggles it ON regardless of user intent.

**Severity:** LOW (cosmetic CLI ergonomics; does not affect harness correctness).

**Where:** [`scripts/functional-tests.py:195-200`](../../../../scripts/functional-tests.py).

The argparse setup uses `action="store_true", default=True` for `--no-sandbox`. With `store_true + default=True`, passing `--no-sandbox` does nothing (already True), and there's no way from the CLI to set it False. The `smoke-screenshots.py` parent script has the same shape. Functionally fine for cs-300's environment but the flag-name semantics are inverted.

**Action / Recommendation:** in a future ergonomic sweep, switch to `action=argparse.BooleanOptionalAction` (Python 3.9+) so `--no-sandbox` / `--no-no-sandbox` both work, OR rename the flag `--sandbox` (`store_false`, default True) to match the actual semantics. Not blocking T9. File against a future scripts/ ergonomics task or leave as-is given the user's environment requires `--no-sandbox` always.

**Owner:** future — not blocking T9 close.

### M-UX-T9-ISS-04 — `Astro.url.pathname` regex in LeftRail/Breadcrumb defaults to `lectures` when no chapter slug match.

**Severity:** LOW (defensive defaulting; the defensive case is only reachable if the components are mounted on a non-chapter route, which is not currently a thing — chapter routes are the sole consumer).

**Where:** [`src/components/chrome/LeftRail.astro:84`](../../../../src/components/chrome/LeftRail.astro), [`src/components/chrome/Breadcrumb.astro:103-105`](../../../../src/components/chrome/Breadcrumb.astro) (Breadcrumb returns null/null + early-bails at the JSX `currentChapter && currentCollection &&` guard, so its defensive shape is fine).

LeftRail's defensive default of `currentCollection = 'lectures'` means if a future caller mounts LeftRail on a non-chapter route, every chapter link would point to `lectures/`. Breadcrumb handles this correctly by returning `null` and rendering nothing.

**Action / Recommendation:** add a regression test to `functional-tests.json` that mounts LeftRail on a non-chapter route (e.g., the index page) and asserts the rail either doesn't render or renders to `lectures/`. Or, more conservatively, document the defensive-default contract in the LeftRail header. Either way, not blocking — the actual behaviour is correct on every route LeftRail is mounted on today (chapter routes only). Leave as forward-looking.

**Owner:** future — flag-only.

---

## Additions beyond spec — audited and justified

| Addition | Justification | Verdict |
| -------- | ------------- | ------- |
| `scripts/_selenium_helpers.py` (helper extraction from `smoke-screenshots.py`) | T9 spec D6 explicitly authorises: "Reuses the same Selenium WebDriver + headless Chrome + isolated `/tmp/cs300-smoke-*` user-data-dir setup (extract shared logic into a small helper module if it grows)." Diff vs T7-cycle-2 `smoke-screenshots.py` shows the extracted functions (`build_driver`, `assert_preview_reachable`) move byte-equivalently to the new module — same flag set (`--headless=new`, `--user-data-dir`, `--no-sandbox`, `--disable-gpu`, `--disable-dev-shm-usage`, `--log-level=3`, `--lang=en-US`), same docstring contract, same try/finally cleanup discipline. No behaviour delta. | ✅ Authorised + verified byte-equivalent. |
| `breadcrumb-collection-link-lectures` + `breadcrumb-collection-link-practice` test cases | Spec AC8 only asks for the notes case; Builder added the lectures + practice cases as sibling coverage so the closed set is exhaustively asserted. Three small extra test cases (~14 JSON lines each) for symmetric coverage. | ✅ Defensible — improves coverage, no scope creep. |
| `landing-page-highlight-notes` + `landing-page-highlight-practice` test cases | Spec AC11 only specifies the lectures case; Builder added the other two. Same justification as above — closed-set symmetry. | ✅ Defensible. |
| `landing-page-{notes,practice}-renders` (split from spec's compressed AC10 row) | Spec AC10 says "each return HTTP 200 and render `<article class="chapter-card">` × 12" but groups it as one assertion; Builder split into three independent test cases for per-page diagnosis on failure. | ✅ Defensible — same surface, finer granularity. |
| `--mux-breadcrumb-height: 52px` token | Required by D2's sticky-offset; documented in `chrome.css:87-94` with the measurement methodology (font-size + padding + line-height). Auditor independently confirmed the measurement is approximately right (the breadcrumb's inner `.breadcrumb` rule has `padding: var(--mux-space-2) var(--mux-space-4)` = `8px 16px` + `font-size: 0.85rem` × `line-height` ≈ `1.4` ≈ 52px total). | ✅ Required by D2. |
| 2560×1080 viewport added to `lectures-ch4` + `lectures-landing` routes in `smoke-routes.json` | T9 spec smoke procedure step 5 explicitly names this screenshot as "NEW viewport — verify centered chrome." | ✅ Required by spec. |
| Three new routes in `smoke-routes.json` (`/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/`) | Spec smoke procedure step 4: "Add the three new routes … so they're covered going forward." | ✅ Required by spec. |
| `scripts/smoke-screenshots.md` doc append (sibling reference) | Spec D6 step 5: "Brief doc updates in `scripts/smoke-screenshots.md`". | ✅ Required by spec. |

No unjustified additions.

---

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build clean | `npm run build` | ✅ exit 0; 40 pages built; `dist/client/` = `5,315,473` bytes (matches Builder report); server built in 8.82s. |
| Functional-test harness | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ exit 0; 17/17 test cases passed (28/28 assertions) in 8.1s. Exact match with Builder's report. |
| Functional-test harness mutation test | Mutated `landing-page-lectures-renders` `expected: 12 → 99`, re-ran, restored. | ✅ Mutated run exit 1; failure detail surfaced (`count: 'article.chapter-card' expected == 99, actual=12`). Harness is non-inferentially correct. |
| `data-interactive-only` count on lectures/ch_4 | `grep -oc 'data-interactive-only' dist/client/lectures/ch_4/index.html` | ✅ 87 (matches T7 cycle 2 baseline; AC13 PASS). |
| Chapter-card count on landing pages | `grep -oE '<article[^>]*chapter-card[^>]*>' dist/client/{lectures,notes,practice}/index.html \| wc -l` | ✅ 12 per page; 36 total (AC10 PASS). |
| `is-current-collection` count on landing pages | `grep -oE 'class="is-current-collection"' dist/client/{lectures,notes,practice}/index.html \| wc -l` | ✅ 12 per page (AC11 PASS for lectures, plus the sibling notes/practice tests). |
| `is-current-collection` count on the original index page (backward-compat for ChapterCard) | `grep -oE 'a class="is-current-collection"' dist/client/index.html \| wc -l` | ✅ 0 — index page has 12 `chapter-card` articles but no link carries the highlight class (the inline CSS rule appears once but no element references it). T5 backward-compat preserved. |
| M3 event names in `dist/client` | `grep -roh 'cs300:read-status-changed\|cs300:toc-read-status-painted\|cs300:annotation-added\|cs300:drawer-toggle' dist/client \| sort \| uniq -c` | ✅ all 4 events present (24 / 72 / 60 / 24); T8 contracts preserved. |
| Helper extraction byte-equivalence | `git diff 4b5eb53 -- scripts/smoke-screenshots.py` | ✅ Diff shows only docstring update + import line replacement; the extracted functions (`build_driver`, `assert_preview_reachable`) moved verbatim — identical flag set, identical docstring contract. No behaviour delta. |
| Dependency-manifest churn | `git diff HEAD -- package.json package-lock.json requirements-dev.txt .nvmrc .pandoc-version` | ✅ Empty. No new dependencies. Builder's "no manifest churn" claim verified. |
| Visual smoke (4 screenshots opened) | `.smoke/screenshots/lectures-ch4-2560x1080.png`, `lectures-ch4-1280x800.png`, `lectures-ch4-1024x768.png`, `lectures-landing-2560x1080.png`, `notes-ch4-1280x800.png` | ✅ At 2560×1080: chrome centered, three-column grid intact, whitespace gutters left/right. At 1280×800: standard three-column layout. At 1024×768: rails snug to viewport edges (no centering, no margin gap); the ~15px shortfall is the scrollbar gutter. Notes/ch_4 at 1280×800: breadcrumb shows `cs-300 / Notes / ch_4 — …`, "Notes" pill highlighted in switcher, ch_4 highlighted in the LeftRail; the LeftRail chapter links resolve to notes/ paths (D3 visible). Lectures landing at 2560×1080: 12 chapter cards in Required + Optional grid, "Lectures" link on each card carries the accent treatment. |

---

## Status-surface verification

| Surface | State | Verdict |
| ------- | ----- | ------- |
| (a) per-task spec `**Status:**` line | `✅ done 2026-04-25` ([T9_layout_polish.md:3](../tasks/T9_layout_polish.md)) | ✅ flipped |
| (b) `tasks/README.md` row | `✅ done 2026-04-25` ([README:17](../tasks/README.md)) | ✅ flipped |
| (c) milestone README task table row | `✅ done 2026-04-25` ([README:44](../README.md)) | ✅ flipped |
| (d) milestone-level Status line | `✅ done 2026-04-25 (re-closed after T9 layout polish; was ✅ done 2026-04-25 after T1–T8, briefly re-opened 2026-04-25 for T9)` ([README:4](../README.md)) | ✅ re-flipped |
| (e) top-level milestones index | `✅ closed 2026-04-25 (re-closed after T9 polish)` ([../../README.md:26](../../README.md)) | ✅ re-flipped |
| (f) milestone README "Done when" bullets — bullet 10 | `[x]` checked but **text body still references "37 prerendered pages" + "+817 KB / +18.9%" stale post-T9** | ❌ **drift — see M-UX-T9-ISS-01 / HIGH** |

Five of six surfaces flipped correctly. Bullet 10's text body is the one drift.

---

## Issue log — cross-task follow-up

| ID | Severity | Status | Owner / next touch point |
| -- | -------- | ------ | ------------------------ |
| M-UX-T9-ISS-01 | 🔴 HIGH | ✅ RESOLVED 2026-04-25 (orchestrator surgical fix post-audit) | `m_ux_polish/README.md` bullet 10 updated: "40 prerendered pages (37 chapter routes + 3 collection-landing pages added in T9)" + "+873 KB / +20.2%" + harness mention + T9 issue file citation. |
| M-UX-T9-ISS-02 | 🟢 LOW | OPEN | T9 close — Builder amends `T9_layout_polish.md` AC2 row inline. |
| M-UX-T9-ISS-03 | 🟢 LOW | OPEN | future scripts/ ergonomics sweep — not blocking T9. Flag-only. |
| M-UX-T9-ISS-04 | 🟢 LOW | OPEN | future — flag-only; LeftRail's defensive `lectures` default is reachable only if mounted off a chapter route. No regression today. |

---

## Propagation status

No forward-deferrals to other tasks (T9 is the last task in M-UX; M-UX is now re-closing). Both LOW items M-UX-T9-ISS-03 and M-UX-T9-ISS-04 are flag-only / future-looking; no carry-over needed in any sibling spec.

`nice_to_have.md` §UX-2 was added by T9 itself per spec D7 — not a deferral driven by this audit.

---

## Auditor verdict

- **D1–D7:** all PASS.
- **AC1–AC14:** all PASS (AC2 with calibration note logged as LOW).
- **Functional-test harness:** works as claimed; mutation-tested; non-inferentially correct.
- **AC2 calibration:** acceptable; functionally correct; LOW spec-text amendment recommended for documentation symmetry.
- **Helper extraction:** byte-equivalent; no smoke-screenshots.py behavioural regression.
- **ChapterCard backward-compat:** clean; index page renders zero `is-current-collection` links (T5 baseline preserved).
- **M3 contracts:** preserved (4 event names, all hit counts unchanged from T8 baseline).
- **Status surfaces (a)–(e):** all flipped correctly.
- **Status surface (f):** Done-when bullet 10 has stale "37 pages" + "+817 KB" text — **HIGH M-UX-T9-ISS-01**.
- **Design-drift check:** PASS (no architectural drift, no manifest churn, no nice_to_have adoption beyond §UX-2).

**One HIGH (status-surface text drift on bullet 10) is the only blocker.** Not a code regression — a doc text refresh on the milestone README. Builder fixes inline; on re-audit this audit flips ⚠️ OPEN → ✅ PASS.

The Builder's report is **not overridden** on technical claims (build size, page count, harness pass count, M3 contract preservation, AC dispositions, helper byte-equivalence) — every numeric claim was independently verified and matched. The Builder's own self-disclosure of the AC2 calibration was honest; that finding lands as LOW, not HIGH, because the screenshot evidence supports the relaxation. The audit adds the bullet-10 status-surface drift the Builder didn't catch.

## Security review

**Reviewed on:** 2026-04-25
**Reviewer:** security-reviewer subagent (post functional-audit PASS + orchestrator surgical fix on ISS-01)
**Verdict:** SHIP — zero Critical, zero High, zero Advisory.

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | Breadcrumb href interpolation safety | CLEAN — `Breadcrumb.astro:101–106` regex `/(lectures\|notes\|practice)\/(ch_\d+)\/?$/` is a closed alternation; captures auto-escaped via Astro JSX `{...}` interpolation. No `set:html`. |
| 2 | LeftRail href interpolation safety | CLEAN — `LeftRail.astro:73` same regex; template literal `${baseUrl}/${currentCollection}/${c.id}/` resolved at SSR; auto-escaped. |
| 3 | ChapterCard `highlight` prop validation | CLEAN — typed as `Collection \| undefined` (TypeScript union of three string literals); `linkClass()` returns plain CSS class string; applied via auto-escaped `class={...}`. All callers pass string literals. |
| 4 | Landing pages — no new SSR data flow | CLEAN — three new index.astro files import only `HomeLayout`, `ChapterCard`, `chapters.json` (build-time static manifest). No `fetch`, no `getCollection`, no new `import.meta.env` access. |
| 5 | Sticky `overflow-y: auto` vs mode-gate rule | CLEAN — `overflow` on parent doesn't affect descendant `display`; global `[data-interactive-only] { display: none !important }` rule preserved with `!important`; scoped Astro styles can't override. |
| 6 | `functional-tests.py` security | CLEAN — no `subprocess`, no `eval`/`exec`; `execute_script` uses parameterized `arguments[0]` (selector NOT string-concatenated into JS source); `_selenium_helpers.py` extraction byte-equivalent on Chrome flag set. |
| 7 | `functional-tests.json` used as data only | CLEAN — `json.load()` into typed dicts; `type` field is dict key into static `_RUNNERS`; unknown types fail with `AssertionResult(False, ...)`, never execute. |
| 8 | `nice_to_have.md` §UX-2 entry | CLEAN — pure Markdown documentation; no executable content; not processed by any build pipeline. |
| 9 | No dep manifest churn | CLEAN — `git diff HEAD -- package.json package-lock.json requirements-dev.txt .nvmrc .pandoc-version` empty. |
| 10 | Production bundle isolation | CLEAN — Python tooling outside `src/`; `astro build` doesn't process `scripts/*.py`; GH Pages workflow uploads `./dist/client` only. |
| 11 | GH Pages artifact integrity | CLEAN — `output: 'static'`; `base: '/DSA/'` hardcoded literal; no env-var leakage; no local-path or loopback in workflow. |

### Advisory

None.

### Verdict

**SHIP.** Eleven checks PASS, zero advisories. T9's threat surface (5 layout fixes + functional-test harness + 3 new landing pages) is clean. New URL interpolation paths use closed-set regex captures with auto-escaped Astro JSX. The functional-test harness uses parameterized `execute_script` and structured JSON config — no shell-out, no eval. Production bundle isolation preserved.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json requirements-dev.txt .nvmrc .pandoc-version` empty; selenium 4.43.0 already pinned for the screenshot harness, T9 reused it).
