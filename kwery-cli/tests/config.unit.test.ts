import { describe, it, expect, afterEach, vi } from "vitest";

// Mock the conf module before importing config
vi.mock("conf", () => {
  let store: Record<string, unknown> = {};
  return {
    default: class MockConf {
      store = store;
      get(key: string) { return store[key]; }
      set(key: string, value: unknown) { store[key] = value; }
      delete(key: string) { delete store[key]; }
      clear() { store = {}; this.store = store; }
    }
  };
});

describe("Config — API key resolution", () => {
  const originalEnv = process.env.KWERY_API_KEY;

  afterEach(() => {
    if (originalEnv) {
      process.env.KWERY_API_KEY = originalEnv;
    } else {
      delete process.env.KWERY_API_KEY;
    }
  });

  it("prefers KWERY_API_KEY env var over stored config", async () => {
    process.env.KWERY_API_KEY = "env_key_123";
    const { getApiKey, config } = await import("../src/config.js");
    config.set("apiKey", "stored_key_456");
    expect(getApiKey()).toBe("env_key_123");
  });

  it("falls back to stored config when env var not set", async () => {
    delete process.env.KWERY_API_KEY;
    const { getApiKey, config } = await import("../src/config.js");
    config.set("apiKey", "stored_key_789");
    expect(getApiKey()).toBe("stored_key_789");
  });

  it("calls process.exit(1) when no key available", async () => {
    delete process.env.KWERY_API_KEY;
    const { getApiKey, config } = await import("../src/config.js");
    config.delete("apiKey");

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => getApiKey()).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleSpy.mock.calls[0][0]).toMatch(/api key/i);

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

describe("Config — storage", () => {
  it("stores and retrieves a value", async () => {
    const { config } = await import("../src/config.js");
    config.set("apiKey" as any, "test_value");
    expect(config.get("apiKey" as any)).toBe("test_value");
  });

  it("deletes a value", async () => {
    const { config } = await import("../src/config.js");
    config.set("apiKey" as any, "to_delete");
    config.delete("apiKey" as any);
    expect(config.get("apiKey" as any)).toBeUndefined();
  });

  it("clears all values", async () => {
    const { config } = await import("../src/config.js");
    config.set("apiKey" as any, "value1");
    config.clear();
    expect(config.get("apiKey" as any)).toBeUndefined();
  });
});
