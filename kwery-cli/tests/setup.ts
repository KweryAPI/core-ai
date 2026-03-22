import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const BASE = "https://kwery-api.com";

export const candlesFixture = {
  data: [
    {
      timestamp: "2024-03-18T12:00:00Z",
      symbol: "BTC",
      source: "binance",
      interval: "1h",
      open: 67500.0,
      high: 68200.0,
      low: 67100.0,
      close: 67900.0,
      volume: 325.4,
    },
  ],
  meta: { symbol: "BTC", source: "binance", interval: "1h", count: 1, next_cursor: null },
};

export const marketsFixture = {
  data: [
    {
      market_id: "0x440c3c38",
      slug: "btc-updown-1h-1710759600",
      source: "polymarket",
      question: "Bitcoin Up or Down - March 18?",
      active: true,
    },
  ],
  meta: { count: 1, next_cursor: null },
};

export const limitsFixture = {
  plan: "pro",
  credits: { used: 1500, limit: 100000, remaining: 98500 },
  rate_limits: { requests_per_second: 10, requests_per_minute: 300 },
  features: { orderbook_snapshots: true, trade_ticks: true },
};

export const sourcesFixture = {
  sources: [
    { id: "binance", name: "Binance Spot", type: "cex" },
    { id: "polymarket", name: "Polymarket", type: "prediction_market" },
  ],
};

export const handlers = [
  http.get(`${BASE}/v1/candles`, () => HttpResponse.json(candlesFixture)),
  http.get(`${BASE}/v1/markets`, () => HttpResponse.json(marketsFixture)),
  http.get(`${BASE}/v1/markets/:identifier`, () =>
    HttpResponse.json(marketsFixture.data[0])
  ),
  http.get(`${BASE}/v1/limits`, () => HttpResponse.json(limitsFixture)),
  http.get(`${BASE}/v1/sources`, () => HttpResponse.json(sourcesFixture)),
  http.get(`${BASE}/v1/status`, () =>
    HttpResponse.json({ status: "ok", ingestion: [] })
  ),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
