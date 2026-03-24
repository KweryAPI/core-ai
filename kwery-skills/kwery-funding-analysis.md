---
name: kwery-funding-analysis
description: Analyze perpetual funding rates and open interest from Binance and Hyperliquid
---

Analyze perpetual funding rates, open interest, and liquidations using Kwery.

## Available Data

| Tool | Description |
|------|-------------|
| `binance_funding` | Binance futures funding (every 8h) |
| `hyperliquid_funding` | Hyperliquid funding (continuous) |
| `binance_oi` | Binance open interest history |
| `hyperliquid_oi` | Hyperliquid open interest history |
| `binance_liquidations` | Forced liquidation events |

## Funding Rate Analysis

Funding rate interpretation:
- Positive rate → longs pay shorts → market is bullish/crowded long
- Negative rate → shorts pay longs → market is bearish/crowded short
- Annualized = `rate × 3 × 365` (Binance pays every 8h = 3x/day)

```
# Fetch 30 days of BTC funding from Binance
binance_funding(symbol="BTC", start="2024-02-01T00:00:00Z", limit=5000)

# Compare with Hyperliquid
hyperliquid_funding(symbol="BTC", start="2024-02-01T00:00:00Z", limit=5000)
```

## Liquidation Cascades

Large liquidation spikes often precede or coincide with sharp price moves:

```
# Fetch long liquidations > $100k
binance_liquidations(symbol="BTC", side="long", min_usd=100000, limit=1000)
```

## Open Interest

Rising OI + rising price = trend continuation signal.
Rising OI + falling price = bearish pressure building.

```
binance_oi(symbol="BTC", interval="1h", start="2024-01-01T00:00:00Z")
```

## Notes

- Tier limits: Free 7d · Pro 14d · Business 31d
- Call `kwery_limits` to verify history access before large pulls
