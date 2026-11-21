import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

// Read a PDF and return all of its text as one string.
export async function extractPdfText(pdfPath) {
  const parser = new PDFParse({ data: await readFile(pdfPath) });

  try {
    const { text } = await parser.getText();

    if (!text?.trim()) {
      throw new Error(`No text could be extracted from ${pdfPath}`);
    }

    return text;
  } finally {
    // Free the parser even if reading fails.
    await parser.destroy();
  }
}
