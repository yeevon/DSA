# T6 — Replace GitHub Pages workflow

**Status:** todo
**Depends on:** T1, T3, T4, T5 (functional Astro build end-to-end)
**Blocks:** T8

## Why

Today GitHub Pages builds the site via Jekyll (the implicit
`pages-build-deployment` workflow consuming the `_config.yml` +
`lectures/`, `notes/`, etc.). Once T1–T5 land, the source of truth
becomes the Astro-built `dist/` — but Pages will keep building from
Jekyll until the workflow is replaced. T6 swaps in a Node-based
workflow that builds Astro and deploys `dist/` via the official
`actions/deploy-pages` flow.

⚠️ **This is the destructive step that flips the live site.** A
botched T6 takes the public URL down or shows the wrong content.
Land T1–T5 cleanly first; merge T6 deliberately and verify the
public URL renders post-merge.

## Deliverable

`.github/workflows/deploy.yml` containing:

- Trigger on push to `main` (and `workflow_dispatch` for manual
  reruns).
- Setup Node (matching the version pinned in T1).
- `npm ci` (not `npm install` — reproducible).
- `npm run build` (which fires T4's prebuild → T2's filter → Astro
  build).
- Upload `dist/` as a Pages artifact.
- Deploy via `actions/deploy-pages@v4` (or current).
- Required permissions: `pages: write`, `id-token: write`.

Plus a one-time GitHub Pages settings change: switch the source
from "Deploy from a branch" to "GitHub Actions".

## Steps

1. **Land T1–T5 first.** Verify locally that `npm run build`
   produces a `dist/` that, if served, would be the intended live
   site. T6 is not the place to debug build issues.
2. **Author the workflow** at `.github/workflows/deploy.yml`. Use
   the official Astro + GitHub Pages template
   (<https://docs.astro.build/en/guides/deploy/github/>) as the
   starting point — don't reinvent.
3. **Settings flip.** In repo settings → Pages, change source from
   "Deploy from a branch" to "GitHub Actions". This is a one-time
   manual step the user does in the GitHub UI; document it in the
   PR description so it's not silently missed.
4. **Verify on a non-default branch first.** Push the workflow on
   a branch named e.g. `m2-t6-deploy`; trigger via
   `workflow_dispatch` or open a PR. Check the workflow log for
   green; check the deployed URL (the action surfaces the URL).
   `curl -s <URL>/DSA/lectures/ch_1/` should return Astro-built
   HTML, not Jekyll output.
5. **Merge to `main`** only after the branch verification passes.
   Re-verify the public URL post-merge.
6. **Disable / archive the implicit Jekyll deployment** if it doesn't
   auto-disable. (Switching the Pages source should be enough; if
   the old `pages-build-deployment` runs still appear in Actions,
   they're harmless — they don't deploy when the source isn't a
   branch.)

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `.github/workflows/deploy.yml` exists and is syntactically
      valid (`actionlint` or GitHub's workflow-validate).
- [ ] **Auditor verifies** at least one workflow run on a branch
      completed green (cite the run URL).
- [ ] **Auditor curls** the deployed URL post-merge and confirms
      Astro-built HTML, not Jekyll output. Specifically: a known
      Astro marker (e.g. `<meta name="generator" content="Astro
      v…">`) is in the response. Build-clean and workflow-green
      are not sufficient — the deployed bytes must be inspected
      per [CLAUDE.md](../../../CLAUDE.md#auditor-conventions).
- [ ] Repo Pages settings show "GitHub Actions" as the source.
- [ ] **Manual settings-flip is explicitly called out in the PR
      description** (since this step happens outside the diff and is
      otherwise invisible). PR description must include: (a) "Pages
      source flipped from branch to GitHub Actions in repo settings"
      and (b) the date/time of the flip. Future audits looking at
      the PR alone need to know the manual step was done.

## Notes

- **Don't delete the Jekyll files yet.** That's T8. T6 swaps the
  build, not the source files. Until T8, the Jekyll files sit
  inert (Pages no longer builds from them once the source is set
  to Actions).
- **Rollback plan.** If T6 ships a broken site: in Pages settings,
  flip source back to "Deploy from a branch" → `main` / `(root)`.
  Jekyll will pick back up from the still-present `_config.yml`
  etc. This is why T8 (delete Jekyll files) waits a full deploy
  cycle after T6.
- **Stop and ask the user** before merging the T6 PR. Per
  [`../../../CLAUDE.md`](../../../CLAUDE.md): destructive ops on
  shared state need explicit confirmation. Live-site swap qualifies.
