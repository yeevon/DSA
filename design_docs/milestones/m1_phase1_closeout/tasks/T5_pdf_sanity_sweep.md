# T5 — PDF build sanity sweep across all 12 chapters

**Status:** ✅ done 2026-04-23 (1 cycle — see [issues/T5_issue.md](../issues/T5_issue.md); 1 finding deferred to post-build content audit)
**Depends on:** —
**Blocks:** declaring M1 done. (Acceptance criterion in T1's
checklist references this.)

## Why

Two large rounds of editing have touched every chapter file:

1. The **rename pass** (cheat → notes, notes → lectures) — verified
   at the time, but never re-tested in a single sweep.
2. The **augmentation pass** (ch_1–ch_6) — each chapter's `lectures.tex`
   and `notes.tex` was rebuilt at end-of-Step-3, but the optional
   chapters (ch_7, ch_9–ch_13) haven't been rebuilt since the rename.
   Source drift may have introduced silent breakage.

Before declaring M1 done, verify that **every** chapter still
produces a clean PDF on a fresh build.

## Deliverable

A new doc at `design_docs/build_sweep.md` (or appended-to if it
exists) with:

- Date of sweep
- A row per chapter file (12 lectures + 12 notes = 24 files)
- For each: `clean` / `warns` / `errors` + page count + log line if
  not clean
- A summary verdict at the top

If anything breaks: file fixes inline, then re-run the sweep until
it's clean.

## Steps

1. From a clean working tree (commit any pending changes first), in
   each `chapters/ch_*/`:
   ```bash
   for ch in chapters/ch_*; do
     for src in lectures.tex notes.tex; do
       (cd "$ch" && pdflatex -interaction=nonstopmode -halt-on-error "$src" 2>&1 | tail -3)
       echo "--- $ch/$src ---"
     done
   done
   ```
2. Capture output. For each (chapter, file) pair:
   - **clean**: "Output written on $name.pdf (N pages, NNN bytes)" with
     no `! ` errors and no underfull/overfull warnings worth noting.
   - **warns**: builds successfully but pandoc-relevant warnings
     (broken refs, undefined commands, font fallbacks) — note them.
   - **errors**: build fails. **Stop the sweep and fix.** Re-run
     after fix.
3. Note page counts. Verify all 12 lectures.pdf are under the
   40-page autonomy ceiling (`feedback_chapter_review_autonomy.md`).
   Anything ≥ 40 is a flag, not a hard fail — it predates the
   ceiling.
4. Write `design_docs/build_sweep.md` with the table + verdict.
5. Clean up build artifacts (`.aux`, `.log`, etc are gitignored
   already, but `.pdf` rebuilds will show in `git status` if they
   actually changed — commit the rebuilt PDFs in a small follow-up
   if so).

## Acceptance check

- [ ] All 24 chapter files (12 lectures + 12 notes) build with
      `pdflatex -halt-on-error` exit 0.
- [ ] Page counts captured per file.
- [ ] No `lectures.pdf` exceeds 40 pages without explicit acknowledgment.
- [ ] `design_docs/build_sweep.md` exists with the full table +
      verdict.
- [ ] Any breakage that was found has been fixed and committed.

## Notes

- The optional chapters (ch_7, ch_9–ch_13) are most at risk of silent
  breakage since they haven't been rebuilt since the rename pass.
  Pay extra attention to those in the sweep.
- If a fix needs to touch chapter content (vs build config), make it
  the **smallest** fix that makes the build green — don't expand the
  optional-chapter content (that's the post-build content audit).
- `resources/week_*.tex` files are sidecar TeX, not chapter files.
  They're out of scope for T5 — flag separately if you notice they're
  broken.
