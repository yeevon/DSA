# T1 — Scaffold Astro project

**Status:** todo
**Depends on:** —
**Blocks:** T3, T4, T5, T6, T8 (and effectively the whole milestone)

## Why

M2 cannot proceed without an Astro project on disk. Today the repo
has only Jekyll site files (`_config.yml`, `_data/`, `_includes/`,
`_layouts/`, top-level `lectures/`, `notes/`, `index.md`,
`assets/`). Astro replaces these (per
[`../README.md`](../README.md) and
[`../../../architecture.md`](../../../architecture.md) §1).

T1 is the smallest viable Astro project: scaffold, install, hello-
world page, build to `dist/`. No chapter content yet — that's T4/T5.
This separation keeps the scaffold self-contained and lets T3 (callout
components) and T2 (Lua filter) start in parallel against a known
project shape.

## Deliverable

An Astro project rooted at the repo root, with these files /
directories present and committed:

- `package.json` — Astro + minimal deps; `npm` scripts for `dev`,
  `build`, `preview`.
- `astro.config.mjs` — site URL set to the GitHub Pages URL,
  output `static`, integrations as needed (none required at T1).
- `tsconfig.json` — strict mode.
- `src/pages/index.astro` — hello-world placeholder.
- `src/layouts/Base.astro` — minimal HTML shell (header, main, footer
  slots — actual styling in T3 / later).
- `public/` — empty for now, **except** `public/audio/.gitkeep`. The
  audio file layout is pinned by
  [`../../architecture.md`](../../architecture.md) §1.4 (`public/audio/ch_N.{mp3,timestamps.json}`)
  to avoid M7 having to unwind a different choice. Materialising the
  empty dir at T1 is the cheapest way to honour the pin. Actual MP3s
  / JSON ship in M7.
- `.gitignore` updates: `node_modules/`, `dist/`, `.astro/`.

## Steps

1. Run `npm create astro@latest` in a temp directory. Pick the
   "minimal" template, TypeScript strict.
2. Copy the relevant pieces into the cs-300 repo root: `src/`,
   `astro.config.*`, `package.json`, `tsconfig.json`. Don't copy
   the temp template's `README.md` — keep ours.
3. `npm install` from repo root. Verify `node_modules/` is gitignored
   (add to `.gitignore` if not).
4. Edit `astro.config.mjs`:
   - `site: 'https://yeevon.github.io'`
   - `base: '/DSA/'` (matching the existing GitHub Pages mount)
   - `output: 'static'`
5. Replace the default `src/pages/index.astro` with a one-line
   placeholder ("cs-300 — Astro scaffold (M2 T1)") so the build has
   something concrete to render.
6. Add a `Base.astro` layout under `src/layouts/` — empty shell, no
   styling yet.
7. `mkdir -p public/audio && touch public/audio/.gitkeep` — pins the
   M7 audio file layout per architecture.md §1.4 without shipping any
   audio yet.
8. **Do not** wire pandoc, content collections, or callout components
   in this task. Those are T2, T4, T5, T3 respectively.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `npm install` exits 0 from a clean `node_modules/`.
- [ ] `npm run build` exits 0 and produces `dist/index.html`
      containing the placeholder text.
- [ ] `npm run dev` starts on a local port; `curl -s
      http://localhost:<port>/DSA/` returns the placeholder text.
      (Auditor must actually run this — build success ≠ runtime
      correctness per
      [CLAUDE.md](../../../CLAUDE.md#auditor-conventions).)
- [ ] `git status` shows `node_modules/` and `dist/` are untracked
      (gitignored).
- [ ] `public/audio/.gitkeep` exists and is tracked (the dir is
      materialised per architecture.md §1.4 even though M7 fills it).

## Notes

- T1 is intentionally lean. A full Astro project with content,
  components, and routing is built up across T2–T5; trying to land
  it all here would balloon.
- The `base: '/DSA/'` matches the current GH Pages URL so T6's
  workflow swap can be a like-for-like deploy. If you change this,
  update T6 step 3.
- Pin `node` version via `.nvmrc` or `package.json` `engines` so
  CI in T6 has a stable target.
