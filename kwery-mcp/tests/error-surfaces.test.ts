import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { ALL_TOOLS } from "../src/server.js";

// A representative sample of tools — one per platform
const REPRESENTATIVE_TOOLS = [
  { name: "kwery_limits",          route: "/v1/limits",                   params: {} },
  { name: "polymarket_candles",    route: "/v1/polymarket/candles",       params: { symbol: "BTC", interval: "1h" } },
  { name: "kalshi_prices",         route: "/v1/kalshi/BTC",               params: { symbol: "BTC" } },
  { name: "hyperliquid_candles",   route: "/v1/hyperliquid/BTC",          params: { symbol: "BTC" } },
  { name: "binance_candles",       route: "/v1/candles",                  params: { symbol: "BTC", interval: "1h", source: "binance" } },
  { name: "binance_liquidations",  route: "/v1/liquidations",             params: { symbol: "BTC" } },
];

describe("Error surfaces — 401 Unauthorized", () => {
  REPRESENTATIVE_TOOLS.forEach(({ name, route, params }) => {
    it(`${name} throws 'Invalid or missing API key' on 401`, async () => {
      server.use(
        http.get(`${BASE}${route}`, () =>
          HttpResponse.json({ detail: "Invalid key" }, { status: 401 })
        )
      );
      const client = new KweryClient("test_key_abc123");
      const tool = ALL_TOOLS.find(t => t.name === name)!;
      await expect((tool as any).handler(params, client))
        .rejects.toThrow("Invalid or missing API key");
    });
  });
});

describe("Error surfaces — 403 Plan Required", () => {
  REPRESENTATIVE_TOOLS.forEach(({ name, route, params }) => {
    it(`${name} throws upgrade URL on 403`, async () => {
      server.use(
        http.get(`${BASE}${route}`, () =>
          HttpResponse.json({ detail: "Pro plan required" }, { status: 403 })
        )
      );
      const client = new KweryClient("test_key_abc123");
      const tool = ALL_TOOLS.find(t => t.name === name)!;
      await expect((tool as any).handler(params, client))
        .rejects.toThrow("kwery.xyz/pricing");
    });
  });
});

describe("Error surfaces — 429 Rate Limited", () => {
  REPRESENTATIVE_TOOLS.forEach(({ name, route, params }) => {
    it(`${name} throws 'Rate limit exceeded' on 429`, async () => {
      server.use(
        http.get(`${BASE}${route}`, () =>
          HttpResponse.json({ detail: "Too many requests" }, { status: 429 })
        )
      );
      const client = new KweryClient("test_key_abc123");
      const tool = ALL_TOOLS.find(t => t.name === name)!;
      await expect((tool as any).handler(params, client))
        .rejects.toThrow("Rate limit exceeded");
    });
  });
});

describe("Error surfaces — 500 Server Error", () => {
  REPRESENTATIVE_TOOLS.forEach(({ name, route, params }) => {
    it(`${name} throws generic error on 500`, async () => {
      server.use(
        http.get(`${BASE}${route}`, () =>
          HttpResponse.json({ detail: "Internal error" }, { status: 500 })
        )
      );
      const client = new KweryClient("test_key_abc123");
      const tool = ALL_TOOLS.find(t => t.name === name)!;
      await expect((tool as any).handler(params, client))
        .rejects.toThrow("Kwery API error 500");
    });
  });
});

describe("Error surfaces — no API key", () => {
  it("KweryClient constructor throws when no key set", () => {
    const original = process.env.KWERY_API_KEY;
    delete process.env.KWERY_API_KEY;
    expect(() => new KweryClient()).toThrow("KWERY_API_KEY is required");
    if (original) process.env.KWERY_API_KEY = original;
  });
});
