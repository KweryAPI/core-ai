import { z } from "zod";

export const SymbolSchema = z.enum(["BTC", "ETH", "SOL", "XRP"]);
export const SourceSchema = z.enum([
  "polymarket", "kalshi", "binance", "binance_futures", "chainlink", "hyperliquid"
]);
export const IntervalSchema = z.enum(["1s", "5m", "15m", "1h", "4h", "1d", "24h"]);

export const DateRangeSchema = {
  start: z.string().datetime({ offset: true }).optional()
    .describe("ISO 8601 UTC start time, e.g. 2024-01-15T00:00:00Z"),
  end: z.string().datetime({ offset: true }).optional()
    .describe("ISO 8601 UTC end time. Omit for most recent data."),
};

export const PaginationSchema = {
  limit: z.number().int().min(1).max(10000).default(500)
    .describe("Max rows to return. Default 500."),
  after: z.string().optional()
    .describe("Cursor from meta.next_cursor for next page. Omit for first page."),
};

export type Symbol = z.infer<typeof SymbolSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Interval = z.infer<typeof IntervalSchema>;
