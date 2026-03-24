import { z } from "zod";
import { KweryClient } from "../client.js";
import { SymbolSchema, DateRangeSchema } from "../types.js";

export const kalshiTools = [
  {
    name: "kalshi_markets",
    description:
      "List active Kalshi binary event markets. " +
      "Prices in cents (0-100), not probabilities. Cost: 25 credits.",
    inputSchema: z.object({
      symbol: SymbolSchema.optional(),
      limit: z.number().int().min(1).max(500).default(50),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/kalshi", params);
    },
  },
  {
    name: "kalshi_prices",
    description:
      "Fetch probability price history for a Kalshi event market. " +
      "Includes yes_bid, yes_ask, no_bid, no_ask, spread, mid_price, imbalance. " +
      "Prices in cents (0-100). imbalance > 0.5 = more YES liquidity. " +
      "Pagination: use offset (not after cursor) to page through results. " +
      "Tier: Free 7d · Pro 14d · Business 31d. Cost: 50 base + 5/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: z.enum(["5m", "15m", "1h", "4h", "24h"]).default("5m"),
      include_orderbook: z.boolean().default(false),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      offset: z.number().int().min(0).default(0),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get(`/v1/kalshi/${params.symbol}`, params);
    },
  },
  {
    name: "kalshi_orderbook",
    description:
      "Fetch historical order book snapshots for Kalshi markets.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      market_id: z.string().optional(),
      interval: z.enum(["5m", "15m", "1h", "4h", "24h"]).optional(),
      include_diffs: z.boolean().default(false),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/kalshi/orderbook", params);
    },
  },
  {
    name: "kalshi_snapshots",
    description:
      "Fetch paginated Kalshi yes/no order book snapshots. " +
      "series='15m' for 15-min up/down contracts, 'daily' for daily price contracts. Cost: 50 base + 4/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      series: z.enum(["15m", "daily"]).optional(),
      interval: z.enum(["5m", "15m", "1h", "4h", "24h"]).optional(),
      include_diffs: z.boolean().default(false),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/kalshi/snapshots", params);
    },
  },
  {
    name: "kalshi_snapshot_at",
    description:
      "Fetch the single Kalshi order book snapshot at or before a given timestamp. Cost: 50 credits flat.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      time: z.string().datetime({ offset: true }).optional(),
      series: z.enum(["15m", "daily"]).optional(),
      interval: z.enum(["5m", "15m", "1h", "4h", "24h"]).optional(),
    }).refine((d) => d.time || d.interval, {
      message: "Either 'time' or 'interval' is required",
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/kalshi/snapshots/at", params);
    },
  },
];
