---
description: Set up Kwery API key and verify connection
---

Check that the Kwery MCP server is connected and the API key is valid.

1. Call `kwery_limits` — if it returns a plan and credits, the setup is complete.
2. If it returns an auth error, remind the user to set `KWERY_API_KEY` in their environment.
3. Call `kwery_sources` to show all available data sources and symbols.

Display:
- Plan tier (free / pro / business)
- Credits remaining
- Available sources and symbols in a table

If not configured, print: "Set `KWERY_API_KEY=your_key` and restart Claude Code. Get a key at https://kwery.xyz/dashboard"
