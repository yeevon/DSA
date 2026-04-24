# T1 — Hosting decision: Astro server vs client SQLite — Audit Issues

**Source task:** [../tasks/T1_hosting_decision.md](../tasks/T1_hosting_decision.md)
**Audited on:** 2026-04-24
**Audit scope:** New file (`design_docs/adr/0001_state_service_hosting.md` — 91 lines, first ADR in repo); modified files (`design_docs/architecture.md` §5 row 2, `design_docs/milestones/m3_phase3_state_service/README.md` "Open decisions resolved here", `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §4 (Local-vs-public mode + Path A/B descriptions), [`../../../../CLAUDE.md`](../../../../CLAUDE.md) (ADR conventions, `created when needed` rule for `design_docs/adr/`).
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None. ADR is doc-only.                                                                                |
| Jekyll polish                            | ✅ n/a | No Jekyll surface touched (Jekyll deleted in M2 T8).                                                  |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T1 confirms architecture.md's leaning. No M4+ surfaces touched.                                       |
| `nice_to_have.md` boundary               | ✅ ok  | UI/UX nice_to_have entry not adopted. T1's hosting choice doesn't surface chrome decisions.           |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                          | Status | Notes |
|---|-----------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `design_docs/adr/0001_state_service_hosting.md` exists; matches the canonical ADR template (Context / Options / Decision / Consequences sections all present). | ✅ PASS | 91 lines. All 4 canonical headings present (`## Context`, `## Options considered`, `## Decision`, `## Consequences`). Plus optional sections `## Implementation references` + `## Open questions deferred to later tasks` for forward signal. |
| 2 | `architecture.md` §5 row 2 is marked **resolved** with the chosen path + date + ADR link.                                                     | ✅ PASS | Row now reads: `**resolved: Path A (Astro server)** — see [ADR 0001](adr/0001_state_service_hosting.md) / ✅ 2026-04-24`. Matches the format M1 T2's HYBRID resolution used (§5 row 1). |
| 3 | `m3_phase3_state_service/README.md` "Open decisions resolved here" no longer says "Pick Path A or Path B"; instead cites the ADR.            | ✅ PASS | Section now reads: "State service hosting (architecture.md §5 row 2) — ✅ Path A (Astro server) confirmed 2026-04-24 in ADR 0001. M3 T1 closed; T2/T3/T5 build against Path A." |
| 4 | Auditor reads the ADR and confirms the Decision section gives a single answer (not "leaning toward A").                                       | ✅ PASS | Decision section opens with bold **Path A — Astro server.** plus a one-paragraph crisp restatement of the implementation shape (better-sqlite3 + Drizzle + Astro API routes + hybrid output). No hedging language. |

All 4 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M3-T01-ISS-01 — ADR captures two open questions deferred to later tasks — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

The ADR's "Open questions deferred to later tasks" section captures two items the audit had previously flagged as F4 + F6 in the M3 task-breakout audit:

- `ADAPTER_URL` port pin (M3 T5).
- `bun:sqlite` runtime fallback (M3 T2 if `better-sqlite3` install breaks).

Both are correctly out of T1 scope. Deferring them to the consuming task spec rather than expanding the ADR matches CLAUDE.md's "ADR captures the decision, not the implementation."

**Action / Recommendation:** none. T5 documents the port pick; T2 documents the runtime install if it surprises.

## Additions beyond spec — audited and justified

- **ADR has an "Open questions deferred to later tasks" footer** capturing forward signal. Spec didn't require this section; included because both items (`ADAPTER_URL` port + `bun:sqlite` fallback) had been flagged in the M3 task-breakout audit and benefit from being co-located with the hosting decision. Cheap.
- **CHANGELOG `Decided` entry** under `## 2026-04-24` recording the call. CLAUDE.md "Changelog discipline" non-negotiable.
- **ADR notes that `design_docs/adr/` is the first ADR in the repo** (per CLAUDE.md "created when needed"). Future ADRs use sequential numbering (0002, 0003, …).

## Verification summary

| Check                                                                                | Result |
| ------------------------------------------------------------------------------------ | ------ |
| `design_docs/adr/0001_state_service_hosting.md` exists                              | ✅ 91 lines |
| ADR has all 4 canonical sections (Context / Options / Decision / Consequences)       | ✅ |
| ADR Decision section is a single, unambiguous answer                                 | ✅ "Path A — Astro server." |
| `architecture.md` §5 row 2 marked resolved with ADR link + date                      | ✅ |
| M3 README "Open decisions resolved here" cites the ADR + closes the decision         | ✅ |
| CHANGELOG entry under `## 2026-04-24` references M3 T1 + the ADR                     | ✅ |
| `design_docs/adr/` directory created (first ADR per CLAUDE.md "created when needed") | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status       | Owner / next touch point                                  |
| ------------- | --------- | ------------ | --------------------------------------------------------- |
| M3-T01-ISS-01 | 🟢 LOW    | ✅ ACCEPTED  | T2 (`bun:sqlite` if needed) + T5 (`ADAPTER_URL` port)     |

## Propagation status

T1 unblocks T2, T3, T5. ADR's "Implementation references" section names the downstream task IDs explicitly so future audits can trace the contract. No carry-over needed in those task specs — they already reference the ADR by way of architecture.md §5's resolved row.
