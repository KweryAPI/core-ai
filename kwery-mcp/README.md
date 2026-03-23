# kwery-mcp

MCP server for [Kwery](https://kwery.xyz) — unified crypto and prediction market
data across Polymarket, Kalshi, Hyperliquid, Binance, and Chainlink.

30 tools. No setup beyond an API key.

## Install

Add to your Claude Code config:

```bash
claude mcp add kwery npx kwery-mcp@latest
```

Or add to `~/.claude.json` / Claude Desktop config manually:

```json
{
  "mcpServers": {
    "kwery": {
      "command": "npx",
      "args": ["-y", "kwery-mcp@latest"],
      "env": {
        "KWERY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Get your API key at [kwery.xyz/dashboard](https://kwery.xyz/dashboard).

## Tools (30)

| Platform | Tools |
|----------|-------|
| Discovery | `kwery_sources` `kwery_limits` `kwery_status` |
| Markets | `kwery_markets` `kwery_market` |
| Polymarket | `polymarket_markets` `polymarket_market` `polymarket_candles` `polymarket_trades` `polymarket_snapshots` `polymarket_snapshot_at` |
| Kalshi | `kalshi_markets` `kalshi_prices` `kalshi_orderbook` `kalshi_snapshots` `kalshi_snapshot_at` |
| Hyperliquid | `hyperliquid_markets` `hyperliquid_candles` `hyperliquid_trades` `hyperliquid_funding` `hyperliquid_oi` `hyperliquid_snapshots` `hyperliquid_snapshot_at` |
| Binance | `binance_candles` `chainlink_candles` `binance_ticker` `binance_flow` `binance_funding` `binance_oi` `binance_liquidations` |

## Requirements

- Node.js 20+
- Kwery API key ([free tier available](https://kwery.xyz))

## Links

- [Full docs](https://kwery.xyz/docs/mcp)
- [API reference](https://kwery-api.com/docs)
- [GitHub](https://github.com/KweryAPI/core-ai)
- [Pricing](https://kwery.xyz/pricing)