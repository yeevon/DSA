# T2 — Pandoc probe on `chapters/ch_1/lectures.tex`

**Status:** ✅ done 2026-04-23 (2 cycles — see [issues/T2_issue.md](../issues/T2_issue.md))
**Depends on:** —
**Blocks:** M2 task design (Lua filter is M2's largest unknown);
closes architecture.md §5 row 1.

## Why

Architecture.md §1 promises a `pandoc + Lua filter` build pipeline
that maps each LaTeX callout environment to an MDX component. But
nobody has actually run pandoc on a real `lectures.tex` yet. Three
possible verdicts shape M2 very differently:

- **Filter necessary** — pandoc's default LaTeX reader mangles the
  callout environments badly enough that a custom filter is the only
  path. M2 includes filter authoring as a major task.
- **Manual port acceptable** — output is clean enough that hand-
  porting the dozen callout environments per chapter is comparable
  effort to writing the filter. M2 skips the filter, ports
  chapter-by-chapter.
- **Hybrid** — most things port automatically; a handful of edge
  cases need a small filter. M2 includes a *minimal* filter plus
  manual touch-ups.

Per `roadmap_addenda.md`: *"Run during Phase 1 idle time, not
deferred to Phase 2 kickoff. One-hour experiment."*

## Deliverable

A new doc at `design_docs/pandoc_probe.md` containing:

1. The exact pandoc command(s) run.
2. The probe inputs: which file, which environments mattered.
3. Concrete output evidence — copy-paste of how each callout type
   rendered in the default output.
4. A **verdict** at the top: `filter` / `manual` / `hybrid` + one
   sentence of rationale.
5. If `hybrid`: what the minimal filter has to do (which envs
   need explicit handling).

## Steps

1. Working in a temp dir to keep the repo clean:
   ```bash
   cd /tmp
   pandoc /path/to/cs-300/chapters/ch_1/lectures.tex \
     -f latex -t markdown \
     --wrap=none \
     -o probe.md 2>&1 | tee probe.stderr
   pandoc /path/to/cs-300/chapters/ch_1/lectures.tex \
     -f latex -t html5 \
     --standalone \
     -o probe.html 2>&1 | tee probe-html.stderr
   ```
2. For each LaTeX environment defined in `notes-style.tex` —
   `defnbox`, `ideabox`, `warnbox`, `examplebox`, `notebox` — find
   how it rendered in `probe.md`. Note: pandoc likely passes them
   through as raw LaTeX or strips them entirely.
3. For `lstlisting` blocks: did the language hint (`language=C++`)
   survive? Did indentation survive?
4. For section anchors: did pandoc emit stable IDs that match the
   `ch_N-section-slug` shape architecture.md §1 wants, or do we
   need to generate them ourselves?
5. Write the verdict + evidence into
   `design_docs/pandoc_probe.md`. Commit the new doc; don't commit
   `/tmp/probe.{md,html}`.
6. Update `architecture.md` §5 row 1 to mark the decision resolved
   with a one-line pointer to the probe doc.

## Acceptance check

- [ ] `design_docs/pandoc_probe.md` exists with a clear verdict at
      the top.
- [ ] Each of the five callout types is named with concrete
      evidence of how it rendered.
- [ ] `lstlisting` language preservation is documented yes/no.
- [ ] Section anchor strategy is documented (built-in vs needs-filter).
- [ ] Architecture.md §5 row 1 status updated.

## Notes

- One-hour budget per `roadmap_addenda.md`. If the verdict isn't
  obvious in an hour, the verdict itself is "needs deeper
  investigation, lean filter" — log that and move on.
- Don't try to actually *write* the filter here. T2 is the
  decision; the filter (if any) is M2 work.
- If pandoc isn't installed: `apt install pandoc` (Debian/Ubuntu)
  or `brew install pandoc` (macOS). Should not be a blocker.
