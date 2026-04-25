# T1 — Layout shell — Audit Issues

**Source task:** [../tasks/T1_layout_shell.md](../tasks/T1_layout_shell.md)
**Audited on:** 2026-04-24
**Audit cycle:** 1 of up to 10
**Audit scope:** spec-vs-implementation re-verification of every AC; design-drift check against [`design_docs/architecture.md`](../../../architecture.md) §1.6, §1 (pandoc anchor contract), §4 (`data-mode` / `data-interactive-only`); ADR-0002; sibling-spec carry-over (DA3-A..D) propagation; status-surface flips; gate re-run on the existing `dist/client/`; M3 surface preservation; `nice_to_have.md` boundary.
**Status:** ✅ PASS

## Design-drift check

No drift detected. Cross-checked against:

- **architecture.md §1.6 (Page chrome — UX layer).** Three-column desktop grid (≥1024px) — left rail / center / right rail — implemented in [`src/layouts/Base.astro`](../../../../src/layouts/Base.astro) lines 161–177 (`grid-template-columns: 260px 1fr 280px` matches the section's commitment). Single-column collapse below 1024px (lines 111–120). Sticky breadcrumb track is reserved (T3 will fill it). M3 `data-interactive-only` rule preserved verbatim (Base.astro lines 79–85; matches §1.6 "Interactive-mode affordances all gated via the M3 T5 `data-interactive-only` CSS contract").
- **architecture.md §1 (pandoc + Lua filter).** Section anchor contract `<a id="ch_N-section-slug">` survives — Base.astro does not touch chapter MDX or the chapter routes. Built artefact `dist/client/lectures/ch_4/index.html` still emits `<article>` wrapper from the route, the `MarkReadButton` `article a[id^="ch_"]` selector is intact (8 mark-read-button hits, 12 section-nav hits in the built page).
- **architecture.md §4 (Local-vs-public mode).** `<body data-mode="static">` SSR default preserved (Base.astro line 195; built HTML emits 1 hit). `detectMode()` boot script preserved (lines 211–216).
- **ADR-0002.** MDN three-column layout — implemented. Single accent + system font stack — implemented (`--mux-accent: #16a34a`, `--mux-font-sans: -apple-system, …` in `chrome.css`). CSS custom properties in `:root` for future dark-mode swap — implemented. No palette / typography / dark mode / search / animation work bled in (per ADR-0002 "Open questions deferred to later tasks"). No new dependencies.
- **`nice_to_have.md` boundary.** Only the "Site UI/UX layer" item promoted — the trigger was already pulled when M-UX kicked off 2026-04-24. T1 implements the layout commitment from that promotion. No silent adoption of dark mode / search / typography sweep (those remain in `nice_to_have.md` per ADR-0002 "Open questions deferred"). Verified by reading `nice_to_have.md` (the parking-lot item explicitly anticipates exactly this milestone) and by greping Base.astro / chrome.css for any of those concerns — none found.
- **Dependencies.** `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` returns empty. CHANGELOG records "Dep audit: skipped — no manifest changes" — correct and consistent.
- **Status-surface discipline.** Three of four surfaces flipped:
  - (a) Per-task spec status line: `**Status:** ✅ done 2026-04-24` (T1_layout_shell.md line 3) ✅
  - (b) `tasks/README.md` row: `✅ done 2026-04-24` ✅
  - (c) Milestone README task table: `✅ done 2026-04-24` ✅
  - (d) Milestone README `Done when` checkboxes: all still `[ ]`. Builder explicitly judged T1 alone insufficient to flip any. Adjudication below in MEDIUM-1 — Builder's call is defensible; surfaced as MEDIUM (not HIGH) because Done-when bullet 1 ("Three-column desktop layout … renders cleanly on every chapter route") is *partially* satisfied (the grid lands and renders without breakage; rails are empty until T2/T4 fill them). The rest legitimately require T2..T8.

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| **Spec deliverable 1** — `Base.astro` rewritten with three-column grid + single-column responsive + four named slots, no drawer-trigger slot | ✅ PASS | [`Base.astro`](../../../../src/layouts/Base.astro) lines 196–209 declare exactly four slots: unnamed (default → main), `breadcrumb`, `left-rail`, `right-rail`. The only `drawer-trigger` mention in the file is the inline comment (lines 9–13) explicitly stating it is NOT a Base-level slot. Built HTML `data-slot=` extraction returns `breadcrumb`, `left-rail`, `main`, `right-rail` — no `drawer-trigger`. |
| **Spec deliverable 2** — `src/styles/chrome.css` created, hosts shared CSS custom properties, documents the split at top | ✅ PASS | [`chrome.css`](../../../../src/styles/chrome.css) exists (74 lines, 2981 bytes). Lines 1–24 are the boundary doc per spec ("layout grid + Base-only rules live inline in `Base.astro`; this file owns shared design tokens"). Tokens defined on `:root` (lines 26–73): accent palette, fg/border/surface neutrals, font stacks, breakpoint, column widths, content-max, spacing scale. CSS custom properties are inherited from `:root` to every descendant — "shared" claim verified (built HTML inlines the `:root{…}` block per page, and the chrome rules reference the tokens via `var(--mux-…)`). |
| **Spec deliverable 3** — `src/components/chrome/` directory created with `.gitkeep` | ✅ PASS | `src/components/chrome/.gitkeep` exists (0 bytes). |
| **Spec deliverable 4** — chapter routes (`lectures/notes/practice/[id].astro`) render through new shell without breakage | ✅ PASS | `grep -n '<article' src/pages/{lectures,notes,practice}/[id].astro` shows the wrapper present in all three: lectures line 40, notes line 32, practice line 34. Built artefacts: `dist/client/{lectures,notes,practice}/ch_4/index.html` each contain the `<article>` wrapper (1 hit each). 37 prerendered pages still ship. |
| **Spec deliverable 5** — T5 contract preserved (`body[data-mode="static"] [data-interactive-only] { display: none !important }` survives) | ✅ PASS | Base.astro lines 79–85 preserve the rule verbatim inside an `is:global` `<style>`. Built HTML inlines the rule (`body[data-mode=static] [data-interactive-only]{display:none!important}`). |
| **Acceptance check 1** — three-column grid at ≥1024px on `/DSA/lectures/ch_1/` (DevTools 1280px) | ⚠️ DEFER (auditor-driven, browser-required) | The CSS is correct (Base.astro lines 161–177). Auditor cannot DevTools-inspect from this shell; build-clean + grid CSS visible in built HTML (`grid-template-columns:260px 1fr 280px` inside `@media (min-width:1024px)`) is non-inferential evidence of structure. Spec explicitly admits "left/right are visually empty (slot content lands in T2/T4)." T1 spec authorises this AC's evidence as auditor smoke; the build evidence is sufficient at T1 maturity. T8 owns the integrated browser smoke. |
| **Acceptance check 2** — single column at <1024px (DevTools 768px), no horizontal scroll | ⚠️ DEFER (auditor-driven, browser-required) | Base.astro lines 111–120 default grid-template uses `grid-template-columns: 1fr` with `grid-template-areas: "breadcrumb" "left-rail" "main" "right-rail"` (single column, four stacked rows). The `@media (min-width: 1024px)` block (lines 161–177) overrides to three columns. Mathematically — at <1024px, the 1fr fallback applies; no horizontal scroll because there is no >100% track. Same deferral rationale as AC 1. |
| **Acceptance check 3** — `<body data-mode="static">` SSR default | ✅ PASS | Built HTML `dist/client/lectures/ch_4/index.html` contains 1 `data-mode="static"` hit at the `<body>` element. |
| **Acceptance check 4** — `data-interactive-only` rule still hides matched elements in static mode | ✅ PASS | Rule survives in built HTML. M3 components carry the attribute and render hidden — 6 `data-interactive-only` hits in the ch_4 built page (matches the count of M3 surfaces: AnnotateButton, AnnotationsPane, MarkReadButton instances + the floating "interactive mode active" badge). |
| **Acceptance check 5** — `npm run build` produces 37 prerendered pages, no order-of-magnitude size regression | ✅ PASS | `find dist/client -name '*.html' \| wc -l` = 37. `du -sb dist/client/` = `4537978` (post-T1) vs `4420947` (pre-M-UX baseline) = `+117031` bytes ≈ +114 KB (~2.6%). Builder's claim verified. Same-order-of-magnitude. T8 owns the formal `<50KB` budget evaluation against the full-tree baseline. |
| **Acceptance check 6** — existing M3 components still render (don't disappear) | ✅ PASS | Built HTML hits: 8× `mark-read-button`, 6× `annotate-button`, 6× `annotations-pane`, 12× `section-nav`. T1 does not re-home (T6 owns); just confirms presence. |
| **Acceptance check 7** — `<article>` + per-section anchor structure preserved (resolves MUX-BO-ISS-01 + ISS-07) | ✅ PASS | All three chapter routes still wrap content in `<article>`. M3 `MarkReadButton.astro` line 70 selector `article a[id^="ch_"]` still resolves — IntersectionObserver target preserved. Pandoc Lua filter anchor format `<a id="ch_N-…">` unaffected (T1 touched no pandoc surfaces). |
| **Acceptance check 8** — exactly four named slots, no `drawer-trigger` slot | ✅ PASS | Slot declarations in Base.astro (lines 197–208): `<slot name="breadcrumb" />`, `<slot name="left-rail" />`, `<slot />` (default → main), `<slot name="right-rail" />`. No `drawer-trigger` slot. T7 will mount the hamburger inside `Breadcrumb.astro`'s component-internal slot per MUX-BO-ISS-04. |
| **Acceptance check 9** — `chrome.css` created with shared tokens + boundary doc (resolves MUX-BO-ISS-08) | ✅ PASS | See spec deliverable 2 above. |
| **Carry-over DA3-A** — `grep -vE` filter consistency across T2/T3/T5 BASE_URL audit-checks | ✅ PASS | T3 `grep -c "grep -vE …"` = 1 (line 44 area). T5 = 1 (line 52 area). T2 carries the original. All three now share the same fallback — verified. |
| **Carry-over DA3-B** — T7 Step 1 step-ordering note | ✅ PASS | `grep -c "MUX-BO-DA3-B" T7_mobile_drawer.md` = 1. Step-ordering note added at top of T7 Step 1 explaining Step 16 must land first to add the drawer-trigger slot to `Breadcrumb.astro`. |
| **Carry-over DA3-C** — soften "~1s" threshold to "few seconds" in T2 + T4 live-listener ACs | ✅ PASS | `grep -c "few seconds"` returns 1 in T2_left_rail.md and 1 in T4_right_rail_toc.md. Phrasing matches the recommended reword in the carry-over entry. |
| **Carry-over DA3-D** — T4 Step 3 vocabulary↔selector consistency, tighten to `article a[id^="ch_"]` | ✅ PASS | `grep -c 'a\[id\^="ch_"\]' T4_right_rail_toc.md` = 1 (line 31). Prose updated to "section anchors inside the article container" (line 31), matching the tightened selector. Citation chain references both DA2-D + DA3-D. Builder picked the recommended option (tighten selector vs drop "headings") — consistent with the carry-over note. |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### MEDIUM-1 — Done-when bullet 1 partial-satisfaction footnote not added

**Surface:** [`design_docs/milestones/m_ux_polish/README.md`](../README.md) line 19. The Done-when bullet "Three-column desktop layout (≥1024px) — left rail, center content, right rail — renders cleanly on every chapter route" is structurally satisfied at the *layout* level by T1 (the 260/1fr/280 grid lands; chapter routes flow through it without breakage; build is clean), but is NOT yet checkable as `[x]` because the rails are empty until T2/T4. Builder consciously left it `[ ]` — defensible reading of "renders cleanly" (which Builder reads as "with content"), but the silent leave-it-`[ ]` decision loses the audit trail of *why* T1 didn't tick it.

**Severity rationale:** MEDIUM, not HIGH — there is no actual status-surface drift (all three flipping surfaces moved together; the Done-when bullets are aspirational and milestone-scoped, and no integrated rendering is claimed by T1 alone). The CLAUDE.md non-negotiable says Done-when bullets that the closed task *satisfies* must flip — T1 does not fully satisfy any single bullet, so no flip is required, but a one-line footnote on the milestone README explaining the partial would future-proof the audit trail (M2 + M3 deep-analyses both caught silent Done-when drift).

**Action / Recommendation:** No change required for this audit cycle. When T2 + T4 land, the Builder closing whichever lands second should flip line 19's `[ ]` to `[x]` with a parenthetical citation `(T1 + T2 + T4 issue files)`. If a future audit catches the bullet still `[ ]` after T2 + T4, escalate to HIGH then. For now: noted, not blocking.

## 🟢 LOW

### LOW-1 — Stray `pandoc_3.1.3+ds-2_amd64.deb` untracked at repo root

**Surface:** `git status --short` shows an untracked `pandoc_3.1.3+ds-2_amd64.deb` at the repo root. Builder used it to extract pandoc into `/tmp/pandoc-local/` for the build (per `pre_m_ux_baseline.md` lines 76–77). Not in a T1 deliverable list; appears to be a build-environment artefact left behind.

**Severity rationale:** LOW — file is untracked (not committed, not in the diff), does not pollute the working tree on commit, and `.gitignore` would catch it cleanly. Build-environment hygiene only.

**Action / Recommendation:** Add `*.deb` to `.gitignore` if convenient, or delete the file once pandoc is installed locally. Not a T1 carry-over — the next Builder picks it up incidentally or ignores it. No code or content change.

### LOW-2 — `chrome.css` token surface includes `--mux-fg-muted` / `--mux-fg-subtle` / `--mux-surface-alt` not yet consumed

**Surface:** [`src/styles/chrome.css`](../../../../src/styles/chrome.css) lines 36–42 declare three neutral tokens (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) that no rule in T1's deliverable consumes. Likely planted ahead for T2/T3/T4/T7 chrome components (left-rail subtle borders, breadcrumb muted text, etc.).

**Severity rationale:** LOW — net cost is a few bytes per page (the `:root{…}` block ships with every prerendered page), and CSS custom property declarations are zero-cost at runtime when unused. Slight YAGNI risk if T2/T3/T4 don't use them; offset by the ADR-0002 "system font + one accent only" guard (no other unused palette adjacent to these).

**Action / Recommendation:** No change. T2/T3/T4 Builders should consume these tokens or remove them at task close. If by T8 any token in `chrome.css` is still unconsumed, T8's audit can prune.

## Additions beyond spec — audited and justified

- **Spacing scale (`--mux-space-1..8`).** Not explicitly in T1's spec, but the spec's deliverable 2 lists "any rule that will be referenced by `chrome/` components in T2/T3/T4" as in-scope for `chrome.css`. Spacing tokens fit that scope cleanly and are consumed by Base.astro's main/rail padding rules (lines 132, 147, 175). Justified.
- **Neutral fg/border/surface palette** (`--mux-fg`, `--mux-border-subtle`, etc.). Same justification — Base.astro consumes `--mux-border-subtle` for the rail dividers (lines 153, 169, 172) and `--mux-fg`/`--mux-surface` for body styling (lines 102–106). Justified.
- **Floating "interactive mode active" badge styling** (lines 182–192). Explicitly preserved from the prior 51-line shell per the spec's "preserve M3 contracts" instruction (Step 1 + Step 3). Justified.
- **`min-width: 0` on `[data-slot="main"]`** (line 124). CSS grid quirk: prevents a long line of code or wide MDX content from blowing the main column wider than its track. Common idiom; not introducing scope, just preventing overflow. Justified.

No invented scope. No drive-by refactors. No dependency adds. No animation / palette / typography work that ADR-0002 deferred.

## Verification summary

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build artefacts present | `ls dist/client/` | ✅ present (build re-run skipped per Builder report — pandoc available via `/tmp/pandoc-local`; relied on existing artefacts which match Builder's claim) |
| Page count | `find dist/client -name '*.html' \| wc -l` | ✅ 37 |
| `<article>` wrapper preserved (built) | `grep -c '<article' dist/client/lectures/ch_4/index.html` | ✅ 1 (also verified for notes + practice) |
| `<article>` wrapper preserved (source) | `grep -n '<article' src/pages/{lectures,notes,practice}/[id].astro` | ✅ 3/3 routes |
| `<body data-mode="static">` SSR default | `grep -c 'data-mode="static"' dist/client/lectures/ch_4/index.html` | ✅ 1 |
| Slot landmarks correct | `grep -oE '<(nav\|aside\|main)[^>]*data-slot' …` | ✅ `<nav data-slot="breadcrumb">`, `<aside data-slot="left-rail">`, `<main data-slot="main">`, `<aside data-slot="right-rail">` |
| Exactly 4 slots (no drawer-trigger) | `grep -oE 'data-slot="[a-z-]+"' \| sort -u` | ✅ `breadcrumb`, `left-rail`, `main`, `right-rail` (no `drawer-trigger`) |
| M3 surfaces still render | `grep -oE 'mark-read-button\|section-nav\|annotations-pane\|annotate-button' \| sort \| uniq -c` | ✅ 8 / 12 / 6 / 6 — all four M3 surfaces present |
| `data-interactive-only` rule preserved | `grep -oE 'data-interactive-only' \| wc -l` | ✅ 6 hits (matches expected M3 surface count + interactive-mode badge) |
| Manifest unchanged | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` | ✅ empty |
| `chrome.css` exists with tokens | `ls src/styles/chrome.css; head -24 src/styles/chrome.css` | ✅ 2981 bytes, boundary doc lines 1–24 |
| `chrome/.gitkeep` exists | `ls src/components/chrome/.gitkeep` | ✅ 0 bytes |
| `pre_m_ux_baseline.md` exists | `ls design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` | ✅ 3898 bytes |
| DA3-A T3 grep -vE | `grep -c "grep -vE …" T3_breadcrumb.md` | ✅ 1 |
| DA3-A T5 grep -vE | `grep -c "grep -vE …" T5_index_dashboard.md` | ✅ 1 |
| DA3-B T7 step-ordering note | `grep -c "MUX-BO-DA3-B" T7_mobile_drawer.md` | ✅ 1 |
| DA3-C T2 + T4 "few seconds" reword | `grep -c "few seconds" T2_left_rail.md T4_right_rail_toc.md` | ✅ 1 / 1 |
| DA3-D T4 selector tightened | `grep -c 'a\[id\^="ch_"\]' T4_right_rail_toc.md` | ✅ 1 |
| Status surface (a) per-task | `sed -n '3p' T1_layout_shell.md` | ✅ `**Status:** ✅ done 2026-04-24` |
| Status surface (b) tasks/README | `grep -E '^\| T1 ' tasks/README.md` | ✅ `✅ done 2026-04-24` |
| Status surface (c) milestone README | `grep -E '^\| T1 ' README.md` | ✅ `✅ done 2026-04-24` |
| Status surface (d) Done-when bullets | (visual inspection) | ⚠️ all `[ ]` — adjudicated MEDIUM-1; defensible at T1 maturity |
| Size delta | `du -sb dist/client/` (post) − pre-M-UX baseline | ✅ +117031 B (~114 KB; under T8 alarm threshold for net-new JS, surfaced for T8 budget evaluation) |
| Net new JS | inspection: no `_astro/*.js` directory introduced | ✅ 0 KB net JS (T1 introduces no islands) |

**Build re-run note.** The existing `dist/client/` was used as ground truth; pandoc 3.1.3 is available in this environment via `/tmp/pandoc-local/`, but a full rebuild was not performed because the existing artefacts match the Builder's reported numbers exactly (`du -sb` = `4537978`, page count = 37) and no source-tree changes have been made since the Builder's build. If post-audit work touches Base.astro or chrome.css, the next audit cycle should rebuild.

## Issue log

| ID | Severity | Description | Status | Owner / next touch |
| -- | -------- | ----------- | ------ | ------------------ |
| M-UX-T1-ISS-01 | MEDIUM | Done-when bullet 1 partial-satisfaction footnote not yet added | DEFERRED | T2 or T4 Builder (whichever lands second) flips line 19 with parenthetical citation |
| M-UX-T1-ISS-02 | LOW | Stray `pandoc_3.1.3+ds-2_amd64.deb` untracked at repo root | OPEN | Next Builder removes file or adds `*.deb` to `.gitignore` |
| M-UX-T1-ISS-03 | LOW | `chrome.css` declares 3 neutral tokens not yet consumed (`--mux-fg-muted`, `--mux-fg-subtle`, `--mux-surface-alt`) | OPEN | T2/T3/T4 Builders consume or T8 audit prunes |

## Deferred to nice_to_have

N/A. No findings map to `nice_to_have.md`.

## Propagation status

**M-UX-T1-ISS-01 (DEFERRED).** Carry-over targets are T2 and T4 — whichever lands second is responsible for flipping the Done-when bullet. Rather than appending a heavy-weight `## Carry-over from prior audits` block to both T2 and T4 specs (which would be redundant and force the wrong Builder to do the work if T2 lands before T4), this deferral is recorded **only here** and surfaced inline as MEDIUM-1. The convention: T2 Builder reads this issue file before flipping T2's status; if T4 has already landed by then, T2 closes the bullet; otherwise, T4 closes it. M-UX-T1-ISS-02 and M-UX-T1-ISS-03 are LOW and not forward-deferred — any future Builder picks them up incidentally or T8's deploy-verification audit catches them.

No `## Carry-over from prior audits` blocks were appended to T2/T3/T4/T5/T7 by this audit, because:
- The four DA3-A..D carry-over items were already resolved by T1's Builder this cycle (verified above) — propagation already complete via the Builder's edits.
- M-UX-T1-ISS-01's deferral is light-touch and surfaced through this issue file, not through carry-over blocks.

**Audit verdict propagation.** The cycle-1 audit returns `FUNCTIONALLY CLEAN` to the invoker. T1 closes cleanly; M-UX-T1-ISS-01 (MEDIUM) is non-blocking and tracked here for the T2/T4 follow-up.

## Security review

**Reviewed on:** 2026-04-24
**Reviewer:** security-reviewer subagent
**Scope:** `src/layouts/Base.astro`, `src/styles/chrome.css`, `src/lib/mode.ts` (boot-script dependency). No API routes, pandoc pipeline, code-execution paths, or annotation handlers were touched in T1 — those surfaces are out of scope for this gate.

### Checks

| # | Check | Result |
|---|-------|--------|
| 1 | Unsafe DOM handling (`set:html`, `innerHTML`, `eval`, `new Function`, dynamic attribute interpolation of user data) | PASS — only `{title}` (Astro-escaped) and `import.meta.env.BASE_URL` (build-time constant) interpolated into HTML; `dataset.mode` assigned from closed-set `{'static','interactive'}` only |
| 2 | `import.meta.env` leakage | PASS — sole reference is `BASE_URL` (public subpath, non-secret); no `*_SECRET`, `*_KEY`, Ollama URL, or loopback address exposed via SSR |
| 3 | `data-mode` boot script integrity | PASS — `<body data-mode="static">` SSR default and `detectMode().then(mode => document.body.dataset.mode = mode)` client script preserved verbatim; `detectMode()` returns only `'static'` or `'interactive'` (closed set, no injection surface) |
| 4 | `data-interactive-only` rule preservation | PASS — `body[data-mode="static"] [data-interactive-only] { display: none !important; }` present verbatim in `<style is:global>` at Base.astro lines 82–84; `is:global` prevents Astro scope-hashing the selector; `!important` intact |
| 5 | `chrome.css` external resource / injection surface | PASS — 74-line file is pure `:root` custom-property declarations; no `@import`, no `url(...)`, no `expression()`, no `javascript:` string; system font stack has no web-font fetch |

### Critical / High

None.

### Advisory

`src/lib/mode.ts` emits the `http://localhost:8080` loopback literal into every client bundle page. This is intentional (aiw-mcp probe address, per architecture.md §4) and consistent with the threat model (local-only, no secret). Noted for completeness: if the project ever adds a build-time env override for that URL, the same `import.meta.env` leakage check should be re-run to confirm the override value is not a secret.

### Verdict

**SHIP.** No security issues. T1's threat surface (layout shell + CSS token file) is clean on all five applicable checks.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
