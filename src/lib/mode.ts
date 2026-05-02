// src/lib/mode.ts
//
// M3 T5 — Mode detection. Single runtime flag set once at app
// bootstrap; per architecture.md §4. Returns 'interactive' iff
// BOTH the local aiw-mcp server (M4) AND the local state service
// (T3 health route) respond OK. Anything else → 'static'.
//
// Until M4 ships the workflow modules + launches aiw-mcp, the
// adapter probe always fails locally → mode is always 'static'.
// The plumbing is wired here so M4's aiw-mcp, when it lands,
// "lights up" the UI just by becoming reachable.

export type Mode = 'interactive' | 'static';

const ADAPTER_URL = 'http://localhost:8080';
// FastMCP's streamable-HTTP transport binds at /mcp, not /health.
// Probe with a no-op JSON-RPC POST: any HTTP response (including a
// method-not-found error) means the server is up; only ECONNREFUSED
// or a CORS reject on a dead server reaches the .catch(() => false).
const MCP_ENDPOINT = ADAPTER_URL + '/mcp';

export async function detectMode(): Promise<Mode> {
  try {
    const [adapter, state] = await Promise.all([
      fetch(MCP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }),
      }).then(() => true).catch(() => false),
      fetch('/api/health').then((r) => r.ok),
    ]);
    return adapter && state ? 'interactive' : 'static';
  } catch {
    return 'static';
  }
}
