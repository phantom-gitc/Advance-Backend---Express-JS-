import dotenv from "dotenv";
import path from "node:path";

// Load .env once so every module reads the same settings.
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env`);
  return value;
}

export const appConfig = {
  cohereApiKey: required("COHERE_API_KEY"),
  pineconeApiKey: required("PINECONE_API_KEY"),

  indexName: process.env.PINECONE_INDEX_NAME || "vectordb-01",
  namespace: process.env.PINECONE_NAMESPACE || "__default__",

  embeddingModel: process.env.COHERE_EMBED_MODEL || "embed-v5.0-fast",
  chatModel: process.env.COHERE_CHAT_MODEL || "command-a-03-2025",

  // PDF path is relative to the project root (two levels above this file).
  pdfPath: process.env.PDF_PATH || path.resolve(import.meta.dirname, "..", "..", "story.pdf"),

  chunkSize: 500,
  chunkOverlap: 100,

  topK: Number(process.env.TOP_K) || 10,
  // Questions unrelated to the PDF score far below this; they are refused early.
  minRelevanceScore: Number(process.env.MIN_RELEVANCE_SCORE) || 0.2,
  // Keep the last 10 memory messages (5 user/AI turns) so prompts stay small.
  maxMemoryMessages: 10,
};
