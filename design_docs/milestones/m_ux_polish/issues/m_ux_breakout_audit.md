# M-UX — milestone breakout (planning-phase) — Audit Issues

**Source artefacts:** [`../README.md`](../README.md), [`../tasks/README.md`](../tasks/README.md), [`../tasks/T1_layout_shell.md`](../tasks/T1_layout_shell.md) … [`T8_deploy_verification.md`](../tasks/T8_deploy_verification.md), [`../../../adr/0002_ux_layer_mdn_three_column.md`](../../../adr/0002_ux_layer_mdn_three_column.md), [`../../../architecture.md`](../../../architecture.md) §1.6, [`../../README.md`](../../README.md) (M-UX row).
**Audited on:** 2026-04-24
**Audit scope:** Planning-phase audit of the M-UX kickoff (commit `e14813a` — ADR + architecture amendment + milestones index sync) and the M-UX task breakout (commit `b67350c` — milestone README + tasks/README + 8 task specs). Verified ADR↔task coverage matrix, nice_to_have boundary discipline, status-surface set-up, cross-reference integrity, M3 dependency assumptions against actual M3 source, code-task verification non-inferential rule, slot-naming contract, no-new-deps commitment.
**Status:** ✅ **PASS** (2026-04-24, third deep-analysis pass amendments landed) — earlier cycles resolved all `MUX-BO-ISS-NN` (3 HIGH + 4 MEDIUM) and `MUX-BO-DA-NN` (1 HIGH + 4 MEDIUM + 1 flagged) findings. A third deep-analysis pass on 2026-04-24 caught 3 MEDIUM + 3 LOW gaps in the *audit-check enforcement* surface introduced by DA-2/DA-3 fixes (`MUX-BO-DA2-A` … `MUX-BO-DA2-F`); all six landed via direct spec amendment same-day to T1, T2, T3, T4, T5, T7. The DA2 findings tested whether the audit-checks added in cycle 2 actually exercise the contracts they claim to enforce (the recurring lesson: an AC that exists ≠ an AC that exercises the contract). Per-finding resolution recorded in the Issue log table.

**Prior status (2026-04-24, second cycle close):** ✅ PASS — all 3 HIGH + 4 MEDIUM findings amended directly into the task specs (T1, T2, T3, T4, T5, T6, T8). A subsequent **deep-analysis (meta-audit) pass on 2026-04-24** caught 1 HIGH + 4 MEDIUM defects in the original fixes themselves (`MUX-BO-DA-NN` IDs in the Issue log table); all six DA findings amended in the same day. T1 was at-the-time safe to pick up. LOW-2 + LOW-3 left as flagged-not-blocking; LOW-1 deferred to T2's own issue file at T2 close (per the original audit recommendation). DA-6 (T6 floating-button positioning) flagged for test-then-decide during T6 implementation, not pre-decided.

**Original audit status (preserved for context):** ⚠️ OPEN — three HIGH findings on the task specs that the Builder must amend before T1 can be picked up safely; everything else is MEDIUM/LOW. The ADR + architecture amendment + milestone README are clean. The task specs need spot fixes (slot-name contract, MarkReadButton DOM coupling, hardcoded base URL); they do not need to be rewritten.

## Design-drift check (architecture.md, ADR-0002, nice_to_have, CLAUDE.md non-negotiables)

**No drift detected at the ADR / architecture amendment / milestone README level.**

- **nice_to_have promotion** — boundary respected. `nice_to_have.md` (lines 20–77) lists exactly one parked item: "Site UI/UX layer (Canvas-LMS-style left-nav + structured chapter pages)." ADR-0002 + architecture.md §1.6 + the M-UX README explicitly defer color palette, typography family, dark mode, search, and animation discipline beyond the drawer (ADR-0002 lines 119–123; M-UX README lines 53–58). The promoted scope matches the parked entry's "what" paragraph almost verbatim — left rail with Required/Optional grouping + per-chapter completion + breadcrumb with prev/next + collection switcher + section-aware main pane + dashboard-style index. No items were silently smuggled out of `nice_to_have.md` alongside it.
- **Promotion mechanics** — clean per CLAUDE.md non-negotiable ("nice_to_have.md adoption requires architecture.md amendment + ADR — not a task"). Both halves landed (ADR-0002 + architecture.md §1.6).
- **Architecture coherence** — §1.6 fits cleanly under §1 (static content pipeline) without conflicting with §3 (dynamic surfaces), §3.5 (review loop / future M5), or §4 (local-vs-public mode). The `data-interactive-only` contract from §4 / M3 T5 is preserved across every M-UX surface that gates on mode (left-rail completion indicator, dashboard slots, annotations re-home).
- **Trigger validity** — the parked entry's promotion trigger ("M3 starts and the chrome decisions can no longer be deferred") fired correctly: M3 closed 2026-04-24 with four bare client surfaces (`SectionNav`, `MarkReadButton`, `AnnotateButton`, `AnnotationsPane`) shipped into the 51-line `Base.astro` shell (verified by reading current source). The cost-of-promotion outline in `nice_to_have.md` lines 69–73 (new ADR + architecture.md amendment in §1 + a milestone breakout) maps 1:1 to what landed.
- **No new dependencies** — `package.json` unchanged in either commit (`git show --stat e14813a b67350c` confirms — only `.md` files touched). T8 includes a non-inferential check that `package.json` + `package-lock.json` are byte-identical at M-UX close. ADR-0002 + T1 + T7 all explicitly forbid CSS / UI / animation frameworks.

**Drift would have been:** the breakout adopting dark mode or search alongside the layout. It didn't.

## ADR ↔ task coverage matrix

ADR-0002 "Decision" section (lines 71–80) names six specific commitments. Each is owned by at least one task; no commitment is orphaned and no task exceeds the ADR's scope.

| ADR-0002 commitment (line range) | Owning task(s) | Notes |
| --- | --- | --- |
| Left rail — sticky desktop / drawer mobile / Required-Optional grouping / current highlight / completion indicator (line 73) | T2 (chapter list + indicator), T7 (drawer behaviour) | T2 owns SSR + indicator JS island; T7 owns the responsive collapse-to-drawer. |
| Center — chapter content, max-width ~75ch, generous line-height, callout components unchanged (line 74) | T1 (prose-width constraint), T6 (verifies AnnotateButton stacking inside center column) | T1 declares the prose-width constraint as a deliverable; T6 verifies the M3 selection-floating button still works inside it. |
| Right rail — SSR TOC + scroll-spy + annotations pane re-home (line 75) | T4 (TOC + scroll-spy + SectionNav refactor), T6 (annotations re-home) | Two tasks but each owns a clean half. |
| Mobile (≤1024px) — single column, drawer, `<details>` for TOC (line 76) | T7 (drawer + responsive sweep) | Only task whose JS is `client:load` rather than `client:visible`. |
| Index page — mastery-dashboard placeholder, recently-read + due-for-review slots, replaces two-table layout (line 77) | T5 (index rewrite + dashboard slots) | Pre-wires M5 hooks via `data-interactive-only`. |
| Top breadcrumb — sticky, path, collection switcher, prev/next (line 78) | T3 (breadcrumb) | Pure CSS-sticky, no JS. |
| Refactor note — M3 SectionNav re-homed to right rail (lines 80–81) | T4 (refactor) | Carry-over surfaced in `tasks/README.md` lines 38–39. |
| Deploy contract — site still ships 37 pages, M3 surfaces still gated, no client-bundle leak (M-UX README "Deploy contract preserved" + ADR consequences lines 86–96 implicit) | T8 (deploy verification) | Mirrors M3 T8 structure. |

**Coverage: complete.** Every commitment has an owner. No task exceeds the ADR.

## Status-surface discipline (pre-flight)

CLAUDE.md non-negotiable: "When a task closes, **three** surfaces flip together: per-task spec, tasks/README.md row, milestone README task table row. Additionally, any `Done when` checkbox in the milestone README that the closed task satisfies flips from `[ ]` to `[x]`." The breakout sets up all four surfaces:

| Surface | State at breakout |
| --- | --- |
| Per-task `**Status:**` lines (T1–T8) | All `todo` (verified by reading each spec) |
| `tasks/README.md` index table (lines 9–16) | All 8 rows = `todo`, IDs T1–T8, depends-on chain matches deliverables |
| Milestone `README.md` task table (lines 36–43) | All 8 rows = `todo`, IDs + titles + links match `tasks/README.md` |
| Milestone `README.md` Done-when bullets (lines 19–28) | All 10 bullets `[ ]`; each maps to at least one task's deliverables |

**Done-when ↔ deliverable mapping** (no orphan bullets, no missing owners):

| Done-when bullet (line) | Owning task(s) |
| --- | --- |
| Three-column desktop layout (19) | T1 (shell/grid) — verified by T8 |
| Left-rail chapter nav grouped Req/Opt (20) | T2 |
| Per-chapter completion indicators (21) | T2 (CompletionIndicator JS island) |
| Top breadcrumb sticky + switcher + prev/next (22) | T3 |
| Right-rail TOC + scroll-spy + SectionNav refactor (23) | T4 |
| Annotations pane re-homed (24) | T6 |
| Mark-read button re-homed (25) | T6 |
| Index page mastery-dashboard placeholder (26) | T5 |
| Mobile single-column with drawer (27) | T7 |
| Deploy contract preserved (28) | T8 |

All 10 Done-when bullets have a clean owner; all 8 tasks satisfy at least one bullet. **Status-surface drift is impossible at breakout time** — the only remaining discipline is the per-task close-out flip, which `tasks/README.md` line 32 already calls out explicitly.

## Cross-reference integrity (every relative link verified)

Spot-checked every relative link by file-existence:

| Reference (in spec) | Target | Resolves? |
| --- | --- | --- |
| `../../../adr/0002_ux_layer_mdn_three_column.md` (T1–T7) | `design_docs/adr/0002_ux_layer_mdn_three_column.md` | ✅ |
| `../../../architecture.md` (implicit via ADR + M-UX README pointer) | `design_docs/architecture.md` | ✅ (§1.6 amendment present at lines 99–141) |
| `../../README.md` (M-UX README maps-to back-link) | `design_docs/milestones/m_ux_polish/README.md` referencing `design_docs/milestones/README.md` via `../../` | ✅ |
| `../../nice_to_have.md` (M-UX README line 3) | `design_docs/nice_to_have.md` | ✅ |
| `tasks/T<NN>_<slug>.md` (M-UX README task table) | All 8 task spec files exist | ✅ (all 8 verified by `ls`) |
| `tasks/README.md` (M-UX README line 45) | `design_docs/milestones/m_ux_polish/tasks/README.md` | ✅ |
| `[T<NN>_<slug>.md](T<NN>_<slug>.md)` (tasks/README index) | All 8 sibling task files | ✅ |
| `../../../../CLAUDE.md#auditor-conventions` (tasks/README line 35) | `CLAUDE.md` (4 levels up from `tasks/README.md`) | ✅ — file exists; the `#auditor-conventions` anchor matches the heading level CLAUDE.md uses |
| `scripts/chapters.json` (T2/T3/T5) | `scripts/chapters.json` | ✅ — fields confirmed: `id`, `n`, `title`, `subtitle`, `required` (12 rows: ch_1–7, ch_9–13) |

**No broken links.** Every cross-ref resolves to a real file.

## M3 dependency assumptions (verified against actual M3 source)

Builder report flagged this as the explicit weakness ("Builder did NOT verify against the actual M3 component code"). I read all four M3 components directly. Findings:

### Verified — assumptions hold

| Spec claim | M3 source check | Verdict |
| --- | --- | --- |
| `SectionNav` is positioned as a fixed left rail (T4 line 11, ADR-0002 line 80) | `src/components/read_status/SectionNav.astro` lines 36–50: `position: fixed; top: 64px; left: 0; width: 240px;` | ✅ accurate |
| `SectionNav` props are `{chapterId, sections}` (T4 implicit) | SectionNav.astro lines 16–22: `interface Props { chapterId: string; sections: Section[]; }` | ✅ matches |
| `AnnotationsPane` is a fixed right-side pane (T6 line 9 "fixed right-side spot") | AnnotationsPane.astro lines 26–39: `position: fixed; top: 64px; right: 0; width: 260px;` | ✅ accurate |
| `AnnotationsPane` props are `{sectionIds: string[]}` (T6 implicit "self-fetches on mount") | AnnotationsPane.astro lines 13–18: `interface Props { sectionIds: string[]; }`; mount-time fetch loop lines 59–72 | ✅ matches; T6's "self-fetches on mount; no API changes" claim is correct |
| `AnnotateButton` is floating, selection-anchored (T6 line 13) | AnnotateButton.astro lines 23–36 + selection logic 75–115 | ✅ accurate |
| `MarkReadButton` is floating bottom-left + section-aware via IntersectionObserver (T6 implicit "kept at chapter content header (or per-section)") | MarkReadButton.astro lines 17–38: `position: fixed; bottom: 16px; left: 16px;`; observer lines 70–82 | ⚠️ partial — see **HIGH-1** below |
| `data-interactive-only` contract on all four M3 components (T1/T6 baseline) | Verified attribute present on `#section-nav`, `#annotations-pane`, `#annotate-button`, `#mark-read-button` | ✅ all four components carry the attribute |
| Sections frontmatter shape `{id, anchor, title, ord}` (T4 line 56) | `src/content.config.ts` lines 33–38: `sectionSchema = z.object({id, anchor, title, ord})` | ✅ matches; lectures collection extends with `sections: z.array(sectionSchema)` |
| `chapters.json` fields `{id, n, title, subtitle, required}` (T2 step 1, T5 step 4) | `scripts/chapters.json` confirmed | ✅ matches |
| `chapters.json` partition Required=6 / Optional=6 (T2 line 39) | 6 with `required: true` (ch_1–6), 6 with `required: false` (ch_7, ch_9–13) | ✅ exact |
| ch_8 absent + `n` ordering naturally skips it (T3 step 3) | No ch_8 row in `chapters.json`; `n: 7` then `n: 9` | ✅ |
| Existing `index.astro` is two tables (T5 line 9, T8 implicit) | Verified — 62 lines exactly, two `<table>` elements | ✅ |
| Existing `Base.astro` is 51 lines (T1 line 12) | Verified — 51 lines exactly | ✅ |

### Not verified — assumptions are silently incomplete (HIGH findings)

**T6's "API stable" claim is incomplete because M3 components have undocumented inter-component DOM/event coupling that T4's refactor breaks.** See HIGH-1 and HIGH-2 below.

## Code-task verification non-inferential rule

Per CLAUDE.md non-negotiable: every code task must name an explicit smoke test. Read the "Acceptance check (auditor smoke test — non-inferential)" section in each task. Verdict per task:

| Task | Smoke test concrete? | Notes |
| --- | --- | --- |
| T1 | ✅ | "Auditor opens DevTools at 1280px width on `/DSA/lectures/ch_1/`, confirms three named regions"; "curls a built page from `dist/client/`"; "adds a `<div data-interactive-only>SHOULD-BE-HIDDEN</div>` to a chapter MDX". Five concrete observations. |
| T2 | ✅ | "Auditor opens `/DSA/lectures/ch_1/`… confirms `aria-current='page'`"; opens `/DSA/lectures/ch_9/` for Optional group; marks a section read via M3's MarkReadButton and reloads to verify the checkmark. |
| T3 | ✅ | Five distinct DevTools observations across ch_1, ch_4, ch_7, ch_13, plus scroll-test for sticky behaviour. |
| T4 | ✅ | TOC list cross-checked against `src/content/lectures/ch_4.mdx` frontmatter; scroll-spy `[data-current="true"]` attribute observed in DevTools; before/after observation for the SectionNav refactor. |
| T5 | ✅ | Static-mode + interactive-mode DOM observations on `/DSA/`; ChapterCard count check against `chapters.json`; clicks one of each card link. |
| T6 | ✅ | DOM-position observation for annotations pane in right rail; round-trip select→annotate→reload; static-mode preview verifies hiding; diff M3 components for prop/fetch changes. |
| T7 | ✅ | Four breakpoints (1280, 1024, 768, 375); drawer interactions (click, escape, backdrop); accessibility tab cycle; static-mode at 375. |
| T8 | ✅ | Build size comparison vs `bf9c773` baseline; bundle inspection grep for 5 server-only terms; DevTools at 1280 + 375; live-deploy curl confirmation. |

**No inferential smoke tests anywhere.** Every task names a concrete browser/devtools/curl observation the auditor will run. This is a meaningful improvement over earlier milestones — Builder applied the "Content vs code" rule consistently.

## Slot-naming contract (cross-task verification)

T1 declares five named slots in `Base.astro`: `breadcrumb`, `left-rail`, `default`, `right-rail`, `drawer-trigger` (T1 line 15). Consumers:

| Slot | Producer (T1) | Consumer | Status |
| --- | --- | --- | --- |
| `breadcrumb` | T1 | T3 (Breadcrumb wired into the slot, line 18); T7 (hamburger goes into breadcrumb, line 25) | ✅ consistent |
| `left-rail` | T1 | T2 (LeftRail wired in, lines 17 + 38) | ✅ consistent |
| `default` | T1 | T6 (MarkReadButton, line 24) | ✅ consistent — though "default" is the implicit Astro slot, naming it explicitly is fine |
| `right-rail` | T1 | T4 (RightRailTOC + ScrollSpy, lines 20 + 42); T6 (AnnotationsPane, line 23) | ✅ consistent |
| `drawer-trigger` | T1 | **— nothing —** | ⚠️ **MEDIUM-1** see below |

The `drawer-trigger` slot is declared in T1 but never consumed. T7 instead adds a slot for the trigger inside `Breadcrumb.astro` (T7 line 16: "`Breadcrumb.astro` (from T3) updated — gains a slot for the drawer trigger button"). Two viable shapes; the breakout doesn't pick one.

## 🔴 HIGH — surface before T1 starts

### HIGH-1 — T6's "API-stable re-home" claim is broken by M3's undocumented `MarkReadButton` ↔ `SectionNav` DOM coupling

**Finding.** `src/components/read_status/MarkReadButton.astro` lines 48–56 reads the read-status set by querying SectionNav's DOM directly:

```js
async function refreshMarked() {
  // Pull from the SectionNav-loaded set if present; else fetch.
  const nav = document.getElementById('section-nav');
  if (nav) {
    nav.querySelectorAll<HTMLElement>('.dot[data-read="true"]').forEach((d) => {
      if (d.dataset.sectionId) markedSet.add(d.dataset.sectionId);
    });
  }
  updateButtonState();
}
```

The `#section-nav` DOM id and the `.dot[data-read="true"]` selector are an implicit shared-state contract between two "independent" M3 components. T4's plan removes `SectionNav.astro` (T4 line 35: "Remove the standalone fixed-left `SectionNav.astro` from the lectures route") and re-points the read-status fetch logic at the new `RightRailTOC` per-entry indicators (T4 line 36). The new TOC uses `[data-read-indicator]` spans (T4 line 28) — neither the `#section-nav` id nor `.dot` class survives.

Result: when T4 lands, `MarkReadButton.refreshMarked()` will silently fall through to "no nav present, markedSet empty," so `updateButtonState()` will always render the button as "unread" until the user clicks it. The visible "Mark section read / Unmark" toggle state — which depends on `markedSet.has(currentSectionId)` (line 61) — will be wrong until the user clicks. T6's auditor smoke ("Mark-read button re-homed to the chapter content header") doesn't check button state correctness, so the regression could ship under the current spec.

T6 explicitly promises (line 58): *"T6 does not change any M3 component's props or fetch behaviour. If the audit catches an API-level edit, that's a HIGH finding (regression on a closed milestone)."* But a behavioural regression caused by a sibling task removing the sibling DOM the M3 component depends on is the same class of regression — and it isn't surfaced anywhere.

There's a second related coupling: `MarkReadButton` depends on `article a[id^="ch_"]` anchors (line 70) for the IntersectionObserver that determines `currentSectionId`. T1's chrome rewrite must preserve `<article>` as the wrapper for chapter content (the current `lectures/[id].astro` line 40 uses `<article>`), and the per-section anchor structure must survive T4's TOC refactor. T1 line 39 says the M3 components "still render somewhere on the chapter pages — possibly in their original positions, possibly broken visually" — but it doesn't pin the `<article>` requirement.

**Severity:** HIGH — silent runtime regression on a closed M3 contract. The "API stable" framing in T6 isn't enough; the inter-component DOM contract needs explicit treatment.

**Action / Recommendation.** Amend two specs before T1 picks up:

1. **T4** — add a step (after step 4) and an audit-check bullet:
   - *Step:* "Update `src/components/read_status/MarkReadButton.astro` `refreshMarked()` so it reads the read state from the new RightRailTOC's `[data-read-indicator]` spans instead of the removed `#section-nav` `.dot` elements. The fetch fallback is also acceptable (single GET `/api/read_status?chapter_id=...` on mount) — pick one and document. Either way, the existing `cs300:read-status-changed` event listener on the new TOC stays wired so cross-component refresh still works."
   - *Audit check:* "Open `/DSA/lectures/ch_4/` in `npm run dev`, mark a section read, reload, confirm the MarkReadButton renders as 'Unmark' (not 'Mark') for the marked section without requiring a click."

2. **T1** — add an audit-check bullet:
   - "The chapter content wrapper remains `<article>` in `src/pages/{lectures,notes,practice}/[id].astro`. Verify by grep + DOM inspection — `MarkReadButton.astro` line 70 queries `article a[id^="ch_"]` for IntersectionObserver, and removing the `<article>` tag (e.g., replacing with `<div class="content">`) would break the M3 'current section' detection silently."

Optionally, reference this issue file from both amendments so the carry-over is traceable.

### HIGH-2 — T2's hardcoded `/DSA/lectures/<id>/` href bypasses the project's existing `import.meta.env.BASE_URL` convention

**Finding.** T2 step 2 line 26 specifies:

> Each `<li>` = `<a href="/DSA/lectures/<id>/">ch_N — Title</a>`, with `aria-current="page"` when the slug matches.

The current `src/pages/index.astro` line 16 uses `const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');` and constructs every chapter link as `${baseUrl}/lectures/${c.id}/`. `astro.config.mjs` line 30 sets `base: '/DSA/'`, but the convention is to read BASE_URL, not hard-code the literal — every M2-shipped page does it that way. `Base.astro` line 27 also reads `import.meta.env.BASE_URL` for the favicon.

If the user ever changes `base` (e.g., for a forked deploy at a different sub-path), every M-UX link will break and the breakage will be silent (no build error — just 404s on click). T3 step 6 and T7 step also reference `/DSA/lectures/ch_4/` literally in **smoke test instructions** (acceptable, since the auditor runs against the configured base) — but T2's deliverable text prescribes hardcoding the `/DSA/` prefix into the produced HTML, which is the actual regression.

T5 step 2 line 33 has the same problem (`/DSA/lectures/<id>/`, etc.) for ChapterCard links.

**Severity:** HIGH — drift from a project-wide convention codified in M2. Easy to miss because the smoke tests ("auditor opens `/DSA/lectures/ch_1/`") read the same way; the deliverable text is what's wrong.

**Action / Recommendation.** Amend T2 step 2 line 26 and T5 step 2 line 33 to read:

> Each `<li>` = `<a href={\`${baseUrl}/lectures/${c.id}/\`}>ch_N — Title</a>` where `const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');` (matches the existing `src/pages/index.astro` convention).

T3 step 4 also produces breadcrumb path links — the spec doesn't show the literal `href` template, but the same rule applies; add a one-line note: "All chapter / collection links use `import.meta.env.BASE_URL`-prefixed paths, not hardcoded `/DSA/...`."

### HIGH-3 — T8's `dist/client/` baseline is not actually verifiable from `bf9c773`

**Finding.** T8 step 1 line 25 says *"Pre-M-UX commit was `bf9c773` (M3 close commit). Build that commit's tree (or read its dist/client size from prior records)."* And line 26: *"`dist/client/` size baseline: ~1.6 MB (from M3 T8 verification report)."*

I checked `design_docs/m3_deploy_verification.md` — the cited "~1.6 MB" appears in a table cell as `dist/client/ ~1.6 MB`. So the value exists. However, T8's step 2 budget is *"total size delta <50KB"* against that baseline. This is fine **if the M3 baseline number is treated as authoritative**, but the M3 T8 report itself uses qualifying language ("estimate", "n/a (was `dist/` directly)") for parts of the table — the `~1.6 MB` is a measured number for the M3-close `dist/client/` only.

The risk: if the auditor follows T8 step 1 literally and tries to "build that commit's tree" at `bf9c773` to capture a pre-M-UX baseline themselves, they'll discover that `bf9c773` was the M3 close commit which already includes M3 surfaces — so the "pre-M-UX" baseline = "M3-close baseline" = 1.6 MB. That's correct. But T8 doesn't say so explicitly; it leaves the auditor to either trust the M3 report or rebuild. A re-check at `bf9c773` will land on a slightly different number than 1.6 MB depending on Node version + npm cache state, and the resulting "delta" math will be noise.

**Severity:** HIGH for repeatability of the T8 audit gate — without a stable baseline the <50KB budget is unenforceable.

**Action / Recommendation.** Amend T8 step 1 to either (a) pin the baseline as "the `~1.6 MB` value from `design_docs/m3_deploy_verification.md`, do not rebuild" and accept the comparison as approximate, or (b) require the auditor to capture a fresh baseline at `bf9c773` *before* any M-UX implementation work starts (so the same Node + npm + filesystem produces both numbers), and record the exact baseline number in the M-UX issue file. Either is fine; pick one. Recommended (b) because the T8 budget ("<50KB delta") is tight enough that environment noise matters.

While editing, add a step 0: *"Capture baseline before T1 starts: build `bf9c773` clean, record `du -sh dist/client/`, `find dist/client -name '*.html' | wc -l` (=37), and the `dist/client/_astro/*.js` sum. Pin numbers in the M-UX issue file."*

## 🟡 MEDIUM

### MEDIUM-1 — `drawer-trigger` slot declared in T1 but consumed via Breadcrumb-internal slot in T7

**Finding.** T1 line 15 commits `Base.astro` to five named slots: `breadcrumb`, `left-rail`, `default`, `right-rail`, `drawer-trigger`. T7 line 16 instead specifies that `Breadcrumb.astro` gains a slot for the drawer trigger. The Base-level `drawer-trigger` slot is never used by any task; the actual drawer trigger lives inside the breadcrumb slot's content.

Two reasonable resolutions:

- **(a)** Drop `drawer-trigger` from T1's slot list. Keep it inside Breadcrumb.astro per T7 — the trigger is conceptually part of the breadcrumb (visible only at <1024px, sits next to the path). This matches T7's actual plan.
- **(b)** Keep `drawer-trigger` at the Base.astro level. Have T7 mount the hamburger into that slot directly, not into Breadcrumb. Decouples the trigger from breadcrumb's lifecycle.

Lean: **(a)** — simpler, matches T7's actual design, removes the orphan slot from T1's contract.

**Severity:** MEDIUM — slot-naming drift between T1 and T7 will surface during T1 implementation as a "what do I put in drawer-trigger?" question. Better resolved now in the spec than at Builder time.

**Action / Recommendation.** Amend T1 line 15 to drop `drawer-trigger` from the slot list (leaving four: `breadcrumb`, `left-rail`, `default`, `right-rail`). Add a note in T1 "Notes": "Drawer trigger button is not a Base-level slot — T7 mounts it inside `Breadcrumb.astro` so the breadcrumb's flexbox layout owns its placement." T7 line 16 stays as-is.

### MEDIUM-2 — T6's lectures/notes/practice scope decision is left to the Builder, but the chrome breadth is set in T2/T3

**Finding.** T6 step 2 line 32: *"Decide the lectures/notes/practice scope question. Lean: lectures only for annotations + mark-read."* Builder picks at implementation time. But T2 line 17 (LeftRail wired into `left-rail` slot for *all three* collections) and T3 (Breadcrumb on every chapter page) already commit to "chrome on all three collections." T4 line 20 commits to TOC on lectures only. So:

- All collections get: left rail (T2), breadcrumb (T3).
- Lectures only get: TOC (T4), annotations + mark-read (T6 leans).
- Notes/practice get: chrome but no TOC, no annotations.

This is consistent — but the M-UX README "Done when" bullets don't constrain T6's call, and a Builder could plausibly extend annotations to notes/practice without violating any acceptance bullet (then bake in scope creep). Better to pin the lean now.

**Severity:** MEDIUM — scope-creep risk at T6 implementation. Easy to fix by promoting T6's "lean" to a hard "scope" line.

**Action / Recommendation.** Amend T6 step 2 to: *"Scope: lectures only for annotations + mark-read. Matches M3's original mount points. Do not extend to notes/practice in M-UX — extension is a follow-on if the user reports friction."* Drop the "Decide… Defer expansion to a follow-on if useful" framing.

### MEDIUM-3 — T4's decompose trigger is concrete but doesn't say *when in the session* to split

**Finding.** T4 lines 53–55 list a clean T4a / T4b decompose path, and the M-UX `tasks/README.md` line 25 calls T4 "the biggest unknown; likely candidate to decompose into T4a (SSR TOC + slot) + T4b (scroll-spy island + SectionNav refactor)." But the trigger language is "If T4 grows past one session" — that's reactive, not pre-emptive. By the time the Builder discovers it's a >1-session task, they've already spent the session.

CLAUDE.md's guidance ("a session-sized unit of work") + the explicit T4-is-the-biggest-task framing suggests T4 should be **pre-decomposed** at breakout time, not at Builder time. The Builder report's own framing ("T4 is flagged as a decompose candidate") admits this.

**Severity:** MEDIUM — risk of mid-session bloat. Compared to the HIGH findings, this is recoverable (Builder can split mid-cycle), but the breakout has the chance to make the call cleanly upfront.

**Action / Recommendation.** Two options:

- **(a)** Pre-split T4 into T4a (SSR TOC + RightRailTOC component + slot wiring + lectures-route plumbing, no SectionNav touch) and T4b (ScrollSpy island + SectionNav refactor + read-status indicator port + MarkReadButton coupling fix from HIGH-1). Update `tasks/README.md` index, M-UX README task table, and downstream depends-on (T6 depends on T4b, not T4 — T4a is enough for the slot to exist).
- **(b)** Tighten the decompose trigger: *"If after auditing M3 SectionNav (T4 step 1) the diff to remove + re-point the read-status indicator logic looks larger than ~30 lines of new code, split into T4a/T4b before writing any code."* Concrete enough that the Builder can decide in the first 15 minutes.

Lean: **(b)** — keeps the breakout small. **(a)** is cleaner if the user wants every session pre-bounded.

### MEDIUM-4 — M3 `MarkReadButton` IntersectionObserver depends on the article anchor structure that T1 doesn't formally protect

**Finding.** Companion to HIGH-1. `MarkReadButton.astro` line 70: `const anchors = document.querySelectorAll<HTMLElement>('article a[id^="ch_"]');`. The `<article>` wrapper + `<a id="ch_N-...">` anchor pattern is an M2 T4 contract (the pandoc Lua filter emits these anchors before each header — see `architecture.md` §1 "Pandoc + Lua filter" line 74). T1's rewrite doesn't enumerate this contract.

**Severity:** MEDIUM (would be HIGH but T1's "existing M3 components still render" audit-check bullet provides partial cover). The article wrapper survival is implicit; making it explicit prevents a regression.

**Action / Recommendation.** Already covered by HIGH-1's T1 audit-check amendment: "The chapter content wrapper remains `<article>`; the `<a id="ch_N-...">` anchor structure survives the rewrite." If HIGH-1 is fixed, MEDIUM-4 is closed automatically.

### MEDIUM-5 — T1's CSS-approach decision (inline `<style>` vs `src/styles/chrome.css`) is left ambiguous

**Finding.** T1 line 16 deliverable: *"`src/styles/chrome.css` (or inline in `Base.astro` `<style>` — pick one and document)"*. T1 line 44 Notes elaborates: *"T1 picks: inline `<style>` in `Base.astro` for the layout grid (small surface, owned-by-Base), separate `src/styles/chrome.css` for any rule that's shared between Base and a `chrome/` component (avoids duplication when T2/T3/T4 need the same colour token). Document the rule at the top of whichever file lands."*

The Notes section makes the call (mixed approach). The deliverable text doesn't reflect it. T2/T3/T4 don't reference where to look for shared tokens — just "use the accent colour from `chrome.css`" (T2 line 32). If `chrome.css` doesn't exist after T1 (because T1 chose inline-only), T2 will create it from scratch — fine outcome, but the spec should be unambiguous.

**Severity:** MEDIUM — Builder-time ambiguity that the Notes section partially resolves. Easy to tighten.

**Action / Recommendation.** Amend T1 deliverable line 16 to: *"`src/styles/chrome.css` — created as part of T1 to host shared CSS custom properties (the accent colour, font-stack token, breakpoint variable) and any rule that will be referenced by `chrome/` components in T2/T3/T4. Layout grid + Base-only rules stay inline in `Base.astro` `<style>`."* Drop the "(or inline)" disjunction.

## 🟢 LOW

### LOW-1 — T2's "all sections marked" completion rule may never trigger for ch_3 / ch_4

**Finding.** T2 lines 48–51 propose rule (a) "All sections marked" as the initial completion-check rule. The `chapters.json` data + the build-content script output show ch_3 = 102 sections, ch_4 = 68 sections. A rule requiring "all 102 sections marked" before the Required-group checkmark appears is unlikely to trigger in normal use. The note even acknowledges this ("Possibly never triggered for chapters with many sections") but proposes (a) anyway with "switch to (a-with-progress-fraction) if it never triggers in practice."

**Severity:** LOW — the spec correctly defers the call to T2 implementer + post-implementation review. Worth noting for the T2 issue file.

**Action / Recommendation.** No spec change needed. When T2 lands, the audit issue file should call out the chosen rule explicitly and recommend the "X of Y sections" variant if the strict rule is observably useless. Pre-flagging here so the T2 auditor doesn't miss it.

### LOW-2 — T8's "no `dist/api/` directory" check may not match Astro 6 hybrid output

**Finding.** T8 step 5 line 48: *"No `dist/api/` directory."* M3 T8 audit issue (and the M3 deploy verification doc) discovered that the Astro 6 hybrid-output adapter does emit some artefacts; the upload-pages-artifact action was changed to point at `./dist/client` rather than `./dist`. The concern there was that `dist/api/` HTML for API routes would mis-serve. Today the API routes are server-only (verified by reading the route files at `src/pages/api/*.ts`), so they don't produce HTML — but the no-`dist/api/` check is a derived consequence, not a primary contract. The primary contract is "`dist/client/` contains exactly the prerendered pages, nothing extra."

**Severity:** LOW — shape of the check is fine; phrasing could be more precise.

**Action / Recommendation.** Optional rewording in T8 step 5: *"`dist/client/` contains exactly the 37 prerendered HTML files + bundled assets, no API-route artefacts. (The hybrid-output adapter places server entry points under `dist/server/`; verify with `find dist/client -name 'index.html' | wc -l` = 37 and `ls dist/client/api 2>/dev/null` returns no HTML.)"* Not blocking.

### LOW-3 — M-UX README "Maps to" line says sidecar but doesn't include a Drive-doc note

**Finding.** M-UX README line 3: *"Maps to: sidecar — promoted from `nice_to_have.md` 2026-04-24, not in original `interactive_notes_roadmap.md` phasing."* CLAUDE.md "Canonical file locations" identifies the Google Drive doc id as historical-only and not actively synced. The line is correct as written, but adopting the milestones-README-style framing ("not in original `interactive_notes_roadmap.md` phasing") might confuse a future reader who tries to look up the original phasing source. The milestones index (line 32) handles this by saying "sidecar (not in the original `interactive_notes_roadmap.md` phasing)" — same wording. Low-priority cosmetic alignment.

**Severity:** LOW — purely cosmetic.

**Action / Recommendation.** No change needed.

## Additions beyond spec

None. The breakout adopts only the Canvas-LMS-style left-nav item from `nice_to_have.md`, and every task ladders back to either an ADR-0002 commitment, an architecture.md §1.6 contract, or an explicit M3 carry-over (SectionNav refactor + M3 component re-home). No tasks introduce surfaces (search, dark mode, theming, color-palette work, animation discipline, M5 review-queue UI itself, M6 Monaco editor pane, M7 audio player) that would constitute scope creep.

## Verification summary

| Gate | Command | Result |
| --- | --- | --- |
| Commits at HEAD | `git log --oneline -3` | ✅ `b67350c` + `e14813a` are HEAD-2 and HEAD-1 (M4 architecture clarification `99d4813` is the next-older commit, irrelevant to this audit per scope) |
| Working tree clean | `git status --short` | ✅ empty output |
| File-existence | `ls` on every claimed path | ✅ all 8 task specs + tasks/README + milestone README + ADR + architecture.md exist |
| Cross-reference resolution | manual inspection of every relative link in task specs | ✅ all resolve to real files |
| `chapters.json` shape | `Read` + grep | ✅ fields `{id, n, title, subtitle, required}`; 12 rows; partition Required=6 / Optional=6 |
| Slot-naming consistency | grep across all task specs | ⚠️ `drawer-trigger` declared in T1, never consumed (MEDIUM-1) |
| M3 component coupling | direct read of all four M3 components | ⚠️ undocumented `#section-nav` DOM coupling in MarkReadButton (HIGH-1) |
| BASE_URL convention | grep `src/` for `import.meta.env.BASE_URL` + grep specs for hardcoded `/DSA/` | ⚠️ T2/T5 hardcode `/DSA/` in deliverable text (HIGH-2) |
| `package.json` change | `git show --stat e14813a b67350c` | ✅ no manifest changes in either commit (only `.md` files) |
| `npm run build` | `npm run build` | ⚠️ environment-blocked (Node 18.19.1 in this shell vs Astro's `>=22.12.0`); not a spec defect — the prebuild content step ran clean and produced the expected 36 MDX outputs |

The build environment blocked the optional clean-build check. Per the audit scope ("`npm run build` is OPTIONAL"), this is a non-issue for the breakout audit — the working tree is clean, no source code changed, and the prebuild step produced the expected outputs. Forward note for the M-UX Builder: the running shell is on Node 18; T1+ work will need a Node 22.12+ environment. Pre-Builder check.

## Meta-audit (2026-04-24) — deep analysis of the original-fix amendments

After the initial Builder pass landed amendments for ISS-01 through ISS-08, a second, more skeptical Auditor pass tested whether the audit-checks I added would actually catch the regressions they were meant to catch — and whether the spec amendments left any contract gaps between cooperating tasks. Six findings, surfaced as `MUX-BO-DA-NN`:

- **DA-1 (HIGH)** — the audit-check grep `grep -nF '"/DSA/'` for the BASE_URL convention only matches double-quoted hardcoding. Template-literal hardcoding (` `/DSA/...` `) and single-quoted paths slip past silently. **The audit-check would have passed for the regression class HIGH-2 was designed to prevent.** Fixed by switching to `grep -nE '/DSA/'` across T2/T3/T5.
- **DA-2 (MEDIUM)** — T4 Step 4 specified `[data-read-indicator]` spans but didn't pin which attribute marks them as read; Step 5 Option (a) said "use whatever attribute T4 picks." Fixed by pinning `data-read="true"` in Step 4 (matches M3's prior `.dot[data-read]` convention) and tightening Step 5's selector accordingly.
- **DA-3 (MEDIUM)** — T4 Step 4 transferred `SectionNav`'s GET-on-mount fetch logic but silently dropped its `cs300:read-status-changed` event listener. The TOC indicators would stale-render after a `MarkReadButton` toggle until reload. Fixed by explicitly requiring the listener in Step 4.
- **DA-4 (MEDIUM)** — T8 Step 0 said "pin the baseline in the M-UX issue file" without specifying which one. The breakout audit file (this one) is now PASS / frozen, and `T08_issue.md` doesn't exist yet. Fixed by pinning a dedicated `issues/pre_m_ux_baseline.md` sibling file.
- **DA-5 (MEDIUM)** — T8 Step 0 advised `git checkout bf9c773` without warning that uncommitted work could be silently discarded. Fixed by switching the recommended procedure to `git worktree add` with a stash-fallback note.
- **DA-6 (FLAGGED, test-then-decide)** — T6 Step 4 says "re-home `MarkReadButton` to the article header (default slot)," but M3's `MarkReadButton.astro` has `position: fixed; bottom: 16px; left: 16px;` — the CSS decouples DOM-position from render-position, so moving the JSX import is a no-op visually. Two interpretations possible (keep floating vs. strip positioning); the design call needs the new chrome to exist before it can be made well. Flagged in T6 Step 4 with explicit (i)/(ii) options + a test-then-decide procedure rather than pre-deciding.

The most important meta-audit lesson: **a grep that exists isn't the same as a grep that catches what it's supposed to catch.** CLAUDE.md's "Code-task verification is non-inferential" rule applies to audit-checks themselves, not just to the implementation they verify. The single-cycle Auditor pass on the original fixes verified each ISS-NN claim was *present* in the spec text — not that the verification mechanism worked. The meta-audit pass closed that gap.

DA-1 through DA-5 resolved by direct spec amendment 2026-04-24 (same-day as ISS-NN fixes). DA-6 left flagged in T6 per user direction — Builder makes the call during T6 implementation.

## Third deep-analysis pass (2026-04-24) — audit-check enforcement gaps

After the second pass closed with ✅ PASS, a third deep-analysis pass tested whether the audit-checks added in cycle 2 actually exercise the contracts they claim to enforce. Three MEDIUM + one LOW finding, surfaced as `MUX-BO-DA2-NN`:

- **DA2-A (MEDIUM)** — DA-3's listener requirement (`cs300:read-status-changed` listener on the new TOC) has **no audit-check that exercises it**. T4's existing reload-state AC tests `refreshMarked()`'s on-mount fetch; nothing tests the live listener. A Builder writing only the on-mount fetch (skipping the listener) would ship a regression where TOC indicators stale-render after every `MarkReadButton` toggle until reload, and every existing T4 AC would still pass.
- **DA2-B (MEDIUM)** — T2's `CompletionIndicator` doesn't subscribe to `cs300:read-status-changed`. T2 Step 3 specifies on-mount fetch only. Cross-component asymmetry with T4 (per DA-3): right-rail TOC updates live, left-rail chapter checkmark goes stale until reload. The user marks the last section of ch_4 → TOC indicator updates, but the "Required" group's ch_4 checkmark in the left rail does not.
- **DA2-C (MEDIUM)** — T1 doesn't reference T8 Step 0 as a prerequisite, so it's silently skippable. T8 Step 0 says "before any T1 code lands, the auditor (or whoever picks up T1) runs..." — but T1's spec doesn't surface this. A Builder picking up T1 reads T1's deliverable + steps + ACs, sees no mention of baseline capture, plows ahead. T8's audit later finds `pre_m_ux_baseline.md` missing → fails → someone retroactively runs the capture against a tree where M-UX work has already landed.
- **DA2-D (LOW)** — T4 ScrollSpy Step 3 says "query `[id]` headings inside the article container" without specifying the selector. T1 amendment requires `<article>` to survive — T4 should pin `article [id]` to match T1's contract so a future rename surfaces as a HIGH ScrollSpy break, not a silent no-op.
- **DA2-E (LOW)** — DA-1's grep `grep -nE '/DSA/' src/components/chrome/<file>.astro` could match `.astro` comment lines (`<!-- /DSA/foo -->`, `// /DSA/...` inside script blocks) and false-positive on legitimate doc references. Hypothetical today (the chrome components don't have such comments at planning time), but the audit-check should narrow to substantive matches — either filter `-v` for comment prefixes, or rely on the reviewer's eyes after the grep produces a hit. Document the exception clearly.
- **DA2-F (LOW)** — T7 step 1 vs step 16 hamburger-mounting language is internally loose (pre-existing, not introduced by my fixes — but MUX-BO-ISS-04's "drawer trigger lives inside `Breadcrumb.astro`" resolution made the distinction load-bearing). Step 1 line 25 says "Hamburger `<button>` in the breadcrumb slot" (Base-level slot region); step 16 says "`Breadcrumb.astro` (from T3) updated — gains a slot for the drawer trigger button" (component-internal slot). Two different mounting strategies — pick one.

**Two further observations (not standalone findings):**
- **DA2-G** — T6's (i)/(ii) positioning vs Notes (a)/(b) granularity framings have subtle overlap (Notes (a) bundles "per-chapter button + at article header"; my (i)/(ii) is positioning-only). The test-then-decide procedure is robust to this; Builder will figure it out at implementation. Flag-only.
- **DA2-H** — T6 Step 4 has grown long after DA-6's flag (multi-paragraph deliberation, three sub-callouts). Sign that T6 might benefit from a Builder-time decompose if the (i)/(ii) decision triggers (ii). Not blocking. Flag-only.

The recurring lesson, now confirmed across three passes: **CLAUDE.md's "non-inferential verification" principle applies recursively** — to the implementation, to the audit-checks, and to whether the audit-checks exercise the contracts being added. A fix-for-the-fix-for-the-fix that doesn't enforce its own contract leaves the original gap open.

### DA2 actions

- **DA2-A** → T4: add an AC that exercises the listener without reload. Concrete observation: "Auditor opens `/DSA/lectures/ch_4/` in `npm run dev`, marks a section read via `MarkReadButton`, **does not reload**, observes the corresponding TOC entry's read indicator flip from un-marked to marked within ~1s. If the indicator only updates after reload, the listener wasn't wired."
- **DA2-B** → T2 Step 3: add a `cs300:read-status-changed` listener requirement scoped to the current chapter (not all 12 — the other chapters' state can't change without navigation). Add matching AC: "Auditor on a chapter page marks a section read; observes the chapter's left-rail checkmark refresh without reload."
- **DA2-C** → T1: add a Step 0 pointing at T8 Step 0. Concrete: "Before writing any code, confirm `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` exists. If not, run T8 Step 0 first (`git worktree add` at `bf9c773`, capture three numbers, write the file)."
- **DA2-D** → T4 Step 3: pin `article [id]` selector. One-line: "Selector: `article [id]` — matches T1's preserved `<article>` wrapper contract (MUX-BO-ISS-01 / HIGH-1)."
- **DA2-E** → T2/T3/T5: add a one-line note next to the BASE_URL audit-check that the `grep -nE '/DSA/'` may surface comment hits — auditor reviews the lines, doesn't fail blindly on a non-empty grep result. (Or narrow with a `-v` filter; pick one and document.)
- **DA2-F** → T7: tighten the hamburger-mounting language so step 1, step 16, and the deliverable list agree on a single placement strategy. Lean: T7 step 16's framing wins (drawer trigger lives **inside** `Breadcrumb.astro`'s component-internal slot, not directly in Base.astro's `breadcrumb` slot). Update step 1 line 25 and the deliverable bullet at line 15 accordingly.

### Auditor verification (cycle 4 — 2026-04-24)

Independent re-audit of the Builder's DA2 amendments. Builder-claim verification, not Builder-summary trust. All gates run from scratch.

**Phase 1 — Design-drift check.** No drift introduced by DA2 amendments:
- No new dependencies (DA2 is spec-text only). `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` shows zero changes.
- No source code touched (`git diff --stat HEAD -- src/` shows zero changes).
- No `nice_to_have.md` items silently adopted. The only `nice_to_have` reference across the six amended specs is T5 line 11's pre-existing acknowledgment of the parked entry that ADR-0002 already promoted (legitimate).
- Status-surface discipline: all 8 task specs remain `todo` (T1 line 3, T2 line 3, T3 line 3, T4 line 3, T5 line 3, T6 line 3, T7 line 3, T8 line 3); `tasks/README.md` lines 9–16 all show `todo`; milestone `README.md` task table lines 36–43 all show `todo`; milestone `README.md` Done-when bullets lines 19–28 all `[ ]`. No tasks closed this cycle, so the four-surface flip rule does not fire — and no surface drifted.
- T1 Step 0's reference to `pre_m_ux_baseline.md` is correctly to a *future-existing* path (T8 Step 0 produces it pre-T1 implementation); not a path that should already exist. The conditional language ("If it does not, run T8 Step 0 first") handles the "file missing" case explicitly.

**Phase 2 — Gate re-run.** Per CLAUDE.md "per-task verification IS the audit gate." For spec-amendment-only work, gates = grep + git diff:

| Gate | Command | Result |
| --- | --- | --- |
| DA2-A cited in T4 | `grep -n 'MUX-BO-DA2-A' design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md` | ✅ line 57 |
| DA2-B cited in T2 | `grep -n 'MUX-BO-DA2-B' design_docs/milestones/m_ux_polish/tasks/T2_left_rail.md` | ✅ lines 32 + 46 (Step 3 + AC) |
| DA2-C cited in T1 | `grep -n 'MUX-BO-DA2-C' design_docs/milestones/m_ux_polish/tasks/T1_layout_shell.md` | ✅ line 23 (Step 0) |
| DA2-D cited in T4 | `grep -n 'MUX-BO-DA2-D' design_docs/milestones/m_ux_polish/tasks/T4_right_rail_toc.md` | ✅ line 31 (Step 3) |
| DA2-E cited in T2/T3/T5 | `grep -n 'MUX-BO-DA2-E' design_docs/milestones/m_ux_polish/tasks/T{2,3,5}*.md` | ✅ T2:42, T3:44, T5:52 |
| DA2-F cited in T7 | `grep -n 'MUX-BO-DA2-F' design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md` | ✅ line 25 |
| No source-code changes | `git diff --stat HEAD -- src/` | ✅ empty |
| No manifest changes | `git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` | ✅ empty |
| Working tree limited to expected files | `git status --short` | ✅ only the 6 amended task specs + audit file + CHANGELOG.md |
| `npm run build` | n/a | ⚠️ skipped — environment-blocked (Node 18 vs Astro `>=22.12.0`); acceptable per cycle-2 precedent (DA2 is text-only spec edits) |
| CHANGELOG newest-first ordering | `grep -n 2026-04-24 CHANGELOG.md \| head` | ✅ DA2 entry sits at top of the 2026-04-24 dated section (line 17), above the cycle-3 (DA-NN) entry at line 25 and the cycle-2 (ISS-NN) entry at line 33 |

**Phase 3 — AC grading (DA2-NN as ACs).**

| ID | Status | Verification |
| --- | --- | --- |
| DA2-A | ✅ PASS | T4 line 57 contains an AC that exercises the listener live (mark a section, **does not reload**, observes `[data-read-indicator]` flip to `data-read="true"` within ~1s). The AC names the regression class explicitly ("If the indicator only updates after reload, the `cs300:read-status-changed` listener wasn't wired") so a Builder skipping the listener cannot pass it. Cross-references DA2-B for symmetry. |
| DA2-B | ✅ PASS | T2 Step 3 line 32 registers `cs300:read-status-changed` listener, **scoped to the current chapter via `data-current-chapter` data-attribute** (re-fetches that chapter only — not all 12). Matching live-refresh AC at line 46 enforces the listener exists and is correctly scoped. The "scoped to current chapter" detail is correctly emphasized — a global re-fetch would be wasted work and would mask scope bugs. |
| DA2-C | ✅ PASS | T1 line 23 has Step 0 (numbered before Step 1) referencing `pre_m_ux_baseline.md` and pointing at T8 Step 0's full procedure (worktree + three pinned numbers + `## Pre-M-UX baseline` section). The Step-0 framing is correct: a prerequisite-check, not a deliverable. Conditional fallback language ("If it does not, run T8 Step 0 first") makes the dependency operationally usable. |
| DA2-D | ✅ PASS | T4 Step 3 line 31 pins selector to `article [id]` with rationale citing T1's preserved `<article>` wrapper contract (MUX-BO-ISS-01 / HIGH-1; T1 Step 2 + audit-check #7). The "don't write `document.querySelectorAll('[id]')`" call-out makes the regression class explicit. |
| DA2-E | ✅ PASS | T2 line 42, T3 line 44, T5 line 52 each have the comment-hit policy note (default: reviewer-eyes, not blind-fail). Wording is consistent across the three (template-literal regression class + comment-line carve-out). T2 additionally provides the optional `grep -vE` narrowing pattern; T3 + T5 reference the policy without the optional pattern. Acceptable variance — the policy is the same. |
| DA2-F | ✅ PASS | T7 step 1 line 25 now reads "inside `Breadcrumb.astro`'s component-internal drawer-trigger slot — not directly in `Base.astro`'s `breadcrumb` slot region", and explicitly cross-references deliverable line 16 + MUX-BO-ISS-04. Step 1 + deliverable line 16 + ISS-04 resolution all converge on a single placement strategy (component-internal slot inside Breadcrumb.astro). |

**Phase 4 — Critical sweep findings.**

- **No additions beyond DA2 scope.** Each of the six amendments matches its action-line scope verbatim. No drive-by edits, no surprise refactors.
- **No silently skipped deliverables.** All six DA2-NN findings are present in the spec text at the cited lines.
- **No cross-task inconsistency.** T2's listener (DA2-B) and T4's listener (DA-3 + DA2-A) both subscribe to `cs300:read-status-changed` with no `detail` payload, both re-run a GET on the event. T2 scopes to the current chapter, T4 scopes to the current chapter's section list — these scopes are compatible (one MarkReadButton dispatch causes both islands to re-fetch their own chapter-scoped data; no event-storm risk because the M3 button only dispatches once per click).
- **DA2-A's "asymmetric behaviour … is a HIGH finding" call-out is enforced by the cross-referenced T2 AC at line 46.** If only one listener is wired, T2 line 46 OR T4 line 57 fails — neither AC requires the *other* listener to exist for it to pass on its own surface, so the asymmetry surfaces directly. No coverage gap.
- **CHANGELOG accuracy.** Line 17–24 entry accurately summarizes per-finding amendments and matches the actual spec text. Newest-first ordering preserved within the 2026-04-24 dated section (DA2 entry → DA-NN entry → ISS-NN entry → breakout-add entry → kickoff entry).
- **Issue log table integrity.** All six DA2 rows (lines 390–395) have ID / Severity / Status / Owner / History columns populated. Status flips for all six are `✅ RESOLVED 2026-04-24`.
- **Propagation status footer.** Lines 415–426 accurately describe the cycle-4 sequence (T1, T2, T3, T4, T5, T7 amended; T6 + T8 untouched per the action-lines). The "no carry-over to a future milestone" + "no `nice_to_have.md` deferrals" footer claims are correct — DA2 amendments are direct spec edits, not forward-deferrals.
- **Three top status blocks** (lines 6–10) accurately reflect cycle history: current ✅ PASS (cycle 4), prior PASS (cycle 2 close), original ⚠️ OPEN (initial audit). The "third deep-analysis pass" framing in line 6 is consistent with the narrative section at line 344.

**Phase 5 — Verdict.** Builder's flips are *not* premature. All six DA2-NN findings land at the cited lines with the cited semantics. ✅ PASS stands. Status remains ✅ PASS post-cycle-4.

**Phase 6 — Forward-deferral propagation.** N/A — DA2 amendments are direct spec edits to existing M-UX task specs, not forward-deferrals to future tasks. Propagation status footer at lines 415–426 correctly reflects this.

## Issue log — cross-task follow-up

| ID | Severity | Status | Owner | History |
| --- | --- | --- | --- | --- |
| MUX-BO-ISS-01 | HIGH | ✅ RESOLVED 2026-04-24 | T1 + T4 spec amendments (T4 Step 5 + reload-state audit-check; T1 audit-check #2 + Step 2 article-wrapper note) | New 2026-04-24; resolved same-day via direct spec amendment (no implementation yet) |
| MUX-BO-ISS-02 | HIGH | ✅ RESOLVED 2026-04-24 | T2 step 2 + T3 step 4 + T5 step 2 + matching audit-check bullets (`import.meta.env.BASE_URL` convention pinned across all chapter/collection link generation) | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-03 | HIGH | ✅ RESOLVED 2026-04-24 | T8 step 0 (baseline capture, non-skippable) + step 1 rewording + audit-check bullet for the M-UX issue file's `## Pre-M-UX baseline` section | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-04 | MEDIUM | ✅ RESOLVED 2026-04-24 | T1 deliverable + step 2 + Notes — `Base.astro` declares four slots only; drawer trigger lives inside `Breadcrumb.astro` per T7 | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-05 | MEDIUM | ✅ RESOLVED 2026-04-24 | T6 step 2 — lectures-only scope pinned, no Builder-time decision | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-06 | MEDIUM | ✅ RESOLVED 2026-04-24 | T4 Notes — concrete decompose trigger (`>30 lines of new/changed code after Step 1 audit` → split before writing code) | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-07 | MEDIUM | ✅ RESOLVED-via-MUX-BO-ISS-01 | T1 audit-check addition (`<article>` wrapper + `<a id="ch_N-…">` anchor preservation) — folded into HIGH-1's T1 amendment | Folded into HIGH-1's T1 amendment |
| MUX-BO-ISS-08 | MEDIUM | ✅ RESOLVED 2026-04-24 | T1 deliverable + Notes — `chrome.css` is a T1 deliverable; "or inline" disjunction dropped | New 2026-04-24; resolved same-day |
| MUX-BO-ISS-09 | LOW | DEFERRED | T2 audit (LOW-1 — completion-rule observability) — surface in T2 issue file at T2 close | New 2026-04-24 |
| MUX-BO-ISS-10 | LOW | OPEN (non-blocking) | T8 spec optional rewording (LOW-2 — `dist/api/` check phrasing) | New 2026-04-24; cosmetic, can land with T8 work |
| MUX-BO-DA-1 | HIGH | ✅ RESOLVED 2026-04-24 | T2/T3/T5 audit-check grep changed from `-F '"/DSA/'` to `-E '/DSA/'` — original literal-quote pattern would have missed template-literal hardcoding (` `/DSA/...` `) and single-quoted paths, defeating the purpose of HIGH-2's audit-check | Meta-audit caught flaw in ISS-02 fix; resolved same-day |
| MUX-BO-DA-2 | MEDIUM | ✅ RESOLVED 2026-04-24 | T4 Step 4 pins indicator marked-state contract: `data-read="true"` (matches M3's `.dot[data-read]` convention). Step 5 Option (a) selector tightened to `[data-read-indicator][data-read="true"]` — no more "use whatever attribute T4 picks" | Meta-audit caught contract gap between Step 4 and Step 5 |
| MUX-BO-DA-3 | MEDIUM | ✅ RESOLVED 2026-04-24 | T4 Step 4 explicitly requires `cs300:read-status-changed` listener on the new TOC's read-status island (M3 `SectionNav.astro` line 88 has it; transferring fetch logic without the listener silently drops cross-component refresh) | Meta-audit caught silently-dropped M3 listener contract |
| MUX-BO-DA-4 | MEDIUM | ✅ RESOLVED 2026-04-24 | T8 Step 0 pins baseline file location to a dedicated `issues/pre_m_ux_baseline.md` (sibling to this audit file) — neither the now-PASS breakout audit nor the not-yet-existing T8 issue file is the right home | Meta-audit caught ambiguous "the M-UX issue file" reference |
| MUX-BO-DA-5 | MEDIUM | ✅ RESOLVED 2026-04-24 | T8 Step 0 advises `git worktree add` (or stash-and-restore fallback) instead of naked `git checkout bf9c773`; matching audit-check bullet verifies the baseline-capture command output uses worktree | Meta-audit caught destructive-checkout risk |
| MUX-BO-DA-6 | MEDIUM | FLAGGED (test-then-decide) | T6 Step 4 explicit "open question" callout — M3 MarkReadButton's `position: fixed; bottom; left;` decouples DOM-position from render-position, so the literal "re-home" framing is ambiguous between (i) keep floating + (ii) make flow-positioned. Builder implements (i) first, smokes both breakpoints, decides during T6 implementation. Not pre-decided | Meta-audit caught structural conflict between M3 CSS and T6 spec wording; flagged-not-fixed per user direction |
| MUX-BO-DA2-A | MEDIUM | ✅ RESOLVED 2026-04-24 | T4 acceptance-check — new AC exercises `cs300:read-status-changed` listener without reload (mark a section, observe TOC indicator `[data-read-indicator]` flip to `data-read="true"` within ~1s; cross-references T2's matching listener AC for symmetry) | Third deep-analysis pass 2026-04-24; resolved same-day via direct spec amendment |
| MUX-BO-DA2-B | MEDIUM | ✅ RESOLVED 2026-04-24 | T2 Step 3 — `cs300:read-status-changed` listener requirement added, scoped to the current chapter (chapter slug embedded as `data-current-chapter` data-attribute; listener re-fetches that chapter only). Matching live-refresh AC added | Third deep-analysis pass 2026-04-24; resolved same-day; cross-component symmetry with T4 |
| MUX-BO-DA2-C | MEDIUM | ✅ RESOLVED 2026-04-24 | T1 Step 0 added — confirms `pre_m_ux_baseline.md` exists before T1 code work; if missing, run T8 Step 0 first (worktree procedure) | Third deep-analysis pass 2026-04-24; resolved same-day |
| MUX-BO-DA2-D | LOW | ✅ RESOLVED 2026-04-24 | T4 Step 3 — ScrollSpy selector pinned to `article [id]` (matches T1's preserved `<article>` wrapper contract, MUX-BO-ISS-01 / HIGH-1) | Third deep-analysis pass 2026-04-24; resolved same-day |
| MUX-BO-DA2-E | LOW | ✅ RESOLVED 2026-04-24 | T2/T3/T5 BASE_URL audit-check — note added that `grep -nE '/DSA/'` may surface comment hits; reviewer-eyes policy, no blind-fail | Third deep-analysis pass 2026-04-24; resolved same-day |
| MUX-BO-DA2-F | LOW | ✅ RESOLVED 2026-04-24 | T7 step 1 line 25 updated — hamburger mounted **inside `Breadcrumb.astro`'s component-internal drawer-trigger slot** (not directly in Base.astro's `breadcrumb` slot region). Now agrees with deliverable line 16 + MUX-BO-ISS-04's resolution | Third deep-analysis pass 2026-04-24; resolved same-day |

## Propagation status

This audit deferred spec amendments to seven of the eight task specs (T1, T2, T3, T4, T5, T6, T8). Because the task specs themselves are the spec of record (no implementation had started), the propagation strategy was **direct spec amendment** — not the usual "carry-over from prior audits" pattern.

**Sequence executed 2026-04-24 (cycle 2 — original ISS-NN amendments):**

1. ✅ Builder amended T1, T2, T3, T4, T5, T6, T8 specs per the HIGH and MEDIUM action lines above. Per-spec landing summary:
   - **T1** — drawer-trigger slot dropped (4 slots only); `chrome.css` pinned as T1 deliverable; `<article>` wrapper + `<a id="ch_N-…">` anchor preservation audit-check added; Step 2 calls out the `<article>` requirement explicitly.
   - **T2** — step 2 link template switched to `import.meta.env.BASE_URL`; matching `grep -nF '"/DSA/'` audit-check added.
   - **T3** — step 4 BASE_URL note added; matching audit-check bullet added.
   - **T4** — Step 5 added (`MarkReadButton.refreshMarked()` re-point with two pickable options); Step 8 added (reload-state correctness smoke); decompose trigger pinned to "first 15 minutes / >30 lines threshold"; matching audit-check bullet added; T4b owns HIGH-1 if split.
   - **T5** — step 2 ChapterCard link template switched to `import.meta.env.BASE_URL`; matching audit-check bullet added.
   - **T6** — step 2 lectures-only scope pinned (no Builder-time decision).
   - **T8** — Step 0 added (non-skippable baseline capture at `bf9c773`, three pinned numbers in the issue file); step 1 rewords to consume the pinned numbers, not the M3 T8 report's `~1.6 MB`; matching audit-check bullet added.
2. ✅ Every amendment cites this file by issue ID (`MUX-BO-ISS-NN`).
3. ✅ This issue file's status flipped to ✅ PASS; per-task ISS-NN entries flipped to RESOLVED 2026-04-24 (see Issue log table).
4. ⏭️ T1 work is unblocked. Subsequent per-task audits will land in `issues/T<NN>_issue.md` (sibling files in this directory).

**Sequence executed 2026-04-24 (cycle 4 — DA2-NN amendments):**

1. ✅ Builder amended T1, T2, T3, T4, T5, T7 specs per the DA2-A … DA2-F action lines. Per-spec landing summary:
   - **T1** ([`tasks/T1_layout_shell.md`](../tasks/T1_layout_shell.md)) — new Step 0 added: confirms `issues/pre_m_ux_baseline.md` exists before T1 code work begins; if missing, run T8 Step 0 first (worktree procedure). Resolves MUX-BO-DA2-C / MEDIUM (forward-prerequisite gap).
   - **T2** ([`tasks/T2_left_rail.md`](../tasks/T2_left_rail.md)) — Step 3 gains `cs300:read-status-changed` listener requirement (scoped to current chapter via `data-current-chapter` data-attribute); matching live-refresh AC added (mark a section read, no reload, observe checkmark within ~1s). BASE_URL audit-check note added: `grep -nE '/DSA/'` comment-hit policy (reviewer-eyes, no blind-fail). Resolves MUX-BO-DA2-B / MEDIUM + MUX-BO-DA2-E / LOW.
   - **T3** ([`tasks/T3_breadcrumb.md`](../tasks/T3_breadcrumb.md)) — BASE_URL audit-check note added: comment-hit policy. Resolves MUX-BO-DA2-E / LOW.
   - **T4** ([`tasks/T4_right_rail_toc.md`](../tasks/T4_right_rail_toc.md)) — Step 3 ScrollSpy selector pinned to `article [id]` (matches T1's `<article>` wrapper contract per MUX-BO-ISS-01); new live-listener AC added (mark a section read, no reload, observe TOC indicator flip within ~1s) — exercises Step 4's listener requirement that DA-3 added but the previous AC set didn't enforce. Resolves MUX-BO-DA2-A / MEDIUM + MUX-BO-DA2-D / LOW.
   - **T5** ([`tasks/T5_index_dashboard.md`](../tasks/T5_index_dashboard.md)) — BASE_URL audit-check note added: comment-hit policy. Resolves MUX-BO-DA2-E / LOW.
   - **T7** ([`tasks/T7_mobile_drawer.md`](../tasks/T7_mobile_drawer.md)) — step 1 line 25 hamburger-mounting language tightened to "inside `Breadcrumb.astro`'s component-internal drawer-trigger slot" (agrees with deliverable line 16 + MUX-BO-ISS-04 resolution). Resolves MUX-BO-DA2-F / LOW.
2. ✅ Every amendment cites this file by issue ID (`MUX-BO-DA2-NN`).
3. ✅ This issue file's status flipped ⚠️ OPEN → ✅ PASS; all six DA2-NN rows flipped to RESOLVED 2026-04-24 (see Issue log table).
4. ⏭️ T1 work remains unblocked.

**No carry-over to a future cs-300 milestone.** All findings are M-UX-internal.

**No `nice_to_have.md` deferrals.** No findings map to deferred items.

## Security review

**Reviewer:** security-reviewer subagent (M-UX-BO-DA2, cycle 4 close)
**Reviewed on:** 2026-04-24
**Scope:** 8 `.md` files touched in this task cycle — T1, T2, T3, T4, T5, T7 spec amendments + `m_ux_breakout_audit.md` + `CHANGELOG.md`. No source code, no manifest, no API routes.

### Verdict: SHIP

This cycle is documentation-only. No source code was modified (`git diff --stat HEAD -- src/ scripts/ public/` empty). No dependency manifest was modified (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty). The security gate's threat model targets source code changes that move the local-only single-user attack surface; spec-text amendments do not move that surface.

### Verification trail

**No sensitive values introduced.** All eight amended files were read in full. No credentials, API keys, Ollama hostnames, `127.0.0.1` or `0.0.0.0` references, environment variable leakage, or internal-only paths appear in any amended text. The `/DSA/` path strings present throughout are the public GitHub Pages base path — not a secret.

**Recommended Builder patterns examined for unsafe construction:**

- T1 Step 0 (worktree baseline capture): uses `git worktree add /tmp/cs-300-baseline bf9c773` and measurement commands (`du -sh`, `find`, `wc -l`). Arguments are static strings, not user-controlled. No shell interpolation risk.
- T2 Step 3 / T4 Step 4 (listener registration): `window.addEventListener('cs300:read-status-changed', ...)` with no `event.detail` read. The chapter slug fed into the re-fetch URL is embedded as a `data-current-chapter` attribute at SSR time, derived from `Astro.url.pathname` at build/render time (static). No runtime user-controlled value flows into the fetch URL.
- T4 Step 3 (ScrollSpy selector): `article [id]` is a static CSS selector string, not derived from any input. No injection surface.
- T2/T3/T5 audit-check grep filter (`grep -nE '/DSA/'` + reviewer-eyes comment-hit policy): reviewer instruction only, not executed code.
- T7 Step 1 (drawer JS island): prescribes `class` toggling, `aria-expanded` flips, and focus trapping via native DOM APIs (`client:load`). No `dangerouslySetInnerHTML`, no `innerHTML` assignment, no `eval`, no dynamic script construction in the recommended pattern.

**All nine threat-model items checked:**

| Threat-model item | Status |
| --- | --- |
| Reference-solution leakage (`questions.reference_json`) | Not touched — no API handler modified |
| Code-execution subprocess integrity | Not touched — no subprocess or `g++` path |
| MDX injection via pandoc pipeline | Not touched — no Lua filter or build-content.mjs |
| Question-content injection via Ollama | Not touched — no question serialization |
| Annotation rendering (`dangerouslySetInnerHTML`) | Not touched — no annotation handler; no unsafe render pattern recommended |
| Feature-detection bypass / accidental exposure | Not touched — no `astro.config.mjs`, no GH Pages workflow, no server bind address |
| Path traversal in content pipeline | Not touched — no `build-content.mjs` |
| Secrets in dist/ | Not touched — no env-access code introduced; no build-time secret references in spec text |
| Dependency supply chain | Not touched — no manifest modified |

**CHANGELOG entry examined.** Contains no sensitive values. References only public file paths and issue IDs internal to this repository.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version` empty).
