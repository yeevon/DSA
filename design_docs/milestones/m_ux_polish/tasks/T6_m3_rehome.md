# T6 — M3 component re-homing: annotations + mark-read

**Status:** ✅ done 2026-04-25
**Depends on:** T4 (right rail must exist for annotations to land in)
**Blocks:** T7 (responsive sweep), T8 (deploy verification)

## Why

M3 shipped four client surfaces (`AnnotateButton`, `AnnotationsPane`, `MarkReadButton`, `SectionNav`) into the bare `Base.astro` shell. They render in their original M3 positions (annotations pane in a fixed right-side spot, mark-read button inline, etc.). Now that M-UX has the proper chrome (T1 shell, T2 left rail, T3 breadcrumb, T4 right rail), the M3 surfaces need to move into their designated chrome slots:

- **Annotations pane** → right rail, below the in-chapter TOC (T4).
- **MarkReadButton** → JSX import lands in the `default` slot. Visual position is the MUX-BO-DA-6 test-then-decide question (see Step 4) — keep M3's floating bottom-left, or strip `position: fixed` and flow-position at the article header. Granularity (1 button vs N — Notes (a)/(b)) is the separate M3 inheritance question.
- **AnnotateButton** → stays floating (selection-anchored), no re-home needed; just verify it works correctly inside the new chrome's center column.
- **SectionNav** → already handled in T4 (folded into right-rail TOC).

T6's APIs do not change — the existing M3 component contracts (props, fetch logic, event handlers) all survive. T6 is a re-home / re-mount, not a rewrite.

## Deliverable

- `src/components/annotations/AnnotationsPane.astro` — re-homed: positioned in the `right-rail` slot, below the `RightRailTOC` (T4). The component itself is unchanged in API; the wrapping markup that places it changes.
- `src/components/read_status/MarkReadButton.astro` — re-homed into the new chrome. **Position is the MUX-BO-DA-6 test-then-decide question** — (i) keep M3's `position: fixed; bottom-left` floating (default; preserves M3 API) vs. (ii) strip `position: fixed` and let it render inline in the `default` slot at the article header. Builder lands (i) first per Step 4's procedure and decides during smoke. The (a) per-chapter vs (b) per-section granularity call is the M3 inheritance question (see Notes — independent of (i)/(ii)).
- `src/pages/lectures/[id].astro` — updated to mount the M3 components into the new chrome slots:
  - `AnnotationsPane` → `right-rail` slot (after `RightRailTOC`).
  - `MarkReadButton` → JSX import lands in the `default` slot (above the article body). Whether it visually renders there or stays floating bottom-left depends on Step 4's MUX-BO-DA-6 call.
  - `AnnotateButton` → unchanged in place (floating, selection-anchored).
- `src/pages/notes/[id].astro`, `src/pages/practice/[id].astro` — render through the new chrome (T1 shell) **without** the M3 interactive components mounted. Lectures-only is pinned per MUX-BO-ISS-05 / MEDIUM-2 (see Step 2); these routes get LeftRail (T2) + Breadcrumb (T3) but no AnnotationsPane / MarkReadButton / AnnotateButton.
- The `data-interactive-only` contract is preserved on every re-homed component — static mode still hides them cleanly.

## Steps

1. Audit the current M3 mount sites — list every `<AnnotationsPane>`, `<AnnotateButton>`, `<MarkReadButton>`, `<SectionNav>` use across `src/pages/`. Catalogue the props passed.
2. **Scope: lectures only for annotations + mark-read** (pinned per MUX-BO-ISS-05 / MEDIUM-2 — no Builder-time decision). Matches M3's original mount points. Notes/practice get the chrome (left rail, breadcrumb, possibly right rail) but no interactive surfaces. Do not extend to notes/practice in M-UX — extension is a follow-on if the user reports friction. (T2 wires LeftRail into all three collections, T3 wires Breadcrumb into all three, T4 wires TOC into lectures only — T6's lectures-only scope is consistent with that breadth.)
3. Move `<AnnotationsPane>` into the `right-rail` slot of `[id].astro` lectures route, after `<RightRailTOC>` (T4). The component still self-fetches annotations on mount; no API changes.
4. Move `<MarkReadButton>` into the `default` slot above the article body. Call sites + props unchanged.
   - **⚠️ Open question — flagged per MUX-BO-DA-6, decide after implementation.** M3's `MarkReadButton.astro` (lines 19–22) currently uses `position: fixed; bottom: 16px; left: 16px;`. Moving the JSX import in `[id].astro` doesn't change visual position because the CSS decouples DOM-position from render-position — the button still floats bottom-left regardless of slot. So the literal "re-home to article header" framing of T6 has two interpretations:
     - **(i) Keep floating bottom-left.** "Re-home" becomes a no-op for visual position; only the JSX import location moves (cosmetic). Preserves "API stable" (no CSS edits to the M3 component).
     - **(ii) Make it a flow-positioned header button.** Strip `position: fixed; bottom; left;` from the component, let it render inline in the `default` slot. Changes the M3 component's CSS API — technically an M3 contract edit, but small.
   - **Procedure (test-then-decide).** Implement (i) first (cheapest, preserves M3 API). Smoke `/DSA/lectures/ch_4/` in `npm run dev` at 1280px and 375px widths. Observe whether the bottom-left floating button **(a)** is still discoverable inside the new chrome, **(b)** doesn't visually clash with the right-rail at desktop or the bottom of the mobile drawer trigger area, **(c)** still feels like the right affordance. If any of (a)/(b)/(c) feel wrong, switch to (ii) and document the CSS edit as a deliberate M3 contract revision (with a note in the T6 issue file). Do not pre-decide — the floating-vs-header question is a design judgment that needs the new chrome to exist first.
5. Verify `<AnnotateButton>` (floating selection button) still works inside the three-column layout. Test: select text inside the center column at desktop width, confirm the floating button appears next to the selection (not clipped by the right rail). If the right rail's stacking context interferes, adjust z-index or positioning logic.
6. Check `notes/[id].astro` and `practice/[id].astro` — confirm they render through the new chrome (T1 shell) without M3 components being mounted (per T6's lectures-only scope decision). Right rail empty there is acceptable.
7. Smoke (local + interactive): `npm run dev`, navigate `/DSA/lectures/ch_4/`. Confirm annotations pane sits in the right rail below the TOC. Mark-read button is visible and functional (location depends on Step 4's (i)/(ii) call — bottom-left floating under (i), inline at article header under (ii)). Select text in the center column → floating annotate button appears. Click it → annotation lands and renders in the right-rail pane.
8. Smoke (static): `npm run preview`, `/DSA/lectures/ch_4/` — annotations pane hidden (`data-interactive-only`), mark-read button hidden, annotate button never appears (no JS island fires). Page reads cleanly without the interactive surfaces.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] **Auditor opens** `/DSA/lectures/ch_4/` in `npm run dev` (interactive mode). Confirms:
  - Annotations pane is in the right rail, below the in-chapter TOC. Cite DOM-position observation.
  - Mark-read button is visible and functional. Its **position** depends on Step 4's MUX-BO-DA-6 call — (i) bottom-left floating per M3's existing CSS, or (ii) inline at the article header after stripping `position: fixed`. Cite which option the Builder picked + DOM-position observation. The (a) per-chapter vs (b) per-section *granularity* call (see Notes) is independent of the (i)/(ii) positioning call.
  - Selecting text in the center column makes the floating annotate button appear next to the selection (not clipped, not hidden behind the right rail).
- [ ] Round-trip works end-to-end: select text → click annotate → annotation appears in the right-rail pane → reload → annotation persists. Cite the manual-test result.
- [ ] **Static mode smoke** (`npm run preview`): right-rail pane shows TOC only (no annotations slot), mark-read button hidden, no annotate button on selection. Page is still readable.
- [ ] **Auditor confirms M3 component APIs unchanged.** Diff `src/components/annotations/*.astro` and `src/components/read_status/*.astro` — only structural / positioning changes (e.g., outer wrapper class names), no prop rename or fetch-logic edits. If APIs needed to change, T6 surfaces that as a HIGH finding (an M3 regression).
- [ ] Notes / practice routes render through the new chrome without M3 component breakage (right rail empty if scoped to lectures-only — that's acceptable).
- [ ] All 37 prerendered pages still build (`npm run build` exit 0).

## Notes

- **MarkReadButton placement call.** Two reasonable positions:
  - **(a) Per-chapter button at article header** — one button, marks the whole chapter read. Simple.
  - **(b) Per-section button** — one button per section, finer-grained. Matches the M3 schema (read_status is per-section).
  - The M3 T7 implementation chose one of these; T6 keeps that choice unless the chrome breaks it. Document what the M3 choice was + whether T6 preserved or pivoted in the audit issue file.
- **API stability is the contract.** T6 does not change any M3 component's props or fetch behaviour. If the audit catches an API-level edit, that's a HIGH finding (regression on a closed milestone). The new chrome is the only thing M-UX is shaping.
- **Floating annotate button stacking.** The new three-column layout introduces stacking contexts that the M3 floating button didn't have to navigate. If the button gets clipped, fix it with positioning (likely `position: fixed` rather than `absolute`, or explicit z-index above the right rail's z-index).
- **No `notes` / `practice` annotations.** Lectures is the long-form reading surface and the natural place for annotations. Notes is a two-page reference; practice is a coach-prompt corpus. Annotations on those would be possible but low-value. T6 explicitly scopes lectures-only.
- **Future M5 hooks.** When M5 lands, the dashboard slots on the index page (T5) will show "due for review" with chapter context. The chapter-page chrome doesn't need new M5 surfaces — the review queue lives at `/review`, not in the chapter pages.
