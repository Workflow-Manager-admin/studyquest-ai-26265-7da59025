const path = require('path');
const fs = require('fs');

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
