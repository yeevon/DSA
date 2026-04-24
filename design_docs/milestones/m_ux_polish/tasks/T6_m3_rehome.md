# T6 — M3 component re-homing: annotations + mark-read

**Status:** todo
**Depends on:** T4 (right rail must exist for annotations to land in)
**Blocks:** T7 (responsive sweep), T8 (deploy verification)

## Why

M3 shipped four client surfaces (`AnnotateButton`, `AnnotationsPane`, `MarkReadButton`, `SectionNav`) into the bare `Base.astro` shell. They render in their original M3 positions (annotations pane in a fixed right-side spot, mark-read button inline, etc.). Now that M-UX has the proper chrome (T1 shell, T2 left rail, T3 breadcrumb, T4 right rail), the M3 surfaces need to move into their designated chrome slots:

- **Annotations pane** → right rail, below the in-chapter TOC (T4).
- **MarkReadButton** → chapter content header (or per-section per the implementation pick — see Notes).
- **AnnotateButton** → stays floating (selection-anchored), no re-home needed; just verify it works correctly inside the new chrome's center column.
- **SectionNav** → already handled in T4 (folded into right-rail TOC).

T6's APIs do not change — the existing M3 component contracts (props, fetch logic, event handlers) all survive. T6 is a re-home / re-mount, not a rewrite.

## Deliverable

- `src/components/annotations/AnnotationsPane.astro` — re-homed: positioned in the `right-rail` slot, below the `RightRailTOC` (T4). The component itself is unchanged in API; the wrapping markup that places it changes.
- `src/components/read_status/MarkReadButton.astro` — re-homed to the chapter content header (one button per chapter, or the existing per-section variant — keep T6's call). Pulled out of any standalone wrapper that the M3 implementation had.
- `src/pages/lectures/[id].astro` — updated to mount the M3 components into the new chrome slots:
  - `AnnotationsPane` → `right-rail` slot (after `RightRailTOC`).
  - `MarkReadButton` → top of the article body (`default` slot).
  - `AnnotateButton` → unchanged in place (floating, selection-anchored).
- `src/pages/notes/[id].astro`, `src/pages/practice/[id].astro` — verify whether annotations should be available on these routes too (M3 mounted them on lectures only). T6 picks: extend to all three collections vs. lectures-only. Document the call.
- The `data-interactive-only` contract is preserved on every re-homed component — static mode still hides them cleanly.

## Steps

1. Audit the current M3 mount sites — list every `<AnnotationsPane>`, `<AnnotateButton>`, `<MarkReadButton>`, `<SectionNav>` use across `src/pages/`. Catalogue the props passed.
2. Decide the lectures/notes/practice scope question. Lean: **lectures only for annotations + mark-read** (matches M3's original scope). Notes/practice get the chrome (left rail, breadcrumb, possibly right rail) but no interactive surfaces. Defer expansion to a follow-on if useful.
3. Move `<AnnotationsPane>` into the `right-rail` slot of `[id].astro` lectures route, after `<RightRailTOC>` (T4). The component still self-fetches annotations on mount; no API changes.
4. Move `<MarkReadButton>` into the `default` slot above the article body. Call sites + props unchanged.
5. Verify `<AnnotateButton>` (floating selection button) still works inside the three-column layout. Test: select text inside the center column at desktop width, confirm the floating button appears next to the selection (not clipped by the right rail). If the right rail's stacking context interferes, adjust z-index or positioning logic.
6. Check `notes/[id].astro` and `practice/[id].astro` — confirm they render through the new chrome (T1 shell) without M3 components being mounted (per T6's lectures-only scope decision). Right rail empty there is acceptable.
7. Smoke (local + interactive): `npm run dev`, navigate `/DSA/lectures/ch_4/`. Confirm annotations pane sits in the right rail below the TOC. Mark-read button appears at the top of the article. Select text in the center column → floating annotate button appears. Click it → annotation lands and renders in the right-rail pane.
8. Smoke (static): `npm run preview`, `/DSA/lectures/ch_4/` — annotations pane hidden (`data-interactive-only`), mark-read button hidden, annotate button never appears (no JS island fires). Page reads cleanly without the interactive surfaces.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] **Auditor opens** `/DSA/lectures/ch_4/` in `npm run dev` (interactive mode). Confirms:
  - Annotations pane is in the right rail, below the in-chapter TOC. Cite DOM-position observation.
  - Mark-read button is in the article header (or per-section per T6's implementation pick — cite the call).
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
