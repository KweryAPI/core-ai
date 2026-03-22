import { describe, it, expect, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { http, HttpResponse } from "msw";
import { server as mswServer, BASE } from "./setup.js";
import { ALL_TOOLS } from "../src/server.js";

// Create a fresh MCP client connected to a fresh server via in-memory transport
async function createTestClient(): Promise<Client> {
  const { createServer } = await import("../src/server.js");
  const mcpServer = createServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await mcpServer.connect(serverTransport);
  const client = new Client(
    { name: "kwery-test-client", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(clientTransport);
  return client;
}

describe("MCP protocol — ListTools", () => {
  it("returns the correct total number of tools", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    expect(tools.length).toBe(ALL_TOOLS.length);
  });

  it("every tool has a name", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    tools.forEach((tool) => {
      expect(tool.name).toBeTruthy();
      expect(typeof tool.name).toBe("string");
    });
  });

  it("every tool has a description", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    tools.forEach((tool) => {
      expect(tool.description).toBeTruthy();
      expect(typeof tool.description).toBe("string");
    });
  });

  it("every tool has an inputSchema", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    tools.forEach((tool) => {
      expect(tool.inputSchema).toBeTruthy();
      expect(tool.inputSchema.type).toBe("object");
    });
  });

  it("tool names are unique", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("includes expected platform namespaces", async () => {
    const client = await createTestClient();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);

    const expectedPrefixes = [
      "kwery_",
      "polymarket_",
      "kalshi_",
      "hyperliquid_",
      "binance_",
      "chainlink_",
    ];

    expectedPrefixes.forEach((prefix) => {
      const hasPrefix = names.some((n) => n.startsWith(prefix));
      expect(hasPrefix, `No tool found with prefix: ${prefix}`).toBe(true);
    });
  });
});

describe("MCP protocol — CallTool", () => {
  beforeEach(() => {
    process.env.KWERY_API_KEY = "test_key_abc123";
  });

  it("returns text content for a valid tool call", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/limits`, () =>
        HttpResponse.json({
          plan: "pro",
          credits: { used: 500, limit: 100000, remaining: 99500 },
        })
      )
    );

    const client = await createTestClient();
    const result = await client.callTool({
      name: "kwery_limits",
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
  });

  it("response content is valid JSON", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/limits`, () =>
        HttpResponse.json({ plan: "pro", credits: { remaining: 5000 } })
      )
    );

    const client = await createTestClient();
    const result = await client.callTool({
      name: "kwery_limits",
      arguments: {},
    });

    const text = (result.content[0] as any).text;
    expect(() => JSON.parse(text)).not.toThrow();
    const parsed = JSON.parse(text);
    expect(parsed.plan).toBe("pro");
  });

  it("returns isError=true for unknown tool name", async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: "this_tool_does_not_exist",
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain("Unknown tool");
  });

  it("returns isError=true when Zod validation fails", async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: "polymarket_candles",
      arguments: { symbol: "DOGE", interval: "1h" }, // DOGE not in enum
    });

    expect(result.isError).toBe(true);
  });

  it("returns isError=true when required param is missing", async () => {
    const client = await createTestClient();
    const result = await client.callTool({
      name: "polymarket_candles",
      arguments: { interval: "1h" }, // missing symbol
    });

    expect(result.isError).toBe(true);
  });

  it("returns isError=true when API returns 401", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/limits`, () =>
        HttpResponse.json({ detail: "Invalid key" }, { status: 401 })
      )
    );

    const client = await createTestClient();
    const result = await client.callTool({
      name: "kwery_limits",
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain("Invalid or missing API key");
  });

  it("returns isError=true when API returns 403", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/ticker`, () =>
        HttpResponse.json({ detail: "Pro plan required" }, { status: 403 })
      )
    );

    const client = await createTestClient();
    const result = await client.callTool({
      name: "binance_ticker",
      arguments: { symbol: "BTC", source: "binance" },
    });

    expect(result.isError).toBe(true);
    expect((result.content[0] as any).text).toContain("kwery.xyz/pricing");
  });

  it("handles empty arguments object gracefully", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/limits`, () =>
        HttpResponse.json({ plan: "free", credits: { remaining: 100 } })
      )
    );

    const client = await createTestClient();
    // kwery_limits takes no params so empty args should work fine
    const result = await client.callTool({
      name: "kwery_limits",
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
  });

  it("handles omitted arguments gracefully", async () => {
    mswServer.use(
      http.get(`${BASE}/v1/limits`, () =>
        HttpResponse.json({ plan: "free", credits: { remaining: 100 } })
      )
    );

    const client = await createTestClient();
    // kwery_limits accepts no params; calling with undefined arguments works
    const result = await client.callTool({
      name: "kwery_limits",
      arguments: undefined as any,
    });

    expect(result.isError).toBeFalsy();
  });
});
