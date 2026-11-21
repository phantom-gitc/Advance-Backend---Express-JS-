import { Pinecone } from "@pinecone-database/pinecone";
import { appConfig } from "../config/appConfig.js";

let client;

// One Pinecone client, reused by ingestion and chat.
// The host is resolved from the index name, so it is not hardcoded.
export function getPineconeIndex() {
  if (!client) {
    client = new Pinecone({ apiKey: appConfig.pineconeApiKey });
  }

  return client.index({
    name: appConfig.indexName,
    namespace: appConfig.namespace,
  });
}

// Write documents in small batches. This index uses the "documents" API,
// where the vector lives in the field named "embedding".
export async function upsertDocuments(index, documents) {
  const batchSize = 100;

  for (let i = 0; i < documents.length; i += batchSize) {
    await index.documents.upsert({
      documents: documents.slice(i, i + batchSize),
    });
  }
}

// Find the chunks closest to the question's vector.
export async function searchDocuments(index, queryVector, topK) {
  const result = await index.documents.search({
    scoreBy: [{ type: "dense_vector", field: "embedding", values: queryVector }],
    topK,
    includeFields: ["content", "source", "chunkIndex"],
  });

  // Matches are flat: { _id, _score, content, source, chunkIndex }.
  return result.matches ?? [];
}
