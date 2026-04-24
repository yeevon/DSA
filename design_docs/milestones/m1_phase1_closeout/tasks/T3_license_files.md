# T3 — Add LICENSE files

**Status:** ✅ done 2026-04-23 (2 cycles — see [issues/T3_issue.md](../issues/T3_issue.md)) — **superseded later same day:** the dual `LICENSE-CONTENT` + `LICENSE-CODE` shipped by this task were collapsed into a single repo-wide `LICENSE` (CC BY-NC-SA 4.0 covering content + code) per user direction (M1 deep-analysis follow-up). The deliverable + acceptance-check sections below describe what *originally* shipped; the current state is one `LICENSE` file. See CHANGELOG 2026-04-23 ("License consolidated to a single LICENSE file").
**Depends on:** —
**Blocks:** T4 (README wants to link to these); declaring M1 done.

## Why

README.md says *"Dual licensed (settled per roadmap; LICENSE files
to follow)"* — and they haven't followed. The dual-license decision
is in CHANGELOG (2026-04-22 entry: CC BY-NC-SA 4.0 for content,
MIT for code) but neither file exists at repo root. Without them,
the public license declaration is non-binding.

## Deliverable

Two files at repo root:

- **`LICENSE-CONTENT`** — Creative Commons Attribution-NonCommercial-
  ShareAlike 4.0 International, applies to: `chapters/`, `resources/`,
  `lectures/`, `notes/` (post-M2: the equivalent Astro content
  collections), all generated PDFs.
- **`LICENSE-CODE`** — MIT, applies to: build scripts, future Astro
  components, future MCP adapter, ai-workflows integration glue.
  Attributed to **Jose de Lima**.

Plus README edit removing the "to follow" line and adding direct
links to both files (this part is technically T4's domain — see
ordering note in [`README.md`](README.md)).

## Steps

1. Create `LICENSE-CONTENT`:
   - Use the canonical CC BY-NC-SA 4.0 legal text from
     <https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.txt>
     (curl it, save verbatim).
   - Prefix with a one-paragraph header naming what's covered:
     "This license applies to the educational content in this
     repository: chapter LaTeX/MDX sources and PDFs, the compact
     reference notes, the practice prompt material, and any
     audio narration generated under M7. Code is licensed
     separately under LICENSE-CODE."
2. Create `LICENSE-CODE`:
   - Standard MIT boilerplate.
   - Copyright line: `Copyright (c) 2026 Jose de Lima` (use the
     current year at write time).
   - Prefix with a header: "This license applies to the
     non-content code in this repository: build scripts, Astro
     components and pages (post-M2), the FastMCP adapter and
     ai-workflows integration glue (post-M4), and any other
     non-content code. Educational content is licensed separately
     under LICENSE-CONTENT."
3. Verify the two scopes don't overlap. Edge cases worth noting in
   each header: `notes-style.tex` (LaTeX preamble — content);
   `coding_practice/*` prompt corpus (content); `tools/*` if it
   re-enters the repo (code).
4. Edit README.md license section: remove "(LICENSE files to
   follow)" parenthetical; replace each license bullet with a
   link to the actual file.

## Acceptance check

- [ ] `LICENSE-CONTENT` exists at repo root with the CC BY-NC-SA
      4.0 legal text.
- [ ] `LICENSE-CODE` exists at repo root with MIT, attributed to
      Jose de Lima.
- [ ] Each file's header clearly states which paths it covers.
- [ ] README license section links to both files.
- [ ] No overlap or ambiguity in the path coverage.

## Notes

- Don't write a *summary* of the licenses. Use the canonical legal
  text. The summary lives in the README; the file is the binding
  text.
- If the user wants a single `LICENSE` file with both stitched
  together (some CI tooling expects exactly `LICENSE`), that's a
  variant — but two files is clearer about scope. Default to two;
  switch only if asked.
