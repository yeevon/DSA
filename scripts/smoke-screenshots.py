#!/usr/bin/env python3
"""scripts/smoke-screenshots.py — Selenium browser-smoke harness for cs-300.

Authored: M-UX T7 cycle 2 (2026-04-25). Closes the manual-smoke gap
called out in M-UX-T6-ISS-01 + M-UX-T7-ISS-01 — the Auditor cannot
literally observe browser behaviour from this shell environment, so
every "did it actually render at 375px?" question gets deferred. This
harness drives a HEADLESS Chrome through Selenium and saves PNGs that
the Auditor (or user) can Read directly to verify layout.

USAGE
    # 1. Install (one-time, into a project-local venv per PEP 668).
    python3 -m venv .venv
    .venv/bin/pip install -r requirements-dev.txt

    # 2. Build + start the preview server in another terminal.
    npm run build
    npm run preview   # serves http://localhost:4321 by default

    # 3. Run the harness.
    .venv/bin/python scripts/smoke-screenshots.py \
        --config scripts/smoke-routes.json \
        --base-url http://localhost:4321 \
        --output .smoke/screenshots/

PNGs land in `.smoke/screenshots/` (gitignored) named
`<route-name>-<width>x<height>.png` — one viewport-clipped screenshot
per (route, viewport) tuple.

DESIGN CONSTRAINTS (from T7 cycle 2 invocation):
  - HEADLESS mode mandatory (`--headless=new`). The user has other
    Chrome windows open and does not want a visible browser popping up.
  - ISOLATED `--user-data-dir` under `/tmp/cs300-smoke-<pid>`. Does NOT
    use the user's default Chrome profile; does NOT collide with any
    other Chrome instance. Cleaned up on exit.
  - Lets chromedriver pick its own ephemeral debugging port (do NOT
    pass `--remote-debugging-port`). The user's existing Chrome on
    DevTools port 9222 stays untouched.
  - `--no-sandbox` included because some Linux setups (incl. this one
    when chromedriver runs as a long-lived process) reject the default
    sandbox; documented as a knob.
  - Modern Selenium 4 style: `webdriver.Chrome(options=...)`. No
    deprecated `desired_capabilities`.
  - Viewport set via `driver.set_window_size(w, h)` — the
    `--window-size` CLI flag is for visible windows; in headless mode,
    `set_window_size()` is what controls the rendering viewport.
  - Output dir created on demand. Exit 0 on success, non-zero on any
    screenshot failure.

LIMITATIONS THIS CYCLE:
  - Static-mode-only screenshots: M-UX `detectMode()` boots into
    `static` when the localhost `/api/health` probe fails (and headless
    Chrome can reach `/api/health` only if the Astro dev server is
    running, not the static `npm run preview`). For cycle 2 we capture
    static-mode output exclusively; interactive-mode screenshots come
    later when the harness gains a `npm run dev` mode (left out of
    scope this cycle).
  - No interaction smokes (click hamburger, Tab focus-trap, etc.) —
    the harness takes static screenshots only. Interaction smokes can
    layer on top of this scaffold in a follow-on; for cycle 2 we just
    need viewport-by-viewport visual evidence.

COMPANION FILES
  - scripts/smoke-routes.json   default smoke matrix
  - scripts/smoke-screenshots.md installation + usage doc
  - requirements-dev.txt         selenium pin
  - .smoke/.gitkeep              keep the dir, ignore screenshots
  - design_docs/milestones/m_ux_polish/tasks/T7_mobile_drawer.md (cycle 2)
  - design_docs/milestones/m_ux_polish/issues/T7_issue.md (M-UX-T7-ISS-01)
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait


@dataclass
class Viewport:
    """Single (width, height) pair for the smoke matrix."""

    w: int
    h: int


@dataclass
class Route:
    """One route entry from the smoke-routes.json config."""

    url: str
    name: str
    viewports: list[Viewport]


def parse_args() -> argparse.Namespace:
    """Build the CLI parser. Defaults align with the project layout."""
    p = argparse.ArgumentParser(
        description=(
            "Capture headless-Chrome screenshots of cs-300 routes at "
            "configurable viewports. See module docstring for design "
            "constraints + usage."
        ),
    )
    p.add_argument(
        "--config",
        default="scripts/smoke-routes.json",
        help="Path to JSON file listing routes + viewports.",
    )
    p.add_argument(
        "--base-url",
        default="http://localhost:4321",
        help="Base URL the preview server is reachable at.",
    )
    p.add_argument(
        "--output",
        default=".smoke/screenshots",
        help="Directory to write PNGs into (created if missing).",
    )
    p.add_argument(
        "--page-load-timeout",
        type=int,
        default=20,
        help="Seconds to wait for each page navigation to complete.",
    )
    p.add_argument(
        "--settle-ms",
        type=int,
        default=400,
        help=(
            "After page load, wait this many ms for late paints "
            "(M3/M-UX islands hydrate inline; 400ms is generous)."
        ),
    )
    p.add_argument(
        "--no-sandbox",
        action="store_true",
        default=True,
        help=(
            "Pass --no-sandbox to Chrome. Default ON — required on "
            "many Linux setups when chromedriver runs without a TTY."
        ),
    )
    return p.parse_args()


def load_routes(config_path: Path) -> list[Route]:
    """Parse the smoke-routes.json config into Route objects."""
    with config_path.open("r", encoding="utf-8") as fh:
        raw: list[dict[str, Any]] = json.load(fh)
    routes: list[Route] = []
    for entry in raw:
        viewports = [Viewport(w=v["w"], h=v["h"]) for v in entry["viewports"]]
        routes.append(Route(url=entry["url"], name=entry["name"], viewports=viewports))
    return routes


def assert_preview_reachable(base_url: str) -> None:
    """Fail loudly if the preview server isn't already running.

    The harness deliberately does NOT spawn `npm run preview` itself —
    cycle 2 prefers an explicit "run preview in another terminal,
    then run the harness" flow so the user can keep observing dev-mode
    state. Call this once at startup so the user gets a clear error
    instead of a Chrome timeout.
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


def build_driver(user_data_dir: Path, no_sandbox: bool) -> webdriver.Chrome:
    """Launch a headless Chrome with an isolated profile.

    Cycle 2 invocation contract:
      - Headless (`--headless=new`).
      - Isolated user-data-dir under /tmp/cs300-smoke-<pid>.
      - No --remote-debugging-port (let chromedriver pick).
      - --no-sandbox is opt-in via the CLI; default ON for this
        environment per the harness header.
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


def capture_route(
    driver: webdriver.Chrome,
    base_url: str,
    route: Route,
    output_dir: Path,
    page_load_timeout: int,
    settle_ms: int,
) -> list[tuple[Path, int]]:
    """Visit a route at each viewport, save a PNG, return [(path, bytes)]."""
    full_url = base_url.rstrip("/") + route.url
    saved: list[tuple[Path, int]] = []
    for vp in route.viewports:
        # Set viewport BEFORE navigation so layout is computed at the
        # target width from the start (avoids a re-layout flash that
        # could leave transient styles on the painted snapshot).
        driver.set_window_size(vp.w, vp.h)
        driver.set_page_load_timeout(page_load_timeout)
        driver.get(full_url)
        # Wait for `document.readyState === 'complete'` so the static
        # HTML has fully parsed before we snap.
        WebDriverWait(driver, page_load_timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        # Settle window — gives M3 islands (inline scripts) a moment
        # to hydrate before the snapshot. Static-mode pages have
        # virtually nothing to do here, but it's a cheap insurance.
        time.sleep(settle_ms / 1000.0)
        out_path = output_dir / f"{route.name}-{vp.w}x{vp.h}.png"
        ok = driver.save_screenshot(str(out_path))
        if not ok:
            raise RuntimeError(f"save_screenshot returned False for {out_path}")
        size = out_path.stat().st_size
        saved.append((out_path, size))
        print(
            f"  [{vp.w:>4}x{vp.h:<4}] {route.name:<28} "
            f"-> {out_path}  ({size:,} bytes)"
        )
    return saved


def main() -> int:
    """CLI entrypoint. Returns a process exit code."""
    args = parse_args()
    config_path = Path(args.config).resolve()
    output_dir = Path(args.output).resolve()
    if not config_path.is_file():
        print(f"ERROR: config not found at {config_path}", file=sys.stderr)
        return 2
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"smoke-screenshots: config={config_path} output={output_dir}")

    assert_preview_reachable(args.base_url)
    print(f"smoke-screenshots: preview reachable at {args.base_url}")

    routes = load_routes(config_path)
    total_viewports = sum(len(r.viewports) for r in routes)
    print(
        f"smoke-screenshots: matrix = {len(routes)} routes / "
        f"{total_viewports} viewports total"
    )

    user_data_dir = Path(tempfile.mkdtemp(prefix=f"cs300-smoke-{os.getpid()}-"))
    print(f"smoke-screenshots: chrome user-data-dir = {user_data_dir}")
    started_at = time.time()
    saved: list[tuple[Path, int]] = []
    try:
        driver = build_driver(user_data_dir, no_sandbox=args.no_sandbox)
        try:
            for route in routes:
                print(f"smoke-screenshots: route {route.name} ({route.url})")
                saved.extend(
                    capture_route(
                        driver=driver,
                        base_url=args.base_url,
                        route=route,
                        output_dir=output_dir,
                        page_load_timeout=args.page_load_timeout,
                        settle_ms=args.settle_ms,
                    )
                )
        finally:
            driver.quit()
    finally:
        # ALWAYS clean the isolated profile dir so /tmp doesn't fill
        # with stale Chrome user-data trees over many invocations.
        shutil.rmtree(user_data_dir, ignore_errors=True)

    elapsed = time.time() - started_at
    total_bytes = sum(b for _, b in saved)
    print(
        f"smoke-screenshots: captured {len(saved)} screenshots "
        f"({total_bytes:,} bytes total) in {elapsed:.1f}s"
    )
    return 0 if saved else 1


if __name__ == "__main__":
    sys.exit(main())
