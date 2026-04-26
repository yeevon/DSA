"""scripts/_selenium_helpers.py — shared Selenium driver factory for cs-300 smokes.

Authored: M-UX T9 (2026-04-25). Extracted from `smoke-screenshots.py`'s
`build_driver()` + `assert_preview_reachable()` so the new
`functional-tests.py` harness can reuse the exact same headless +
isolated-profile setup. Adding a new Chrome flag (e.g. proxy config,
window-management knob) ripples to both harnesses on edit instead of
drifting between two near-duplicate copies.

NOT a public module — leading underscore by convention. Imported by
sibling scripts via `from _selenium_helpers import build_driver, ...`.
The two consumers are:

  - scripts/smoke-screenshots.py (M-UX T7 cycle 2)
  - scripts/functional-tests.py  (M-UX T9)

Module-level Selenium imports are kept at the top so a missing
`selenium` install fails fast at import time with the same Python
traceback both consumers already produce.

DESIGN CONSTRAINTS (per the original smoke-screenshots.py header):

- Headless mandatory (`--headless=new`). The user has other Chrome
  windows open; visible browsers are not acceptable.
- Isolated `--user-data-dir` so the harness profile never collides
  with the user's main Chrome.
- Let chromedriver pick its own ephemeral debugging port (no
  `--remote-debugging-port`). The user's existing Chrome on devtools
  port 9222 stays untouched.
- `--no-sandbox` opt-in default (Linux + chromedriver-without-TTY
  setups reject the default sandbox).
"""

from __future__ import annotations

import urllib.error
import urllib.request
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def build_driver(user_data_dir: Path, no_sandbox: bool = True) -> webdriver.Chrome:
    """Launch a headless Chrome with an isolated profile.

    Parameters
    ----------
    user_data_dir
        Path the caller created (typically under `/tmp/cs300-*-<pid>`).
        Caller owns cleanup — pair every `build_driver` with a
        `shutil.rmtree(user_data_dir, ignore_errors=True)` in a
        `try/finally`.
    no_sandbox
        Pass `--no-sandbox` to Chrome. Default ON for headless Linux
        without a TTY; turn off only if the local Chrome refuses
        `--no-sandbox` (rare).

    Returns
    -------
    `webdriver.Chrome`
        A headless Chrome WebDriver. Call `.quit()` when done.

    Notes
    -----
    Flags mirror the original smoke-screenshots.py setup verbatim so
    behaviour stays identical across both harnesses.
    """
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument(f"--user-data-dir={user_data_dir}")
    if no_sandbox:
        opts.add_argument("--no-sandbox")
    # Disable GPU for headless Linux (cheap correctness; no perf
    # regression at this scale).
    opts.add_argument("--disable-gpu")
    # Disable dev-shm usage (Linux containers have a tiny /dev/shm by
    # default; many headless Chrome flake-guides recommend this).
    opts.add_argument("--disable-dev-shm-usage")
    # Quiet mode — Chrome's stdout is otherwise very chatty.
    opts.add_argument("--log-level=3")
    # Pin language so any locale-sensitive UI is deterministic across
    # runs.
    opts.add_argument("--lang=en-US")
    return webdriver.Chrome(options=opts)


def assert_preview_reachable(base_url: str) -> None:
    """Fail loudly if the preview server isn't already running.

    Both harnesses deliberately do NOT spawn `npm run preview`
    themselves — the preferred flow is "run preview in another
    terminal, then run the harness" so the user can keep observing
    dev-mode state. Call this once at startup so the user gets a
    clear error instead of a Chrome navigation timeout.

    Raises
    ------
    SystemExit
        With a descriptive error if the preview server isn't reachable.
    """
    try:
        with urllib.request.urlopen(base_url, timeout=3) as resp:  # nosec B310
            if resp.status != 200:
                raise RuntimeError(
                    f"Preview server at {base_url} returned status {resp.status}; "
                    "expected 200."
                )
    except (urllib.error.URLError, ConnectionRefusedError, TimeoutError) as exc:
        raise SystemExit(
            f"ERROR: preview server not reachable at {base_url}.\n"
            "Start it with `npm run preview` in another terminal, "
            "then re-run this script.\n"
            f"(underlying error: {exc})"
        ) from exc
