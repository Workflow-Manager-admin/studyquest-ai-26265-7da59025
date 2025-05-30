const uploadService = require('../services/upload');

// PUBLIC_INTERFACE
exports.uploadFile = async function (req, res) {
  /**
   * Handle a POST file upload; assumes file was processed by multer.
   * Now, also extracts text content from the uploaded file.
   */
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    // Save/process metadata
    const fileInfo = uploadService.saveFileInfo(req.file);

    // Extract text content from file (PDF/DOCX)
    let textContent = '';
    try {
      textContent = await uploadService.extractTextContent(req.file);
    } catch (extractionErr) {
      // If extraction fails, file upload is still successful, but flag extraction error in response.
      textContent = '';
      fileInfo.contentExtractionError = extractionErr.message || 'Failed to extract content';
    }

    return res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully',
      file: {
        ...fileInfo,
        extractedText: textContent
      }
    });
  } catch (err) {
    // Multer errors handled here too
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
