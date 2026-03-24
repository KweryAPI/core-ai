import { z } from "zod";
import { KweryClient } from "../client.js";
import { SymbolSchema, IntervalSchema, DateRangeSchema } from "../types.js";

export const hyperliquidTools = [
  {
    name: "hyperliquid_markets",
    description: "List all tracked Hyperliquid perpetual contracts. Cost: 25 credits.",
    inputSchema: z.object({}),
    handler: async (_params: {}, client: KweryClient) => {
      return client.get("/v1/hyperliquid");
    },
  },
  {
    name: "hyperliquid_candles",
    description:
      "Fetch OHLCV candle history for a Hyperliquid perpetual. " +
      "Includes funding_rate and open_interest per candle. " +
      "Tier: Free 7d/15m+ · Pro 14d/5m+ · Business 31d/1s. Cost: 50 base + 3/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema.default("1h"),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      const { symbol, ...rest } = params;
      return client.get(`/v1/hyperliquid/${symbol}`, rest);
    },
  },
  {
    name: "hyperliquid_trades",
    description:
      "Fetch individual trade ticks from Hyperliquid. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(10000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/trades", { source: "hyperliquid", ...params });
    },
  },
  {
    name: "hyperliquid_funding",
    description:
      "Fetch perpetual funding rate history for Hyperliquid. " +
      "Positive = longs pay shorts. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(5000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/hyperliquid/funding", params);
    },
  },
  {
    name: "hyperliquid_oi",
    description:
      "Fetch open interest history for a Hyperliquid perpetual. Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema.default("1h"),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(5000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/hyperliquid/open-interest", params);
    },
  },
  {
    name: "hyperliquid_snapshots",
    description:
      "Fetch paginated L2 order book depth snapshots for a Hyperliquid perpetual. Cost: 50 base + 4/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/hyperliquid/snapshots", params);
    },
  },
  {
    name: "hyperliquid_snapshot_at",
    description:
      "Fetch the single Hyperliquid L2 book snapshot at or before a given timestamp. Cost: 50 credits flat.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      time: z.string().datetime({ offset: true }).optional(),
      interval: IntervalSchema.optional(),
    }).refine((d) => d.time || d.interval, {
      message: "Either 'time' or 'interval' is required",
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/hyperliquid/snapshots/at", params);
    },
  },
];
