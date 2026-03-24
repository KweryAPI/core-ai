import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { ALL_TOOLS } from "../src/server.js";

const client = new KweryClient("test_key_abc123");

// Helper: run a tool with minimal valid params and return the captured URL
async function callToolAndCaptureUrl(
  toolName: string,
  params: Record<string, unknown>,
  route: string
): Promise<string> {
  let capturedUrl = "";
  server.use(
    http.get(`${BASE}${route}`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    })
  );
  const tool = ALL_TOOLS.find((t) => t.name === toolName);
  if (!tool) throw new Error(`Tool not found: ${toolName}`);
  await (tool as any).handler(params, client);
  return capturedUrl;
}

// ─── Discovery tools ──────────────────────────────────────────────────────────

describe("kwery_limits — route", () => {
  it("calls GET /v1/limits", async () => {
    let called = false;
    server.use(http.get(`${BASE}/v1/limits`, () => {
      called = true;
      return HttpResponse.json({ plan: "free" });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "kwery_limits")!;
    await (tool as any).handler({}, client);
    expect(called).toBe(true);
  });
});

describe("kwery_status — route", () => {
  it("calls GET /v1/status", async () => {
    const url = await callToolAndCaptureUrl(
      "kwery_status", {}, "/v1/status"
    );
    expect(url).toContain("/v1/status");
  });
});

// ─── Polymarket tools ─────────────────────────────────────────────────────────

describe("polymarket_markets — route", () => {
  it("calls GET /v1/markets with source=polymarket", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_markets", { symbol: "BTC" }, "/v1/markets"
    );
    expect(url).toContain("/v1/markets");
    expect(url).toContain("source=polymarket");
  });
});

describe("polymarket_market — route", () => {
  it("calls GET /v1/markets/:identifier", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/markets/:id`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ slug: "btc-updown" });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "polymarket_market")!;
    await (tool as any).handler({ identifier: "btc-updown-1h" }, client);
    expect(capturedUrl).toContain("/v1/markets/btc-updown-1h");
  });
});

describe("polymarket_candles — route", () => {
  it("calls GET /v1/polymarket/candles", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_candles",
      { symbol: "BTC", interval: "1h" },
      "/v1/polymarket/candles"
    );
    expect(url).toContain("/v1/polymarket/candles");
    expect(url).toContain("symbol=BTC");
    expect(url).toContain("interval=1h");
  });
});

describe("polymarket_trades — route", () => {
  it("calls GET /v1/trades with source=polymarket", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_trades", { symbol: "BTC" }, "/v1/trades"
    );
    expect(url).toContain("/v1/trades");
    expect(url).toContain("source=polymarket");
    expect(url).toContain("symbol=BTC");
  });
});

describe("polymarket_snapshots — route", () => {
  it("calls GET /v1/polymarket/snapshots", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_snapshots", { symbol: "BTC" }, "/v1/polymarket/snapshots"
    );
    expect(url).toContain("/v1/polymarket/snapshots");
    expect(url).toContain("symbol=BTC");
  });
});

describe("polymarket_snapshot_at — route", () => {
  it("calls GET /v1/polymarket/snapshots/at", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_snapshot_at",
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      "/v1/polymarket/snapshots/at"
    );
    expect(url).toContain("/v1/polymarket/snapshots/at");
    expect(url).toContain("symbol=BTC");
  });
});

// ─── Kalshi tools ─────────────────────────────────────────────────────────────

describe("kalshi_markets — route", () => {
  it("calls GET /v1/kalshi", async () => {
    let called = false;
    server.use(http.get(`${BASE}/v1/kalshi`, () => {
      called = true;
      return HttpResponse.json({ markets: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "kalshi_markets")!;
    await (tool as any).handler({}, client);
    expect(called).toBe(true);
  });
});

describe("kalshi_prices — route", () => {
  it("calls GET /v1/kalshi/:symbol", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/kalshi/:symbol`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ prices: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "kalshi_prices")!;
    await (tool as any).handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("/v1/kalshi/BTC");
  });
});

describe("kalshi_orderbook — route", () => {
  it("calls GET /v1/kalshi/orderbook", async () => {
    const url = await callToolAndCaptureUrl(
      "kalshi_orderbook", { symbol: "BTC" }, "/v1/kalshi/orderbook"
    );
    expect(url).toContain("/v1/kalshi/orderbook");
  });
});

describe("kalshi_snapshots — route", () => {
  it("calls GET /v1/kalshi/snapshots", async () => {
    const url = await callToolAndCaptureUrl(
      "kalshi_snapshots", { symbol: "BTC" }, "/v1/kalshi/snapshots"
    );
    expect(url).toContain("/v1/kalshi/snapshots");
  });
});

describe("kalshi_snapshot_at — route", () => {
  it("calls GET /v1/kalshi/snapshots/at", async () => {
    const url = await callToolAndCaptureUrl(
      "kalshi_snapshot_at",
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      "/v1/kalshi/snapshots/at"
    );
    expect(url).toContain("/v1/kalshi/snapshots/at");
  });
});

// ─── Hyperliquid tools ────────────────────────────────────────────────────────

describe("hyperliquid_markets — route", () => {
  it("calls GET /v1/hyperliquid", async () => {
    let called = false;
    server.use(http.get(`${BASE}/v1/hyperliquid`, () => {
      called = true;
      return HttpResponse.json({ markets: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "hyperliquid_markets")!;
    await (tool as any).handler({}, client);
    expect(called).toBe(true);
  });
});

describe("hyperliquid_candles — route", () => {
  it("calls GET /v1/hyperliquid/:symbol", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/hyperliquid/:symbol`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ candles: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "hyperliquid_candles")!;
    await (tool as any).handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("/v1/hyperliquid/BTC");
  });
});

describe("hyperliquid_trades — route", () => {
  it("calls GET /v1/trades with source=hyperliquid", async () => {
    const url = await callToolAndCaptureUrl(
      "hyperliquid_trades", { symbol: "BTC" }, "/v1/trades"
    );
    expect(url).toContain("source=hyperliquid");
  });
});

describe("hyperliquid_funding — route", () => {
  it("calls GET /v1/hyperliquid/funding", async () => {
    const url = await callToolAndCaptureUrl(
      "hyperliquid_funding", { symbol: "BTC" }, "/v1/hyperliquid/funding"
    );
    expect(url).toContain("/v1/hyperliquid/funding");
  });
});

describe("hyperliquid_oi — route", () => {
  it("calls GET /v1/hyperliquid/open-interest", async () => {
    const url = await callToolAndCaptureUrl(
      "hyperliquid_oi", { symbol: "BTC" }, "/v1/hyperliquid/open-interest"
    );
    expect(url).toContain("/v1/hyperliquid/open-interest");
  });
});

describe("hyperliquid_snapshots — route", () => {
  it("calls GET /v1/hyperliquid/snapshots", async () => {
    const url = await callToolAndCaptureUrl(
      "hyperliquid_snapshots", { symbol: "BTC" }, "/v1/hyperliquid/snapshots"
    );
    expect(url).toContain("/v1/hyperliquid/snapshots");
  });
});

describe("hyperliquid_snapshot_at — route", () => {
  it("calls GET /v1/hyperliquid/snapshots/at", async () => {
    const url = await callToolAndCaptureUrl(
      "hyperliquid_snapshot_at",
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      "/v1/hyperliquid/snapshots/at"
    );
    expect(url).toContain("/v1/hyperliquid/snapshots/at");
  });
});

// ─── Binance tools ────────────────────────────────────────────────────────────

describe("binance_candles — route", () => {
  it("calls GET /v1/candles with source=binance", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_candles",
      { symbol: "BTC", interval: "1h", source: "binance" },
      "/v1/candles"
    );
    expect(url).toContain("/v1/candles");
    expect(url).toContain("source=binance");
  });

  it("calls GET /v1/candles with source=binance_futures", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_candles",
      { symbol: "BTC", interval: "1h", source: "binance_futures" },
      "/v1/candles"
    );
    expect(url).toContain("source=binance_futures");
  });
});

describe("chainlink_candles — route", () => {
  it("calls GET /v1/candles with source=chainlink hardcoded", async () => {
    const url = await callToolAndCaptureUrl(
      "chainlink_candles",
      { symbol: "BTC", interval: "1h" },
      "/v1/candles"
    );
    expect(url).toContain("source=chainlink");
  });
});

describe("binance_ticker — route", () => {
  it("calls GET /v1/ticker", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_ticker",
      { symbol: "BTC", source: "binance" },
      "/v1/ticker"
    );
    expect(url).toContain("/v1/ticker");
  });
});

describe("binance_flow — route", () => {
  it("calls GET /v1/flow", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_flow",
      { symbol: "BTC", interval: "1h" },
      "/v1/flow"
    );
    expect(url).toContain("/v1/flow");
  });
});

describe("binance_funding — route", () => {
  it("calls GET /v1/funding with source=binance_futures", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_funding", { symbol: "BTC" }, "/v1/funding"
    );
    expect(url).toContain("source=binance_futures");
  });
});

describe("binance_oi — route", () => {
  it("calls GET /v1/open-interest with source=binance_futures", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_oi", { symbol: "BTC" }, "/v1/open-interest"
    );
    expect(url).toContain("source=binance_futures");
  });
});

describe("binance_liquidations — route", () => {
  it("calls GET /v1/liquidations", async () => {
    const url = await callToolAndCaptureUrl(
      "binance_liquidations", { symbol: "BTC" }, "/v1/liquidations"
    );
    expect(url).toContain("/v1/liquidations");
  });
});

// ─── New tools added in v1.0.3 ───────────────────────────────────────────────

describe("polymarket_orderbook — route", () => {
  it("calls GET /v1/polymarket/orderbook", async () => {
    const url = await callToolAndCaptureUrl(
      "polymarket_orderbook",
      { symbol: "BTC" },
      "/v1/polymarket/orderbook"
    );
    expect(url).toContain("/v1/polymarket/orderbook");
    expect(url).toContain("symbol=BTC");
  });
});

describe("binance_spot_markets — route", () => {
  it("calls GET /v1/binance/spot", async () => {
    let called = false;
    server.use(http.get(`${BASE}/v1/binance/spot`, () => {
      called = true;
      return HttpResponse.json({ markets: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "binance_spot_markets")!;
    await (tool as any).handler({}, client);
    expect(called).toBe(true);
  });
});

describe("binance_futures_markets — route", () => {
  it("calls GET /v1/binance/futures", async () => {
    let called = false;
    server.use(http.get(`${BASE}/v1/binance/futures`, () => {
      called = true;
      return HttpResponse.json({ markets: [] });
    }));
    const tool = ALL_TOOLS.find(t => t.name === "binance_futures_markets")!;
    await (tool as any).handler({}, client);
    expect(called).toBe(true);
  });
});

// ─── All tools registered ─────────────────────────────────────────────────────

describe("ALL_TOOLS completeness", () => {
  const EXPECTED_TOOLS = [
    "kwery_sources", "kwery_limits", "kwery_status",
    "kwery_markets", "kwery_market",
    "polymarket_markets", "polymarket_market", "polymarket_candles",
    "polymarket_trades", "polymarket_snapshots", "polymarket_snapshot_at",
    "polymarket_orderbook",
    "kalshi_markets", "kalshi_prices", "kalshi_orderbook",
    "kalshi_snapshots", "kalshi_snapshot_at",
    "hyperliquid_markets", "hyperliquid_candles", "hyperliquid_trades",
    "hyperliquid_funding", "hyperliquid_oi", "hyperliquid_snapshots",
    "hyperliquid_snapshot_at",
    "binance_spot_markets", "binance_futures_markets",
    "binance_candles", "chainlink_candles", "binance_ticker",
    "binance_flow", "binance_funding", "binance_oi", "binance_liquidations",
  ];

  it("total tool count is 33", () => {
    expect(ALL_TOOLS.length).toBe(33);
  });

  EXPECTED_TOOLS.forEach((name) => {
    it(`${name} is registered`, () => {
      expect(ALL_TOOLS.some(t => t.name === name)).toBe(true);
    });
  });

  it("no duplicate tool names", () => {
    const names = ALL_TOOLS.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
