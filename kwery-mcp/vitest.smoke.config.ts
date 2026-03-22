import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Load .env from repo root (two levels up from kwery-mcp/)
config({ path: "../.env" });

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/smoke/setup.ts"],
    include: ["tests/smoke/**/*.test.ts"],
  },
});
