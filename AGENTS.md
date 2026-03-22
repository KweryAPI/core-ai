# Kwery Agents

This repo contains the official Kwery AI tooling — MCP server, CLI, and skills
for unified crypto and prediction market data across Polymarket, Kalshi,
Hyperliquid, Binance, and Chainlink.

> Claude Code users: see `CLAUDE.md` for Claude-specific instructions.
> Cursor users: see `kwery-cursor/README.md` for Cursor setup.

## Packages

| Package | Description |
|---------|-------------|
| `kwery-mcp/` | MCP server — published as `kwery-mcp` on npm |
| `kwery-cli/` | CLI — published as `kwery-cli` on npm |
| `kwery-skills/` | Standalone Claude Code skills (Markdown, no build) |
| `kwery-plugin/` | Claude Code plugin (bundles MCP + skills + commands) |
| `kwery-cursor/` | Cursor plugin (`.mdc` rules + MCP config) |

## Package Manager

This repo uses **pnpm** with workspaces.

```bash
npm install -g pnpm   # if not already installed
pnpm install          # install all dependencies
```

## Build

```bash
pnpm build            # build all packages
pnpm dev              # watch mode (all packages)
pnpm typecheck        # type-check all packages
```

## Test

```bash
pnpm test             # unit + integration tests (no API key needed)
pnpm test:coverage    # with coverage report
```

Smoke tests require a real API key:
```bash
KWERY_API_KEY=your_key pnpm test:smoke     # MCP tools against real API
KWERY_API_KEY=your_key pnpm smoke:cli      # CLI commands against real API
```

## Environment

Copy `.env.example` to `.env` and fill in your key:
```bash
cp .env.example .env
```

Required variables:
- `KWERY_API_KEY` — your Kwery API key from https://kwery.xyz/dashboard
- `KWERY_BASE_URL` — optional, overrides API base URL for local dev

## Skills

Four skills are available for any agent working in this repo.
They teach the correct patterns for using the Kwery API.

| Skill | When to use |
|-------|-------------|
| `backtest` | Building point-in-time accurate backtests on prediction markets |
| `signal` | Constructing cross-platform trading signals |
| `derivatives` | Analyzing funding rates, OI, and liquidation events |
| `research` | Studying historical prediction market data and resolutions |

**Claude Code** — skills install to `~/.claude/skills/` via `kwery-skills/*/install.sh`
**Codex CLI** — skills are auto-discovered from `.agents/skills/` in this repo
**Cursor** — rules install via `bash kwery-cursor/install.sh`
**OpenAI / Claude API** — use system prompt variants in `kwery-skills/*/prompts/`

## Key Conventions

- All API calls go to `https://kwery-api.com` via the `KweryClient` in `kwery-mcp/src/client.ts`
- Never hardcode API keys — always use `KWERY_API_KEY` environment variable
- All paginated endpoints use cursor-based pagination via `after` param
- Polymarket candles require `token_id` for a single backtestable series
- Kalshi prices are in cents (0–100), not probabilities — divide by 100 to normalize
- Tier gate errors (403) include an upgrade URL at `https://kwery.xyz/pricing`

## Node.js Requirements

Node.js 20+ required. Check with:
```bash
node --version
```

## MCP Server (local testing)

```bash
cd kwery-mcp
pnpm build
claude mcp add kwery node $(pwd)/dist/index.js   # Claude Code
# or add to ~/.cursor/mcp.json for Cursor
```
