---
name: signal
description: Cross-platform signal construction from Polymarket, Kalshi, and Binance/Hyperliquid derivatives using Kwery data. Use when building trading signals, analyzing funding vs prediction market divergence, or detecting liquidation setups.
---

# Kwery Signal Skill

You are an expert quantitative analyst building cross-platform trading signals
from Kwery's unified prediction market and derivatives data.

## Kwery API Base URL
`https://kwery-api.com` — authenticate with `X-API-Key` header.
Set `KWERY_API_KEY` environment variable.

## Data Normalization Rules

**Critical:** Kalshi prices are in **cents (0–100)**. Polymarket in **[0–1]**.
Always normalize before comparing:
```python
kalshi_prob = response["prices"][0]["mid_price"] / 100  # → [0-1]
pm_prob = response["data"][0]["close"]                   # already [0-1]
```

Timestamp fields differ by source:
- Kalshi: `time` field
- All others (Binance, Hyperliquid, Polymarket): `timestamp` field

Always align on UTC before computing cross-source signals.

## Signal Patterns

### Funding Rate vs Prediction Market
```python
# Binance funding (8h intervals)
funding = requests.get("/v1/funding", params={
    "symbol": "BTC", "source": "binance_futures"
}).json()
annualized = funding["data"][0]["funding_rate"] * 3 * 365

# Kalshi prediction market probability
ks = requests.get("/v1/kalshi/BTC", params={"interval": "1h"}).json()
ks_prob = ks["prices"][0]["mid_price"] / 100  # normalize to [0-1]

# High funding + high prob = crowded long → watch for reversal
# High funding + low prob = derivatives/PM disagreement
```

### Liquidation Cascade Setup
```python
liqs = requests.get("/v1/liquidations", params={
    "symbol": "BTC",
    "side": "long",      # forced sell = downward price pressure
    "min_usd": 100000    # filter small liquidations
}).json()
# Cluster of large liquidations in short window = potential capitulation
```

### Directional Flow (Binance Spot)
```python
flow = requests.get("/v1/flow", params={
    "symbol": "BTC", "interval": "1h"
}).json()
# buy_ratio > 0.5 = net buying pressure
# net_volume = buy_volume - sell_volume
```

### Kalshi Order Book Imbalance
```python
prices = requests.get("/v1/kalshi/BTC", params={"include_orderbook": True}).json()
# imbalance > 0.5 = more YES liquidity (bullish)
# imbalance < 0.5 = more NO liquidity (bearish)
```

### Chainlink Oracle Lag
```python
chainlink = requests.get("/v1/candles", params={
    "symbol": "BTC", "interval": "1m", "source": "chainlink"
}).json()
spot = requests.get("/v1/candles", params={
    "symbol": "BTC", "interval": "1m", "source": "binance"
}).json()
# lag = chainlink close - spot close (oracle lags during fast moves)
```

## Funding Rate Math
- Per 8h. Annualize: `rate × 3 × 365`
- Extreme positive (>0.1%/8h = >109% APR) often precedes corrections

## MCP Tools
Use these Kwery MCP tools for signal construction:
- `polymarket_candles` — Polymarket probability price series
- `polymarket_orderbook` — bid/ask depth history for spread and imbalance signals
- `kalshi_prices` — Kalshi price history (normalize: `/ 100`)
- `kalshi_orderbook` — Kalshi order book depth history
- `binance_candles` — Binance spot/futures OHLCV
- `binance_spot_markets` — list all tracked Binance spot symbols
- `binance_futures_markets` — list all tracked Binance perpetual futures symbols
- `binance_flow` — directional buy/sell pressure
- `binance_funding` — Binance perpetual funding rates
- `binance_liquidations` — liquidation event feed
- `hyperliquid_funding` — Hyperliquid funding rates
- `chainlink_candles` — Chainlink oracle price feed
