# T2 — Left-rail chapter nav + completion indicators — Audit Issues

**Source task:** [../tasks/T2_left_rail.md](../tasks/T2_left_rail.md)
**Audited on:** 2026-04-24
**Audit cycle:** 1 of up to 10 (first cycle — issue file created)
**Audit scope:** spec-vs-implementation re-verification of every T2 AC + the auditor smoke checks; design-drift re-check against [`design_docs/architecture.md`](../../../architecture.md) §1.6 (Page chrome — UX layer) and §4 (Local-vs-public mode); ADR-0002 §"Decision" + §"Open questions deferred"; T1 issue-file carry-over (M-UX-T1-ISS-01 deferral, M-UX-T1-ISS-03 token consumption); status-surface flips on all four surfaces; gate re-run by rebuilding from scratch (`npm run build` — auditor did not trust the Builder's `dist/client/`); BASE_URL discipline per MUX-BO-ISS-02 / DA-1 / DA3-A; `data-interactive-only` gating depth; M3 surface preservation; `cs300:read-status-changed` listener scoping (DA2-B, DA3-C); `nice_to_have.md` boundary. Fresh `npm run build` re-executed by the auditor reproduces the Builder's reported numbers exactly: `du -sb dist/client/` = `5219362`, page count `37`, 12 chapter `href`s in left-rail (`ch_1..6 + ch_7, ch_9..13`, no `ch_8`), 1 `aria-current="page"` per page mirroring the path, M3 surface counts (8× `mark-read-button`, 12× `section-nav`, 6× `annotations-pane`, 6× `annotate-button`) preserved.
**Status:** ✅ PASS

## Design-drift check

No drift detected. Cross-checked against:

- **architecture.md §1.6 (Page chrome — UX layer).** The architecture commitment "Per-chapter completion indicator (Canvas-style checkmark) in the left rail, derived from the `read_status` table" (line 129) — implemented. The "Chapter navigation grouped Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13)" commitment (lines 113–121 ASCII diagram) — implemented exactly. The "static-mode posture: Left rail … all SSR-rendered. Fully navigable without JS" commitment (line 135) — verified: the `<a class="chapter-link">` chapter links do NOT carry `data-interactive-only`; only the `<span class="checkmark-slot">` and the `#cs300-completion-indicator` island root do. Static-mode CSS rule (`body[data-mode="static"] [data-interactive-only] { display: none !important }`) hides the slots while leaving the rows + the `<a>` clickable.
- **architecture.md §3.4 (Reader state — read-status API contract).** `GET /api/read_status?chapter_id=…` (line 346) — confirmed reachable: [`src/pages/api/read_status/index.ts`](../../../../src/pages/api/read_status/index.ts) exposes the GET handler returning `{ section_ids: [...] }` per architecture.md §3.4. CompletionIndicator's fetch shape matches: `fetch(\`/api/read_status?chapter_id=${encodeURIComponent(chapterId)}\`)` and `body.section_ids` deserialisation — wire-compatible with the M3 endpoint. No new endpoint needed.
- **architecture.md §4 (Local-vs-public mode).** `data-interactive-only` is the architecture-mandated gating mechanism (M3 T5 contract). T2 adds 12 new `data-interactive-only` carriers (the per-chapter `.checkmark-slot` spans) + 1 island root. In static mode the `/api/read_status` fetch fails (no state service on GH Pages), the island swallows the error per CompletionIndicator.astro line 135 (`catch { paintSlot(chapterId, false) }`), and the slots are hidden by the global rule anyway. Graceful degradation verified by structure.
- **ADR-0002.** "Left rail — sticky on desktop, drawer on mobile. Chapter list grouped: 'Required' (ch_1–ch_6) and 'Optional' (ch_7, ch_9–ch_13). Current chapter highlighted. Per-chapter completion indicator (Canvas-inspired checkmark) gated via `data-interactive-only` (M3 T5 contract) — derived from `read_status` table; 'fully read' vs 'X of Y sections' is M-UX T2's call." — every commitment fulfilled. Per-section completion rule: T2 chose **(a) all sections marked**, the strict rule from spec Notes — recorded both in the source file ([`CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro) lines 9–13) and in this issue file.
- **`nice_to_have.md` boundary.** No silent adoption of dark mode / search / typography sweep / animation work. T2 uses only the chrome.css tokens introduced by T1, plus the existing M3 accent palette. No new deps.
- **CLAUDE.md cross-chapter ref discipline.** All 12 chapter ids in the rendered nav match the cs-300 chapter map (`ch_1..ch_7, ch_9..ch_13` — no `ch_8`, which has never existed). Extracted from `dist/client/lectures/ch_4/index.html`'s data-chapter-id attributes: `{ch_1, ch_2, ch_3, ch_4, ch_5, ch_6, ch_7, ch_9, ch_10, ch_11, ch_12, ch_13}` — exactly the 12 chapters in `scripts/chapters.json`. Sort key `n` (chapter number) gives correct ordering: `ch_9` precedes `ch_10` (lexicographic would invert).
- **Dependencies.** `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` returns empty. CHANGELOG records `Dep audit: skipped — no manifest changes` — correct.
- **Status-surface discipline (all four).**
  - (a) Per-task spec status: `**Status:** ✅ done 2026-04-24` ([T2_left_rail.md](../tasks/T2_left_rail.md) line 3) ✅
  - (b) `tasks/README.md` row: `T2 ... ✅ done 2026-04-24` ✅
  - (c) Milestone README task table: `T2 ... ✅ done 2026-04-24` ✅
  - (d) Done-when bullets: bullet 2 (left-rail chapter nav) flipped `[x]` with `(T2 issue file)` citation; bullet 3 (per-chapter completion indicators) flipped `[x]` with `(T2 issue file)` citation. Bullet 1 (three-column desktop layout) intentionally left `[ ]` — T1 + T2 land left rail + center; T4 must also land before that bullet's "renders cleanly on every chapter route" predicate is fully satisfied (right-rail TOC still empty). Builder's call is consistent with M-UX-T1-ISS-01's deferral guidance to T4.

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| **Spec deliverable 1** — `LeftRail.astro` SSR component reading `scripts/chapters.json`, grouped Required/Optional, current-chapter highlighting via `Astro.url.pathname` | ✅ PASS | [`LeftRail.astro`](../../../../src/components/chrome/LeftRail.astro) lines 42–53: imports `scripts/chapters.json`, sorts by `n`, partitions on `c.required`. Lines 59–61: regex matches `Astro.url.pathname` against `\/(lectures\|notes\|practice)\/(ch_\d+)\/?$` to extract the current chapter id. Lines 88, 109: `aria-current={c.id === currentChapterId ? 'page' : undefined}` applied. Built artefact verified: `aria-current="page"` lands on the matching href on every page (12 lecture pages spot-checked + notes/ch_4 + practice/ch_4 mirror correctly). |
| **Spec deliverable 2** — `CompletionIndicator.astro` JS island, `client:visible` directive, fetches `GET /api/read_status?chapter_id=…` per chapter, populates checkmark slots, `data-interactive-only` so it hides in static mode | ⚠️ PARTIAL → ACCEPTED | Endpoint contract correct: [`CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro) line 124–125 fetches `/api/read_status?chapter_id=${encodeURIComponent(chapterId)}` — wire-compatible with [`api/read_status/index.ts`](../../../../src/pages/api/read_status/index.ts) GET handler. `data-interactive-only` carried on (i) the 12 `.checkmark-slot` spans inside `LeftRail.astro` lines 93, 113 and (ii) the island root `<div id="cs300-completion-indicator">` line 75 — both hide in static mode. Rule (a) "all sections marked" implemented at line 133. **Deviation from spec wording:** spec step 3 mandates `client:visible` directive ("JS island with `client:visible` directive (don't load the script until the rail is visible)"). The implementation instead uses an inline `<script>` inside the .astro component (line 80) — Astro emits this as an inline `<script type="module">` that runs at page-parse time, not on visibility. This is functionally equivalent for a left-rail island that is in the initial viewport at desktop widths, and the inline-script pattern is the same one M3's `MarkReadButton`, `SectionNav`, `AnnotateButton`, `AnnotationsPane` use — the project precedent. Static-mode cost is one `<script type="module">` block per page that exits early when `/api/read_status` is unreachable; no perf regression at the M-UX scale (12 chapters). **Adjudication:** ACCEPTED as spec deviation rather than a finding — Builder's choice is consistent with M3 island patterns and the spec's own deferred IO ("Don't fetch read_status one chapter at a time per page load. ... if it becomes a perf concern (it won't at 12 chapters) the read_status API gets a 'list-all' variant in a follow-on" — Notes). Logged below as MEDIUM-1 because the spec wording explicitly says `client:visible`; the Builder should either follow the directive or get spec amendment. Surfaced for visibility, not blocking. |
| **Spec deliverable 3** — Wire `LeftRail` into `Base.astro` `left-rail` slot from T1; lectures, notes, practice all show same rail | ✅ PASS | All three chapter routes mount `<LeftRail slot="left-rail" />`: [`lectures/[id].astro`](../../../../src/pages/lectures/[id].astro) line 37, [`notes/[id].astro`](../../../../src/pages/notes/[id].astro) line 29, [`practice/[id].astro`](../../../../src/pages/practice/[id].astro) line 31. Built artefacts confirm rail renders on all three: `aria-current="page"` lands on `/DSA/lectures/ch_4/` regardless of which collection the user is viewing — chapter slug is shared per spec. |
| **Spec deliverable 4** — Per-chapter link points at the appropriate collection (lectures by default; T3's collection switcher lets the user change collection — but the chapter slug is shared) | ✅ PASS | Every chapter link's `href` is `${baseUrl}/lectures/${c.id}/` — lectures by default per spec. Verified via grep on built notes/ch_4 + practice/ch_4 pages: rail still points at `/DSA/lectures/ch_*/` everywhere. T3 will add the collection switcher in the breadcrumb. |
| **Acceptance check 1** — `LeftRail.astro` exists and renders in `Base.astro` `left-rail` slot | ✅ PASS | File exists (203 lines, 5538 bytes). Built HTML: `<aside data-slot="left-rail" aria-label="Chapter navigation"> <nav class="left-rail" aria-label="Chapter navigation">` — the rail's `<nav>` mounts inside Base's `<aside>` slot. |
| **Acceptance check 2** — Reads `scripts/chapters.json`, partitions Required vs Optional with correct counts (Required=6, Optional=6 — ch_7, ch_9–ch_13) | ✅ PASS | Python-extracted from built ch_4: `Required: ['ch_1','ch_2','ch_3','ch_4','ch_5','ch_6']` (6 chapters); `Optional: ['ch_7','ch_9','ch_10','ch_11','ch_12','ch_13']` (6 chapters). Order is by `n` field — `ch_9` correctly precedes `ch_10`/`ch_11`/`ch_12`/`ch_13`. No `ch_8` (matches cs-300 chapter map). |
| **Acceptance check 3** — Auditor opens `/DSA/lectures/ch_1/` in `npm run preview`, confirms Required group lists ch_1–ch_6 with ch_1 highlighted | ⚠️ DEFER (auditor-driven, browser-required) | Auditor cannot DevTools-inspect from this shell. Non-inferential evidence: built artefact `dist/client/lectures/ch_1/index.html` carries `<a href="/DSA/lectures/ch_1/" aria-current="page" class="chapter-link is-current">` — the SSR markup correctly tags ch_1 as current on that page. Same evidence for all 12 chapter pages spot-checked: `for chapter in ch_1 ch_2 ... ch_13; do grep aria-current="page" lectures/$chapter/index.html` returns 1 hit per page on the matching href. Sufficient at T2 maturity; T8 owns the integrated browser smoke. |
| **Acceptance check 4** — BASE_URL convention: `grep -nE '/DSA/' LeftRail.astro` returns no hardcoded HTML href / template-literal hrefs (only doc/comment matches OK per DA3-A) | ✅ PASS | `grep -nE '/DSA/' src/components/chrome/LeftRail.astro` returns 2 hits: line 28 (`'\`/DSA/\`...never hardcode'` doc comment) and line 56 (`/DSA/{collection}/{chapter-id}/` doc comment in the path-regex header). Both are inside `//` doc-comment lines — legitimate per the DA3-A reviewer-eyes policy: a non-empty grep is not auto-fail; the auditor reads each match. View-source on built ch_4 page resolves the BASE_URL: `<a href="/DSA/lectures/ch_4/">` etc. — SSR resolution of `${import.meta.env.BASE_URL}` is fine; only source-code hardcoding of the literal in `href`/`action`/`src` attribute or template-literal hrefs is the regression class HIGH-2 was meant to prevent. Source uses `` `${baseUrl}/lectures/${c.id}/` `` per LeftRail.astro lines 88, 108 — correct. |
| **Acceptance check 5** — Auditor opens `/DSA/lectures/ch_9/`, confirms Optional group lists ch_7 + ch_9–ch_13 with ch_9 highlighted | ✅ PASS (non-browser equivalent) | `grep aria-current="page"` on `dist/client/lectures/ch_9/index.html` returns `href="/DSA/lectures/ch_9/" aria-current="page"`. The Optional `<section>` block in the same file contains `data-chapter-id="ch_7"` followed by `ch_9`, `ch_10`, `ch_11`, `ch_12`, `ch_13` in that order. Identical at T8's browser smoke. |
| **Acceptance check 6** — `CompletionIndicator.astro` carries `data-interactive-only`. Confirm in static mode the checkmark slot is hidden — list items still visible, no broken JS | ✅ PASS | Built ch_4 page has 19 `data-interactive-only` hits: 6 from M3 (mark-read-button, annotate-button, annotations-pane, interactive-mode badge — pre-existing per T1 issue file) + 12 from `.checkmark-slot` spans (one per chapter row) + 1 from the `<div id="cs300-completion-indicator">` island root. Critical gating-level check: the `<a class="chapter-link">` does NOT carry `data-interactive-only`; only the inner `<span class="checkmark-slot">` does. CSS rule `body[data-mode="static"] [data-interactive-only] { display: none !important }` therefore hides only the spans — the chapter-link rows stay visible. Static-mode navigation works without JS. |
| **Acceptance check 7** — Auditor runs `npm run dev`, marks one section read, reloads, sees chapter checkmark in rail (rule cited in audit issue file) | ⚠️ DEFER (auditor-driven, browser-required) | Same deferral rationale as AC 3 — the auditor environment has no live state service to mark sections against. **Rule chosen: (a) all sections marked.** Documented in `CompletionIndicator.astro` lines 9–13 (Builder's choice + comment). On reload after marking 1 section, the indicator does NOT light up unless every section in the chapter is marked — strict rule per spec Notes "Initial proposal: (a)". If never triggered in practice, T2 follow-on switches to the X-of-Y progress fraction. |
| **Acceptance check 8** — Live listener refresh: in `/DSA/lectures/ch_4/`, mark ch_4's last unmarked section, observe ch_4's left-rail checkmark refresh without reload (sub-second on localhost; "few seconds" hard upper bound per DA3-C) | ⚠️ DEFER (auditor-driven, browser-required) | Same deferral rationale as AC 3. **Static analysis confirms wiring is correct:** [`CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro) lines 168–172: `window.addEventListener('cs300:read-status-changed', () => { if (currentChapterId) { void refreshChapter(currentChapterId); } })`. Scoping verified: the listener calls `refreshChapter(currentChapterId)` — single-chapter fetch, NOT `Promise.all(chapterIds.map(refreshChapter))` (which would be the wasteful all-12-chapter sweep). Current chapter is read from `root.dataset.currentChapterId` (line 107) which is SSR-populated by `LeftRail.astro` line 125. On non-chapter pages, `currentChapterId` is `null` and the listener is a no-op (legal — no chapter is being actively read). Event match verified against `MarkReadButton.astro` line 111: `dispatchEvent(new CustomEvent('cs300:read-status-changed'))` — same event name, no detail payload required. Cross-component symmetry with `SectionNav.astro` line 88 (subscribes to same event for live dot refresh) — matches the spec's "Cross-reference: T4's TOC indicator subscribes to the same event" expectation. |
| **Acceptance check 9** — All 37 prerendered pages still build (`npm run build` exit 0) | ✅ PASS | Auditor re-ran `npm run build` from scratch this cycle. Output: "Server built in 8.54s. Complete!" — no warnings, no errors, exit 0. `find dist/client -name '*.html' \| wc -l` = 37. Same page count as T1. |
| **Carry-over from T1: M-UX-T1-ISS-01** — Done-when bullet 1 partial-satisfaction (T2 + T4 second-lander flips with parenthetical citation) | ✅ DEFERRED to T4 (correct call) | T2 alone does not satisfy bullet 1 ("Three-column desktop layout … renders cleanly on every chapter route") because T4's right-rail TOC still has not landed — the right rail is empty until T4. Builder left bullet 1 `[ ]` and flagged in CHANGELOG that T4 owns the flip with `(T1 + T2 + T4 issue files)` citation. Reasoning sound. Re-deferred to T4 below. |
| **Carry-over from T1: M-UX-T1-ISS-03** — Three unconsumed `chrome.css` tokens (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) | ✅ RESOLVED 2026-04-24 | Verified by grep: `--mux-fg-muted` consumed by `LeftRail.astro` line 168 (chapter-link default colour); `--mux-fg-subtle` consumed by line 145 (group-heading colour); `--mux-surface-alt` consumed by line 174 (chapter-link hover background). All three tokens now have at least one consumer. T1's LOW finding closes here. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — `client:visible` directive not used; component is an inline-`<script>` island

**Surface:** [`src/components/chrome/CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro). T2 spec step 3 explicitly states: "JS island with `client:visible` directive (don't load the script until the rail is visible)." The implementation does not use any Astro client directive — instead the script is an inline `<script>` block at the bottom of the `.astro` file (line 80), which Astro emits as a `<script type="module">` that runs at page-parse time on every chapter route.

**Severity rationale:** MEDIUM, not HIGH — the Builder's choice is internally consistent with the project's existing M3 island pattern (`MarkReadButton`, `SectionNav`, `AnnotateButton`, `AnnotationsPane` all use the same inline-script pattern, not a framework component with a client directive). At the M-UX scale (12 chapters, fetch fails fast in static mode), the perf cost is negligible. But the spec specifically called out `client:visible`, which would have required restructuring `CompletionIndicator.astro` as a framework component (React/Preact/Vue/Svelte) — a path the project has explicitly avoided in M3. The deviation is a documentation drift, not a runtime regression. Surfacing as MEDIUM so future audits can see the spec-vs-implementation gap.

**Action / Recommendation:** Two reasonable directions, presented as options per CLAUDE.md "Present options for simple-fix issues":
1. **Spec amendment (recommended).** Strike "with `client:visible` directive (don't load the script until the rail is visible)" from T2 spec step 3 and replace with "as an inline `<script type="module">` matching the M3 island pattern" — aligns the spec with the project's settled M3 convention. T2 can keep `Status: ✅ done`.
2. **Implementation rework.** Convert `CompletionIndicator.astro` to a framework component (React/Preact) with a `client:visible` directive. Adds a runtime dep + bundle weight. Not justified at the cs-300 scale.

**Owner:** T2 carry-over — Builder picks option 1 if user agrees; otherwise raise to user. No code change required for the audit verdict; logged for awareness.

### MEDIUM-2 — SSR-embedded section-id JSON adds ~444 KB to `dist/client/` size; T8 budget at risk

**Surface:** [`src/components/chrome/CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro) lines 67–72 + `LeftRail.astro` lines 71–78. The component embeds the per-chapter section-id list as a `<script type="application/json" id="cs300-completion-indicator-data">` payload on every page. Payload size on `dist/client/lectures/ch_4/index.html` measured at `12,271 bytes` (Python-extracted from the built file). 37 pages × ~12 KB = ~444 KB raw — the dominant component of the +666 KB `dist/client/` delta vs post-T1 (`5219362 - 4537978 = 681384` bytes). Plus the inline TypeScript `<script type="module">` for the island logic (which Astro inlines per page).

**Severity rationale:** MEDIUM, not HIGH — T8's `<50KB` total `dist/client/` size budget (per [`T8_deploy_verification.md`](../tasks/T8_deploy_verification.md) line 60, line 108) is now at +780 KB cumulative delta (T1 +117 KB + T2 +664 KB), well over the alarm threshold. T2 spec does not own the budget gate (T8 does), but T2's design choice is the major driver. Builder explicitly surfaced this in the CHANGELOG entry: "if T8's budget evaluation flags it as over-budget, a follow-on can move the payload to a single `/api/sections` fetch." The spec's Notes section already anticipates the per-chapter API churn ("if it becomes a perf concern (it won't at 12 chapters)…") but anticipates *runtime* perf, not *bundle size*. The size cost is per-page replication — every prerendered page carries the full 12-chapter section map even though most pages only need one chapter's list (or none, on index/non-chapter routes — though T2 doesn't ship to those today).

**Action / Recommendation:** Two reasonable directions:
1. **Defer evaluation to T8 (recommended at this maturity).** T8 owns the formal budget gate. T2 close is correct; T8's auditor measures the integrated delta after all 8 tasks land. If over-budget at T8, a follow-on Builder moves the section-id list to a single `/api/sections` GET (architecture.md §3.4 already exposes section data structure — adding a list-all endpoint is small) and the island fetches it once instead of embedding per page. Saves ~444 KB at the cost of one extra round-trip.
2. **Refactor now.** Same fix applied during T2 cycle. Trades budget headroom for one cycle of churn — not worth it if T8 might decline.

**Owner:** T8 (deploy verification). Auditor logs MUX-T2-ISS-02 here for T8's auditor to pick up. Not blocking T2 close.

## 🟢 LOW

### LOW-1 — Spec step 3 mentions `client:visible` directive; implementation deviation is correct but spec drift is real

(Companion to MEDIUM-1 — same surface, lower-severity restatement.) The spec wording was written with a framework-component island in mind (Preact/React island with `client:visible`). The project's settled pattern is inline-script `.astro` islands. The spec's own examples elsewhere (T4 spec step 4, T7 spec) similarly call for framework directives the implementation will not actually use. This is a recurring spec-vs-implementation drift across the M-UX milestone, not a T2-specific bug.

**Action / Recommendation:** Same as MEDIUM-1 option 1 — strike `client:visible` wording from T2 spec step 3 (and consider a sweep of T4/T7 specs while at it). Owner: T4 Builder when it lands, or T8's auditor as a doc-cleanup pass. Logged here for visibility; not blocking.

### LOW-2 — `getCollection('lectures')` synchronous-await in SSR component adds build-time cost

**Surface:** [`LeftRail.astro`](../../../../src/components/chrome/LeftRail.astro) line 71: `const lectures = await getCollection('lectures');` runs once per page render at build time. With 37 pages × one collection load per page, this is 37 redundant collection scans in a single build. Astro likely caches the result internally (the build still completes in ~9 seconds), so the practical cost is negligible. Flagging only for completeness — if T8's auditor measures build time and sees a regression, this is the lever.

**Severity rationale:** LOW — measured build time is fine. Astro's content collection cache absorbs the redundancy.

**Action / Recommendation:** No change. If a future task touches this code path, consider passing the section-id map down from the route as a prop instead of reloading the collection inside the chrome component. T8 confirms build time is unchanged; otherwise nothing to do.

## Additions beyond spec — audited and justified

- **`<span class="chapter-label">` wrapping the chapter title.** Not required by spec, but a clean affordance for the flex layout (label flex:1 + checkmark fixed width). Justified — keeps the chapter row visually consistent across all 12 entries.
- **`overflow-wrap: anywhere` on `.chapter-label`.** Defensive against long subtitles on the 260px rail (e.g. ch_10 "Graphs: BFS, DFS, shortest paths"). No spec mention but no scope creep — pure layout hygiene.
- **`min-width: 1.25em` on `.checkmark-slot`.** Reserves the inline space so the interactive-mode checkmark doesn't reflow chapter labels on mount. Justified — prevents layout jitter when the indicator paints.
- **`box-shadow: inset 3px 0 0 var(--mux-accent)` on `.is-current`.** Adds a left accent bar to the current-chapter highlight. Spec step 4 says "current-chapter background distinct from hover" — Builder added background + bar. Background is sufficient per spec; the bar is additive but consistent with Canvas LMS visual idiom (per ADR-0002 "Canvas-style"). Justified.
- **`<script type="application/json">` SSR data embed pattern.** Not specified by T2 — the spec assumed a `client:visible` framework island that would receive the section map as a prop. Builder chose inline-script + JSON-payload pattern instead (consistent with M3). Surfaced as MEDIUM-1 / MEDIUM-2 above; not justified silently — but the deviation is internally consistent and the trade-off is documented.

No invented scope. No drive-by refactors. No `nice_to_have.md` adoption. No new dependencies.

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| Full project build from scratch | `npm run build` | ✅ clean — prebuild + astro build both exit 0; 37 pages rendered; "Server built in 8.54s"; no warnings |
| Page count | `find dist/client -name '*.html' \| wc -l` | ✅ 37 |
| 12 chapter links present in left-rail | `grep -oE 'class="chapter-link[^"]*"' lectures/ch_4/index.html \| wc -l` | ✅ 12 |
| Required group has correct chapters in correct order | Python regex extraction | ✅ `['ch_1','ch_2','ch_3','ch_4','ch_5','ch_6']` |
| Optional group has correct chapters in correct order | Python regex extraction | ✅ `['ch_7','ch_9','ch_10','ch_11','ch_12','ch_13']` (no ch_8) |
| Chapter ordering — `n` field sort key (ch_9 before ch_10) | Built-HTML inspection | ✅ ch_9 precedes ch_10 |
| `aria-current="page"` lands on current chapter | `grep -oE 'href="..." aria-current="page"' lectures/ch_*/index.html` (12 chapters) | ✅ each page tags exactly its own chapter — `ch_1` → `/DSA/lectures/ch_1/`, …, `ch_13` → `/DSA/lectures/ch_13/` |
| Notes/practice routes mirror current-chapter | `grep aria-current="page" notes/ch_4/index.html practice/ch_4/index.html` | ✅ both show `href="/DSA/lectures/ch_4/" aria-current="page"` |
| 12 `.checkmark-slot` spans + 1 island root in built ch_4 | `grep -c 'class="checkmark-slot"'` + `grep -c 'id="cs300-completion-indicator"'` | ✅ 12 + 1 |
| `data-interactive-only` count (6 M3 + 12 slots + 1 island root) | `grep -oE 'data-interactive-only' \| wc -l` | ✅ 19 |
| Chapter `<a>` links do NOT carry `data-interactive-only` (static-mode navigation must work) | Source inspection | ✅ only `.checkmark-slot` and island root carry the attribute; chapter rows visible without JS |
| BASE_URL discipline — no hardcoded `/DSA/` in source href/template | `grep -nE '/DSA/' LeftRail.astro CompletionIndicator.astro` + reviewer-eyes | ✅ 2 hits in LeftRail.astro lines 28, 56 — both inside `//` doc comments per DA3-A reviewer-eyes; no real source-code hardcoding |
| Index.astro untouched | `git diff HEAD -- src/pages/index.astro` | ✅ empty |
| Index page does not mount LeftRail | `grep -c 'chapter-link\|checkmark-slot' dist/client/index.html` | ✅ 0 |
| M3 surfaces preserved exactly | `grep -oE 'mark-read-button\|section-nav\|annotations-pane\|annotate-button' lectures/ch_4/index.html \| sort \| uniq -c` | ✅ 6 / 12 / 6 / 8 — matches T1 issue file's pre-T2 baseline counts |
| `<article>` wrapper preserved on all three routes | `grep -c '<article' lectures/ch_4/ notes/ch_4/ practice/ch_4/index.html` | ✅ 1 / 1 / 1 |
| `<body data-mode="static">` SSR default preserved | `grep -c 'data-mode="static"' lectures/ch_4/index.html` | ✅ 1 |
| `cs300:read-status-changed` listener wired (count = 2: MarkReadButton dispatches, CompletionIndicator+SectionNav listen) | `grep -c 'cs300:read-status-changed' lectures/ch_4/index.html` | ✅ at least 2 occurrences (1 dispatcher + at least 1 listener; verified via `grep -o 'addEventListener("cs300:read-status-changed"'` returns 2 hits — CompletionIndicator + SectionNav) |
| Listener scoping correct (current chapter only on event) | Static analysis: line 168–172 calls `refreshChapter(currentChapterId)`, NOT all 12 | ✅ scoped |
| API endpoint contract — `GET /api/read_status?chapter_id=…` exists | `ls src/pages/api/read_status/index.ts` + read | ✅ M3 endpoint reachable, `{ section_ids: [...] }` shape matches CompletionIndicator's deserialisation |
| `dist/client/` size delta vs T1 baseline | `du -sb dist/client/` post-T2 minus post-T1 | ⚠️ +681,384 bytes (~666 KB; primarily the 37×12KB SSR-embedded section-id JSON; over T8's <50 KB alarm threshold cumulative; surfaced as MEDIUM-2 for T8) |
| Manifest unchanged | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` | ✅ empty |
| Status surface (a) per-task | `sed -n '3p' T2_left_rail.md` | ✅ `**Status:** ✅ done 2026-04-24` |
| Status surface (b) tasks/README | `git diff` | ✅ T2 row flipped `todo → ✅ done 2026-04-24` |
| Status surface (c) milestone README | `git diff` | ✅ T2 task-table row flipped `todo → ✅ done 2026-04-24` |
| Status surface (d) Done-when bullets | `git diff` | ✅ bullet 2 + bullet 3 flipped `[ ] → [x] (T2 issue file)`; bullet 1 left `[ ]` for T4 (correct deferral per M-UX-T1-ISS-01) |
| T1 carry-over M-UX-T1-ISS-03 (chrome.css token consumption) | source inspection | ✅ all three tokens consumed by LeftRail.astro |
| Net new JS bundle | `ls dist/client/_astro/ 2>&1` | ✅ no `_astro/` directory; islands are inline `<script type="module">` per page (matches M3 pattern) |

## Issue log

| ID | Severity | Description | Status | Owner / next touch |
| -- | -------- | ----------- | ------ | ------------------ |
| M-UX-T2-ISS-01 | MEDIUM | `client:visible` directive in spec but implementation uses inline-`<script>` island per M3 convention | OPEN — spec amendment recommended (option 1) | T4 Builder (sweep T2/T4/T7 specs to align with M3 island pattern), or user adjudication if Builder proposes implementation rework |
| M-UX-T2-ISS-02 | MEDIUM | SSR-embedded section-id JSON adds ~444 KB to `dist/client/` (12 KB × 37 pages); cumulative `dist/client/` delta ~780 KB vs pre-M-UX baseline, over T8's `<50KB` alarm threshold | DEFERRED to T8 | T8 auditor measures + adjudicates; if over-budget at T8, follow-on Builder switches to single `/api/sections` fetch |
| M-UX-T2-ISS-03 | LOW | Spec step 3 wording (`client:visible`) drifts from M3 settled inline-script pattern; recurring across T2/T4/T7 specs | OPEN | Doc-cleanup sweep — T4 Builder or T8 auditor |
| M-UX-T2-ISS-04 | LOW | `getCollection('lectures')` redundant per-page in chrome component | OPEN — flag-only | If T8 measures build-time regression, refactor to prop-passing; otherwise no action |
| M-UX-T1-ISS-01 (carry-over) | MEDIUM | Done-when bullet 1 (three-column layout renders cleanly) — T2 alone insufficient (right rail still empty) | DEFERRED to T4 | T4 Builder flips bullet 1 with `(T1 + T2 + T4 issue files)` parenthetical citation |
| M-UX-T1-ISS-03 (carry-over) | LOW | 3 unconsumed `chrome.css` tokens | ✅ RESOLVED 2026-04-24 | N/A — `--mux-fg-muted` + `--mux-fg-subtle` + `--mux-surface-alt` all consumed by LeftRail.astro |

## Deferred to nice_to_have

N/A. No findings map to `nice_to_have.md`. The four entries currently parked there (visual style sweep, search, dark mode, animation discipline) are explicitly out of scope for M-UX per ADR-0002 "Open questions deferred"; T2 did not silently adopt any of them.

## Propagation status

**M-UX-T2-ISS-01 (MEDIUM, OPEN — spec amendment recommended).** Carry-over target: T4. The recurring `client:visible` spec-vs-M3-pattern drift affects T2 (CompletionIndicator), T4 (scroll-spy island), and T7 (drawer). Rather than appending three separate carry-over entries (one per spec), this is recorded as a single sweep item against T4 — the next Builder to land an island has the strongest incentive to align the wording. **Carry-over block appended to** [`T4_right_rail_toc.md`](../tasks/T4_right_rail_toc.md) (this propagation step performed by this audit; see footer entry below).

**M-UX-T2-ISS-02 (MEDIUM, DEFERRED to T8).** Target: T8's deploy-verification audit is the natural home — T8 already owns the `<50KB` budget gate per its spec line 60 + line 108. **Carry-over block appended to** [`T8_deploy_verification.md`](../tasks/T8_deploy_verification.md) (this propagation step performed by this audit; see footer entry below).

**M-UX-T2-ISS-03 (LOW, OPEN).** Companion to ISS-01 — same target (T4). Rolled into the ISS-01 carry-over entry on T4 to avoid duplication.

**M-UX-T2-ISS-04 (LOW, OPEN).** Flag-only; no carry-over block created. If T8 measures build-time regression, T8 picks it up incidentally.

**M-UX-T1-ISS-01 (MEDIUM, re-deferred from T1 audit).** Target: T4 — same target as before. The T1 audit deliberately did not append a carry-over block to T2 or T4 (per its Propagation status footer line 152: "the four DA3-A..D carry-over items were already resolved by T1's Builder this cycle"). T2 did not flip bullet 1 (correctly — T2 alone insufficient). **This audit appends the carry-over block to** [`T4_right_rail_toc.md`](../tasks/T4_right_rail_toc.md) (rolled into the ISS-01 entry to keep T4's carry-over section concise). Once T4 lands and the right rail is visibly populated, T4's Builder flips Done-when bullet 1 with `(T1 + T2 + T4 issue files)` citation.

**M-UX-T1-ISS-03 (LOW, RESOLVED).** Closed in this cycle. No further propagation needed.

**Audit verdict propagation.** This cycle-1 audit returns `FUNCTIONALLY CLEAN` to the invoker. T2 closes cleanly with two MEDIUM findings tracked here for downstream pickup (T4 + T8). No HIGH findings. No source-code changes required for the audit verdict; the two MEDIUM findings are about spec wording (ISS-01 / ISS-03) and downstream budget evaluation (ISS-02), not about T2's runtime behaviour.

**Override / disagreement with Builder report.** None. The Builder's claims were verified independently and reproduce byte-for-byte: `du -sb dist/client/` = `5219362`, page count = `37`, M3 surface counts (6 / 6 / 8 / 12) preserved, `data-interactive-only` count = 19 = 6 M3 + 12 slots + 1 island root, `aria-current="page"` mirrors correctly across all 12 chapter pages and across the lectures/notes/practice collections. The two MEDIUM findings (ISS-01, ISS-02) are surfaced for visibility — neither contradicts the Builder's facts, and the Builder explicitly self-disclosed the size cost in the CHANGELOG. T1 carry-over reasoning (M-UX-T1-ISS-01 deferral to T4, M-UX-T1-ISS-03 RESOLVED via token consumption) is sound.

## Security review

**Reviewed on:** 2026-04-24
**Reviewer:** security-reviewer subagent (M-UX T2 cycle 1 gate)
**Verdict:** SHIP

Files inspected directly:
- [`src/components/chrome/CompletionIndicator.astro`](../../../../src/components/chrome/CompletionIndicator.astro)
- [`src/components/chrome/LeftRail.astro`](../../../../src/components/chrome/LeftRail.astro)
- [`src/pages/lectures/[id].astro`](../../../../src/pages/lectures/[id].astro)
- [`src/pages/notes/[id].astro`](../../../../src/pages/notes/[id].astro)
- [`src/pages/practice/[id].astro`](../../../../src/pages/practice/[id].astro)
- [`src/pages/api/read_status/index.ts`](../../../../src/pages/api/read_status/index.ts)
- [`src/content.config.ts`](../../../../src/content.config.ts)
- [`src/layouts/Base.astro`](../../../../src/layouts/Base.astro)
- [`astro.config.mjs`](../../../../astro.config.mjs)
- [`.github/workflows/deploy.yml`](../../../../.github/workflows/deploy.yml)

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | JSON-island parsing — `JSON.parse()` only, no `eval`/`new Function` | CLEAN — `CompletionIndicator.astro:100` `JSON.parse(dataNode.textContent ?? '{}')`; try/catch degrades to `{}` on failure; `<script type="application/json">` MIME prevents browser execution. |
| 2 | Fetch URL `chapter_id` from closed manifest set, `encodeURIComponent` applied | CLEAN — `CompletionIndicator.astro:124–125` builds URL from `Object.keys(sectionIdsByChapter)` (build-time `scripts/chapters.json` map) with `encodeURIComponent(chapterId)`. No `window.location` / `document` / event-payload influence on the chapter id. |
| 3 | `cs300:read-status-changed` listener scoped current-chapter only, ignores event detail | CLEAN — `CompletionIndicator.astro:168–172` calls `refreshChapter(currentChapterId)` where `currentChapterId` is read from `root.dataset.currentChapterId` (SSR-set from `Astro.url.pathname` regex match). Event detail is not read; rogue dispatch with arbitrary detail has no effect. Matches DA2-B requirement. |
| 4 | `data-interactive-only` gating depth — innermost element, not `<a>` | CLEAN — `LeftRail.astro:87–98,105–119` puts the attribute on `<span class="checkmark-slot">` and on the island root `<div>`, NOT on `<a class="chapter-link">`. Static-mode chapter links remain visible/clickable; checkmarks correctly hidden via the `Base.astro` global rule. T5 contract preserved. |
| 5 | `import.meta.env` usage — only public values | CLEAN — Sole reference is `LeftRail.astro:46` `import.meta.env.BASE_URL` (public Astro-injected subpath). No `*_SECRET`/`*_KEY`/database-connection/non-public env reaches T2 files. |
| 6 | New external resource fetches | CLEAN — No new `<link rel="stylesheet">`, `<script src>`, `@import`, web-font CDN, or non-same-origin `fetch` calls. Only fetch is same-origin `/api/read_status` (M3 endpoint). |
| 7 | SSR payload content — no path/secret/draft-marker leakage | CLEAN — Payload is `Record<string, string[]>` (chapter id → section ids). Section ids already public in the rendered HTML anchors. No file paths, no draft flags, no internal identifiers. |
| 8 | GH Pages artifact integrity — API routes excluded | CLEAN — `deploy.yml:74–76` uploads only `./dist/client/`. API routes have `prerender = false` so they emit to `dist/server/` and never reach GH Pages. |

### Advisory

**`set:html` on `<script type="application/json">` does not HTML-escape `</script>` sequences.** `CompletionIndicator.astro:71` injects the `JSON.stringify()` output via `set:html`, which bypasses Astro's default escaping. `JSON.stringify()` does not escape forward slashes — a section id containing the literal string `</script>` would prematurely close the script element and allow downstream HTML injection.

**Realistic risk under cs-300 threat model: negligible.** Section ids are produced by `scripts/build-content.mjs` consuming pandoc-emitted slugs from LaTeX section titles. Pandoc's slug normalisation strips `<`, `>`, `/` from titles before they become ids. The user controls their own LaTeX inputs; the only way to inject a `</script>` substring would be the user tampering with their own gitignored MDX frontmatter, which is regenerated each build. Local-only, single-user threat model — not exploitable.

**Action (advisory only):** No code change required now. If the project ever (a) accepts externally-authored LaTeX, or (b) widens the section id schema to accept arbitrary strings from external sources, the one-line fix is to replace `JSON.stringify(sectionIdsByChapter)` with a custom serializer that emits `<\/` for `</`, or replace `set:html` with `set:text` on a `<template>` parsed by the island. Logged for forward-traceability; does not affect the SHIP verdict.

### Verdict

**SHIP.** Eight checks PASS, one ADVISORY (negligible risk under threat model). T2's runtime threat surface is clean.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
