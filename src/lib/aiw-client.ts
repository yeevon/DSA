// src/lib/aiw-client.ts
// M4 T07 — MCP client helpers for calling aiw-mcp.
// Uses the params.payload wrapper required by FastMCP's tool dispatch.
// Consumed by QuestionGenButton.astro (browser-side script block).

const MCP_URL = 'http://localhost:8080/mcp';

export type McpErrorKind = 'adapter_unreachable' | 'workflow_failed' | 'validation_failed';

export class McpError extends Error {
  constructor(public kind: McpErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'McpError';
  }
}

export interface RunStatus {
  run_id: string;
  status: 'pending' | 'completed' | 'failed';
  artifact?: unknown;
  error?: string;
}

export async function runWorkflow(
  workflow_id: string,
  inputs: Record<string, unknown>,
  run_id?: string,
): Promise<{ run_id: string; status: string }> {
  let res: Response;
  try {
    res = await fetch(MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'run_workflow',
        params: { payload: { workflow_id, inputs, ...(run_id ? { run_id } : {}) } },
      }),
    });
  } catch {
    throw new McpError('adapter_unreachable');
  }
  if (!res.ok) throw new McpError('adapter_unreachable');
  const json = await res.json() as { result?: { run_id: string; status: string }; error?: { message: string } };
  if (json.error) throw new McpError('workflow_failed', json.error.message);
  return json.result!;
}

export async function getRunStatus(run_id: string): Promise<RunStatus> {
  let res: Response;
  try {
    res = await fetch(MCP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 2, method: 'get_run_status',
        params: { payload: { run_id } },
      }),
    });
  } catch {
    throw new McpError('adapter_unreachable');
  }
  if (!res.ok) throw new McpError('adapter_unreachable');
  const json = await res.json() as { result?: RunStatus; error?: { message: string } };
  if (json.error) throw new McpError('workflow_failed', json.error.message);
  return json.result!;
}
