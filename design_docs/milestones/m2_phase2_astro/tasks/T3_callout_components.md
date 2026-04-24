# T3 — Callout component library

**Status:** todo
**Depends on:** T1
**Blocks:** end-to-end content render; T6 deploy

## Why

T2's filter emits `<Definition>`, `<KeyIdea>`, `<Gotcha>`,
`<Example>`, `<Aside>`, and `<CodeBlock>` tags. T3 builds the Astro
components those tags resolve to. Without T3, T4's piped content
renders as bare HTML with unstyled callouts — visually broken.

The five callouts map 1:1 with the LaTeX environments in
`notes-style.tex` (per
[`../../architecture.md`](../../architecture.md) §1). No new
information architecture — T3 is a pure renderer port from LaTeX
tcolorbox styles to web styles.

## Deliverable

Six `.astro` components under `src/components/callouts/`:

- `Definition.astro` ← `defnbox`
- `KeyIdea.astro` ← `ideabox`
- `Gotcha.astro` ← `warnbox`
- `Example.astro` ← `examplebox`
- `Aside.astro` ← `notebox`
- `CodeBlock.astro` ← `lstlisting` (with syntax highlighting and
  copy button)

Plus a test page `src/pages/_callouts-test.astro` (gitignored from
deploy via filename underscore? — Astro's `_`-prefix convention)
that renders one of each for visual verification.

## Steps

1. **Five callout components.** Each takes `title?: string` and
   slots `<slot />` for body. Inline `<style>` per component (scoped)
   matching the LaTeX visual identity (border colour, title bar
   colour). Reference the existing `notes-style.tex` colour
   definitions so the web matches the PDF.
2. **`CodeBlock.astro`.** Props: `lang: string`, `code?: string`
   (or use `<slot />`). Use [Shiki](https://shiki.style/) (Astro's
   built-in highlighter) for static syntax highlighting. Add a
   client-side island for the copy button — minimal, no framework
   dependency.
3. **Test page.** `src/pages/_callouts-test.astro` renders one of
   each component with sample content. Underscore prefix keeps it
   out of the production build per Astro convention.
4. **Smoke**: `npm run dev`, navigate to `/_callouts-test`, visual
   check all 6 components render correctly; click copy button on
   `<CodeBlock>` and confirm clipboard.

## Acceptance check (auditor smoke test — non-inferential)

- [ ] All 6 component files exist under `src/components/callouts/`.
- [ ] `npm run build` exits 0 (no type errors, no missing imports).
- [ ] `npm run dev` serves the test page; auditor must navigate to
      `/_callouts-test` and confirm each component renders with its
      title bar and body styling. **Build-clean alone is not
      sufficient evidence** per
      [CLAUDE.md](../../../CLAUDE.md#auditor-conventions).
- [ ] Copy button on `<CodeBlock>` actually copies (auditor verifies
      via paste, cites the result).
- [ ] No `_callouts-test.astro` route appears in `dist/` after a
      production build (underscore prefix worked).

## Notes

- **Visual parity, not pixel parity.** The LaTeX PDFs use serif
  fonts and tcolorbox borders; the web version doesn't have to
  copy that exactly — match the *information hierarchy* (title bar,
  body, accent colour) and let the typography differ.
- **No `<AudioPlayer>` here.** That's M7. T3 is callouts only.
- **No `"send to editor"` button on `<CodeBlock>`.** That's M6 (code
  execution). T3 ships the static-mode CodeBlock only.
