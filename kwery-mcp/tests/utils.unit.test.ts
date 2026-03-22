import { describe, it, expect } from "vitest";
import { formatResult, formatError } from "../src/utils.js";

describe("formatResult", () => {
  it("serializes an object as indented JSON", () => {
    expect(formatResult({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("serializes an array", () => {
    expect(formatResult([1, 2])).toBe('[\n  1,\n  2\n]');
  });

  it("serializes null", () => {
    expect(formatResult(null)).toBe("null");
  });
});

describe("formatError", () => {
  it("returns the message for an Error instance", () => {
    expect(formatError(new Error("boom"))).toBe("boom");
  });

  it("stringifies non-Error values", () => {
    expect(formatError("something went wrong")).toBe("something went wrong");
    expect(formatError(42)).toBe("42");
  });
});
