import { GROQ_MODELS_URL } from "./constant.js";

/**
 * Validates a Groq API key by sending a quick ping to their models endpoint.
 * Returns true if valid, false if rejected (401 Unauthorized).
 */
export async function isGroqApiKeyValid(apiKey) {
  try {
    const response = await fetch(GROQ_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.status === 401) {
      return false;
    }

    return response.ok;
  } catch (err) {
    throw new Error(`Failed to verify Groq API key: ${err.message}`);
  }
}
