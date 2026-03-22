#!/usr/bin/env node
/**
 * Regenerate test fixtures from the live API.
 * Run this whenever the API response shape changes, then re-run the full
 * test suite to catch any fixture mismatches.
 *
 * Usage:
 *   node scripts/update-fixtures.mjs
 *   (KWERY_API_KEY is loaded from .env automatically)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env without requiring dotenv
try {
  const lines = readFileSync(resolve(__dirname, "../.env"), "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env is optional */ }

const API_KEY = process.env.KWERY_API_KEY;
if (!API_KEY) {
  console.error("KWERY_API_KEY is required");
  process.exit(1);
}

const BASE = process.env.KWERY_BASE_URL ?? "https://kwery-api.com";
const FIXTURES = resolve(__dirname, "../kwery-mcp/tests/fixtures");

console.log(`Updating fixtures from ${BASE}...\n`);

async function fetchAndWrite(filename, path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  const json = await res.json();
  writeFileSync(
    resolve(FIXTURES, filename),
    JSON.stringify(json, null, 2) + "\n"
  );
  console.log(`✓ ${filename}`);
}

const endpoints = [
  ["limits.json",          "/v1/limits"],
  ["sources.json",         "/v1/sources"],
  ["symbols.json",         "/v1/symbols"],
  ["markets.json",         "/v1/markets?source=polymarket&symbol=BTC&limit=1"],
  ["candles.json",         "/v1/polymarket/candles?symbol=BTC&interval=1h&limit=1"],
  ["trades.json",          "/v1/trades?source=polymarket&symbol=BTC&limit=1"],
  ["snapshots.json",       "/v1/polymarket/snapshots?symbol=BTC&limit=1"],
  ["kalshi-markets.json",  "/v1/kalshi?symbol=BTC"],
  ["kalshi-prices.json",   "/v1/kalshi/BTC?limit=1"],
  ["hyperliquid-ohlcv.json", "/v1/hyperliquid/BTC?limit=1"],
  ["funding.json",         "/v1/funding?symbol=BTC&source=binance_futures&limit=1"],
  ["open-interest.json",   "/v1/open-interest?symbol=BTC&source=binance_futures&limit=1"],
  ["liquidations.json",    "/v1/liquidations?symbol=BTC&limit=1"],
  ["flow.json",            "/v1/flow?symbol=BTC&interval=1h&limit=1"],
];

let failed = 0;
for (const [filename, path] of endpoints) {
  try {
    await fetchAndWrite(filename, path);
  } catch (err) {
    console.error(`✗ ${filename}: ${err.message}`);
    failed++;
  }
}

console.log("\nAll fixtures updated. Run 'pnpm test' to verify nothing broke.");
if (failed > 0) process.exit(1);
