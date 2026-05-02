# Gate parse patterns

Common result labels for cs-300 command and agent reports. Use these consistently when summarizing gate output.

---

## Result labels

| Label | Meaning |
| --- | --- |
| `PASS` | Gate ran and passed. |
| `FAIL` | Gate ran and failed. |
| `NOT RUN` | Gate did not run; reason required. |
| `BLOCKED` | Gate could not run because required setup/input is unavailable (e.g., Ollama down, dev server not started). |
| `SKIPPED` | Gate was intentionally skipped by project rule or user instruction. |

---

## Required gate summary shape

```md
| Gate | Command | Result | Notes |
| --- | --- | --- | --- |
| type | `npm run check` | PASS / FAIL / NOT RUN / BLOCKED / SKIPPED | <short note> |
| smoke | `node scripts/<name>-smoke.mjs` | … | … |
| chapter | `pdflatex -halt-on-error chapters/ch_<N>/lectures.tex` | … | page count check |
| content build | `node scripts/build-content.mjs` | … | end-to-end pandoc + filter |
| build | `npm run build` | … | dist/ inspection |
```

---

## Failure note standard

Keep failure notes short and actionable.

Good:

- `FAIL — pdflatex error at chapters/ch_5/lectures.tex line 432`
- `FAIL — db-smoke: annotations.text column missing after schema migration`
- `BLOCKED — selenium WebDriver not available in this env`
- `NOT RUN — documentation-only task, no code surface`
- `SKIPPED — user explicitly skipped functional-tests.py for this cycle`

Bad:

- `bad`
- `broken`
- `probably fine`
- `not needed`
- `Builder said it passed`

---

## Exit behaviour

A failed required gate blocks completion.

A skipped or not-run required gate requires explicit reason and usually blocks completion unless the project rules in `CLAUDE.md` say otherwise.

The Auditor decides whether missing verification is acceptable for the task type:

- **Content tasks** may rely on `pdflatex` + render-check (LBD-11 carve-out for content).
- **Code tasks** require a named smoke; "build passes" is not enough (LBD-11).
