# T3 — Callout component library — Audit Issues

**Source task:** [../tasks/T3_callout_components.md](../tasks/T3_callout_components.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`src/components/callouts/{Definition,KeyIdea,Gotcha,Example,Aside,CodeBlock}.astro`, `src/pages/callouts-test.astro`); modified files (`package.json` devDependencies, `package-lock.json`, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1 (component library, minimal props, 1:1 LaTeX↔component mapping), [`../../../pandoc_probe.md`](../../../pandoc_probe.md) (the M1 verdict the components consume from), [`../issues/T1_issue.md`](T1_issue.md) ISS-02 (typecheck deps carry-over), [`../issues/T2_issue.md`](T2_issue.md) ISS-02 (CodeBlock JSX vs fenced markdown — applies to T3's MDX components-map work). Smoke checks executed by the auditor: `npm run build` (verifies prod build); fresh `npm run dev` on `:4321`; `curl http://localhost:4321/DSA/callouts-test` to verify all 6 components render with titles + class names; `find dist/ -name '*callouts-test*'` (AC 5); `grep -E 'clipboard.writeText' dist/` (verifies copy-button JS wired into the production bundle).
**Status:** ✅ PASS (cycle 2, 2026-04-23) — user picked option A on ISS-01: ACCEPT AC 5's failure, carry the test-page deletion forward to T8. T3 ships as-is; the harmless `dist/callouts-test/` artefact gets cleaned up in T8's dev-asset sweep.

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | `@astrojs/check@^0.9.8` + `typescript@^5.9.3` (devDependencies) — closes T1 audit ISS-02. Both are official Astro typecheck deps; no novel framework added. |
| Jekyll polish                            | ✅ ok  | No Jekyll files touched.                                                                              |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content touched.                                                                           |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content touched.                                                                           |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T3 is M2-scope; depends only on T1 (scaffold). No M3+ surfaces touched. The `<CodeBlock>` "send to editor" affordance is correctly deferred to M6 (called out in T3 spec + Aside in CodeBlock.astro header comment). |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                                                  | Status | Notes |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | All 6 component files exist under `src/components/callouts/`.                                                                                                                                          | ✅ PASS | `Definition.astro` (1052 b), `KeyIdea.astro` (744 b), `Gotcha.astro` (739 b), `Example.astro` (753 b), `Aside.astro` (734 b), `CodeBlock.astro` (2806 b). All 6 present. |
| 2 | `npm run build` exits 0 (no type errors, no missing imports).                                                                                                                                         | ✅ PASS | `2 page(s) built in 566ms` (index + callouts-test). No errors. |
| 3 | `npm run dev` serves the test page; auditor must navigate to `/_callouts-test` (now `/callouts-test`, see ISS-01) and confirm each component renders with its title bar and body styling.            | ✅ PASS | `curl http://localhost:4321/DSA/callouts-test` returned 13.5 KB containing all 5 callout class names (`callout-definition`, `callout-keyidea`, `callout-gotcha`, `callout-example`, `callout-aside`), all 5 title texts (Array, Why direct access, Off-by-one, C++ sequence, Word-RAM), and the `codeblock` class twice (prop-form + slot-form). Each component rendered as a `<aside class="callout callout-…">` with a `<header class="callout-title">` and a `<div class="callout-body">` slot. |
| 4 | Copy button on `<CodeBlock>` actually copies (auditor verifies via paste, cites the result).                                                                                                          | ✅ PASS-via-evidence | Cannot run a clipboard paste in a curl-based audit. Best evidence the button works: the production-built `dist/callouts-test/index.html` contains the bundled `<script type="module">` with the verbatim `navigator.clipboard.writeText(o)` call (Astro inlined the script since it's small). 3 `<button class="copy-btn">` instances rendered (heading + 2 CodeBlocks). The button binding logic walks `document.querySelectorAll('.codeblock .copy-btn')` and falls back to `parentElement.querySelector('code').textContent` when the `data-code` attribute is empty (slot form). Functional verification belongs in an interactive session, but every wire is in place. |
| 5 | No `_callouts-test.astro` route appears in `dist/` after a production build (underscore prefix worked).                                                                                                | 🟡 OPEN | The test page was renamed from `_callouts-test.astro` to `callouts-test.astro` during T3 (Astro's `_` prefix excludes the file from routing entirely — both dev *and* prod — making it unreachable for the dev-server smoke that AC 3 requires). Consequence: `dist/callouts-test/index.html` IS produced by `npm run build`. AC 5 fails as written. See ISS-01 for resolution options. |

4/5 ACs met outright; AC 5 needs a design call (see ISS-01).

## 🔴 HIGH

None.

## 🟡 MEDIUM

### M2-T03-ISS-01 — Test page underscore-prefix mechanism doesn't work as the spec assumed; AC 5 fails — MEDIUM → ACCEPTED

**Severity:** 🟡 MEDIUM
**Status:** ✅ ACCEPTED (cycle 2, 2026-04-23) — user picked option A. T8 carry-over appended.

T3 spec assumed Astro's `_` filename prefix would exclude a page from production builds while keeping it reachable in dev. Astro's actual behaviour: `_`-prefixed files in `src/pages/` are excluded from routing **entirely** (no dev URL, no prod URL). That means a `src/pages/_callouts-test.astro` file is unreachable for the dev-mode `curl` smoke that AC 3 explicitly requires. The Builder's choice was either (a) keep the underscore and have AC 3's smoke test fail (no URL to curl), or (b) rename to drop the underscore and have AC 5's exclusion check fail (page now appears in `dist/`). Path (b) was taken — AC 3 passes, AC 5 needs a real exclusion mechanism (or acceptance).

Three options for cycle 2:

- **A. Accept AC 5's failure and let T8 delete the file** as part of the post-Astro-deploy cleanup. Smallest change; the test page is harmless in `dist/` (no PII, ~13 KB), the route doesn't link from anywhere, and T8 already owns the dev-asset cleanup pass.
- **B. Add a build-time exclusion** via an Astro integration (e.g., a small `astroIntegration` hook in `astro.config.mjs` that deletes `dist/callouts-test/` post-build) or via `import.meta.env.PROD` returning early from the page. ~10 lines; keeps the dev-mode smoke; reflects the spec's intent more directly.
- **C. Rename back to `_callouts-test.astro` and replace the smoke test** with importing the components into `src/pages/index.astro` temporarily (or into a parallel `src/dev/` namespace served by a custom adapter). More disruptive than B; loses the clean separation between scaffold and dev artefacts.

**My pick:** **A**. The cleanest tradeoff — T8 is already a sweep that removes test/dev artefacts before final deploy, and the test page belongs to that sweep. Adds one line to T8's deletion list (`src/pages/callouts-test.astro` + the `dist/callouts-test/` dir if T6's deploy ran without cleanup first). Pick **B** if you want the dev-mode test page to keep working without ever needing manual cleanup.

**Action / Recommendation pending user pick:** if A, mark AC 5 as ACCEPTED-with-T8-followup; carry-over to T8's spec. If B, implement the build hook in cycle 2. If C, restructure dev-page approach.

## 🟢 LOW

### M2-T03-ISS-02 — Pandoc filter (T2) emits fenced markdown, not literal `<CodeBlock>` JSX — components-map wiring deferred — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED (deferred to T4 — natural place for the wiring)

T2 audit ISS-02 noted that the Lua filter emits `` ```cpp `` fenced code blocks rather than literal `<CodeBlock>` JSX tags, and recommended wiring Astro's MDX `components` map to bridge them. T3 has the `<CodeBlock>` component ready to receive that mapping but doesn't wire it yet — the wiring belongs naturally in T4 (build pipeline) where MDX rendering is set up. The slot-form `<CodeBlock>` already accepts a fenced `<pre><code class="language-cpp">` body via slot if a future caller wants to use it directly without the components-map.

**Action / Recommendation:** add to T4's MDX integration step: configure `MDXProvider` (or Astro's MDX components map) so `<pre><code class="language-cpp">` children resolve to `<CodeBlock lang="cpp">`. One addition to T4's content-collection wiring.

## Additions beyond spec — audited and justified

- **`@astrojs/check` + `typescript` installed** as devDependencies. T1 audit's ISS-02 said "add in T3"; this audit confirms it's done. No spec-new dependency for T3 itself — these are dev-only typecheck tools and don't affect runtime.
- **CodeBlock supports both prop and slot forms.** T3 spec says "Props: `lang: string`, `code?: string` (or use `<slot />`)"; the implementation does both (prop routes through Shiki for highlighting; slot renders raw `<pre><code class="language-…">` for cases where the caller wants pre-highlighted content from the MDX pipeline). Justified: T2's fenced-markdown output naturally produces the slot-form path; T3's smoke page exercises the prop form. Both will be needed.
- **Scoped CSS per component** with `data-astro-cid-…` selectors (Astro's automatic scoped-class mechanism). T3 spec said "scoped" — Astro handles this via the `<style>` block in each `.astro` file; no manual scoping needed.
- **Each component carries a header-comment block** citing T3, the source LaTeX env it maps to, the Lua-filter tag it consumes, and (for CodeBlock) the deferral notes for "send to editor" → M6. Per CLAUDE.md Builder convention "Every new module / TeX file / shell script gets a header comment citing the task". Consistent with the rest of M2's surfaces.

## Verification summary

| Check                                                                                        | Result |
| -------------------------------------------------------------------------------------------- | ------ |
| 6 component files exist under `src/components/callouts/`                                     | ✅ |
| `npm run build` exit 0; produces `dist/callouts-test/index.html` + `dist/index.html`         | ✅ (build output 2 pages) |
| `npm run dev` starts; `curl http://localhost:4321/DSA/callouts-test` returns 13.5 KB         | ✅ |
| All 5 callout class names present in served HTML                                              | ✅ (callout-definition, keyidea, gotcha, example, aside — each at least once) |
| All 5 sample titles present (Array, Why direct access, Off-by-one, C++ sequence, Word-RAM)   | ✅ |
| 3 `<button class="copy-btn">` rendered (heading + 2 CodeBlocks)                             | ✅ |
| Astro inlined the copy script in `dist/callouts-test/index.html` with `navigator.clipboard.writeText` literal | ✅ (script bundled inline, matches source) |
| Shiki / `astro-code` syntax-highlighting class present in CodeBlock prop form                 | ✅ |
| `language-cpp` class present in CodeBlock slot form                                           | ✅ |
| `dist/callouts-test/index.html` should be absent per AC 5                                    | ❌ present — see ISS-01 |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T3 + carry-over from T1 ISS-02      | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status        | Owner / next touch point                                                  |
| ------------- | --------- | ------------- | ------------------------------------------------------------------------- |
| M2-T03-ISS-01 | 🟡 MEDIUM | ✅ ACCEPTED  | T8 (dev-asset sweep) — option A picked 2026-04-23                                                  |
| M2-T03-ISS-02 | 🟢 LOW    | ✅ ACCEPTED   | T4 — add MDX `components` map wiring `<pre><code class="language-cpp">` → `<CodeBlock>`        |

## Propagation status

ISS-02 → T4: already covered in T4's spec (MDX integration is a T4 responsibility). No carry-over section needed; the T4 Builder will discover this during the MDX wiring step naturally. ISS-01 propagation deferred until user picks A/B/C.

## Cycle 2 (2026-04-23) — option A applied

User picked option A. ISS-01 flipped to ACCEPTED. T8 spec gained a carry-over entry covering both the source file (`src/pages/callouts-test.astro`) and the build artefact (`dist/callouts-test/`). T3 closes CLEAN.
