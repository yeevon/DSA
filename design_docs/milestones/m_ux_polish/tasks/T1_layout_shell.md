# T1 — Layout shell: three-column grid + responsive scaffold

**Status:** ✅ done 2026-04-24
**Depends on:** —
**Blocks:** T2, T3, T4, T5, T6, T7, T8 (everything)

## Why

[ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md) commits to an MDN-docs three-column layout (left chapter nav, center content, right TOC + annotations) on desktop and a single column with hamburger drawer on mobile. T1 lands the shell — the grid, the breakpoint, the slot scaffolding — that every other M-UX task plugs into. No real content in the slots yet; T2–T6 fill them.

The current `src/layouts/Base.astro` is 51 lines: `<header>cs-300</header>` + `<main>{ slot }</main>`. T1 replaces it with the shell.

## Deliverable

- `src/layouts/Base.astro` rewritten — three-column CSS grid on `≥1024px`, single column below. Four named slots: `breadcrumb`, `left-rail`, `default` (center / chapter content), `right-rail`. Slots default to empty/null so chapters that don't fill them render cleanly. (Drawer trigger is **not** a Base-level slot — T7 mounts the hamburger inside `Breadcrumb.astro` so the breadcrumb's flexbox layout owns its placement. Resolves MUX-BO-ISS-04 / MEDIUM-1.)
- `src/styles/chrome.css` — created as part of T1 to host shared CSS custom properties (the accent colour, font-stack token, breakpoint variable) and any rule that will be referenced by `chrome/` components in T2/T3/T4. Layout grid + Base-only rules stay inline in `Base.astro` `<style>`. Document the split at the top of `chrome.css`. (Resolves MUX-BO-ISS-08 / MEDIUM-5 — no "or inline" disjunction; `chrome.css` is a T1 deliverable.) Defer the palette decision per ADR-0002 — system font + one accent only.
- `src/components/chrome/` directory created with empty `.gitkeep` (T2–T7 populate). Subsequent M-UX components live here.
- Each existing chapter route (`src/pages/lectures/[id].astro`, `notes/[id].astro`, `practice/[id].astro`) verified to render through the new shell without breakage. No content-area changes — the existing slot content still flows into `default`.
- T5 contract preserved: `body[data-mode="static"] [data-interactive-only] { display: none !important }` rule survives the rewrite.

## Steps

0. **Baseline capture prerequisite (resolves MUX-BO-DA2-C / MEDIUM).** Before writing any T1 code, confirm `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` exists. If it does not, run T8 Step 0 first — `git worktree add /tmp/cs-300-baseline bf9c773` (with stash-and-restore fallback if the working tree is dirty), capture the three numbers (`du -sh dist/client/`, `find dist/client -name '*.html' | wc -l` = 37, sum of `dist/client/_astro/*.js` sizes), and write `pre_m_ux_baseline.md` with the pinned numbers under a `## Pre-M-UX baseline` section. T1 must not start until that file exists, otherwise T8's <50KB delta budget becomes unenforceable (the post-M-UX measurement has no environment-matched baseline to compare against). See [`T8_deploy_verification.md`](T8_deploy_verification.md) Step 0 for the full procedure.
1. Audit the existing `Base.astro` — list every existing prop, slot, and `<head>` tag (KaTeX CSS, Shiki, generator meta, the M3 `data-mode` script, the `data-interactive-only` rule). Catalogue what must survive the rewrite.
2. Replace `Base.astro` body with the new shell:
   - Single root `<div class="chrome">` using CSS grid.
   - Four named slot regions; each wrapped in a `<div data-slot="...">` for predictable selectors and accessible landmarks (`<aside>` for left + right rails, `<nav>` for breadcrumb, `<main>` for center).
   - CSS grid template: desktop columns `260px 1fr 280px` (or similar — pick + record), single column below 1024px.
   - Preserve `<article>` as the wrapper for chapter content. The existing chapter routes (`src/pages/lectures/[id].astro` line 40 and the notes/practice equivalents) wrap chapter MDX in `<article>`. M3's `MarkReadButton.astro` (line 70) queries `article a[id^="ch_"]` for its IntersectionObserver; the `<a id="ch_N-…">` per-section anchor structure (emitted by the M2 pandoc Lua filter, see [`architecture.md`](../../../architecture.md) §1) must also survive. Replacing `<article>` with `<div class="content">` would silently break M3's "current section" detection — see MUX-BO-ISS-01 / HIGH-1.
3. Inline the M3 `data-mode` script + `data-interactive-only` CSS rule unchanged. T1 must not regress T5's mode-detection contract.
4. Smoke each chapter route: `npm run dev`, open `/DSA/lectures/ch_1/`, `/DSA/notes/ch_1/`, `/DSA/practice/ch_1/`. Center column renders the chapter content. Left/right rails are empty (slots not yet populated) but reserved space is visible at desktop width. Mobile (375px in DevTools): single column, no horizontal scroll.
5. Run `npm run build` — verify 37 pages still ship, no build errors.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/layouts/Base.astro` renders the three-column grid at `≥1024px`. Auditor opens DevTools at 1280px width on `/DSA/lectures/ch_1/`, confirms three named regions are visible (left rail, center, right rail) — even if left/right are visually empty (slot content lands in T2/T4).
- [ ] At `<1024px` (auditor toggles to 768px in DevTools), layout collapses to single column. No horizontal scroll. Center content remains readable.
- [ ] `<body data-mode="static">` still rendered server-side as default (T5 contract). Auditor curls a built page from `dist/client/` and confirms.
- [ ] `data-interactive-only` CSS rule still hides matched elements in static mode. Auditor adds a `<div data-interactive-only>SHOULD-BE-HIDDEN</div>` to a chapter MDX and confirms it's not visible in static mode at preview.
- [ ] `npm run build` produces 37 prerendered pages. No new build errors. `dist/client/` size delta within reason (T8 owns the formal budget; T1 just confirms no order-of-magnitude regression).
- [ ] Existing M3 components (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) still render somewhere on the chapter pages — possibly in their original positions, possibly broken visually. T1 does not re-home them (T6's job); it just confirms they don't disappear.
- [ ] **`<article>` wrapper + per-section anchor structure preserved** (resolves MUX-BO-ISS-01 / HIGH-1 + MUX-BO-ISS-07 / MEDIUM-4). The chapter content wrapper remains `<article>` in `src/pages/{lectures,notes,practice}/[id].astro`. Auditor verifies by `grep -n '<article' src/pages/{lectures,notes,practice}/[id].astro` (each must show the tag) + DOM inspection of a built `dist/client/lectures/ch_4/index.html` (search for `<article`). The `<a id="ch_N-…">` anchor pattern emitted by the pandoc Lua filter (M2 contract) survives — `MarkReadButton.astro` line 70 `article a[id^="ch_"]` selector must still resolve to the section anchors, otherwise IntersectionObserver-driven "current section" detection breaks silently.
- [ ] **Four named slots only** (`breadcrumb`, `left-rail`, `default`, `right-rail`) — resolves MUX-BO-ISS-04 / MEDIUM-1. Auditor confirms `Base.astro` declares no `drawer-trigger` slot. T7's hamburger lives inside `Breadcrumb.astro`'s slot, not at the Base level.
- [ ] **`src/styles/chrome.css` created** (resolves MUX-BO-ISS-08 / MEDIUM-5) — file exists with the shared custom properties + rules consumed by T2/T3/T4. Layout grid stays inline in `Base.astro <style>`. Top of `chrome.css` documents the split.

## Notes

- **Decompose trigger.** If the responsive grid + slot scaffold + Base.astro rewrite together exceed one session, split into T1a (shell + grid) + T1b (slot wiring + chapter route verification).
- **CSS approach decision (pinned per MUX-BO-ISS-08 / MEDIUM-5).** Inline `<style>` in `Base.astro` for layout grid + Base-only rules; `src/styles/chrome.css` (T1 deliverable) for shared CSS custom properties and rules referenced by `chrome/` components in T2/T3/T4. Document the rule at the top of `chrome.css`. (Earlier "or inline" disjunction is dropped — `chrome.css` is created in T1, not deferred to T2.)
- **Drawer trigger placement (pinned per MUX-BO-ISS-04 / MEDIUM-1).** Drawer trigger button is not a Base-level slot — T7 mounts it inside `Breadcrumb.astro` so the breadcrumb's flexbox layout owns its placement. T1 declares only four slots (`breadcrumb`, `left-rail`, `default`, `right-rail`).
- **Don't introduce new dependencies.** No CSS framework (Tailwind, etc.). Native CSS grid + media queries are sufficient — keeps the dep-audit gate quiet and matches the project's "no new dep without ADR" non-negotiable.
- **Future surfaces** (M5 review queue, M6 Monaco, M7 audio player) will plug into named slots. T1's slot naming is the contract those surfaces compose against — name them deliberately.
- **CSS custom properties** for colours: define them in `:root` so dark-mode adoption (deferred per ADR-0002) is a one-rule swap.

## Carry-over from prior audits

Cleanup items from cycle-5 deep analysis on the breakout audit (LOW severity, doc polish only — no implementation impact). T1's Builder picks these up incidentally during T1 implementation; they touch sibling task specs, not T1's own deliverables. Each is a 1–3-line edit. Source: [`../issues/m_ux_breakout_audit.md`](../issues/m_ux_breakout_audit.md) third deep-analysis section (or successor cycle-5 section if added).

- [x] **DA3-A — `grep -vE` filter consistency across T2/T3/T5 BASE_URL audit-checks.** T2's BASE_URL audit-check (line 42) ends with a fallback machine-actionable filter `grep -nE '/DSA/' … | grep -vE '^[^:]+:[0-9]+:\s*(<!--|//)'` for when comment-hits accumulate. T3 (line 44) and T5 (line 52) end at "Default policy: reviewer-eyes, not blind-fail" — no fallback. Apply uniformly: append the same `grep -vE` line to T3 and T5, **or** remove it from T2. Pick one and apply across all three. **Resolved 2026-04-24** — appended the same `grep -vE` fallback line to T3's BASE_URL audit-check (T3 line 44) and T5's (T5 line 52) so all three (T2/T3/T5) carry the identical fallback. Each updated note now cites both `MUX-BO-DA2-E` and `MUX-BO-DA3-A`.
- [x] **DA3-B — T7 Step 1 step-ordering note.** T7 Step 1 line 25 says the hamburger lives "inside `Breadcrumb.astro`'s component-internal drawer-trigger slot" — but that slot doesn't exist until T7 Step 16 modifies `Breadcrumb.astro` to add it. Add a one-line note to T7 Step 1: *"Step 16 lands first — `Breadcrumb.astro` doesn't ship the drawer-trigger slot in its T3 deliverable; T7 adds it."* Or renumber so the Breadcrumb modification comes before the hamburger mount. **Resolved 2026-04-24** — added a step-ordering note as a new bullet at the top of T7 Step 1 (cites `MUX-BO-DA3-B`); the renumber path was rejected because the hamburger mount is the load-bearing user-facing artefact and Step 1's framing should remain as-written.
- [x] **DA3-C — Soften "~1s" threshold in DA2-A/DA2-B live-listener ACs.** T4 line 57 + T2 line 46 both say "observes the indicator/checkmark refresh within ~1s." Listener handler is a GET fetch — round-trip plus DOM update could exceed 1s on a slow connection. Reword to *"within a few seconds (typically sub-second on localhost; the constraint is 'before the user reloads', not a hard latency budget)"*. Same change in both files. **Resolved 2026-04-24** — both ACs reworded to the proposed phrasing; both notes now cite `MUX-BO-DA3-C` alongside their original DA2 IDs.
- [x] **DA3-D — T4 Step 3 vocabulary vs selector cleanup.** Prose says "query `[id]` **headings** inside the article container that match TOC entries." Selector is `article [id]` (broader than headings; matches any `[id]` descendant). Either drop "headings" from the prose, or tighten selector to `article a[id^="ch_"]` (mirrors M3 `MarkReadButton`'s `article a[id^="ch_"]` selector). Pick one for vocabulary↔selector consistency. **Resolved 2026-04-24** — selector tightened to `article a[id^="ch_"]` (the recommended option; mirrors `MarkReadButton.astro` line 70 verbatim) and prose updated to "section anchors" so the vocabulary matches. T4 Step 3's note now cites both `MUX-BO-DA2-D` and `MUX-BO-DA3-D`. Note: the tightening **strengthens** DA2-D's `<article>`-wrapper-contract guarantee — both selectors are scoped to `article`, but the narrower `a[id^="ch_"]` form additionally guards against future MDX content introducing unrelated `[id]` descendants inside `<article>`.

These are doc-polish only — no source code change required. Tick each as it lands. If T1 grows past one session because of these, defer the un-finished cleanups to the corresponding sibling-task issue files at task-close time (cleanest path: the auditor flips them to RESOLVED in `m_ux_breakout_audit.md` or carries them into T2/T3/T4/T5/T7 issue files when those tasks land).
