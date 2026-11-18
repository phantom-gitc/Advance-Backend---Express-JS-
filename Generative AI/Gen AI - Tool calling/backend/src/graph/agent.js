/**
 * ============================================================================
 * [LANGGRAPH & LANGCHAIN AGENT CORE]
 *
 * This file constructs the autonomous tool-calling loop using:
 * 1. LangChain: model bindings (ChatGroq.bindTools) and tool interfaces.
 * 2. LangGraph: the cyclic state machine (StateGraph) that controls the flow
 *    between the model deciding actions and the tools executing them on disk.
 * ============================================================================
 */

import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createCommandTool } from "../utils/command.utils.js";
import { createFileTools } from "../utils/file.utils.js";

/**
 * Builds and compiles the LangGraph agent for workspace operations.
 *
 * Graph Topology:
 *   START ───> [agent] ───(has tool_calls?)───> [tools] ───> [agent]
 *                 │
 *                 └───(no tool_calls)───> END
 */
export function createCodingAgent({
  model,
  workspace,
  confirmWrite,
  confirmCommand,
}) {
  // Combine all workspace file tools and the terminal command tool
  const tools = [
    ...createFileTools(workspace, confirmWrite),
    createCommandTool(workspace, confirmCommand),
  ];

  // [LANGCHAIN]: Bind tools to the ChatGroq model so it can return structured tool_calls
  const modelWithTools = model.bindTools(tools);

  // [LANGGRAPH]: Initialize StateGraph using MessagesAnnotation (tracks conversation history)
  return new StateGraph(MessagesAnnotation)
    // [LANGGRAPH NODE]: 'agent' invokes the model with the current conversation state
    .addNode("agent", async (state) => {
      const response = await modelWithTools.invoke(state.messages);
      return { messages: [response] };
    })
    // [LANGGRAPH NODE]: 'tools' automatically executes any tool_calls emitted by the model
    .addNode("tools", new ToolNode(tools))

    // Start execution by calling the agent first
    .addEdge(START, "agent")

    // [LANGGRAPH CONDITIONAL EDGE]:
    // If the model requested tools, route to 'tools'.
    // If the model completed its response, route to END.
    .addConditionalEdges("agent", (state) => {
      const lastMessage = state.messages.at(-1);
      return lastMessage?.tool_calls?.length ? "tools" : END;
    })

    // [LANGGRAPH CYCLIC EDGE]:
    // After executing tools, route results back to the agent so it can verify or continue
    .addEdge("tools", "agent")

    // Compile into a runnable graph
    .compile();
}
