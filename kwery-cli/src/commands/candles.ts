import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function candlesCommand(program: Command): void {
  program
    .command("candles")
    .description("Fetch OHLCV candles from Binance, Chainlink, or Polymarket")
    .requiredOption("-s, --symbol <symbol>", "Symbol: BTC | ETH | SOL | XRP")
    .requiredOption("-i, --interval <interval>", "Interval: 1s | 5m | 15m | 1h | 4h | 1d | 24h")
    .option("--source <source>", "Data source", "binance")
    .option("--start <datetime>", "ISO 8601 start time")
    .option("--end <datetime>", "ISO 8601 end time")
    .option("-l, --limit <n>", "Max rows to return", "500")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/candles", {
          symbol: opts.symbol,
          interval: opts.interval,
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
}
