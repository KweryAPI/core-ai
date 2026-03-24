import { z } from "zod";
import { KweryClient } from "../client.js";
import { SymbolSchema, IntervalSchema, DateRangeSchema } from "../types.js";

export const binanceTools = [
  {
    name: "binance_spot_markets",
    description: "List all tracked Binance spot markets and their available symbols. Cost: 25 credits.",
    inputSchema: z.object({}),
    handler: async (_params: {}, client: KweryClient) => {
      return client.get("/v1/binance/spot");
    },
  },
  {
    name: "binance_futures_markets",
    description: "List all tracked Binance perpetual futures markets and their available symbols. Cost: 25 credits.",
    inputSchema: z.object({}),
    handler: async (_params: {}, client: KweryClient) => {
      return client.get("/v1/binance/futures");
    },
  },
  {
    name: "binance_candles",
    description:
      "Fetch OHLCV candle history from Binance spot or futures. " +
      "source='binance' for spot, 'binance_futures' for perpetuals. " +
      "Tier: Free 7d/15m+ · Pro 14d/5m+ · Business 31d/1s.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema,
      source: z.enum(["binance", "binance_futures"]).default("binance"),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(10000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/candles", params);
    },
  },
  {
    name: "chainlink_candles",
    description:
      "Fetch OHLCV price feed data from Chainlink oracles. " +
      "Useful for oracle lag analysis against Polymarket/Kalshi markets.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(10000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/candles", { source: "chainlink", ...params });
    },
  },
  {
    name: "binance_ticker",
    description:
      "Fetch 1-second best bid/ask ticker snapshots. Requires Pro plan. Cost: 50 base + 5/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      source: z.enum(["binance", "binance_futures"]).default("binance"),
      start: z.string().datetime({ offset: true }).optional(),
      end: z.string().datetime({ offset: true }).optional(),
      limit: z.number().int().min(1).max(3600).default(60),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/ticker", params);
    },
  },
  {
    name: "binance_flow",
    description:
      "Fetch time-bucketed directional buy/sell pressure from Binance spot. " +
      "buy_ratio > 0.5 = net buying pressure. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: z.enum(["5m", "15m", "1h", "4h", "24h"]),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(5000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/flow", params);
    },
  },
  {
    name: "binance_funding",
    description:
      "Fetch perpetual funding rate history from Binance futures. " +
      "Funding every 8h. Annualized = rate * 3 * 365. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(5000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/funding", { source: "binance_futures", ...params });
    },
  },
  {
    name: "binance_oi",
    description:
      "Fetch open interest history from Binance futures. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema.default("1h"),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(5000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/open-interest", { source: "binance_futures", ...params });
    },
  },
  {
    name: "binance_liquidations",
    description:
      "Fetch Binance perpetual liquidation events. " +
      "side='long' = forced sell. side='short' = forced buy. Tier: Free 24h · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      side: z.enum(["long", "short"]).optional(),
      min_usd: z.number().optional(),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(10000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/liquidations", params);
    },
  },
];
