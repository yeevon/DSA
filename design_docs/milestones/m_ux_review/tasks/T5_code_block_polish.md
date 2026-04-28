# T5 — Code-block polish: margin, language tag, copy button

**Status:** ✅ done 2026-04-27
**Source:** [`UI_UX_Review.pdf`](../../../UI_UX_Review.pdf) finding F7 (MED, ~1h CSS)
**Depends on:** —
**Unblocks:** —
**Reference:** [`../README.md`](../README.md), [`design_docs/architecture.md` §1 component library — `<CodeBlock>`](../../../architecture.md), [`scripts/pandoc-filter.lua`](../../../../scripts/pandoc-filter.lua)

## Why T5 exists (context)

Code is content for a DSA course — students will copy listings into a compiler. Today the Shiki dark-theme code blocks render as if pasted in: thin border, kissed up against the prose, no language hint, no copy affordance.

> "The Shiki dark-theme code block on the Notes page sits inside a thin-border body and feels like a screenshot pasted in. Two cheap fixes: (1) add ~8px outer margin so it doesn't kiss the prose; (2) drop a small `C++` language tag in the top-right corner — a 4-character tag earns a lot, especially when chapters mix C++ and pseudocode. Optional but high-value for a DSA course: a 'copy' button. Students *will* copy these into a compiler." — review F7

The first two are pure CSS. The copy button is a small island. ~1h total.

## Goal

1. **Outer margin** — code blocks gain ~8px breathing room above and below adjacent prose.
2. **Language tag** — a 4–8 char tag (e.g. `C++`, `pseudo`) renders in the top-right corner of every code block.
3. **Copy button** — a small button (icon + "Copy" text) in the top-right corner alongside the language tag, copies the block's text content to clipboard with a brief "Copied" affirmation.

## Spec deliverables

### D1. Outer margin (`src/styles/chrome.css` or `src/components/callouts/CodeBlock.astro`)

Single CSS rule. The `<CodeBlock>` component (or whichever wrapper Shiki emits — check the M2 / M-UX implementation) gains `margin-block: var(--mux-space-2)` (8px equivalent) so adjacent prose has breathing room.

### D2. Language tag (`src/components/callouts/CodeBlock.astro` + `scripts/pandoc-filter.lua`)

Per architecture.md §1: "the filter unconditionally sets `cpp` and clears any source-derived attrs because the chapter set is uniformly C++17." So today every block is `cpp` (no per-block lang variation).

Two paths:

- **Path A (recommended).** Render a fixed `C++` tag on every `<CodeBlock>` regardless of source. Cheap, accurate for the current corpus, doesn't pre-empt the post-build optional-content audit's per-block language detection (architecture.md §6 forward-work item).
- **Path B.** Add per-block `lang` plumbing now (read from `<CodeBlock lang="...">`, default `cpp`). Forward-compatible with the architecture.md §6 follow-up but slightly more work; the lang prop already exists per the architecture doc, just needs to render.

Pick **Path A** — minimal scope, doesn't pre-empt the architecture §6 follow-up, and the moment a non-C++ block lands the architecture §6 work picks up the per-block detection.

Implementation:

```astro
{/* CodeBlock.astro — render a header strip */}
<div class="code-block">
  <div class="code-block-header" aria-hidden="true">
    <span class="code-block-lang">C++</span>
    <button class="code-block-copy" type="button" data-clipboard-target>Copy</button>
  </div>
  <pre><code>...</code></pre>
</div>
```

CSS positions `.code-block-header` absolutely in the top-right of the `.code-block` container; the language tag is muted text, the copy button is a small outline button.

### D3. Copy button (small island, same component)

The copy button is an inline `<script>` (≤30 lines) inside `CodeBlock.astro` that wires:

- Click → `navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').textContent)`.
- After successful write, swap button text to "Copied" + apply `data-state="copied"` for ~1.5s, then revert.
- On error, swap to "Failed" briefly. Clipboard API is broadly supported on the cs-300 deploy targets (modern Chrome / Firefox / Safari).
- No external library; no Astro island runtime needed (the script is one event listener, not a component).

The script is always loaded (static + interactive mode). Bundle impact ~0.5 KB.

### D4. Functional-test assertions (`scripts/functional-tests.json`)

New test cases:

- `code-block-language-tag` — on `/DSA/lectures/ch_4/`, every `.code-block` contains exactly one `.code-block-lang` with text `C++`.
- `code-block-copy-button` — on `/DSA/lectures/ch_4/`, every `.code-block` contains exactly one `.code-block-copy` button.
- `code-block-margin` — on `/DSA/lectures/ch_4/`, computed `margin-block-start` of the first `.code-block` is ≥8px.
- `code-block-copy-functional` — Selenium clicks the first `.code-block-copy`, then reads `navigator.clipboard.readText()` (or checks the button's `data-state="copied"` text swap) — at minimum verify the click handler fired and `data-state` attribute changed. Clipboard read in headless Chrome may need a `--enable-features=Clipboard` flag; if read isn't available, the data-state swap is sufficient evidence.

### D5. Architecture.md amendment

`design_docs/architecture.md` §1 component-library subsection currently says: "`<CodeBlock>` is the only interactive-capable callout in static mode: syntax highlighting, copy button. In local mode it gains a 'send to editor' action…"

The copy button line was already in the architecture doc as a forward-looking statement; T5 closes the gap. Update §1 to reflect the actual implementation: copy button + language tag both ship in static mode + interactive mode. The "send to editor" action stays a forward-looking M6 surface.

## Acceptance checks (functional-test assertions, runnable by the auditor)

| AC | Finding | Assertion (informal) | Test case in config |
| --- | --- | --- | --- |
| AC1 | F7 | Every `.code-block` has a `.code-block-lang` with text `C++`. | `code-block-language-tag` |
| AC2 | F7 | Every `.code-block` has a `.code-block-copy` button. | `code-block-copy-button` |
| AC3 | F7 | `.code-block` has computed `margin-block` ≥8px. | `code-block-margin` |
| AC4 | F7 | Clicking the copy button fires the handler (button text swaps to "Copied" via `data-state="copied"`). | `code-block-copy-functional` |
| AC5 | doc | `design_docs/architecture.md` §1 reflects copy button + lang tag as shipped. | (doc-content grep) |
| AC6 | regression | Existing CodeBlock M3 contract (anchor IDs on enclosing sections, scroll-spy still fires correctly through code blocks) preserved. | (existing M3 / M-UX cases) |

## Smoke procedure

1. `npm run build` — confirm 40 pages, exit 0.
2. `npm run preview`.
3. `python scripts/functional-tests.py …` — exit 0.
4. Auditor opens `/DSA/lectures/ch_4/` (a chapter with multiple code blocks per the lectures.tex content) and visually confirms:
   - Each code block has a `C++` tag in the top-right.
   - Each code block has a Copy button next to the tag.
   - Code blocks have margin (don't kiss prose above / below).
   - Click Copy → button briefly says "Copied" → reverts.
5. `python scripts/smoke-screenshots.py …` — capture screenshot at 1280×800 of `/DSA/lectures/ch_4/` and verify visually.

## Status-surface flips on close

- (a) This file: `**Status:** todo` → `✅ done <date>`.
- (b) `tasks/README.md` T5 row.
- (c) `m_ux_review/README.md` task table T5 row.
- (d) Milestone-level `m_ux_review/README.md` `Done when` checkbox for F7 (with citation parenthetical pointing at the per-task issue file).
- (e) `design_docs/architecture.md` §1 reflects the implementation.

## Carry-over from prior audits

None. T5 is net-new from the 2026-04-27 review.

## Out of scope

- Per-block language detection (Path B from D2). Deferred to architecture.md §6 forward-work item; trigger = first non-C++ chapter block.
- "Send to editor" action — M6 surface.
- Code-block line numbers, word-wrap toggle, syntax-theme switcher. Out — not surfaced by the review.
- Pseudocode rendering style differentiation. The review notes mixing C++ and pseudocode is common for DSA — but the §6 forward-work item handles per-language detection when a non-C++ block lands; T5 doesn't pre-empt that.
- Inline-code (`<code>` outside `<pre>`) styling. Out — only block code (`<pre><code>`) is touched.
