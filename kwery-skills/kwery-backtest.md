---
name: kwery-backtest
description: Run a point-in-time backtest using Kwery snapshot and candle data
---

Run a point-in-time backtest using Kwery data to avoid look-ahead bias.

## Workflow

1. **Discover markets** — use `polymarket_markets` or `kalshi_markets` to find the market
2. **Fetch candles** — use `polymarket_candles` with `token_id` for the probability series
3. **Fetch reference price** — use `binance_candles` or `chainlink_candles` for spot price
4. **Fetch snapshots** — use `polymarket_snapshot_at` at each decision point for order book state
5. **Analyze** — compare probabilities vs realized outcomes, measure edge

## Look-ahead Bias Prevention

Always use `polymarket_snapshot_at` or `kalshi_snapshot_at` rather than `polymarket_snapshots` when you need the book state at a specific historical time. The `_at` endpoint returns the snapshot *at or before* the requested time — no future data leaks in.

## Example

```
# Step 1: Find BTC hourly markets
polymarket_markets(symbol="BTC", market_type="up-down")

# Step 2: Fetch candles for the Up token
polymarket_candles(symbol="BTC", interval="1h", token_id="<clob_token_up>", start="2024-01-01T00:00:00Z")

# Step 3: Fetch Binance candles for the same period
binance_candles(symbol="BTC", interval="1h", start="2024-01-01T00:00:00Z")

# Step 4: Get book state at a specific decision point
polymarket_snapshot_at(symbol="BTC", time="2024-01-15T08:00:00Z")
```

## Notes

- Polymarket prices are probabilities [0-1], not dollars
- Kalshi prices are in cents [0-100]
- Use `kwery_limits` to check history depth before large pulls
- Cursor pagination via `after=meta.next_cursor` for full history
