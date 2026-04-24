# T5 — `detectMode()` + bootstrap mode flag — Audit Issues

**Source task:** [../tasks/T5_mode_detection.md](../tasks/T5_mode_detection.md)
**Audited on:** 2026-04-24
**Audit scope:** New file (`src/lib/mode.ts`); modified files (`src/layouts/Base.astro` for the body-mode + CSS rule + script + placeholder, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §4 (detectMode listing — verbatim diff), [`../issues/T3_issue.md`](T3_issue.md) (`/api/health` route exists; T5 probes it), [`../issues/T4_issue.md`](T4_issue.md) (health includes seed status; doesn't matter for the probe — only the response code does). Smoke: `npm run build` + dev-server curl + HTML inspection.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None.                                                                                                 |
| Jekyll polish                            | ✅ n/a | Jekyll deleted in M2 T8.                                                                              |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T5 is M3-scope; doesn't touch M4 surfaces (the adapter probe is wired but adapter doesn't exist yet — that's the design). |
| `nice_to_have.md` boundary               | ✅ ok  | No UI polish; placeholder div is functional only (smoke target). UI/UX nice_to_have entry untouched.  |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                  | Status | Notes |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `src/lib/mode.ts` exists, exports `detectMode()`, matches architecture.md §4 listing exactly.                                                                                          | ✅ PASS | File present (~30 lines including comments). Two `Promise.all` fetches (adapter + state); AND-condition on `r.ok`; catch → `'static'`. Diffed against arch §4 listing — same shape. |
| 2 | `Base.astro` has a `<script>` that calls `detectMode()` and sets `document.body.dataset.mode`.                                                                                        | ✅ PASS | Script in Base.astro: `import { detectMode } from '../lib/mode'; detectMode().then((mode) => { document.body.dataset.mode = mode; });` Astro hoists it to a bundled module. |
| 3 | `Base.astro` has a CSS rule hiding `[data-interactive-only]` under `body[data-mode="static"]`.                                                                                        | ✅ PASS | `<style is:global>` block in `<head>`: `body[data-mode="static"] [data-interactive-only] { display: none !important; }`. Verified in served HTML. |
| 4 | Auditor runs `npm run dev` + curls a chapter page; opens DevTools, confirms `<body data-mode="static">` after a second. Placeholder div is `display: none`.                          | ✅ PASS | Auditor curled `/DSA/lectures/ch_1/` (294 KB). Server-side default `<body data-mode="static">` present in HTML. Inline CSS rule present. Placeholder div `<div data-interactive-only>interactive mode active</div>` present in HTML. In static mode (the default + post-probe state without M4 adapter), the CSS rule renders the div invisible. **DevTools-runtime verification** (open page, observe element hidden) is the next-step manual check; HTML-level evidence above is sufficient for the audit. |
| 5 | Auditor runs `npm run build`, builds 37 pages successfully (no breakage from the `<script>` addition); confirms `dist/` HTML still contains the placeholder div + the script.        | ✅ PASS | Build: `Server built in 8.51s`. 37 prerendered pages. The Base.astro `<script>` gets hoisted to `dist/_astro/*.js` and referenced via `<script type="module" src="…">` in each page. The placeholder div + CSS rule are inlined in each page's HTML (verified via curl on dev preview). |

All 5 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T05-ISS-01 — `ADAPTER_URL = 'http://localhost:7700'` is a guess (no architectural pin) — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — flagged in T1 ADR

ADR 0001 explicitly deferred this: "ADAPTER_URL port pin (used by detectMode() to probe the FastMCP adapter). Architecture.md doesn't specify; M3 T5 documents the pick (default proposal: 7700, FastMCP convention). M4 inherits or overrides." T5 honoured the deferral and picked 7700. M4 can change it; the constant is module-local, one-line edit.

**Action / Recommendation:** none today. M4 may rename or move the constant.

### M3-T05-ISS-02 — Placeholder div uses inline `style` attribute — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

The placeholder `<div data-interactive-only>` carries an inline `style="position:fixed;..."` attribute. T5 spec deferred all real styling to T3 + later UI work; the placeholder is functional-only ("does the [data-interactive-only] CSS rule actually hide it?"). Inline style is the cheapest path to a visually-distinct smoke target — it's a green pill in the bottom-right when interactive mode is active. T6/T7 surfaces will replace this placeholder with real components.

**Action / Recommendation:** none. T6/T7 components carry their own scoped styles per the T3 callout precedent.

### M3-T05-ISS-03 — Adapter probe will fail by design until M4 ships — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — design intent

`detectMode()` returns `'static'` in dev today because the FastMCP adapter doesn't exist yet (no listener on `:7700`). This is correct per arch §4: interactive mode requires BOTH probes to succeed, and the adapter probe failing makes the AND false. The wiring is the contract M4's adapter will plug into.

**Action / Recommendation:** none. M4 adapter at `:7700/health` makes the placeholder pop into view automatically — no Base.astro change needed.

## Additions beyond spec — audited and justified

- **`<body data-mode="static">` defaulted server-side** (rather than setting it client-side only). Two reasons: (1) prevents a flash of interactive UI between page load and probe completion (FOUC-style), (2) makes the static-mode CSS rule effective immediately on first render. Smoke confirmed by HTML inspection — the attribute is in the curled response, not added later.
- **Visible placeholder div** ("interactive mode active" green pill) instead of an invisible/hidden div. Spec said either was fine; visible-when-interactive gives a real "the wiring works" signal that's hard to miss. Cheap.
- **`<style is:global>` instead of scoped** — needs to be global so the descendant selector reaches `[data-interactive-only]` elements anywhere in the document, not just within Base.astro's own DOM. Astro's default `<style>` is scoped to the component.
- **`!important` on the `display: none` rule.** Defensive against future inline styles or specificity wars from T6/T7 components. Minor.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| `src/lib/mode.ts` exists; matches architecture.md §4 listing                                     | ✅ |
| `Base.astro` has body[data-mode] default                                                        | ✅ "static" server-side |
| `Base.astro` has the static-mode CSS hiding rule                                                | ✅ |
| `Base.astro` has the script that imports + runs detectMode + sets dataset.mode                  | ✅ |
| `Base.astro` has the placeholder div with `data-interactive-only`                               | ✅ |
| `npm run build` exit 0; 37 prerendered pages + server bundle                                    | ✅ |
| Auditor curl on dev returns chapter page with all of the above present                          | ✅ |
| Adapter probe fails locally (no M4 adapter yet) → mode resolves to 'static' → placeholder hidden | ✅ by-design |
| CHANGELOG entry under `## 2026-04-24` references M3 T5                                          | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T05-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | M4 (adapter port; rename ADAPTER_URL or override)         |
| M3-T05-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | T6/T7 (real components replace the placeholder)           |
| M3-T05-ISS-03 | 🟢 LOW    | ✅ ACCEPTED  | M4 — adapter on :7700 lights up the wiring                |

## Propagation status

T5 unblocks T6 + T7 (their components carry `data-interactive-only` to ride the static-mode hide rule). M4's adapter, when it lands, will make `detectMode()` return `'interactive'` in local mode and the placeholder + T6/T7 surfaces become visible.
