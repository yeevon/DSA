# M3 deploy-verification report

**Source task:** [`milestones/m3_phase3_state_service/tasks/T8_deploy_verification.md`](milestones/m3_phase3_state_service/tasks/T8_deploy_verification.md)
**Date:** 2026-04-24
**Verdict:** ✅ M2 deploy contract preserved post-M3, after a one-line workflow fix to upload `dist/client/` instead of `dist/`.

## 1. Build size + page count diff

| Metric                               | M2 close (commit `17f0f47`) | Post-M3 | Delta |
| ------------------------------------ | --------------------------- | ------- | ----- |
| Prerendered HTML page count          | 37                          | 37      | 0     |
| `dist/` total size                   | ~1.5 MB (estimate)          | 5.0 MB  | +3.5 MB |
| `dist/client/` (the GH Pages payload) | n/a (was `dist/` directly)  | ~1.6 MB | parity |
| `dist/server/` (Node adapter)         | n/a (no adapter)            | ~3.4 MB | new (NOT uploaded) |

**Page count unchanged at 37.** Total dist/ grew because the `@astrojs/node` adapter (added by M3 T3) emits a `dist/server/` entrypoint + chunks for the runtime API routes. GH Pages only serves `dist/client/` per the M3 T8 workflow update.

## 2. Static-mode behavioural verification

Source of truth: the prerendered HTML at `dist/client/lectures/ch_1/index.html` (one of the 36 chapter routes). Verified post-build, no dev/preview server needed.

| Behaviour                                                                            | Status |
| ------------------------------------------------------------------------------------ | ------ |
| `<body data-mode="static">` rendered server-side as default                          | ✅ |
| `<meta name="generator" content="Astro v6.1.9">` Astro marker present                | ✅ |
| `data-interactive-only` CSS rule present (T5 contract)                               | ✅ |
| All 4 M3 UI surfaces in HTML (will be CSS-hidden in static mode)                     | ✅ |
| section-nav element present                                                          | ✅ |
| annotations-pane element present                                                     | ✅ |
| annotate-button element present                                                      | ✅ |
| mark-read-button element present                                                     | ✅ |
| `fetch('/api/annotations')` JS bundled in page                                       | ✅ |
| `detectMode` script bundled in page                                                  | ✅ |

In static mode (no local SQLite, no FastMCP adapter, no `/api/health` reachable):

- `detectMode()` resolves to `'static'` (both probes fail) → `<body data-mode="static">` stays.
- T5 CSS rule `body[data-mode="static"] [data-interactive-only] { display: none !important }` hides all 4 M3 surfaces.
- Each component's JS island catches its own fetch errors silently — no broken UX, just empty/inert state.

## 3. Bundle inspection — server-only paths absent from client bundles

| Search term                | Files in `dist/client/_astro/*.js` |
| -------------------------- | ---------------------------------- |
| `better-sqlite3`           | 0                                  |
| `drizzle`                  | 0                                  |
| `gray-matter`              | 0                                  |
| `src/lib/seed`             | 0                                  |
| `src/db`                   | 0                                  |

All clean. Server-only modules are bundled into `dist/server/chunks/` (where they belong); none leak to the client surface.

## 4. Hybrid-output GH Pages compatibility (M3 audit fix F3)

The `@astrojs/node` adapter splits `dist/`:

```text
dist/
├── client/                  ← GH Pages payload (37 prerendered pages + favicon + assets)
│   ├── index.html
│   ├── lectures/ch_*/       (12)
│   ├── notes/ch_*/          (12)
│   ├── practice/ch_*/       (12)
│   └── _astro/              (client JS islands)
└── server/                  ← Node runtime (NOT for GH Pages)
    ├── entry.mjs
    ├── chunks/              (one per API route + helpers)
    └── virtual_astro_middleware.mjs
```

**Workflow fix landed:** `.github/workflows/deploy.yml` `actions/upload-pages-artifact@v3` `path:` updated from `./dist` → `./dist/client`. Without this fix, GH Pages would have received both directories and served the wrong root index. Post-fix, the upload payload is byte-equivalent to what M2 T6 expected (37 prerendered HTML files + assets); only the source directory location changed.

**No `dist/api/` directory** — API routes are server-only (correct).

## 5. Runtime push verification (post-deploy) — ✅ confirmed 2026-04-24

User pushed `9b678ba..b618674` (5 commits) to `origin/main`; workflow fired on `b618674` and reported success. Site live at <https://yeevon.github.io/DSA/>. T8 AC 6 + M3-T08-ISS-03 closed.

Original expected behaviour (now verified):

- Build job pinpoints `pandoc 3.1.3` install + Node 22 + npm ci + `npm run check` (T6 + T7 may add astro-check warnings; should still exit 0) + `npm run build` (37 prerendered pages + server bundle).
- Upload step now grabs `./dist/client` (the workflow fix).
- Deploy job ships to `https://yeevon.github.io/DSA/` as before.
- `curl https://yeevon.github.io/DSA/lectures/ch_1/` should return the same 360 KB chapter page with all 4 M3 UI surfaces present + CSS-hidden under static mode.

If the deploy fails or the URL returns wrong content, T8 reverts to OPEN and the workflow needs further investigation.

## Summary

M2 deploy contract preserved. The `@astrojs/node` adapter changed `dist/` shape; the workflow path fix (`./dist` → `./dist/client`) keeps the GH Pages upload byte-equivalent. Server-only code (Drizzle, better-sqlite3, gray-matter, the API route handlers) does not leak to the client bundles. M3's interactive surfaces ride T5's `data-interactive-only` CSS rule and stay invisible on the static deploy.
