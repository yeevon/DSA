# T6 — M3 component re-homing (annotations + mark-read) — Audit Issues

**Source task:** [../tasks/T6_m3_rehome.md](../tasks/T6_m3_rehome.md)
**Audited on:** 2026-04-25
**Audit scope:** spec-vs-implementation re-verification of every T6 spec deliverable + every auditor-smoke acceptance check; design-drift re-check against [`design_docs/architecture.md`](../../../architecture.md) §1.6 (Page chrome — UX layer) + §3.4 (Reader state / annotations API) + §4 (Local-vs-public mode); [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md) §"Decision" (right-rail composition; "MarkReadButton to chapter content header" wording vs spec's MUX-BO-DA-6 (i)/(ii) resolution); [`nice_to_have.md`](../../../nice_to_have.md) boundary; CLAUDE.md non-negotiables (BASE_URL discipline, status-surface flips on all four surfaces, cross-chapter ref discipline — no ch_8); T1/T2/T3/T4/T5 issue-file carry-over targeting (none target T6 — verified); status-surface flips on all four surfaces (per-task spec, tasks/README, milestone README task table, Done-when bullets 6 + 7); gate re-run by rebuilding from scratch (`npm run build` — auditor did not trust the Builder's `dist/client/`); BASE_URL hardcoding sweep on touched files; M3 contract preservation (event names, dispatch/listener counts, selectors, API URLs, DOM ids, `data-interactive-only` carriers); `data-interactive-only` count regression on lectures/ch_4 (T4 baseline = 86); AnnotationsPane script-tag byte-identity verification (`git show HEAD:` vs working tree `<script>...</script>` slices diffed); right-rail DOM order verification by byte offsets in built HTML; lectures-only scope on M3 surfaces (notes / practice / index parity); `nice_to_have.md` boundary (no fresh adoption — M-UX itself was promoted in the kickoff commit, no further drive-by). Fresh `npm run build` re-executed by the auditor reproduces the Builder's reported numbers byte-for-byte: `du -sb dist/client/` = `5173963` bytes (matches Builder; **+3,972 bytes vs post-T5 `5169991`**; cumulative vs pre-M-UX `4420947` = `+753,016` bytes / ~735 KB — T8 still owns the deploy budget gate), page count `37`, lectures/ch_4 surface counts (8× `mark-read-button`, 6× `annotate-button`, 7× `annotations-pane`, 0× `section-nav`, 86× `data-interactive-only` — UNCHANGED from post-T5 baseline), notes/ch_4 + practice/ch_4 + index parity (0× M3 surfaces on every non-lectures route), right-rail DOM order on lectures/ch_4 verified by `grep -bo` byte offsets: `class="right-rail-toc"` @ 536,936 → `data-scroll-spy` @ 568,035 → `id="cs300-toc-read-status"` @ 568,755 → `id="annotations-pane"` @ 569,458 (TOC → ScrollSpy → ReadStatus → AnnotationsPane — exactly matches Builder's report and ADR-0002 §"Decision" line 75 commitment "Below the TOC in interactive mode: M3's annotations pane"), MarkReadButton mount-site DOM order verified: `id="mark-read-button"` @ 24,072 precedes the first `<header>` @ 25,390 + `<article>` @ 25,487 (button JSX import correctly mounted in default slot above article body per spec line 24).
**Status:** ✅ PASS

## Design-drift check

No HIGH design-drift. Cross-checks against [`design_docs/architecture.md`](../../../architecture.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), and CLAUDE.md non-negotiables:

- **architecture.md §1.6 "Page chrome (UX layer)" line 130** — "Annotations pane in the right rail (re-homed from the M3 always-rendered position)". T6 lands this verbatim — `<AnnotationsPane>` mounts in `slot="right-rail"` after `<RightRailReadStatus>` ([`src/pages/lectures/[id].astro:105`](../../../../src/pages/lectures/[id].astro)). DOM order verified by byte offsets: TOC → ScrollSpy → ReadStatus → AnnotationsPane. ✅ no drift.
- **architecture.md §1.6 line 139** — "M-UX T6 re-homes the M3 components into the new chrome slots without changing their APIs." Verified: `git diff HEAD -- src/components/annotations/AnnotateButton.astro` empty; `git diff HEAD -- src/components/read_status/MarkReadButton.astro` empty; `git diff HEAD -- src/components/annotations/AnnotationsPane.astro` shows CSS + docstring only — script tag byte-identical (verified by extracting `<script>...</script>` from `git show HEAD:` and current working tree, `diff` returned no output). Props (`sectionIds: string[]`), GET/DELETE `/api/annotations` calls, the `cs300:annotation-added` listener, the `#annotations-pane` + `#annotations-list` DOM ids, and the row-rendering logic survive untouched. ✅ no drift.
- **architecture.md §3.4 "Reader state (Phase 3)" lines 338–340** — `GET /api/annotations?section_id=…`, `POST /api/annotations`, `DELETE /api/annotations/:id`. All three endpoints preserved verbatim in AnnotationsPane.astro:132 + 161 (and AnnotateButton.astro:125, unchanged). ✅ no drift.
- **architecture.md §4 "Local-vs-public mode" line 385** — "Hidden in static mode: question generation UI, review queue, code editor, annotations, read-status indicators." `data-interactive-only` on AnnotationsPane preserved (`<aside id="annotations-pane" data-interactive-only ...>` line 50); MarkReadButton + AnnotateButton untouched, `data-interactive-only` already in place. Static-mode hide rule still in `src/layouts/Base.astro` (global `body[data-mode="static"] [data-interactive-only] { display: none !important; }`). ✅ no drift.
- **ADR-0002 §"Decision" line 75** — "Below the TOC in interactive mode: M3's annotations pane (refactored from the current always-rendered position into the right rail)." Verified by DOM byte offsets above. ✅ no drift.
- **ADR-0002 §"Decision" line 111** — "M-UX T6: M3 component re-homing — annotations pane to right rail, `MarkReadButton` to chapter content header." ⚠️ **Tension flagged but resolved by spec.** ADR-0002 wording specifies "chapter content header" placement for MarkReadButton, but the spec's MUX-BO-DA-6 test-then-decide (T6 spec lines 12, 21, 35–38, 48) explicitly resolved this as a Builder-time choice between option (i) "keep M3's `position: fixed; bottom-left`" and option (ii) "strip `position: fixed` and flow-position at the article header". Spec is the more recent + more specific document — the spec authority overrides the ADR's literal wording for this particular question. The Builder lands option (i) per spec procedure; not drift. **However**, the Done-when bullet 7 wording in the milestone README still reads "re-homed to the chapter content header (or per-section, per T6's call)" — see MEDIUM-2 below for the secondary issue this raises. Not a HIGH; flagged for transparency.
- **CLAUDE.md non-negotiables sweep** — (a) no new dependencies (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements.txt` empty); (b) no `nice_to_have.md` adoption (M-UX itself was promoted in the kickoff commit — no fresh items pulled); (c) no Jekyll polish (M2 closed; M-UX is the Astro-only chrome layer); (d) no chapter content edits — pure Astro component re-home; (e) no cross-chapter ref drift (no chapter content touched); (f) sequencing intact — T6 depends on T4 + T1 + T2 + T3, all ✅ done before T6 landed. ✅ no drift.
- **Status-surface check (mandatory four surfaces)** — (a) per-task spec [`T6_m3_rehome.md:3`](../tasks/T6_m3_rehome.md) `**Status:** ✅ done 2026-04-25` ✓; (b) `tasks/README.md:14` row `T6 ... ✅ done 2026-04-25` ✓; (c) milestone README `task-table` row line 41 `T6 ... ✅ done 2026-04-25` ✓; (d) milestone README Done-when bullets 6 (line 24) and 7 (line 25) both flipped `[ ] → [x]` with `(T6 issue file)` parenthetical citations. **All four surfaces aligned.** Bullet 7 wording vs option (i) implementation is logged as MEDIUM-2 (a wording-vs-implementation drift, not a status-surface drift — the bullet IS flipped, the question is whether the bullet text accurately describes what landed).
- **Code-task verification standard (CLAUDE.md "Content vs code verification standards differ — and code is stricter")** — T6 spec is a code task. Spec acceptance check section names two browser-driven smokes: (1) `npm run dev` interactive-mode round-trip (select text → click annotate → annotation appears in right-rail pane → reload → annotation persists); (2) `npm run preview` static-mode invisibility (annotations pane hidden, mark-read button hidden, no annotate button on selection). Builder ran neither in cycle 1 — the Builder's report explicitly states "the two browser-driven manual ACs ... are the Auditor's cycle-1 manual smoke." This audit also did not run them (no Playwright / browser-driver harness exists in the repo, and the audit environment has no interactive browser). **DEFERRED to a manual-smoke cycle** — see HIGH-1 below for the formal finding and propagation. The structural evidence above (data-interactive-only count, gating mechanism unchanged, API endpoints + event contracts preserved, script tag byte-identical, DOM-order verified) is **strong but not sufficient** under CLAUDE.md's code-task rule. The audit verdict is PASS on the structural surface; the manual-smoke gap is logged as a HIGH that the user should resolve before declaring T6 fully closed (or accept as a known T7/T8 deferral).

## AC grading

T6 spec lists 7 deliverables (D1–D5 in the *Deliverable* section + the data-interactive-only contract preservation + chrome composition for notes/practice) and 6 acceptance checks (AC1–AC6 in the *Acceptance check* section). Graded individually below.

### Deliverables (Deliverable section, spec lines 18–27)

| AC | Status | Notes |
| -- | ------ | ----- |
| **D1** — `AnnotationsPane.astro` re-homed: positioned in the `right-rail` slot, below `RightRailTOC` (T4); component unchanged in API; only wrapping markup changes | ✅ PASS | Mount changed from default slot to `slot="right-rail"` ([`src/pages/lectures/[id].astro:105`](../../../../src/pages/lectures/[id].astro)). DOM byte offsets confirm position below T4's TOC + ReadStatus (TOC @ 536,936 < ReadStatus @ 568,755 < AnnotationsPane @ 569,458). API unchanged: `interface Props { sectionIds: string[]; }` preserved verbatim ([`AnnotationsPane.astro:43-45`](../../../../src/components/annotations/AnnotationsPane.astro)); `<script>` tag byte-identical to HEAD baseline. |
| **D2** — `MarkReadButton.astro` re-homed; option (i) vs (ii) is MUX-BO-DA-6 test-then-decide | ✅ PASS (option (i) authorised) | Builder lands option (i) "keep M3's `position: fixed; bottom-left` floating" per spec procedure (spec line 38). `git diff HEAD -- src/components/read_status/MarkReadButton.astro` returns empty — no CSS or behavioural changes. JSX import location moves in `[id].astro:106` (default slot, above `<header>`). Spec line 36–37 explicitly authorises (i): "'Re-home' becomes a no-op for visual position; only the JSX import location moves (cosmetic). Preserves 'API stable' (no CSS edits to the M3 component)." Conservative + spec-aligned. **However**, spec line 38 also requires the Builder to actually run a 1280px AND 375px `npm run dev` smoke to validate (i) before locking it in — Builder ran neither (HIGH-1 below). Status: PASS on the choice; the manual-smoke gap is a separate finding. |
| **D3** — `src/pages/lectures/[id].astro` mounts updated: AnnotationsPane → right-rail (after RightRailTOC); MarkReadButton → default slot above article body; AnnotateButton unchanged | ✅ PASS | Diff shows exactly the three slot mount changes specified: `<AnnotationsPane slot="right-rail" sectionIds={sectionIds} />` added to right-rail (after `<RightRailReadStatus>`); `<MarkReadButton />` moved into default slot above `<header>`; `<AnnotateButton />` retained at the tail of default slot (floating, unchanged). Header docstring extended to enumerate every preserved M3 contract (lines 23–64). |
| **D4** — `notes/[id].astro` + `practice/[id].astro` render through new chrome WITHOUT M3 interactive components mounted | ✅ PASS | `grep -n 'AnnotationsPane\|MarkReadButton\|AnnotateButton'` on both files returns zero hits. Built HTML `dist/client/notes/ch_4/index.html` + `dist/client/practice/ch_4/index.html` carry zero M3 surfaces (`grep -c 'mark-read-button\|annotate-button\|annotations-pane\|section-nav'` = 0 on both). Lectures-only scope per spec line 26 (MUX-BO-ISS-05 / MEDIUM-2 pinned) satisfied. |
| **D5** — `data-interactive-only` contract preserved on every re-homed component | ✅ PASS | AnnotationsPane: `<aside id="annotations-pane" data-interactive-only ...>` line 50 — preserved. MarkReadButton: `<button id="mark-read-button" data-interactive-only ...>` line 34 — preserved (file unchanged). AnnotateButton: `<button id="annotate-button" data-interactive-only ...>` line 20 — preserved (file unchanged). Lectures/ch_4 `data-interactive-only` count = 86 — unchanged from post-T5 / post-T4 baseline. Static-mode hide rule lives globally in `src/layouts/Base.astro`'s `<style>` block (T1 contract) — not touched by T6. |

### Acceptance checks (Acceptance check section, spec lines 46–54)

| AC | Status | Notes |
| -- | ------ | ----- |
| **AC1** — Auditor opens `/DSA/lectures/ch_4/` in `npm run dev`; annotations pane in right rail below TOC; mark-read button visible + functional with position cited; floating annotate button on selection not clipped | ⚠️ DEFER (manual-smoke not run) | Structural evidence: DOM-order verified by byte offsets (TOC → ScrollSpy → ReadStatus → AnnotationsPane). Position option (i) cited via source preservation (`MarkReadButton.astro:38-42` `position: fixed; bottom: 16px; left: 16px;` unchanged). AnnotateButton `position: fixed; z-index: 1000` lives at body level (not inside the right-rail aside's stacking context per `Base.astro` inspection — no `position: relative` / `transform` / `filter` on right-rail aside that would create a new stacking context), so visual clipping is unlikely. **But the spec asks for browser-driven observation**, not source inference. PASS on inferred behaviour; DEFER on the literal AC. See HIGH-1. |
| **AC2** — Round-trip end-to-end: select text → click annotate → annotation appears in right-rail pane → reload → annotation persists | ⚠️ DEFER (manual-smoke not run) | Structural evidence: AnnotateButton `cs300:annotation-added` dispatch (line 131) → AnnotationsPane listener (line 174). API endpoints `POST /api/annotations` + `GET /api/annotations?section_id=…` preserved. AnnotationsPane.astro `<script>` byte-identical to HEAD — same `load()` runs on mount fetching from `/api/annotations` per section, same `cs300:annotation-added` listener triggers a re-load. Reload-persistence is a function of the existing M3 Phase-3 state-service, which T6 does not touch. **But the spec asks for end-to-end browser exercise**, not contract inference. PASS on inferred behaviour; DEFER on the literal AC. See HIGH-1. |
| **AC3** — Static mode smoke (`npm run preview`): right-rail pane shows TOC only (no annotations slot), mark-read button hidden, no annotate button on selection. Page still readable | ⚠️ DEFER (manual-smoke not run) | Structural evidence: `data-interactive-only` carriers on all three M3 surfaces preserved (D5 above). Static-mode hide rule (`body[data-mode="static"] [data-interactive-only] { display: none !important; }`) lives globally in `Base.astro` — unchanged by T6. `<body data-mode="static">` SSR default preserved. Mode-detect inline boot script unchanged. Same gating mechanism that T1–T5 verified in static mode applies here unchanged. **But the spec asks for browser observation of the static-mode page**, not contract inference. PASS on inferred behaviour; DEFER on the literal AC. See HIGH-1. |
| **AC4** — Auditor confirms M3 component APIs unchanged. Diff `src/components/annotations/*.astro` and `src/components/read_status/*.astro` — only structural / positioning changes, no prop rename or fetch-logic edits | ✅ PASS | `git diff HEAD -- src/components/annotations/AnnotateButton.astro` empty. `git diff HEAD -- src/components/read_status/MarkReadButton.astro` empty. `git diff HEAD -- src/components/annotations/AnnotationsPane.astro` shows ONLY: (1) docstring additions (lines 13–42), (2) CSS rule rewrite removing `position: fixed; top: 64px; right: 0; width: 260px; z-index: 900; background: #fff; border-left; box-shadow; padding: 12px;` and replacing with token-based flow-positioned rules, (3) row-style refinements using `--mux-space-2/3/4` + `--mux-border-subtle` tokens. Script tag byte-identical (verified by extracting `<script>...</script>` block from `git show HEAD:` vs working tree and `diff`-ing — no output). Props (`sectionIds: string[]`) unchanged. DOM ids (`#annotations-pane`, `#annotations-list`) unchanged. API endpoints unchanged. Event listener (`cs300:annotation-added`) unchanged. Authorised by spec line 52: "structural / positioning changes (e.g., outer wrapper class names)". |
| **AC5** — Notes / practice routes render through new chrome without M3 component breakage (right rail empty if scoped to lectures-only — that's acceptable) | ✅ PASS | Notes/practice routes render through `Base.astro` (T1 chrome) with LeftRail (T2) + Breadcrumb (T3) + 0× M3 surfaces. Right rail empty on those routes per T4 design (MDX schemas don't include `sections` frontmatter). Built HTML grep confirms 0× `mark-read-button\|annotate-button\|annotations-pane\|section-nav` on `dist/client/notes/ch_4/index.html` + `dist/client/practice/ch_4/index.html`. 14× `data-interactive-only` on each (chrome carriers only — LeftRail checkmark slots + Breadcrumb prev/next + interactive-mode badge). Lectures-only scope per spec Step 2 satisfied. |
| **AC6** — All 37 prerendered pages still build (`npm run build` exit 0) | ✅ PASS | Auditor `npm run build` from scratch: 37 pages prerendered, server built in 8.68s, exit 0. `find dist/client -name "index.html" \| wc -l` = 37. Reproduces Builder's number byte-for-byte. |

**AC totals:** 5 PASS / 0 FAIL / 0 PARTIAL / 3 DEFER (the 3 DEFER are AC1, AC2, AC3 — all browser-driven manual smokes that require an interactive harness this audit environment doesn't have). Carry-over: none (T6 spec has no `## Carry-over from prior audits` section — verified by `grep -c 'Carry-over'` = 0; prior issue files (T1/T2/T3/T4/T5) had no T6-targeted deferrals — verified above).

## 🔴 HIGH — manual-smoke gap on AC1/AC2/AC3 (browser-driven acceptance checks deferred)

**Finding (M-UX-T6-ISS-01).** Spec lines 46–54 list three browser-driven manual smokes as auditor-owned acceptance checks: (AC1) `/DSA/lectures/ch_4/` in `npm run dev` interactive mode with DOM-position observation cited, (AC2) end-to-end round-trip select → annotate → reload → persist, (AC3) `npm run preview` static-mode invisibility. Spec line 38 ALSO requires the Builder to run option (i) at 1280px AND 375px `npm run dev` widths to validate the test-then-decide call before locking option (i) in. Neither the Builder nor this audit ran any of these. CLAUDE.md "Content vs code verification standards differ — and code is stricter" rule says: "Build success is not evidence of runtime correctness for code... 'Compiles / type-checks / exits 0' is not the same as 'works.' Inferential claims about runtime behaviour from build success alone are a HIGH finding."

The structural evidence (script tag byte-identical, DOM-order verified by byte offsets, M3 contracts preserved, gating mechanism unchanged from T1–T5 verified surface) is unusually strong for a re-home task — the AnnotationsPane behaviour delta is provably zero in the script tag, the mount-point change is purely declarative, and the M3 components themselves were already manually-smoked in M3 T6 + T7 audits. So this is a "thin" HIGH (the inferential confidence is high), but it is a HIGH per the CLAUDE.md rule and the spec's explicit ask.

**Action / Recommendation.** Two paths:

1. **(Preferred)** User runs `npm run dev` locally, navigates `/DSA/lectures/ch_4/`, observes (1) annotations pane in right rail below TOC + read-status, (2) mark-read button visible bottom-left and clickable, (3) selecting text in `<article>` makes the floating annotate button appear next to the selection, (4) round-trip — clicks annotate, sees the annotation land in the right-rail pane, reloads, sees it persist. Then `npm run preview`, navigates same URL, observes (5) annotations pane hidden, (6) mark-read button hidden, (7) no annotate button on selection, (8) page still reads cleanly. User reports back; this audit flips ISS-01 to ✅ RESOLVED 2026-MM-DD with the manual observation cited.

2. **(Alternative)** Defer the manual smoke to T7 (responsive sweep) which already requires running `npm run dev` at 1280, 1024, 768, 375 widths — T7 Builder folds the T6 acceptance checks into the same browser session. T8 (deploy verification) gates the public-mode invisibility with a real `npm run preview` smoke. This audit logs ISS-01 as **DEFERRED to T7** with a carry-over block appended to T7's spec (recommended path if user prefers not to break out a manual-smoke session).

If path 2 is chosen, propagation block to be appended to [`T7_mobile_drawer.md`](../tasks/T7_mobile_drawer.md) ## Carry-over from prior audits.

This audit takes path 2 — see Propagation status footer.

## 🟡 MEDIUM — wording drift on Done-when bullet 7 (option (i) vs "chapter content header")

**Finding (M-UX-T6-ISS-02).** Milestone README Done-when bullet 7 (line 25) reads `[x] **Mark-read button re-homed** to the chapter content header (or per-section, per T6's call), data-interactive-only preserved. (T6 issue file)`. The Builder ticked it after landing option (i) "keep M3's `position: fixed; bottom-left` floating". Option (i) is **not** "re-homed to the chapter content header" — the JSX import moved into the default slot above `<header>`, but the visual position is still bottom-left floating per the unchanged `position: fixed; bottom: 16px; left: 16px;` CSS in `MarkReadButton.astro:38-42`.

This is not a status-surface drift in the strict sense (the bullet IS flipped `[x]` per the four-surface rule), but the bullet text describes a state that did not literally occur. ADR-0002 line 111 has the same wording (`MarkReadButton to chapter content header`), but the spec's MUX-BO-DA-6 explicitly resolved this as a Builder-time choice — option (i) is spec-authorised.

**Two reasonable fixes** (presenting options per the "Present options for simple-fix issues" memory rule):

1. **Reword the bullet to reflect the resolution.** Change milestone README line 25 to: `[x] **Mark-read button re-homed** to its chrome slot (default slot, above article body — visual position keeps M3's floating bottom-left per spec MUX-BO-DA-6 option (i); position decision documented in T6 issue file), data-interactive-only preserved. (T6 issue file)`. Lighter-touch, accurate.

2. **Strip `position: fixed` and switch to option (ii).** Ship a header-positioned button. Heavier — requires an M3 component CSS edit (spec line 37 calls this "an M3 contract revision"). Should only land if option (i) has a real friction case the manual smoke surfaces. Until then, (1) is the cheaper fix.

**Action / Recommendation.** Pair with ISS-01's manual smoke: if the smoke confirms option (i) reads cleanly at 1280px + 375px, fold fix (1) into the same cycle (single-line edit on `m_ux_polish/README.md`). If smoke surfaces friction, raise the option (i) → (ii) migration as a separate finding. Owner: T6 follow-up commit OR T7 manual-smoke cycle (whichever lands first). Not blocking the audit verdict — bullet IS ticked, just imprecise.

## 🟡 MEDIUM — AnnotationsPane width unbounded inside right-rail track at very wide displays

**Finding (M-UX-T6-ISS-03).** AnnotationsPane CSS pre-rewrite had `width: 260px` (overlay-pinned). Post-rewrite, the pane has `max-height: 50vh` + `overflow-y: auto` for vertical bounding but **no width constraint** — it inherits from the `[data-slot="right-rail"]` track, which is `280px` at ≥1024px (per `Base.astro:163` `grid-template-columns: 260px 1fr 280px`). At 1024px+ the visible width is consistent with the prior overlay (~260–280px), so the row-snippet readability is preserved.

**However** — the `.snippet` row uses `flex: 1; overflow-wrap: anywhere;` (`AnnotationsPane.astro:106`), and the truncation in the script (`a.text.slice(0, 80) + '…'`, line 154) caps at 80 chars. With an aggressive `overflow-wrap: anywhere`, a long unbroken token in an annotation could wrap mid-character, but the rail width itself is fine. No layout overflow risk at the named breakpoints.

**Caveat for T7:** at <1024px (mobile single-column), the right rail likely collapses or moves to a `<details>` summary at content top per architecture.md §1.6 line 125. T7 (mobile drawer) owns that responsive transition — the AnnotationsPane needs to be tested in the mobile collapsed-rail state to confirm it still reads cleanly. Not a T6 blocker; a T7 carry-over candidate.

**Action / Recommendation.** Add to T7 spec's responsive-sweep checklist: "AnnotationsPane in collapsed mobile rail reads cleanly with `max-height: 50vh` + `overflow-y: auto`; long annotations truncate at 80 chars per the M3 script and don't break the `<details>` accordion." Propagation block appended to [`T7_mobile_drawer.md`](../tasks/T7_mobile_drawer.md) — see Propagation status footer.

## 🟢 LOW — AnnotateButton z-index parity with interactive-mode badge

**Finding (M-UX-T6-ISS-04).** AnnotateButton uses `z-index: 1000` (`AnnotateButton.astro:25`). The "interactive mode active" badge in `Base.astro:191` also uses `z-index: 1000`, and lives at `position: fixed; bottom: 8px; right: 8px;`. The badge is at the bottom-right; AnnotateButton appears next to a text selection (could be anywhere). At equal z-index, the later-painted element wins — the badge is rendered last in the DOM (it's the final child of `<body>`), so it would paint over AnnotateButton if they overlapped at the bottom-right corner.

In practice this is unlikely to overlap — AnnotateButton appears immediately below a text selection (`top: rect.bottom + scrollY + 6`), and the badge sits in the bottom-right corner. Selection at the very bottom-right of the viewport is rare. Not a T6 regression — both z-indices predate T6 — but flagged for visibility.

**Action / Recommendation.** No action required. If the user reports overlap during manual smoke, raise AnnotateButton's z-index to 1001 or scope the badge to a smaller rectangle. Not blocking; logged for awareness. T7 manual smoke is a natural place to spot this if it does overlap.

## 🟢 LOW — AnnotationsPane `border-top` competes with right-rail `border-left`

**Finding (M-UX-T6-ISS-05).** `Base.astro:171-173` puts `border-left: 1px solid var(--mux-border-subtle);` on the right-rail track at ≥1024px. AnnotationsPane now adds `border-top: 1px solid var(--mux-border-subtle);` (line 71) to separate itself from the TOC + ReadStatus stack above. The two borders meet at the top-left corner of the AnnotationsPane and form a small "L" — usually fine, but at certain DPI/zoom levels the two 1px lines can render slightly offset. Cosmetic only.

**Action / Recommendation.** No action required. If the user reports visual jaggies during manual smoke, switch AnnotationsPane to a `box-shadow: inset 0 1px 0 var(--mux-border-subtle);` instead of `border-top` to avoid the corner intersection. Not blocking. T7 mobile sweep + T8 deploy verification are natural moments to revisit.

## Additions beyond spec — audited and justified

**Audited:** the only diff outside the three named files is CHANGELOG.md (mandatory per the changelog discipline non-negotiable) and the four status surfaces (mandatory per the status-surface discipline non-negotiable). No drive-by additions. No `nice_to_have.md` adoption. No new components. No new dependencies. No M3 component API edits (verified by AC4 above).

The AnnotationsPane CSS rewrite is the only "addition" beyond the literal mount-site changes — and it is explicitly authorised by spec line 52 ("structural / positioning changes (e.g., outer wrapper class names)"). The new rules use existing `chrome.css` tokens (`--mux-space-2/3/4`, `--mux-border-subtle`, `--mux-fg-muted`, `--mux-fg-subtle`) — no new tokens introduced. Token consumption-chain stays clean.

The header docstring extensions on AnnotationsPane.astro (lines 13–42) and `lectures/[id].astro` (lines 23–64) are file-header documentation per CLAUDE.md "File headers" rule — every component-touching task gets a header note citing the task ID + relationships. Spec-aligned.

## Verification summary

Gate commands run from scratch by the auditor (did not trust Builder's `dist/client/`):

| Gate | Command | Result |
| ---- | ------- | ------ |
| G1: Build clean | `npm run build` | ✅ exit 0; 37 pages prerendered; server built in 8.68s |
| G2: Page count | `find dist/client -name "index.html" \| wc -l` | ✅ `37` |
| G3: Build size | `du -sb dist/client/` | ✅ `5173963` bytes (matches Builder; +3,972 vs post-T5 `5169991`; cumulative vs pre-M-UX `4420947` = +753,016 bytes — T8 owns the budget gate) |
| G4: AnnotateButton no diff | `git diff HEAD -- src/components/annotations/AnnotateButton.astro` | ✅ empty |
| G5: MarkReadButton no diff | `git diff HEAD -- src/components/read_status/MarkReadButton.astro` | ✅ empty |
| G6: AnnotationsPane diff = CSS + docstring only | `git diff HEAD -- src/components/annotations/AnnotationsPane.astro` | ✅ verified — only `---` frontmatter docstring + `<style>` block changes; no `<script>` block changes |
| G7: AnnotationsPane script tag byte-identical | extracted `<script>...</script>` from `git show HEAD:` and working tree, `diff` | ✅ `BYTE-IDENTICAL` (no diff output) |
| G8: lectures/[id].astro slot mounts changed | `git diff HEAD -- src/pages/lectures/'[id].astro'` | ✅ verified — `<AnnotationsPane>` moved to `right-rail` slot, `<MarkReadButton>` moved to default slot above `<header>`, `<AnnotateButton>` retained at default-slot tail; no behavioural changes |
| G9: notes/practice clean of M3 imports | `grep -n 'AnnotationsPane\|MarkReadButton\|AnnotateButton' src/pages/notes/'[id].astro' src/pages/practice/'[id].astro'` | ✅ no hits |
| G10: lectures/ch_4 surface counts | `grep -o 'mark-read-button\|annotate-button\|annotations-pane\|section-nav' dist/client/lectures/ch_4/index.html \| sort \| uniq -c` | ✅ 8× mark-read-button, 6× annotate-button, 7× annotations-pane, 0× section-nav (matches Builder; section-nav stays 0 from T4) |
| G11: lectures/ch_4 data-interactive-only count | `grep -o 'data-interactive-only' dist/client/lectures/ch_4/index.html \| wc -l` | ✅ `86` (unchanged from post-T5 / post-T4 baseline; matches Builder) |
| G12: notes/ch_4 + practice/ch_4 + index M3 surface counts | grep across all three | ✅ 0× M3 surfaces on each non-lectures route |
| G13: notes/practice/index data-interactive-only counts | grep | ✅ notes 14× / practice 14× / index 15× (chrome carriers only — LeftRail checkmark slots + Breadcrumb prev/next + interactive-mode badge + dashboard slots on index) |
| G14: right-rail DOM order on lectures/ch_4 | `grep -bo 'class="right-rail-toc\|id="annotations-pane\|id="cs300-toc-read-status\|data-scroll-spy' dist/client/lectures/ch_4/index.html` | ✅ TOC @ 536,936 → ScrollSpy @ 568,035 → ReadStatus @ 568,755 → AnnotationsPane @ 569,458 (TOC → ScrollSpy → ReadStatus → AnnotationsPane — matches Builder + ADR-0002 line 75) |
| G15: MarkReadButton DOM position above article | `grep -bo 'id="mark-read-button\|<article\|<header' dist/client/lectures/ch_4/index.html \| head -3` | ✅ `mark-read-button` @ 24,072 < first `<header>` @ 25,390 < first `<article>` @ 25,487 (button above article body per spec line 24) |
| G16: M3 contract — `cs300:read-status-changed` | `grep -rn 'cs300:read-status-changed' src/` | ✅ 1× dispatch (MarkReadButton:161) + 2× listeners (RightRailReadStatus:133, CompletionIndicator:171) — matches Builder |
| G17: M3 contract — `cs300:toc-read-status-painted` | `grep -rn 'cs300:toc-read-status-painted' src/` | ✅ 1× dispatch (RightRailReadStatus:121) + 1× listener (MarkReadButton:134) — matches Builder |
| G18: M3 contract — `cs300:annotation-added` | `grep -rn 'cs300:annotation-added' src/` | ✅ 1× dispatch (AnnotateButton:131) + 1× listener (AnnotationsPane:174) — matches Builder |
| G19: M3 contract — `[data-read-indicator][data-read="true"]` selector | `grep -rn 'data-read-indicator..data-read="true"' src/` | ✅ 1× read in MarkReadButton:84 — matches Builder |
| G20: BASE_URL hardcoding sweep on touched files | `grep -nE '/DSA/\|baseUrl\|BASE_URL' src/components/annotations/AnnotationsPane.astro src/pages/lectures/'[id].astro' src/components/read_status/MarkReadButton.astro` | ✅ no hits — no `/DSA/` hardcoding in T6 surface |
| G21: dep-manifest churn | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements.txt` | ✅ empty — no dep changes |
| G22: nice_to_have.md drive-by check | review of `nice_to_have.md` + diff | ✅ no fresh adoption — M-UX itself was promoted in the kickoff commit; T6 doesn't touch any deferred-parking-lot item |
| G23: status-surface (a) per-task spec | `grep -n '\*\*Status:\*\*' design_docs/milestones/m_ux_polish/tasks/T6_m3_rehome.md` | ✅ `**Status:** ✅ done 2026-04-25` |
| G24: status-surface (b) tasks/README | `grep -n 'T6 ' design_docs/milestones/m_ux_polish/tasks/README.md` | ✅ row reads `T6 ... ✅ done 2026-04-25` |
| G25: status-surface (c) milestone README task table | `grep -n 'T6 ' design_docs/milestones/m_ux_polish/README.md` | ✅ row reads `T6 ... ✅ done 2026-04-25` |
| G26: status-surface (d) Done-when bullets 6 + 7 | `grep -n 'Annotations pane re-homed\|Mark-read button re-homed' design_docs/milestones/m_ux_polish/README.md` | ✅ both flipped `[ ] → [x]` with `(T6 issue file)` parenthetical citations (lines 24, 25) |

**Smokes deliberately deferred** (the manual-browser smokes spec lines 46–54 require — see HIGH-1 above): AC1 (interactive-mode DOM observation at 1280 + 375 widths), AC2 (round-trip select → annotate → reload → persist), AC3 (static-mode invisibility on `npm run preview`).

## Issue log — cross-task follow-up

| ID | Severity | Title | Status | Owner / next touch point |
| -- | -------- | ----- | ------ | ----------------------- |
| M-UX-T6-ISS-01 | HIGH | Manual-smoke gap on AC1/AC2/AC3 (browser-driven acceptance checks) | ⚠️ DEFERRED to T7 | T7 (responsive sweep) — Builder folds T6 manual smokes into T7's `npm run dev` browser session at 1280/1024/768/375 widths, OR user runs them out-of-cycle |
| M-UX-T6-ISS-02 | MEDIUM | Done-when bullet 7 wording drift (option (i) vs "chapter content header") | ⚠️ OPEN | T6 follow-up commit (single-line edit on milestone README) OR T7 manual-smoke cycle |
| M-UX-T6-ISS-03 | MEDIUM | AnnotationsPane mobile-collapsed-rail behaviour untested | ⚠️ DEFERRED to T7 | T7 mobile-drawer responsive sweep — verify pane reads cleanly inside `<details>` at <1024px |
| M-UX-T6-ISS-04 | LOW | AnnotateButton z-index parity with interactive-mode badge | flag-only | T7 manual smoke catches if it overlaps; otherwise no action |
| M-UX-T6-ISS-05 | LOW | AnnotationsPane `border-top` ↔ right-rail `border-left` corner intersection | flag-only | T7 / T8 manual smoke catches if jaggies appear; otherwise no action |

**Override / disagreement with Builder report.** No factual override. Every Builder claim verified independently and reproduces byte-for-byte: `du -sb dist/client/` = `5173963`, page count `37`, surface counts (8× mark-read-button, 6× annotate-button, 7× annotations-pane, 0× section-nav, 86× data-interactive-only on lectures/ch_4; 0× M3 surfaces on notes/practice/index), DOM byte-offset order (TOC → ScrollSpy → ReadStatus → AnnotationsPane), M3 contract counts (1d+2L for read-status-changed, 1d+1L for toc-read-status-painted, 1d+1L for annotation-added, 1× selector read), AnnotationsPane script tag byte-identical to HEAD, MarkReadButton + AnnotateButton zero-diff. Builder's option (i) reasoning is sound and spec-authorised.

The HIGH (ISS-01) is a process finding, not a factual disagreement — the Builder explicitly self-disclosed the gap ("the two browser-driven manual ACs ... are the Auditor's cycle-1 manual smoke"), and the audit logs it as DEFERRED to T7 rather than blocking the audit verdict because (a) the structural evidence is unusually strong for a re-home task, (b) T7's responsive sweep is the natural home for the manual smoke, (c) the M3 components themselves were already manually-smoked in the M3 T6 + T7 audits and T6 leaves their behavioural surface byte-identical. Builder's structural-evidence reasoning is sound; the gap is in the auditor's procedure, not the Builder's implementation.

## Deferred to nice_to_have

None. T6 lands strictly inside its spec scope; no findings map to deferred-parking-lot items.

## Propagation status

**Propagation status:** ✅ COMPLETED 2026-04-25 by this audit.

`## Carry-over from prior audits` section appended to [`../tasks/T7_mobile_drawer.md`](../tasks/T7_mobile_drawer.md) with two entries:

- `M-UX-T6-ISS-01 (HIGH, DEFERRED from T6 cycle 1)` — instructs T7 Builder to run T6's three browser-driven acceptance smokes (interactive-mode DOM observation at 1280 + 375 widths, end-to-end round-trip, static-mode invisibility) inside the T7 `npm run dev` responsive session. Also pairs with M-UX-T6-ISS-02's wording-fix follow-up (reword Done-when bullet 7 to reflect option (i), OR strip `position: fixed` and switch to option (ii) if smoke surfaces friction).
- `M-UX-T6-ISS-03 (MEDIUM, DEFERRED from T6 cycle 1)` — instructs T7 Builder to verify AnnotationsPane reads cleanly inside the mobile collapsed-rail `<details>` at <1024px (long-annotation truncation, `max-height: 50vh` + `overflow-y: auto` interaction with the `<details>` accordion).

Both carry-over entries cite back to this issue file. T7 Builder reads them; on T7 close, the entries flip `[ ] → [x]` and on T7 audit re-flip ISS-01 + ISS-03 here from `DEFERRED` to `RESOLVED 2026-MM-DD`.

ISS-02 (MEDIUM, OPEN — wording-only) and ISS-04 + ISS-05 (LOW, flag-only) are not forward-deferred; they are recorded in this issue file for the next eyes that touch the milestone README or for T7/T8 manual-smoke incidental pickup.

## Security review

**Reviewed on:** 2026-04-25
**Reviewer:** security-reviewer subagent
**Verdict:** SHIP — zero Critical, zero High, zero Advisory.

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | AnnotationsPane CSS — no `expression()`/`url(...)`/`@import`/`javascript:` | CLEAN — `AnnotationsPane.astro` `<style>` block (lines 55–116): all values are `var(--mux-…)` token references, layout literals, or one hex colour `#dc2626` on `.delete-btn:110`. No `url()`, no `expression()`, no `@import`, no `@font-face`, no `javascript:`. Zero external resources introduced. |
| 2 | AnnotationsPane `<script>` byte-identity | CLEAN — Functional Auditor gate G7 verified `diff` of extracted `<script>` block between `git show HEAD:` and working tree returns empty. Source uses `document.getElementById`, `fetch(…encodeURIComponent…)`, `document.createElement`, `.textContent` — M3 baseline patterns intact. |
| 3 | `<style is:global>` scope discipline | CLEAN — `<style>` tag at line 55 carries no `is:global`. Astro auto-scopes. CSS rewrite did not change scoping; rules don't leak to siblings. |
| 4 | `lectures/[id].astro` — slot-mount only, no new SSR data flow | CLEAN — `getStaticPaths()` unchanged. `Astro.props` reads only `entry`. `sectionIds` derivation already existed pre-T6. No new `import.meta.env`, `Astro.glob`, `getCollection`, or SSR `fetch` introduced. |
| 5 | `data-interactive-only` count = 86 on lectures/ch_4 | CLEAN — Functional gate G11 confirmed unchanged from T4/T5 baseline. Three carriers in source: AnnotationsPane.astro:50 (aside root), MarkReadButton.astro:34 (button root, file unchanged), AnnotateButton.astro:20 (button root, file unchanged). |
| 6 | API endpoints unchanged + `encodeURIComponent` applied | CLEAN — `/api/annotations?section_id=${encodeURIComponent(id)}` (line 132); `/api/annotations/${a.id}` (line 161, server-issued id, no encode needed); `/api/read_status/${encodeURIComponent(currentSectionId)}` (MarkReadButton:150). No URL strings changed from M3. |
| 7 | No new `import.meta.env` access | CLEAN — Zero occurrences of `import.meta.env` in AnnotationsPane.astro or `[id].astro`. |
| 8 | No new external resource fetches | CLEAN — CSS block has zero `url()` calls, `@font-face`, `@import`, or CDN references. Tokens come from `chrome.css` (locally imported). |
| 9 | MarkReadButton zero-diff | CLEAN — `git diff HEAD -- src/components/read_status/MarkReadButton.astro` empty (functional gate G5). Direct read confirms M3/T4 baseline. |
| 10 | AnnotateButton zero-diff | CLEAN — `git diff HEAD` empty (functional gate G4). |

### Annotation rendering path — stored self-XSS check

`annotations.text` is user-authored free text. Render path at AnnotationsPane.astro:143–171 is DOM-API-only:
- `snippet.textContent = a.text.slice(0, 80) + '…'` (line 154) — `.textContent` HTML-encodes; stored XSS payload cannot execute.
- `del.textContent = '×'` (line 156) — static literal.
- `del.setAttribute('aria-label', 'Delete annotation')` (line 158) — static literal.
- `list.innerHTML = '<li class="empty">(none yet)</li>'` (line 148) — fully static trusted string, no user-controlled interpolation.

Zero `dangerouslySetInnerHTML`, `set:html`, `insertAdjacentHTML`, or HTML-string concatenation of user data. Stored self-XSS via annotation text not possible. Path is byte-identical to HEAD — T6 introduces no regression.

### Advisory

None.

### Verdict

**SHIP.** Ten checks PASS, zero advisories. T6's threat surface is clean: CSS rewrite adds no external resources, slot-mount changes add no SSR data flow, behavioural script byte-identical, annotation render path is `.textContent`-only, gating count unchanged, MarkReadButton/AnnotateButton zero-diff.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
