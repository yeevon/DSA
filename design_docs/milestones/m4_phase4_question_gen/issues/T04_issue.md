# T04 — aiw-mcp launch script + mode.ts liveness probe — Audit Issues

**Source task:** [../tasks/T04_launch_and_mode.md](../tasks/T04_launch_and_mode.md)
**Audited on:** 2026-05-02 (re-audited 2026-05-02 after HIGH-1 fix)
**Audit scope:** `scripts/aiw-mcp.sh` (new), `src/lib/mode.ts` (probe rewrite), `CHANGELOG.md` entry, M4 README status-surface check, AC-4 live smoke (start aiw-mcp + POST `/mcp`), AC-8 build gate (sandbox-blocked, see MEDIUM-1). Re-audit cycle re-verified the M4 README "Done when" checkbox flip and confirmed the LOW-2 `/health` substring rationale.
**Status:** ✅ PASS — HIGH-1 resolved 2026-05-02 (M4 README line 41 flipped to `[x]` with T04 citation on line 46). LOW-2 reclassified as INFORMATIONAL / RESOLVED (line-16 comment is correct rationale; line-30 `/api/health` is the orthogonal state-service probe — both intentional). One MEDIUM (AC-8 sandbox-blocked build gate) carries forward as host responsibility before next deploy. AC-4 live smoke evidence cited from cycle 1.

## Design-drift check

Cross-referenced against `CLAUDE.md` LBD-1..15, `design_docs/architecture.md`, the M4 milestone README, and the saved memory rules.

- **LBD-1 (static-by-default deploy).** `src/lib/mode.ts` is browser-side TypeScript executed in the user's browser; the `http://localhost:8080/mcp` literal must end up in `dist/` (the browser is the caller). That's not an LBD-1 violation — the violation pattern is shipping a *backend* into `dist/`, not shipping a client-side string that names a localhost adapter. The static deploy correctly degrades to `mode = 'static'` when no local adapter answers. **No drift.** *(Forward note: when the host runs `npm run build`, the rebuilt `dist/client/_astro/mode.*.js` will replace the stale chunk that still references `/health` — see LOW-2.)*
- **LBD-2 (two-process boundary).** The launch script invokes `uvx --from jmdl-ai-workflows aiw-mcp` — exactly the sibling-process pattern ADR-0001 + architecture.md §3 specify. `AIW_EXTRA_WORKFLOW_MODULES` registers cs-300's modules into the framework; no fork, no monkey-patch. **No drift.**
- **LBD-3 (pandoc + Lua filter pipeline).** N/A — no content path change.
- **LBD-4 (reference-solution leakage).** N/A — no API handler touched in this task.
- **LBD-5 (no sandboxing of code execution).** N/A.
- **LBD-6 / LBD-7 / LBD-8 / LBD-9.** N/A — no chapter, `coding_practice/`, or Jekyll touch.
- **LBD-10 (status-surface 4-way agreement).** **RESOLVED 2026-05-02 (re-audit).** All four surfaces now agree: per-task spec ✅ done 2026-05-02, M4 README header line 4 (`T04 ✅ 2026-05-02`), and the previously-stale "Done when" checkbox at M4 README line 41 has been flipped to `- [x] \`detectMode()\` reaches \`aiw-mcp\` when running locally —` with the citation `M4 T04 ✅ 2026-05-02` appended at line 46 of the same bullet. Re-audit confirmed via direct read of `design_docs/milestones/m4_phase4_question_gen/README.md` lines 41–46. (The earlier `[ ]` finding documented in HIGH-1 below; left in the file as audit trail.) **No drift remaining.**
- **LBD-11 (non-inferential verification for code).** Honoured — task spec named the AC-4 live smoke, Auditor reran it, output cited (Gate summary). AC-8 build gate is sandbox-blocked; documented as MEDIUM rather than masked.
- **LBD-12 / LBD-13 / LBD-14.** N/A — no cross-chapter refs, no out-of-order phase touch, no toolchain pin change.
- **LBD-15 (sandbox vs host git policy).** Audit performed read-only on `design_branch`; no pushes, no `main` touches, no remote ops. **No drift.**
- **`nice_to_have.md` boundary.** No items adopted from the parking lot. Both deliverables were called out by the M4 README and the T04 spec.
- **Memory rules.** No conflict — `feedback_aiw_uvx_oneshot.md` ("test jmdl-ai-workflows via `uvx` one-shot") matches the script's `uvx --from jmdl-ai-workflows aiw-mcp` invocation exactly; no `pip install` or `uv tool install` used.

**Verdict on Phase 1:** No architectural drift. HIGH-1 (status-surface drift, LBD-10) resolved on re-audit 2026-05-02.

## AC grading

| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |
| AC-1 — `scripts/aiw-mcp.sh` exists, executable | MET | `ls -la` → `-rwxr-xr-x 1 node node 605 May 2 09:21 scripts/aiw-mcp.sh` | exec bits set on owner/group/other. |
| AC-2 — `REPO_ROOT` from `${BASH_SOURCE[0]}` | MET | `scripts/aiw-mcp.sh:7` → `REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"` | No hardcoded path; `PYTHONPATH="$REPO_ROOT"` exports it on line 12. |
| AC-3 — both modules in `AIW_EXTRA_WORKFLOW_MODULES` | MET | `scripts/aiw-mcp.sh:13` → `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade` | Comma-separated, no whitespace, both modules present. |
| AC-4 — live smoke: POST `/mcp` returns non-empty JSON | MET (cycle 1 evidence; not re-run on re-audit) | See **Gate summary** row "AC-4 smoke" (cycle 1) — HTTP 200, body `event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26","capabilities":{...},"serverInfo":{"name":"ai-workflows","version":"3.2.4"}}}`. | Server log confirms `Uvicorn running on http://127.0.0.1:8080` + transport `http` on `/mcp`. Cycle-1 smoke is dispositive; re-audit did not re-run (no source change since cycle 1). |
| AC-5 — `mode.ts` no longer references `/health` | MET | `grep -n /health src/lib/mode.ts` → 2 matches: line 16 (rationale comment explaining the fix — *intentional*) and line 30 (`/api/health`, the state-service health endpoint — *intentional, orthogonal to the adapter probe*). Re-audit confirmed both substrings are correct: see **LOW-2 (RESOLVED)**. | Adapter probe no longer *uses* `/health`. Both remaining matches are intentional and required. |
| AC-6 — POST to `MCP_ENDPOINT` with JSON-RPC body | MET | `src/lib/mode.ts:20` defines `MCP_ENDPOINT = ADAPTER_URL + '/mcp'`; lines 25–29 issue `fetch(MCP_ENDPOINT, { method: 'POST', headers: {...}, body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }) })`. | `.then(() => true).catch(() => false)` — any HTTP response (including 4xx) ⇒ alive, network error ⇒ false, matching the spec's "any response means alive" intent. |
| AC-7 — stale "/health is a placeholder" forward-work comment removed | MET | `grep -n placeholder src/lib/mode.ts` → no matches. | The replacement comment at lines 16–19 explains the new probe semantics; "placeholder" language is gone. |
| AC-8 — `npm run build` exits 0 | NOT RUN — sandbox blocked (carry-over) | `node_modules` is root-owned in the audit sandbox; `npm ci` would EACCES. Sandbox constraint unchanged on re-audit. TypeScript change is type-safe by inspection (`Promise<boolean>` shape preserved across both fetch arms in `Promise.all`; no new imports; no API surface change). Host must verify with `npm ci && npm run build`. | See **MEDIUM-1** — graded MEDIUM, carry-over on T04 spec status line. |
| AC-9 — CHANGELOG has M4 T04 entry | MET | `CHANGELOG.md:17–33` under `## 2026-05-02`: `**Added** **M4 T04 — scripts/aiw-mcp.sh launch script + mode.ts probe fix**` followed by deliverable summary, AC-4 smoke note, AC-8 sandbox carry-over, and `Dep audit: skipped — no manifest changes`. | Format matches sibling T01/T02/T03 entries. |
| LBD-10 status surfaces (audit-level criterion) | MET (resolved on re-audit) | M4 README line 41 `[ ] → [x]` with citation `M4 T04 ✅ 2026-05-02` at line 46. Per-task spec ✅ done 2026-05-02. M4 README header line 4 lists `T04 ✅ 2026-05-02`. tasks/README.md row N/A (no per-task index file in M4). | Four-way agreement now holds. See HIGH-1 (now RESOLVED). |

## 🔴 HIGH — LBD-10 status-surface 4-way agreement (one disagreeing surface) — ✅ RESOLVED 2026-05-02 (re-audit)

**Original issue (cycle 1).** The M4 milestone README's "Done when" list at `design_docs/milestones/m4_phase4_question_gen/README.md:41-45` still had the bullet `[ ] detectMode() reaches aiw-mcp when running locally — … Probe path … confirmed against FastMCP's actual liveness surface.` T04 directly satisfies this bullet — the AC-4 live smoke confirmed the probe path lands on FastMCP's `/mcp` endpoint. Per LBD-10, the four status surfaces must flip together: per-task spec ✅ (line 3), tasks/README.md (N/A — none in M4), milestone README task-status header line 4 already flipped (`T04 ✅ 2026-05-02`), but the satisfied "Done when" checkbox did not flip.

**Resolution (re-audit 2026-05-02).** Verified directly against `design_docs/milestones/m4_phase4_question_gen/README.md`:

- Line 41: `- [x] \`detectMode()\` reaches \`aiw-mcp\` when running locally —`
- Line 46: `      any HTTP response = alive; M4 T04 ✅ 2026-05-02).`

The checkbox is flipped to `[x]` with the T04 citation parenthetical inlined into the bullet. All four status surfaces now agree; LBD-10 is satisfied. **No further action.**

## 🟡 MEDIUM — AC-8 build gate not run (sandbox infrastructure gap)

**Issue.** `npm run build` (AC-8) was not executed because `node_modules` is root-owned in the audit sandbox and `npm ci` returns EACCES. Per the audit invocation, this is graded MEDIUM rather than HIGH because the TypeScript change is trivially type-safe by inspection: the new fetch arm in `Promise.all` returns `Promise<boolean>` (`.then(() => true).catch(() => false)`), exactly matching the destructured `[adapter, state]` types and preserving the `&&` reduction at line 32. No new imports, no new exports, no public API change. The risk of a hidden type or build error is essentially zero.

The deferred verification (host-side `npm ci && npm run build`) is also the natural moment to address LOW-2: the rebuilt `dist/client/_astro/mode.*.js` will replace the currently-stale chunk that still emits `c+"/health"`.

**Action / Recommendation.** Host runs the following before the next deploy:

```bash
npm ci
npm run build
grep -rn "localhost:8080\|/mcp\|/health" dist/client/_astro/mode.*.js
```

Expected: build exits 0; the rebuilt mode chunk references `/mcp` (and `/api/health` for the state service), not `/health` for the adapter. If `npm run build` fails on the host, that flips this finding to HIGH retroactively and `src/lib/mode.ts` carries forward into a remediation task. Carry-over already documented in the T04 spec status line; no separate forward-deferral file needed.

## 🟢 LOW — `mode.ts` comment retains the substring `/health` — ℹ️ INFORMATIONAL / RESOLVED 2026-05-02 (re-audit)

**Re-audit verification.** Re-read `src/lib/mode.ts` line-by-line. Confirmed both `/health` substrings are intentional and correct:

- **Line 16** — `// FastMCP's streamable-HTTP transport binds at /mcp, not /health.` This is the **rationale comment** explaining *why* the probe was changed. The "not /health" wording is the load-bearing teaching content — it tells a future reader / greppper exactly which wrong path the fix moved away from. Removing the substring would weaken the audit trail.
- **Line 30** — `fetch('/api/health').then((r) => r.ok)`. This is the **state-service** health endpoint (M3 T3, predates T04, unchanged). It is **orthogonal** to the adapter probe, intentional, and required for `mode === 'interactive'` to gate on both surfaces being alive (per architecture.md §4 + the file's M3-T5 header comment at lines 5–6: "Returns 'interactive' iff BOTH the local aiw-mcp server (M4) AND the local state service (T3 health route) respond OK").

AC-5's spec intent — "the adapter probe in `detectMode()` no longer issues a request to `/health`" — is satisfied. The two surviving substrings are **not** AC violations; they are correct code + correct documentation. **No action required.** Reclassified from LOW (cosmetic option-set) to INFORMATIONAL / RESOLVED on re-audit.

## Additions beyond spec — audited and justified

None. Both deliverables (A: launch script, B: mode.ts probe fix) match the spec text line-for-line. CHANGELOG entry (Deliverable C) follows the dated-section + tagged-bullet format of sibling T01/T02/T03 entries. No drive-by edits, no scope creep.

## Gate summary

| Gate | Command | Result | Notes |
| -- | ------- | ------ | ----- |
| executable bit | `ls -la scripts/aiw-mcp.sh` | PASS | `-rwxr-xr-x 1 node node 605 May 2 09:21`. |
| script source | `grep -n REPO_ROOT\|BASH_SOURCE\|AIW_EXTRA scripts/aiw-mcp.sh` | PASS | AC-2 + AC-3 confirmed. |
| mode.ts probe source | `grep -n /health\|placeholder\|MCP_ENDPOINT\|jsonrpc src/lib/mode.ts` | PASS | `placeholder` 0 hits; `MCP_ENDPOINT` + `jsonrpc` present; `/health` substring present in a comment + in `/api/health` (orthogonal) — see LOW-2. |
| AC-4 smoke (live) | `bash scripts/aiw-mcp.sh &` then `curl -s -X POST http://127.0.0.1:8080/mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data-binary @payload` | PASS | HTTP 200; body `event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26","capabilities":{"experimental":{},"logging":{},"prompts":{"listChanged":true},"resources":{"subscribe":false,"listChanged":true},"tools":{"listChanged":true},"extensions":{"io.modelcontextprotocol/ui":{}}},"serverInfo":{"name":"ai-workflows","version":"3.2.4"}}}`. Server log confirmed `FastMCP 3.2.4 / ai-workflows 3.2.4` on `http://127.0.0.1:8080/mcp` with `--cors-origin http://localhost:4321` and `--transport http`. Server killed cleanly post-smoke. |
| `npm run check` | `npm run check` | NOT RUN — sandbox `node_modules` root-owned (EACCES on `npm ci`). | Same blocker as AC-8; host responsibility. |
| `npm run build` (AC-8) | `npm run build` | NOT RUN — sandbox `node_modules` root-owned (EACCES on `npm ci`). | TypeScript change is type-safe by inspection: same `Promise<boolean>` shape in `Promise.all`, no new imports, no API surface change. Host must verify: `npm ci && npm run build`. Graded MEDIUM (sandbox infra gap, not code defect). See MEDIUM-1. |
| `dist/` localhost-leak grep (informational) | `grep -rn "localhost:8080\|/health\|/mcp" dist/client/_astro/mode.*.js` | INFO | Current `dist/` chunk `mode.CxjE8wux.js` still encodes the **old** `/health` adapter probe (predates this task). Expected — `dist/` is regenerated on the next host build. Not a regression of T04; flagged so MEDIUM-1's host build verification also re-checks the rebuilt chunk. |
| LBD-10 surface check (cycle 1) | manual cross-read of T04 spec, M4 README header, M4 README "Done when" | FAIL — 1 surface stale | Per-task spec ✅ done 2026-05-02, M4 header line 4 lists `T04 ✅ 2026-05-02`, but M4 "Done when" checkbox at line 41 (`detectMode() reaches aiw-mcp when running locally`) still `[ ]`. See HIGH-1 — RESOLVED on re-audit. |
| LBD-10 surface check (re-audit 2026-05-02) | re-read `m4_phase4_question_gen/README.md:41-46` | PASS | Line 41 now `- [x] \`detectMode()\` reaches \`aiw-mcp\` when running locally —`; line 46 carries citation `M4 T04 ✅ 2026-05-02`. All four surfaces in agreement. |

## Issue log — cross-task follow-up

- **M4-T04-ISS-01 (HIGH) — ✅ RESOLVED 2026-05-02 (re-audit).** LBD-10 status-surface drift on M4 README "Done when" line 41. M4 README line 41 flipped to `[x]` with citation `M4 T04 ✅ 2026-05-02` at line 46. No further action.
- **M4-T04-ISS-02 (MEDIUM) — open carry-over.** AC-8 `npm run build` not run in sandbox. Owner: host build verification before next deploy. Action: `npm ci && npm run build` per MEDIUM-1. Carry-over already recorded on T04 spec status line.
- **M4-T04-ISS-03 (LOW) — ℹ️ INFORMATIONAL / RESOLVED 2026-05-02 (re-audit).** `mode.ts` line-16 comment is correct rationale; line-30 `/api/health` is the orthogonal state-service probe (intentional). No action required.

## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `scripts/aiw-mcp.sh` (new), `src/lib/mode.ts` (modified), `dist/client/_astro/mode.CxjE8wux.js` (stale pre-T04 build artifact, inspected for leakage), `.github/workflows/deploy.yml` (deploy surface check)
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical

None.

### High

None.

### Advisory

- **`http://localhost:8080` in `dist/client` build artifact** — The stale `dist/client/_astro/mode.CxjE8wux.js` chunk (pre-T04 build) encodes `http://localhost:8080` as a client-side string for the mode-detection probe. This is expected and acceptable: the string is a browser-side probe target, not a backend URL shipped to users. The GH Pages static deploy degrades cleanly to `mode = 'static'` when no local adapter answers. The `http://localhost:8080/mcp` literal that the rebuilt chunk will contain (after the host runs `npm run build`) is identical in nature. No leak pattern under the cs-300 threat model. Confirmed: `dist/server/` (which contains `REPO_ROOT`-relative path construction from the Astro Node adapter) is explicitly excluded from the GH Pages upload (`path: ./dist/client` in `deploy.yml` line 84). — **Action:** tracking only; resolves automatically when host runs `npm run build` per MEDIUM-1.

- **`AIW_CORS_ORIGIN` env var passed to `--cors-origin` flag** — `CORS_ORIGIN` is double-quoted (`"$CORS_ORIGIN"`) in the `exec env ... uvx` call, so no word-splitting occurs. The value reaches `aiw-mcp` as a single argv element, not a shell-interpolated fragment. If a user sets `AIW_CORS_ORIGIN` to a URL containing spaces or shell metacharacters, the double-quoting prevents injection into the shell command; the uvx process receives the literal string. Single-user local environment: no untrusted party controls this env var. — **Action:** no fix needed; behaviour is correct.

### Out-of-scope concerns surfaced and dismissed

- **No secrets, API keys, or credentials in `aiw-mcp.sh`** — confirmed. The script sets `PYTHONPATH` (a local filesystem path, not a secret), `AIW_EXTRA_WORKFLOW_MODULES` (module path literals), and forwards `PORT` / `CORS_ORIGIN` from env. No cloud keys, tokens, or credentials present.
- **`$PORT` injection** — `PORT` resolves to a numeric string (`8080` by default). Double-quoted. Passed as a positional argument to `--port`. No shell evaluation occurs after assignment; `set -euo pipefail` prevents silent empty-variable expansion. Not an injection risk in the single-user local model.
- **Command injection via `AIW_PORT` / `AIW_CORS_ORIGIN`** — values are read from env into bash variables and immediately double-quoted when passed to `exec env ... uvx`. The `exec` builtin replaces the shell process; there is no further shell evaluation of the argument list. A value like `; rm -rf /` in `AIW_CORS_ORIGIN` would be passed literally to `aiw-mcp` as a malformed CORS origin string, not executed. Self-injection by the user into their own process is out of scope per LBD-5 rationale.
- **`mode.ts` probe body injection** — the JSON-RPC body is a fixed object literal (`{ jsonrpc: '2.0', id: 0, method: 'ping', params: {} }`). No user-controlled input. No template injection surface.
- **Annotation `innerHTML` in `AnnotationsPane.astro`** — `list.innerHTML` is set only to the static literal `'<li class="empty">(none yet)</li>'` (empty state) or to `''` (reset before DOM API append). Annotation text is rendered exclusively via `textContent` (line 292 of `AnnotationsPane.astro`). Not an XSS surface. Out of scope for this task's changeset; confirmed clean as a secondary check.
- **Missing auth / rate-limiting on the MCP endpoint** — out of scope per cs-300 threat model (single-user local, no untrusted network clients).
- **TLS on `http://localhost:8080`** — loopback only; out of scope per threat model.

### Verdict

`SHIP` — no blocking security concerns. The stale `dist/` chunk is pre-T04 and resolves on next host build. The shell script's variable handling is correct. No secrets, no injection surface, no reference-solution leakage path in this changeset.

## Dependency audit

Dep audit: skipped — no manifest changes. (`scripts/aiw-mcp.sh` invokes `uvx --from jmdl-ai-workflows aiw-mcp` per-shot per the saved `feedback_aiw_uvx_oneshot.md` convention; no `pyproject.toml` / `uv.lock` / `package.json` / `package-lock.json` / `.nvmrc` / `.pandoc-version` / Docker manifest delta.)

## Deferred to nice_to_have

None — neither finding maps to an item in `design_docs/nice_to_have.md`.

## Propagation status

No forward-deferrals to future task specs. MEDIUM-1 (AC-8 host build) is recorded on T04's own spec status line (`AC-8 npm build carry-over: verify on host…`) and does not need a separate carry-over append on a later task — the build verification is a host-only operation, not a Builder deliverable. If the host build fails, MEDIUM-1 escalates to HIGH and a remediation task is opened against `src/lib/mode.ts` at that point.
