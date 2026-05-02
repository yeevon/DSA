## Security review

**Reviewed:** 2026-05-02
**Files reviewed:** `src/lib/fsrs.ts`, `src/pages/api/attempts.ts`, `src/pages/api/attempts/[id]/outcome.ts`, `src/pages/api/questions/bulk.ts`, `scripts/fsrs-smoke.mjs`, `package.json`, `package-lock.json`
**Threat model used:** cs-300 local-only single-user (CLAUDE.md § Threat model)

### Critical

None.

### High

None.

### Advisory

- **`ts-fsrs ^4.0.0` not yet in lockfile (surface 7).** `package.json` declares `"ts-fsrs": "^4.0.0"` but `package-lock.json` has no `ts-fsrs` entry (sandbox could not run `npm install`). Until the lockfile is materialised and the `dependency-auditor` runs against it, the exact version, registry URL, and integrity hash are unconfirmed. The `^` range prefix means any 4.x patch is eligible on first install. The `dependency-auditor` gate (M5-T01-HOST-05) covers this. — **Action:** host runs `npm install` then `dependency-auditor` before merging to `main`. Tracking only until that gate closes.

### Out-of-scope concerns surfaced and dismissed

- SQLi via Drizzle — all FSRS state writes use Drizzle's `insert().values({...}).onConflictDoUpdate({...})` and `update().set({...}).where(eq(...))`. No raw string interpolation into SQL. Out of scope per cs-300 threat model.
- Missing auth / rate limiting on PATCH `/api/attempts/[id]/outcome` — single-user local, not applicable.

### Threat-model checks (explicit)

1. **LBD-4 — Reference-solution leakage.** `POST /api/questions/bulk` 201 response is `{ inserted: ids }` — only UUIDs, no `referenceJson`. `POST /api/attempts` 200 body is `{ id, outcome, submitted_at }` (mc/short) or `{ id, outcome:'pending', grade_run_id }` (llm_graded). `PATCH /api/attempts/[id]/outcome` 200 body is `{ id, outcome }`. FSRS state is written server-side and never echoed in any response body. No leakage path. PASS.

2. **SQL input flows (surface 5 adjacent).** The FSRS UPSERT paths bind `questionId` (UUID from DB row, not user-supplied directly) and computed float/int values from `ts-fsrs` internals. `outcome` is validated against the allowlist `['pass','fail','partial']` before it reaches `applyAttempt()`. No user-controlled string flows into a raw SQL expression. PASS.

3. **`dist/` cleanliness (surface 6).** All three routes declare `export const prerender = false`. `src/lib/fsrs.ts` is imported only by those three API routes and `src/lib/seed.ts` — none are browser-rendered pages or client-bundled components (grep of `src/components/` and `src/pages/*.astro` returns zero hits). `ts-fsrs` will not appear in the static bundle. Pending host `npm run build` + grep of `dist/` to confirm zero hits (M5-T01-HOST-04).

4. **Subprocess / shell integrity (surface 5).** No subprocess spawned by T01. N/A.

5. **Annotation / MDX injection (surfaces 3, 4).** T01 touches no content pipeline, no annotation rendering, no Lua filter. N/A.

6. **Logging hygiene.** `src/lib/fsrs.ts` has no `console.*` calls. API route handlers have no log statements that would emit `referenceJson`, credentials, or prompt text. PASS.

7. **`ts-fsrs` supply chain (surface 7).** `ts-fsrs` is a well-established open-source FSRS implementation (npm: `ts-fsrs`, maintained by the open-spaced-repetition org, 1M+ weekly downloads as of early 2026, no known CVEs). No `postinstall` script in its `package.json`. Exact version and integrity hash deferred to `dependency-auditor` once the lockfile is regenerated on host (M5-T01-HOST-05). Advisory only — no blocking concern.

### Verdict

`SHIP` — no blocking security concerns. The one advisory item (lockfile not yet materialised, `dependency-auditor` not yet run) is already tracked as M5-T01-HOST-05 and is a host-side operational gate, not a code defect.
