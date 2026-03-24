import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function polymarketCommand(program: Command): void {
  const pm = program
    .command("polymarket")
    .description("Polymarket prediction market data");

  pm.command("market <identifier>")
    .description("Fetch a single Polymarket market by condition_id, market_id, or slug")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (identifier, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get(`/v1/markets/${identifier}`);
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  pm.command("markets")
    .description("List Polymarket prediction markets")
    .option("-s, --symbol <symbol>", "Filter by symbol: BTC | ETH | SOL | XRP")
    .option("--active", "Show only active (open) markets")
    .option("--resolved", "Show only resolved markets")
    .option("-l, --limit <n>", "Max rows to return", "50")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        let active: boolean | undefined;
        if (opts.active) active = true;
        if (opts.resolved) active = false;
        const data = await client.get("/v1/markets", {
          source: "polymarket",
          symbol: opts.symbol,
          active,
          limit: Number(opts.limit),
          after: opts.after,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  pm.command("candles <symbol> <interval>")
    .description("Fetch OHLCV candle history for Polymarket markets")
    .option("--token-id <id>", "CLOB token ID for single-leg backtesting")
    .option("--market-id <id>", "Market condition_id filter")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, interval, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/polymarket/candles", {
          symbol,
          interval,
          token_id: opts.tokenId,
          market_id: opts.marketId,
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

  pm.command("trades <symbol>")
    .description("Fetch individual trade ticks from Polymarket CLOB")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/trades", {
          source: "polymarket",
          symbol,
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

  pm.command("orderbook <symbol>")
    .description("Fetch Polymarket CLOB order book history with full bid/ask depth")
    .option("--depth <n>", "Order book depth levels (1-50)", "10")
    .option("--include-diffs", "Include incremental book updates")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/polymarket/orderbook", {
          symbol,
          depth: Number(opts.depth),
          include_diffs: opts.includeDiffs || undefined,
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

  pm.command("snapshots <symbol>")
    .description("Fetch historical order book snapshots for Polymarket")
    .option("--market-id <id>", "Market condition_id filter")
    .option("--include-orderbook", "Include full order book depth per snapshot")
    .option("--depth <n>", "Order book depth levels (1-50)", "10")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/polymarket/snapshots", {
          symbol,
          market_id: opts.marketId,
          include_orderbook: opts.includeOrderbook || undefined,
          depth: opts.includeOrderbook ? Number(opts.depth) : undefined,
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

  pm.command("snapshot-at <symbol> <time>")
    .description("Fetch order book snapshot at or before a given timestamp")
    .option("--market-id <id>", "Market condition_id filter")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, time, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/polymarket/snapshots/at", {
          symbol,
          time,
          market_id: opts.marketId,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });
}
