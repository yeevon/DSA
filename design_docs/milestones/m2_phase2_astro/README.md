# M2 — Phase 2: Jekyll → Astro migration

**Maps to:** `interactive_notes_roadmap.md` Phase 2
**Status:** todo
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

1. Scaffold Astro project: `npm create astro@latest` into a temp
   dir; copy in the relevant pieces (config, `src/`,
   `package.json`, `tsconfig.json`).
2. Implement the Lua filter mapping LaTeX environments → MDX
   components per architecture.md §1. (M1 T2 verdict: HYBRID — the
   filter is required; pandoc native handling alone drops callout
   titles, the `lstlisting language=…` hint, and section-anchor
   chapter prefixing. See [`../../pandoc_probe.md`](../../pandoc_probe.md).)
3. Build the callout component library (5 components, minimal
   props per architecture.md).
4. Wire pandoc invocation into the Astro build pipeline (probably
   a `scripts/build-content.mjs` invoked before `astro build`).
5. Set up Astro content collections per architecture.md §1
   ("Astro content collections"), with frontmatter sourced from
   `_data/chapters.yml` for now (port into collection frontmatter
   at the end of M2).
6. Replace the GitHub Pages workflow: build with Node, deploy
   `dist/`. Verify the public URL still resolves.
7. Resolve the two `phase2_issues.md` items: rewire the
   companion-materials cross-references; rename or document the
   "Cheatsheet" heading in `resources/week_2.tex`.
8. Delete Jekyll scaffolding once the Astro deploy is green for
   one full cycle.

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

## Carry-over from prior audits (pre-task-breakout)

These items are forward-deferrals from M1 audits. Because M2's
per-task specs don't exist yet, they live here on the milestone
README. **When M2's task-breakout happens, the breakout author
redistributes each item to the appropriate concrete task spec and
removes this section.**

- [ ] **M1-T02-ISS-02 — Pin the pandoc version.** Severity: 🟢 LOW.
      The probe at [`../../pandoc_probe.md`](../../pandoc_probe.md)
      ran against stock `apt`-installed pandoc; the verdict could
      shift across pandoc majors (LaTeX reader behaviour evolves).
      Whatever CI / build script invokes pandoc in M2 must pin a
      specific minor version. Source:
      [`../m1_phase1_closeout/issues/T2_issue.md`](../m1_phase1_closeout/issues/T2_issue.md).
- [ ] **M1-T02-ISS-03 — Sweep all 12 chapters for raw-passthrough
      blocks.** Severity: 🟢 LOW. The ch_1 probe surfaced one stray
      `` ```{=html} `` block at line 496 of `/tmp/probe.md` from a
      tcolorbox construct pandoc couldn't fully parse. Frequency
      across the other 11 chapters is unknown. During filter
      authoring, run pandoc against every `chapters/ch_*/lectures.tex`
      and `notes.tex`, count occurrences, and decide per-occurrence
      whether to fix the source or handle in the filter. Source:
      [`../m1_phase1_closeout/issues/T2_issue.md`](../m1_phase1_closeout/issues/T2_issue.md).
