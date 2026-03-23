import { Command } from "commander";
import { KweryClient } from "../client.js";
import { config } from "../config.js";
import { printOutput, printError, type OutputFormat } from "../output.js";

export function accountCommands(program: Command): void {
  program
    .command("login")
    .description("Save your Kwery API key to the local config")
    .argument("<api-key>", "Your API key from https://kwery.xyz/dashboard")
    .action((apiKey) => {
      config.set("apiKey", apiKey);
      console.log("API key saved.");
    });

  program
    .command("logout")
    .description("Remove the saved Kwery API key from the local config")
    .action(() => {
      config.delete("apiKey");
      console.log("Logged out. API key removed from local config.");
    });

  program
    .command("symbols")
    .description("List all supported symbols across data sources")
    .option("-f, --format <format>", "Output format: json | table | csv", "json")
    .action(async (opts) => {
      try {
        const client = new KweryClient();
        const data = await client.get("/v1/symbols");
        printOutput(data, opts.format as OutputFormat);
      } catch (err: any) {
        printError(err.message);
        process.exit(1);
      }
    });
}
