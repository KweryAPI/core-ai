#!/usr/bin/env node

import { Command } from "commander";
import { candlesCommand } from "./commands/candles.js";
import { marketsCommand } from "./commands/markets.js";
import { limitsCommand } from "./commands/limits.js";
import { polymarketCommand } from "./commands/polymarket.js";
import { kalshiCommand } from "./commands/kalshi.js";
import { hyperliquidCommand } from "./commands/hyperliquid.js";
import { binanceCommand } from "./commands/binance.js";
import { accountCommands } from "./commands/account.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("kwery")
  .description("Query crypto and prediction market data from your terminal")
  .version("0.1.0")
  .addHelpText(
    "after",
    "\nEnvironment Variables:\n" +
    "  KWERY_API_KEY    Your Kwery API key (required)\n" +
    "  KWERY_BASE_URL   Override API base URL (default: https://kwery-api.com)\n" +
    "\nGet an API key at https://kwery.xyz"
  );

// Platform namespaces
polymarketCommand(program);
kalshiCommand(program);
hyperliquidCommand(program);
binanceCommand(program);

// Account & discovery
accountCommands(program);
limitsCommand(program);
configCommand(program);

// Legacy flat commands (kept for backwards compatibility)
candlesCommand(program);
marketsCommand(program);

program.parse(process.argv);
