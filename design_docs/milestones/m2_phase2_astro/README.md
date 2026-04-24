# M2 — Phase 2: Jekyll → Astro migration

**Maps to:** `interactive_notes_roadmap.md` Phase 2
**Status:** todo (8 tasks broken out 2026-04-23 — see [`tasks/`](tasks/))
**Depends on:** M1 (Phase 1 close-out — pandoc verdict + acceptance criteria)
**Unblocks:** M3 (state service hangs off Astro API routes), M7 (audio islands)

## Goal

Replace the Jekyll placeholder site with an Astro static build that
reads `chapters/*.tex` through pandoc, renders into the component
library defined in `architecture.md` §1, and ships to GitHub Pages
identically to today's `dist/`. Public output stays read-only;
M3 wires the interactive surfaces.

## Done when

- [ ] `npm run build` produces `dist/` containing static HTML for
      every chapter (lectures + notes + practice) plus an index.
- [ ] `astro dev` serves the same content live with HMR.
- [ ] Pandoc + Lua filter (or manual ports per the M1 verdict)
      produces `src/content/{lectures,notes,practice}/ch_N.mdx`
      from `chapters/ch_N/{lectures,notes}.tex` +
      `chapters/ch_N/practice.md`.
- [ ] All five callout components exist under
      `src/components/callouts/`: `<Definition>`, `<KeyIdea>`,
      `<Gotcha>`, `<Example>`, `<Aside>`. Match the LaTeX
      environments 1:1.
- [ ] `<CodeBlock lang="…">` renders syntax-highlighted code with
      a copy button. (No "send to editor" yet — M6.)
- [ ] Section anchors `<a id="ch_N-section-slug">` are emitted by
      the pipeline. These are the stable IDs M3's `sections.anchor`
      will reference.
- [ ] GitHub Pages deploy from `dist/` works end-to-end (replace
      the Jekyll workflow).
- [ ] Old Jekyll files removed: `_config.yml`, `_data/`,
      `_includes/`, `_layouts/`, top-level `lectures/`, `notes/`,
      `index.md`. Replaced by Astro equivalents.
- [ ] Two `phase2_issues.md` items resolved (or deliberately
      carried forward): stale companion-materials line in chapter
      `lectures.tex`; `resources/week_2.tex` "Cheatsheet" heading.

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                              | Status |
|-----|-------------------------------------------------------------------|--------|
| T1  | [Scaffold Astro project](tasks/T1_scaffold_astro.md)              | todo   |
| T2  | [Build pandoc Lua filter (HYBRID)](tasks/T2_lua_filter.md)        | todo   |
| T3  | [Callout component library](tasks/T3_callout_components.md)       | todo   |
| T4  | [Pandoc → Astro build pipeline](tasks/T4_build_pipeline.md)       | todo   |
| T5a | [Chapter-listing index + chapters.json migration](tasks/T5a_content_collections.md) | ✅ done 2026-04-23 |
| T5b | [Dynamic chapter routes + pandoc → MDX safety bridge](tasks/T5b_dynamic_routes.md)  | todo |
| T6  | [Replace GitHub Pages workflow](tasks/T6_pages_workflow.md)       | todo   |
| T7  | [Resolve `phase2_issues.md` items](tasks/T7_phase2_issues_cleanup.md) | todo |
| T8  | [Delete Jekyll scaffolding](tasks/T8_delete_jekyll.md)            | todo   |

See [`tasks/README.md`](tasks/README.md) for ordering guidance, the
infra-first vs content-first sequence, and status conventions.
Mirror status changes between the per-task file and the table above.

## Open decisions resolved here

- **Pandoc Lua filter vs manual port** — already decided in M1's
  probe. M2 just executes the verdict.

## Out of scope

- **Interactive UI.** No question generation, no review queue, no
  code editor, no annotations. Static content only. Mode detection
  (architecture.md §4) is implemented as a stub that always returns
  `'static'` until M3 lands the state service.
- **Audio.** File layout is pinned (`public/audio/ch_N.{mp3,timestamps.json}`)
  per architecture.md §1.4 — but no `<AudioPlayer>` component yet
  (M7).
- **Annotations / read-status indicators.** UI surfaces that depend
  on M3.

---

## Carry-over from prior audits — redistributed 2026-04-23

The two M1 forward-deferrals (M1-T02-ISS-02 pin pandoc version,
M1-T02-ISS-03 raw-passthrough sweep across 12 chapters) have been
absorbed into [`tasks/T2_lua_filter.md`](tasks/T2_lua_filter.md)
(steps 1 + 3, plus matching acceptance checks). The originating
issue file at
[`../m1_phase1_closeout/issues/T2_issue.md`](../m1_phase1_closeout/issues/T2_issue.md)
will flip both from `DEFERRED → RESOLVED` once T2 lands.
