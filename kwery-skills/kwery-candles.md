---
name: kwery-candles
description: Fetch OHLCV candle data from Kwery (Binance, Chainlink, Polymarket)
---

Fetch OHLCV candle data using the Kwery API.

## Usage

Use the `binance_candles`, `chainlink_candles`, or `polymarket_candles` MCP tool.

**Required parameters:**
- `symbol`: BTC | ETH | SOL | XRP
- `interval`: 1s | 5m | 15m | 1h | 4h | 1d | 24h

**Optional parameters:**
- `source`: binance (default) | binance_futures | chainlink
- `start` / `end`: ISO 8601 date range
- `limit`: rows to return (default 500, max 10000)
- `after`: cursor for pagination

## Examples

Fetch the last 100 hourly BTC candles from Binance:
```
binance_candles(symbol="BTC", interval="1h", limit=100)
```

Fetch Chainlink oracle prices for comparison:
```
chainlink_candles(symbol="BTC", interval="1h", limit=100)
```

Fetch Polymarket OHLCV (probability series) for a specific token:
```
polymarket_candles(symbol="BTC", interval="1h", token_id="<clob_token_up>")
```

## Notes

- Always pass `token_id` to `polymarket_candles` for single-series backtesting
- Tier limits: Free 7d/15m+ · Pro 14d/5m+ · Business 31d/1s
- Call `kwery_limits` first for large pulls to verify plan access
