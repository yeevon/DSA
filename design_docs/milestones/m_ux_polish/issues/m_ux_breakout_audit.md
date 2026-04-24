# M-UX — milestone breakout (planning-phase) — Audit Issues

**Source artefacts:** [`../README.md`](../README.md), [`../tasks/README.md`](../tasks/README.md), [`../tasks/T1_layout_shell.md`](../tasks/T1_layout_shell.md) … [`T8_deploy_verification.md`](../tasks/T8_deploy_verification.md), [`../../../adr/0002_ux_layer_mdn_three_column.md`](../../../adr/0002_ux_layer_mdn_three_column.md), [`../../../architecture.md`](../../../architecture.md) §1.6, [`../../README.md`](../../README.md) (M-UX row).
**Audited on:** 2026-04-24
**Audit scope:** Planning-phase audit of the M-UX kickoff (commit `e14813a` — ADR + architecture amendment + milestones index sync) and the M-UX task breakout (commit `b67350c` — milestone README + tasks/README + 8 task specs). Verified ADR↔task coverage matrix, nice_to_have boundary discipline, status-surface set-up, cross-reference integrity, M3 dependency assumptions against actual M3 source, code-task verification non-inferential rule, slot-naming contract, no-new-deps commitment.
**Status:** ✅ **PASS** (2026-04-24, after meta-audit cycle) — all 3 HIGH + 4 MEDIUM findings amended directly into the task specs (T1, T2, T3, T4, T5, T6, T8). A subsequent **deep-analysis (meta-audit) pass on 2026-04-24** caught 1 HIGH + 4 MEDIUM defects in the original fixes themselves (`MUX-BO-DA-NN` IDs in the Issue log table); all six DA findings amended in the same day. The ADR + architecture amendment + milestone README were clean from the start. Spec amendments cite this issue file by ID (`MUX-BO-ISS-NN` + `MUX-BO-DA-NN`); see the **Issue log** table below for the per-finding RESOLVED status. T1 is now safe to pick up. LOW-2 + LOW-3 left as flagged-not-blocking; LOW-1 deferred to T2's own issue file at T2 close (per the original audit recommendation). DA-6 (T6 floating-button positioning) flagged for test-then-decide during T6 implementation, not pre-decided.

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

## Propagation status

This audit deferred spec amendments to seven of the eight task specs (T1, T2, T3, T4, T5, T6, T8). Because the task specs themselves are the spec of record (no implementation had started), the propagation strategy was **direct spec amendment** — not the usual "carry-over from prior audits" pattern.

**Sequence executed 2026-04-24:**

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

**No carry-over to a future cs-300 milestone.** All findings are M-UX-internal.

**No `nice_to_have.md` deferrals.** No findings map to deferred items.
