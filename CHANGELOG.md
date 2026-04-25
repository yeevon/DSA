# Changelog

All notable changes to this repo, newest first. Includes small ops
(doc tweaks, memory updates, file moves) — not just feature work. The
intent is a complete trail of project activity that an outside reader
(or a returning Claude session) can read top-down to catch up.

Format: dated sections, each entry tagged **Added / Changed / Removed
/ Fixed / Decided / Deferred**. "Decided" captures architectural or
process decisions that don't ship code; "Deferred" captures explicit
non-decisions (a question raised and intentionally postponed).

---

## 2026-04-24

- **Added** **M-UX Task T2 — Left-rail chapter nav + completion indicators.** Mounts the left-rail chapter navigation into the T1 slot scaffold on every chapter route (lectures, notes, practice). Two new components under `src/components/chrome/`:
  - **`LeftRail.astro`** — SSR component. Reads `scripts/chapters.json` + the lectures content collection (for per-chapter section-id lists), partitions Required (ch_1–ch_6) vs Optional (ch_7 + ch_9–ch_13), renders two `<section class="group">` blocks each with an `<h3>` + `<ul>` of chapter links. Links are constructed via `` `${baseUrl}/lectures/${c.id}/` `` where `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')` — no hardcoded `/DSA/` in rendered HTML (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1; source-level grep hits only in doc comments per DA2-E / DA3-A reviewer-eyes policy). `aria-current="page"` on the chapter matching `Astro.url.pathname`'s collection-slug pattern. Sort key is `n` (chapter number) so `ch_10` sorts after `ch_9`. Consumes three of T1's previously-unreferenced `chrome.css` tokens (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) for chapter-link default colour, group-heading small-caps colour, and hover background — resolving M-UX-T1-ISS-03 (LOW).
  - **`CompletionIndicator.astro`** — JS island. Rendered inside the same `<aside data-slot="left-rail">` with `data-interactive-only` so static mode hides the checkmark slots entirely while the chapter-link rows themselves stay visible. On mount: parses an SSR-embedded `<script type="application/json">` payload of `{ chapterId: sectionIds[] }` (built from the lectures collection), fetches `/api/read_status?chapter_id=<id>` for each of the 12 chapters in parallel, applies **rule (a): "all sections marked"** (the strict rule from T2 Notes — documented here per spec step 3), and paints `✓` into the corresponding `.checkmark-slot[data-chapter-id="…"]`. Subscribes to `cs300:read-status-changed` (the same event `MarkReadButton.astro` line 111 dispatches) and re-fetches only the current chapter's status — the other 11 chapters' state cannot change without navigation, so a full 12-chapter sweep would be wasted work (resolves MUX-BO-DA2-B / MEDIUM + MUX-BO-DA3-C / LOW). Current-chapter id is derived SSR-side from `Astro.url.pathname` and embedded as `data-current-chapter-id="ch_N"`; null on non-chapter pages (the listener is a no-op there). Rule-(a) fallback: if the section-id list for a chapter is empty (which shouldn't happen — the build fails otherwise), the island paints no glyph rather than throwing. Completion rule is flagged for revisit in T2 follow-on if it never triggers in practice (per spec Notes).
  Wired into all three chapter route files (`src/pages/{lectures,notes,practice}/[id].astro`) via `<LeftRail slot="left-rail" />`. Index page (`src/pages/index.astro`) left untouched — T5 owns the index rewrite and will compose its own chapter-card surface; T2 scope is chapter-route rails only. Existing M3 surfaces (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) untouched — T4/T6 will re-home those; T2 is additive. Build clean (`npm run build` exit 0, 37 prerendered pages ship). Smoke (non-inferential) on `dist/client/lectures/ch_4/index.html`: 1× `<nav class="left-rail" aria-label="Chapter navigation">`, 2× group headings (Required + Optional), 12 chapter `href`s (ch_1..6 + ch_7, ch_9..13), 1× `aria-current="page"` on the `/DSA/lectures/ch_4/` link, 12× `class="checkmark-slot" data-chapter-id="…"` spans (one per chapter), 1× island root `<div id="cs300-completion-indicator" data-interactive-only data-current-chapter-id="ch_4" hidden>`, `data-interactive-only` attribute count up to 19 on the lectures page (6 M3 + 12 slots + 1 island root; all gated by T1's global rule). `/DSA/lectures/ch_4/` highlight mirrored on notes/ch_4 + practice/ch_4 (rail is chapter-agnostic across collections, link always points at lectures per spec — T3's collection switcher will let the user change collection). Index page unchanged: 0 `left-rail` / `checkmark-slot` hits in `dist/client/index.html`. M3 surface counts preserved exactly (8× mark-read-button, 12× section-nav, 6× annotations-pane, 6× annotate-button, 1× `data-mode="static"` body attribute, `<article>` wrapper present in all three routes). Size delta: `dist/client/` = `5219362` bytes (post-T2) vs `4537978` (post-T1) = `+681384` bytes (~666 KB, ~18 KB/page). The majority is the SSR-embedded JSON section-id payload (per-page ~12 KB × 37 pages) required for rule (a); if T8's budget evaluation flags it as over-budget, a follow-on can move the payload to a single `/api/sections` fetch (noted in T2 spec Notes). Net new JS bundled: the island's inline script is inlined into each page's HTML; no new `dist/client/_astro/*.js` chunks created. Files touched: `src/components/chrome/LeftRail.astro` (new), `src/components/chrome/CompletionIndicator.astro` (new), `src/pages/lectures/[id].astro` (add LeftRail import + `<LeftRail slot="left-rail" />`), `src/pages/notes/[id].astro` (same), `src/pages/practice/[id].astro` (same), `design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md` (Status flip todo → ✅ done 2026-04-24), `design_docs/milestones/m_ux_polish/tasks/README.md` (T2 row flip), `design_docs/milestones/m_ux_polish/README.md` (T2 task-table row flip + Done-when bullets 2 + 3 flipped `[ ]` → `[x]` with `(T2 issue file)` citation; Done-when bullet 1 left `[ ]` because it requires T4's right-rail TOC to fully satisfy "left rail, center content, right rail — renders cleanly" — per T1 issue file M-UX-T1-ISS-01 guidance, T4 Builder flips bullet 1 with `(T1 + T2 + T4 issue files)` citation since T2 alone does not satisfy it). ACs satisfied: every bullet in T2 spec's *Acceptance check* section except the auditor-driven browser smokes (live `npm run dev` mark-read smoke, browser view-source on the BASE_URL resolution, live listener refresh observation) — those are the Auditor's cycle-1 smoke test. **Carry-over from T1 issue file:** M-UX-T1-ISS-01 (Done-when bullet 1 flip) remains DEFERRED to T4 — T2 alone insufficient. M-UX-T1-ISS-03 (3 unconsumed chrome.css tokens) ✅ RESOLVED — all three (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) consumed by `LeftRail.astro`'s chapter-link, group-heading, and hover rules respectively. **Dep audit: skipped — no manifest changes.**
- **Changed** **M-UX T1 — re-audit cycle on restarted `/clean-implement` loop; verdict upheld.** User requested a fresh audit on T1; Builder + Auditor re-verified on-disk state from scratch against the spec. Zero code changes needed (implementation already matches spec); `npm run build` reproduced the prior cycle's numbers byte-for-byte (37 pages, `du -sb dist/client/` = `4537978`, every smoke grep hit count matches). Issue file updated in place: `M-UX-T1-ISS-02` (stray `.deb`) flipped LOW OPEN → ✅ RESOLVED (file not present this cycle; `git status --porcelain` empty); security-review section expanded from 5 checks to 7 (added #6 pandoc anchor contract preservation, #7 new external resource fetches — both PASS; verdict remains SHIP). Dep audit: skipped — no manifest changes. MEDIUM M-UX-T1-ISS-01 (Done-when bullet 1 partial) remains DEFERRED to T2/T4 whichever lands second; LOW M-UX-T1-ISS-03 (three unconsumed `chrome.css` tokens) remains forward-scoped to T2/T3/T4 Builders or T8 audit. T1 formally CLEAN; loop proceeds to T2–T8.
- **Added** **M-UX T1 — layout shell: three-column grid + responsive scaffold landed.** First implementation task of M-UX. `src/layouts/Base.astro` rewritten from the 51-line bare shell into the MDN-docs three-column chrome from [ADR-0002](design_docs/adr/0002_ux_layer_mdn_three_column.md): four named slots (`breadcrumb`, `left-rail`, `default`, `right-rail`), CSS grid `260px 1fr 280px` at ≥1024px collapsing to single column below. New shared design-token surface at `src/styles/chrome.css` (accent colour, font-stack, column widths, breakpoint reference, spacing scale) — imported globally so T2/T3/T4/T7 components reach the same vars without per-component imports. `src/components/chrome/` directory created with `.gitkeep` for the chrome-component family T2–T7 will populate. M3 contracts preserved verbatim: `<body data-mode="static">` default, the `body[data-mode="static"] [data-interactive-only] { display: none !important; }` global rule, the inline `detectMode()` script, and the floating "interactive mode active" badge. Chapter routes (`src/pages/{lectures,notes,practice}/[id].astro`) untouched — their existing `<article>` wrapper now flows into the layout's `<main slot>` and the `<a id="ch_N-…">` per-section anchors emitted by the M2 pandoc Lua filter survive intact (resolves MUX-BO-ISS-01 / HIGH-1; verified post-build). Step 0 prerequisite (per MUX-BO-DA2-C) executed: `pre_m_ux_baseline.md` created at `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` via worktree procedure (`git worktree add /tmp/cs-300-baseline bf9c773`, build, capture, remove — no destructive checkout, no working-tree disturbance). Pinned baseline numbers: `dist/client/` = `4.5M` (`4420947` bytes), HTML page count = `37`, `_astro/*.js` sum = `0` (no `_astro/` dir at M3 close). Post-T1 build: 37 pages still ship clean, `dist/client/` = `4537978` bytes (delta `+117031` = ~114 KB, primarily from inlined per-page `<style>` blocks emitting the new grid + chrome tokens). Build is well under T8's `<50KB` *per-page* alarm threshold for net-new client JS (which remains `0` — T1 introduces no JS islands), but the total `dist/client/` delta is over the full-tree budget; surfaced here for T8 to evaluate against the post-M-UX measurement when all eight tasks have landed. Files touched: `src/layouts/Base.astro` (rewrite), `src/styles/chrome.css` (new), `src/components/chrome/.gitkeep` (new), `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` (new), `design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md` (Status flip + carry-over ticks), `design_docs/milestones/m_ux_polish/tasks/README.md` (T1 row flip), `design_docs/milestones/m_ux_polish/README.md` (T1 task-table row flip), plus the four DA3 sibling-spec edits described in the carry-over entry below. ACs satisfied: every AC in the T1 spec's acceptance-check section is verified by the post-build artefact (37 pages, `<body data-mode="static">`, four named slot landmarks `data-slot="breadcrumb|left-rail|main|right-rail"` in built HTML, `<article>` wrapper present in all three collection routes, M3 surfaces still rendered, `data-interactive-only` rule preserved, `chrome.css` exists with shared tokens, no `drawer-trigger` slot at Base level — DOM-inspection ACs (DevTools 1280px three-column, 768px single-column, no horizontal scroll) are auditor-driven and listed in the spec for the cycle-1 audit). Carry-over from prior audits (DA3-A through DA3-D) all ticked — see the carry-over entry below for per-item resolutions. **Dep audit: skipped — no manifest changes.**
- **Added** **M-UX T1 carry-over — 4 LOW cleanup items (DA3-A..DA3-D) from cycle-5 deep analysis.** Doc polish only — no implementation impact, no source code change required. Items added to a new `## Carry-over from prior audits` section at the bottom of [`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md). T1's Builder ticks each as it lands; they touch sibling specs (T2/T3/T4/T5/T7), not T1's own deliverables. Per-item summary:
  - **DA3-A** — apply `grep -vE` filter uniformly across T2/T3/T5 BASE_URL audit-checks (T2 has the fallback today; T3 + T5 don't).
  - **DA3-B** — T7 Step 1 step-ordering note: hamburger mount depends on T7 Step 16 having modified `Breadcrumb.astro` first to add the drawer-trigger slot.
  - **DA3-C** — soften "~1s" threshold in DA2-A / DA2-B live-listener ACs (T4 line 57, T2 line 46) — reword to "within a few seconds; constraint is 'before reload', not a latency budget".
  - **DA3-D** — T4 Step 3 vocabulary↔selector consistency: prose says "headings" but selector is `article [id]` (broader). Either drop "headings" or tighten selector to `article a[id^="ch_"]` (matches M3 MarkReadButton).
  Cycle-5 deep analysis closed; cycles 1–5 (initial breakout audit + DA + DA2 + DA3) collectively drove the M-UX milestone breakout audit from ⚠️ OPEN with 3 HIGH + 4 MEDIUM to ✅ PASS with all findings RESOLVED. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — third deep-analysis pass catches 3 MEDIUM + 3 LOW audit-check enforcement gaps; all six landed.** A third, more skeptical Auditor pass on the cycle-2 DA-NN amendments tested whether the audit-checks added in cycle 2 actually exercise the contracts they claim to enforce. Six new findings (`MUX-BO-DA2-A` … `MUX-BO-DA2-F`), all amended same-day via direct spec amendment. The recurring lesson, now confirmed across three passes: **CLAUDE.md's "non-inferential verification" principle applies recursively — to the implementation, to the audit-checks, and to whether the audit-checks exercise the contracts being added.** Per-finding amendments:
  - **DA2-A (MEDIUM)** — T4 ([`tasks/T4_right_rail_toc.md`](design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md)) gains a new acceptance-check that exercises DA-3's `cs300:read-status-changed` listener live. Concrete: mark a section read in `npm run dev`, **do not reload**, observe the corresponding TOC entry's `[data-read-indicator]` flip to `data-read="true"` within ~1s. Without this AC the previous reload-state AC tested only on-mount fetch — a Builder skipping the listener would ship a regression where TOC indicators stale-render until reload, and every existing T4 AC would still pass.
  - **DA2-B (MEDIUM)** — T2 ([`tasks/T2_left_rail.md`](design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md)) Step 3 gains a `cs300:read-status-changed` listener requirement on `CompletionIndicator`, scoped to the current chapter only (chapter slug embedded as `data-current-chapter` data-attribute; listener re-fetches only that chapter's read status). Matching live-refresh AC added. Closes the cross-component asymmetry surfaced by DA-3 — without this, the user marking a section would see T4's TOC indicator update live but T2's left-rail checkmark go stale until reload.
  - **DA2-C (MEDIUM)** — T1 ([`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md)) gains a new Step 0 pointing at T8 Step 0 as a prerequisite — confirms `issues/pre_m_ux_baseline.md` exists before T1 code work begins; if missing, run T8 Step 0 first (worktree procedure). Closes the silent-skippability gap from DA-4: a Builder picking up T1 reads its spec, sees no mention of baseline capture, and plows ahead — by T8's audit, the missing baseline forces a retroactive capture against a tree where M-UX work has already landed (defeats the <50KB delta budget).
  - **DA2-D (LOW)** — T4 Step 3 pins ScrollSpy selector to `article [id]` (matches T1's preserved `<article>` wrapper contract per MUX-BO-ISS-01 / HIGH-1). An unscoped `[id]` query would still find the headings document-wide and mask a future `<article>`-rename as a silent no-op; pinning the selector turns that class of regression into a HIGH ScrollSpy break that surfaces immediately.
  - **DA2-E (LOW)** — T2/T3/T5 BASE_URL audit-checks gain a one-line note that `grep -nE '/DSA/'` may surface comment hits (`<!-- /DSA/foo -->`) — the auditor reviews matches and confirms each is not a real source-code hardcoding before failing. Default policy: reviewer-eyes, not blind-fail.
  - **DA2-F (LOW)** — T7 ([`tasks/T7_mobile_drawer.md`](design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md)) step 1 line 25 hamburger-mounting language tightened to "inside `Breadcrumb.astro`'s component-internal drawer-trigger slot" (not directly in `Base.astro`'s `breadcrumb` slot region). Now agrees with deliverable line 16 + MUX-BO-ISS-04's resolution.
  Audit file [`m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) flipped ⚠️ OPEN → ✅ PASS; six DA2 rows flipped to RESOLVED. Files touched: 7 (T1, T2, T3, T4, T5, T7 + audit file). No source code changes. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — meta-audit pass catches 1 HIGH + 4 MEDIUM defects in the original fixes; all six landed.** A second, more skeptical Auditor pass on the ISS-01–ISS-08 amendments tested whether the audit-checks themselves would actually catch the regressions they were meant to catch. Six new findings (`MUX-BO-DA-NN`), all amended same-day. The most important lesson: **a grep that exists isn't the same as a grep that catches what it's supposed to catch.** CLAUDE.md's "Code-task verification is non-inferential" rule applies to audit-checks, not just to the implementation they verify. Per-finding amendments:
  - **DA-1 (HIGH)** — T2/T3/T5 audit-check grep changed from `-F '"/DSA/'` to `-E '/DSA/'`. The original literal-quote pattern would have missed template-literal hardcoding (` `/DSA/lectures/${id}/` `) and single-quoted paths — exactly the regression class HIGH-2 was designed to prevent. Tested with the four input patterns: `-F '"/DSA/'` matched only the double-quoted form (1 of 3 regressions); `-E '/DSA/'` matched all three.
  - **DA-2 (MEDIUM)** — T4 Step 4 pins indicator marked-state contract: `data-read="true"` (matches M3's prior `.dot[data-read]` convention). Step 5 Option (a) selector tightened from "use whatever attribute T4 picks" to a deterministic `[data-read-indicator][data-read="true"]`.
  - **DA-3 (MEDIUM)** — T4 Step 4 explicitly requires `cs300:read-status-changed` listener on the new TOC's read-status island. M3 `SectionNav.astro` line 88 has this listener today; Step 4 originally transferred SectionNav's GET-fetch logic but silently dropped the listener, which would have stale-rendered TOC indicators after `MarkReadButton` toggles until reload.
  - **DA-4 (MEDIUM)** — T8 Step 0 baseline-file location pinned to `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` (sibling to the breakout audit file). Earlier "the M-UX issue file" was ambiguous — the breakout audit is ✅ PASS / frozen, and `T08_issue.md` won't exist until T8's audit. Step 1 reworded to read from the new file; matching audit-check bullet added.
  - **DA-5 (MEDIUM)** — T8 Step 0 baseline-capture procedure switched from `git checkout bf9c773` to `git worktree add /tmp/cs-300-baseline bf9c773` (with stash-and-restore fallback). Naked checkout from a dirty working tree silently discards uncommitted changes. Audit-check bullet verifies `pre_m_ux_baseline.md`'s "Command output" section shows worktree (or explicit stash sequence).
  - **DA-6 (FLAGGED, test-then-decide per user direction)** — T6 Step 4 callout: M3 `MarkReadButton.astro` is `position: fixed; bottom: 16px; left: 16px;` so moving the JSX import doesn't change visual position. Two interpretations — (i) keep floating, "re-home" is cosmetic; (ii) strip positioning, become flow-positioned in the article header. Builder implements (i) first, smokes both breakpoints, decides during T6. Not pre-decided.
  Audit file [`m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) gains a "Meta-audit (2026-04-24) — deep analysis of the original-fix amendments" narrative section + 6 new `MUX-BO-DA-NN` rows in the Issue log table; status remains ✅ PASS post-DA-fixes. Files touched: 6 (T2, T3, T4, T5, T6, T8 + audit file). No source code changes. **Dep audit: skipped — no manifest changes.**
- **Fixed** **M-UX breakout audit — spec amendments resolve all 3 HIGH + 4 MEDIUM findings.** Direct spec amendment (no implementation yet — task specs are the spec of record at planning phase). Issue file [`design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md`](design_docs/milestones/m_ux_polish/issues/m_ux_breakout_audit.md) flipped ⚠️ OPEN → ✅ PASS; all eight `MUX-BO-ISS-NN` table rows flipped to RESOLVED (LOW-1 deferred-to-T2 and LOW-2 non-blocking unchanged). Per-spec changes (each cites the originating issue ID inline):
  - **T1** ([`tasks/T1_layout_shell.md`](design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md)) — `drawer-trigger` slot dropped from `Base.astro` (4 slots only: `breadcrumb`, `left-rail`, `default`, `right-rail`); drawer trigger lives inside `Breadcrumb.astro` per T7 (resolves MUX-BO-ISS-04 / MEDIUM-1). `src/styles/chrome.css` pinned as T1 deliverable; "or inline" disjunction dropped (resolves MUX-BO-ISS-08 / MEDIUM-5). `<article>` wrapper + `<a id="ch_N-…">` anchor preservation audit-check added (Step 2 + dedicated bullet) — protects M3 `MarkReadButton`'s IntersectionObserver contract (resolves MUX-BO-ISS-01 / HIGH-1 + MUX-BO-ISS-07 / MEDIUM-4).
  - **T2** ([`tasks/T2_left_rail.md`](design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md)) — Step 2 link template switched from hardcoded `/DSA/lectures/<id>/` to `` `${baseUrl}/lectures/${c.id}/` `` where `baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');`; matching audit-check bullet greps the source for hardcoded `/DSA/` and asserts no matches (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T3** ([`tasks/T3_breadcrumb.md`](design_docs/milestones/m_ux_polish/tasks/T3_breadcrumb.md)) — Step 4 + audit-check bullet add the same `import.meta.env.BASE_URL` convention note for breadcrumb path/collection-switcher/prev-next link generation (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T4** ([`tasks/T4_right_rail_toc.md`](design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md)) — new Step 5 (re-point `MarkReadButton.refreshMarked()` from the deleted `#section-nav .dot[data-read="true"]` selector to either the new RightRailTOC indicators or a direct `GET /api/read_status?chapter_id=…` fetch — Builder picks (a) or (b) and documents); new Step 8 (reload-state correctness smoke — mark a section read, reload, confirm `MarkReadButton` renders as "Unmark" without a click); matching audit-check bullet (resolves MUX-BO-ISS-01 / HIGH-1). Decompose trigger sharpened from "if T4 grows past one session" to "after Step 1 audit, if the diff > ~30 lines new/changed code, split before writing any code" — T4b owns the HIGH-1 fix if split (resolves MUX-BO-ISS-06 / MEDIUM-3).
  - **T5** ([`tasks/T5_index_dashboard.md`](design_docs/milestones/m_ux_polish/tasks/T5_index_dashboard.md)) — Step 2 ChapterCard link template switched to `import.meta.env.BASE_URL` for all three collection links (Lectures / Notes / Practice); matching audit-check grep bullet across `ChapterCard.astro` + `index.astro` (resolves MUX-BO-ISS-02 / HIGH-2).
  - **T6** ([`tasks/T6_m3_rehome.md`](design_docs/milestones/m_ux_polish/tasks/T6_m3_rehome.md)) — Step 2 scope pinned to "lectures only for annotations + mark-read" (no Builder-time decision); consistent with T2/T3 chrome breadth and T4 TOC scope (resolves MUX-BO-ISS-05 / MEDIUM-2).
  - **T8** ([`tasks/T8_deploy_verification.md`](design_docs/milestones/m_ux_polish/tasks/T8_deploy_verification.md)) — new Step 0 (non-skippable baseline capture at `bf9c773` before T1 implementation work starts: `du -sh dist/client/` + page count + `_astro/*.js` sum, pinned in the M-UX issue file under a `## Pre-M-UX baseline` section); Step 1 reworded to consume the pinned numbers instead of the M3 T8 report's environment-dependent `~1.6 MB`; matching audit-check bullet (resolves MUX-BO-ISS-03 / HIGH-3).
  Files touched: 8 (7 task specs + audit issue file). No source code changes. T1 is now unblocked. **Dep audit: skipped — no manifest changes.**
- **Added** **M-UX task breakout — 8 task specs + index.** Mirrors
  the M3 task-breakout pattern (per-task spec under `tasks/T<NN>_<slug>.md`,
  ordering + status table at `tasks/README.md`, `issues/` directory
  scaffolded for first-audit-time creation per CLAUDE.md). Tasks:
  - **T1** — Layout shell (three-column grid + responsive scaffold).
  - **T2** — Left-rail chapter nav + completion indicators
    (Required/Optional grouping per ADR-0002).
  - **T3** — Top breadcrumb (collection switcher + prev/next + sticky).
  - **T4** — Right-rail TOC + scroll-spy island + M3 `SectionNav`
    refactor (the largest task; likely decompose candidate to T4a + T4b).
  - **T5** — Index page rewrite (mastery-dashboard placeholder; M5
    hooks pre-wired via `data-interactive-only` slots).
  - **T6** — M3 component re-homing (annotations to right rail,
    mark-read to chapter header). API-stable; no M3 contract changes.
  - **T7** — Mobile drawer + responsive sweep (the only always-loaded
    JS island M-UX introduces; budget <5KB).
  - **T8** — Deploy verification (37 pages, size budget <50KB delta,
    no M3 regression, hybrid-output split preserved).
  Critical path: T1 → T4 → T6 → T7 → T8. Three parallel branches
  after T1: chrome (T2 + T3), content-pane (T4), index (T5). Files
  added under `design_docs/milestones/m_ux_polish/`: `README.md`,
  `tasks/README.md`, 8 × `tasks/T<NN>_<slug>.md`, empty `issues/`
  directory. **Dep audit: skipped — no manifest changes.**
- **Decided / Added** **M-UX kickoff — promote Canvas/left-nav UI
  polish out of `nice_to_have.md` (trigger fired post-M3 close).**
  Per the parked entry's promotion trigger ("M3 starts and the
  chrome decisions can no longer be deferred — read-status
  indicators need a sidebar to live in, annotations need a margin
  pane"), M3 closing 2026-04-24 with the M3 client surfaces
  shipped bare into a 51-line `Base.astro` shell satisfies the
  trigger. Per CLAUDE.md non-negotiables, adoption requires an
  architecture.md amendment + ADR. **This commit lands both
  halves.**
  - `design_docs/adr/0002_ux_layer_mdn_three_column.md` (new) —
    decision: MDN-docs three-column layout with Canvas-style
    Required/Optional grouping in the left rail. Three columns on
    desktop (left chapter nav, center content, right TOC +
    annotations), single-column with hamburger drawer on mobile.
    Specific commitments per slot: chapter list grouping +
    completion indicators, prose-width-constrained center
    (~75ch), SSR TOC + scroll-spy island, mastery-dashboard
    placeholder index page (M5 hooks pre-wired). Visual style /
    color / typography / dark-mode / search all explicitly
    deferred to follow-on work — M-UX scope is layout structure
    only.
  - `design_docs/architecture.md` §1.6 (new) — "Page chrome (UX
    layer)" subsection added between "Astro content collections"
    and "Audio (Phase 7 forward-compat)". Three-column ASCII
    diagram, mobile-collapse story, interactive-mode affordances
    (read-status checkmarks + annotations pane gated on the
    `data-interactive-only` T5 contract), static-mode posture
    (left rail + TOC + content all SSR; mobile drawer is the
    only always-loaded JS island), and the M3 `SectionNav`
    refactor note (re-homes from fixed left rail to right-rail
    TOC structure — no two left rails).
  - `design_docs/milestones/README.md` — M-UX added as a sidecar
    milestone (not in original `interactive_notes_roadmap.md`
    phasing). Same edit syncs M3 status (todo → ✅ closed
    2026-04-24) and M4 status (todo → todo + upstream-gated note
    pointing at the issue file). Dependency-graph paragraph
    updated to call out M-UX as parallel-with-M4.
  M-UX milestone breakout (README + per-task specs T1–T8) lands
  in a follow-up commit per the M3 task-breakout precedent.
  **Dep audit: skipped — no manifest changes.**
- **Decided / Changed** **M4 architecture clarification — `aiw-mcp` is
  the MCP server, cs-300 contributes workflow modules (no "FastMCP
  adapter we build").** User confirmed (after pulling the actual
  [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/)
  v0.1.3 docs into the conversation) that the framework ships
  `aiw-mcp` as its FastMCP-based MCP server with streamable-HTTP
  transport + CORS already wired (M14, 2026-04-22). cs-300's job at
  M4 is to author its own workflow modules under `./workflows/`
  (`question_gen`, `grade`, `assess` — built from the framework's
  graph primitives `TieredNode` / `ValidatorNode` / `HumanGate` /
  `RetryingEdge`) and run `aiw-mcp` against them. There is no
  separate adapter to build.
  **Doc rename + reframe sweep (this commit):**
  - `design_docs/architecture.md` — §1 prose + ASCII diagram
    rewritten (two-process topology now names `aiw-mcp` Python +
    state service Node by-runtime; cross-language boundary called
    out); §3.1 retitled "Question generation (`aiw-mcp` + cs-300
    workflow modules)" with the new dispatch-via-MCP-tool
    description; §4 Path A/B prose updated; §6 out-of-scope bullet
    updated to point at jmdl-ai-workflows' framework docs.
  - `design_docs/adr/0001_state_service_hosting.md` — Path A
    rationale rewritten around the cross-language sibling-process
    model (Astro Node owns persistence; `aiw-mcp` Python owns
    workflow execution; browser bridges both); two open questions
    resolved — `ADAPTER_URL` port pin (8080, matching
    jmdl-ai-workflows README example) + external workflow
    discovery (gated on upstream feature, see issue file).
  - `design_docs/milestones/m4_phase4_question_gen/README.md` —
    full rewrite: tier policy locked to Ollama-only (matches the
    README "no cloud LLM APIs at runtime" non-negotiable); Done-when
    bullets reframed around `aiw-mcp` + cs-300 workflow modules;
    task list adds "Author cs-300 workflow modules under
    `./workflows/`" + "Stand up `aiw-mcp` launch script"; new
    Carry-over section noting the upstream gate.
  - `design_docs/milestones/m3_phase3_state_service/tasks/T1_hosting_decision.md`
    — Path A description updated (Astro Node + `aiw-mcp` Python).
  - `design_docs/milestones/m3_phase3_state_service/tasks/T5_mode_detection.md`
    — `ADAPTER_URL` port repinned 7700 → 8080; M4 forward-work note
    added about confirming `aiw-mcp`'s actual liveness probe path
    (`/health` is a placeholder; M14 smoke hit `/mcp/`).
  - `src/lib/mode.ts` — port repinned 7700 → 8080; module docstring
    rewritten to reference `aiw-mcp` instead of "the FastMCP adapter";
    forward-work note added about probe path verification at M4.
  - `README.md` — status callout, "What this is" #2, repository
    layout caption, Architecture section (now lists the two
    sibling processes by runtime + role), Settled-tech bullet
    (`aiw-mcp` + version pin + transport).
  - `CLAUDE.md` — code-vs-content rule list updated ("the FastMCP
    adapter" → "cs-300 workflow modules under `./workflows/`").
  - `design_docs/m3_deploy_verification.md` — one-line static-mode
    description updated.
  **New file (will be deleted when upstream ships):**
  `aiw_workflow_discovery_issue.md` at the cs-300 root — a
  self-contained feature-request spec for `jmdl-ai-workflows`
  proposing `AIW_EXTRA_WORKFLOW_MODULES` env var + `--workflow-module`
  CLI flag so downstream consumers like cs-300 can register
  workflow modules outside the framework's source tree. Without
  this, M4 can't proceed (the framework's lazy importer only
  finds `ai_workflows.workflows.<name>`). User is also the
  upstream maintainer; will implement and delete the file from
  cs-300's root once shipped.
  **Cloud-LLM constraint reaffirmed.** Question generation runs
  against local Ollama only; the framework's `claude_code` (OAuth
  subscription) and `gemini_flash` (LiteLLM) tiers are available
  but not registered in cs-300's default tier registry. Constraint
  may relax if the user later self-hosts Ollama on a cloud server,
  at which point Claude Code's subscription tier could come back
  into play. No cloud LLM API keys at runtime today.
  **No cs-300 source code changes beyond `src/lib/mode.ts` port
  repinning and docstring rewrite.** Files touched: see the
  rename-and-reframe list above. **Dep audit: skipped — no
  manifest changes** (no `package.json`, `package-lock.json`,
  `pyproject.toml`, `.nvmrc`, `.pandoc-version` edits in this
  commit).
- **Fixed** **M3 T8 — Deploy verification + workflow path fix.**
  Audit caught a real M3-into-M2 regression: the `@astrojs/node`
  adapter (added by T3) splits `dist/` into `dist/client/`
  (prerendered HTML for GH Pages) and `dist/server/` (Node
  adapter runtime — not used by GH Pages). M2 T6's deploy
  workflow uploaded `path: ./dist`, which after the adapter
  switch would have shipped both directories and served the
  wrong root index. Fixed by changing the workflow's
  `actions/upload-pages-artifact@v3` `path:` from `./dist` →
  `./dist/client`. **Pre-fix deploy would have broken the
  public site**; post-fix the upload payload is byte-equivalent
  to what M2 T6 expected. Verification doc at
  `design_docs/m3_deploy_verification.md` covers: page count
  parity (37/37), static-mode behavioural verification (all 4
  M3 UI surfaces in HTML + CSS-hidden under T5 contract), bundle
  inspection (zero server-only paths in client JS — `better-sqlite3`,
  `drizzle`, `gray-matter`, `src/lib/seed`, `src/db` all 0 hits),
  and the hybrid-output GH Pages compatibility check (M3 audit
  fix F3). Files added: `design_docs/m3_deploy_verification.md`.
  Files changed: `.github/workflows/deploy.yml` (one-line path
  fix + comment). Runtime push verification deferred until the
  user pushes M3 commits and the workflow fires.
- **Added** **M3 T7 — Read-status indicator.** Full CRUD:
  `GET /api/read_status?chapter_id=…` (returns
  `{section_ids: [...]}` for marked sections in that chapter via
  Drizzle innerJoin on sections.chapter_id),
  `POST /api/read_status` (idempotent upsert via
  `onConflictDoUpdate(readAt: Date.now())`),
  `DELETE /api/read_status/:section_id` (un-mark, 204). Routes
  restructured into a folder same as T6: `read_status/index.ts`
  for GET+POST, `read_status/[section_id].ts` for DELETE. UI:
  `SectionNav.astro` (fixed left-side TOC, one row per section
  with a colored dot — green when marked, grey otherwise; loads
  marked-set once on mount via GET) + `MarkReadButton.astro`
  (fixed bottom-left toggle that targets the currently-visible
  section via `IntersectionObserver` on the `<a id="ch_N-…">`
  anchors; POST or DELETE on click; updates the dot via
  `cs300:read-status-changed` CustomEvent which SectionNav
  listens to). Both wired into `src/pages/lectures/[id].astro`;
  both carry `data-interactive-only` per T5. Smoke (auditor):
  `scripts/read-status-smoke.mjs` runs POST × 3 → GET (count=3) →
  DELETE one → GET (count=2), all 4 steps PASS. Regression check:
  T6 annotations smoke also passes against the same dev server.
  Chapter page HTML contains all 4 UI surfaces (section-nav,
  annotations-pane, annotate-button, mark-read-button) with
  `data-interactive-only` markers; chapter page size grew from
  ~300 KB (T6) to ~360 KB (T7). Files added:
  `src/components/read_status/{SectionNav,MarkReadButton}.astro`,
  `src/pages/api/read_status/[section_id].ts`,
  `scripts/read-status-smoke.mjs`. Files renamed:
  `src/pages/api/read_status.ts` → `read_status/index.ts`. Files
  changed: `src/pages/lectures/[id].astro` (+2 imports + 2 uses).
- **Added** **M3 T6 — Annotations end-to-end (the M3 dogfood).**
  Full CRUD: `GET /api/annotations?section_id=…` (array),
  `POST /api/annotations` (insert, returns 201 + row),
  `DELETE /api/annotations/:id` (204). Routes restructured from
  `src/pages/api/annotations.ts` to a folder
  (`annotations/index.ts` for GET+POST, `annotations/[id].ts` for
  DELETE) so Astro's dynamic `[id]` segment works. UI components:
  `AnnotateButton.astro` (floating button on selection — captures
  section_id via DOM walk to nearest `<a id="ch_N-…">` anchor +
  char offsets via TreeWalker; POSTs on click) +
  `AnnotationsPane.astro` (fixed right-side list — fetches per
  visible section, renders snippet + delete button, refreshes via
  CustomEvent on insert). Both wired into
  `src/pages/lectures/[id].astro` (sectionIds passed from MDX
  frontmatter); both carry `data-interactive-only` per T5
  contract. Smoke (auditor): `scripts/annotations-smoke.mjs` runs
  the full POST → GET → DELETE → GET cycle against the dev server,
  all 4 steps PASS; chapter page HTML contains both component
  IDs + the `data-interactive-only` markers (verified via curl).
  In static mode the components are CSS-hidden but the JS islands
  bail silently (their fetch to `/api/annotations` 404s on GH
  Pages → no error UX; pane stays empty). Files added:
  `src/components/annotations/{AnnotateButton,AnnotationsPane}.astro`,
  `src/pages/api/annotations/[id].ts`, `scripts/annotations-smoke.mjs`.
  Files renamed: `src/pages/api/annotations.ts` →
  `src/pages/api/annotations/index.ts`. Files changed: that
  index.ts (rewritten from 501-stub to real GET+POST impl),
  `src/pages/lectures/[id].astro` (+2 imports + 2 uses).
- **Added** **M3 T5 — `detectMode()` + bootstrap mode flag.**
  `src/lib/mode.ts` exports `detectMode(): Promise<'interactive' |
  'static'>` matching architecture.md §4's listing exactly: two
  parallel `fetch` probes (`ADAPTER_URL + '/health'` for the M4
  FastMCP adapter; `/api/health` for the T3 state service);
  AND-condition on both `r.ok`; any throw → `'static'`.
  `ADAPTER_URL = 'http://localhost:7700'` (FastMCP convention; M4
  inherits or overrides — open question deferred from T1 ADR).
  `Base.astro` updated to:
  (1) default `<body data-mode="static">` server-side (so the
  page renders correctly even before client-side probe completes);
  (2) inline `<style is:global>` with the rule
  `body[data-mode="static"] [data-interactive-only] { display: none
  !important }` — the conditional-render plumbing T6/T7 surfaces
  ride;
  (3) a tiny `<script>` that imports + runs `detectMode()` on load
  and sets `document.body.dataset.mode`;
  (4) a placeholder `<div data-interactive-only>interactive mode
  active</div>` (bottom-right green pill) so the smoke test has a
  visible target. Smoke (auditor): `npm run build` exit 0
  (37 prerendered + server bundle); `npm run dev` + curl a chapter
  page returns 294 KB with `<body data-mode="static">` server-
  default, inline CSS rule present, placeholder div in HTML
  (display: none under the static-mode CSS). In dev mode without
  the M4 adapter running on 7700, the adapter probe fails → mode
  stays `'static'` → placeholder hidden. Until M4's adapter ships,
  `detectMode()` will always return `'static'` in both production
  and local — the wiring + conditional-render plumbing land here
  for M4 to flip on. Files added: `src/lib/mode.ts`. Files changed:
  `src/layouts/Base.astro` (+CSS rule + script + placeholder).
- **Added** **M3 T4 — Seeding (chapters + sections from MDX
  frontmatter).** `src/lib/seed.ts` implements idempotent upserts
  per architecture.md §2 "Seeding": 12 chapters from
  `scripts/chapters.json`, 365 sections from
  `src/content/lectures/*.mdx` frontmatter `sections:` array.
  Uses FS + gray-matter (rather than Astro's `getCollection`) so
  the same module works inside Astro API routes AND as a
  standalone Node script (T4 smoke). `src/pages/api/health.ts`
  extended to call `seed()` on first GET per process — single-shot
  guard skips re-runs. Idempotent via `ON CONFLICT DO UPDATE` —
  re-runs from any state are safe. `gray-matter` + `tsx` deps
  added (gray-matter for frontmatter parsing; tsx so the
  smoke script can import the .ts seed module directly). Smoke
  (auditor): `rm -f data/cs-300.db && node scripts/db-migrate.mjs &&
  npx tsx scripts/seed-smoke.mjs` → exits 0 with `chapters=12,
  sections=365`. Re-running yields same counts (idempotent
  verified). Dev-server `GET /api/health` first call returns
  `{db:"ok", seeded:{chapters:12,sections:365}, seed_error:null}`;
  second call uses in-memory cache (same response, no re-seed).
  Direct DB query confirms 12 + 365 row counts. M4+ rows
  (questions, attempts, fsrs_state, annotations, read_status)
  untouched per architecture.md §2 "Questions and attempt state
  are never touched". Files added: `src/lib/seed.ts`,
  `scripts/seed-smoke.mjs`. Files changed: `src/pages/api/health.ts`
  (+seed call + 2 module-level state vars), `package.json` deps
  (+gray-matter, +tsx).
- **Added** **M3 T3 — Astro API route stubs (architecture.md §3).**
  Seven routes under `src/pages/api/`. `health.ts` is the only
  fully-implemented one — returns `{ok, version, db}` with
  `db: 'ok'` from a `SELECT 1` against the Drizzle client (T2).
  The other six return 501 with `{kind: 'not_implemented',
  impl_milestone: '...'}` envelopes pointing at the milestone
  that owns the impl: `attempts.ts` → M4/M5/M6 per question type;
  `review/due.ts` → M5; `questions/bulk.ts` → M4;
  `fsrs_state/[question_id].ts` → M5; `annotations.ts` → M3 T6;
  `read_status.ts` → M3 T7. All routes export `prerender = false`.
  **`@astrojs/node` adapter installed** (`@astrojs/node@^10.0.6`,
  standalone mode); `astro.config.mjs` wires it. Astro 6 removed
  hybrid output mode — the modern pattern is `output: 'static'`
  (default; pages prerender) + adapter + per-route `prerender =
  false` opt-out for API handlers. The Node-server entrypoint
  produced by the adapter is not uploaded by M2 T6's deploy
  workflow (which uploads `dist/`); only the prerendered chapter
  pages ship to GH Pages. Smoke (auditor): `npm run build` exits
  0 (37 prerendered pages + server bundle); `npm run dev` +
  curl confirms all 9 endpoints (GET+POST on annotations and
  read_status; single verb on the others) return expected
  status + body. Astro 6's CSRF protection rejects POST/PATCH
  without a matching `Origin` header — real frontend `fetch()`
  sets it automatically; smoke tests pass `-H 'Origin: http://localhost:<port>'`.
  Files added: 7 route files. Files changed: `astro.config.mjs`
  (+1 import + 1 adapter line), `package.json` deps (+1).
- **Added** **M3 T2 — Drizzle schema + initial migration.** SQLite
  state service schema instantiated per architecture.md §2 — 7
  tables (chapters, sections, questions, attempts, fsrs_state,
  read_status, annotations) + 3 indexes (idx_questions_chapter,
  idx_attempts_question, idx_fsrs_due). Files added: `src/db/schema.ts`
  (Drizzle table defs, 1:1 with arch §2 column names/types/FKs),
  `src/db/client.ts` (singleton `db` export with WAL + foreign_keys
  pragmas), `drizzle.config.ts` (sqlite dialect, `data/cs-300.db`
  path), `drizzle/0000_tiny_bug.sql` (generated migration —
  drizzle-kit auto-named it; semantic shape is what matters),
  `scripts/db-migrate.mjs` (programmatic migrator — `drizzle-kit
  push` requires TTY, this works headless), `scripts/db-smoke.mjs`
  (verifies 7 tables + 3 indexes present). Deps installed:
  `drizzle-orm@0.45.2`, `better-sqlite3@12.9.0`,
  `drizzle-kit@0.31.10`, `@types/better-sqlite3@7.6.13`. `data/`
  added to `.gitignore` (per-dev SQLite file). Smoke (auditor):
  `rm -f data/cs-300.db && node scripts/db-migrate.mjs && node
  scripts/db-smoke.mjs` exits 0; output lists exactly 7 user tables
  + 3 user indexes. `npm run build` still produces 37 pages
  cleanly (DB infra doesn't affect Astro static build).
- **Decided** **M3 T1 — Path A (Astro server) confirmed for the
  state service.** ADR 0001 written at `design_docs/adr/0001_state_service_hosting.md`
  (first ADR in the repo — `design_docs/adr/` directory created
  per CLAUDE.md "created when needed" convention). Drives M3 T2
  (Drizzle + better-sqlite3), T3 (Astro API routes under
  `src/pages/api/` with hybrid output), T5 (`detectMode()` probes
  `/api/health` + the M4 adapter URL). Trade-offs accepted: reject
  WASM bundle weight (~2 MB) + browser-side migrations in exchange
  for simpler schema management + alignment with architecture.md
  §4's recommendation. `architecture.md` §5 row 2 flipped from
  open → ✅ resolved with ADR link. M3 README's "Open decisions
  resolved here" mirrored.
- **Fixed** Added `.nojekyll` at repo root. GitHub's implicit Jekyll
  `pages-build-deployment` was still firing on push after T8 deleted
  the Jekyll source, crashing on `src/pages/index.astro` (Jekyll
  parsed Astro frontmatter as YAML). The marker file disables the
  implicit Jekyll workflow entirely; `actions/deploy-pages@v4` from
  M2 T6 is now the only deploy path.

## 2026-04-22

- **Changed** `chapters/ch_4/notes.tex` — compact reference mirror of
  Step-3 lectures.tex additions: array `append` row in decision matrix
  re-flagged with `$^\ast$` (was `$1^\ast$` in cell — confusing) and
  one-line footnote added under the table: *"Array append is amortized
  $O(1)$ via doubling --- single operations can be $O(n)$ on the resize
  step."* Net +4 lines (was 133, now 137). Build verified: `pdflatex`
  produces 2-page PDF.
- **Changed** `chapters/ch_4/lectures.tex` — Step-3 ch_4 revisions per
  approved gap analysis. **Title fix:** subtitle *"Lists, Stacks, and
  Queues"* → *"Lists, Stacks, Queues, and Deques"*. **Cross-ref fix:**
  §4.10 opening now back-refs §3.15 for insertion sort's first
  appearance on arrays. **Three new callouts:**
  - §4.1 `notebox` *"Two interface families: Sequence and Set"* —
    OCW 6.006 lec2's framing. Names extrinsic-vs-intrinsic order;
    explains why ch_4 (Sequence) and ch_5–ch_6 (Set) are separate
    chapters; pre-empts the `\subsection{List is the root ADT}`
    discussion with the abstraction one level up.
  - §4.11 `examplebox` *"std::list::splice: the operation only a
    linked list can do in O(1)"* placed at the end of the
    sentinel-discussion section. ~10-line C++ snippet showing
    range-splice between two `std::list<int>` instances; one paragraph
    explaining the four-pointer rewire and why `std::vector` cannot
    match it. The canonical "why use std::list in modern C++" answer.
  - §4.16 new subsection *"Implementing the ring buffer"* — extends
    the existing "What about array-backed queues?" notebox with
    concrete content per CLRS Ch 10.1. Includes: `defnbox` defining
    head/tail wrap-around semantics; ~25-line C++ `examplebox` with
    explicit size counter; `warnbox` on the `head==tail` full-vs-empty
    ambiguity (size-counter fix vs leave-one-slot-unused fix);
    closing `notebox` on why ring buffers dominate in low-latency /
    lock-free producer-consumer code.
  **Build verified:** `pdflatex` produces 51-page PDF, no errors.
  **Net delta:** +135 lines (was 3232, now 3367), ~+4.2% growth — close
  to the +90 estimate (the ring-buffer block ran longer because the
  warnbox + closing notebox were warranted). Still smallest-delta
  Step 3 of any chapter so far. `notes.tex` updated separately above.
- **Added** `design_docs/chapter_reviews/ch_4_gaps.md` — Step-2 gap
  analysis for ch_4 against CLRS Ch 10.1–10.2 (Stacks/Queues/Linked
  Lists with array + circular-array implementations and formal
  sentinel `L:nil`) and OCW 6.006 lec2 (Sequence vs Set interface
  ADT framing, Sequence ops table comparing Array / Linked List /
  Dynamic Array). Per the new "3–5 high-value adds, defer the rest
  to post-build audit" rule, only **3 additions** proposed:
  - **§4.1:** ADD Sequence-vs-Set ADT framing notebox from OCW lec2.
    Frames why ch_4 (sequence) and ch_5–ch_6 (set) are different
    chapters.
  - **§4.16:** ADD ring-buffer / circular-array queue defnbox +
    examplebox per CLRS 10.1. ch_4 currently *names* the ring buffer
    in §4.15 and walks past it without showing the implementation.
  - **§4.7 or §4.11:** ADD `std::list::splice` examplebox — modern-C++
    idiom that is the actual production reason DLLs exist; cited only
    indirectly in the existing `[Linked lists rarely win in modern
    C++]` warnbox at line 836.
  Plus 3 minor must-do fixes: title subtitle adds "and Deques" (§4.17);
  §4.10 back-refs §3.15 for insertion sort; `notes.tex` footnote
  explains `$^*$` on array append (amortized).
  **Explicitly deferred to post-build audit**: `unique_ptr`-based LLs,
  tail-call optimization in §4.12, formal CLRS sentinel `L:nil`,
  two-stacks-queue / two-queues-stack puzzles, block-based deque
  internals, OCW Set-interface details (belong in ch_5/ch_6),
  shrink-policy $1+\varepsilon$ derivation (already touched in ch_3).
  Headline: smallest-delta gap report so far — ~+90 lines (~+2.6%,
  lands ch_4 at ~3320, smaller than ch_3's post-Step-3 3437) — matches
  inventory's "ch_4 is the cleanest chapter" finding. Awaiting user
  approval before Step 3.
- **Added** `design_docs/chapter_reviews/ch_4.md` — Step-1 as-is
  inventory of `chapters/ch_4/lectures.tex` (3232 lines, 18 sections,
  148 callout boxes — the densest of any chapter so far) and
  `chapters/ch_4/notes.tex` (133 lines). Section-by-section catalogue
  of §4.1–§4.18 (List ADT, SLL/DLL implementations, Search, Traversal,
  Sorting, Sentinels, Recursion, Stack/Queue/Deque ADTs + their LL
  implementations, Array-Based Lists). Notable findings:
  (a) **Cleanest chapter in the repo so far** — clean numbering, no
      stubs, all cross-chapter refs correct (Ch 5 hash tables, Ch 6
      trees, optional ch_10 graphs), every algorithm has a worked C++
      `lstlisting` example.
  (b) **Stale companion-materials line** at lines 3227–3230 — same
      pattern as other chapters, already deferred to Phase 2 globally.
  (c) **Title subtitle omits "Deques"** despite §4.17 covering them —
      one-line fix in Step 3.
  (d) **Minor cross-ref opportunities**: §4.10 (insertion sort on LL)
      could back-ref §3.15; `notes.tex` decision matrix has an
      unexplained `$^*$` on array append.
  (e) **Step-2 candidates**: `std::list::splice`, tail-call discussion
      in §4.12 recursion section, `unique_ptr`-based LL ownership.
      All bounded by the new "3–5 high-value adds; defer rest to
      post-build audit" rule.
  Step-2 gap analysis to follow.
- **Saved memory** `feedback_chapter_review_scope.md` — per user
  direction at end of ch_3 Step 3: per-chapter Step-2 reports propose
  3–5 high-value additions max; everything else missing relative to
  CLRS/OCW gets deferred to a post-main-build optional-content audit.
  Avoids bloating chapters and slowing the main app build.
- **Changed** `chapters/ch_3/notes.tex` — compact reference mirror of
  Step-3 lectures.tex additions: (1) bubble-sort row asterisked with
  footnote pointing to ch\_13.1 (per gap report — discoverability fix);
  (2) counting-sort row added ($O(n+k)$, stable, not in-place) since
  counting sort is now a full §3.20 subsection; (3) bucket-sort row
  added with $\dagger$ footnote noting uniform-distribution assumption
  and ch\_13.3 pointer. Net +5 lines (was 137, now 142). Build verified:
  `pdflatex` produces 2-page PDF.
- **Changed** `chapters/ch_3/lectures.tex` — Step-3 ch_3 revisions per
  approved gap analysis. **Removals/fixes:**
  - Dropped §3.22 stub (`\section{3.22 \textit{(next section -- ready
    to scrape)}}`) per ch_2 precedent; chapter now ends at §3.21.
  - Fixed 2 single-line wrong cross-refs ("Big-O is in Chapter 4" →
    "Big-O in \textsection 3.10"; "Big-O notation, the core
    vocabulary of Chapter 4" → "formalized in the next section,
    \textsection 3.10").
  - Fixed §3.6 closer notebox: replaced Chapter-4 forward-ref with
    correct §3.10/§3.8 forward-refs.
  - Fixed §3.14 intro: replaced Chapter-5 reference with rest-of-chapter
    list + bubble-sort/heap-sort pointers (ch\_13.1 / ch\_7).
  - Fixed §3.20 closer ideabox: replaced "next chapter (4) is
    complexity analysis proper" with §3.10 + ch_4 forward-ref.
  - Added bubble-sort discoverability pointer in §3.10 halfway-recap
    "Incremental:" bullet, naming ch\_13 extras as the home.
  **Additions (5 new callouts):**
  - §3.10 `notebox` — *Little-oh and little-omega: strict versions of O
    and Ω.* Formal definitions of $o$ and $\omega$ + analogy table
    (O ↔ ≤, Ω ↔ ≥, Θ ↔ =, o ↔ <, ω ↔ >). Per CLRS Ch 3.1–3.2.
  - §3.15 `notebox` — *Loop invariants: how to prove insertion sort
    correct.* CLRS Ch 2.1's init/maintenance/termination structure
    applied to insertion sort.
  - §3.19 `notebox` — *The Master Theorem: a recipe for divide-and-
    conquer recurrences.* CLRS Ch 4 — three cases for $T(n) = aT(n/b)
    - f(n)$ with applications (merge sort, binary search, quicksort
    average) and recurrence cheatsheet.
  - §3.20 promoted to full subsection — counting sort with `defnbox`
    - cumulative-sum C++ implementation + walk-backward stability
    `warnbox` + when-to-use `ideabox`. Per CLRS 8.2 + OCW lec5.
    (Was previously just a closing notebox in radix sort.)
  - §3.21 `notebox` — *Bucket sort: counting sort's distribution-aware
    cousin.* Average $O(n)$ assuming uniform distribution; degrades to
    $O(n^2)$ otherwise. Pointer to ch\_13.3 for full treatment.
  **Build verified:** `pdflatex` produces 53-page PDF, no errors. Two
  in-flight LaTeX-syntax fixes (escape `_` in `ch_13` / `ch_7` / `ch_3`
  references → `ch\_13` etc., to prevent unintended math-mode subscript)
  applied at lines 1768, 1792–1793, 2850.
  **Net delta:** +194 lines (was 3243, now 3437), ~6% growth — bigger
  than my +90 estimate (multi-paragraph noteboxes ran longer than
  guessed, same pattern as ch_2). Still within the "don't make it
  impossibly long" filter. Compact reference (`notes.tex`) updated
  separately above.
- **Added** `design_docs/chapter_reviews/ch_3_gaps.md` — Step-2 gap
  analysis for ch_3 against OCW 6.006 lec3/lec5 (sorting/linear sorting)
  - r03/r05 (recitations), and CLRS 3rd-ed Ch 2.1–2.3 (insertion sort
  - loop invariants + merge sort), Ch 3.1–3.2 (full asymptotic
  notation + standard functions), Ch 8.2–8.4 (counting/radix/bucket
  sort). Per-section verdicts:
  - **§3.10:** ADD little-oh + little-omega notation + the asymptotic
    analogy with real numbers (O ↔ ≤, Ω ↔ ≥, Θ ↔ =, o ↔ <, ω ↔ >).
  - **§3.15:** ADD loop-invariants notebox (init / maintenance /
    termination), CLRS Ch 2.1's canonical correctness-proof
    technique, demoed on insertion sort.
  - **§3.19:** ADD Master Theorem preview notebox (3 cases for
    $T(n) = aT(n/b) + f(n)$, applied to merge sort) — makes the
    informal recurrence-tree arguments rigorous.
  - **§3.20:** ADD counting sort as a standalone subsection (not
    just a closing notebox in radix sort) with cumulative-sum
    implementation + stability proof. Per CLRS 8.2 + OCW lec5.
  - **§3.21:** ADD bucket-sort pointer to ch_13.3 (same
    discoverability pattern as bubble sort).
  - **FIX 5 critical pre-existing wrong cross-refs** (lines 1041,
    1183, 1501, 1755, 3013) where ch_3 says "Big-O is in Chapter 4"
    or "sorting is in Chapter 5" — both belong in this chapter per
    cs-300's structure.
  - **DROP §3.22 stub** per ch_2 precedent.
  - **Bubble sort discoverability fixes**: pointer to ch_13.1 in
    §3.10 halfway recap, line 1755 ref, and notes.tex sorting table
    (per user direction — bubble sort coverage is in ch_13, just
    needs to be findable).
  Headline: ch_3 is already strong (3243 lines, 175 callouts).
  CLRS/OCW add 4 modest improvements (~90 lines) plus must-do fixes.
  Out of scope: full master-theorem proof, sentinel-based merge,
  Stirling's approximation, randomized quicksort analysis (too deep),
  heap sort (lives in ch_7), full bucket-sort analysis (pointer
  enough). Net delta if approved: ~+90 added, −3 removed (~3% growth).
  Awaiting user approval before drafting Step-3 revisions.
- **Added** `design_docs/chapter_reviews/ch_3.md` — Step-1 as-is
  inventory of `chapters/ch_3/lectures.tex` (3243 lines) and
  `chapters/ch_3/notes.tex` (137 lines). Section-by-section catalogue
  (18 sections with content + 1 stub at §3.22, plus numbering gaps at
  §3.7 and §3.11–§3.13, 70+ subsections, **175 callout boxes**) with
  topics, depth markers, callout counts, cross-references, stylistic
  patterns, and flagged issues. Notable findings:
  (a) **5 critical pre-existing wrong cross-refs** (lines 1041, 1183,
      1501, 1755, 3013) say "Big-O is in Chapter 4" or "sorting is in
      Chapter 5," but Big-O is in §3.10 and 6 sorts are in §3.15–§3.20
      OF THIS CHAPTER. Author appears to have written ch_3 with a
      different chapter mapping in mind than cs-300's actual structure.
  (b) **§3.22 is a stub** (drop per ch_2 precedent).
  (c) **Numbering gaps** (§3.7 missing, §3.11–§3.13 missing).
      Recommend leaving as-is — renumbering 22 sections is churn.
  (d) **Bubble sort: mentioned in `notes.tex` table and line 1755 ref,
      but never covered** by any §3.X. Decision needed during Step 3.
  (e) **Heap sort: correctly deferred to ch_7** (optional) but ch_3
      references treat it ambiguously.
  (f) **Stylistic divergence from ch_2**: ch_3 uses `lstlisting` (21
      blocks) extensively; ch_2 uses `verbatim`. Three chapters,
      three styles.
- **Changed** `chapters/ch_2/notes.tex` — added 3 compact-reference
  updates per gap analysis: (1) renamed "DP: the template" subsection
  to "DP: the template (SRTBOT)" with the OCW SRTBOT mnemonic and
  guess+brute-force pattern; (2) new `\subsection*{``LCS'' is
  ambiguous}` with the substring-vs-subsequence comparison table;
  (3) new 5th "Top gotcha" bullet on knapsack DP being pseudopolynomial.
  Net +20 lines.
- **Changed** `chapters/ch_2/lectures.tex` — Step-3 ch_2 revisions per
  approved gap analysis. **Removals/fixes:**
  - Dropped §2.11 stub (`\section{2.11 \textit{(next section -- ready
    to scrape)}}`) per user direction; chapter now ends at §2.10.
  - Fixed 4 broken cross-chapter refs to ch_1 (side-effect of ch_1
    Step 3 renumbering): `\textsection 1.12` → `1.10`,
    `\textsection 1.11` (×2) → `1.9`, `\textsection 1.9` → `1.5`
    (the last was already pre-existing wrong).
  - Fixed §2.1 closer pre-existing wrong cross-ref ("big-O, which
    starts in §2.2" → "which is formalized in chapter 3").
  **Additions (six new callouts):**
  - §2.2 `notebox` — *Two paths to an algorithm: reduce, or design.*
    OCW lec1's two-prong recipe (reduce-to-known vs design-recursive),
    framing §2.4–§2.10 strategies as the design fallback.
  - §2.4 `defnbox` — *SRTBOT: a fuller version of the template.* OCW's
    6-step recursive-design recipe (Subproblem / Relate / Topo /
    Base / Original / Time) introduced alongside cs-300's existing
    3-part template.
  - §2.4 `notebox` — *Recursive strategies, classified by call-graph
    shape.* OCW's classification (brute force = star, decrease &
    conquer = chain, divide & conquer = tree, DP = DAG, greedy =
    subgraph), unifying §2.4–§2.10.
  - §2.8 `notebox` — *"DP solves knapsack" is true — but only
    pseudopolynomially.* Resolves latent confusion: O(nW) DP for
    knapsack is not strongly polynomial since W can be exponential
    in input bits. Defines pseudopolynomial vs strongly polynomial.
  - §2.9 `examplebox` — *Why earliest-finish is optimal: a sketch.*
    Worked greedy-correctness proof for activity selection: exchange
    argument for greedy-choice property + same-shape argument for
    optimal substructure. Concretizes the abstract template cs-300
    already mentions but doesn't demonstrate.
  - §2.10 `notebox` — *"LCS" usually means subsequence, not substring.*
    Caught a real terminology bug: cs-300 uses "LCS" for the
    contiguous-substring variant, but every standard textbook (CLRS
    15.4, OCW lec16) uses "LCS" for the non-contiguous-subsequence
    variant. Comparison table of the two recurrences. Per option (B):
    keep cs-300's content, add clarifying notebox.
  **Build verified:** `pdflatex` produces 34-page PDF, no errors.
  Net delta: +184 lines (was 2045, now 2229), ~9% growth — bigger than
  my ~+70 estimate in the gap report (multi-paragraph noteboxes ran
  longer than guessed). Still well within the "don't make it
  impossibly long" filter. `notes.tex` (compact reference) not yet
  updated; awaiting user direction on whether to mirror.
- **Added** `design_docs/chapter_reviews/ch_2_gaps.md` — Step-2 gap
  analysis for ch_2 against OCW 6.006 lec15–18 (DP/recursive algorithms)
  - lec1 (algorithm framing) and CLRS 3rd-ed Ch 15.3 (Elements of DP),
  Ch 15.4 (LCS = subsequence), Ch 16.3 (Huffman / greedy correctness
  proof template). Per-section verdicts:
  - **§2.1:** FIX one pre-existing wrong cross-ref ("Big-O starts in
    §2.2" → "Big-O is in ch_3").
  - **§2.2:** ADD reduce-vs-design recipe notebox from OCW lec1/lec15.
  - **§2.4:** ADD SRTBOT framework defnbox + DAG-shape recursion-class
    notebox (unifies §2.4–§2.10).
  - **§2.8:** ADD pseudopolynomial notebox (resolves "DP solves
    knapsack but it's still NP-hard" cognitive dissonance).
  - **§2.9:** ADD activity-selection correctness sketch (greedy-choice
    - optimal substructure → optimal). Skipping Huffman to avoid
    bloating ch_2 with priority-queue dependency.
  - **§2.10:** ADD LCS terminology clarification — cs-300's "LCS"
    is longest common SUBSTRING (contiguous); textbook LCS is
    SUBSEQUENCE (non-contiguous). Different problem, different
    recurrence. Caught this comparing cs-300 §2.10 to CLRS 15.4 and
    OCW lec16.
  - **DROP §2.11** stub per user direction.
  - **FIX 4 broken cross-chapter refs** to ch_1 (side-effect of ch_1
    Step 3 renumbering).
  Headline: with the algorithm-strategies framing locked, OCW adds
  meaningful depth (SRTBOT, DAG classification, pseudopolynomial)
  while CLRS Ch 15.3/16.3 add formal greedy-correctness template.
  Most CLRS depth (master method, amortized methods, insertion sort,
  approximation algorithms, NP-completeness) belongs elsewhere in
  cs-300 (mostly ch_3) or is too advanced. Net delta if approved:
  ~+70 added lines, −3 removed, chapter grows ~3.5%. Awaiting user
  approval before drafting Step-3 revisions.
- **Added** `design_docs/chapter_reviews/ch_2.md` — Step-1 as-is
  inventory of `chapters/ch_2/lectures.tex` (2045 lines) and
  `chapters/ch_2/notes.tex` (152 lines). Section-by-section catalogue
  (10 sections with content + 1 stub, 56 subsections, 111 callout boxes)
  with topics, depth markers, callout counts, cross-references, and
  flagged issues. Notable findings:
  (a) **§2.11 is a stub** — explicit "ready to scrape" placeholder,
      no content. Decision needed in Step 2/3 on how to resolve.
  (b) **§2.6 Data Privacy and §2.7 Ethical Guidelines are
      SNHU-specific** — CLRS/OCW won't augment them (~390 lines,
      ~19% of the chapter).
  (c) **Cross-chapter refs to ch_1 are broken** as a side-effect of
      the ch_1 renumbering done in this same session: `\textsection
      1.12` → should be 1.10, `\textsection 1.11` (×2) → should be 1.9,
      `\textsection 1.9` → likely was already wrong (referred to
      Multiple Vectors / linear search) → should be 1.5. Will fix in
      ch_2 Step 3.
  (d) ch_2 uses `\begin{verbatim}` for code blocks instead of
      `lstlisting` — a stylistic divergence from ch_1.
- **Changed** `chapters/ch_1/notes.tex` — added 6th "Top gotcha"
  bullet documenting that `std::vector` doesn't auto-shrink and the
  `vector<T>().swap(v)` force-release idiom. Mirrors the new
  `shrink_to_fit` warnbox in `chapters/ch_1/lectures.tex` §1.6 but
  in compact-reference form. Word-RAM and amortized-cost additions
  intentionally not mirrored to notes.tex (pedagogical content, not
  reference data).
- **Changed** `chapters/ch_1/lectures.tex` — Step-3 ch_1 revisions
  per approved gap analysis. **Removals:** old §1.1 (Programming
  Basics) and old §1.2 (Code and Pseudocode) cut entirely (273 lines)
  per option (A) — Coral framing dropped, chapter reframed as pure
  C++ refresher. **Renumbering:** §1.3–§1.17 → §1.1–§1.15
  (15 sections, all internal cross-references updated). **Additions:**
  - `notebox [The model has a name: Word-RAM]` in new §1.1 (formerly
    §1.3) — names the underlying model, forward-refs ch_3.
  - `defnbox [Amortized cost]` in new §1.6 (formerly §1.8) —
    formalizes the amortization that was previously hand-waved.
  - `warnbox [shrink_to_fit() and the no-auto-shrink policy]` in new
    §1.6 — covers a real C++-specific gap (vector grows but doesn't
    auto-shrink; `shrink_to_fit` is non-binding; force release via
    swap-with-empty trick).
  - One-line cross-reference bullet in new §1.8 (formerly §1.10)
    "backing memory" subsection pointing at the new shrink_to_fit
    warnbox.
  **Title subtitle** updated: "Review: Flowcharts, Pseudocode, and
  Arrays and Vectors" → "C++ Refresher: Arrays, Vectors, and Strings".
  **Net delta:** ~−250 lines (Coral cut) + ~+45 lines (additions).
  File now 2274 lines (was 2508). Build verified: `pdflatex` produces
  36-page PDF, no errors (only pre-existing harmless font warnings).
  Mastery checklist (7 items) and chapter-end "What this connects to"
  notebox unchanged — neither references removed sections by number.
- **Added** `design_docs/chapter_reviews/ch_1_gaps.md` — Step-2 gap
  analysis for ch_1 against MIT OCW 6.006 lec1/lec2/r01/r02 and CLRS
  3rd-ed Ch 1 / Ch 2 / Ch 17.4. Per-section verdicts: **ADD** small
  Word-RAM forward-ref notebox in §1.3, **ADD** formal amortized-cost
  defnbox + `shrink_to_fit` warnbox in §1.8, **DECIDE** whether to
  cut/compress/port §1.1 + §1.2 (Coral content removed regardless),
  **SKIP** the rest. Headline finding: with the C++-refresher framing
  locked, OCW/CLRS add very little — both are pseudocode/Python and
  language-agnostic. Net delta if all recommendations approved: roughly
  -250 lines (Coral cut) and +25 lines (additions). Awaiting user
  approval/edits before drafting Step-3 revisions.
- **Decided** ch_1 is a **C++ refresher chapter**. User direction:
  Coral pseudocode/flowchart framing in §1.1–1.2 gets dropped in the
  revision pass; chapter narrows to C++ competency on top of the
  SNHU-derived core. Algorithm-theory content from CLRS/OCW that
  doesn't directly serve C++ competency is **out of scope for ch_1**
  and belongs in ch_2/ch_3.
- **Added** `design_docs/phase2_issues.md` — punch list for items
  deferred to the Phase 2 (Jekyll → Astro) redesign. Seeded with
  the stale companion-materials line in `chapters/*/lectures.tex`
  and the `\section{Big-O Cheatsheet}` heading in
  `resources/week_2.tex`.
- **Added** `design_docs/chapter_reviews/ch_1.md` — Step-1 as-is
  inventory of `chapters/ch_1/lectures.tex` (2508 lines) and
  `chapters/ch_1/notes.tex` (143 lines). Section-by-section
  catalogue (17 sections, 70 subsections, 161 callout boxes) with
  topics, depth markers, callout counts, cross-references, and
  flagged terminology/structural issues. **No augmentation
  suggestions** — input for the Step-2 CLRS + OCW gap analysis.
- **Changed** Chapter file naming convention (atomic global rename):
  - **`notes.{tex,pdf}` → `lectures.{tex,pdf}`** in every chapter
    folder. The "long-form chapter" file is now called Lectures.
  - **`cheat.{tex,pdf}` → `notes.{tex,pdf}`** in every chapter folder.
    The "compact two-page reference" file is now called Notes.
  - **Top-level Jekyll viewer dirs:** `notes/` → `lectures/`,
    `cheats/` → `notes/`. Wrapper `ch_N.md` files moved with their
    parent dirs and updated to point at the new PDF paths and use
    new permalinks (`/lectures/ch_N/`, `/notes/ch_N/`).
  - **Display labels:** updated `_includes/nav.html` (dropdown
    summaries: "Notes" → "Lectures", "Personal Notes" → "Notes"),
    `index.md` (table headers and link text), `_data/chapters.yml`
    (`notes_pdf` key → `lectures_pdf`, `cheat_pdf` key → `notes_pdf`).
  - **Internal `\title{...}` lines:** updated all 12
    `chapters/ch_N/lectures.tex` (now say "Chapter N Lectures") and
    all 12 `chapters/ch_N/notes.tex` (now say "Ch.~N Notes").
  - **Doc references** updated in `README.md` (build commands, file
    descriptions, layout block, conventions, license),
    `design_docs/architecture.md` (system-shape diagram, source
    layout, planned Astro content collections layout, static-mode
    feature description, pandoc probe reference),
    `design_docs/roadmap_addenda.md` (pandoc probe), this
    `CHANGELOG.md` (pandoc probe), `notes-style.tex` (preamble
    comment), `_config.yml` (description).
  - All file moves done with `git mv` so rename history is
    preserved.
  - **Caught and fixed in-flight:** initial `sed` pass on
    `index.md` and `_includes/nav.html` used overlapping patterns
    (e.g. `notes/` → `lectures/` ran after `cheats/` → `notes/`,
    transitively converting the new `notes/` to `lectures/`).
    Files were rewritten via `Write` to the correct target state.
- **Decided** Per-chapter content review/augmentation loop. User
  directive (2026-04-22): all course content (lectures, notes,
  quizzes) will be updated by augmenting SNHU-derived core material
  with MIT OCW + CLRS, **one chapter at a time**. Before any
  augmentation work on a chapter, the existing chapter content must
  be **fully reviewed** first. Hard constraint: don't make the
  course so long it becomes impossible to finish.
- **Decided** `chapters/*/practice.md` is **out of scope** for
  per-chapter content augmentation. OCW practice problems and
  assignments will instead feed Phase 4 (LLM question generation
  via ai-workflows), where the user has ideas for using OCW + other
  reference sources to improve both the prompt corpus and generated
  question quality. Recorded in
  `memory/project_practice_md_phase4_link.md`.
- **Deferred (to per-chapter review)** In-chapter prose references
  to "cheat sheet" companion material in
  `chapters/ch_{1,2,3,4,5,6}/lectures.tex` (e.g. lines like
  `One-page cheat sheet: cheat_sheets/ch_N.tex`). Path was already
  stale (no `cheat_sheets/` dir ever existed) and the terminology
  is now inconsistent with the new "Notes" name. Will fix during
  the per-chapter review pass for each affected chapter.
- **Deferred** `resources/week_2.tex` `\section{Big-O Cheatsheet}`
  heading and surrounding prose. Sidecar week-level file, not a
  chapter file; "cheatsheet" used as a content genre rather than a
  filename. Decide whether to align terminology when we touch
  Week 2 material.
- **Added** `reference/clrs/clrs.pdf` (5.5 MB) — CLRS textbook PDF,
  pulled from
  <https://www.cs.mcgill.ca/~akroit/math/compsci/Cormen%20Introduction%20to%20Algorithms.pdf>.
  Per memory, treat as personal study reference (third-party host of
  copyrighted textbook); paraphrase/build-on for chapter content,
  don't wholesale reproduce.
- **Added** MIT OCW 6.006 Spring 2020 course archive contents,
  extracted from `https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/6.006-spring-2020.zip`
  (39 MB ZIP, ~26 MB extracted PDFs+ZIPs). License: CC BY-NC-SA 4.0.
  Sorted into:
  - `reference/mit_ocw/lecture_notes/` — 21 PDFs (lec1–lec20; **lec18
    shipped in two distinct revisions** — different hashes and sizes,
    320K and 367K — both kept, decision deferred).
  - `reference/mit_ocw/recitations/` — 19 PDFs (r01–r19; r20 absent
    from archive, matching gap in OCW lecture-notes index).
  - `reference/mit_ocw/practice_problems/` — 18 PDFs (prob1–prob9 +
    prob1sol–prob9sol).
  - `reference/mit_ocw/assignments/` — 27 files (ps0–ps8: questions
    PDF + solutions PDF + template ZIP each).
  - `reference/mit_ocw/quizzes/` — 14 PDFs (q1–q3, q1_sol–q3_sol,
    review1–review3, review1_sol–review3_sol, final, final_sol).
    OCW filename inconsistency: q3 uses lowercase `s20` while q1/q2
    use uppercase `S20`. Left as-is.
  - `reference/mit_ocw/transcripts/` — 35 PDFs (lecture/recitation
    video transcripts named by YouTube/Drive ID, plus three problem
    session transcripts named by date).
- **Changed** scope vs. earlier "drop zone" intent: `recitations/`,
  `quizzes/`, and `transcripts/` directories were added beyond the
  user's original 3-category list (lecture notes / practice problems
  / assignments), because the OCW archive includes them and the
  marginal storage cost is negligible. User can prune any of these
  if not wanted.
- **Added** `reference/mit_ocw/video_lectures.md` — index of MIT OCW
  6.006 Spring 2020 lecture videos (21 lectures), problem sessions
  (PS1–PS9, PS6 unavailable per COVID note), quiz reviews (Q1–Q3),
  and the original course calendar. Pulled from the OCW lecture-videos
  gallery and calendar pages. Pure reference — no chapter mapping
  yet; that decision is deferred per user direction ("thinking we
  might use that to augment content not sure yet").
- **Added** `reference/mit_ocw/{lecture_notes,practice_problems,assignments}/`
  (each with `.gitkeep`) — drop zones matching MIT OCW 6.006 index
  pages. User pulling content from
  <https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/>.
- **Added** `reference/clrs/` (with `.gitkeep`) — drop zone for CLRS
  (Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*).
  Designated by user as the **primary** reference book to enhance
  the SNHU curriculum. Source link provided:
  <https://www.cs.mcgill.ca/~akroit/math/compsci/Cormen%20Introduction%20to%20Algorithms.pdf>.
- **Decided** MIT OCW 6.006 Spring 2020 is the augmenting course;
  CLRS is the primary augmenting textbook. Together they form the
  rigor substitute the SNHU curriculum lacks (per
  `memory/project_target_audience.md`).
- **Added** `reference/mit_ocw/` (with `.gitkeep`) — drop zone for
  MIT OpenCourseWare DSA course material. User will signal when
  reference files are in place. Treated as the gating input for
  Phase 1 chapter revisions: without OCW augmentation, the rest of
  Phase 1 has no source material to draw on. Commit-vs-gitignore
  decision deferred until file types and sizes are known.
- **Added** `CHANGELOG.md` (this file). Convention: log everything,
  no matter how small.
- **Changed** `README.md` — rewrote as portfolio-framed draft.
  Previous README only described the LaTeX/Jekyll setup. New draft
  adds: pre-Phase-1 status callout, two-purpose framing (course notes
  - reference integration for `ai-workflows`), pointer to
  `design_docs/architecture.md`, settled-tech summary, and dual
  license declaration. Existing build/conventions/layout content
  preserved. Layout updated to include `coding_practice/`,
  `design_docs/`, and `tools/`.
- **Added** `design_docs/architecture.md` — first-cut architecture
  document. Gating artifact for Phase 1. Covers static content
  pipeline (pandoc + Lua filter, component library, Astro content
  collections, audio file layout pinned for Phase 7), data model
  (Drizzle + SQLite schema with type-dispatched payloads for
  `mc` / `short` / `llm_graded` / `code` questions), dynamic surfaces
  (MCP bridge contract, eval dispatch, code execution, FSRS loop),
  local-vs-public mode (single `detectMode()` flag, two state-service
  hosting paths), and an open-decisions table. Awaiting user review;
  has not been pressure-tested.
- **Added** `design_docs/roadmap_addenda.md` — local supplement to
  the Drive roadmap (`interactive_notes_roadmap.md`, file id
  `1SJHI76hibJ6aJqvtMuJbE1dhzVLZlWcOpitofrziWC8`). Captures: the
  `architecture.md → README → Phase 1` sequence, deferral of Phase 1
  acceptance criteria, the Phase-1-idle pandoc probe, and the
  decision to keep `coding_practice/`.
- **Decided** Dual license: content under CC BY-NC-SA 4.0 (matches
  MIT OCW), code under MIT. Declared in README; LICENSE files not
  yet created.
- **Decided** Sequence to Phase 1 is `architecture.md → README →
  Phase 1`. README intentionally drafted before Phase 1 starts but
  after the architecture doc exists.
- **Decided** Question persistence model is accumulating (not
  per-session ephemeral). Confirmed in `architecture.md §5`.
- **Decided** Audio file layout pinned to
  `public/audio/ch_N.{mp3,timestamps.json}` to avoid a Phase 7
  unwind. (`architecture.md §1`.)
- **Deferred** Phase 1 acceptance criteria — explicitly postponed
  until `architecture.md` is settled. Will be a major focus at that
  point. (See `roadmap_addenda.md`.)
- **Deferred** Pandoc Lua filter vs. manual port — decide after the
  Phase-1-idle probe on `chapters/ch_1/lectures.tex`.
- **Deferred** State-service hosting (Astro server vs. client-side
  SQLite WASM) — decide at Phase 3 start; lean is Astro server.
- **Deferred** Whether `coding_practice/` prompts are persisted as
  files or generated dynamically by the workflow — decide at Phase 4
  design.

---

## Pre-2026-04-22

Repository state before this changelog began. Reconstructable from
git history (`git log --oneline`). Highlights:

- `e027f57` — Add optional-chapter materials and restructure into
  `chapters/`.
- `3ad6ba0` — Add GitHub Pages site (Jekyll).
- `3f01901` — Initial commit.
