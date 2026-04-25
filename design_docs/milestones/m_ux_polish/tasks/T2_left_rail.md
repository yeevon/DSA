# T2 — Left-rail chapter nav + completion indicators

**Status:** ✅ done 2026-04-24
**Depends on:** T1 (shell + slot scaffold)
**Blocks:** T5 (index dashboard reuses the chapter-list shape), T7 (responsive sweep), T8 (deploy verification)

## Why

Per [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the left rail is the primary navigation. Canvas-style grouping: "Required" (ch_1–ch_6) and "Optional" (ch_7, ch_9–ch_13). Current chapter highlighted. Per-chapter completion indicator (Canvas-inspired checkmark) visible in interactive mode only — derived from the `read_status` table the M3 routes own.

The chapter set is small (12 chapters total) so the rail is short. SSR-render the full list — no JS required for navigation. The completion-indicator JS island is an enhancement, not a load-bearing feature.

## Deliverable

- `src/components/chrome/LeftRail.astro` — SSR component. Reads `scripts/chapters.json` (the canonical chapter manifest, M3 T4 already uses it) at build time, renders the grouped chapter list. Current-chapter highlighting via `Astro.url.pathname` matching the chapter slug.
- `src/components/chrome/CompletionIndicator.astro` — small JS island. On mount in interactive mode, fetches `GET /api/read_status?chapter_id=...` for each chapter in the rail, renders a checkmark per chapter where `section_ids` covers all sections in `chapters.json` for that chapter (or some / fully-read rule — see Notes). `data-interactive-only` so the indicator hides in static mode.
- Wire `LeftRail` into the `Base.astro` `left-rail` slot from T1. Lectures, notes, practice routes all show the same rail.
- Per-chapter link points at the appropriate collection (lectures by default; T3's collection switcher in the breadcrumb lets the user change collection — but the chapter slug is shared).

## Steps

1. Read `scripts/chapters.json` shape (M3 T4 helper). Confirm fields: `id`, `n`, `title`, `subtitle`, `required` (bool).
2. Implement `LeftRail.astro`:
   - Top-level partition: `required.filter(c => c.required)` and `required.filter(c => !c.required)`.
   - Render a `<nav aria-label="Chapter navigation">` with two `<section>`s, each with an `<h3>` heading ("Required" / "Optional") and a `<ul>` of chapter links.
   - Each `<li>` = `` <a href={`${baseUrl}/lectures/${c.id}/`}>ch_N — Title</a> `` where `const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');` — matches the existing `src/pages/index.astro` convention (line 16). **Do not hardcode `/DSA/` in the produced HTML.** `astro.config.mjs` sets `base: '/DSA/'` today, but the project-wide convention is to read `BASE_URL` so a forked deploy at a different sub-path doesn't 404. (Resolves MUX-BO-ISS-02 / HIGH-2.) Set `aria-current="page"` when the slug matches.
3. Implement `CompletionIndicator.astro`:
   - JS island with `client:visible` directive (don't load the script until the rail is visible).
   - On mount: parallel `fetch('/api/read_status?chapter_id=' + id)` for each chapter id in the rail.
   - For each chapter, decide "complete": pick a rule (see Notes — initial proposal: "all sections marked"). Render a `<span class="completion-check" data-chapter="<id>">✓</span>` in the corresponding `<li>`.
   - Carries `data-interactive-only` so static-mode hides the checkmark slot entirely (the `<li>` itself stays visible).
   - **Refresh listener (resolves MUX-BO-DA2-B / MEDIUM).** Register `window.addEventListener('cs300:read-status-changed', …)` — the same custom event `MarkReadButton` dispatches on toggle (`MarkReadButton.astro` line 111: `dispatchEvent(new CustomEvent('cs300:read-status-changed'))`, no `detail` payload). On the event, **scope the refresh to the current chapter only** (read the chapter slug from `Astro.url.pathname` at SSR time and embed it into the island as a data attribute, e.g. `data-current-chapter="ch_4"`; the listener re-runs the GET fetch for that chapter id only and updates that chapter's checkmark in-place). Don't re-fetch all 12 chapters — the other chapters' state can't change without navigation, so a full sweep is wasted work. Without this listener, the chapter's left-rail checkmark goes stale until reload — cross-component asymmetry with T4's TOC indicators (per MUX-BO-DA-3, T4's TOC subscribes to the same event for live refresh).
4. Style: hover state on links, current-chapter background distinct from hover, completion checkmark uses the accent colour from `chrome.css`, group headings small-caps and de-emphasized.
5. Smoke (local): `npm run dev`, navigate `/DSA/lectures/ch_4/` — confirm "ch_4 — …" is highlighted in the left rail. Mark a section read via the existing M3 mechanism, reload, see the checkmark appear (interactive mode).
6. Smoke (static): `npm run build && npm run preview`, open `/DSA/lectures/ch_1/`, confirm rail renders with no checkmarks visible (static mode), no console errors from the JS island (graceful degradation).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/components/chrome/LeftRail.astro` exists and renders in the `Base.astro` `left-rail` slot.
- [ ] `LeftRail` reads `scripts/chapters.json`, partitions Required vs Optional, renders both groups with correct chapter counts (Required=6, Optional=6 — ch_7, ch_9–ch_13).
- [ ] **Auditor opens** `/DSA/lectures/ch_1/` in `npm run preview`, confirms "Required" group lists ch_1–ch_6 with ch_1 highlighted (`aria-current="page"`).
- [ ] **BASE_URL convention** (resolves MUX-BO-ISS-02 / HIGH-2 + MUX-BO-DA-1). Auditor `grep -nE '/DSA/' src/components/chrome/LeftRail.astro` returns no matches — links are constructed via `import.meta.env.BASE_URL`. The `-E` (or no `-F`) is deliberate: `grep -F '"/DSA/'` would only catch double-quoted hardcoding and miss template-literal regressions like `` `/DSA/lectures/${id}/` `` and single-quoted `'/DSA/...'` paths — which is exactly the regression class HIGH-2 was meant to prevent. View-source on a built page shows the resolved `/DSA/lectures/ch_1/` href (SSR resolution is fine — only source-code hardcoding is the regression). **Note (resolves MUX-BO-DA2-E / LOW + MUX-BO-DA3-A / LOW):** the `-E '/DSA/'` pattern can match `.astro` HTML comment lines (`<!-- /DSA/foo -->`) or script-block comments referencing the path for documentation. A non-empty grep result is not an automatic fail — the auditor reads each match and confirms it is not a real source-code hardcoding (e.g., legitimate doc/comment references are fine; only `href`/`action`/`src` attribute or template-literal hrefs in the rendered HTML are regressions). If the file accumulates documentation references over time, narrow the grep with `grep -nE '/DSA/' … | grep -vE '^[^:]+:[0-9]+:\s*(<!--|//)'` or similar — but the default policy is reviewer-eyes, not blind-fail. (DA3-A applies the same fallback pattern uniformly to T2/T3/T5 BASE_URL audit-checks.)
- [ ] **Auditor opens** `/DSA/lectures/ch_9/`, confirms "Optional" group lists ch_7 + ch_9–ch_13 with ch_9 highlighted.
- [ ] `src/components/chrome/CompletionIndicator.astro` carries `data-interactive-only`. Auditor confirms in static mode (preview, no `/api/health` reachable) the checkmark slot is hidden — list items still visible, no broken JS in console.
- [ ] **Auditor runs** `npm run dev`, opens a chapter, marks one section read via the M3 `MarkReadButton`, reloads — confirms the chapter's checkmark appears in the rail (whichever rule T2 picks; cite the rule in the audit issue file).
- [ ] **Live listener refresh** (resolves MUX-BO-DA2-B / MEDIUM + MUX-BO-DA3-C / LOW). Auditor opens `/DSA/lectures/ch_4/` in `npm run dev`, marks the section that satisfies T2's chosen completion rule for ch_4 via the M3 `MarkReadButton`, **does not reload**, observes the ch_4 row's left-rail checkmark refresh within a few seconds (typically sub-second on localhost; the constraint is "before the user reloads", not a hard latency budget — DA3-C softens an earlier "~1s" wording that risked false-failing on slower connections). If the checkmark only appears after reload, the `cs300:read-status-changed` listener wasn't wired (or wasn't scoped to the current chapter). Cite the manual-test result in the audit issue file. Cross-reference: T4's TOC indicator subscribes to the same event (per MUX-BO-DA-3) — both must update live.
- [ ] All 37 prerendered pages still build (`npm run build` exit 0).

## Notes

- **Completion-rule call.** Two reasonable rules:
  - **(a) All sections marked** — strict, satisfying. Possibly never triggered for chapters with many sections.
  - **(b) Any section marked** — weak signal but always achievable.
  - Initial proposal: **(a)**. If the M-UX deep review finds it never triggers in practice, switch to (a-with-progress-fraction) showing "X of Y" instead. Document the chosen rule in the audit issue file. Per ADR-0002 "Open questions deferred," T2 owns this call.
- **CompletionIndicator JS-island justification.** Could be SSR if the state service was reachable at build time. It isn't (the build runs against no live state), so the data must be fetched client-side. The island is the lightest reasonable surface for that.
- **Chapter ordering.** Render in `n` order (chapter number), not `id` lexicographic order — `ch_10` should sort after `ch_9`, not before. Use `chapters.json`'s `n` field for the sort key.
- **Accessibility.** `aria-current="page"` on the active link, `aria-label="Chapter navigation"` on the nav, group headings as `<h3>` so screen readers announce the structure.
- **Don't fetch read_status one chapter at a time per page load.** A single `GET /api/read_status` (no filter) returning all marks would be simpler — but the M3 T7 route is `?chapter_id=...`-scoped. T2 uses `Promise.all` over the 12 chapters; if it becomes a perf concern (it won't at 12 chapters) the read_status API gets a "list-all" variant in a follow-on.
