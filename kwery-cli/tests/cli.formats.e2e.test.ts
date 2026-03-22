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

// ─── Format flag presence ─────────────────────────────────────────────────────

describe("CLI — --format flag availability", () => {
  const dataCommands = [
    ["polymarket", "markets"],
    ["polymarket", "candles", "BTC", "1h"],
    ["polymarket", "trades", "BTC"],
    ["polymarket", "snapshots", "BTC"],
    ["kalshi", "markets"],
    ["kalshi", "prices", "BTC"],
    ["kalshi", "orderbook", "BTC"],
    ["kalshi", "snapshots", "BTC"],
    ["hyperliquid", "markets"],
    ["hyperliquid", "candles", "BTC"],
    ["hyperliquid", "trades", "BTC"],
    ["hyperliquid", "funding", "BTC"],
    ["hyperliquid", "oi", "BTC"],
    ["hyperliquid", "snapshots", "BTC"],
    ["binance", "candles", "BTC", "1h"],
    ["binance", "flow", "BTC", "1h"],
    ["binance", "funding", "BTC"],
    ["binance", "oi", "BTC"],
    ["binance", "liquidations", "BTC"],
    ["limits"],
    ["status"],
  ];

  dataCommands.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} has --format flag`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("--format");
    });
  });
});

// ─── Format options documented ────────────────────────────────────────────────

describe("CLI — format options are documented in help", () => {
  const checkFormats = [
    ["polymarket", "candles", "BTC", "1h"],
    ["kalshi", "prices", "BTC"],
    ["hyperliquid", "candles", "BTC"],
    ["binance", "candles", "BTC", "1h"],
  ];

  checkFormats.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} documents json format`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("json");
    });

    it(`kwery ${cmd.join(" ")} documents csv format`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("csv");
    });

    it(`kwery ${cmd.join(" ")} documents table format`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("table");
    });
  });
});

// ─── Pagination flags ─────────────────────────────────────────────────────────

describe("CLI — pagination flags", () => {
  const paginatedCommands = [
    ["polymarket", "candles", "BTC", "1h"],
    ["polymarket", "trades", "BTC"],
    ["polymarket", "snapshots", "BTC"],
    ["kalshi", "snapshots", "BTC"],
    ["hyperliquid", "funding", "BTC"],
    ["binance", "candles", "BTC", "1h"],
    ["binance", "liquidations", "BTC"],
  ];

  paginatedCommands.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} has --after flag`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("--after");
    });

    it(`kwery ${cmd.join(" ")} has --limit flag`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("--limit");
    });
  });
});

// ─── Date range flags ─────────────────────────────────────────────────────────

describe("CLI — date range flags", () => {
  const dateRangeCommands = [
    ["polymarket", "candles", "BTC", "1h"],
    ["polymarket", "trades", "BTC"],
    ["kalshi", "prices", "BTC"],
    ["hyperliquid", "candles", "BTC"],
    ["binance", "candles", "BTC", "1h"],
    ["binance", "funding", "BTC"],
  ];

  dateRangeCommands.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} has --start flag`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("--start");
    });

    it(`kwery ${cmd.join(" ")} has --end flag`, () => {
      const result = help(...cmd);
      expect(result.stdout).toContain("--end");
    });
  });
});

// ─── Snapshot-at specific ─────────────────────────────────────────────────────

describe("CLI — snapshot-at commands", () => {
  it("polymarket snapshot-at exists", () => {
    const result = help("polymarket");
    expect(result.stdout).toContain("snapshot-at");
  });

  it("kalshi snapshot-at exists", () => {
    const result = help("kalshi");
    expect(result.stdout).toContain("snapshot-at");
  });

  it("hyperliquid snapshot-at exists", () => {
    const result = help("hyperliquid");
    expect(result.stdout).toContain("snapshot-at");
  });
});

// ─── Top-level command structure ──────────────────────────────────────────────

describe("CLI — top-level structure", () => {
  it("shows all platform namespaces in root help", () => {
    const result = help();
    expect(result.stdout).toContain("polymarket");
    expect(result.stdout).toContain("kalshi");
    expect(result.stdout).toContain("hyperliquid");
    expect(result.stdout).toContain("binance");
  });

  it("shows account commands in root help", () => {
    const result = help();
    expect(result.stdout).toContain("limits");
    expect(result.stdout).toContain("status");
    expect(result.stdout).toContain("login");
    expect(result.stdout).toContain("logout");
  });

  it("shows discovery commands in root help", () => {
    const result = help();
    expect(result.stdout).toContain("sources");
    expect(result.stdout).toContain("symbols");
  });

  it("exits 0 for --help", () => {
    const result = help();
    expect(result.status).toBe(0);
  });
});
