# M-UX — pre-M-UX baseline

**Captured:** 2026-04-24 (pre-T1 implementation)
**Commit:** `bf9c773` (M3 close — `Close M3 (Phase 3 — State service)`)
**Captured by:** M-UX T1 Builder, Step 0 (resolves MUX-BO-DA2-C / MEDIUM)
**Environment:** Node v22.22.2, npm 10.9.7, pandoc 3.1.3
**Capture method:** `git worktree add /tmp/cs-300-baseline bf9c773` (non-destructive — working tree on `main` was preserved with uncommitted changes; no checkout, no stash). Worktree removed after capture.

## Pre-M-UX baseline

The three pinned numbers used as the pre-M-UX deploy artefact baseline. T8's
`<50KB` size budget compares the post-M-UX `dist/client/` total against this
file's `dist/client/` total. Same Node + npm + pandoc as the post-M-UX build is
the precondition for the comparison to be signal rather than environment noise.

| Metric                                    | Value           |
| ----------------------------------------- | --------------- |
| `du -sh dist/client/`                     | `4.5M`          |
| `du -sb dist/client/` (bytes)             | `4420947`       |
| HTML page count (`find … -name '*.html'`) | `37`            |
| `_astro/*.js` sum (bytes)                 | `0` (no `_astro/` dir at baseline) |

**Note on the `_astro/*.js` figure.** At commit `bf9c773` (M3 close), no
component shipped client-side JS via Astro's `_astro/` bundle directory.
The M3 islands (`MarkReadButton`, `SectionNav`, `AnnotateButton`,
`AnnotationsPane`) are all `.astro` components with inline `<script>` blocks
that are emitted into the prerendered HTML directly, not split into hashed
bundles under `dist/client/_astro/`. The `_astro/` directory itself does not
exist in the baseline `dist/client/` tree — `du` therefore sums to 0. T8's
budget comparison should treat post-M-UX `_astro/*.js` (if any directory
appears, e.g. from a `client:load` drawer island) as net-new bytes against a
0-byte baseline, and roll those into the overall `dist/client/` total delta.

## Command output (verbatim)

```text
$ git worktree add /tmp/cs-300-baseline bf9c773
Preparing worktree (detached HEAD bf9c773)
HEAD is now at bf9c773 Close M3 (Phase 3 — State service)

$ cd /tmp/cs-300-baseline && npm ci
(installed; npm audit warned about transitive deps — pre-existing, not blocking)

$ PATH="/tmp/pandoc-wrapper:$PATH" npm run build
> cs-300@0.0.1 prebuild
> node scripts/build-content.mjs
[build-content] starting
... (12 chapters × 3 collections built clean)
19:04:47 ✓ Completed in 928ms.
19:04:47 [build] Rearranging server assets...
19:04:47 [build] ✓ Completed in 15.45s.
19:04:47 [build] Server built in 15.98s
19:04:47 [build] Complete!

$ du -sh dist/client/
4.5M    dist/client/

$ du -sb dist/client/
4420947 dist/client/

$ find dist/client -name '*.html' | wc -l
37

$ ls dist/client/_astro/ 2>&1
ls: cannot access 'dist/client/_astro/': No such file or directory

$ git worktree remove /tmp/cs-300-baseline
```

## Notes

- The `pandoc-wrapper` is a one-line shell shim that calls
  `/tmp/pandoc-local/usr/bin/pandoc --data-dir=/tmp/pandoc-local/usr/share/pandoc/data "$@"`.
  It exists only because this build environment has no system-wide pandoc —
  a sandbox-extracted Debian `pandoc_3.1.3+ds-2_amd64.deb` is the local
  binary source. The wrapper is purely a packaging artifact; the pandoc
  binary version (3.1.3) matches `.pandoc-version` exactly.
- `pre_m_ux_baseline.md` lives under `issues/` (sibling to
  `m_ux_breakout_audit.md`) per MUX-BO-DA-4. The breakout audit file is
  ✅ PASS / frozen, and T8's per-task issue file does not exist yet — neither
  was the right home.
- T8 reads this file in its Step 1 (post-M-UX comparison). If the file is
  missing at T8 time, T8 stops and re-runs Step 0; it must not retro-capture
  against an M-UX-touched tree (which would compare current-environment to
  current-environment and budget-noise the result).
