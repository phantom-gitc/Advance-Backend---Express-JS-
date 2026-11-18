/**
 * ============================================================================
 * [CLI INTERFACE & INTERACTIVE RUNNER]
 *
 * Manages the CLI session, user permissions (y/n/all), and conversation loop.
 *
 * LangChain / LangGraph integration:
 * - [LANGCHAIN]: SystemMessage & HumanMessage format conversation messages.
 * - [LANGCHAIN]: ChatGroq configures the inference client with Groq.
 * - [LANGGRAPH]: graph.stream() drives the multi-step agent loop in real-time.
 * ============================================================================
 */

import { realpath, stat } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// [LANGCHAIN]: Message abstractions for system instructions and human input
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
// [LANGCHAIN]: Model provider wrapper for Groq
import { ChatGroq } from "@langchain/groq";

import { DEFAULT_MODEL } from "./utils/constant.js";
import { promptForSecret } from "./utils/readline.js";
import {
  getSavedApiKey,
  saveApiKey,
  settingsPath,
} from "./utils/settings.utils.js";
import { isGroqApiKeyValid } from "./utils/groq.utils.js";
import { createCodingAgent } from "./graph/agent.js";

/**
 * Builds the system instructions for the autonomous coding agent.
 */
function buildSystemPrompt(workspace) {
  return (
    `You are an expert autonomous CLI coding agent (like Claude Code) operating in: "${workspace}".\n` +
    `Fulfill the user's software engineering requests directly by executing tools on disk.\n\n` +
    `CRITICAL INSTRUCTIONS:\n` +
    `1. ACT DIRECTLY - DO NOT JUST TALK:\n` +
    `   - When asked to create, edit, build, test, fix, or organize files and directories, NEVER simply print instructions or code blocks on the terminal.\n` +
    `   - IMMEDIATELY invoke the appropriate tools (make_directory, write_file, edit_file, execute_command) to execute changes on disk.\n` +
    `   - Do not ask for user confirmation in chat; tool executions handle confirmation automatically.\n` +
    `2. AVAILABLE TOOLS:\n` +
    `   - make_directory: Create folders/directories (supports nested paths).\n` +
    `   - write_file: Write full content to a file (creates parent folders automatically).\n` +
    `   - edit_file: Replace specific target text in an existing file.\n` +
    `   - read_file: Inspect existing files in the workspace.\n` +
    `   - list_files: Discover files and directory structures in the workspace.\n` +
    `   - execute_command: Run any shell command in the workspace (npm install, node app.js, git, etc.).\n` +
    `   - delete_file: Delete a file or directory when requested.\n` +
    `3. WORKFLOW:\n` +
    `   - For folder and file creation: Call make_directory and write_file.\n` +
    `   - For package installation or testing: Call execute_command.\n` +
    `   - Keep chat responses concise. After executing tools, give a clear summary of what was accomplished.`
  );
}

/**
 * Main CLI entry point.
 */
export async function runCli() {
  const args = process.argv.slice(2);
  let autoApprove = false;
  let targetDir = null;

  // Parse command line arguments
  for (const arg of args) {
    if (arg === "-y" || arg === "--yes" || arg === "--auto" || arg === "--auto-approve") {
      autoApprove = true;
    } else if (arg === "-h" || arg === "--help") {
      console.log(`
Usage: agent [workspace_dir] [options]

Arguments:
  workspace_dir       Path to the project workspace (defaults to current folder)

Options:
  -y, --yes, --auto   Auto-approve all file writes and commands (autonomous mode)
  -h, --help          Show this help message

In-session Commands:
  /auto               Toggle auto-approval mode on/off
  /status             Display current workspace, model, and approval settings
  /clear              Clear conversation memory
  /help               Show available commands
  /exit               Exit the session
`);
      process.exit(0);
    } else if (!arg.startsWith("-")) {
      targetDir = arg;
    }
  }

  // Resolve target workspace directory
  const workspace = await realpath(path.resolve(targetDir || process.cwd()));
  if (!(await stat(workspace)).isDirectory()) {
    throw new Error(`Not a directory: ${workspace}`);
  }

  // Resolve API key from environment, saved config, or user prompt
  const envKey = process.env.GROQ_API_KEY?.trim();
  let apiKey = envKey || (await getSavedApiKey());
  let needsPersisting = !envKey && !apiKey;

  if (!apiKey) {
    apiKey = await promptForSecret("Groq API key (input hidden): ");
    if (!apiKey) throw new Error("API key cannot be empty.");
  }

  // Validate key against Groq API
  let isValid = await isGroqApiKeyValid(apiKey);
  if (!isValid && !envKey) {
    console.log("Saved key was rejected by Groq. Please enter a valid key.");
    apiKey = await promptForSecret("Groq API key (input hidden): ");
    if (!apiKey) throw new Error("API key cannot be empty.");
    needsPersisting = true;
    isValid = await isGroqApiKeyValid(apiKey);
  }

  if (!isValid) {
    throw new Error("Invalid Groq API key. Please check your credentials.");
  }

  if (needsPersisting) {
    await saveApiKey(apiKey);
    console.log(`API key saved to ${settingsPath}`);
  }

  // Session state tracking auto-approval
  const session = { autoApprove };
  const rl = createInterface({ input: stdin, output: stdout });

  /**
   * Prompts user before modifying files or running commands unless auto-approve is active.
   */
  const requestApproval = async (promptMsg) => {
    if (session.autoApprove) return true;

    const answer = (await rl.question(`${promptMsg} [y/N/a(all)] `)).trim().toLowerCase();
    if (answer === "a" || answer === "all") {
      session.autoApprove = true;
      console.log("  \x1b[32m✓ Auto-approve enabled for this session.\x1b[0m");
      return true;
    }
    return answer === "y" || answer === "yes";
  };

  const confirmWrite = async (filePath, action = "write") => {
    if (session.autoApprove) {
      console.log(`  \x1b[33m⚡ [Auto-approved]\x1b[0m ${action}: \x1b[36m${filePath}\x1b[0m`);
      return true;
    }
    return requestApproval(`\x1b[33m? Allow ${action}\x1b[0m \x1b[36m${filePath}\x1b[0m?`);
  };

  const confirmCommand = async (command) => {
    if (session.autoApprove) {
      console.log(`  \x1b[33m⚡ [Auto-approved]\x1b[0m execute: \x1b[36m${command}\x1b[0m`);
      return true;
    }
    return requestApproval(`\x1b[33m? Execute command\x1b[0m "\x1b[36m${command}\x1b[0m"?`);
  };

  const modelName = process.env.GROQ_MODEL || DEFAULT_MODEL;

  // [LANGCHAIN]: Instantiate the Groq chat model
  const model = new ChatGroq({
    apiKey,
    model: modelName,
    temperature: 0, // Deterministic output is optimal for code generation & tools
  });

  // [LANGGRAPH]: Compile the agent graph with tools and approval handlers
  const graph = createCodingAgent({
    model,
    workspace,
    confirmWrite,
    confirmCommand,
  });

  // [LANGCHAIN]: Initialize message history with the system prompt
  const systemMessage = new SystemMessage(buildSystemPrompt(workspace));
  let messages = [systemMessage];

  // Welcome banner
  console.log(`\n\x1b[1m\x1b[35m=== CLI Coding Agent ===\x1b[0m`);
  console.log(`📁 Workspace:    \x1b[36m${workspace}\x1b[0m`);
  console.log(`🧠 Model:        \x1b[33m${modelName}\x1b[0m`);
  console.log(
    `🛡️  Auto-approve: \x1b[32m${session.autoApprove ? "Enabled (autonomous)" : "Disabled (prompts for confirmation)"}\x1b[0m`
  );
  console.log("Commands: /auto to toggle approval, /clear to reset, /help for info, /exit to quit.\n");

  try {
    while (true) {
      let input;
      try {
        input = (await rl.question("\x1b[1m\x1b[34magent>\x1b[0m ")).trim();
      } catch (err) {
        if (err.name === "AbortError") break;
        throw err;
      }

      if (!input) continue;

      // Handle slash commands
      if (input === "/exit" || input === "/quit") {
        console.log("Goodbye!");
        break;
      }
      if (input === "/help") {
        console.log(`
Available commands:
  /auto     - Toggle auto-approval mode on/off
  /status   - Display workspace, model, and configuration
  /clear    - Reset conversation memory
  /help     - Show this help message
  /exit     - Exit the session
`);
        continue;
      }
      if (input === "/auto") {
        session.autoApprove = !session.autoApprove;
        console.log(
          `Auto-approve is now \x1b[1m${session.autoApprove ? "\x1b[32mENABLED\x1b[0m" : "\x1b[33mDISABLED\x1b[0m"}.`
        );
        continue;
      }
      if (input === "/status") {
        console.log(`
Workspace:     ${workspace}
Model:         ${modelName}
Auto-approve:  ${session.autoApprove ? "Enabled" : "Disabled"}
History count: ${messages.length} messages
`);
        continue;
      }
      if (input === "/clear") {
        messages = [systemMessage];
        console.log("\x1b[32mConversation memory cleared.\x1b[0m\n");
        continue;
      }

      // [LANGCHAIN]: Append user input as HumanMessage to the conversation state
      messages.push(new HumanMessage(input));

      try {
        // [LANGGRAPH]: Stream node updates (agent <-> tools) as they execute
        const stream = await graph.stream(
          { messages },
          { recursionLimit: 50, streamMode: "updates" }
        );

        let finalResponse = null;

        for await (const chunk of stream) {
          // When the 'agent' node outputs messages
          if (chunk.agent?.messages?.length) {
            const aiMsg = chunk.agent.messages[0];
            messages.push(aiMsg);
            finalResponse = aiMsg;

            // Display tool calls if requested by the model
            if (aiMsg.tool_calls?.length) {
              for (const tc of aiMsg.tool_calls) {
                console.log(`\n\x1b[34m🤖 [Agent Action]\x1b[0m Tool: \x1b[1m\x1b[36m${tc.name}\x1b[0m`);
                if (tc.args && Object.keys(tc.args).length > 0) {
                  const formattedArgs = Object.entries(tc.args)
                    .map(([k, v]) => {
                      const str = typeof v === "string" ? v : JSON.stringify(v);
                      return `${k}: ${str.length > 70 ? str.slice(0, 70) + "..." : str}`;
                    })
                    .join(", ");
                  console.log(`   \x1b[90mArgs: { ${formattedArgs} }\x1b[0m`);
                }
              }
            }
          }

          // When the 'tools' node completes execution
          if (chunk.tools?.messages?.length) {
            for (const toolMsg of chunk.tools.messages) {
              messages.push(toolMsg);
              const content =
                typeof toolMsg.content === "string"
                  ? toolMsg.content
                  : JSON.stringify(toolMsg.content);
              const preview = content.length > 150 ? content.slice(0, 150) + "..." : content;
              console.log(`   \x1b[32m✓\x1b[0m \x1b[90m${preview.replace(/\r?\n/g, " ")}\x1b[0m`);
            }
          }
        }

        // Print final model response
        if (finalResponse?.content) {
          console.log(`\n\x1b[1m\x1b[32mAgent:\x1b[0m\n${finalResponse.content}\n`);
        }
      } catch (err) {
        console.error(`\n\x1b[31mRequest failed:\x1b[0m ${err.message}\n`);
      }
    }
  } finally {
    rl.close();
  }
}
