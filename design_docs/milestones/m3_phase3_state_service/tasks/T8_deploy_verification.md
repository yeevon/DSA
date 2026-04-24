# T8 — Verify M2 public deploy unaffected

**Status:** todo
**Depends on:** T6, T7 (the surfaces that could leak interactive code into prod)
**Blocks:** declaring M3 done

## Why

Per [M3 README](../README.md) Done-when: *"Verify the public deploy (M2) is unaffected: `detectMode()` returns `'static'`, all interactive UI hidden, build artifact identical."*

[Architecture.md §4](../../../architecture.md): *"Build artifact is identical in both modes. No separate 'local build' — the public and local sites are the same `dist/`. Feature detection alone flips the UI."*

T8 is the contract check: M3's interactive surfaces (annotations, read-status, mode-detection plumbing) ship in `dist/` but stay invisible/inert when no adapter or state service is reachable. The public deploy at <https://yeevon.github.io/DSA/> should look + behave identically post-M3 to pre-M3.

## Deliverable

`design_docs/m3_deploy_verification.md` — short report with three sections:

1. **Build size diff.** Pre-M3 baseline (M2 close: 37 pages, dist size). Post-M3 (after T6+T7 land): same 37 pages, dist size delta = bytes added by the new JS islands + CSS. Document the absolute + relative growth.
2. **Static-mode behavioural verification.** `npm run preview` (no `/api/health` reachable, no adapter), curl the deployed URL OR use a Playwright-style navigation:
   - `<body data-mode="static">` on every page.
   - Annotations pane: not visible (display: none via T5 CSS).
   - Mark-read buttons: not visible.
   - Section-nav read-status dots: all grey / not visible.
   - Selection on chapter content: no Annotate button appears (the JS island is mounted but the click handler bails when in static mode — verify).
3. **Bundle inspection.** `dist/_astro/` JS bundles still load without errors (no broken imports). Optional: confirm the API route stubs from T3 are NOT bundled into client JS (server-only).

## Steps

1. Compare build sizes:
   - Get M2 close baseline: check git log around commit `17f0f47` (M2 close): page count, `du -sh dist/`. Save the numbers.
   - Run `npm run build` post-M3 work; record same numbers.
   - Diff: pages should still be 37 (no new routes added by M3 — annotations/read-status are components inside existing chapter routes, not new pages); JS bundle size should grow by the new island code.
2. Static-mode behavioural verification:
   - `npm run preview` (serves dist/ as if it were the deployed site, but with no adapter/state-service running).
   - Open a chapter page in a real browser; check the four behavioural points above.
   - Capture screenshots OR DevTools console output as evidence (the audit needs more than a curl — these are JS-runtime behaviours).
3. Bundle inspection:
   - `find dist/_astro -name '*.js'` → for each bundle, grep for server-only paths (`api/`, `db/`, `seed`, `drizzle`). None should appear.
   - If any do: that's a regression in T6/T7 — likely an import path that crossed the client/server boundary.
4. **Hybrid-output GH Pages compatibility check** (T3 switched `output: 'static'` → `'hybrid'` for the API routes). The static-deploy contract from M2 T6 (`actions/upload-pages-artifact@v3` uploads `dist/`) still has to work:
   - Confirm `dist/` after `npm run build` contains all 37 prerendered chapter pages (`find dist -name 'index.html' | wc -l` → 37).
   - Confirm no API-route handler artefacts that GH Pages would mis-serve (e.g., no `dist/api/` HTML for API routes; the hybrid-output API routes are server-only and should not appear in `dist/`).
   - Confirm M2's existing pages still have `prerender: true` (default in hybrid is debatable; T3 step 1 should have made every page explicit). If a chapter page accidentally lost prerender, the GH Pages deploy would 404 it.
5. Push the local commits + verify the actual GitHub Actions deploy ships the same `dist/`. Curl the live URL post-deploy: same checks as step 2 (mode = static, no interactive surfaces visible).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `design_docs/m3_deploy_verification.md` exists with all 3 sections + cited numbers.
- [ ] **Auditor runs** the build size comparison; documents pre/post sizes with the absolute delta. Page count unchanged at 37.
- [ ] **Auditor runs** `npm run preview` and verifies in a real browser (or via DevTools-driven screenshots): static mode, annotations hidden, read-status hidden, no Annotate button on selection. Cite the verification in the audit issue file.
- [ ] **Auditor greps** `dist/_astro/*.js` for `drizzle`, `seed`, `better-sqlite3` — finds zero matches (server-only, not in client bundles).
- [ ] **Auditor confirms hybrid-output GH Pages compatibility**: `find dist -name 'index.html' | wc -l` → 37; no `dist/api/` directory (or if present, contains no HTML — only server entry points that GH Pages won't serve and don't need to); each chapter page has expected `<meta name="generator" content="Astro v…">` marker (proves prerender ran).
- [ ] **Auditor curls** the deployed URL post-push; same behavioural verification matches.

## Notes

- This is the "M3 doesn't break M2" contract. If T8 finds drift (unexpected page count, server code in client bundle, interactive UI flashing visible), that's a HIGH finding and triggers a cycle 2 of T6/T7 to fix the leak.
- Annotation pane CSS hiding via `data-interactive-only` is the cheap version. A more robust version is conditional rendering (don't even include the component in the static path) — defer to a cycle 2 only if the bundle-size delta is real (e.g., > 50 KB JS for the islands).
- T6/T7 components ship in static-mode `dist/` because Astro hybrid output bundles them anyway; the `data-interactive-only` CSS is what hides them. That's per architecture.md §4 ("build artifact identical in both modes"). Don't try to gate at build time.
