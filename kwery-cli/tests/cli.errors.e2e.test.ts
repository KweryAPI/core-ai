import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import path from "path";

const CLI = path.resolve("dist/index.js");

function run(args: string[], env: Record<string, string> = {}) {
  return spawnSync("node", [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

describe("CLI error handling — missing API key", () => {
  const dataCommands = [
    ["limits"],
    ["status"],
    ["sources"],
    ["symbols"],
    ["polymarket", "markets"],
    ["kalshi", "markets"],
    ["hyperliquid", "markets"],
    ["binance", "candles", "BTC", "1h"],
  ];

  dataCommands.forEach((cmd) => {
    it(`kwery ${cmd.join(" ")} exits non-zero without API key`, () => {
      const result = run(cmd, { KWERY_API_KEY: "" });
      expect(result.status).not.toBe(0);
    });
  });
});

describe("CLI error handling — unknown command", () => {
  it("unknown top-level command exits non-zero", () => {
    const result = run(["totally-unknown-command"], {
      KWERY_API_KEY: "test_key",
    });
    expect(result.status).not.toBe(0);
  });
});

describe("CLI error handling — missing required argument", () => {
  it("polymarket candles without symbol exits non-zero", () => {
    const result = run(["polymarket", "candles"], {
      KWERY_API_KEY: "test_key",
    });
    expect(result.status).not.toBe(0);
  });

  it("hyperliquid candles without symbol exits non-zero", () => {
    const result = run(["hyperliquid", "candles"], {
      KWERY_API_KEY: "test_key",
    });
    expect(result.status).not.toBe(0);
  });

  it("binance candles without symbol exits non-zero", () => {
    const result = run(["binance", "candles"], {
      KWERY_API_KEY: "test_key",
    });
    expect(result.status).not.toBe(0);
  });

  it("binance candles without interval exits non-zero", () => {
    const result = run(["binance", "candles", "BTC"], {
      KWERY_API_KEY: "test_key",
    });
    expect(result.status).not.toBe(0);
  });
});

describe("CLI login/logout", () => {
  it("kwery login stores key without error", () => {
    const result = run(["login", "test_key_abc123"], {
      KWERY_API_KEY: "",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/saved|✓/i);
  });

  it("kwery logout removes key without error", () => {
    const result = run(["logout"], {
      KWERY_API_KEY: "",
    });
    expect(result.status).toBe(0);
  });
});
