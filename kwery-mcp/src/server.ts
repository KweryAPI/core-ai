import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { KweryClient } from "./client.js";
import { discoveryTools } from "./tools/discovery.js";
import { marketTools } from "./tools/markets.js";
import { polymarketTools } from "./tools/polymarket.js";
import { kalshiTools } from "./tools/kalshi.js";
import { hyperliquidTools } from "./tools/hyperliquid.js";
import { binanceTools } from "./tools/binance.js";

export const ALL_TOOLS = [
  ...discoveryTools,
  ...marketTools,
  ...polymarketTools,
  ...kalshiTools,
  ...hyperliquidTools,
  ...binanceTools,
];

export function createServer(): Server {
  const s = new Server(
    { name: "kwery-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  s.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    })),
  }));

  s.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = ALL_TOOLS.find((t) => t.name === request.params.name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
    }

    try {
      const params = tool.inputSchema.parse(request.params.arguments ?? {});
      const client = new KweryClient();
      const result = await (tool as any).handler(params, client);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  });

  return s;
}

export const server = createServer();
