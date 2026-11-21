import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { appConfig } from "../config/appConfig.js";
import { createEmbeddingClient } from "../lib/embeddingClient.js";
import { extractPdfText } from "../lib/pdfLoader.js";
import { getPineconeIndex, upsertDocuments } from "../lib/pineconeStore.js";

// Full ingestion flow: PDF -> text -> chunks -> vectors -> Pinecone.
export async function ingestPdf(pdfPath = appConfig.pdfPath) {
  console.log(`Reading PDF: ${pdfPath}`);
  const text = await extractPdfText(pdfPath);

  

  // Small chunks give focused, more useful search results.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: appConfig.chunkSize,
    chunkOverlap: appConfig.chunkOverlap,
  });
  const chunks = await splitter.splitText(text);

  if (chunks.length === 0) {
    throw new Error("No chunks were created from the PDF");
  }

  console.log(`Embedding ${chunks.length} chunks...`);
  const vectors = await createEmbeddingClient().embedDocuments(chunks);

  const source = path.basename(pdfPath);
  const documents = chunks.map((content, index) => ({
    // Stable IDs mean re-ingesting the same PDF updates chunks (no duplicates).
    _id: `chunk-${index}`,
    embedding: vectors[index],
    content,
    chunkIndex: index,
    source,
  }));

  await upsertDocuments(getPineconeIndex(), documents);
  console.log(`Stored ${documents.length} chunks in ${appConfig.indexName}.`);

  return documents.length;
}
