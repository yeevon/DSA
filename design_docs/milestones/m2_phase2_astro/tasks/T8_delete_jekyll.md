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
  top-level `lectures/`, `top-level `notes/`, `index.md` (the
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
3. **Remove Jekyll files** in one commit (so the diff is reviewable):
   - `git rm _config.yml`
   - `git rm -r _data/ _includes/ _layouts/`
   - `git rm -r lectures/ notes/`
   - `git rm index.md`
   - `git rm -r assets/<jekyll-only-subdirs>`
4. **Update docs** in the same commit:
   - `README.md` repo-layout section.
   - `CLAUDE.md` repo-layout section + drop the Jekyll
     "placeholder infrastructure" paragraph.
   - `LICENSE` scope-statement header.
5. **Smoke**: re-run `npm run build` from a clean state, push,
   wait for T6 deploy, verify the public URL still works. (Removing
   Jekyll files shouldn't affect Astro build; this is a paranoia
   check.)
6. **CHANGELOG entry** for the removal under the current dated
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

## Notes

- **`feedback_no_jekyll_polish.md` memory entry can stay.** It's
  historical context that explains why M1 didn't polish those
  files; deleting the memory after the rule no longer applies is
  fine but not required. If you keep it, mark it with a "post-M2"
  note so future audits know it's no longer load-bearing.
- **`_data/chapters.yml` migration.** Per T5 notes, the per-chapter
  metadata in `_data/chapters.yml` should migrate into Astro
  content-collection frontmatter before this file is removed. If
  T5 didn't already do that migration, T8 step 3 must include it
  (otherwise chapter titles vanish from the deployed site).
- **`assets/` is mixed.** Don't blanket-delete. Some images / CSS
  may be used by Astro pages too. Step 2 inventory is mandatory.
