# Verification discipline — shared rules

These rules apply to every cs-300 subagent.

Verification is non-inferential (LBD-11 in `CLAUDE.md`). A task is not done because it looks plausible, compiles, or matches the Builder's expectation. A task is done only when the relevant behaviour is proven with concrete evidence.

---

## 1. Build-clean is necessary but not sufficient — for code

A clean build, lint pass, or type-check pass does not prove the task is correct.

For every **code** task, the spec or issue file must identify the smallest meaningful smoke that proves the changed behaviour. The Auditor reruns it.

Examples in cs-300:

- `node scripts/db-smoke.mjs` for state-service / Drizzle changes
- `node scripts/annotations-smoke.mjs` for annotation handlers
- `node scripts/read-status-smoke.mjs` for read-status handlers
- `node scripts/seed-smoke.mjs` for seed/data-loading changes
- `python scripts/functional-tests.py` for selenium-driven UI smoke
- `node scripts/build-content.mjs` for pandoc / Lua-filter / build-content changes
- a CLI invocation (e.g., `uvx --from jmdl-ai-workflows aiw ...`) for `cs300/workflows/` modules

Inferential claims from build success alone are HIGH audit findings.

For **content** tasks (chapter `.tex`, design docs, README, CHANGELOG), build-clean is sufficient evidence: `pdflatex -halt-on-error` exit 0, MDX renders, links resolve.

---

## 2. Smoke tests must use the real surface when behaviour crosses boundaries

When a task changes behaviour exposed through a real user or integration surface, verify through that surface.

- API behaviour → exercise the API route or handler boundary (don't just unit-test the helper).
- Build/static-site behaviour → inspect `dist/` after `npm run build`.
- Pandoc / Lua filter → run `node scripts/build-content.mjs` end-to-end and inspect the generated MDX.
- Workflow modules registered into `aiw-mcp` → smoke through `uvx --from jmdl-ai-workflows aiw` per `feedback_aiw_uvx_oneshot.md` (never `pip install` / `uv tool install`).
- Selenium / browser behaviour → run `python scripts/functional-tests.py`, not just visual inspection.

Do not bypass the changed surface through helper fixtures unless the task is explicitly about internal-only behaviour.

---

## 3. Auditor reruns gates independently

The Auditor does not trust the Builder's reported gate output. The Auditor reruns the configured gates or records why a gate could not be run.

Default gates (from `CLAUDE.md` § Verification commands):

| Gate | Project command |
| --- | --- |
| Format | N/A — no project-wide formatter today |
| Lint | N/A — no project-wide linter today |
| Type check | `npm run check` |
| Unit tests | N/A — no formal unit-test tree |
| Smoke tests | `node scripts/<name>-smoke.mjs` / `python scripts/functional-tests.py` (pick the relevant one per task) |
| Content build | `node scripts/build-content.mjs` |
| Chapter build | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` |
| Build / package | `npm run build` |

Omit gates that do not apply, but the omission must be explicit (`NOT RUN — <reason>`).

---

## 4. Record exact commands

Every verification report must include exact commands and outcomes:

```md
| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | PASS | — |
| smoke | `node scripts/db-smoke.mjs` | PASS | — |
| build | `npm run build` | PASS | dist/ generated |
| chapter | `pdflatex -halt-on-error chapters/ch_5/lectures.tex` | PASS | 38 pp under 40-pp ceiling |
```

For `FAIL`, include a short failure reason. For `NOT RUN`, include the reason.

Do not write vague claims:

- tests look good
- should work
- build appears fine
- not necessary
- covered by other tests

---

## 5. Release/build-output checks must inspect the real artifact

For tasks that affect `dist/` (the GH Pages payload):

- Run `npm run build`.
- Inspect `dist/` for forbidden content: env values, absolute local paths, `127.0.0.1`, Ollama URLs, dev-only deps.
- Verify `src/pages/api/*` did not ship into `dist/` (LBD-1).
- Verify cited assets (KaTeX CSS, audio, images) actually land in the build.

A source-tree test alone is not enough for release-affecting changes.

---

## 6. Dependency verification is separate from normal tests

If any of the following changes, run `dependency-auditor` before claiming completion:

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

Dep audit checks (per the agent's prompt and `CLAUDE.md` § Dependency audit gate):

- whether the dependency is needed
- standard-library or existing-project alternative
- license risk (CC BY-NC-SA-incompatible licenses; SSPL/BUSL etc.)
- maintenance / abandonment risk
- supply-chain / install-time RCE (npm `postinstall`, Python build hooks)
- typosquats (new direct deps only)
- known CVEs (`npm audit` high+critical; `pip-audit` if Python deps grow)
- transitive dependency impact
- lockfile consistency (committed `package-lock.json`; `npm ci` in `.github/workflows/deploy.yml`)
- what ends up in `dist/`

---

## 7. Bash safety rules

Prefer file-read tools for file inspection. Use shell only when runtime behaviour or tooling output is needed.

Rules:

- Prefer simple one-line commands.
- Avoid shell tricks when a direct command works.
- Do not use shell output to narrate reasoning.
- Do not run destructive commands.
- Do not mutate git state.
- Avoid complex command substitution.
- Avoid writing temporary scripts unless needed.
- If a command might affect external systems, stop and ask.

Safe examples:

```bash
git status
git diff --stat
grep -n "pattern" path/to/file
npm run check
node scripts/db-smoke.mjs
pdflatex -halt-on-error chapters/ch_1/lectures.tex
```

Unsafe examples:

```bash
git reset --hard
git clean -fd
git push
npm publish
uv publish
docker push
rm -rf dist/   # ok in some build flows; ask before doing it autonomously
```

---

## 8. Verification must map to acceptance criteria

Each acceptance criterion (including carry-over) should have one of:

- direct automated test / smoke
- file inspection
- documented manual verification with exact steps
- explicit reason it cannot be directly verified

The Auditor grades each AC independently. Passing tests do not automatically mean every AC is met.

---

## 9. No hidden skipped gates

If a configured gate is skipped, record it:

```text
NOT RUN — <reason>
```

Acceptable reasons:

- gate does not apply to this project type (e.g., format/lint — none configured yet)
- task is documentation-only and code gates do not apply
- external dependency unavailable (e.g., Ollama not running)
- user explicitly skipped the gate
- tool not available in current environment

Unacceptable reasons:

- seemed unnecessary
- Builder already ran it
- probably covered
- would take too long, without user approval
