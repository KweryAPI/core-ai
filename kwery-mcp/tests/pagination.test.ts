import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { polymarketTools } from "../src/tools/polymarket.js";
import { kalshiTools } from "../src/tools/kalshi.js";
import { hyperliquidTools } from "../src/tools/hyperliquid.js";
import { binanceTools } from "../src/tools/binance.js";

const client = new KweryClient("test_key_abc123");

const CURSOR = "eyJvZmZzZXQiOiA1MDB9";

// Tools that support cursor-based pagination via `after` param
const paginatedTools = [
  {
    tool: polymarketTools.find((t) => t.name === "polymarket_candles")!,
    route: "/v1/polymarket/candles",
    params: { symbol: "BTC", interval: "1h" },
  },
  {
    tool: polymarketTools.find((t) => t.name === "polymarket_trades")!,
    route: "/v1/trades",
    params: { symbol: "BTC" },
  },
  {
    tool: polymarketTools.find((t) => t.name === "polymarket_snapshots")!,
    route: "/v1/polymarket/snapshots",
    params: { symbol: "BTC" },
  },
  {
    tool: kalshiTools.find((t) => t.name === "kalshi_snapshots")!,
    route: "/v1/kalshi/snapshots",
    params: { symbol: "BTC" },
  },
  {
    tool: hyperliquidTools.find((t) => t.name === "hyperliquid_funding")!,
    route: "/v1/hyperliquid/funding",
    params: { symbol: "BTC" },
  },
  {
    tool: hyperliquidTools.find((t) => t.name === "hyperliquid_snapshots")!,
    route: "/v1/hyperliquid/snapshots",
    params: { symbol: "BTC" },
  },
  {
    tool: binanceTools.find((t) => t.name === "binance_candles")!,
    route: "/v1/candles",
    params: { symbol: "BTC", interval: "1h" },
  },
  {
    tool: binanceTools.find((t) => t.name === "binance_funding")!,
    route: "/v1/funding",
    params: { symbol: "BTC" },
  },
  {
    tool: binanceTools.find((t) => t.name === "binance_liquidations")!,
    route: "/v1/liquidations",
    params: { symbol: "BTC" },
  },
  {
    tool: binanceTools.find((t) => t.name === "binance_flow")!,
    route: "/v1/flow",
    params: { symbol: "BTC", interval: "1h" },
  },
];

describe("Pagination — cursor is passed when provided", () => {
  paginatedTools.forEach(({ tool, route, params }) => {
    it(`${tool.name} passes after cursor`, async () => {
      let capturedUrl: string | undefined;

      server.use(
        http.get(`${BASE}${route}`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            data: [],
            meta: { count: 0, next_cursor: null },
          });
        })
      );

      await tool.handler({ ...params, after: CURSOR }, client);
      expect(capturedUrl).toContain(`after=${CURSOR}`);
    });
  });
});

describe("Pagination — cursor is omitted when not provided", () => {
  paginatedTools.forEach(({ tool, route, params }) => {
    it(`${tool.name} omits after when not provided`, async () => {
      let capturedUrl: string | undefined;

      server.use(
        http.get(`${BASE}${route}`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            data: [],
            meta: { count: 0, next_cursor: null },
          });
        })
      );

      await tool.handler(params, client);
      expect(capturedUrl).not.toContain("after=");
    });
  });
});

describe("Pagination — next_cursor is preserved in response", () => {
  it("polymarket_candles preserves next_cursor from API response", async () => {
    const nextCursor = "eyJvZmZzZXQiOiAxfQ==";

    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, () =>
        HttpResponse.json({
          data: [{ timestamp: "2024-01-01T00:00:00Z", close: 0.5 }],
          meta: { count: 1, next_cursor: nextCursor },
        })
      )
    );

    const tool = polymarketTools.find((t) => t.name === "polymarket_candles")!;
    const result: any = await tool.handler(
      { symbol: "BTC", interval: "1h" },
      client
    );

    expect(result.meta.next_cursor).toBe(nextCursor);
  });

  it("returns null next_cursor when on last page", async () => {
    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, () =>
        HttpResponse.json({
          data: [],
          meta: { count: 0, next_cursor: null },
        })
      )
    );

    const tool = polymarketTools.find((t) => t.name === "polymarket_candles")!;
    const result: any = await tool.handler(
      { symbol: "BTC", interval: "1h" },
      client
    );

    expect(result.meta.next_cursor).toBeNull();
  });
});

describe("Pagination — limit param is passed correctly", () => {
  it("polymarket_candles passes custom limit", async () => {
    let capturedUrl: string | undefined;

    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );

    const tool = polymarketTools.find((t) => t.name === "polymarket_candles")!;
    await tool.handler({ symbol: "BTC", interval: "1h", limit: 250 }, client);

    expect(capturedUrl).toContain("limit=250");
  });

  it("polymarket_candles uses default limit of 500 when omitted", async () => {
    let capturedUrl: string | undefined;

    server.use(
      http.get(`${BASE}/v1/polymarket/candles`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );

    const tool = polymarketTools.find((t) => t.name === "polymarket_candles")!;
    await tool.handler({ symbol: "BTC", interval: "1h" }, client);

    expect(capturedUrl).toContain("limit=500");
  });
});
