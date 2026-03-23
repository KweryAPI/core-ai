# Kwery — Crypto & Prediction Market Data for Claude Code

Kwery gives Claude Code live and historical data across Polymarket, Kalshi,
Hyperliquid, Binance, and Chainlink — all through a single API key.

30 MCP tools. 4 domain skills. 4 slash commands. No setup beyond a key.

---

## What You Can Do

### Backtest prediction market strategies
Pull point-in-time order book snapshots and OHLCV probability series for
Polymarket and Kalshi. Build strategies that avoid look-ahead bias — Claude
uses snapshot_at tools for fills and candles for price series, exactly the
way a production backtest engine would.

> "Backtest a momentum strategy on Polymarket BTC markets for Q1 2024.
> Use 1h candles and execute fills at the mid-price from order book snapshots."

### Build cross-platform trading signals
Combine Binance perpetual funding rates, Hyperliquid open interest, and
Kalshi/Polymarket probabilities into a single signal. Claude knows how to
normalize Kalshi cents to [0–1], align timestamps across sources, and flag
funding/prediction market divergence as a mean-reversion candidate.

> "Is Binance BTC funding elevated relative to the current Polymarket
> probability? Annualize the funding rate and flag if it exceeds 100% APR."

### Analyze derivatives positioning
Fetch funding rates, open interest, and liquidation events across Binance
and Hyperliquid. Detect crowded positioning, OI divergence from price, and
liquidation cascade setups in a single conversation.

> "Show me Binance ETH open interest vs price for the last 30 days.
> Flag any divergences where OI rose while price fell."

### Research prediction market history
Discover, filter, and analyze historical Polymarket and Kalshi markets.
Compare prediction consensus against realized outcomes. Study how specific
events moved probability over time.

> "Find all Kalshi markets related to Fed rate decisions in 2023.
> How accurate were the final market probabilities vs the actual outcomes?"

### Check data freshness and plan limits
Before any heavy data pull, verify ingestion health and remaining credits.

> "What's my current plan and how many API credits do I have left?
> Is Polymarket candle data up to date?"

---

## MCP Tools (30)

| Category | Tools |
|----------|-------|
| Discovery | `kwery_sources` `kwery_limits` `kwery_status` |
| Markets | `kwery_markets` `kwery_market` |
| Polymarket | `polymarket_markets` `polymarket_market` `polymarket_candles` `polymarket_trades` `polymarket_snapshots` `polymarket_snapshot_at` |
| Kalshi | `kalshi_markets` `kalshi_prices` `kalshi_orderbook` `kalshi_snapshots` `kalshi_snapshot_at` |
| Hyperliquid | `hyperliquid_markets` `hyperliquid_candles` `hyperliquid_trades` `hyperliquid_funding` `hyperliquid_oi` `hyperliquid_snapshots` `hyperliquid_snapshot_at` |
| Binance | `binance_candles` `chainlink_candles` `binance_ticker` `binance_flow` `binance_funding` `binance_oi` `binance_liquidations` |

---

## Skills (4)

Skills are reasoning guides loaded into Claude's context. They teach Claude
the data quirks, normalization rules, and API patterns specific to each
workflow — so you don't have to explain them every time.

| Skill | When it activates |
|-------|------------------|
| **backtest** | Building or evaluating prediction market trading strategies |
| **signal** | Constructing cross-platform signals from derivatives + PM data |
| **derivatives** | Analyzing funding rates, open interest, or liquidation flows |
| **research** | Studying historical markets, resolutions, and event-driven moves |

---

## Commands (4)

| Command | Description |
|---------|-------------|
| `/setup` | Verify API key and confirm MCP server connection |
| `/limits` | Show plan tier, credits used/remaining, and feature access |
| `/status` | Check data ingestion health for all sources |
| `/explore` | Browse available data sources, symbols, and markets |

---

## Setup

### 1. Get an API key

Sign up at [kwery.xyz](https://kwery.xyz) — free tier available.

### 2. Add the MCP server

```bash
claude mcp add -e KWERY_API_KEY=your_key_here kwery -- npx -y kwery-mcp@latest
```

### 3. Verify it works

Run `/setup` in Claude Code, or ask:

> "Run kwery_limits and show me my plan details."

---

## Requirements

- Node.js 20+
- Kwery API key ([kwery.xyz/dashboard](https://kwery.xyz/dashboard))

---

## Links

- [Documentation](https://kwery.xyz/docs/mcp)
- [API reference](https://kwery-api.com/docs)
- [Pricing](https://kwery.xyz/pricing)
- [GitHub](https://github.com/KweryAPI/core-ai)
- [npm (kwery-mcp)](https://npmjs.com/package/kwery-mcp)
