const uploadService = require('../services/upload');

// PUBLIC_INTERFACE
exports.uploadFile = function (req, res) {
  /**
   * Handle a POST file upload; assumes file was processed by multer.
   */
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    // Save or process metadata, further processing can be added here.
    const fileInfo = uploadService.saveFileInfo(req.file);

    return res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (err) {
    // Multer errors handled here too
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
