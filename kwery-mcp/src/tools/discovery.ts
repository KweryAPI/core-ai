import { z } from "zod";
import { KweryClient } from "../client.js";

export const discoveryTools = [
  {
    name: "kwery_sources",
    description:
      "List all available data sources, their supported symbols, intervals, endpoints, " +
      "and tier requirements. Use this first to understand what data is available and " +
      "what plan is required before making data requests.",
    inputSchema: z.object({}),
    handler: async (_params: {}, client: KweryClient) => {
      const [sources, symbols] = await Promise.all([
        client.get("/v1/sources"),
        client.get("/v1/symbols"),
      ]);
      return { sources, symbols };
    },
  },
  {
    name: "kwery_limits",
    description:
      "Check the current API key's plan, remaining credits, rate limits, feature access " +
      "(orderbook snapshots, 1s ticker, trade ticks, etc.), and snapshot history depth. " +
      "Call this before large data pulls to ensure the plan supports the request.",
    inputSchema: z.object({}),
    handler: async (_params: {}, client: KweryClient) => {
      return client.get("/v1/limits");
    },
  },
  {
    name: "kwery_status",
    description:
      "Check ingestion health for all data sources. Shows the last successful ingestion " +
      "run per source, status, and rows inserted. Use to verify data freshness before " +
      "running a backtest or analysis.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).default(50),
    }),
    handler: async (params: { limit?: number }, client: KweryClient) => {
      return client.get("/v1/status", { limit: params.limit });
    },
  },
];
