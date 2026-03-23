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

// Max characters before we trim the data array and warn about pagination.
// Claude Code rejects tool responses that exceed ~100k chars; 60k gives headroom.
const MAX_RESPONSE_CHARS = 60_000;

function safeSerialize(result: unknown): string {
  const full = JSON.stringify(result);
  if (full.length <= MAX_RESPONSE_CHARS) return full;

  // Only trim if the result has a data array we can slice
  if (
    result !== null &&
    typeof result === "object" &&
    "data" in result &&
    Array.isArray((result as any).data)
  ) {
    const r = result as any;
    const total = r.data.length;
    // Binary search for the largest row count that fits within MAX_RESPONSE_CHARS
    let lo = 1;
    let hi = total;
    let best = 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const candidate = JSON.stringify({
        ...r,
        data: r.data.slice(0, mid),
        _truncated: { warning: "", hint: "", after: null },
      });
      if (candidate.length <= MAX_RESPONSE_CHARS) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    const after = r.data[best - 1]?.timestamp ?? r.data[best - 1]?.time ?? null;
    return JSON.stringify({
      ...r,
      data: r.data.slice(0, best),
      _truncated: {
        warning: `Response too large. Showing ${best} of ${total} rows.`,
        hint: "Use the 'after' cursor or reduce 'limit' to paginate.",
        after,
      },
    });
  }

  // Fallback: truncate raw string with a warning appended
  return (
    full.slice(0, MAX_RESPONSE_CHARS) +
    `... [TRUNCATED — ${full.length} chars total. Use pagination params to fetch in smaller chunks.]`
  );
}

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
    { name: "kwery-mcp", version: "1.0.0" },
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
      const text = safeSerialize(result);
      return {
        content: [{ type: "text", text }],
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
