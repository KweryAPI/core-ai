import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { marketTools } from "../src/tools/markets.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => marketTools.find((t) => t.name === name)!;

describe("kwery_markets", () => {
  it("calls /v1/markets with no filters", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kwery_markets").handler({}, client);
    expect(capturedUrl).toContain("/v1/markets");
  });

  it("filters by source=polymarket", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kwery_markets").handler({ source: "polymarket" }, client);
    expect(capturedUrl).toContain("source=polymarket");
  });

  it("filters by source=kalshi", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kwery_markets").handler({ source: "kalshi" }, client);
    expect(capturedUrl).toContain("source=kalshi");
  });

  it("filters by symbol", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], meta: { count: 0 } });
      })
    );
    await tool("kwery_markets").handler({ symbol: "ETH" }, client);
    expect(capturedUrl).toContain("symbol=ETH");
  });
});

describe("kwery_market", () => {
  it("calls /v1/markets/:identifier", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/markets/:identifier`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({});
      })
    );
    await tool("kwery_market").handler({ identifier: "0x440c3c38" }, client);
    expect(capturedUrl).toContain("/v1/markets/0x440c3c38");
  });
});
