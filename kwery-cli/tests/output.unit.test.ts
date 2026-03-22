import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatJson, formatCsv, formatTable, printOutput, printError } from "../src/output.js";

describe("formatJson", () => {
  it("formats plain object with 2-space indent", () => {
    const result = formatJson({ plan: "pro", credits: 100 });
    expect(result).toBe('{\n  "plan": "pro",\n  "credits": 100\n}');
  });

  it("formats arrays", () => {
    const result = formatJson([1, 2, 3]);
    expect(result).toContain("[");
    expect(result).toContain("1");
  });
});

describe("formatCsv", () => {
  it("returns empty string for empty array", () => {
    expect(formatCsv([])).toBe("");
  });

  it("produces header row + data rows", () => {
    const rows = [{ symbol: "BTC", price: 67000 }];
    const csv = formatCsv(rows);
    expect(csv).toContain("symbol,price");
    expect(csv).toContain("BTC,67000");
  });

  it("escapes commas in values", () => {
    const rows = [{ name: "Hello, World", value: 1 }];
    const csv = formatCsv(rows);
    expect(csv).toContain('"Hello, World"');
  });

  it("escapes double quotes in values", () => {
    const rows = [{ name: 'He said "hi"', value: 1 }];
    const csv = formatCsv(rows);
    expect(csv).toContain('"He said ""hi"""');
  });

  it("handles null/undefined values as empty string", () => {
    const rows = [{ a: null, b: undefined, c: "ok" }];
    const csv = formatCsv(rows as any);
    expect(csv).toContain(",,ok");
  });
});

describe("formatTable", () => {
  it("returns (no data) for empty array", () => {
    expect(formatTable([])).toBe("(no data)");
  });

  it("includes all column headers", () => {
    const rows = [{ symbol: "BTC", price: 67000 }];
    const table = formatTable(rows);
    expect(table).toContain("symbol");
    expect(table).toContain("price");
  });

  it("includes row values", () => {
    const rows = [{ symbol: "BTC", price: 67000 }];
    const table = formatTable(rows);
    expect(table).toContain("BTC");
    expect(table).toContain("67000");
  });

  it("aligns columns with padding", () => {
    const rows = [
      { symbol: "BTC", price: 67000 },
      { symbol: "ETHETH", price: 3200 },
    ];
    const table = formatTable(rows);
    const lines = table.split("\n");
    // Header and both rows should exist
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });
});

describe("printOutput", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("defaults to json format", () => {
    printOutput({ plan: "pro" });
    expect(logSpy).toHaveBeenCalledWith('{\n  "plan": "pro"\n}');
  });

  it("json format stringifies data", () => {
    printOutput([1, 2], "json");
    expect(logSpy).toHaveBeenCalledWith("[\n  1,\n  2\n]");
  });

  it("csv format prints CSV from array data", () => {
    printOutput([{ symbol: "BTC", price: 67000 }], "csv");
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("symbol,price");
    expect(output).toContain("BTC,67000");
  });

  it("csv format unwraps .data array from API response shape", () => {
    printOutput({ data: [{ symbol: "ETH" }] }, "csv");
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("symbol");
    expect(output).toContain("ETH");
  });

  it("table format prints table from array data", () => {
    printOutput([{ symbol: "BTC", price: 67000 }], "table");
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("symbol");
    expect(output).toContain("BTC");
  });

  it("table format wraps plain object in array", () => {
    printOutput({ plan: "pro" }, "table");
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain("plan");
    expect(output).toContain("pro");
  });
});

describe("printError", () => {
  it("writes to stderr with Error: prefix", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    printError("something went wrong");
    expect(errSpy).toHaveBeenCalledWith("Error: something went wrong");
    errSpy.mockRestore();
  });
});
