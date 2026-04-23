# Roadmap Addenda

Local supplement to `interactive_notes_roadmap.md` (Google Drive). Captures decisions and deferrals made after the roadmap was written. Port back to Drive when the roadmap is next revised.

## Sequence before Phase 1

1. **architecture.md** — nail down the overall architecture first. This is the gating artifact for everything below.
2. **README draft** — written *after* architecture.md is settled, *before* Phase 1 implementation starts. Per the roadmap's "draft README first" practice in Portfolio Framing, but explicitly sequenced behind the architecture doc.
3. **Phase 1 starts.**

## Phase 1 acceptance criteria — DEFERRED

The roadmap's Phase 1 deliverable ("revised, expanded chapter set") has no exit condition today. Setting one is non-trivial because it depends on:

- Final content scope (which MIT OCW topics integrate where, target depth per chapter)
- Whatever conventions architecture.md locks in for chapter structure
- Whether content gets restructured around a new component/section model before or after migration

**Action:** address this once architecture.md is nailed down. It will be a major focus at that point — not a quick decision.

## Pandoc filter probe

Run during Phase 1 idle time, not deferred to Phase 2 kickoff. One-hour experiment on `chapters/ch_1/lectures.tex` decides whether a Lua filter is worth writing or manual porting suffices. Output of this probe feeds back into architecture.md if it changes the component model.

## coding_practice/ — kept

Folders `cplusplus/`, `psuedo/`, `python/` stay. Purpose: hold prompt material for the ai-workflows question-generation workflow (Phase 4+). Likely to expand to support varying difficulty tiers.

**Open:** whether prompts are persisted as files here or generated dynamically by the workflow each run. Defer until Phase 4 design.
