/**
 * MCP tool smoke tests — exercise real tool handlers against live API.
 *
 * Run manually:
 *   KWERY_API_KEY=your_key pnpm vitest run tests/smoke
 */

import { describe, it, expect, beforeAll } from "vitest";
import { KweryClient } from "../../src/client.js";
import { discoveryTools } from "../../src/tools/discovery.js";
import { marketTools } from "../../src/tools/markets.js";
import { polymarketTools } from "../../src/tools/polymarket.js";
import { kalshiTools } from "../../src/tools/kalshi.js";
import { hyperliquidTools } from "../../src/tools/hyperliquid.js";
import { binanceTools } from "../../src/tools/binance.js";

const SKIP = !process.env.KWERY_API_KEY;

// Helper to find a tool by name
const find = (tools: any[], name: string) => {
  const t = tools.find((t) => t.name === name);
  if (!t) throw new Error(`Tool not found: ${name}`);
  return t;
};

describe.skipIf(SKIP)("Smoke — MCP tool handlers against real API", () => {
  let client: KweryClient;
  beforeAll(() => { client = new KweryClient(); });

  // Discovery
  it("kwery_limits returns real plan", async () => {
    const result: any = await find(discoveryTools, "kwery_limits").handler({}, client);
    expect(result.plan).toBeTruthy();
    expect(typeof result.credits.remaining).toBe("number");
  });

  it("kwery_sources returns sources and symbols", async () => {
    const result: any = await find(discoveryTools, "kwery_sources").handler({}, client);
    expect(result.sources).toBeDefined();
    expect(result.symbols).toBeDefined();
  });

  it("kwery_status returns ingestion status", async () => {
    const result: any = await find(discoveryTools, "kwery_status").handler({}, client);
    expect(result.status).toBeTruthy();
  });

  // Markets
  it("kwery_markets returns prediction markets", async () => {
    const result: any = await find(marketTools, "kwery_markets").handler(
      { source: "polymarket", symbol: "BTC", limit: 3 },
      client
    );
    const rows: any[] = result.data ?? result.markets ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  // Polymarket
  it("polymarket_markets returns markets with token IDs", async () => {
    const result: any = await find(polymarketTools, "polymarket_markets").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    const rows: any[] = result.data ?? result.markets ?? [];
    expect(Array.isArray(rows)).toBe(true);
    if (rows.length > 0) {
      expect(rows[0]).toHaveProperty("condition_id");
    }
  });

  it("polymarket_candles returns OHLCV rows", async () => {
    const result: any = await find(polymarketTools, "polymarket_candles").handler(
      { symbol: "BTC", interval: "1h", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("polymarket_trades returns trade ticks", async () => {
    const result: any = await find(polymarketTools, "polymarket_trades").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("polymarket_snapshots returns snapshot rows", async () => {
    const result: any = await find(polymarketTools, "polymarket_snapshots").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  // Kalshi
  it("kalshi_markets returns active markets", async () => {
    const result: any = await find(kalshiTools, "kalshi_markets").handler(
      { symbol: "BTC" },
      client
    );
    expect(result.markets).toBeInstanceOf(Array);
  });

  it("kalshi_prices returns price history", async () => {
    const result: any = await find(kalshiTools, "kalshi_prices").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.prices).toBeInstanceOf(Array);
  });

  // Hyperliquid
  it("hyperliquid_markets returns perpetuals", async () => {
    const result: any = await find(hyperliquidTools, "hyperliquid_markets").handler(
      {},
      client
    );
    expect(result.markets).toBeInstanceOf(Array);
    expect(result.markets.length).toBeGreaterThan(0);
  });

  it("hyperliquid_candles returns OHLCV with funding", async () => {
    const result: any = await find(hyperliquidTools, "hyperliquid_candles").handler(
      { symbol: "BTC", interval: "1h", limit: 3 },
      client
    );
    expect(result.candles).toBeInstanceOf(Array);
  });

  it("hyperliquid_funding returns funding rates", async () => {
    const result: any = await find(hyperliquidTools, "hyperliquid_funding").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  // Binance
  it("binance_candles returns spot OHLCV", async () => {
    const result: any = await find(binanceTools, "binance_candles").handler(
      { symbol: "BTC", interval: "1h", source: "binance", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("chainlink_candles returns oracle price data", async () => {
    const result: any = await find(binanceTools, "chainlink_candles").handler(
      { symbol: "BTC", interval: "1h", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("binance_funding returns funding rates with source=binance_futures", async () => {
    const result: any = await find(binanceTools, "binance_funding").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("binance_liquidations returns liquidation events", async () => {
    const result: any = await find(binanceTools, "binance_liquidations").handler(
      { symbol: "BTC", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });

  it("binance_flow returns directional flow rows", async () => {
    const result: any = await find(binanceTools, "binance_flow").handler(
      { symbol: "BTC", interval: "1h", limit: 3 },
      client
    );
    expect(result.data).toBeInstanceOf(Array);
  });
});
