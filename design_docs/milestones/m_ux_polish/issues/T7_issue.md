# T7 — Mobile drawer + responsive sweep — Audit Issues

**Source task:** [../tasks/T7_mobile_drawer.md](../tasks/T7_mobile_drawer.md)
**Audited on:** 2026-04-25 (cycle 1) → 2026-04-25 (cycle 2 re-audit)
**Audit cycle:** 2 (cycle 1 closed ⚠️ OPEN with 2 HIGH + 3 MEDIUM; Builder ran a follow-up cycle 2 to close ISS-01 + ISS-02 + ISS-03)
**Audit scope (cycle 2 additions):** verification of (a) the new Selenium screenshot harness (`scripts/smoke-screenshots.py` + `requirements-dev.txt` + `scripts/smoke-routes.json` + `scripts/smoke-screenshots.md` + `.gitignore` extension) — non-inferential evidence path for the manual-smoke gap; (b) the Drawer single-DOM-tree refactor (LeftRail mounts ONCE; the existing `<aside data-slot="left-rail">` becomes the off-canvas drawer at <1024px via `position: fixed; transform: translateX(-100%)` + `body.drawer-open`); (c) re-grade of ISS-02 (size budget) — Builder recovered 618,218 bytes by collapsing the twice-render; the `+50KB` figure was identified as somewhat arbitrary by the user but the +1.42 MB symptom was a real design smell, now fixed; (d) re-grade of ISS-03 (duplicate IDs) — single-tree resolves it; (e) safety claims on the screenshot tool — headless, isolated `--user-data-dir`, ephemeral debugging port; (f) visual screenshot verification of layout claims (auditor opened 4 PNGs and read what they showed); (g) re-verify cycle 1 medium/low findings (ISS-04 docstring drift, ISS-05 conflated rationale, ISS-06/07/08 LOW) — did cycle 2 incidentally fix them?; (h) regression check — did the refactor break anything cycle 1 had right?
**Status:** ✅ PASS (cycle 2 closes the cycle 1 OPEN findings; ISS-04 + ISS-05 remain OPEN at MEDIUM but are non-blocking docstring drifts; LOW findings unchanged)

## Design-drift check

Cross-checks against [`design_docs/architecture.md`](../../../architecture.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), CLAUDE.md non-negotiables, and the deferred-parking-lot ([`nice_to_have.md`](../../../nice_to_have.md)):

- **architecture.md §1.6 line 125** — "Mobile (<1024px): single column. Left rail collapses to hamburger drawer in the breadcrumb bar. Right-rail TOC moves to a collapsed `<details>` summary at content top. Annotations pane stays gated on `data-interactive-only`." T7 lands all three: drawer trigger inside `Breadcrumb.astro`'s `drawer-trigger` slot (mobile-only via `@media (max-width: 1023.98px)` reveal); Drawer aside at body root via `Base.astro` `slot="drawer"`; RightRailTOC + AnnotationsPane wrapped in `<details>` at content top (right-rail re-orders above main at <1024px via Base.astro grid template-areas). ✅ no drift.
- **architecture.md §1.6 lines 134–137** — "Mobile drawer requires JS (one always-loaded island). Single graceful degradation: without JS, the drawer button is hidden and the left rail isn't reachable on mobile — desktop is unaffected." T7 satisfies this contract: `Drawer.astro` + `DrawerTrigger.astro` ship inline `<script>` blocks (Astro hoists into a shared chunk; same idiom as M3 islands). The DrawerTrigger button is unconditionally rendered into the breadcrumb but CSS-gated to `<1024px` only (so desktop is unaffected — the trigger is `display: none` at ≥1024px, removing it from layout AND tab order). Without JS at mobile, the trigger button is still present but the click handler (the inline script) does nothing — the user is stranded on mobile, which IS the documented graceful degradation. ✅ no drift.
- **ADR-0002 §"Decision" line 76** — "Mobile (≤1024px) — single column. Left rail becomes a drawer (hamburger button in the breadcrumb bar). Right-rail TOC moves to a collapsed-by-default `<details>` summary at the top of the content." Implementation lands the drawer + the `<details>` wrap. **Subtle deviation flagged but not drift:** Builder ships `<details open>` at desktop and at mobile initially (via the `is:inline` boot script using `matchMedia('(min-width: 1024px)')`) — at mobile, the `<details>` is `open` by default rather than ADR-0002's "collapsed-by-default." The Builder's docstring records the deliberate choice (RightRailTOC.astro lines 53–60: "leaving it open by default at mobile makes the TOC instantly visible without an extra tap, which respects ADR-0002's reader-workflow priority 'open chapter, jump around sections, annotate'"). Reasonable trade-off but technically off-spec. Logged as MEDIUM-3 below; not HIGH design drift because the spec line 53 itself describes "collapsed by default" as a UX choice rather than an immutable contract.
- **CLAUDE.md non-negotiables — Status-surface discipline (four surfaces).** (a) `T7_mobile_drawer.md:3` `**Status:** ✅ done 2026-04-25` ✓; (b) `tasks/README.md:15` `T7 ... ✅ done 2026-04-25` ✓; (c) milestone README task table line 42 `T7 ... ✅ done 2026-04-25` ✓; (d) milestone README Done-when bullet 9 (line 27) `[x] **Mobile (<1024px)** — single column with hamburger drawer for the left rail; right-rail TOC moves to a collapsed `<details>` summary at content top. Responsive transition tested at 1280, 1024, 768, 375 widths. (T7 issue file)` — flipped `[ ] → [x]` with parenthetical citation. **All four surfaces aligned.** Bullet 10 (deploy contract / size budget) remains `[ ]` — owned by T8, correct posture. Bullet 7 reword (M-UX-T6-ISS-02 wording fix) landed in this cycle: line 25 now reads "default slot, above article body — visual position keeps M3's floating bottom-left per spec MUX-BO-DA-6 option (i); position decision documented in T6 issue file" — accurately describes option (i) outcome. Status-surface verdict: ✅ aligned.
- **CLAUDE.md non-negotiables — Dependency audit gate.** `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements.txt` returns empty. ✅ no dep-manifest churn — dep audit skipped per CLAUDE.md exception.
- **CLAUDE.md non-negotiables — `nice_to_have.md` boundary.** No fresh adoption from `nice_to_have.md`; M-UX itself was promoted in the kickoff commit, but T7 doesn't pull any additional deferred-parking-lot items. ✅ no drift.
- **CLAUDE.md non-negotiables — Code-task verification (non-inferential).** T7 spec is a code task. Spec acceptance check section names six browser-driven manual smokes (1280/1024/768/375 viewport observation; hamburger click + drawer slide + chapter-link close; Tab focus-trap; Static-mode at 375px; M3 surfaces at 375px; build clean). Builder ran NONE of the browser-driven smokes — explicitly self-disclosed: "browser DevTools interactive observation isn't reachable from this shell environment." Builder ran structural smokes (HTML grep, extracted-CSS audit, `<script>` byte-identity). The structural evidence is strong but **not sufficient** under CLAUDE.md's code-task rule. The Carry-over from T6 already deferred the literal browser smokes to T7 (M-UX-T6-ISS-01) — T7 deferring AGAIN propagates the same gap forward to T8. Logged as HIGH-1 below.
- **Cross-chapter ref discipline.** No chapter content touched. ✅ no drift.
- **Sequencing intact.** T7 depends on T1 + T2 + T3 + T4 + T6 (all `✅ done`). Blocks T8 (`todo`). ✅ no drift.
- **Build artifact contract.** `dist/client/` shape unchanged: 37 prerendered pages, no `dist/api/`, hybrid-output split intact. Verified via `find dist/client -name "index.html" \| wc -l` = 37 and `ls dist/client/_astro/` shows: `Base.astro_astro_type_script_index_0_lang.Bnwq7kQ0.js` (84 bytes), `DrawerTrigger.Csox6oQw.css` (10,900 bytes — new T7 CSS bundle), `HomeLayout.astro_astro_type_script_index_0_lang.Bnwq7kQ0.js` (84 bytes), `_id_@_@astro.CaOzGWsw.css` (5,403 bytes), `index@_@astro.HjD9NihZ.css` (4,272 bytes), `mode.CxjE8wux.js` (228 bytes). Total `_astro/` = 20,971 bytes. ✅ no drift.

**Drift HIGH count: 0.** No design drift blocks the audit. The four surfaces flip cleanly. The remaining HIGH findings (HIGH-1 + HIGH-2) are process / size-budget findings, not architecture drift.

## Cycle 2 disposition (2026-04-25)

Builder ran a follow-up cycle 2 against the cycle 1 OPEN findings. Two deliverables landed:

1. **Selenium screenshot harness** — `scripts/smoke-screenshots.py` (322 lines) + `scripts/smoke-routes.json` (7 routes × variable viewports = 22 viewports total) + `scripts/smoke-screenshots.md` (install/usage doc) + `requirements-dev.txt` (selenium 4.43.0 pin) + `.gitignore` extension (`.smoke/screenshots/` ignored, `.smoke/.gitkeep` present so dir survives clones). The harness drives headless Chrome via Selenium 4, isolates the Chrome profile under `/tmp/cs300-smoke-<pid>` (created via `tempfile.mkdtemp`, cleaned via `shutil.rmtree` in the `finally` block), passes `--headless=new` + `--no-sandbox` + `--disable-gpu` + `--disable-dev-shm-usage` + `--lang=en-US`, sets viewport via `set_window_size(w, h)` BEFORE navigation so layout computes at target width from the start, waits for `document.readyState === 'complete'` + a 400ms settle, saves PNG via `driver.save_screenshot(...)`. Cycle 2 ran the harness end-to-end and produced 22 PNGs in `.smoke/screenshots/` totalling 2.29 MB.

2. **Drawer single-DOM-tree refactor** — cycle 1's twice-rendered LeftRail (one in the desktop left-rail slot + one inside `<Drawer>`) collapses to ONE LeftRail mount in the `slot="left-rail"` of every chapter route. The existing `<aside data-slot="left-rail">` rendered by `Base.astro` BECOMES the drawer at <1024px via the new CSS rule `@media (max-width: 1023.98px) { .chrome > [data-slot="left-rail"] { position: fixed; ... transform: translateX(-100%); transition: transform 200ms ease; z-index: 9999; } }` + `:global(body.drawer-open) .chrome > [data-slot="left-rail"] { transform: translateX(0); }`. `Drawer.astro` no longer renders an aside or a `<slot>` — it renders only the backdrop `<div id="drawer-backdrop">` + the JS island. The island queries `document.querySelector('aside[data-slot="left-rail"]')` to manage focus trap, `aria-hidden`, and link-click close. `Base.astro`'s `<aside>` got `id="drawer"` so `DrawerTrigger.astro`'s `aria-controls` continues to point at the same element.

### Cycle 2 safety verification on the Selenium harness

Auditor verified the three safety claims the orchestrator brief calls out:

| Safety claim | Verification | Result |
| ------------ | ------------ | ------ |
| Headless mode | `grep -n 'headless' scripts/smoke-screenshots.py` returns the `--headless=new` argument at line 207 plus 8 doc-comment references | ✅ confirmed |
| Isolated `--user-data-dir` | `tempfile.mkdtemp(prefix=f"cs300-smoke-{os.getpid()}-")` at line 286; arg passed to Chrome via `--user-data-dir={user_data_dir}` at line 208; `shutil.rmtree(user_data_dir, ignore_errors=True)` in `finally` at line 310 | ✅ confirmed (created → used → cleaned) |
| No fixed debugging port | `grep -nE 'remote-debugging-port\|9222\|--port\|debugging-port' scripts/smoke-screenshots.py` returns ONLY doc-comment hits at lines 37–38 + line 202 (all DOCUMENTING the absence). Source has zero `--remote-debugging-port` argument additions to `Options`. | ✅ confirmed (chromedriver picks ephemeral port) |

The script also calls `assert_preview_reachable(base_url)` at startup (line 276) so the user gets a clear error if `npm run preview` isn't running, instead of a Chrome timeout. Exit 0 only if at least one screenshot was saved (`return 0 if saved else 1` at line 318). No external network access beyond the localhost preview server (every screenshot fetch is a `driver.get(localhost:4321/...)`).

### Cycle 2 visual evidence (auditor opened 4 PNGs)

The auditor used the multimodal Read tool to load four key PNGs out of the 22 captured. **This is the non-inferential browser-driven evidence the cycle 1 audit said was needed.** Layout claims verified:

- **`lectures-ch4-1280x800.png` (desktop, 1280px wide).** Three-column layout confirmed: left rail visible (REQUIRED chapters ch_1–ch_6 with section dropdowns visible, OPTIONAL ch_7+ scrollable, ch_4 highlighted as current), main column with "Chapter 4 — Lectures" heading + "Lists, stacks, queues, deques" subtitle + chapter map with bullet list (Pointer-based lists, Sentinel/dummy-node idiom, Three restricted list ADTs, Array-based lists), right rail with "ON THIS PAGE" TOC visible (4.1 The List ADT, 4.2 Singly Linked Lists: Append and Prepend, 4.3 Singly Linked Lists: Insert-After). Sticky breadcrumb top-left with `cs-300 / Lectures / ch_4 — Lists, stacks, queues, deques`. **No drawer surfaces visible.** Matches spec AC1 (1280: three-column grid + sticky breadcrumb).
- **`lectures-ch4-1024x768.png` (1024px boundary, IS desktop per `<1024` rule).** Three-column layout still — left rail visible with REQUIRED + OPTIONAL chapter list + ch_4 highlighted, main with "Chapter 4 — Lectures" heading + chapter map, right rail with "ON THIS PAGE" header expanded showing 4.1 (The contract: operations, What the contract doesn't say, ...). Confirms the breakpoint contract: `<1024` is mobile, `≥1024` is desktop, so 1024 IS desktop. Matches spec AC1 (1024: three-column desktop).
- **`lectures-ch4-768x1024.png` (tablet, 768 px wide).** Single-column layout: hamburger button visible top-left (3-bar icon), breadcrumb spanning the full width to the right (`cs-300 / Lectures / ch_4 — Lists, stacks, queues, deques`), tab pills below (`<ch_3` / `Lectures` (highlighted) / `Notes` / `Practice` / `ch_5>`), then a collapsed `<details>` rail with `▶ ON THIS PAGE` summary visible at content top, followed by the main content "Chapter 4 — Lectures" + chapter map. **Drawer is closed by default** (no aside visible). **No horizontal scroll** (right edge has only the page scrollbar; no chapter list peeks in from the left). Matches spec AC1 (768: single column + hamburger + right-rail TOC collapsed `<details>` at top of content).
- **`lectures-ch4-375x812.png` (mobile, 375px wide).** Same single-column layout as 768 but tighter: hamburger top-left, breadcrumb wrapping to two lines (`cs-300 / Lectures` then `/ ch_4 — Lists, stacks, queues, deques`), tab pills row (cropped on the right because `<ch_3` doesn't fit; the next/prev nav still shows but it's narrow — readable but tight), `▶ ON THIS PAGE` collapsed `<details>` strip below, then main content. **Drawer closed by default; left rail hidden.** **No horizontal scroll** observed (the chapter map's prose wraps cleanly within the viewport). Typography readable at base size — matches ADR-0002's deferred-typography-sweep posture (no font-size shrinkage at narrow widths). Matches spec AC1 (375: same as 768 + no horizontal scroll + readable typography).

Auditor also opened **`index-1280x800.png`** as an incidental confirmation: index page shows the dashboard placeholder rendered at desktop with REQUIRED + OPTIONAL chapter cards (CH_1 / CH_2 / CH_3 / CH_4 / CH_5 / CH_6 in REQUIRED, CH_7 / CH_9 / CH_10 in OPTIONAL visible), each card with Chapter N + lecture/notes/practice links. **No drawer surfaces present** — confirms `grep -c 'id="drawer"' dist/client/index.html` = 0. Index page does not mount a drawer (no left rail to drawer-ify), as Base.astro's docstring promises.

### Cycle 2 size + smoke verification (auditor re-ran from scratch)

| Gate | Cycle 1 result | Cycle 2 result | Verdict |
| ---- | -------------- | -------------- | ------- |
| `du -sb dist/client/` | `5,875,894` bytes | `5,257,676` bytes | ✅ recovered **618,218 bytes**; cumulative vs pre-M-UX `4,420,947` = `+836,729` bytes (was +1,454,947) |
| `find dist/client -name "index.html" \| wc -l` | 37 | 37 | ✅ unchanged |
| `grep -c 'class="left-rail"' dist/client/lectures/ch_4/index.html` | 2 | **1** | ✅ single-tree |
| `grep -oE ' id="cs300-completion-indicator(-data)?"' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` | 2× each | **1× each** | ✅ duplicate IDs gone |
| `grep -oE 'data-interactive-only' dist/client/lectures/ch_4/index.html \| wc -l` | 100 | **87** | ✅ +1 over T6 baseline 86 (the new AnnotationsPane mobile-collapse wrapper carries `data-interactive-only` on both wrapper + inner aside; T6 baseline was 86; cycle 1 was 100 = T6 + 12 twice-rendered checkmarks + 1 CompletionIndicator root + 1 wrapper = 100; cycle 2 collapses to 86 + 1 wrapper carrier = 87) |
| `grep -c 'class="left-rail"' dist/client/notes/ch_4/index.html` | 2 | **1** | ✅ single-tree |
| `grep -oE 'data-interactive-only' dist/client/notes/ch_4/index.html \| wc -l` | 27 | **14** | ✅ matches T6 baseline 14 (notes/practice carry no AnnotationsPane wrapper; +12 from cycle 1 twice-render recovered) |
| `grep -oE 'data-interactive-only' dist/client/practice/ch_4/index.html \| wc -l` | 27 | **14** | ✅ same recovery |
| `grep -c 'id="drawer"\|id="drawer-trigger"\|id="drawer-backdrop"' dist/client/lectures/ch_4/index.html` | 3 | **3** | ✅ drawer DOM elements unchanged (1 each) |
| `grep -c 'id="drawer"\|id="drawer-trigger"\|id="drawer-backdrop"' dist/client/index.html` | 0 | **0** | ✅ index has no drawer surfaces (correct — no left rail to drawer-ify) |
| `body.drawer-open` rules in extracted CSS | present | **present** | `body.drawer-open .chrome[data-astro-cid-...]>[...][data-slot=left-rail]{transform:translate(0)}` + `body.drawer-open{overflow:hidden}` + `body.drawer-open #annotate-button, body.drawer-open #mark-read-button, body.drawer-open .interactive-badge {display:none!important}` |
| `transform: translateX(...)` rules | present (separate aside) | **present** (on the data-slot aside) | `translate(-100%)` + `translate(0)` confirmed in `dist/client/_astro/DrawerTrigger.DRP-JeaZ.css` |
| M3 contracts | 1d+2L / 1d+1L / 1d+1L | **unchanged** | `cs300:read-status-changed` 1×D + 2×L; `cs300:toc-read-status-painted` 1×D + 1×L; `cs300:annotation-added` 1×D + 1×L; `cs300:drawer-toggle` 1×D + 1×L (T7 contract intact) |
| LeftRail.astro + CompletionIndicator.astro zero-diff | n/a | ✅ `git diff HEAD -- src/components/chrome/LeftRail.astro src/components/chrome/CompletionIndicator.astro` returns empty | confirms cycle 2 didn't touch these |
| MarkReadButton + AnnotateButton zero-diff | preserved | **preserved** | M3 surface APIs unchanged |

### Cycle 2 disposition table (cycle 1 finding → cycle 2 verdict)

| Cycle 1 finding | Cycle 1 verdict | Cycle 2 disposition | Reasoning |
| --------------- | --------------- | ------------------- | --------- |
| **M-UX-T7-ISS-01 / HIGH** — manual-smoke gap | ⚠️ DEFERRED to T8 | ✅ **RESOLVED 2026-04-25** | The Selenium harness produces non-inferential PNG evidence. Auditor opened 4 PNGs and verified the layout claims (1280 = three-column, 1024 = three-column, 768 + 375 = single-column with hamburger + drawer closed + no horizontal scroll). This is the literal browser-driven evidence cycle 1 said was missing. **Static-mode-only is acknowledged limitation** — the harness boots into static mode because `/api/health` isn't reachable behind `npm run preview`; interactive-mode coverage (annotations round-trip, mark-read button click, focus-trap Tab cycle) is documented as a future addition. The cycle 1 ISS-01 finding was specifically about layout-at-viewport observation, which static-mode fully covers. The interactive-mode round-trip + focus-trap smokes that T6-CO1 calls out remain a residual gap, but they're qualitatively a smaller surface than "is the layout right at every breakpoint" — and they're already named in T8's carry-over for browser-driven verification. |
| **M-UX-T7-ISS-02 / HIGH** — size budget +1.42 MB | ⚠️ DEFERRED to T8 (paired with T2-ISS-02) | ✅ **RESOLVED 2026-04-25** (re-graded against the actual user concern) | Per orchestrator brief: the literal `+50KB` figure was identified as somewhat arbitrary by the user, but the +1.42 MB was a real design smell (twice-rendered SSR data is exactly the case where the size hit signals a structural mistake, not an unavoidable cost). Cycle 2 fixes the structural mistake — single DOM tree means CompletionIndicator JSON emits ONCE per page, not twice; LeftRail HTML emits ONCE per page, not twice. **618 KB recovered.** Cumulative vs pre-M-UX is now +836,729 bytes / ~817 KB, of which ~444 KB is still the T2-introduced CompletionIndicator embed (single instance, not doubled — that's still owned by T2-ISS-02 as a cleaner architectural fix if the user wants to push the budget further). The +50KB literal commitment in milestone README bullet 10 still doesn't pass on a strict reading, but the user's actual concern (bad design pattern doubling the cost) is now closed. T8 owns the residual T2-ISS-02 budget question; it's no longer a T7 finding. |
| **M-UX-T7-ISS-03 / MEDIUM** — duplicate `id="cs300-completion-indicator"` + `id="cs300-completion-indicator-data"` | ⚠️ DEFERRED to T8 | ✅ **RESOLVED 2026-04-25** | Single DOM tree → single CompletionIndicator emission → single `id="cs300-completion-indicator"` + single `id="cs300-completion-indicator-data"` per page. Verified: `grep -oE ' id="cs300-completion-indicator(-data)?"' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` returns `1 id="cs300-completion-indicator"` + `1 id="cs300-completion-indicator-data"`. HTML5 conformance restored on the entire chapter-route surface (36 pages × 2 IDs each = 72 invalid-id markers eliminated). |
| **M-UX-T7-ISS-04 / MEDIUM** — RightRailTOC + AnnotationsPane docstrings claim `<details open>` initial state at every viewport | ⚠️ OPEN | ⚠️ **STILL OPEN** | Cycle 2 didn't touch these docstrings. RightRailTOC.astro line 50 still claims `<details class="toc-mobile-collapse" open>` despite source line 108 having `<details class="toc-mobile-collapse">` (no `open`). AnnotationsPane.astro lines 38–43 still claim `<details open>` despite source line 82 having no `open`. **Functionally inert** (source-of-truth is correct; docstrings are wrong-but-harmless documentation drift). Owner: T7 follow-up commit OR T8 incidental pickup. Single-block edit on each frontmatter docstring. |
| **M-UX-T7-ISS-05 / MEDIUM** — RightRailTOC docstring rationale on single-tree wrap is partly conflated (id-collision claim) | ⚠️ OPEN | ⚠️ **STILL OPEN** | RightRailTOC.astro lines 60–65 still cite "avoids the id-collision risk on the sibling RightRailReadStatus island (#cs300-toc-read-status)" — the conflation noted in cycle 1. Outcome (single-tree) remains correct; rationale remains imprecise. Owner: T7 follow-up commit OR T8 incidental pickup. One-paragraph edit. |
| **M-UX-T7-ISS-06 / LOW** — `<details>` desktop-open boot script timing (sub-frame FOUC) | flag-only | flag-only (unchanged) | Boot scripts in RightRailTOC.astro:292 + AnnotationsPane.astro:220 are unchanged at cycle 2. Theoretical FOUC window remains; in practice the `is:inline` script runs same-parse-task as the `<details>` element so no real flash. T8 manual smoke catches if it materialises. |
| **M-UX-T7-ISS-07 / LOW** — Drawer focus-trap doesn't intercept non-link buttons inside drawer (no current consumers) | flag-only | flag-only (unchanged) | Drawer.astro's link-click close handler (now at lines 286–295) targets `target.closest('a[href]')` only. LeftRail still has no non-link buttons inside the drawer-effective aside, so no real risk. Future LeftRail additions would need to opt out explicitly. |
| **M-UX-T7-ISS-08 / LOW** — CHANGELOG `data-interactive-only` count breakdown prose imprecise | flag-only | RESOLVED-by-supersede | Cycle 2 CHANGELOG entry restates the count without the conflated phrasing. Cycle 1's 100-count narrative is now historical (cycle 2 returns to T6 baseline + the wrapper). Numerical claim trivially correct (87 = 86 + 1 wrapper carrier). T8 close-out CHANGELOG editor-pass can fold the cycle 1 + cycle 2 narratives into one if desired; not blocking. |

### Cycle 2 verdict

**Status flips ⚠️ OPEN → ✅ PASS.** Both cycle 1 HIGH findings (ISS-01 + ISS-02) close in cycle 2 — ISS-01 via the screenshot harness (non-inferential evidence path now exists + was used + produced confirming PNGs), ISS-02 via the single-DOM-tree refactor (618 KB recovered; the bad design pattern is gone; the residual budget question is owned by T2-ISS-02 / T8). The MEDIUM finding ISS-03 (duplicate IDs) closes incidentally — single tree = single ID per page. The two MEDIUM docstring drifts (ISS-04 + ISS-05) remain OPEN but are non-blocking (functionally inert documentation drift, source-of-truth is correct). LOW findings unchanged. **No regression introduced by the cycle 2 refactor:** LeftRail.astro + CompletionIndicator.astro have zero diff; M3 contracts (1d+2L / 1d+1L / 1d+1L) preserved; MarkReadButton + AnnotateButton untouched; all four status surfaces still aligned; build still 37 pages exit 0; index page still has no drawer surfaces (correct posture).

**Override of Builder report:** none on the technical claims — every byte count, smoke grep, file diff, and CSS-rule extraction reproduces. The Builder's headline claims are accurate. The auditor adds two adjacent observations the Builder did NOT make: (a) ISS-04 + ISS-05 docstrings remain unchanged in cycle 2, so they stay OPEN; (b) the cycle 2 fix paid for itself in pure recovery (618 KB) without adding any complexity beyond a single CSS @media block, which is a strictly better outcome than the cycle 1 twice-render and is the kind of simplification that should have been the cycle 1 path.

## AC grading

T7 spec lists 6 deliverables (D1–D6 in the *Deliverable* section), 6 acceptance checks (AC1–AC6 in the *Acceptance check* section), 7 process steps (Steps 1–7), and 2 Carry-over items (CO1: M-UX-T6-ISS-01 / HIGH; CO2: M-UX-T6-ISS-03 / MEDIUM). Graded individually below.

### Deliverables (Deliverable section, spec lines 13–20)

| AC | Status | Notes |
| -- | ------ | ----- |
| **D1** — `Drawer.astro` JS island: hamburger button in breadcrumb (visible <1024px via CSS), drawer overlay with backdrop, focus trap, `aria-expanded` reflects state | ✅ PASS (with deviation) | Builder splits the spec's single-component description into TWO files: `Drawer.astro` (overlay + backdrop + open/close logic) + `DrawerTrigger.astro` (hamburger button). **Deviation reasoning is sound** — a single Astro component cannot route to two parent slots simultaneously, but the spec's Step 1 (line 26) explicitly mandates the BUTTON inside `Breadcrumb.astro`'s drawer-trigger slot AND the ASIDE at body root. The split is forced by the framework, not over-engineering. Communication via `cs300:drawer-toggle` CustomEvent matches the existing M3 inter-island pattern (`cs300:read-status-changed`, `cs300:annotation-added`, `cs300:toc-read-status-painted`). All four behavioural sub-contracts present in source: trigger-click → toggle (DrawerTrigger.astro:117–119); backdrop-click → close (Drawer.astro:339); Escape → close (Drawer.astro:344–349); focus-trap on Tab + first/last wrap (Drawer.astro:351–370); link-click inside drawer → close (Drawer.astro:375–380); `aria-expanded` toggled in open()/close() functions (Drawer.astro:294, 308). |
| **D2** — `Breadcrumb.astro` updated: gains slot for drawer trigger button, hamburger visible only at <1024px | ✅ PASS | `<slot name="drawer-trigger" />` added at Breadcrumb.astro:118, inside `<nav class="breadcrumb">` flex row, ahead of the path indicator. CSS gating lives on the consumer button (`DrawerTrigger.astro:99-105` `@media (max-width: 1023.98px) { .drawer-trigger { display: inline-flex; align-items: center; justify-content: center; } }`); button is `display: none` at desktop. Verified in extracted CSS bundle: `dist/client/_astro/DrawerTrigger.Csox6oQw.css` carries `@media(max-width:1023.98px)` rule with `.drawer-trigger` reveal. |
| **D3** — `LeftRail.astro` updated: same SSR chapter list at <1024px renders inside drawer slot instead of fixed left column | ✅ PASS (twice-rendered per spec Step 2 option (a)) | Implementation uses spec Step 2 option (a) — twice-render. `<LeftRail slot="left-rail" />` (desktop) + `<Drawer slot="drawer"><LeftRail /></Drawer>` (mobile-effective). Verified in built HTML: `grep -c 'class="left-rail"'` returns 2 on every chapter route (lectures + notes + practice × 12 = 36 pages), 0 on index. Desktop left-rail CSS-hidden at <1024px (Base.astro:140–144 `@media (max-width: 1023.98px) { .chrome > [data-slot="left-rail"] { display: none; } }`). **Twice-render side effect (HIGH-2 below):** duplicate `id="cs300-completion-indicator"` + `id="cs300-completion-indicator-data"` produced — CompletionIndicator inner script uses `getElementById` (returns first only) so listeners attach once, BUT the JSON data block is duplicated (12,349 bytes × 2 × 36 pages ≈ 889 KB redundant inline JSON, the literal source of the +685 KB build delta). Functionally works at runtime; HTML5 invalid; size cost is the bulk of the budget breach. |
| **D4** — `RightRailTOC.astro` updated: at <1024px wraps in `<details>` (collapsed by default) at top of content; desktop renders as fixed right rail per T4 | ✅ PASS (with deviation; see MEDIUM-3) | Builder ships **single-tree** `<details class="toc-mobile-collapse">` wrap (vs spec Step 3's "twice-render pattern as LeftRail"). Reasoning in RightRailTOC.astro:60–65 cites id-collision avoidance on sibling RightRailReadStatus / AnnotationsPane (the cited reasoning is partly conflated — twice-rendering RightRailTOC wouldn't directly duplicate `#cs300-toc-read-status` since that ID lives in the SIBLING RightRailReadStatus component, not in RightRailTOC; but the OUTCOME of single-tree is sound and consistent with AnnotationsPane's required single-tree). Desktop semantics preserved via `is:inline` boot script setting `details.open = true` at `matchMedia('(min-width: 1024px)')` — content visible at desktop because the `<summary>` is CSS-hidden + `<details open>` keeps content rendered. **Deviation from "collapsed by default" at mobile (MEDIUM-3):** the same boot script's logic only sets `open = true` at desktop; at mobile the initial `<details>` state is the parsed-DOM default (no `open` attribute → CLOSED), so AT FIRST PAINT at mobile the TOC is collapsed. WAIT — re-checking: the source `<details class="toc-mobile-collapse">` (RightRailTOC.astro:108) has NO `open` attribute. Browser default is closed. At mobile the boot script's `apply(mql)` only opens IF `mql.matches` (i.e. ≥1024px). At <1024px the script does nothing on initial paint → TOC stays collapsed. **OK — initial-state-at-mobile IS collapsed-by-default per ADR-0002.** Verified by source-read: `RightRailTOC.astro:108` `<details class="toc-mobile-collapse">` (no `open`); boot script line 317–319 `if (e.matches) { d.open = true; }` only fires at desktop. **AnnotationsPane is the inverse:** spec line 19 says "collapsed by default" but the Builder's docstring (AnnotationsPane.astro:43) claims `<details open>` on initial paint at every viewport — actual source line 82 `<details class="annotations-mobile-collapse" data-interactive-only>` has NO `open` attribute. Same pattern as RightRailTOC. Source-of-truth corrects the docstring claim — at mobile, AnnotationsPane is also collapsed-by-default. Both wrappers honour ADR-0002 + spec line 19 collapsed-by-default contract. ✅ accurate at the source-of-truth level; docstring drift documented as LOW-2. |
| **D5** — `AnnotationsPane.astro` re-homed in T6 — at <1024px also wraps in `<details>` below TOC's `<details>` (or inside separate collapsed section). Stays `data-interactive-only` | ✅ PASS | Wrap added at AnnotationsPane.astro:82 `<details class="annotations-mobile-collapse" data-interactive-only>` containing the existing `<aside id="annotations-pane" data-interactive-only ...>`. **Both** the wrapper AND the inner aside carry `data-interactive-only` (defence-in-depth — if the wrapper is ever removed in a future change, the inner aside still hides in static mode). M3 `<script>` block byte-identical to HEAD baseline (verified by `diff <(git show HEAD:...) <(cat ...)` returning empty output). DOM order on lectures/ch_4 verified via byte-offset grep: TOC `<details>` @ 534218 → ScrollSpy ~565600 → ReadStatus @ 567710 → AnnotationsPane `<details>` @ 568406 → inner `<aside>` @ 568675 — matches T6 audit's recorded ordering with small forward shifts from the new wrapper markup. |
| **D6** — Full responsive sweep across every chrome component, tested at 1280 / 1024 / 768 / 375 | ⚠️ DEFER (structural pass; literal viewport observation not run) | Builder did NOT run the literal DevTools viewport observation at the four widths (explicitly self-disclosed). Structural sweep landed: extracted CSS bundles audited at every breakpoint (`DrawerTrigger.Csox6oQw.css` carries 2× `@media(max-width:1023.98px)`, 1× `@media(max-width:767.98px)`, 1× `@media(min-width:1024px)`; `_id_@_@astro.CaOzGWsw.css` carries 3× `@media(max-width:1023.98px)`); `body.drawer-open` suppression rules present + correct (`overflow: hidden` + `display: none` on `#annotate-button`/`#mark-read-button`/`.interactive-badge`); `.drawer { transform: translate(-100%); transition: transform .2s ease; z-index: 9999 }` + `.drawer.open { transform: translate(0) }` + `.drawer-backdrop { opacity: 0; transition: opacity .2s ease; z-index: 9998 }` + `.drawer-backdrop.open { opacity: 1 }` all present. Status: PASS at structural level; literal viewport observation deferred to T8 (HIGH-1). |

### Acceptance checks (Acceptance check section, spec lines 45–54)

| AC | Status | Notes |
| -- | ------ | ----- |
| **AC1** — Auditor opens `/DSA/lectures/ch_4/` in `npm run preview`, resizes DevTools to 1280/1024/768/375, cites observed layout at each | ⚠️ DEFER | Browser-driven manual smoke. Builder did not run; auditor environment also lacks an interactive harness. Structural surface (extracted CSS at every breakpoint + DOM-grep at every page) is verified — see HIGH-1 for propagation to T8. |
| **AC2** — Auditor clicks hamburger at 375px; drawer slides in; chapter-link click → close; Escape → close; backdrop-click → close | ⚠️ DEFER | Browser-driven manual smoke. Source inspection confirms all four close paths (DrawerTrigger.astro:117–119 dispatches `cs300:drawer-toggle`; Drawer.astro:336 listens; click on `a[href]` inside drawer triggers close at line 375–380; Escape at line 347–349; backdrop click at line 339). Structural pass; literal pass deferred to T8 (HIGH-1). |
| **AC3** — Accessibility: Tab from hamburger enters drawer when open, cycles through chapter links, wraps back, Escape closes, focus returns to hamburger on close | ⚠️ DEFER | Browser-driven manual smoke. Source inspection confirms focus-trap implementation (Drawer.astro:351–370 with `focusables()` re-query on every Tab + first/last wrap), focus restore via `lastFocused ?? document.getElementById('drawer-trigger')` at line 311. Structural pass; literal pass deferred to T8. |
| **AC4** — Static mode (preview, no /api/health) at 375px: drawer shows chapter list (SSR-rendered, works without read-status fetch); right-rail TOC `<details>` present + expands; no console errors | ⚠️ DEFER (structural pass) | Drawer + drawer-backdrop + drawer-trigger DOM elements present at every chapter route (verified). `<details>` wrappers present at every lectures route. Static-mode hide rule preserves `data-interactive-only` carriers — `body[data-mode="static"] [data-interactive-only] { display: none !important; }` lives at Base.astro:89–91 unchanged. The wrapper `<details class="annotations-mobile-collapse" data-interactive-only>` carries the attribute on the wrapper so the entire collapsible (summary + inner aside) hides in static mode. Console-error verification requires browser; deferred to T8. |
| **AC5** — M3 interactive surfaces at 375px (when interactive mode reachable): annotations pane in collapsed `<details>` after TOC; mark-read button still accessible; floating annotate button still works on selection | ⚠️ DEFER (structural pass) | Source-level verified: M3 `<script>` byte-identical, all M3 contracts preserved (1d+2L / 1d+1L / 1d+1L), MarkReadButton + AnnotateButton zero-diff, AnnotationsPane wrapper preserves `data-interactive-only` + the inner aside script's `getElementById('annotations-pane')` still resolves (the wrapper is a parent, not a sibling). At <1024px when drawer is OPEN, `body.drawer-open #mark-read-button { display: none !important; }` rule deliberately hides the mark-read button so it doesn't paint on top of the drawer overlay — this is an intentional UX decision that drops the mark-read affordance during drawer-open state. **OK** (drawer-open is transient; user closes drawer to mark a section read). |
| **AC6** — All 37 prerendered pages still build (`npm run build` exit 0); drawer JS bundled as one small island; cite size delta in `dist/client/_astro/` | ✅ PASS | Auditor `npm run build` from scratch: 37 pages prerendered, server built in 8.82s, exit 0. `find dist/client -name "index.html" \| wc -l` = 37 (matches). `dist/client/_astro/DrawerTrigger.Csox6oQw.css` = 10,900 bytes (the new T7 CSS bundle — matches Builder's claim of "~17 KB total" with the inline JS). Net new `_astro/` delta: post-T7 `_astro/` total 20,971 bytes vs the T6 `_astro/` baseline (no DrawerTrigger.css existed). The drawer JS itself is inline `<script>`s (DrawerTrigger.astro + Drawer.astro), Astro hoists each into the rendered HTML — they don't show up as standalone `_astro/*.js` files. **However**, the overall `dist/client/` size delta is +701,931 bytes (+13.5%), driven primarily by the twice-rendered LeftRail's duplicated JSON data blocks (HIGH-2 below). Pages still build; build-clean criterion satisfied. |

### Process steps (Steps section, spec lines 24–42)

| AC | Status | Notes |
| -- | ------ | ----- |
| **Step 1 — Build `Drawer.astro`** (with sub-rules: step-ordering, hamburger-inside-Breadcrumb-slot, focus trap, etc.) | ✅ PASS | Step 16 (Breadcrumb slot declaration) landed alongside Step 1's Drawer build — verified by `git diff HEAD -- src/components/chrome/Breadcrumb.astro` showing the `<slot name="drawer-trigger" />` addition. Hamburger button mounted inside Breadcrumb's drawer-trigger slot (per MUX-BO-DA2-F + MUX-BO-ISS-04). Drawer aside at body root via Base.astro `slot="drawer"`. Focus trap implemented. `cs300:drawer-toggle` event-based communication. |
| **Step 2 — LeftRail moved into drawer at <1024px** (option (a) twice-render lean) | ✅ PASS (option (a) per spec lean) | Twice-rendered. See D3 above. Trade-off documented in Builder's `[id].astro` header docstrings + this issue file (HIGH-2). |
| **Step 3 — RightRailTOC wrapped in responsive wrapper** (spec lean: same twice-render pattern as LeftRail) | ⚠️ PARTIAL (deviation: single-tree) | Builder ships single-tree wrap, not twice-render. Reasoning sound (id-collision avoidance on sibling components AND consistency with AnnotationsPane's required single-tree). Reasoning citation in source is partly conflated (RightRailReadStatus is a SIBLING of RightRailTOC, not embedded inside it — twice-rendering RightRailTOC wouldn't directly duplicate `#cs300-toc-read-status`; the actual collision risk is on AnnotationsPane's IDs which are inside ITS own component tree). Outcome is correct; rationale is imprecise. Logged as LOW-1 (rationale documentation drift). |
| **Step 4 — Same pattern for AnnotationsPane** | ✅ PASS | Single-tree wrap (consistent with Step 3). `data-interactive-only` preserved. Inner `<aside id="annotations-pane">` carries `max-height: 50vh; overflow-y: auto` — long annotations scroll inside the bounded inner aside, NOT inside the `<details>` accordion. Resolves M-UX-T6-ISS-03 at structural level. |
| **Step 5 — Responsive typography sweep at 375px** (verify ~75ch doesn't force horizontal scroll) | ⚠️ DEFER (CSS-rule audit; literal observation deferred) | Base.astro:224–228 `@media (max-width: 767.98px) { .chrome > [data-slot="main"] { padding: var(--mux-space-4) var(--mux-space-3); } }` — main padding tightens at narrow viewports. `--mux-content-max: 75ch` constraint stays, but `min-width: 0` on main slot (Base.astro:148) prevents grid overflow. Structural audit: looks correct; literal 375px observation deferred to T8. |
| **Step 6 — Smoke each breakpoint in DevTools (1280/1024/768/375); cite observed layout** | ⚠️ DEFER (browser-driven; deferred to T8) | Same posture as AC1. |
| **Step 7 — Accessibility smoke (Tab through drawer, focus return, Escape, screen-reader)** | ⚠️ DEFER (browser-driven; deferred to T8) | Same posture as AC3. |

### Carry-over from prior audits (spec Carry-over section, lines 66–75)

| AC | Status | Notes |
| -- | ------ | ----- |
| **CO1 — M-UX-T6-ISS-01 (HIGH, DEFERRED from T6 cycle 1)** — Run T6's three browser-driven acceptance smokes inside T7 `npm run dev` responsive session: (1) interactive-mode DOM observation at 1280 + 375 widths; (2) end-to-end round-trip select → annotate → reload → persist; (3) `npm run preview` static-mode invisibility | ⚠️ DEFER (still structural; literal browser observation not run; propagated to T8) | Builder ticked `[x]` in spec at line 68; disposition note records that "browser DevTools interactive observation isn't reachable from this shell environment." Structural smokes ran (HTML grep confirms M3 surfaces present + `data-interactive-only` carriers + DOM byte-offset ordering preserved). Literal browser observation gap remains — IS the same gap T6 cycle 1 deferred. T7 deferring AGAIN propagates the gap forward. **Disposition: still DEFERRED to T8.** Bullet 7 reword (M-UX-T6-ISS-02) DID land in T7 — milestone README line 25 reworded accurately. |
| **CO2 — M-UX-T6-ISS-03 (MEDIUM, DEFERRED from T6 cycle 1)** — Verify AnnotationsPane reads cleanly inside mobile collapsed-rail `<details>` at <1024px (long-annotation truncation, max-height 50vh + overflow-y: auto inside collapsed `<details>`) | ✅ RESOLVED at structural level | Wrapper landed (`<details class="annotations-mobile-collapse" data-interactive-only>` around `<aside id="annotations-pane">`). Script tag byte-identical: `a.text.length > 80 ? a.text.slice(0, 80) + '…' : a.text` truncation rule unchanged at AnnotationsPane.astro:285. `max-height: 50vh; overflow-y: auto` preserved on inner `#annotations-pane` (lines 169–170). `@media (max-width: 1023.98px)` rule resets `margin-top`/`padding-top`/`border-top` to 0 on `#annotations-pane` (lines 177–183) — the wrapper's summary handles visual separation, dropping the redundant top border. Verified in extracted CSS bundle `dist/client/_astro/_id_@_@astro.CaOzGWsw.css`. Structural verdict: long annotations scroll inside the bounded inner aside, NOT inside the `<details>` accordion — the accordion stays well-behaved. Literal observation at 375px is still owed (rolled into T8 generic mobile smoke). Status: **RESOLVED at structural level**, with the literal observation folded into HIGH-1's T8 propagation. |

**AC totals (cycle 1):** D1–D6 = 5 PASS / 0 FAIL / 1 DEFER; AC1–AC6 = 1 PASS / 0 FAIL / 5 DEFER; Steps 1–7 = 4 PASS / 1 PARTIAL / 2 DEFER; Carry-over = 1 RESOLVED / 1 DEFER. **Cycle 1 total: 11 PASS / 1 PARTIAL / 8 DEFER / 1 RESOLVED.**

**AC totals (cycle 2 re-grade):** D1 PASS (drawer + trigger contract intact, single-tree refactor preserves all four close paths); D2 PASS (Breadcrumb slot unchanged); D3 PASS — re-graded from "twice-render per spec Step 2(a)" to "single-tree per cycle 2 refactor" — the spec's Step 2 (line 36) explicitly listed (b) "Render LeftRail once, use CSS to move it" as an acceptable option ("trickier CSS"); cycle 2 lands option (b) cleanly in ~50 lines of @media CSS, which is not particularly tricky once `position: fixed; transform` is allowed; D4 + D5 unchanged; D6 PASS (responsive sweep evidence now exists via the harness — auditor opened 4 PNGs and confirmed all four breakpoints behave per spec). AC1 PASS (auditor opened lectures-ch4-1280x800 + 1024x768 + 768x1024 + 375x812 PNGs and cited observed layout at each — see Cycle 2 visual evidence section above). AC2 + AC3 still DEFER (interaction smokes — click hamburger, Tab focus-trap — not yet covered by the harness; static-mode-only this cycle). AC4 PASS at structural + visual level (drawer is closed by default at 375 + 768; right-rail TOC `<details>` is present + closed in the screenshot; static-mode contract verified by `data-interactive-only` count regression to 87). AC5 still DEFER (interactive-mode round-trip not reachable through `npm run preview` — needs `npm run dev` + Selenium interaction). AC6 PASS (37 pages exit 0; **size delta now +817 KB cumulative vs +1.42 MB at cycle 1 — 618 KB recovered**). Step 3 re-graded from PARTIAL → ⚠️ STILL PARTIAL (rationale-drift in source comments unchanged at cycle 2 — ISS-05). **Cycle 2 total: 16 PASS / 1 PARTIAL / 3 DEFER / 1 RESOLVED.**

The remaining DEFER count (3) covers AC2 + AC3 + AC5 — interaction smokes that the static-mode screenshot harness cannot exercise this cycle. Future addition (Selenium `ActionChains` against `npm run dev`) is documented in the harness header. T8 absorbs these or leaves them as flag-only since the underlying source-level evidence (focus-trap implementation, link-click close, Escape close, backdrop close — all read at lines 252, 255, 258–282, 286–295 in Drawer.astro) is strong.

## 🔴 HIGH — manual-smoke gap on T7 + T6-CO1 still deferred (browser-driven acceptance checks not run; second-cycle propagation to T8) — ✅ RESOLVED 2026-04-25 (cycle 2)

**Cycle 2 disposition:** Builder shipped `scripts/smoke-screenshots.py` (Selenium 4 + headless Chrome) + 22 PNGs in `.smoke/screenshots/`. Auditor opened 4 PNGs and verified the layout claims at 1280 / 1024 / 768 / 375 widths (see "Cycle 2 visual evidence" section above for what was seen in each). The harness is permanent infrastructure that closes the cycle 1 manual-smoke gap for layout-at-viewport observation; static-mode-only is acknowledged limitation, interactive-mode coverage is documented future addition. **Status: RESOLVED for T7's responsive-sweep AC1 + AC4. T6-CO1's interactive round-trip + focus-trap remain residual and propagate forward as separate notes** (see updated T8 carry-over below). Original cycle 1 finding text preserved below for the audit history.

**Finding (M-UX-T7-ISS-01).** T7 is the milestone's integration step + the natural home for the responsive-sweep manual smoke. Spec lines 45–54 list six browser-driven manual smokes as auditor-owned acceptance checks; spec line 40 (Step 6) commits to "Smoke each breakpoint in DevTools: 1280, 1024 (just below), 768, 375. At each, cite observed layout + a screenshot path or DevTools assertion in the audit issue file." T6's CO1 (HIGH-1 from T6 cycle 1) ALSO requires running T6's browser-driven smokes inside the T7 responsive session — this carry-over is the second iteration of the same gap.

The Builder ran neither set of smokes. Disposition note: "browser DevTools interactive observation isn't reachable from this shell environment." Structural evidence (extracted-CSS audit + HTML grep + DOM byte-offset verification + script-tag byte-identity) is unusually strong but **not sufficient** under CLAUDE.md's "Code-task verification is non-inferential" rule. This is the second cycle in a row deferring the same set of literal browser smokes; T8 will be the THIRD cycle. The deferred-twice-already-and-still-not-run pattern is a concern — at some point the gap must close with a real browser session, or the milestone README's "tested at 1280, 1024, 768, 375 widths" Done-when bullet 9 wording is inaccurate. (The bullet IS flipped `[x]` per the four-surface rule, but the bullet text describes a state that has not yet literally occurred. Flagged but not status-surface-drift in the strict sense — see also the M-UX-T6-ISS-02 wording-vs-implementation precedent.)

**Action / Recommendation.** Two paths:

1. **(Preferred for closing the milestone cleanly)** User runs `npm run preview` locally before declaring T7/T8 complete, navigates `/DSA/lectures/ch_4/` (and a notes/practice route for parity), resizes DevTools to 1280/1024/768/375. Cites observed layout at each breakpoint, hamburger click → drawer slide → close path observations, `<Tab>` focus-trap behaviour, `<Esc>` close + focus return. User reports back; this audit flips ISS-01 to ✅ RESOLVED 2026-MM-DD with the manual observation cited, and confirms Bullet 9 wording is now accurate. T7 status flips ✅ PASS. M-UX milestone closes cleanly.

2. **(Alternative)** Defer to T8 (deploy verification) — T8 spec line 80–82 already commits to running `dist/client/lectures/ch_1/index.html` at 375px DevTools width, drawer hamburger smoke, Esc-closes, focus management. T8 is the natural close-out checkpoint. T7 audit logs ISS-01 as DEFERRED to T8 with carry-over block appended to T8's spec. T8's audit absorbs the entire run + retro-flips ISS-01 + T6-CO1 + Bullet 9 wording check.

This audit takes path 2 — see Propagation status footer. T8's spec already has the relevant smokes named + spec line 95–99 already references the budget gate; the carry-over adds the explicit T6-CO1 + T7 responsive-sweep references.

## 🔴 HIGH — `dist/client/` size budget breach: cumulative +1.42 MB vs +50KB committed budget (28x over), driven by twice-rendered CompletionIndicator JSON — ✅ RESOLVED 2026-04-25 (cycle 2)

**Cycle 2 disposition:** Builder collapsed the cycle 1 twice-rendered LeftRail into a single DOM tree by repositioning the existing `<aside data-slot="left-rail">` as a `position: fixed; transform: translateX(-100%)` element at <1024px (slides in via `body.drawer-open`). Cycle 2 build = `5,257,676` bytes; **618,218 bytes recovered** vs cycle 1's `5,875,894`; cumulative vs pre-M-UX baseline `4,420,947` is now **+836,729 bytes / ~817 KB** (was +1,454,947 / +1.42 MB). Per orchestrator brief: the `+50KB` literal commitment was identified as somewhat arbitrary by the user, but the +1.42 MB symptom was a real design smell — twice-rendered SSR data is exactly the case where the size hit signals a structural mistake. **The mistake is now fixed.** The residual ~817 KB delta is dominated by T2's CompletionIndicator embed (single instance, ~444 KB) — that's owned by T2-ISS-02 as a future cleaner architectural fix (`GET /api/sections` endpoint). T8's deploy-budget gate will inherit T2-ISS-02 if the user wants to push the budget further. **Status: RESOLVED for T7's structural-cause concern.** The strict-reading +50KB → +817 KB residual is no longer a T7 finding. Original cycle 1 finding text preserved below.

**Finding (M-UX-T7-ISS-02).** Milestone README Done-when bullet 10 (line 28) commits: `Deploy contract preserved — site still ships 37 prerendered pages; dist/client/ size budget within +50KB of pre-M-UX baseline; M3 surfaces still gated on data-interactive-only and invisible in static mode; no server-only code leaks into the client bundle.` The literal `+50KB` figure is a milestone-spec-of-record commitment.

**Measured cumulative delta (auditor `npm run build` from scratch):**
- Pre-M-UX baseline (per [`pre_m_ux_baseline.md`](./pre_m_ux_baseline.md), commit `bf9c773`): `4,420,947` bytes / 4.5 MB.
- Post-T7 (auditor reproduces Builder): `5,875,894` bytes.
- Cumulative delta: **`+1,454,947` bytes / ~1.42 MB**, **28x over the +50KB budget**.
- T7-specific delta (vs post-T6 `5,173,963`): `+701,931` bytes / +685 KB / +13.5% in a single task.

**Root cause analysis** (auditor-confirmed, not Builder-stated):

1. **Twice-rendered LeftRail re-emits CompletionIndicator JSON.** The `<script type="application/json" id="cs300-completion-indicator-data">` block lives inside `LeftRail.astro` (via `CompletionIndicator.astro`'s frontmatter `set:html={sectionIdsJson}`). When LeftRail twice-renders, the JSON block emits TWICE — same 12,349 bytes of identical chapter-section-id manifest data. Verified: `python3` script counts 2× JSON data blocks per chapter route, identical content. **Per-page redundant JSON: 12,349 bytes. Across 36 chapter routes (lectures + notes + practice × 12): ≈ 444 KB of redundant inline JSON in T7 alone.** The other ~241 KB of T7 delta comes from the second LeftRail's HTML (chapter list × 2 = 12 `<li>` rows + classes/data-attributes per page × 36 pages).
2. **Cumulative pre-T7 delta** was already +753 KB at T6 close — driven primarily by T2's CompletionIndicator JSON pollution (M-UX-T2-ISS-02 / MEDIUM, carried over to T8). T7 doubles down by twice-rendering LeftRail, which means BOTH the LeftRail HTML AND the CompletionIndicator JSON now appear twice per page.

**The two MEDIUMs (T2's M-UX-T2-ISS-02 and this finding) compound.** T2's recommended fix (option (a): refactor CompletionIndicator to fetch section-id list via `GET /api/sections` instead of SSR-embedding) would resolve BOTH at once. Without that refactor, T7's twice-render pattern multiplies T2's per-page cost by 2.

**Why this is HIGH (not MEDIUM, despite T8 owning the gate):**

- The literal +50KB commitment in the milestone README is the spec-of-record. 28x over is not a marginal breach.
- The Builder's CHANGELOG self-disclosure ("if the budget is read literally") signals the Builder knows the budget is breached but is hoping T8 will relax it. CLAUDE.md "Don't preempt scope concerns" cuts both ways — the auditor flags the literal spec breach.
- T8's gate language ("if exceeded, document why") is permissive, but the Builder hasn't documented why; the Builder has only documented WHAT.
- The Builder did NOT consider the option-(a) refactor T2's carry-over already named. Adopting option (a) before T8 would shrink the delta from +1.42 MB to roughly +50–100 KB (close to the literal budget), at the cost of one extra round-trip on initial page load — well within the cs-300 site's small-corpus budget.

**Action / Recommendation.** Two paths:

1. **(Preferred — fixes the budget breach pre-T8)** Adopt T2-ISS-02's option (a): refactor `CompletionIndicator.astro` to fetch the section-id list via a new `GET /api/sections` (or `GET /api/sections?chapter_id=...`) endpoint instead of SSR-embedding the 12-chapter manifest per page. Saves ~444 KB twice-over (the embed appears once in desktop LeftRail + once in drawer LeftRail = ~888 KB recovered across the 36 chapter routes; cumulative `dist/client/` would land at roughly +50–100 KB vs pre-M-UX). Architecture.md §3.4 already exposes the section data structure in the `lectures` collection schema; adding a list-all endpoint is a small server-side addition. Re-open T2 (or scope a small new task) for the fix. Re-run T7's responsive sweep + T8's budget gate. **Recommended path** if the user wants the milestone to ship within its own committed budget.

2. **(Alternative — accept and rewrite the budget)** Lift the milestone README Done-when bullet 10 budget from `+50KB` to `+1.5 MB` (or whatever T8's eventual measurement settles on). Document the deviation in `m_ux_deploy_verification.md` Step 7 + a CHANGELOG entry. The site STILL ships under whatever ceiling matters for GH Pages traffic on a personal study notes site (no hard ceiling). Lighter touch but breaks the "spec is the spec" principle and means the budget commitment becomes whatever measurement happens to land. **Less preferred** for the same reason CLAUDE.md treats memory rules as load-bearing — if a literal spec figure can be retroactively rewritten to match implementation reality, the budget is theatre.

**Owner:** T8 (where the gate fires) OR a fresh re-open of T2 (where the embed pattern lives). Forward-deferred to T8 with carry-over block. T8 audit MUST grade this finding as part of the deploy contract — the +1.42 MB figure cannot be silently absorbed.

## 🟡 MEDIUM — duplicate `id="cs300-completion-indicator"` + `id="cs300-completion-indicator-data"` on every chapter route (HTML5 invalid, runtime works) — ✅ RESOLVED 2026-04-25 (cycle 2)

**Cycle 2 disposition:** Single DOM tree (cycle 2 refactor) → single CompletionIndicator emission per page → single `id="cs300-completion-indicator"` + single `id="cs300-completion-indicator-data"` per chapter route. Verified: `grep -oE ' id="cs300-completion-indicator(-data)?"' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` returns `1 id="cs300-completion-indicator"` + `1 id="cs300-completion-indicator-data"`. Same on notes/practice. HTML5 conformance restored across all 36 chapter routes. The `<div id="cs300-completion-indicator">` event-listener and the `<script type="application/json" id="cs300-completion-indicator-data">` boot-time JSON read both target unique elements as intended. **Status: RESOLVED.** Original cycle 1 finding text preserved below.

**Finding (M-UX-T7-ISS-03).** Twice-rendered LeftRail produces TWO instances of `<div id="cs300-completion-indicator">` and TWO instances of `<script type="application/json" id="cs300-completion-indicator-data">` per chapter route. Verified by `grep -oE ' id="[^"]+"' dist/client/lectures/ch_4/index.html | sort | uniq -c | sort -rn | head -3`:

```
      2  id="cs300-completion-indicator-data"
      2  id="cs300-completion-indicator"
      1  id="why-we-need-the-curnode-argument"
```

(Same on notes/ch_4 + practice/ch_4 — confirmed.)

**Impact assessment:**
- **HTML5 invalid.** W3C validator flags duplicate IDs as a conformance error. Accessibility tools may misbehave (multiple `getElementById` consumers in AT software pick the first; some assistive tech may flag the duplication).
- **JS behaviour: works at runtime.** `CompletionIndicator.astro:94` uses `document.getElementById('cs300-completion-indicator')` which returns the FIRST matching element only. `paintSlot()` uses `document.querySelectorAll('.left-rail .checkmark-slot[data-chapter-id="..."]')` which paints both desktop + drawer rails. Listeners attach once (good). Visual paint covers both rails (good).
- **Boot script reads `dataNode.textContent` from the FIRST `<script type="application/json">` block** (the other is inert payload). Since both blocks have identical content (same chapter manifest), this works correctly. But the duplicated 12,349 bytes is the bulk of HIGH-2's size-budget breach.

The runtime correctness is happenstance — the script's design happens to use `getElementById` (first-match) and `querySelectorAll` (all-matches) in exactly the right combinations. A future refactor that uses `getElementById` in a context expecting all matches (e.g., counting `dataNode`s) would break silently.

**Two reasonable fixes** (per the "Present options for simple-fix issues" memory rule):

1. **Consolidate via a single CompletionIndicator emission** (lighter touch). Move the `<script type="application/json">` data block + `<div id="cs300-completion-indicator">` root out of `LeftRail.astro`'s render tree and into the parent route file (e.g., `[id].astro` mounts `<CompletionIndicator />` once at body level, parallel to `<Drawer>`). LeftRail twice-renders only the `<nav>` + chapter list. The CompletionIndicator's `paintSlot()` already uses `querySelectorAll` so it paints both rails correctly. **Net change:** moves ~30 lines of frontmatter + JSX between files; preserves all event contracts. Saves ~888 KB (24,698 bytes per page × 36 pages) and resolves both HIGH-2's bulk + this MEDIUM in one shot.

2. **Twice-render LeftRail without CompletionIndicator** (medium touch). LeftRail accepts an `includeIndicator: boolean` prop (default true). The desktop instance includes the indicator; the drawer instance suppresses it. Same net effect as option 1, less disruption. Loses the "drawer's left rail also shows checkmarks" behaviour at <1024px — but at <1024px the user opens the drawer to navigate, not to check completion at a glance, so the loss is small. Saves ~888 KB.

**Action / Recommendation.** Pair with HIGH-2's resolution. Option 1 is the cleaner architectural fix; option 2 is the smaller diff. Either resolves both findings. Owner: T8 follow-up commit OR re-open of T2 (CompletionIndicator authorship). Not blocking the audit verdict (the surface works at runtime), but blocking T8's budget gate.

## 🟡 MEDIUM — RightRailTOC docstring claims `<details open>` rendered in EVERY viewport; source reality is `<details>` (no `open`)

**Finding (M-UX-T7-ISS-04).** RightRailTOC.astro lines 49–60 docstring claims:

> "T7 wraps this nav inside a `<details class="toc-mobile-collapse" open>` element rendered in EVERY viewport — at ≥1024px the `<summary>` is CSS-hidden and the `open` attribute keeps content visible (browser default for `<details open>`)."

The actual source at line 108 is `<details class="toc-mobile-collapse">` — **no `open` attribute**. The `is:inline` boot script (line 311–329) sets `details.open = true` ONLY when `matchMedia('(min-width: 1024px)').matches` returns true. At mobile, the `<details>` boots in the parsed-DOM-default state (closed) and stays closed until user-toggled.

**This is actually correct behaviour at the source-of-truth level** (matches ADR-0002's "collapsed by default" at mobile). But the docstring contradicts source. AnnotationsPane.astro lines 38–44 has the same docstring drift.

**Impact:** docstring drift confuses future readers about whether the wrapper is initially-open or initially-closed at mobile. Source is the authoritative answer; docstring is the wrong-answer-but-inert documentation. Cosmetic.

**Action / Recommendation.** One-line edit per file: change the docstrings to match source ("rendered in EVERY viewport without `open`; the `is:inline` boot script sets `open=true` ONLY at ≥1024px so desktop sees content immediately while mobile preserves ADR-0002's collapsed-by-default contract"). Owner: T7 follow-up commit (single-block edit on each file's frontmatter docstring). Not blocking. T8 incidental pickup.

## 🟡 MEDIUM — Builder docstring rationale on RightRailTOC single-tree wrap is partly conflated (id-collision claim)

**Finding (M-UX-T7-ISS-05).** RightRailTOC.astro lines 60–65 cite the single-tree-wrap rationale as:

> "The single-DOM-tree approach (vs spec's 'twice-render' suggestion in T7 step 3) avoids the id-collision risk on the sibling RightRailReadStatus island (#cs300-toc-read-status) and the AnnotationsPane (#annotations-pane); class-based selectors (.right-rail-toc, [data-anchor], [data-read-indicator]) work fine with one tree."

The reasoning conflates two things:
- Twice-rendering RightRailTOC would NOT directly duplicate `#cs300-toc-read-status` — that ID lives in the SIBLING `RightRailReadStatus.astro` component, which is rendered ONCE in the route file (`<RightRailReadStatus slot="right-rail" ... />` at lectures/[id].astro:127, mounted exactly once). RightRailTOC has no ID-bearing children of `#cs300-toc-read-status`.
- The actual id-collision risk if RightRailTOC were twice-rendered would be inside RightRailTOC's OWN tree — but RightRailTOC carries no `id="..."` attributes; its inner `<a>` links use `data-section-id` + `data-anchor` (data attributes, not IDs). So twice-rendering RightRailTOC alone would NOT cause a duplicate-ID problem.

**The OUTCOME (single-tree) is correct** because:
- AnnotationsPane MUST be single-tree (its `id="annotations-pane"` + `id="annotations-list"` would duplicate if twice-rendered).
- RightRailTOC consistency with AnnotationsPane is good (same wrapper pattern, same boot-script pattern, same breakpoint).

So the Builder landed the right pattern for the wrong reason. Cosmetic but worth correcting in source — a future maintainer reading the docstring will get a wrong mental model of where the id-collision risk actually lives.

**Action / Recommendation.** Edit RightRailTOC.astro lines 60–65 to read: "The single-DOM-tree approach (vs spec's 'twice-render' suggestion in T7 step 3) is consistent with AnnotationsPane's single-tree wrap (which is REQUIRED to avoid duplicating `#annotations-pane` + `#annotations-list` IDs the M3 script reads via `getElementById`). RightRailTOC itself carries no id attributes that would collide if twice-rendered (its `<a>` links use `data-section-id` + `data-anchor` data-attributes, not IDs), but consistency with the AnnotationsPane wrapper pattern + the desktop-open boot-script pattern keeps the right-rail's responsive behaviour uniform across both wrappers." One-paragraph edit. Owner: T7 follow-up commit. Not blocking. T8 incidental pickup.

## 🟢 LOW — `<details>` desktop-open boot script timing introduces a sub-frame FOUC window

**Finding (M-UX-T7-ISS-06).** RightRailTOC.astro + AnnotationsPane.astro each use an `is:inline` boot script that sets `<details class="toc-mobile-collapse">.open = true` at desktop widths via `matchMedia('(min-width: 1024px)')`. The script is positioned AFTER its `<details>` element in document order (boot script is the last `<script>` block in each component file).

At desktop, between (a) the browser parsing `<details>` (no `open` attribute → CLOSED browser-default state, content not laid out) and (b) the `is:inline` script executing and setting `details.open = true`, there's a brief window where the browser COULD paint the closed state. In practice, modern browsers parse + style + layout + paint in a single frame for documents of this size, so the window is sub-frame. But on slow devices / cold cache / large documents, a flash-of-collapsed-TOC at desktop is theoretically possible.

**Mitigation today:** the script is inline (synchronous, no `defer`/`async`), so it runs at the parser's earliest opportunity. The `<details>` parse + script execute happen in the same parse-task in modern browsers. Cosmetic risk only.

**Action / Recommendation.** No action required. If the user reports a FOUC during manual smoke, two cheap fixes:
- (a) Add `open` attribute to the source `<details class="toc-mobile-collapse" open>` — content is open by default at every viewport, the boot script becomes a no-op at desktop and only-needed at mobile to RE-CLOSE if the user toggled (which loses the user-toggle preservation behaviour, so don't pick this without thought).
- (b) Move the boot script into Base.astro's `<head>` `<style is:global>` + a CSS-only solution: at ≥1024px, `.toc-mobile-collapse:not([open]) > nav { display: block !important; }` overrides the browser-default closed state. Drops the JS dependency at desktop entirely. Better long-term.

Logged for awareness. T8 manual smoke is a natural moment to spot the FOUC if it materialises.

## 🟢 LOW — Drawer focus-trap `Tab` handler doesn't intercept `Tab` from outside the drawer

**Finding (M-UX-T7-ISS-07).** Drawer.astro lines 351–370 implement a focus trap on `Tab` keydown — but the handler only fires when the drawer is open (line 346 `if (!drawer.classList.contains('open')) return;` early-returns the entire keydown handler when closed). The trap then checks if `active === first || !drawer.contains(active)` (line 360) and wraps to last; or `active === last || !drawer.contains(active)` (line 365) and wraps to first.

**Edge case:** if the drawer is open BUT focus has somehow escaped the drawer (e.g., the user clicked outside, then Tab'ed) — the handler's `!drawer.contains(active)` branches catch this and pull focus back into the drawer. ✅ Correct.

**Edge case 2:** the keydown listener is attached to `document` (line 345). At drawer-open, focus is moved into `closeBtn?.focus()` (line 298). If the user immediately presses Shift+Tab, `active === first` is true (closeBtn IS the first focusable), the wrap to `last` fires (line 362). ✅ Correct.

**Edge case 3:** user clicks a button inside the drawer that has its own `onclick` handler that fires `e.stopPropagation()` — drawer's link-click-closes handler at line 375 checks `target.closest('a[href]')` only, so non-anchor buttons inside the drawer don't auto-close. Currently no such buttons inside drawer-rendered LeftRail (LeftRail is all `<a>` links), so no real risk. Future LeftRail additions (e.g., a "show optional chapters" toggle button) could clash. Not a T7 regression; flag for awareness.

**Action / Recommendation.** No action required. If a future LeftRail / drawer-content addition introduces non-link buttons that should NOT auto-close the drawer, document the exception in the Drawer.astro link-click handler. Logged for awareness; T7 surface is correct.

## 🟢 LOW — Builder CHANGELOG entry's count claim "data-interactive-only count: notes/ch_4 27 (vs T6 baseline 14 = +13: +12 twice-rendered checkmarks + 1 from a CompletionIndicator twice-render ID-deduplicating in the count)" includes a rationalised arithmetic that doesn't quite add up

**Finding (M-UX-T7-ISS-08).** CHANGELOG line for T7 reports notes/ch_4 `data-interactive-only` count = 27 (vs T6 baseline 14 = +13). Auditor verifies 27 ✓. But the math breakdown ("+12 twice-rendered checkmarks + 1 from a CompletionIndicator twice-render ID-deduplicating") is curious — the LeftRail twice-rendering produces 12 NEW `data-interactive-only` checkmark slots (one per chapter row × 12 chapters) for a total of 24 LeftRail checkmark slots (12 desktop + 12 drawer). T6 baseline for notes was 14 = 12 LeftRail checkmark slots + 1 Breadcrumb prev/next + 1 interactive-mode-badge (= 14, pinned at T6 audit G13). T7 now: 24 LeftRail checkmarks + 1 Breadcrumb + 1 badge + 1 CompletionIndicator root = 27 — but wait, the CompletionIndicator's `<div id="cs300-completion-indicator" data-interactive-only hidden>` was already in T6's count (CompletionIndicator was rendered once). T7 introduces 12 NEW checkmark slots (drawer's LeftRail) + 1 NEW CompletionIndicator root duplicate = 13. Sum: 14 + 13 = 27 ✓.

Builder's wording "1 from a CompletionIndicator twice-render ID-deduplicating in the count" is unclear/misleading — the count doesn't deduplicate; both `<div id="cs300-completion-indicator">` instances each carry `data-interactive-only` and both are counted. Cosmetic CHANGELOG-prose drift.

**Action / Recommendation.** No action required. The numerical claim is correct; the prose is imprecise. T8's CHANGELOG close-out is a natural moment for an editor-pass.

## Additions beyond spec — audited and justified

**Audited:** `git status` shows the expected file footprint: 2 new files (`Drawer.astro`, `DrawerTrigger.astro`), 9 modified files (CHANGELOG, milestone README, tasks/README, T7 spec status, AnnotationsPane, Breadcrumb, RightRailTOC, Base, lectures/[id], notes/[id], practice/[id]). No drive-by file changes. No `nice_to_have.md` adoption. No new dependencies (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty). No M3 component API edits (MarkReadButton + AnnotateButton zero-diff verified).

The two-component split (Drawer.astro + DrawerTrigger.astro vs spec's single Drawer.astro) is an addition beyond the literal spec deliverable count, but is forced by Astro's slot-routing constraints (a single component cannot route to two parent slots) and is documented inline in both file headers + the CHANGELOG. Spec-aligned in intent, if not in literal component count. Spec line 13 names "Drawer.astro" as a single deliverable, but the contract spec describes (button-in-breadcrumb + aside-at-body) is satisfied. ✅ no scope creep.

The single-tree `<details>` wrap on RightRailTOC + AnnotationsPane (vs spec's "twice-render lean" in Steps 3 + 4) is a tactical deviation. AnnotationsPane MUST be single-tree (id-collision risk on its own `#annotations-pane` + `#annotations-list`); RightRailTOC consistency follows. Documented in source headers. ✅ deviation justified.

The `body.drawer-open` rules in Base.astro (suppressing `#mark-read-button`, `#annotate-button`, `.interactive-badge` when drawer is open) are NEW Base.astro rules not literally specified in T7. They resolve a real interaction problem: the body-level fixed-position `z-index: 1000` siblings would otherwise paint on top of the drawer's `z-index: 9999` aside (the drawer escapes the breadcrumb's `z-index: 50` stacking context but cannot override sibling fixed-position painting at the body level except via explicit suppression). The suppression rule is additive — it only fires when `body.drawer-open` is set, which is only set by drawer JS at mobile. Static-mode never reaches `body.drawer-open` (M3 surfaces are already hidden via `data-interactive-only`; the drawer JS dispatches `cs300:drawer-toggle` only on user click of an interactive element). ✅ addition justified, no static-mode contract drift.

The `<details>` desktop-open `is:inline` boot scripts in RightRailTOC + AnnotationsPane are NEW additions not literally specified in T7. They solve the desktop-rendering side of the same `<details>` element used at mobile (without `open`, the CSS-hidden summary at desktop would leave content hidden). Without these scripts, desktop users would see no TOC + no AnnotationsPane until they manually expanded the (CSS-hidden) summary — broken UX. ✅ addition justified.

## Verification summary

Gate commands run from scratch by the auditor (did not trust Builder's `dist/client/`):

| Gate | Command | Result |
| ---- | ------- | ------ |
| G1: Build clean | `npm run build` | ✅ exit 0; 37 pages prerendered; server built in 8.82s; vite client step 7.68s |
| G2: Page count | `find dist/client -name "index.html" \| wc -l` | ✅ `37` (matches Builder; preserves M3 T8 contract) |
| G3: Build size | `du -sb dist/client/` | ⚠️ `5,875,894` bytes (matches Builder; **+701,931 vs post-T6 `5,173,963`**; cumulative vs pre-M-UX `4,420,947` = `+1,454,947 bytes / ~1.42 MB` — **28x over the +50KB budget**; HIGH-2 above) |
| G4: Drawer DOM elements per chapter route | `grep -oc 'id="drawer"\|id="drawer-trigger"\|id="drawer-backdrop"' dist/client/{lectures,notes,practice}/ch_4/index.html` | ✅ 1+1+1 on every chapter route; 0+0+0 on `dist/client/index.html` |
| G5: Twice-rendered LeftRail | `grep -c 'class="left-rail"' dist/client/{lectures,notes,practice}/ch_4/index.html` | ✅ 2× per chapter route; `grep -c 'class="left-rail"' dist/client/index.html` = 0 |
| G6: Duplicate IDs (HIGH-2 / MEDIUM-3 evidence) | `grep -oE ' id="[^"]+"' dist/client/lectures/ch_4/index.html \| sort \| uniq -c \| sort -rn \| head -3` | ⚠️ `2 cs300-completion-indicator-data` + `2 cs300-completion-indicator` — only the two CompletionIndicator IDs duplicate; section-anchor IDs are unique (1× each). Same on notes/ch_4 + practice/ch_4. |
| G7: `<details>` wrappers on lectures-only | `grep -c 'toc-mobile-collapse\|annotations-mobile-collapse' dist/client/{lectures,notes,practice}/ch_4/index.html dist/client/index.html` | ✅ 4 on lectures (2× toc + 2× annotations — element + script reference each); 0 on notes/practice/index |
| G8: `data-interactive-only` count regression | `grep -oc 'data-interactive-only' dist/client/{lectures,notes,practice}/ch_4/index.html dist/client/index.html` | ✅ lectures/ch_4 = 100 (vs T6 baseline 86; +14 from twice-rendered LeftRail checkmarks + AnnotationsPane wrapper carrier); notes/ch_4 = 27 (vs 14; +13); practice/ch_4 = 27 (vs 14; +13); index = 15 (unchanged). Matches Builder. |
| G9: M3 contract — `cs300:read-status-changed` | `grep -rn 'cs300:read-status-changed' src/` | ✅ 1× dispatch (MarkReadButton:161) + 2× listeners (RightRailReadStatus:133, CompletionIndicator:171) — 1d+2L preserved |
| G10: M3 contract — `cs300:toc-read-status-painted` | `grep -rn 'cs300:toc-read-status-painted' src/` | ✅ 1× dispatch (RightRailReadStatus:121) + 1× listener (MarkReadButton:134) — 1d+1L preserved |
| G11: M3 contract — `cs300:annotation-added` | `grep -rn 'cs300:annotation-added' src/` | ✅ 1× dispatch (AnnotateButton:131) + 1× listener (AnnotationsPane:305) — 1d+1L preserved |
| G12: New T7 contract — `cs300:drawer-toggle` | `grep -rn 'cs300:drawer-toggle' src/` | ✅ 1× dispatch (DrawerTrigger:118) + 1× listener (Drawer:336) — 1d+1L |
| G13: MarkReadButton zero-diff | `git diff HEAD -- src/components/read_status/MarkReadButton.astro \| wc -l` | ✅ `0` |
| G14: AnnotateButton zero-diff | `git diff HEAD -- src/components/annotations/AnnotateButton.astro \| wc -l` | ✅ `0` |
| G15: AnnotationsPane M3 `<script>` byte-identity | `diff <(git show HEAD:src/components/annotations/AnnotationsPane.astro \| awk '/^<script>/,/^<\/script>/') <(cat src/components/annotations/AnnotationsPane.astro \| awk '/^<script>/,/^<\/script>/')` | ✅ no output — byte-identical |
| G16: BASE_URL hardcoding sweep on new files | `grep -nE '/DSA/' src/components/chrome/Drawer.astro src/components/chrome/DrawerTrigger.astro` | ✅ no hits |
| G17: BASE_URL hardcoding sweep on touched files | `grep -nE '/DSA/' src/layouts/Base.astro src/components/chrome/Breadcrumb.astro src/components/chrome/RightRailTOC.astro src/components/annotations/AnnotationsPane.astro src/pages/lectures/'[id].astro' src/pages/notes/'[id].astro' src/pages/practice/'[id].astro'` | ✅ doc-comment hits only (Breadcrumb.astro had pre-existing T3 baseline doc-comment refs); no new HREF hardcoding introduced |
| G18: dep-manifest churn | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements.txt` | ✅ empty |
| G19: nice_to_have.md drive-by check | review of working tree | ✅ no fresh adoption |
| G20: Status-surface (a) per-task spec | `grep -n '\*\*Status:\*\*' design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md` | ✅ `**Status:** ✅ done 2026-04-25` |
| G21: Status-surface (b) tasks/README | `grep -n 'T7' design_docs/milestones/m_ux_polish/tasks/README.md` | ✅ row reads `T7 ... ✅ done 2026-04-25` |
| G22: Status-surface (c) milestone README task table | `grep -n 'T7' design_docs/milestones/m_ux_polish/README.md` | ✅ row reads `T7 ... ✅ done 2026-04-25` |
| G23: Status-surface (d) Done-when bullet 9 + bullet 7 reword | `grep -n 'Mobile (<1024px)\|Mark-read button re-homed' design_docs/milestones/m_ux_polish/README.md` | ✅ Bullet 9 flipped `[x]` with `(T7 issue file)` parenthetical; bullet 7 reworded to "default slot, above article body — visual position keeps M3's floating bottom-left per spec MUX-BO-DA-6 option (i)" — accurately describes option (i) outcome |
| G24: @media-rule audit on extracted CSS | `grep -o '@media[^{]*{' dist/client/_astro/DrawerTrigger.Csox6oQw.css dist/client/_astro/_id_@_@astro.CaOzGWsw.css` | ✅ DrawerTrigger.css: 2× `@media(max-width:1023.98px)` + 1× `@media(max-width:767.98px)` + 1× `@media(min-width:1024px)`; _id_@.css: 3× `@media(max-width:1023.98px)`. All four breakpoints exercised. |
| G25: `body.drawer-open` rules | `grep -o 'body.drawer-open[^}]*}' dist/client/_astro/DrawerTrigger.Csox6oQw.css` | ✅ `body.drawer-open { overflow: hidden }` + `body.drawer-open #annotate-button, body.drawer-open #mark-read-button, body.drawer-open .interactive-badge { display: none !important; }` both present |
| G26: Drawer fade/slide rules | `grep -o '.drawer\.open\|drawer-backdrop\.open\|transform.*translate' dist/client/_astro/DrawerTrigger.Csox6oQw.css` | ✅ slide-in transform + open-class pattern confirmed |
| G27: index page absence of drawer surfaces | `grep -c 'id="drawer"\|toc-mobile-collapse\|annotations-mobile-collapse' dist/client/index.html` | ✅ `0` |
| G28: M3 surface counts on lectures/ch_4 (regression check vs T6) | `grep -oc 'mark-read-button\|annotate-button\|annotations-pane' dist/client/lectures/ch_4/index.html` | ✅ unchanged from T6 baseline + the AnnotationsPane wrapper count adjustment (8× mark-read-button, 6× annotate-button, 7× annotations-pane); matches Builder |

**Smokes deliberately deferred to T8** (browser-driven, not reachable from this audit env): AC1 (1280/1024/768/375 viewport observation), AC2 (drawer interaction at 375px), AC3 (focus trap), AC4 (static-mode console-error sweep), AC5 (M3 surface interactive smoke at 375px), Step 6 + Step 7. T6's CO1 carry-over also still browser-deferred.

## Issue log — cross-task follow-up

| ID | Severity | Title | Status (cycle 2) | Owner / next touch point |
| -- | -------- | ----- | ---------------- | ----------------------- |
| M-UX-T7-ISS-01 | HIGH | Manual-smoke gap on T7 + T6-CO1 still deferred | ✅ **RESOLVED 2026-04-25 (cycle 2)** — closed by `scripts/smoke-screenshots.py` + 4 PNGs auditor-opened (1280 + 1024 + 768 + 375 layout claims confirmed) | Static-mode-only is acknowledged; interactive-mode coverage (Tab focus-trap, hamburger click, annotation round-trip) folded into a residual "future addition" note inside T8's carry-over (interactive smokes only — layout smokes are now done) |
| M-UX-T7-ISS-02 | HIGH | `dist/client/` size budget breach: cumulative +1.42 MB | ✅ **RESOLVED 2026-04-25 (cycle 2)** — single DOM tree refactor recovered 618 KB; cumulative now +817 KB | Residual T2-ISS-02 budget question (CompletionIndicator API refactor) is owned by T8 / T2 follow-up; user identified the literal +50KB figure as somewhat arbitrary so the strict-reading breach is no longer a T7 finding |
| M-UX-T7-ISS-03 | MEDIUM | Duplicate completion-indicator IDs | ✅ **RESOLVED 2026-04-25 (cycle 2)** — single tree → single ID per page | n/a |
| M-UX-T7-ISS-04 | MEDIUM | RightRailTOC + AnnotationsPane docstrings claim `<details open>` (source has no `open`) | ⚠️ STILL OPEN (cycle 2 didn't touch these) | T7 follow-up commit (single-block edit on each component's frontmatter docstring) OR T8 incidental pickup. Non-blocking — source-of-truth is correct, docstrings are wrong-but-harmless documentation drift. |
| M-UX-T7-ISS-05 | MEDIUM | RightRailTOC docstring rationale on single-tree wrap partly conflated (id-collision claim) | ⚠️ STILL OPEN (cycle 2 didn't touch this) | T7 follow-up commit (one-paragraph edit) OR T8 incidental pickup |
| M-UX-T7-ISS-06 | LOW | `<details>` desktop-open boot script timing — sub-frame FOUC theoretically possible | flag-only (unchanged) | T8 manual smoke catches if it materialises; otherwise no action |
| M-UX-T7-ISS-07 | LOW | Drawer focus-trap doesn't intercept non-link buttons inside drawer | flag-only (unchanged) | If future LeftRail / drawer-content adds non-link buttons, document the exception in Drawer.astro link-click handler |
| M-UX-T7-ISS-08 | LOW | Cycle 1 CHANGELOG `data-interactive-only` count prose imprecise | RESOLVED-by-supersede 2026-04-25 (cycle 2) | Cycle 2 CHANGELOG entry restates the count without the conflated phrasing; numerical claim trivially correct (87 = 86 + 1 wrapper carrier) |
| M-UX-T6-ISS-01 (carry-over) | HIGH | Browser-driven smokes for T6 acceptance checks | ✅ RESOLVED at layout level (cycle 2 PNGs) for the responsive-sweep half; interactive-mode round-trip + focus-trap residual still propagates to T8 (residual interaction-smoke surface only) | T8 absorbs the residual interactive-mode smokes (annotations round-trip, mark-read click, Tab focus-trap, Escape close behaviour) per its own spec lines 80–82 + 95–99; the layout-at-viewport half is closed |
| M-UX-T6-ISS-03 (carry-over) | MEDIUM | AnnotationsPane mobile collapsed-rail readability | ✅ RESOLVED at structural level (cycle 1) + ✅ visual confirmation (cycle 2 PNGs at 375 + 768 show the AnnotationsPane wrapper closed at static-mode-mobile, hidden via `body[data-mode="static"] [data-interactive-only]` rule + the collapsed `<details>` summary) | Literal interactive-mode browser-observation (long-annotation scroll, accordion behaviour with seeded data) folded into T8's residual interactive smokes |
| M-UX-T6-ISS-02 (carry-over) | MEDIUM | Done-when bullet 7 wording drift | ✅ RESOLVED 2026-04-25 (cycle 1) | Already reworded |

**Override / disagreement with Builder report (cycle 1 + cycle 2).**

**Cycle 1:** No factual override — every Builder count, byte-offset, and contract claim verified independently and reproduces.

1. The cycle 1 Builder's CHANGELOG argued the +50KB budget should be relaxed; cycle 1 auditor disagreed and deferred to T8. **Cycle 2 superseded the disagreement:** Builder fixed the structural cause (twice-render → single tree), recovering 618 KB and closing the design-smell version of the finding. The strict-reading +50KB → +817 KB residual is now a T2-ISS-02 question (CompletionIndicator embed pattern), not a T7 question.
2. The cycle 1 Builder's two spec deviations (component split + single-tree `<details>` wrap on RightRailTOC + AnnotationsPane) were both accepted. **Cycle 2 added a third deviation:** option (b) single-tree LeftRail (vs cycle 1's option (a) twice-render). Spec line 36 explicitly listed option (b) as acceptable ("trickier CSS"); cycle 2 implementation lands it in ~50 lines of @media CSS — not particularly tricky and structurally simpler than the twice-render. Auditor accepts.
3. The cycle 1 Builder ticked T6-CO1 `[x]` at "structural pass" level; cycle 1 auditor logged double-deferral. **Cycle 2 superseded:** the screenshot harness produces literal layout-at-viewport observation, which closes the bulk of T6-CO1's surface (the layout half). Residual interactive-mode round-trip + focus-trap still propagates to T8 (smaller surface than the original gap).

**Cycle 2:** No factual override — every Builder count (5,257,676 byte build, 37 pages, 1× left-rail per page, 1× completion-indicator per page, 87 / 14 / 14 data-interactive-only counts on lectures/notes/practice ch_4, M3 contracts 1d+2L / 1d+1L / 1d+1L / 1d+1L, LeftRail + CompletionIndicator zero-diff, MarkReadButton + AnnotateButton zero-diff) reproduces. Two adjacent observations the Builder did NOT make:

1. **ISS-04 + ISS-05 docstring drifts remain unchanged at cycle 2.** RightRailTOC.astro:50 still claims `<details ... open>` despite source line 108 having no `open`; AnnotationsPane.astro:38–43 same. Builder's cycle 2 disposition note focused on the structural fix and didn't touch the cycle 1 documentation drifts. Non-blocking, but they're still on the books.
2. **The cycle 2 fix paid for itself in pure recovery.** 618 KB recovered without adding complexity beyond a single CSS @media block + a JS island that queries `document.querySelector('aside[data-slot="left-rail"]')` instead of accepting `<slot>` children. This is structurally simpler than the cycle 1 twice-render and is the kind of simplification that should have been the cycle 1 path. Not a finding — an observation about which option spec line 36 should have leaned harder on.

## Deferred to nice_to_have

None. T7's findings all map to existing T8 follow-up territory (browser smokes + size budget) or single-line docstring edits. No findings are out-of-scope-defer-to-parking-lot candidates. `nice_to_have.md` boundary is unchanged.

## Propagation status

**Cycle 1 propagation:** ✅ COMPLETED 2026-04-25 (cycle 1 audit) — `## Carry-over from prior audits` block appended to [`../tasks/T8_deploy_verification.md`](../tasks/T8_deploy_verification.md) with three entries (ISS-01 / ISS-02 / ISS-03).

**Cycle 2 propagation update (2026-04-25):** all three cycle 1 propagated entries CLOSE OUT in cycle 2 — they are now RESOLVED here, so T8's carry-over entries can be ticked `[x]` with disposition notes pointing at this issue file's cycle 2 section. Specifically:

- **`M-UX-T7-ISS-01`** carry-over in T8: layout-at-viewport half is closed via the screenshot harness + 4 PNGs auditor-opened (1280 / 1024 / 768 / 375). The interactive-mode residual (Tab focus-trap, hamburger click, drawer slide-in, Escape close, backdrop close, annotation round-trip) remains a smaller surface and is documented as a future addition to the harness (Selenium `ActionChains` against `npm run dev`). T8 can either: (a) absorb the interactive smokes via its own DevTools session as originally planned, OR (b) extend `scripts/smoke-screenshots.py` to add interaction support. Either is acceptable; T7's responsive-sweep AC1 + AC4 are now closed.
- **`M-UX-T7-ISS-02`** carry-over in T8: structural cause fixed (twice-render → single tree); 618 KB recovered. Residual ~817 KB cumulative delta is owned by T2-ISS-02 (CompletionIndicator API-fetch refactor) — that's still on T8's plate but the +1.42 MB symptom no longer applies. T8 can grade the residual against the user's actual budget concern (which the user has indicated is "the design pattern, not the literal +50KB figure").
- **`M-UX-T7-ISS-03`** carry-over in T8: closed entirely. Single tree → single ID per page → no HTML5 invalidity. T8 doesn't need to do anything for ISS-03.

**Recommended T8 carry-over update:** when T8's Builder runs, they should tick the three cycle 1 propagated entries `[x]` with disposition notes that reference this cycle 2 section. The T8 audit then doesn't need to re-grade these findings — they're closed at the source.

**ISS-04 + ISS-05 status:** STILL OPEN at MEDIUM. Cycle 2 didn't touch the docstrings. Owner remains T7 follow-up commit OR T8 incidental pickup. Single-block edit on each (RightRailTOC.astro frontmatter line 49–60 + AnnotationsPane.astro frontmatter line 33–55). Non-blocking — source-of-truth is correct, docstrings are wrong-but-harmless documentation drift. The user can pick up these in any subsequent commit; they don't gate T7 → T8 → milestone close.

**ISS-06 + ISS-07 + ISS-08 status:** unchanged. flag-only.

T8 Builder reads the (updated) carry-over block; on T8 close, ISS-01-residual-interactive-only / ISS-04 / ISS-05 either tick or carry forward. M-UX-T6-ISS-01's residual interactive-mode surface mirrors forward to T8 alongside ISS-01-residual.

## Security review

**Reviewed by:** security-reviewer subagent, 2026-04-25 (post Functional Auditor cycle 2 PASS)
**Verdict: SHIP** — no Critical, no High findings; one Advisory (dep-auditor gate on `requirements-dev.txt` before commit, per CLAUDE.md non-negotiable).

### Ten-check gate

| # | Area | Result | Notes |
|---|------|--------|-------|
| 1 | Drawer.astro: querySelector + focus-trap scope | PASS | `aside[data-slot="left-rail"]` is a closed attribute selector; `focusables()` scoped to `aside.querySelectorAll`; `!aside.contains(active)` catches escaped focus; `body.drawer-open` is a fixed string passed to `classList.add/remove`, not derived from user input. |
| 2 | DrawerTrigger.astro: event dispatch + detail payload | PASS | `new CustomEvent('cs300:drawer-toggle')` — no second argument; `event.detail` is `null`; Drawer's `toggle` ignores `event.detail` entirely. |
| 3 | `<details>` boot scripts (RightRailTOC + AnnotationsPane) | PASS | Both IIFEs use the fixed literal `window.matchMedia('(min-width: 1024px)')`; `document.querySelectorAll` targets fixed class names; `apply()` sets only the boolean `.open`. |
| 4 | `body.drawer-open` toggle | PASS | `classList.add('drawer-open')` / `remove(...)` — fixed strings; only same-page DOM event handlers reach `toggle()`; no postMessage / BroadcastChannel path. |
| 5 | `smoke-screenshots.py`: subprocess + eval surface | PASS | No `subprocess`, no `shell=True`, no `eval`/`exec`; JSON routes used only for URL concatenation + `pathlib.Path` filename construction; `driver.get(url)` is a WebDriver HTTP command; `tempfile.mkdtemp()` produces the user-data-dir; cleanup in outer `finally` runs on `KeyboardInterrupt`. |
| 6 | `requirements-dev.txt` pin integrity | PASS (dep-auditor flag) | `selenium==4.43.0` exact pin on the active ASF-maintained Selenium 4 series; minimal API surface imported (`webdriver.Chrome`, `Options`, `WebDriverWait`); dep-auditor must validate transitive deps on commit. |
| 7 | Production bundle isolation | PASS | `requirements-dev.txt` is Python-only; `npm run build` has no Python step; `dist/client/` contains zero Python content; `deploy.yml` uploads only `./dist/client`. |
| 8 | `.gitignore` correctness | PASS | `.smoke/screenshots/` ignored at line 70 (regenerable); `.smoke/.gitkeep` preserved; `requirements-dev.txt` not ignored (correctly committed); `.venv/` ignored at line 52. |
| 9 | `data-interactive-only` count + mode-gate integrity | PASS | 87 on `dist/client/lectures/ch_4/index.html` = T6 baseline 86 + 1 for the AnnotationsPane mobile-collapse wrapper; outermost-element gating hides the entire collapsible in static mode; RightRailTOC wrapper correctly lacks the attribute (TOC is a static-mode surface). |
| 10 | GH Pages artifact integrity | PASS | `output: 'static'`; `deploy.yml` uploads only `./dist/client`; no `process.env` reads in `astro.config.mjs`; only `import.meta.env.BASE_URL` (= `/DSA/`) used; no loopback / Ollama / local-path leak. |

### Critical findings

None.

### High findings

None.

### Advisory — M-UX-T7-SEC-01: dep-auditor gate required on `requirements-dev.txt`

**Severity:** Advisory. Becomes a BLOCK only if the dep-auditor returns `FIX-THEN-SHIP` or `BLOCK`.

`requirements-dev.txt` is a new manifest in scope for CLAUDE.md's non-negotiable dependency audit gate (`requirements*.txt` is listed explicitly). It pins `selenium==4.43.0`. This reviewer confirms:
- Minimal Selenium API surface (`webdriver.Chrome`, `Options`, `WebDriverWait` only).
- No `subprocess`/`shell=True`/`eval`/`exec` in the harness.
- Full isolation from the production Astro build and `dist/client/`.
- Exact major.minor.patch pin on the actively-maintained ASF Selenium 4 series.
- No runtime `pip install` shell-out (user installs manually into a `.venv/` per the harness doc).

What this reviewer does NOT perform: PyPI provenance check, CVE database scan, transitive-dep audit (urllib3, websocket-client, certifi, etc.). Those are the dep-auditor's domain.

**Action:** when the user asks to commit cycle 2 deliverables, run `dependency-auditor` against the diff. Only `requirements-dev.txt` has changed among in-scope manifests this cycle. Record the verdict in the CHANGELOG entry per CLAUDE.md. `SHIP` → note `Dep audit: clean` and proceed. `FIX-THEN-SHIP`/`BLOCK` → surface findings verbatim, do not commit, re-enter as carry-over here.

### Annotation rendering (threat model item 5 — confirmed clean)

`AnnotationsPane.astro` renders annotation text via `snippet.textContent = a.text.slice(0, 80) + '…'` — `textContent` assignment, not `innerHTML`. List DOM built via `document.createElement` + `appendChild`. No `dangerouslySetInnerHTML`, `set:html`, or `innerHTML` of user data anywhere in T7-touched files. Stored self-XSS through the annotation render path is not possible.

### View-transitions forward advisory (not a current finding)

Drawer.astro attaches event listeners unconditionally at script parse time. Correct for the current codebase (no `<ViewTransitions />` in `Base.astro`; `astro.config.mjs` registers no view-transition integrations). If view transitions are ever adopted, listeners should be re-registered on `astro:page-load` to avoid accumulation across client-side navigations. Flag for the adopting task; not a finding today.

## Dependency audit

**Cycle 1:** Dependency audit: skipped — no manifest changes.


**Cycle 2 — dep-auditor verdict (2026-04-25): SHIP**

Auditor: dependency-auditor subagent. Changeset confirmed: only `requirements-dev.txt` is new among in-scope manifests. `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml` returned empty; `requirements-dev.txt` is untracked/new as expected per `git status --short`.

---

### Commands run

```
# Changeset confirmation
git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml
# -> empty

# Transitive dep enumeration (temp venv — system pip is PEP 668 externally managed)
python3 -m venv /tmp/selenium-audit-venv
/tmp/selenium-audit-venv/bin/pip install --dry-run selenium==4.43.0
# -> 15 packages: selenium 4.43.0 + 14 transitive deps listed below

# PyPI metadata for selenium 4.43.0
# python3 urllib.request to https://pypi.org/pypi/selenium/4.43.0/json
# -> upload_time: 2026-04-10T06:47:01; yanked: False; license: Apache-2.0
# -> requires_dist confirmed 6 direct deps
# -> project_urls.source = https://github.com/SeleniumHQ/selenium/tree/trunk/py

# CVE scan — OSV v1/query API for all 15 packages
# -> zero vulnerabilities for every package

# pip-audit
/tmp/selenium-audit-venv/bin/pip-audit --requirement requirements-dev.txt
# -> "No known vulnerabilities found"

# Wheel integrity
# Downloaded selenium-4.43.0-py3-none-any.whl (9,348 KB)
# SHA256 computed: 4f97639055dcfa9eadf8ccf549ba7b0e49c655d4e2bde19b9a44e916b754e769
# PyPI published:  4f97639055dcfa9eadf8ccf549ba7b0e49c655d4e2bde19b9a44e916b754e769
# -> MATCH

# Linux selenium-manager binary RECORD integrity
# RECORD SHA256 (urlsafe-b64): -BuamjlOfTTgy-H9PZEsdAfh4jHRyj6VpfNYacg1KPs
# Computed from extracted binary: -BuamjlOfTTgy-H9PZEsdAfh4jHRyj6VpfNYacg1KPs
# -> MATCH

# Install-hook inspection
# Wheel entry_points.txt: absent
# Wheel .pth / sitecustomize: absent
# sdist pyproject.toml: build-backend = setuptools.build_meta; no custom cmdclass

# PyPI metadata for all 14 transitive packages
# python3 urllib.request to https://pypi.org/pypi/<pkg>/json for each
# -> all on latest versions; none yanked; maintainers confirmed
```

---

### 1. Pin verification

`selenium==4.43.0` is the current latest release as of audit date. Release date: 2026-04-10. Active monthly cadence (4.40 on 2026-01-18, 4.41 on 2026-02-20, 4.42 on 2026-04-09, 4.43 on 2026-04-10). Not yanked. License: Apache-2.0.

Maintainer: PyPI metadata `maintainer` field is empty (SeleniumHQ uses CI-driven publishing), but `pyproject.toml` inside the sdist confirms `[project.urls] source = https://github.com/SeleniumHQ/selenium/tree/trunk/py` and `homepage = https://www.selenium.dev`. This is the canonical SeleniumHQ package, not a fork or lookalike. Package name `selenium` registered by SeleniumHQ since 2011; weekly downloads in the tens of millions. No single-maintainer/low-download typosquat concern.

---

### 2. CVE check

`pip-audit 2.10.0` against `requirements-dev.txt`: **No known vulnerabilities found.**

OSV API (`https://api.osv.dev/v1/query`) queried for `selenium 4.43.0` directly: zero results.

No current CVEs against selenium 4.43.0.

---

### 3. Transitive dep audit

Full tree from `pip install --dry-run selenium==4.43.0` — 15 packages total:

| Package | Resolved version | Latest | Yanked | OSV CVEs | Maintainer / notes |
| ------- | --------------- | ------ | ------ | -------- | ------------------ |
| selenium | 4.43.0 | 4.43.0 | No | 0 | SeleniumHQ; Apache-2.0 |
| certifi | 2026.4.22 | 2026.4.22 | No | 0 | certifi team (Kenneth Reitz); MPL-2.0; CA bundle; current |
| trio | 0.33.0 | 0.33.0 | No | 0 | Nathaniel J. Smith (python-trio org); MIT/Apache-2.0; active |
| trio-websocket | 0.12.2 | 0.12.2 | No | 0 | python-trio org; MIT |
| typing_extensions | 4.15.0 | 4.15.0 | No | 0 | Python core team; PSF-2.0 |
| urllib3 | 2.6.3 | 2.6.3 | No | 0 | urllib3 org; MIT; well-maintained |
| websocket-client | 1.9.0 | 1.9.0 | No | 0 | engn33r; Apache-2.0; active |
| attrs | 26.1.0 | 26.1.0 | No | 0 | Hynek Schlawack; MIT; stable |
| sortedcontainers | 2.4.0 | 2.4.0 | No | 0 | Grant Jenks; Apache-2.0; last release 2021 (intentionally stable) |
| idna | 3.13 | 3.13 | No | 0 | Kim Davies; BSD-like; IDNA codec |
| outcome | 1.3.0.post0 | 1.3.0.post0 | No | 0 | python-trio org; MIT/Apache-2.0 |
| sniffio | 1.3.1 | 1.3.1 | No | 0 | Nathaniel J. Smith; MIT/Apache-2.0 |
| wsproto | 1.3.2 | 1.3.2 | No | 0 | Hyper project; MIT |
| PySocks | 1.7.1 | 1.7.1 | No | 0 | Anorov; BSD; last release 2019-09-20 — see Advisory below |
| h11 | 0.16.0 | 0.16.0 | No | 0 | Nathaniel J. Smith / Hyper; MIT |

All 14 transitive packages are on their respective latest versions. All are well-known packages with established maintainers. Zero CVEs across the entire graph (both OSV API and pip-audit confirm).

**Advisory — PySocks abandonment posture:** Last release 2019-09-20, over 6 years without a new version. This is Advisory only, not a block, because: (a) zero OSV CVEs against 1.7.1; (b) pip-audit reports clean; (c) PySocks is pulled exclusively because `urllib3[socks]` requests it; (d) the cs-300 smoke harness runs exclusively against localhost — no SOCKS proxy path is exercised at all; (e) the package is widely deployed and audited by the broader ecosystem. Comparable in posture to `sortedcontainers` 2.4.0 (last release 2021 — also intentionally stable).

---

### 4. Install-time execution risk

The wheel `selenium-4.43.0-py3-none-any.whl` is a pure-Python wheel (`Tag: py3-none-any`, `Root-Is-Purelib: true`). No compiled extensions are built at install time from the wheel path. The sdist `pyproject.toml` declares `setuptools-rust` as a build requirement and has a `[[tool.setuptools-rust.ext-modules]]` entry for `selenium-manager`, but this Rust compilation only occurs when building the sdist from source — the wheel path (what `pip install` uses from PyPI) ships pre-built platform binaries.

The wheel includes three pre-compiled `selenium-manager` binaries (Linux ELF, macOS Mach-O, Windows PE) as package-data files. These are static assets extracted into site-packages; they are not executed during `pip install`. They are only invoked at WebDriver instantiation time if Selenium's automatic driver management is used (cs-300's harness passes an explicit ChromeDriver path via system PATH / browser installed locally, so this code path is not exercised).

Wheel integrity confirmed: SHA256 of downloaded wheel matches PyPI's published digest exactly (`4f97639055dcfa9eadf8ccf549ba7b0e49c655d4e2bde19b9a44e916b754e769`). Linux `selenium-manager` binary SHA256 matches the wheel's own RECORD file (`-BuamjlOfTTgy-H9PZEsdAfh4jHRyj6VpfNYacg1KPs`).

No entry points, no `.pth` files, no `sitecustomize.py`, no custom `cmdclass` install hooks found in the wheel. The sdist uses `setuptools.build_meta` only; no `setup.py` at top level.

All 14 transitive dependencies resolve to pure-Python wheels (confirmed by `py3-none-any` tags). No native compilation on `pip install` for any package in the tree.

---

### 5. Supply-chain integrity

PyPI package name `selenium` is registered by SeleniumHQ with a continuous publication history since 2011. No namespace collision or lookalike risk. Wheel SHA256 verified against PyPI API digest: exact match. `pyproject.toml` inside the sdist confirms the SeleniumHQ GitHub source URL. No git-URL or GitHub tarball pin — standard registry install with an exact `==` pin.

---

### 6. Alternatives note (informational, non-gating)

Playwright (Microsoft) is an alternative Python browser-smoke dep. Its transitive graph differs (it bundles browser binaries directly, larger install footprint, requires a separate `playwright install` step). Selenium was intentionally chosen by the Builder; this note is informational and does not affect the verdict.

---

### 7. License check

- selenium: Apache-2.0
- All 14 transitive deps: Apache-2.0, MIT, PSF-2.0, MPL-2.0, BSD, or dual MIT/Apache-2.0

No GPL, LGPL, SSPL, BUSL, or custom source-available licenses in the tree. All licenses are permissive and compatible with cs-300's CC-BY-NC-SA 4.0 in the applicable context (dev-only tooling, never shipped in `dist/`). No license drift.

---

### Verdict: SHIP

No Critical, no High, no Medium findings. One Advisory (PySocks abandonment posture — zero CVEs, unreachable code path in the cs-300 harness). Full dep tree of 15 packages: all on latest versions, zero CVEs (OSV + pip-audit), zero install-time execution risk from the wheel path, wheel integrity verified against PyPI digests.

CHANGELOG entry tag: `Dep audit: SHIP (clean) — selenium==4.43.0 + 14 transitive; zero CVEs; wheel SHA256 verified; no install hooks; PySocks abandonment advisory only.`
