import { config } from "dotenv";

// Load .env in the worker context so KWERY_API_KEY is available to tests.
// vitest.config.ts loads dotenv in the main process; this runs in each worker.
config({ path: "../.env" });
