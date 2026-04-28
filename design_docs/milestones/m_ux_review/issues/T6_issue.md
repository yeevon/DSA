# T6 — Typography pairing + ADR-0002 amendment — Audit Issues

**Source task:** [`../tasks/T6_typography.md`](../tasks/T6_typography.md)
**Audited on:** 2026-04-27
**Audit cycle:** 1
**Audit scope:** Spec-vs-implementation verification of every D1–D7
deliverable + AC1–AC8; design-drift check against
[`design_docs/architecture.md`](../../../architecture.md) §1
page-chrome subsection (the new typography one-liner +
the four carry-over edits T4-ISS-02 / T4-ISS-03 / T5-ISS-02 / T5-ISS-03);
cross-check against [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md)
"Open questions deferred" — Visual style — typography entry; the
M-UX-REVIEW milestone-close surfaces (per-task spec status, tasks
README row, milestone README task-table row, milestone README
`Done when` checkboxes F1–F11 + F12 deferred-as-deliverable +
no-regression + status-surface lockstep, milestone README Status
line, top-level `design_docs/milestones/README.md` index row +
paragraph blurb); CHANGELOG entries for the milestone-close +
T6-close;
[`nice_to_have.md`](../../../nice_to_have.md) §UX-5 (F12 accent
split — out-of-scope-for-this-milestone boundary);
verification of Path 2 net-zero `package.json` / `package-lock.json`
delta + the absence of `node_modules/@fontsource-variable/` post-install;
the three Builder-self-reported deviations (italic file added
beyond the spec's two-file count, `.chapter-card-num` selector
adjusted from spec's descriptive `.ch-tag`, new
`font-family: var(--mux-font-mono)` rule on `.code-block > pre`
in CodeBlock.astro). CLAUDE.md non-negotiables verified:
status-surface lockstep across the five task-level surfaces +
the three milestone-level surfaces; code-task verification
non-inferential — auditor opened seven screenshots
(`/home/papa-jochy/Documents/School/cs-300/.smoke/screenshots/index-1280x800.png`,
`.smoke/screenshots/lectures-ch4-1280x800.png`,
`/tmp/cs300-t6-katex/ch_5-top.png`,
`/tmp/cs300-t6-katex/ch_5-katex.png`,
`/tmp/cs300-t6-katex/ch_9-katex.png`,
`/tmp/cs300-t6-katex/ch_13-katex.png`,
`.smoke/screenshots/lectures-ch4-2560x1080.png`)
and cited visual evidence inline.

Auditor re-ran all gates from scratch:

- `npm run build` — exit 0; **40 prerendered pages** confirmed
  (`find dist/client -name 'index.html' | wc -l` → 40); fonts
  deployed under `dist/client/fonts/` with the three expected woff2
  files (28,740 + 28,532 + 40,404 = **97,676 bytes** matching the
  ADR + architecture citation).
- `du -sb dist/client/` → **7,629,630 bytes**, matching the Builder's
  claim verbatim. Pre-T6 baseline per CHANGELOG = 7,511,041 → delta
  **+118,589 bytes** (matches Builder's gate-line claim verbatim).
- `npm run preview` (background, port 4321).
- `.venv/bin/python scripts/functional-tests.py` →
  **68/68 cases / 143/143 assertions in 34.0s** (matches Builder
  claim verbatim — auditor parsed the JSON config with `python -c`
  to independently verify cardinality: `cases: 68`, `asserts: 143`).
  All four T6-introduced cases (`body-font-source-sans-3`,
  `mono-font-jetbrains`, `font-loaded-not-fallback`,
  `mono-on-chapter-tag`) PASS green on the just-built dist.
- `.venv/bin/python scripts/smoke-screenshots.py` → **31 screenshots
  / 2,740,095 bytes** (matches Builder claim verbatim).
- `git diff HEAD -- package.json package-lock.json` → **0 lines**
  (Path 2 net-zero verified).
- `ls node_modules/@fontsource-variable/` → directory absent
  (`No such file or directory`) — Path 2 cleanup verified.
- `grep -rn "mux-current\|mux-achievement" src/` → **0 hits** —
  F12 boundary holds.

**Status:** ✅ PASS — all 8 ACs PASS; all 4 carry-over items
RESOLVED; all 7 deliverables D1–D7 land; the three Builder-self-reported
deviations are each justified and folded into Additions-beyond-spec;
all five task-level status surfaces and all three milestone-level
closure surfaces flip in lockstep at `✅ closed 2026-04-27` /
`✅ done 2026-04-27`; F12 stays parked in `nice_to_have.md` §UX-5.
Three LOW findings logged for doc-precision and a 33-byte delta
mismatch between the architecture/ADR citation (+118,556) and the
ADR + auditor-measured + Builder-reported delta (+118,589) — none
block the milestone close.

---

## Design-drift check

Cross-checked against `design_docs/architecture.md` §1 page-chrome
subsection (the new "Typography" one-liner at line 103, plus the
four carry-over edits at lines 84, 127, 174, 480),
`design_docs/adr/0002_ux_layer_mdn_three_column.md` "Open questions
deferred" — Visual style — typography entry (line 119),
`design_docs/nice_to_have.md` §UX-5 (F12 accent boundary), the M-UX
size-budget tracking line in `m_ux_polish/README.md`, and CLAUDE.md
non-negotiables (status-surface lockstep, code-task verification
non-inferential, dependency-audit gate, dep-manifest discipline).

| Check | Result | Citation |
| ----- | ------ | -------- |
| New dependency? | **None — net-zero manifest delta confirmed.** Builder followed Path 2 (transient install of `@fontsource-variable/source-sans-3` + `@fontsource-variable/jetbrains-mono` to extract the three woff2 files, then `npm uninstall` + manifest restore from snapshot, then `node_modules/@fontsource-variable/` cleanup). Auditor verified: `git diff HEAD -- package.json package-lock.json` → 0 lines; `ls node_modules/@fontsource-variable/` → `No such file or directory`. The `chrome.css` docstring at lines 50–68 documents the procedure inline so a future Builder can re-run it cleanly. The dependency-audit gate (CLAUDE.md non-negotiable) is satisfied because the net-zero manifest delta means there is nothing to audit. | `git diff HEAD -- package.json package-lock.json`; `ls node_modules/@fontsource-variable/`; `chrome.css:50-68` |
| New module / boundary crossing? | **None — pure-edit on existing surfaces.** No new files; T6 edits 4 source files (`src/styles/chrome.css`, `src/layouts/Base.astro`, `src/layouts/HomeLayout.astro`, `src/components/callouts/CodeBlock.astro`) + 1 test config (`scripts/functional-tests.json`) + 3 doc files (architecture.md, ADR-0002, T6 spec) + the M-UX-REVIEW milestone-close surfaces + CHANGELOG. The new asset directory `public/fonts/` is the deliberate self-hosted-fonts location named by spec D2 ("Drop woff2 files into `public/fonts/`"), authorised inline in the architecture.md typography one-liner ("self-hosted as variable woff2 in `public/fonts/`"). Three woff2 files: `source-sans-3-variable.woff2` (28,740 B), `source-sans-3-variable-italic.woff2` (28,532 B), `jetbrains-mono-variable.woff2` (40,404 B) — total 97,676 B. The italic file is one beyond the spec's named two; justified inline below + in Additions section. | `public/fonts/*.woff2`; `chrome.css:69-89`; `architecture.md:103` |
| Cross-cutting concerns (I/O, networking, retries, logging, persistence, caching, auth, concurrency)? | **None touched.** The three `@font-face` blocks at `chrome.css:69-89` reference relative `/DSA/fonts/*.woff2` URLs — no third-party CDN, no network egress, fully offline-capable per the spec's "Self-hosted woff2 (no third-party CDN — keeps the deploy fully static + offline-capable)" Goal. `font-display: swap` is a single CSS knob; no JS hooks. M3 events (`cs300:read-status-changed`, `cs300:toc-read-status-painted`, `cs300:annotation-added`, `cs300:drawer-toggle`) are untouched — no new dispatchers in T6. | `chrome.css:69-89`; grep across `src/` |
| Configuration / secrets? | **None touched.** No env vars read; no API keys; no auth tokens. Path 2's transient install was a build-time procedure done outside the source tree, then reverted. | n/a |
| Observability? | **None touched.** No new logging, metrics, or external backend. | n/a |
| architecture.md §1 typography one-liner (D5)? | **Landed.** `architecture.md:103` reads: "Typography (M-UX-REVIEW T6, 2026-04-27 — UI-review F11; ADR-0002 typography deferral resolved). Source Sans 3 (body) + JetBrains Mono (code), self-hosted as variable woff2 in `public/fonts/` (latin subset; weight axis covers 400/600/700; Source Sans 3 ships an italic file in addition so prose italic renders in the matched cut rather than browser-synthesized). Declared via three `@font-face` blocks in `src/styles/chrome.css` with `font-display: swap` so the brief FOUT during cold load renders in the system fallback chain rather than blocking page paint. Two CSS custom properties carry the pinned families — `--mux-font-body` for body / chrome / Source Sans 3, `--mux-font-mono` for `<pre class=\"astro-code\">` Shiki blocks + `.code-block-lang` + the `.chapter-card-num` (ch_N) tag — so any future dark-mode / theme work is a single-rule swap. KaTeX math composition unchanged: KaTeX retains its own font stack for math glyphs, body math falls back to `--mux-font-body`'s primary family for the non-math characters. Bundle delta: +118,556 bytes (97,676 woff2 + ~20,880 inline CSS replicated across 40 prerendered HTML files); inside the M-UX cumulative `dist/client/` budget. See ADR-0002 for the chosen-pairing rationale (cross-device rhythm consistency for a 200-hour reading product)." Substantive shape captured: chosen body + mono pair named, both CSS custom properties named (matching AC5 grep contract), `--mux-font-body` named for body / chrome and `--mux-font-mono` named for code surfaces, KaTeX behaviour explained, bundle-delta quantified, ADR-0002 cross-reference present. **LOW-1 nit:** the cited bundle delta `+118,556` differs by 33 bytes from the auditor-measured + Builder-reported `+118,589` (post-T6 7,629,630 − pre-T6 7,511,041). Probably a stale figure carried from an earlier mid-cycle measurement before the inline-CSS replication settled. Doc-precision only; AC5 still PASS. | `architecture.md:103`; `du -sb dist/client/`; CHANGELOG line 121 |
| ADR-0002 typography deferral entry flipped (D4)? | **Landed.** `ADR-0002:119` no longer reads "deferred." It reads: "Visual style — typography (resolved 2026-04-27 in M-UX-REVIEW T6). Body: Source Sans 3. Mono: JetBrains Mono. Both self-hosted as variable woff2 in `public/fonts/` (latin subset; Source Sans 3 ships an italic file in addition so prose italic renders in the matched cut), declared via `@font-face` in `src/styles/chrome.css` with `font-display: swap`. Bundle delta at T6 close: +118,556 bytes total (97,676 woff2 + ~20,880 inline CSS replicated across 40 prerendered HTML files), inside the M-UX cumulative `dist/client/` budget. Rationale: cs-300 is a 200-hour reading product rendering body prose + KaTeX math + code listings + monospace tags side-by-side; the system font stack renders these inconsistently across macOS / Windows / Android, breaking visual rhythm at the same character size. Pinning the pair removes that class of cross-device polish drift. Source Sans 3 was chosen over Inter (the other F11-cleared option) because cs-300 is reading-product-shaped rather than UI-shaped, and Source Sans 3's reading-tuned letterforms suit long-form chapter prose. Color palette remains system-default + `--mux-accent`; dark mode remains deferred per the original entry (the `--mux-font-body` / `--mux-font-mono` tokens make dark-mode / theme work a single-rule swap when the trigger fires)." The remaining four deferred items (color palette, dark mode, search, per-section completion derivation, animation discipline) stay deferred — only the typography-family question flips. AC4 grep contract satisfied (entry no longer reads "deferred"). **LOW-2 nit:** same +118,556 figure, same 33-byte mismatch as architecture.md (consistent with each other but both off vs the audit-measured delta). | `ADR-0002:119` |
| §1 carry-over T4-ISS-02 (drawer-trigger dual-rule rationale)? | **Landed.** `architecture.md:174` reads: "Drawer trigger extracted from the breadcrumb. … The slot is wired into the desktop / mobile templates by **two** rules in `Base.astro` that act in concert: (a) `.chrome > [data-slot=\"drawer-trigger\"]:empty { display: none }` collapses the row on routes (index, landing pages) where no consumer mounts a `<DrawerTrigger>` into the slot — `:empty` matches because the slot wrapper has no element children; and (b) inside the `@media (min-width: 1024px)` block, `.chrome > [data-slot=\"drawer-trigger\"] { display: none }` hides the wrapper at desktop on chapter routes — `:empty` cannot fire there because the slot has a child (the `<DrawerTrigger>` button itself, whose own component-level `@media` query hides the button at ≥1024px but leaves the wrapper non-empty). The dual-rule rationale is the load-bearing piece: each rule covers a case the other can't reach. The authoritative `why` lives in the `Base.astro` docstring (lines 317–326)." Both rules named, dual-rule rationale present, Base.astro docstring citation present (lines 317–326 — auditor opened Base.astro and confirmed the rules at lines 267–269 + 342–344, with the docstring rationale at lines 317–344 spanning the docstring + the rules). Carry-over RESOLVED. | `architecture.md:174`; `Base.astro:267-269,317-344` |
| §1 carry-over T4-ISS-03 (right-rail TOC tablet vs phone shape)? | **Landed.** `architecture.md:127` reads: "Mobile (<1024px): single column. Left rail collapses to a hamburger drawer; the trigger button (`☰ Chapters ›` per M-UX-REVIEW T4 D3) sits as its own row above the chrome stack so it survives the breadcrumb-hide at <768px. Right-rail TOC behaviour now varies by sub-band: at **768–1023px (tablet)** it moves to a collapsed `<details class=\"toc-mobile-collapse\">` summary at content top per the original M-UX T7 mobile re-order; at **<768px (phone)** the right-rail desktop TOC track and the `toc-mobile-collapse` `<details>` are both hidden by `Base.astro`'s mobile @media block, and the on-this-page affordance is rendered inline by `<MobileChapterTOC>` (a separate component with its own `.rhs-toc-mobile` selector) inside the chapter route's `<header>` after `<CollectionTabs>` — see the **Mobile DOM order (<768px ...)** block immediately below for the post-T4 phone shape." The pre-T4 sentence ("Right-rail TOC moves to a collapsed `<details>` summary at content top") is now qualified to the 768–1023px tablet shape only, with the <768px phone shape pointed at the Mobile DOM order block. Carry-over RESOLVED. | `architecture.md:127`; T4 issue file LOW-2 |
| §1 carry-over T5-ISS-02 (MDX `pre` mapping deviation rationale)? | **Landed.** `architecture.md:84` now includes: "The MDX `pre` mapping is a deviation from T5 spec D2's original wording (which assumed the M2 `<CodeBlock>` already wrapped Shiki output and therefore showed only the explicit-JSX render shape): Astro's MDX integration emits Shiki's `<pre class=\"astro-code\">` directly and bypasses the M2 wrapper, so the `pre: CodeBlock` mapping in the three chapter route templates is the minimal route to make every fenced block on every chapter page pick up the F7 polish without filter-time wrapping in `scripts/pandoc-filter.lua` (the spec constraint forbids that path)." Deviation rationale + spec-constraint citation present. Carry-over RESOLVED. | `architecture.md:84`; T5 issue file LOW-1 |
| §6 carry-over T5-ISS-03 (component-side swap target at CodeBlock.astro:84)? | **Landed.** `architecture.md:480` reads: "**Component-side counterpart:** the visible header tag at `src/components/callouts/CodeBlock.astro:84` is the static literal `<span class=\"code-block-lang\">C++</span>` (Path A per M-UX-REVIEW T5 D2), not prop-derived; when the trigger fires the future Builder swaps that literal for a prop-driven render (`<span class=\"code-block-lang\">{lang}</span>`) and threads the language hint from the pandoc filter through MDX frontmatter or a `data-language` read on the slot's `<pre>` (Shiki already emits `data-language=\"cpp\"` on `<pre class=\"astro-code\">` per the rendered output, so the MDX-route component can read it from the slotted child without a filter-side schema change)." Component-side swap target named, prop-driven render shape named, `data-language` slot-read shortcut named. Carry-over RESOLVED. | `architecture.md:480`; T5 issue file LOW-2; `CodeBlock.astro:84` (auditor confirmed the literal still ships) |
| `nice_to_have.md` §UX-5 (F12 accent split) boundary? | **Untouched.** `grep -rn "mux-current\|mux-achievement" src/` returns 0 hits. T6 added no new accent tokens; the existing `--mux-accent` / `--mux-accent-strong` / `--mux-accent-bg` triplet stays the canonical accent surface, and the F12 `--mux-current` / `--mux-achievement` semantic split stays parked in `nice_to_have.md:207-258` under its M5 promotion-trigger. F11 (typography) and F12 (accent) are independent findings — T6 closing F11 does not pre-empt F12 promotion. | `grep -rn "mux-current\|mux-achievement" src/`; `nice_to_have.md:207-258` |
| Spec sequencing — pre-Phase-1 vs M2+ surfaces? | **In-bounds.** T6 lives entirely inside M-UX-REVIEW (the second UX sidecar driven by the 2026-04-27 `UI_UX_Review.pdf` audit, ✅ closed 2026-04-27). M-UX-REVIEW depends on M-UX (✅ closed 2026-04-25) which depends on M3 (✅ closed 2026-04-24) which depends on M2 (✅ closed 2026-04-23) — fully past Phase 1. T6 touches no chapter content, no `coding_practice/`, no Phase-4-blocked surfaces; it touches only the chrome's typography token + asset layer. | T6 spec; milestones index |
| Code-task verification non-inferential? | **Satisfied.** Auditor opened seven screenshots (index, ch_4 lectures, ch_5 / ch_9 / ch_13 KaTeX-specific captures at `/tmp/cs300-t6-katex/`, plus ch_5-top.png to confirm chapter prose) and cited each one inline at the relevant AC. The functional-test harness exercises the contract dynamically (computed `font-family` regex on body + first `.code-block pre` + `.chapter-card-num`; `document.fonts.check('1em "Source Sans 3"')` + `'1em "JetBrains Mono"'` after `document.fonts.ready`). Build success alone is NOT the audit gate. | `.smoke/screenshots/index-1280x800.png`; `.smoke/screenshots/lectures-ch4-1280x800.png`; `/tmp/cs300-t6-katex/ch_{5,9,13}-{top,katex}.png`; `scripts/functional-tests.py` runtime output |
| Status-surface lockstep — task-level (4 surfaces)? | **All 4 flipped.** (a) `T6_typography.md:3` Status `**Status:** ✅ done 2026-04-27`; (b) `m_ux_review/tasks/README.md:14` T6 row `✅ done 2026-04-27`; (c) `m_ux_review/README.md:58` task-table T6 row `✅ done 2026-04-27`; (d) `Done when` F11 checkbox at `m_ux_review/README.md:42` is `[x]` with the citation parenthetical pointing at the T6 issue file. | T6 spec line 3; tasks README line 14; milestone README lines 42, 58 |
| Status-surface lockstep — milestone-level (3 surfaces)? | **All 3 flipped.** (a) `m_ux_review/README.md:4` Status line `**Status:** ✅ closed 2026-04-27`; (b) `design_docs/milestones/README.md:27` index row reads `✅ closed 2026-04-27`; (c) `design_docs/milestones/README.md:37-43` paragraph blurb updated to "T1 + T2 + T3 + T4 + T5 + T6 closed in a single day (F1–F11 shipped; F12 deferred to nice_to_have.md §UX-5 with explicit M5 trigger)". All 14 `Done when` checkboxes (F1–F12 + no-regression + status-surface-lockstep) are `[x]`. | milestone README lines 4, 32–45; milestones index lines 27, 37–43 |

**No drift detected.** Phase 1 PASS.

---

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| **AC1** — Body font computed family matches Source Sans 3 (or Inter). | ✅ PASS | Functional test `body-font-source-sans-3` PASS on `/DSA/lectures/ch_4/`: `pre_js` reads `getComputedStyle(document.body).fontFamily` and mirrors it onto a body data-attribute; regex assertion `^["']?Source Sans 3["']?` confirms the primary family is named first. Auditor visually confirmed in `index-1280x800.png` (the "CS 300 — Data Structures & Algorithms" h1, the "6 graded chapters, ~25 hours of reading" subtitle, and the "Lectures / Notes / Practice" button labels all render in Source Sans 3 with no system-stack fallback artefact) and in `lectures-ch4-1280x800.png` (chapter prose + LeftRail + breadcrumb all render in Source Sans 3). The token at `chrome.css:118-119` names `'Source Sans 3'` first in the family stack; `Base.astro:189` + `HomeLayout.astro:99` both bind `:global(body) { font-family: var(--mux-font-body); }`. |
| **AC2** — Mono font computed family is JetBrains Mono on `<pre>` and `.chapter-card-num` (`.ch-tag` per spec, `.chapter-card-num` per actual emitted markup). | ✅ PASS | Functional test `mono-font-jetbrains` PASS on `/DSA/lectures/ch_4/` (regex `JetBrains Mono` against the first `.code-block pre`'s computed font-family); functional test `mono-on-chapter-tag` PASS on `/DSA/` (regex `JetBrains Mono` against the `article.chapter-card .chapter-card-num` computed font-family). Auditor visually confirmed in `index-1280x800.png` — the green `CH_1` / `CH_2` / etc. chapter-number tags render in monospace JetBrains Mono (clearly distinct from the Source Sans 3 body context). The token at `chrome.css:120-121` names `'JetBrains Mono'` first; `CodeBlock.astro:179` adds `font-family: var(--mux-font-mono)` on `.code-block > pre` (justified deviation — see Additions); `chrome.css:205` (`.code-block-lang`) and `ChapterCard.astro:196` (`.chapter-card-num`) both already bind `var(--mux-font-mono)`. |
| **AC3** — Font is loaded (not silently falling back to system stack). | ✅ PASS | Functional test `font-loaded-not-fallback` PASS on `/DSA/lectures/ch_4/`: async `pre_js` awaits `document.fonts.ready`, then sets three body data-attributes from `document.fonts.check('1em "Source Sans 3"')` and `'1em "JetBrains Mono"'`; assertions confirm `data-t6-fonts-ready=yes`, `data-t6-body-loaded=true`, `data-t6-mono-loaded=true`. Auditor `dist/client/fonts/` confirmed at 97,676 bytes total (28,740 + 28,532 + 40,404), all three woff2 files served at `/DSA/fonts/*.woff2` paths matching the `@font-face src` in chrome.css. |
| **AC4** — ADR-0002 typography deferral entry amended (no longer reads "deferred"). | ✅ PASS | `ADR-0002:119` now reads "Visual style — typography (resolved 2026-04-27 in M-UX-REVIEW T6). Body: Source Sans 3. Mono: JetBrains Mono." The other deferred items (color palette, dark mode, search, per-section completion, animation discipline) stay deferred at lines 119–123 — exactly per spec D4. Doc-content grep for the literal `"Visual style — typography (resolved 2026-04-27 in M-UX-REVIEW T6)"` matches at `ADR-0002:119`. |
| **AC5** — architecture.md §1 mentions chosen body + mono pair + `--mux-font-body` / `--mux-font-mono` variables. | ✅ PASS | `architecture.md:103` names "Source Sans 3 (body) + JetBrains Mono (code)" + both CSS custom properties (`--mux-font-body` and `--mux-font-mono`) with their bound surfaces. Doc-content grep for `--mux-font-body` matches the chrome.css token block at lines 109–121 and the architecture.md typography one-liner at line 103. |
| **AC6** — KaTeX math renders without missing-glyph boxes — visual smoke check on ch_5 / ch_9 / ch_13. | ✅ PASS | Auditor opened `/tmp/cs300-t6-katex/ch_5-katex.png` (Hash Tables — `O(n)`, `O(log n)`, `O(1)`, `key → index`, `α = n/capacity` all render with KaTeX italics + Greek glyphs intact), `/tmp/cs300-t6-katex/ch_9-katex.png` (AVL — `O(log n)` height-balance proof, balance-factor expressions render cleanly), `/tmp/cs300-t6-katex/ch_13-katex.png` (Stirling expressions, decision-tree bound `n!` arguments render cleanly). No missing-glyph boxes / question-mark glyphs / replacement characters anywhere. KaTeX font stack is unchanged by T6 (KaTeX retains its own font stack for math glyphs); the spec D3 concern (Source Sans 3's coverage of math fallback characters) was a forward-looking risk that did not materialise — Source Sans 3 covers the body math characters cs-300 actually hits. |
| **AC7** — M-UX T9 functional-test cases all still pass; no layout drift from font metrics. | ✅ PASS | Pre-T6 baseline = 64 cases / 137 assertions (T5 close); post-T6 = 68 cases / 143 assertions; delta = +4 cases / +6 assertions, all four are the new T6 cases. Auditor verified the regression-guard cases — `breadcrumb-height-matches-token` (asserts breadcrumb height ∈ [40, 42]) and `code-block-margin` (asserts margin-block ≥8px) and `mobile-right-rail-aside-stays-rendered-375` and `mobile-existing-drawer-contracts-preserved` and `desktop-breadcrumb-visible-1280` — all PASS green. Font metrics swap did not push the breadcrumb height outside the token bound. |
| **AC8** — `dist/client/` byte delta documented (expected ~60–80 KB). | ✅ PASS (with LOW noted) | **Auditor-measured delta = +118,589 bytes** (post-T6 7,629,630 − pre-T6 7,511,041 per CHANGELOG). Slightly above the spec's expected ~60–80 KB band — the third (italic) woff2 file + the inline-CSS replication of the `@font-face` declarations across 40 prerendered HTML files together add ~38 KB beyond the spec's two-file estimate. Documented in CHANGELOG line 121, ADR-0002:119, architecture.md:103, and milestone README F11 row (line 42). **LOW-3 nit:** the architecture.md + ADR-0002 citation reads `+118,556 bytes` — a 33-byte under-count vs the actual `+118,589`. Documentation precision only; the delta is itself documented and inside the M-UX cumulative budget. |

8/8 ACs PASS.

---

## Carry-over from prior audits — verification

| Carry-over | Status | Notes |
| ---------- | ------ | ----- |
| **M-UX-REVIEW-T4-ISS-02 (LOW)** — drawer-trigger dual-rule rationale in `architecture.md` §1 mobile subsection. | ✅ RESOLVED | T6 spec line 123 ticked `[x]` with RESOLVED footer. Architecture.md:174 now names both rules ((a) `:empty { display: none }` + (b) `@media (min-width: 1024px) { display: none }`) and the dual-rule rationale + the `Base.astro:317-326` docstring citation. Auditor opened Base.astro and confirmed the rules at lines 267–269 + 342–344 with the rationale docstring at lines 317–344. |
| **M-UX-REVIEW-T4-ISS-03 (LOW)** — refresh `architecture.md` "Right-rail TOC moves to a collapsed `<details>`" sentence to qualify it as the 768–1023px tablet shape, point at Mobile DOM order block for <768px phone shape. | ✅ RESOLVED | T6 spec line 124 ticked `[x]` with RESOLVED footer. Architecture.md:127 now reads "Right-rail TOC behaviour now varies by sub-band: at **768–1023px (tablet)** … at **<768px (phone)** the right-rail desktop TOC track and the `toc-mobile-collapse` `<details>` are both hidden … on-this-page affordance is rendered inline by `<MobileChapterTOC>` … see the **Mobile DOM order (<768px ...)** block immediately below for the post-T4 phone shape." |
| **M-UX-REVIEW-T5-ISS-02 (LOW)** — append half-sentence to architecture.md §1 component-library `<CodeBlock>` paragraph clarifying MDX `pre` mapping is a deviation from spec D2 wording. | ✅ RESOLVED | T6 spec line 125 ticked `[x]` with RESOLVED footer. Architecture.md:84 now reads "The MDX `pre` mapping is a deviation from T5 spec D2's original wording (which assumed the M2 `<CodeBlock>` already wrapped Shiki output and therefore showed only the explicit-JSX render shape): Astro's MDX integration emits Shiki's `<pre class=\"astro-code\">` directly and bypasses the M2 wrapper, so the `pre: CodeBlock` mapping in the three chapter route templates is the minimal route to make every fenced block on every chapter page pick up the F7 polish without filter-time wrapping in `scripts/pandoc-filter.lua` (the spec constraint forbids that path)." |
| **M-UX-REVIEW-T5-ISS-03 (LOW)** — append component-side swap target bullet to architecture.md §6 forward-work item, naming `CodeBlock.astro:84` static literal + prop-driven render shape + `data-language` slot-read shortcut. | ✅ RESOLVED | T6 spec line 126 ticked `[x]` with RESOLVED footer. Architecture.md:480 now includes the **Component-side counterpart** bullet naming the `CodeBlock.astro:84` literal, the prop-driven swap target (`<span class="code-block-lang">{lang}</span>`), and the `data-language` slot-read shortcut. |

4/4 carry-over items RESOLVED.

---

## 🔴 HIGH

None.

---

## 🟡 MEDIUM

None.

---

## 🟢 LOW

### LOW-1 — `architecture.md:103` bundle-delta citation off by 33 bytes

**Severity:** LOW. **Status:** OPEN.

**Finding.** The architecture.md typography one-liner cites the
T6 bundle delta as `+118,556 bytes`. The auditor-measured + Builder-reported
delta is `+118,589 bytes` (post-T6 `du -sb dist/client/` = 7,629,630;
pre-T6 baseline per CHANGELOG = 7,511,041). The 33-byte under-count
is consistent with a stale figure carried over from an earlier
mid-cycle measurement (perhaps after one of the Path 2 install/uninstall
intermediate states) before the inline CSS landed in its final shape
across all 40 prerendered HTML files.

**Action / Recommendation.** Builder-side cosmetic flip on the next
typography-touching edit: change `architecture.md:103` from `+118,556`
→ `+118,589`. Same edit at `ADR-0002:119` (LOW-2 below) for consistency.
No re-build needed; the figure is documentation-only.

### LOW-2 — `ADR-0002:119` bundle-delta citation off by 33 bytes (same root cause as LOW-1)

**Severity:** LOW. **Status:** OPEN.

**Finding.** Identical to LOW-1: ADR-0002 line 119 cites `+118,556 bytes
total (97,676 woff2 + ~20,880 inline CSS replicated across 40 prerendered
HTML files)`. The 97,676 woff2 figure is exact (auditor verified by
summing the three `stat -c '%s'` outputs); the `~20,880` inline-CSS
estimate is ~33 bytes light vs the actual measured delta. The CHANGELOG
entry at line 121 shows the same figure pair.

**Action / Recommendation.** Same flip as LOW-1 on the next
ADR-touching edit. Two-line fix; can land alongside any future
typography or color-palette ADR work without churn. Alternatively
update the inline-CSS estimate to `~20,913` so the woff2 + inline-CSS
arithmetic matches the cited total.

### LOW-3 — Bundle delta sits at the high end of the spec's expected band (and slightly above the upper bound)

**Severity:** LOW. **Status:** OPEN (informational).

**Finding.** Spec D7 expected `+60–80 KB` for "two woff2 variable
fonts at ~30–50 KB each." Actual delta is `+118.6 KB` — about **38 KB
over** the upper bound. Two contributing factors:

1. **Three woff2 files instead of two.** The italic file
   (`source-sans-3-variable-italic.woff2`, 28,532 B) was added because
   the @fontsource-variable bundle splits italic on file-system axis
   rather than including italic axis inside the normal-weight variable
   file. Without the italic file, italic prose would render as
   browser-synthesized italic — defeating the spec D3 smoke item 4
   requirement ("italic + bold + 600-weight cuts all available").
2. **Inline CSS replication across 40 prerendered HTML files.** The
   `@font-face` blocks land inside each per-page `<style>` bundle at
   build time (Astro's per-route CSS bundling), adding ~20.9 KB total
   across the 40-page surface. Spec didn't anticipate this multiplier.

**Cumulative M-UX size budget.** The M-UX cumulative `dist/client/`
delta vs pre-M-UX baseline now includes T6's +118,589 B on top of the
prior M-UX-REVIEW deltas. The size-budget tracking line in
`m_ux_polish/README.md` should be updated to include the T6 figure.
Auditor did NOT block on this — the cumulative is "inside the M-UX
cumulative `dist/client/` budget" per architecture.md:103, and no
specific budget threshold is hit by T6's contribution.

**Action / Recommendation.** Informational only; both contributing
factors are justified (italic file is correctness-required per AC2 +
spec D3, inline-CSS replication is an Astro build behaviour the spec
under-modeled). If a future Builder wants to claw back ~20 KB, the
inline CSS replication could be hoisted to a single `<link
rel="stylesheet">` referencing chrome.css at the page level — but
that's a perf polish, not a correctness fix, and probably belongs to
a separate "M-UX bundle audit" task rather than a T6 fix-up. No
action required this cycle.

---

## Additions beyond spec — audited and justified

T6 ships three additions beyond the literal spec wording. Each is
justified by the spec's intent (or by AC contract) rather than
representing scope creep:

### A1 — Italic woff2 file added (third file beyond spec's named two)

**File added.** `public/fonts/source-sans-3-variable-italic.woff2`
(28,532 B).

**Spec wording.** D2 names two woff2 files: `source-sans-3-variable.woff2`
(or `inter-variable.woff2`) and `jetbrains-mono-variable.woff2`. The
spec did not anticipate the italic-axis file split.

**Why it's justified.** Spec D3 smoke procedure item 4 explicitly
requires "italic + bold + 600-weight cuts all available." The
@fontsource-variable bundle splits italic out as a separate file
(weight axis is variable inside the normal-style file; italic is its
own file). Without the italic file, italic prose (e.g. _"on average"_
in chapter prose, or italicised emphasis) would render as
browser-synthesized italic — a slanted version of the upright
typeface, not the Source Sans 3 italic letterforms designed for the
matched cut. That defeats the spec's intent of pinning the typography
pair to remove cross-device polish drift.

**Auditor visual evidence.** `/tmp/cs300-t6-katex/ch_5-top.png`
shows _"on average"_ rendering in true Source Sans 3 italic
letterforms (clearly distinct from the upright text on the same line);
the italic letterforms have proper stress angles + ligature treatments
that browser-synthesized italic cannot replicate.

**Cost.** +28,532 B (~28 KB), inside the M-UX cumulative budget.
The architecture.md:103 + ADR-0002:119 docstrings both name the
italic file in the citation list ("Source Sans 3 ships an italic file
in addition") — the deviation is documented inline.

### A2 — Functional-test selector adjusted from spec's `.ch-tag` to actual emitted `.chapter-card-num`

**Test name.** `mono-on-chapter-tag` in `scripts/functional-tests.json`
(line `mono-on-chapter-tag` block, viewport 1280×800, URL `/DSA/`).

**Spec wording.** D6 names `.ch-tag` (the `ch_4` chapter-number tag
on cards) as the assertion target.

**Actual emitted markup.** `ChapterCard.astro:118` emits `<span
class="chapter-card-num" aria-hidden="true">ch_{n}</span>`. The
component does NOT carry a `.ch-tag` class anywhere. Auditor `grep`
confirmed: `chapter-card-num` is the canonical class on the emitted
element; the `.ch-tag` reference in T6 spec D6 is a descriptive
shorthand, not a markup contract. (The spec text reads ".ch-tag
(the `ch_4` chapter-number tag on cards)" — the parenthetical is
the load-bearing identifier.)

**Why it's justified.** Builder targeted the actual emitted class so
the assertion runs against the real surface. If the test had targeted
`.ch-tag`, it would silently pass with `count: 0` (selector matches
nothing → vacuous). The selector adjustment is correct.

**Auditor visual evidence.** `/home/papa-jochy/Documents/School/cs-300/.smoke/screenshots/index-1280x800.png`
clearly shows the green `CH_1` / `CH_2` / etc. tags rendered in
JetBrains Mono on each chapter card.

### A3 — `font-family: var(--mux-font-mono)` rule added to `.code-block > pre` in CodeBlock.astro

**Edit.** `CodeBlock.astro:172-180` adds `font-family: var(--mux-font-mono)`
to the `.code-block > pre` selector inside the component's scoped
`<style>` block.

**Spec wording.** D2 names `var(--mux-font-mono)` as the canonical
mono token + says "Replace existing monospace references (KaTeX,
`.code-block`, the chapter-tag mono on cards) with `var(--mux-font-mono)`."
The spec did not anticipate that Shiki's `<pre class="astro-code">`
ships without a `font-family` declaration.

**Why it's justified.** Shiki emits `<pre class="astro-code">` with
inline `style="background-color:...;color:...;overflow-x:auto"` but no
`font-family`. The UA default for `<pre>` is `monospace` (the generic
family), which the OS resolves to its own default monospace (e.g.
SFMono on macOS, Consolas on Windows, DejaVu Sans Mono on Linux) —
NOT JetBrains Mono. Without this rule, AC2's `mono-font-jetbrains`
assertion (`pre_js` reads `getComputedStyle(pre).fontFamily`, regex
`JetBrains Mono`) would fail because the computed font-family of the
`<pre>` would be the UA default `monospace`, not the cascade-inherited
`var(--mux-font-mono)`.

**Inline documentation.** `CodeBlock.astro:159-171` carries a
docstring explaining the rationale: "Shiki emits `<pre class=\"astro-code\">`
without a `font-family` declaration, so the `<pre>` UA default
(`monospace`) was painting code blocks in the browser's
generic-monospace family — not the pinned JetBrains Mono. Setting
`font-family: var(--mux-font-mono)` here threads the F11 typography
pair through every Shiki render path (explicit `<CodeBlock code=\"...\" />`
JSX + the MDX `pre` mapping)."

**Auditor verification.** Functional test `mono-font-jetbrains` PASS
on `/DSA/lectures/ch_4/`: `getComputedStyle(document.querySelector('.code-block pre')).fontFamily`
matches `^JetBrains Mono`. Without the addition, the assertion would
fail. Auditor confirmed by reading the rule at CodeBlock.astro:179.

---

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | exit 0; **40 prerendered pages**; `dist/client/fonts/` populated with three woff2 files (97,676 B total) |
| Bundle size | `du -sb dist/client/` | **7,629,630 bytes** (= Builder's claim verbatim; delta vs pre-T6 baseline 7,511,041 = **+118,589 B**) |
| Manifest delta | `git diff HEAD -- package.json package-lock.json` | **0 lines** (Path 2 net-zero verified) |
| Cleanup | `ls node_modules/@fontsource-variable/` | `No such file or directory` (Path 2 cleanup verified) |
| Preview | `npm run preview` | reachable at `http://localhost:4321/DSA/` |
| Functional tests | `.venv/bin/python scripts/functional-tests.py` | **68/68 cases / 143/143 assertions in 34.0s** (= Builder claim verbatim; auditor `python -c json.load` independent count: cases=68, asserts=143) |
| Screenshots | `.venv/bin/python scripts/smoke-screenshots.py` | **31 screenshots / 2,740,095 bytes** (= Builder claim verbatim) |
| F12 boundary | `grep -rn "mux-current\|mux-achievement" src/` | 0 hits (F12 stays parked) |
| AC4 doc grep | `grep "resolved 2026-04-27 in M-UX-REVIEW T6" design_docs/adr/0002_ux_layer_mdn_three_column.md` | 1 match at line 119 |
| AC5 doc grep | `grep "\-\-mux-font-body\|\-\-mux-font-mono" design_docs/architecture.md` | 1 line match (architecture.md:103, both tokens named) |
| Architecture carry-over edits | `grep -n "T4-ISS-02\|T4-ISS-03\|T5-ISS-02\|T5-ISS-03" implicitly via shape grep` | All four edits present at lines 84, 127, 174, 480 |
| Status surfaces (task-level, 4 surfaces) | inspection | All 4 flipped: T6 spec, tasks README row, milestone task-table row, F11 Done-when checkbox + citation |
| Status surfaces (milestone-level, 3 surfaces) | inspection | All 3 flipped: m_ux_review/README.md Status, milestones/README.md index row, milestones/README.md paragraph blurb |
| Done-when checkboxes (12 + 2 = 14 total) | inspection | All `[x]` (F1–F12 + no-regression + status-surface-lockstep) |

---

## Issue log — cross-task follow-up

| ID | Severity | Owner / Next touch | Action |
| -- | -------- | ------------------ | ------ |
| M-UX-REVIEW-T6-ISS-01 (LOW) | LOW | Builder of next typography- or architecture.md-touching edit | Flip `architecture.md:103` bundle-delta citation from `+118,556 bytes` → `+118,589 bytes`. Cosmetic doc-precision only. |
| M-UX-REVIEW-T6-ISS-02 (LOW) | LOW | Builder of next ADR-0002-touching edit | Flip `ADR-0002:119` bundle-delta citation from `+118,556` → `+118,589`. Same root cause as ISS-01; can land in the same edit pass. |
| M-UX-REVIEW-T6-ISS-03 (LOW) | LOW (informational) | None — informational, no action required | Note that T6 bundle delta (+118.6 KB) sits ~38 KB above spec D7's expected `+60–80 KB` upper bound. Driven by (a) the italic woff2 third file (correctness-required per AC2 + spec D3), and (b) inline CSS replication across 40 prerendered HTML files (Astro per-page bundling behaviour the spec didn't anticipate). Inside M-UX cumulative budget; no threshold breached. If a future "M-UX bundle audit" runs, the inline CSS replication is the ~20 KB to claw back via a single `<link rel=\"stylesheet\">` hoist. |

All three findings are LOW (documentation-precision or informational).
None block the milestone close.

---

## Deferred to nice_to_have

Not applicable. T6 only resolves F11 (typography); F12 (accent
semantic split) remains parked at `nice_to_have.md:207-258` §UX-5
under its M5 promotion-trigger ("Best done after M5 lights up
completion"). T6 added no new accent tokens; the F12 boundary
(`mux-current` / `mux-achievement` token names) returns 0 hits in
`src/`. F12's deferral is itself the deliverable for the F12 row in
the milestone README's Done-when list.

---

## Propagation status

No forward-deferrals. All four T4/T5 carry-over items lifted into T6
were RESOLVED in this audit cycle (their `[x]` ticks + RESOLVED
footers in T6 spec lines 123–126 are auditor-verified against the
shipped architecture.md edits). The three LOW findings logged above
(ISS-01 / ISS-02 / ISS-03) are doc-precision / informational and
have no propagation target — they sit in this issue file for any
future doc-touching Builder to fold inline.

**M-UX-REVIEW closes here.** All 12 findings (F1–F11 implemented,
F12 deferred via parking-lot entry) are accounted for. The milestone
ran in parallel with M4's upstream gate and lands ✅ closed
2026-04-27 — the second UX sidecar after M-UX, with both UX
sidecars now closed.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-1 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. T6 introduces 3 woff2 font files (extracted from `@fontsource-variable/...` npm packages via authorised Path 2 transient install + restore) and CSS `@font-face` declarations.

### Files reviewed

- `src/styles/chrome.css` — three `@font-face` blocks + design tokens.
- `src/layouts/Base.astro` + `HomeLayout.astro` — body font-family binding; no `<link>` preload.
- `src/components/callouts/CodeBlock.astro` — mono font rule on `.code-block > pre`.
- `astro.config.mjs` — output mode + base path.
- `.github/workflows/deploy.yml` — artifact upload path.

### Critical

None.

### High

None.

### Advisory (mostly confirm-only — one forward-looking note)

- **`src/styles/chrome.css:71,78,85` — `@font-face` `src:` URLs hardcode `/DSA/fonts/…`** (the Astro `base` path as a string literal), not `${import.meta.env.BASE_URL}fonts/…`. In pure CSS this is inert today (`base: '/DSA/'` matches). **Forward-looking note:** if the site is ever re-rooted at a different base path, the font URLs will 404 silently while every other asset reference (which uses `import.meta.env.BASE_URL`) self-heals. Not a security issue. **Recommendation:** flag for the next architecture review if the base path ever changes; no immediate action.
- **`src/styles/chrome.css:69-89` — no `unicode-range` descriptors** on any of the three `@font-face` blocks. Intentional per the file-header comment (latin subset extracted by fontsource; KaTeX has its own font stack for math glyphs). Browser will fetch all three woff2 files on every page load. Performance note only, not security. Confirm-only.
- **No third-party CDN URLs.** All three `@font-face src:` reference `/DSA/fonts/…` (same-origin). Self-hosted contract preserved.
- **`font-display: swap`** confirmed on all three `@font-face` blocks (lines 74, 81, 88) — matches spec D2.
- **No `crossorigin` attribute** introduced anywhere. Same-origin fonts don't need it. Confirmed.
- **No `<link rel="preload">`** introduced for the fonts. Spec didn't ask for it. Confirmed.
- **No new `fetch()` / `localStorage` accesses** introduced by T6. The pre-existing `cs300:last-visit` writer visible in `Base.astro` is M-UX-REVIEW T1 work (already covered by T1 cycle-3 security review).
- **`.github/workflows/deploy.yml:74` upload path** `./dist/client` correctly includes `public/fonts/` after Astro's static build copies them to `dist/client/DSA/fonts/`. Server bundle (`dist/server/`) not uploaded. Deploy artifact is correct.

### Verdict

**SHIP.** No actionable findings. The woff2 files are self-hosted same-origin, the `@font-face` declarations are spec-compliant, and no new client-side state / off-device requests are introduced. The hardcoded base path is a forward-work note for any future re-rooting, not a current-deploy issue.

### Dependency audit

Skipped — Path 2 net-zero manifest delta verified (`git diff HEAD -- package.json package-lock.json` empty; `node_modules/@fontsource-variable/` cleanup verified absent).
