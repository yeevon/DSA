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

0. **Capture baseline before T1 implementation work starts** (resolves MUX-BO-ISS-03 / HIGH-3 + MUX-BO-DA-4 + MUX-BO-DA-5). The `~1.6 MB` figure cited in [`design_docs/m3_deploy_verification.md`](../../../m3_deploy_verification.md) is environment-dependent (Node version, npm cache state) — using it directly against a freshly-built M-UX tree means the `<50KB` budget compares two numbers produced under different environments, which is noise. Instead, **before any T1 code lands**, the auditor (or whoever picks up T1) captures a same-environment baseline.

   **Use a worktree, not a destructive checkout** (per MUX-BO-DA-5). `git checkout bf9c773` from the working branch is destructive — silently discards uncommitted changes that conflict with the target tree, and leaves you on a detached HEAD if you forget to switch back. Worktree avoids both:
   ```bash
   git worktree add /tmp/cs-300-baseline bf9c773
   (cd /tmp/cs-300-baseline && npm ci && npm run build)
   du -sh /tmp/cs-300-baseline/dist/client/                                        # bytes baseline
   find /tmp/cs-300-baseline/dist/client -name '*.html' | wc -l                    # should print 37
   du -cb /tmp/cs-300-baseline/dist/client/_astro/*.js | tail -1                   # JS bundle sum
   git worktree remove /tmp/cs-300-baseline
   ```
   If a worktree isn't an option (e.g., the partition is small): `git stash --include-untracked` first, then `git checkout bf9c773`, then `git checkout -` and `git stash pop` after — and verify `git status` is clean before resuming.

   **Where the baseline gets written** (per MUX-BO-DA-4). Create [`design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md`](../issues/pre_m_ux_baseline.md) (sibling to the breakout audit file). The breakout audit file is ✅ PASS (frozen), and T8's per-task issue file (`issues/T08_issue.md`) won't exist until T8's audit closes — neither is the right home. The dedicated `pre_m_ux_baseline.md` is created at baseline-capture time, holds the three pinned numbers + the exact command output + timestamp + Node/npm versions, and is referenced by Step 1 below + the audit-check bullet. Suggested structure:

   ```markdown
   # M-UX — pre-M-UX baseline
   **Captured:** YYYY-MM-DD HH:MM
   **Commit:** bf9c773 (M3 close)
   **Environment:** Node X.Y.Z, npm A.B.C, OS …
   ## Numbers
   - `du -sh dist/client/`: <bytes>
   - HTML page count: 37
   - `_astro/*.js` sum: <bytes>
   ## Command output
   <verbatim shell output>
   ```

   This step is non-skippable — without a same-environment baseline, the `<50KB` budget is unenforceable.
1. Read pre-M-UX baseline from [`issues/pre_m_ux_baseline.md`](../issues/pre_m_ux_baseline.md) (created in Step 0):
   - Pre-M-UX commit: `bf9c773` (M3 close commit).
   - Page count baseline: 37 (verified in Step 0).
   - `dist/client/` size baseline: pinned figure from `pre_m_ux_baseline.md` (replace any `~1.6 MB` placeholder with the captured value).
   - If `pre_m_ux_baseline.md` doesn't exist, **stop** — Step 0 was skipped. Re-run Step 0 before continuing.
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
- [ ] **Pre-M-UX baseline file exists at the pinned location** (resolves MUX-BO-ISS-03 / HIGH-3 + MUX-BO-DA-4) — file is `design_docs/milestones/m_ux_polish/issues/pre_m_ux_baseline.md`, sibling to the breakout audit file. It has the exact `du -sh dist/client/`, page-count, and `_astro/*.js` sum captured at `bf9c773` before T1 started, plus the command output, timestamp, and Node/npm versions. Auditor confirms the file exists and has real numbers (not the M3 T8 report's `~1.6 MB` placeholder).
- [ ] **Worktree (not destructive checkout) used to capture baseline** (resolves MUX-BO-DA-5) — `pre_m_ux_baseline.md`'s "Command output" section shows `git worktree add` + `git worktree remove` (or, if a worktree was infeasible, an explicit stash-and-restore sequence with a clean `git status` verification). Naked `git checkout bf9c773` followed by `git checkout main` would have risked discarding uncommitted work; the audit-check confirms it didn't happen.
- [ ] **Auditor runs** the build size comparison: pinned baseline (Step 0) vs current. Page count unchanged at 37. `dist/client/` size delta within budget (<50KB target — if exceeded, document why).
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
