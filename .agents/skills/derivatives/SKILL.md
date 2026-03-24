---
name: derivatives
description: Funding rate, open interest, and liquidation analysis across Binance and Hyperliquid using Kwery data. Use when researching carry trades, OI divergence from price, or liquidation cascade patterns.
---

# Kwery Derivatives Skill

You are an expert derivatives analyst using Kwery to research funding rates,
open interest, and liquidation dynamics across Binance and Hyperliquid.

## Kwery API Base URL
`https://kwery-api.com` — authenticate with `X-API-Key` header.
Set `KWERY_API_KEY` environment variable.

## Endpoints

| Data | Endpoint | source param |
|------|----------|-------------|
| Funding rates | `GET /v1/funding` | `binance_futures` or `hyperliquid` |
| Open interest | `GET /v1/open-interest` | `binance_futures` or `hyperliquid` |
| Liquidations | `GET /v1/liquidations` | Binance only |
| Futures OHLCV | `GET /v1/candles` | `binance_futures` |
| HL OHLCV+funding+OI | `GET /v1/hyperliquid/{symbol}` | — |

## Funding Rates

```python
# Binance — 8h settlement
funding = requests.get("/v1/funding", params={
    "symbol": "BTC",
    "source": "binance_futures",
    "start": "2024-01-01T00:00:00Z"
}).json()

# Annualize
rates = [r["funding_rate"] for r in funding["data"]]
annualized = (sum(rates) / len(rates)) * 3 * 365

# Hyperliquid — compare with Binance
hl_funding = requests.get("/v1/hyperliquid/funding", params={"symbol": "BTC"}).json()
# HL rate > Binance = HL longs more crowded
```

## Open Interest

```python
oi = requests.get("/v1/open-interest", params={
    "symbol": "BTC",
    "source": "binance_futures",
    "interval": "1h"
}).json()
```

Interpretation:
- Rising OI + rising price → trend confirmation (new longs)
- Rising OI + falling price → trend confirmation (new shorts)
- Falling OI + rising price → short covering (weaker signal)
- Falling OI + falling price → position unwinding

## Liquidations

```python
liqs = requests.get("/v1/liquidations", params={
    "symbol": "BTC",
    "side": "long",     # "long" = forced sell, "short" = forced buy
    "min_usd": 500000   # Business plan only
}).json()

for liq in liqs["data"]:
    print(f"{liq['timestamp']} | ${liq['usd_value']:,.0f} | {liq['side']}")
```

## Hyperliquid Candles Include Funding + OI Per Bar

```python
candles = requests.get("/v1/hyperliquid/BTC", params={"interval": "1h"}).json()
for c in candles["candles"]:
    print(c["time"], c["close"], c["funding_rate"], c["open_interest"])
```

## Tier Requirements
- Funding/OI: Free 7d · Pro 14d · Business 31d
- Liquidations: Free 24h · Pro 14d · Business 31d
- `min_usd` filter on liquidations: Business plan only

## MCP Tools
Use these Kwery MCP tools for derivatives research:
- `binance_funding` — Binance perpetual funding rate history
- `binance_oi` — Binance open interest history
- `binance_liquidations` — Binance liquidation events
- `hyperliquid_funding` — Hyperliquid funding rate history
- `hyperliquid_oi` — Hyperliquid open interest history
