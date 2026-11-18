import { spawn } from "node:child_process";
// [LANGCHAIN]: Import tool helper from LangChain to define the command execution tool
import { tool } from "@langchain/core/tools";
// [LANGCHAIN]: Zod schema defines the command argument for the model
import { z } from "zod";

const MAX_BUFFER = 15000;
const TIMEOUT_MS = 120000; // 2 minutes

/**
 * Strips secret API keys from environment variables before passing them to child processes.
 */
function getSanitizedEnv() {
  const env = { ...process.env };
  delete env.GROQ_API_KEY;
  return env;
}

/**
 * Runs a terminal command inside the workspace directory using the platform's default shell.
 */
export function runWorkspaceCommand(command, workspace) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: workspace,
      shell: true,
      windowsHide: true,
      env: getSanitizedEnv(),
    });

    let output = "";
    let timedOut = false;

    // Stream stdout and stderr live to the terminal so the user sees real-time progress
    child.stdout?.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > MAX_BUFFER) output = output.slice(-MAX_BUFFER);
      process.stdout.write(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > MAX_BUFFER) output = output.slice(-MAX_BUFFER);
      process.stderr.write(chunk);
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, TIMEOUT_MS);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve(`Command failed: ${err.message}`);
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      const statusLine = timedOut
        ? `Timed out after ${TIMEOUT_MS / 1000}s`
        : `Exit code: ${exitCode}`;

      resolve(`$ ${command}\n${statusLine}\n${output.trim() || "(no output)"}`);
    });
  });
}

/**
 * Creates the terminal execution tool exposed to the model.
 * [LANGCHAIN]: Wraps runWorkspaceCommand in LangChain's tool() structure with Zod schema.
 */
export function createCommandTool(workspace, confirmCommand) {
  return tool(
    async ({ command }) => {
      const allowed = await confirmCommand(command);
      if (!allowed) {
        return `Execution cancelled by user for command: "${command}"`;
      }
      return runWorkspaceCommand(command, workspace);
    },
    {
      name: "execute_command",
      description:
        "Execute a shell command inside the workspace directory (e.g. 'npm install', 'node script.js', 'git status').",
      schema: z.object({
        command: z.string().describe("The exact shell command to run in the workspace"),
      }),
    }
  );
}
