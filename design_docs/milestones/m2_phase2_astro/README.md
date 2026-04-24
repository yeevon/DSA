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

- [x] `npm run build` produces `dist/` containing static HTML for
      every chapter (lectures + notes + practice) plus an index. *(T5b — 38 routes; see [`issues/T5b_issue.md`](issues/T5b_issue.md).)*
- [x] `astro dev` serves the same content live with HMR. *(T1 dev-server smoke + T3 + T5b dev-server curls.)*
- [x] Pandoc + Lua filter produces
      `src/content/{lectures,notes,practice}/ch_N.mdx` from
      `chapters/ch_N/{lectures,notes}.tex` + `chapters/ch_N/practice.md`. *(T2 + T4 — see [`issues/T2_issue.md`](issues/T2_issue.md), [`issues/T4_issue.md`](issues/T4_issue.md).)*
- [x] All five callout components exist under
      `src/components/callouts/`: `<Definition>`, `<KeyIdea>`,
      `<Gotcha>`, `<Example>`, `<Aside>`. Match the LaTeX
      environments 1:1. *(T3 — see [`issues/T3_issue.md`](issues/T3_issue.md).)*
- [x] `<CodeBlock lang="…">` renders syntax-highlighted code with
      a copy button. (No "send to editor" yet — M6.) *(T3 — Shiki + copy-button island; verified in dist via `navigator.clipboard.writeText`.)*
- [x] Section anchors `<a id="ch_N-section-slug">` are emitted by
      the pipeline. These are the stable IDs M3's `sections.anchor`
      will reference. *(T2 + T4 — 91 `ch_1-` anchors in lectures/ch_1.mdx; verified per chapter.)*
- [ ] GitHub Pages deploy from `dist/` works end-to-end (replace
      the Jekyll workflow). *(T6 — workflow file authored locally; 🚧 blocked on user.)*
- [ ] Old Jekyll files removed: `_config.yml`, `_data/`,
      `_includes/`, `_layouts/`, top-level `lectures/`, `notes/`,
      `index.md`. Replaced by Astro equivalents. *(T8 — pre-flight clean; 🚧 blocked on T6 stability soak.)*
- [x] Two `phase2_issues.md` items resolved 2026-04-23 (M2 T7):
      stale companion-materials line in chapter `lectures.tex`
      rewired to the post-rename paths; `resources/` removed
      entirely (the `week_2.tex` "Cheatsheet" heading is moot under
      removal).

## Tasks

Broken out into individual files under [`tasks/`](tasks/README.md).

| ID  | Task                                                              | Status |
|-----|-------------------------------------------------------------------|--------|
| T1  | [Scaffold Astro project](tasks/T1_scaffold_astro.md)              | ✅ done 2026-04-23 |
| T2  | [Build pandoc Lua filter (HYBRID)](tasks/T2_lua_filter.md)        | ✅ done 2026-04-23 |
| T3  | [Callout component library](tasks/T3_callout_components.md)       | ✅ done 2026-04-23 (2 cycles) |
| T4  | [Pandoc → Astro build pipeline](tasks/T4_build_pipeline.md)       | ✅ done 2026-04-23 |
| T5a | [Chapter-listing index + chapters.json migration](tasks/T5a_content_collections.md) | ✅ done 2026-04-23 |
| T5b | [Dynamic chapter routes + pandoc → MDX safety bridge](tasks/T5b_dynamic_routes.md)  | ✅ done 2026-04-23 |
| T6  | [Replace GitHub Pages workflow](tasks/T6_pages_workflow.md)       | 🚧 blocked on user |
| T7  | [Resolve `phase2_issues.md` items](tasks/T7_phase2_issues_cleanup.md) | ✅ done 2026-04-23 |
| T8  | [Delete Jekyll scaffolding](tasks/T8_delete_jekyll.md)            | blocked on T6 |

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
