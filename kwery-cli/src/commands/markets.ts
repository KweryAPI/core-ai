import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function marketsCommand(program: Command): void {
  program
    .command("markets")
    .description("List prediction markets from Polymarket and Kalshi")
    .option("--source <source>", "Filter by source: polymarket | kalshi")
    .option("-s, --symbol <symbol>", "Filter by symbol: BTC | ETH | SOL | XRP")
    .option("--active", "Show only active markets")
    .option("--resolved", "Show only resolved markets")
    .option("-l, --limit <n>", "Max markets to return", "50")
    .option("--after <cursor>", "Pagination cursor")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const params: Record<string, any> = {
          limit: Number(opts.limit),
          after: opts.after,
        };
        if (opts.source) params.source = opts.source;
        if (opts.symbol) params.symbol = opts.symbol;
        if (opts.active) params.active = true;
        if (opts.resolved) params.active = false;

        const data = await client.get("/v1/markets", params);
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  program
    .command("market <identifier>")
    .description("Fetch a single market by condition_id, market_id, or slug")
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
}
