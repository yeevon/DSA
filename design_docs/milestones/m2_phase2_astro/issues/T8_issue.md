# T8 — Delete Jekyll scaffolding — Audit Issues

**Source task:** [../tasks/T8_delete_jekyll.md](../tasks/T8_delete_jekyll.md)
**Audited on:** 2026-04-23 (pre-flight cycle — task not executed; gated on T6)
**Audit scope:** No file changes this cycle. Pre-flight checks only: T5a/T8 fail-loud contract (`grep -rn 'chapters\.yml' src/ scripts/`), Jekyll source inventory, `assets/` reachability scan, T3 carry-over confirmation. Cross-checked against [`../issues/T6_issue.md`](T6_issue.md) (T6 status), [`../tasks/T8_delete_jekyll.md`](../tasks/T8_delete_jekyll.md) (deletion list + carry-over from T3).
**Status:** 🚧 BLOCKED on T6 stability soak. All pre-conditions for the deletion sweep are met; the actual `git rm`s wait for T6 to land + run green for one full deploy cycle (per T8 spec step 1: "Wait for T6 stability. … Confirm with the user before starting T8.").

## Why T8 isn't running this cycle

T8 spec step 1: *"At least one full deploy cycle green; ideally a few days of 'no one reported a broken page.' Confirm with the user before starting T8."*

T6 is itself BLOCKED on user (workflow file authored, but pushing + the Pages-settings flip + the deployed-URL verification all require GitHub-side action — see T6 audit ISS-01). Until T6 clears that block AND the workflow runs green for at least one cycle, deleting Jekyll source removes the rollback path described in T6's "Rollback plan" notes. So T8 is gated on:

1. User pushes the T6 deploy workflow + flips Pages settings.
2. Workflow run completes green; deployed URL serves Astro output (verified via curl).
3. (Optional but recommended per spec) A short soak period — "no one reported a broken page."

## Pre-flight verification (safe to run now)

These checks confirm T8 is *ready to execute* once unblocked. None of them write to disk; all are loud-fail signals.

| Pre-condition                                                                                                                          | Result | Notes |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| T5a/T8 contract: `grep -rn 'chapters\.yml' src/ scripts/` returns zero hits                                                            | ✅ | T5a closed this contract; verified again today. The `_data/chapters.yml` file is unreferenced; `git rm` it safely. |
| Jekyll source files exist (delete list)                                                                                                | ✅ | `_config.yml`, `_data/chapters.yml`, `_includes/nav.html`, `_layouts/{default,pdf}.html`, `index.md`, top-level `lectures/` (12 wrappers) + `notes/` (12 wrappers) all present. |
| `assets/` reachability scan: `grep -rnE 'assets/' src/` returns zero hits                                                              | ✅ | Astro doesn't reference `assets/`; the entire dir (just `style.css`) is Jekyll-only and safe to `git rm -r assets/`. |
| T3 carry-over: `src/pages/callouts-test.astro` still exists                                                                            | ✅ | Confirmed. T8 deletes it (carry-over already added to T8 spec by T3 cycle 2). |
| T2 ch_6 source-fix: `chapters/ch_6/lectures.tex` still parses + builds clean                                                            | ✅ | Verified during T7 (page count 31, unchanged). |
| Architecture.md §1.4 audio layout pin (T1): `public/audio/.gitkeep` still present                                                      | ✅ | T8 doesn't touch `public/`; audio infrastructure stays. |

## What T8 will do, in one commit, when unblocked

```
# 1. Pre-flight check (re-run; must remain ✅)
grep -rn 'chapters\.yml' src/ scripts/

# 2. Jekyll source removal
git rm _config.yml
git rm -r _data/ _includes/ _layouts/
git rm -r lectures/ notes/
git rm index.md
git rm -r assets/

# 3. T3 carry-over (callouts-test smoke page)
git rm src/pages/callouts-test.astro

# 4. Doc updates (same commit)
#    - README.md repo-layout: drop the Jekyll line, replace with Astro src/ shape
#    - CLAUDE.md repo-layout: drop the Jekyll paragraph
#    - feedback_no_jekyll_polish.md memory: remove (or annotate "post-M2 — historical only") + update MEMORY.md

# 5. Verify post-removal build still green
npm run build  # should still produce 38 pages (callouts-test now absent → 37)

# 6. CHANGELOG entry
```

## AC grading (deferred — task not executed)

All 8 ACs from the T8 spec are deferred until execution. Pre-flight verification confirms each AC will be readily achievable once unblocked:

| # | AC                                                                                  | Pre-flight readiness |
|---|-------------------------------------------------------------------------------------|----------------------|
| 1 | `git ls-files` shows no Jekyll files                                                 | Ready (delete list verified) |
| 2 | `npm run build` exit 0 from clean checkout post-removal                              | Ready (no src/ depends on Jekyll) |
| 3 | Auditor verifies deployed URL still serves Astro post-T8 commit                      | Gated on T6 (URL must be flipped to Actions source first) |
| 4 | `README.md` repo-layout no longer mentions Jekyll                                   | Ready |
| 5 | `CLAUDE.md` repo-layout drops Jekyll paragraph                                      | Ready |
| 6 | `LICENSE` no longer mentions Jekyll viewer wrappers                                 | Ready (the consolidated LICENSE is already generic) |
| 7 | yml deletion preceded by fail-loud check (zero hits)                                 | ✅ verified today |
| 8 | `feedback_no_jekyll_polish.md` removed or annotated; `MEMORY.md` updated            | Ready |

## 🔴 HIGH

None.

## 🟡 MEDIUM

### M2-T08-ISS-01 — Cannot execute without T6 stability — MEDIUM (procedural, not a defect)

**Severity:** 🟡 MEDIUM
**Status:** 🚧 BLOCKED — gated on T6 (M2-T06-ISS-01)

T8's spec step 1 mandates a T6 stability soak before deletion. The actual `git rm`s wait. Pre-flight is clean; execution is one focused session once unblocked.

**Action / Recommendation:**

When T6 unblocks (workflow run green + Pages-settings flipped + deployed URL verified), notify Claude to "run T8" and the deletion sweep + doc updates land in one commit. No iteration expected — pre-flight verified all preconditions hold.

## 🟢 LOW

None.

## Additions beyond spec

None — pre-flight only.

## Verification summary

| Check                                                                | Result |
| -------------------------------------------------------------------- | ------ |
| T5a/T8 fail-loud contract (`chapters.yml` unreferenced)              | ✅ |
| Jekyll source files inventoried + delete list confirmed               | ✅ |
| `assets/` reachability scan: Jekyll-only                              | ✅ |
| T3 carry-over (`callouts-test.astro`) present + still in T8 scope     | ✅ |
| T6 status                                                              | 🚧 blocked on user |
| T8 status                                                              | 🚧 blocked on T6  |

## Issue log

| ID            | Severity  | Status                | Owner / next touch point                              |
| ------------- | --------- | --------------------- | ----------------------------------------------------- |
| M2-T08-ISS-01 | 🟡 MEDIUM | 🚧 BLOCKED on T6     | User clears T6 → notify to run T8 → single commit deletes Jekyll + updates docs |

## Propagation status

T8 is the last M2 task. Once T8 lands + audit passes, M2 (Phase 2 Astro migration) can be closed by the user trigger ("close milestone") — same flow as M1 (status flips on `milestones/README.md` index, m2 README, top-level README status callout, CHANGELOG decided entry).
