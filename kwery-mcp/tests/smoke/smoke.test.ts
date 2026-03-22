/**
 * Smoke tests — hit the real kwery-api.com with a live API key.
 *
 * These are NOT run in CI. Run manually before a release or when
 * debugging a production issue:
 *
 *   KWERY_API_KEY=your_key pnpm vitest run tests/smoke
 */

import { describe, it, expect, beforeAll } from "vitest";
import { KweryClient } from "../../src/client.js";

const SKIP = !process.env.KWERY_API_KEY;

describe.skipIf(SKIP)("Smoke — HTTP client against real API", () => {
  // Defer instantiation so the constructor doesn't throw during collection
  // when KWERY_API_KEY is absent and the suite is being skipped.
  let client: KweryClient;
  beforeAll(() => { client = new KweryClient(); });

  it("GET /v1/limits returns plan and credits", async () => {
    const data: any = await client.get("/v1/limits");
    expect(data).toHaveProperty("plan");
    expect(data).toHaveProperty("credits");
    expect(data.credits).toHaveProperty("remaining");
  });

  it("GET /v1/sources returns non-empty sources array", async () => {
    const data: any = await client.get("/v1/sources");
    expect(data.sources).toBeInstanceOf(Array);
    expect(data.sources.length).toBeGreaterThan(0);
  });

  it("GET /v1/symbols returns known symbols", async () => {
    const data: any = await client.get("/v1/symbols");
    expect(data.symbols).toBeInstanceOf(Array);
    const names = data.symbols.map((s: any) => s.symbol);
    expect(names).toContain("BTC");
  });

  it("GET /v1/markets returns Polymarket markets for BTC", async () => {
    const data: any = await client.get("/v1/markets", {
      source: "polymarket",
      symbol: "BTC",
      limit: 3,
    });
    // Accept either { data: [...] } or { markets: [...] } response shapes
    const rows: any[] = data.data ?? data.markets ?? [];
    expect(Array.isArray(rows)).toBe(true);
    if (rows.length > 0) {
      expect(rows[0]).toHaveProperty("condition_id");
      expect(rows[0]).toHaveProperty("slug");
    }
  });

  it("GET /v1/polymarket/candles returns OHLCV rows", async () => {
    const data: any = await client.get("/v1/polymarket/candles", {
      symbol: "BTC",
      interval: "1h",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
    if (data.data.length > 0) {
      const row = data.data[0];
      expect(row).toHaveProperty("timestamp");
      expect(row).toHaveProperty("open");
      expect(row).toHaveProperty("high");
      expect(row).toHaveProperty("low");
      expect(row).toHaveProperty("close");
      expect(row).toHaveProperty("volume");
      expect(row.symbol).toBe("BTC");
      expect(row.source).toBe("polymarket");
    }
  });

  it("GET /v1/candles with source=binance returns OHLCV rows", async () => {
    const data: any = await client.get("/v1/candles", {
      symbol: "BTC",
      interval: "1h",
      source: "binance",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
  });

  it("GET /v1/kalshi/BTC returns prices array", async () => {
    const data: any = await client.get("/v1/kalshi/BTC", { limit: 3 });
    expect(data).toHaveProperty("prices");
    expect(data.prices).toBeInstanceOf(Array);
  });

  it("GET /v1/hyperliquid/BTC returns candles array", async () => {
    const data: any = await client.get("/v1/hyperliquid/BTC", { limit: 3 });
    expect(data).toHaveProperty("candles");
    expect(data.candles).toBeInstanceOf(Array);
  });

  it("GET /v1/funding with source=binance_futures returns rows", async () => {
    const data: any = await client.get("/v1/funding", {
      symbol: "BTC",
      source: "binance_futures",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
  });

  it("GET /v1/open-interest with source=binance_futures returns rows", async () => {
    const data: any = await client.get("/v1/open-interest", {
      symbol: "BTC",
      source: "binance_futures",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
  });

  it("GET /v1/liquidations returns rows", async () => {
    const data: any = await client.get("/v1/liquidations", {
      symbol: "BTC",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
  });

  it("GET /v1/flow returns directional flow rows", async () => {
    const data: any = await client.get("/v1/flow", {
      symbol: "BTC",
      interval: "1h",
      limit: 3,
    });
    expect(data.data).toBeInstanceOf(Array);
    if (data.data.length > 0) {
      expect(data.data[0]).toHaveProperty("buy_volume");
      expect(data.data[0]).toHaveProperty("sell_volume");
      expect(data.data[0]).toHaveProperty("buy_ratio");
    }
  });

  it("GET /v1/status returns ingestion health", async () => {
    const data: any = await client.get("/v1/status");
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("ingestion");
  });

  it("returns 401 error for invalid API key", async () => {
    const badClient = new KweryClient("definitely_not_a_real_key");
    await expect(badClient.get("/v1/limits")).rejects.toThrow(
      "Invalid or missing API key"
    );
  });
});
