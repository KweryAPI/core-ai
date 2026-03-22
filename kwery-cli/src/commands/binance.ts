import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function binanceCommand(program: Command): void {
  const bn = program
    .command("binance")
    .description("Binance spot and futures market data");

  bn.command("candles <symbol> <interval>")
    .description("Fetch OHLCV candle history from Binance spot or futures")
    .option("--source <source>", "binance | binance_futures", "binance")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, interval, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/candles", {
          symbol,
          interval,
          source: opts.source,
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

  bn.command("ticker <symbol>")
    .description("Fetch 1-second best bid/ask ticker snapshots. Requires Pro plan.")
    .option("--source <source>", "binance | binance_futures", "binance")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "60")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/ticker", {
          symbol,
          source: opts.source,
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

  bn.command("flow <symbol> <interval>")
    .description("Fetch time-bucketed directional buy/sell pressure from Binance spot")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, interval, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/flow", {
          symbol,
          interval,
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

  bn.command("funding <symbol>")
    .description("Fetch perpetual funding rate history from Binance futures")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/funding", {
          source: "binance_futures",
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

  bn.command("oi <symbol>")
    .description("Fetch open interest history from Binance futures")
    .option("-i, --interval <interval>", "Interval", "1h")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/open-interest", {
          source: "binance_futures",
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

  bn.command("liquidations <symbol>")
    .description("Fetch Binance perpetual liquidation events")
    .option("--side <side>", "long | short")
    .option("--min-usd <n>", "Minimum liquidation size in USD")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (symbol, opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/liquidations", {
          symbol,
          side: opts.side,
          min_usd: opts.minUsd ? Number(opts.minUsd) : undefined,
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
}
