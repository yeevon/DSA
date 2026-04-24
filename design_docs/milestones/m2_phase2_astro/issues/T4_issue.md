# T4 — Pandoc → Astro build pipeline — Audit Issues

**Source task:** [../tasks/T4_build_pipeline.md](../tasks/T4_build_pipeline.md)
**Audited on:** 2026-04-23
**Audit scope:** New files (`scripts/build-content.mjs`, `src/content/{lectures,notes,practice}/.gitkeep`); modified files (`package.json` scripts, `.gitignore`, `CHANGELOG.md`). Cross-checked against [`../../../architecture.md`](../../../architecture.md) §1 (static content pipeline + Astro content collections) + §2 (sections.anchor seeding contract — section-list frontmatter on lectures/), [`../tasks/T2_lua_filter.md`](../tasks/T2_lua_filter.md) + [`../issues/T2_issue.md`](T2_issue.md) (filter the script invokes), [`../tasks/T5_content_collections.md`](../tasks/T5_content_collections.md) step 4 (yml-frontmatter migration that T5 owns; T4 must NOT do it). Smoke checks executed by the auditor: clean-state full build (`rm src/content/*/ch_*.mdx && npm run build`), count + structural inspection of generated MDX, gitignore verification.
**Status:** ✅ PASS

## Design-drift check

| Drift category                           | Result | Notes                                                                                                |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| New dependency added                     | ✅ ok  | None — script uses only Node built-ins (`fs/promises`, `child_process`, `path`, `url`). No new npm packages. |
| Jekyll polish                            | ✅ ok  | No Jekyll files touched. (Pre-existing Jekyll frontmatter in `chapters/ch_*/practice.md` is *stripped* during T4's copy; not polished.) |
| Chapter content > 40-page ceiling        | ✅ n/a | No chapter content authored.                                                                          |
| Chapter additions beyond bounded rule    | ✅ n/a | No chapter content authored.                                                                          |
| Cross-chapter references                 | ✅ n/a | No chapter content touched.                                                                           |
| Sequencing violation                     | ✅ ok  | T4 strictly emits `{chapter_id, sections}` frontmatter and lets T5 migrate `_data/chapters.yml` per its spec; no per-chapter metadata leak from T4. T4 doesn't define content-collection schema (T5) and doesn't author routes (T5). |
| `nice_to_have.md` boundary               | ✅ n/a | File doesn't exist; not referenced.                                                                   |

No HIGH drift findings.

## AC grading

| # | Acceptance criterion                                                                                                                                                          | Status | Notes |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|-------|
| 1 | `scripts/build-content.mjs` exists and is executable as ESM Node.                                                                                                              | ✅ PASS | 172 lines; `#!/usr/bin/env node` shebang; uses `import` syntax (ESM); `package.json` has `"type": "module"` so Node treats `.mjs` (and `.js`) as ESM. |
| 2 | `package.json` `prebuild` and `predev` scripts both invoke the build-content script.                                                                                          | ✅ PASS | Both present; also `build:content` for ad-hoc invocation. `npm run build` (which fires `prebuild` automatically) generates content then runs `astro build`. |
| 3 | Auditor runs `rm -rf src/content/lectures/ch_*.mdx src/content/notes/ch_*.mdx src/content/practice/ch_*.mdx && npm run build` from clean state. Exit 0 + 36 generated MDX.    | ✅ PASS | Auditor cleared the 36 files; `npm run build` exited 0; `2 page(s) built in 548ms`. Post-build count: 12 lectures + 12 notes + 12 practice = 36 MDX. **Auditor ran this**, not inferred from prior builder-phase output. |
| 4 | `src/content/lectures/ch_1.mdx` opens cleanly: callouts present, `ch_1-` prefixed anchor present, no raw passthrough blocks unaccounted for.                                  | ✅ PASS | 111 component opens (`<Definition>`/`<KeyIdea>`/`<Gotcha>`/`<Example>`/`<Aside>`) — exact match with source 111 callout opens. 91 `{#ch_1-…}` anchors. **0** raw passthrough blocks (the only one that pandoc emits across the corpus, the ch_1 line-496 HTML comment, suppressed by `markdown-raw_attribute` writer). |
| 5 | `src/content/lectures/ch_1.mdx` frontmatter contains a non-empty `sections:` array; each entry has `id`, `anchor` (prefixed `ch_1-`), `title`, `ord`. M3-seeding contract.    | ✅ PASS | Frontmatter `sections:` has 80 entries; each is a YAML map with `id`, `anchor`, `title`, `ord`. Sample entry 0: `id: "ch_1-arrays-and-vectors-general-concept"`, `anchor: "ch_1-arrays-and-vectors-general-concept"`, `title: "1.1 Arrays and Vectors (general concept)"`, `ord: 0`. All 91 anchors didn't make it to the section list because pandoc emits headers under `<aside>` callout titles too — those don't count as document-level sections. The 80 captured represent the proper section/subsection hierarchy. Per-chapter section counts: ch_1=80, ch_2=58, ch_3=102, ch_4=68, ch_5=9, ch_6=10, ch_7=5, ch_9=8, ch_10=13, ch_11=5, ch_12=2, ch_13=5. |
| 6 | `src/content/notes/ch_1.mdx` and `src/content/practice/ch_1.mdx` carry `chapter_id: 'ch_1'` in frontmatter but **no** `sections:` array (lectures owns the section structure). | ✅ PASS | Both have `chapter_id: "ch_1"` (1 occurrence each). Both have 0 `sections:` keys. |
| 7 | `git status` shows the 36 generated MDX files as ignored, not tracked.                                                                                                        | ✅ PASS | `git check-ignore -v src/content/lectures/ch_1.mdx` returns `.gitignore:90:src/content/lectures/ch_*.mdx`. `git status --untracked-files=all src/content/` returns only the 3 `.gitkeep` files — the 36 MDX are silently ignored. |

All 7 ACs met.

## 🔴 HIGH

None.

## 🟡 MEDIUM

None.

## 🟢 LOW

### M2-T04-ISS-01 — Pandoc anchor count (91) > section frontmatter entry count (80) — LOW

**Severity:** 🟢 LOW
**Status:** ✅ ACCEPTED — semantics are correct

`ch_1` has 91 `{#ch_1-…}` anchors in the body but only 80 entries in the frontmatter `sections:` array. Difference: pandoc auto-generates anchors for `<aside class="callout">` content children's headers too (the original `\subsection*{Title}` *inside* a `defnbox`/`ideabox` etc.), but those aren't document-level sections — they're sub-headings within callouts. The frontmatter section list captures only top-level + nested document headings (`#`, `##`, `###`, etc.), which is the right shape for M3's seeding contract (the navigation table should list document sections, not callout-internal subheadings).

**Action / Recommendation:** none. The M3 seeding contract reads `sections.anchor` as the navigation index — callout-internal anchors aren't navigation targets. If a future audit wants belt-and-braces, the sweep doc can grow a "anchor count vs section count" table; not worth automating today.

## Additions beyond spec — audited and justified

- **Hand-rolled YAML serializer for the frontmatter injection** (`injectFrontmatter()` in build-content.mjs). Spec didn't say which YAML library to use; pulling in `yaml` or `js-yaml` for ~6 keys felt heavy. Justified: schema is small + stable (header-comment-documented at top of file), values use `JSON.stringify` for safe quoting, no edge-case YAML features needed. If T5's content-collection schema work needs a richer YAML surface (anchors, references, etc.), swap in `yaml` then.
- **Pre-existing Jekyll frontmatter in `chapters/ch_*/practice.md` is stripped** before T4 injects its own. The first `---\n…\n---\n` block (containing `layout: default` / `permalink:`) is removed via regex. Justified: without stripping, the practice MDX would have two consecutive frontmatter blocks; the second would render as a stray `<hr/>` thematic break followed by plain-text "layout: default". Spec says "practice.md → MDX conversion is just a copy" — the strip is a defensive cleanup, not content manipulation; the post-strip body is the practice prompts verbatim. Documented in build-content.mjs with an inline comment.
- **Hard-coded chapter list** (`['1','2','3','4','5','6','7','9','10','11','12','13']`) rather than a `readdir` scan. Spec said "iterate `chapters/ch_*/`" without specifying. Justified: explicit list catches missing chapters as loud failures (vs silent skip) and pins the set so a stray future `chapters/ch_X/` dir doesn't accidentally enter the build. The skipped `ch_8` (architecturally absent — chapter map jumps 7→9) is naturally excluded. Header-comment block in build-content.mjs explains the choice.

## Verification summary

| Check                                                                                                       | Result |
| ----------------------------------------------------------------------------------------------------------- | ------ |
| `scripts/build-content.mjs` exists; non-empty                                                                | ✅ 172 lines |
| `package.json` has `prebuild` + `predev` + `build:content` scripts                                          | ✅ |
| Auditor cleared `src/content/*/ch_*.mdx` and ran `npm run build` from clean state                            | ✅ exit 0, 548ms |
| 36 MDX files generated (12 lectures + 12 notes + 12 practice)                                                | ✅ |
| `src/content/lectures/ch_1.mdx` callouts: 111 (exact match with source)                                      | ✅ |
| `src/content/lectures/ch_1.mdx` `ch_1-` prefixed anchors: 91                                                 | ✅ |
| `src/content/lectures/ch_1.mdx` raw passthroughs: 0                                                          | ✅ |
| `src/content/lectures/ch_1.mdx` frontmatter `sections:` array: 80 non-empty entries with full schema        | ✅ |
| `src/content/notes/ch_1.mdx` carries `chapter_id: "ch_1"`, no `sections:` key                              | ✅ |
| `src/content/practice/ch_1.mdx` carries `chapter_id: "ch_1"`, no `sections:` key, no stray `---` block      | ✅ |
| `git check-ignore -v src/content/lectures/ch_1.mdx` matches `.gitignore:90`                                  | ✅ |
| `git status --untracked-files=all src/content/` lists only the 3 `.gitkeep` files                           | ✅ |
| CHANGELOG entry under `## 2026-04-23` references M2 Task T4 + Gap 1 anchor                                   | ✅ |

## Issue log — cross-task follow-up

| ID            | Severity  | Status        | Owner / next touch point                                                  |
| ------------- | --------- | ------------- | ------------------------------------------------------------------------- |
| M2-T04-ISS-01 | 🟢 LOW    | ✅ ACCEPTED   | None (semantics correct as-is; M3's seeding reads sections list, not anchor count) |

## Propagation status

T2 audit's ISS-02 (configure MDX components-map for `<pre><code class="language-cpp">` → `<CodeBlock>`) was deferred to T4 — but on closer look, the components-map wiring belongs in T5's content-collection rendering layer, not in T4's build script. T4 produces MDX files; T5 will configure how Astro's MDX renderer dispatches the embedded JSX/components. No work for T4 here; T5 spec already calls for importing the callout components in the dynamic-route templates (step 2). Re-deferring to T5 — no new carry-over needed since T5 spec already covers it.
