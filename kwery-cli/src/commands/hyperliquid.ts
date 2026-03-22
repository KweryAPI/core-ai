import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function hyperliquidCommand(program: Command): void {
  const hl = program
    .command("hyperliquid")
    .description("Hyperliquid perpetual market data");

  hl.command("markets")
    .description("List all tracked Hyperliquid perpetual contracts")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/hyperliquid");
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  hl.command("candles <symbol>")
    .description("Fetch OHLCV candle history for a Hyperliquid perpetual")
    .option("-i, --interval <interval>", "Interval", "1h")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get(`/v1/hyperliquid/${symbol}`, {
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

  hl.command("trades <symbol>")
    .description("Fetch individual trade ticks from Hyperliquid")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/trades", {
          source: "hyperliquid",
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

  hl.command("funding <symbol>")
    .description("Fetch perpetual funding rate history for Hyperliquid")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/hyperliquid/funding", {
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

  hl.command("oi <symbol>")
    .description("Fetch open interest history for a Hyperliquid perpetual")
    .option("-i, --interval <interval>", "Interval", "1h")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/hyperliquid/open-interest", {
          symbol,
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

  hl.command("snapshots <symbol>")
    .description("Fetch L2 order book depth snapshots for a Hyperliquid perpetual")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "100")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/hyperliquid/snapshots", {
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

  hl.command("snapshot-at <symbol> <time>")
    .description("Fetch Hyperliquid L2 book snapshot at or before a given timestamp")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, time, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/hyperliquid/snapshots/at", {
          symbol,
          time,
        });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });
}
