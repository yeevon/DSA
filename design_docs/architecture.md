# Architecture

Gating artifact for Phase 1 of `interactive_notes_roadmap.md`. Defines the parts of the system that require deliberate design; leans on the roadmap for constraints and settled decisions rather than restating them.

Scope is intentionally tight. The site is static by default. The only genuinely dynamic surfaces are: question generation (over the local `aiw-mcp` server from `jmdl-ai-workflows`, running cs-300's workflow modules), question rendering and answer capture, code execution for coding questions, and the FSRS review loop over persisted attempt state. Everything else is a pandoc + Astro content pipeline that terminates in static HTML.

## System shape

```
┌─────────────────────────── local dev machine ─────────────────────────────┐
│                                                                           │
│  chapters/ch_N/{lectures.tex,notes.tex,practice.md}                       │
│           │                                                               │
│           ▼ pandoc + Lua filter (build time)                              │
│  src/content/{lectures,notes,practice}/ch_N.mdx                           │
│           │                                                               │
│           ▼ astro build                                                   │
│  dist/  ── static HTML + React islands + client bundle ───▶ GH Pages      │
│                                                                           │
│  (local-only, runtime)                                                    │
│  ┌───────────────┐   HTTP    ┌──────────────────────────────────────────┐ │
│  │ browser       │◀─────────▶│ aiw-mcp (Python)                         │ │
│  │ (Astro bundle)│           │   = jmdl-ai-workflows MCP server,        │ │
│  │               │           │     orchestrating cs-300 workflow        │ │
│  │               │           │     modules (./workflows/*.py) over      │ │
│  │               │           │     local Ollama (Qwen) tier             │ │
│  │               │           └──────────────────────────────────────────┘ │
│  │               │   HTTP    ┌──────────────────────────────────────────┐ │
│  │               │◀─────────▶│ state service (Node, Astro API routes)   │ │
│  │               │           └──────────────────────────────────────────┘ │
│  └───────────────┘                              │                         │
│                                                 ▼                         │
│                                        SQLite (local file)                │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

Two local-only processes — separate language runtimes, separate persistence:

1. **`aiw-mcp` (Python).** The MCP server shipped by [`jmdl-ai-workflows`](https://pypi.org/project/jmdl-ai-workflows/) (≥0.2.0, FastMCP-based, KDR-008 in the upstream framework). cs-300 contributes workflow modules — `question_gen`, `grade`, `assess` — that register into the framework's workflow registry; ai-workflows' four-layer substrate (`primitives → graph → workflows → surfaces`) handles dispatch, retry, cost tracking, checkpointing, and the MCP transport. Browser reaches it over the streamable-HTTP transport added at jmdl-ai-workflows M14 (CORS-allowlisted to `http://localhost:4321`). External-workflow-module discovery (`AIW_EXTRA_WORKFLOW_MODULES` env var + `--workflow-module` CLI flag) shipped at jmdl-ai-workflows M16 in v0.2.0 (2026-04-24); cs-300's workflow modules under `./workflows/` are loaded via that surface — no fork, no monkey-patch, wheel stays domain-agnostic.
2. **State service (Node).** The Astro dev server itself, via API routes under `src/pages/api/`. Owns SQLite via Drizzle (M3); see §4.

There is no separate "FastMCP adapter we build." `aiw-mcp` IS the MCP server. cs-300 authors workflows + sets the agent (tier registry) per workflow + runs `aiw-mcp` against them. The framework abstracts the orchestration — see [ADR-0001](adr/0001_state_service_hosting.md) for the cross-language sibling-process rationale. (The original cs-300-filed feature request for external workflow module discovery was deleted 2026-04-25 once jmdl-ai-workflows v0.2.0 shipped the feature; see the **Workflow discovery** subsection below for the live wire-up.)

Public deploy is just `dist/`. No adapter, no state service. Feature detection at bootstrap toggles the interactive UI off.

---

## 1. Static content pipeline

### Source layout (unchanged from today)

```
chapters/ch_N/
  lectures.tex   # full chapter, LaTeX w/ custom environments
  notes.tex      # two-page reference, LaTeX
  practice.md    # coach prompts, markdown
```

`notes-style.tex` defines the custom environments (`defnbox`, `ideabox`, `warnbox`, `examplebox`, `notebox`) and listing styles. These are the atoms the pipeline has to preserve.

### Pandoc + Lua filter

One Lua filter, one pandoc invocation per `.tex` file. Filter responsibilities:

- Map LaTeX environments → MDX components:
  - `defnbox` → `<Definition>`
  - `ideabox` → `<KeyIdea>`
  - `warnbox` → `<Gotcha>`
  - `examplebox` → `<Example>`
  - `notebox` → `<Aside>`
- Map `lstlisting` → `<CodeBlock lang="cpp">`. *(M2 T2/T5b implementation detail, 2026-04-23: the filter unconditionally sets `cpp` and clears any source-derived attrs because the chapter set is uniformly C++17 and pandoc preserves the lstlisting options as fence attributes that Shiki then mis-reads as the language hint. Per-class language detection — the original "preserve language hint" wording — is deferred until a non-C++ block lands; tracked at §6 below as a forward-work item against the post-build optional-content audit.)*
- Strip preamble-only commands; pandoc's default LaTeX reader handles the rest.
- Emit section anchors as `<a id="ch_N-section-slug">`. These are the stable refs used by SQLite `sections.anchor`, read-status tracking, and annotation targeting.

Writing the filter is the first concrete build task once this doc is agreed. Pandoc-on-`ch_1/lectures.tex`-without-filter is the Phase 1 idle probe; its output determines how much the filter has to do.

Markdown practice files skip pandoc entirely — copied into `src/content/practice/` and rendered as MDX directly.

### Component library

Lives in `src/components/callouts/`. Minimal props: `title?`, `children`. Styling owned by the component, not the consumer. These map 1:1 with the LaTeX callout boxes — the content model is the same, only the renderer changes.

`<CodeBlock>` is the only interactive-capable callout in static mode: Shiki syntax highlighting, a fixed `C++` language tag in the top-right of the wrapper, and a copy-to-clipboard button beside the tag (M-UX-REVIEW T5, 2026-04-27 — UI-review F7). The wrapper ships in both render paths: explicit `<CodeBlock code="..." />` JSX and the MDX `pre` element mapping (`components={{ pre: CodeBlock }}` on `<Content />` in `src/pages/{lectures,notes,practice}/[id].astro`) so MDX-rendered fenced blocks pick up the same envelope as direct JSX usage. The MDX `pre` mapping is a deviation from T5 spec D2's original wording (which assumed the M2 `<CodeBlock>` already wrapped Shiki output and therefore showed only the explicit-JSX render shape): Astro's MDX integration emits Shiki's `<pre class="astro-code">` directly and bypasses the M2 wrapper, so the `pre: CodeBlock` mapping in the three chapter route templates is the minimal route to make every fenced block on every chapter page pick up the F7 polish without filter-time wrapping in `scripts/pandoc-filter.lua` (the spec constraint forbids that path). The fixed `C++` tag is intentional — the chapter set is uniformly C++17 today; per-block language detection is the §6 forward-work item below, triggered by the first non-C++ chapter block. In local mode the component gains a "send to editor" action for coding-practice questions (§3 code path).

### Astro content collections

Three collections, one per source family:

```
src/content/
  lectures/  # chapter bodies (one MDX per chapter)
  notes/     # two-page refs
  practice/  # coach prompts
```

Per-chapter metadata stays in `_data/chapters.yml` for now (migrate into content-collection frontmatter at Phase 2 cutover — trivial port).

### Page chrome (UX layer)

Resolved in [ADR-0002](adr/0002_ux_layer_mdn_three_column.md), 2026-04-24, after M3 closed and the M3 surfaces (annotations, read-status, section nav) needed a deliberate place to live. M-UX milestone owns the implementation; this subsection documents the contract every future surface should compose into.

**Typography (M-UX-REVIEW T6, 2026-04-27 — UI-review F11; ADR-0002 typography deferral resolved).** Source Sans 3 (body) + JetBrains Mono (code), self-hosted as variable woff2 in `public/fonts/` (latin subset; weight axis covers 400/600/700; Source Sans 3 ships an italic file in addition so prose italic renders in the matched cut rather than browser-synthesized). Declared via three `@font-face` blocks in `src/styles/chrome.css` with `font-display: swap` so the brief FOUT during cold load renders in the system fallback chain rather than blocking page paint. Two CSS custom properties carry the pinned families — `--mux-font-body` for body / chrome / Source Sans 3, `--mux-font-mono` for `<pre class="astro-code">` Shiki blocks + `.code-block-lang` + the `.chapter-card-num` (ch_N) tag — so any future dark-mode / theme work is a single-rule swap. KaTeX math composition unchanged: KaTeX retains its own font stack for math glyphs, body math falls back to `--mux-font-body`'s primary family for the non-math characters. Bundle delta: +118,556 bytes (97,676 woff2 + ~20,880 inline CSS replicated across 40 prerendered HTML files); inside the M-UX cumulative `dist/client/` budget. See ADR-0002 for the chosen-pairing rationale (cross-device rhythm consistency for a 200-hour reading product).

**Three-column desktop grid (≥1024px):**

```
┌────────────────────────────────────────────────────────────────────┐
│ top breadcrumb (sticky)                                            │
│   cs-300 / ch_4 ─ Lists, Stacks, Queues          [← ch_3 | ch_5 →] │
├──────────────┬─────────────────────────────────────┬───────────────┤
│ left rail    │ CHAPTER 4 · LECTURES (eyebrow)      │ right rail    │
│              │ Lists, stacks, queues, deques (h1)  │               │
│ Required     │ [ Lectures | Notes | Practice ]     │ § TOC         │
│  ✓ ch_1      │                                     │   §1 Intro    │
│  ✓ ch_2      │ chapter content (max-width ~75ch)   │   §2 …  ←now  │
│  → ch_4      │   prose, callouts, code blocks      │   §3 …        │
│    ch_5      │                                     │               │
│    ch_6      │                                     │ ─ annotations │
│              │                                     │   (interactive│
│ Optional     │                                     │    mode only) │
│    ch_7      │                                     │               │
│    ch_9 …    │                                     │               │
└──────────────┴─────────────────────────────────────┴───────────────┘
```

**Mobile (<1024px):** single column. Left rail collapses to a hamburger drawer; the trigger button (`☰ Chapters ›` per M-UX-REVIEW T4 D3) sits as its own row above the chrome stack so it survives the breadcrumb-hide at <768px. Right-rail TOC behaviour now varies by sub-band: at **768–1023px (tablet)** it moves to a collapsed `<details class="toc-mobile-collapse">` summary at content top per the original M-UX T7 mobile re-order; at **<768px (phone)** the right-rail desktop TOC track and the `toc-mobile-collapse` `<details>` are both hidden by `Base.astro`'s mobile @media block, and the on-this-page affordance is rendered inline by `<MobileChapterTOC>` (a separate component with its own `.rhs-toc-mobile` selector) inside the chapter route's `<header>` after `<CollectionTabs>` — see the **Mobile DOM order (<768px ...)** block immediately below for the post-T4 phone shape. Annotations pane stays gated on `data-interactive-only` per [§4](#4-local-vs-public-mode).

**Mobile DOM order (<768px, post M-UX-REVIEW T4 D1 + D2).** Per UI-review F9, the breadcrumb hides entirely below 768px (`.breadcrumb-bar { display: none }` in `Base.astro`'s mobile media block; the drawer trigger + the drawer's chapter list together cover the navigation affordance the breadcrumb used to provide). The right-rail aside also hides at <768px. The mobile chapter-route DOM reads, top to bottom:

```
drawer-trigger (☰ Chapters › — own row above chrome stack)
[breadcrumb hidden]
eyebrow (Chapter 4 · Lectures)
h1 (chapter topic — Lists, stacks, queues, deques)
CollectionTabs (Lectures | Notes | Practice)
MobileChapterTOC (<details> "On this page" — lectures only)
article (chapter content)
```

The on-this-page `<details>` is rendered by `src/components/chrome/MobileChapterTOC.astro` (T4 D2 — distinct from `RightRailTOC.astro`'s `.right-rail-toc` selector so ScrollSpy + RightRailReadStatus don't double-paint), mounted inside the chapter route's `<header>` after `<CollectionTabs>`. Hidden at ≥768px via the component's own media query so the desktop right-rail TOC stays the single TOC surface above the breakpoint. At 768–1023px (tablet) the breadcrumb returns and the right-rail aside (with its `<details class="toc-mobile-collapse">` summary visible) renders above main per the existing M-UX T7 mobile re-order — that path is unchanged at tablet sizes. T4's right-rail-aside hide rule fires only below 768px; tablet keeps the same shape it had before T4.

**Interactive-mode affordances** (all gated via the M3 T5 `data-interactive-only` CSS contract):

- Per-chapter completion indicator (Canvas-style checkmark) in the left rail, derived from the `read_status` table.
- Annotations pane in the right rail (re-homed from the M3 always-rendered position).
- "Recently read" + "due for review" sections on the index page (M5 fills these in when the review queue lands).

**Static-mode posture** (public GH Pages deploy):

- Left rail + right-rail TOC + chapter content all SSR-rendered. Fully navigable without JS.
- Mobile drawer requires JS (one always-loaded island). Single graceful degradation: without JS, the drawer button is hidden and the left rail isn't reachable on mobile — desktop is unaffected.
- Scroll-spy enhancement on the right-rail TOC is JS-only; without it, the TOC links are still anchors that work.

**Shared layout primitives** live under `src/components/chrome/` (shell, breadcrumb, left rail, right rail, drawer). Existing component trees (`src/components/{annotations,read_status,callouts}/`) keep their interfaces; M-UX T6 re-homes the M3 components into the new chrome slots without changing their APIs.

**M3 `SectionNav` refactor.** Current implementation (T7) ships `SectionNav` as a fixed left rail. Per ADR-0002, M-UX T4 pulls its functionality into the right-rail TOC structure. The old left-rail position becomes the chapter-list nav. No two left rails.

**Collection-landing pages (M-UX T9 D5).** Three landing pages render via `HomeLayout.astro`: `/DSA/lectures/`, `/DSA/notes/`, `/DSA/practice/`. Each renders the same chapter-card grid the index page uses (Required ch_1–ch_6 / Optional ch_7, ch_9–ch_13) with the home collection's link highlighted via the `highlight` prop on `ChapterCard.astro`. **Reachability post-M-UX-REVIEW T3:** the home page (`/DSA/`) and the three landing pages are entry points for landing-page navigation. Chapter-route navigation between collections is served by `CollectionTabs.astro` (T3 D2), which links chapter-route to chapter-route (e.g. `/DSA/lectures/ch_4/` → `/DSA/notes/ch_4/`); the prior breadcrumb middle-segment link to landing pages was removed at T3 D1 per F5 because it duplicated the URL + tabs information. After T3 D1, no chrome surface on a chapter route links directly to `/DSA/{lectures,notes,practice}/` — the cross-collection user need (jump to a different collection's chapter) is served by `CollectionTabs.astro` chapter-to-chapter, and the home + landing-page card grid (T1 D2 + M-UX T9 D5) remains the entry point for landing-page navigation. Total prerendered surface: **40 pages** = 36 chapter routes (12 chapters × 3 collections) + 3 collection-landing pages + 1 dashboard index. Cumulative `dist/client/` size delta vs pre-M-UX baseline: see m_ux_polish/README.md for the running figure.

**Right-rail TOC hierarchy (M-UX-REVIEW T2 + 2026-04-27 followup uniform-H1 filter).** Frontmatter emits H1 + H2 entries with per-entry `data-level` (`1` = top-level numbered section matching `^\d+\.\d+\s` like "4.1 The List ADT"; `2` = the H2 subsection underneath like "The contract: operations"). **The render-time consumer at `RightRailTOC.astro` filters to `data-level === 1` only** (followup, 2026-04-27). Rationale: the chapter corpus is split — ch_1–ch_4 lectures use numbered `\subsection{...}` (anchored, extracted as level=2 in frontmatter), while ch_5+ use `\subsection*{...}` (unnumbered, no anchor, NOT extracted). Pre-filter ch_4's right-rail showed 68 entries while ch_5's showed 9; user flagged the per-chapter inconsistency as worse than uniform-shallow rendering. The build-time frontmatter still carries level=2 entries — kept as a forward surface for M5 review-queue scheduling — but the consumer filter keeps the rail uniform across all 12 chapters until a content-audit pass normalizes `\subsection*{}` → `\subsection{}` across ch_5–ch_13. Restoring T2's H1+H2 rail is a one-line edit at `RightRailTOC.astro` after that content sweep. H3+ stays excluded at the build-script boundary (`scripts/build-content.mjs` `extractSections` drops any header with depth `> 2`) — too granular for the rail. Rendered split: H1 bold + flush-left + 0.5rem top-margin separator (`:first-child` suppressed); H2 indented 1rem + muted via `--mux-fg-subtle`. ScrollSpy prefers the most-specific intersecting level via a defensive `(level desc, top asc)` tiebreaker in `setCurrent()` (cycle-2 hardening, M-UX-REVIEW-T2-ISS-03): when multiple anchors intersect simultaneously the higher `data-level` (H2) wins; ties on level fall back to the topmost-wins geometric sort. Today's `rootMargin: '0px 0px -66% 0px'` geometry already lands on the H2 in the asserted ch_4 anchor pair because the parent H1 has scrolled out of the band — the tiebreaker guards against future `rootMargin` tweaks that could let H1 + H2 intersect simultaneously. The `setCurrent()` guard still discards non-TOC anchors so unnumbered-subsection scroll cannot blank the highlight. T2's reversal of the b29d409 filter is actually two distinct edits: (a) drops the render-time `TOP_LEVEL_TITLE = /^\d+\.\d+\s/` regex inside `RightRailTOC.astro` that filtered the rail to top-level numbered sections at component render time, and (b) adds a build-time H3+ exclusion in `extractSections()` (`scripts/build-content.mjs`). The lectures frontmatter has carried every H1 + H2 + H3 anchor since M2 T4; b29d409 only ever lived in the SSR component. The b29d409 byte-size savings on `dist/client/lectures/ch_4/index.html` partially regress (~25 KB on ch_4: 555,586 → 580,627 bytes — well below the spec's expected ~80 KB upper bound because ch_4's prior frontmatter regex already missed `\subsection*`-style unnumbered subsections, so the rail expansion adds only the existing 50 H2 entries rather than a full ~110-entry sweep). The +25 KB sits inside the M-UX +756 KB cumulative delta — no budget pressure, no §UX-4 trigger. Addresses UI-review F4.

**Chapter chrome shape (M-UX-REVIEW T3, supersedes M-UX T3 + T9 single-row breadcrumb).** The chapter-route chrome now reads as one navigation model per row:

1. **Breadcrumb bar (`Breadcrumb.astro`).** Crumbs on the left (`cs-300 / ch_4 — Lists, stacks, queues`); chapter prev / next on the right (`← ch_3` / `ch_5 →`, arrow glyphs replacing the M-UX T3 era guillemets per UI-review F5). The collection-switcher pills + the middle path segment (`Lectures` / `Notes` / `Practice`) are gone — they shared the row with two other navigation models, which the UI review (F5) flagged as the single highest-impact chrome finding.
2. **Eyebrow + H1 + collection tabs (chapter route templates + `CollectionTabs.astro`).** A small uppercase eyebrow caption (`Chapter 4 · Lectures`) sits above the topic-as-H1 (`Lists, stacks, queues, deques`); the collection tabs render directly underneath as a segmented-control strip (current tab filled accent, others outline). **H1 invariant (UI-review F6, T3 D2):** the page H1 names the chapter TOPIC, not the coordinates the user already reads from the URL + breadcrumb + active LeftRail row + the tabs. The eyebrow + tabs together carry the redundant coordinates so removing them from the H1 doesn't lose information. Applies to all three chapter routes (lectures / notes / practice).

The cross-collection link contract is preserved across the change: the breadcrumb middle segment used to host it, now `CollectionTabs.astro` does (one click from `/DSA/lectures/ch_4/` → `/DSA/notes/ch_4/`). The home page card grid remains the cross-cutting entry point. The CSS `.collection-tab.is-current` rule reuses the same accent-bg + accent-ring tokens as `.chapter-link.is-current` in LeftRail so "current" reads identically across both surfaces.

LeftRail subtitle trim (UI-review F8, T3 D3): each non-current rail entry truncates `ch_N — Title` to one line via `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` on `.chapter-link:not(.is-current) .chapter-label`; full subtitle mirrored into the `<a>` `title=` attribute for hover/long-press. The current chapter keeps the full multi-line render — that's the entry the user wants the most context on. CSS-only change (plus the markup-level `title=` attribute).

**Mobile chrome reduction (M-UX-REVIEW T4, supersedes the M-UX T7 in-breadcrumb hamburger placement).** Per UI-review F9 (HIGH) the mobile chrome stack stops piling navigation surfaces above the H1. Three shape changes at <768px:

1. **Drawer trigger extracted from the breadcrumb.** The hamburger button (`DrawerTrigger.astro`) used to mount inside `Breadcrumb.astro`'s `drawer-trigger` named slot (M-UX T7 placement). T4 D1 promotes it to a sibling of the breadcrumb in `Base.astro` via a new chrome-level `drawer-trigger` named slot — the slot is its own row above the breadcrumb in the `<1024px` grid template, so the trigger stays visible when the breadcrumb hides. The slot is wired into the desktop / mobile templates by **two** rules in `Base.astro` that act in concert: (a) `.chrome > [data-slot="drawer-trigger"]:empty { display: none }` collapses the row on routes (index, landing pages) where no consumer mounts a `<DrawerTrigger>` into the slot — `:empty` matches because the slot wrapper has no element children; and (b) inside the `@media (min-width: 1024px)` block, `.chrome > [data-slot="drawer-trigger"] { display: none }` hides the wrapper at desktop on chapter routes — `:empty` cannot fire there because the slot has a child (the `<DrawerTrigger>` button itself, whose own component-level `@media` query hides the button at ≥1024px but leaves the wrapper non-empty). The dual-rule rationale is the load-bearing piece: each rule covers a case the other can't reach. The authoritative `why` lives in the `Base.astro` docstring (lines 317–326).
2. **Breadcrumb hides.** A single `.breadcrumb-bar { display: none }` rule on the outer breadcrumb slot wrapper at `@media (max-width: 767.98px)`. The drawer + the drawer's chapter list cover navigation; the prev/next chapter affordance loses its mobile placement (acceptable per F9).
3. **Drawer-trigger label + chevron.** The cycle-1 bare-glyph `<button>☰</button>` becomes `<button>☰ Chapters ›</button>` (T4 D3, UI-review F10 MEDIUM). The chevron rotates 180° when the drawer opens via a `[data-drawer-state="open"] .drawer-chevron` CSS rule; the styling-only `data-drawer-state` attribute is flipped by `Drawer.astro` in the same `open()` / `close()` path that flips `aria-expanded`, so the visual + a11y states never disagree. The `Chapters` label hides at <360px so legacy 320-pt phones don't crowd the trigger row; icon + chevron stay.

The on-this-page `<details>` repositioning (D2) is documented in the Mobile DOM order block above. M-UX T7's focus-trap + Escape-to-close + `cs300:drawer-toggle` event contracts are unchanged; T4 only added the new attribute write inside `Drawer.astro`'s open/close functions.

**Continue-reading strip (client-side localStorage primitive, M-UX-REVIEW T1).** The static-mode home + landing pages render an optional `<aside data-slot="continue-reading">` populated from a single localStorage key (`cs300:last-visit`). A small always-loaded `<script>` in `Base.astro` writes `{path, title, scrollY, ts}` on every chapter route (skipped on the four landing surfaces, which have no chapter context). The reader island in `ContinueReading.astro` reads the key on landing-page mount and renders a resume card if present, or empty if absent (CSS `:empty { display: none }`). Single-key, no schema, no migration story; survives the static deploy without a state-service round-trip; replaced by the SQLite-backed dashboard slot (`recently-read`, gated `data-interactive-only` per M3 T5) when M5 lands. Strictly browser-local — never written to the state service, never synced cross-device. Added to make the home page "actually know you" in static mode, addressing UI-review F3.

### §1.7 Verification gates (M-UX-introduced infra)

Every code task in cs-300 must satisfy CLAUDE.md's "Code-task verification is non-inferential" non-negotiable: build success is not evidence of runtime correctness. M-UX added two harness scripts that the auditor runs at every code-task gate plus the milestone-close gate:

- **`scripts/smoke-screenshots.py`** (M-UX T7 cycle 2) — Selenium 4 driving headless Chrome (`--headless=new`) with isolated `/tmp/cs300-smoke-*` user-data-dir + ephemeral debugging port (zero conflict with the user's interactive Chrome). Captures PNGs across the smoke route matrix in `scripts/smoke-routes.json` at 4–5 viewports per route (375, 768, 1024, 1280, 2560). Output: `.smoke/screenshots/` (gitignored). Auditor opens 3+ screenshots per audit and cites visual evidence inline.
- **`scripts/functional-tests.py`** (M-UX T9 D6) — Selenium-driven assertion harness reading `scripts/functional-tests.json`. Six assertion types: `attr` (string/regex match on attribute), `count` (selector cardinality), `rect` / `getBoundingClientRect` (with `op` ∈ {`==`,`<=`,`>=`,`<`,`>`,`between`} after optional pre-scroll), `href-pattern` (regex over href), `aria-current` (presence + value), `text-pattern` (regex over `textContent`). Exits 0 on all-pass, non-zero on any failure. Currently 19 test cases / 30 assertions covering the M-UX chrome contracts (centered-chrome wide-viewport, sticky rails after scroll, LeftRail collection-aware hrefs, breadcrumb functional links, RHS-TOC top-level filter, landing-page card highlights).
- **`scripts/_selenium_helpers.py`** — shared Chrome flag set + `assert_preview_reachable()` helper used by both harnesses.
- **`requirements-dev.txt`** — `selenium==4.43.0` pin (dep-audit clean: 0 CVEs across 15 transitive packages, wheel SHA256 verified at T7 gate).

**Boundary.** The harness runs against `npm run preview` (static mode) by default — captures layout-at-viewport behaviour for every chapter route + the index + the three collection-landing pages. **Interactive-mode coverage** (annotation round-trip, mark-read paint, drawer keyboard navigation, focus-trap) is NOT yet exercised by the harness — deferred to `nice_to_have.md §UX-3` with explicit promotion trigger ("user-reported interactive-mode regression on push" or "M5 lands and needs end-to-end interactive coverage as part of its DoD").

### Audio (Phase 7 forward-compat)

TTS MP3s and sentence-timestamp JSON live alongside MDX:

```
src/content/lectures/ch_N.mdx
public/audio/ch_N.mp3
public/audio/ch_N.timestamps.json
```

Phase 7 adds an `<AudioPlayer>` island component that consumes the JSON to drive sentence highlighting. Static assets, no runtime generation. Noted here to pin the file layout decision early so Phase 2 doesn't pick something Phase 7 has to unwind.

---

## 2. Data model

SQLite file, local only. Accumulating model (roadmap open question resolved: §5 of this doc).

### Tables

```sql
-- Content refs. Seeded from chapters.yml + pandoc output on first boot
-- and on rebuilds. Rows are stable; only content under them changes.

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,              -- 'ch_1'
  n INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  required INTEGER NOT NULL         -- bool
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,              -- 'ch_1-arrays' (chapter-slug)
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  anchor TEXT NOT NULL,             -- DOM anchor
  title TEXT NOT NULL,
  ord INTEGER NOT NULL
);

-- Questions. One row per generated question. Answer schema + reference
-- solution are type-specific JSON blobs; validated by the workflow
-- before insert. 'status' lets retroactive review (Phase 4 initial ship
-- is gateless; post-M11 adds gate).

CREATE TABLE questions (
  id TEXT PRIMARY KEY,              -- uuid
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  section_id TEXT REFERENCES sections(id),    -- nullable; chapter-wide OK
  type TEXT NOT NULL,               -- 'mc' | 'short' | 'llm_graded' | 'code'
  topic_tags TEXT NOT NULL,         -- JSON array
  prompt_md TEXT NOT NULL,
  answer_schema_json TEXT NOT NULL, -- type-specific
  reference_json TEXT NOT NULL,     -- NEVER shipped to DOM for 'code'
  source_run_id TEXT NOT NULL,      -- aiw-mcp / ai-workflows run id, for evals replay
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'  -- 'active' | 'archived'
);

CREATE INDEX idx_questions_chapter ON questions(chapter_id, status);

-- Attempts. One row per submission. LLM tags populated async after
-- submission by the assessment workflow (Phase 5).

CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  started_at INTEGER NOT NULL,
  submitted_at INTEGER NOT NULL,
  response_json TEXT NOT NULL,      -- type-specific
  outcome TEXT NOT NULL,            -- 'pass' | 'fail' | 'partial'
  llm_tags_json TEXT                -- nullable; filled by assessment job
);

CREATE INDEX idx_attempts_question ON attempts(question_id, submitted_at DESC);

-- FSRS state per question. One row per question; upserted on each attempt.

CREATE TABLE fsrs_state (
  question_id TEXT PRIMARY KEY REFERENCES questions(id),
  due_at INTEGER NOT NULL,
  stability REAL NOT NULL,
  difficulty REAL NOT NULL,
  last_review_at INTEGER,
  lapses INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_fsrs_due ON fsrs_state(due_at);

-- Reader state.

CREATE TABLE read_status (
  section_id TEXT PRIMARY KEY REFERENCES sections(id),
  read_at INTEGER NOT NULL
);

CREATE TABLE annotations (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id),
  offset_start INTEGER NOT NULL,    -- char offset in rendered text
  offset_end INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### Schema-per-type payloads

`answer_schema_json`, `reference_json`, `response_json` are the shapes that vary by question type. Locked per type so validators (both the generation-time `ValidateStep` inside the cs-300 workflow module and the submission-time eval in the app) can be type-dispatched.

| type         | answer_schema_json                              | reference_json                                  | response_json                |
|--------------|-------------------------------------------------|-------------------------------------------------|------------------------------|
| `mc`         | `{options: [...], correct_ix: int}`             | `{explanation: str}`                            | `{chosen_ix: int}`           |
| `short`      | `{match: 'exact'\|'fuzzy'\|'numeric', expected: str, tol?: float}` | `{explanation: str}`       | `{text: str}`                |
| `llm_graded` | `{rubric: [criteria...]}`                       | `{ideal_answer: str}`                           | `{text: str}`                |
| `code`       | `{lang: str, signature: str, test_cases: [...]}` (test_cases shape: `{input, expected}`) | `{solution: str}`  — **server-only** | `{source: str}`              |

Notes:
- `reference_json` for `code` is served only by the state service when the question renders; the full solution never hits the DOM. Test-case inputs/expected *do* ship to the client for display-on-failure.
- `numeric` match handles Big-O / asymptotic answers via canonicalization; rule details defer to question_gen workflow.

### ORM

Drizzle. Rationale: lighter than Prisma, no runtime query engine, TypeScript-first, SQL feels like SQL. Migration story: check-in `drizzle/` artifacts, `drizzle-kit push` in dev.

### Seeding

On first boot (and after any rebuild), the state service reads:

- `scripts/chapters.json` → upserts `chapters`. (Migrated from the Jekyll-era `_data/chapters.yml` in M2 T5a; that file was deleted in M2 T8.)
- `src/content/lectures/*.mdx` frontmatter (`sections:` array, generated by `scripts/build-content.mjs` from pandoc-emitted `ch_N-` prefixed header anchors) → upserts `sections`. (Amended 2026-04-23 from `notes/*.mdx`; lectures owns the header structure, so the section list lives there. Notes + practice carry chapter metadata only — they do not feed seeding.)

Seeding is idempotent. Questions and attempt state are never touched.

---

## 3. Dynamic surfaces

Four dynamic surfaces, each with a clear contract. Everything else is static rendering.

### 3.1 Question generation (`aiw-mcp` + cs-300 workflow modules)

cs-300 contributes the `question_gen` workflow as a Python module under `cs300/workflows/` that registers with ai-workflows' workflow registry on import via `register_workflow(spec)`. The module uses jmdl-ai-workflows v0.4.0's `WorkflowSpec` declarative API: an `LLMStep` (Ollama Qwen 14B via `TierConfig`/`LiteLLMRoute`) plus a `ValidateStep` for shape-checking. M4 owns authoring this module and the matching `grade` / `assess` modules. `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen` triggers the import at `aiw-mcp` startup.

Frontend calls the `run_workflow` MCP tool on `aiw-mcp` with `{workflow_id: 'question_gen', inputs: {chapter_id, section_id?, section_text, count, types: [...]}}`. `section_text` is the rendered text the browser already has in-page; `aiw-mcp` does not read `chapters/` directly. The MCP server returns `{run_id, status, ...}` per the `RunWorkflowOutput` schema; long-running runs come back as `status: 'pending'` (cs-300's question_gen does not pause at a `HumanGate` by default — generation is short and direct).

Frontend polls via `list_runs(workflow_id='question_gen')` or `get_run_status(run_id)` until `status == 'completed'`. Completed runs surface artifacts via `result.artifact` (the value of `QuestionGenOutput.questions`, the first field of the output schema — first-field convention per jmdl-ai-workflows v0.4.0).

Frontend POSTs artifacts to the cs-300 state service (`POST /api/questions/bulk`), which validates and inserts. **Validation happens twice**: once inside the cs-300 workflow's `ValidateStep` (LangGraph-level shape check at the framework boundary), once at insert (schema conformance against `questions.answer_schema_json`). Redundant on purpose; the upstream framework is an external surface and could change shape.

**Workflow discovery.** ai-workflows v0.4.0 (`WorkflowSpec` surface, 2026-05-01) is the authoring target. Each module calls `register_workflow(spec)` at import time (not `register("name", build)` from the Tier-4 escape hatch). cs-300 launches `aiw-mcp` with `AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade`; on startup `aiw-mcp` imports each named module and the `register_workflow` calls fire. M4 unblocked definitively 2026-05-01 when v0.4.0 resolved all four convention hooks from the 2026-04-25 re-block (WorkflowSpec declarative API replaces the Tier-4 builder-returns-compiled / initial_state / payload-wrapping / FINAL_STATE_KEY surface). The convention-hooks issue file (`aiw_workflow_convention_hooks_issue.md`) deleted 2026-05-02.

Error shape for MCP calls:
```ts
type McpError =
  | { kind: 'adapter_unreachable' }        // feature-detection trigger
  | { kind: 'workflow_failed'; reason: string; run_id: string }
  | { kind: 'validation_failed'; errors: string[] }
```

### 3.2 Answer evaluation

Dispatched by question type at `POST /api/attempts`:

- `mc` → compare `chosen_ix` to `correct_ix`. Constant-time, no LLM.
- `short` with `exact` → string equality after trim+lowercase.
- `short` with `fuzzy` → Levenshtein ≤ threshold.
- `short` with `numeric` → parse + tolerance check.
- `llm_graded` → enqueue a `grade` workflow on ai-workflows; attempt row created with `outcome = 'pending'` until the grading run completes. Async.
- `code` → §3.3.

Outcome is persisted immediately (except `llm_graded`, which has a pending→terminal transition).

### 3.3 Code execution

Local subprocess. C++ is the baseline language (matches course); Python is a second-class path for pseudocode-substitute questions (roadmap open question lean: C++ primary).

Flow:

1. Frontend submits `{question_id, source}` to `POST /api/attempts` on state service.
2. State service fetches `reference_json` for the question (contains `solution`, `test_cases`). Solution is used nowhere in this flow — only for future "show solution" UI after submission.
3. State service writes `source` + a test harness to a temp dir.
4. Spawn compiler (`g++ -O0 -std=c++17`) with timeout (5s wall, compiled once).
5. For each test case: run binary with `input` on stdin, capture stdout, diff against `expected`. Per-case timeout 2s wall.
6. Aggregate outcome: pass iff all cases pass. Return `{outcome, per_case: [{input, expected, got, pass}]}`.

No sandbox (personal machine, per roadmap). `ulimit -v` guards memory runaway. Temp dir cleaned up per attempt.

### 3.4 Reader state (Phase 3)

Two surfaces M3 owns end-to-end (the M3 dogfood — exercise the schema + API + mode-detection plumbing before M4+ heavier surfaces ride on top).

**Annotations.**

- `GET /api/annotations?section_id=…` → array of annotations for that section.
- `POST /api/annotations` → body `{ section_id, offset_start, offset_end, text }`, returns the inserted row.
- `DELETE /api/annotations/:id` → 204.

Char offsets are within the article container's `textContent`. UI gates on `mode === 'interactive'` per §4.

**Read-status.**

- `GET /api/read_status?chapter_id=…` → `{ section_ids: [...] }` for all marked sections in that chapter.
- `POST /api/read_status` → body `{ section_id }`, upserts a row with current timestamp; returns 204.
- `DELETE /api/read_status/:section_id` → un-mark; 204.

POST is idempotent (`ON CONFLICT DO UPDATE` refreshes `read_at`). UI gates on `mode === 'interactive'` per §4.

### 3.5 Review loop (Phase 5)

FSRS library (`ts-fsrs` npm package) runs client-side after each attempt:

```
attempt submitted → outcome + rating (pass/fail/partial maps to FSRS grade)
                 → ts-fsrs.next(state, grade) → new_state
                 → PATCH /api/fsrs_state/:question_id
```

Review queue UI queries `GET /api/review/due?before=<now>&limit=N` → ordered by `due_at`.

LLM assessment (topic tagging of failed attempts) runs async as a separate ai-workflows workflow after each `fail`/`partial` attempt. Populates `attempts.llm_tags_json` on completion. Gap report aggregates over these tags.

---

## 4. Local-vs-public mode

Single runtime flag: `interactive`. Set once at app bootstrap.

```ts
// src/lib/mode.ts
export async function detectMode(): Promise<Mode> {
  try {
    const [adapter, state] = await Promise.all([
      fetch(ADAPTER_URL + '/health').then(r => r.ok),
      fetch('/api/health').then(r => r.ok),
    ]);
    return adapter && state ? 'interactive' : 'static';
  } catch { return 'static'; }
}
```

All interactive UI conditionally renders on `mode === 'interactive'`. Static mode exposes: lecture reading, notes (compact references), practice markdown, audio player (Phase 7 — audio is static assets so it works in both modes). Hidden in static mode: question generation UI, review queue, code editor, annotations, read-status indicators.

Build artifact is identical in both modes. No separate "local build" — the public and local sites are the same `dist/`. Feature detection alone flips the UI.

### State service hosting

Two viable paths; deferred decision (see §5):

**Path A — Astro server (recommended).** Run `astro dev` or `astro preview` locally. Astro API routes under `src/pages/api/` own SQLite via Drizzle. Two processes in local mode: Astro server (Node, :4321) + `aiw-mcp` (Python sibling process running cs-300's workflow modules over the streamable-HTTP transport, port 8080).

**Path B — Client-side SQLite.** `@sqlite.org/sqlite-wasm` + OPFS for persistence. One process in local mode for state (just `aiw-mcp` running the cs-300 workflows). GH Pages deploy unchanged. Tradeoff: WASM bundle ~2MB, schema migrations run in browser, slightly awkward ops.

Path A is cleaner for schema management and likely how we'll ship. Path B is a fallback if running a second process is too heavy.

---

## 5. Open decisions

These block nothing immediately but need resolution before the phase that depends on each.

| decision                                 | block       | lean                        | decide by      |
|------------------------------------------|-------------|-----------------------------|----------------|
| Pandoc Lua filter vs manual port (Ch 1)  | Phase 2     | **resolved: HYBRID** (small filter + native pandoc) — see [`pandoc_probe.md`](pandoc_probe.md) | ✅ 2026-04-23 |
| State service: Astro server vs client SQLite | Phase 3 | **resolved: Path A (Astro server)** — see [ADR 0001](adr/0001_state_service_hosting.md) | ✅ 2026-04-24 |
| FSRS vs SM-2                             | Phase 5     | FSRS (`ts-fsrs`)            | Phase 5 start  |
| Code language: C++ only vs C+++Python    | Phase 6     | C++ baseline, Python later  | Phase 6 start  |
| Question-gen model tier (14B/32B/Claude) | Phase 4     | 14B start, A/B via tier_overrides | Phase 4 eval |
| `coding_practice/` persisted vs dynamic  | Phase 4     | **resolved: dynamic** — `question_gen` workflow receives `section_text` directly from the browser; `coding_practice/` is the coding-exercise workspace, unchanged. No Phase 4 prompt files needed. ✅ 2026-05-01 | — |

Resolved here:
- **Question persistence model:** accumulating (roadmap's "almost certainly" confirmed).
- **Answer evaluation surface:** mixed — mc, short (exact/fuzzy/numeric), llm_graded, code. Schema in §2 carries all four.
- **Audio file layout:** `public/audio/ch_N.{mp3,timestamps.json}`, pinned now to avoid Phase 7 unwind.
- **Pandoc version pin:** **3.1.3** (recorded in [`../.pandoc-version`](../.pandoc-version), 2026-04-23 via M2 T2). The HYBRID verdict and the Lua filter at `scripts/pandoc-filter.lua` are calibrated against this version; major-version bumps require re-running the M2 T2 raw-passthrough sweep at [`m2_raw_passthrough_sweep.md`](m2_raw_passthrough_sweep.md) and re-verifying the filter's per-class behaviour.

---

## 6. Out of scope for this doc

Not because unimportant — because already settled elsewhere or deferred to their phase:

- jmdl-ai-workflows internals (LangGraph substrate, FastMCP server, retry/cost primitives — closed surface from this repo's view; framework docs at <https://pypi.org/project/jmdl-ai-workflows/>; cs-300 is a downstream consumer that contributes workflow modules per §3.1).
- TTS provider choice (Phase 7 open question).
- Question prompt corpus shape under `coding_practice/` (**resolved 2026-05-01**: dynamic — `section_text` flows in from the browser; `coding_practice/` is the user's coding-exercise workspace, unchanged. See architecture.md §5 row 6.).
- Phase 1 content acceptance criteria (deferred; see `roadmap_addenda.md`).
- **Per-language `<CodeBlock>` syntax detection** (forward-work item, M2 T2/T5b implementation deferred). The Lua filter at `scripts/pandoc-filter.lua` currently maps every `CodeBlock` to `cpp` since the SNHU-required arc (ch_1–ch_6) is uniformly C++17; pseudo-code in ch_2 renders close enough as cpp. When the post-build optional-content audit augments ch_7 / ch_9–ch_13, any chapter that introduces a non-C++ block (Python, shell, SQL, etc. — none today) must reintroduce per-class language detection in the filter: read the source `\begin{lstlisting}[language=…]` opt-arg if present and set the `CodeBlock.classes` accordingly, falling back to `cpp` only when no hint exists. **Component-side counterpart:** the visible header tag at `src/components/callouts/CodeBlock.astro:84` is the static literal `<span class="code-block-lang">C++</span>` (Path A per M-UX-REVIEW T5 D2), not prop-derived; when the trigger fires the future Builder swaps that literal for a prop-driven render (`<span class="code-block-lang">{lang}</span>`) and threads the language hint from the pandoc filter through MDX frontmatter or a `data-language` read on the slot's `<pre>` (Shiki already emits `data-language="cpp"` on `<pre class="astro-code">` per the rendered output, so the MDX-route component can read it from the slotted child without a filter-side schema change). Trigger: first non-C++ chapter block. Owner: post-build content audit Builder. See `design_docs/m2_raw_passthrough_sweep.md` "Forward link" for the pandoc-side counterpart.
