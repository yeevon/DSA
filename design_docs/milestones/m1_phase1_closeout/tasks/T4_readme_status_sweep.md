# T4 — Update README status callout

**Status:** ✅ done 2026-04-23 (1 cycle — see [issues/T4_issue.md](../issues/T4_issue.md))
**Depends on:** T3 (convenient — same edit can wire LICENSE links)
**Blocks:** declaring M1 done.

## Why

README.md currently leads with:

> **Status — pre-Phase-1.** Content (LaTeX lectures, compact notes,
> practice prompts) is the only thing that works today.

That was true when the README was written but is now misleading:
ch_1–ch_6 have been substantially augmented (the "Phase 1" content
deliverable is mostly done), the per-chapter review pipeline ran to
completion, and `design_docs/milestones/` now exists as the
operational plan. A new contributor reading README today would
underestimate where the project actually is.

## Deliverable

README.md edited so the status reflects current reality (M1 active,
ch_1–ch_6 augmented, M2 next), plus a clear pointer into
`design_docs/milestones/` for the operational plan, plus the
LICENSE-link cleanup from T3.

Sweep the rest of the README while you're in there for any other
stale lines (Jekyll references, etc).

## Steps

1. Rewrite the status callout (lines ~10–16). Suggested new shape:

   > **Status — Milestone 1 (Phase 1 close-out).** All six SNHU-required
   > chapters (ch_1–ch_6) have been augmented with CLRS + MIT OCW
   > material per the bounded-additions rule. Optional chapters
   > (ch_7, ch_9–ch_13) ship as committed-but-un-augmented; their
   > deeper review is scheduled for the post-build content audit.
   > The site still renders via Jekyll on GitHub Pages; M2 replaces
   > it with Astro. Interactive features (M3–M7) are designed but
   > not built. See [`design_docs/milestones/`](design_docs/milestones/)
   > for the operational plan and
   > [`design_docs/architecture.md`](design_docs/architecture.md) for
   > the system design.

2. Sweep the rest of README for stale lines:
   - "Six chapters (7, 9, 10, 11, 12, 13) extend beyond the official
     course path for depth." — still true; leave.
   - The Jekyll `lectures/` and `notes/` viewer-dir mentions in the
     repository-layout section — still true *until* M2; leave with
     the existing "Phase 2 replaces the Jekyll bits with Astro under
     `src/`" preamble.
   - `coding_practice/` dir name — still correct.
   - The "(7, 9, 10, 11, 12, 13)" parenthetical above lists the
     optional chapters — verify it matches the actual ch_*/ dirs
     (ch_7, ch_9, ch_10, ch_11, ch_12, ch_13 — yes, all present).
3. Apply T3's LICENSE link edits if T3 hasn't already (link
   `LICENSE-CONTENT` and `LICENSE-CODE` from the License section).
4. Add a one-line pointer near the top of the "Architecture"
   section to `design_docs/milestones/` (currently the section only
   points at architecture.md and roadmap_addenda.md).

## Acceptance check

- [ ] Status callout reflects post-2026-04-23 state — no
      "pre-Phase-1" language.
- [ ] Pointer to `design_docs/milestones/` exists in either the
      status callout or the Architecture section.
- [ ] LICENSE links exist in the License section (assumes T3 done).
- [ ] No other lines in README contradict current repo state.

## Notes

- Resist the urge to overhaul the README. T4 is a status sweep, not
  a rewrite. If the README needs structural changes, that's a
  separate task — file it post-M2 when the Astro/M3 surfaces are
  also worth documenting.
- The "Notes-writing principle" section is stylistic philosophy;
  leave alone.
