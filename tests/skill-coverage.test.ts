import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");

// Tools each skill claims to use — verify they're actually mentioned
const SKILL_TOOL_REQUIREMENTS: Record<string, string[]> = {
  backtest: [
    "kwery_limits",
    "polymarket_markets",
    "polymarket_candles",
    "polymarket_snapshot_at",
    "kalshi_markets",
    "kalshi_prices",
    "kalshi_snapshot_at",
  ],
  signal: [
    "polymarket_candles",
    "kalshi_prices",
    "binance_candles",
    "binance_flow",
    "binance_funding",
    "binance_liquidations",
    "hyperliquid_funding",
    "chainlink_candles",
  ],
  derivatives: [
    "binance_funding",
    "binance_oi",
    "binance_liquidations",
    "hyperliquid_funding",
    "hyperliquid_oi",
  ],
  research: [
    "kwery_limits",
    "kwery_markets",
    "polymarket_markets",
    "polymarket_market",
    "polymarket_candles",
  ],
};

// Check across all skill locations
const SKILL_DIRS = [
  "kwery-skills",
  ".agents/skills",
  "kwery-plugin/skills",
];

SKILL_DIRS.forEach((dir) => {
  describe(`${dir} — tool coverage`, () => {
    Object.entries(SKILL_TOOL_REQUIREMENTS).forEach(([skill, tools]) => {
      tools.forEach((toolName) => {
        it(`${skill} mentions ${toolName}`, () => {
          const content = readFileSync(
            resolve(REPO_ROOT, `${dir}/${skill}/SKILL.md`),
            "utf8"
          );
          expect(content).toContain(toolName);
        });
      });
    });
  });
});

// Critical API pattern coverage
describe("kwery-skills — critical API patterns", () => {
  it("backtest skill includes /v1/polymarket/candles endpoint", () => {
    const content = readFileSync(
      resolve(REPO_ROOT, "kwery-skills/backtest/SKILL.md"), "utf8"
    );
    expect(content).toMatch(/polymarket\/candles|polymarket_candles/);
  });

  it("backtest skill warns against using candle close as fill price", () => {
    const content = readFileSync(
      resolve(REPO_ROOT, "kwery-skills/backtest/SKILL.md"), "utf8"
    );
    expect(content).toMatch(/snapshot|fill|bid|ask/i);
  });

  it("signal skill includes cross-platform normalization", () => {
    const content = readFileSync(
      resolve(REPO_ROOT, "kwery-skills/signal/SKILL.md"), "utf8"
    );
    expect(content).toMatch(/\/\s*100|normalize|cents/i);
  });

  it("derivatives skill includes funding annualization formula", () => {
    const content = readFileSync(
      resolve(REPO_ROOT, "kwery-skills/derivatives/SKILL.md"), "utf8"
    );
    expect(content).toMatch(/3\s*[×*]\s*365|365.*3/);
  });

  it("research skill includes resolution field documentation", () => {
    const content = readFileSync(
      resolve(REPO_ROOT, "kwery-skills/research/SKILL.md"), "utf8"
    );
    expect(content).toContain("winner");
    expect(content).toContain("resolved_at");
  });
});
