# T8 — Delete Jekyll scaffolding

**Status:** todo
**Depends on:** T6 (deploy green for one full cycle — see Notes)
**Blocks:** declaring M2 done

## Why

After T6 flips the live site to Astro, the Jekyll source files
(`_config.yml`, `_data/`, `_includes/`, `_layouts/`, top-level
`lectures/`, `notes/`, `index.md`, plus the Jekyll-specific subset
of `assets/`) are dead weight: not built, not deployed, just
historical clutter. T8 removes them and tightens the docs that
referenced them.

T8 is the *last* task because it removes the rollback path (T6
notes: if Astro deploy breaks, flip Pages source back to branch and
Jekyll resumes serving from these files). Wait for confidence T6
is stable before T8.

## Deliverable

- Remove: `_config.yml`, `_data/`, `_includes/`, `_layouts/`,
  top-level `lectures/`, top-level `notes/`, `index.md` (the
  Jekyll one — Astro replaces with `src/pages/index.astro`),
  Jekyll-specific subset of `assets/` (anything Astro doesn't use).
- Update `README.md` "Repository layout" section: remove the
  Jekyll line, replace with the Astro `src/` shape.
- Update `CLAUDE.md` "Repo layout" section: drop the Jekyll
  paragraph; remove the `feedback_no_jekyll_polish.md` reference
  (the rule itself can stay in memory but the comment in
  `Repo layout` is moot).
- Update `LICENSE` scope-statement header: drop the
  `lectures/, notes/  (Jekyll viewer wrappers — until M2 deletes them)`
  bullet (it's fulfilled).

## Steps

1. **Wait for T6 stability.** At least one full deploy cycle
   green; ideally a few days of "no one reported a broken page."
   Confirm with the user before starting T8.
2. **Inventory `assets/`.** Some assets may still be referenced by
   Astro pages (`src/`); only delete the Jekyll-specific ones. Run
   `grep -rn 'assets/' src/ | sort -u` to see what Astro actually
   uses.
3. **Pre-removal fail-loud check (per T5 contract).** Before any
   `git rm`, verify `_data/chapters.yml` is unreferenced anywhere
   in `src/` and `scripts/`:
   `grep -rn 'chapters\.yml' src/ scripts/` MUST return zero hits.
   If the grep finds anything, T5 didn't complete its migration —
   stop, fix T5, then resume T8. **Do not** delete the yml while
   any code still reads from it.
4. **Remove Jekyll files** in one commit (so the diff is reviewable):
   - `git rm _config.yml`
   - `git rm -r _data/ _includes/ _layouts/`
   - `git rm -r lectures/ notes/`
   - `git rm index.md`
   - `git rm -r assets/<jekyll-only-subdirs>`
5. **Update docs** in the same commit:
   - `README.md` repo-layout section.
   - `CLAUDE.md` repo-layout section + drop the Jekyll
     "placeholder infrastructure" paragraph.
   - `LICENSE` scope-statement header.
   - Memory: `feedback_no_jekyll_polish.md` — either delete it
     (rule is no longer load-bearing) or annotate it with a
     "post-M2 — historical only" header. Update the `MEMORY.md`
     index accordingly.
6. **Smoke**: re-run `npm run build` from a clean state, push,
   wait for T6 deploy, verify the public URL still works. (Removing
   Jekyll files shouldn't affect Astro build; this is a paranoia
   check.)
7. **CHANGELOG entry** for the removal under the current dated
   section.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `git ls-files | grep -E '^(_config\.yml|_data/|_includes/|_layouts/|lectures/|notes/|index\.md)'`
      returns empty.
- [ ] `npm run build` exits 0 from a clean checkout post-removal.
- [ ] **Auditor verifies** the deployed URL still serves the Astro
      site after the T8 commit hits `main` (cite the URL response,
      not just workflow-green per
      [CLAUDE.md](../../../CLAUDE.md#auditor-conventions)).
- [ ] `README.md` "Repository layout" section no longer mentions
      Jekyll.
- [ ] `CLAUDE.md` "Repo layout" no longer carries the Jekyll
      placeholder-infrastructure paragraph.
- [ ] `LICENSE` scope statement no longer mentions
      `Jekyll viewer wrappers`.
- [ ] `_data/chapters.yml` deletion was preceded by the fail-loud
      check (step 3) returning zero hits.
- [ ] `feedback_no_jekyll_polish.md` is either removed from
      `memory/` (and from `MEMORY.md` index) OR carries a
      "post-M2 — historical only" header. The active rule no
      longer applies.

## Carry-over from prior audits

- [ ] **M2-T03-ISS-01 — Delete the T3 callout-component smoke page.**
      Severity: 🟡 MEDIUM (origin) → ACCEPTED. T3 spec assumed Astro's
      `_` filename prefix would exclude `_callouts-test.astro` from
      production builds while keeping it routable in dev — Astro
      actually excludes from routing entirely (both modes). T3
      renamed the file to `callouts-test.astro` (no underscore) so
      AC 3's dev-mode `curl` smoke would work; consequence is
      `dist/callouts-test/index.html` ships in production until T8
      cleans it up. Scope: `git rm src/pages/callouts-test.astro`
      AND verify post-T6-redeploy that `dist/callouts-test/` is gone
      (the next clean build won't regenerate it). Source:
      [`../issues/T3_issue.md`](../issues/T3_issue.md) (option A
      picked 2026-04-23).

## Notes

- **`feedback_no_jekyll_polish.md` memory entry handling is now an
  AC**, not a Note. T8 step 5 + the AC list both require it to be
  either removed or annotated post-M2.
- **`_data/chapters.yml` migration is owned by T5**, not T8. T8 only
  *deletes* the file as part of the Jekyll sweep, after the
  fail-loud check (step 3) confirms nothing reads from it. If the
  fail-loud check finds hits, the contract is: stop and fix T5, do
  not work around it in T8.
- **`assets/` is mixed.** Don't blanket-delete. Some images / CSS
  may be used by Astro pages too. Step 2 inventory is mandatory.
