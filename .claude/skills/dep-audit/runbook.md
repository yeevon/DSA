# dep-audit runbook

The runbook details manifest change-detection across npm + Python + toolchain pins, the
lockfile-diff parsing patterns, and the `dist/` secret-scan denylist used before any
commit that triggers the GH Pages deploy.

## Manifest-detection

Invoke:

```bash
git diff --exit-code <pre-task-commit>..HEAD -- \
  package.json package-lock.json \
  pyproject.toml uv.lock \
  requirements*.txt \
  .nvmrc .pandoc-version \
  Dockerfile docker-compose.yml
```

Exit-code semantics:

- Exit 0 / empty stdout — no manifest changes; dep-audit gate does NOT fire. Note
  `Dep audit: skipped — no manifest changes` in the CHANGELOG.
- Exit 1 / any stdout lines — changes detected; spawn the `dependency-auditor` agent.

The `<pre-task-commit>` is the SHA recorded at task kickoff. When no pre-task SHA is
available, use `HEAD~1`.

Watch for:

- New entries under `dependencies` / `devDependencies` (package.json) or `[project]`
  `dependencies` / `[dependency-groups]` (pyproject.toml).
- Version specifier changes (`^4.0.0` → `^5.0.0`).
- Any `package-lock.json` `integrity` line change (transitive bump even if
  `package.json` is unchanged).
- Any `uv.lock` hash-line change (same on the Python side).
- `.nvmrc` / `.pandoc-version` bumps — toolchain pins are LBD-14.

## package-lock parsing

Standard git-diff format on `package-lock.json`. Key fields:

- `"version"` lines under each `"node_modules/<pkg>"` entry.
- `"integrity"` lines (sha512 hash of the resolved tarball).
- `"resolved"` URLs (sometimes useful to spot registry redirects).

Example diff snippet:

```diff
     "node_modules/zod": {
-      "version": "3.23.8",
+      "version": "4.3.6",
-      "integrity": "sha512-AAA…",
+      "integrity": "sha512-BBB…",
```

Triage rule: same-major bumps with upstream changelog entries are advisory. Cross-major
bumps (zod 3 → zod 4 above) or new transitive deps with no prior history are HIGH —
spawn the full `dependency-auditor` agent.

## uv.lock parsing

cs-300 has Python workflow modules under `cs300/workflows/`. Standard git-diff format on
`uv.lock`:

- Lines starting with `+` — newly added or upgraded package versions.
- Lines starting with `-` — removed or downgraded.
- A `- pkg==old` / `+ pkg==new` pair — version bump; compare major.minor for
  breaking-change risk.

Same triage rule as npm: cross-major bumps are HIGH.

## dist-scan

Run before any commit that will trigger the GH Pages deploy (every push to `main`).

Build first:

```bash
npm run build
```

Then scan `dist/` for secrets and host-leak patterns. The denylist:

| Pattern | Risk |
|---|---|
| `.env*` (file) | Real secrets in build output |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (string) | API key string leaked |
| `ghp_`, `github_pat_` (string) | GitHub token leaked |
| `127.0.0.1`, `localhost:` | Local-only URL in user-facing output |
| `http://localhost`, `http://0.0.0.0` | Local-only URL |
| `/home/papa-jochy/`, `/Users/`, `/home/node/` | Absolute filesystem paths leaked |
| `*.sqlite3`, `*.sqlite` | Local DB file shipped |
| `runs/`, `design_docs/` | Internal artefacts shipped |
| `cs300/`, `chapters/`, `coding_practice/` (path mentions in user-facing output) | Internal paths leaked |

Suggested invocation:

```bash
grep -rEn 'OPENAI_API_KEY|ANTHROPIC_API_KEY|ghp_|github_pat_|/home/[^/]+/|/Users/|127\.0\.0\.1|localhost:' dist/ || echo "dist-scan: clean"
```

Any hit is BLOCK — do not push to `main` until resolved. Missing build is HIGH (cannot
verify what would deploy).

## Out-of-scope reminders

- The dep-audit Skill is the operator-side wrapper. The full per-finding analysis
  (CVE, install-time-RCE risk, typosquat detection) is the `dependency-auditor` agent's
  job. The Skill triggers the agent; it does not duplicate the agent's work.
- cs-300 does not publish a wheel or npm package. There is no equivalent of
  `unzip -l dist/*.whl` content-allowlist check. The `dist/` secret-scan is the
  cs-300 analogue: what ends up on GH Pages is the user-facing release surface.
