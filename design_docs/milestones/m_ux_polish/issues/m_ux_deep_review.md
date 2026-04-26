# M-UX — Milestone-level deep review

**Source task:** [`../README.md`](../README.md) (milestone, not a per-task spec)
**Audited on:** 2026-04-25
**Audit cycle:** 1 (post-second-close, after the b29d409 hotfix landed on top of T9)
**Audit scope:** full milestone — final state of all M-UX commits from `e14813a` (kickoff) through `b29d409` (RHS-TOC top-level filter, current `HEAD`); all 9 per-task issue files; the two new harness scripts (`smoke-screenshots.py`, `functional-tests.py`); milestone + tasks/README + top-level milestone-index status surfaces; architecture.md §1.6; ADR-0002; nice_to_have.md; CHANGELOG; the deploy workflow + verification report; per-component dead-code / unused-token sweep; M3 contract preservation grep; build re-run from scratch + functional-test harness re-run + per-route HTML inspection + token-usage cross-check.
**Status:** ✅ **PASS** as of 2026-04-25 close-out. Both HIGHs RESOLVED orchestrator-side post-audit: M-UX-DR-01 (bullet 10 stale numbers) — bullet 10 text refreshed to 40 pages / +756 KB / +17.5% / 37 carriers / 19 cases / 30 asserts; M-UX-DR-04 (T8-promised harness-extension entry never landed) — `nice_to_have.md §UX-3` appended with T8's drafted prose. M-UX-DR-05 (CompletionIndicator JSON ~432 KB) RESOLVED via option (a) — `nice_to_have.md §UX-4` appended with M5-coupled promotion trigger. Two doc-only MEDIUMs (DR-02, DR-03 — architecture.md amendments for collection-landing pages + verification-gate infrastructure) deferred to the next architecture.md amendment cycle, non-blocking. All 8 LOW findings remain flag-only as logged. M-UX milestone genuinely closes here; no T10 needed.

**Original cycle-1 status (kept for audit trail):** ⚠️ OPEN — milestone is *substantially* close-able as shipped, but a freshly-introduced status-surface drift HIGH on Done-when bullet 10 (the b29d409 hotfix dropped the `data-interactive-only` count from 87 → 37 and shrank `dist/client/` from +873 KB → +756 KB without updating the bullet text), plus two tracked-but-not-actually-landed deferrals (the T8-promised `nice_to_have.md` Selenium-harness extension and the T2-ISS-02 CompletionIndicator architectural cleanup), keep this from a clean ✅ PASS.

---

## Design-drift check

Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1.6 (Page chrome — UX layer), [`../../../adr/0002_ux_layer_mdn_three_column.md`](../../../adr/0002_ux_layer_mdn_three_column.md), [`../../../nice_to_have.md`](../../../nice_to_have.md), and [`../../../../CLAUDE.md`](../../../../CLAUDE.md) non-negotiables.

### Architecture / ADR conformance

- **§1.6 three-column desktop grid (≥1024px)** — implemented in `Base.astro:244–301` (`grid-template-columns: 260px 1fr 280px` + named template areas). Verified by re-build + harness assertion at 1280×800 (`chrome-fills-1024` PASS). ✅ No drift.
- **§1.6 single column with hamburger drawer below 1024px** — implemented in `Base.astro:334–354` (off-canvas aside repositioned via @media). Drawer slide CSS lives at `.chrome > [data-slot="left-rail"]`; the SAME aside is the desktop rail and the mobile drawer per T7 cycle 2 single-DOM-tree refactor. ✅ No drift.
- **§1.6 right-rail TOC moves to a collapsed `<details>` summary at content top on mobile** — implemented in `RightRailTOC.astro:133–165` + `AnnotationsPane.astro` `<details>` wrapper. Desktop-open boot script gates `open=true` on `matchMedia('(min-width: 1024px)')`. ✅ No drift.
- **§1.6 `data-interactive-only` gate preserved across every M3 surface** — global `is:global` rule lives in both `Base.astro:113–115` and `HomeLayout.astro:73–75`; the rule fires on every chapter route, every landing page, and the home index. ✅ No drift.
- **§1.6 inline mode-detect script** — present in both layouts (`Base.astro:434–438`, `HomeLayout.astro:140–146`). Same `detectMode()` import, same `dataset.mode` write. ✅ No drift.
- **ADR-0002 layout commitments (lines 73–78)** — every commitment has a corresponding implementation surface (left rail Required/Optional, center max-width 75ch, right-rail TOC + annotations in interactive mode, mobile drawer, mastery-dashboard index, top breadcrumb sticky). ✅ No drift.

### Architecture documentation gaps

The implementation is correct, but **the architecture surface is incomplete relative to the final implementation:**

- **Three new collection-landing pages (T9 D5)** are now part of the deploy contract (40 prerendered pages total). Architecture.md §1.6 still describes the three-column-chapter-route + index-page-dashboard contract; no mention of `/DSA/{lectures,notes,practice}/` landing pages. **Action:** §1.6 should add a one-line note that "the three collections also have list-landing pages (`/lectures/`, `/notes/`, `/practice/`) rendered via `HomeLayout` with chapter cards highlighted on the home collection." Logged below as MEDIUM (`M-UX-DR-02`).
- **Selenium functional-test harness is now permanent verification infrastructure** (per CHANGELOG 2026-04-25 + bullet 10 mention + T9 D6). `requirements-dev.txt` is part of the repo; `scripts/{smoke-screenshots.py,functional-tests.py,_selenium_helpers.py,*.json}` are committed. Architecture.md does not document the verification-gate infra. **Action:** add a §1.7 (or equivalent subsection) mentioning the harness as the "non-inferential code-task verification surface" per CLAUDE.md's code-vs-content rule. Logged below as MEDIUM (`M-UX-DR-03`).

### Status-surface discipline (CLAUDE.md non-negotiable)

CLAUDE.md mandates **four+** status surfaces flip in lockstep. Final state at audit close:

| Surface | State | Verdict |
| ------- | ----- | ------- |
| (a) per-task spec `**Status:**` lines (T1–T9) | All `✅ done 2026-04-25` (T1–T2 are dated `2026-04-24`; T3 too; T4 too; T5–T9 dated 2026-04-25 per their respective close dates) | ✅ aligned |
| (b) `tasks/README.md` table rows | All ✅ done with matching dates | ✅ aligned |
| (c) milestone README task table rows (T1–T9) | All ✅ done with matching dates | ✅ aligned |
| (d) milestone-level `**Status:**` line at `m_ux_polish/README.md:4` | `✅ done 2026-04-25 (re-closed after T9 layout polish; was ✅ done 2026-04-25 after T1–T8, briefly re-opened 2026-04-25 for T9)` | ✅ flipped |
| (e) top-level milestone index `design_docs/milestones/README.md:26` | `✅ closed 2026-04-25 (re-closed after T9 polish)` | ✅ flipped |
| (f) milestone README **Done-when** bullets (10 total) | All `[x]` checked, all carry citation parentheticals | ⚠️ **bullet 10 text is stale post-b29d409 — see HIGH M-UX-DR-01** |

The b29d409 commit ("M-UX RHS TOC — top-level sections only", 2026-04-25 21:50, after the T9 close at 21:33) shipped a 1-line filter (`^\d+\.\d+\s` regex on the TOC sections array) PLUS a harness extension (`text-pattern` runner + 2 new test cases). It dropped the per-page `data-interactive-only` count on lectures/ch_4 from **87 → 37** (each TOC link previously carried a `data-read-indicator` span; subsection-only filtering reduced TOC entries by ~50 per chapter) and shrank `dist/client/` from **5,315,473 B → 5,195,079 B** (a -120 KB delta). Bullet 10 still reads `+873 KB / +20.2%` and the T9 issue file's AC13 still asserts `87`. The functional-tests harness's `text-pattern` test cases verify the new behaviour; nothing else was updated.

This is a real status-surface drift. Documentation now misrepresents the shipped state. M-UX shipped THIS commit as part of the milestone (no follow-on milestone exists; M-UX is closed); the bullet has to reflect the actual shipped state.

### `nice_to_have.md` discipline

- **§UX-2 (T9 D7) collapsible sections** — entry exists in `nice_to_have.md:81–132` (49 lines). Has the four required sections (What / Status / Why deferred / Trigger / Cost) plus a `Surfaced 2026-04-25` provenance line. ✅ Authored correctly.
- **T8-promised harness extension entry (M-UX-T8-ISS-03)** — T8 issue file lines 88–94 + 204–218 declared "DEFERRED to nice_to_have.md" for the interactive-mode Selenium harness extension. **No such entry exists in `nice_to_have.md`.** Grep for "interactive-mode harness", "T8-ISS-03", or "Selenium" inside `nice_to_have.md` returns zero hits. The T8 audit explicitly noted "the actual append to `nice_to_have.md` is left to a follow-up edit by the user or a future Builder; the Auditor doesn't modify design records mid-audit" — but the follow-up edit never happened. Logged below as HIGH (`M-UX-DR-04`).
- **No drive-by `nice_to_have.md` adoption** beyond §UX-2. ✅ No drift.

### Deferred-items propagation

- **M-UX-T2-ISS-02 (MEDIUM, CompletionIndicator SSR JSON ~432 KB)** — T8 issue file marks this as "RE-DEFERRED at milestone close — no destination task." There is no follow-up task, no `nice_to_have.md` entry, no carry-over against any future milestone (M5 candidate). It has effectively evaporated as a tracked item — the T8 issue file's mention is the only persistent record. **Action:** decide whether to (a) log it in `nice_to_have.md` with explicit promotion trigger, (b) carry-over against M5 review-queue spec when authored, (c) accept as residual + mark RESOLVED with rationale. Logged below as MEDIUM (`M-UX-DR-05`).
- **M-UX-T6-ISS-01 (HIGH, manual-smoke gap on AC1/AC2/AC3)** — T6 deferred to T7; T7 deferred to T8; T8 marked "static-mode coverage via harness sufficient for layout; interactive-mode round-trip + focus-trap deferred to user-side runtime push." Per T8 issue file, the residual maps to the harness extension item that should have been logged in `nice_to_have.md` (see DR-04). Until DR-04 lands, this gap is invisible to any future Builder.

### Dependency churn

- `git diff e14813a..HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` — `requirements-dev.txt` is the only manifest add (T7 cycle 2 introduced it pinning `selenium==4.43.0`). Per CHANGELOG, dep audit ran at T7 cycle 2 commit and was clean. T8/T9/b29d409 didn't touch any manifest. ✅ No drift.

---

## AC grading — 10 Done-when bullets

| #  | Done-when bullet | Status | Notes |
| -- | ---------------- | ------ | ----- |
| 1  | Three-column desktop layout (≥1024px) renders cleanly on every chapter route (lectures, notes, practice). Citation: T1+T2+T4 issue files. | ✅ PASS | Independent build re-run + harness `chrome-fills-1024` PASS. CSS grid `260px 1fr 280px` at `Base.astro:246`. Slot wiring `breadcrumb` / `left-rail` / `main` / `right-rail` verified across all three chapter route handlers. |
| 2  | Left-rail chapter nav — chapter list grouped Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13), current chapter highlighted, SSR-rendered. Citation: T2 issue file. | ✅ PASS | `LeftRail.astro:104–144` SSR. `aria-current="page"` derives from URL match. Sort key is `n` so ch_10 sorts after ch_9. T9 D3 made hrefs collection-aware (`leftrail-collection-aware-{notes,practice}` PASS). Citation accurate. |
| 3  | Per-chapter completion indicators in the left rail — Canvas-style checkmark gated via `data-interactive-only` (T5 contract), populated from `read_status` table in interactive mode, hidden in static mode. Citation: T2 issue file. | ✅ PASS at structural level | `CompletionIndicator.astro` JSON-embed island fetches `/api/read_status?chapter_id=…` per chapter; rule (a) "all sections marked" applied; checkmark slot gated. Static-mode hide rule fires (`body[data-mode="static"] [data-interactive-only] { display: none !important }`). Interactive-mode runtime smoke for the actual ✓ paint never landed (deferred via T6/T7/T8 chain — see M-UX-DR-04). Citation accurate. |
| 4  | Top breadcrumb — sticky on scroll, shows path, hosts collection switcher + prev/next chapter buttons. Citation: T3 issue file. | ✅ PASS | T8 caught + fixed the sticky regression (rule moved from inner nav to outer slot wrapper, `Base.astro:228–234`). T9 made `cs-300` + collection-name links functional. Selenium scroll test in T8 + harness `breadcrumb-cs300-link` / `breadcrumb-collection-link-{lectures,notes,practice}` / `breadcrumb-current-page-no-link` all PASS. Citation accurate (T3 issue file is the original — though T8's sticky-fix and T9's link fixes both touched bullet 4's surface). |
| 5  | Right-rail in-chapter TOC — section anchors SSR-rendered from MDX frontmatter, scroll-spy enhancement as JS island toggling `data-current` via IntersectionObserver. M3 SectionNav refactored into this slot. Citation: T4 issue file. | ✅ PASS (with bullet-text drift) | `RightRailTOC.astro` SSR, `ScrollSpy.astro` IntersectionObserver, `RightRailReadStatus.astro` paints `data-read`. M3 `SectionNav.astro` deleted in T4. **Caveat:** the b29d409 commit added a `^\d+\.\d+\s` filter to keep only top-level sections — the bullet text doesn't say "top-level only" and a future reader will see deep-section anchors in the article DOM that don't appear in the TOC, with no documented rationale on this surface. The `RightRailTOC.astro:124–130` source explains it; the bullet doesn't. Logged as LOW (`M-UX-DR-06`). |
| 6  | Annotations pane re-homed to right rail (below TOC) in interactive mode, with `data-interactive-only` contract preserved. Citation: T6 issue file. | ✅ PASS at structural level | `lectures/[id].astro:131` mounts `<AnnotationsPane slot="right-rail" />` after RightRailTOC + ScrollSpy + RightRailReadStatus. `data-interactive-only` carrier preserved on the `<details>` wrapper + the inner `<aside id="annotations-pane">`. Interactive-mode round-trip never literally smoke-tested (T6-CO1 → T7 → T8 → "user-side runtime push"; gap maps to the M-UX-DR-04 missing nice_to_have entry). Citation accurate. |
| 7  | Mark-read button re-homed to its chrome slot (default slot, above article body — visual position keeps M3's floating bottom-left per spec MUX-BO-DA-6 option (i)), `data-interactive-only` preserved. Citation: T6 issue file; T7 wording fix. | ✅ PASS | `lectures/[id].astro:133` mounts `<MarkReadButton />` in default slot. M3 component zero-diff at script tag (`position: fixed; bottom-left` CSS preserved). T6-ISS-02 wording fix landed in T7 (bullet 7 text now matches option (i)). Citation accurate. |
| 8  | Index page is the mastery-dashboard placeholder — chapter cards grouped Required/Optional in static mode; `data-interactive-only` slots that M5 fills. Replaces two-table layout. Citation: T5 issue file. | ✅ PASS | `src/pages/index.astro` uses `HomeLayout` + 12 ChapterCards + 2 `DashboardSlot`s. Static-mode hides the dashboard slots (slots carry `data-interactive-only`). M5 fills empty-state stub at promotion time. Index renders zero `is-current-collection` (T5 backward-compat preserved post-T9 prop addition). Citation accurate. |
| 9  | Mobile (<1024px) — single column with hamburger drawer for left rail; right-rail TOC moves to collapsed `<details>` summary. Responsive transition tested at 1280, 1024, 768, 375. Citation: T7 issue file. | ✅ PASS at structural + harness level; manual-smoke gap not closed | `DrawerTrigger.astro` `@media (max-width: 1023.98px)` flips display from none to inline-flex; `Base.astro:334–354` repositions left-rail aside as fixed off-canvas; `RightRailTOC.astro` + `AnnotationsPane.astro` use `<details>` wrappers. T7 cycle 2 single-DOM-tree refactor recovered 618 KB by collapsing the twice-rendered LeftRail into one. Selenium screenshots capture all 4 viewports + the harness asserts sticky-after-scroll at 1280×800. **Interactive-mode click-and-drawer-slide smoke** still deferred (T6/T7/T8 chain → user-side runtime push → should-have-been-logged-in-nice_to_have-but-wasn't, see M-UX-DR-04). Citation accurate. |
| 10 | Deploy contract preserved — site ships **40 prerendered pages**; M3 surfaces still gated; no server-only code leaks. `dist/client/` cumulative size delta vs pre-M-UX baseline measured at **+873 KB / +20.2%**; functional-test harness 17/17 cases / 28/28 assertions. Citation: T8 + T9 issue files + `m_ux_deploy_verification.md`. | ⚠️ **TEXT STALE post-b29d409** | Page count (40) ✅ verified independently. M3 surfaces gated ✅. No server-only leaks ✅ (`grep -rln 'better-sqlite3\|drizzle\|gray-matter\|src/lib/seed\|src/db' dist/client/` = 0). **But:** `dist/client/` is now **5,195,079 B vs baseline 4,420,947 B = +774,132 B / +756.0 KB / +17.5%** (NOT +873 KB / +20.2%). `data-interactive-only` count on lectures/ch_4 is now **37** (NOT 87). Functional-tests harness now 19/19 cases / 30/30 assertions (NOT 17/17 / 28/28). Bullet 10 references the T9 baseline before the b29d409 hotfix; the hotfix shrank the bundle and changed the carrier-count without anyone updating the bullet. See HIGH M-UX-DR-01. |

**Summary:** 9 of 10 bullets PASS cleanly. Bullet 10 has stale numeric claims that no longer match the shipped state. Bullet 5 has a small text-vs-source drift (top-level filter undocumented at the bullet level).

---

## 🔴 HIGH

### M-UX-DR-01 — Done-when bullet 10's text is stale post-b29d409 hotfix (status-surface drift)

**Severity:** HIGH per CLAUDE.md "Status-surface discipline" non-negotiable. The b29d409 commit was a real shipping change (RHS TOC top-level filter); it shrank the deploy bundle by ~120 KB and changed the `data-interactive-only` carrier count from 87 to 37. None of the milestone-level surfaces were updated to reflect this. Bullet 10 cites measurements that the current build does not reproduce.

**Where:** [`design_docs/milestones/m_ux_polish/README.md:28`](../README.md) bullet 10. Reads:

> Deploy contract preserved — site ships 40 prerendered pages (37 chapter routes + 3 collection-landing pages added in T9); … `dist/client/` cumulative size delta vs pre-M-UX baseline measured at **+873 KB / +20.2%** post-T9 (was +817 KB / +18.9% post-T8; T9 added +56 KB for the 3 new landing pages + ChapterCard highlight CSS + breadcrumb-link CSS + sticky-rail CSS + chrome-max container token; …). … T9 added the Selenium functional-test harness (`scripts/functional-tests.py`) — 17 test cases / 28 assertions covering wide-viewport, sticky-rail, cross-collection, and breadcrumb-link contracts at gate-time.

**Verified actual state at HEAD (`b29d409`):**

```
$ du -sb dist/client/
5195079  dist/client/

$ python3 -c "print(f'{(5195079 - 4420947)/1024:.1f} KB / {(5195079-4420947)/4420947*100:.1f}%')"
756.0 KB / 17.5%

$ grep -oc data-interactive-only dist/client/lectures/ch_4/index.html
37

$ .venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321
... SUMMARY: 19/19 test cases passed (30/30 assertions) in 9.2s
```

`+756 KB / +17.5%`, not `+873 KB / +20.2%`. 37 carriers, not 87. 19/30 cases/asserts, not 17/28.

**Why it matters:** every numeric claim in bullet 10 was rewritten to match the T9 close (commit 7d56df2), but the b29d409 commit landed AFTER T9 close as a fix-on-top with no audit cycle and no status-surface refresh. M-UX shipped this commit (no follow-on milestone exists); the milestone close criteria are the *current* shipped state, not a prior commit's snapshot.

**Action / Recommendation:** Edit bullet 10 to reflect the actual `b29d409` state. Concrete edit:

- "+873 KB / +20.2%" → "+756 KB / +17.5%"
- "(was +817 KB / +18.9% post-T8; T9 added +56 KB ..." → "(was +817 KB / +18.9% post-T8; T9 added +56 KB; b29d409 reclaimed -117 KB by filtering RHS TOC entries to top-level sections only)"
- "17 test cases / 28 assertions" → "19 test cases / 30 assertions"
- Add a note about the post-T9 b29d409 hotfix in the bullet's parenthetical OR add a citation to the CHANGELOG entry on line 17 since b29d409 has no per-task issue file.

Optional (recommended): also fix the T9 issue file's AC13 row (line 81) — currently asserts `87`, post-b29d409 actual is `37`. Either flip it to `37` with an annotation that the b29d409 hotfix changed the baseline, or add a `## Post-T9 amendments` section to the T9 issue file documenting the b29d409 delta.

**Owner:** orchestrator surgical fix post-audit (~5 lines of edit on `m_ux_polish/README.md` + ~2 lines on `T9_issue.md`). Cheaper inline than a T10.

### M-UX-DR-04 — T8-promised `nice_to_have.md` Selenium-harness-extension entry never landed

**Severity:** HIGH per CLAUDE.md "Propagation discipline" non-negotiable: "Forward-deferred items must appear as carry-over in the target task before the audit is complete." T8 issue file declared the residual interactive-mode harness extension as DEFERRED to `nice_to_have.md` AND named the trigger + cost; the actual entry was left to "a follow-up edit by the user or a future Builder" and never landed. The audit's deferral discipline thereby fails closed: the gap is logged in the T8 issue file but invisible to any Builder reaching for `nice_to_have.md`.

**Where:** [`design_docs/milestones/m_ux_polish/issues/T8_issue.md`](T8_issue.md) lines 88–94 + 204–218 declared the deferral; [`design_docs/nice_to_have.md`](../../../nice_to_have.md) has zero matching entry (grep for `Selenium`, `harness extension`, `T8-ISS-03`, `interactive-mode harness` all return 0 hits).

The T8 issue file even records why the entry wasn't appended: "the Auditor doesn't modify design records mid-audit. The user should append the entry via a separate follow-up edit, OR a future Builder addresses it as part of the trigger event." Two milestones-of-status-surface-flips later, neither has happened.

**Why it matters:** the cs-300 process explicitly tracks every deferred item against an explicit owner. Items in the per-task issue file with `DEFERRED to nice_to_have.md` propagate ONLY when the entry is actually written. Otherwise the orchestrator's next pass (M5 review-queue, etc.) cannot see the deferral and cannot decide whether to address it. The T6-CO1 → T7-CO1 → T8 chain ended here; without the entry, the chain effectively terminates with no destination.

**Action / Recommendation:** Append a new entry to `nice_to_have.md` titled something like `## §UX-3 — Interactive-mode Selenium harness extension`. Reuse the prose already drafted in T8 issue file lines 206–216:

- **What:** extend `scripts/smoke-screenshots.py` (or `scripts/functional-tests.py`) with `--mode=interactive` flag that boots against `npm run dev` (where `/api/health` is reachable). Add ActionChains-driven interaction smokes: hamburger click → drawer slide-in observed; drawer-link-click → drawer closes; Tab focus-trap inside open drawer; Esc closes; backdrop-click closes; round-trip select → annotate → reload → persist; mark-read button click → indicator paints.
- **Status today:** static-mode-only harness is sufficient for layout-at-viewport coverage; interactive-mode round-trip is structurally inferable (M3 component scripts byte-identical at source level) but never literally smoke-tested.
- **Why deferred:** real signal is "user reports interactive-mode regression on push" or "M5 lands and needs end-to-end interactive coverage as part of its DoD." Either trigger justifies the harness extension.
- **Trigger to promote:** as above.
- **Cost of promotion:** ~1 focused session — extend `_selenium_helpers.py` to also support `npm run dev`, add interaction matrix, add `--mode` switch.
- **Surfaced 2026-04-25** by M-UX T8 + propagated by this milestone-level deep review.

**Owner:** orchestrator surgical fix post-audit (~30 lines of `nice_to_have.md` append). Same pattern as the §UX-2 entry T9 added.

---

## 🟡 MEDIUM

### M-UX-DR-02 — architecture.md §1.6 doesn't document the three new collection-landing pages

**Severity:** MEDIUM. The deploy contract changed structurally (37 → 40 pages). §1.6 describes the chapter-route shape and the index dashboard but is silent on the three landing pages. A future reader of architecture.md alone gets an incomplete picture of the deployed surface.

**Where:** [`design_docs/architecture.md`](../../../architecture.md) §1.6 (lines 99–141 in the current file).

**Action / Recommendation:** Add a short note (3–5 lines) under the "Static-mode posture" subsection or after the diagram:

```
**Collection-landing pages (T9 D5).** Each of the three collections also has a list-landing
page rendered via HomeLayout: `/lectures/`, `/notes/`, `/practice/`. These render the same
chapter-card grid the index page uses, with the home collection's link highlighted on each
card via the `highlight` prop on `ChapterCard.astro`. The breadcrumb's middle path segment
links to these pages on chapter routes (T9 D4). Total prerendered surface: 40 pages = 36
chapter routes + 3 landing pages + 1 index.
```

**Owner:** orchestrator surgical fix or rolled into the next architecture.md amendment cycle. Low risk; pure documentation.

### M-UX-DR-03 — architecture.md doesn't document the new Selenium verification harness

**Severity:** MEDIUM. Per CLAUDE.md's "Code-task verification is non-inferential" non-negotiable, every code task spec must name an explicit smoke; M-UX added two harness scripts (`scripts/smoke-screenshots.py` for visual evidence, `scripts/functional-tests.py` for assertion-based checks) plus a shared helper (`scripts/_selenium_helpers.py`). These are now permanent project infrastructure (`requirements-dev.txt` pins `selenium==4.43.0`). They're documented at the per-task and per-script level but not at the architecture level.

**Where:** [`design_docs/architecture.md`](../../../architecture.md) — currently has no section on verification gates. CLAUDE.md cites them at the policy level but the architecture doc is silent.

**Action / Recommendation:** Add a new subsection (e.g., `§1.7 Verification gates`) summarising:

- `scripts/smoke-screenshots.py` — Selenium-driven PNG capture across the smoke route matrix (`scripts/smoke-routes.json`) at 4 viewports per route. Output: `.smoke/screenshots/` (gitignored).
- `scripts/functional-tests.py` — Selenium-driven assertion harness (`scripts/functional-tests.json` config). Five+ assertion types (`attr` / `count` / `rect` / `href-pattern` / `aria-current` / `text-pattern`). Exit 0 on all-pass.
- `scripts/_selenium_helpers.py` — shared Chrome flag set + preview-reachability check.
- `requirements-dev.txt` — `selenium==4.43.0` pin.
- Boundary: harness runs against `npm run preview` (static mode) by default; interactive-mode coverage deferred to nice_to_have (see §UX-3 once added).

**Owner:** orchestrator surgical fix or rolled into the next architecture.md amendment cycle. Low risk; pure documentation.

### M-UX-DR-05 — M-UX-T2-ISS-02 (CompletionIndicator ~432 KB JSON manifest) has no destination

**Severity:** MEDIUM. The finding was logged at T2 close, deferred to T8 (which graded the budget), then T8 marked it "RE-DEFERRED at milestone close — no destination task." With M-UX closed and no follow-up task, the item is effectively orphaned. The dominant ~432 KB contributor to the +756 KB cumulative delta lives on as silent residual.

**Where:** [`T2_issue.md`](T2_issue.md) ISS-02 + [`T8_issue.md`](T8_issue.md) line 200 ("DEFERRED — no destination task").

**Action / Recommendation:** Pick one of:

- **(a)** Append an entry to `nice_to_have.md` (e.g. `§UX-4 — Replace SSR-embedded section-id JSON with `GET /api/sections` endpoint`) with motivation (~432 KB savings = ~10% of current `dist/client/`), risk (M5 review-queue UX needs the same data; careful coordination), trigger (budget pressure OR M5 lands an API surface that subsumes the data anyway), cost (~1 session if M5 already added the endpoint, otherwise 2–3 sessions).
- **(b)** Add a `## Carry-over from prior milestones` block to M5's milestone README (when M5 is authored) referencing T2-ISS-02 + the T8 grading.
- **(c)** Accept the residual + mark the T2 finding RESOLVED-WITH-RATIONALE: "+432 KB is acceptable cost vs the alternative (M3-style API contract that doesn't exist yet); revisit if M5 introduces the endpoint anyway."

Each is a defensible call. The current state — implicit deferral with no documented owner — is the worst of all worlds.

**Owner:** user adjudication (this is a small-fix issue with multiple reasonable directions per the "present options for simple-fix issues" rule). Recommend option (a) since `nice_to_have.md` is the natural home for "real but not urgent."

---

## 🟢 LOW

### M-UX-DR-06 — bullet 5 doesn't mention the b29d409 top-level filter

**Severity:** LOW. Bullet 5 says "section anchors SSR-rendered from MDX frontmatter (`sections` array)" — the b29d409 hotfix added a `^\d+\.\d+\s` filter so only top-level sections (e.g. `1.1 Arrays and Vectors`) appear in the TOC. Subsection anchors (`Declaring a vector`, `Common errors`) still exist in article DOM but are filtered out of the rail. A future reader will notice the filter but won't see it documented at the bullet.

**Where:** [`m_ux_polish/README.md:23`](../README.md) bullet 5 + [`RightRailTOC.astro:124–130`](../../../../src/components/chrome/RightRailTOC.astro) (the filter is documented at the source level).

**Action / Recommendation:** Append a one-line clarification to bullet 5: "TOC filters to top-level numbered sections (`^\d+\.\d+\s`) so subsection anchors stay reachable in-article without cluttering the rail (b29d409, 2026-04-25)." Or fold this into the M-UX-DR-01 fix at the same time.

**Owner:** orchestrator surgical fix (alongside DR-01).

### M-UX-DR-07 — Defensive `--mux-bp-desktop`, `--mux-col-left-rail`, `--mux-col-right-rail` tokens are documentation-only (not used by any rule)

**Severity:** LOW. Three CSS custom properties defined in `chrome.css` are not used by any `var(--…)` consumer at the source level. They're cited in doc-comments inside `Base.astro` and `DrawerTrigger.astro` (the comments explicitly say "documentation reference; @media can't read custom properties"). This is a defensible tradeoff but a reader following `grep -rE '\-\-mux-bp-desktop' src/` learns the tokens are inert.

**Where:** [`src/styles/chrome.css:51–63`](../../../../src/styles/chrome.css).

**Action / Recommendation:** Two reasonable paths — flag-only, no immediate action required:

- **(a)** Leave as-is. The tokens establish a single-source-of-truth that future component styles or a tooling layer can `var()` against; the doc-comment idiom is correct.
- **(b)** Remove the three tokens; replace doc-comment references with literal `1024px` / `260px` / `280px`. Saves ~5 lines + clarifies "no consumer."

Recommend leaving as-is — the tokens make the intent explicit and a future M5 / dark-mode sweep might consume them.

### M-UX-DR-08 — T9 D2 sticky-rail offset token `--mux-breadcrumb-height: 52px` is hand-measured; rebreaks if the breadcrumb's font-size changes

**Severity:** LOW. The token comment in `chrome.css:87–94` records the measurement methodology (font-size + padding + line-height ≈ 52px) but a future visual sweep that bumps `font-size` on `.breadcrumb` (`Breadcrumb.astro:248` is currently `0.85rem`) would silently break the sticky-rail offset alignment. No automatic invariant.

**Where:** [`src/styles/chrome.css:87–94`](../../../../src/styles/chrome.css), [`src/components/chrome/Breadcrumb.astro:242–249`](../../../../src/components/chrome/Breadcrumb.astro).

**Action / Recommendation:** Add a functional-test assertion: at 1280×800, `.chrome > [data-slot=breadcrumb"]`'s `getBoundingClientRect().height` should match `--mux-breadcrumb-height` value (within 2px). Single-line addition to `functional-tests.json`. If it ever fires, the next visual-sweep Builder gets clear signal to update the token. Forward-looking, not blocking.

### M-UX-DR-09 — Functional-test harness has no mobile-viewport coverage

**Severity:** LOW. T9 D6 spec authorised the harness against the post-T9 fixes; T9 issue file's verification PASS ran the harness at 2560 / 1280 / 1024. The mobile breakpoints (768, 375) that T7 spec called out as "test at 1280, 1024, 768, 375 widths" never made it into `functional-tests.json`. Smoke-screenshot harness covers the visual-evidence side; functional-tests harness asserts behaviours, but only at desktop.

**Where:** [`scripts/functional-tests.json`](../../../../scripts/functional-tests.json).

**Action / Recommendation:** Add two test cases asserting mobile behaviour:

- `drawer-trigger-visible-mobile` at 375×812: `count: 'button.drawer-trigger:not([style*="display: none"])'` `>=` 1 OR `rect: '.drawer-trigger'.width > 0`.
- `right-rail-toc-collapsed-mobile-default` at 375×812: `attr: 'details.toc-mobile-collapse'.[open]` should be missing/null (not `"true"` because the boot script gates desktop-only).

Forward-looking, low priority. The existing screenshot smoke covers mobile visually.

### M-UX-DR-10 — `scripts/functional-tests.py` `--no-sandbox` argparse semantics are inverted

**Severity:** LOW (already logged as M-UX-T9-ISS-03 in the T9 issue file).

**Where:** [`scripts/functional-tests.py:195–200`](../../../../scripts/functional-tests.py); [`scripts/smoke-screenshots.py`](../../../../scripts/smoke-screenshots.py) has the same shape.

**Action / Recommendation:** As recorded in T9-ISS-03 — flag-only, optional future ergonomic pass switching to `argparse.BooleanOptionalAction`. Not blocking.

### M-UX-DR-11 — HomeLayout duplicates the M3 mode-detection block from Base.astro

**Severity:** LOW. The T5 audit explicitly authorised this ("verbatim preservation" of M3 contracts in HomeLayout sibling layout). Both layouts now contain:

```html
<style is:global> body[data-mode="static"] [data-interactive-only] {...} </style>
...
<body data-mode="static">
...
<script>
  import { detectMode } from '../lib/mode';
  detectMode().then((mode) => { document.body.dataset.mode = mode; });
</script>
```

That's a copy-paste duplication. T5 audit's call: a sibling layout was preferred over `Base.astro variant="home"` props because the grid+slot machinery of Base is load-bearing for chapter routes. The duplication is small (~15 lines) and the divergence path (HomeLayout grows different chrome rules) is plausible.

**Where:** [`src/layouts/Base.astro:110–116, 433–438`](../../../../src/layouts/Base.astro), [`src/layouts/HomeLayout.astro:69–76, 140–146`](../../../../src/layouts/HomeLayout.astro).

**Action / Recommendation:** Two reasonable paths — flag-only:

- **(a)** Leave as-is. T5 rationale stands.
- **(b)** Extract the mode-detect block + global rule into a shared `<ModeDetectScripts.astro>` component composed into both layouts.

Recommend leaving as-is unless a third layout joins the family (M5 dashboard surface might).

### M-UX-DR-12 — All 4 home-style pages duplicate the same scoped CSS block (`.home-header`, `.chapter-group`, `.chapter-grid`)

**Severity:** LOW. Four pages — `src/pages/index.astro`, `src/pages/lectures/index.astro`, `src/pages/notes/index.astro`, `src/pages/practice/index.astro` — each carry an identical scoped `<style>` block defining `.home-header`, `.chapter-group-heading`, `.chapter-group-blurb`, `.chapter-grid`. Three of those four pages were authored as part of T9 D5; the duplication was intentional per the spec (each landing page is a separate file with its own scoped CSS).

**Where:** [`src/pages/index.astro`](../../../../src/pages/index.astro), [`src/pages/lectures/index.astro`](../../../../src/pages/lectures/index.astro), [`src/pages/notes/index.astro`](../../../../src/pages/notes/index.astro), [`src/pages/practice/index.astro`](../../../../src/pages/practice/index.astro).

**Action / Recommendation:** Consider extracting these classes into `src/styles/home.css` (or appending to `chrome.css`) so all four pages share the rules. Saves ~30 lines × 3 = 90 lines of duplicate scoped CSS, though Astro's scoped-CSS machinery hashes each block separately so the runtime cost is at the bundle level only. Forward-looking, low priority.

### M-UX-DR-13 — Bullet 9 cites manual smokes "tested at 1280, 1024, 768, 375 widths" but the gate-time harness runs at 2560/1280/1024 only

**Severity:** LOW. Bullet 9 reads "Responsive transition tested at 1280, 1024, 768, 375 widths." The functional-tests harness only runs at 2560/1280/1024; mobile-viewport tests (768, 375) never made it into the assertion suite. The screenshot harness covers all four. Bullet 9 is technically truthful — screenshots WERE captured at all four — but the gate-time machine-checkable assertions are desktop-only.

**Where:** [`m_ux_polish/README.md:27`](../README.md) bullet 9.

**Action / Recommendation:** Fold into the M-UX-DR-09 fix when adding mobile-viewport assertions. No bullet text edit required if DR-09 lands.

---

## Additions beyond spec — audited and justified

| Addition | Source task | Justification | Verdict |
| -------- | ----------- | ------------- | ------- |
| `scripts/smoke-screenshots.py` + `smoke-routes.json` + `smoke-screenshots.md` + `requirements-dev.txt` | T7 cycle 2 | T7 spec called for non-inferential layout-at-viewport evidence; harness was the lightest tool that met CLAUDE.md's "code-task verification is non-inferential" non-negotiable. Dep audit ran clean at T7 commit; selenium 4.43.0 pinned. Permanent project infra. | ✅ Authorised + spec-aligned. |
| `scripts/functional-tests.py` + `functional-tests.json` + `_selenium_helpers.py` | T9 D6 | T9 spec D6 mandated the assertion harness; helper extraction explicitly authorised ("extract shared logic into a small helper module if it grows"). | ✅ Spec-mandated. |
| `text-pattern` assertion runner + 2 new test cases | b29d409 | RHS TOC top-level filter required a coverage assertion. Runner is general-purpose (regex over `textContent`), not single-use. | ✅ Defensible — coverage extension. |
| `src/layouts/HomeLayout.astro` | T5 | Spec Step 1 lean: "**separate `HomeLayout.astro`**". Index page doesn't take three-column chrome (would be redundant chapter-list-next-to-chapter-grid). Now also consumed by T9 D5 landing pages. | ✅ Spec-authorised + reused appropriately by T9. |
| `ChapterCard.astro` `highlight` prop | T9 D5 | Optional prop; backward-compatible (default behaviour matches T5 baseline; index page renders zero `is-current-collection`). Independent verification: `grep -oE 'a class="is-current-collection"' dist/client/index.html | wc -l` = 0. | ✅ Backward-compat clean. |
| 3 collection-landing pages (`/lectures/`, `/notes/`, `/practice/`) | T9 D5 | Spec D5 + AC10/AC11 explicitly mandated. Each composes `HomeLayout` + `ChapterCard` identically (same partition, sort key, structure). | ✅ Spec-mandated; per-page divergence none — extraction candidate logged as M-UX-DR-12 LOW. |
| `--mux-chrome-max: 1400px` + `--mux-breadcrumb-height: 52px` tokens | T9 D1 + D2 | Required by D1 (centered chrome) + D2 (sticky-rail offset). Both tokens used at one consumer each (no proliferation). | ✅ Required. |
| `data-interactive-only` extra carriers on subsection-only-filtered anchors | b29d409 | None added; the count *dropped* (87 → 37) because each filtered TOC entry no longer carries a read-indicator span. Side-effect of the filter, not an additive change. | ✅ Additive surface unchanged. |
| Sticky CSS rule relocation from `.breadcrumb` to `.chrome > [data-slot="breadcrumb"]` | T8 | M-UX-T3-ISS-01 sticky-regression fix. Verified by post-fix Selenium scroll test (top stays at 0 across the entire scroll). | ✅ Correct fix. |
| Drawer single-DOM-tree refactor (cycle 2) | T7 cycle 2 | Resolved M-UX-T7-ISS-02 (size budget) + ISS-03 (HTML5-invalid duplicate IDs) by collapsing twice-rendered LeftRail into one. ~618 KB recovered. Verified: 1× `id="cs300-completion-indicator"` per chapter route. | ✅ Real architectural fix. |

No unjustified additions detected.

---

## Verification summary

Independent re-run by the auditor on a clean shell after `git checkout main` (HEAD = b29d409):

```
$ PATH="/tmp/pandoc-wrapper:$PATH" npm run build
... [build] Server built in 8.56s
... [build] Complete!
$ find dist/client -name 'index.html' | wc -l
40

$ du -sb dist/client/
5195079    dist/client/

$ python3 -c "print(f'{(5195079 - 4420947)/1024:.1f} KB / {(5195079-4420947)/4420947*100:.1f}%')"
756.0 KB / 17.5%

$ grep -oc data-interactive-only dist/client/lectures/ch_4/index.html
37

$ grep -oc data-interactive-only dist/client/notes/ch_4/index.html
14
$ grep -oc data-interactive-only dist/client/practice/ch_4/index.html
14
$ grep -oc data-interactive-only dist/client/index.html
16
$ grep -oc data-interactive-only dist/client/lectures/index.html
14
$ grep -oc data-interactive-only dist/client/notes/index.html
14
$ grep -oc data-interactive-only dist/client/practice/index.html
14

$ grep -roh 'cs300:read-status-changed\|cs300:toc-read-status-painted\|cs300:annotation-added\|cs300:drawer-toggle' dist/client | sort | uniq -c
  24 cs300:annotation-added
  72 cs300:drawer-toggle
  60 cs300:read-status-changed
  24 cs300:toc-read-status-painted

$ grep -rln 'better-sqlite3\|drizzle\|gray-matter\|src/lib/seed\|src/db' dist/client/
(0 hits — clean)

$ for f in dist/client/lectures/ch_*/index.html dist/client/notes/ch_*/index.html dist/client/practice/ch_*/index.html; do echo "$(grep -o '<article' $f | wc -l)  $f"; done | sort | uniq -c
   36 1  (every chapter route has exactly 1 <article>)

$ grep -c 'data-mode="static"' dist/client/{lectures/ch_4,notes/ch_4,practice/ch_4,lectures,notes,practice,}/index.html
1 each (7 routes spot-checked)

$ grep -n 'path:' .github/workflows/deploy.yml
76:          path: ./dist/client (preserved)

$ .venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321
... 19/19 test cases passed (30/30 assertions) in 9.2s
```

Validation against each Done-when bullet's claim is captured in the AC-grading table above.

### Comparison to bullet 10's claimed numbers

| Metric | Bullet 10 claim | Audit actual | Drift |
| ------ | --------------- | ------------ | ----- |
| Pages | 40 (37 chapter + 3 landing) | 40 | ✅ |
| `dist/client/` total bytes | (implicit; +873 KB delta) | 5,195,079 B | — |
| Cumulative delta vs pre-M-UX baseline | +873 KB / +20.2% | **+756 KB / +17.5%** | ❌ -117 KB / -2.7pp |
| `data-interactive-only` count on lectures/ch_4 | 87 (per T9 issue file AC13) | **37** | ❌ -50 |
| Functional-tests harness cases / asserts | 17 / 28 | **19 / 30** | ❌ +2 / +2 |
| M3 events present in `dist/client/` | All 4 names | All 4 (24/72/60/24) | ✅ |
| Server-only path leaks | 0 | 0 | ✅ |
| Workflow path | `./dist/client` | `./dist/client` | ✅ |

Three of eight metrics drift on bullet 10. None affects correctness — but bullet 10's purpose is to be the closing claim a future reader uses to verify the milestone exit criteria. Stale claims defeat that purpose.

---

## Issue log — milestone-scope findings

| ID                | Severity | Status | Owner / next touch point |
| ----------------- | -------- | ------ | ------------------------ |
| M-UX-DR-01        | 🔴 HIGH  | ✅ RESOLVED 2026-04-25 (orchestrator surgical fix at milestone close-out) | bullet 10 numbers updated: 40 pages / +756 KB / +17.5% / 37 carriers / 19 cases / 30 asserts; harness-test count cited; b29d409 hotfix folded in |
| M-UX-DR-02        | 🟡 MEDIUM | DEFERRED to next architecture.md amendment cycle | architecture.md §1.6 amendment (3–5 lines on collection-landing pages) — non-blocking, doc-only |
| M-UX-DR-03        | 🟡 MEDIUM | DEFERRED to next architecture.md amendment cycle | architecture.md new subsection (verification gates / harness infra) — non-blocking, doc-only |
| M-UX-DR-04        | 🔴 HIGH  | ✅ RESOLVED 2026-04-25 (orchestrator surgical fix at milestone close-out) | `nice_to_have.md §UX-3` appended (interactive-mode harness extension) per T8's drafted prose |
| M-UX-DR-05        | 🟡 MEDIUM | ✅ RESOLVED 2026-04-25 — option (a) per auditor recommendation | `nice_to_have.md §UX-4` appended (CompletionIndicator JSON cleanup) with M5-coupled promotion trigger |
| M-UX-DR-06        | 🟢 LOW   | OPEN   | bullet 5 amendment (one line on `^\d+\.\d+\s` filter from b29d409) — fold into DR-01 fix |
| M-UX-DR-07        | 🟢 LOW   | OPEN, flag-only | unused `--mux-bp-desktop` / `--mux-col-{left,right}-rail` tokens — accept-as-is unless future sweep |
| M-UX-DR-08        | 🟢 LOW   | OPEN, flag-only | future visual-sweep Builder; harness-test for breadcrumb height invariant |
| M-UX-DR-09        | 🟢 LOW   | OPEN, flag-only | functional-tests.json mobile coverage (drawer-trigger visibility, RHS TOC closed-by-default at <1024px) |
| M-UX-DR-10        | 🟢 LOW   | OPEN (= T9-ISS-03) | future scripts/ ergonomics sweep; not blocking |
| M-UX-DR-11        | 🟢 LOW   | OPEN, flag-only | accept-as-is OR extract `<ModeDetectScripts.astro>` if a third layout joins |
| M-UX-DR-12        | 🟢 LOW   | OPEN, flag-only | extract shared `home.css` if more landing pages are added |
| M-UX-DR-13        | 🟢 LOW   | OPEN | fold into M-UX-DR-09 |

**Summary:** 2 HIGH, 3 MEDIUM, 8 LOW.

### Per-task issue file dispositions (final state, walked T1–T9)

| Issue file | Final status line | Open MEDIUM/HIGH residual |
| ---------- | ----------------- | ------------------------- |
| T1 | ✅ PASS | none |
| T2 | ✅ PASS | M-UX-T2-ISS-02 (MEDIUM, CompletionIndicator JSON) — orphaned at M-UX close → see M-UX-DR-05 |
| T3 | ✅ PASS | M-UX-T3-ISS-01 (MEDIUM, sticky regression) — RESOLVED at T8 cycle 1 |
| T4 | ✅ PASS (cycle 2) | M-UX-T4-ISS-02 (LOW, accept-as-is doc-amendment candidate) |
| T5 | ✅ PASS | none HIGH/MEDIUM (2 LOW flag-only) |
| T6 | ✅ PASS | M-UX-T6-ISS-01 (HIGH, manual-smoke gap) — DEFERRED chain → T7 → T8 → should-be-nice_to_have-but-isn't (M-UX-DR-04) |
| T7 | ✅ PASS (cycle 2) | M-UX-T7-ISS-04 + ISS-05 (MEDIUM docstring drifts) — RESOLVED at T8 |
| T8 | ✅ PASS | M-UX-T8-ISS-01 (MEDIUM, top-level milestone index) — RESOLVED orchestrator-side post-audit; M-UX-T8-ISS-02 (LOW, 30B subtotal drift) — OPEN; M-UX-T8-ISS-03 (LOW, harness extension nice_to_have entry) — DEFERRED but not landed → M-UX-DR-04 |
| T9 | ✅ PASS | M-UX-T9-ISS-01 (HIGH, bullet 10 stale text post-T9) — RESOLVED orchestrator-side post-audit; M-UX-T9-ISS-02/03/04 (LOW) — OPEN, flag-only |

**Net residual at milestone close:** the T6/T7/T8 chain DEFERRED to nice_to_have never landed (M-UX-DR-04 HIGH). T2-ISS-02 has no destination (M-UX-DR-05 MEDIUM). All other per-task findings RESOLVED.

### CHANGELOG audit

`git log --oneline e14813a..HEAD` returned 15 commits. Cross-reference against `CHANGELOG.md` 2026-04-24 + 2026-04-25 sections:

- All 9 task closes (T1–T9) have CHANGELOG entries ✅
- The b29d409 hotfix has a CHANGELOG entry (top of 2026-04-25 section) ✅
- Two infrastructure / process commits between T1 and T2 (`6f39c6c "a"` adding `.claude/agents/*` and `38c4a8b "bug fixes"` containing CHANGELOG addition + breakout-audit edits) — `6f39c6c` is gitignored-content-only (`.claude/` is in `.gitignore` — confirmed); `38c4a8b` is its own CHANGELOG addition. ✅ No drift.
- The T1 re-audit cycle (commit `aac1e82`) — present in audit issue file but has no separate CHANGELOG entry (subsumed under the original T1 close entry). Acceptable convention.

CHANGELOG ↔ commit correspondence: clean.

---

## Recommendations

### For an orchestrator surgical fix (no T10 needed)

1. **Fix bullet 10** to reflect post-b29d409 actual state (M-UX-DR-01). ~5 lines.
2. **Fix T9 issue file AC13** to match new baseline OR add a `## Post-T9 amendments` section. ~2 lines.
3. **Append `§UX-3`** entry to `nice_to_have.md` for the interactive-mode harness extension (M-UX-DR-04) using the prose already drafted in T8 issue file. ~30 lines.
4. **Fix bullet 5** with the top-level filter note (M-UX-DR-06). ~1 line. Fold into the DR-01 commit.
5. **Decide on T2-ISS-02 disposition** (M-UX-DR-05): nice_to_have / M5 carry-over / accept-with-rationale. User adjudication.

### For the next architecture.md amendment cycle (M5 kickoff or pre-M5 review)

6. **Add §1.6 collection-landing-pages note** (M-UX-DR-02). ~5 lines.
7. **Add §1.7 verification-gates subsection** (M-UX-DR-03). ~15 lines.

### For a future M-UX follow-on or M5 (non-blocking, flag-only)

8. **Mobile-viewport assertions** in functional-tests.json (M-UX-DR-09 + M-UX-DR-13).
9. **Breadcrumb-height token invariant** assertion (M-UX-DR-08).
10. **`scripts/functional-tests.py` argparse ergonomic sweep** (M-UX-DR-10 / T9-ISS-03).
11. **Shared home.css extraction** if more landing pages are added (M-UX-DR-12).
12. **`<ModeDetectScripts.astro>` extraction** if a third layout joins (M-UX-DR-11).

### Verdict on close-ability

M-UX is **substantially close-able** as shipped. The implementation is functionally correct, the harness produces machine-checkable evidence at every gate, and the per-task issue files are honest and complete. No T10 is required — the two HIGH findings (bullet 10 staleness + missing nice_to_have entry) are document-only fixes that can be addressed surgically by the orchestrator in the same session that closes this audit.

The drift between "what shipped" and "what the milestone README says shipped" on bullet 10 is the kind of finding the M2 + M3 deep-analysis cycles caught and that CLAUDE.md's status-surface non-negotiable was added to prevent. The b29d409 commit landing AFTER the milestone close, with a status-surface edit but without a milestone-README-bullet refresh, is exactly the pattern the rule guards against.

---

## Propagation status

- **M-UX-DR-01 (HIGH)** — orchestrator surgical fix on `m_ux_polish/README.md` bullet 10 + `T9_issue.md` AC13. No carry-over to a future task.
- **M-UX-DR-02 (MEDIUM)** — architecture.md §1.6 amendment. No carry-over to a future task; rolled into the next architecture amendment.
- **M-UX-DR-03 (MEDIUM)** — architecture.md new subsection. Same disposition as DR-02.
- **M-UX-DR-04 (HIGH, propagation-failure finding)** — append `§UX-3` entry to `nice_to_have.md` per drafted prose. No future task; the deferral now persists in the canonical "real but not urgent" parking lot.
- **M-UX-DR-05 (MEDIUM, T2-ISS-02 orphan)** — user adjudication required. Three options: (a) `nice_to_have.md` `§UX-4`, (b) carry-over to M5 spec when authored, (c) RESOLVED-with-rationale on `T2_issue.md`.
- **M-UX-DR-06 — M-UX-DR-13 (LOW)** — flag-only; no propagation.

No HIGH item requires a new task to address. M-UX milestone close is achievable with the surgical fixes named above.
