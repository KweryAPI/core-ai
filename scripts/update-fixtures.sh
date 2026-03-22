#!/usr/bin/env bash
# Regenerate test fixtures from the live API.
# Run this whenever the API response shape changes, then re-run the full
# test suite to catch any fixture mismatches.
#
# Usage:
#   KWERY_API_KEY=your_key bash scripts/update-fixtures.sh

set -euo pipefail

if [ -z "${KWERY_API_KEY:-}" ]; then
  echo "KWERY_API_KEY is required"
  exit 1
fi

BASE="https://kwery-api.com"
FIXTURES="kwery-mcp/tests/fixtures"
HDR="X-API-Key: $KWERY_API_KEY"

echo "Updating fixtures from $BASE..."

curl -sf -H "$HDR" "$BASE/v1/limits" \
  | jq '.' > "$FIXTURES/limits.json"
echo "✓ limits.json"

curl -sf -H "$HDR" "$BASE/v1/sources" \
  | jq '.' > "$FIXTURES/sources.json"
echo "✓ sources.json"

curl -sf -H "$HDR" "$BASE/v1/symbols" \
  | jq '.' > "$FIXTURES/symbols.json"
echo "✓ symbols.json"

curl -sf -H "$HDR" "$BASE/v1/markets?source=polymarket&symbol=BTC&limit=1" \
  | jq '.' > "$FIXTURES/markets.json"
echo "✓ markets.json"

curl -sf -H "$HDR" "$BASE/v1/polymarket/candles?symbol=BTC&interval=1h&limit=1" \
  | jq '.' > "$FIXTURES/candles.json"
echo "✓ candles.json"

curl -sf -H "$HDR" "$BASE/v1/trades?source=polymarket&symbol=BTC&limit=1" \
  | jq '.' > "$FIXTURES/trades.json"
echo "✓ trades.json"

curl -sf -H "$HDR" "$BASE/v1/polymarket/snapshots?symbol=BTC&limit=1" \
  | jq '.' > "$FIXTURES/snapshots.json"
echo "✓ snapshots.json"

curl -sf -H "$HDR" "$BASE/v1/kalshi?symbol=BTC" \
  | jq '.' > "$FIXTURES/kalshi-markets.json"
echo "✓ kalshi-markets.json"

curl -sf -H "$HDR" "$BASE/v1/kalshi/BTC?limit=1" \
  | jq '.' > "$FIXTURES/kalshi-prices.json"
echo "✓ kalshi-prices.json"

curl -sf -H "$HDR" "$BASE/v1/hyperliquid/BTC?limit=1" \
  | jq '.' > "$FIXTURES/hyperliquid-ohlcv.json"
echo "✓ hyperliquid-ohlcv.json"

curl -sf -H "$HDR" "$BASE/v1/funding?symbol=BTC&source=binance_futures&limit=1" \
  | jq '.' > "$FIXTURES/funding.json"
echo "✓ funding.json"

curl -sf -H "$HDR" "$BASE/v1/open-interest?symbol=BTC&source=binance_futures&limit=1" \
  | jq '.' > "$FIXTURES/open-interest.json"
echo "✓ open-interest.json"

curl -sf -H "$HDR" "$BASE/v1/liquidations?symbol=BTC&limit=1" \
  | jq '.' > "$FIXTURES/liquidations.json"
echo "✓ liquidations.json"

curl -sf -H "$HDR" "$BASE/v1/flow?symbol=BTC&interval=1h&limit=1" \
  | jq '.' > "$FIXTURES/flow.json"
echo "✓ flow.json"

echo ""
echo "All fixtures updated. Run 'pnpm test' to verify nothing broke."
