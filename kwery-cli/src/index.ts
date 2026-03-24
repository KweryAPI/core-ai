#!/usr/bin/env node

import { createRequire } from "module";
import { Command } from "commander";
import { candlesCommand } from "./commands/candles.js";
import { marketsCommand } from "./commands/markets.js";
import { limitsCommand } from "./commands/limits.js";
import { polymarketCommand } from "./commands/polymarket.js";
import { kalshiCommand } from "./commands/kalshi.js";
import { hyperliquidCommand } from "./commands/hyperliquid.js";
import { binanceCommand } from "./commands/binance.js";
import { chainlinkCommand } from "./commands/chainlink.js";
import { accountCommands } from "./commands/account.js";
import { configCommand } from "./commands/config.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const program = new Command();

program
  .name("kwery")
  .description("Query crypto and prediction market data from your terminal")
  .version(version)
  .addHelpText(
    "after",
    "\nEnvironment Variables:\n" +
    "  KWERY_API_KEY    Your Kwery API key (or run: kwery login <key>)\n" +
    "  KWERY_BASE_URL   Override API base URL (default: https://kwery-api.com)\n" +
    "\nGet an API key at https://kwery.xyz"
  );

// Platform namespaces
polymarketCommand(program);
kalshiCommand(program);
hyperliquidCommand(program);
binanceCommand(program);
chainlinkCommand(program);

// Account & discovery
accountCommands(program);
limitsCommand(program);
configCommand(program);

// Legacy flat commands (kept for backwards compatibility)
candlesCommand(program);
marketsCommand(program);

program.parse(process.argv);
