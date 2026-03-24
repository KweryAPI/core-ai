---
name: kwery-cross-platform
description: Compare price action, sentiment, and signals across Polymarket, Kalshi, Binance, Hyperliquid, and Chainlink using Kwery MCP tools
---

Compare data across multiple platforms to identify divergences, arbitrage signals, and cross-market confirmation.

## Available Tools by Platform

| Platform | Price/Candles | Trades | Order Book | Markets |
|----------|--------------|--------|------------|---------|
| Polymarket | `polymarket_candles` | `polymarket_trades` | `polymarket_orderbook` | `polymarket_markets` |
| Kalshi | `kalshi_prices` | - | `kalshi_orderbook` | `kalshi_markets` |
| Binance Spot | `binance_candles` | - | - | `binance_spot_markets` |
| Binance Futures | `binance_candles` (source=binance_futures) | - | - | `binance_futures_markets` |
| Hyperliquid | `hyperliquid_candles` | `hyperliquid_trades` | - | `hyperliquid_markets` |
| Chainlink | `chainlink_candles` | - | - | - |

## Common Workflows

### Oracle lag analysis
Compare Chainlink oracle prices against Binance spot to find lead/lag:
```
chainlink_candles(symbol="BTC", interval="1h", limit=168)
binance_candles(symbol="BTC", interval="1h", limit=168)
```
If Chainlink lags Binance by 1-2 bars, prediction markets relying on oracle settlement may misprice.

### Futures basis (cash-and-carry)
Compare Binance spot vs futures to measure basis and funding arbitrage:
```
binance_candles(symbol="BTC", interval="1h", source="binance", limit=168)
binance_candles(symbol="BTC", interval="1h", source="binance_futures", limit=168)
binance_funding(symbol="BTC", limit=168)
```

### Sentiment cross-check
Compare Polymarket/Kalshi implied probabilities against Binance futures sentiment:
```
polymarket_candles(symbol="BTC", interval="1h", token_id="<clob_token_up>", limit=168)
kalshi_prices(symbol="KXBTC", interval="1h", limit=168)
binance_funding(symbol="BTC", limit=168)
binance_oi(symbol="BTC", interval="1h", limit=168)
```
High funding rate + rising OI + rising prediction market probability = convergent bullish signal.

### Hyperliquid vs Binance divergence
Detect when Hyperliquid trades at premium/discount to Binance:
```
hyperliquid_candles(symbol="BTC", interval="1h", limit=168)
binance_candles(symbol="BTC", interval="1h", source="binance_futures", limit=168)
```

## Notes

- Use the same `symbol`, `interval`, and time range across all calls for alignment
- `binance_spot_markets` and `binance_futures_markets` list all available tickers
- Tier limits: Free 7d - Pro 14d - Business 31d
- Call `kwery_limits` before large multi-source pulls to verify plan access
