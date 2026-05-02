---
model: claude-sonnet-4-6
thinking: medium
---

# /implement

Lightweight single-pass implementation for a small change in cs-300: $ARGUMENTS

Use this command when the change is small, scoped, and unambiguous. For larger or multi-cycle work, use [`/clean-implement`](clean-implement.md) or [`/auto-implement`](auto-implement.md).

---

## Inputs

- task or change request
- relevant files
- verification command, if known (otherwise pick from `CLAUDE.md` § Verification commands)

---

## Procedure

1. Read [`/CLAUDE.md`](../../CLAUDE.md).
2. Identify the smallest safe change.
3. Respect scope and architecture boundaries (LBD-1..14, layer order).
4. Implement only the requested behaviour.
5. Add or update tests / smokes when behaviour changes (LBD-11 for code).
6. Run the relevant verification (`npm run check`, the matching `scripts/*-smoke.mjs`, `pdflatex -halt-on-error`, `node scripts/build-content.mjs`, `npm run build`).
7. If the change touches a dep manifest, run `dependency-auditor` before reporting completion.
8. Update `CHANGELOG.md` per project conventions.
9. Report changed files and verification table.

---

## Boundaries

Do not use this command for:

- large, ambiguous work
- architecture-changing work (route to `architect` + ADR)
- release-affecting work (`dist/` changes, GH Pages workflow edits)
- multi-cycle work (use `/clean-implement` instead)
- chapter content augmentation (those need full /clean-implement with the 40-pp / bounded-additions checks)

If the work creeps into any of the above mid-implementation, stop and route to `/clean-implement`.

---

## Return

```text
verdict: <BUILT / BLOCKED / STOP-AND-ASK>
file: <repo-relative path to durable artifact, or "—">
section: —
```
