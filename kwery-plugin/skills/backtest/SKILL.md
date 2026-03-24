---
name: backtest
description: Point-in-time accurate backtesting on Polymarket and Kalshi prediction markets using Kwery data. Use when building trading strategies, reconstructing historical market state, or avoiding look-ahead bias in historical analysis.
---

# Kwery Backtest Skill

You are an expert quantitative researcher using the Kwery API to build
point-in-time accurate backtests on prediction markets and crypto derivatives.

## Kwery API Base URL
`https://kwery-api.com` — authenticate with `X-API-Key` header.
Set `KWERY_API_KEY` environment variable.

## Critical Rules

### Always use token_id for Polymarket backtests
Without `token_id`, `/v1/polymarket/candles` returns multiple rows per timestamp
(Up + Down legs for every matching market). This corrupts any backtest.

```python
# WRONG — multiple rows per bar
requests.get("/v1/polymarket/candles", params={"symbol": "BTC", "interval": "1h"})

# CORRECT — one row per bar, backtestable
requests.get("/v1/polymarket/candles", params={
    "symbol": "BTC",
    "interval": "1h",
    "token_id": "502016..."  # clob_token_up or clob_token_down from /v1/markets
})
```

Get `token_id` from `GET /v1/markets?source=polymarket&symbol=BTC` →
`clob_token_up` or `clob_token_down`.

### Always use snapshot_at for point-in-time fills
Never use candle close price as fill. Use the exact order book at signal time.

```python
snap = requests.get("/v1/polymarket/snapshots/at", params={
    "symbol": "BTC",
    "time": "2024-03-18T12:00:00Z",  # ISO 8601 UTC
    "include_orderbook": True
})
# Use snap["best_ask"] or snap["best_bid"] as fill price
```

### Check credits before large pulls
```python
limits = requests.get("/v1/limits").json()
print(f"Remaining credits: {limits['credits']['remaining']}")
```
Credit costs: candles = 50 base + 3/row, snapshots = 50 base + 4/row.
1-year hourly backtest (8,760 candles) ≈ 26,330 credits.

### Pagination
```python
after = None
all_rows = []
while True:
    page = requests.get("/v1/polymarket/candles", params={
        "symbol": "BTC", "interval": "1h",
        "token_id": token_id, "after": after
    }).json()
    all_rows.extend(page["data"])
    after = page["meta"]["next_cursor"]
    if not after:
        break
```

## Standard Backtest Workflow
1. `GET /v1/limits` — confirm plan and credits
2. `GET /v1/markets?source=polymarket&symbol=BTC&active=false` — resolved markets
3. Pick a market → copy `clob_token_up` or `clob_token_down`
4. `GET /v1/polymarket/candles?token_id=...` — price series
5. For each entry signal → `GET /v1/polymarket/snapshots/at?time=...`
6. Fill at bid/ask from snapshot, track P&L from subsequent closes

## Tier Limits
| Data | Free | Pro | Business |
|------|------|-----|----------|
| Candles | 7d / 15m+ | 14d / 5m+ | 31d / 1s |
| Snapshots | 7d | 14d | 31d |
| Trade ticks | 7d | 14d | 31d |
| 500ms snapshots | ✗ | ✗ | ✓ |

## MCP Tools
Use these Kwery MCP tools for automated backtesting:
- `kwery_limits` — check plan and credits before large pulls
- `polymarket_markets` — discover markets, get `clob_token_up` / `clob_token_down`
- `polymarket_candles` — fetch OHLCV probability price series
- `polymarket_snapshot_at` — point-in-time order book for fills
- `kalshi_markets` — list Kalshi binary event markets
- `kalshi_prices` — fetch Kalshi price history
- `kalshi_snapshot_at` — point-in-time Kalshi order book
