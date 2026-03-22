# kwery-agents

Official Kwery AI tooling monorepo — MCP server, CLI, and Claude Code skills.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`kwery-mcp`](./kwery-mcp) | MCP server for Claude and Cursor | `kwery-mcp` |
| [`kwery-cli`](./kwery-cli) | CLI for Kwery API | `kwery-cli` |
| [`kwery-skills`](./kwery-skills) | Claude Code skills | n/a |
| [`kwery-plugin`](./kwery-plugin) | Claude Code plugin (MCP + skills + commands) | n/a |
| [`kwery-cursor`](./kwery-cursor) | Cursor plugin (MCP + agent rules) | n/a |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Add MCP server to Claude Code (after build)
cd kwery-mcp && claude mcp add kwery node $(pwd)/dist/index.js
```

## Quick Start — Claude Code Plugin

```bash
# Install plugin into Claude Code
claude plugin add ./kwery-plugin

# Set your API key
export KWERY_API_KEY=your_key_here
```

## Quick Start — Cursor Plugin

```bash
# Copy plugin into your project
bash kwery-cursor/install.sh /path/to/your/project

# Set your API key in .env
echo "KWERY_API_KEY=your_key_here" >> /path/to/your/project/.env

# Restart Cursor to activate the MCP server
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `KWERY_API_KEY` | Your Kwery API key |
| `KWERY_BASE_URL` | Override API base URL (default: `https://kwery-api.com`) |

Get an API key at [kwery.xyz](https://kwery.xyz). See [docs](https://kwery.xyz/docs) for full reference.
