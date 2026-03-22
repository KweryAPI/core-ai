import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");

describe("MCP configs — npx args include kwery-mcp@latest", () => {
  const configs = [
    "kwery-plugin/.mcp.json",
    "kwery-cursor/.cursor/mcp.json",
  ];

  configs.forEach((file) => {
    it(`${file} references kwery-mcp@latest`, () => {
      const json = JSON.parse(readFileSync(resolve(REPO_ROOT, file), "utf8"));
      const args: string[] = json.mcpServers?.kwery?.args ?? [];
      expect(args.some((a: string) => a.includes("kwery-mcp"))).toBe(true);
    });
  });
});

describe("MCP configs — no hardcoded API keys", () => {
  const configs = [
    "kwery-plugin/.mcp.json",
    "kwery-cursor/.cursor/mcp.json",
  ];

  configs.forEach((file) => {
    it(`${file} does not contain a hardcoded API key`, () => {
      const content = readFileSync(resolve(REPO_ROOT, file), "utf8");
      // Real keys would be long alphanumeric strings
      expect(content).not.toMatch(/KWERY_API_KEY["']?\s*:\s*["'][a-zA-Z0-9_]{20,}/);
      // Should only contain the env var reference
      expect(content).toContain("KWERY_API_KEY");
    });
  });
});
