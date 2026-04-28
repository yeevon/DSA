# T5 — Code-block polish — Audit Issues

**Source task:** [`../tasks/T5_code_block_polish.md`](../tasks/T5_code_block_polish.md)
**Audited on:** 2026-04-27 (cycle 1) / 2026-04-27 (cycle 2 closure pass)
**Audit cycle:** 2
**Audit scope:** Spec-vs-implementation verification of every D1–D5
deliverable + AC1–AC6; design-drift check against
[`design_docs/architecture.md`](../../../architecture.md) §1
component-library subsection (the new `<CodeBlock>` paragraph) +
§6 forward-work item (per-language detection — must NOT be
pre-empted by Path A); cross-check against
[ADR-0002](../../../adr/0002_ux_layer_mdn_three_column.md), the
M2 T2/T5b pandoc-filter contract at
[`scripts/pandoc-filter.lua`](../../../../scripts/pandoc-filter.lua),
and CLAUDE.md non-negotiables (status-surface lockstep across the
five surfaces, code-task verification non-inferential — auditor
opens screenshots + cites visual evidence, runs harness from
scratch); zero dependency-manifest touch confirmation;
[`nice_to_have.md`](../../../nice_to_have.md) §UX-5 (F12 accent
split — out-of-scope-for-this-task boundary).

Fresh `npm run build` re-executed by the auditor (40 prerendered
pages, exit 0); fresh `npm run preview` + `.venv/bin/python
scripts/functional-tests.py` against the just-built dist
(**64/64 cases / 137/137 assertions in 31.0s**); `.venv/bin/python
scripts/smoke-screenshots.py` captured **31 screenshots /
3,054,404 bytes**. Auditor opened
`/.smoke/screenshots/lectures-ch4-1280x800.png`,
`/.smoke/screenshots/lectures-ch4-2560x1080.png`,
`/.smoke/screenshots/lectures-ch1-1280x800.png`,
`/.smoke/screenshots/lectures-ch7-1280x800.png`, and
`/.smoke/screenshots/lectures-ch13-1280x800.png` (the smoke
matrix lands at top-of-page on each — code blocks below the
fold). Auditor additionally drove a Selenium session that scrolled
the first `.code-block` on `/DSA/lectures/ch_4/` into view at
viewport 1280×800 (output: `/tmp/codeblock-ch4-scrolled.png`),
clicked the copy button (output: `/tmp/codeblock-ch4-after-click.png`,
showing `data-state="failed"` red affirmation in headless Chrome,
confirming the click handler fires + the swap-and-revert path
works), and waited for the 1.5s revert. All Builder gate counts
re-verified verbatim: 64/64 cases, 137/137 assertions, 31
screenshots, 3,054,404 bytes — match exactly.

**Status:** ✅ PASS — cycle 2 closure (LOW-1 + LOW-2 forward-deferred
to T6). Cycle 1 closed ⚠️ OPEN with 1 HIGH (status-surface drift on
the per-task spec — spec line 3 still read `**Status:** todo` despite
the four other surfaces all flipping to `✅ done 2026-04-27`) + 2 LOW
(architecture amendment didn't enumerate the MDX `pre` mapping
deviation in the §1 prose; §6 forward-work item doesn't cross-reference
the component-side swap target). Cycle 2 mechanical fix flipped the
T5 spec status line — all five status surfaces now lockstep at
`✅ done 2026-04-27`. LOW-1 + LOW-2 propagated as carry-over to T6
(Builder of T6 folds them into the existing §1 + §6 architecture
edits per T6 D5). All six ACs themselves PASS on the implemented
artefacts.

---

## Design-drift check

Cross-checked against `design_docs/architecture.md` §1 component-library
subsection (the amended `<CodeBlock>` paragraph at line 84), §6
forward-work item (line 478, per-language detection),
`design_docs/adr/0002_ux_layer_mdn_three_column.md`,
`scripts/pandoc-filter.lua` (T5 spec constraint: untouched), and
`design_docs/nice_to_have.md` §UX-5 (F12 accent boundary).

| Check | Result | Citation |
| ----- | ------ | -------- |
| New dependency? | None. `git diff --stat HEAD` against the manifest set (`package.json`, `package-lock.json`, `pyproject.toml`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`) returns 0 manifest lines touched. The 25 modified files are all source/content/doc — no new runtime or dev dep. | `git diff --stat HEAD` (auditor exec) |
| New module / boundary crossing? | No new files (cycle 1 is pure-edit on existing `src/components/callouts/CodeBlock.astro` + 3 page templates + 1 test config + architecture.md + CHANGELOG). The component lives inside the existing `src/components/callouts/` boundary the architecture.md §1 component library subsection already authorises ("Lives in `src/components/callouts/`"). The MDX `pre` mapping is configured at the consumer site (`<Content components={{...}} />` in the three `[id].astro` route templates) — that's the documented Astro/MDX integration extension point, not a new layer. | `src/components/callouts/CodeBlock.astro:1-242`; `architecture.md:82-84`; `src/pages/lectures/[id].astro:188`; `src/pages/notes/[id].astro:68`; `src/pages/practice/[id].astro:70` |
| Cross-cutting concerns? | The inline `<script>` registers click handlers on `.code-block .code-block-copy` at parse time. M3 events (`cs300:read-status-changed`, `cs300:toc-read-status-painted`, `cs300:annotation-added`, `cs300:drawer-toggle`) are untouched — grep across `src/` returns no new dispatchers + the existing counts hold. The clipboard write is via the standard `navigator.clipboard.writeText` Web API — no new Astro island runtime, no shared state, no new event channel. | grep across `src/`; `CodeBlock.astro:121-141` |
| Configuration / secrets? | None touched. | n/a |
| Observability? | None touched. The script's `console.error('CodeBlock copy failed:', err)` at line 131 is dev-surface only; no external backend. | `CodeBlock.astro:131` |
| architecture.md §1 component-library `<CodeBlock>` paragraph? | Amended at `architecture.md:84`. Reads: "`<CodeBlock>` is the only interactive-capable callout in static mode: Shiki syntax highlighting, a fixed `C++` language tag in the top-right of the wrapper, and a copy-to-clipboard button beside the tag (M-UX-REVIEW T5, 2026-04-27 — UI-review F7). The wrapper ships in both render paths: explicit `<CodeBlock code="..." />` JSX and the MDX `pre` element mapping (`components={{ pre: CodeBlock }}` on `<Content />` in `src/pages/{lectures,notes,practice}/[id].astro`) so MDX-rendered fenced blocks pick up the same envelope as direct JSX usage. The fixed `C++` tag is intentional — the chapter set is uniformly C++17 today; per-block language detection is the §6 forward-work item below, triggered by the first non-C++ chapter block. In local mode the component gains a 'send to editor' action for coding-practice questions (§3 code path)." Substantive shape captured: copy-button + lang-tag both ship now (no longer forward-looking); MDX `pre` mapping IS named explicitly; Path A (fixed `C++`) IS named explicitly with the §6 cross-reference; "send to editor" stays forward-looking M6. **LOW-1 nit:** the §1 paragraph names the MDX `pre` mapping as a render path but does NOT state it as a Builder *deviation from the original spec wording* (which assumed the JSX path covered everything) — re-readers would benefit from one half-sentence acknowledging that fenced MDX code blocks bypassed the M2 wrapper and that the `pre` mapping is the minimal route to make every block on every chapter page pick up the F7 polish. Doc-precision only; AC5 still PASS. | `architecture.md:84` |
| §6 forward-work item preserved? | YES — `architecture.md:478` reads verbatim what it said pre-T5: per-language `<CodeBlock>` syntax detection deferred to the post-build optional-content audit, trigger = first non-C++ chapter block, owner = post-build content audit Builder. The Path A "fixed `C++` tag" implementation does NOT pre-empt this — `CodeBlock.astro:84` emits `<span class="code-block-lang">C++</span>` as a static literal, NOT derived from any `lang` prop or chapters.json field. (The component does carry an optional `lang?: string` prop with default `cpp`, but that prop drives Astro's `<Code lang={lang} />` Shiki invocation in the explicit-JSX render path only — it never reaches the visible header strip.) The forward-work item remains the right home for per-block detection. | `architecture.md:478`; `CodeBlock.astro:73,84,88` |
| `scripts/pandoc-filter.lua` untouched? | Confirmed. `git diff -- scripts/pandoc-filter.lua` returns 0 lines. The filter still unconditionally sets `cpp` and clears source-derived attrs at lines 144–149. | `scripts/pandoc-filter.lua:144-149`; `git diff` (auditor exec) |
| `nice_to_have.md` §UX-5 (F12 accent split) boundary? | Untouched. `grep -rn "mux-current\|mux-achievement" src/` returns 0 hits. T5 added no new accent tokens; the `data-state="copied"` styling reuses existing `--mux-accent-bg` / `--mux-accent` / `--mux-accent-strong` tokens (`CodeBlock.astro:230-233`) already in `chrome.css`. F12 stays parked under its M5 promotion-trigger. | `CodeBlock.astro:229-233`; `nice_to_have.md:207-258` |
| MDX `pre` mapping — overreach or minimal correct fix? | **Minimal correct fix, justified.** Auditor verified against the rendered HTML at `dist/client/lectures/ch_4/index.html` (and the other 11 chapters' lectures/notes routes — see Verification summary table below): every `<pre class="astro-code">` block on every chapter route is wrapped in `<div class="code-block">` with the header strip (`.code-block-lang` + `.code-block-copy`). 37/37 wrappers on lectures/ch_4, 74/74 on lectures/ch_1, 24/24 on lectures/ch_2, 25/25 on lectures/ch_3, 16/16 on lectures/ch_5, 23/23 on lectures/ch_6, 6/6 on lectures/ch_7, 24/24 on lectures/ch_9, 19/19 on lectures/ch_10, 12/12 on lectures/ch_11, 11/11 on lectures/ch_12, 18/18 on lectures/ch_13 — plus the corresponding notes blocks (4+2+0+2+0+4+3+1+4+2+1+3 = 26 across notes/ch_*) — all 1:1 matched (count `.code-block` == count `astro-code` == count `.code-block-lang` == count `.code-block-copy`). Without the MDX `pre` mapping, the AC1–AC4 selectors `.code-block`, `.code-block-lang`, `.code-block-copy` would NOT match on chapter pages because Astro's MDX integration emits Shiki's bare `<pre class="astro-code">` directly and bypasses the explicit `<CodeBlock>` JSX import — so the spec's AC table would be unreachable in practice. The deviation is the minimal Astro/MDX-correct route (passing the `pre` element through the same component handles both paths in one place) and Builder documented it inline at `CodeBlock.astro:1-50` + at `architecture.md:84` — Architecture docs say the MDX `pre` mapping IS now part of the component contract. Holds. | `dist/client/lectures/*/index.html` (12 chapters × 3 collections); `CodeBlock.astro:1-50,82-102`; `architecture.md:84` |
| Two render modes — both work? | YES — verified live at runtime. The explicit-JSX path (`<CodeBlock code="..." lang="cpp" />`, used by the M3 callouts smoke page that the spec calls out) renders Astro's `<Code>` (Shiki) inside the `.code-block` wrapper via the `code ? <Code…/> : preClass ? <pre…><slot/></pre> : <pre><code/></pre>` ternary at `CodeBlock.astro:87-101`. The MDX `pre` mapping path receives Shiki's pre-rendered output as a slot and re-emits the `<pre class="astro-code github-dark" style="..." data-language="cpp" tabindex="0">` with the original attrs preserved (verified in `dist/client/lectures/ch_4/index.html` — the inner `<pre>` keeps Shiki's `class="astro-code github-dark"`, the inline `style="background-color:#24292e;color:#e1e4e8;overflow-x:auto"` background tokens, the `data-language="cpp"` attr, and `tabindex="0"`). Both paths produce identical wrapper structure: `<div class="code-block"><div class="code-block-header" aria-hidden="true"><span class="code-block-lang">C++</span><button class="code-block-copy" type="button" aria-label="Copy code to clipboard">Copy</button></div><pre…><code/></pre></div>`. | `CodeBlock.astro:82-102`; `dist/client/lectures/ch_4/index.html` (auditor grep + visual) |
| Click handler survives Shiki passthrough? | YES — verified live in headless Chrome. The inline `<script>` at `CodeBlock.astro:104-141` is a single-pass `for (const btn of document.querySelectorAll('.code-block .code-block-copy'))` that runs once at parse time and binds a click handler to every button on the page (Astro hoists scoped scripts to a single document-level execution). Auditor's Selenium probe (`/tmp/codeblock-shot.py`) found `document.querySelector('.code-block .code-block-copy').click()` immediately flipped `data-state` to `"failed"` (headless Chrome rejects clipboard write without `--enable-features=Clipboard`, exactly as spec D4 anticipates) and the button text to `"Failed"`; after 1.5s `data-state` reverted to absent and text reverted to `"Copy"` — the swap-and-revert contract holds. The script is NOT a per-CodeBlock instance script (Astro de-duplicates inline scripts at compile time, single execution covers the page). The Builder claim "single inline `<script>` per CodeBlock instance" in the controller brief is structurally inaccurate but operationally correct — Astro's compile-time hoisting collapses the per-component script to one document-level execution, which is exactly what's needed for the Shiki-passthrough path. | `CodeBlock.astro:104-141`; auditor Selenium probe `/tmp/codeblock-shot.py` (output above) |
| Path A (fixed `C++` tag) — implemented as static literal? | YES. `CodeBlock.astro:84` reads `<span class="code-block-lang">C++</span>` — a static literal in JSX, not interpolated from `{lang}` or any prop or chapters.json field. The `lang?: string` prop at line 54 + the destructuring default `lang = 'cpp'` at line 73 only feed Astro's `<Code lang={lang} />` Shiki invocation at line 88 (the explicit-JSX render path). The visible header tag never reads from the prop. When the §6 forward-work fires (first non-C++ chapter block), the Builder of that future task can swap the static literal for a prop-driven render without disturbing any other surface. | `CodeBlock.astro:73,84,88` |
| Status-surface lockstep? | **FAILED — HIGH-1 below.** Per CLAUDE.md status-surface non-negotiable, all four (a)–(d) surfaces must flip together. (a) `tasks/T5_code_block_polish.md:3` reads `**Status:** todo` — NOT flipped to `✅ done 2026-04-27`. (b) `tasks/README.md:13` T5 row reads `✅ done 2026-04-27` — flipped. (c) `m_ux_review/README.md:57` task table T5 row reads `✅ done 2026-04-27` — flipped. (d) `m_ux_review/README.md:38` F7 Done-when checkbox reads `[x]` with citation parenthetical `(T5 issue file)` — flipped. The CHANGELOG entry at `CHANGELOG.md:55-56` claims "five surfaces flip together — task spec status, T5 row in `tasks/README.md`, T5 row in `m_ux_review/README.md` task table, F7 `Done when` checkbox flipped to `[x]` with citation parenthetical pointing at T5 issue file, and the no-regression bullet's case/assertion count updated…" — but the per-task spec status line did NOT actually flip. Builder's self-grading was optimistic on this point. | `tasks/T5_code_block_polish.md:3`; `tasks/README.md:13`; `m_ux_review/README.md:38,57`; `CHANGELOG.md:55-66` |
| Drift class HIGH count? | **0** for design-drift (no architectural rule broken; §6 preserved; pandoc-filter untouched; F12 boundary clean). The HIGH-1 below is a status-surface convention break per CLAUDE.md, not architecture drift per se. | — |

---

## AC grading

| AC | Status | Notes |
| -- | ------ | ----- |
| AC1 — Every `.code-block` has a `.code-block-lang` with text `C++` | ✅ PASS | Functional test `code-block-language-tag` passes (3/3 asserts: count `.code-block` ≥1 — actual 37 on `/DSA/lectures/ch_4/`; count `.code-block .code-block-lang` ≥1 — actual 37; text-pattern `^C\+\+$` matches all 37). Auditor's full-corpus grep across `dist/client/{lectures,notes}/*/index.html` shows perfect 1:1 across all 21 chapter routes that contain code blocks (ch_1 lectures: 74/74, ch_4 lectures: 37/37, etc — full table in Verification summary). Visual confirmation via `/tmp/codeblock-ch4-scrolled.png`: `C++` boxed-tag renders top-right of the first code block, muted small-caps styling with `--mux-fg-subtle` / `--mux-surface` / `--mux-border-subtle` token usage. |
| AC2 — Every `.code-block` has a `.code-block-copy` button | ✅ PASS | Functional test `code-block-copy-button` passes (2/2 asserts: count `.code-block .code-block-copy` ≥1 — actual 37; `type="button"` attr present). Same per-chapter grep coverage as AC1: every `.code-block` on every chapter route has exactly one copy button. Visual confirmation via `/tmp/codeblock-ch4-scrolled.png`: outline-style "Copy" button next to the language tag, hover/focus tokens applied per `CodeBlock.astro:218-225`. ARIA: `aria-label="Copy code to clipboard"` (line 85) — the parent `.code-block-header` is `aria-hidden="true"` (line 83) but the button's own aria-label is announced. |
| AC3 — `.code-block` has computed `margin-block` ≥8px | ✅ PASS | Functional test `code-block-margin` passes (2/2 asserts: computed `margin-block-start` ≥8 — actual 8.0px; computed `margin-block-end` ≥8 — actual 8.0px). CSS source: `CodeBlock.astro:148-151` `.code-block { position: relative; margin-block: var(--mux-space-2); }`. Token resolves to 8px (`src/styles/chrome.css:74`). Auditor's Selenium probe at viewport 1280×800 confirmed `parseFloat(getComputedStyle(document.querySelector('.code-block')).marginBlockStart) === 8` and the same for `marginBlockEnd`. Visual confirmation via `/tmp/codeblock-ch4-scrolled.png`: visible breathing room above the code block (between the callout title "Three takes on `list` in C++" and the code) and below (between the code and the next prose line). |
| AC4 — Clicking the copy button fires the handler (button text swaps to "Copied" via `data-state="copied"`) | ✅ PASS (with spec D4 fallback) | Functional test `code-block-copy-functional` passes (2/2 asserts: `pre_js` clicks the first `.code-block-copy` and sets `body[data-t5-copy-click=clicked]` if the button exists; assertion confirms the body marker plus the button's `data-state` matches regex `^(copied|failed)$`). Auditor's live Selenium probe in headless Chrome (no `--enable-features=Clipboard` flag) saw `data-state="failed"` immediately after click + button text `"Failed"`, then revert to absent + `"Copy"` after 1.5s — exactly the spec D4 fallback ("if [clipboard read] isn't available, the data-state swap is sufficient evidence"). Both swap states (`copied` and `failed`) prove the click handler fired; the regex `^(copied\|failed)$` is the right test. The handler write at `CodeBlock.astro:127-133` correctly sets `data-state` AND swaps `textContent`; the revert at `CodeBlock.astro:135-138` correctly removes the attribute AND restores the original text via the `setTimeout` 1500ms timer. Visual confirmation via `/tmp/codeblock-ch4-after-click.png`: button reads "Failed" with red-tinted styling (`#fef2f2` bg, `#fca5a5` border, `#991b1b` text per `CodeBlock.astro:237-241`), confirming the failed-state CSS rule is wired. |
| AC5 — `architecture.md` §1 reflects copy button + lang tag as shipped | ✅ PASS (with LOW-1 nit) | `architecture.md:84` amended — see Design-drift table above for the verbatim quote. Substantive shape captured: copy-button + lang-tag both ship now, MDX `pre` mapping named, Path A (fixed `C++`) named with §6 cross-reference, "send to editor" stays forward-looking M6. **LOW-1 doc-precision nit:** the paragraph names the MDX `pre` mapping as a render path but does NOT acknowledge it as a Builder *deviation from the original spec wording* (the spec assumed the explicit JSX path covered everything because the M2 component already wrapped Shiki — but pre-T5 inspection shows MDX-rendered fenced blocks bypassed the M2 wrapper). One half-sentence acknowledgement of "fenced MDX code blocks previously bypassed the M2 wrapper; the `pre` mapping is the minimal route to make every block pick up the F7 polish" would close the loop for re-readers. AC5 still PASS on the substantive contract; LOW-1 surfaced for owner = T6 carry-over to fold in (T6 already touches `architecture.md` §1 page-chrome subsection per its D5). |
| AC6 — Existing CodeBlock M3 contract preserved (anchor IDs on enclosing sections, scroll-spy still fires through code blocks) | ✅ PASS | Section anchors still emit: `grep -c 'id="ch_4-' dist/client/lectures/ch_4/index.html` returns 28 — unchanged from the post-T2 baseline (T2 audit closed at the same anchor count). The M3 contract is on the `<h1>` / `<h2>` headers (the Lua filter at `pandoc-filter.lua:154-159` prefixes every header `id` with `ch_N-`); code blocks don't carry the anchor IDs themselves and the wrapper change at `<pre>` does not affect header rendering. Functional tests `right-rail-toc-h1-bold`, `right-rail-toc-h2-indented`, and `right-rail-scroll-spy-on-h2` all PASS in the cycle 1 run (baseline post-T2 contract preserved through T3/T4/T5). M-UX-REVIEW T2's H1+H2 hierarchy assertion at `right-rail-scroll-spy-on-h2` (clicks an h2 anchor + asserts `[data-current]` lands on the right-level entry) is the canonical scroll-spy probe and it PASS at 2/2. No regression. |

**AC tally: 6 / 6 PASS** (AC5 with one LOW doc-precision nit).

---

## 🔴 HIGH

### HIGH-1 — Status-surface drift on the per-task spec (`tasks/T5_code_block_polish.md:3`)

**ID:** M-UX-REVIEW-T5-ISS-01
**Severity:** HIGH (CLAUDE.md status-surface non-negotiable explicitly
calls out this exact failure mode: "When a task closes, three [now
four] surfaces flip together: (a) `**Status:** todo` → `✅ done <date>`
in the per-task spec file, (b) the row in `tasks/README.md`, (c) the
row in the milestone README's task table. Additionally, any `Done
when` checkbox in the milestone README that the closed task satisfies
flips from `[ ]` to `[x]` with a citation parenthetical… The Auditor's
design-drift check verifies all four — silent drift across them is a
HIGH finding (M2 + M3 deep-analyses both caught this; the Builder
doing it inline at task close is cheaper than the Auditor catching it
cycle-late).")

**Finding.** Three of the four surfaces flipped:

- (b) `tasks/README.md:13` T5 row → `✅ done 2026-04-27` ✓
- (c) `m_ux_review/README.md:57` task table T5 row → `✅ done 2026-04-27` ✓
- (d) `m_ux_review/README.md:38` F7 Done-when checkbox → `[x]` with `(T5 issue file)` citation ✓
- (e — bonus) `milestones/README.md:27` M-UX-REVIEW row → `T1 + T2 + T3 + T4 + T5 closed 2026-04-27; T6 outstanding` ✓

**(a) `tasks/T5_code_block_polish.md:3` reads `**Status:** todo` —
NOT flipped.** The CHANGELOG entry at `CHANGELOG.md:55-56` explicitly
claims "five surfaces flip together — task spec status, T5 row in
`tasks/README.md`, T5 row in `m_ux_review/README.md` task table, F7
`Done when` checkbox flipped to `[x]` with citation parenthetical
pointing at T5 issue file…" — but the per-task spec status line was
not actually flipped on disk. Builder self-grading was optimistic on
this point.

**Why it matters.** The per-task spec is the canonical Builder-facing
status surface (the file the next-cycle Builder opens to find out
whether the task is open or closed). A returning Builder grepping
`**Status:**` across the milestone tasks would see T5 as `todo` and
potentially re-open scope. The four-surface lockstep is the
non-negotiable specifically to guard against the failure mode where
"the index says done, the spec says open" — same precedent as the
M2 + M3 deep-analysis HIGH-finding ladder.

**Action / Recommendation.** Single-line edit on the same Builder
cycle (no second cycle warranted — fix is mechanical):

```diff
-**Status:** todo
+**Status:** ✅ done 2026-04-27
```

at `design_docs/milestones/m_ux_review/tasks/T5_code_block_polish.md:3`.
After the edit, all four [+ one bonus = five] status surfaces agree.
Flip from HIGH-1 → RESOLVED (with commit SHA) on the next-cycle
re-audit; this is a closure-pass tick, not a re-implementation.

---

## 🟡 MEDIUM

None.

---

## 🟢 LOW

### LOW-1 — Architecture §1 amendment doesn't enumerate the MDX `pre` mapping as a deviation

**ID:** M-UX-REVIEW-T5-ISS-02
**Severity:** LOW (doc-precision nit; substantive contract captured;
re-readers benefit but no current contract is broken).

**Finding.** `architecture.md:84` reads "The wrapper ships in both
render paths: explicit `<CodeBlock code="..." />` JSX and the MDX
`pre` element mapping (`components={{ pre: CodeBlock }}` on
`<Content />` in `src/pages/{lectures,notes,practice}/[id].astro`)
so MDX-rendered fenced blocks pick up the same envelope as direct
JSX usage." The architecture doc names the MDX `pre` mapping as a
render path but does NOT acknowledge that:

1. The original T5 spec D2 (line 42–51 of `T5_code_block_polish.md`)
   shows only the explicit-JSX render shape (`<div class="code-block">
   <div class="code-block-header">…</div><pre><code>…</code></pre>
   </div>`) — the spec assumed the M2 `<CodeBlock>` already wrapped
   Shiki output.
2. Pre-T5 inspection of `dist/client/lectures/ch_4/index.html` would
   have shown that Astro's MDX integration emits Shiki's bare `<pre
   class="astro-code">` directly and bypasses the M2 wrapper — i.e.
   without the `pre` mapping, AC1–AC4 selectors would not match on
   chapter pages.
3. The `pre` mapping IS the minimal route to make every fenced MDX
   block pick up the F7 polish (the alternative would be a
   filter-time post-process that wraps Shiki's output, which would
   cross the pandoc-filter boundary the spec explicitly forbids).

A re-reader landing on `architecture.md:84` knows the contract but
not the rationale.

**Action / Recommendation.** Append one half-sentence to the
existing paragraph at `architecture.md:84`:

```text
…so MDX-rendered fenced blocks pick up the same envelope as direct JSX
usage (the MDX `pre` mapping is the minimal route — fenced code blocks
on chapter pages bypassed the M2 wrapper because Astro's MDX integration
emits Shiki's `<pre class="astro-code">` directly, and the spec
constraint forbids filter-time wrapping in `scripts/pandoc-filter.lua`).
```

T6 already touches `architecture.md` §1 page-chrome subsection per its
D5 (typography pairing pinned to a section that lives in §1). Folding
this LOW into the same edit is cheaper than a standalone cycle.
**Forward-deferred to T6 carry-over** (entry appended to
`tasks/T6_typography.md` `## Carry-over from prior audits`).

### LOW-2 — `<CodeBlock>` `lang` prop default is `cpp` but architecture §1 paragraph lacks any mention of the prop's semantics

**ID:** M-UX-REVIEW-T5-ISS-03
**Severity:** LOW (forward-looking flag; current corpus is uniformly
C++ so the prop is effectively unused from MDX paths).

**Finding.** `CodeBlock.astro:54-55` documents the `lang?: string`
prop with default `cpp` (line 73 destructuring). The prop drives
Astro's `<Code lang={lang} />` Shiki invocation in the explicit-JSX
render path at line 88 — but the visible header strip at line 84 is
the static literal `<span class="code-block-lang">C++</span>`, NOT
prop-driven. This is correct per Path A (D2 of the spec) and the §6
forward-work item — but a future Builder of the §6 work would benefit
from one bullet under §6 (line 478) that names the wiring:

> "When the §6 trigger fires (first non-C++ chapter block), the Builder
> swaps `<span class="code-block-lang">C++</span>` at
> `src/components/callouts/CodeBlock.astro:84` for `<span
> class="code-block-lang">{lang}</span>` and threads the language hint
> from the pandoc filter through MDX frontmatter or a `data-language`
> read on the slot's `<pre>`."

The current §6 wording at `architecture.md:478` only describes the
filter side. Cross-reference to the component side is missing.

**Action / Recommendation.** Append one bullet to `architecture.md:478`
naming the component wiring location. Same target as LOW-1 (T6
edits §1 already), so fold both into the single T6 doc edit.
**Forward-deferred to T6 carry-over.**

---

## Additions beyond spec — audited and justified

1. **MDX `pre` element mapping** (`src/pages/{lectures,notes,practice}/[id].astro`
   — added `pre: CodeBlock` to `<Content components={{...}} />`).
   The spec D2 / D3 / D4 selectors `.code-block`, `.code-block-lang`,
   `.code-block-copy` would not have matched on chapter pages without
   this mapping because Astro's MDX integration emits Shiki's
   `<pre class="astro-code">` directly and bypasses the M2 explicit-JSX
   `<CodeBlock>` wrapper. Auditor verified this empirically by
   reading `dist/client/lectures/ch_4/index.html` (and 11 other
   chapter routes) — every `<pre class="astro-code">` is now wrapped
   in `<div class="code-block">` 1:1. Without the mapping, AC1–AC4
   would be unmeasurable in practice. Builder documented the
   deviation inline at `CodeBlock.astro:1-50` (extensive header
   docstring) and at `architecture.md:84` (the §1 paragraph). The
   pandoc filter + Shiki config remain untouched per spec
   constraint. **JUSTIFIED** — minimal Astro/MDX-correct route.

2. **Two render modes (explicit JSX + MDX `pre` mapping) as a
   single component** (`CodeBlock.astro:82-102` ternary). The spec D2
   showed the explicit-JSX shape only; the Builder added the MDX-path
   branch (the `preClass ? <pre …><slot/></pre>` arm) so MDX-rendered
   Shiki output is re-emitted verbatim with all attrs preserved
   (`class="astro-code github-dark"`, inline style, `data-language`,
   `tabindex`). Both render paths produce identical wrapper structure;
   the test selectors land on both equivalently. **JUSTIFIED** —
   single source of truth for the wrapper, no surface duplication.

3. **`aria-label="Copy code to clipboard"` on the copy button**
   (`CodeBlock.astro:85`). The spec D2 example shows
   `<button class="code-block-copy" type="button" data-clipboard-target>Copy</button>`
   — no aria-label. The Builder added one, which is the right move:
   the parent `.code-block-header` is `aria-hidden="true"` (per spec
   D2 example), so the button's own accessible name has to come from
   somewhere; without `aria-label`, screen readers would announce
   the button text only ("Copy" → after click → "Copied" / "Failed"),
   which is fine but the explicit aria-label gives a more descriptive
   first-pass announcement. **JUSTIFIED** — accessibility polish, no
   contract change.

4. **`data-state="failed"` styling rule with red-tinted tokens**
   (`CodeBlock.astro:237-241`). The spec D3 named the failed state
   ("On error, swap to 'Failed' briefly") but did not specify the
   visual treatment. The Builder picked `#fef2f2` bg / `#fca5a5`
   border / `#991b1b` text — sensible muted-red defaults, hard-coded
   hex values rather than tokens. Minor concern: hard-coded hex
   doesn't compose with a future dark-mode pass (the rest of the
   chrome uses `--mux-*` tokens that a dark-mode flip would swap).
   **JUSTIFIED in scope** but flagged forward as a token-extraction
   candidate — folds naturally into T6's typography token pinning if
   T6 also touches the colour-token surface (it doesn't per its
   spec; logged here for the post-build content audit's "audit the
   leftover hard-coded styles" sweep instead).

---

## Verification summary

### Gates re-run from scratch by the auditor

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | exit 0; 40 prerendered pages (`find dist/client -name index.html | wc -l` = 40); exact match to Builder claim. |
| Preview | `npm run preview` (background, port 4321) | reachable; 200 OK on `/DSA/`. |
| Functional tests | `.venv/bin/python scripts/functional-tests.py` | **64/64 cases / 137/137 assertions PASS** in 31.0s. Exact match to Builder claim. The four new T5 cases (`code-block-language-tag`, `code-block-copy-button`, `code-block-margin`, `code-block-copy-functional`) all PASS. |
| Smoke screenshots | `.venv/bin/python scripts/smoke-screenshots.py` | **31 screenshots / 3,054,404 bytes** in 15.4s. Exact match. |
| Scroll-and-shot of `/DSA/lectures/ch_4/` first code block at 1280×800 | auditor `/tmp/codeblock-shot.py` Selenium probe | `lang='C++'`, `btn_text='Copy'`, `btn_type='button'`, `margin_top=8.0`, `margin_bot=8.0`; click → `data-state='failed'`, `text='Failed'`; +1.7s revert → `data-state=None`, `text='Copy'`; per-page coverage `{total: 37, langs: 37, copies: 37, codes: 37}`. |
| Dependency manifest touch | `git diff --stat HEAD -- package.json package-lock.json pyproject.toml requirements*.txt .nvmrc .pandoc-version` | 0 lines (manifest set untouched). |

### Wrapper-coverage table (auditor full-corpus grep)

For each chapter × collection, the count of `.code-block` wrappers,
`<pre class="astro-code">` Shiki blocks, `.code-block-lang` tags, and
`.code-block-copy` buttons in the rendered HTML at
`dist/client/<col>/<ch>/index.html`. 1:1 across the board confirms
the MDX `pre` mapping wraps every fenced block on every chapter page.

| Chapter | lectures | notes | practice |
| ------- | -------- | ----- | -------- |
| ch_1  | 74 / 74 / 74 / 74 | 4 / 4 / 4 / 4 | 0 / 0 / 0 / 0 |
| ch_2  | 24 / 24 / 24 / 24 | 2 / 2 / 2 / 2 | 0 / 0 / 0 / 0 |
| ch_3  | 25 / 25 / 25 / 25 | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| ch_4  | 37 / 37 / 37 / 37 | 2 / 2 / 2 / 2 | 0 / 0 / 0 / 0 |
| ch_5  | 16 / 16 / 16 / 16 | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| ch_6  | 23 / 23 / 23 / 23 | 4 / 4 / 4 / 4 | 0 / 0 / 0 / 0 |
| ch_7  |  6 /  6 /  6 /  6 | 3 / 3 / 3 / 3 | 0 / 0 / 0 / 0 |
| ch_9  | 24 / 24 / 24 / 24 | 1 / 1 / 1 / 1 | 0 / 0 / 0 / 0 |
| ch_10 | 19 / 19 / 19 / 19 | 4 / 4 / 4 / 4 | 0 / 0 / 0 / 0 |
| ch_11 | 12 / 12 / 12 / 12 | 2 / 2 / 2 / 2 | 0 / 0 / 0 / 0 |
| ch_12 | 11 / 11 / 11 / 11 | 1 / 1 / 1 / 1 | 0 / 0 / 0 / 0 |
| ch_13 | 18 / 18 / 18 / 18 | 3 / 3 / 3 / 3 | 0 / 0 / 0 / 0 |

(Practice routes have 0 code blocks — the practice MDX source is
plain markdown without fenced code per the M2 design; expected.)
Total across all chapter routes: **315 code-block wrappers**, 100%
1:1 ratio of wrappers to Shiki blocks to lang tags to copy buttons.

### Visual evidence cited

| Screenshot | What auditor confirmed |
| ---------- | ---------------------- |
| `/.smoke/screenshots/lectures-ch4-1280x800.png` | Top-of-page shape preserved at desktop: chapter map callout + chapter intro prose. (Code blocks below the fold at this scroll position; smoke harness lands at top-of-page.) |
| `/.smoke/screenshots/lectures-ch4-2560x1080.png` | Wide-viewport shape preserved: three-column chrome holds, no shift from T4 close. |
| `/.smoke/screenshots/lectures-ch1-1280x800.png` | T3 H1-promotion shape preserved: eyebrow + topic-as-H1 + collection tabs intact across chapters; T5 didn't disturb the M-UX-REVIEW T3 contract. |
| `/.smoke/screenshots/lectures-ch7-1280x800.png` | Same as ch_1 — T3 contract holds at lower-corpus chapters with sparser code-block density. |
| `/.smoke/screenshots/lectures-ch13-1280x800.png` | Same — T3 contract holds at the highest chapter index. |
| `/tmp/codeblock-ch4-scrolled.png` (auditor-captured at 1280×800 with `.code-block` scrolled into view) | First code block on `/DSA/lectures/ch_4/` shows: `C++` tag in top-right (boxed, muted small-caps), `Copy` button next to it (outline, accent on hover), 8px margin between code and surrounding callout title above + 8px below before the next prose line. **All three F7 deliverables (margin, lang tag, copy button) visible in one frame.** |
| `/tmp/codeblock-ch4-after-click.png` (auditor-captured ~300ms after clicking the Copy button) | Same code block, copy button now reads `Failed` with red-tinted styling (`#fef2f2` bg, `#fca5a5` border, `#991b1b` text per the `data-state="failed"` rule); confirms the click handler fires and the swap-and-revert path works. The `Failed` state — not `Copied` — is the spec D4 fallback for headless Chrome without `--enable-features=Clipboard`; both swap states prove the click handler fired, which is the AC4 pass criterion. |

---

## Issue log — cross-task follow-up

| ID | Severity | Status | Owner / next touch | Action |
| -- | -------- | ------ | ------------------ | ------ |
| M-UX-REVIEW-T5-ISS-01 | HIGH | RESOLVED — cycle 2 | — | T5 spec status flipped to `✅ done 2026-04-27` to match the other four surfaces; lockstep restored. SHA pending commit. |
| M-UX-REVIEW-T5-ISS-02 | LOW | DEFERRED — propagated to T6 | Builder of T6 (T6 already touches `architecture.md` §1) | Append a half-sentence to `architecture.md:84` acknowledging the MDX `pre` mapping as a deviation from the original spec wording (fenced MDX blocks bypass the M2 wrapper; `pre` mapping is the minimal route given the pandoc-filter spec constraint). Carry-over entry landed in `tasks/T6_typography.md` `## Carry-over from prior audits` (cycle 2). |
| M-UX-REVIEW-T5-ISS-03 | LOW | DEFERRED — propagated to T6 | Builder of T6 | Append a bullet under `architecture.md:478` (§6 forward-work) naming the component-side wiring location for per-block language detection: `<span class="code-block-lang">C++</span>` at `src/components/callouts/CodeBlock.astro:84` is the swap target when the §6 trigger fires (first non-C++ chapter block). Carry-over entry landed in `tasks/T6_typography.md` `## Carry-over from prior audits` (cycle 2). |

---

## Deferred to nice_to_have.md

None. None of the findings map to existing `nice_to_have.md`
sections. F12 (`--mux-accent` semantic split) is parked under
§UX-5 with an M5-trigger and is not affected by T5's reuse of
`--mux-accent-bg` / `--mux-accent` / `--mux-accent-strong` for the
`data-state="copied"` styling — the boundary stays clean.

---

## Propagation status

LOW-1 (M-UX-REVIEW-T5-ISS-02) and LOW-2 (M-UX-REVIEW-T5-ISS-03)
forward-deferred to T6 — **propagation landed in cycle 2**.

**Carry-over targets — confirmed landed:**

- [`design_docs/milestones/m_ux_review/tasks/T6_typography.md`](../tasks/T6_typography.md)
  `## Carry-over from prior audits` — two new `- [ ]` entries appended
  on 2026-04-27 (cycle 2 closure pass), immediately after the existing
  T4-deferred bullets (M-UX-REVIEW-T4-ISS-02 + M-UX-REVIEW-T4-ISS-03):
  - `- [ ] M-UX-REVIEW-T5-ISS-02 (LOW)` — half-sentence amendment to
    `architecture.md:84` acknowledging MDX `pre` mapping as a deviation
    from spec D2 wording; folds into T6's existing §1 edit.
  - `- [ ] M-UX-REVIEW-T5-ISS-03 (LOW)` — bullet appended to
    `architecture.md:478` §6 cross-referencing the component-side swap
    target (`CodeBlock.astro:84` static literal → prop-driven) when the
    per-language detection §6 trigger fires.

HIGH-1 (M-UX-REVIEW-T5-ISS-01) was NOT a forward-deferral — it was a
same-cycle mechanical Builder fix (single line at
`tasks/T5_code_block_polish.md:3`). Cycle 2 closed it: spec status
flipped to `✅ done 2026-04-27`; all five status surfaces now lockstep.

---

## Cycle 2 (2026-04-27) — closure pass

Mechanical Builder cycle: closes HIGH-1 + propagates LOW-1 + LOW-2 to
T6 carry-over per CLAUDE.md "Forward-deferral propagation" sequence.
No code touched, no architecture.md touched (LOW-1 + LOW-2 are T6's
job). No new tests, no manifest changes.

### Files touched (cycle 2)

| File | Change |
| ---- | ------ |
| `design_docs/milestones/m_ux_review/tasks/T5_code_block_polish.md` | Line 3: `**Status:** todo` → `**Status:** ✅ done 2026-04-27`. Closes HIGH-1. |
| `design_docs/milestones/m_ux_review/tasks/T6_typography.md` | Appended two `- [ ]` entries to `## Carry-over from prior audits` (M-UX-REVIEW-T5-ISS-02 + M-UX-REVIEW-T5-ISS-03), immediately after the T4-deferred bullets. Format matches the established T4 cycle-2 carry-over pattern. |
| `design_docs/milestones/m_ux_review/issues/T5_issue.md` | Preamble Status flipped ⚠️ OPEN → ✅ PASS — cycle 2 closure; Audit cycle bumped 1 → 2; issue-log table flipped HIGH-1 → RESOLVED, LOW-1 + LOW-2 → DEFERRED — propagated to T6; Propagation status footer updated to confirm carry-over landed; this Cycle 2 subsection appended. |
| `CHANGELOG.md` | Appended `Changed` entry under the existing 2026-04-27 section noting the cycle-2 closure. |

### Gates re-run (cycle 2)

| Gate | Command | Result |
| ---- | ------- | ------ |
| Build | `npm run build` | exit 0; 40 prerendered pages. |
| Functional tests | `python scripts/functional-tests.py` | **64/64 cases / 137/137 assertions PASS** (count unchanged from cycle 1; no new tests added in cycle 2). |
| Dependency manifest touch | `git diff --stat HEAD` (manifest set) | 0 lines (manifest set untouched). |

### Status-surface lockstep — final state (cycle 2)

| Surface | Value |
| ------- | ----- |
| (a) `tasks/T5_code_block_polish.md:3` | `**Status:** ✅ done 2026-04-27` ✓ (cycle-2 fix) |
| (b) `tasks/README.md` T5 row | `✅ done 2026-04-27` ✓ (cycle 1) |
| (c) `m_ux_review/README.md:57` task table T5 row | `✅ done 2026-04-27` ✓ (cycle 1) |
| (d) `m_ux_review/README.md:38` F7 Done-when checkbox | `[x]` with `(T5 issue file)` citation ✓ (cycle 1) |
| (e — bonus) `milestones/README.md:27` M-UX-REVIEW row | `T1 + T2 + T3 + T4 + T5 closed 2026-04-27; T6 outstanding` ✓ (cycle 1) |

All five surfaces consistent at `✅ done 2026-04-27`. Lockstep restored.

### Cycle 2 — auditor verification (2026-04-27)

Auditor re-ran the cycle-2 closure pass from scratch; confirms Builder's claims:

| Verification | Result |
| ------------ | ------ |
| T5 spec line 3 reads `**Status:** ✅ done 2026-04-27` | ✓ Confirmed via `grep -n "Status:" tasks/T5_code_block_polish.md` — line 3 matches verbatim. |
| T6 spec line 3 still reads `**Status:** todo` (no premature flip) | ✓ Confirmed via same grep — T6 line 3 = `**Status:** todo`. |
| T6 carry-over section structurally correct | ✓ `tasks/T6_typography.md:121-126` shows four `- [ ]` entries in order: T4-ISS-02 (line 123), T4-ISS-03 (line 124), T5-ISS-02 (line 125), T5-ISS-03 (line 126). Format `- [ ] **<ID> (<sev>)** — <what>... Source: [...](...)` matches the established T4-cycle-2 pattern. T4-deferred entries preserved. |
| Status-surface lockstep — all five surfaces | ✓ (a) `T5_code_block_polish.md:3` = `✅ done 2026-04-27`; (b) `tasks/README.md:13` = `✅ done 2026-04-27`; (c) `m_ux_review/README.md:57` = `✅ done 2026-04-27`; (d) `m_ux_review/README.md:38` = `[x]` with `(T5 issue file)` citation; (e) `milestones/README.md:27` = `T1 + T2 + T3 + T4 + T5 closed 2026-04-27; T6 outstanding`. |
| `npm run build` (auditor re-run from scratch) | ✓ exit 0; `find dist/client -name index.html \| wc -l` = **40**. |
| `.venv/bin/python scripts/functional-tests.py` (auditor re-run from scratch) | ✓ **64/64 cases / 137/137 assertions PASS** in 30.9s — exact match to Builder claim and to cycle-1 baseline (no new tests added in cycle 2; T5 closure is pure-doc + propagation). |
| `git diff --stat HEAD -- <manifest set>` | ✓ Zero lines in `package.json`, `package-lock.json`, `pyproject.toml`, `requirements*.txt`, `.nvmrc`, `.pandoc-version`. Cycle-2 changes are pure-doc; security-reviewer / dependency-auditor not warranted. |
| Architecture.md §1 line 84 + §6 line 478 unchanged this cycle | ✓ The LOW-1 + LOW-2 amendments are T6's job per the carry-over propagation; cycle 2 deliberately does not touch them. |
| HIGH-1 / LOW-1 / LOW-2 disposition | ✓ HIGH-1 RESOLVED (mechanical spec status flip on disk); LOW-1 + LOW-2 DEFERRED to T6 (carry-over entries verified landed). Issue-log table reflects this state. |

**Final verdict.** ✅ PASS — cycle 2 closure. 0 HIGH / 0 MEDIUM / 0 LOW open against T5; 2 LOW (M-UX-REVIEW-T5-ISS-02 + ISS-03) properly forward-deferred to T6 with carry-over entries landed. AC tally: 6 / 6 PASS. No new findings. Functionally-clean signal — T5 closes.

---

## Security review

**Reviewed on:** 2026-04-27 (post-cycle-2 functional-clean verdict).
**Threat model.** cs-300 is local-only single-user; static GH Pages deploy + localhost dev server. T5 introduces a clipboard-write event handler in CodeBlock.astro and a new MDX-to-component mapping. Surface area narrow.

### Files reviewed

- `src/components/callouts/CodeBlock.astro` — copy-button inline script, both render-mode branches, `data-state` attribute.
- `src/pages/{lectures,notes,practice}/[id].astro` — `pre: CodeBlock` MDX mapping.
- `src/components/chrome/Drawer.astro` + `DrawerTrigger.astro` — checked for `data-state` attribute conflicts.
- `scripts/pandoc-filter.lua` — confirmed `CodeBlock` handler strips lstlisting attributes (no attribute injection path).
- `scripts/build-content.mjs` — confirmed `<pre>` is only emitted by pandoc from fenced-code constructs.

### Critical

None.

### High

None.

### Advisory (all confirm-only — no actions required)

- **`CodeBlock.astro:121-123` script attaches per-page at script-boot time.** Astro hoists inline `<script>` blocks as a shared chunk; the script runs once per page load. `document.querySelectorAll('.code-block .code-block-copy')` at module evaluation finds all SSR-baked `.code-block` instances (both explicit-JSX and MDX `pre`-mapped paths). Correct for static pages where all `.code-block` elements exist in initial DOM. **Forward note:** if M6 (live coding surface) adds `.code-block` elements dynamically post-load, that builder will need a MutationObserver or re-binding hook — not a T5 concern.
- **`CodeBlock.astro:123` `closest('.code-block')` + `querySelector('code')` is correctly bounded.** Click handler walks up from the clicked button to the containing wrapper, then finds the wrapper's first `<code>` descendant. All three render branches (explicit JSX `<Code>`, MDX `pre` slot, fallback `<pre><code>`) produce a `<code>` child. Null-safety fallback `?? ''` writes empty string rather than throwing.
- **`CodeBlock.astro:131` `console.error` on clipboard failure** — error object passed to dev console only, never surfaced to DOM. Button text swap to "Failed" is a static literal. No error details leak to visible HTML.
- **`pre: CodeBlock` mapping non-code `<pre>` analysis.** Pandoc's Lua filter normalises every `CodeBlock` AST node (lstlisting, verbatim, indented) to the `cpp` class; pandoc doesn't emit bare `<pre>` for non-code MDX content. The risk of misrouting an ASCII-art `<pre>` through CodeBlock + applying the `C++` tag is structurally bounded — only `verbatim` / `lstlisting` LaTeX environments produce `<pre>` and both correctly route through CodeBlock.
- **`data-state="copied"|"failed"` vs `data-drawer-state="open"|"closed"`** — different elements (`.code-block-copy` button vs `#drawer-trigger`), different attribute names, different CSS consumers. No collision.
- **No `dangerouslySetInnerHTML` / `set:html` / off-device URLs / localStorage access** introduced by T5. Confirmed across all modified files.

### Verdict

**SHIP.** No actionable findings. The clipboard-write event handler is the only new client-side state; it reads from developer-controlled MDX-rendered `<code>` text content (build-time constant, not user input) and writes to the user's clipboard via the standard Web API. No injection vector, no off-device data leak, no race conditions.

### Dependency audit

Skipped — no manifest changes.
