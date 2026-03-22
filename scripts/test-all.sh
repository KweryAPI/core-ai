#!/usr/bin/env bash
# scripts/test-all.sh — master test runner
# Usage:
#   ./scripts/test-all.sh           # unit + integration + structure
#   ./scripts/test-all.sh --smoke   # above + MCP smoke tests (requires KWERY_API_KEY)
#   ./scripts/test-all.sh --full    # above + CLI smoke tests

set -euo pipefail

SMOKE=false
FULL=false

for arg in "$@"; do
  case $arg in
    --smoke) SMOKE=true ;;
    --full)  SMOKE=true; FULL=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if $SMOKE && [[ -z "${KWERY_API_KEY:-}" ]]; then
  echo "ERROR: KWERY_API_KEY must be set for smoke tests" >&2
  exit 1
fi

echo "==> Typechecking..."
pnpm typecheck

echo "==> Building..."
pnpm build

echo "==> MCP unit + integration tests..."
cd kwery-mcp && pnpm vitest run && cd ..

echo "==> CLI unit + integration tests..."
cd kwery-cli && pnpm vitest run && cd ..

echo "==> Repo structure tests..."
pnpm test:structure

echo "==> Install script tests..."
pnpm test:install

echo "==> Security check..."
bash scripts/security-check.sh

echo "==> Pre-publish artifact check..."
bash scripts/prepublish-check.sh

if $SMOKE; then
  echo "==> MCP smoke tests (live API)..."
  pnpm test:smoke

  if $FULL; then
    echo "==> CLI smoke tests (live API)..."
    pnpm smoke:cli
  fi
fi

echo ""
echo "All tests passed."
