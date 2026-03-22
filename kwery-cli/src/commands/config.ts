import { Command } from "commander";
import { config } from "../config.js";

export function configCommand(program: Command): void {
  const cfg = program
    .command("config")
    .description("Manage Kwery configuration");

  cfg.command("set <key> <value>")
    .description("Set a configuration value")
    .action((key, value) => {
      config.set(key as any, value);
      console.log(`Set ${key} = ${value}`);
    });

  cfg.command("get <key>")
    .description("Get a configuration value")
    .action((key) => {
      const value = config.get(key as any);
      if (value === undefined) {
        console.error(`Key '${key}' not found`);
        process.exit(1);
      }
      console.log(String(value));
    });

  cfg.command("list")
    .description("List all configuration values")
    .action(() => {
      const all = config.store;
      console.log(JSON.stringify(all, null, 2));
    });

  cfg.command("reset")
    .description("Reset all configuration to defaults")
    .action(() => {
      config.clear();
      console.log("Configuration reset.");
    });
}
