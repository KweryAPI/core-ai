---
description: Explore available Kwery data sources, symbols, and prediction markets
---

Help the user discover what data is available in Kwery.

1. Call `kwery_sources` — show all data sources (binance, binance_futures, chainlink, polymarket, kalshi, hyperliquid), supported symbols, available intervals, and tier requirements.

2. If the user mentions a specific platform (Polymarket, Kalshi), also call the corresponding markets tool:
   - Polymarket: `polymarket_markets(limit=20)`
   - Kalshi: `kalshi_markets()`

Display sources as a table grouped by platform. Note any endpoints that require Pro or Business tier.
