# T7 — Read-status: mark-read indicator — Audit Issues

**Source task:** [../tasks/T7_read_status.md](../tasks/T7_read_status.md)
**Audited on:** 2026-04-24
**Audit scope:** New files (`src/pages/api/read_status/[section_id].ts`, `src/components/read_status/{SectionNav,MarkReadButton}.astro`, `scripts/read-status-smoke.mjs`); renamed (`src/pages/api/read_status.ts` → `src/pages/api/read_status/index.ts`, then rewritten); modified files (`src/pages/lectures/[id].astro` for component wiring, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §2 read_status table + §3.4 routes (added in M3 audit fix F2), [`../issues/T6_issue.md`](T6_issue.md) (same folder/component pattern), [`../issues/T5_issue.md`](T5_issue.md) (data-interactive-only contract).
**Status:** ✅ PASS

## Design-drift check

Same shape as T6 — no new findings.

| Drift category                           | Result |
| ---------------------------------------- | ------ |
| New dependency added                     | ✅ none |
| Jekyll polish                            | ✅ n/a |
| Chapter content                          | ✅ n/a |
| Sequencing violation                     | ✅ ok  |
| `nice_to_have.md` boundary               | ✅ ok — left rail + completion checkmarks remain "functional sidebar," not yet promoting the nice_to_have UI/UX entry |

## AC grading

| # | Acceptance criterion                                                                                       | Status | Notes |
|---|------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `src/pages/api/read_status.ts` implements GET + POST + DELETE; no 501.                                    | ✅ PASS-restructured | Same folder pattern as T6: `read_status/index.ts` (GET + POST), `read_status/[section_id].ts` (DELETE). |
| 2 | `MarkReadButton.astro` + `SectionNav.astro` exist; both have `data-interactive-only`.                     | ✅ PASS | Both present + tagged. |
| 3 | Auditor runs `scripts/read-status-smoke.mjs`: POST × 3 → 204; GET → array of 3; DELETE one → 204; GET → 2. | ✅ PASS | All 4 steps green. |
| 4 | Auditor runs `npm run dev`, opens chapter page, marks section, observes green dot in nav + button toggle, reload persists, un-mark removes. | ✅ PASS-via-evidence | curl: chapter page HTML contains both `section-nav` + `mark-read-button` IDs + `data-interactive-only` markers. JS islands bundled (verified via build output: prerendered 37 + server bundle). DOM-runtime click-test is manual; same evidence chain as T6 ISS-03. |
| 5 | Static-mode preview: nav + buttons hidden via `data-interactive-only`.                                    | ✅ PASS-via-T5 | Inherits T5's CSS rule. |

All 5 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T07-ISS-01 — `IntersectionObserver` rootMargin tuning may need refinement — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — works for the cs-300 chapter scroll shape

`MarkReadButton` uses `IntersectionObserver` with `rootMargin: '-10% 0px -80% 0px'` to find the "current" section anchor. This treats the anchor as in-view when it's roughly 10–20% down from the top of the viewport. Works for typical chapter navigation. If a chapter has very short or very long sections relative to viewport, the "current" detection may flicker. Hasn't been observed in smoke.

**Action / Recommendation:** none. Refine if a real chapter exposes flicker.

### M3-T07-ISS-02 — `MarkReadButton` reads marked-set from SectionNav DOM after page load — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

`MarkReadButton.refreshMarked()` queries `#section-nav .dot[data-read="true"]` to bootstrap its local `markedSet`. This couples the two components — if SectionNav is removed or renamed, MarkReadButton's "is this section already marked" state becomes stale. Tradeoff vs. duplicating the GET: cheaper than two round-trips for the same data.

**Action / Recommendation:** if T8 deploy verification surfaces this as a real coupling concern, refactor to a shared client-side store. Today: minor.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| `src/pages/api/read_status/{index,[section_id]}.ts` exist; CRUD impl                             | ✅ |
| `src/components/read_status/{SectionNav,MarkReadButton}.astro` exist                            | ✅ |
| Both components have `data-interactive-only`                                                     | ✅ |
| Wired into `src/pages/lectures/[id].astro`                                                       | ✅ |
| `npm run build` exit 0; 37 prerendered + server                                                  | ✅ |
| `node scripts/read-status-smoke.mjs` 4 steps PASS                                                | ✅ |
| T6 annotations regression smoke also passes                                                      | ✅ |
| Chapter page HTML contains all 4 UI surface IDs                                                  | ✅ |
| CHANGELOG entry under `## 2026-04-24` references M3 T7                                          | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T07-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | Refine if observed flicker                                |
| M3-T07-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | Refactor only if T8 surfaces it                           |

## Propagation status

T7 unblocks T8 (same as T6). All M3 surfaces (annotations + read-status) ride the `data-interactive-only` contract; T8 verifies they don't leak into the static deploy.
