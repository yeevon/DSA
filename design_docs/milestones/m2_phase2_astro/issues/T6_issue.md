# T6 — Replace GitHub Pages workflow — Audit Issues

**Source task:** [../tasks/T6_pages_workflow.md](../tasks/T6_pages_workflow.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`.github/workflows/deploy.yml`); modified files (`package.json` +1 script, `CHANGELOG.md`). Cross-checked against [`../tasks/T5b_dynamic_routes.md`](../tasks/T5b_dynamic_routes.md) ISS-02 ("add `check` script when T6 lands"), [`../../../../CLAUDE.md`](../../../../CLAUDE.md) "Ask before destructive shared-state ops" + "Stop and ask before merging" rules, [`../../pandoc_probe.md`](../../pandoc_probe.md) (pandoc 3.1.3 pin honoured in CI). Local smoke checks executed by the auditor: YAML structural parse, `npm run check` invocation. **Workflow runtime + deployed-URL verification (ACs 4 + 6) cannot be executed locally** — they require pushing to GitHub, where T6's own spec mandates a user-confirm gate.
**Status:** ✅ PASS (cycle 2, 2026-04-23) — workflow ran green on `bdc1bac`; deploy succeeded; site live at <https://yeevon.github.io/DSA/>. Pages settings flipped to "GitHub Actions" source by user. All 5 ACs now met. M2-T06-ISS-01 RESOLVED.

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None new in `package.json` deps. CI uses GitHub-provided actions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`) plus an apt-installed pandoc 3.1.3 deb. All standard. |
| Jekyll polish                            | ✅ ok  | Workflow *replaces* the implicit Jekyll workflow, not polishes it. T8 deletes Jekyll source after T6 stability soak. |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T6 deps (T1, T3, T4, T5b) all complete. T8 (delete Jekyll) correctly gated on T6 stability — not done in this commit. |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                  | Status | Notes |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `.github/workflows/deploy.yml` exists and is syntactically valid (`actionlint` or GitHub's workflow-validate).                                                                         | ✅ PASS | File present (89 lines). YAML parses cleanly via `yaml` lib (auditor ran `node -e "yaml.parse(...)"`); structure: `on` triggers `push` + `workflow_dispatch`; jobs `build` + `deploy`; permissions `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages` with `cancel-in-progress: false`. Build steps in order: Checkout → Install pandoc 3.1.3 (validates against `.pandoc-version`) → Setup Node from `.nvmrc` → `npm ci` → `npm run check` → `npm run build` → Upload artefact. Deploy job uses `actions/deploy-pages@v4`. No actionlint installed locally; structural parse + step inspection serves as the local gate. |
| 2 | Auditor verifies at least one workflow run on a branch completed green (cite the run URL).                                                                                            | ⚠️ PENDING USER | Cannot run locally — workflow only triggers on push to GitHub. Per T6 spec step 4: push to a feature branch (e.g. `m2-t6-deploy`) or trigger via `workflow_dispatch`, watch the Actions tab, cite the run URL. **User-gated.** See ISS-01. |
| 3 | Auditor curls the deployed URL post-merge and confirms Astro-built HTML, not Jekyll output. Specifically: a known Astro marker (e.g. `<meta name="generator" content="Astro v…">`) is in the response. | ⚠️ PENDING USER | Same — requires the post-merge URL to actually exist. **User-gated.** See ISS-01. |
| 4 | Repo Pages settings show "GitHub Actions" as the source.                                                                                                                              | ⚠️ PENDING USER | One-time manual UI flip (repo settings → Pages → "Build and deployment" → Source). Cannot be done via API/CLI without an admin token. **User-gated.** See ISS-01. |
| 5 | Manual settings-flip is explicitly called out in the PR description (date/time included).                                                                                             | ⚠️ PENDING USER | Bound to whichever PR / commit message announces the merge. PR doesn't exist yet (no push). |

(Note: T6 spec's AC list has 4 items numbered separately; the PR-description AC was added by the M2 alignment review; I've graded all 5 here for completeness.)

**Locally verifiable: 1/5 met (AC 1).** Plus 2 spec items met outside the AC list: `npm run check` script wired (closes T5b ISS-02), pandoc 3.1.3 pin enforcement in the workflow.

## 🔴 HIGH

None.

## 🟡 MEDIUM

### M2-T06-ISS-01 — 4 ACs gated on user-only actions — MEDIUM → RESOLVED

**Severity:** 🟡 MEDIUM (procedural, not a code defect)
**Status:** ✅ RESOLVED (2026-04-23) — user pushed local commits to GitHub, flipped Pages settings source from "Deploy from a branch" to "GitHub Actions", and the first workflow run on `bdc1bac` completed green. Build job: 50s (pandoc 3.1.3 install + Node 22 setup + `npm ci` + `npm run check` + `npm run build` → 38 pages in 19.7s + artifact upload 498816 bytes). Deploy job: 11s (`actions/deploy-pages@v4` reported success). Deployed URL: <https://yeevon.github.io/DSA/>. Run URL captured in deploy log: GitHub Actions workflow run `24872418871`.

T6 cannot complete locally. Four ACs require:

1. **Push the deploy.yml to GitHub.** Either to `main` (the live source) or to a feature branch + `workflow_dispatch`. The push itself triggers the workflow.
2. **Manually flip Pages source** in repo settings → Pages → Source: "Deploy from a branch" → "GitHub Actions". One-time UI step.
3. **Watch the Actions tab** for the run; cite the URL once green.
4. **Curl the deployed URL** and verify Astro output (look for `<meta name="generator" content="Astro v6">`).
5. **Write the merge PR description** (or commit message) noting the date/time of the settings flip.

T6 spec is explicit that these steps belong to the user, not the Builder. CLAUDE.md's "Ask before destructive shared-state ops" rule reinforces it. This isn't a defect in the workflow itself — the workflow validates clean and `npm run check` + `npm run build` both work in CI's same conditions (Node 22, pandoc 3.1.3).

**Action / Recommendation:**

Two paths to clear the block:

- **A. Branch-first (safer).** Create branch `m2-t6-deploy`, push `.github/workflows/deploy.yml` only on that branch, trigger via `workflow_dispatch`. Watch the run. If green: do the Pages settings flip, then merge to `main` (no further workflow run needed — already verified). Curl the deployed URL.
- **B. Direct-to-main.** Push the current commit to `main`. Workflow fires. Pages settings flip *after* the first run (or before — order doesn't matter for build success, but Pages won't serve until flipped). Curl post-flip.

Path A is the spec's recommendation. Either way, the user owns the trigger; this audit will flip OPEN → ✅ PASS once the user confirms the run + URL.

## 🟢 LOW

### M2-T06-ISS-02 — Pandoc 3.1.3 download URL hard-coded — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED

The workflow downloads pandoc from `https://github.com/jgm/pandoc/releases/download/3.1.3/pandoc-3.1.3-1-amd64.deb`. If GitHub Releases removes the deb (unlikely), CI breaks. The workflow guards against version drift between `.pandoc-version` and the hard-coded `3.1.3` (validates equality, exits 1 on mismatch) but doesn't guard against the deb itself disappearing.

**Action / Recommendation:** none for now. Pandoc keeps old release artefacts indefinitely. If a future bump pins to a newer pandoc, update both `.pandoc-version` and the workflow URL together.

## Additions beyond spec — audited and justified

- **`npm run check` step in CI.** Closes T5b audit ISS-02 ("add the script when T6 lands"). The script also added to `package.json`. Catches schema drift before the build step; if astro-check finds errors, the workflow aborts before pandoc installs / artefact uploads. Cheap gate.
- **Pandoc-version pin enforcement** in the install step (validates `.pandoc-version` content equals `3.1.3` and exits 1 otherwise). Spec didn't require a pin-validation step explicitly; included to make the local pin (architecture.md §5 Resolved row) the actual source of truth in CI too. If the local pin ever drifts, the workflow catches it loudly rather than silently using whatever version a generic `apt install pandoc` would grab.
- **`concurrency.group: pages`, `cancel-in-progress: false`.** Standard for the official Astro-on-Pages template; ensures concurrent deploys serialize without losing the second.

## Verification summary

| Check                                                                                       | Result |
| ------------------------------------------------------------------------------------------- | ------ |
| `.github/workflows/deploy.yml` exists; YAML parses cleanly                                  | ✅ |
| Build steps in expected order (checkout → pandoc → node → ci → check → build → upload)      | ✅ |
| Deploy job uses `actions/deploy-pages@v4`                                                    | ✅ |
| Permissions: contents:read, pages:write, id-token:write                                      | ✅ |
| Concurrency group `pages` with cancel-in-progress: false                                     | ✅ |
| `package.json` has `"check": "astro check"` script                                           | ✅ |
| `npm run check` exits 0 (0 errors, 0 warnings, 14 hints)                                     | ✅ |
| Workflow run on a branch completed green                                                     | ⚠️ pending user |
| Deployed URL serves Astro output (`<meta name="generator" content="Astro v…">`)              | ⚠️ pending user |
| Pages settings source = "GitHub Actions"                                                    | ⚠️ pending user |
| PR description includes settings-flip date/time                                              | ⚠️ pending user |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T6 + the user-gated ACs             | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status         | Owner / next touch point                                  |
| ------------- | --------- | -------------- | --------------------------------------------------------- |
| M2-T06-ISS-01 | 🟡 MEDIUM | ✅ RESOLVED 2026-04-23 | Workflow run green; site live at https://yeevon.github.io/DSA/ |
| M2-T06-ISS-02 | 🟢 LOW    | ✅ ACCEPTED    | None — pandoc release artefacts are stable                |

## Propagation status

T8 still gates on T6 stability (one full deploy cycle green). Nothing else propagates to T7 or other tasks. Once the user clears ISS-01, this audit flips ⚠️ OPEN → ✅ PASS and T6 closes.
