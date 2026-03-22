import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { kalshiTools } from "../src/tools/kalshi.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => kalshiTools.find((t) => t.name === name)!;

describe("kalshi_markets", () => {
  it("calls /v1/kalshi", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ markets: [], total: 0 });
      })
    );
    await tool("kalshi_markets").handler({}, client);
    expect(capturedUrl).toContain("/v1/kalshi");
  });

  it("passes symbol filter", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ markets: [], total: 0 });
      })
    );
    await tool("kalshi_markets").handler({ symbol: "ETH" }, client);
    expect(capturedUrl).toContain("symbol=ETH");
  });
});

describe("kalshi_prices", () => {
  it("calls /v1/kalshi/{symbol}", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi/:symbol`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ prices: [], total: 0 });
      })
    );
    await tool("kalshi_prices").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("/v1/kalshi/BTC");
  });

  it("defaults interval to 5m", () => {
    const schema = tool("kalshi_prices").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("5m");
  });

  it("defaults include_orderbook to false", () => {
    const schema = tool("kalshi_prices").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.include_orderbook).toBe(false);
  });
});

describe("kalshi_snapshot_at", () => {
  it("calls /v1/kalshi/snapshots/at with required params", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi/snapshots/at`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: null });
      })
    );
    await tool("kalshi_snapshot_at").handler(
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      client
    );
    expect(capturedUrl).toContain("symbol=BTC");
  });

  it("validates time is ISO 8601", () => {
    const schema = tool("kalshi_snapshot_at").inputSchema;
    expect(() =>
      schema.parse({ symbol: "BTC", time: "not-a-date" })
    ).toThrow();
  });
});

describe("kalshi_snapshots", () => {
  it("calls /v1/kalshi/snapshots with symbol", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi/snapshots`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kalshi_snapshots").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
  });

  it("passes series filter", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi/snapshots`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kalshi_snapshots").handler({ symbol: "BTC", series: "15m" }, client);
    expect(capturedUrl).toContain("series=15m");
  });
});

describe("kalshi_orderbook", () => {
  it("calls /v1/kalshi/orderbook with symbol", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/kalshi/orderbook`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kalshi_orderbook").handler({ symbol: "SOL" }, client);
    expect(capturedUrl).toContain("symbol=SOL");
  });
});
