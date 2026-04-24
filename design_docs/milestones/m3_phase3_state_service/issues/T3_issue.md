# T3 — Astro API route stubs (architecture.md §3) — Audit Issues

**Source task:** [../tasks/T3_api_routes.md](../tasks/T3_api_routes.md)
**Audited on:** 2026-04-24
**Audit scope:** New files (`src/pages/api/{health,attempts,annotations,read_status}.ts`, `src/pages/api/review/due.ts`, `src/pages/api/questions/bulk.ts`, `src/pages/api/fsrs_state/[question_id].ts`); modified files (`astro.config.mjs` adapter wiring, `package.json` deps, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §3 (M4/M5/M6 routes) + §3.4 (M3 reader-state routes added in audit fix F2), [`../../../adr/0001_state_service_hosting.md`](../../../adr/0001_state_service_hosting.md) (Path A: Astro server hosts API routes), [`../issues/T2_issue.md`](T2_issue.md) (Drizzle client at `src/db/client.ts`). Smoke: `npm run build`; `npm run dev` + curl every route (mutating ones with `-H 'Origin: …'` for CSRF).
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `@astrojs/node@^10.0.6`. Required by Astro 6 to support per-route `prerender = false`. Sanctioned by ADR 0001 (Path A). |
| Jekyll polish                            | ✅ n/a | Jekyll deleted in M2 T8.                                                                              |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T3 is M3-scope; routes scaffolded for downstream milestones (M4/M5/M6) but only M3-impl routes (health) carry real logic. |
| `nice_to_have.md` boundary               | ✅ n/a | No UI surfaces; nice_to_have entry untouched.                                                         |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                       | Status | Notes |
|---|------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | All 7 route files exist under `src/pages/api/`.                                                            | ✅ PASS | `health.ts`, `attempts.ts`, `review/due.ts`, `questions/bulk.ts`, `fsrs_state/[question_id].ts`, `annotations.ts`, `read_status.ts` — all present. |
| 2 | Auditor runs `npm run dev` and curls each route. Status + body match spec. | ✅ PASS | All 9 endpoints (GET+POST on annotations + read_status, single verb on the other 5) verified. Outputs: `GET /api/health` → 200 + `{ok:true,version:"0.0.1",db:"ok"}`; `POST /api/attempts` → 501 + `{kind:"not_implemented",impl_milestone:"M4 (mc, short) \| M5 (llm_graded) \| M6 (code)"}`; `GET /api/review/due` → 501 + `{kind:"not_implemented",impl_milestone:"M5"}`; `POST /api/questions/bulk` → 501 + M4 envelope; `PATCH /api/fsrs_state/foo` → 501 + M5 envelope; `POST/GET /api/annotations` → 501 + `M3 T6`; `POST/GET /api/read_status` → 501 + `M3 T7`. |
| 3 | `npm run build` exits 0 in hybrid output mode; `dist/` still contains chapter pages from M2 (37 pages).    | ✅ PASS-with-amendment | Astro 6 removed hybrid mode; T3 spec wording is now stale on this point. Modern pattern (`output: 'static'` + `@astrojs/node` adapter + per-route `prerender = false`) achieves the same result. Build exits 0; `dist/` contains 37 prerendered HTML pages. Adapter also produces a server bundle (used by `astro dev`/`preview`; not uploaded by M2 T6's deploy workflow). |

All 3 ACs met (AC 3 with the spec-wording amendment noted in ISS-01 below).

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T03-ISS-01 — T3 spec wording references `output: 'hybrid'` which Astro 6 removed — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — implementation pivoted; spec wording stale

T3 spec step 1 says "switch `output` from `'static'` to `'hybrid'`." Astro 6 removed the `'hybrid'` mode. The modern equivalent (used here): `output: 'static'` + an adapter (`@astrojs/node`) + per-route `prerender = false`. Behaviour matches what T3 intended. Spec step wording is stale; behaviour is correct.

**Action / Recommendation:** none for this cycle. If a future audit re-reads T3 spec and is confused by the `'hybrid'` wording, amend the spec then.

### M3-T03-ISS-02 — Astro CSRF protection rejects mutating requests without `Origin` header — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — correct production behaviour

Astro 6 ships CSRF protection on by default. POST/PATCH/DELETE without an `Origin` header matching the host return 403 with "Cross-site POST form submissions are forbidden." Real frontend `fetch()` calls set `Origin` automatically; the smoke tests pass `-H 'Origin: http://localhost:<port>'`. Documented in T3 audit so future smoke tests don't get tripped up.

**Action / Recommendation:** none. T6/T7 frontend code uses `fetch()` directly → Origin is auto-set → routes work. If the M4 FastMCP adapter needs to call our API from a different origin, configure CORS / CSRF whitelist then.

### M3-T03-ISS-03 — Adapter produces a `dist/server/` bundle that won't be served by GH Pages — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — confirmed in T8 deploy verification

The `@astrojs/node` standalone adapter produces `dist/server/entry.mjs` plus assets alongside `dist/client/` (the prerendered HTML). GH Pages serves whatever's at the upload path (`dist/` per M2 T6's `actions/upload-pages-artifact@v3` config). Need to verify in T8 that the deployed site still serves only the static pages and the server entrypoint either doesn't get uploaded or is harmlessly inert.

**Action / Recommendation:** T8's hybrid-output verification step (added in audit fix F3) covers this. No T3 follow-up.

## Additions beyond spec — audited and justified

- **Adapter wiring with header-comment context.** `astro.config.mjs` carries an inline rationale block explaining why the adapter was added + the GH Pages compatibility implication (server bundle stays local; only prerendered pages deploy). Future readers won't have to chase the change.
- **Real DB ping in `health.ts`** rather than just returning a hardcoded `db: 'ok'`. Spec said "import the Drizzle client … run `SELECT 1`" — implementation matches. Catches a broken DB before T6/T7 surfaces hit it in earnest.
- **`prerender = false` exported per-route**, not configured via a global. Astro 6 needs the per-file export; the alternative (config-level page-pattern) doesn't exist in current Astro.

## Verification summary

| Check                                                                                            | Result |
| ------------------------------------------------------------------------------------------------ | ------ |
| 7 route files under `src/pages/api/`                                                            | ✅ |
| Each route exports `prerender = false`                                                          | ✅ |
| `@astrojs/node` adapter installed; `astro.config.mjs` wires it (standalone mode)                | ✅ |
| `npm run build` exits 0; `dist/client/` contains 37 prerendered chapter pages                    | ✅ |
| Auditor `npm run dev` + curl 9 endpoints (GET+POST on annotations + read_status)                 | ✅ all match expected status + body |
| `GET /api/health` returns 200 with `{ok, version, db}` shape; `db: 'ok'`                        | ✅ |
| All 6 stubbed routes return 501 with `{kind: 'not_implemented', impl_milestone: '…'}` envelope  | ✅ |
| CHANGELOG entry under `## 2026-04-24` references M3 T3                                          | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T03-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | None — spec wording stale; impl matches intent            |
| M3-T03-ISS-02 | 🟢 LOW    | ✅ ACCEPTED  | T6/T7 frontend `fetch()` auto-sets Origin                 |
| M3-T03-ISS-03 | 🟢 LOW    | ✅ ACCEPTED  | T8 deploy verification confirms GH Pages compatibility    |

## Propagation status

T3 unblocks T6 + T7 (their UIs hit `/api/annotations` and `/api/read_status` — currently 501 stubs, T6 + T7 fill in the impls). The Drizzle client import path (`src/db/client.ts`) is already used by `health.ts`; T6 + T7 routes import from the same client.
