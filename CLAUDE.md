# CLAUDE.md — cs-300 conventions

Loaded into every Claude Code conversation. Defines what is load-bearing across this project.

Step-by-step procedures live in:

- [.claude/agents/](.claude/agents/) — subagent procedures.
- [.claude/commands/](.claude/commands/) — slash-command workflows.
- [.claude/skills/](.claude/skills/) — packaged project skills.

The `.claude/` tree is committed so the workflow is reproducible across sessions and machines. `settings.local.json` is the only file in there that should stay user-local — gitignore-and-commit is the policy if you fork. (Pre-2026-05-02 versions of this file claimed `.claude/` was gitignored; that claim was wrong and is removed.)

Shared rules every subagent must read are factored into:

- [.claude/agents/_common/non_negotiables.md](.claude/agents/_common/non_negotiables.md)
- [.claude/agents/_common/verification_discipline.md](.claude/agents/_common/verification_discipline.md)

Slash commands available:

- `/clean-tasks` — normalise / repair task specs before implementation.
- `/queue-pick` — select the next ready task from the roadmap.
- `/clean-implement` — Builder → Auditor loop with security gate, up to 10 cycles. **The default cs-300 implementation command.**
- `/auto-implement` — autonomous multi-cycle implementation under hard boundaries.
- `/autopilot` — `/queue-pick` followed by `/auto-implement`.
- `/implement` — lightweight single-pass implementation.
- `/audit` — standalone audit of an existing change.

Subagents available:

- `task-analyzer` — readiness check before implementation.
- `builder` — in-scope implementation only.
- `auditor` — design-drift, gate re-run, AC grading, status-surface check.
- `security-reviewer` — cs-300 threat-model review.
- `dependency-auditor` — supply-chain / install-time / CVE / lockfile review.
- `architect` — architecture / decision-record review.
- `roadmap-selector` — picks next ready task.
- `sr-dev` — senior-developer pass.
- `sr-sdet` — senior SDET / verification-quality pass.

When a skill or slash command says "follow Builder mode" or "follow Auditor mode," the conventions below plus the matching subagent prompt are what it means.

---

## Project profile

| Field | Value |
| --- | --- |
| Project name | `cs-300` |
| Project type | `COURSEWARE` (interactive notes site + local question-gen / review loop) |
| Primary language/runtime | TypeScript / Astro (Node 22) + Python 3.12 (cs300 workflow modules) + LaTeX (chapter source) |
| Source root | `src/` (Astro) · `chapters/ch_<N>/` (LaTeX content) · `cs300/workflows/` (Python) · `coding_practice/` (question-gen prompt corpus) |
| Test root | `scripts/*-smoke.mjs` and `scripts/functional-tests.py` (no formal test tree yet — per-task verification is the gate) |
| Documentation root | `design_docs/` |
| Default branch | `main` |
| Working branch | **Sandbox sessions:** `design_branch` only — never `main` (LBD-15). **Host sessions:** `main` is allowed for merges, pushes, pulls, tags. |
| Package/build tool | `npm` (Node 22 pinned in `.nvmrc`) · `uv` (Python via `pyproject.toml` / `uv.lock`) · `pandoc` 3.1.3 pinned in `.pandoc-version` |
| Release target | GitHub Pages — static `dist/` only |
| CI config | `.github/workflows/deploy.yml` |

---

## Grounding

Read before any task.

- [design_docs/architecture.md](design_docs/architecture.md) — architecture of record.
- [design_docs/roadmap_addenda.md](design_docs/roadmap_addenda.md) — operational roadmap (canonical for cs-300 work; the Drive doc id `1SJHI76hibJ6aJqvtMuJbE1dhzVLZlWcOpitofrziWC8` is historical only and not actively synced).
- [design_docs/milestones/README.md](design_docs/milestones/README.md) — operational milestone index + dependency graph.
- [design_docs/nice_to_have.md](design_docs/nice_to_have.md) — **deferred parking lot.** Out of scope by default; adoption requires an architecture.md update plus an ADR.
- [design_docs/adr/](design_docs/adr/) — architecture decision records.
- [design_docs/chapter_reviews/](design_docs/chapter_reviews/) — per-chapter Step-1 inventories + Step-2 gap reports.
- [design_docs/phase2_issues.md](design_docs/phase2_issues.md) — Phase-2 deferred items.

`agent_docs/long_running_pattern.md` defines the `plan.md` / `progress.md` carry-forward used when a task spans multiple cycles.

---

## Load-bearing decisions

Drift-check anchors for the Auditor. Violation severity is the default the Auditor applies absent a stronger spec-level reason.

| ID | Decision | Why it matters | Audit severity if violated |
| --- | --- | --- | --- |
| LBD-1 | **Static-by-default deploy.** Public deploy is `dist/` on GH Pages. No backend, no DB, no API routes ship in the public artifact. | Threat model + release surface depend on this. | HIGH |
| LBD-2 | **Two-process local runtime.** `aiw-mcp` (Python, jmdl-ai-workflows) + state service (Node, Astro API routes). Cross-language sibling processes per [ADR-0001](design_docs/adr/0001_state_service_hosting.md). No fork of jmdl-ai-workflows; cs-300 contributes workflow modules, not framework changes. | Architectural seam between content and dynamic surfaces. | HIGH |
| LBD-3 | **Pandoc + Lua filter is THE content pipeline.** One Lua filter ([scripts/pandoc-filter.lua](scripts/pandoc-filter.lua)), one pandoc invocation per `.tex`, mapping the five LaTeX environments to MDX components and `lstlisting → CodeBlock lang="cpp"`. No alternate content path. | Build determinism + MDX safety boundary. | HIGH |
| LBD-4 | **Reference solutions never reach the DOM.** `questions.reference_json.solution` must be stripped before any API handler returns question data; `input` / `expected` may ship. | If solutions leak, the practice system is pointless. | HIGH |
| LBD-5 | **Code execution is intentionally NOT sandboxed.** See [architecture.md §3.3](design_docs/architecture.md). Self-RCE is the feature, not a threat. | Avoid bolting on sandboxing as a "defensive default" — out of scope by decision. | HIGH (drift) |
| LBD-6 | **40-page `lectures.pdf` ceiling** for any chapter augmented from 2026-04-22 onward (per `feedback_chapter_review_autonomy.md`). Grandfathered: `chapters/ch_3/lectures.pdf` (53 pp) and `chapters/ch_4/lectures.pdf` (51 pp). | Chapter scope discipline; reading load. | HIGH |
| LBD-7 | **Bounded chapter additions: 3–5 high-value adds per chapter** (per `feedback_chapter_review_scope.md`). Everything else defers to the post-build content audit. | Prevents Step-2 sprawl. | HIGH unless task explicitly authorises more |
| LBD-8 | **No Jekyll polish.** Phase 2 (M2) replaced the Jekyll site. Do not add Jekyll improvements that won't survive M2 (per `feedback_no_jekyll_polish.md`). | Pre-M2 polish is churn. | HIGH |
| LBD-9 | **`coding_practice/` is the question-gen prompt corpus** (per `project_coding_practice_purpose.md` and `project_practice_md_phase4_link.md`). Don't touch from chapter tasks. Difficulty-tier expansion is planned. | Cross-stream contamination would break Phase-4 inputs. | HIGH |
| LBD-10 | **Status-surface 4-way agreement at task close.** Per-task spec `**Status:**`, `tasks/README.md` row, milestone README task-table row, and any milestone `Done when` checkboxes the closed task satisfies must all flip together. | M2 + M3 deep-analyses both caught silent drift here — Builder-time inline flips are cheaper than Auditor-time issues. | HIGH per disagreeing surface |
| LBD-11 | **Code-task verification is non-inferential.** Build-clean / type-clean / lint-clean is necessary but not sufficient for code. Every code task spec names an explicit smoke test the Auditor runs and cites. Content tasks (chapter `.tex`, design docs, README, CHANGELOG) may rely on build-clean + render check. | "Compiles ≠ works"; covered in `_common/verification_discipline.md`. | HIGH |
| LBD-12 | **Cross-chapter references must point at chapters that exist** in the cs-300 chapter map (`ch_1`–`ch_7`, `ch_9`–`ch_13`). References to non-existent chapters (e.g. `ch_8`) or the wrong chapter are HIGH. | Pedagogical integrity. | HIGH |
| LBD-13 | **Pre-Phase-1 sequencing** (per `project_pre_phase1_sequence.md`). A pre-Phase-1 task touching M2+ surfaces is out-of-order; flag HIGH. (`resources/` removed in M2 T7, 2026-04-23 — week-level sidecar TeX was orphaned by chapter augmentation.) | Phase ordering is load-bearing. | HIGH |
| LBD-14 | **Toolchain pins are load-bearing.** Node 22 (`.nvmrc`), pandoc 3.1.3 (`.pandoc-version`). Bumps require an explicit task. | Build reproducibility. | MEDIUM (HIGH if Builder bumps silently) |
| LBD-15 | **Sandbox-vs-host git policy.** When Claude Code runs inside the Docker sandbox (detected by `/.dockerenv`, typically with `--dangerously-skip-permissions`), all work happens on `design_branch` (or a feature branch off it) — **never `main`**. From the sandbox: no `git push`, no `git pull`, no `git fetch` against the remote, no merges to `main`, no tag pushes. Those operations are the host's job: the user runs them on the host where the SSH key, GPG key, and known_hosts are already configured. The sandbox commits locally; the host pushes / pulls / merges. | SSH and remote auth aren't forwarded into the container by design — pretending they are produces silent half-failures and tempts unsafe workarounds. The split also means a stray `git push origin main` from inside the sandbox can't trigger the GH Pages deploy by accident. | HIGH |

If an implementation requires changing one of these, it must land as a separate architecture decision (ADR or architecture.md amendment) before — not inside — the implementation commit.

---

## Repo layout

```text
cs-300/
├── chapters/ch_<N>/            # source of truth: lectures.tex, notes.tex, practice.md
├── coding_practice/            # prompt corpus for ai-workflows question-gen (Phase 4 input)
├── cs300/workflows/            # Python workflow modules (Phase 4) — registered into aiw-mcp
├── src/                        # Astro app (M2)
│   ├── pages/                  # routes: index + dynamic [id].astro per collection
│   │   └── api/                # local-only state service routes (NOT in dist/)
│   ├── content/                # generated MDX (gitignored; regenerated by prebuild)
│   ├── content.config.ts       # collection schemas
│   ├── layouts/                # Base.astro shell
│   └── components/callouts/    # 5 LaTeX-env components + CodeBlock
├── public/audio/               # M7 audio drop site (currently empty + .gitkeep)
├── scripts/
│   ├── pandoc-filter.lua       # MDX-friendly LaTeX → markdown filter
│   ├── build-content.mjs       # prebuild: pandoc each chapter → src/content/*.mdx
│   ├── chapters.json           # per-chapter metadata
│   ├── *-smoke.mjs             # node smoke harnesses (db, annotations, read-status, seed)
│   └── functional-tests.py     # selenium-driven UI smoke
├── .github/workflows/deploy.yml  # Astro build + deploy-pages
├── design_docs/
│   ├── architecture.md
│   ├── roadmap_addenda.md
│   ├── nice_to_have.md
│   ├── phase2_issues.md
│   ├── adr/                    # ADR-0001 (state-service hosting), ADR-0002 (UX three-column), …
│   ├── chapter_reviews/        # per-chapter Step-1 inventories + Step-2 gap reports
│   └── milestones/             # operational plan
│       ├── README.md
│       └── m<N>_<phase_name>/
│           ├── README.md       # milestone spec
│           ├── tasks/T<NN>_<slug>.md   # task specs
│           └── issues/T<NN>_issue.md   # audit findings (created on first audit)
├── runs/                       # long-running task artifacts (plan.md / progress.md / cycle_<N>/)
├── agent_docs/long_running_pattern.md
├── astro.config.mjs / tsconfig.json / package.json
├── pyproject.toml / uv.lock    # Python (cs300 workflow modules)
├── .nvmrc / .pandoc-version    # toolchain pins
├── Dockerfile / docker-compose.yml / .dockerignore   # filesystem-scoped agent sandbox
├── .claude/{agents,commands,skills}/   # workflow machinery (committed; settings.local.json is the only user-local file)
├── notes-style.tex             # shared LaTeX preamble
├── LICENSE                     # CC BY-NC-SA 4.0 (covers everything)
├── CLAUDE.md                   # this file
├── CHANGELOG.md
└── README.md
```

**Backlog rule.** Future / deferred work has exactly one home: `design_docs/nice_to_have.md` (long-horizon, no milestone) or a carry-over section on the appropriate future task spec (audit-discovered, owned by a specific task). Do not scatter backlog notes across random docs.

---

## Threat model

cs-300 is **single-user, local-machine, non-commercial by license**. Public deploy is a static GH Pages build — no backend, no API routes, no DB. All dynamic surfaces (`aiw-mcp`, state service with SQLite, code execution, question generation via local Ollama) exist only when the user runs locally.

| Area | cs-300 answer |
| --- | --- |
| Runtime context | LOCAL (single-user dev) + STATIC SITE (public deploy is read-only) |
| User model | SINGLE_USER, no accounts, no auth, no sessions |
| Network exposure | LOCALHOST (dev — bind `127.0.0.1`, never `0.0.0.0`) + PUBLIC_INTERNET (static GH Pages, no backend) |
| Release/distribution surface | STATIC_SITE (GH Pages) |
| Sensitive data handled | NONE — no real users, no cloud LLM keys (Ollama is local), no PII |
| Main attack surfaces | (1) reference-solution leakage to DOM (LBD-4); (2) MDX/HTML injection through pandoc Lua filter; (3) question-content injection from local LLM (validate-twice on `POST /api/questions/bulk`); (4) annotation rendering self-XSS; (5) code-execution subprocess integrity (argv arrays, signal-killable timeouts, temp-dir cleanup, `ulimit -v` before exec); (6) what ends up in `dist/` (no env, no local paths, no `127.0.0.1`); (7) supply-chain / install-time RCE (npm `postinstall`, Python build hooks); (8) path handling in the content pipeline (`scripts/build-content.mjs`) |
| Out-of-scope concerns | auth / authz / sessions / CSRF / rate-limiting; password hashing; TLS on local endpoints; SQLi via Drizzle (parameterised — flag only on raw interpolation); sandboxing code execution (LBD-5); cloud LLM key handling |

The security reviewer must focus on the surfaces above. Generic findings outside this threat model are noise.

---

## Canonical file locations

| Purpose | Path |
| --- | --- |
| Architecture | `design_docs/architecture.md` |
| Roadmap | `design_docs/roadmap_addenda.md` (canonical for ops); Drive doc id `1SJHI76hibJ6aJqvtMuJbE1dhzVLZlWcOpitofrziWC8` is historical |
| Deferred parking lot | `design_docs/nice_to_have.md` |
| Phase-2 deferred | `design_docs/phase2_issues.md` |
| Decision records | `design_docs/adr/*.md` |
| Per-chapter reviews | `design_docs/chapter_reviews/ch_<N>{,_gaps}.md` |
| Milestone overview | `design_docs/milestones/README.md` |
| Milestone spec | `design_docs/milestones/m<M>_<name>/README.md` |
| Task spec | `design_docs/milestones/m<M>_<name>/tasks/T<NN>_<slug>.md` |
| Task issue / audit log | `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md` |
| Task-analysis report | `design_docs/milestones/m<M>_<name>/issues/T<NN>_analysis.md` (created by `task-analyzer`) |
| Long-running run dir | `runs/<task-shorthand>/` (`plan.md`, `progress.md`, `cycle_<N>/summary.md`) |
| Changelog | `CHANGELOG.md` |
| CI gates | `.github/workflows/deploy.yml` |
| Slash commands | `.claude/commands/` |
| Subagents | `.claude/agents/` |
| Skills | `.claude/skills/` |
| Shared agent rules | `.claude/agents/_common/{non_negotiables,verification_discipline}.md` |
| Long-running pattern | `agent_docs/long_running_pattern.md` |
| Automation scripts | `scripts/` |
| License | `LICENSE` (single file — CC BY-NC-SA 4.0, covers everything) |

---

## Verification commands

The Auditor reruns these from scratch — never trusts the Builder's reported output. cs-300 has no language-level test suite; per-task verification *is* the audit gate. Use `NOT RUN — <reason>` when a gate does not apply.

```bash
# Format / Lint — N/A (no project-wide linter today; flag if added)

# Type check (Astro + TS)
npm run check

# Unit tests — N/A (no formal unit-test tree); fall back to smokes below

# Smoke tests (per-script — pick the relevant one)
node scripts/db-smoke.mjs
node scripts/annotations-smoke.mjs
node scripts/read-status-smoke.mjs
node scripts/seed-smoke.mjs
python scripts/functional-tests.py        # selenium-driven UI smoke

# Build / package
npm run build
# (runs prebuild → build-content.mjs → astro build → dist/)

# Content-task verification
pdflatex -halt-on-error chapters/ch_<N>/lectures.tex
node scripts/build-content.mjs   # pandoc + Lua filter end-to-end
```

Project-specific verification rules:

- **Content tasks** (chapter `.tex`, design docs, README, CHANGELOG): `pdflatex` exit 0 + MDX renders + links resolve is sufficient evidence (LBD-11).
- **Code tasks** (`scripts/`, the Lua filter, Astro components, API routes, `cs300/workflows/`, anything executable): build-clean is necessary but not sufficient. The task spec MUST name an explicit smoke test; the Auditor runs it and cites the output. Inferential claims from build success alone are HIGH (LBD-11).

Full verification rules: [.claude/agents/_common/verification_discipline.md](.claude/agents/_common/verification_discipline.md).

---

## Non-negotiables

These cross-cut every task — they apply to ad-hoc edits outside `/clean-implement` too. Subagent boundaries that overlap with these rules live in [.claude/agents/_common/non_negotiables.md](.claude/agents/_common/non_negotiables.md); the project-specific facts below override generic defaults.

### Architecture discipline

Architecture boundary:

```text
chapters/  +  cs300/workflows/   →   scripts/ (pandoc + lua filter)   →   src/ (Astro: layouts, components, pages, API routes)   →   dist/ (static)
                                                                       ↘ src/pages/api/  ←  aiw-mcp (sibling Python process)
```

Implications:

- No upward imports.
- The Lua filter is the only path from LaTeX to MDX.
- Workflow modules under `cs300/workflows/` register into `aiw-mcp` via `AIW_EXTRA_WORKFLOW_MODULES`; do not fork or monkey-patch the framework.
- API routes under `src/pages/api/` are local-only and must not appear in `dist/`.

### Spec authority

The task spec is authoritative. The issue file is an authoritative amendment to the task file. If they disagree, the task file wins; call out the conflict before proceeding. Deviations are recorded in the issue file.

### Carry-over discipline

A `## Carry-over from prior audits` section at the bottom of a task spec counts as additional acceptance criteria. Each item must be resolved, explicitly deferred forward (with propagation — see below), or marked not applicable with a reason.

### Scope discipline

- No invented scope. No drive-by refactors. No opportunistic adoption of `nice_to_have.md` items.
- Items in `nice_to_have.md` are out of scope by default — adoption requires an architecture.md update **plus** an ADR, not just a task.
- A pre-Phase-1 task touching M2+ surfaces is sequencing drift (LBD-13).
- A chapter task touching `coding_practice/` is cross-stream contamination (LBD-9).

### Documentation discipline

Update relevant docs in the same task when behavior, architecture, commands, public APIs, project workflows, or verification rules change. Do not leave docs knowingly stale. Every new module / TeX file / shell script gets a header comment citing the task and its relationship to other files. Inline comments only when *why* is non-obvious.

### Secrets discipline

No secrets in committed files. cs-300 has no real secrets today (single-user local, no cloud keys), but the rule still applies forward — never commit API keys, tokens, real `.env` values, private URLs, or credentials. Build output (`dist/`) must contain zero env values, zero local paths, zero Ollama URLs, zero `127.0.0.1` references. Grep the build for slips after build-affecting tasks.

### Changelog discipline

Every content- or code-touching task updates `CHANGELOG.md` in the same commit. Under the current dated section, add an entry tagged appropriately (Added / Changed / Removed / Fixed / Decided / Deferred). Reference the milestone + task ID (e.g. `M1 Task T2 — Pandoc probe`). List files touched, ACs satisfied, deviations from spec.

### Status-surface discipline (LBD-10)

When a task closes, **four** surfaces flip together:

1. `**Status:**` line in the per-task spec (`todo` → `✅ done <date>`).
2. The row in the milestone's `tasks/README.md`, if present.
3. The row in the milestone README's task table.
4. Any `Done when` checkbox in the milestone README that the closed task satisfies (`[ ]` → `[x]` with a citation parenthetical pointing at the per-task issue file).

The Auditor verifies all four; silent drift across them is HIGH per surface.

### Verification discipline

Verification is non-inferential (LBD-11). Build success is not evidence of runtime correctness for code. For every code task, the spec or issue file identifies the smallest meaningful smoke test. The Auditor reruns it and cites the output. See [.claude/agents/_common/verification_discipline.md](.claude/agents/_common/verification_discipline.md) for full rules.

### Dependency audit gate

No commit that touches a dep manifest ships without a clean `dependency-auditor` verdict (`SHIP` / `PASS`). Manifests in scope:

```text
package.json
package-lock.json
pyproject.toml
uv.lock
requirements*.txt
.nvmrc
.pandoc-version
Dockerfile
docker-compose.yml
```

When the user asks you to commit, check the staged diff for changes to any manifest above. If any are touched, spawn the `dependency-auditor` against the changeset before committing. Surface its verdict:

- `SHIP` / `PASS` — proceed. Note `Dep audit: clean` in the CHANGELOG entry.
- `FIX-THEN-SHIP` / `OPEN` / `BLOCKED` — stop, surface findings verbatim, do not commit. Findings re-enter the task as carry-over ACs if the task is still under `/clean-implement`; otherwise surface them for user decision.
- Exception: if `/clean-implement` ran the security gate against the exact same changeset earlier in the session, reference that prior audit's verdict and skip the re-run. Note `Dep audit: per <task-id> security gate` in the CHANGELOG entry.
- If no manifest changed, note `Dep audit: skipped — no manifest changes` and proceed.

The gate is non-skippable. "I only bumped a patch version" is not an exception — transitive-dep surprises are exactly why the check exists.

### Git safety

No commits, PRs, or pushes unless the user explicitly asks. Ask before:

- force-push
- `git reset --hard`
- branch deletion
- rebasing shared work
- changing release tags
- destructive `git clean`
- any other destructive git operation

### Autonomous-mode boundary (`/auto-implement` / `/autopilot`)

Only the orchestrator may run `git commit`. The branch policy depends on **where the orchestrator is running** (LBD-15):

| Where | Allowed branches for `git commit` | `git push` / `pull` / `fetch` / `merge to main` / `tag` |
| --- | --- | --- |
| **Sandbox** (`/.dockerenv` exists; typically `--dangerously-skip-permissions`) | `design_branch` only (or feature branch off it) — **never `main`** | **Forbidden** — the host owns these |
| **Host** (no `/.dockerenv`) | Any branch the user authorises, including `main` | Allowed when the user explicitly asks |

Subagents — regardless of host or sandbox — may not run:

```text
git commit
git push
git pull
git fetch <remote>
git merge
git rebase
git tag
git reset --hard
git clean -fd
git branch -D
npm publish / pnpm publish / yarn publish
uv publish
docker push
gh release create
```

A subagent report claiming it performed any of the above is a hard halt.

The orchestrator hard-halts on:

- attempt to commit to `main` from inside the sandbox (LBD-15)
- attempt to `git push` / `pull` / `fetch` / `merge` from inside the sandbox (LBD-15)
- merge to `main` from outside without explicit user approval
- push to `main` without explicit user instruction (host only)
- publish/release command without explicit approval
- version bump (Node, pandoc, package versions) beyond task scope
- subagent disagreement on correctness, architecture, security, or dependency safety
- unresolved HIGH audit finding
- missing verification for changed behavior
- dirty working tree containing unrelated user changes

The sandbox guard at [`scripts/sandbox-guard.sh`](scripts/sandbox-guard.sh) provides a runtime check the orchestrator (and the user) can run on demand: it exits non-zero if the current branch is `main` and `/.dockerenv` exists. `make shell` runs it automatically before dropping into the sandbox shell.

Architecture decision additions land separately from implementation commits unless the user explicitly says otherwise.

---

## Auditor — issue file structure

At `design_docs/milestones/m<M>_<name>/issues/T<NN>_issue.md`:

```markdown
# T<NN> — <title> — Audit Issues

**Source task:** [../tasks/T<NN>_<slug>.md](../tasks/T<NN>_<slug>.md)
**Audited on:** YYYY-MM-DD
**Audit scope:** <what was inspected>
**Status:** ✅ PASS / ⚠️ OPEN / 🚧 BLOCKED

## Design-drift check
(architecture.md, ADRs, LBD-1..14, memory rules, nice_to_have boundary)

## AC grading
| AC | Status | Evidence | Notes |
| -- | ------ | -------- | ----- |

## 🔴 HIGH — <one issue per subsection, each with Action / Recommendation>
## 🟡 MEDIUM — …
## 🟢 LOW — …

## Additions beyond spec — audited and justified
## Gate summary
| Gate | Command | Result | Notes |
| -- | ------- | ------ | ----- |

## Issue log — cross-task follow-up
(M<N>-T<NN>-ISS-NN IDs, severity, owner / next touch point)

## Security review
(populated by security-reviewer in the security gate)

## Dependency audit
(populated by dependency-auditor when manifests changed)

## Deferred to nice_to_have
(if any — only when the finding maps cleanly into nice_to_have.md)

## Propagation status
(if any forward-deferrals were filed against future task specs)
```

### Severity

- **HIGH** — AC unmet, spec deliverable missing, architectural rule broken, drift from a load-bearing decision (LBD-1..14) or memory rule, gate that should have run did not.
- **MEDIUM** — deliverable partial, convention skipped, downstream risk, weak test coverage.
- **LOW** — cosmetic, forward-looking, flag-only.

### Every issue carries a proposed solution

For every issue (any severity, including issue-log entries):

- Include an **Action** / **Recommendation** line: which file to edit, which check to add, which task owns follow-up, trade-offs if relevant.
- If the fix is unclear (two reasonable options, crosses milestones, needs spec change) — **stop and ask the user** before finalising. No invented direction.

### Forward-deferral propagation

When an audit defers work to a future task:

1. Log the deferral in the current issue file as `DEFERRED` with explicit owner (milestone + task ID).
2. Append a **`## Carry-over from prior audits`** section at the bottom of the **target** task's spec. Each `- [ ]` entry has: issue ID, severity, concrete "what to implement" line, source link back, alternative owner if any.
3. Close the loop in the current issue file with a `## Propagation status` footer linking to each target file.

Non-optional. Without propagation, the target Builder cannot see the deferral.

### nice_to_have.md boundary

If a finding maps to an item in `nice_to_have.md`:

- Do **not** forward-defer to a future task — those items have no milestone.
- Note the match under a `## Deferred to nice_to_have` section with the `nice_to_have §N` reference and the trigger that would justify promotion.
- Address the finding itself against the actual task scope. Don't skip the audit because the "real fix" is deferred.

---

## Glossary

- **Phase-N-blocking item.** Something that satisfies *any* of:
  (a) without it, a subsequent phase's items cannot be implemented at all (hard dependency); OR
  (b) without it, **two or more** items within the *same* phase will fail or produce inaccurate output (intra-phase critical path).
  Anything that fails neither test is non-blocking — it can land late, defer, or be dropped without rescoping the phase. Use this definition in milestone READMEs and acceptance criteria; do not invent ad-hoc "blocking" judgments.
- **Long-running task.** A task that opts in via `**Long-running:** yes` in its spec, or that reaches cycle 3 of `/clean-implement` / `/auto-implement`. From that point, the orchestrator initialises `runs/<task>/plan.md` (immutable) and `runs/<task>/progress.md` (append-only after each cycle). See [agent_docs/long_running_pattern.md](agent_docs/long_running_pattern.md).
- **Drift.** Implementation that contradicts a load-bearing decision (LBD-1..14), an ADR, architecture.md, or a saved feedback/project memory rule. Always HIGH.
- **Functionally clean.** `/clean-implement` reached audit verdict `✅ PASS` with no OPEN issues; the security gate has not yet run.
- **Clean.** Functionally clean **plus** the security gate (security-reviewer + dependency-auditor when relevant) returned `SHIP` / `PASS`.

---

## User override

The user can override these rules. When an override conflicts with a load-bearing decision, security boundary, destructive-operation rule, release rule, or verification rule:

1. State the conflict clearly.
2. Ask for explicit confirmation.
3. Record the override in the task issue/audit file or an ADR.
