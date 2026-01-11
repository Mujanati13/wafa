// CommonJS helper for PDF parsing
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

/**
 * Extract text from PDF file
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractPdfText(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    // Convert Buffer to Uint8Array as required by pdf-parse
    const uint8Array = new Uint8Array(dataBuffer);
    // Instantiate PDFParse class, load the PDF, then extract text
    const parser = new PDFParse(uint8Array);
    await parser.load();
    const text = await parser.getText();
    return text;
}

module.exports = { extractPdfText };
