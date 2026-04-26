# ADR 0001 — State service hosting: Astro server (Path A)

**Status:** Accepted
**Date:** 2026-04-24
**Decided by:** M3 T1 (cs-300 owner)
**Supersedes:** —
**Superseded by:** —

## Context

[Architecture.md §4](../architecture.md) deferred the choice between two hosting models for the local state service that owns SQLite (chapters/sections/questions/attempts/fsrs_state/read_status/annotations per §2). The lean was Path A but the actual call was deferred to M3 start. M3 cannot proceed past T1 without this resolved — every downstream task (T2 Drizzle setup, T3 Astro API routes, T5 mode detection, T6/T7 dogfood UI) builds against whichever path is chosen.

Two real constraints frame the decision:

- **Public deploy is static.** GitHub Pages serves `dist/` only — no Node runtime available in production. Whatever happens locally must not break the public site (M2 T6 + T8 contract).
- **Local dev is single-developer.** The user is the only reader/writer. No multi-user state, no concurrent writes, no sync. SQLite is overkill on the locking side and exactly right on the file-format side.

## Options considered

### Path A — Astro server (recommended in arch.md)

Run `astro dev` (or `astro preview`) locally. The state service lives as Astro API routes under `src/pages/api/` with `prerender: false`. SQLite is owned by the Node process via Drizzle ORM + `better-sqlite3`. Two local-mode processes — **two language runtimes**: Astro server (Node, :4321) + the M4 `aiw-mcp` (Python, :8080) running cs-300's workflow modules from `./workflows/`. For the public deploy, hybrid output mode lets prerendered chapter pages ship to GH Pages while the API routes stay server-only (and inert in prod — `detectMode()` returns `'static'` because `/api/health` 404s on the static host).

**Pros:**

- Schema management is conventional: Drizzle migrations checked in as `drizzle/*.sql`, applied via `drizzle-kit push` in dev. Familiar workflow.
- API routes are TypeScript files in the same project as the UI components that call them — single language, single tsconfig, single linter.
- `better-sqlite3` is synchronous, single-file, zero-config. Backups = `cp data/cs-300.db backup.db`.
- Public deploy is unchanged in shape: hybrid output mode prerenders all chapter routes; the API-route handlers are server-side and don't ship to GH Pages (verified in M3 T8 deploy-verification spec).
- Aligns with M4+ architecture: code execution subprocess (M6) is Node-side; co-locating SQLite with the Node runtime keeps the deterministic state surfaces (questions, attempts, FSRS state, code-exec results) in one boundary. M4's `aiw-mcp` is the only cross-language sibling — it owns workflow execution + LLM dispatch, neither of which needs direct SQLite access (it returns generated artifacts to the browser, which POSTs them through to the state service).

**Cons:**

- Two local processes (Astro Node + `aiw-mcp` Python) — minor ops overhead. `npm run dev` only starts Astro; `aiw-mcp` is a separate manual start in M4 (`uvx --from jmdl-ai-workflows aiw-mcp --transport http --port 8080 --cors-origin http://localhost:4321`).
- Cross-language runtime — no shared in-memory data plane between the two processes. State sync happens through HTTP at the surface (browser bridges both). Acceptable: the state service owns persistence; `aiw-mcp` owns workflow execution. They have orthogonal jobs.
- Schema migrations require running `drizzle-kit push` after a fresh clone — one extra setup step.

### Path B — Client-side SQLite (WASM)

`@sqlite.org/sqlite-wasm` + OPFS (Origin Private File System) for persistence. SQLite runs entirely in the browser; no server, no Node runtime needed locally. One process for state in local mode (just the M4 `aiw-mcp` running cs-300 workflows). GH Pages deploy unchanged — pure-static.

**Pros:**

- No backend infrastructure for the reader-state surfaces (annotations, read-status). Single-process operation.
- Public deploy could light up annotations + read-status for any visitor (each visitor has their own OPFS) without exposing a server.

**Cons:**

- WASM bundle is ~2 MB unminified — adds significantly to first-paint cost on the public site, even if the visitor never opens the interactive UI (`detectMode` would have to gate the bundle download).
- Schema migrations run in the browser. A new schema means every reader's local DB needs upgrading on first visit — versioning + recovery-on-failure logic that doesn't exist in the SQLite WASM ecosystem yet.
- OPFS browser support is not universal (Safari historically slow to ship). A reader in a non-supporting browser silently loses their state.
- Drizzle support for sqlite-wasm exists but is less mature than for `better-sqlite3`. Migration-tooling story is less proven.
- Co-locating DB with browser breaks the M4+ architecture: M4's `aiw-mcp` returns generated artifacts the browser needs to POST through to a server-side validator before insert; the M6 code-exec subprocess persists attempt state directly. Path B forces a sync layer between browser-DB and the Node-side validator/exec paths, which is the WASM bundle weight + complication for nothing.

## Decision

**Path A — Astro server.** SQLite via `better-sqlite3` + Drizzle ORM, served from Astro API routes under `src/pages/api/`. Hybrid output mode for the build (per-page `prerender` flags) so prerendered chapter pages ship to GitHub Pages and the API routes stay server-side.

Local dev: `npm run dev` runs Astro (which now serves the API routes too); a separate process starts `aiw-mcp` from `jmdl-ai-workflows` over the streamable-HTTP transport on port 8080 (when M4 lands). Public deploy: static `dist/` to GH Pages exactly as today; `detectMode()` returns `'static'` because no local server is reachable.

## Consequences

**Positive:**

- M3 T2 implementation is direct: `npm install drizzle-orm drizzle-kit better-sqlite3` + `drizzle.config.ts` + the schema from architecture.md §2 + `drizzle-kit push` to a local DB file.
- M3 T3 implementation matches Astro v6 conventions exactly: each file under `src/pages/api/` exports `prerender: false` + a verb handler.
- M2 T6 deploy contract preserved: the same `actions/upload-pages-artifact@v3` workflow uploads `dist/`; nothing about the deploy chain changes.
- M4 `aiw-mcp` runs as a sibling Python process; M6 code execution runs as a Node subprocess. The browser bridges both; no in-memory state sync needed.
- `data/cs-300.db` is gitignored (per-dev state, not source).

**Negative:**

- One extra `drizzle-kit push` step on a fresh clone. Acceptable.
- Hybrid output mode (T3) is new for the project — verify the GH Pages deploy still produces 37 prerendered chapter pages (T8 deploy-verification handles this).
- Two processes in interactive local mode (Astro Node + `aiw-mcp` Python). Single-developer use; not a coordination problem. Both are short-lived dev processes.

**Trade-offs accepted:**

- Reject WASM bundle weight (~2 MB on first paint on a public site visitor's browser) in exchange for simpler schema management + matching architecture.md §4's recommendation.
- Reject browser-side persistence (OPFS, single-browser quirks) in exchange for a single-source-of-truth on disk.

## Implementation references

- M3 T1: this ADR + architecture.md §5 row 2 amendment + M3 README "Open decisions resolved here" update.
- M3 T2: Drizzle schema + initial migration (`src/db/schema.ts` + `drizzle/0000_initial.sql` + `src/db/client.ts`).
- M3 T3: Astro API routes under `src/pages/api/` (hybrid output mode + per-route `prerender: false`).
- M3 T8: deploy-verification confirms the static `dist/` shape post-hybrid-output is byte-compatible with M2 T6's GH Pages deploy.

## Open questions deferred to later tasks

- **`ADAPTER_URL` port pin** (used by `detectMode()` to probe `aiw-mcp`). Resolved 2026-04-24 to **8080** to match the [jmdl-ai-workflows README](https://pypi.org/project/jmdl-ai-workflows/) example invocation (`aiw-mcp --transport http --port 8080`). cs-300's `src/lib/mode.ts` constant pinned to `http://localhost:8080`. Override via the `aiw-mcp --port` flag at launch time.
- **External workflow module discovery.** ✅ RESOLVED 2026-04-25 — jmdl-ai-workflows v0.2.0 (2026-04-24, upstream M16) shipped the env-var loader (`AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade`) and the mirroring CLI flag (`--workflow-module`, repeatable). cs-300 launches `aiw-mcp` with that env var; M4 unblocked. Original cs-300-filed feature request (`aiw_workflow_discovery_issue.md` at repo root) deleted at unblock per its own author note.
- **`bun:sqlite` runtime fallback.** If `better-sqlite3` ever fails to install on a target platform, the Bun runtime + `bun:sqlite` is a fallback. Not in scope today; revisit only if install breaks.
