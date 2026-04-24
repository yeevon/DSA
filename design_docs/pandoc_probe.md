# Pandoc probe — `chapters/ch_1/lectures.tex`

**Verdict:** **HYBRID** — pandoc's default LaTeX reader gets ~80% of
the structure right natively (callout envs → fenced divs, clean
section hierarchy, code blocks present), but three things require a
small Lua filter: callout titles, `lstlisting` language hints, and
section-anchor prefixing.

**Source task:** [`milestones/m1_phase1_closeout/tasks/T2_pandoc_probe.md`](milestones/m1_phase1_closeout/tasks/T2_pandoc_probe.md)
**Probe run on:** 2026-04-23
**Pandoc version:** stock `apt`-installed (Ubuntu) — `pandoc --version`
not pinned for the probe; M2 should pin a specific minor in CI.

---

## Probe inputs

- File: `chapters/ch_1/lectures.tex` (2274 lines, 17 sections,
  many callouts spanning all 5 env types).
- Environments examined: `defnbox`, `ideabox`, `warnbox`, `notebox`,
  `examplebox` (defined in `notes-style.tex`).
- Listing style: `lstlisting` blocks with `language=C++`.

## Pandoc commands run

```bash
cd /tmp
pandoc /home/papa-jochy/Documents/School/cs-300/chapters/ch_1/lectures.tex \
  -f latex -t markdown \
  --wrap=none \
  -o probe.md 2> probe.stderr

pandoc /home/papa-jochy/Documents/School/cs-300/chapters/ch_1/lectures.tex \
  -f latex -t html5 \
  --standalone \
  -o probe.html 2> probe-html.stderr
```

Both runs exited 0. Sole stderr warning:

```
[WARNING] Could not load include file ../../notes-style.tex at
/home/papa-jochy/Documents/School/cs-300/chapters/ch_1/lectures.tex
line 2 column 30
```

Harmless for this probe — pandoc doesn't need the tcolorbox preamble
to recognise the env names.

---

## Per-environment evidence

### Callout envs (all five) — fenced divs ✅, titles ❌

Pandoc emits each `\begin{<env>}…\end{<env>}` as a fenced div in
markdown:

```text
::: ideabox
Array elements are stored *contiguously* in memory…
:::

::: warnbox
The most common bug in any language with arrays…
:::

::: examplebox
  **Type**                    **Size**                **Access**
  --------------------------- ----------------------- ---------------------
  C-style array `int a[10]`   fixed at compile time   `a[i]`
  …
:::
```

Per-env rendering snippets pulled directly from `/tmp/probe.md`:

`defnbox` (line 39 of `probe.md`):

```text
::: defnbox
A variable that holds a **fixed-length, ordered sequence** of values, all of the same type, under a single name. Each value is called an **element**, and each element has a position in the sequence called its **index**.
:::
```

`notebox` (line 55 of `probe.md`):

```text
::: notebox
The picture used above -- memory is an addressable sequence of fixed-size *words*; the processor reads or writes any one word in $O(1)$ -- has a formal name in algorithm analysis: the **Word-RAM** model. Chapter 3 adopts this language when it makes Big-O analysis precise. For now you only need the conclusion: indexed access into contiguous memory is one operation, no matter how big the array.
:::
```

All five envs follow the identical `::: <envname> … :::` pattern —
this is a generic LaTeX-environment behaviour in pandoc, not
per-env handling — so the body content survives intact regardless
of which of the five was used at the source.

**1:1 mapping to MDX components is trivial.** Map:
- `:::defnbox` → `<Definition>`
- `:::ideabox` → `<KeyIdea>`
- `:::warnbox` → `<Gotcha>`
- `:::notebox` → `<Aside>`
- `:::examplebox` → `<Example>`

This is the easy part. Pandoc does the heavy lifting natively.

**The gap:** the optional title argument is **dropped entirely.**
Source LaTeX:

```latex
\begin{defnbox}[Array]                 % title is "Array"
\begin{notebox}[Vectors are not linked lists]
\begin{defnbox}[\texttt{std::size\_t}]
```

Markdown output:

```text
::: defnbox          ← no "Array"
:::

::: notebox          ← no "Vectors are not linked lists"
:::
```

`grep -c '::: ' probe.md` returns 161 fenced divs in ch_1; every one
that had a `[Title]` lost it. **Filter required to reattach.**

### `lstlisting` — code preserved ✅, language hint lost ❌

Source:

```latex
\begin{lstlisting}[language=C++]
std::vector<int> v;
v.resize(3);
\end{lstlisting}
```

Markdown output (4-space indented code block, **no fence, no
language hint**):

```text
    std::vector<int> v;
    v.resize(3);
```

Architecture.md §1 wants `<CodeBlock lang="…">` — without the
language tag, syntax highlighting is broken across the entire
chapter set. **Filter required to preserve `language=…` and emit
fenced code blocks.**

### Section headings — auto-slugged ✅, prefix missing ❌

HTML output:

```html
<h1 id="arrays-and-vectors-general-concept">1.1 Arrays and Vectors</h1>
<h2 id="the-motivation-one-name-many-values">The motivation…</h2>
<h2 id="zero-based-indexing">Zero-based indexing</h2>
```

Pandoc auto-generates kebab-case slugs from heading text. Good.

Architecture.md §1 wants `ch_N-section-slug` shape — pandoc gives
just `section-slug`. **Filter (or post-process) required to prepend
`ch_N-` based on source filename.**

### Misc

- One stray `` ```{=html} `` raw passthrough block at line 496 of
  `probe.md` — pandoc couldn't fully parse a tcolorbox-internal
  construct and fell back to raw HTML. Single occurrence in ch_1;
  worth grepping all 12 chapters during M2 to gauge frequency.
- The chapter title metadata block (`\title{...}\maketitle`) renders
  as an HTML `<header>` block in HTML output and as a markdown title
  via the `--metadata title=…` mechanism. Trivial to handle.

---

## What the minimal filter must do

A small Lua filter (or equivalent pandoc-flavour post-processor)
needs to handle exactly three things:

1. **Reattach callout titles.** Walk every `Div` whose class is one
   of `{defnbox, ideabox, warnbox, notebox, examplebox}`. Parse
   the original `\begin{<env>}[Title]` from the raw LaTeX and emit
   the title as either an attribute on the div or a leading
   heading inside it. MDX component receives `title="Array"` etc.

2. **Preserve `lstlisting` language hints.** Walk every `CodeBlock`
   where the source was `lstlisting`. Read the original
   `[language=…]` option and emit a fenced code block with the
   language tag.

3. **Prefix section anchors.** Walk every `Header`, read the
   `ch_N` from the source filename (passed in via filter
   metadata), and prefix the auto-generated slug with `ch_N-`.

Plus one small cleanup: drop or rewrite the `` ```{=html} `` raw
passthrough block (or fix the upstream tcolorbox construct that
triggered it).

## Effort estimate for M2

- Lua filter: 50–100 lines, < 1 day to write + test.
- Alternative (post-process in Node/JS as part of Astro build):
  similar effort, lives in the build script rather than as a pandoc
  pass. Either path is small.
- **Compared to the alternative** — manually porting 12 chapters'
  worth of callouts and code blocks by hand — the filter wins
  decisively. Manual port is days per chapter; filter is hours
  total.

## Architecture.md §5 update

Row 1 (`Pandoc Lua filter vs manual port`) — **resolved as
HYBRID**: write a minimal filter handling the three gaps above; let
pandoc handle everything else natively. Updated in
[`architecture.md`](architecture.md) §5.
