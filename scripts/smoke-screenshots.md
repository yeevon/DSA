# `scripts/smoke-screenshots.py` — Selenium browser-smoke harness

Headless-Chrome screenshot driver for cs-300. Authored at M-UX T7
cycle 2 (2026-04-25) to close the manual-smoke gap repeatedly flagged
in M-UX-T6-ISS-01 / M-UX-T7-ISS-01: code-task audits need
non-inferential evidence that the rendered page actually looks right
at desktop / tablet / mobile viewports, and the audit shell can't
literally observe a browser. The harness saves PNGs the auditor can
read directly.

## Install (one-time)

PEP 668 prevents global `pip install` on Debian/Ubuntu, so use a
project-local virtualenv:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
```

The `.venv/` directory is already in `.gitignore`. Selenium's pinned
in `requirements-dev.txt`; chromedriver and Chrome itself must be
installed system-wide (verified on this environment with
`google-chrome --version`).

## Run

In one terminal, start the preview server:

```bash
npm run build
npm run preview            # serves http://localhost:4321 by default
```

In another terminal:

```bash
.venv/bin/python scripts/smoke-screenshots.py \
    --config scripts/smoke-routes.json \
    --base-url http://localhost:4321 \
    --output .smoke/screenshots/
```

PNGs land in `.smoke/screenshots/<route-name>-<width>x<height>.png`.
The harness fails loudly with a clear message if the preview server
isn't reachable. Every Chrome process uses an isolated
`--user-data-dir` under `/tmp/cs300-smoke-<pid>` (cleaned on exit) and
does NOT touch the user's normal Chrome profile or DevTools port
9222.

## Smoke matrix

`scripts/smoke-routes.json` defines the route × viewport matrix.
Cycle-2 default covers index + lectures ch_1 / ch_4 / ch_7 / ch_13 +
notes ch_4 + practice ch_4, at 1280 / 1024 / 768 / 375 widths
(viewport list per route is trimmed where higher coverage isn't
needed). Add a route by appending a JSON entry with `url`, `name`,
and `viewports`.

## Limitations

- Static-mode only this cycle. Headless Chrome boots cs-300 into
  static mode because `/api/health` isn't reachable behind
  `npm run preview`. Interactive-mode coverage is a future addition
  that runs against `npm run dev`.
- No interaction smokes (click hamburger, Tab focus-trap, etc.).
  Screenshots only. Adding interaction support is straightforward
  (Selenium `ActionChains`); deferred to a follow-on.
