# Dockerfile — cs-300 agent development sandbox
#
# Authored 2026-05-01. Provides a Linux image carrying the project's
# pinned toolchain plus Claude Code, so agents can be run with
# `--dangerously-skip-permissions` confined to the project tree and
# `~/.claude`. No other host paths are mounted by docker-compose.yml.
#
# Pin sources of truth:
#   Node    — .nvmrc
#   pandoc  — .pandoc-version
#   Python  — pyproject.toml (>=3.12, provided by uv)
#
# LaTeX is intentionally absent: chapter sources are frozen
# (ch_1–ch_6 SNHU-required arc closed 2026-04-23). If chapter
# authoring resumes, add a separate "tex" build stage rather than
# bloating this image.
#
# Image is built and orchestrated via docker-compose.yml; running it
# standalone is supported but the bind layout assumes compose.

FROM node:22-bookworm-slim

ARG USER_UID=1000
ARG USER_GID=1000
ARG PANDOC_VERSION=3.1.3

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl git openssh-client gnupg \
        build-essential python3 python3-venv python3-dev \
        sqlite3 jq ripgrep less \
    && rm -rf /var/lib/apt/lists/*

# pandoc — pinned to the version recorded in .pandoc-version.
RUN ARCH="$(dpkg --print-architecture)" \
 && curl -fsSL -o /tmp/pandoc.deb \
        "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-1-${ARCH}.deb" \
 && dpkg -i /tmp/pandoc.deb \
 && rm /tmp/pandoc.deb \
 && pandoc --version | head -1

# uv — Astral's Python toolchain. Project memory mandates
# `uvx --from jmdl-ai-workflows aiw ...` for ai-workflows smokes.
RUN curl -LsSf https://astral.sh/uv/install.sh \
      | env UV_INSTALL_DIR=/usr/local/bin INSTALLER_NO_MODIFY_PATH=1 sh \
 && uv --version

# Claude Code CLI installed globally so the same binary serves any
# workspace path mounted at runtime.
RUN npm install -g @anthropic-ai/claude-code \
 && claude --version

# Re-stamp the prebuilt `node` user to match host UID/GID. Files
# written through the bind mount then land with host-correct
# ownership — no chown -R after the fact.
RUN if [ "$(id -u node)" != "${USER_UID}" ] || [ "$(id -g node)" != "${USER_GID}" ]; then \
        groupmod -g "${USER_GID}" node && \
        usermod  -u "${USER_UID}" -g "${USER_GID}" node; \
    fi \
 && mkdir -p /home/node/.claude /home/node/.cache /home/node/.config /home/node/.local /workspace \
 && chown -R "${USER_UID}:${USER_GID}" /home/node /workspace

USER node
ENV HOME=/home/node \
    PATH=/home/node/.local/bin:/usr/local/bin:/usr/bin:/bin

# WORKDIR is overridden by docker-compose at runtime to the host
# project path, so `~/.claude/projects/<path>` keys stay aligned
# between host and container Claude sessions. /workspace is the
# fallback when running the image without compose.
WORKDIR /workspace

CMD ["bash"]
