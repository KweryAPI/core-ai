# kwery-plugin

Claude Code plugin for Kwery AI — adds MCP tools, skills, and slash commands for market data analysis directly in Claude Code.

## What's Included

- **MCP server** — all Kwery tools available as Claude Code MCP tools
- **4 skills** — guided workflows for candles, backtesting, funding analysis, and order book snapshots
- **4 commands** — quick slash commands for markets, limits, status, and sources

## Installation

### 1. Get an API key

Sign up at [kwery.xyz](https://kwery.xyz) and copy your API key from the dashboard.

### 2. Install the plugin

```bash
# From the repo root
claude plugin add ./kwery-plugin

# Or install directly from npm (once published)
claude plugin add kwery-plugin
```

### 3. Set your API key

```bash
export KWERY_API_KEY=your_key_here
```

Or add it to your `.env` file:

```
KWERY_API_KEY=your_key_here
```

## Skills

| Skill | Description |
|-------|-------------|
| `/kwery-candles` | Fetch OHLCV candle data from Binance, Chainlink, or Polymarket |
| `/kwery-backtest` | Run a point-in-time backtest with look-ahead bias prevention |
| `/kwery-funding` | Analyze perpetual funding rates and open interest |
| `/kwery-snapshots` | Fetch L2 order book depth snapshots |

## Commands

| Command | Description |
|---------|-------------|
| `/kwery-markets` | List Polymarket and Kalshi prediction markets |
| `/kwery-limits` | Check plan tier and remaining credits |
| `/kwery-status` | Check data ingestion health |
| `/kwery-sources` | List all available data sources and intervals |

## MCP Tools

The plugin registers the full `kwery-mcp` server. All tools are prefixed by platform:

- `kwery_*` — discovery and account tools
- `polymarket_*` — Polymarket prediction markets
- `kalshi_*` — Kalshi binary event markets
- `hyperliquid_*` — Hyperliquid perpetuals
- `binance_*` — Binance spot and futures

See [kwery.xyz/docs](https://kwery.xyz/docs) for full tool reference.
