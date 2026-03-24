---
name: kwery-orderbook
description: Analyze order book depth, spread, and liquidity for Polymarket and Kalshi markets using Kwery MCP tools
---

Fetch and analyze order book data for prediction markets using the Kwery API.

## Available Tools

Use `polymarket_orderbook` or `kalshi_orderbook` depending on the market.

**polymarket_orderbook parameters:**
- `symbol`: BTC | ETH | SOL | XRP
- `depth`: book levels to return (default 10, max 50)
- `include_diffs`: include incremental updates (default false)
- `start` / `end`: ISO 8601 date range
- `limit`: rows to return (default 100, max 1000)
- `after`: cursor for pagination

**kalshi_orderbook parameters:**
- `symbol`: market ticker
- `depth`: book levels (default 10)
- `start` / `end`: ISO 8601 date range
- `limit`: rows to return (default 100)
- `after`: cursor for pagination

## Examples

Fetch Polymarket order book depth for BTC with top-10 levels:
```
polymarket_orderbook(symbol="BTC", depth=10, limit=500)
```

Estimate slippage for a $10k trade at current book depth:
```
polymarket_orderbook(symbol="BTC", depth=50, limit=1)
```

Detect book imbalance (bids vs asks) as a directional signal:
```
polymarket_orderbook(symbol="ETH", depth=20, start="2024-01-01T00:00:00Z", limit=1000)
```

## Analysis Patterns

**Spread analysis:** `best_ask - best_bid` / `mid_price` = spread as % of price.
Tight spread (<0.5%) = liquid market. Wide spread (>2%) = illiquid, avoid large trades.

**Depth imbalance:** Sum bid sizes vs ask sizes in top N levels.
`bid_depth / (bid_depth + ask_depth)` > 0.6 = bullish order flow signal.

**Slippage estimation:** Walk the book to find fill price for a given notional size.
Always verify with `polymarket_orderbook(depth=50)` before entering large positions.

## Notes

- Tier limits: Free 7d - Pro 14d - Business 31d
- Cost: 50 base + 4/row (polymarket_orderbook)
- Call `kwery_limits` first to verify plan access for large pulls
