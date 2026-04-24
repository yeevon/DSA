# T1 — Hosting decision: Astro server vs client SQLite

**Status:** todo
**Depends on:** —
**Blocks:** T2, T3, T5 (everything downstream depends on the call)

## Why

[Architecture.md §4](../../../architecture.md) "State service hosting" defers a binary choice:

- **Path A — Astro server.** Run `astro dev` or `astro preview` locally; SQLite owned by Astro API routes under `src/pages/api/`. Two processes in local mode (Astro + FastMCP adapter).
- **Path B — Client-side SQLite.** `@sqlite.org/sqlite-wasm` + OPFS for persistence. One process. WASM bundle ~2 MB, schema migrations run in browser, slightly awkward ops.

The architecture's lean is **A**. T1 confirms that lean (or pivots) and writes the call into an ADR + amendment in architecture.md §5, so the rest of M3 builds against a settled contract.

## Deliverable

- `design_docs/adr/0001_state_service_hosting.md` — short ADR (~50 lines): context, options, decision, consequences. Per [CLAUDE.md](../../../../CLAUDE.md#non-negotiables) ADR conventions.
- `design_docs/architecture.md` §5 row 2 (`State service: Astro server vs client SQLite`) flipped from `Phase 3 / lean: Astro server / decide by: Phase 3 start` → **resolved: Path A** with date + ADR link.
- `m3_phase3_state_service/README.md` "Open decisions resolved here" updated.

## Steps

1. Re-read architecture.md §4 + §5 row 2. Spend 10 minutes considering whether anything has changed since the architecture was written that would shift the lean (e.g., if a multi-user use case has emerged — unlikely).
2. Write the ADR following the canonical template (Context → Options Considered → Decision → Consequences → Trade-offs accepted). Keep it focused on the hosting call only — schema choice (Drizzle), seeding mechanics, mode-detection wiring all belong in their respective task specs.
3. Edit architecture.md §5 row 2 → resolved.
4. Edit M3 README's "Open decisions resolved here" section.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `design_docs/adr/0001_state_service_hosting.md` exists; matches the canonical ADR template (Context / Options / Decision / Consequences sections all present).
- [ ] `architecture.md` §5 row 2 is marked **resolved** with the chosen path + date + ADR link.
- [ ] `m3_phase3_state_service/README.md` "Open decisions resolved here" no longer says "Pick Path A or Path B"; instead cites the ADR.
- [ ] **Auditor reads the ADR** and confirms the Decision section gives a single answer (not "leaning toward A"). Decisions are decisions.

## Notes

- Path A is the leaning per architecture; if the ADR comes out Path B, that's a real pivot and T2/T3 specs need updating before they start.
- ADR directory may not exist yet — create `design_docs/adr/` if needed (CLAUDE.md says "created when needed").
- Path B pivot would also mean the M3 README's "State service runs as Astro API routes under `src/pages/api/`" Done-when bullet needs revision.
