# T04 — aiw-mcp launch script + mode.ts liveness probe

**Status:** ✅ done 2026-05-02 (AC-8 npm build carry-over: verify on host with `npm ci && npm run build` — sandbox node_modules root-owned)
**Depends on:** T02, T03 (modules must exist for the launch script to load them)
**Blocks:** T07 (UI feature-detection depends on working mode.ts probe)

## Why

Two independent but related wiring tasks:

1. **Launch script.** M4's README specifies a `uvx --from jmdl-ai-workflows aiw-mcp ...`
   launch command with `AIW_EXTRA_WORKFLOW_MODULES` pointing at the cs-300 workflow modules.
   The unblock smoke confirmed `PYTHONPATH=<repo_root>` is required for the uvx-isolated
   environment to resolve the `cs300.*` imports. A shell script at `scripts/aiw-mcp.sh`
   codifies this so the user has a single command to start the local backend.

2. **mode.ts liveness probe.** `src/lib/mode.ts` currently probes
   `http://localhost:8080/health` to detect the adapter. That path does not exist —
   FastMCP's HTTP transport binds to `http://127.0.0.1:8080/mcp` (confirmed in
   `issues/m4_unblock_smoke.md` Smoke 2). The forward-work comment in mode.ts since M3
   ("the '/health' path used here is a placeholder") must be resolved now that M4 wires
   up the real server.

## Deliverables

### A — `scripts/aiw-mcp.sh`

```bash
#!/usr/bin/env bash
# M4 T04 — Launch aiw-mcp with cs300 workflow modules.
# Usage: bash scripts/aiw-mcp.sh [--port PORT] [--cors-origin ORIGIN]
# Defaults: port 8080, cors-origin http://localhost:4321
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${AIW_PORT:-8080}"
CORS_ORIGIN="${AIW_CORS_ORIGIN:-http://localhost:4321}"

exec env \
  PYTHONPATH="$REPO_ROOT" \
  AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade \
  uvx --from jmdl-ai-workflows aiw-mcp \
    --transport http \
    --port "$PORT" \
    --cors-origin "$CORS_ORIGIN"
```

Key points:
- `PYTHONPATH="$REPO_ROOT"` makes `cs300.*` importable in the uvx subprocess.
- `exec` replaces the shell process so the pid maps to aiw-mcp (clean signal handling).
- Env-var overrides `AIW_PORT` and `AIW_CORS_ORIGIN` for flexibility.
- `set -euo pipefail` — fail loudly on errors.

Make executable (`chmod +x scripts/aiw-mcp.sh`).

### B — `src/lib/mode.ts` probe fix

Current probe:
```ts
fetch(ADAPTER_URL + '/health').then(r => r.ok)
```

Problem: FastMCP serves at `/mcp`, not `/health`. `/health` does not exist — any HTTP
response (including 404) would return `r.ok = false`, so the current probe is effectively
"always false" rather than "connection refused = false."

Fix: probe the actual MCP endpoint using a `POST` with a minimal JSON-RPC body. Treat any
HTTP response (even 4xx) as "server is alive" — only a network error (ECONNREFUSED, CORS
failure on a down server) returns false.

```ts
const ADAPTER_URL = 'http://localhost:8080';
const MCP_ENDPOINT = ADAPTER_URL + '/mcp';

// Liveness probe: POST to the MCP endpoint with a no-op body.
// Any HTTP response (including 4xx) means the server is up.
// Network error (ECONNREFUSED) or CORS reject on a dead server → false.
const alive = await fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }),
}).then(() => true).catch(() => false);
```

Replace the adapter probe line in `detectMode()`:
```ts
// Before:
fetch(ADAPTER_URL + '/health').then(r => r.ok),
// After:
fetch(MCP_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }),
}).then(() => true).catch(() => false),
```

Remove the stale forward-work comment (the one saying "/health is a placeholder"). Add a
brief comment explaining why we treat any response as alive.

### C — CHANGELOG entry.

## Acceptance criteria

- [ ] **AC-1.** `scripts/aiw-mcp.sh` exists and is executable (`-x` bit set).
- [ ] **AC-2.** Script body uses `PYTHONPATH="$REPO_ROOT"` computed from
  `${BASH_SOURCE[0]}` (not a hardcoded path).
- [ ] **AC-3.** Script loads both `cs300.workflows.question_gen` and `cs300.workflows.grade`
  via `AIW_EXTRA_WORKFLOW_MODULES`.
- [ ] **AC-4 (smoke — non-inferential).** Auditor runs the script, waits for startup log,
  confirms liveness:
  ```bash
  bash scripts/aiw-mcp.sh &
  AIAW_PID=$!
  sleep 3
  curl -s -X POST http://localhost:8080/mcp \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.1"}}}' \
    | head -1
  kill $AIAW_PID 2>/dev/null
  ```
  The `curl` output must be a non-empty JSON line (server responds to initialize). Exit 0.
- [ ] **AC-5.** `src/lib/mode.ts` no longer references `/health`.
- [ ] **AC-6.** `src/lib/mode.ts` adapter probe uses `POST` to `MCP_ENDPOINT` (or the
  equivalent inline) with a JSON-RPC body.
- [ ] **AC-7.** The stale "/health is a placeholder" forward-work comment is removed.
- [ ] **AC-8.** TypeScript build passes after the change: `npm run build` exits 0.
- [ ] **AC-9.** CHANGELOG has an M4 T04 entry.

## Notes

- The CORS header `--cors-origin http://localhost:4321` is required for the browser-origin
  mode.ts fetch to succeed. Without it, the browser's preflight fails even when the server
  is up — this would make mode detection always return 'static' even when aiw-mcp is running.
- Port 8080 is the launch default. The `ADAPTER_URL` constant in mode.ts must match.
  If the user changes the port via `AIW_PORT`, they must also change `ADAPTER_URL` in
  mode.ts. This is acceptable for a local-dev tool (no config system needed for M4).
- The `ping` method in the probe body is not a real MCP method; FastMCP will return a
  JSON-RPC error (method not found) — that's fine. The probe only needs any HTTP response.
- aiw-mcp AC-4 smoke requires PYTHONPATH to resolve the cs300 modules at startup. If the
  smoke fails with ImportError on cs300, confirm T01 and T02/T03 landed first.
