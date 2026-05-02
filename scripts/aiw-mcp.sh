#!/usr/bin/env bash
# M4 T04 — Launch aiw-mcp with cs300 workflow modules.
# Usage: bash scripts/aiw-mcp.sh [--port PORT] [--cors-origin ORIGIN]
# Defaults: port 8080, cors-origin http://localhost:4321
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${AIW_PORT:-8080}"
CORS_ORIGIN="${AIW_CORS_ORIGIN:-http://localhost:4321}"

exec env \
  PYTHONPATH="$REPO_ROOT" \
  AIW_EXTRA_WORKFLOW_MODULES=cs300.workflows.question_gen,cs300.workflows.grade \
  uvx --from jmdl-ai-workflows aiw-mcp \
    --transport http \
    --port "$PORT" \
    --cors-origin "$CORS_ORIGIN"
