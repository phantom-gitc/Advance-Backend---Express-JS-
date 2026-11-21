import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { chatWithPdf, createChatMemory } from "./services/retrival.js";

// Entry point: npm run chat
const memory = createChatMemory();
const rl = createInterface({ input: stdin, output: stdout });

console.log("Chat with the PDF. Type 'exit' to quit.\n");

while (true) {
  let question;

  try {
    question = (await rl.question("You: ")).trim();
  } catch (error) {
    // Piped input or Ctrl+D can end the stream before the next question.
    if (error.code === "ERR_USE_AFTER_CLOSE") break;
    throw error;
  }

  if (question.toLowerCase() === "exit") break;
  if (!question) continue;

  try {
    console.log(`AI: ${await chatWithPdf(question, memory)}\n`);
  } catch (error) {
    console.error(`Error: ${error.message}\n`);
  }
}

rl.close();
