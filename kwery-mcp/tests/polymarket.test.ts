import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { polymarketTools } from "../src/tools/polymarket.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => polymarketTools.find((t) => t.name === name)!;

describe("polymarket_markets", () => {
  it("calls /v1/markets with source=polymarket", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_markets").handler({}, client);
    expect(capturedUrl).toContain("source=polymarket");
  });

  it("passes symbol filter", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_markets").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
  });

  it("passes active=false for resolved markets", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_markets").handler({ active: false }, client);
    expect(capturedUrl).toContain("active=false");
  });
});

describe("polymarket_market", () => {
  it("calls /v1/markets/:identifier", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets/:identifier`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({});
      })
    );
    await tool("polymarket_market").handler({ identifier: "0x440c3c38" }, client);
    expect(capturedUrl).toContain("/v1/markets/0x440c3c38");
  });
});

describe("polymarket_candles", () => {
  it("calls /v1/polymarket/candles with symbol and interval", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_candles").handler({ symbol: "BTC", interval: "1h" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
    expect(capturedUrl).toContain("interval=1h");
  });

  it("passes token_id when provided", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_candles").handler(
      { symbol: "BTC", interval: "1h", token_id: "abc123" },
      client
    );
    expect(capturedUrl).toContain("token_id=abc123");
  });

  it("does NOT pass token_id when omitted", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_candles").handler({ symbol: "BTC", interval: "1h" }, client);
    expect(capturedUrl).not.toContain("token_id");
  });

  it("validates symbol against enum — rejects invalid symbol", () => {
    const schema = tool("polymarket_candles").inputSchema;
    expect(() =>
      schema.parse({ symbol: "DOGE", interval: "1h" })
    ).toThrow();
  });

  it("validates interval against enum — rejects invalid interval", () => {
    const schema = tool("polymarket_candles").inputSchema;
    expect(() =>
      schema.parse({ symbol: "BTC", interval: "3h" })
    ).toThrow();
  });
});

describe("polymarket_snapshot_at", () => {
  it("calls /v1/polymarket/snapshots/at with symbol and time", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/polymarket/snapshots/at`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: null });
      })
    );
    await tool("polymarket_snapshot_at").handler(
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      client
    );
    expect(capturedUrl).toContain("symbol=BTC");
    expect(capturedUrl).toContain("time=");
  });

  it("validates time is ISO 8601", () => {
    const schema = tool("polymarket_snapshot_at").inputSchema;
    expect(() =>
      schema.parse({ symbol: "BTC", time: "not-a-date" })
    ).toThrow();
  });
});

describe("polymarket_trades", () => {
  it("calls /v1/trades with source=polymarket", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/trades`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_trades").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("source=polymarket");
  });
});

describe("polymarket_snapshots", () => {
  it("calls /v1/polymarket/snapshots with symbol", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/polymarket/snapshots`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("polymarket_snapshots").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
  });

  it("defaults include_orderbook to false", () => {
    const schema = tool("polymarket_snapshots").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.include_orderbook).toBe(false);
  });
});
