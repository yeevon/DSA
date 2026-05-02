# T07 — Question-gen UI

**Status:** ✅ done 2026-05-02 (spec deviation: .astro not .tsx; AC-2/3/4/6/8/9 host-only)
**Depends on:** T04 (mode.ts probe must work), T05 (bulk endpoint must accept questions)
**Blocks:** nothing in M4 (T08 extends the attempt submission UI, but T07 is not a strict
dep for T08's state-service work)

## Why

M4's "Done when" requires: "Question generation UI: a per-section 'generate questions'
action that opens a small form (count, types) and triggers the workflow via the MCP
`run_workflow` tool. Polling spinner during run. Results inserted into the question bank
on success."

T07 is the Astro/React implementation of this UI gate.

## Design

**Placement.** A "Generate questions" button in the chapter route's right rail, gated
behind `mode === 'interactive'` (the `data-interactive-only` CSS contract from M3 T5).
When clicked, opens a small inline form (not a modal) below the button.

**Form fields:**
- Count (number input, default 3, min 1 max 10).
- Types (checkboxes: mc, short, llm_graded, code; default: mc + short).

**Submit flow:**
1. Call `aiw-client.runWorkflow('question_gen', { chapter_id, section_id, section_text, count, types })`.
   `section_text` is extracted from the closest `<article>` or `<section>` ancestor's
   `textContent` (the rendered chapter section). Falls back to the full chapter article if
   no section context.
2. Poll `aiw-client.getRunStatus(run_id)` every 2 seconds until `status === 'completed'`.
   Show a spinner during polling. On timeout (60s), show an error.
3. On completion: extract `result.artifact.questions` from the run status response.
   POST to `/api/questions/bulk` with the questions + source_run_id + chapter_id.
4. On success: show a "N questions added" confirmation message. Dismiss after 3s.
5. On any error (`workflow_failed`, `validation_failed`, `adapter_unreachable`): show a
   brief inline error and re-enable the form.

**MCP client helpers (`src/lib/aiw-client.ts`):**

```ts
const MCP_URL = 'http://localhost:8080/mcp';

export async function runWorkflow(
  workflow_id: string,
  inputs: Record<string, unknown>,
  run_id?: string,
): Promise<{ run_id: string; status: string }> {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'run_workflow',
      params: { payload: { workflow_id, inputs, run_id } },
    }),
  });
  if (!res.ok) throw new McpError('adapter_unreachable');
  const json = await res.json();
  if (json.error) throw new McpError('workflow_failed', json.error.message);
  return json.result;
}

export async function getRunStatus(run_id: string): Promise<RunStatus> { ... }
```

Note the `params: { payload: { ... } }` wrapper — this is FastMCP's MCP wire shape
(documented in writing-a-workflow.md §Running your workflow → MCP). Without the `payload`
wrapper, FastMCP rejects the call with a schema-validation error (smoke finding #3).

**Error types:**
```ts
export type McpErrorKind = 'adapter_unreachable' | 'workflow_failed' | 'validation_failed';
```

**Component:** `src/components/questions/QuestionGenButton.tsx` — a React client island.
Renders the button + inline form + spinner + status message. Receives `chapterId` and
`sectionId` as props from the Astro template.

## Deliverables

1. **`src/lib/aiw-client.ts`** — `runWorkflow`, `getRunStatus`, `McpError` class.
2. **`src/components/questions/QuestionGenButton.tsx`** — React island.
3. **Wire into chapter lecture route** (`src/pages/lectures/[id].astro` or the lectures
   template — wherever the right rail renders): mount `<QuestionGenButton>` inside a
   `data-interactive-only` container. Each section heading's block should have a button;
   simpler fallback = one button for the whole chapter.
4. **CHANGELOG entry.**

## Acceptance criteria

- [ ] **AC-1.** `src/lib/aiw-client.ts` exports `runWorkflow` and `getRunStatus` with the
  `payload` wrapper in the MCP call body.
- [ ] **AC-2.** `src/components/questions/QuestionGenButton.tsx` exists and is a valid
  React component (no TS errors: `npm run build` exits 0 with the file present).
- [ ] **AC-3 (smoke — non-inferential).** Auditor starts dev server + aiw-mcp, navigates
  to a chapter page in interactive mode, and confirms the "Generate questions" button is
  visible in the right rail (screenshot + logged `mode === 'interactive'` in console).
- [ ] **AC-4.** Button is not rendered in static mode (auditor checks with aiw-mcp stopped).
- [ ] **AC-5.** The form's `types` checkboxes render mc, short, llm_graded, code.
- [ ] **AC-6.** On submit, a spinner/loading state is visible (auditor observes or
  confirms via DOM inspection: spinner element present during polling).
- [ ] **AC-7.** MCP call body uses `params: { payload: { workflow_id, inputs } }` (auditor
  reads the source in `aiw-client.ts`; this is a content check, not a runtime check —
  confirmed against the unblock smoke documentation).
- [ ] **AC-8.** On successful bulk insert, a "N questions added" message renders.
- [ ] **AC-9.** `npm run build` exits 0.
- [ ] **AC-10.** CHANGELOG has an M4 T07 entry.

## Notes

- T07 does NOT need to render questions or enable submission — that is M5 (review loop UI).
  T07's job is generation and insertion only.
- The `section_text` extraction: use `document.querySelector('article')?.textContent ?? ''`
  as the fallback. For per-section granularity, a future T07 cycle 2 can add section anchor
  tracking; M4 accepts chapter-level text.
- The `getRunStatus` response shape: the framework returns `RunWorkflowOutput` with
  `status` ('pending' | 'completed' | 'failed'), `artifact` (the terminal state field when
  completed), `error` (when failed). Poll until `status !== 'pending'`.
- If aiw-mcp is not reachable when the form is submitted: surface the error inline
  ("Local backend not available") and re-enable the form immediately.
- React island: `client:load` directive in the Astro template. No server-side fetch needed.
- The `data-interactive-only` hide rule (from M3 T5) uses
  `[data-interactive-only] { display: none }` in static mode and
  `[data-mode="interactive"] [data-interactive-only] { display: initial }` in interactive
  mode. Wrap the QuestionGenButton mount point in a `data-interactive-only` div.
