# kwery-cli

CLI for [Kwery](https://kwery.xyz) — unified crypto and prediction market data
across Polymarket, Kalshi, Hyperliquid, Binance, and Chainlink.

76 commands. Outputs JSON, CSV, or table. Pipes cleanly into Python/pandas.

## Install

```bash
npm install -g kwery-cli
```

## Setup

```bash
kwery login your_api_key_here
kwery limits
```

Get your API key at [kwery.xyz/dashboard](https://kwery.xyz/dashboard).

## Quick Examples

```bash
# Polymarket candles — pipe to CSV
kwery polymarket candles BTC 1h --format csv > btc_polymarket.csv

# Kalshi probability history
kwery kalshi prices BTC --interval 1h --format json

# Binance funding rates
kwery binance funding BTC --start 2024-01-01T00:00:00Z --format csv

# Hyperliquid liquidations
kwery binance liquidations BTC --side long --min-usd 100000

# Check ingestion health
kwery status
```

## Commands

```
kwery login <key>          Save API key
kwery limits               Show plan, credits, features
kwery status               Ingestion health

kwery sources              Available data sources
kwery symbols              Available symbols

kwery polymarket markets   List Polymarket markets
kwery polymarket candles   OHLCV candles
kwery polymarket trades    Trade ticks
kwery polymarket snapshots Order book history
kwery polymarket snapshot-at  Point-in-time order book

kwery kalshi markets       List Kalshi markets
kwery kalshi prices        Probability price history
kwery kalshi snapshots     Snapshot history

kwery hyperliquid candles  OHLCV with funding + OI
kwery hyperliquid funding  Funding rate history
kwery hyperliquid oi       Open interest history
kwery hyperliquid trades   Trade ticks

kwery binance candles      Spot + futures OHLCV
kwery binance flow         Directional buy/sell pressure
kwery binance funding      Futures funding rates
kwery binance oi           Futures open interest
kwery binance liquidations Liquidation events
kwery binance ticker       1-second bid/ask (Pro+)
```

All data commands support `--format json|csv|table`, `--limit`, `--start`, `--end`,
and `--after` for cursor pagination.

## Requirements

- Node.js 20+
- Kwery API key ([free tier available](https://kwery.xyz))

## Links

- [Full docs](https://kwery.xyz/docs/cli)
- [GitHub](https://github.com/KweryAPI/kwery-agents)
- [Pricing](https://kwery.xyz/pricing)