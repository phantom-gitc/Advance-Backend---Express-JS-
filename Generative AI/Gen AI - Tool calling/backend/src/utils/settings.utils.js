import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { APP_NAME, SETTINGS_FILE } from "./constant.js";

// Determine system configuration directory (AppData on Windows, .config on Linux/macOS)
const configBase =
  process.env.APPDATA ||
  process.env.XDG_CONFIG_HOME ||
  path.join(os.homedir(), ".config");

const configDirectory = path.join(configBase, APP_NAME);
export const settingsPath = path.join(configDirectory, SETTINGS_FILE);

/**
 * Reads user settings from the global JSON configuration file.
 */
async function readSettings() {
  try {
    const raw = await readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Settings file must contain a valid JSON object.");
    }
    return parsed;
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw new Error(`Failed to read settings from ${settingsPath}: ${err.message}`);
  }
}

/**
 * Returns the saved Groq API key from global configuration, or null if not configured.
 */
export async function getSavedApiKey() {
  const settings = await readSettings();
  if (typeof settings.groqApiKey !== "string") return null;
  return settings.groqApiKey.trim() || null;
}

/**
 * Persists the Groq API key to the global configuration directory.
 */
export async function saveApiKey(apiKey) {
  const settings = await readSettings();
  settings.groqApiKey = apiKey;

  await mkdir(configDirectory, { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600, // Read/write only by owner
  });
}
