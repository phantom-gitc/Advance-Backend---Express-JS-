import { appConfig } from "./config/appConfig.js";
import { ingestPdf } from "./services/ingestionService.js";

// Entry point: npm run ingest -- [optional path/to/file.pdf]
const pdfPath = process.argv[2] || appConfig.pdfPath;

try {
  const count = await ingestPdf(pdfPath);
  console.log(`Done. ${count} chunks are ready for chat.`);
} catch (error) {
  console.error("Ingestion failed:", error.message);
  process.exitCode = 1;
}
