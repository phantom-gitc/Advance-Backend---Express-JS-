import { CohereEmbeddings } from "@langchain/cohere";
import { appConfig } from "../config/appConfig.js";

// LangChain sets inputType automatically:
// - embedDocuments() -> "search_document" (while ingesting)
// - embedQuery()     -> "search_query"    (while chatting)
export function createEmbeddingClient() {
  return new CohereEmbeddings({
    apiKey: appConfig.cohereApiKey,
    model: appConfig.embeddingModel,
  });
}
