# T8 — Deploy verification: 37 pages, size budget, no regressions

**Status:** todo
**Depends on:** T1, T2, T3, T4, T5, T6, T7 (all M-UX work)
**Blocks:** —

## Why

M-UX touches every page on the site (new layout shell, new index, re-homed M3 surfaces, mobile sweep). T8 is the safety check: confirm the public deploy still ships 37 prerendered chapter pages, the GH Pages payload size hasn't blown out, the M3 deploy contract from M3 T8 still holds, and no server-only code leaks into the client bundles. Mirrors the M3 T8 shape — non-inferential, evidence-based.

## Deliverable

- `design_docs/m_ux_deploy_verification.md` — verification report with 5 sections matching the M3 T8 precedent:
  1. Build size + page count diff (vs pre-M-UX baseline).
  2. Static-mode behavioural verification (chrome renders SSR; M3 surfaces still gated; no JS errors).
  3. Bundle inspection (no server-only paths in `dist/client/_astro/*.js`).
  4. M3 deploy contract preserved (hybrid-output split, GH Pages workflow path still correct).
  5. Runtime push verification (deferred to user push — same procedural posture as M2 T6 + M3 T8).
- No source code changes — T8 is pure verification + documentation.

## Steps

1. Capture pre-M-UX baseline:
   - Pre-M-UX commit was `bf9c773` (M3 close commit). Build that commit's tree (or read its dist/client size from prior records).
   - Page count baseline: 37.
   - `dist/client/` size baseline: ~1.6 MB (from M3 T8 verification report).
2. Build current tree: `npm run build`. Capture:
   - Page count: should still be 37.
   - `dist/client/` total size.
   - `dist/client/_astro/*.js` size delta — M-UX adds the drawer island + scroll-spy + completion-indicator + read-status indicators in TOC. Budget target: total size delta <50KB.
3. Static-mode behavioural verification (no dev server needed — inspect built HTML):
   - Open `dist/client/lectures/ch_1/index.html` in a browser via `npm run preview` or by serving `dist/client/` with any static server.
   - Confirm at desktop width: three-column layout renders (left rail with chapter list + Required/Optional grouping, center content, right rail with TOC).
   - Confirm `<body data-mode="static">` server-rendered default (T5 contract from M3).
   - Confirm `data-interactive-only` CSS rule still hides matched elements (annotations pane absent, completion checkmarks absent, dashboard slots on `/DSA/` absent).
   - Confirm scroll-spy script bundled but inert (no API errors, no broken UI).
4. Bundle inspection — grep `dist/client/_astro/*.js` for server-only path leaks:
   - `better-sqlite3` — must be 0.
   - `drizzle` — must be 0.
   - `gray-matter` — must be 0.
   - `src/lib/seed` — must be 0.
   - `src/db` — must be 0.
   - All clean (matches M3 T8 baseline). Server-only modules stay in `dist/server/chunks/`.
5. M3 deploy contract verification:
   - `dist/` shape: `dist/client/` + `dist/server/`.
   - `.github/workflows/deploy.yml` `actions/upload-pages-artifact@v3` `path:` still reads `./dist/client` (M3 T8 fix).
   - 37 prerendered HTML files in `dist/client/`.
   - No `dist/api/` directory.
6. Mobile-mode verification:
   - Same `dist/client/lectures/ch_1/index.html` opened with DevTools at 375px width.
   - Drawer hamburger visible. Click — drawer slides in. Chapter list inside. Esc closes.
   - Right-rail TOC collapsed in `<details>` at top of content. Expands on click.
7. Write the report at `design_docs/m_ux_deploy_verification.md`. Include:
   - Build size table (pre-M-UX vs post-M-UX, with deltas).
   - Behavioural verification table (each contract checked, pass/fail).
   - Bundle inspection table (each search term, file count).
   - Hybrid-output preservation note + workflow path confirmation.
   - Runtime push verification placeholder ("pending user push").
8. Update `m_ux_polish/README.md` Done-when checkboxes per the verification result.
9. CHANGELOG entry under the M-UX dated section (close-out commit will land that).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `design_docs/m_ux_deploy_verification.md` exists with all 5 sections + cited numbers (size deltas, search-term counts, behavioural observations).
- [ ] **Auditor runs** the build size comparison: pre-M-UX baseline vs current. Page count unchanged at 37. `dist/client/` size delta within budget (<50KB target — if exceeded, document why).
- [ ] **Auditor runs** static-mode behavioural verification — opens a built chapter page in a browser at 1280px, confirms three-column layout. At 375px, confirms single-column with hamburger drawer. Cites screenshots or DevTools assertions.
- [ ] **Auditor greps** `dist/client/_astro/*.js` for the 5 server-only terms — all return 0.
- [ ] M3 T8 deploy contract still preserved: `.github/workflows/deploy.yml` path reads `./dist/client`, `dist/` splits into `client/` + `server/`, no `dist/api/`. Each prerendered page carries the Astro generator meta.
- [ ] **Mobile drawer smoke** — auditor opens a built page at 375px, clicks hamburger, drawer opens, chapter links work, Escape closes, focus management correct (focus returns to hamburger). Cite the observation.
- [ ] M3 surfaces still hidden in static mode: annotations pane, completion checkmarks, dashboard slots all absent from rendered HTML at static-mode boot.
- [ ] CHANGELOG entry under 2026-04-XX (date of T8 close) summarises the M-UX milestone with the size budget result + any deferred follow-ups.
- [ ] Runtime push verification — flagged as pending user push (same posture as M2 T6 + M3 T8).

## Notes

- **Size budget rationale.** <50KB is generous. M-UX adds: ~3KB drawer JS, ~2KB scroll-spy JS, ~2KB completion-indicator JS, ~5–10KB chrome CSS, plus the Astro component-generation overhead. Realistic delta is probably 15–25KB. The 50KB cap is the alarm threshold, not the target.
- **No new dependency check.** M-UX uses native CSS + native DOM APIs only. `package.json` should be byte-identical pre-M-UX vs post-M-UX. T8 verifies (`git diff bf9c773 HEAD -- package.json package-lock.json` returns empty). If anything has changed, surface as a HIGH finding.
- **Preview vs dev for verification.** Use `npm run preview` (built artifacts) — that's what GH Pages serves. Don't verify against `npm run dev` (different bundling, different reload semantics).
- **Decompose trigger.** If T8 surfaces a HIGH regression (size blow-out, server-leak, M3 surface broken), file as a finding and re-open the relevant T1–T7 task to fix. Don't band-aid in T8.
- **Runtime push verification.** Same procedural pattern as M3 T8: T8 closes with the deploy contract verified locally; user pushes; the GH Pages workflow runs; user confirms the live site renders correctly. T8 cannot push.
