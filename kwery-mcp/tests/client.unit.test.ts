import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";

describe("KweryClient", () => {
  describe("constructor", () => {
    it("throws if no API key provided and no env var set", () => {
      const original = process.env.KWERY_API_KEY;
      delete process.env.KWERY_API_KEY;
      expect(() => new KweryClient()).toThrow("KWERY_API_KEY is required");
      process.env.KWERY_API_KEY = original;
    });

    it("accepts API key via constructor argument", () => {
      expect(() => new KweryClient("test_key_abc123")).not.toThrow();
    });

    it("reads API key from KWERY_API_KEY env var", () => {
      process.env.KWERY_API_KEY = "test_key_env";
      expect(() => new KweryClient()).not.toThrow();
      delete process.env.KWERY_API_KEY;
    });
  });

  describe("get()", () => {
    let client: KweryClient;

    beforeEach(() => {
      client = new KweryClient("test_key_abc123");
    });

    it("sends X-API-Key header", async () => {
      let capturedHeaders: Headers | undefined;
      server.use(
        http.get(`${BASE}/v1/limits`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ plan: "free" });
        })
      );
      await client.get("/v1/limits");
      expect(capturedHeaders?.get("x-api-key")).toBe("test_key_abc123");
    });

    it("sends User-Agent header", async () => {
      let capturedHeaders: Headers | undefined;
      server.use(
        http.get(`${BASE}/v1/limits`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ plan: "free" });
        })
      );
      await client.get("/v1/limits");
      expect(capturedHeaders?.get("user-agent")).toContain("kwery-mcp");
    });

    it("appends query params correctly", async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE}/v1/candles`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: [] });
        })
      );
      await client.get("/v1/candles", { symbol: "BTC", interval: "1h", limit: 100 });
      expect(capturedUrl).toContain("symbol=BTC");
      expect(capturedUrl).toContain("interval=1h");
      expect(capturedUrl).toContain("limit=100");
    });

    it("omits undefined params from query string", async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE}/v1/candles`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: [] });
        })
      );
      await client.get("/v1/candles", { symbol: "BTC", interval: undefined });
      expect(capturedUrl).not.toContain("interval");
    });

    it("throws descriptive error on 401", async () => {
      server.use(
        http.get(`${BASE}/v1/limits`, () =>
          HttpResponse.json({ detail: "Invalid key" }, { status: 401 })
        )
      );
      await expect(client.get("/v1/limits")).rejects.toThrow(
        "Invalid or missing API key"
      );
    });

    it("throws descriptive error on 403 with upgrade URL", async () => {
      server.use(
        http.get(`${BASE}/v1/ticker`, () =>
          HttpResponse.json({ detail: "Pro plan required" }, { status: 403 })
        )
      );
      await expect(client.get("/v1/ticker")).rejects.toThrow(
        "https://kwery.xyz/pricing"
      );
    });

    it("throws descriptive error on 429", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          HttpResponse.json({ detail: "Too many requests" }, { status: 429 })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("throws generic error on 500", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          HttpResponse.json({ detail: "Internal server error" }, { status: 500 })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow(
        "Kwery API error 500"
      );
    });

    it("handles malformed error response body gracefully", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          new HttpResponse("not json", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow("Kwery API error 500");
    });
  });
});
