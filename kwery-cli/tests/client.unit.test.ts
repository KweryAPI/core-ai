import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server, BASE } from "./setup.js";
import { KweryClient } from "../src/client.js";

describe("KweryClient", () => {
  describe("constructor", () => {
    it("exits with code 1 if no API key and no env var", () => {
      const original = process.env.KWERY_API_KEY;
      delete process.env.KWERY_API_KEY;
      // getApiKey() calls process.exit(1) when no key is found
      expect(() => new KweryClient()).toThrow(/process\.exit.*1/);
      process.env.KWERY_API_KEY = original;
    });

    it("uses constructor arg over env var", () => {
      process.env.KWERY_API_KEY = "from_env";
      const client = new KweryClient("from_arg");
      // Should not throw
      expect(client).toBeDefined();
      delete process.env.KWERY_API_KEY;
    });
  });

  describe("get()", () => {
    let client: KweryClient;

    beforeEach(() => {
      client = new KweryClient("test_key_abc123");
    });

    it("sends X-API-Key header", async () => {
      let captured: Headers | undefined;
      server.use(
        http.get(`${BASE}/v1/limits`, ({ request }) => {
          captured = request.headers;
          return HttpResponse.json({});
        })
      );
      await client.get("/v1/limits");
      expect(captured?.get("x-api-key")).toBe("test_key_abc123");
    });

    it("appends defined query params and omits undefined ones", async () => {
      let capturedUrl: string | undefined;
      server.use(
        http.get(`${BASE}/v1/candles`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: [] });
        })
      );
      await client.get("/v1/candles", { symbol: "BTC", interval: "1h", after: undefined });
      expect(capturedUrl).toContain("symbol=BTC");
      expect(capturedUrl).toContain("interval=1h");
      expect(capturedUrl).not.toContain("after");
    });

    it("throws on 401 with descriptive message", async () => {
      server.use(
        http.get(`${BASE}/v1/limits`, () =>
          HttpResponse.json({ detail: "Bad key" }, { status: 401 })
        )
      );
      await expect(client.get("/v1/limits")).rejects.toThrow("Invalid or missing API key");
    });

    it("throws on 403 with pricing URL", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          HttpResponse.json({ detail: "Pro required" }, { status: 403 })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow("https://kwery.xyz/pricing");
    });

    it("throws on 429 rate limit", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          HttpResponse.json({}, { status: 429 })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow("Rate limit exceeded");
    });

    it("throws generic error on 500", async () => {
      server.use(
        http.get(`${BASE}/v1/candles`, () =>
          HttpResponse.json({ detail: "boom" }, { status: 500 })
        )
      );
      await expect(client.get("/v1/candles")).rejects.toThrow("Kwery API error 500");
    });
  });
});
