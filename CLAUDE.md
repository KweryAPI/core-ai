# Kwery Agents — Claude Code Instructions

> For universal agent instructions (Codex, Copilot, Jules, etc.), see `AGENTS.md`.
> Codex CLI users: skills are auto-discovered from `.agents/skills/`.

This repo contains the official Kwery AI tooling monorepo.

## Structure
- `kwery-mcp/` — MCP server (TypeScript, @modelcontextprotocol/sdk)
- `kwery-cli/` — CLI (TypeScript, commander)
- `kwery-skills/` — Claude Code skills (Markdown, no build)
- `kwery-plugin/` — Claude Code plugin (MCP config + skills + commands, no build)
- `kwery-cursor/` — Cursor plugin (MCP config + .mdc agent rules, no build)

## Commands

### Build & Type-check
- `pnpm build` — build all packages
- `pnpm dev` — watch mode
- `pnpm typecheck` — type-check all packages

### Testing
- `pnpm test` — unit + integration tests across all packages (no API key needed)
- `pnpm test:structure` — validate repo structure, skill files, JSON configs, AGENTS.md
- `pnpm test:coverage` — tests with coverage report
- `pnpm test:install` — verify all install.sh scripts work in temp directories

### Master test runner
- `pnpm test:all` — typecheck + build + all unit/integration/structure tests
- `KWERY_API_KEY=your_api_key pnpm test:all:smoke` — above + MCP smoke tests against real API
- `KWERY_API_KEY=your_api_key pnpm test:all:full` — above + CLI smoke tests against real API

### Smoke & fixtures (real API)
- `KWERY_API_KEY=your_api_key pnpm test:smoke` — MCP tools against real API
- `KWERY_API_KEY=your_api_key pnpm smoke:cli` — CLI against real API
- `KWERY_API_KEY=your_api_key pnpm fixtures:update` — regenerate test fixtures

### Local MCP dev
- `cd kwery-mcp && pnpm build && claude mcp add kwery node $(pwd)/dist/index.js` — test MCP locally

### Security & Release
- `bash scripts/security-check.sh` — check for secrets, run npm audit
- `bash scripts/prepublish-check.sh` — pack + install + verify both packages
- `KWERY_API_KEY=key bash scripts/prepublish-check.sh` — same + live API check
- `pnpm changeset` — describe a change for the next release
- `pnpm version` — apply changesets, bump package versions
- `pnpm release` — publish to npm (runs prepublishOnly, then changeset publish)
- See RELEASE.md for the full release checklist

## Environment Variables

Copy `.env.example` to `.env` at the repo root and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `KWERY_API_KEY` | Yes | Your Kwery API key from kwery.xyz/dashboard |
| `KWERY_BASE_URL` | No | Override API base URL for local dev (default: https://kwery-api.com) |

The `.env` file is loaded automatically by Vitest when running tests.
For the CLI smoke script, either source it first or pass the key inline:

```bash
source .env && pnpm smoke:cli
# or
KWERY_API_KEY=your_key pnpm smoke:cli
```

## Plugins

### kwery-plugin (Claude Code)
- `kwery-plugin/.claude-plugin/plugin.json` — plugin manifest; lists MCP config, skills, commands
- `kwery-plugin/.mcp.json` — MCP server config using `npx kwery-mcp`
- `kwery-plugin/skills/` — Markdown skill files (same format as `kwery-skills/`)
- `kwery-plugin/commands/` — Markdown slash command files with `description:` frontmatter
- No build step; files are plain Markdown + JSON

### kwery-cursor (Cursor)
- `kwery-cursor/.cursor/mcp.json` — MCP server config for Cursor (installed to project `.cursor/`)
- `kwery-cursor/rules/` — `.mdc` agent rule files with YAML frontmatter (`description`, `globs`, `alwaysApply`)
- `kwery-cursor/install.sh` — copies MCP config and rules into any target project directory
- No build step; copy `.cursor/` into the target project and restart Cursor

## Important Rules
- The shared HTTP client lives in `kwery-mcp/src/client.ts`
- Never hardcode API keys — always use `process.env.KWERY_API_KEY`
- Base URL: `https://kwery-api.com` with env override `KWERY_BASE_URL` for local dev
- All tools use Zod for input validation
- All paginated responses use cursor-based pagination via `after` param
- Tier gate errors (403) must surface cleanly to the user with the upgrade URL
- Tests use msw to intercept fetch — never hit the real API in tests
- Fixtures in `tests/fixtures/` must match real API response shapes exactly
