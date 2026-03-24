import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function chainlinkCommand(program: Command): void {
  const cl = program
    .command("chainlink")
    .description("Chainlink oracle price feed data");

  cl.command("candles <symbol> <interval>")
    .description("Fetch OHLCV price feed data from Chainlink oracles. Useful for oracle lag analysis against Polymarket/Kalshi markets.")
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
          source: "chainlink",
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
