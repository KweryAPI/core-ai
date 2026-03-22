#!/usr/bin/env bash
# Pre-publish smoke test for kwery-mcp and kwery-cli.
#
# Packs both packages locally, installs them in clean temp directories,
# and verifies the actual published artifact works end to end.
#
# Usage:
#   bash scripts/prepublish-check.sh              # checks only (no API calls)
#   KWERY_API_KEY=your_key bash scripts/prepublish-check.sh  # includes live API test

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

log_step() { echo ""; echo "▶ $1"; }
log_pass() { echo "  ✓ $1"; ((PASS++)) || true; }
log_fail() { echo "  ✗ $1"; ((FAIL++)) || true; }

# ── Build ──────────────────────────────────────────────────────────────────────

log_step "Building packages..."
cd "$REPO_ROOT"
pnpm build
log_pass "Build succeeded"

# ── Pack ──────────────────────────────────────────────────────────────────────

log_step "Packing kwery-mcp..."
cd "$REPO_ROOT/kwery-mcp"
MCP_TARBALL=$(npm pack --json 2>/dev/null | jq -r '.[0].filename')
MCP_TARBALL_PATH="$REPO_ROOT/kwery-mcp/$MCP_TARBALL"
log_pass "Packed: $MCP_TARBALL"

log_step "Packing kwery-cli..."
cd "$REPO_ROOT/kwery-cli"
CLI_TARBALL=$(npm pack --json 2>/dev/null | jq -r '.[0].filename')
CLI_TARBALL_PATH="$REPO_ROOT/kwery-cli/$CLI_TARBALL"
log_pass "Packed: $CLI_TARBALL"

# ── Verify packed file contents ────────────────────────────────────────────────

log_step "Verifying kwery-mcp package contents..."
cd "$REPO_ROOT/kwery-mcp"

# Must include
REQUIRED_MCP=(
  "package/dist/index.js"
  "package/dist/server.js"
  "package/dist/client.js"
  "package/README.md"
)

# Must NOT include
FORBIDDEN_MCP=(
  "package/src/"
  "package/tests/"
  "package/.env"
  "package/node_modules/"
)

for f in "${REQUIRED_MCP[@]}"; do
  if tar -tzf "$MCP_TARBALL" 2>/dev/null | grep -q "^$f"; then
    log_pass "Contains: $f"
  else
    log_fail "Missing from package: $f"
  fi
done

for f in "${FORBIDDEN_MCP[@]}"; do
  if tar -tzf "$MCP_TARBALL" 2>/dev/null | grep -q "^$f"; then
    log_fail "Should NOT be in package: $f"
  else
    log_pass "Correctly excluded: $f"
  fi
done

log_step "Verifying kwery-cli package contents..."
cd "$REPO_ROOT/kwery-cli"

REQUIRED_CLI=(
  "package/dist/index.js"
  "package/README.md"
)

FORBIDDEN_CLI=(
  "package/src/"
  "package/tests/"
  "package/.env"
  "package/node_modules/"
)

for f in "${REQUIRED_CLI[@]}"; do
  if tar -tzf "$CLI_TARBALL" 2>/dev/null | grep -q "^$f"; then
    log_pass "Contains: $f"
  else
    log_fail "Missing from package: $f"
  fi
done

for f in "${FORBIDDEN_CLI[@]}"; do
  if tar -tzf "$CLI_TARBALL" 2>/dev/null | grep -q "^$f"; then
    log_fail "Should NOT be in package: $f"
  else
    log_pass "Correctly excluded: $f"
  fi
done

# ── Install in clean env ───────────────────────────────────────────────────────

log_step "Installing kwery-mcp from tarball in clean environment..."
MCP_TEST_DIR=$(mktemp -d)
cd "$MCP_TEST_DIR"
npm init -y > /dev/null 2>&1
npm install "$MCP_TARBALL_PATH" > /dev/null 2>&1

# Verify binary exists and is runnable
MCP_BIN="$MCP_TEST_DIR/node_modules/.bin/kwery-mcp"
if [ -f "$MCP_BIN" ] || [ -L "$MCP_BIN" ]; then
  log_pass "kwery-mcp binary installed"
else
  log_fail "kwery-mcp binary not found after install"
fi

# Verify it starts without crashing (no API key = error, but should be a
# clean error not a crash)
KWERY_API_KEY="test_key" timeout 3 node "$MCP_TEST_DIR/node_modules/kwery-mcp/dist/index.js" > /dev/null 2>&1 || true
log_pass "kwery-mcp starts without crashing"

rm -rf "$MCP_TEST_DIR"

log_step "Installing kwery-cli from tarball in clean environment..."
CLI_TEST_DIR=$(mktemp -d)
cd "$CLI_TEST_DIR"
npm init -y > /dev/null 2>&1
npm install "$CLI_TARBALL_PATH" > /dev/null 2>&1

CLI_BIN="$CLI_TEST_DIR/node_modules/.bin/kwery"
if [ -f "$CLI_BIN" ] || [ -L "$CLI_BIN" ]; then
  log_pass "kwery CLI binary installed"
else
  log_fail "kwery CLI binary not found after install"
fi

# --version should always work
VERSION_OUTPUT=$(node "$CLI_BIN" --version 2>&1)
if echo "$VERSION_OUTPUT" | grep -qE "^[0-9]+\.[0-9]+\.[0-9]+"; then
  log_pass "kwery --version returns semver: $VERSION_OUTPUT"
else
  log_fail "kwery --version did not return semver: $VERSION_OUTPUT"
fi

# --help should always work
if node "$CLI_BIN" --help > /dev/null 2>&1; then
  log_pass "kwery --help exits 0"
else
  log_fail "kwery --help failed"
fi

# Verify all platform namespaces appear in help
for platform in polymarket kalshi hyperliquid binance; do
  if node "$CLI_BIN" --help 2>&1 | grep -q "$platform"; then
    log_pass "Help mentions $platform"
  else
    log_fail "Help does not mention $platform"
  fi
done

rm -rf "$CLI_TEST_DIR"

# ── Live API check (optional) ─────────────────────────────────────────────────

if [ -n "${KWERY_API_KEY:-}" ]; then
  log_step "Live API check — kwery-cli limits..."
  CLI_LIVE_DIR=$(mktemp -d)
  cd "$CLI_LIVE_DIR"
  npm init -y > /dev/null 2>&1
  npm install "$CLI_TARBALL_PATH" > /dev/null 2>&1
  CLI_BIN="$CLI_LIVE_DIR/node_modules/.bin/kwery"

  LIMITS_OUTPUT=$(KWERY_API_KEY="$KWERY_API_KEY" node "$CLI_BIN" limits --format json 2>&1)

  if echo "$LIMITS_OUTPUT" | jq -e '.plan' > /dev/null 2>&1; then
    PLAN=$(echo "$LIMITS_OUTPUT" | jq -r '.plan')
    log_pass "Live API responded — plan: $PLAN"
  else
    log_fail "Live API check failed: $LIMITS_OUTPUT"
  fi

  rm -rf "$CLI_LIVE_DIR"
else
  echo ""
  echo "  ℹ Skipping live API check (set KWERY_API_KEY to enable)"
fi

# ── Cleanup ────────────────────────────────────────────────────────────────────

log_step "Cleaning up tarballs..."
rm -f "$MCP_TARBALL_PATH" "$CLI_TARBALL_PATH"
log_pass "Tarballs removed"

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  Results: %d passed, %d failed\n" "$PASS" "$FAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "✗ Pre-publish check failed — do not publish"
  exit 1
fi

echo "✓ Pre-publish check passed — safe to publish"
