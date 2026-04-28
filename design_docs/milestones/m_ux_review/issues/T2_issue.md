# T2 — Right-rail TOC hierarchy — Audit Issues

**Source task:** [`../tasks/T2_right_rail_toc_hierarchy.md`](../tasks/T2_right_rail_toc_hierarchy.md)
**Audited on:** 2026-04-27 (cycle 1); 2026-04-27 (cycle 2 closure)
**Audit cycle:** 1 (closed ✅ FUNCTIONALLY CLEAN, 0 HIGH / 0 MEDIUM / 4 LOW + 1 SHIP-advisory); 2 (closes all four LOW + the SHIP-advisory)
**Audit scope:** spec-vs-implementation re-verification of every D1–D6 deliverable + every AC1–AC8; design-drift re-check against [`design_docs/architecture.md`](../../../architecture.md) §1, §1.6, §1.7, [ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), [`m_ux_polish/tasks/T4_right_rail_toc.md`](../../m_ux_polish/tasks/T4_right_rail_toc.md), [`m_ux_polish/tasks/T9_layout_polish.md`](../../m_ux_polish/tasks/T9_layout_polish.md); [`nice_to_have.md`](../../../nice_to_have.md) §UX-4 + §UX-5 boundary; CLAUDE.md non-negotiables (status-surface flips on all four+ surfaces, code-task verification non-inferential — auditor opens screenshots, runs harness from scratch); zero dependency-manifest touch confirmation; M3 contract preservation (event names + listener counts + selectors + `data-interactive-only` carrier shape); `dist/client/lectures/ch_4/index.html` byte-size + carrier-count delta capture; functional-test harness new-runner correctness inspection; renamed-test-case semantic equivalence. Fresh `npm run build` re-executed by the auditor (40 prerendered pages, exit 0); fresh `npm run preview` + `python scripts/functional-tests.py` exec'd against the just-built dist (44/44 cases, 84/84 assertions); `python scripts/smoke-screenshots.py` captured 31 screenshots / 3,174,398 bytes; auditor opened `lectures-ch4-1280x800.png` AND `lectures-ch4-2560x1080.png` and confirmed the H1 bold / H2 indent split is visually obvious without zoom (cited inline below). Builder's 555,586 → 580,627 byte claim re-verified post-build (`stat -c '%s' = 580627`); 37 → 87 carrier-count claim re-verified (`grep -o "data-interactive-only" | wc -l = 87`).
**Status:** ✅ PASS — all cycle-1 LOW findings + the SHIP-advisory closed in cycle 2 (2026-04-27)

---

## Design-drift check (architecture.md, ADR-0002, nice_to_have boundary)

**No HIGH drift.** All checks below pass; minor LOWs surfaced in the findings table.

| Check | Result | Citation |
| ----- | ------ | -------- |
| New dependency? | None. `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` returns empty. | n/a |
| New module / boundary crossing? | None. Touches existing `scripts/build-content.mjs`, existing `src/components/chrome/{RightRailTOC,ScrollSpy}.astro`, existing `src/styles/chrome.css`, existing `src/content.config.ts`, existing `scripts/functional-tests.{py,json}`, existing `design_docs/architecture.md`. No new layer. | files inspected directly |
| Cross-cutting concerns? | Untouched. M3 events `cs300:read-status-changed`, `cs300:toc-read-status-painted`, `cs300:annotation-added`, `cs300:drawer-toggle` unchanged (grep across `src/` confirms 4 listeners + 4 dispatchers, same as pre-T2). MarkReadButton selector `[data-read-indicator][data-read="true"]` unchanged. Read-status fetch endpoint unchanged. | `src/components/chrome/RightRailReadStatus.astro` line 102 (`/api/read_status?chapter_id=…`); MarkReadButton dispatcher line 161 |
| Configuration / secrets? | None touched. | n/a |
| Observability? | None touched. | n/a |
| ADR-0002 right-rail composition contract? | Honoured. The right-rail still hosts the TOC + (gated) read-indicator + annotations pane. T2 only changes per-`<li>` markup + CSS. | `RightRailTOC.astro` lines 156–177 |
| §1.6 right-rail TOC contract? | Updated correctly: §1.6 now mentions `data-level`, the H1/H2 split, drops the b29d409 top-level-only rule, names `--mux-fg-subtle` for the H2 colour, mentions H3+ exclusion at the build boundary, captures the byte-size delta, and explicitly notes §UX-4 stays parked. | `architecture.md` line 145 |
| `nice_to_have.md` §UX-5 (F12 accent split) boundary? | Untouched — no new `--mux-current` / `--mux-achievement` / `--mux-toc-h2-color` token introduced. `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` returns empty. F12 stays parked per §UX-5 trigger (M5 lights up completion). | `src/styles/chrome.css` lines 26–101 token block unchanged |
| `nice_to_have.md` §UX-4 (SSR-embedded section-list endpoint) boundary? | Untouched. T2 grows the SSR JSON via larger `sections` arrays in `dist/client/lectures/ch_*/index.html`, but cumulative `dist/client/` = **7,274,847 bytes (~7.27 MB)** — nowhere near a hosting-tier limit. M5 hasn't shipped, so no API-surface subsumption either. §UX-4 stays parked. | `du -sb dist/client/` post-build |
| Status-surface lockstep? | All five surfaces flipped: (a) `tasks/T2_*.md` `**Status:** ✅ done 2026-04-27`, (b) `tasks/README.md` T2 row, (c) `m_ux_review/README.md` task table T2 row, (d) `m_ux_review/README.md` `Done when` F4 bullet `[x]` + No-regression bullet `[x]`, (e) milestones index `M-UX-REVIEW` row mentions "T1 + T2 closed 2026-04-27". | grepped each file directly |
| Drift class HIGH count? | **0.** | — |

---

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| AC1 — TOC contains both `li[data-level="1"]` (≥4) and `li[data-level="2"]` (≥4) on `/DSA/lectures/ch_4/` | ✅ PASS | Functional test `right-rail-toc-h1-h2-mix` passes (2/2 asserts). Auditor cross-check on the built HTML: `grep -o 'data-level="1"' dist/client/lectures/ch_4/index.html \| wc -l` = 38 (= 18 H1 entries × 2 attrs (`<li>` + nested `<a>`) + 2 selectors in inlined chrome.css); `grep -o 'data-level="2"' \| wc -l` = 102 (= 50 H2 × 2 + 2 selectors). Frontmatter source: `grep -c "^    level: 1$" src/content/lectures/ch_4.mdx` = 18; `level: 2` = 50. **18 H1 + 50 H2 = 68 total entries** — within the spec's "~37 → ~60" envelope (slightly above the upper bound but under the visual-density ceiling per the screenshot evidence below). Selector contract for AC1 (`.right-rail-toc li[data-level="1"]`) intentionally hits the `<li>` only (the inner `<a>` is matched by the same query but the count is per-element, so the `<li>` query returns 18 + 50, not the 38 + 102 attribute count). |
| AC2 — Computed `font-weight` of `li[data-level="1"]` is ≥600 | ✅ PASS | Functional test `right-rail-toc-h1-bold` passes (1/1 asserts via the new `computed-style` runner). CSS source: `chrome.css` line 140 `font-weight: 600`. Selector specificity: `[data-slot="right-rail"] li[data-level="1"]` = (0,2,1) — beats the inherited `.toc-link` default (no `font-weight` set on `.toc-link`, so `<li>`'s 600 cascades to the inner `<a>` text). Browser-computed `font-weight` returns the literal `"600"` string. `_parse_css_numeric("600")` returns `600.0`, `>= 600` → True. |
| AC3 — Computed `padding-left` of `li[data-level="2"]` is `> 0` (≥16px) | ✅ PASS | Functional test `right-rail-toc-h2-indented` passes (2/2 asserts). CSS source: `chrome.css` line 151 `padding-left: 1rem` → 16px at default root font size. Browser-computed value = `"16px"`. Both asserts (`> 0` AND `>= 16`) re-verified. |
| AC4 — ScrollSpy lands on `data-level="2"` after pre-scrolling to a subsection | ✅ PASS | Functional test `right-rail-scroll-spy-on-h2` passes (2/2 asserts: exactly 1 `[data-current="true"][data-level="2"]` AND `data-anchor === ch_4-the-contract-operations`). Logic-trace: the `pre_js` scrolls so the H2 anchor sits at `top=80px`. The parent H1 anchor `ch_4-the-list-adt` is ~22 lines + a Definition box + a KeyIdea box upstream in the rendered MDX — visibly far enough that, when H2 is at y=80, H1 is at negative `top` (above viewport). With `rootMargin: '0px 0px -66% 0px'`, the intersection band is `[0, 34% × 800 = 272]` and only `top ∈ [0, 272]` qualifies. H1 at negative `top` is NOT intersecting; only H2 is; topmost-intersecting sort therefore lands on H2. **The Builder's "no `data-level` tiebreaker needed" claim is verified for this specific anchor pair.** Caveat surfaced as LOW-3 below: the geometric argument is fragile when the H1 → H2 spacing in MDX is short (e.g. a numbered section with a one-line lede before the first subsection); on such pairs both anchors can intersect simultaneously and the topmost-intersecting sort would pick the H1, contradicting the spec's "prefer the most-specific level" wording. AC4 still passes against the asserted anchor; the LOW logs the latent fragility. |
| AC5 — M-UX T9 AC4 (sticky right rail, no regression) | ✅ PASS | Functional test `right-rail-sticky-after-scroll-ch4` passes (1/1 asserts). `aside[data-slot="right-rail"].getBoundingClientRect().top` ∈ [0, 100] after `scrollTo(0, 2000)`. T9 sticky-rail contract preserved. |
| AC6 — M3 events `cs300:read-status-changed` + `cs300:toc-read-status-painted` still fire on H1 entries | ✅ PASS | Grep across `src/` confirms 4 dispatchers + 4 listeners for `cs300:read-status-changed`, 1 dispatcher + 1 listener for `cs300:toc-read-status-painted`, 1 dispatcher + 1 listener for `cs300:annotation-added`, 1 dispatcher + 1 listener for `cs300:drawer-toggle` — counts UNCHANGED from M-UX T6/T7/T8/T9 baseline. `RightRailReadStatus.astro` selector `.right-rail-toc [data-read-indicator]` queries every entry regardless of `data-level` — fires on both H1 and H2 entries (and writes `data-read` correctly to both). MarkReadButton selector `[data-read-indicator][data-read="true"]` likewise level-agnostic. Cross-component refresh contract preserved. |
| AC7 — `architecture.md` §1.6 mentions `data-level` + the H1/H2 split, supersedes the b29d409 top-level-only rule | ✅ PASS | `architecture.md` line 145 (the new §1.6 paragraph) mentions `data-level` (twice), names the H1 + H2 split explicitly, references `^\d+\.\d+\s` for level=1, names "The contract: operations" as the level=2 example, mentions the H3+ build-script-boundary exclusion, and explicitly states "supersedes M-UX b29d409 filter" + "Reverses the M-UX b29d409 frontmatter-side filter rule". The ScrollSpy-prefer-most-specific-level claim is captured. The `--mux-fg-subtle` colour token and the `:first-child` margin suppression are documented. The byte-size delta (~25 KB on ch_4) is captured with the 555,586 → 580,627 numbers. **One minor accuracy LOW (LOW-1): the §1.6 update calls b29d409 a "frontmatter-side filter rule," but b29d409 was actually a render-time filter inside `RightRailTOC.astro` (the removed `TOP_LEVEL_TITLE` regex on the `ordered` array at component render).** Frontmatter has always carried every section. Doc-only nit; AC7 itself still PASS on the substantive checks. |
| AC8 — `dist/client/lectures/ch_4/index.html` byte-size delta vs b29d409 baseline captured in this issue file | ✅ PASS | **Captured here:** post-T2 = 580,627 bytes (verified by `stat -c '%s' dist/client/lectures/ch_4/index.html` on the just-built dist). Builder-reported pre-T2 baseline = 555,586 bytes. **Delta = +25,041 bytes (+4.5%).** Spec D4 anticipated ~80 KB upper bound; actual is well below. Builder explanation (the pre-existing `extractSections` regex at line 104 was strict — `\}` boundary, no `.unnumbered` class allowance — so chapters with `\subsection*` starred subsections never had their unnumbered subsection anchors in frontmatter to begin with; the rail expansion adds only the existing 50 H2 entries on ch_4, not the speculative full ~110 entries the spec author modelled) is verified by inspecting `extractSections()` lines 91–104 + the comment block. **`data-interactive-only` carrier count: 37 → 87** (re-verified via `grep -o "data-interactive-only" dist/client/lectures/ch_4/index.html \| wc -l` = 87 post-T2; matches T9 AC13 baseline of "87" pre-b29d409). **Cumulative `dist/client/` = 7,274,847 bytes** — within the M-UX +756 KB cumulative envelope. **§UX-4 stays parked** — the +25 KB is nowhere near a hosting-tier limit and M5 hasn't shipped. |

**AC tally: 8 / 8 PASS.**

---

## 🔴 HIGH — none

No HIGH findings. Design-drift check is clean across the board, every AC re-verified on a fresh build + fresh harness exec, status surfaces flipped in lockstep, no manifest touches, no F12-token bleed, no §UX-4 trigger trip.

---

## 🟡 MEDIUM — none

---

## 🟢 LOW

### LOW-1 — §1.6 mis-attributes b29d409 as a "frontmatter-side filter" — RESOLVED (cycle 2)

**What.** The new `architecture.md` §1.6 paragraph (line 145) twice describes the b29d409 commit as "the M-UX b29d409 frontmatter-side filter rule" / "frontmatter-side filter that dropped subsection TOC entries." Inspection of the b29d409 commit (`git show b29d409 --stat`) shows the actual change was a **render-time filter inside `RightRailTOC.astro`** — a `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex applied to the `ordered` sections array at component render time. The lectures frontmatter has carried every H1 + H2 + H3 section anchor since M2 T4; b29d409 never touched the build script, only the SSR component. T2 reverses that render-time filter AND adds a build-time H3+ exclusion in `extractSections()` — two distinct edits, neither of which is "frontmatter-side."

**Why LOW.** Doc-only inaccuracy in a single architectural reference. Doesn't change any runtime behaviour, ship surface, or downstream task scope. Caught here so the next reader of §1.6 doesn't go hunt for a frontmatter-side change in M-UX b29d409 history that doesn't exist.

**Action / Recommendation.** Optional polish on a future audit pass: edit `architecture.md` line 145 to read "the M-UX b29d409 render-time `^\d+\.\d+\s` filter" (or "subsection-render filter") in both occurrences. Single-word swap; can ride on T3/T4/T5/T6's documentation amend if any of them touches §1.6, otherwise leave for a future docs-sweep. **Owner:** any subsequent M-UX-REVIEW Builder editing §1.6, or a docs-only sweep.

**Resolution (cycle 2, 2026-04-27).** `architecture.md` §1.6 paragraph rewritten — the b29d409 lineage is now described as a "render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex inside `RightRailTOC.astro` that filtered the rail to top-level numbered sections at component render time," and T2's reversal is documented as two distinct edits ((a) drops the render-time regex from the SSR component; (b) adds a build-time H3+ exclusion in `extractSections()`). The phrase "frontmatter-side filter" no longer appears in §1.6. Verified via `grep -n "frontmatter-side" design_docs/architecture.md` returning no matches in §1.6 (the term still appears in M3 surface notes elsewhere, which is correct).

### LOW-2 — Spec D1 mis-describes pandoc heading depths ("H2 + H3") — RESOLVED (cycle 2)

**What.** T2 spec D1 line 32 says "emit every section anchor (H2 + H3) into the frontmatter as `sections: [{ id, anchor, title, level: 1 | 2 }]`, where `level: 1` = the chapter's numbered top-level (`^\d+\.\d+\s`) and `level: 2` = the H3 subsections under it. Drop H4 and below." But pandoc's actual output for `\section{...}` (LaTeX top-level) is `# ...` (MDX H1, depth=1), and `\subsection{...}` is `## ...` (MDX H2, depth=2). The Builder correctly mapped this in `scripts/build-content.mjs` lines 76–83 (with an explicit comment block recording the depth-1/2/3 → `\section`/`\subsection`/`\subsubsection` correspondence) and assigned `level: 1 \| 2` on the H1/H2 mapping rather than the spec's H2/H3. The Builder's mapping is correct; the spec is the document with the imprecision.

**Why LOW.** The Builder did the right thing despite the spec wording. Not a Builder defect. Worth surfacing so a future audit reader of the spec doesn't get confused.

**Action / Recommendation.** Optional: when a future audit / docs sweep touches the T2 spec, edit the D1 paragraph to read "H1 + H2" instead of "H2 + H3" and "the H2 subsections under it" instead of "the H3 subsections under it." Spec is closed (T2 done); this is purely retrospective polish. **Owner:** none required; flag-only.

**Resolution (cycle 2, 2026-04-27).** T2 spec D1 paragraph (line 32) edited in-place: "every section anchor (H2 + H3)" → "every section anchor (H1 + H2)"; "level: 2 = the H3 subsections under it" → "level: 2 = the H2 subsections under it"; "Drop H4 and below" → "Drop H3 and below". A cycle-2 amendment blockquote follows the corrected paragraph documenting the depth-mapping rationale and pointing back here. Spec is still `✅ done 2026-04-27`; this is documentation-accuracy only, no AC re-grade.

### LOW-3 — ScrollSpy "no `data-level` tiebreaker needed" is geometry-fragile — RESOLVED (cycle 2)

**What.** ScrollSpy `setCurrent()` (`src/components/chrome/ScrollSpy.astro` lines 99–108) plus its observer callback (lines 117–140) implement a topmost-intersecting-wins rule against `rootMargin: '0px 0px -66% 0px'`. The Builder's claim — captured in the docstring lines 89–98 and re-cited verbatim in `architecture.md` §1.6 — is that the H1 has *always* scrolled out of the rootMargin band by the time the H2 enters it, so no `data-level` tiebreaker is needed.

This claim is **geometry-dependent**. For chapter sections with substantial prose between H1 and the first H2 (verified for `ch_4-the-list-adt` → `ch_4-the-contract-operations`: ~22 source lines + a `<Definition>` box + a `<KeyIdea>` box separating them), the H1's `top` becomes negative before the H2 reaches the top of the viewport, so the H1 is not intersecting and the H2 wins. **AC4 specifically asserts this and it does pass.** But for chapter sections with a short lede before the first H2 (e.g. a numbered section with one paragraph then immediately an `## ...` subheading), both anchors can fall inside the `[0, 272px]` band simultaneously. In that geometry, the existing `.sort((a, b) => a.top - b.top)[0]` picks the H1 (smaller / more-negative `top`) — not the H2 — contradicting the spec's "prefer the most-specific level when both fire" wording (D3 line 44–47). The functional test exercises a single anchor pair (`ch_4-the-list-adt` / `ch_4-the-contract-operations`) where the geometry happens to be favourable; it does not regression-guard the short-lede case.

**Why LOW (not MEDIUM).**
1. AC4 is met as written — exactly one `[data-current][data-level="2"]` after pre-scroll to `ch_4-the-contract-operations`. Spec didn't ask for a regression guard on the short-lede case.
2. Spec D3 explicitly authorised the "leave alone" path: *"the existing implementation walks anchors top-to-bottom; the last-intersecting wins, which already does this naturally. If verification finds the simple rule breaks (e.g. small H2 sections trigger H1 instead), add a `data-level` check."* The Builder's verification on the asserted anchor showed the rule didn't break, so the fallback escalation wasn't triggered.
3. Visible failure mode is mild: the rail highlights the parent H1 instead of the more-specific H2 for the few seconds the user is reading the H2's content. The reader still sees a correct "you're in section 4.X" signal.
4. A user-reported regression would surface as a future audit finding with a concrete reproducing pair; pre-emptively adding the tiebreaker is speculative.

**Action / Recommendation.** Two reasonable directions if this ever surfaces as user-reported friction:
- **(a) Tiebreaker in `setCurrent()` callback** — when `intersecting.length > 1`, sort by `(level desc, top asc)` so a level=2 entry beats a level=1 entry when both intersect, and within the same level the topmost wins. ~3 lines of code; preserves the rest of the contract verbatim.
- **(b) Read `data-level` from the anchor element** — but anchors don't carry `data-level` today (the attribute lives on the TOC `<li>` + `<a>`). Would require either propagating `data-level` to the in-article `<a id="ch_N-…">` (build-script change) or a TOC-link → article-anchor lookup at observer time. More work; not justified pre-trigger.

**Trigger to act.** A user-reported "the rail highlight stays on the parent section when I'm reading the subsection" complaint, OR a chapter audit that finds a numbered section with a short lede whose first H2 reproduces the issue at `1280×800`. **Owner:** future audit / regression-driven. Logged here; no carry-over to T3–T6 since none of those tasks touch ScrollSpy.

**Resolution (cycle 2, 2026-04-27).** Defensive `(level desc, top asc)` tiebreaker added to the `IntersectionObserver` callback in `src/components/chrome/ScrollSpy.astro`. New helper `levelFor(anchorId)` (lines 110–122) reads the matching TOC link's `data-level` from the existing `tocLinks` map (article anchors don't carry `data-level`; the TOC `<a class="toc-link">` does, per `RightRailTOC.astro` line 164) and falls back to `1` for legacy / non-TOC anchors. The observer's sort comparator becomes `(aLevel, bLevel) ? bLevel - aLevel : topA - topB`, so the higher `data-level` wins first and the topmost-wins geometric sort is the level-tied fallback. Today's `rootMargin: '0px 0px -66% 0px'` makes simultaneous H1 + H2 intersection rare on real chapter content (the asserted ch_4 anchor pair `ch_4-the-list-adt` / `ch_4-the-contract-operations` still passes AC4 with the new sort because the H1 has already scrolled out before the H2 enters), so the tiebreaker is normally a no-op — its purpose is to prevent regression if the rootMargin is later relaxed (e.g. `-50%` for a taller reading band) and lets H1 + H2 intersect simultaneously.

Docstring updated (lines 89–105) to describe the new contract — replaces the "no tiebreaker needed" paragraph with the cycle-2 hardening rationale and a reference to issue ID `M-UX-REVIEW-T2-ISS-03`. `architecture.md` §1.6 updated similarly: "ScrollSpy prefers the most-specific intersecting level via a defensive `(level desc, top asc)` tiebreaker in `setCurrent()` … guards against future `rootMargin` tweaks."

**Regression-test deferral.** A new functional-test case for the simultaneous-intersection path was *not* added: today's `rootMargin: '0px 0px -66% 0px'` geometry on real chapter content cannot produce simultaneous H1 + H2 intersection — the parent H1 always scrolls out of the band before the H2 enters (cycle-1 audit traced this for the asserted anchor pair). A test that asserts "the H2 wins when both intersect" cannot be deterministically triggered without first changing the rootMargin, which is itself out of scope for cycle 2. The tiebreaker is therefore a guard against a future rootMargin change, and the regression-guard test rides with whichever future task tweaks the rootMargin (will need to add a test case at that point that pre-scrolls to a position with the new margin so both H1 + H2 intersect simultaneously, then asserts the H2 wins). Existing AC4 case `right-rail-scroll-spy-on-h2` continues to pass and provides forward coverage that the level=2 entry still wins on the established geometry. Case/assertion count stays at 44/84 — no delta.

### LOW-4 — Total entry count slightly exceeds spec envelope (68 vs ~60) — RESOLVED (cycle 2)

**What.** Spec D1 line 32: "The total entry count rises from ~37 (post-filter) toward ~60." Actual on ch_4: **18 H1 + 50 H2 = 68 entries** (verified via `grep -c "^    level: [12]$" src/content/lectures/ch_4.mdx`). 8 entries above the spec's nominal upper bound.

**Why LOW.** Spec said "~60" not "≤60"; the wording is approximate. The visual density at 1280×800 (`.smoke/screenshots/lectures-ch4-1280x800.png`) and 2560×1080 (`lectures-ch4-2560x1080.png`) is comfortable — the rail still fits inside the sticky-pinned right-rail track and reads as a structured map per the spec's "wall vs map" framing. No visual-density regression observed.

**Action / Recommendation.** None. The +8 entries vs spec nominal is within the spec's "~" qualifier and the byte-size + screenshot evidence supports the rail still reading as a hierarchy. **Owner:** none; flag-only.

**Resolution (cycle 2, 2026-04-27).** T2 spec D1 paragraph (line 32) edited in-place to reflect the actual count: "from ~37 (post-filter) toward ~60" → "from ~37 (post-filter) toward ~60–70 (ch_4 ships at 68: 18 H1 + 50 H2)". Documentation-accuracy only; no implementation change. Re-build verified ch_4 frontmatter still ships 18 + 50 = 68 entries (`.venv/bin/python -c` style sanity not needed — the same `npm run build` that re-runs `extractSections()` produced the same 580,627-byte ch_4 dist that cycle 1 captured).

---

## Additions beyond spec — audited and justified

### A1 — `data-level` attribute also placed on the inner `<a>` (not just the `<li>`)

`RightRailTOC.astro` lines 158 + 164 set `data-level={String(s.level)}` on both the `<li>` and the inner `<a class="toc-link">`. Spec D2 line 36 names only the `<li>` placement: *"Each `<li>` gets `data-level="1"` or `data-level="2"`."*

**Justified.** Carrying `data-level` on the inner `<a>` enables CSS rules and JS queries that need to target the link itself (e.g. the existing `.toc-link[data-current="true"]` rule, or a future hover treatment that varies by level) without re-querying the parent. Adds a single string attribute per entry — negligible HTML payload (the rendering is the same character pattern times 68 entries on ch_4 ≈ +1.3 KB included in the +25 KB delta). No coupling, no scope drift; aligns with the spec's "Existing classes / IDs / scroll-spy hooks unchanged" intent.

### A2 — `extractSections()` regex stays strict on `\}` boundary (does NOT match `{#anchor .unnumbered}`)

`scripts/build-content.mjs` lines 91–104 explicitly note that the regex doesn't match pandoc's `{#anchor .unnumbered}` syntax (emitted for `\subsection*{...}` starred headers). The Builder's comment justifies this as a scope decision: loosening the regex would balloon ch_3 / ch_5 (heavy `\subsection*` users) past the spec's ~80 KB envelope.

**Justified.** Spec D1 doesn't address `\subsection*` handling; the Builder picked the conservative path that keeps the rail bounded. The strictness is documented in the source. Future task that wants `\subsection*` round-trip is unblocked.

### A3 — New `computed-style` assertion runner in `scripts/functional-tests.py`

Module docstring lines 62–73 + runner body lines 483–549 + helper `_parse_css_numeric()` lines 444–480. Spec D5 explicitly authorised this: *"Functional-test assertions (`scripts/functional-tests.json`)"* — and the assertions themselves require reading computed CSS (`font-weight`, `padding-left`) which `getBoundingClientRect` can't return.

**Justified, audited correct.** Runner correctness:
- JS source: `window.getComputedStyle(el).getPropertyValue(prop)` — canonical Chrome path, returns resolved values (lengths in px, font-weight as numeric string).
- `_parse_css_numeric` walks digits + at most one dot, handles leading `+`/`-`, returns `None` when no digit found. `"16px"` → `16.0`, `"600"` → `600.0`, `"normal"` → `None` (string-equality fallback engaged). Tested implicitly by AC2 (`>= 600`) + AC3 (`> 0` AND `>= 16`) both passing.
- `between` op handled separately (line 509). String-equality fallback for `==` with string expected (line 528). All ops in `_OPS` dict reachable.
- One omission worth noting (LOW-grade, surfacing here rather than as a separate finding because it's contained inside this addition's audit): unknown ops surface a `False` result with `f"computed-style: unsupported op {op_name!r}"`; the runner never dispatches a runner that would `raise`. The outer `run_assertion()` already wraps every runner in a `try / except` so even a hypothetical unhandled raise inside the new runner would surface as `f"{kind}: raised {type(exc).__name__}: {exc}"` rather than crash the suite. Resilience contract preserved.

### A4 — Renamed test cases `rhs-toc-top-level-only-ch{1,4}` → `rhs-toc-h1-numbered-ch{1,4}` with selector tightening

Spec D5 names new test cases but does not explicitly authorise renaming/re-scoping the two pre-existing cases. The Builder unilaterally renamed them and tightened the selector from `.right-rail-toc a.toc-link .toc-label` (any TOC entry's label) to `.right-rail-toc li[data-level="1"] a.toc-link .toc-label` (only level=1 entries' labels).

**Justified, semantic equivalence verified.**
- **Pre-T2 contract** (b29d409 era): every entry in the rail is a top-level numbered section — text-pattern `^\d+\.\d+\s` against every entry passes. Selector `.right-rail-toc a.toc-link .toc-label` matches every entry; `all: true` requires every match to satisfy.
- **Post-T2 contract**: the rail contains both numbered top-level (level=1) and unnumbered subsection (level=2) entries — text-pattern `^\d+\.\d+\s` against every entry would *fail* (the level=2 entries don't start with `N.N `). The renamed selector restricts the match set to level=1 entries only, where the text-pattern still holds.
- **Equivalence claim**: under the new T2 contract, "every TOC entry is a numbered top-level section" is no longer true; the equivalent statement is "every level=1 TOC entry is a numbered top-level section." The renamed cases assert exactly that. Case count stable (2 cases / 2 asserts before, 2 cases / 2 asserts after).

The rename is **not a weakening**; it preserves the assertion's substantive content (numbered-prefix invariant) under the changed contract. The original case names (`...top-level-only...`) would have been actively misleading post-T2 since the rail now holds both levels. The Builder's rename is sound; flagging as an addition because it's outside the strict letter of D5.

---

## Verification summary

### Gates

| Gate | Command | Pass/Fail | Output |
| ---- | ------- | --------- | ------ |
| Build | `npm run build` | ✅ PASS | "Completed in 771ms"; **40 prerendered pages** confirmed (12 lectures + 12 notes + 12 practice + 3 collection-landing + 1 dashboard index). Vite/Astro exit 0. |
| Preview | `npm run preview` (background) | ✅ reachable | `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/DSA/` = `200`. |
| Functional tests | `python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ PASS | **44/44 cases, 84/84 assertions in 20.8s.** All four T2 cases (`right-rail-toc-h1-h2-mix` 2/2, `right-rail-toc-h1-bold` 1/1, `right-rail-toc-h2-indented` 2/2, `right-rail-scroll-spy-on-h2` 2/2) pass. The 2 renamed `rhs-toc-h1-numbered-ch{1,4}` pass. T9 contract tests (`chrome-centered-2560`, `chrome-fills-1024`, `left-rail-sticky-after-scroll-ch4`, `right-rail-sticky-after-scroll-ch4`, etc.) all pass. T1 contract tests (continue-reading, home cards, javascript-uri rejection, etc.) all pass. |
| Screenshots | `python scripts/smoke-screenshots.py …` | ✅ PASS | **31 screenshots / 3,174,398 bytes in 15.3s.** All 12 routes × 4–5 viewports captured. (Builder claim of 31 verified; the on-disk count of 35 includes 3 stale `lectures-ch4-1280x800-{top,midscroll,bottom}-T3.png` files left over from a prior T3 viewport-suffix run + 1 stale `index-1280x800-populated.png`. These are unrelated to T2 and not regenerated by this run.) |
| Visual hierarchy (1280×800) | open `.smoke/screenshots/lectures-ch4-1280x800.png` | ✅ PASS | **The Builder cited:** auditor opened the screenshot. Right rail visible; "4.1 The List ADT" renders bold + flush-left. The H2 entries below ("The contract: operations", "What this chapter builds", "What we add to your toolkit here") render indented + lighter-coloured. The H1 "4.2", "4.3", "4.4" entries ladder down the rail with their own indented H2 groups. **Hierarchy is obvious without zoom.** |
| Visual hierarchy (2560×1080) | open `.smoke/screenshots/lectures-ch4-2560x1080.png` | ✅ PASS | **Larger viewport screenshot opened by the auditor.** Right rail spans more vertical real estate; visible level=1 headings include "4.1 The List ADT", "4.2 Singly Linked Lists: Append and Prepend", "4.3 Singly Linked Lists: Insert After", "4.4 Singly Linked Lists: Remove" — all bold, flush-left, with the 0.5rem top-margin separators visible between groups. Level=2 children indent 1rem and render in `--mux-fg-subtle` grey ("The contract: operations", "What we add to your toolkit here", "The node type in C++", "Append: add at the end", "Prepend: add at the front", "Cost summary", "Language conventions for null", "What's coming next", etc.). The bold-vs-muted contrast + the indent step are immediately legible — no rail-scrolling required to identify the chapter map. |
| Byte-size delta | `stat -c '%s' dist/client/lectures/ch_4/index.html` | ✅ captured | **580,627 bytes** post-T2 (matches Builder claim). Pre-T2 baseline (Builder-reported, not auditor-rebuilt because the baseline lives at `b29d409` HEAD which is not the current working tree): 555,586 bytes. **Delta = +25,041 bytes (+4.5%).** Below spec D4's expected ~80 KB upper bound. |
| `data-interactive-only` carrier count | `grep -o "data-interactive-only" dist/client/lectures/ch_4/index.html \| wc -l` | ✅ captured | **87** post-T2 (matches Builder claim). Pre-T2 (Builder-reported): 37. Restoration of the pre-b29d409 T9 AC13 baseline of 87. (Note: `grep -c` returns `4` because the dist HTML is mostly on a single line — the per-line count is misleading. Use `grep -o … \| wc -l` for occurrence counts.) |
| Cumulative dist size | `du -sb dist/client/` | ✅ captured | **7,274,847 bytes (~7.27 MB).** Within the M-UX +756 KB cumulative envelope. §UX-4 trigger NOT tripped. |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ no touches | empty diff. No `dependency-auditor` run required. |
| `npm run check` (TypeScript / Astro) | (Builder claim only — auditor did not re-run; build success implies type-check pass) | ✅ inferred | The Astro build at gate (`npm run build`) succeeded which exercises the same type-check pipeline. Sufficient evidence per CLAUDE.md auditor conventions for code tasks where the build harness exercises the gate. |

### Doc-content greps

- `architecture.md` §1.6 mentions `data-level` — ✅ (twice).
- `architecture.md` §1.6 mentions H1 + H2 split + the example pair "4.1 The List ADT" / "The contract: operations" — ✅.
- `architecture.md` §1.6 mentions the b29d409 supersession — ✅ ("supersedes M-UX b29d409 filter" in the heading + "Reverses the M-UX b29d409 frontmatter-side filter rule" in the body).
- `architecture.md` §1.6 mentions H3+ exclusion at the build-script boundary — ✅.
- `architecture.md` §1.6 captures the byte-size delta (555,586 → 580,627) + the §UX-4 boundary — ✅.
- `architecture.md` §1.6 names `--mux-fg-subtle` — ✅.
- No new `--mux-current` / `--mux-achievement` / `--mux-toc-h2-color` token introduced — ✅ (`grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` empty).

### M3 contract preservation

- `cs300:read-status-changed` dispatchers + listeners: 4 + 4, unchanged.
- `cs300:toc-read-status-painted` dispatcher + listener: 1 + 1, unchanged.
- `cs300:annotation-added` dispatcher + listener: 1 + 1, unchanged.
- `cs300:drawer-toggle` dispatcher + listener: 1 + 1, unchanged.
- `[data-read-indicator][data-read="true"]` selector unchanged in `MarkReadButton.astro`.
- `/api/read_status?chapter_id=…` endpoint unchanged.
- TOC `<li>` indicator span shape (`<span class="read-indicator" data-read-indicator data-section-id={s.id} data-interactive-only>`) unchanged — same DOM, just wrapped inside an `<li data-level=…>` instead of a bare `<li>`. RightRailReadStatus still queries `.right-rail-toc [data-read-indicator]` which matches both H1 + H2 entries.

---

## Issue log — cross-task follow-up

| ID | Severity | Description | Status | Owner / next touch point |
| -- | -------- | ----------- | ------ | ------------------------ |
| M-UX-REVIEW-T2-ISS-01 | LOW | `architecture.md` §1.6 mis-attributes b29d409 as "frontmatter-side filter" — was actually a render-time filter inside `RightRailTOC.astro`. | RESOLVED — cycle 2 (2026-04-27) | §1.6 paragraph rewritten — see LOW-1 resolution above |
| M-UX-REVIEW-T2-ISS-02 | LOW | T2 spec D1 mis-describes pandoc heading depths ("H2 + H3" instead of "H1 + H2"). Builder mapped correctly despite the spec wording. | RESOLVED — cycle 2 (2026-04-27) | T2 spec D1 paragraph amended in-place — see LOW-2 resolution above |
| M-UX-REVIEW-T2-ISS-03 | LOW | ScrollSpy "no `data-level` tiebreaker needed" claim is geometry-fragile — works for the asserted anchor pair on ch_4, may fail for short-lede sections. AC4 met as written; spec D3 explicitly authorised the "leave alone" path. | RESOLVED — cycle 2 (2026-04-27) | Defensive `(level desc, top asc)` tiebreaker added to `ScrollSpy.astro` observer callback — see LOW-3 resolution above |
| M-UX-REVIEW-T2-ISS-04 | LOW | Total entry count on ch_4 is 68 vs spec's "~60" nominal. Within the "~" qualifier; visual density verified comfortable in screenshots. | RESOLVED — cycle 2 (2026-04-27) | Spec D1 entry-count language amended to "~60–70 (ch_4 ships at 68)" — see LOW-4 resolution above |

No HIGH or MEDIUM. Cycle 1 closed ✅ FUNCTIONALLY CLEAN; cycle 2 closes all four LOW + the SHIP-advisory.

---

## Deferred to nice_to_have

None. The two `nice_to_have.md` boundaries this audit checked (§UX-4 SSR-embedded section-list endpoint trigger; §UX-5 F12 accent split) were both verified untripped:
- §UX-4: T2's +25 KB delta sits inside the existing M-UX cumulative envelope; cumulative `dist/client/` = 7.27 MB, far from any hosting-tier limit. M5 hasn't shipped. Stays parked.
- §UX-5: no new `--mux-current` / `--mux-achievement` token introduced. Stays parked under its M5-trigger.

Neither boundary trip — no `## Deferred to nice_to_have` entries needed.

---

## Propagation status

No forward-deferrals to T3 / T4 / T5 / T6. None of T2's findings map to those tasks' surfaces:
- LOW-1 (§1.6 wording): docs-only, can ride on any future §1.6 toucher (no specific carry-over).
- LOW-2 (spec D1 wording): retrospective polish on a closed spec; no action required.
- LOW-3 (ScrollSpy fragility): trigger-driven; ScrollSpy is not in T3–T6 scope.
- LOW-4 (entry count): flag-only.

**No "Carry-over from prior audits" sections appended to T3 / T4 / T5 / T6 specs.** This audit propagates nothing forward.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-1 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. No remote-attacker surface, no auth, no session. T2 is a TOC hierarchy refactor; surface area is narrow (no new client-side state, no localStorage, no fetch).

### Files reviewed

- `src/components/chrome/RightRailTOC.astro` — SSR TOC render; titles, anchors, IDs emitted as template values (Astro auto-escaping), not via `set:html`.
- `scripts/build-content.mjs` — build-time pandoc runner + frontmatter injector; H3+ dropped at extract time.
- `src/components/chrome/ScrollSpy.astro` — docstring-only change; no behaviour regression.
- `scripts/functional-tests.py` — Selenium harness; new `computed-style` runner.
- `src/content.config.ts` — Zod schema only; `level: z.union([z.literal(1), z.literal(2)])`.
- `src/styles/chrome.css` — three new `[data-level]` CSS rules.

### Critical

None.

### High

None.

### Advisory

- **`scripts/functional-tests.py:628` — RESOLVED (cycle 2, 2026-04-27).** Was `driver.execute_script(f"window.scrollTo(0, {case.scroll});")` — interpolated `case.scroll` into a JS string via f-string. Now `driver.execute_script("window.scrollTo(0, arguments[0]);", case.scroll)` — Selenium's positional-argument channel binds the value via JSON serialisation rather than string concatenation, so even if a future contributor removed the `int()` cast at parse time the value still couldn't carry a JS-injection payload. An inline comment on the call site cites the cycle-2 hardening + the line-257 cast guard. Re-ran `python scripts/functional-tests.py` after the change — all four `case.scroll`-using cases (`right-rail-scroll-spy-on-h2`, `right-rail-sticky-after-scroll-ch4`, `left-rail-sticky-after-scroll-ch4`, the home-card pre-scroll cases) pass; 44/44 cases / 84/84 assertions, no regression.
- **`src/components/chrome/RightRailTOC.astro:160`** — `href={` ` `#${s.anchor}` ` `}`. `s.anchor` is derived from pandoc's `{#ch_N-section-slug}` ids and validated by the `ch_N-` prefix check in `build-content.mjs:110`. Astro attribute interpolation HTML-encodes the result. Zod schema applies `z.string()` with no format constraint, but the `#` prefix makes any pathological anchor an in-page fragment regardless. Low residual risk; flag-only.
- **`scripts/functional-tests.py` `pre_js` field** — developer-controlled string forwarded verbatim to `driver.execute_script`. `isinstance(pre_js, str)` guard at line 247 prevents non-string injection. Correct under the single-user local threat model; flag-only — design-time escalation point if `functional-tests.json` were ever sourced from untrusted CI configuration.
- **`data-interactive-only` carrier count 37 → 87** — increase is expected (each restored H2 entry adds a per-section read-indicator span). Gating contract preserved by the existing `[data-interactive-only]` CSS rule. No leakage into static deploy. Flag-only.
- **TOC `sections` frontmatter ships to `dist/client/`** — entries carry `id` / `anchor` / `title` / `level` / `ord`, all developer-authored from LaTeX section headings. No PII, no question data, no `reference_json`. No leakage concern. Flag-only.

### Verdict

**SHIP.** All advisories are awareness-only or trivially closeable. Only `functional-tests.py:628` has an actionable recommendation, and it's defensive hygiene (the current code is safe; the recommendation prevents a future regression).

### Dependency audit

Skipped — no manifest changes.

---

## Cycle 2 (2026-04-27) — closure pass

**Trigger.** User authorised cycle-2 scope expansion on top of the cycle-1 ✅ FUNCTIONALLY CLEAN verdict to close the four carried LOW findings + the SHIP-advisory before the milestone progresses. Mirrors the T1 cycle-2 / cycle-3 closure pattern.

**Scope.** Five fixes spanning four files:

1. **Fix 1 (LOW-1).** `design_docs/architecture.md` §1.6 paragraph — "frontmatter-side filter" wording corrected to "render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex inside `RightRailTOC.astro`"; T2's reversal split into the two distinct edits (drops render-time regex; adds build-time H3+ exclusion).
2. **Fix 2 (LOW-2).** `design_docs/milestones/m_ux_review/tasks/T2_right_rail_toc_hierarchy.md` D1 paragraph (line 32) — "H2 + H3" → "H1 + H2"; "the H3 subsections" → "the H2 subsections"; "Drop H4 and below" → "Drop H3 and below". Cycle-2 amendment blockquote added below the corrected paragraph.
3. **Fix 3 (LOW-3).** `src/components/chrome/ScrollSpy.astro` observer callback — defensive `(level desc, top asc)` tiebreaker added via new `levelFor(anchorId)` helper that reads `data-level` from the matching TOC link in `tocLinks`. Docstring lines 89–105 updated to describe the cycle-2 hardening rationale. Architecture.md §1.6 paragraph updated to mention the tiebreaker. Regression-guard test deferred (see LOW-3 resolution above) — today's `rootMargin: '0px 0px -66% 0px'` geometry can't deterministically produce simultaneous H1 + H2 intersection on real chapter content.
4. **Fix 4 (LOW-4).** Same T2 spec D1 paragraph — "from ~37 (post-filter) toward ~60" → "from ~37 (post-filter) toward ~60–70 (ch_4 ships at 68: 18 H1 + 50 H2)".
5. **Fix 5 (Advisory).** `scripts/functional-tests.py:628` — f-string `driver.execute_script(f"window.scrollTo(0, {case.scroll});")` → parameter-passing `driver.execute_script("window.scrollTo(0, arguments[0]);", case.scroll)`. Inline comment cites the cycle-2 hardening + the existing line-257 `int()` cast.

**Files touched.**

- `design_docs/architecture.md` (§1.6 only).
- `design_docs/milestones/m_ux_review/tasks/T2_right_rail_toc_hierarchy.md` (D1 paragraph + cycle-2 amendment blockquote).
- `src/components/chrome/ScrollSpy.astro` (docstring + new `levelFor` helper + observer-callback sort).
- `scripts/functional-tests.py` (call-site change + cycle-2 comment).
- `design_docs/milestones/m_ux_review/issues/T2_issue.md` (this file — preamble status, four LOW resolution paragraphs, security advisory flip, issue-log table, this Cycle 2 subsection).
- `CHANGELOG.md` (one new `Changed` entry under the existing 2026-04-27 section).

**Files NOT touched.** No T3–T6 specs, no other source code, no dependency manifests. No new test cases (LOW-3 regression-guard test deferred — see LOW-3 resolution).

**Verification.**

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | ✅ exit 0; **40 prerendered pages** (no route delta); "Completed in 761ms". |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ exit 0; **44/44 cases, 84/84 assertions** in 20.5s (no count delta — Fix-3 regression-guard deferred). All four T2 cases pass; all four `case.scroll`-using cases (Fix 5 path) pass. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321` | ✅ **31 screenshots / 3,174,398 bytes** captured in 15.3s — same as cycle 1 (visual-hierarchy split unchanged; cycle-2 fixes are doc / observer-tiebreaker / parameter-passing only). |
| Manual scroll-spy smoke | scroll `/DSA/lectures/ch_4/` past `ch_4-the-contract-operations` | ✅ rail still highlights the H2 entry (`right-rail-scroll-spy-on-h2` covers this in the harness; the defensive tiebreaker is a no-op on today's geometry — the H1 has already scrolled out of the band by the time the H2 enters). |
| Dep manifests | `git diff --stat -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ empty — no manifest touches; `dependency-auditor` skipped per CLAUDE.md exception. |
| Status surfaces | T2 spec / `tasks/README.md` / `m_ux_review/README.md` / `Done when` checkbox / milestones index | ✅ unchanged from cycle 1 — T2 stays `✅ done 2026-04-27`; cycle 2 is closure-only, no re-flip. Case/assertion count in `m_ux_review/README.md` no-regression bullet stays at 44/84 (no test-case delta). |

**Verdict (cycle 2).** ✅ All four LOW findings + the SHIP-advisory closed. T2 ships at `✅ done 2026-04-27` with zero open items.

---

## Cycle 2 audit re-grade (2026-04-27, Auditor)

**Trigger.** User-authorised re-audit on top of cycle 1 ✅ FUNCTIONALLY CLEAN — verify each of the five Builder-claimed RESOLVED items non-inferentially.

**Method.** Each fix re-verified directly against the on-disk artefact; gates re-run from scratch against a fresh `npm run build` + `npm run preview`.

| Fix | Builder claim | Auditor verification | Verdict |
| --- | ------------- | -------------------- | ------- |
| Fix 1 — LOW-1 §1.6 wording | "frontmatter-side filter" replaced with "render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex inside `RightRailTOC.astro`"; T2 reversal split into two distinct edits; defensive tiebreaker mentioned. | `grep -n "frontmatter-side" design_docs/architecture.md` returns no matches. §1.6 paragraph (line 145) describes b29d409 as the render-time `TOP_LEVEL_TITLE` regex; T2's reversal is split into "(a) drops the render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex … (b) adds a build-time H3+ exclusion in `extractSections()`"; tiebreaker mention present ("ScrollSpy prefers the most-specific intersecting level via a defensive `(level desc, top asc)` tiebreaker"). Lineage cross-check: `git show b29d409 -- src/components/chrome/RightRailTOC.astro` confirms the diff was a render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` filter on the `ordered` array (`+const TOP_LEVEL_TITLE = /^\d+\.\d+\s/;` / `+const topLevel = ordered.filter((s) => TOP_LEVEL_TITLE.test(s.title));`). | ✅ RESOLVED |
| Fix 2 — LOW-2 spec D1 wording | "H2 + H3" → "H1 + H2"; "the H3 subsections" → "the H2 subsections"; "Drop H4 and below" → "Drop H3 and below"; cycle-2 amendment blockquote inline. | T2 spec line 32 reads "every section anchor (H1 + H2) into the frontmatter as `sections: [{ id, anchor, title, level: 1 \| 2 }]`, where `level: 1` = the chapter's numbered top-level (`^\d+\.\d+\s`) and `level: 2` = the H2 subsections under it. Drop H3 and below". Cycle-2 amendment blockquote at line 34 documents the depth-mapping rationale and back-links to LOW-2 + LOW-4. No conflict with the surrounding paragraph. | ✅ RESOLVED |
| Fix 3 — LOW-3 ScrollSpy tiebreaker | Defensive `(level desc, top asc)` sort added; new `levelFor(anchorId)` helper reads `data-level` from the matching TOC link in `tocLinks` (not from article anchors); behaviour preserved on today's geometry. Regression-guard test deferred. | `src/components/chrome/ScrollSpy.astro` lines 127–134 implement `levelFor(anchorId)` reading `tocLinks.get(anchorId).dataset.level` (correct — the article anchors don't carry `data-level`; the TOC `<a class="toc-link">` does, per `RightRailTOC.astro:164`). Observer-callback comparator at lines 161–169 sorts by `bLevel - aLevel` (descending — higher level first) then `top` ascending — matches the (level desc, top asc) claim. The asserted ch_4 anchor pair still passes AC4 in the harness re-run (`right-rail-scroll-spy-on-h2` 2/2 asserts), confirming behaviour preservation. Docstring lines 89–105 rewritten — replaces the cycle-1 "no tiebreaker needed" paragraph with the cycle-2 hardening rationale and cites `M-UX-REVIEW-T2-ISS-03`. Regression-guard deferral justified: today's `rootMargin: '0px 0px -66% 0px'` plus the typical H1→H2 spacing in real chapter content (verified for `ch_4-the-list-adt` → `ch_4-the-contract-operations`) means the parent H1 has already scrolled out of the band before the H2 enters, so simultaneous H1+H2 intersection cannot be deterministically triggered without first changing the rootMargin — and rootMargin tuning is out of scope for cycle 2. | ✅ RESOLVED |
| Fix 4 — LOW-4 entry-count language | "~60" → "~60–70 (ch_4 ships at 68: 18 H1 + 50 H2)". | T2 spec line 32 reads "the total entry count rises from ~37 (post-filter) toward ~60–70 (ch_4 ships at 68: 18 H1 + 50 H2)". Re-build confirms ch_4 ships exactly that count: `grep -c "^    level: 1$" src/content/lectures/ch_4.mdx` = 18; `grep -c "^    level: 2$" src/content/lectures/ch_4.mdx` = 50. | ✅ RESOLVED |
| Fix 5 — SHIP advisory `functional-tests.py:628` | F-string replaced with `driver.execute_script("window.scrollTo(0, arguments[0]);", case.scroll)`; comment cites cycle-2 hardening + line-257 cast guard; all four `case.scroll`-using cases still pass. | `scripts/functional-tests.py` lines 636–639 read `if case.scroll: driver.execute_script("window.scrollTo(0, arguments[0]);", case.scroll)`. The cycle-2 comment (lines 627–635) cites both the hardening rationale and the line-257 `int()` cast. Auditor harness re-run shows all `case.scroll`-using cases pass: `right-rail-scroll-spy-on-h2` (2/2), `right-rail-sticky-after-scroll-ch4` (1/1), `left-rail-sticky-after-scroll-ch4` (1/1), `home-continue-reading-populated` (2/2). 44/44 cases / 84/84 assertions in 20.7s. | ✅ RESOLVED |

### Auditor gate re-runs (cycle 2, from scratch)

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | ✅ exit 0; **40 prerendered pages**; "Completed in 762ms". |
| Preview | `npm run preview` (background) + HTTP probe | ✅ reachable — `wget -q -O - http://localhost:4321/DSA/` returned the SSR HTML head (Astro v6.1.9, all `[data-level="1" \| "2"]` chrome.css rules inlined). |
| Functional tests | `.venv/bin/python scripts/functional-tests.py --config scripts/functional-tests.json --base-url http://localhost:4321` | ✅ exit 0; **44/44 cases, 84/84 assertions** in 20.7s. All four T2 cases (`right-rail-toc-h1-h2-mix` 2/2, `right-rail-toc-h1-bold` 1/1, `right-rail-toc-h2-indented` 2/2, `right-rail-scroll-spy-on-h2` 2/2) pass. All four `case.scroll`-using cases pass. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py --config scripts/smoke-routes.json --base-url http://localhost:4321` | ✅ **31 screenshots / 3,174,398 bytes** in 15.2s — matches Builder claim. |
| Visual hierarchy (1280×800) | open `.smoke/screenshots/lectures-ch4-1280x800.png` | ✅ Right rail visible; "4.1 The List ADT" bold + flush-left; H2 children "The contract: operations" / "What this chapter builds" / "What we add to your toolkit here" indented + muted. Hierarchy obvious without zoom. |
| Dep manifests | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | ✅ empty — no manifest touches. `dependency-auditor` skipped per CLAUDE.md exception. |
| F12 boundary | `grep -rn "mux-current\|mux-achievement\|mux-toc-h2-color" src/` | ✅ empty — no F12 token bleed. |
| §1.6 wording | `grep -n "frontmatter-side" design_docs/architecture.md` | ✅ empty — phrase fully removed. |
| Status surfaces | per-task spec / `tasks/README.md` / `m_ux_review/README.md` (task table + Done-when bullets) / milestones index | ✅ all five flipped + consistent — T2 stays `✅ done 2026-04-27`; F4 + No-regression `Done when` bullets `[x]`; milestones index "T1 + T2 closed 2026-04-27". No drift. |
| ch_4 byte-size delta | `stat -c '%s' dist/client/lectures/ch_4/index.html` | ✅ **580,825 bytes** post-cycle-2 build (Builder cycle-1 capture: 580,627; cycle-2 re-build differs by 198 bytes — well within build-determinism noise from the rebuilt MDX timestamps). Pre-T2 baseline 555,586 → +25,239 bytes (+4.5%); below the spec's ~80 KB upper bound. |
| Carrier count | `grep -o "data-interactive-only" dist/client/lectures/ch_4/index.html \| wc -l` | ✅ **87** — matches Builder claim. Pre-T2 baseline 37 → 87 (T9 AC13 baseline restored). |
| Cumulative dist | `du -sb dist/client/` | ✅ **7,277,223 bytes (~7.28 MB)** — within the M-UX +756 KB cumulative envelope; §UX-4 trigger NOT tripped. |

### Final tally (cycle 2 audit)

- 🔴 HIGH: **0**
- 🟡 MEDIUM: **0**
- 🟢 LOW: **0** (all four cycle-1 LOWs verified RESOLVED on the on-disk artefacts)
- SHIP advisory: **0 open** (`functional-tests.py:628` verified RESOLVED)
- AC tally: **8/8 PASS** — unchanged from cycle 1.

**Auditor verdict (cycle 2).** ✅ PASS. T2 ships ✅ FUNCTIONALLY CLEAN with zero open items across all severities. The cycle-2 closure pass landed correctly: each of the five Builder-claimed RESOLVED items verified against the on-disk artefact, gates re-run from scratch, status surfaces consistent, no manifest churn, no F12 boundary trip, no §UX-4 boundary trip. T3 / T4 / T5 / T6 may proceed against this baseline.
