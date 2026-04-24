// src/lib/mode.ts
//
// M3 T5 — Mode detection. Single runtime flag set once at app
// bootstrap; per architecture.md §4. Returns 'interactive' iff
// BOTH the FastMCP adapter (M4) AND the local state service
// (T3 health route) respond OK. Anything else → 'static'.
//
// Until M4 ships the FastMCP adapter, the adapter probe always
// fails locally → mode is always 'static'. The plumbing is wired
// here so M4's adapter, when it lands, "lights up" the UI just
// by becoming reachable.

export type Mode = 'interactive' | 'static';

// FastMCP adapter URL. Architecture.md doesn't pin the port; T5
// chose 7700 as the FastMCP convention. M4 inherits or overrides.
const ADAPTER_URL = 'http://localhost:7700';

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
