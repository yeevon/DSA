# T8 — Deploy verification (milestone close) — Audit Issues

**Source task:** [`../tasks/T8_deploy_verification.md`](../tasks/T8_deploy_verification.md)
**Audited on:** 2026-04-25 (cycle 1)
**Audit scope:** spec + carry-over (5 prior-audit items) + every claimed deliverable + sticky-fix code change in `Base.astro` + `Breadcrumb.astro` + docstring fixes in `RightRailTOC.astro` + `AnnotationsPane.astro` + new artefact `design_docs/m_ux_deploy_verification.md` + milestone-level Status flip + every Done-when bullet citation + status surfaces (a)/(b)/(c)/(d) + top-level milestone index entry + `.smoke/screenshots/` PNG evidence (3 PNGs opened) + independent re-run of `npm run build` + independent independent server-only-path grep + independent `dist/client/` byte / page count + independent `_astro/*.{js,css}` sums + CHANGELOG + architecture.md §1.6 + ADR-0002 + nice_to_have.md + dep-manifest churn check
**Status:** ✅ PASS — milestone closes cleanly. All 11 ACs (10 *Acceptance check* bullets + the auditor-owned T3-ISS-01 sticky scroll test) graded PASS. The Builder caught and fixed a real T3-deferred sticky-breadcrumb regression in this cycle (option (a) per the T3-ISS-01 carry-over recommendation; PNG evidence verifies the breadcrumb pinned at viewport top throughout the scroll). Carry-over disposition (5 items) all reasonable: 4× RESOLVED, 1× DEFERRED forward (interactive-mode round-trip residual; propagated to nice_to_have.md as a Selenium harness extension trigger). One LOW finding (numeric drift in the verification report's CSS-bundle subtotal — `19,805` vs measured `19,775`, 30-byte off — does NOT affect the +817 KB cumulative figure). One MEDIUM finding (top-level milestone index `design_docs/milestones/README.md:26` still reads `M-UX | active (kicked off 2026-04-24)` — the milestone-level close did not propagate to the top-level index per CLAUDE.md non-negotiable status discipline).

---

## Design-drift check

Before grading ACs: cross-checked the implementation + new docs against [`../../../architecture.md`](../../../architecture.md), [`../../../adr/0002_ux_layer_mdn_three_column.md`](../../../adr/0002_ux_layer_mdn_three_column.md), [`../../../nice_to_have.md`](../../../nice_to_have.md), and the M-UX milestone README. **No HIGH drift.** The sticky-rule relocation is purely structural; architecture.md §1.6 + ADR-0002 specify "top breadcrumb (sticky)" without prescribing which element carries the sticky CSS rule, so moving the rule from the inner nav to the outer slot wrapper is a correct implementation of the same stated behaviour. ADR-0002 §"Decision" + architecture.md §1.6's three-column ASCII diagram + the "sticky on scroll" wording are all preserved verbatim by this fix. The new `design_docs/m_ux_deploy_verification.md` is **spec-mandated** at T8 spec line 13 ("verification report with 5 sections matching the M3 T8 precedent") — not a drive-by; the M3 T8 precedent at `design_docs/m3_deploy_verification.md` exists. No new dependencies were added (`git diff HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` returns empty — verified). No `nice_to_have.md` adoption (the Site UI/UX layer item was already promoted to M-UX 2026-04-24). No coupling additions in source — the fix is a 5-line CSS rule relocation + matching docstring updates.

---

## AC grading

T8 spec lines 92–104 enumerate 10 *Acceptance check* bullets that the auditor owns. Plus the 5 *Carry-over from prior audits* items (T8 spec lines 116–148) are auditor-graded too.

### Spec *Acceptance check* bullets

| #   | AC                                                                                  | Status | Notes |
| --- | ----------------------------------------------------------------------------------- | ------ | ----- |
| AC1 | `design_docs/m_ux_deploy_verification.md` exists with 5 sections + cited numbers   | ✅ PASS | All 5 sections present + a §6 (headless-Chrome smoke matrix) + §7 (runtime push). Numbers match my own re-run. |
| AC2 | Pre-M-UX baseline file exists at the pinned location                                | ✅ PASS | `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md` exists with `4,420,947 B` baseline + 37 pages + Node v22.22.2 / npm 10.9.7 / pandoc 3.1.3 environment + verbatim `du -sb` and `find` output. |
| AC3 | Worktree (not destructive checkout) used for baseline                               | ✅ PASS | `pre_m_ux_baseline.md` line 7 + Command-output section both record `git worktree add /tmp/cs-300-baseline bf9c773` + `git worktree remove`. No naked `git checkout`. |
| AC4 | Auditor runs build size comparison (page count 37, delta within budget)             | ✅ PASS — see verification summary | I re-ran `npm run build` from scratch: exit 0, 37 pages, `du -sb dist/client/` = `5,257,646` (matches Builder), delta `+836,699 B / +817 KB / +18.9%`. The `<50KB` literal cap is exceeded (T7-ISS-02 carry-over); option A picked + bullet 10 reworded — see carry-over grading below. |
| AC5 | Auditor runs static-mode behavioural verification at 1280 + 375                     | ✅ PASS — non-inferential PNG evidence | Opened `lectures-ch4-1280x800.png` (three-column desktop with sticky breadcrumb pinned at top + REQUIRED/OPTIONAL chapter list + ON THIS PAGE TOC right rail), `lectures-ch4-375x812.png` (single-column with hamburger top-left + breadcrumb wrapped + collapsed `▶ ON THIS PAGE` strip + no horizontal scroll). |
| AC6 | Auditor greps for 5 server-only paths in `dist/client/_astro/*.js`                  | ✅ PASS | `grep -rln 'better-sqlite3\|drizzle\|gray-matter\|src/lib/seed\|src/db' dist/client/` returns 0 hits across all five terms — verified independently. |
| AC7 | M3 deploy contract preserved (workflow path, dist split, no api/, generator meta)   | ✅ PASS | `.github/workflows/deploy.yml:76` reads `path: ./dist/client` (M3 T8 fix preserved). `dist/` contains `client/` + `server/`, no `dist/api/`. Generator meta = `Astro v6.1.9` on lectures/ch_4. |
| AC8 | Mobile drawer smoke (auditor opens 375px, clicks hamburger)                          | ✅ PASS at static-mode-layout level (residual interactive smokes deferred per ISS-01) | The PNG at 375px shows the hamburger button visible top-left + drawer closed by default. Click-to-open behaviour is the residual interactive smoke deferred to user-side runtime push verification per ISS-01. The harness only captures static-mode-only PNGs. |
| AC9 | M3 surfaces still hidden in static mode (annotations / checkmarks / dashboard slots) | ✅ PASS | Verification report §2 table confirms 87× `data-interactive-only` carriers on lectures/ch_4 + global CSS rule `body[data-mode="static"] [data-interactive-only] { display: none !important }` present in `DrawerTrigger.BZnwwKtp.css` + `index@_@astro.HjD9NihZ.css`. I independently confirmed counts: lectures/ch_4 = 87, notes/ch_4 = 14, practice/ch_4 = 14, index = 15. |
| AC10 | CHANGELOG entry under 2026-04-XX summarises the milestone with size + deferrals    | ✅ PASS | `CHANGELOG.md` 2026-04-25 section line 17–22: comprehensive Verified entry naming the budget delta, the option-A decision, the T3-ISS-01 sticky-fix, all 5 carry-over dispositions, and dep-audit-skipped (no manifest churn). Status surfaces flipped (a)/(b)/(c)/(d) all named. |
| AC11 | Runtime push verification flagged as pending user push                              | ✅ PASS | `m_ux_deploy_verification.md` §7 explicitly flags this as pending user action with the same procedural posture as M2 T6 + M3 T8. |

### Carry-over from prior audits (5 items)

| Carry-over             | Builder claim          | Audit verdict |
| ---------------------- | ---------------------- | ------------- |
| **M-UX-T2-ISS-02 / MEDIUM** — SSR-embed CompletionIndicator JSON ~444 KB | Deferred — measured + documented; option (a) `GET /api/sections` endpoint remains future candidate | ✅ AGREE. Verification report §1 documents the residual ~432 KB CompletionIndicator JSON manifest (12 chapters × 36 routes ≈ 432 KB) as the dominant contributor to the cumulative +817 KB delta. Option (a) is the architecturally clean fix but not a milestone blocker; deferral is reasonable. |
| **M-UX-T3-ISS-01 / MEDIUM** — Sticky breadcrumb runtime verification | ✅ RESOLVED via fix + Selenium evidence | ✅ AGREE — and additionally appreciated. The Builder didn't just run the test; they caught a real regression (pre-fix `top: 0 → -32857 → -65054` confirms sticky was BROKEN) AND fixed it inline in T8 cycle (option (a) per the T3-ISS-01 recommendation). Post-fix `top: 0` throughout. PNG evidence at `.smoke/screenshots/lectures-ch4-1280x800-midscroll-T3.png` was opened by the auditor: breadcrumb row (path + tab pills + prev/next buttons) is pinned at viewport top while content has scrolled to section 4.9 — verified visually. The fix is correct: the inner `.breadcrumb` containing block was its own outer slot wrapper at the wrapper's auto-sized height (zero stick range); moving sticky to `.chrome > [data-slot="breadcrumb"]` gives real stick range because that wrapper is a direct grid child of `.chrome` with `min-height: 100vh`. Net diff: -30 bytes (one redundant CSS rule consolidated). Desktop layout at 1280×800 verified intact via the standalone 1280×800 PNG (three-column layout still renders; breadcrumb still in expected top position; no breakage). |
| **M-UX-T7-ISS-01 / HIGH** — residual interactive-mode browser smokes | PARTIAL — static-mode coverage via harness is sufficient for layout; interactive-mode round-trip + focus-trap + mark-read click deferred to user-side runtime push | ⚠️ AGREE-WITH-PROPAGATION. The static-mode harness output IS sufficient for the layout-at-viewport surface (the bulk of T6-CO1 + T7-ISS-01 cycle 1 coverage). The residual interactive surface (annotations create → reload → persist; Tab focus-trap; mark-read click; drawer-link-click closes drawer) is genuinely smaller AND structurally inferable (M3 component scripts byte-identical at the source level — verified by the T7 cycle 2 zero-diff `git diff` on AnnotationsPane / MarkReadButton / AnnotateButton scripts). However, this residual gap has now been deferred TWICE (T6 cycle 1 → T7 cycle 1 → T7 cycle 2 → T8). Per CLAUDE.md propagation discipline, a third deferral with no destination task means the gap effectively disappears. **Propagation:** logged below as DEFERRED to `nice_to_have.md` as a Selenium harness extension item ("interactive-mode interaction smoke + focus-trap"). The trigger to promote is "user reports interactive-mode regression on push." This is the right home — not a follow-up task, because there's no milestone to slot it in. |
| **M-UX-T7-ISS-02 / HIGH** — `dist/client/` size budget breach | RESOLVED via option A (accept +817 KB delta, rewrite bullet 10) | ✅ AGREE. The `+50KB` figure was acknowledged in T7 cycle 2 grading as "somewhat arbitrary" by the user; the user identified it as a back-of-envelope guess at breakout time before the layered M-UX scope was understood. The +817 KB delta is dominated by spec-required content (chrome CSS bundles + per-page scoped CSS hashes + the CompletionIndicator manifest which T2-ISS-02 owns). The bad-design symptom that drove the +1.42 MB cycle 1 measurement (twice-rendered LeftRail) was already fixed in T7 cycle 2 (618 KB recovered). The reworded bullet 10 text is accurate vs my own measurement (+836,699 bytes / +817 KB / +18.9%). Citation parenthetical at the end of bullet 10 references both the T8 issue file (this file) and `design_docs/m_ux_deploy_verification.md`. |
| **M-UX-T7-ISS-03 / MEDIUM** — Duplicate IDs across twice-rendered LeftRail | RESOLVED in T7 cycle 2 (single-tree refactor) | ✅ AGREE. I independently verified `grep -c 'id="cs300-completion-indicator"' dist/client/lectures/ch_4/index.html` = 1 + `grep -c 'id="cs300-completion-indicator-data"' dist/client/lectures/ch_4/index.html` = 1. Single instance per route. Resolution stands. |

(T7-ISS-04 + T7-ISS-05 are technically not on T8's carry-over but the Builder addressed them inline in this cycle. They map to "Additions beyond spec" — see that section below.)

---

## 🔴 HIGH

None.

---

## 🟡 MEDIUM — top-level milestone index drift (status-surface)

**M-UX-T8-ISS-01 / MEDIUM.** [`design_docs/milestones/README.md:26`](../../README.md) still reads:

```
| M-UX  | [UX polish — chrome + chapter pane](m_ux_polish/README.md)          | active (kicked off 2026-04-24) | — |
```

The M-UX milestone-level Status flipped from `active (kicked off 2026-04-24)` to `✅ done 2026-04-25` in `m_ux_polish/README.md:4` (the milestone README) — but the **top-level milestone index** at `design_docs/milestones/README.md` still shows M-UX as `active`. Per CLAUDE.md "Status-surface discipline" (non-negotiable), the index must reflect the milestone close: M1 = `✅ closed 2026-04-23`, M2 = `✅ closed 2026-04-23`, M3 = `✅ closed 2026-04-24` — M-UX should now read `✅ closed 2026-04-25` (the same convention).

This is a five-surface drift, not the four-surface one CLAUDE.md names: (a) per-task spec ✅, (b) tasks/README.md row ✅, (c) milestone README task table row ✅, (d) milestone README Done-when checkboxes ✅, **but (e) top-level milestone index still drifted ⚠️.** M2 + M3 deep-analyses both caught this exact pattern. The Builder's status-surface flip checklist in the CHANGELOG entry at line 22 enumerates (a)/(b)/(c)/(d)/(e) where (e) is the milestone-level Status flip in `m_ux_polish/README.md:4` — but doesn't include the top-level index propagation step.

**Action / Recommendation:** Edit [`design_docs/milestones/README.md:26`](../../README.md) line 26 — change M-UX `Status` cell from `active (kicked off 2026-04-24)` to `✅ closed 2026-04-25`. One-line edit, no propagation impact, status-surface discipline restored. Cheaper to fix this one line than to leave it as a precedent for the next milestone close. Recommend the user (or Builder if cycle 2 is invoked) flip this surface in a small follow-up edit before the M-UX close commit lands.

---

## 🟢 LOW — verification report CSS-bundle subtotal drift

**M-UX-T8-ISS-02 / LOW.** [`design_docs/m_ux_deploy_verification.md`](../../../m_ux_deploy_verification.md) §1 build-size table reports:

```
| `dist/client/_astro/*.css` sum            | 0 B   | 19,805 B (3 files)  | +19,805 B |
```

I re-ran `du -cb dist/client/_astro/*.css` and got **19,775 bytes** (10,100 + 5,403 + 4,272). The report's 19,805 figure is 30 bytes higher than the actual sum. Most likely the Builder rounded the per-file kilobyte values (10.1 + 5.4 + 4.3 = 19.8 KB) and back-converted to a literal byte count, which produces a 30-byte over-count vs the actual sum.

**Impact:** none on the +817 KB headline figure (the `dist/client/` total `5,257,646` bytes is independently re-measured and exact). The CSS subtotal is internal accounting that doesn't change the budget verdict. LOW because the conclusion is unchanged; flag only.

**Action / Recommendation:** If the Builder runs another cycle, update `design_docs/m_ux_deploy_verification.md` §1 row "dist/client/_astro/*.css sum" to read `19,775 B (3 files)` and `+19,775 B` (literal sum). If no cycle 2 runs, this is acceptable to ship as-is — the overall delta is correct.

---

## 🟢 LOW — DEFERRED to nice_to_have.md (interactive-mode harness extension)

**M-UX-T8-ISS-03 / LOW.** Per the M-UX-T7-ISS-01 carry-over disposition above: the residual interactive-mode browser smokes (annotations create → reload → persist; Tab focus-trap inside the open drawer; mark-read button click; drawer-link-click closes drawer; backdrop click closes drawer) were deferred from T6 cycle 1 → T7 cycle 1 → T7 cycle 2 → T8 → user-side runtime push. The harness `scripts/smoke-screenshots.py` is static-mode-only because `/api/health` isn't reachable behind `npm run preview`. Closing M-UX without a destination for the residual surface means the gap evaporates.

**Action / Recommendation:** I'm logging this in [`design_docs/nice_to_have.md`](../../../nice_to_have.md) as a deferred item (the harness extension is real-but-not-urgent — interactive-mode coverage is a quality improvement, not a milestone blocker). Promotion trigger: user reports interactive-mode regression on push verification, OR M5 (review queue) needs end-to-end interactive coverage as part of its DoD. Cost: extend `scripts/smoke-screenshots.py` to drive Selenium `ActionChains` against `npm run dev` (with a separate `--mode=interactive` flag); add interaction smokes for hamburger click + drawer slide + Tab focus-trap + mark-read click + annotation round-trip. Probably 1 focused session of work.

(Note: the actual append to `nice_to_have.md` is **not** done by this audit — the Auditor doesn't modify code or design records during an audit per CLAUDE.md. The user should append the entry via a separate follow-up edit, OR a future Builder addresses it as part of the trigger event.)

---

## Additions beyond spec — audited and justified

The Builder addressed two MEDIUM findings from T7 cycle 2 (ISS-04 + ISS-05) that were NOT on T8's *Carry-over from prior audits* list, by editing four file headers. T7-ISS-04 + ISS-05 are docstring drifts in `RightRailTOC.astro` + `AnnotationsPane.astro` (both flagged by T7 cycle 2 audit as MEDIUM, OPEN — non-blocking). The fixes are **incidental, in-cycle, and accurate**:

- `RightRailTOC.astro:45–80` — docstring updated to (1) clarify that the `<details>` element has no `open` attribute on the parsed DOM (correct: line 122 source confirms `<details class="toc-mobile-collapse">` with no `open`); (2) clarify that the boot script flips `open=true` only at desktop via `matchMedia('(min-width: 1024px)')`; (3) clarify the single-tree rationale (twice-rendering this component would NOT collide with the sibling `RightRailReadStatus`'s `#cs300-toc-read-status` ID directly, but WOULD fragment the `[data-anchor]` + `[data-read-indicator]` selectors — the original docstring conflated these). Verified accuracy by reading source lines 122–334.
- `AnnotationsPane.astro:33–53` — same desktop-open boot-script docstring update (no `open` attribute on parsed DOM; boot script gates on `matchMedia`). Plus the sibling-pane note that AnnotationsPane has its own single-tree requirement for `#annotations-pane` + `#annotations-list` ids. Verified accurate vs source lines 89–93.
- `Breadcrumb.astro:21–35 + 186–200` — docstring rewritten to point at the relocated sticky rule (now in Base.astro). The internal `.breadcrumb` rule no longer carries `position: sticky`; the docstring explains the move, the root cause (containing-block at zero-stick-range), the Selenium evidence, and the option-(a) recommendation reference. Verified accurate by reading the modified `<style>` block (lines 195–204): no `position: sticky` rule on `.breadcrumb` anymore; just flex layout + `padding` + `font-size`.
- `Base.astro:171–192` — new docstring on the relocated sticky rule explains why the outer slot wrapper is the correct host (direct grid child of `.chrome` with `min-height: 100vh` + tall content). Verified at source line 186–192.

These edits are **comment-only changes** (no behavioural drift) and faithfully document the cycle-1 sticky-fix + correct the T7 cycle 2 docstring drifts. **Justification:** T7-ISS-04 + ISS-05 were OPEN (non-blocking) at M-UX close — leaving them unfixed would have meant M-UX shipped with known-stale source documentation, which is a poor close-out posture. Fixing them inline at T8 is the cleanest single-cycle close. NOT a scope creep; the edits align with the spec's "no source code changes — T8 is pure verification + documentation" lean (the edits ARE documentation).

The Builder also created `design_docs/m_ux_deploy_verification.md` — but T8 spec line 13 explicitly mandates this file, so it's spec-compliant, NOT a drive-by addition.

---

## Verification summary

Independent re-run by the auditor (clean shell, identical Node v22.22.2 / npm 10.9.7 / pandoc 3.1.3 environment per `pre_m_ux_baseline.md`):

```text
$ PATH="/tmp/pandoc-wrapper:$PATH" npm run build
... [build] Server built in 8.64s
... [build] Complete!

$ du -sb dist/client/
5257646    dist/client/

$ find dist/client -name '*.html' | wc -l
37

$ du -cb dist/client/_astro/*.js | tail -1
396    total

$ du -cb dist/client/_astro/*.css | tail -1
19775    total

$ grep -rln 'better-sqlite3' dist/client/   # 0 hits
$ grep -rln 'drizzle' dist/client/          # 0 hits
$ grep -rln 'gray-matter' dist/client/      # 0 hits
$ grep -rln 'src/lib/seed' dist/client/     # 0 hits
$ grep -rln 'src/db' dist/client/           # 0 hits

$ grep -c 'id="cs300-completion-indicator"' dist/client/lectures/ch_4/index.html
1

$ grep -c 'id="cs300-completion-indicator-data"' dist/client/lectures/ch_4/index.html
1

$ grep -o 'data-interactive-only' dist/client/lectures/ch_4/index.html | wc -l
87
$ grep -o 'data-interactive-only' dist/client/notes/ch_4/index.html | wc -l
14
$ grep -o 'data-interactive-only' dist/client/practice/ch_4/index.html | wc -l
14
$ grep -o 'data-interactive-only' dist/client/index.html | wc -l
15

$ grep -n 'path:' .github/workflows/deploy.yml
76:          path: ./dist/client
```

PNGs opened by the auditor:

- `.smoke/screenshots/lectures-ch4-1280x800.png` — three-column desktop, breadcrumb at top with REQUIRED + OPTIONAL chapter list left, prose center, ON THIS PAGE TOC right. ✅
- `.smoke/screenshots/lectures-ch4-1280x800-top-T3.png` — pre-scroll, breadcrumb at top. ✅
- `.smoke/screenshots/lectures-ch4-1280x800-midscroll-T3.png` — content scrolled to section 4.9; breadcrumb (path `cs-300 / Lectures / ch_4 — Lists, stacks, queues, deques`, tab pills with Lectures highlighted, prev/next `< ch_3` / `ch_5 >`) pinned at viewport top throughout. ✅ Sticky fix verified.
- `.smoke/screenshots/lectures-ch4-1280x800-bottom-T3.png` — content scrolled to bottom (Forward links to later chapters); breadcrumb still pinned at viewport top. ✅
- `.smoke/screenshots/lectures-ch4-375x812.png` — single-column mobile, hamburger top-left, breadcrumb wrapped two lines, tab pills row, `▶ ON THIS PAGE` collapsed strip, no horizontal scroll. ✅

| Gate                      | Command                                          | Result | Pre-Auditor claim | Post-Auditor verify |
| ------------------------- | ------------------------------------------------ | :----: | ----------------- | ------------------- |
| `npm run build`           | (see above)                                      | ✅ exit 0, 37 pages | matches | matches |
| `dist/client/` byte size  | `du -sb dist/client/`                            | ✅ 5,257,646 B | matches | matches |
| Page count                | `find dist/client -name '*.html' \| wc -l`        | ✅ 37 | matches | matches |
| `_astro/*.js` sum         | `du -cb dist/client/_astro/*.js`                 | ✅ 396 B | matches (84 + 84 + 228) | matches |
| `_astro/*.css` sum        | `du -cb dist/client/_astro/*.css`                | ⚠️ 19,775 B | report says 19,805 B (30 B over) | LOW finding ISS-02 |
| Server-only path leaks    | `grep -rln '<term>' dist/client/`                | ✅ 0 hits × 5 terms | matches | matches |
| Workflow path             | `grep 'path:' .github/workflows/deploy.yml`      | ✅ `./dist/client` | matches | matches |
| Status surface (a)        | T8 spec `**Status:** ✅ done 2026-04-25`         | ✅ flipped | matches | matches |
| Status surface (b)        | tasks/README.md T8 row `✅ done 2026-04-25`      | ✅ flipped | matches | matches |
| Status surface (c)        | milestone README task table T8 row              | ✅ flipped | matches | matches |
| Status surface (d)        | milestone README Done-when bullet 10 `[x]`      | ✅ flipped + reworded | matches | matches; bullet 10 reworded text accurate vs measurement |
| Milestone-level Status    | milestone README line 4 `✅ done 2026-04-25`     | ✅ flipped | matches | matches |
| **Top-level milestone index** | `design_docs/milestones/README.md:26` M-UX row | ⚠️ STILL `active (kicked off 2026-04-24)` | not claimed flipped | **MEDIUM finding ISS-01** |
| Carry-over checkboxes (5)  | T8 spec `## Carry-over from prior audits`       | ✅ all `[x]` | matches | matches |
| Dep-manifest churn        | `git diff HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` | ✅ empty | matches | matches |

---

## Issue log — cross-task follow-up

| ID                  | Severity | Description                                                                        | Status / Owner                                                                                                                          |
| ------------------- | -------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| M-UX-T8-ISS-01      | MEDIUM   | Top-level milestone index still reads M-UX as `active`                              | ✅ RESOLVED 2026-04-25 (orchestrator surgical fix post-audit) — `design_docs/milestones/README.md:26` flipped to `✅ closed 2026-04-25`. |
| M-UX-T8-ISS-02      | LOW      | Verification report CSS-bundle subtotal off by 30 B (19,805 reported vs 19,775 measured) | ⚠️ OPEN — owner: cycle 2 builder if invoked, OR ship as-is (no impact on +817 KB headline). Action: edit `m_ux_deploy_verification.md` §1 row. |
| M-UX-T8-ISS-03      | LOW      | Interactive-mode harness extension (residual interactive smokes from T7-ISS-01)    | ⚠️ DEFERRED to `nice_to_have.md` — see Deferred section below.                                                                             |
| M-UX-T7-ISS-01      | HIGH (closed at structural + layout level) | Layout-at-viewport browser smokes for T6-CO1 + T7 responsive sweep | ✅ RESOLVED at layout level (T7 cycle 2 PNGs); residual interactive-mode surface deferred to nice_to_have via M-UX-T8-ISS-03.            |
| M-UX-T7-ISS-02      | HIGH      | `dist/client/` size budget breach (cycle 1 +1.42 MB)                              | ✅ RESOLVED — 618 KB recovered in T7 cycle 2; option A picked at T8 (accept +817 KB; rewrite bullet 10).                                  |
| M-UX-T7-ISS-03      | MEDIUM   | Duplicate `id="cs300-completion-indicator"` + `-data` per chapter route          | ✅ RESOLVED — T7 cycle 2 single-tree refactor; auditor verified 1× each per route in cycle 1 of T8.                                       |
| M-UX-T7-ISS-04      | MEDIUM   | RightRailTOC + AnnotationsPane docstring claims `<details ... open>`              | ✅ RESOLVED in this cycle (T8 cycle 1) — Builder updated both file header docstrings to reflect actual source-of-truth.                  |
| M-UX-T7-ISS-05      | MEDIUM   | RightRailTOC docstring conflates `#cs300-toc-read-status` with the embedded-vs-sibling distinction | ✅ RESOLVED in this cycle — Builder rewrote the rationale to clarify the actual selector-fragmentation concern + AnnotationsPane parallel.        |
| M-UX-T3-ISS-01      | MEDIUM   | Sticky breadcrumb runtime regression                                              | ✅ RESOLVED in this cycle — option (a) fix landed (sticky rule moved from inner nav to outer slot wrapper); PNG-verified at top + mid + bottom scroll positions. |
| M-UX-T2-ISS-02      | MEDIUM   | SSR-embed CompletionIndicator JSON ~432 KB residual                              | ⚠️ DEFERRED — no destination task (M-UX is closing). Future trigger: pressure on the `dist/client/` budget OR M5 dashboard population requires an API endpoint anyway. Owner: future T2 re-open OR a small follow-up task scoped against the `GET /api/sections` endpoint. |

---

## Deferred to nice_to_have

**M-UX-T8-ISS-03 / LOW (DEFERRED).** Interactive-mode browser-driven smoke harness extension. Concretely:

- Extend `scripts/smoke-screenshots.py` to support an `--mode=interactive` flag that boots the harness against `npm run dev` (where `/api/health` IS reachable so the body `data-mode` flips to `interactive`).
- Add interaction smokes via Selenium `ActionChains`: hamburger click → drawer slide-in observed; drawer-link-click → drawer closes + navigation; Tab focus-trap inside open drawer (cycles to first focusable, wraps); Esc closes drawer with focus restored to hamburger; backdrop-click closes drawer.
- Add round-trip smoke: select text → click annotate → annotation appears in right-rail pane → reload → annotation persists.

**Trigger to promote:** user reports an interactive-mode regression on the live deploy after the M-UX runtime push verification, OR M5 (review queue) lands an interactive surface that needs end-to-end coverage as part of its Definition of Done.

**Cost of promotion:** ~1 focused session — extend the harness, add the interaction matrix, add a `--mode=interactive` switch and a `chromedriver` ActionChains import. No architecture change required (the harness is already permanent infrastructure per T7 cycle 2's `scripts/smoke-screenshots.{py,md}` + `scripts/smoke-routes.json` + `requirements-dev.txt` set).

**Why nice_to_have, not a follow-up task:** the M3 component scripts are byte-identical at the source level (verified by T7 cycle 2's `git diff HEAD` zero-diff against MarkReadButton / AnnotateButton / AnnotationsPane scripts), so the static-mode-only harness output is structurally sufficient to grade M-UX's deploy contract preserved. The interactive surface IS smaller than the layout surface that the static-mode harness covers, AND it's quality-of-life rather than blocking. Promotion bar: a real signal (user-observed regression OR M5 needs it).

(Note: this entry is logged here in the audit issue file. Per Auditor convention, the actual append to `nice_to_have.md` is left to a follow-up edit by the user or a future Builder; the Auditor doesn't modify design records mid-audit. The carry-over disposition table above flags the residual; this section names the home where the deferral belongs.)

---

## Propagation status

- **No forward-deferral to a future task.** No M5/M6/M7 task has yet been created with a `## Carry-over from prior audits` section that this audit could append to. The interactive-harness extension goes to `nice_to_have.md` per the deferral above.
- **M-UX-T8-ISS-01 (MEDIUM)** — propagation impact: NONE (status-surface drift is corrected by editing the top-level milestone index file directly; no carry-over to a downstream task).
- **M-UX-T8-ISS-02 (LOW)** — propagation impact: NONE (numeric drift; no downstream impact on deploy contract or budget verdict).
- **M-UX-T8-ISS-03 (LOW)** — DEFERRED to `nice_to_have.md`. If the user wants to log the entry inline, the trigger + cost language above is ready to copy. Otherwise the entry surfaces if/when the M5 review queue needs interactive harness coverage as part of its DoD.
- **M-UX-T2-ISS-02 (MEDIUM, RE-DEFERRED at milestone close)** — no destination task. Future trigger: budget pressure OR M5 needs the API. If the user wants to log this in `nice_to_have.md` too, that would be a clean home; alternatively, it stays as a residual MEDIUM in T2's issue file (which is currently ✅ PASS) and re-opens if friction emerges. Not blocking M-UX close.

---

**Audit verdict:** ✅ PASS. M-UX milestone closes cleanly. The Builder caught and fixed a real T3-deferred sticky regression in this cycle (high-quality milestone-close behaviour — exactly what T8's deploy gate is designed to surface). MEDIUM M-UX-T8-ISS-01 (top-level milestone index drift) RESOLVED orchestrator-side post-audit; one LOW numeric drift in the verification report; one LOW DEFERRED to `nice_to_have.md` for a Selenium harness extension. Status surfaces (a)/(b)/(c)/(d) + milestone-level + (e) top-level index all flipped. All carry-over dispositions reasonable. Architecture grounding clean. No dependency churn. No scope creep. M-UX milestone DONE.

## Security review

**Reviewed on:** 2026-04-25
**Reviewer:** security-reviewer subagent (post Functional Auditor cycle 1 PASS)
**Verdict:** SHIP — zero Critical, zero High, zero Advisory.

### Critical findings

None.

### High findings

None.

### Item-by-item verification

| # | Check | Result |
|---|-------|--------|
| 1 | Sticky CSS selector — closed selector, no `data-mode` exemption, not in `is:global` | CLEAN — `Base.astro:186–192` rule uses hardcoded `.chrome > [data-slot="breadcrumb"]`; lives in component-scoped `<style>` block (lines 93–319), NOT the `is:global` block at lines 86–92 (which contains only the unchanged `data-interactive-only` hide rule). `z-index: 50` < drawer's `z-index: 9999`, no stacking trap. No exemption needed (breadcrumb is sticky in both modes by design). |
| 2 | Docstring-only edits — no `<script>` or behavioural changes leaked | CLEAN — `Base.astro` (CSS rule + docstring), `Breadcrumb.astro` (sticky removed from inner nav, docstring), `RightRailTOC.astro` + `AnnotationsPane.astro` (frontmatter docstring only). No new templates, no new `<script>`, no new `fetch()`, no new `import.meta.env`. |
| 3 | Verification report not bundled into `dist/client/` | CLEAN — `design_docs/m_ux_deploy_verification.md` lives outside `src/`/`public/`; Astro pipeline ignores `design_docs/`; functional audit's AC6 grep confirms zero leakage. |
| 4 | `data-interactive-only` count unchanged | CLEAN — 87 on lectures/ch_4 (T7 cycle 2 baseline). Sticky CSS adds no attributes; docstring edits add no template changes. |
| 5 | M3 surfaces unchanged | CLEAN — `is:global` rule `body[data-mode="static"] [data-interactive-only] { display: none !important; }` at Base.astro:86–92 unchanged. AnnotationsPane template unchanged. |
| 6 | No new fetch URLs / env vars / external resources | CLEAN — Base.astro `<script>` block (lines 351–356) imports only `detectMode` from `../lib/mode` (unchanged). No new `fetch`, no `<link rel="preconnect">`, no CDN, no new `import.meta.env.*`. |
| 7 | No dep manifest churn | CLEAN — `git diff HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` empty. |
| 8 | GH Pages artifact integrity | CLEAN — `astro.config.mjs:30` `output: 'static'`; `deploy.yml:76` uploads only `./dist/client`. No server entrypoint, no `design_docs/`, no API routes reach the deploy. |
| 9 | Top-level milestone index line content | CLEAN — `design_docs/milestones/README.md:26` reads `M-UX | … | ✅ closed 2026-04-25 | —`. Other rows (M1–M7) unchanged. |
| 10 | All M-UX status surfaces consistent | CLEAN — (a)/(b)/(c)/(d) + milestone-level + top-level index all `✅ done 2026-04-25`. No stale state. |

### Threat-model items not applicable to T8 delta

- Reference-solution leakage — N/A (no API handler change).
- Code-execution subprocess integrity — N/A (no subprocess).
- MDX/pandoc injection — N/A (no LaTeX, pandoc, or Lua filter change).
- Question-content injection — N/A (no Ollama or question path change).
- Annotation rendering — N/A (template unchanged; docstring-only edit).
- Path handling in content pipeline — N/A.
- Secrets in `dist/` — functional AC6 grep confirms 0 hits.

### Advisory

None.

### Verdict

**SHIP.** Ten checks PASS, zero advisories. T8's code surface (CSS rule relocation + docstring edits) introduces no security-relevant attack surface under the cs-300 threat model.

## Dependency audit

Dependency audit: skipped — no manifest changes (`git diff --stat HEAD -- package.json package-lock.json .nvmrc .pandoc-version pyproject.toml requirements*.txt` empty).
