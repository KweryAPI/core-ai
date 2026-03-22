#!/usr/bin/env bash
# Smoke test the kwery CLI against the real API.
# Run after `pnpm build` from the repo root.
#
# Usage:
#   KWERY_API_KEY=your_key bash scripts/smoke-cli.sh

set -euo pipefail

if [ -z "${KWERY_API_KEY:-}" ]; then
  echo "KWERY_API_KEY not set — skipping CLI smoke tests"
  exit 0
fi

CLI="node kwery-cli/dist/index.js"
PASS=0
FAIL=0

check() {
  local label="$1"
  local cmd="$2"
  local expect="$3"

  output=$(eval "$cmd" 2>&1) || true

  if echo "$output" | grep -q "$expect"; then
    echo "✓ $label"
    ((PASS++)) || true
  else
    echo "✗ $label"
    echo "  Expected to find: $expect"
    echo "  Got: $(echo "$output" | head -3)"
    ((FAIL++)) || true
  fi
}

echo "Running CLI smoke tests..."
echo ""

# Auth / account
check "limits returns plan"         "$CLI limits --format json"                       '"plan"'
check "status returns ingestion"    "$CLI status --format json"                       '"status"'
check "sources returns sources"     "$CLI sources --format json"                      '"sources"'

# Markets
check "markets polymarket BTC"      "$CLI markets --source polymarket --symbol BTC --limit 3 --format json"  '"data"'
check "market by identifier"        "$CLI market 0x440c3c38 --format json"             '"market_id"'

# Candles
check "binance candles spot"        "$CLI candles -s BTC -i 1h --source binance --limit 3 --format json"     '"data"'
check "binance candles futures"     "$CLI candles -s BTC -i 1h --source binance_futures --limit 3 --format json" '"data"'
check "chainlink candles"           "$CLI candles -s BTC -i 1h --source chainlink --limit 3 --format json"   '"data"'

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
