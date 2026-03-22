import { Command } from "commander";
import { KweryClient } from "../client.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function limitsCommand(program: Command): void {
  program
    .command("limits")
    .description("Show current plan, credits, rate limits, and feature access")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/limits");
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  program
    .command("sources")
    .description("List all available data sources and their capabilities")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/sources");
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });

  program
    .command("status")
    .description("Check ingestion health for all data sources")
    .option("-l, --limit <n>", "Max entries to return", "50")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/status", { limit: Number(opts.limit) });
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });
}
