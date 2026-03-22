import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { ALL_TOOLS } from "../src/server.js";

const client = new KweryClient("test_key_abc123");

function tool(name: string) {
  const t = ALL_TOOLS.find(t => t.name === name);
  if (!t) throw new Error(`Tool not found: ${name}`);
  return t;
}

describe("Default values — limits applied", () => {
  it("polymarket_candles defaults limit=500", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    }));
    await (tool("polymarket_candles") as any).handler(
      { symbol: "BTC", interval: "1h" }, client
    );
    expect(capturedUrl).toContain("limit=500");
  });

  it("kalshi_prices defaults interval=5m", () => {
    const parsed = (tool("kalshi_prices") as any).inputSchema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("5m");
  });

  it("hyperliquid_candles defaults interval=1h", () => {
    const parsed = (tool("hyperliquid_candles") as any).inputSchema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("1h");
  });

  it("binance_candles defaults source=binance", () => {
    const parsed = (tool("binance_candles") as any).inputSchema.parse({
      symbol: "BTC", interval: "1h"
    });
    expect(parsed.source).toBe("binance");
  });

  it("binance_oi defaults interval=1h", () => {
    const parsed = (tool("binance_oi") as any).inputSchema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("1h");
  });

  it("kwery_status defaults limit=50", () => {
    const parsed = (tool("kwery_status") as any).inputSchema.parse({});
    expect(parsed.limit).toBe(50);
  });

  it("polymarket_snapshots defaults include_orderbook=false", () => {
    const parsed = (tool("polymarket_snapshots") as any).inputSchema.parse({ symbol: "BTC" });
    expect(parsed.include_orderbook).toBe(false);
  });

  it("polymarket_snapshot_at defaults include_orderbook=false", () => {
    const parsed = (tool("polymarket_snapshot_at") as any).inputSchema.parse({
      symbol: "BTC", time: "2024-01-01T00:00:00Z"
    });
    expect(parsed.include_orderbook).toBe(false);
  });
});

describe("Default values — undefined params not sent in URL", () => {
  it("polymarket_candles does not send token_id when omitted", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    }));
    await (tool("polymarket_candles") as any).handler(
      { symbol: "BTC", interval: "1h" }, client
    );
    expect(capturedUrl).not.toContain("token_id");
  });

  it("polymarket_candles does not send market_id when omitted", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    }));
    await (tool("polymarket_candles") as any).handler(
      { symbol: "BTC", interval: "1h" }, client
    );
    expect(capturedUrl).not.toContain("market_id");
  });

  it("binance_liquidations does not send side when omitted", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/liquidations`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    }));
    await (tool("binance_liquidations") as any).handler(
      { symbol: "BTC" }, client
    );
    expect(capturedUrl).not.toContain("side=");
  });

  it("binance_liquidations does not send min_usd when omitted", async () => {
    let capturedUrl = "";
    server.use(http.get(`${BASE}/v1/liquidations`, ({ request }) => {
      capturedUrl = request.url;
      return HttpResponse.json({ data: [], meta: { count: 0 } });
    }));
    await (tool("binance_liquidations") as any).handler(
      { symbol: "BTC" }, client
    );
    expect(capturedUrl).not.toContain("min_usd");
  });
});
