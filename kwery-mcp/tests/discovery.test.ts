import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";
import { discoveryTools } from "../src/tools/discovery.js";

const client = new KweryClient("test_key_abc123");
const tool = (name: string) => discoveryTools.find((t) => t.name === name)!;

describe("kwery_sources", () => {
  it("calls /v1/sources and /v1/symbols in parallel", async () => {
    const urls: string[] = [];
    server.use(
      http.get(`${BASE}/v1/sources`, ({ request }) => {
        urls.push(request.url);
        return HttpResponse.json({ sources: [] });
      }),
      http.get(`${BASE}/v1/symbols`, ({ request }) => {
        urls.push(request.url);
        return HttpResponse.json({ symbols: [] });
      })
    );
    const result = await tool("kwery_sources").handler({}, client);
    expect(urls.some((u) => u.includes("/v1/sources"))).toBe(true);
    expect(urls.some((u) => u.includes("/v1/symbols"))).toBe(true);
    expect(result).toHaveProperty("sources");
    expect(result).toHaveProperty("symbols");
  });
});

describe("kwery_limits", () => {
  it("calls /v1/limits and returns plan info", async () => {
    const result: any = await tool("kwery_limits").handler({}, client);
    expect(result).toHaveProperty("plan");
    expect(result).toHaveProperty("credits");
  });
});

describe("kwery_status", () => {
  it("calls /v1/status with default limit", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/status`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ status: "ok", ingestion: [] });
      })
    );
    await tool("kwery_status").handler({ limit: 50 }, client);
    expect(capturedUrl).toContain("limit=50");
  });

  it("passes custom limit", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE}/v1/status`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ status: "ok", ingestion: [] });
      })
    );
    await tool("kwery_status").handler({ limit: 10 }, client);
    expect(capturedUrl).toContain("limit=10");
  });
});
