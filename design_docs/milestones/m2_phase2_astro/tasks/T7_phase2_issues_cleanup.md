# T7 — Resolve `phase2_issues.md` items

**Status:** ✅ done 2026-04-23 (1 cycle — see [`../issues/T7_issue.md`](../issues/T7_issue.md))
**Depends on:** T2 (filter exists, so source-vs-filter trade-off is decidable) — soft dep, can land independently
**Blocks:** —

## Why

`design_docs/phase2_issues.md` carries two items deferred from
pre-M2 work:

1. **Companion-materials line in chapter `lectures.tex`** — a
   stale cross-reference to material that no longer exists in the
   current chapter layout.
2. **`resources/week_2.tex` "Cheatsheet" heading** — moot after
   the 2026-04-23 decision to **remove `resources/` entirely** as
   part of M2 (week_2–5 content has been superseded by the
   augmented chapters; `resources/` is orphaned). T7 implements
   the removal and propagates the ripple edits.

T7 is the sweep that closes both items out and removes the
`resources/` directory + its references across the repo.

## Deliverable

- `design_docs/phase2_issues.md` with both items marked resolved
  (commit refs cited).
- `chapters/ch_*/lectures.tex` companion-materials lines either
  removed or rewired.
- `resources/` directory removed (`git rm -r resources/`).
- Ripple edits propagated: `LICENSE` scope statement, `README.md`
  repo-layout, `CLAUDE.md` repo-layout + auditor sequencing rule.

## Steps

1. **Re-read** `design_docs/phase2_issues.md` for the precise text
   of both items.
2. **Item 1 — companion-materials line.** Locate the offending
   line via `grep -rn 'companion materials' chapters/`. Decide
   per occurrence:
   - Remove if the referenced material doesn't exist anywhere.
   - Rewire to the new location if it moved (typically to
     `chapters/ch_N/notes.{tex,pdf}` or `chapters/ch_N/practice.md`
     after the 2026-04-22 file-rename pass).
   Update each `chapters/ch_*/lectures.tex`; rebuild the affected
   PDFs to verify (`pdflatex -interaction=nonstopmode -halt-on-error`).
3. **Item 2 — remove `resources/` (path B, settled 2026-04-23).**
   - `git rm -r resources/` — drops `week_{2,3,4,5}.{tex,pdf}`.
   - The week-content has been superseded by the augmented chapters
     (week 2 sorting → `chapters/ch_3`; week 3 lists → `chapters/ch_4`;
     week 4 hash tables → `chapters/ch_5`; week 5 trees → `chapters/ch_6`).
     Per the 2026-04-23 review: the dir is orphaned, style-inconsistent
     (own preamble, not `notes-style.tex`), and week-numbered vs the
     repo's chapter-numbered organisation.
4. **Ripple edits, same commit as the removal:**
   - `LICENSE` scope-statement header — drop the `resources/` bullet.
   - `README.md` repo-layout `text` block — remove the `resources/`
     line; remove any other `resources/` references in the body.
   - `CLAUDE.md` repo-layout — remove the `resources/` line.
   - `CLAUDE.md` auditor "Sequencing violation?" rule — currently
     reads "*chapter task touching `coding_practice/` or `resources/`*";
     simplify to "*chapter task touching `coding_practice/`*" (the
     memory rule reference `project_practice_md_phase4_link.md` /
     `project_coding_practice_purpose.md` stays — only the path list
     shrinks).
   - `design_docs/phase2_issues.md` item 2 — flip to "RESOLVED
     2026-MM-DD (obsolete by removal — see commit SHA)".
5. **Update `phase2_issues.md`** — flip both items from open to
   `RESOLVED 2026-MM-DD` with the commit SHA.
6. **Verify nothing else references `resources/`** — `grep -rn
   'resources/' --include='*.md' --include='*.tex' --include='*.yml'
   --include='*.html' .` should return zero hits in active docs (only
   historical references in CHANGELOG and audit logs are acceptable).

## Acceptance check (auditor smoke test — non-inferential)

- [ ] `design_docs/phase2_issues.md` shows both items resolved
      with dates and commit refs.
- [ ] `grep -rn 'companion materials' chapters/` returns zero hits
      OR every hit is to a real, current target (verify each).
- [ ] `test ! -d resources/` — directory removed.
- [ ] `grep -rn 'resources/' --include='*.md' --include='*.tex'
      --include='*.yml' --include='*.html' .` returns zero hits in
      active docs. Historical references in CHANGELOG and audit
      logs are acceptable; flag any in active specs.
- [ ] `LICENSE` scope statement no longer mentions `resources/`.
- [ ] `README.md` repo-layout block no longer lists `resources/`.
- [ ] `CLAUDE.md` repo-layout no longer lists `resources/`; the
      auditor "Sequencing violation?" rule no longer cites
      `resources/`.
- [ ] Affected `chapters/ch_*/lectures.pdf` rebuild clean
      (`pdflatex -interaction=nonstopmode -halt-on-error`).

## Notes

- **Independent task.** T7 doesn't block T6 or T8; it can land any
  time once T2 (or T4) gives enough confidence the source-vs-filter
  trade-off is settled. The chapter `.tex` edits in step 2 may
  affect what T2's filter has to handle, so doing T2 first is
  cleaner.
- **`resources/` removal is the settled path** (decided 2026-04-23
  during M2 task-breakout review). The earlier "stop and ask"
  framing has been removed; T7 implements path B directly. If
  context shifts before T7 runs (e.g. the week_*.tex content turns
  out to contain something not in the chapters), revisit before
  removal — but the default is removal.
