import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function kalshiCommand(program: Command): void {
  const kal = program
    .command("kalshi")
    .description("Kalshi binary event market data");

  kal.command("markets")
    .description("List active Kalshi binary event markets")
    .option("-s, --symbol <symbol>", "Filter by symbol: BTC | ETH | SOL | XRP")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/kalshi", { symbol: opts.symbol });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  kal.command("prices <symbol>")
    .description("Fetch probability price history for a Kalshi event market")
    .option("-i, --interval <interval>", "Interval: 5m | 15m | 1h | 4h | 24h", "5m")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get(`/v1/kalshi/${symbol}`, {
          interval: opts.interval,
          start_time: opts.start,
          end_time: opts.end,
          limit: Number(opts.limit),
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  kal.command("orderbook <symbol>")
    .description("Fetch historical order book snapshots for Kalshi markets")
    .option("--market-id <id>", "Market ID filter")
    .option("-i, --interval <interval>", "Interval: 5m | 15m | 1h | 4h | 24h")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/kalshi/orderbook", {
          symbol,
          market_id: opts.marketId,
          interval: opts.interval,
          start: opts.start,
          end: opts.end,
          limit: Number(opts.limit),
          after: opts.after,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  kal.command("snapshots <symbol>")
    .description("Fetch paginated Kalshi yes/no order book snapshots")
    .option("--series <series>", "Series type: 15m | daily")
    .option("-i, --interval <interval>", "Interval: 5m | 15m | 1h | 4h | 24h")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/kalshi/snapshots", {
          symbol,
          series: opts.series,
          interval: opts.interval,
          start: opts.start,
          end: opts.end,
          limit: Number(opts.limit),
          after: opts.after,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  kal.command("snapshot-at <symbol> <time>")
    .description("Fetch Kalshi order book snapshot at or before a given timestamp")
    .option("--series <series>", "Series type: 15m | daily")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, time, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/kalshi/snapshots/at", {
          symbol,
          time,
          series: opts.series,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });
}
