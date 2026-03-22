import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import path from "path";

const CLI = path.resolve("dist/index.js");
const ENV = { ...process.env, KWERY_API_KEY: "test_key_abc123" };

function help(...args: string[]) {
  return spawnSync("node", [CLI, ...args, "--help"], {
    encoding: "utf8",
    env: ENV,
  });
}

// Every top-level command
const TOP_LEVEL = [
  "login",
  "logout",
  "config",
  "limits",
  "status",
  "sources",
  "symbols",
  "polymarket",
  "kalshi",
  "hyperliquid",
  "binance",
];

describe("Top-level commands — help exits 0", () => {
  TOP_LEVEL.forEach((cmd) => {
    it(`kwery ${cmd} --help`, () => {
      const result = help(cmd);
      expect(result.status, `kwery ${cmd} --help exited ${result.status}: ${result.stderr}`).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(10);
    });
  });
});

// Polymarket subcommands
const POLYMARKET_CMDS = [
  ["polymarket", "markets"],
  ["polymarket", "market", "some-identifier"],
  ["polymarket", "candles", "BTC", "1h"],
  ["polymarket", "trades", "BTC"],
  ["polymarket", "snapshots", "BTC"],
  ["polymarket", "snapshot-at", "BTC", "2024-01-01T00:00:00Z"],
];

describe("Polymarket subcommands — help exits 0", () => {
  POLYMARKET_CMDS.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} --help`, () => {
      const result = help(...cmd);
      expect(result.status).toBe(0);
    });
  });
});

// Kalshi subcommands
const KALSHI_CMDS = [
  ["kalshi", "markets"],
  ["kalshi", "prices", "BTC"],
  ["kalshi", "orderbook", "BTC"],
  ["kalshi", "snapshots", "BTC"],
  ["kalshi", "snapshot-at", "BTC", "2024-01-01T00:00:00Z"],
];

describe("Kalshi subcommands — help exits 0", () => {
  KALSHI_CMDS.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} --help`, () => {
      const result = help(...cmd);
      expect(result.status).toBe(0);
    });
  });
});

// Hyperliquid subcommands
const HYPERLIQUID_CMDS = [
  ["hyperliquid", "markets"],
  ["hyperliquid", "candles", "BTC"],
  ["hyperliquid", "trades", "BTC"],
  ["hyperliquid", "funding", "BTC"],
  ["hyperliquid", "oi", "BTC"],
  ["hyperliquid", "snapshots", "BTC"],
  ["hyperliquid", "snapshot-at", "BTC", "2024-01-01T00:00:00Z"],
];

describe("Hyperliquid subcommands — help exits 0", () => {
  HYPERLIQUID_CMDS.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} --help`, () => {
      const result = help(...cmd);
      expect(result.status).toBe(0);
    });
  });
});

// Binance subcommands
const BINANCE_CMDS = [
  ["binance", "candles", "BTC", "1h"],
  ["binance", "ticker", "BTC"],
  ["binance", "flow", "BTC", "1h"],
  ["binance", "funding", "BTC"],
  ["binance", "oi", "BTC"],
  ["binance", "liquidations", "BTC"],
];

describe("Binance subcommands — help exits 0", () => {
  BINANCE_CMDS.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} --help`, () => {
      const result = help(...cmd);
      expect(result.status).toBe(0);
    });
  });
});

// Config subcommands
describe("Config subcommands — help exits 0", () => {
  const cfgCmds = [
    ["config", "set", "someKey", "someValue"],
    ["config", "get", "someKey"],
    ["config", "list"],
    ["config", "reset"],
  ];

  cfgCmds.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} --help`, () => {
      const result = help(...cmd);
      expect(result.status).toBe(0);
    });
  });
});
