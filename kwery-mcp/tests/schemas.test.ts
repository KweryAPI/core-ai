import { describe, it, expect } from "vitest";
import { polymarketTools } from "../src/tools/polymarket.js";
import { kalshiTools } from "../src/tools/kalshi.js";
import { hyperliquidTools } from "../src/tools/hyperliquid.js";
import { binanceTools } from "../src/tools/binance.js";
import { discoveryTools } from "../src/tools/discovery.js";
import { marketTools } from "../src/tools/markets.js";

// All tools that accept a symbol param
const toolsWithSymbol = [
  ...polymarketTools,
  ...kalshiTools,
  ...hyperliquidTools,
  ...binanceTools,
  ...marketTools,
].filter((t) => (t.inputSchema as any).shape?.symbol);

// All tools that accept a start/end date range
const toolsWithDateRange = [
  ...polymarketTools,
  ...kalshiTools,
  ...hyperliquidTools,
  ...binanceTools,
].filter(
  (t) =>
    (t.inputSchema as any).shape?.start ||
    (t.inputSchema as any).shape?.start_time
);

// All tools that accept a limit param
const toolsWithLimit = [
  ...polymarketTools,
  ...kalshiTools,
  ...hyperliquidTools,
  ...binanceTools,
  ...discoveryTools,
  ...marketTools,
].filter((t) => (t.inputSchema as any).shape?.limit);

// ─── Symbol validation ────────────────────────────────────────────────────────

describe("Schema — symbol validation", () => {
  const VALID_SYMBOLS = ["BTC", "ETH", "SOL", "XRP"];
  const INVALID_SYMBOLS = ["DOGE", "SHIB", "btc", "eth", "BTC/USD", "", "123"];

  toolsWithSymbol.forEach((tool) => {
    describe(tool.name, () => {
      VALID_SYMBOLS.forEach((sym) => {
        it(`accepts symbol=${sym}`, () => {
          expect(() =>
            tool.inputSchema.parse({ symbol: sym, interval: "1h" })
          ).not.toThrow();
        });
      });

      INVALID_SYMBOLS.forEach((sym) => {
        it(`rejects symbol=${JSON.stringify(sym)}`, () => {
          expect(() =>
            tool.inputSchema.parse({ symbol: sym, interval: "1h" })
          ).toThrow();
        });
      });
    });
  });
});

// ─── Date range validation ────────────────────────────────────────────────────

describe("Schema — date range validation", () => {
  const VALID_DATES = [
    "2024-01-15T00:00:00Z",
    "2024-01-15T00:00:00+00:00",
    "2024-06-01T12:30:00Z",
  ];

  const INVALID_DATES = [
    "March 18 2024",
    "2024-01-15",          // missing time component
    "not-a-date",
    "01/15/2024",
    "",
  ];

  toolsWithDateRange.forEach((tool) => {
    const startField =
      (tool.inputSchema as any).shape?.start ? "start" : "start_time";
    const endField =
      (tool.inputSchema as any).shape?.end ? "end" : "end_time";

    describe(`${tool.name} — ${startField}/${endField}`, () => {
      VALID_DATES.forEach((date) => {
        it(`accepts ${startField}=${date}`, () => {
          expect(() =>
            tool.inputSchema.parse({
              symbol: "BTC",
              interval: "1h",
              [startField]: date,
            })
          ).not.toThrow();
        });
      });

      INVALID_DATES.forEach((date) => {
        it(`rejects ${startField}=${JSON.stringify(date)}`, () => {
          expect(() =>
            tool.inputSchema.parse({
              symbol: "BTC",
              interval: "1h",
              [startField]: date,
            })
          ).toThrow();
        });
      });
    });
  });
});

// ─── Limit validation ─────────────────────────────────────────────────────────

describe("Schema — limit validation", () => {
  toolsWithLimit.forEach((tool) => {
    const shape = (tool.inputSchema as any).shape;
    const maxLimit = shape?.limit?._def?.checks?.find(
      (c: any) => c.kind === "max"
    )?.value;

    it(`${tool.name} rejects limit=0`, () => {
      expect(() =>
        tool.inputSchema.parse({ symbol: "BTC", interval: "1h", limit: 0 })
      ).toThrow();
    });

    it(`${tool.name} rejects negative limit`, () => {
      expect(() =>
        tool.inputSchema.parse({ symbol: "BTC", interval: "1h", limit: -1 })
      ).toThrow();
    });

    if (maxLimit) {
      it(`${tool.name} rejects limit above max (${maxLimit})`, () => {
        expect(() =>
          tool.inputSchema.parse({
            symbol: "BTC",
            interval: "1h",
            limit: maxLimit + 1,
          })
        ).toThrow();
      });

      it(`${tool.name} accepts limit at max (${maxLimit})`, () => {
        expect(() =>
          tool.inputSchema.parse({
            symbol: "BTC",
            interval: "1h",
            limit: maxLimit,
          })
        ).not.toThrow();
      });
    }
  });
});

// ─── Tool-specific validation ─────────────────────────────────────────────────

describe("Schema — polymarket_candles specific", () => {
  const tool = polymarketTools.find((t) => t.name === "polymarket_candles")!;

  it("requires symbol", () => {
    expect(() =>
      tool.inputSchema.parse({ interval: "1h" })
    ).toThrow();
  });

  it("requires interval", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC" })
    ).toThrow();
  });

  it("accepts token_id as optional string", () => {
    expect(() =>
      tool.inputSchema.parse({
        symbol: "BTC",
        interval: "1h",
        token_id: "50201615508519114013775924648710266518098",
      })
    ).not.toThrow();
  });

  it("accepts market_id as optional string", () => {
    expect(() =>
      tool.inputSchema.parse({
        symbol: "BTC",
        interval: "1h",
        market_id: "0x440c3c38abb9b858d0ddf0224fdab458464cb086",
      })
    ).not.toThrow();
  });
});

describe("Schema — binance_liquidations specific", () => {
  const tool = binanceTools.find((t) => t.name === "binance_liquidations")!;

  it("accepts side=long", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", side: "long" })
    ).not.toThrow();
  });

  it("accepts side=short", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", side: "short" })
    ).not.toThrow();
  });

  it("rejects invalid side value", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", side: "both" })
    ).toThrow();
  });

  it("accepts min_usd as number", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", min_usd: 100000 })
    ).not.toThrow();
  });
});

describe("Schema — binance_ticker specific", () => {
  const tool = binanceTools.find((t) => t.name === "binance_ticker")!;

  it("rejects limit above 3600", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", source: "binance", limit: 3601 })
    ).toThrow();
  });

  it("accepts limit at 3600", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", source: "binance", limit: 3600 })
    ).not.toThrow();
  });

  it("accepts source=binance_futures", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", source: "binance_futures" })
    ).not.toThrow();
  });

  it("rejects invalid source", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", source: "coinbase" })
    ).toThrow();
  });
});

describe("Schema — kalshi_snapshots specific", () => {
  const tool = kalshiTools.find((t) => t.name === "kalshi_snapshots")!;

  it("accepts series=15m", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", series: "15m" })
    ).not.toThrow();
  });

  it("accepts series=daily", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", series: "daily" })
    ).not.toThrow();
  });

  it("rejects invalid series value", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", series: "weekly" })
    ).toThrow();
  });
});

describe("Schema — polymarket_snapshot_at specific", () => {
  const tool = polymarketTools.find((t) => t.name === "polymarket_snapshot_at")!;

  it("requires time field", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC" })
    ).toThrow();
  });

  it("rejects non-ISO time", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", time: "yesterday" })
    ).toThrow();
  });

  it("accepts valid ISO time", () => {
    expect(() =>
      tool.inputSchema.parse({ symbol: "BTC", time: "2024-03-18T12:00:00Z" })
    ).not.toThrow();
  });
});

describe("Schema — kwery_status specific", () => {
  const tool = discoveryTools.find((t) => t.name === "kwery_status")!;

  it("rejects limit above 200", () => {
    expect(() =>
      tool.inputSchema.parse({ limit: 201 })
    ).toThrow();
  });

  it("accepts limit at 200", () => {
    expect(() =>
      tool.inputSchema.parse({ limit: 200 })
    ).not.toThrow();
  });

  it("uses default limit of 50 when omitted", () => {
    const parsed = tool.inputSchema.parse({});
    expect(parsed.limit).toBe(50);
  });
});
