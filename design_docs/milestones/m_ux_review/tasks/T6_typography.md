# T6 — Typography pairing + ADR-0002 amendment

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) finding F11 (MED, ~1h + ADR amendment)
**Depends on:** —
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), [`design_docs/architecture.md` §1 page chrome](../../../architecture.md)

## Why T6 exists (context)

ADR-0002 explicitly deferred typography ("Visual style — color palette, typography family. Deferred to a follow-on milestone or back to `nice_to_have.md` once M-UX layout ships. M-UX uses the system font stack + one accent colour until then"). The 2026-04-27 review pushes back on that deferral for one specific reason:

> "ADR-0002 explicitly defers typography. Fair — but this is a 200-hour reading interface rendering KaTeX, monospace, body prose, and dense code listings side-by-side. The system stack on macOS, Windows, and Android renders all four differently, which means your callout boxes, code listings, and math have inconsistent rhythm across the user's three devices. One pinned web-safe pairing — a humanist sans for body, a real mono with ligatures for code — costs ~30KB and removes a whole class of cross-device polish bugs." — review F11

The fix is small (one CSS variable swap, one font import) but requires an ADR-0002 amendment (the deferral itself was an ADR commitment). T6 lands the amendment inline.

## Goal

1. **Pin a body sans + monospace pair.** Inter (or Source Sans 3) for body; JetBrains Mono for code. Both ship the math characters KaTeX falls back through, both have proper italic + 600 weights.
2. **Amend ADR-0002.** "Open questions deferred — Visual style" entry flips from "deferred" to "Inter / Source Sans 3 + JetBrains Mono pinned" with a one-paragraph rationale citing F11 + cross-device rhythm.
3. **Wire the fonts via self-hosted woff2** (no third-party CDN — keeps the deploy fully static + offline-capable). Bundle delta target: ~30 KB compressed.

## Spec deliverables

### D1. Font choice (between two reasonable bodies)

The review names two acceptable body fonts. Pick one:

- **Inter** — modern, optimised for screen reading at small sizes, generic feel. ~50KB woff2 for the variable font including italic + 400/600/700.
- **Source Sans 3** — slightly warmer, more reading-tuned, also handles math fallbacks well. ~45KB woff2 variable.

**Pick Source Sans 3.** Reasoning: cs-300 is a long-form reading product (the review's framing); reading-tuned wins over screen-tuned. If the auditor finds Source Sans 3 has a coverage gap KaTeX hits (uncommon but possible for some Greek / math operators), fall back to Inter — both cleared the review's bar.

The decision lives in the issue file (Builder picks; Auditor verifies). If the Builder has a preference, document it.

### D2. Self-hosted woff2 (`src/styles/chrome.css` + `public/fonts/`)

- Drop woff2 files into `public/fonts/`:
  - `source-sans-3-variable.woff2` (or `inter-variable.woff2` — whichever D1 picks).
  - `jetbrains-mono-variable.woff2`.
- `src/styles/chrome.css` `@font-face` declarations with `font-display: swap` so the FOUT is brief but content still renders during font load.
- New tokens:
  - `--mux-font-body: "Source Sans 3", system-ui, sans-serif;` (or Inter)
  - `--mux-font-mono: "JetBrains Mono", ui-monospace, monospace;`
- Replace existing `system-ui, ...` references in `chrome.css` with `var(--mux-font-body)`. Replace existing monospace references (KaTeX, `.code-block`, the chapter-tag mono on cards) with `var(--mux-font-mono)`.

### D3. KaTeX + math compatibility

Verify KaTeX still renders mathematical typography correctly post-swap. KaTeX has its own font stack for math — but body math (e.g. `$O(n \log n)$` inline) defers to the document body font for non-math characters. Source Sans 3 + Inter both ship the math characters cs-300 hits in chapter prose (Greek letters, plus/minus, integrals, summations).

Smoke check: open a chapter with heavy math (ch_5 hash-tables has `$O(n)$` references; ch_9 AVL has more complex expressions; ch_13 Stirling's approximation `$\log_2(n!) \ge \tfrac{1}{2} n \log_2 n$`). Verify no glyph fallbacks (e.g. boxes / question-mark glyphs) appear.

### D4. ADR-0002 amendment

The ADR-0002 "Open questions deferred to later tasks" section currently has:

> **Visual style** (color palette, typography family). Deferred to a follow-on milestone or back to `nice_to_have.md` once M-UX layout ships. M-UX uses the system font stack + one accent colour until then.

Edit to:

```markdown
> **Visual style — typography (resolved 2026-04-27 in M-UX-REVIEW T6).** Body: Source Sans 3 (or Inter — Builder's call between two F11-cleared options). Mono: JetBrains Mono. Both self-hosted woff2 in `public/fonts/`, declared via `@font-face` in `src/styles/chrome.css` with `font-display: swap`. Bundle delta ~30–80 KB compressed depending on weights kept. Rationale: cs-300 is a 200-hour reading product rendering body prose + KaTeX math + code listings + monospace tags side-by-side; the system font stack renders these inconsistently across macOS / Windows / Android, breaking visual rhythm at the same character size. Pinning the pair removes that class of cross-device polish drift. **Color palette** remains system-default + `--mux-accent`; **dark mode** remains deferred per the original entry.
```

The remaining deferred items (color palette, dark mode, search, per-section completion, animation discipline) stay deferred — T6 only resolves the typography-family question.

### D5. Architecture.md update

`design_docs/architecture.md` §1 page-chrome subsection currently doesn't name a font stack. Add a one-liner:

> Typography: Source Sans 3 (body) + JetBrains Mono (code), self-hosted in `public/fonts/`, declared via CSS custom properties (`--mux-font-body`, `--mux-font-mono`) so any future dark-mode / theme-swap work is a variable swap. Resolved at M-UX-REVIEW T6 — see ADR-0002.

### D6. Functional-test assertions (`scripts/functional-tests.json`)

New test cases:

- `body-font-source-sans-3` — on `/DSA/lectures/ch_4/`, computed `font-family` of `<body>` (or `<main>`) starts with `Source Sans 3` (or `Inter`, whichever D1 picks). Use a regex assertion that allows fallbacks but requires the chosen primary first.
- `mono-font-jetbrains` — on `/DSA/lectures/ch_4/`, computed `font-family` of the first `<pre>` (Shiki code block) starts with `JetBrains Mono`.
- `font-loaded-not-fallback` — on `/DSA/lectures/ch_4/`, the rendered glyph width of a representative letter (e.g. measure an `<h1>` "M" character) matches the chosen font's expected width within 1px tolerance. Catches the case where the font fails to load and the system fallback paints invisibly. (Optional but valuable; if Selenium can't measure reliably, fall back to checking `document.fonts.check('1em "Source Sans 3"')` returns true.)
- `mono-on-chapter-tag` — `.ch-tag` (the `ch_4` chapter-number tag on cards) computed `font-family` starts with `JetBrains Mono`.

### D7. Bundle size diff

Capture `dist/client/` byte size before and after T6. Expected delta: +60–80 KB (two woff2 variable fonts at ~30–50 KB each). Document in the issue file. The delta sits inside the M-UX cumulative +756 KB and isn't budget-blocking, but the audit cites the actual number for the M-UX size-budget tracking line in `m_ux_polish/README.md`.

## Acceptance checks (functional-test assertions, runnable by the auditor)

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F11 | Body font computed family matches the chosen primary (Source Sans 3 or Inter). | `body-font-source-sans-3` |
| AC2 | F11 | Mono font computed family is JetBrains Mono on `<pre>` and `.ch-tag`. | `mono-font-jetbrains`, `mono-on-chapter-tag` |
| AC3 | F11 | Font is loaded (not silently falling back to system stack). | `font-loaded-not-fallback` (or `document.fonts.check`) |
| AC4 | ADR | ADR-0002 typography deferral entry is amended (no longer reads "deferred"). | (doc-content grep) |
| AC5 | ADR | Architecture.md §1 mentions the chosen body + mono pair + the `--mux-font-body` / `--mux-font-mono` variables. | (doc-content grep) |
| AC6 | F11 | KaTeX math renders without missing-glyph boxes — visual smoke check on ch_5 / ch_9 / ch_13. | (auditor visual confirmation, screenshot cited) |
| AC7 | regression | M-UX T9 functional-test cases all still pass; no layout drift from font metrics changing. | (existing T9 cases) |
| AC8 | size | `dist/client/` byte delta documented in issue file (expected ~60–80 KB increase). | (build-time du) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview`.
3. `python scripts/functional-tests.py …` — exit 0.
4. Auditor opens `/DSA/lectures/ch_4/`, `/DSA/lectures/ch_9/`, `/DSA/lectures/ch_13/` and visually confirms:
   - Body prose renders in Source Sans 3 (or Inter).
   - Code blocks render in JetBrains Mono.
   - KaTeX math expressions render with no missing glyphs.
   - Italic + bold + 600-weight cuts all available.
5. `python scripts/smoke-screenshots.py …` — capture 1280×800 of three chapters and inspect visually for FOUT artifacts (font-display: swap may show one frame of fallback during cold load — acceptable; persistent fallback is not).
6. Cross-browser spot check: Firefox + Safari (or just confirm the woff2 + `@font-face` declarations are correct; both browsers honour the spec).

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T6 row.
- (c) `m_ux_review/README.md` task table T6 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkbox for F11 (with citation parenthetical pointing at the per-task issue file).
- (e) ADR-0002 typography deferral entry amended.
- (f) `design_docs/architecture.md` §1 page-chrome subsection updated.

## Carry-over from prior audits

- [x] **M-UX-REVIEW-T4-ISS-02 (LOW)** — `architecture.md` §1 mobile subsection (around the "Mobile chrome reduction (M-UX-REVIEW T4)" block) currently mentions only the `:empty { display: none }` rule on the chrome-level `drawer-trigger` slot wrapper. The shipped implementation (`Base.astro:331-333`) ALSO has an explicit `.chrome > [data-slot="drawer-trigger"] { display: none }` inside the `@media (min-width: 1024px)` block, needed because the slot wrapper has a child element on chapter routes (the `<DrawerTrigger>` button itself, whose own component-level media query hides it at ≥1024px), so `:empty` cannot match. While the typography ADR-0002 amendment is open, add a one-sentence amendment to that subsection naming both rules and the dual-rule rationale (the existing `Base.astro:317-326` docstring is the authoritative source on the *why*). Source: [`../issues/T4_issue.md`](../issues/T4_issue.md) LOW-1. **RESOLVED 2026-04-27 in T6** — landed in `architecture.md` "Mobile chrome reduction" item (1) (drawer trigger extracted from the breadcrumb): both rules + dual-rule rationale + `Base.astro:317–326` docstring citation now in-place.
- [x] **M-UX-REVIEW-T4-ISS-03 (LOW)** — `architecture.md` line 125 still reads "Right-rail TOC moves to a collapsed `<details>` summary at content top." That was true pre-T4 (M-UX T7 wrapped the right-rail TOC in `<details class="toc-mobile-collapse">` at every viewport <1024px). Post-T4 it's only true at 768–1023px (tablet); at <768px the right-rail desktop TOC track + the M-UX T7 mobile-collapse fallback are both hidden (per `Base.astro` mobile @media block, T4 cycle 2) and the on-this-page affordance lives in `<MobileChapterTOC>` rendered inside `<header>` after `<CollectionTabs>`. Refresh that sentence to qualify "moves to a collapsed `<details>` summary at content top" as the 768–1023px tablet shape, and point at the Mobile DOM order block immediately below for the post-T4 <768px shape. Source: [`../issues/T4_issue.md`](../issues/T4_issue.md) LOW-2. **RESOLVED 2026-04-27 in T6** — `architecture.md` §1 "Mobile (<1024px)" sentence now distinguishes the 768–1023px tablet shape (right-rail aside with its `toc-mobile-collapse` `<details>`) from the <768px phone shape (`<MobileChapterTOC>` inside `<header>`) and points the reader at the Mobile DOM order block.
- [x] **M-UX-REVIEW-T5-ISS-02 (LOW)** — `architecture.md:84` names the MDX `pre` mapping as a CodeBlock render path but doesn't acknowledge it as a deviation from the original T5 spec D2 wording (which assumed the M2 `<CodeBlock>` already wrapped Shiki output and therefore showed only the explicit-JSX render shape). Append a half-sentence to the §1 component-library `<CodeBlock>` paragraph clarifying the rationale: Astro's MDX integration emits Shiki's `<pre class="astro-code">` directly and bypasses the M2 wrapper, so the `pre: CodeBlock` mapping in the three chapter route templates (`src/pages/{lectures,notes,practice}/[id].astro`) is the minimal route to make every fenced block on every chapter page pick up the F7 polish — given the spec constraint that forbids filter-time wrapping in `scripts/pandoc-filter.lua`. Folds into T6's existing §1 edit. Source: [`../issues/T5_issue.md`](../issues/T5_issue.md) LOW-1. **RESOLVED 2026-04-27 in T6** — landed in the §1 component-library `<CodeBlock>` paragraph; deviation rationale + spec-constraint citation in-place.
- [x] **M-UX-REVIEW-T5-ISS-03 (LOW)** — `architecture.md:478` §6 forward-work item ("Per-language `<CodeBlock>` syntax detection") describes the filter-side work only. Append a bullet naming the component-side swap target: the visible header tag at `src/components/callouts/CodeBlock.astro:84` is the static literal `<span class="code-block-lang">C++</span>` (Path A per T5 D2), not prop-derived; when the §6 trigger fires (first non-C++ chapter block) the future Builder swaps that literal for a prop-driven render (`<span class="code-block-lang">{lang}</span>`) and threads the language hint from the pandoc filter through MDX frontmatter or a `data-language` read on the slot's `<pre>`. Source: [`../issues/T5_issue.md`](../issues/T5_issue.md) LOW-2. **RESOLVED 2026-04-27 in T6** — landed in §6 "Per-language `<CodeBlock>` syntax detection" forward-work item; component-side counterpart now names the `CodeBlock.astro:84` literal + the prop-driven swap target + the `data-language` slot-read shortcut.

## Out of scope

- Color palette redesign. ADR-0002 keeps it deferred; F12 (accent semantic split) is in `nice_to_have.md` §UX-5.
- Dark mode. Still deferred per ADR-0002.
- Variable-font axis customisation (e.g. dynamically sliding weight). Out — fixed weights at 400 / 600 / 700.
- Font subsetting (only ship Latin glyphs). The KaTeX math fallback case requires keeping the math characters; subsetting risks breaking that. Skip in T6; revisit only if bundle pressure forces it.
- Web-font preload `<link rel="preload">` tuning. Default `font-display: swap` is acceptable; preload is a perf polish, not a correctness fix.
- Third-party CDN font hosting. Out — self-hosted is the cs-300 default (offline-capable, no third-party requests, simpler privacy posture).
