# T4 — Right-rail TOC + scroll-spy island + SectionNav refactor — Audit Issues

**Source task:** [../tasks/T4_right_rail_toc.md](../tasks/T4_right_rail_toc.md)
**Audited on:** 2026-04-24 (cycle 2 re-audit)
**Audit cycle:** 2 of up to 10 (cycle 1 closed ⚠️ OPEN with 1 MEDIUM + 2 LOW; cycle 2 fixes the MEDIUM via a single-line guard inside `setCurrent()`)
**Audit scope:** cycle 2 — re-audit of the changed surface (`src/components/chrome/ScrollSpy.astro`) only; regression check on the unchanged surface (37 pages, M3 counts, TOC entry counts, `<article>` + `<body data-mode="static">`); fresh `npm run build` from scratch (no trust in the Builder's `dist/`); minified-script verification (the guard expression survives Astro's per-page minifier as a short-circuit `n.has(t)&&n.forEach(...)`); status-surface re-verify; ISS-02 (LOW open — Builder chose accept-as-is with architecture-anchored rationale) adjudication; ISS-03 (LOW flag-only — initial-paint dependency on first article anchor being a TOC anchor) subsumption check. Cycle 1 scope (full spec re-verification, design-drift, all four status surfaces, deferred-ideas boundary, dependency audit, etc.) stands — see cycle-1 sections below.

Fresh `npm run build` re-executed by the auditor this cycle reproduces the Builder's reported numbers exactly: `du -sb dist/client/` = `5240203` bytes (matches +120 over cycle-1 `5240083`), page count `37` (matches), 12-chapter TOC entry counts unchanged (80/58/102/68/9/10/5/8/13/5/2/5), M3 surface counts on lectures/ch_4 unchanged (6× annotate-button / 6× annotations-pane / 8× mark-read-button / **0× section-nav**), `<article>` wrapper preserved (1× per route), `<body data-mode="static">` preserved (1×). Minified guard expression confirmed in built `dist/client/lectures/ch_4/index.html` and `dist/client/lectures/ch_12/index.html`: `if(a&&i.length>0){let s=function(t){n.has(t)&&n.forEach((e,r)=>{r===t?e.dataset.current="true":delete e.dataset.current})};...` — semantically equivalent to the source `if (!tocLinks.has(anchorId)) return; tocLinks.forEach(...)` (`forEach` runs iff guard passes).

**Status:** ✅ PASS — cycle 2 closes M-UX-T4-ISS-01 (MEDIUM, RESOLVED via single-line guard) + subsumes M-UX-T4-ISS-03 (LOW, RESOLVED — guard fires at initial-paint too if `anchors[0]` isn't in `tocLinks`). M-UX-T4-ISS-02 (LOW, ACCEPT-AS-IS) left OPEN as a docs-only spec-amendment candidate per architecture §1.6 framing — not blocking; deferred to a future T2/T4/T7 spec doc-sweep (does not block T4 close). M-UX-T4-ISS-04 RESOLVED in cycle 1 (rootMargin pinned with rationale).

## Design-drift check

No HIGH drift detected. Cross-checked against:

- **architecture.md §1 (pandoc + Lua filter, section anchor contract).** `<a id="ch_N-section-slug">` anchor format is preserved: T4 touches no pandoc surface; built artefact `dist/client/lectures/ch_4/index.html` carries 111 `<a id="ch_4-…">` anchors inside `<article>` (matches pre-T4 baseline). ScrollSpy selector `article a[id^="ch_"]` (lines 53 of [`ScrollSpy.astro`](../../../../src/components/chrome/ScrollSpy.astro)) is identical to `MarkReadButton.astro` line 105 (`article a[id^="ch_"]`) — symmetric on purpose; both islands observe the same anchor set. A future `<article>`-rename or `ch_`-prefix change surfaces simultaneously as a HIGH regression on both islands instead of silently no-op'ing one.
- **architecture.md §1.6 (Page chrome — UX layer).** The architecture commitment "Right rail — in-chapter section TOC, SSR from MDX frontmatter (`sections` array T4 already emits), scroll-spy enhancement as a JS island that toggles `data-current` via `IntersectionObserver`" — implemented exactly. `<nav class="right-rail-toc" aria-label="In-chapter sections" data-chapter-id="ch_4">` lands inside the `right-rail` slot on lectures pages only. Static-mode posture commitment "Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work" — fulfilled: `<a class="toc-link" href="#anchor">` does NOT carry `data-interactive-only`; only the inner `<span class="read-indicator" data-read-indicator data-section-id data-interactive-only>` and the island roots do. The TOC links remain visible + clickable in static mode. The "M3 `SectionNav` refactor — pulled into the right-rail TOC structure. The old left-rail position is replaced by the chapter-list nav. No two left rails." commitment — fulfilled exactly: `src/components/read_status/SectionNav.astro` deleted, its rendering responsibility migrated to `RightRailTOC.astro` and its read-status fetch + listener logic migrated to `RightRailReadStatus.astro`.
- **architecture.md §3.4 (Reader state — read-status API contract).** `GET /api/read_status?chapter_id=…` returning `{section_ids: string[]}` (line 346) — `RightRailReadStatus.astro:103` calls `fetch(\`/api/read_status?chapter_id=${encodeURIComponent(chapterId)}\`)` and parses `body.section_ids as string[]`. Wire-compatible with M3 today (matches the prior `SectionNav.astro` call shape verbatim). No new endpoint needed.
- **architecture.md §4 (Local-vs-public mode).** `data-interactive-only` is the architecture-mandated gating mechanism (M3 T5 contract). T4 adds the attribute to (i) 68 `<span class="read-indicator" data-read-indicator>` per ch_4 page, (ii) the `<div id="cs300-toc-read-status">` island root. The ScrollSpy island root (`<div id="cs300-scroll-spy" hidden>`) does NOT carry `data-interactive-only` — see LOW-1 below; this matches the architecture's framing "scroll-spy is JS-only progressive enhancement; without it, the TOC links are still anchors that work" (i.e., scroll-spy is fine to run in static mode — the highlight is purely visual and harmless if the user has JS but no state service). Static-mode `<body data-mode="static">` SSR default preserved (1 hit); the global rule `body[data-mode="static"] [data-interactive-only] { display: none !important }` hides the read-indicator spans + the read-status island root. The TOC links + their text labels stay visible.
- **ADR-0002 §"Decision" + Refactor note.** Every commitment fulfilled. Right-rail TOC SSR-rendered from MDX frontmatter `sections` array (per `src/content.config.ts:43` `sections: z.array(sectionSchema)`); scroll-spy enhancement as JS island toggling `data-current` via IntersectionObserver; SectionNav refactored, no two left rails. The annotations-pane re-home (line 75 of ADR) is explicitly out-of-scope for T4 (T6 owns it).
- **CLAUDE.md cross-chapter ref discipline.** Built artefacts surface 12 chapters (`ch_1..ch_7, ch_9..ch_13` — no `ch_8`). The TOC is data-driven from the per-chapter MDX frontmatter; no slug arithmetic. ch_4's TOC has 68 entries — independently verified `grep -E '^\s*-\s*id:' src/content/lectures/ch_4.mdx | wc -l` = 68. ch_3 = 102. ch_12 = 2. All section ids are `ch_N-…` prefixed; no cross-chapter section-id leakage.
- **CLAUDE.md BASE_URL discipline.** `grep -nE '/DSA/' src/components/chrome/RightRailTOC.astro src/components/chrome/ScrollSpy.astro src/components/chrome/RightRailReadStatus.astro` returns empty — none of the three new components compose `/DSA/`-prefixed URLs (TOC entries use in-page anchors `href="#anchor"`; the read-status island fetches the relative path `/api/read_status` which is resolved at request time). MarkReadButton's existing relative `fetch('/api/read_status', …)` calls untouched. No regression.
- **`nice_to_have.md` boundary.** Only the "Site UI/UX layer" item promoted (the trigger fired on M-UX kickoff 2026-04-24). T4 implements the ADR-0002 commitment for that promotion. No silent adoption of dark mode / search / typography sweep / animation work / palette refinement — none of these surfaces appear in the new components.
- **Dependencies.** `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` returns empty. CHANGELOG records `Dep audit: skipped — no manifest changes` — correct.
- **New event `cs300:toc-read-status-painted` justification.** New custom-event name introduced in code; verified the architecture impact is bounded:
  1. Documented in the dispatcher's docstring ([`RightRailReadStatus.astro:91-98`](../../../../src/components/chrome/RightRailReadStatus.astro)) and the listener's inline comment ([`MarkReadButton.astro:127-133`](../../../../src/components/read_status/MarkReadButton.astro)).
  2. Documented in the CHANGELOG entry (line 20: "After every paint, dispatches a SEPARATE event `cs300:toc-read-status-painted` so `MarkReadButton.refreshMarked()` can re-read after the async fetch settles. Distinct event name avoids the loop that would form if the rail both listened-for and dispatched the same event.").
  3. Architecture impact: zero. The event is a private DOM-level coordination signal between two M-UX/M3 chrome components on the same page. It doesn't cross any persistent boundary (no API surface, no SQLite write, no MCP call). It does not appear in `architecture.md` because the doc only tracks API endpoints + persistent contracts; in-page event coordination is a code-level decision.
  4. Necessity: real (resolves a reload-race). On reload, both `RightRailReadStatus` and `MarkReadButton` mount their inline `<script type="module">` blocks roughly simultaneously. RightRailReadStatus' `void refresh()` is async (awaits the GET `/api/read_status` fetch); MarkReadButton's `refreshMarked()` runs synchronously after IO observation setup. Without the paint-event, MarkReadButton reads the DOM before RightRailReadStatus has painted any `data-read="true"` attributes — `markedSet` ends up empty even when the section IS persisted as marked, and the button shows "Mark section read" until the user clicks. The event handler in MarkReadButton clears + re-runs `refreshMarked()` after the rail has finished painting. This is the canonical fix for MUX-BO-ISS-01 / HIGH-1 (the reload-state correctness AC).
  5. Loop-safety: traced statically (Verification gate G7 below). MarkReadButton's listener for `cs300:toc-read-status-painted` calls `refreshMarked()`, which only **reads** the DOM and updates `markedSet` — it does NOT dispatch any event. CompletionIndicator listens for `cs300:read-status-changed` (the toggle event), not `cs300:toc-read-status-painted`. The full event chain on click is: `MarkReadButton.click → cs300:read-status-changed → RightRailReadStatus.refresh() (re-fetch + repaint) → cs300:toc-read-status-painted → MarkReadButton.refreshMarked() (read-only) → done`. Single non-cyclic chain.
  6. Payload-less (matches the M3 `cs300:read-status-changed` no-`detail` contract). `new CustomEvent('cs300:toc-read-status-painted')` — no `detail`, consistent with the project's pre-existing custom-event idiom (resolves DA-3 "Don't try to read `event.detail` — there isn't one").
- **Status-surface discipline (all four).** Verified one-for-one against CLAUDE.md non-negotiables:
  - (a) Per-task spec status: `**Status:** ✅ done 2026-04-24` ([`T4_right_rail_toc.md:3`](../tasks/T4_right_rail_toc.md#L3)) ✅
  - (b) `tasks/README.md` row: `T4 ... ✅ done 2026-04-24` ✅
  - (c) Milestone README task table: `T4 ... ✅ done 2026-04-24` ✅
  - (d) Milestone README `Done when` checkboxes:
    - Bullet 1 (three-column desktop layout): flipped `[x]` with `(T1 + T2 + T4 issue files)` citation per M-UX-T1-ISS-01 carry-over deferral chain. ✅ Correct flip — once T4's right rail is populated, the three-column layout structurally satisfies the bullet.
    - Bullet 5 (Right-rail in-chapter TOC + scroll-spy + SectionNav refactor): flipped `[x]` with `(T4 issue file)` citation. ✅ Correct flip — every clause of the bullet is structurally present (SSR section anchors, `IntersectionObserver` toggling `data-current`, SectionNav refactored — file deleted, functionality migrated).
    - Bullet 6 (Annotations pane re-homed): correctly left `[ ]` (T6 owns).
    - Bullet 7 (Mark-read button re-homed): correctly left `[ ]` (T6 owns; T4's MarkReadButton edit was a refactor of the selector, not a re-home — the button still mounts in `[id].astro:71` not in any chrome slot).

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| **Spec deliverable 1** — `RightRailTOC.astro` SSR component reading chapter MDX `sections` frontmatter, rendering `<nav>` with `<ul>` of section anchor links | ✅ PASS | [`RightRailTOC.astro`](../../../../src/components/chrome/RightRailTOC.astro) lines 78–113. `Astro.props.sections` consumed; defensive sort by `ord` (line 83). Renders `<nav class="right-rail-toc" aria-label="In-chapter sections" data-chapter-id={chapterId}><h3>On this page</h3><ul>` with one `<li><a href="#anchor" class="toc-link" data-section-id data-anchor>` per section. Each `<li>` includes a `<span class="read-indicator" data-read-indicator data-section-id data-interactive-only aria-hidden="true">` indicator slot. Built artefact verified across long/medium/short chapters: ch_3=102, ch_4=68, ch_12=2 toc-link entries — match frontmatter section counts byte-for-byte. |
| **Spec deliverable 2** — `ScrollSpy.astro` JS island, IntersectionObserver setup, toggles `[data-current="true"]` on matching TOC link | ✅ PASS (cycle 2 — guard added) | [`ScrollSpy.astro`](../../../../src/components/chrome/ScrollSpy.astro) inline-`<script type="module">` island (Builder pick option (a) per the M-UX-T2-ISS-01 carry-over; consistent with M3 island pattern). Observes `article a[id^="ch_"]` (line 53 — same selector as `MarkReadButton.astro:105`). IntersectionObserver with `rootMargin: '0px 0px -66% 0px'` (line 125). `setCurrent()` (lines 85–94) now bails early when `anchorId` is not in `tocLinks` (line 86: `if (!tocLinks.has(anchorId)) return;`), then iterates `tocLinks` setting `data-current` on the match and clearing on others. **Cycle-2 fix:** the cycle-1 MEDIUM (highlight blanks when subsection anchors are topmost) is closed — the guard preserves the previously-highlighted entry whenever the topmost intersecting anchor isn't a TOC anchor; the docstring on lines 71–84 documents the rationale (matches the existing "If none intersect (e.g. between two long sections), keep the current highlight rather than clearing — the previous section is still the most relevant context"). Initial paint (lines 130–136) calls `setCurrent(anchors[0].id)`; with the guard, this is now safe even if `anchors[0]` is a non-TOC anchor (early return — no negative side effect). Minified form in built HTML: `n.has(t)&&n.forEach((e,r)=>{r===t?e.dataset.current="true":delete e.dataset.current})` — semantically equivalent to the source. See cycle-2 disposition under MEDIUM section below. |
| **Spec deliverable 3 (M3 SectionNav refactor)** — `src/components/read_status/SectionNav.astro` removed; read-status indicator functionality folds into RightRailTOC + the existing M3 read-status fetch logic re-pointed at TOC entries | ✅ PASS | `git status --short` shows `D src/components/read_status/SectionNav.astro` — file deleted. `grep -rn 'SectionNav' src/` returns only doc-comment references in the new + refactored files (RightRailTOC, RightRailReadStatus, MarkReadButton, CompletionIndicator, lectures/[id].astro) — all historical references explaining what was deleted and what migrated where. No live import or component use survives. Built HTML on lectures/ch_4: `grep -c 'section-nav'` = 0 (was 12 pre-T4); same on notes/ch_4 + practice/ch_4. The fetch logic (`GET /api/read_status?chapter_id=…`) + the `cs300:read-status-changed` listener migrated to [`RightRailReadStatus.astro`](../../../../src/components/chrome/RightRailReadStatus.astro). The read-status indicator rendering responsibility migrated to [`RightRailTOC.astro`](../../../../src/components/chrome/RightRailTOC.astro)'s `<span class="read-indicator" data-read-indicator>` slots. `data-read="true"` / `data-read="false"` contract preserved verbatim from M3's prior `.dot[data-read]` convention (resolves DA-2 + Step 4 contract). |
| **Spec deliverable 4** — Wire `RightRailTOC` + `ScrollSpy` (+ `RightRailReadStatus`) into `Base.astro` `right-rail` slot from T1; lectures route only initially | ✅ PASS | [`src/pages/lectures/[id].astro`](../../../../src/pages/lectures/[id].astro) lines 35–37 import the three new chrome components. Lines 55–61 mount them in `slot="right-rail"`: `<RightRailTOC>` with `chapterId={entry.data.chapter_id}` + `sections={entry.data.sections}`; `<ScrollSpy>` (no props); `<RightRailReadStatus>` with `chapterId={entry.data.chapter_id}`. The `<SectionNav>` import + use removed (verified by diff). Notes + practice routes intentionally NOT mounted — `src/content.config.ts` lectures schema is the only one with `sections: z.array(sectionSchema)` (line 43); notes + practice base-schema lack `sections`, so the right rail stays empty there per spec Notes "T4 keeps the `right-rail` slot empty there". Verified at the built-HTML level: `grep -c 'right-rail-toc' dist/client/{notes,practice}/ch_4/index.html` = 0/0; same on `dist/client/index.html` = 0. |
| **Acceptance check 1** — `RightRailTOC.astro` exists and renders in `Base.astro` `right-rail` slot on lectures pages | ✅ PASS | File exists (195 lines, ~5.6 KB). Built HTML: `<aside data-slot="right-rail">` (Base.astro slot) wraps the `<nav class="right-rail-toc" aria-label="In-chapter sections" data-chapter-id="ch_4">` + the two island roots. `grep -c '<nav class="right-rail-toc' dist/client/lectures/ch_4/index.html` = 1; same on the other 11 lectures pages (12 chapters total). |
| **Acceptance check 2** — RightRailTOC reads chapter `sections` frontmatter and renders one anchor link per section. Auditor cross-checks against `src/content/lectures/ch_4.mdx` frontmatter | ✅ PASS | `grep -E '^\s*-\s*id:' src/content/lectures/ch_4.mdx \| wc -l` = 68. `grep -oE 'class="toc-link"' dist/client/lectures/ch_4/index.html \| wc -l` = 68. Match exactly. Cross-checked all 12 chapters: 80/58/102/68/9/10/5/8/13/5/2/5 (ch_1/ch_2/ch_3/ch_4/ch_5/ch_6/ch_7/ch_9/ch_10/ch_11/ch_12/ch_13). All TOC entry counts match frontmatter section-id counts. |
| **Acceptance check 3** — Anchor links work — clicking a TOC entry scrolls to the matching section heading | ✅ PASS (structural) | TOC links are SSR `<a href="#ch_4-the-list-adt">` etc. — native browser anchor scroll. Built HTML cross-check: every TOC `data-anchor` has a matching `<a id="...">` in `<article>` — set intersection: 68 of 68 TOC anchors map to article anchor ids (the inverse — 43 article anchor ids without TOC entries — is the source of MEDIUM-1, but those are subsection-level anchors that legitimately don't appear in TOC). Browser smoke deferred to T8. |
| **Acceptance check 4** — `ScrollSpy.astro` is `data-interactive-only`-gated; auditor opens DevTools in `npm run dev`, scrolls a long chapter, confirms `[data-current="true"]` moves appropriately | ✅ PASS (structural; cycle 2) — see LOW-1 (ACCEPT-AS-IS, doc-sweep candidate) | (i) **Gating depth deviation (LOW-1, ACCEPT-AS-IS):** `<div id="cs300-scroll-spy" hidden></div>` (line 45) does NOT carry `data-interactive-only`. Cycle-2 disposition: ACCEPT-AS-IS — Builder's rationale (architecture.md §1.6 line 137 "Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work") aligns with the "highlight is visual-only and harmless in static mode" framing. The SSR TOC links work without the script, and the script bails silently when the TOC is absent, so there is no static-mode failure surface to gate against. The cycle-1 spec-wording deviation is real but not a runtime concern; deferred to a docs-only T2/T4/T7 spec-amendment sweep (see LOW-1 below). (ii) **Highlight-disappears-on-non-TOC-anchor bug:** RESOLVED in cycle 2 by the single-line guard inside `setCurrent()`; the highlight now stays on the previously-highlighted TOC entry when a non-TOC subsection anchor is topmost, instead of going blank. Static-trace verification: when `anchorId` is in `tocLinks`, the guard passes and `forEach` runs (sets new current, clears others — identical to cycle-1 behaviour for TOC anchors). When `anchorId` is NOT in `tocLinks`, the guard returns and no DOM mutation happens (highlight preserved). Browser smoke deferred to T8's integrated audit. |
| **Acceptance check 5** — In static mode (preview, no `/api/health` reachable), TOC links still work; no console errors from absent JS-island data fetches | ✅ PASS | `<a class="toc-link" href="#anchor">` does NOT carry `data-interactive-only` (the inner `<span class="read-indicator">` does). In static mode `<body data-mode="static">` + global rule hides the indicator spans only; the TOC links + their `<span class="toc-label">` text remain visible + clickable. RightRailReadStatus' `refresh()` failure path swallows network errors silently (line 109–112: `catch { /* … */ }`), matching M3 SectionNav's prior failure semantics. No console-error path. ScrollSpy bails silently if no `<article>` anchors are present (line 56: `if (toc && anchors.length > 0)`). |
| **Acceptance check 6** — M3 `SectionNav` refactor verified — old fixed-left-rail SectionNav is gone from lectures route; read-status indicators surface in right-rail TOC entries instead. Cite the before/after observation | ✅ PASS | Before (T3 baseline per `T3_issue.md` Verification summary): `grep -oE 'mark-read-button\|section-nav\|annotations-pane\|annotate-button' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` = 6/6/8/12 (annotate-button/annotations-pane/mark-read-button/section-nav). After (T4 close): 6/6/8/0 — section-nav fully removed across all three routes. Read-status indicators present at `<span class="read-indicator" data-read-indicator data-section-id="ch_4-…" data-interactive-only>` × 68 inside the right-rail TOC. Visual carry-over preserved: indicator dimensions + accent-when-`data-read="true"` styling mirror M3's deleted `SectionNav .dot` shape exactly (8px round, neutral default, `var(--mux-accent)` when marked) — see [`RightRailTOC.astro:176-194`](../../../../src/components/chrome/RightRailTOC.astro). |
| **Acceptance check 7** — MarkReadButton state correctness on reload (resolves MUX-BO-ISS-01 / HIGH-1). Auditor opens `/DSA/lectures/ch_4/` in `npm run dev`, marks a section, **reloads**, scrolls back. Button must render as "Unmark section" without click. Note which option (a) or (b) Builder picked | ⚠️ DEFER (auditor-driven, browser-required); structural evidence ✅ PASS | Auditor cannot run `npm run dev` from this shell (no live state service). **Structural verification:** Builder picked **option (a)** per the spec menu: `MarkReadButton.refreshMarked()` selector swap from `#section-nav .dot[data-read="true"]` (the deleted SectionNav contract) → `[data-read-indicator][data-read="true"]` (the new RightRailTOC contract written by RightRailReadStatus). [`MarkReadButton.astro:82-91`](../../../../src/components/read_status/MarkReadButton.astro) confirms the new selector. Plus the new `cs300:toc-read-status-painted` listener (lines 134–140) re-runs `refreshMarked()` after the rail's async fetch settles — closes the reload-race that mount-time `refreshMarked()` alone could not handle (rail's GET fetch is async; button's `refreshMarked()` would run before the rail painted any `data-read="true"`, leaving `markedSet` empty). Static analysis confirms the wiring is sound: paint dispatches event → button clears `markedSet` + re-runs `refreshMarked()` → `markedSet` contains all sections with `data-read="true"` → `updateButtonState()` → button shows "Unmark section" if currentSectionId is in the set. T8 owns the integrated browser smoke. |
| **Acceptance check 8** — Live TOC indicator refresh on `cs300:read-status-changed` (resolves DA2-A + DA3-C). Auditor marks a section read in dev, **does not reload**, observes TOC indicator flip from un-marked to marked within a few seconds | ⚠️ DEFER (auditor-driven, browser-required); structural evidence ✅ PASS | Listener wired at [`RightRailReadStatus.astro:133-135`](../../../../src/components/chrome/RightRailReadStatus.astro): `window.addEventListener('cs300:read-status-changed', () => { void refresh(); })`. Event match verified against `MarkReadButton.astro:161` `dispatchEvent(new CustomEvent('cs300:read-status-changed'))` — same name, no detail payload (consistent with M3 contract). On event, `refresh()` re-runs the GET fetch + repaints `data-read` on every indicator + dispatches `cs300:toc-read-status-painted` so the MarkReadButton stays in sync. Cross-component symmetry with T2's CompletionIndicator (which subscribes to the same event for left-rail checkmark refresh, scoped to current chapter only) — both islands now update live; no asymmetry HIGH per DA2-A. T8 owns the integrated browser smoke. |
| **Acceptance check 9** — All 37 prerendered pages still build (`npm run build` exit 0). Notes + practice routes don't break | ✅ PASS | Auditor re-ran `npm run build` from scratch this cycle. Output: "Server built in 8.72s. Complete!" — no warnings, no errors, exit 0. `find dist/client -name '*.html' \| wc -l` = 37. Notes + practice routes still build cleanly (12 + 12 pages, no regression). |
| **Carry-over [x] M-UX-T2-ISS-01 / MEDIUM** — `client:visible` spec wording vs M3 inline-script pattern; Builder picks option (a) "spec amendment via implementation precedent" | ✅ RESOLVED | Builder shipped both ScrollSpy + RightRailReadStatus as inline `<script type="module">` islands. Header docstrings on both files record the decision (`ScrollSpy.astro:9-21`, `RightRailReadStatus.astro:11-15`). Doc-amendment of T2/T4/T7 spec wording deferred to a single docs-only sweep — code precedent now set across both T2 + T4. T7's drawer keeps `client:load` per its own spec. Carry-over correctly checked. |
| **Carry-over [x] M-UX-T2-ISS-03 / LOW** — Companion to ISS-01; recurring spec-vs-M3-pattern drift across T2/T4/T7 | ✅ RESOLVED | Resolved jointly with M-UX-T2-ISS-01 by Builder pick option (a). |
| **Carry-over [x] M-UX-T1-ISS-01 / MEDIUM** — Done-when bullet 1 flip with `(T1 + T2 + T4 issue files)` citation | ✅ RESOLVED | Bullet 1 flipped on milestone README line 19 with the correct citation. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — ScrollSpy `setCurrent` clears the TOC highlight when a non-TOC article anchor is the topmost intersecting one — ✅ RESOLVED 2026-04-24 (cycle 2)

**Cycle-2 disposition (RESOLVED).** Builder picked option 2 from the cycle-1 recommendation list (single-line guard inside `setCurrent`). Diff is one line at [`ScrollSpy.astro:86`](../../../../src/components/chrome/ScrollSpy.astro#L86):

```js
function setCurrent(anchorId: string): void {
  if (!tocLinks.has(anchorId)) return;   // ← cycle-2 guard
  tocLinks.forEach((link, key) => {
    if (key === anchorId) {
      link.dataset.current = 'true';
    } else {
      delete link.dataset.current;
    }
  });
}
```

**Auditor verification (cycle 2):**
1. **Guard placement.** Line 86 is the FIRST statement in `setCurrent` — runs before the `forEach` that mutates `data-current`. Correct placement; nothing else can run before the guard.
2. **Guard semantics.** When `anchorId` ∈ `tocLinks` (a TOC anchor is topmost): `tocLinks.has(anchorId) === true` → `!true === false` → guard does NOT return → `forEach` runs as before, setting the new current and clearing the old. Identical to cycle-1 behaviour for the in-TOC case. When `anchorId` ∉ `tocLinks` (a subsection anchor is topmost): `tocLinks.has(anchorId) === false` → `!false === true` → guard returns early → no DOM mutation → previously-highlighted TOC entry preserved. This is the docstring-asserted behaviour ("If none intersect (e.g. between two long sections), keep the current highlight rather than clearing — the previous section is still the most relevant context"); the cycle-1 implementation contradicted the docstring on the non-TOC-topmost case, the cycle-2 guard makes the docstring true.
3. **No "highlight stuck on first TOC entry forever" regression.** Worst-case scenario: a chapter where after the initial paint, no TOC anchor ever returns to the topmost-intersecting position (only subsection anchors do). With the guard, the highlight stays on `anchors[0]` (the initial-paint target) forever. But this scenario requires every section anchor to scroll past the upper-third strip without ever sharing the strip with another non-TOC anchor — and `rootMargin: '0px 0px -66% 0px'` keeps the upper third of the viewport active, which is wide enough that section-level anchors will be the topmost-intersecting whenever the heading is on screen. Auditor reasoned through the IO callback flow: `intersecting.sort(...).top` picks the smallest `getBoundingClientRect().top`; section-level headings are positioned above their subsection-level descendants in the DOM, so when both are intersecting, the section anchor is topmost. Once the user scrolls past the section heading entirely, the section heading is no longer intersecting; among the remaining intersecting anchors (subsection-level), the topmost is a non-TOC anchor → guard returns → previous highlight preserved. When the next section's heading scrolls into the upper third, that anchor IS in `tocLinks` → guard passes → highlight moves to the new section. So the highlight tracks section-level transitions correctly.
4. **Initial paint.** `setCurrent(anchors[0].id)` runs once on mount. With the guard: if `anchors[0]` is a TOC anchor (true for all 12 chapters today per cycle-1 verification), highlight is set to it (cycle-1 behaviour preserved). If `anchors[0]` is NOT a TOC anchor (a hypothetical future case if the MDX shape drifts), the guard returns early — the rail loads blank above the fold for one frame instead of clearing a never-set highlight. Either way, no negative side effect. **This subsumes M-UX-T4-ISS-03** (LOW flag-only — initial-paint fragility) — the guard hardens the initial paint against future shape drift, in addition to fixing the cycle-1 MEDIUM.
5. **Minified form in built HTML.** Astro's per-page minifier rewrites the `if (!a.b(c)) return; a.forEach(...)` early-return as a short-circuit AND: `n.has(t)&&n.forEach((e,r)=>{r===t?e.dataset.current="true":delete e.dataset.current})`. Auditor verified this expression is present in `dist/client/lectures/ch_4/index.html` and `dist/client/lectures/ch_12/index.html`. Semantically equivalent: `forEach` only runs when `n.has(t)` is true; when false, the expression short-circuits to `false` (discarded) and the IIFE-shaped function body finishes — same observable behaviour as the source `return`.
6. **Build is clean.** `npm run build` exit 0; 37 pages; `du -sb dist/client/` = `5,240,203` bytes (+120 over cycle-1 `5,240,083`; matches Builder's claim — ~10 bytes per lectures page × 12 chapters for the inlined guard expression). M3 surface counts on `dist/client/lectures/ch_4/index.html` unchanged: 6× `annotate-button`, 6× `annotations-pane`, 8× `mark-read-button`, **0× `section-nav`**. TOC entry counts per chapter unchanged: 80/58/102/68/9/10/5/8/13/5/2/5. `<article>` wrapper preserved on all three routes (1× each); `<body data-mode="static">` preserved (1× on lectures/ch_4).

**Resolution citation.** Commit yet to land at audit-close (Builder commits after audit per cs-300 Builder convention); on commit, the SHA goes here. The cycle-2 fix landed in [`src/components/chrome/ScrollSpy.astro:86`](../../../../src/components/chrome/ScrollSpy.astro#L86) with companion docstring expansion at lines 71–84 citing this issue ID. CHANGELOG entry under 2026-04-24 tagged `**Fixed**` documents the fix.

---

### MEDIUM-1 — Original cycle-1 finding (preserved for audit history)

**Surface:** [`src/components/chrome/ScrollSpy.astro:71-79`](../../../../src/components/chrome/ScrollSpy.astro#L71-L79) (the `setCurrent(anchorId)` function) interacts with [`ScrollSpy.astro:88-103`](../../../../src/components/chrome/ScrollSpy.astro#L88-L103) (the IntersectionObserver callback that picks the topmost intersecting entry).

**Finding.** ScrollSpy observes every `article a[id^="ch_"]` anchor — 111 of them on ch_4. The TOC's `tocLinks` Map only carries 68 of those (the entries whose anchor matches a TOC `data-anchor`). The other 43 are subsection-level anchors emitted by pandoc that do not appear in the lectures-collection `sections` frontmatter.

When the IO callback's `intersecting[0]` is one of those 43 non-TOC anchors, `setCurrent(<non-TOC id>)` runs:

```js
function setCurrent(anchorId: string): void {
  tocLinks.forEach((link, key) => {
    if (key === anchorId) {       // never matches — anchorId is not in tocLinks
      link.dataset.current = 'true';
    } else {
      delete link.dataset.current;  // clears every TOC link's data-current
    }
  });
}
```

Since `anchorId` is not in `tocLinks`, the if-branch never fires; the else-branch fires for every TOC link, deleting `data-current` from all of them. **Result: while the user reads deep inside a long section (where subsection-level anchors are intersecting), no TOC link is highlighted at all.** The highlight blinks back when a section-level anchor returns to the upper-third strip — but most of the time the user is between section headings inside a long section, so the highlight is gone.

This contradicts the spec's spec-deliverable-2 wording "Toggles a `data-current="true"` attribute on the matching TOC link as sections scroll into view" and the auditor smoke at AC 4: "confirms the `[data-current="true"]` attribute moves to the appropriate link as headings scroll past the viewport's upper third." When subsection anchors take over the topmost-intersecting position, the highlight does not move — it disappears.

**Quantification.** Per chapter (auditor verified):
- ch_3: 119 article anchors total, 102 in TOC, **17 article-only anchors** that trigger the bug.
- ch_4: 111 article anchors, 68 in TOC, **43 article-only anchors** trigger the bug (the worst case — ch_4's many subsections).
- ch_12: 14 article anchors, 2 in TOC, **12 article-only anchors** trigger the bug (proportionally the most exposed — the highlight disappears for ~85% of scrollable content).

Sample article-only anchors on ch_4 (from auditor's Python intersection): `ch_4-picture-of-the-interior-splice`, `ch_4-case-c-step-by-step`, `ch_4-the-walker-idiom-one-more-time`, `ch_4-cost-5`, etc. — every subsection-level anchor in the chapter body is exposed.

**Severity rationale:** MEDIUM, not HIGH — (i) the spec deliverable wording is technically met (the function does set `data-current` on the matching link when one is intersecting), but the spec's *auditor smoke* will produce a confusing observation (highlight disappears mid-section); (ii) the read-status indicator + the SSR TOC links themselves are unaffected (the bug is purely about the visual highlight); (iii) the spec authorises tuning the behaviour ("Adjust if scroll-spy feels jittery"), so a fix landing in T4 cycle 2 (or T8's integrated smoke) is in spec scope; (iv) the SSR TOC + native-anchor scrolling still work correctly — the failure mode is degraded enhancement, not breakage.

**Action / Recommendation.** Two reasonable directions, presented as options per CLAUDE.md "Present options for simple-fix issues":

1. **Filter the observed anchors to TOC-only (recommended).** Change the observer setup to observe ONLY anchors whose id matches a TOC `data-anchor`. Two-line change in `ScrollSpy.astro:113`:
   ```js
   anchors.forEach((a) => {
     if (tocLinks.has(a.id)) observer.observe(a);
   });
   ```
   Pros: minimal diff; preserves the symmetric `article a[id^="ch_"]` query as the build-time selector + the audit-time DOM contract for both ScrollSpy and MarkReadButton, while letting ScrollSpy filter its observation set down to the TOC subset at runtime. Cons: when scrolling fast through a section without any section-level heading currently in the upper-third strip, the highlight will stay on the previous section heading rather than chasing subsection headings — but this is the *intended* behaviour per the docstring on lines 84–86 ("If none intersect (e.g. between two long sections), keep the current highlight rather than clearing — the previous section is still the most relevant context"). The current implementation actually contradicts this docstring; option 1 makes the docstring true.

2. **Skip non-TOC anchors inside `setCurrent` rather than at observation time.** One-line change in `setCurrent`:
   ```js
   function setCurrent(anchorId: string): void {
     if (!tocLinks.has(anchorId)) return;  // don't clear if no match
     tocLinks.forEach((link, key) => { ... });
   }
   ```
   Same semantic effect with one less filter step; arguably cleaner since the caller sites stay unchanged. Either option is correct; option 2 is simpler.

**Owner:** T4 cycle 2 (Builder; auditor recommends option 2 — single-line fix, no observation-set churn). If the user prefers to ship as-is and let T8's integrated browser smoke catch it, defer to T8 and flip this to OPEN there. Logged as M-UX-T4-ISS-01.

## 🟢 LOW

### LOW-1 — `ScrollSpy.astro` island root does not carry `data-interactive-only` (spec wording deviation) — ⚠️ ACCEPT-AS-IS / OPEN (cycle 2 disposition: docs-sweep candidate, non-blocking)

**Cycle-2 disposition (ACCEPT-AS-IS).** Builder chose to leave the island root without `data-interactive-only` and documented the rationale in the cycle-2 report. Auditor adjudication: **rationale stands.**

- **Architecture grounding (verified by auditor):** `design_docs/architecture.md` line 137 reads "Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work." The architecture's "without it" reading is the SSR-fallback reading (the TOC works without the script, full stop) — not a static-mode-gating reading. The Builder's interpretation aligns with the architecture's framing.
- **No user-facing risk (verified by auditor):** if a user lands on a chapter page with `<body data-mode="static">` and JS enabled (the static-mode posture allows JS — the gating is on `data-interactive-only`-marked elements only), the script runs and toggles `[data-current]` on a TOC link. The TOC link itself is visible (not gated), so the highlight is observable and useful. There is no console-error path (the script bails silently when the TOC isn't mounted). Adding `data-interactive-only` to the island root would suggest the script needs static-mode gating that it doesn't actually need — it would falsely communicate a contract.
- **Asymmetry across the four T4 islands (verified by auditor):** the asymmetry is intentional. `RightRailReadStatus` (data-interactive-only YES — fetches state from `/api/read_status`, useless without the state service); `ScrollSpy` (data-interactive-only NO — purely visual highlight, useful regardless of state service); `read-indicator` spans inside `RightRailTOC` (data-interactive-only YES — they show data-derived read state); `cs300-completion-indicator` (data-interactive-only YES — same reason as RightRailReadStatus). The asymmetry maps to the data-vs-visual distinction; gating ScrollSpy would erase the distinction.
- **Severity holds at LOW.** Cycle-1 grade was correct: spec-wording deviation, no runtime concern.

**Action / Recommendation (cycle 2).** Carry forward to a docs-only spec-amendment sweep — recommended **option 1** from cycle 1: strike `data-interactive-only` from T4 spec deliverable 2's parenthetical and replace with "no `data-interactive-only` on the island root — the highlight is visual-only and harmless in static mode; the SSR TOC's static-mode posture is preserved by the scoped `<a class="toc-link">` not carrying the attribute itself, and architecture.md §1.6 frames scroll-spy as 'JS-only progressive enhancement' meaning the SSR fallback reading, not static-mode gating." This sweep is part of the M-UX-T2-ISS-01 spec doc-amendment carry-over (T2/T4/T7 inline-script vs `client:visible` / framework directives) — both are doc-only consolidation work. **Status:** OPEN as a docs-sweep candidate; **does not block T4 audit close.** No carry-over block appended to a downstream task spec because there is no current owner — the docs sweep has no claimed task. Re-flag only if a future docs sweep lands and this isn't included.

---

### LOW-1 — Original cycle-1 finding (preserved for audit history)

**Surface:** [`src/components/chrome/ScrollSpy.astro:45`](../../../../src/components/chrome/ScrollSpy.astro#L45) — `<div id="cs300-scroll-spy" hidden></div>`. T4 spec line 18 states: "`data-interactive-only` (the SSR TOC works without it; this is enhancement only)." The Builder omitted the attribute.

**Severity rationale:** LOW — (i) the highlight is purely visual and harmless in static mode (the script runs, sets `data-current` on a TOC link, and the user sees a highlighted entry; nothing breaks); (ii) architecture.md §1.6 frames scroll-spy as "JS-only progressive enhancement; without it, the TOC links are still anchors that work" — both readings of "without it" are defensible (the SSR fallback and the static-mode posture); (iii) the script bails silently if the TOC isn't mounted, so no console-error surface in static mode anyway; (iv) the body-level `data-mode="static"` rule wouldn't have hidden the TOC links themselves regardless — the TOC's structure stays visible in static mode by design (per architecture.md §1.6 "Left rail + right-rail TOC + chapter content all SSR-rendered. Fully navigable without JS").

**Action / Recommendation.** Two reasonable directions:

1. **Spec amendment (recommended).** Strike `data-interactive-only` from spec deliverable 2's parenthetical and replace with "no `data-interactive-only` — the highlight is visual-only and harmless in static mode; the SSR TOC's static-mode posture is preserved by the scoped `<a class="toc-link">` not carrying the attribute itself." Doc-only change. Aligns the spec with both the architecture's framing and the Builder's choice.
2. **Add the attribute.** One-line change in `ScrollSpy.astro:45` — `<div id="cs300-scroll-spy" data-interactive-only hidden></div>`. Hides the (already invisible) island root in static mode. The script still runs; only the (hidden) root becomes `display: none`. Net behaviour change: zero. Cosmetic alignment with the spec wording.

**Owner:** Either option works; auditor leans option 1 — the architecture-level framing supports running the highlight in static mode. Logged as M-UX-T4-ISS-02.

### LOW-2 — ScrollSpy initial-paint depends on the first article anchor being a TOC anchor — ✅ RESOLVED 2026-04-24 (cycle 2, subsumed by MEDIUM-1's guard)

**Cycle-2 disposition (RESOLVED).** The cycle-1 LOW-2 (M-UX-T4-ISS-03) was flagged as flag-only with "subsumed by MEDIUM-1's fix if option 1 (filter to TOC-only) is picked." Builder picked option 2 instead (single-line guard inside `setCurrent` rather than filtering the observation set), but the subsumption holds.

**Auditor verification:** the initial-paint call at [`ScrollSpy.astro:135`](../../../../src/components/chrome/ScrollSpy.astro#L135) is `setCurrent(firstAnchor.id)`. With the cycle-2 guard inside `setCurrent` (line 86), if `firstAnchor.id` is a TOC anchor (true for all 12 chapters today), the guard passes and the highlight is set (cycle-1 behaviour preserved). If `firstAnchor.id` is NOT a TOC anchor (a hypothetical future case if the MDX shape drifts), the guard returns early — the rail loads blank above the fold for one frame instead of clearing a never-set highlight. **Result:** the structural fragility cycle 1 flagged is now hardened against future MDX shape drift; on the never-fires-today path, behaviour is cosmetic-only (blank rail until the user scrolls and a real intersection fires) instead of broken (cleared then never set). This is the same hardening option 1 would have provided, achieved via option 2. **RESOLVED.**

---

### LOW-2 — Original cycle-1 finding (preserved for audit history)

**Surface:** [`ScrollSpy.astro:118-121`](../../../../src/components/chrome/ScrollSpy.astro#L118-L121). On mount, `setCurrent(anchors[0].id)` runs. If `anchors[0]` is a non-TOC subsection anchor (which would happen if pandoc emits a non-`sections` anchor before the first TOC entry), the initial paint clears all highlights and the rail loads blank above the fold.

**Quantification.** Auditor verified all 12 chapters: every chapter's first `article a[id^="ch_"]` is a TOC anchor today. ch_4's first is `ch_4-the-list-adt` (in TOC); ch_3's first is `ch_3-representing-information-as-bits` (in TOC); ch_12's first is `ch_12-the-set-adt` (in TOC). So the initial-paint bug doesn't fire today.

**Severity rationale:** LOW — (i) a structural assumption that holds today but isn't enforced by the schema or the build script; (ii) if MEDIUM-1's fix lands, this also gets fixed for free (option 1 — observe only TOC anchors — means `anchors[0]` becomes the first TOC anchor); (iii) cosmetic edge case; the rail simply renders blank above the fold for one frame until the user scrolls and a real intersection fires.

**Action / Recommendation.** Subsumed by MEDIUM-1's fix. If MEDIUM-1 is deferred and this case ever fires (a future MDX has a non-section anchor at the top), surface it then. Logged as M-UX-T4-ISS-03.

### LOW-3 — IntersectionObserver `rootMargin` deviation from spec's initial recommendation

**Surface:** [`ScrollSpy.astro:110`](../../../../src/components/chrome/ScrollSpy.astro#L110) — `rootMargin: '0px 0px -66% 0px'`. T4 spec line 69 (Notes section) recommends "Initial value `-30% 0px -50% 0px` (top-third trigger). Adjust if scroll-spy feels jittery. Pin the value in T4's audit issue file with the rationale."

**Builder's value rationale (per the docstring on `ScrollSpy.astro:104-109`):** "rootMargin tuned so a section is 'current' once its heading crosses into roughly the upper third of the viewport, and stays current until it scrolls off the top. The asymmetric bottom margin (-66%) keeps the highlight from briefly jumping to the next section as a heading first peeks in from below."

**Severity rationale:** LOW — the spec explicitly authorises tuning ("Adjust if scroll-spy feels jittery") and asks the auditor to pin the value with rationale (this entry pins it). The Builder's `0px 0px -66% 0px` is functionally equivalent in spirit to the spec's `-30% 0px -50% 0px` — both shrink the observation viewport to the top portion of the screen. Builder's value is slightly more aggressive (top 34% strip vs. spec's top 50% strip with a 30% top-margin offset), which may make subsection-aware highlight transitions snappier but exposes MEDIUM-1's clear-on-non-TOC-anchor bug more frequently (a smaller intersection strip means more frequent transitions). Pinned here per the spec's request.

**Action / Recommendation.** No change required for the deviation itself. If MEDIUM-1's fix lands (filter to TOC-only at observation time), the rootMargin choice becomes less load-bearing — only TOC anchors trigger transitions, so the strip size mostly affects "how early does the next section's heading become current" rather than "how often does the highlight blank out." If MEDIUM-1 is deferred, T8's auditor may want to retune to `-30% 0px -50% 0px` (spec's value) since the wider strip increases the chance that a section-level anchor stays intersecting throughout the section's reading. Logged as M-UX-T4-ISS-04.

## Additions beyond spec — audited and justified

- **`<h3>On this page</h3>` heading inside `RightRailTOC`'s `<nav>`.** Not required by spec, but a clean MDN-docs-style affordance (mirrors LeftRail's `.group h3` "REQUIRED" / "OPTIONAL" small-caps idiom). Justified — improves rail discoverability + matches the chrome's visual language across the left/right rails.
- **`<span class="toc-label">{title}</span>` wrapping the section title.** Not in spec; lets the indicator dot + label flex-row align cleanly. Same defensive wrap idiom as T2's `.chapter-label`. Justified — pure layout hygiene, no scope creep.
- **`overflow-wrap: anywhere` on `.toc-label`.** Defensive against long section titles on the 280px right rail (e.g. ch_4's "stdlist-is-a-circular-dll" or "linked-list-search-is-hostile-to-cpu-caches"). Justified — prevents horizontal overflow.
- **Defensive sort by `ord` ([`RightRailTOC.astro:83`](../../../../src/components/chrome/RightRailTOC.astro#L83)).** Spec line 26 says `Astro.props.sections` is sorted, but the build script doesn't *enforce* the sort. The defensive sort guards against a future frontmatter shape change or hand-edited override. Justified — pinning a contract is a pure cost saver, no scope.
- **`box-shadow: inset 3px 0 0 var(--mux-accent)` on `.toc-link[data-current="true"]`.** Spec doesn't specify the highlight visual style. Builder mirrors LeftRail's `.is-current` accent left-bar idiom for cross-chrome visual consistency. Justified — the chrome's visual language is set by ADR-0002's "Canvas-style" framing, and the left-bar is the project's existing pattern.
- **`hidden` attribute on the two island roots (`<div id="cs300-scroll-spy" hidden>` + `<div id="cs300-toc-read-status" hidden>`).** Not in spec; defensive against any future CSS rule that might inadvertently render the (otherwise invisible) island roots. Justified — zero-cost belt-and-suspenders.
- **`aria-hidden="true"` on `.read-indicator` spans ([`RightRailTOC.astro:106`](../../../../src/components/chrome/RightRailTOC.astro#L106)).** Not in spec; the indicator dots are decorative — the screen-reader user gets the section title via the surrounding `<a>` element's text. `aria-hidden` correctly excludes the decoration from the accessibility tree. Justified per WAI-ARIA best practice.

No invented scope. No drive-by refactors. No new dependencies. No `nice_to_have.md` adoption. The `cs300:toc-read-status-painted` event is a justified addition — solves a real reload-race that the existing single-event contract could not handle without introducing a re-dispatch loop.

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| G1: Full project build from scratch | `npm run build` | ✅ clean — prebuild + astro build both exit 0; 37 pages rendered; "Server built in 8.72s"; no warnings |
| G2: Page count | `find dist/client -name '*.html' \| wc -l` | ✅ 37 |
| G3: Dist size | `du -sb dist/client/` | ✅ 5,240,083 bytes (matches Builder's `5240083` claim exactly; +83 KB over post-T3 `5,157,010`) |
| G4: TOC entry counts per chapter match frontmatter section counts | `grep -oE 'class="toc-link"' dist/client/lectures/ch_*/index.html \| wc -l` ↔ `grep -E '^\s*-\s*id:' src/content/lectures/ch_*.mdx \| wc -l` | ✅ 80/58/102/68/9/10/5/8/13/5/2/5 — match for every chapter |
| G5: M3 surface counts post-T4 | `grep -oE 'mark-read-button\|annotations-pane\|annotate-button\|section-nav' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` | ✅ 6 annotate-button / 6 annotations-pane / 8 mark-read-button / **0 section-nav** (was 12 pre-T4 — refactor verified at the artefact level) |
| G6: SectionNav deletion confirmed across `src/` | `grep -rn 'SectionNav\|#section-nav\|section-nav' src/` | ✅ all hits are doc-comment-only references in `RightRailTOC`, `ScrollSpy`, `RightRailReadStatus`, `MarkReadButton`, `CompletionIndicator`, `lectures/[id].astro` headers; no live import or component use |
| G7: Event flow loop-safety | static trace: `MarkReadButton.click → cs300:read-status-changed → RightRailReadStatus.refresh() → cs300:toc-read-status-painted → MarkReadButton.refreshMarked() (read-only)` | ✅ single non-cyclic chain; `refreshMarked()` does not dispatch any event; CompletionIndicator listens for `cs300:read-status-changed` not `…-painted` |
| G8: Event-name occurrence counts on built ch_4 | `grep -c 'cs300:read-status-changed\|cs300:toc-read-status-painted' dist/client/lectures/ch_4/index.html` | ✅ 3× `read-status-changed` (1 dispatch in MarkReadButton + 1 listener in RightRailReadStatus + 1 listener in CompletionIndicator) + 2× `toc-read-status-painted` (1 dispatch in RightRailReadStatus + 1 listener in MarkReadButton) |
| G9: Event payload contract (no `detail`) | `grep -nE 'new CustomEvent' src/components/{chrome,read_status}/*.astro` | ✅ both events `new CustomEvent('…')` no detail — payload-less, consistent with M3 contract |
| G10: ScrollSpy selector identical to MarkReadButton | `grep -E 'article a\[id\^="ch_"\]' src/components/{chrome/ScrollSpy.astro,read_status/MarkReadButton.astro}` | ✅ both files use `article a[id^="ch_"]` exactly; symmetric contract pinned |
| G11: ScrollSpy IO observes ALL article anchors but only TOC subset has matching tocLinks key | Python intersection on built ch_4 | ⚠️ 111 article anchors observed; 68 in TOC, 43 article-only — see MEDIUM-1 |
| G12: ScrollSpy callback picks topmost intersecting via `getBoundingClientRect().top` | source review of `ScrollSpy.astro:88-103` | ✅ `intersecting.sort((a,b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top); const top = intersecting[0]` — topmost is the smallest `.top`. Correct. |
| G13: Initial-paint highlights first anchor (correct for ch_4 today) | source review + Python first-anchor-in-article-vs-TOC check | ✅ ch_4's `anchors[0]` = `ch_4-the-list-adt` IS in TOC; verified across all 12 chapters — every first article anchor is currently a TOC anchor (LOW-2 flags the structural fragility) |
| G14: TOC links do NOT carry `data-interactive-only` (static-mode navigation) | `grep -E '<a [^>]*class="toc-link"[^>]*data-interactive-only' dist/client/lectures/ch_4/index.html` | ✅ empty match — TOC links visible in static mode |
| G15: Read-indicator spans DO carry `data-interactive-only` | `grep -c 'data-read-indicator data-section-id="[^"]*" data-interactive-only' dist/client/lectures/ch_4/index.html` | ✅ 68 carriers (one per section in ch_4) |
| G16: ScrollSpy island root does NOT carry `data-interactive-only` (spec deviation — see LOW-1) | `grep -E '<div [^>]*id="cs300-scroll-spy"[^>]*>' dist/client/lectures/ch_4/index.html` | ⚠️ `<div id="cs300-scroll-spy" hidden>` — `hidden` only, no `data-interactive-only`. See LOW-1 |
| G17: RightRailReadStatus island root DOES carry `data-interactive-only` | `grep -E '<div [^>]*id="cs300-toc-read-status"[^>]*>' dist/client/lectures/ch_4/index.html` | ✅ `<div id="cs300-toc-read-status" data-interactive-only data-chapter-id="ch_4" hidden>` |
| G18: `data-interactive-only` carrier total on ch_4 | Python tag-walker | ✅ 86 carriers (1 annotations-pane + 1 annotate-button + 1 mark-read-button + 1 interactive-mode-badge + 12 checkmark-slot + 1 cs300-completion-indicator + 1 cs300-toc-read-status + 68 read-indicator). Builder claim 86 matches — the raw `wc -l` of 87 includes the CSS rule-text `[data-interactive-only]` once |
| G19: TOC absent from notes/practice/index | `grep -c 'right-rail-toc' dist/client/{notes,practice}/ch_4/index.html dist/client/index.html` | ✅ 0 / 0 / 0 |
| G20: M3 surfaces preserved on notes + practice (no SectionNav re-mount) | `grep -oE 'mark-read-button\|annotations-pane\|annotate-button\|section-nav' dist/client/notes/ch_4/index.html` | ✅ M3 surfaces NOT mounted on notes routes (the route doesn't import them, T6 owns); 0 hits on all four surfaces — consistent with M3's lectures-only annotation stack today |
| G21: `<article>` wrapper preserved on all three routes | `grep -c '<article' dist/client/{lectures,notes,practice}/ch_4/index.html` | ✅ 1 / 1 / 1 |
| G22: `<body data-mode="static">` SSR default preserved | `grep -c 'data-mode="static"' dist/client/lectures/ch_4/index.html` | ✅ 1 |
| G23: BASE_URL discipline on the three new files | `grep -nE '/DSA/' src/components/chrome/RightRailTOC.astro src/components/chrome/ScrollSpy.astro src/components/chrome/RightRailReadStatus.astro` | ✅ empty — no source-level `/DSA/` references; consistent with the in-page-anchor + relative-fetch URL idiom |
| G24: CompletionIndicator diff is doc-only | `git diff HEAD -- src/components/chrome/CompletionIndicator.astro` | ✅ only the companion-files header doc-comment (lines 39–45) updated to point at the new RightRailReadStatus instead of the deleted SectionNav. No logic change. |
| G25: Manifest unchanged | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` | ✅ empty |
| G26: Status surface (a) per-task spec | `head -3 design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md` | ✅ `**Status:** ✅ done 2026-04-24` |
| G27: Status surface (b) tasks/README | `grep -E '^\| T4 ' design_docs/milestones/m_ux_polish/tasks/README.md` | ✅ `✅ done 2026-04-24` |
| G28: Status surface (c) milestone README task table | `grep -E '^\| T4 ' design_docs/milestones/m_ux_polish/README.md` | ✅ `✅ done 2026-04-24` |
| G29: Status surface (d) Done-when bullet 1 | `sed -n '19p' design_docs/milestones/m_ux_polish/README.md` | ✅ `[x]` with `(T1 + T2 + T4 issue files)` citation per M-UX-T1-ISS-01 chain |
| G30: Status surface (d) Done-when bullet 5 | `sed -n '23p' design_docs/milestones/m_ux_polish/README.md` | ✅ `[x]` with `(T4 issue file)` citation |
| G31: T4 spec carry-over checkboxes | `grep -E '^- \[' design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md` | ✅ all 3 carry-over items checked `[x]` (M-UX-T2-ISS-01, M-UX-T2-ISS-03, M-UX-T1-ISS-01) |
| G32: Net new JS chunks | `ls dist/client/_astro/` | ✅ only `Breadcrumb.BmHgLMAI.css` (T3-era CSS chunk); no `*.js` chunks added — both new islands are inline `<script type="module">` per page (matches M3 pattern) |

## Issue log

| ID | Severity | Description | Status | Owner / next touch |
| -- | -------- | ----------- | ------ | ------------------ |
| M-UX-T4-ISS-01 | MEDIUM | ScrollSpy `setCurrent()` clears the TOC highlight when a non-TOC article anchor is the topmost intersecting one (43 of 111 anchors on ch_4 trigger this; ch_12 worst at 12 of 14) | ✅ RESOLVED 2026-04-24 (cycle 2) | Builder picked option 2 — single-line guard `if (!tocLinks.has(anchorId)) return;` inside `setCurrent()` at [`ScrollSpy.astro:86`](../../../../src/components/chrome/ScrollSpy.astro#L86). Minified form `n.has(t)&&n.forEach(...)` verified in built ch_4 + ch_12. |
| M-UX-T4-ISS-02 | LOW | `ScrollSpy.astro` island root does not carry `data-interactive-only` — spec wording deviation, not a runtime concern | OPEN — ACCEPT-AS-IS (cycle 2) | Builder rationale upheld by auditor: architecture.md §1.6 line 137 frames scroll-spy as "JS-only progressive enhancement" in the SSR-fallback sense, not the static-mode-gating sense. Carry forward to a docs-only T2/T4/T7 spec-amendment sweep (option 1 from cycle 1). Non-blocking — does NOT block T4 audit close. No downstream task carry-over because no docs-sweep task is currently claimed. |
| M-UX-T4-ISS-03 | LOW | ScrollSpy initial-paint depends on first article anchor being a TOC anchor (true for all 12 chapters today; structural fragility, not a current bug) | ✅ RESOLVED 2026-04-24 (cycle 2, subsumed by ISS-01 guard) | Cycle-2 guard inside `setCurrent()` makes initial-paint safe even if `anchors[0]` is a non-TOC anchor (early return — no negative side effect). Hardens against future MDX shape drift; never-fires-today path is now cosmetic-only (blank rail for one frame) instead of broken (cleared then never set). |
| M-UX-T4-ISS-04 | LOW | IntersectionObserver `rootMargin: '0px 0px -66% 0px'` deviates from spec's recommended `'-30% 0px -50% 0px'`. Spec authorises tuning + asks for pinning here — pinned with rationale. | ✅ RESOLVED via this issue file (cycle 1) | Spec asked auditor to pin the value with rationale; done in cycle 1. |
| M-UX-T2-ISS-01 (carry-over) | MEDIUM | `client:visible` spec wording vs M3 inline-script pattern; Builder pick option (a) | ✅ RESOLVED 2026-04-24 | T2/T4/T7 spec doc-amendment deferred to single docs-only sweep — code precedent set across T2 + T4 |
| M-UX-T2-ISS-03 (carry-over) | LOW | Companion to M-UX-T2-ISS-01 | ✅ RESOLVED 2026-04-24 | Resolved jointly with M-UX-T2-ISS-01 |
| M-UX-T1-ISS-01 (carry-over) | MEDIUM | Done-when bullet 1 flip with `(T1 + T2 + T4 issue files)` citation | ✅ RESOLVED 2026-04-24 | Bullet flipped on milestone README line 19 |

## Deferred to nice_to_have

N/A. No findings map to `nice_to_have.md`. The four entries currently parked there (visual style sweep, search, dark mode, animation discipline) are explicitly out of scope for M-UX per ADR-0002 "Open questions deferred"; T4 did not silently adopt any of them. The Site UI/UX layer item that WAS in `nice_to_have.md` was already promoted on M-UX kickoff (2026-04-24) — T4 implements its T4-shaped slice.

## Propagation status

### Cycle 2 (2026-04-24) — re-audit close

**M-UX-T4-ISS-01 (MEDIUM).** ✅ RESOLVED in cycle 2 by single-line guard at [`ScrollSpy.astro:86`](../../../../src/components/chrome/ScrollSpy.astro#L86). No carry-over block needed; fix landed in-task. Closes the cycle-1 OPEN finding.

**M-UX-T4-ISS-02 (LOW).** OPEN — ACCEPT-AS-IS. Auditor adjudicated cycle 2 as a docs-sweep candidate per architecture.md §1.6 line 137 framing ("Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work" — the SSR-fallback reading, not static-mode gating). **Does not block T4 audit close.** Folds into the broader M-UX-T2-ISS-01 spec-doc-amendment sweep (T2/T4/T7 spec wording vs M3 inline-script pattern); both are doc-only consolidation work with no current owner — no downstream task carry-over created. If a future docs-only sweep task lands without addressing this, the auditor will re-flag it then.

**M-UX-T4-ISS-03 (LOW).** ✅ RESOLVED in cycle 2 — subsumed by ISS-01's guard (the guard makes initial-paint safe against future MDX shape drift; never-fires-today path is now cosmetic-only instead of broken).

**M-UX-T4-ISS-04 (LOW).** ✅ RESOLVED in cycle 1 (rootMargin pinned with rationale).

**Audit verdict propagation (cycle 2).** This cycle-2 audit returns ✅ PASS to the invoker. T4 closes cleanly. The MEDIUM finding (cycle 1) is RESOLVED by the cycle-2 guard; both LOW findings that were OPEN at cycle-1 close are now either RESOLVED (ISS-03) or ACCEPT-AS-IS in a docs-sweep candidate (ISS-02). The build is clean (37 pages, +120 bytes over cycle 1 — exactly the inlined guard expression × 12 lectures pages). Status surfaces (a)/(b)/(c)/(d) preserved from cycle 1 close — all four flipped to ✅ done 2026-04-24 in cycle 1 and unchanged in cycle 2.

**Override / disagreement with Builder report (cycle 2).** None. Builder's cycle-2 claims all reproduce byte-for-byte:
- Single-line guard at the start of `setCurrent` — verified at line 86.
- `+120` byte size delta vs cycle 1 — verified (`du -sb dist/client/` returns `5240203` exactly).
- Minified short-circuit form `n.has(t) && n.forEach(...)` — verified in `dist/client/lectures/ch_4/index.html` and `dist/client/lectures/ch_12/index.html` (semantically equivalent: `forEach` runs iff guard passes, otherwise the AND short-circuits and the function body completes — same observable behaviour as the source `return`).
- M3 surface counts unchanged (6/6/8/0) — verified.
- TOC entry counts unchanged (80/58/102/68/9/10/5/8/13/5/2/5) — verified.
- `<article>` + `<body data-mode="static">` preserved — verified.
- Builder's adjudication of ISS-02 as ACCEPT-AS-IS with architecture-§1.6 grounding — auditor concurs.

### Cycle 1 (2026-04-24) — original close (historical, preserved)

**Carry-over from prior issue files closed in cycle 1:**
- **M-UX-T1-ISS-01** (MEDIUM) — Done-when bullet 1 flipped per the deferred T1 → T4 chain. ✅ RESOLVED.
- **M-UX-T2-ISS-01** (MEDIUM) — `client:visible` spec wording vs M3 inline-script pattern; Builder pick option (a) "spec amendment via implementation precedent." Code precedent now set across T2 + T4; spec doc-amendment deferred to a single docs-only sweep (T7's drawer keeps its own `client:load` per its spec, orthogonal to this carry-over). ✅ RESOLVED.
- **M-UX-T2-ISS-03** (LOW) — Companion to M-UX-T2-ISS-01. ✅ RESOLVED jointly.

Per the T2 issue file's Propagation status footer, these three were the only items propagated to T4. M-UX-T2-ISS-02 (size budget) was propagated to T8 (not T4) and remains DEFERRED to T8.

**Cycle-1 audit verdict.** Returned `⚠️ OPEN — 1 MEDIUM + 3 LOW (1 resolved here, 2 OPEN)` to the invoker. The MEDIUM (ScrollSpy clear-on-non-TOC-anchor) was a behavioural bug that contradicted the spec's auditor smoke at AC 4 — when scrolling deep inside a long section, the highlight went blank instead of staying on the parent section. The recommended fix was a 1–2 line code change. Cycle 2 landed option 2 (single-line guard inside `setCurrent`) and resolved the finding.

**Cycle-1 minor overrides on Builder report:**
1. Builder claimed `data-interactive-only count = 86 on lectures/ch_4`. Auditor confirmed 86 *carriers* in the DOM but raw `grep -c` returns 87 because the CSS rule itself contains the literal string once. The 86 figure is correct when you exclude the rule body. Both interpretations defensible.
2. Builder's loop-safety claim for the new `cs300:toc-read-status-painted` event verified via static trace G7. No factual override; surfaced as agreement-with-Builder.

The Builder's cycle-1 broader claims (37-page build, TOC entry counts per chapter, M3 surface counts, status-surface flips, BASE_URL discipline, CompletionIndicator doc-only diff) all reproduced byte-for-byte. The MEDIUM-1 finding was a deeper behavioural observation (relationship between the 111 article anchors observed by ScrollSpy and the 68 TOC anchors in `tocLinks`).

## Security review

**Reviewed on:** 2026-04-25
**Reviewer:** security-reviewer subagent (post functional cycle 2 PASS)
**Verdict:** SHIP — no Critical, no High, no Advisory requiring code change.

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | RightRailTOC SSR data flow — no `set:html` | CLEAN — `RightRailTOC.astro:86–113` all dynamic data (`s.anchor`, `s.id`, `s.title`, `chapterId`) flows through Astro `{...}` JSX interpolation. Astro auto-escapes all JSX. Zero `set:html`. |
| 2 | ScrollSpy IntersectionObserver target | CLEAN — `ScrollSpy.astro:85–94` `top.target.id` flows only into `tocLinks.has(anchorId)` (boolean Map lookup) and `link.dataset.current = 'true'` / `delete` (boolean attribute toggle). No `innerHTML`, no `eval`. `tocLinks` Map populated at init from rendered SSR DOM (Zod-validated `content.config.ts:33`). |
| 3 | RightRailReadStatus fetch + JSON parse | CLEAN — `chapterId` from SSR-set `data-chapter-id` (Zod `^ch_\d+$` in `content.config.ts:26`). `encodeURIComponent(chapterId)` applied. `await res.json()` — standard parser, not eval. `body.section_ids` flow into `marked.has(id)` (boolean Set), never reflected into DOM as strings. |
| 4 | `cs300:toc-read-status-painted` event payload | CLEAN — Dispatcher `new CustomEvent('cs300:toc-read-status-painted')` no `detail`. Listener callback `() => { markedSet.clear(); void refreshMarked(); }` — `event` parameter not declared, detail structurally ignored. Attacker-controlled detail has zero effect. |
| 5 | Loop safety of new event | CLEAN — Static trace: click → `cs300:read-status-changed` → `RightRailReadStatus.refresh()` → fetch + paint → `cs300:toc-read-status-painted` → `MarkReadButton.refreshMarked()` (read-only DOM scan, no `dispatchEvent`) → terminate. No cycle. |
| 6 | `data-interactive-only` gating depth per island | CLEAN — TOC `<a class="toc-link">` ungated (correct — navigation works without JS); read-indicator spans gated (data-derived); RightRailReadStatus root gated (makes a fetch); ScrollSpy root ungated (ACCEPT-AS-IS per ISS-02 — visual-only, no fetch/state/event-dispatch, no security surface). |
| 7 | MarkReadButton selector swap | CLEAN — `[data-read-indicator][data-read="true"]`. `data-read` written from closed `'true'`/`'false'` literals. `sectionId` passed through `encodeURIComponent` or `JSON.stringify` before network. |
| 8 | CompletionIndicator doc-only change | CLEAN — `git diff HEAD` confirms only the companion-files comment was updated (deleted SectionNav → new RightRailReadStatus). Zero logic change. Pre-existing `set:html` of build-time JSON into inert `<script type="application/json">` is a T2 pattern, not a T4 introduction. |
| 9 | SectionNav deletion fallout | CLEAN — 0 client-bundle references (was 12 pre-T4); src-tree references all doc-comment-only; no new JS chunks. |
| 10 | GH Pages artifact integrity | CLEAN — `output: 'static'` intact, `deploy.yml` uploads only `dist/client/`. No `import.meta.env`, no loopback, no local-path leaks in T4 files. |

### Advisory

None.

### Verdict

**SHIP.** Ten checks PASS, zero advisories. T4's threat surface (three new islands + refactored MarkReadButton + deleted SectionNav) is clean. The new `cs300:toc-read-status-painted` event contract is loop-safe, payload-less, and matches the M3 no-detail pattern.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
