# T5 — `detectMode()` + bootstrap mode flag

**Status:** ✅ done 2026-04-24 (1 cycle — see [`../issues/T5_issue.md`](../issues/T5_issue.md))
**Depends on:** T1 (the routes T5 probes exist per Path A choice)
**Blocks:** T6 + T7 (interactive UI conditionally renders on `mode === 'interactive'`)

## Why

[Architecture.md §4](../../../architecture.md): single runtime flag `interactive`, set once at app bootstrap. Detection probes both `aiw-mcp` (M4 surface — won't be reachable in M3; the jmdl-ai-workflows MCP server) and the state service (`/api/health` — T3 + T4 ship this). Returns `'interactive'` if BOTH respond OK; `'static'` otherwise.

The static public deploy at <https://yeevon.github.io/DSA/> always returns `'static'` because no MCP server or local state service is reachable. M3's local dev mode (`npm run dev` + the dev SQLite + the M3 dogfood UI) returns `'static'` initially — `aiw-mcp` doesn't exist locally until M4 wires the cs-300 workflow modules up. So **`detectMode()` returns `'static'` in both production and local until M4**, but the wiring + the conditional-render plumbing land here.

## Deliverable

- `src/lib/mode.ts` — exports `detectMode(): Promise<'interactive' | 'static'>` matching architecture.md §4's listing.
- A small `<ModeProbe>` Astro/JS island (or vanilla `<script>` in the `Base.astro` layout) that calls `detectMode()` on page load and sets a body-level data attribute (`data-mode="static"` or `data-mode="interactive"`).
- CSS rule in the existing layout that hides any element with `data-interactive-only` attribute when `body[data-mode="static"]`. The conditional-render plumbing — no actual UI surfaces yet (T6/T7 ship those).
- One placeholder element with `data-interactive-only` for the smoke test (e.g., a hidden `<div>Interactive mode active</div>` in `Base.astro`).

## Steps

1. Author `src/lib/mode.ts` exactly per architecture.md §4 listing. Two `Promise.all` fetches against `ADAPTER_URL + '/health'` and `'/api/health'`; both must succeed for `'interactive'`. Error → `'static'`.
2. Constants module `src/lib/constants.ts` (or just inline) — `ADAPTER_URL = 'http://localhost:8080'` (matches the [jmdl-ai-workflows README](https://pypi.org/project/jmdl-ai-workflows/) example invocation `aiw-mcp --transport http --port 8080`; previously 7700 from the original T5 implementation, repinned 2026-04-24 — see [`../../../adr/0001_state_service_hosting.md`](../../../adr/0001_state_service_hosting.md) "Open questions deferred").
3. Update `src/layouts/Base.astro` (T1 of M2 created this) — add an inline `<script>` that runs `detectMode()` on `DOMContentLoaded` and sets `document.body.dataset.mode`. Add a `<style>` block with `body[data-mode="static"] [data-interactive-only] { display: none; }`.
4. Add a placeholder div somewhere visible in `Base.astro` (or a per-page test): `<div data-interactive-only>(interactive mode active)</div>`.
5. Smoke (local): `npm run dev` + curl `/api/health` returns 200 + adapter URL returns nothing (no adapter running). `detectMode()` should return `'static'`. Verify in browser: the placeholder div is hidden because adapter probe fails.
6. Smoke (production proxy): `npm run build && npm run preview`. Same behaviour — both probes fail, body gets `data-mode="static"`, placeholder hidden.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `src/lib/mode.ts` exists, exports `detectMode()`, matches architecture.md §4 listing exactly (two parallel fetches, AND-condition on both OK, default to `'static'` on any throw).
- [ ] `Base.astro` has a `<script>` that calls `detectMode()` and sets `document.body.dataset.mode`.
- [ ] `Base.astro` has a CSS rule hiding `[data-interactive-only]` under `body[data-mode="static"]`.
- [ ] **Auditor runs** `npm run dev` + curls a chapter page, opens DevTools, confirms `<body data-mode="static">` after a second (or curls `/api/health` to confirm the state-side returns 200, then confirms the adapter probe fails because no adapter is running). Placeholder div is `display: none`.
- [ ] **Auditor runs** `npm run build`, builds 37 pages successfully (no breakage from the `<script>` addition); confirms `dist/` HTML still contains the placeholder div + the script (mode flips client-side).

## Notes

- `'interactive'` mode won't actually fire in M3 — that needs `aiw-mcp` running cs-300's workflow modules from M4. The plumbing is here so M4, when it lands, just makes the second probe succeed and the UI lights up.
- Don't try to short-circuit `detectMode()` in production builds (e.g., a `import.meta.env.PROD` early-return). Per architecture.md §4: "Build artifact is identical in both modes. … Feature detection alone flips the UI." Keep it.
- ADAPTER_URL constant — pinned to port 8080 (jmdl-ai-workflows README example). M4 launches `aiw-mcp` against this port; override at the launch site if needed (`--port` flag).
- M4 forward-work: confirm the actual probe path `aiw-mcp` exposes for liveness. M14 in jmdl-ai-workflows (CHANGELOG 2026-04-22) hit `/mcp/` as the streamable-HTTP endpoint; the `/health` path used in `src/lib/mode.ts` may need to flip to a HEAD/OPTIONS probe of `/mcp/` if FastMCP doesn't expose a dedicated liveness endpoint. Resolved when M4 actually wires `aiw-mcp` up.
