import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { binanceTools } from "../src/tools/binance.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => binanceTools.find((t) => t.name === name)!;

describe("binance_candles", () => {
  it("calls /v1/candles with correct source", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_candles").handler(
      { symbol: "BTC", interval: "1h", source: "binance" },
      client
    );
    expect(capturedUrl).toContain("source=binance");
  });

  it("defaults source to binance (spot)", () => {
    const schema = tool("binance_candles").inputSchema;
    const parsed = schema.parse({ symbol: "BTC", interval: "1h" });
    expect(parsed.source).toBe("binance");
  });

  it("accepts binance_futures as source", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_candles").handler(
      { symbol: "BTC", interval: "1h", source: "binance_futures" },
      client
    );
    expect(capturedUrl).toContain("source=binance_futures");
  });
});

describe("chainlink_candles", () => {
  it("calls /v1/candles with source=chainlink hardcoded", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("chainlink_candles").handler({ symbol: "BTC", interval: "1h" }, client);
    expect(capturedUrl).toContain("source=chainlink");
  });
});

describe("binance_funding", () => {
  it("calls /v1/funding with source=binance_futures", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/funding`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_funding").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("source=binance_futures");
  });
});

describe("binance_oi", () => {
  it("calls /v1/open-interest with source=binance_futures", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/open-interest`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_oi").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("source=binance_futures");
  });

  it("defaults interval to 1h", () => {
    const schema = tool("binance_oi").inputSchema;
    const parsed = schema.parse({ symbol: "BTC" });
    expect(parsed.interval).toBe("1h");
  });
});

describe("binance_liquidations", () => {
  it("passes side filter", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/liquidations`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_liquidations").handler({ symbol: "BTC", side: "long" }, client);
    expect(capturedUrl).toContain("side=long");
  });

  it("passes min_usd filter", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/liquidations`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_liquidations").handler({ symbol: "BTC", min_usd: 100000 }, client);
    expect(capturedUrl).toContain("min_usd=100000");
  });

  it("omits side when not provided", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/liquidations`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_liquidations").handler({ symbol: "ETH" }, client);
    expect(capturedUrl).not.toContain("side=");
  });
});

describe("binance_ticker", () => {
  it("calls /v1/ticker with symbol", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/ticker`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_ticker").handler({ symbol: "BTC" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
  });
});

describe("binance_flow", () => {
  it("calls /v1/flow with symbol and interval", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/flow`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await tool("binance_flow").handler({ symbol: "BTC", interval: "1h" }, client);
    expect(capturedUrl).toContain("symbol=BTC");
    expect(capturedUrl).toContain("interval=1h");
  });
});
