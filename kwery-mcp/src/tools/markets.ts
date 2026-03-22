import { z } from "zod";
import { KweryClient } from "../client.js";
import { SymbolSchema } from "../types.js";

export const marketTools = [
  {
    name: "kwery_markets",
    description:
      "List prediction markets across Polymarket and Kalshi in one call. " +
      "Filter by source (polymarket | kalshi), symbol, market_type, or active status. " +
      "Cost: 25 credits.",
    inputSchema: z.object({
      source: z.enum(["polymarket", "kalshi"]).optional(),
      symbol: SymbolSchema.optional(),
      market_type: z.string().optional(),
      active: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).default(50),
      after: z.string().optional(),
    }),
    handler: async (params: any, client: KweryClient) => {
      return client.get("/v1/markets", params);
    },
  },
  {
    name: "kwery_market",
    description:
      "Fetch a single market by identifier. Works for both Polymarket and Kalshi. " +
      "Accepts Polymarket condition_id (0x...), market_id, or event slug. " +
      "Cost: 25 credits.",
    inputSchema: z.object({
      identifier: z.string(),
    }),
    handler: async (params: { identifier: string }, client: KweryClient) => {
      return client.get(`/v1/markets/${params.identifier}`);
    },
  },
];
