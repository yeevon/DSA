# Makefile — cs-300 agent development sandbox entry points.
#
# Authored 2026-05-01. Companion to ./Dockerfile + ./docker-compose.yml.
# Primary entry point per spec: `make shell`.
#
# UID/GID are resolved from the invoking user (id -u / id -g) and
# passed to docker compose under the names SANDBOX_UID / SANDBOX_GID.
# We deliberately do not use UID / GID — bash exports UID as
# readonly, so a `UID=1234 docker compose ...` prefix assignment
# silently fails (or is rejected with "UID: readonly variable").
# SANDBOX_* sidesteps the foot-gun and self-documents intent.

SHELL    := /usr/bin/env bash
IMAGE    := cs-300-agent-sandbox:latest
COMPOSE  := docker compose
SERVICE  := dev
HOST_UID := $(shell id -u)
HOST_GID := $(shell id -g)
DC_ENV   := SANDBOX_UID=$(HOST_UID) SANDBOX_GID=$(HOST_GID)

.DEFAULT_GOAL := help
.PHONY: help shell build rebuild stop clean smoke _ensure_image

help:
	@echo "cs-300 sandbox targets:"
	@echo "  make shell    — interactive bash in the sandbox (auto-builds if image missing)"
	@echo "  make build    — build the sandbox image"
	@echo "  make rebuild  — force clean rebuild (--no-cache --pull)"
	@echo "  make smoke    — print toolchain versions inside a fresh container"
	@echo "  make stop     — stop and remove any running sandbox container"
	@echo "  make clean    — remove image + named volumes (node_modules / .venv / .astro)"

shell: _ensure_image
	$(DC_ENV) $(COMPOSE) run --rm $(SERVICE) bash

build:
	$(DC_ENV) $(COMPOSE) build

rebuild:
	$(DC_ENV) $(COMPOSE) build --no-cache --pull

smoke: _ensure_image
	$(DC_ENV) $(COMPOSE) run --rm $(SERVICE) bash -lc \
	  'node --version && pandoc --version | head -1 && uv --version && claude --version'

stop:
	$(DC_ENV) $(COMPOSE) down --remove-orphans

clean:
	$(DC_ENV) $(COMPOSE) down --remove-orphans --volumes --rmi local

_ensure_image:
	@docker image inspect $(IMAGE) >/dev/null 2>&1 || $(MAKE) build
