const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts text content from a given file (PDF or DOCX).
 * Returns a promise that resolves to extracted text or throws error for unsupported files.
 * @param {object} file - Multer file object
 * @returns {Promise<string>} Extracted plain text content
 */
// PUBLIC_INTERFACE
exports.extractTextContent = async function (file) {
  /**
   * Extracts text from PDF or DOCX. Throws error for unsupported files.
   */
  if (!file) throw new Error('No file provided for extraction');
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.pdf') {
    // PDF extraction using pdf-parse
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text.trim();
  } else if (ext === '.docx') {
    // DOCX extraction using mammoth
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value.trim();
  } else {
    throw new Error('Unsupported filetype for content extraction');
  }
};

// PUBLIC_INTERFACE
exports.saveFileInfo = function (file) {
  /**
   * Takes the multer file object, returns basic safe info for the client.
   * Here you could, e.g., persist file info to database or do further processing.
   */
  if (!file) throw new Error('No file provided');

  // Optionally, check file existence on disk, implement secure storage, logging, or DB entry here.

  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
    uploadTime: new Date().toISOString()
  };
};
