# T1 — Scaffold Astro project — Audit Issues

**Source task:** [../tasks/T1_scaffold_astro.md](../tasks/T1_scaffold_astro.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `src/pages/index.astro`, `src/layouts/Base.astro`, `public/audio/.gitkeep`, `public/favicon.{ico,svg}`); modified files (`.gitignore`, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1 (static content pipeline) + §1.4 (audio file layout pin), [`../README.md`](../README.md) Done-when bullets, [`../../../../CLAUDE.md`](../../../../CLAUDE.md) non-negotiables (40-page ceiling N/A; code-task verification non-inferential applies). Smoke checks executed by the auditor: `npm install` (cold), `npm run build` (twice — initial + incremental), `npm run dev` + `curl http://localhost:4321/DSA/`. All gate output captured below.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | Astro 6.1.9 added — sanctioned by [`../../../architecture.md`](../../../architecture.md) §1 ("Site: Astro (post-Phase-2)"). No items pulled from `nice_to_have.md` (file doesn't exist).                                  |
| Jekyll polish                            | ✅ ok  | T1 ships alongside Jekyll; no Jekyll files touched.                                                   |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T1 is M2-scope; ships only Astro scaffold + the architecture.md §1.4 audio-layout pin.               |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                                  | Status | Notes |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `npm install` exits 0 from a clean `node_modules/`.                                                                                                                                                  | ✅ PASS | Cold install: `added 252 packages, audited 253 packages in 40s`; `found 0 vulnerabilities`. |
| 2 | `npm run build` exits 0 and produces `dist/index.html` containing the placeholder text.                                                                                                              | ✅ PASS | Initial build: `1 page(s) built in 410ms`. `grep -q 'cs-300 — Astro scaffold (M2 T1)' dist/index.html` → match. `dist/index.html` also carries `href="/DSA/favicon.svg"` (base honoured) and `meta name="generator" content="Astro v6.1.9"`. |
| 3 | `npm run dev` starts on a local port; `curl -s http://localhost:<port>/DSA/` returns the placeholder text. (Auditor must actually run this.)                                                         | ✅ PASS | Dev server started on `:4321`; `curl http://localhost:4321/DSA/` returned `<title>cs-300 — scaffold</title>` and `<p>cs-300 — Astro scaffold (M2 T1)</p>`. Server killed cleanly. |
| 4 | `git status` shows `node_modules/` and `dist/` are untracked (gitignored).                                                                                                                            | ✅ PASS | `git status --short` does not list `node_modules/` or `dist/`. `git check-ignore -v` confirms `.gitignore:83:node_modules/`, `:84:dist/`, `:85:.astro/`. |
| 5 | `public/audio/.gitkeep` exists and is tracked (the dir is materialised per architecture.md §1.4 even though M7 fills it). [Gap 3 fix from M2 alignment review.]                                       | ✅ PASS | File exists at `public/audio/.gitkeep` (0 bytes); `git status --short public/audio/.gitkeep` shows `??` (untracked but discoverable — will be staged in T1's commit). Architecture.md §1.4 layout pin honoured. |

All 5 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M2-T01-ISS-01 — `Base.astro` uses default `<slot />` only, not named header/footer slots — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED (no fix this cycle)

T1 deliverable line reads: `Base.astro — minimal HTML shell (header, main, footer slots — actual styling in T3 / later)`. Read strictly, "header, main, footer slots" suggests three named slots (`<slot name="header" />`, `<slot />`, `<slot name="footer" />`). The shipped `Base.astro` has a literal `<header><strong>cs-300</strong></header>` plus the default `<slot />` and an empty `<footer>`. Functionally fine for T1 (no other page consumes named slots yet) but it pre-decides the header content where the spec arguably wanted the consumer to override.

**Action / Recommendation:** leave as-is for now. T5 will replace `index.astro` with the real chapter index and may want to override the header by then; if T5 wants different header content per page, refactor to named slots at that point. Not worth a forced refactor today since no consumer is blocked.

### M2-T01-ISS-02 — `astro check` prompts to install `@astrojs/check` + `typescript` — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED (out of T1 scope)

`npx astro check` (a typecheck pass) interactively prompts to install `@astrojs/check` + `typescript` because the scaffold doesn't ship them. T1 ACs don't require typecheck — just `npm run build` exit 0 — so this is not a failing gate. It will become relevant when T3 (`.astro` components with real props) lands; type errors there would silently slip past `astro build`.

**Action / Recommendation:** add `@astrojs/check` + `typescript` as devDependencies in T3, where typecheck starts mattering. Don't add in T1 — T1 spec is intentionally lean.

## Additions beyond spec — audited and justified

- `package-lock.json` shipped alongside `package.json`. Standard npm practice; not in spec but expected. Justified: reproducible installs in CI (T6) require the lockfile.
- `public/favicon.ico` + `public/favicon.svg` came from the Astro scaffold template; spec didn't enumerate. Harmless; the placeholder page references the SVG via `${import.meta.env.BASE_URL}favicon.svg`. Consider replacing with a cs-300-specific icon when the real index page lands in T5.
- `.nvmrc` and `package.json engines` both pin Node version. T1 spec said "via `.nvmrc` or `package.json` `engines`"; doing both is belt-and-braces. Justified: `.nvmrc` is what `nvm use` reads; `engines` is what `npm install` warns on. Cheap.
- `astro.config.mjs` carries a header comment citing T1 + the rationale for `site`/`base`/`output`. Spec didn't require — but CLAUDE.md Builder convention says "Every new module / TeX file / shell script gets a header comment citing the task." Consistent with that.

## Verification summary

| Check                                                                                          | Result |
| ---------------------------------------------------------------------------------------------- | ------ |
| `npm install` cold from a clean `node_modules/`                                                | ✅ exit 0 |
| `npm run build` initial                                                                        | ✅ exit 0, 1 page in 410 ms |
| `npm run build` second invocation (incremental)                                                | ✅ exit 0, 1 page in 429 ms |
| `dist/index.html` contains `cs-300 — Astro scaffold (M2 T1)`                                   | ✅ |
| `dist/index.html` carries `href="/DSA/…"` (base prefix honoured)                               | ✅ |
| `dist/index.html` carries `meta name="generator" content="Astro v6.1.9"`                       | ✅ |
| `npm run dev` starts on `:4321`; `curl http://localhost:4321/DSA/` returns placeholder         | ✅ |
| `git status` shows no `node_modules/` or `dist/` entries                                       | ✅ |
| `git check-ignore -v node_modules/ dist/ .astro/` returns all three matched                    | ✅ |
| `public/audio/.gitkeep` exists                                                                  | ✅ |
| `.nvmrc` content = `22`; `package.json engines.node = ">=22.12.0"`                              | ✅ |
| `astro.config.mjs` has `site: 'https://yeevon.github.io'`, `base: '/DSA/'`, `output: 'static'` | ✅ |
| Architecture.md §1 sanctions Astro as the M2 site framework                                     | ✅ |
| Architecture.md §1.4 audio file-layout pin materialised on disk                                 | ✅ |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T1                                    | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status        | Owner / next touch point                          |
| ------------- | --------- | ------------- | ------------------------------------------------- |
| M2-T01-ISS-01 | 🟢 LOW    | ✅ ACCEPTED   | Reconsider in T5 if a consumer needs header override |
| M2-T01-ISS-02 | 🟢 LOW    | ✅ ACCEPTED   | T3 — add `@astrojs/check` + `typescript` then     |

## Propagation status

No forward-deferral required this cycle. Both LOW findings are flag-only and route naturally to T3 and T5 without needing a carry-over section in those task specs (the recommendations are local to those tasks' work and would be discovered organically).
