import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { hyperliquidTools } from "../src/tools/hyperliquid.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => hyperliquidTools.find((t) => t.name === name)!;

describe("hyperliquid_markets", () => {
  it("calls /v1/hyperliquid", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ markets: [], total: 0 });
      })
    );
    await tool("hyperliquid_markets").handler({}, client);
    expect(capturedUrl).toContain("/v1/hyperliquid");
  });
});

describe("hyperliquid_candles", () => {
  it("calls /v1/hyperliquid/{symbol}", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid/:symbol`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ candles: [], total: 0 });
      })
    );
    await tool("hyperliquid_candles").handler({ symbol: "BTC", interval: "1h" }, client);
    expect(capturedUrl).toContain("/v1/hyperliquid/BTC");
  });

  it("defaults interval to 1h", () => {
    const schema = tool("hyperliquid_candles").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("1h");
  });
});

describe("hyperliquid_trades", () => {
  it("calls /v1/trades with source=hyperliquid", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/trades`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("hyperliquid_trades").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("source=hyperliquid");
  });
});

describe("hyperliquid_funding", () => {
  it("calls /v1/hyperliquid/funding", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid/funding`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("hyperliquid_funding").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("/v1/hyperliquid/funding");
    expect(capturedUrl).toContain("symbol=BTC");
  });
});

describe("hyperliquid_oi", () => {
  it("calls /v1/hyperliquid/open-interest", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid/open-interest`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("hyperliquid_oi").handler({ symbol: "ETH" }, client);
    expect(capturedUrl).toContain("/v1/hyperliquid/open-interest");
    expect(capturedUrl).toContain("symbol=ETH");
  });

  it("defaults interval to 1h", () => {
    const schema = tool("hyperliquid_oi").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("1h");
  });
});

describe("hyperliquid_snapshots", () => {
  it("calls /v1/hyperliquid/snapshots", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid/snapshots`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("hyperliquid_snapshots").handler({ symbol: "SOL" }, client);
    expect(capturedUrl).toContain("/v1/hyperliquid/snapshots");
    expect(capturedUrl).toContain("symbol=SOL");
  });
});

describe("hyperliquid_snapshot_at", () => {
  it("calls /v1/hyperliquid/snapshots/at", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/hyperliquid/snapshots/at`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: null });
      })
    );
    await tool("hyperliquid_snapshot_at").handler(
      { symbol: "BTC", time: "2024-03-18T12:00:00Z" },
      client
    );
    expect(capturedUrl).toContain("/v1/hyperliquid/snapshots/at");
    expect(capturedUrl).toContain("symbol=BTC");
  });

  it("validates time is ISO 8601", () => {
    const schema = tool("hyperliquid_snapshot_at").inputSchema;
    expect(() =>
      schema.parse({ symbol: "BTC", time: "bad-date" })
    ).toThrow();
  });
});
