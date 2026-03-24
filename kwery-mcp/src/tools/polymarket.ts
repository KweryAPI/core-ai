import { z } from "zod";
import { KweryClient } from "../client.js";
import { SymbolSchema, IntervalSchema, DateRangeSchema, PaginationSchema } from "../types.js";

export const polymarketTools = [
  {
    name: "polymarket_markets",
    description:
      "List Polymarket prediction markets. Filter by symbol, market_type, or active status. " +
      "Returns condition_id, clob_token_up, clob_token_down, slug, question, resolution data. " +
      "Use clob_token_up or clob_token_down with polymarket_candles for a single backtestable series.",
    inputSchema: z.object({
      symbol: SymbolSchema.optional(),
      market_type: z.string().optional(),
      active: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).default(50),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/markets", { source: "polymarket", ...params });
    },
  },
  {
    name: "polymarket_market",
    description:
      "Fetch a single Polymarket market by condition_id, market_id, or event slug. " +
      "Returns full market detail including both CLOB token IDs.",
    inputSchema: z.object({
      identifier: z.string(),
    }),
    handler: async (params: { identifier: string }, client: KweryClient) => {
      return client.get(`/v1/markets/${params.identifier}`);
    },
  },
  {
    name: "polymarket_candles",
    description:
      "Fetch OHLCV candle history for Polymarket prediction markets. " +
      "IMPORTANT: Always pass token_id for backtesting to get one row per bar. " +
      "Without token_id, returns multiple rows per timestamp (Up + Down legs). " +
      "Prices are probabilities [0-1]. Volume is USDC.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: IntervalSchema,
      token_id: z.string().optional(),
      market_id: z.string().optional(),
      ...DateRangeSchema,
      ...PaginationSchema,
    }),
    handler: async (params: any, client: KweryClient) => {
      const { symbol, interval, token_id, market_id, start, end, limit = 500, after } = params;
      return client.get("/v1/polymarket/candles", {
        symbol, interval, token_id, market_id, start, end, limit, after,
      });
    },
  },
  {
    name: "polymarket_trades",
    description:
      "Fetch individual trade ticks from Polymarket CLOB. " +
      "Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(10000).default(500),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/trades", { source: "polymarket", ...params });
    },
  },
  {
    name: "polymarket_snapshots",
    description:
      "Fetch historical order book snapshots for Polymarket. " +
      "Tier: Free 7d · Pro 14d · Business 31d.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      interval: z.string().optional(),
      market_id: z.string().optional(),
      include_orderbook: z.boolean().default(false),
      depth: z.number().int().min(1).max(50).default(10),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/polymarket/snapshots", params);
    },
  },
  {
    name: "polymarket_snapshot_at",
    description:
      "Fetch the single Polymarket order book snapshot at or before a given timestamp. " +
      "Essential for point-in-time backtests that avoid look-ahead bias. Cost: 50 credits flat.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      time: z.string().datetime({ offset: true }).optional(),
      interval: z.string().optional(),
      market_id: z.string().optional(),
      include_orderbook: z.boolean().default(false),
    }).refine((d) => d.time || d.interval, {
      message: "Either 'time' or 'interval' is required",
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/polymarket/snapshots/at", params);
    },
  },
  {
    name: "polymarket_orderbook",
    description:
      "Fetch paginated Polymarket CLOB order book history. " +
      "Returns full bid/ask depth at configurable depth levels with optional diffs. " +
      "Use for slippage estimation, spread analysis, and book depth trends. " +
      "Tier: Free 7d · Pro 14d · Business 31d. Cost: 50 base + 4/row.",
    inputSchema: z.object({
      symbol: SymbolSchema,
      depth: z.number().int().min(1).max(50).default(10),
      include_diffs: z.boolean().default(false),
      ...DateRangeSchema,
      limit: z.number().int().min(1).max(1000).default(100),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/polymarket/orderbook", params);
    },
  },
];
