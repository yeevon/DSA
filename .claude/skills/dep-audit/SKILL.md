---
name: dep-audit
description: Run dep-manifest change-detection and dist/ secret-scan for cs-300. Use when package.json, package-lock.json, pyproject.toml, uv.lock, or other manifests change, or before pushing main.
allowed-tools: Bash
---

# dep-audit

The dep-audit Skill runs dep-manifest change-detection on any commit that touches a
manifest, and the `dist/` secret-scan that must run before any commit that triggers the
GH Pages deploy. Helper file `runbook.md` carries assertion lists, error catalog, and
edge cases.

## When to use

- When any of these change in a commit (dep-audit gate per CLAUDE.md non-negotiable):
  `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, `requirements*.txt`,
  `.nvmrc`, `.pandoc-version`, `Dockerfile`, `docker-compose.yml`.
- Before merging to `main` (the GH Pages trigger): scan `dist/` for secrets / local
  paths / Ollama URLs / `127.0.0.1`.
- When the user asks "is this dep new?" or "audit the lockfile bump".

## When NOT to use

- Full threat-model review of a code change: use `security-reviewer` agent instead.
- For ad-hoc reviewer feedback on a diff: use `/sweep` instead.
- For internal dep updates that don't change manifests (no diff against lockfile/manifest)
  — the gate doesn't fire.

## Procedure

1. **Manifest change-detection (per-commit):**
   - `git diff <pre-task-commit>..HEAD -- package.json package-lock.json pyproject.toml
     uv.lock requirements*.txt .nvmrc .pandoc-version Dockerfile docker-compose.yml`
     — see `runbook.md` §Manifest-detection.
   - On any non-zero diff, the dep-audit gate fires; spawn the `dependency-auditor`
     agent for the full audit.

2. **Lockfile-diff inspection (on bump):**
   - For npm: `git diff <pre-task-commit>..HEAD -- package-lock.json` —
     see `runbook.md` §package-lock parsing.
   - For Python: `git diff <pre-task-commit>..HEAD -- uv.lock` — see `runbook.md`
     §uv.lock parsing.

3. **`dist/` secret-scan (pre-merge-to-main):**
   - Run `npm run build` to ensure `dist/` is current.
   - Scan with the patterns in `runbook.md` §dist-scan.
   - **HALT** on any hit: `.env`-derived secrets, local filesystem paths
     (`/home/papa-jochy/`, `/Users/`), Ollama URLs, `127.0.0.1` references in user-facing
     output.

## Helper files

- `runbook.md` — manifest-detection regex, package-lock + uv.lock parsing patterns,
  `dist/` scan denylist, edge cases.

## Pointers

- Threat model: `CLAUDE.md` §Threat model.
- Full dep-audit procedure: `.claude/agents/dependency-auditor.md`.
