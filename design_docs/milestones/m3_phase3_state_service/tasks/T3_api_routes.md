# T3 — Astro API route stubs (architecture.md §3)

**Status:** ✅ done 2026-04-24 (1 cycle — see [`../issues/T3_issue.md`](../issues/T3_issue.md))
**Depends on:** T1 (Path A confirmed = Astro server hosts the routes)
**Blocks:** T6, T7 (UI surfaces hit these endpoints)

## Why

[Architecture.md §3](../../../architecture.md) names the dynamic surfaces M3+ exposes. M3 stubs **all** of them — even routes whose business logic ships in M4 (`POST /api/questions/bulk`), M5 (`PATCH /api/fsrs_state/:id`, `GET /api/review/due`), or M6 (the code-execution branch of `POST /api/attempts`). Stubs return shape-correct error responses (`501 Not Implemented` with the documented error envelope) so the M3 dogfood surfaces (annotations, read-status) can rely on the routing scaffolding being in place.

## Deliverable

Astro API route files under `src/pages/api/`:

- `health.ts` — `GET /api/health` returns `{ ok: true, version: <pkg>, db: <ok|error> }` with HTTP 200 (the only fully-implemented route in T3).
- `attempts.ts` — `POST /api/attempts` returns 501 with `{ kind: 'not_implemented', impl_milestone: 'M4|M5|M6 per question type' }`.
- `review/due.ts` — `GET /api/review/due` returns 501 with `{ kind: 'not_implemented', impl_milestone: 'M5' }`.
- `questions/bulk.ts` — `POST /api/questions/bulk` returns 501 with `{ kind: 'not_implemented', impl_milestone: 'M4' }`.
- `fsrs_state/[question_id].ts` — `PATCH /api/fsrs_state/:question_id` returns 501 with `{ kind: 'not_implemented', impl_milestone: 'M5' }`.
- `annotations.ts` — `POST` + `GET /api/annotations` — full implementation lands in T6 but stub the routes here so T6 builds against existing scaffolding (return 501 with `{ kind: 'not_implemented', impl_milestone: 'M3 T6' }` until then).
- `read_status.ts` — same pattern; `POST /api/read_status` stubbed for T7.

## Steps

1. `astro.config.mjs`: switch `output` from `'static'` to `'hybrid'` (or `'server'` if the M3 ADR T1 specified). Hybrid lets per-route `prerender: false` flag enable the API routes without breaking the rest of the static build. Verify M2's existing pages still prerender (via `prerender: true` either at the page or by default).
2. Create each route file. Each file:
   - Exports `prerender: false` (so Astro server-renders / runs at request time).
   - Exports `GET` / `POST` / `PATCH` handler functions per Astro v6 conventions.
   - Uses the standardized error envelope from architecture.md §3.1 (`{ kind: '...' }`) for 501 responses.
3. `health.ts` does the only real work: import the Drizzle client (T2), run `SELECT 1`, return `db: 'ok'` if it succeeds, `db: 'error'` if it throws.
4. Verify `npm run build` still works (with hybrid output).
5. `npm run dev` + curl each endpoint, capture HTTP status + body for the audit.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] All 7 route files exist under `src/pages/api/`.
- [ ] **Auditor runs** `npm run dev` and curls each route; collects (status, body):
  - `GET /api/health` → 200, body has `ok: true` + `db: 'ok'`.
  - `POST /api/attempts` (with empty body) → 501, body has `kind: 'not_implemented'`.
  - `GET /api/review/due` → 501.
  - `POST /api/questions/bulk` → 501.
  - `PATCH /api/fsrs_state/foo` → 501.
  - `POST /api/annotations` → 501.
  - `POST /api/read_status` → 501.
- [ ] `npm run build` exits 0 in hybrid output mode; `dist/` still contains the chapter pages from M2 (37 pages).

## Notes

- Hybrid output mode is the safe default — `prerender: true` per-page keeps M2 static pages static, `prerender: false` per-API-route enables server handling. Don't switch to full `'server'` mode (would prerender nothing).
- The 501 envelope shape comes from architecture.md §3.1's `McpError` type, simplified for state-service errors. If the consumer (T6/T7 UI) expects something different, pivot the envelope in cycle 2.
- Architecture.md mentions a `POST /api/read_status` route implicitly under M3's read-status surface but doesn't formally list it in §3. T3 adds it; flag in audit if a future architecture reread says otherwise.
