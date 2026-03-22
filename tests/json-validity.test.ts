import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");

const JSON_FILES = [
  "package.json",
  "kwery-mcp/package.json",
  "kwery-cli/package.json",
  "kwery-plugin/.claude-plugin/plugin.json",
  "kwery-plugin/.mcp.json",
  "kwery-cursor/.cursor/mcp.json",
];

describe("JSON files — parse without error", () => {
  JSON_FILES.forEach((file) => {
    it(`${file} is valid JSON`, () => {
      expect(existsSync(resolve(REPO_ROOT, file)), `${file} does not exist`).toBe(true);
      const content = readFileSync(resolve(REPO_ROOT, file), "utf8");
      expect(() => JSON.parse(content), `${file} is not valid JSON`).not.toThrow();
    });
  });
});

describe("JSON files — required fields", () => {
  it("root package.json has name, scripts, workspaces", () => {
    const json = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf8"));
    expect(json.name).toBeTruthy();
    expect(json.scripts).toBeDefined();
    expect(json.workspaces).toBeInstanceOf(Array);
  });

  it("root package.json has test:structure script", () => {
    const json = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf8"));
    expect(json.scripts["test:structure"]).toBeTruthy();
  });

  it("root package.json has test:install script", () => {
    const json = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf8"));
    expect(json.scripts["test:install"]).toBeTruthy();
  });

  it("kwery-mcp package.json has test and build scripts", () => {
    const json = JSON.parse(
      readFileSync(resolve(REPO_ROOT, "kwery-mcp/package.json"), "utf8")
    );
    expect(json.scripts.test).toBeTruthy();
    expect(json.scripts.build).toBeTruthy();
  });

  it("kwery-cli package.json has bin field pointing to kwery", () => {
    const json = JSON.parse(
      readFileSync(resolve(REPO_ROOT, "kwery-cli/package.json"), "utf8")
    );
    expect(json.bin?.kwery).toBeTruthy();
  });

  it("plugin.json has name=kwery", () => {
    const json = JSON.parse(
      readFileSync(resolve(REPO_ROOT, "kwery-plugin/.claude-plugin/plugin.json"), "utf8")
    );
    expect(json.name).toBe("kwery");
  });

  it("plugin.json has semver version", () => {
    const json = JSON.parse(
      readFileSync(resolve(REPO_ROOT, "kwery-plugin/.claude-plugin/plugin.json"), "utf8")
    );
    expect(json.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("MCP config files — structure", () => {
  const MCP_FILES = [
    "kwery-plugin/.mcp.json",
    "kwery-cursor/.cursor/mcp.json",
  ];

  MCP_FILES.forEach((file) => {
    it(`${file} has mcpServers.kwery.command=npx`, () => {
      const json = JSON.parse(
        readFileSync(resolve(REPO_ROOT, file), "utf8")
      );
      expect(json.mcpServers?.kwery?.command).toBe("npx");
    });

    it(`${file} has -y in args`, () => {
      const json = JSON.parse(
        readFileSync(resolve(REPO_ROOT, file), "utf8")
      );
      expect(json.mcpServers?.kwery?.args).toContain("-y");
    });

    it(`${file} passes KWERY_API_KEY`, () => {
      const json = JSON.parse(
        readFileSync(resolve(REPO_ROOT, file), "utf8")
      );
      expect(json.mcpServers?.kwery?.env?.KWERY_API_KEY).toBeTruthy();
    });
  });
});
