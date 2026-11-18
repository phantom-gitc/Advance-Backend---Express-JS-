import { stdin, stdout } from "node:process";

/**
 * Prompts the user for a secret (such as an API key) in the terminal
 * with masked input characters ('*') instead of echoing plaintext.
 */
export async function promptForSecret(message) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error(
      "Terminal does not support raw mode. Please set the GROQ_API_KEY environment variable."
    );
  }

  stdout.write(message);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let secret = "";

    function finish(err) {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (err) reject(err);
      else resolve(secret.trim());
    }

    function onData(chunk) {
      for (const char of chunk.toString("utf8")) {
        // Handle Ctrl+C cancel
        if (char === "\u0003") {
          finish(new Error("Entry cancelled by user."));
          return;
        }
        // Handle Enter
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }
        // Handle Backspace
        if (char === "\u007f" || char === "\b") {
          if (secret) {
            secret = secret.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        // Mask printable input
        if (char >= " ") {
          secret += char;
          stdout.write("*");
        }
      }
    }

    stdin.on("data", onData);
  });
}
