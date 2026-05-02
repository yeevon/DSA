#!/usr/bin/env bash
# scripts/sandbox-guard.sh
#
# Enforces LBD-15 (sandbox-vs-host git policy):
#
#   - When running inside the Docker sandbox (detected by /.dockerenv),
#     all work must happen on `design_branch` (or a feature branch off
#     it). The sandbox must not commit to `main`, push, pull, fetch,
#     merge to main, or push tags. Those are the host's job.
#   - When running on the host (no /.dockerenv), this script no-ops.
#
# Usage:
#   bash scripts/sandbox-guard.sh                 # exit 0 if compliant, non-zero otherwise
#   bash scripts/sandbox-guard.sh --quiet         # same, but only print on failure
#   bash scripts/sandbox-guard.sh --warn-only     # never exit non-zero; print a warning
#
# Wired into:
#   - Makefile `make shell` target (runs before opening the sandbox shell)
#   - .claude/commands/clean-implement.md & auto-implement.md (referenced
#     in the autonomous-mode boundary section as the runtime check the
#     orchestrator may invoke before any commit)
#
# Detection rationale:
#   `/.dockerenv` is created automatically by Docker for every running
#   container — a reliable, no-config marker. We do not key on
#   `--dangerously-skip-permissions` (which is a Claude CLI flag, not a
#   container marker) because the policy applies to any sandbox run,
#   not just Claude.

set -euo pipefail

QUIET=0
WARN_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --quiet)     QUIET=1 ;;
    --warn-only) WARN_ONLY=1 ;;
    -h|--help)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    *)
      echo "sandbox-guard: unknown arg: $arg" >&2
      exit 2
      ;;
  esac
done

# 1. Detect environment.
if [ ! -e /.dockerenv ]; then
  if [ "$QUIET" -eq 0 ]; then
    echo "sandbox-guard: host environment (no /.dockerenv) — policy not enforced here."
  fi
  exit 0
fi

# 2. Inside the sandbox. Ask git for the current branch. Tolerate
#    detached HEAD by reporting it as a non-fatal warning.
if ! command -v git >/dev/null 2>&1; then
  echo "sandbox-guard: git not found in PATH" >&2
  exit 2
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")"

if [ "$BRANCH" = "HEAD" ] || [ "$BRANCH" = "?" ]; then
  echo "sandbox-guard: detached HEAD or git error — cannot validate branch policy."
  if [ "$WARN_ONLY" -eq 1 ]; then
    exit 0
  fi
  exit 1
fi

# 3. Enforce LBD-15.
if [ "$BRANCH" = "main" ]; then
  cat >&2 <<EOF
sandbox-guard: ❌ LBD-15 violation.
  Current branch: main
  Environment:    sandbox (/.dockerenv present)

  The sandbox must work on \`design_branch\` (or a feature branch off
  it), never on \`main\`. Switch branches before continuing:

      git switch design_branch
      # or, if you need a fresh feature branch:
      git switch -c <feature-branch> design_branch

  Pushes / pulls / merges to main are the host's job (SSH and remote
  auth are not forwarded into the container by design).

  See CLAUDE.md § Load-bearing decisions, LBD-15.
EOF
  if [ "$WARN_ONLY" -eq 1 ]; then
    exit 0
  fi
  exit 1
fi

if [ "$QUIET" -eq 0 ]; then
  echo "sandbox-guard: ✅ LBD-15 compliant — sandbox on \`$BRANCH\`."
fi
exit 0
