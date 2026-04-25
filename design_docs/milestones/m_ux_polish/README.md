# M-UX — UI/UX polish: chrome + chapter pane

**Maps to:** sidecar — promoted from [`nice_to_have.md`](../../nice_to_have.md) 2026-04-24, not in original `interactive_notes_roadmap.md` phasing.
**Status:** active (kicked off 2026-04-24)
**Depends on:** M3 (the chrome must hold the M3 client surfaces; M3 closed 2026-04-24)
**Unblocks:** —
**Reference design:** [ADR-0002](../../adr/0002_ux_layer_mdn_three_column.md)

## Goal

Replace the bare 51-line `Base.astro` shell + 62-line two-table `index.astro` with the MDN-docs three-column chrome from [ADR-0002](../../adr/0002_ux_layer_mdn_three_column.md). Re-home the M3 client surfaces (annotations pane, read-status indicators, section nav) into the new chrome so they stop competing with the prose for screen real estate. Make the static-mode site cleanly navigable on its own, and pre-wire the interactive-mode hooks so M5's review queue plugs in for free when it lands.

**In scope:** layout structure, navigation chrome, M3 component re-homing, responsive behaviour, mastery-dashboard placeholder index.

**Out of scope** (deferred per ADR-0002): visual style sweep (color palette, typography family), search, dark mode, animations beyond the mobile drawer slide-in. These get their own follow-on if friction emerges; M-UX is layout structure only.

## Done when

- [ ] **Three-column desktop layout** (≥1024px) — left rail, center content, right rail — renders cleanly on every chapter route (lectures, notes, practice).
- [ ] **Left-rail chapter nav** — chapter list grouped Required (ch_1–ch_6) / Optional (ch_7, ch_9–ch_13), current chapter highlighted, SSR-rendered (no JS required for navigation).
- [ ] **Per-chapter completion indicators** in the left rail — Canvas-style checkmark gated via `data-interactive-only` (T5 contract), populated from `read_status` table in interactive mode, hidden in static mode.
- [ ] **Top breadcrumb** — sticky on scroll, shows path (`cs-300 / Lectures / ch_4 — Lists, Stacks, Queues`), hosts collection switcher (Lectures / Notes / Practice) + prev/next chapter buttons.
- [ ] **Right-rail in-chapter TOC** — section anchors SSR-rendered from MDX frontmatter (`sections` array), scroll-spy enhancement as a JS island that toggles `data-current` via `IntersectionObserver`. M3's `SectionNav` is refactored into this slot (no two left rails).
- [ ] **Annotations pane re-homed** to right rail (below TOC) in interactive mode, with the `data-interactive-only` contract preserved.
- [ ] **Mark-read button re-homed** to the chapter content header (or per-section, per T6's call), `data-interactive-only` preserved.
- [ ] **Index page** is the mastery-dashboard placeholder — chapter cards grouped Required/Optional in static mode; "recently read" + "due for review" `data-interactive-only` slots that M5 fills when the review queue lands. Replaces the current two-table layout.
- [ ] **Mobile (<1024px)** — single column with hamburger drawer for the left rail; right-rail TOC moves to a collapsed `<details>` summary at content top. Responsive transition tested at 1280, 1024, 768, 375 widths.
- [ ] **Deploy contract preserved** — site still ships 37 prerendered pages; `dist/client/` size budget within +50KB of pre-M-UX baseline; M3 surfaces still gated on `data-interactive-only` and invisible in static mode; no server-only code leaks into the client bundle.

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                          | Status |
| --- | ------------------------------------------------------------- | ------ |
| T1  | [Layout shell — three-column grid + responsive scaffold](tasks/T1_layout_shell.md) | ✅ done 2026-04-24 |
| T2  | [Left-rail chapter nav + completion indicators](tasks/T2_left_rail.md) | todo |
| T3  | [Top breadcrumb — collection switcher + prev/next + sticky](tasks/T3_breadcrumb.md) | todo |
| T4  | [Right-rail TOC + scroll-spy island + SectionNav refactor](tasks/T4_right_rail_toc.md) | todo |
| T5  | [Index page rewrite — mastery-dashboard placeholder](tasks/T5_index_dashboard.md) | todo |
| T6  | [M3 component re-homing — annotations + mark-read](tasks/T6_m3_rehome.md) | todo |
| T7  | [Mobile drawer + responsive sweep](tasks/T7_mobile_drawer.md) | todo |
| T8  | [Deploy verification — 37 pages, size budget, no regressions](tasks/T8_deploy_verification.md) | todo |

See [`tasks/README.md`](tasks/README.md) for ordering guidance and the critical path (T1 → T4 → T6 → T7 → T8). Mirror status changes between the per-task file and the table above.

## Open decisions resolved here

- **Page chrome layout** — resolved 2026-04-24 in [ADR-0002](../../adr/0002_ux_layer_mdn_three_column.md): MDN-docs three-column with Canvas-style left-rail grouping. Single column with drawer on mobile.

## Out of scope

- **Visual style sweep.** Color palette, typography family, dark mode. M-UX uses the system font stack + one accent colour. Style sweep is a follow-on or stays in `nice_to_have.md` until friction emerges.
- **Search.** No search surface today; the chapter list + section TOC is enough navigation for the cs-300 corpus size. Defer to `nice_to_have.md` post-M-UX if friction emerges.
- **Animation discipline beyond the drawer.** Sticky breadcrumb is instant. Current-section TOC highlight is instant. Drawer slide-in is the only required motion.
- **Per-section completion derivation refinement.** "Fully read" vs "X of Y sections" — T2 picks one and ships it; refinement is follow-on if the chosen rule is wrong in practice.
- **M5 review-queue UI itself.** T5 ships the dashboard slots; M5 fills them. Stub renders an empty-state message in the slots until M5 lands.
- **M4-blocked UI surfaces.** Question-bank UI, generate-questions buttons, review pane content — all wait for M4. M-UX leaves the slots in the chrome but doesn't render question-related UI.
