#!/usr/bin/env node
/**
 * Smoke test the kwery CLI against the real API.
 * Run after `pnpm build` from the repo root.
 *
 * Usage:
 *   node scripts/smoke-cli.mjs
 *   (KWERY_API_KEY is loaded from .env automatically)
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env without requiring dotenv (not available at repo root)
try {
  const envPath = resolve(__dirname, "../.env");
  const lines = readFileSync(envPath, "utf8").split("\n");
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
  console.log("KWERY_API_KEY not set — skipping CLI smoke tests");
  process.exit(0);
}

const CLI = `node ${resolve(__dirname, "../kwery-cli/dist/index.js")}`;
let pass = 0;
let fail = 0;

function check(label, cmd, expected, env) {
  try {
    const output = execSync(cmd, {
      env: env ?? { ...process.env, KWERY_API_KEY: API_KEY },
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (output.includes(expected)) {
      console.log(`✓ ${label}`);
      pass++;
    } else {
      console.log(`✗ ${label}`);
      console.log(`  Expected to find: ${expected}`);
      console.log(`  Got: ${output.slice(0, 120)}`);
      fail++;
    }
  } catch (err) {
    const output = (err.stdout ?? "") + (err.stderr ?? "");
    if (output.includes(expected)) {
      console.log(`✓ ${label}`);
      pass++;
    } else {
      console.log(`✗ ${label}`);
      console.log(`  Expected to find: ${expected}`);
      console.log(`  Got: ${output.slice(0, 120)}`);
      fail++;
    }
  }
}

console.log("Running CLI smoke tests...\n");

// Account / discovery
check("limits returns plan",      `${CLI} limits --format json`,                                       '"plan"');
check("status returns status",    `${CLI} status --format json`,                                       '"status"');
check("sources returns sources",  `${CLI} sources --format json`,                                      '"sources"');

// Markets
check("markets polymarket BTC",   `${CLI} markets --source polymarket --symbol BTC --limit 3 --format json`, '"slug"');
check("market by identifier",     `${CLI} market 0x440c3c38abb9b858d0ddf0224fdab458464cb086eb63f0328e9a307ea44338c4 --format json`, '"condition_id"');

// Candles
check("binance spot candles",     `${CLI} candles -s BTC -i 1h --source binance --limit 3 --format json`,          '"open"');
check("binance futures candles",  `${CLI} candles -s BTC -i 1h --source binance_futures --limit 3 --format json`,  '"count"');
check("chainlink candles",        `${CLI} candles -s BTC -i 1h --source chainlink --limit 3 --format json`,        '"count"');

// Error handling — run CLI without key set; path may contain spaces so quote it
check(
  "missing key gives clear error",
  `node "${resolve(__dirname, "../kwery-cli/dist/index.js")}" limits`,
  "KWERY_API_KEY",
  { ...process.env, KWERY_API_KEY: "" }
);

console.log(`\nResults: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
