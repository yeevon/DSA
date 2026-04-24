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

// aiw-mcp HTTP transport URL. Aligned with the jmdl-ai-workflows
// README example (port 8080) so cs-300 and the upstream framework
// docs use the same default. Override via the aiw-mcp launch site
// if needed (--port flag, or wrap in a launcher script).
//
// M4 forward-work: confirm the probe path. M14 smoke (jmdl-ai-workflows
// CHANGELOG, 2026-04-22) hit '/mcp/' as the streamable-HTTP endpoint;
// the '/health' path used here is a placeholder that may need to flip
// to a HEAD/OPTIONS probe of '/mcp/' if FastMCP does not expose a
// liveness endpoint. Resolved when M4 actually wires aiw-mcp up.
const ADAPTER_URL = 'http://localhost:8080';

export async function detectMode(): Promise<Mode> {
  try {
    const [adapter, state] = await Promise.all([
      fetch(ADAPTER_URL + '/health').then((r) => r.ok),
      fetch('/api/health').then((r) => r.ok),
    ]);
    return adapter && state ? 'interactive' : 'static';
  } catch {
    return 'static';
  }
}
