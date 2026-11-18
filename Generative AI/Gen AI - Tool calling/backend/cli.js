#!/usr/bin/env node

/**
 * CLI Entry Point
 * Loads environment variables and kicks off the interactive agent session.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load environment variables from the package directory or current workspace
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });
dotenv.config({ quiet: true });

import { runCli } from "./src/cli.js";

runCli().catch((err) => {
  console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
  process.exitCode = 1;
});
