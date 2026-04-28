# T1 — Home surface: card actions, Required label, continue-reading — Audit Issues

**Source task:** [../tasks/T1_home_surface.md](../tasks/T1_home_surface.md)
**Audited on:** 2026-04-27
**Audit cycle:** 1 audited 2026-04-27 (⚠️ OPEN, 0 HIGH / 2 MEDIUM / 4 LOW); cycle 2 re-audited 2026-04-27 (✅ PASS, both MEDIUMs RESOLVED, LOWs unchanged); cycle 3 closure 2026-04-27 (Builder landed all four LOW fixes + the security advisory origin check; 0 HIGH / 0 MEDIUM / 0 LOW open; security advisory `ContinueReading.astro:136` RESOLVED, two flag-only advisories re-confirmed no-action).
**Audit scope:** full task scope (D1–D6 + AC1–AC10), status-surface lockstep,
design-drift check vs `architecture.md` §1 / ADR-0002 / `nice_to_have.md` §UX-5,
no-regression of M-UX T9 AC10 / AC11 / AC12 contracts, gate re-run from scratch
(`npm run build`, `python scripts/functional-tests.py`, `python
scripts/smoke-screenshots.py`, `chapters.json` JSON validate, doc-content greps,
localStorage end-to-end visual evidence). Cycle 2 additionally re-verified:
visual non-duplication on `index-1280x800.png` + `notes-landing-1280x800.png`,
`ch-label` selector is structural-only (no CSS rule), the new
`home-card-h3-chapter-label` regression-guard case structure, four `Done when`
parenthetical refreshes in `m_ux_review/README.md`, and F12 boundary
(no `--mux-current` / `--mux-achievement` token introduced).
**Status:** ✅ PASS (cycle 3 — all LOW + security findings closed).
Cycle 1 closed ⚠️ OPEN with 0 HIGH / 2 MEDIUM / 4 LOW; cycle 2 closed
✅ FUNCTIONALLY CLEAN with both MEDIUMs RESOLVED and 4 LOW + 1
SHIP-advisory carried as `OPEN — flag only`; cycle 3 closes the carried
LOWs + the security advisory in a single coherent change set. Cycle-3
Builder landed:

- **Harness `pre_js` hook** (enables ISS-03/04/06 fixes + the new
  javascript-URI rejection test). Optional per-test JS string runs after
  `driver.get(url)` and before assertions; preserves backwards compat
  for existing cases.
- **MUX-RV-T1-ISS-03 (LOW-1) — RESOLVED.** `home-continue-reading-empty-by-default`
  now uses `pre_js: "window.localStorage.removeItem('cs300:last-visit'); location.reload();"`.
  Order-dependence ENT.
- **MUX-RV-T1-ISS-04 (LOW-2) — RESOLVED.** `home-continue-reading-populated`
  now uses `pre_js` to seed `{path: '/DSA/lectures/ch_4/', title: 'Chapter 4', scrollY: 0, ts: Date.now()}`
  then reload. Determinism ENT.
- **MUX-RV-T1-ISS-05 (LOW-3) — RESOLVED.** Populated-test href regex
  tightened from `/DSA/(lectures|notes|practice)/ch_\d+/?$` to spec-exact
  `/DSA/lectures/ch_4/?$` (now safe because Fix-3's seed is deterministic).
- **MUX-RV-T1-ISS-06 (LOW-4) — RESOLVED.** Six new test cases mirror the
  empty + populated assertions on `/DSA/{lectures,notes,practice}/`
  (`landing-continue-reading-{empty,populated}-{lectures,notes,practice}`)
  — every landing surface now functionally asserts both states.
- **Security advisory `ContinueReading.astro:136` — RESOLVED.** Reader
  now origin-checks `entry.path` via `new URL(entry.path, location.origin).origin`
  before assigning to `link.href`. `try/catch` covers parse-throwing
  inputs (e.g. `entry.path = "::::"`). Bail returns leave the slot
  `:empty`, so the CSS collapse rule still applies. New
  `home-continue-reading-rejects-javascript-uri` test seeds a
  `javascript:alert(1)` payload and asserts the resume-link count
  is 0 — passing proves the origin check works.
- **Two other security advisories re-confirmed no-action** (per spec
  Fix 6 closing instruction):
  - `Base.astro:480-483` (`title: document.title` capture) — title
    is SSR-baked from typed Astro props at the GH Pages deploy; no
    injection surface.
  - `ContinueReading.astro:127` (unchecked `scrollY`) — reader never
    calls `window.scrollTo`, so the unread field is inert.

Cycle-3 functional-test run: **40 cases / 77 assertions all green**
(was 33 / 63 at cycle 2). 40-page build clean. 31 smoke screenshots
captured (mostly redundant for cycle 3 — no visible UX change; kept
as evidence). Auditor re-grade pending.

---

## Design-drift check

Cross-checked against `design_docs/architecture.md` (§1 page-chrome, §1.7
verification gates), `design_docs/adr/0002_ux_layer_mdn_three_column.md`, and
`design_docs/nice_to_have.md` (§UX-5 F12 boundary).

- **No new dependencies.** `git diff --stat` confirms zero touches to
  `package.json`, `package-lock.json`, `requirements*.txt`, `.nvmrc`,
  `.pandoc-version`, `pyproject.toml`. CHANGELOG entry notes
  `Dep audit: skipped --- no manifest changes`. ✅ clean.
- **architecture.md §1 amendment is accurate to the shipped implementation.**
  Line 147 of architecture.md describes the localStorage primitive with the
  exact shipped key (`cs300:last-visit`), the exact shipped schema
  (`{path, title, scrollY, ts}`), the exact shipped writer location (small
  always-loaded `<script>` in `Base.astro`, lines 455–514), the exact shipped
  reader location (`ContinueReading.astro`, line 47 `<aside data-slot=
  "continue-reading">`), the exact CSS collapse rule
  (`:empty { display: none }`, line 62 of ContinueReading.astro), and the
  M5 supersession contract. ✅ accurate.
- **Writer skip-on-landing-pages rule.** architecture.md asserts the writer is
  "skipped on the four landing surfaces, which have no chapter context." The
  shipped writer is in `Base.astro`, which is structurally never used by the
  four landing pages (they use `HomeLayout.astro`). The writer ALSO carries an
  explicit defensive regex guard at `Base.astro:473`
  (`/\/(lectures|notes|practice)\/ch_\d+\/?$/`) that returns early on any
  non-chapter path. Belt + suspenders; both layers agree. ✅ accurate.
- **F12 (`--mux-accent` semantic split) — boundary respected.** T1 introduces
  `.ch-action--primary` / `.ch-action--outline` styling that consumes existing
  `--mux-accent` / `--mux-accent-strong` / `--mux-accent-bg` tokens; no new
  `--mux-current` or `--mux-achievement` token introduced (`grep -n
  "mux-current\|mux-achievement"` returns 0 hits across `src/`). The F12
  trigger (M5 ships review-due signal) has not fired; the deferral in
  `nice_to_have.md` §UX-5 is intact. ✅ clean.
- **§UX-5 entry in `nice_to_have.md` is appropriate.** The Builder added
  `## §UX-5 — `--mux-accent` semantic split (current vs achievement)` to
  `nice_to_have.md`. This was authored at milestone breakout (per CHANGELOG)
  rather than as a T1 deliverable; it is the parking-lot record the milestone
  README's `Done when` line for F12 references. CLAUDE.md explicitly allows
  parking-lot additions when they document a deferral with an explicit
  promotion trigger. The §UX-5 entry has the trigger ("M5 ships AND introduces
  a review-due / FSRS queue surface that paints in the chrome") and a
  cost-of-promotion estimate. ✅ within convention.
- **M3 contracts preserved.** `data-interactive-only` carriers on the new
  `.ch-progress` slot follow the existing M3 T5 pattern; the ChapterCard's
  index-page-only locus is unchanged (chapter pages still render
  `data-interactive-only` carrier counts at the T9 baseline). ✅ unchanged.
- **M-UX T9 AC10 / AC11 / AC12 — preserved on a renamed selector.** T9 AC11
  tested `a.is-current-collection`; T1 renames the highlight class to
  `.ch-action--primary` and updates the three pre-existing T9 assertions
  (`landing-page-highlight-{lectures,notes,practice}`) to track the new name.
  This is selector renaming, not contract weakening — every landing-page card
  still emits one filled (highlighted) collection link and two outline links;
  visible smoke screenshots at `.smoke/screenshots/lectures-landing-1280x800.png`
  + `notes-landing-1280x800.png` confirm the highlighted collection on each
  card matches the page's collection. ✅ spirit preserved.

**No drift detected.** Audit proceeds.

---

## AC grading

| AC  | Finding | Status | Notes |
| --- | ------- | ------ | ----- |
| AC1 | F1 | ✅ PASS | `home-card-action-classes` test passes 3/3: 12 cards, 12 `.ch-action--primary`, 24 `.ch-action--outline`. Visual evidence: `.smoke/screenshots/index-1280x800.png` shows filled "Lectures" + outline "Notes"/"Practice" on every card. Default-primary on the index page is `lectures` per `ChapterCard.astro:94` (`const primary = highlight ?? 'lectures'`); the three landing pages override via `highlight=` prop and the screenshots confirm the override (notes-landing shows Notes filled). |
| AC2 | F1 | ✅ PASS | `home-card-progress-carrier` test passes 2/2: 12 `[data-slot="ch-progress"]` carriers, all carry `data-interactive-only` + `data-chapter-id`. SSR shape is `0% fill bar` + "0 / 0 sections" label per `ChapterCard.astro:127–137`. The label literal is `"0 / 0 sections"` (not `"0 / N sections"` per spec wording — in static mode the section count isn't reachable, so 0/0 is the structural floor). Carrier is hidden in static mode via the global `data-interactive-only` rule (verified at runtime via screenshot — no progress bar visible on any card in static mode). |
| AC3 | F1 | ✅ PASS (cycle 2) | `home-card-subtitle-blurb` passes 4/4 (12 cards each have `p.ch-subtitle`; ch_1 / ch_4 / ch_10 spot-check assertions match the per-chapter blurb). Cycle-2 fix: H3 visible text reverted to `Chapter ${n}` via `<span class="ch-label">`; visible blurb appears only on the `.ch-subtitle` line below. New `home-card-h3-chapter-label` case (count = 12 + anchored `^Chapter \d+$` text-pattern with `all: true`) regression-guards the H3 ≠ subtitle invariant. Visual non-duplication confirmed on `.smoke/screenshots/index-1280x800.png` + `notes-landing-1280x800.png` (re-captured this cycle) — ch_1 H3 reads "Chapter 1", line below reads "Programming basics, arrays, and vectors"; same pattern on every card on every landing surface. F1's "clarify the card's three jobs" intent is now intact. |
| AC4 | F2 | ✅ PASS | `home-required-heading` + `landing-required-heading-{lectures,notes,practice}` all pass. Required-group + Optional-group headings on all four landing surfaces are `<h2>` elements (verified by `count` + `text-pattern` `^Required$` / `^Optional$`). Visual evidence: section headers in screenshots read at body-weight 1.5rem; tracked uppercase 12px treatment is gone. ✅ |
| AC5 | F2 | ✅ PASS | `home-required-subtitle` test passes 1/1: Required-group subtitle on `/DSA/` matches `/graded chapters/`. Visible text: "6 graded chapters, ~25 hours of reading." Replaces the prior tautological "SNHU CS 300 syllabus." per spec D2. The Optional-group subtitle "Depth chapters; outside the graded path." is preserved at body weight; not separately asserted but visible in `.smoke/screenshots/index-1280x800.png`. ✅ |
| AC6 | F3 | ✅ PASS | `home-continue-reading-empty-by-default` passes 2/2: `<aside data-slot="continue-reading">` renders exactly once on `/DSA/`, and `a.resume-link` count is 0 (no resume link populated when localStorage is empty). The harness uses an isolated `/tmp/cs300-functest-<pid>` user-data-dir per CLI run, so localStorage is empty at suite start; the first test asserts the empty state before any chapter route has had a chance to seed. CSS rule `aside[data-slot="continue-reading"]:empty { display: none }` at `ContinueReading.astro:62–64` collapses the slot to zero visual space when empty. ✅ |
| AC7 | F3 | ✅ PASS at the assertion level (with caveats) | `home-continue-reading-populated` test passes 2/2 at suite-end: the resume card's `<a>` count is 1 and the href matches `/DSA/(lectures|notes|practice)/ch_\d+/?$`. **Caveat 1 (LOW-2):** the test is order-dependent — it relies on prior chapter-route tests in the same Selenium session having seeded localStorage via the writer in `Base.astro`. The spec wording (`Uses Selenium's driver.get to seed localStorage, then navigates`) is satisfied by the implicit prior `driver.get` calls, but the dependency is not explicit in the config. **Caveat 2 (LOW-3):** the regex is permissive (`(lectures|notes|practice)/ch_\d+`) where the spec example is specifically "links back to `/DSA/lectures/ch_4/`"; precision could be tightened. Manual smoke confirms the round-trip works as described — `.smoke/screenshots/index-1280x800-populated.png` shows the resume strip with eyebrow "Resume from where you left off" + a chapter link, populated from a prior chapter visit. |
| AC8 | F1, F2, F3 | ✅ PASS | T9 AC10: `landing-page-{lectures,notes,practice}-renders` all pass — every landing surface still emits `<article class="chapter-card"> × 12`. T9 AC11: `landing-page-highlight-{lectures,notes,practice}` pass 2/2 each — every card on each landing page emits one `.ch-action--primary` whose href matches the page's collection (12/12 per page). The class name change from `.is-current-collection` → `.ch-action--primary` is documented inline at `ChapterCard.astro:322–331`; the spirit of T9 AC11 ("highlight class still on the right collection link") is preserved. T9 AC12: `npm run build` produces 40 prerendered pages (verified — 36 chapter routes + 3 landing pages + 1 index). ✅ |
| AC9 | architecture | ✅ PASS | `grep -n "cs300:last-visit\|localStorage" design_docs/architecture.md` returns hit at line 147. Paragraph names `cs300:last-visit`, the schema, the writer + reader locations, the M5 supersession contract, and the strict browser-locality. ✅ |
| AC10 | F1 | ✅ PASS | JSON validate via `python3 -c "json.load + len(subtitle) <= 80"` confirms 12/12 chapter ids carry a `subtitle` string, all ≤80 characters (longest = 39, ch_1's "Programming basics, arrays, and vectors"). Builder's deviation note is correct: the field already existed from M-UX T2; D5 was a no-op. ✅ |

**Summary (cycle 2):** all 10 ACs satisfied at both the literal-assertion level and the visible-UX level. The cycle-1 AC3 caveat (visible blurb duplication) is resolved by the Option A H3 revert + new `home-card-h3-chapter-label` regression guard. All 33 functional-test cases pass (63/63 assertions); 40-page build is clean; status surfaces are in lockstep.

---

## 🔴 HIGH

None.

---

## 🟡 MEDIUM

### MEDIUM-1 — Chapter blurb renders twice on every card (visible UX regression) — **RESOLVED (cycle 2 — Option A)**

**Resolution (cycle 2, 2026-04-27).** H3 visible text reverted to `Chapter ${n}` (consuming the manifest `n` field directly per spec D1 example pattern); `.ch-subtitle` keeps the per-chapter blurb. The visible "Chapter N" is wrapped in a `<span class="ch-label">` so the regression-guard assertion can target the visible-only chunk (Selenium's `WebElement.text` includes `position:absolute; clip:rect(0,0,0,0)` "visually-hidden" content in its return value, so without the inner span the assertion would see "Chapter N\n— <blurb>" and fail; the dedicated span sidesteps the harness limitation cleanly). The visually-hidden em-dash join in the H3 still reads `Chapter N — <blurb>` for screen readers (slight SR enhancement over cycle-1 since SR users still hear the topic alongside the chapter label). New functional-test case `home-card-h3-chapter-label` regression-guards the H3 ≠ subtitle invariant with two assertions: count = 12 `article.chapter-card h3.chapter-card-title span.ch-label` carriers + every `span.ch-label` text matches `^Chapter \d+$` (anchored — no per-chapter blurb can match it, so the case will fail-fast if the duplication ever returns). Suite count rises from 32 cases / 61 assertions → 33 cases / 63 assertions.


**What.** Every chapter card now displays the same blurb text twice: once as the `<h3 class="chapter-card-title">` visible text (because the pre-existing T5 card uses `subtitle` as the H3 visible text per `ChapterCard.astro:103–105`), and once again in the new `<p class="ch-subtitle">` line per spec D1. Visible on `.smoke/screenshots/index-1280x800.png` for every Required + Optional card — e.g. "Programming basics, arrays, and vectors" prints as both H3 and subtitle on ch_1.

**Why this matters.** F1's intent per the spec is to *clarify* the card's three jobs and add a per-chapter blurb that reads like a real subtitle. The pre-existing card already had the blurb in H3; T1's `.ch-subtitle` addition created tautology, not orientation. The spec D1 example wording (`<p class="ch-subtitle">Chapter 4</p>`) shows the *original* `.ch-subtitle` carried "Chapter N" — which is what would still make sense if the H3 carries the blurb.

**Why the literal AC3 still passes.** The functional-test harness only asserts that `.ch-subtitle` text matches the per-chapter blurb regex. It does not assert that the H3 text differs. The spec wording (D1: "replace with the chapter blurb from chapters.json") is what the Builder followed. This is partly a spec defect, not a Builder execution error — the Builder's deviation note in their report explicitly flagged this read.

**Action / Recommendation.** One of two surgical changes in `src/components/chrome/ChapterCard.astro`. **Option A** (minimal): revert the visible H3 text to "Chapter N" (consume `title` field, drop the `<span class="visually-hidden">{title} — </span>{subtitle}` markup), keep `.ch-subtitle` as the blurb. Result: H3 reads "Chapter 1" / `.ch-subtitle` reads "Programming basics, arrays, and vectors" — matches the spec D1 example pattern exactly. **Option B** (chapters.json gets a new field): add a separate `topic_oneliner` field to `chapters.json` distinct from `subtitle`; H3 keeps the blurb, `.ch-subtitle` carries the new field. Adds a chapters.json migration; more invasive. **User should pick A or B before Builder fixes** — present both, pick one. AC3 should also gain an assertion that H3 text ≠ `.ch-subtitle` text on every card so the regression doesn't return.

### MEDIUM-2 — `Done when` checkbox citation parentheticals are stale ("T1 issue file — to be created at first audit") — **RESOLVED (cycle 2)**

**Resolution (cycle 2, 2026-04-27).** All four bullets in `design_docs/milestones/m_ux_review/README.md` (F1 line 32, F2 line 33, F3 line 34, no-regression line 44) updated. The "to be created at first audit; see tasks/T1_home_surface.md acceptance checks AC…" placeholders now read simply `(T1 issue file — AC…)` matching the M-UX precedent (e.g. `m_ux_polish/README.md` line 32-onward). The no-regression bullet's case/assertion count was bumped to 33 cases / 63 assertions to match the post-cycle-2 functional-test run (one new T1 case `home-card-h3-chapter-label` with two new assertions: count of 12 `span.ch-label` carriers + anchored text-pattern guard).


**What.** `design_docs/milestones/m_ux_review/README.md` lines 32, 33, 34, 44 cite `(T1 issue file — to be created at first audit; see tasks/T1_home_surface.md acceptance checks AC1–AC3)` etc. This audit creates `T1_issue.md`; the citations should now point at the now-existing file.

**Why this matters.** CLAUDE.md status-surface non-negotiable says citations should "point at the per-task issue file." The placeholder is intelligible at task-open time but becomes stale once the audit lands. M-UX milestone README precedent (e.g. line 32-onward of `m_ux_polish/README.md`) cites simply `(T1 issue file)` once the file exists.

**Action / Recommendation.** Builder updates the four `Done when` bullets in `design_docs/milestones/m_ux_review/README.md` to drop the "to be created at first audit" placeholder and cite simply `(T1 issue file)` matching the M-UX precedent. Bullets affected: F1 (line 32), F2 (line 33), F3 (line 34), no-regression-of-M-UX-contracts (line 44). One-line edits each.

---

## 🟢 LOW

### LOW-1 — `home-continue-reading-empty-by-default` is silently order-dependent — **RESOLVED (cycle 3)**

**Resolution (cycle 3, 2026-04-27).** Cycle-3 Builder added a per-test `pre_js` hook to `scripts/functional-tests.py` (optional string run after `driver.get(url)` and before any assertion evaluates) and updated the case in `scripts/functional-tests.json` to use `"pre_js": "window.localStorage.removeItem('cs300:last-visit'); location.reload();"`. The empty-state expectation is now deterministic regardless of suite position. Order-dependence ENT. Verified by cycle-3 functional-test run: 40/40 cases / 77/77 assertions all green.

**What.** The empty-by-default test at the top of `scripts/functional-tests.json` works because Selenium starts with a fresh `/tmp/cs300-functest-<pid>` user-data-dir (no prior localStorage). If a future config edit moved this test later in the suite — after any chapter route has been visited — the test would silently fail because localStorage would already be seeded.

**Why this is LOW.** Today the test is the very first case in the config; the dependency on test ordering is implicit but stable. The cost of a future ordering change is bounded (a clear failure with a diagnostic from the harness).

**Action / Recommendation.** Builder optionally adds a comment to the config (the JSON allows leading-line `//` comments? — actually no, JSON is strict). Alternative: add a JS pre-step (`localStorage.clear()`) to the test case. The functional-test harness doesn't currently support pre-step JS; adding it is out of scope for T1. Tracked here as a flag-only note for future hardening; defer until the harness gains a pre-step hook (deferred work item, not assigned to a target task).

### LOW-2 — `home-continue-reading-populated` is order-dependent on prior chapter-route tests — **RESOLVED (cycle 3)**

**Resolution (cycle 3, 2026-04-27).** Cycle-3 Builder updated the case in `scripts/functional-tests.json` to use `"pre_js": "window.localStorage.setItem('cs300:last-visit', JSON.stringify({path: '/DSA/lectures/ch_4/', title: 'Chapter 4', scrollY: 0, ts: Date.now()})); location.reload();"`. The populated state is now seeded deterministically — no longer relies on prior chapter-route tests' side effects firing `Base.astro`'s writer. Verified by cycle-3 functional-test run.

**What.** The populated test at the bottom of `scripts/functional-tests.json` works because the 26 prior tests collectively visit at least one chapter route, which fires `Base.astro`'s writer and seeds `localStorage["cs300:last-visit"]`. If the config were re-ordered to run all `/DSA/` tests first, the populated test would silently fail.

**Why this is LOW.** Same as LOW-1 — bounded blast radius, deterministic in current config.

**Action / Recommendation.** Same recommendation as LOW-1 — track for the future harness pre-step support; no T1 fix required.

### LOW-3 — `home-continue-reading-populated` regex is broader than the spec example — **RESOLVED (cycle 3)**

**Resolution (cycle 3, 2026-04-27).** Now that LOW-2's resolution makes the seed deterministic via `pre_js`, the regex's robustness rationale is moot — the seed is exactly `/DSA/lectures/ch_4/`. Cycle-3 Builder tightened the populated-test href regex from the broad `/DSA/(lectures|notes|practice)/ch_\d+/?$` to the spec-example-exact `/DSA/lectures/ch_4/?$`. Same tightening applied to the three new mirror cases on the landing pages. Verified by cycle-3 functional-test run.

**What.** Spec example AC7: "After visiting `/DSA/lectures/ch_4/` then loading `/`, the resume card links back to `/DSA/lectures/ch_4/`." The shipped assertion uses a regex `/DSA/(lectures|notes|practice)/ch_\d+/?$` that accepts any chapter route, not specifically `lectures/ch_4/`.

**Why this is LOW.** The shipped regex still verifies the spirit ("links back to a previously visited chapter route") and can't pass with empty localStorage. The narrow form would be brittle to test-ordering: whichever chapter is visited last seeds the entry. The current relaxed form is actually more robust.

**Action / Recommendation.** Accept as-is. Document the relaxation in the test config inline if a future Builder questions it.

### LOW-4 — Continue-reading empty/populated only tested at `/DSA/`, not the three landing pages — **RESOLVED (cycle 3)**

**Resolution (cycle 3, 2026-04-27).** Cycle-3 Builder added six new functional-test cases mirroring the empty + populated pair on each of the three landing surfaces:

- `landing-continue-reading-empty-lectures` (`/DSA/lectures/`, `pre_js: removeItem`)
- `landing-continue-reading-populated-lectures` (`/DSA/lectures/`, `pre_js: setItem ch_4 + reload`)
- `landing-continue-reading-empty-notes` (`/DSA/notes/`, `pre_js: removeItem`)
- `landing-continue-reading-populated-notes` (`/DSA/notes/`, `pre_js: setItem ch_4 + reload`)
- `landing-continue-reading-empty-practice` (`/DSA/practice/`, `pre_js: removeItem`)
- `landing-continue-reading-populated-practice` (`/DSA/practice/`, `pre_js: setItem ch_4 + reload`)

Each empty case asserts `count` of `aside[data-slot="continue-reading"]` is 1 + `count` of `a.resume-link` is 0. Each populated case asserts `count` of `a.resume-link` is 1 + `href-pattern` matches `/DSA/lectures/ch_4/?$`. All six pass at cycle-3 close. Spec D3 (`<ContinueReading />` mounted on all four landing surfaces) now has functional-test coverage on all four — not just structural inference.

**What.** AC6 + AC7 cover the index page only. The spec D3 says "Wiring on the four landing surfaces" — `<ContinueReading />` mounts on `index`, `lectures/index`, `notes/index`, `practice/index`. Only `index` is functionally asserted.

**Why this is LOW.** The component is the same on all four surfaces, sourced from the same file; structurally inferable that what passes on `/DSA/` passes on `/DSA/lectures/`. The spec's AC6/AC7 are scoped to `/`, so this is per-spec.

**Action / Recommendation.** Optional follow-up: extend the harness with three more cases at `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` mirroring the index assertions. Defer; not blocking.

---

## Additions beyond spec — audited and justified

- **`is:global` style block in `ContinueReading.astro` (line 49–100).** Necessary because the inline `<script>` appends `<span>` + `<a>` elements that have no Astro scoping attribute; scoped styles wouldn't match. Selectors are well-namespaced (`aside[data-slot="continue-reading"] …`). Justified.
- **`<style>` block scoped class doublings (`.ch-subtitle, .chapter-card-subtitle` and `.ch-group, .chapter-group`).** Backwards-compat aliases so any cycle-1 selector still finds the styled element. Documented inline at the rule sites. Justified — small CSS cost, explicit alias intent.
- **`is-current-collection` documentation comment in `ChapterCard.astro:322–331`.** Comment-only; the class is no longer emitted. Documents the migration to `.ch-action--primary` for any future maintainer searching for the old name. Justified.
- **`.ch-action--outline:hover` adds `background: var(--mux-accent-bg)`.** Spec called for filled-primary + transparent-outline; the hover state on the outline variant adds a subtle accent-bg fill. Reasonable hover feedback affordance. Justified.
- **`<aside aria-label="Continue reading">` on the resume strip (`ContinueReading.astro:47`).** Accessibility nicety beyond spec. Justified.
- **Defensive regex guard in the writer (`Base.astro:473`).** Belt-and-suspenders against a future Base.astro consumer that's not a chapter route; spec said "skips writes on the index + the three collection-landing pages" structurally (Base.astro never used there). Belt-and-suspenders is fine. Justified.

---

## Verification summary

Gates re-run from scratch in this audit (not relied on the Builder's reported counts).

| Gate | Command | Result | Evidence |
| --- | --- | --- | --- |
| Build | `npm run build` | ✅ exit 0, **40 prerendered pages** (cycle-2 re-run: 36 chapter routes + 3 landing + 1 index) | shell output cited in audit transcript |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ exit 0, **33/33 cases / 63/63 assertions** (cycle-2 re-run; +1 case `home-card-h3-chapter-label`, +2 assertions vs cycle 1; Builder claim verified verbatim) | shell output cited in audit transcript |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321 --output .smoke/screenshots/` | ✅ 31 screenshots, **3,140,412 bytes** (cycle-2 re-run; matches Builder claim verbatim) | `.smoke/screenshots/{index,lectures-landing,notes-landing}-1280x800.png` opened by Auditor — F1 + F2 + F3 visible AND cycle-2 H3 fix visually confirmed (H3 reads "Chapter N", line below reads the per-chapter blurb, no duplication on any card on any landing surface) |
| JSON validate | `python3 -c "json.load(open('scripts/chapters.json')); …"` | ✅ 12/12 entries with `subtitle`; max length 39 chars (≤80) | inline output |
| Doc-content grep AC9 | `grep -n "cs300:last-visit\|localStorage" design_docs/architecture.md` | ✅ hit at line 147 with both terms in the same paragraph | inline output |
| localStorage manual smoke | (covered by `home-continue-reading-empty-by-default` + `home-continue-reading-populated` + `index-1280x800-populated.png` visual evidence) | ✅ writer fires on `/DSA/lectures/ch_4/`, reader populates on `/DSA/`, `:empty` collapse hides the slot when localStorage is cleared | screenshots cited above |
| Dependency manifest delta | `git diff --stat HEAD` against `package.json` / `requirements*.txt` / `.nvmrc` / `.pandoc-version` | ✅ none touched (CHANGELOG `Dep audit: skipped --- no manifest changes`) | inline output |

**Status-surface lockstep.** All four surfaces flipped:

- (a) Per-task spec `T1_home_surface.md:3` — `**Status:** ✅ done 2026-04-27` ✅
- (b) `tasks/README.md` T1 row — `✅ done 2026-04-27` ✅
- (c) Milestone README task table T1 row — `✅ done 2026-04-27` ✅
- (d) Milestone README `Done when` checkboxes for F1 / F2 / F3 / no-regression — all flipped to `[x]` ✅
- (e) Top-level `design_docs/milestones/README.md` row — `active (T1 closed 2026-04-27; T2–T6 outstanding)` ✅

**Status-surface caveat (cycle 2 — RESOLVED).** The four `Done when` parentheticals
(`m_ux_review/README.md` lines 32 / 33 / 34 / 44) were refreshed in cycle 2 to
read `(T1 issue file — AC…)` per the M-UX precedent. The cycle-1 phrase
"to be created at first audit" no longer appears anywhere in the milestone
README (`grep -n "to be created at first audit" m_ux_review/README.md`
returns 0 hits). The no-regression bullet's case/assertion count was bumped
from cycle-1's `32 cases / 61 assertions` to `33 cases / 63 assertions`,
matching the cycle-2 functional-test run. ✅

**Cycle-1 pre-flip caveat (cycle 2 — RESOLVED).** Cycle 1 noted the Builder had
pre-flipped status surfaces before audit pass and recommended un-ticking F1's
`[x]` → `[ ]` while MEDIUM-1 was open. Cycle-2 audit lands ✅ PASS, so the
pre-flip is now retroactively justified — all five surfaces (per-task spec,
tasks/README, milestone README task table, milestone README `Done when`,
top-level milestones index) align with the audit verdict.

---

## Issue log — cross-task follow-up

| ID | Severity | Status | Owner / Next touch | One-line action |
| --- | --- | --- | --- | --- |
| MUX-RV-T1-ISS-01 | MEDIUM | RESOLVED — cycle 2 | T1 Builder cycle 2 | Resolve chapter-blurb duplication on every card (Option A: H3 → "Chapter N", `.ch-subtitle` keeps blurb; Option B: new `topic_oneliner` field in chapters.json). User picked A; H3 reverted to `Chapter ${n}`; new `home-card-h3-chapter-label` assertion guards the H3 ≠ subtitle invariant. |
| MUX-RV-T1-ISS-02 | MEDIUM | RESOLVED — cycle 2 | T1 Builder cycle 2 | Update milestone-README `Done when` parentheticals from `T1 issue file — to be created at first audit` to simply `(T1 issue file — AC…)` on F1 / F2 / F3 / no-regression bullets. Done; no-regression bullet's case/assertion count refreshed to 33 cases / 63 assertions (verified by cycle-2 audit re-run). |
| MUX-RV-T1-ISS-03 | LOW | RESOLVED — cycle 3 | T1 Builder cycle 3 | `home-continue-reading-empty-by-default` was silently order-dependent on running first. Cycle 3 added a `pre_js` hook to `scripts/functional-tests.py` and updated the case to `pre_js: "window.localStorage.removeItem('cs300:last-visit'); location.reload();"` — order-dependence ENT. |
| MUX-RV-T1-ISS-04 | LOW | RESOLVED — cycle 3 | T1 Builder cycle 3 | `home-continue-reading-populated` was order-dependent on prior chapter-route tests seeding localStorage. Cycle 3 updated the case to `pre_js: setItem({path: '/DSA/lectures/ch_4/', ...}); location.reload();` — determinism ENT. |
| MUX-RV-T1-ISS-05 | LOW | RESOLVED — cycle 3 | T1 Builder cycle 3 | Populated-test regex `/DSA/(lectures\|notes\|practice)/ch_\d+/?$` was broader than spec example `/DSA/lectures/ch_4/`. With ISS-04 making the seed deterministic, cycle 3 tightened the regex to spec-exact `/DSA/lectures/ch_4/?$`. Same tightening applied to the three new populated-mirror cases on landing pages. |
| MUX-RV-T1-ISS-06 | LOW | RESOLVED — cycle 3 | T1 Builder cycle 3 | AC6 + AC7 only asserted against `/DSA/`. Spec D3 mounts `<ContinueReading />` on all four landing surfaces. Cycle 3 added six mirror cases (empty + populated × 3 landing pages) — every landing surface now has functional-test coverage on both empty and populated states. |
| MUX-RV-T1-SEC-01 | ADVISORY | RESOLVED — cycle 3 | T1 Builder cycle 3 | `ContinueReading.astro:136` assigned unvalidated `entry.path` to `link.href`, allowing a stored-DOM-injection via a self-authored `javascript:` localStorage entry. Cycle 3 added an origin check (`new URL(entry.path, location.origin).origin !== location.origin` → return) wrapped in `try/catch` for parse-throwing inputs. New `home-continue-reading-rejects-javascript-uri` test seeds `javascript:alert(1)` and asserts `a.resume-link` count is 0; passes. |

---

## Deferred to nice_to_have

None. F12 is already deferred via the existing `nice_to_have.md` §UX-5 entry the Builder added at milestone breakout; T1 audit findings do not surface anything that maps to a new parking-lot item. None of the LOW findings have a `nice_to_have.md` home.

---

## Propagation status

No findings forward-deferred to a future task. All MEDIUM + LOW findings are owned by T1's own re-audit cycle 2 (MEDIUMs) or by future harness work without an explicit owning task (LOWs). No carry-over sections appended to T2/T3/T4/T5/T6 specs in this audit.

---

## Auditor's verdict

### Cycle 1 (2026-04-27) — ⚠️ OPEN, not BLOCKED

All 10 ACs pass at the literal-assertion level, all 32 functional-test cases pass, build is clean at 40 pages, architecture.md amendment is accurate, status-surfaces are flipped, M-UX T9 contracts are preserved on a renamed selector, and the F12 boundary is respected. The only blocking-quality issues are MEDIUM-1 (visible duplication of chapter blurb undermines F1's intent — needs Option A or B + user pick) and MEDIUM-2 (stale `Done when` parentheticals — one-line edits). Four LOW findings are flag-only and do not block. After Builder cycle 2 lands MEDIUM-1 + MEDIUM-2 fixes, this issue file flips to ✅ PASS.

### Cycle 2 (2026-04-27) — ✅ PASS

Both MEDIUMs RESOLVED and verified non-inferentially:

- **MUX-RV-T1-ISS-01** — `ChapterCard.astro` H3 visible text now reads `Chapter ${n}` via `<span class="ch-label">` (structural-only — `grep -rn "ch-label" src/` returns one markup hit + zero CSS rules), with the visually-hidden em-dash join preserving `Chapter N — <blurb>` for screen readers. New functional-test case `home-card-h3-chapter-label` regression-guards with two assertions: count=12 of `article.chapter-card h3.chapter-card-title span.ch-label` + anchored `^Chapter \d+$` text-pattern with `all: true`. Visually re-verified on `.smoke/screenshots/index-1280x800.png` and `.smoke/screenshots/notes-landing-1280x800.png` — every card on every landing surface now shows `Chapter N` in the H3 + the per-chapter blurb in `.ch-subtitle`, no duplication.
- **MUX-RV-T1-ISS-02** — `m_ux_review/README.md` lines 32 / 33 / 34 / 44 updated; `grep -n "to be created at first audit" m_ux_review/README.md` returns zero hits. The no-regression bullet's `33 cases / 63 assertions` figure matches the cycle-2 audit re-run exactly.

Cycle-2 gates re-run from scratch (not relied on Builder's reported counts): `npm run build` exit 0 / 40 pages; `python scripts/functional-tests.py` exit 0 / 33 cases / 63 assertions all green; smoke-screenshots 31 files / 3,140,412 bytes; `chapters.json` validates 12/12 with `subtitle` length range 11–39 chars (≤80); architecture.md grep at line 147 hits both `cs300:last-visit` + `localStorage`; `git diff --stat` against dependency manifests shows zero touches; F12 boundary clean (zero `--mux-current` / `--mux-achievement` token hits in `src/`); status surfaces in lockstep across all five surfaces. The four LOW findings remain `OPEN — flag only` per the cycle-1 recommendation; none block close.

**Verdict: ✅ FUNCTIONALLY CLEAN.** Controller proceeds to security gate.

### Cycle 3 (2026-04-27) — ✅ PASS (FUNCTIONALLY CLEAN — all carry-over closed)

User authorised cycle-3 scope expansion to close all four LOW findings + the SHIP-advisory origin check in a single coherent change set. Cycle-3 Builder landed all six fixes:

- **Fix 1 — Harness `pre_js` hook.** `scripts/functional-tests.py` gains an optional per-test `pre_js: string` field. When present, the runner calls `driver.execute_script(pre_js)` after `driver.get(url)` and `readyState === 'complete'`, then re-waits for `readyState === 'complete'` to handle pre_js scripts that call `location.reload()` (the canonical pattern for seeding localStorage and re-firing the inline reader). Cases without `pre_js` keep working unchanged. Module docstring + load-time validator updated. Dataclass gains `pre_js: str | None = None`.
- **Fix 2 — MUX-RV-T1-ISS-03 (LOW-1).** `home-continue-reading-empty-by-default` now uses `pre_js: "window.localStorage.removeItem('cs300:last-visit'); location.reload();"`. Order-dependence ENT.
- **Fix 3 — MUX-RV-T1-ISS-04 (LOW-2).** `home-continue-reading-populated` now uses `pre_js: "window.localStorage.setItem('cs300:last-visit', JSON.stringify({path: '/DSA/lectures/ch_4/', title: 'Chapter 4', scrollY: 0, ts: Date.now()})); location.reload();"`. Determinism ENT.
- **Fix 4 — MUX-RV-T1-ISS-05 (LOW-3).** Populated-test href regex tightened from `/DSA/(lectures|notes|practice)/ch_\d+/?$` to spec-exact `/DSA/lectures/ch_4/?$`. Same tightening applied to the three new mirror cases.
- **Fix 5 — MUX-RV-T1-ISS-06 (LOW-4).** Six new cases mirror the empty + populated assertions on `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/`. Each empty case clears localStorage via `pre_js: removeItem + reload`; each populated case seeds the same `ch_4` entry via `pre_js: setItem + reload`. All six pass.
- **Fix 6 — Security advisory `ContinueReading.astro:136`.** Origin check added before `link.href = entry.path`: `try { if (new URL(entry.path, location.origin).origin !== location.origin) return; } catch (_err) { return; }`. New `home-continue-reading-rejects-javascript-uri` test seeds `{path: 'javascript:alert(1)', ...}` and asserts `a.resume-link` count is 0; passes (origin check rejects the entry, slot stays `:empty`, CSS rule collapses it). The other two cycle-2 advisories (`Base.astro:480-483`, `ContinueReading.astro:127`) confirmed no-action — flag-only.

Cycle-3 gates run by the Builder:

- `npm run build` — exit 0, **40 prerendered pages** (matches cycle 2).
- `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — exit 0, **40/40 cases / 77/77 assertions** all green (was 33 / 63 at cycle 2; +7 cases, +14 assertions for cycle 3: 6 mirror cases × 2 assertions each + 1 javascript-URI case × 2 assertions).
- `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321 --output .smoke/screenshots/` — 31 screenshots / 3,140,412 bytes (matches cycle 2 — no visible UX change in cycle 3).
- Manual `javascript:` smoke covered by the new `home-continue-reading-rejects-javascript-uri` functional case (passes — no resume link rendered, slot collapsed).

**Builder verdict: closure handed to Auditor for re-grade.** All four LOW findings + the security advisory marked RESOLVED in the issue log; both flag-only advisories re-confirmed no-action. No commits made — Builder hands back per the protocol.

**Auditor cycle-3 re-grade (2026-04-27).** Gates re-run from scratch, not relying on the Builder's reported counts:

- `npm run build` — exit 0, **40 prerendered pages** (counted via `npm run build 2>&1 | grep -c "index.html"` → 40). ✅
- `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` — exit 0, **40/40 cases / 77/77 assertions** all green in 18.9 s. Builder's claimed counts match verbatim. ✅
- `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321 --output .smoke/screenshots/` — captured **31 screenshots / 3,140,412 bytes** (matches Builder verbatim; the directory itself accumulates older PNGs from prior cycles, so its on-disk file count is higher — only the just-captured 31 are this cycle's evidence). ✅
- `git diff --stat HEAD -- package.json package-lock.json requirements*.txt .nvmrc .pandoc-version pyproject.toml` — zero output (no manifest touches). Dep audit: skipped per CLAUDE.md. ✅
- `python3 -c "json.load(open('scripts/chapters.json')); …"` — 12/12 entries with `subtitle` length 11–39 chars (≤80). ✅
- `grep -n "cs300:last-visit\|localStorage" design_docs/architecture.md` — line 147 hits both terms in the same paragraph (writer + reader + schema + M5 supersession). ✅
- `grep -rn "mux-current\|mux-achievement" src/` — zero hits (F12 boundary respected). ✅
- `grep -n "to be created at first audit" design_docs/milestones/m_ux_review/README.md` — zero hits (cycle-2 cleanup persists). ✅

Cycle-3 carry-over verification (each item re-audited non-inferentially, not status-flipped on Builder's word):

- **MUX-RV-T1-ISS-03 (LOW-1) — RESOLVED, verified.** `scripts/functional-tests.json:6` carries `"pre_js": "window.localStorage.removeItem('cs300:last-visit'); location.reload();"` on the empty case. Harness call site at `scripts/functional-tests.py:493–503` runs `pre_js` AFTER `driver.get(url)` reaches `readyState=='complete'` and BEFORE the assertion loop, with a re-wait for `readyState=='complete'` to cover `location.reload()` callers. The empty case is now order-independent — would pass at any position in the suite.
- **MUX-RV-T1-ISS-04 (LOW-2) — RESOLVED, verified.** `scripts/functional-tests.json:587` carries the deterministic seed `setItem('cs300:last-visit', JSON.stringify({path: '/DSA/lectures/ch_4/', title: 'Chapter 4', scrollY: 0, ts: Date.now()})); location.reload();`. Determinism ENT.
- **MUX-RV-T1-ISS-05 (LOW-3) — RESOLVED, verified.** `scripts/functional-tests.json:597` href-pattern is now `/DSA/lectures/ch_4/?$` (spec-exact). The three new populated mirror cases on `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/` each carry the same tightened regex (lines 633, 669, 705). The over-broad `(lectures|notes|practice)` alternation is gone from every populated case.
- **MUX-RV-T1-ISS-06 (LOW-4) — RESOLVED, verified.** Six new cases land at lines 602–708 with the expected URL × state matrix: `landing-continue-reading-empty-{lectures,notes,practice}` (each asserts `aside` count 1 + `a.resume-link` count 0 with `pre_js: removeItem + reload`); `landing-continue-reading-populated-{lectures,notes,practice}` (each asserts `a.resume-link` count 1 + spec-exact href regex with `pre_js: setItem({path:'/DSA/lectures/ch_4/', ...}) + reload`). Selectors + assertion shapes mirror the index-page versions exactly. All six pass.
- **MUX-RV-T1-SEC-01 (security advisory) — RESOLVED, verified non-inferentially.** `src/components/home/ContinueReading.astro:139–143` adds the origin check INSIDE a `try/catch`, BEFORE the `link.href = entry.path` assignment at line 152: `try { if (new URL(entry.path, location.origin).origin !== location.origin) return; } catch (_err) { return; }`. The check correctly rejects `javascript:` URIs because `new URL('javascript:alert(1)', location.origin).origin` resolves to `'null'` per WHATWG URL spec, which is `!== location.origin`. The `try/catch` covers parse-throwing inputs. Bail returns happen before any `appendChild` — slot stays `:empty`, CSS rule collapses it. The new `home-continue-reading-rejects-javascript-uri` test at `scripts/functional-tests.json:710–725` is a true regression guard: without the origin check, Chrome would create the anchor with the malicious `href` and the `count` of `a.resume-link` would be 1, failing the assertion. Selenium does NOT auto-fire `javascript:` hrefs (no user interaction), so the test design is sound — count-0 is the trigger, not an alert. Verified pass at cycle-3 functional-test run. The two flag-only cycle-2 advisories (`Base.astro:480-483`, `ContinueReading.astro:127`) re-confirmed no-action — both unchanged + still inert per their original rationale.

**Status surfaces.** All five surfaces in lockstep, unchanged from cycle 2 except for the no-regression bullet's case/assertion count which the cycle-3 Builder bumped to `40 cases / 77 assertions` (verified at `m_ux_review/README.md:44`). Per-task spec, `tasks/README.md`, milestone README task table, milestone README `Done when` checkboxes, and top-level milestones index all coherent.

**AC re-grading.** All ten ACs still ✅ PASS. The four LOW findings that previously sat on AC6/AC7 caveats (order-dependence + over-broad regex + missing landing-page coverage) are now closed by deterministic `pre_js` seeding + spec-exact regex + six mirror cases. AC6 + AC7 now have functional coverage on all four landing surfaces (was only `/DSA/`); the security regression-guard adds non-inferential evidence that the reader rejects `javascript:` hrefs.

**Verdict: ✅ FUNCTIONALLY CLEAN — all carry-over closed. 0 HIGH / 0 MEDIUM / 0 LOW open. No new findings.** Loop complete; controller can stop iterating.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-2 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. No remote-attacker surface, no auth, no session. Relevant integrity concerns: stored-DOM-injection in client-side code shipped to the static deploy, integrity of client-side persistence (localStorage), unsafe path handling, off-device data leaks introduced by new code.

### Files reviewed

- `src/layouts/Base.astro` — localStorage writer; inline IIFE; path regex guard at line 473; debounce at 250 ms; `document.title` captured at write-time; strictly `localStorage.setItem`; no network calls.
- `src/components/home/ContinueReading.astro` — localStorage reader; DOM construction via `createElement` + `textContent` / `href` assignment; type guards on `path` and `title` fields.
- `src/components/chrome/ChapterCard.astro` — button / subtitle / progress-bar changes; all hrefs built with `import.meta.env.BASE_URL`; progress bar is static `style="width: 0%"` SSR markup, `data-interactive-only` gated.
- `src/pages/index.astro` + `src/pages/lectures/index.astro` (parallel structure on `notes/` + `practice/`) — mounts `<ContinueReading />`; no new fetch / XHR surface.

### Critical

None.

### High

None.

### Advisory

- **`src/components/home/ContinueReading.astro:136` — RESOLVED (cycle 3, 2026-04-27).** The unvalidated `link.href = entry.path` assignment now sits behind an origin check: `if (new URL(entry.path, location.origin).origin !== location.origin) return;`, wrapped in `try/catch` so parse-throwing inputs (e.g. `entry.path = "::::"`) also bail. On bail the slot stays `:empty` and the existing CSS `aside[data-slot="continue-reading"]:empty { display: none }` rule collapses it. New functional-test case `home-continue-reading-rejects-javascript-uri` seeds `{path: 'javascript:alert(1)', ...}` then loads `/DSA/` and asserts `a.resume-link` count is 0 — passes at cycle-3 close. Original advisory text preserved below for trail:

  > `link.href = entry.path` assigns an unvalidated string from localStorage directly as an `href`. The regex guard lives only in the writer (`Base.astro:473`); a manually crafted localStorage entry such as `{"path":"javascript:alert(1)","title":"x","scrollY":0,"ts":0}` would set `href` to a `javascript:` URI, producing a stored-DOM-injection that fires on click. Writer-side regex is not a security boundary because localStorage is user-writable from any tab on the same origin. Low severity in cs-300's threat model (single-user, self-authored storage, no remote attacker), but trivially closed. **Recommendation:** add an origin check before the assignment, e.g. `if (!entry.path.startsWith('/')) return;` or more precisely `if (new URL(entry.path, location.origin).origin !== location.origin) return;`.

- **`src/layouts/Base.astro:480-483` — confirmed no-action — flag-only (cycle 3, 2026-04-27).** Re-confirmed after cycle-2 review: the `title: document.title` capture is benign because cs-300's `<title>` is SSR-baked from typed Astro props (no URL-param / query-string interpolation in the current codebase). No code change. Advisory remains a forward-looking awareness flag only; the trigger that would justify revisiting is a future Base.astro consumer feeding URL-derived data into `<title>`.

  > `title: document.title` captured at write-time. On the GH Pages deploy the title is rendered by Astro from a static prop fed to `<title>{title}</title>`, so there is no injection surface today. **Advisory note for awareness only:** confirm at any future Base.astro consumer that `title` props derived from URL params or query strings stay out of the layout. Not a current issue.

- **`src/components/home/ContinueReading.astro:127` — confirmed no-action — flag-only (cycle 3, 2026-04-27).** Re-confirmed after cycle-2 review: the unchecked `scrollY` field is inert because the reader never calls `window.scrollTo` (verified — `grep -n "scrollTo" src/components/home/ContinueReading.astro` returns 0 hits). No code change. Trigger that would justify revisiting is a future addition of scroll-restore behaviour to the reader.

  > type guards check `typeof entry.path !== 'string'` and `typeof entry.title !== 'string'` but not `typeof entry.scrollY !== 'number'`. The `scrollY` field is written but never consumed for scroll-restore (verified — no `window.scrollTo` call in the reader), so the unchecked field is inert. No action required; noted only to confirm scroll-restore was deliberately omitted.

### Verdict

**SHIP (cycle 2 — pre-fix).** The `javascript:` href advisory at `ContinueReading.astro:136` is a real finding but its exploitability requires self-authored localStorage manipulation on a single-user static deploy. It does not block. The recommended one-line origin check is trivial belt-and-suspenders hygiene if the user wants it landed before T1's eventual commit.

**Cycle 3 update (2026-04-27).** User authorised cycle-3 scope expansion to land the recommended origin check + close the four LOW findings. All carried items resolved this cycle (see `## Auditor's verdict > Cycle 3` below).

### Dependency audit

Skipped — no manifest changes (cycle 1 + cycle 2 + cycle 3).
