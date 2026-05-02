# T03 — `/review` page (question render → submit → advance)

**Status:** todo
**Long-running:** no
**Milestone:** [m5_phase5_review_loop](../README.md)
**Depends on:** T01 (fsrs state populated), T02 (GET /api/review/due endpoint), M4 T07 (per-type render components from QuestionGenButton work)
**Blocks:** —

## Why this task exists

The user-facing surface of M5's review loop. The `/review` page pulls due questions from `GET /api/review/due` (T02), renders one at a time using the per-type render components built in M4 T07, accepts a response via `POST /api/attempts` (M4 T06 + T08), and advances to the next due item. At the end of a session, it shows a summary (count answered, accuracy, est. time).

This is an Astro page with vanilla JS for interactivity (matches the M4 T07 pattern — no React island).

## What to build

1. **`src/pages/review.astro`** — page route `/review`:
   - Layout: `Base.astro`.
   - On mount (vanilla JS in a `<script>` block), fetch `/api/review/due?limit=20`.
   - State: `current` (index into the queue), `responses` (array of `{ question_id, outcome, started_at, submitted_at }`).
   - Renders the current question via the per-type component (mc, short, llm_graded, code — reuse from M4 T07).
   - On submit: POST `/api/attempts`, capture the outcome, advance `current`. For llm_graded: poll via `pollUntilDone` (`src/lib/aiw-client.ts` from M4 T08) before advancing.
   - When `current === due.length`: render `SessionSummary` (component or inline).
2. **`src/components/review/SessionSummary.astro`** — summary view:
   - Count answered, count pass / fail / partial / pending.
   - Session duration (sum of `submitted_at - started_at` per attempt).
   - "Done" link back to the home page or "Review more" if more were due than fetched.
3. **`src/components/review/QuestionRunner.astro`** — wraps the per-type render component and the submit-and-advance logic. Reuses M4 T07's existing `mc.astro`, `short.astro`, `llm_graded.astro`, `code.astro` render components (whatever names they ship under).
4. **CSS for the page** (inline in `review.astro` or under `src/styles/review.css`) — keep minimal.
5. **CHANGELOG entry** under the current dated section.

## Out of scope

- Resume-where-you-left-off across browser refreshes (LocalStorage hint at `current` index can be a follow-up).
- Keyboard shortcuts (Space to advance, etc.) — file as carry-over if useful.
- Difficulty-tier filtering on the queue (front-end UX) — out of scope unless T06 (gap report) surfaces it.
- Animations between questions.
- Multi-user session tracking — single-user system.

## Acceptance criteria

- [ ] **AC-1.** `src/pages/review.astro` exists at `/review`. `npm run dev` + browser navigation to `/review` shows the page.
- [ ] **AC-2.** Page calls `GET /api/review/due?limit=20` on mount and displays the first due question.
- [ ] **AC-3.** Submit button triggers `POST /api/attempts` with the right body shape per type. For mc/short: outcome lands sync. For llm_graded: poll via `pollUntilDone` until resolved. For code: handle the M6 501 stub gracefully (display "code-execution UI not yet built — skipping" and advance).
- [ ] **AC-4.** After submit, the next due question appears (no full page reload).
- [ ] **AC-5.** When the queue is exhausted, `SessionSummary` renders with non-zero counts.
- [ ] **AC-6 (smoke — non-inferential, LBD-11).** **Builder must add a `test_review_page` case to `scripts/functional-tests.py`** that exercises the /review flow: navigates to `/review`, asserts the first question renders, simulates a submit (mc click), asserts advance to the next question. The gate BLOCKS if Auditor runs an unmodified `scripts/functional-tests.py` (no `test_review_page` case present). Auditor verifies via `grep -n test_review_page scripts/functional-tests.py` plus `python scripts/functional-tests.py` exit 0 + footer per `gate_parse_patterns.md` `functional-tests` row.
- [ ] **AC-7.** `npm run check` exits 0.
- [ ] **AC-8.** `npm run build` exits 0; `dist/review/index.html` produced (page is static-shell + client-side fetch).
- [ ] **AC-9.** CHANGELOG has an M5 T03 entry.

## Verification plan

- **Code surface (LBD-11):** named smoke `python scripts/functional-tests.py` (must add a `test_review_page` Selenium case).
- **Type check:** `npm run check`.
- **Build:** `npm run build` (the static shell is what GH Pages can serve; the dynamic content fetch happens client-side at runtime against the local state service when the user runs `npm run dev`).
- **Status-surface flips on close (LBD-10):**
  - [ ] per-task spec `**Status:**`
  - [ ] milestone `tasks/README.md` row (if present)
  - [ ] milestone README task-table row
  - [ ] milestone README `Done when` checkbox: "Review queue UI — a /review page that ..."

## Dependencies

- Upstream tasks: T01 (state populated), T02 (endpoint exists), M4 T06+T07+T08 (per-type render components, polling helper).
- LBDs touched: LBD-1 (page is static shell; dynamic fetch is local-only and must not bake API URL into `dist/` — use relative `/api/review/due` path), LBD-2 (state service is local), LBD-11 (smoke required).

## Carry-over from prior audits

- [ ] **TA-LOW-3 — `prerender = false` must NOT be set on `review.astro`** (severity: LOW, source: `issues/task_analysis.md` round 2 §L-3).
      AC-8 asserts `dist/review/index.html` is produced — that means the page must be statically rendered (default Astro behavior). Only the API routes set `prerender = false`. If the Builder accidentally adds `export const prerender = false;` to `review.astro`, the page will be SSR-only and `dist/review/` will not exist, failing AC-8.
      **Recommendation:** Builder verifies absence of `prerender = false` in `review.astro` after editing; the build gate (AC-8) catches it if missed.
