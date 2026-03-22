import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

import candles from "./fixtures/candles.json";
import markets from "./fixtures/markets.json";
import market from "./fixtures/market.json";
import limits from "./fixtures/limits.json";
import trades from "./fixtures/trades.json";
import snapshots from "./fixtures/snapshots.json";
import snapshotAt from "./fixtures/snapshot-at.json";
import kalshiPrices from "./fixtures/kalshi-prices.json";
import kalshiMarkets from "./fixtures/kalshi-markets.json";
import hyperliquidOhlcv from "./fixtures/hyperliquid-ohlcv.json";
import funding from "./fixtures/funding.json";
import openInterest from "./fixtures/open-interest.json";
import liquidations from "./fixtures/liquidations.json";
import flow from "./fixtures/flow.json";
import sources from "./fixtures/sources.json";
import symbols from "./fixtures/symbols.json";

export const BASE = "https://kwery-api.com";

export const handlers = [
  http.get(`${BASE}/v1/candles`, () => HttpResponse.json(candles)),
  http.get(`${BASE}/v1/markets`, () => HttpResponse.json(markets)),
  http.get(`${BASE}/v1/markets/:identifier`, () => HttpResponse.json(market)),
  http.get(`${BASE}/v1/limits`, () => HttpResponse.json(limits)),
  http.get(`${BASE}/v1/sources`, () => HttpResponse.json(sources)),
  http.get(`${BASE}/v1/symbols`, () => HttpResponse.json(symbols)),
  http.get(`${BASE}/v1/status`, () => HttpResponse.json({ status: "ok", ingestion: [] })),
  http.get(`${BASE}/v1/polymarket/candles`, () => HttpResponse.json(candles)),
  http.get(`${BASE}/v1/polymarket/snapshots/at`, () => HttpResponse.json(snapshotAt)),
  http.get(`${BASE}/v1/polymarket/snapshots`, () => HttpResponse.json(snapshots)),
  http.get(`${BASE}/v1/trades`, () => HttpResponse.json(trades)),
  http.get(`${BASE}/v1/kalshi/snapshots/at`, () => HttpResponse.json(snapshotAt)),
  http.get(`${BASE}/v1/kalshi/snapshots`, () => HttpResponse.json(snapshots)),
  http.get(`${BASE}/v1/kalshi/orderbook`, () => HttpResponse.json(snapshots)),
  http.get(`${BASE}/v1/kalshi/:symbol`, ({ params }) => {
    if (params.symbol === "snapshots") return HttpResponse.json(snapshots);
    if (params.symbol === "orderbook") return HttpResponse.json(snapshots);
    return HttpResponse.json(kalshiPrices);
  }),
  http.get(`${BASE}/v1/kalshi`, () => HttpResponse.json(kalshiMarkets)),
  http.get(`${BASE}/v1/hyperliquid/snapshots/at`, () => HttpResponse.json(snapshotAt)),
  http.get(`${BASE}/v1/hyperliquid/snapshots`, () => HttpResponse.json(snapshots)),
  http.get(`${BASE}/v1/hyperliquid/open-interest`, () => HttpResponse.json(openInterest)),
  http.get(`${BASE}/v1/hyperliquid/funding`, () => HttpResponse.json(funding)),
  http.get(`${BASE}/v1/hyperliquid/:symbol`, () => HttpResponse.json(hyperliquidOhlcv)),
  http.get(`${BASE}/v1/hyperliquid`, () => HttpResponse.json({ markets: [], total: 0 })),
  http.get(`${BASE}/v1/funding`, () => HttpResponse.json(funding)),
  http.get(`${BASE}/v1/open-interest`, () => HttpResponse.json(openInterest)),
  http.get(`${BASE}/v1/liquidations`, () => HttpResponse.json(liquidations)),
  http.get(`${BASE}/v1/flow`, () => HttpResponse.json(flow)),
  http.get(`${BASE}/v1/ticker`, () => HttpResponse.json({ data: [], meta: { count: 0 } })),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
