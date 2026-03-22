# kwery-cursor

Cursor plugin for Kwery AI — adds MCP tools and agent rules for market data analysis in Cursor.

## What's Included

- **`.cursor/mcp.json`** — registers `kwery-mcp` as a Cursor MCP server
- **5 agent rules** — context-specific rules for candles, backtesting, funding, Polymarket, and snapshots

## Installation

### Option A: Copy into your project

```bash
bash kwery-cursor/install.sh /path/to/your/project
```

Or from the repo root to install into the current directory:

```bash
bash kwery-cursor/install.sh
```

### Option B: Manual copy

```bash
cp -r kwery-cursor/.cursor /path/to/your/project/
```

### 2. Set your API key

```bash
export KWERY_API_KEY=your_key_here
```

Or add it to your project's `.env`:

```
KWERY_API_KEY=your_key_here
```

### 3. Restart Cursor

Cursor loads MCP servers on startup. Restart to activate the `kwery` MCP server.

Get an API key at [kwery.xyz/dashboard](https://kwery.xyz/dashboard).

## Agent Rules

| Rule | When to Use |
|------|-------------|
| `kwery-candles` | Fetching OHLCV candle data |
| `kwery-backtest` | Point-in-time backtesting |
| `kwery-funding` | Funding rates and open interest |
| `kwery-polymarket` | Polymarket prediction markets |
| `kwery-snapshots` | L2 order book depth snapshots |

Rules are off by default (`alwaysApply: false`). Reference them in your Cursor prompt with `@kwery-backtest` etc., or enable `alwaysApply: true` for rules you use constantly.

## MCP Tools

Once installed, all `kwery-mcp` tools are available in Cursor Agent:

- `kwery_*` — discovery and account (sources, limits, status)
- `polymarket_*` — Polymarket prediction markets
- `kalshi_*` — Kalshi binary event markets
- `hyperliquid_*` — Hyperliquid perpetuals
- `binance_*` — Binance spot and futures

See [kwery.xyz/docs](https://kwery.xyz/docs) for the full tool reference.
