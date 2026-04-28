#!/usr/bin/env python3
"""scripts/functional-tests.py — Selenium-driven assertion harness for cs-300.

Authored: M-UX T9 (2026-04-25). Sibling of `scripts/smoke-screenshots.py`.
Where the screenshot harness produces visual evidence (PNGs the auditor
or user reads), this harness produces *machine-checkable* pass/fail
assertions: each test case visits a route, optionally scrolls the
viewport, then runs a list of assertions against the live DOM. Exit 0
on all-pass, non-zero on any failure.

USAGE
    # 1. Install (one-time, into a project-local venv per PEP 668).
    python3 -m venv .venv
    .venv/bin/pip install -r requirements-dev.txt

    # 2. Build + start the preview server in another terminal.
    npm run build
    npm run preview   # serves http://localhost:4321 by default

    # 3. Run the harness.
    .venv/bin/python scripts/functional-tests.py \
        --config scripts/functional-tests.json \
        --base-url http://localhost:4321

WHY THIS EXISTS (T9 spec context)

T8 closed the M-UX milestone with non-inferential evidence for build
cleanliness + bundle size + static-mode visual layout (via the
screenshot harness). What it did NOT catch: wide-viewport whitespace
(no 2560px screenshots), non-sticky rails on long chapters (no scroll-
state assertion), cross-collection navigation friction (LeftRail
hardcoded to lectures/). The screenshot harness gives the auditor
PNGs but doesn't *assert* anything programmatically — a regression in
"is the rail still sticky?" requires a human eye on every PNG.

This harness closes that gap. Per the CLAUDE.md non-negotiable on
code-task verification ("build success is not evidence of runtime
correctness"), every code task should ship with a smoke that asserts
runtime behaviour. This harness IS that smoke layer for chrome
behaviours; future tasks layer their assertions on top.

ASSERTION TYPES

- `attr` — `{type: "attr", selector, name, expected, regex?}`. Reads
  `element.get_attribute(name)` for the first match. If `regex` is
  truthy the comparison is `re.search(expected, value)`; otherwise
  string equality.
- `count` — `{type: "count", selector, expected, op?}`. Reads
  `len(driver.find_elements(...))`. `op` defaults to `==`; can be
  `==`, `>=`, `<=`, `>`, `<`.
- `getBoundingClientRect` — `{type: "rect", selector, prop, op,
  expected}`. Runs JS `.getBoundingClientRect()[prop]` and compares
  with `op` ∈ {`==`, `<=`, `>=`, `<`, `>`, `between`}; `between`
  expects `expected` to be a `[lo, hi]` two-element array.
- `href-pattern` — `{type: "href-pattern", selector, expected, all?}`.
  For each match, regex-tests `element.get_attribute("href")`. If
  `all` is true (default), every element must match; otherwise at
  least one.
- `aria-current` — `{type: "aria-current", selector, expected}`.
  Asserts the matched element's `aria-current` attribute equals
  `expected` (typically `"page"`).
- `computed-style` — `{type: "computed-style", selector, prop, op,
  expected}`. Runs `window.getComputedStyle(el).getPropertyValue(prop)`
  and compares with `op` ∈ {`==`, `<=`, `>=`, `<`, `>`, `between`}.
  The harness parses `<number><unit>` returns (`"16px"`, `"600"`) into
  a float for numeric comparisons; non-parseable returns fall back to
  string equality (use `op: "=="`). Added at M-UX-REVIEW T2 D5
  (2026-04-27) for the F4 right-rail TOC H1/H2 visual-hierarchy
  assertions (`computed font-weight ≥ 600` for `data-level="1"`,
  `computed padding-left > 0` for `data-level="2"`). Distinct from
  `rect` because `getBoundingClientRect` returns post-layout box
  dimensions only — it cannot read `padding-left` or `font-weight`,
  which are computed-style properties.

CONFIG SCHEMA (functional-tests.json)

A JSON array of test cases. Each test case:
    {
      "name": "left-rail-sticky-after-scroll-ch4",
      "url": "/DSA/lectures/ch_4/",
      "viewport": {"w": 1280, "h": 800},
      "scroll": 2000,                     // optional, pixels
      "pre_js": "window.localStorage.removeItem('cs300:last-visit');",
                                          // optional, JS string run after
                                          // driver.get(url) and BEFORE any
                                          // assertion evaluates. Used to
                                          // seed / clear localStorage so
                                          // tests don't depend on suite
                                          // ordering. Multi-line strings
                                          // are fine via JSON's standard
                                          // \\n escaping; the runner
                                          // forwards the literal string
                                          // verbatim to driver.execute_script.
      "asserts": [ { "type": "...", ... }, ... ]
    }

Test cases run sequentially; one Chrome instance for all of them.
A failed assertion does NOT abort the suite — the run completes,
the failed-assertion detail is printed inline, and the process
exits non-zero at the end.

When `pre_js` is present the runner calls `driver.execute_script(pre_js)`
after the navigate completes (document.readyState == 'complete') and
before any optional scroll / settle. This lets a test seed or clear
`window.localStorage` for that page without depending on prior cases.
Per cycle-3 of M-UX-REVIEW-T1: closes ISS-03 / ISS-04 ordering-dependence
LOWs by giving each continue-reading test an explicit pre-step.

DESIGN CONSTRAINTS

- Headless mandatory (`--headless=new`). Same as smoke-screenshots.py.
- Isolated user-data-dir (`/tmp/cs300-functest-<pid>`) to avoid
  collisions with the user's main Chrome.
- No new dependencies beyond `selenium` (already pinned in
  requirements-dev.txt for the screenshot harness).

COMPANION FILES

- scripts/functional-tests.json    initial test config (T9 fixes)
- scripts/smoke-screenshots.py     sibling visual harness
- scripts/_selenium_helpers.py     shared driver factory (T9)
- requirements-dev.txt              selenium pin (no new dep added)
- design_docs/milestones/m_ux_polish/tasks/T9_layout_polish.md
"""

from __future__ import annotations

import argparse
import json
import operator
import os
import re
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from selenium import webdriver
from selenium.webdriver.common.by import By

# Driver-factory + preview-reachable check live in a shared helper so
# the screenshot harness and this harness use the same headless +
# isolated-profile setup. Importing rather than duplicating keeps the
# user-data-dir / no-sandbox / disable-gpu options canonical in one
# place — adding a new flag (e.g. proxy config) ripples to both
# harnesses on edit.
from _selenium_helpers import (  # type: ignore[import-not-found]
    assert_preview_reachable,
    build_driver,
)


# ---------------------------------------------------------------------------
# Data shapes
# ---------------------------------------------------------------------------


@dataclass
class TestCase:
    """One test case from the config file.

    Attributes mirror the JSON keys verbatim. `asserts` stays as raw
    dicts — each runner function reads what it needs.
    """

    name: str
    url: str
    viewport_w: int
    viewport_h: int
    scroll: int = 0
    pre_js: str | None = None
    asserts: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class AssertionResult:
    """Outcome of one assertion."""

    passed: bool
    detail: str  # human-readable summary of what was checked + result


# ---------------------------------------------------------------------------
# Config parsing
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    """Build the CLI parser. Defaults align with the project layout."""
    p = argparse.ArgumentParser(
        description=(
            "Run Selenium-driven functional assertions against the cs-300 "
            "preview server. See module docstring for design + usage."
        ),
    )
    p.add_argument(
        "--config",
        default="scripts/functional-tests.json",
        help="Path to JSON file listing test cases.",
    )
    p.add_argument(
        "--base-url",
        default="http://localhost:4321",
        help="Base URL the preview server is reachable at.",
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
            "After page load + scroll, wait this many ms for layout "
            "to settle before evaluating assertions."
        ),
    )
    p.add_argument(
        "--no-sandbox",
        action="store_true",
        default=True,
        help="Pass --no-sandbox to Chrome (default ON, same as smoke-screenshots.py).",
    )
    return p.parse_args()


def load_test_cases(config_path: Path) -> list[TestCase]:
    """Parse functional-tests.json into TestCase records."""
    with config_path.open("r", encoding="utf-8") as fh:
        raw: list[dict[str, Any]] = json.load(fh)
    cases: list[TestCase] = []
    for entry in raw:
        viewport = entry.get("viewport", {"w": 1280, "h": 800})
        # `pre_js` is optional. When absent, defaults to None; the runner
        # skips `driver.execute_script` entirely. When present, must be a
        # string — the runner forwards it verbatim to Selenium's JS context.
        pre_js = entry.get("pre_js")
        if pre_js is not None and not isinstance(pre_js, str):
            raise TypeError(
                f"test case {entry.get('name')!r}: pre_js must be a string, "
                f"got {type(pre_js).__name__}"
            )
        cases.append(
            TestCase(
                name=entry["name"],
                url=entry["url"],
                viewport_w=int(viewport["w"]),
                viewport_h=int(viewport["h"]),
                scroll=int(entry.get("scroll", 0)),
                pre_js=pre_js,
                asserts=list(entry.get("asserts", [])),
            )
        )
    return cases


# ---------------------------------------------------------------------------
# Assertion runners
# ---------------------------------------------------------------------------


_OPS: dict[str, Any] = {
    "==": operator.eq,
    "!=": operator.ne,
    "<": operator.lt,
    "<=": operator.le,
    ">": operator.gt,
    ">=": operator.ge,
}


def _fmt_value(v: Any) -> str:
    """Tight repr for values printed inside failure detail lines."""
    if isinstance(v, float):
        return f"{v:.2f}"
    return repr(v)


def _run_attr(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """attr — read element[name] and compare to expected (string or regex)."""
    selector = spec["selector"]
    name = spec["name"]
    expected = spec["expected"]
    use_regex = bool(spec.get("regex", False))
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    if not elements:
        return AssertionResult(False, f"attr: selector {selector!r} matched 0 elements")
    actual = elements[0].get_attribute(name)
    if use_regex:
        ok = actual is not None and re.search(expected, actual) is not None
    else:
        ok = actual == expected
    detail = (
        f"attr: {selector!r}[{name}] expected="
        f"{_fmt_value(expected)}{' (regex)' if use_regex else ''}, "
        f"actual={_fmt_value(actual)}"
    )
    return AssertionResult(ok, detail)


def _run_count(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """count — len(find_elements(selector)) {op} expected."""
    selector = spec["selector"]
    expected = int(spec["expected"])
    op_name = spec.get("op", "==")
    op = _OPS.get(op_name)
    if op is None:
        return AssertionResult(False, f"count: unsupported op {op_name!r}")
    actual = len(driver.find_elements(By.CSS_SELECTOR, selector))
    ok = op(actual, expected)
    detail = (
        f"count: {selector!r} expected {op_name} {expected}, actual={actual}"
    )
    return AssertionResult(ok, detail)


def _run_rect(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """getBoundingClientRect — element.getBoundingClientRect()[prop] {op} expected."""
    selector = spec["selector"]
    prop = spec["prop"]
    op_name = spec["op"]
    expected = spec["expected"]
    rect = driver.execute_script(
        "var el = document.querySelector(arguments[0]);"
        "return el ? el.getBoundingClientRect().toJSON() : null;",
        selector,
    )
    if rect is None:
        return AssertionResult(
            False,
            f"rect: selector {selector!r} matched 0 elements",
        )
    if prop not in rect:
        return AssertionResult(
            False,
            f"rect: prop {prop!r} not on rect (have {sorted(rect.keys())})",
        )
    actual = rect[prop]
    if op_name == "between":
        lo, hi = expected[0], expected[1]
        ok = lo <= actual <= hi
        detail = (
            f"rect: {selector!r}.{prop} expected in [{lo}, {hi}], "
            f"actual={_fmt_value(actual)}"
        )
        return AssertionResult(ok, detail)
    op = _OPS.get(op_name)
    if op is None:
        return AssertionResult(False, f"rect: unsupported op {op_name!r}")
    ok = op(actual, expected)
    detail = (
        f"rect: {selector!r}.{prop} expected {op_name} {_fmt_value(expected)}, "
        f"actual={_fmt_value(actual)}"
    )
    return AssertionResult(ok, detail)


def _run_href_pattern(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """href-pattern — every matched element's href matches the regex."""
    selector = spec["selector"]
    expected = spec["expected"]
    require_all = bool(spec.get("all", True))
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    if not elements:
        return AssertionResult(False, f"href-pattern: selector {selector!r} matched 0 elements")
    pattern = re.compile(expected)
    bad: list[str] = []
    for el in elements:
        href = el.get_attribute("href") or ""
        if not pattern.search(href):
            bad.append(href)
    if require_all:
        ok = not bad
        detail = (
            f"href-pattern: {selector!r} ({len(elements)} elems) all-match {expected!r}; "
            f"non-matching={bad if bad else '∅'}"
        )
    else:
        ok = len(bad) < len(elements)
        detail = (
            f"href-pattern: {selector!r} ({len(elements)} elems) any-match {expected!r}; "
            f"non-matching={bad if bad else '∅'}"
        )
    return AssertionResult(ok, detail)


def _run_aria_current(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """aria-current — selector's aria-current attribute equals expected (default 'page')."""
    selector = spec["selector"]
    expected = spec.get("expected", "page")
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    if not elements:
        return AssertionResult(False, f"aria-current: selector {selector!r} matched 0 elements")
    actual = elements[0].get_attribute("aria-current")
    ok = actual == expected
    detail = (
        f"aria-current: {selector!r} expected={expected!r}, actual={actual!r}"
    )
    return AssertionResult(ok, detail)


def _run_text_pattern(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """text-pattern — every matched element's textContent matches the regex.

    Used for asserting visible text shape (e.g. RHS TOC entries must
    start with `N.N ` numbering — top-level sections only, no h3
    subsections).
    """
    selector = spec["selector"]
    expected = spec["expected"]
    require_all = bool(spec.get("all", True))
    elements = driver.find_elements(By.CSS_SELECTOR, selector)
    if not elements:
        return AssertionResult(False, f"text-pattern: selector {selector!r} matched 0 elements")
    pattern = re.compile(expected)
    bad: list[str] = []
    for el in elements:
        text = (el.text or "").strip()
        if not pattern.search(text):
            bad.append(text)
    if require_all:
        ok = not bad
        detail = (
            f"text-pattern: {selector!r} ({len(elements)} elems) all-match {expected!r}; "
            f"non-matching={bad if bad else '∅'}"
        )
    else:
        ok = len(bad) < len(elements)
        detail = (
            f"text-pattern: {selector!r} ({len(elements)} elems) any-match {expected!r}; "
            f"non-matching={bad if bad else '∅'}"
        )
    return AssertionResult(ok, detail)


def _parse_css_numeric(value: str) -> float | None:
    """Parse a computed-style value like ``'16px'`` / ``'600'`` to a float.

    Returns ``None`` if the leading token isn't a number — caller
    falls back to string equality. Strips a trailing unit (``px``,
    ``em``, ``rem``, ``%``, ``deg``) before parsing because every
    computed-style numeric property lands as ``<number><unit>`` in
    Chrome (lengths) or as a bare number for ``font-weight``.
    """
    if value is None:
        return None
    text = value.strip()
    # Find the first non-numeric / non-dot character; everything
    # before it is the numeric portion. Handles negatives + decimals
    # (Chrome's getPropertyValue never returns scientific notation
    # for these props).
    end = 0
    if end < len(text) and text[end] in "+-":
        end += 1
    saw_digit = False
    saw_dot = False
    while end < len(text):
        ch = text[end]
        if ch.isdigit():
            saw_digit = True
            end += 1
        elif ch == "." and not saw_dot:
            saw_dot = True
            end += 1
        else:
            break
    if not saw_digit:
        return None
    try:
        return float(text[:end])
    except ValueError:  # pragma: no cover — defensive
        return None


def _run_computed_style(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """computed-style — getComputedStyle(el)[prop] {op} expected.

    Distinct from ``rect`` because ``getBoundingClientRect`` returns
    post-layout box dimensions only; it cannot read ``font-weight``
    or ``padding-left`` (those are computed-style values, not box
    geometry). Added at M-UX-REVIEW T2 D5 for the F4 H1/H2 visual-
    hierarchy ACs (AC2 ``font-weight >= 600`` on ``data-level="1"``;
    AC3 ``padding-left > 0`` on ``data-level="2"``).
    """
    selector = spec["selector"]
    prop = spec["prop"]
    op_name = spec["op"]
    expected = spec["expected"]
    raw = driver.execute_script(
        "var el = document.querySelector(arguments[0]);"
        "if (!el) return null;"
        "return window.getComputedStyle(el).getPropertyValue(arguments[1]);",
        selector,
        prop,
    )
    if raw is None:
        return AssertionResult(
            False,
            f"computed-style: selector {selector!r} matched 0 elements",
        )
    if op_name == "between":
        # `expected` is [lo, hi]; parse the raw value numerically.
        actual = _parse_css_numeric(raw)
        if actual is None:
            return AssertionResult(
                False,
                f"computed-style: {selector!r}.{prop} = {raw!r} not numeric "
                f"(needed for op 'between')",
            )
        lo, hi = expected[0], expected[1]
        ok = lo <= actual <= hi
        detail = (
            f"computed-style: {selector!r}.{prop} expected in [{lo}, {hi}], "
            f"actual={_fmt_value(actual)} (raw={raw!r})"
        )
        return AssertionResult(ok, detail)
    op = _OPS.get(op_name)
    if op is None:
        return AssertionResult(False, f"computed-style: unsupported op {op_name!r}")
    if op_name == "==" and isinstance(expected, str):
        # String equality path — useful for asserting things like
        # `display: 'block'` where parsing to float would lose data.
        ok = op(raw, expected)
        detail = (
            f"computed-style: {selector!r}.{prop} expected == {expected!r}, "
            f"actual={raw!r}"
        )
        return AssertionResult(ok, detail)
    actual = _parse_css_numeric(raw)
    if actual is None:
        return AssertionResult(
            False,
            f"computed-style: {selector!r}.{prop} = {raw!r} not numeric "
            f"(op {op_name!r} requires a parseable value)",
        )
    ok = op(actual, expected)
    detail = (
        f"computed-style: {selector!r}.{prop} expected {op_name} "
        f"{_fmt_value(expected)}, actual={_fmt_value(actual)} (raw={raw!r})"
    )
    return AssertionResult(ok, detail)


_RUNNERS: dict[str, Any] = {
    "attr": _run_attr,
    "count": _run_count,
    "rect": _run_rect,
    "getBoundingClientRect": _run_rect,  # alias to match spec wording
    "href-pattern": _run_href_pattern,
    "aria-current": _run_aria_current,
    "text-pattern": _run_text_pattern,
    "computed-style": _run_computed_style,
}


def run_assertion(driver: webdriver.Chrome, spec: dict[str, Any]) -> AssertionResult:
    """Dispatch one assertion spec to the matching runner."""
    kind = spec.get("type")
    runner = _RUNNERS.get(kind or "")
    if runner is None:
        return AssertionResult(
            False,
            f"unknown assertion type {kind!r} (have {sorted(_RUNNERS.keys())})",
        )
    try:
        return runner(driver, spec)
    except Exception as exc:  # noqa: BLE001 — surface unexpected failures
        return AssertionResult(False, f"{kind}: raised {type(exc).__name__}: {exc}")


# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------


def run_test_case(
    driver: webdriver.Chrome,
    base_url: str,
    case: TestCase,
    page_load_timeout: int,
    settle_ms: int,
) -> tuple[bool, list[AssertionResult]]:
    """Visit + scroll + assert. Returns (overall_pass, per-assertion results)."""
    full_url = base_url.rstrip("/") + case.url
    driver.set_window_size(case.viewport_w, case.viewport_h)
    driver.set_page_load_timeout(page_load_timeout)
    driver.get(full_url)
    # Wait for document.readyState complete.
    deadline = time.time() + page_load_timeout
    while time.time() < deadline:
        if driver.execute_script("return document.readyState") == "complete":
            break
        time.sleep(0.05)
    # Run the optional `pre_js` hook BEFORE scroll + settle so the
    # localStorage seed (or clear) lands in the page's JS context
    # before any inline `<script>` reader fires its DOMContentLoaded
    # logic against fresh state. The reader in ContinueReading.astro
    # runs on parse and reads localStorage immediately, so any
    # post-load mutation must be paired with a reload — but for
    # localStorage seeding the canonical pattern is: navigate to the
    # target page (which schedules the inline reader), then write the
    # seed, then reload via location.reload() so the inline reader
    # fires again with the seed in place. This is implemented inline
    # in the test config (each pre_js for a populated case writes the
    # entry then calls location.reload()), keeping the harness simple.
    if case.pre_js:
        driver.execute_script(case.pre_js)
        # Some pre_js scripts call `location.reload()` so the page's
        # inline readers re-fire against the seeded localStorage.
        # Re-wait for readyState complete after the hook to cover that
        # case; if no reload happened, this loop exits immediately.
        deadline = time.time() + page_load_timeout
        while time.time() < deadline:
            if driver.execute_script("return document.readyState") == "complete":
                break
            time.sleep(0.05)
    # Optional scroll BEFORE settle so the post-scroll layout has time
    # to land before assertions evaluate.
    #
    # Pass `case.scroll` via Selenium's positional-argument channel
    # rather than f-string interpolation (cycle-2 hardening,
    # M-UX-REVIEW T2 issue file SHIP advisory). `case.scroll` is
    # already `int(...)` cast at parse time (line ~257), so the
    # f-string was safe today — but `arguments[0]` parameter passing
    # eliminates string-building entirely so a future contributor
    # removing the cast cannot reintroduce a JS-injection vector via
    # `functional-tests.json`.
    if case.scroll:
        driver.execute_script(
            "window.scrollTo(0, arguments[0]);", case.scroll
        )
    time.sleep(settle_ms / 1000.0)

    results = [run_assertion(driver, spec) for spec in case.asserts]
    overall = all(r.passed for r in results) if results else True
    return overall, results


def main() -> int:
    """CLI entrypoint — returns process exit code (0 on all-pass)."""
    args = parse_args()
    config_path = Path(args.config).resolve()
    if not config_path.is_file():
        print(f"ERROR: config not found at {config_path}", file=sys.stderr)
        return 2

    print(f"functional-tests: config={config_path}")
    assert_preview_reachable(args.base_url)
    print(f"functional-tests: preview reachable at {args.base_url}")

    cases = load_test_cases(config_path)
    print(f"functional-tests: {len(cases)} test case(s)")

    user_data_dir = Path(tempfile.mkdtemp(prefix=f"cs300-functest-{os.getpid()}-"))
    print(f"functional-tests: chrome user-data-dir = {user_data_dir}")

    started_at = time.time()
    summary: list[tuple[str, bool, int, int]] = []  # (name, ok, pass, total)
    failed_details: list[tuple[str, AssertionResult]] = []
    try:
        driver = build_driver(user_data_dir, no_sandbox=args.no_sandbox)
        try:
            for case in cases:
                ok, results = run_test_case(
                    driver=driver,
                    base_url=args.base_url,
                    case=case,
                    page_load_timeout=args.page_load_timeout,
                    settle_ms=args.settle_ms,
                )
                passed = sum(1 for r in results if r.passed)
                total = len(results)
                tag = "[PASS]" if ok else "[FAIL]"
                print(
                    f"  {tag} {case.name:<48} "
                    f"({passed}/{total} asserts) "
                    f"@ {case.viewport_w}x{case.viewport_h} {case.url}"
                )
                if not ok:
                    for r in results:
                        if not r.passed:
                            print(f"      - {r.detail}")
                            failed_details.append((case.name, r))
                summary.append((case.name, ok, passed, total))
        finally:
            driver.quit()
    finally:
        shutil.rmtree(user_data_dir, ignore_errors=True)

    elapsed = time.time() - started_at
    n_pass = sum(1 for _, ok, _, _ in summary if ok)
    n_fail = len(summary) - n_pass
    total_asserts = sum(t for _, _, _, t in summary)
    pass_asserts = sum(p for _, _, p, _ in summary)
    print()
    print("=" * 70)
    print(
        f"SUMMARY: {n_pass}/{len(summary)} test cases passed "
        f"({pass_asserts}/{total_asserts} assertions) in {elapsed:.1f}s"
    )
    if failed_details:
        print(f"FAILURES ({len(failed_details)}):")
        for name, r in failed_details:
            print(f"  - {name}: {r.detail}")
    print("=" * 70)
    return 0 if n_fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
