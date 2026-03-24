---
name: research
description: Prediction market research and historical resolution analysis using Kwery data. Use when studying historical Polymarket or Kalshi markets, analyzing resolution accuracy, or comparing prediction consensus vs realized outcomes.
---

# Kwery Research Skill

You are an expert prediction market researcher using Kwery to analyze
historical market data, resolution patterns, and event-driven price behavior.

## Kwery API Base URL
`https://kwery-api.com` — authenticate with `X-API-Key` header.
Set `KWERY_API_KEY` environment variable.

## Always Check Credits First

```python
limits = requests.get("/v1/limits", headers={"X-API-Key": api_key}).json()
print(f"Plan: {limits['plan']}, Credits: {limits['credits']['remaining']}")
```

## Market Discovery

```python
# Cross-platform — Polymarket + Kalshi
markets = requests.get("/v1/markets", params={
    "source": "polymarket",  # or "kalshi", or omit for both
    "symbol": "BTC",
    "active": False,         # False = resolved markets only
    "limit": 50
}).json()
```

## Resolved Market Fields (Polymarket)

```python
for market in markets["data"]:
    print({
        "slug": market["slug"],
        "winner": market["winner"],           # "Up" or "Down"
        "resolved_at": market["resolved_at"],
        "final_volume": market["final_volume"],
        "btc_price_start": market["btc_price_start"],
        "btc_price_end": market["btc_price_end"],
    })

# Find mispriced markets (high prob, wrong outcome)
mispriced = [
    m for m in markets["data"]
    if m["winner"] == "Down" and m.get("final_prob_up", 0) > 0.7
]
```

## Event-Driven Price Study

```python
# Get a specific market
market = requests.get("/v1/markets/btc-updown-1h-1710759600").json()

# Price history for the Up leg
candles = requests.get("/v1/polymarket/candles", params={
    "symbol": "BTC",
    "interval": "5m",
    "token_id": market["clob_token_up"]  # single price series
}).json()
# Prices converge to 1.0 (Up wins) or 0.0 (Down wins) at expiry
```

## Cross-Platform Comparison

```python
# Polymarket probability [0-1]
pm = requests.get("/v1/polymarket/candles", params={
    "symbol": "BTC", "interval": "1h", "token_id": "..."
}).json()
pm_prob = pm["data"][0]["close"]

# Kalshi probability — normalize from cents to [0-1]
ks = requests.get("/v1/kalshi/BTC", params={"interval": "1h"}).json()
ks_prob = ks["prices"][0]["mid_price"] / 100

divergence = pm_prob - ks_prob
print(f"PM prob: {pm_prob:.2f}, Kalshi prob: {ks_prob:.2f}, divergence: {divergence:+.2f}")
```

## Order Book Depth Over Time

```python
snapshots = requests.get("/v1/polymarket/snapshots", params={
    "symbol": "BTC",
    "interval": "1h",
    "include_orderbook": True,
    "depth": 10,
    "limit": 100
}).json()

for snap in snapshots["data"]:
    print(snap["timestamp"], snap["mid_price"], snap["spread"])
    # snap["bids"] and snap["asks"] contain full depth arrays
```

## Data Notes
- All timestamps UTC
- `active=false` → resolved markets only, `active=true` → live only
- Kalshi prices: cents (0-100). Polymarket prices: probabilities [0-1]
- `winner` on resolved Polymarket markets: "Up" or "Down"

## MCP Tools
Use these Kwery MCP tools for prediction market research:
- `kwery_limits` — check plan and credits before bulk pulls
- `kwery_markets` — cross-platform market discovery (Polymarket + Kalshi)
- `polymarket_markets` — list Polymarket markets with resolution data
- `polymarket_market` — fetch a single market by slug or condition_id
- `polymarket_candles` — OHLCV probability series for a market
- `polymarket_orderbook` — paginated bid/ask depth history (spread, slippage, imbalance)
- `kalshi_orderbook` — Kalshi order book depth history
- `binance_spot_markets` — list all tracked Binance spot symbols
- `binance_futures_markets` — list all tracked Binance perpetual futures symbols
