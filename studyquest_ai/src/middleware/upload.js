const multer = require('multer');
const path = require('path');

// Allowed filetypes
const fileTypes = /pdf|docx/;

// Sanitize/Unique filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    // Ensures secure filename
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    cb(null, `${safeBase}_${Date.now()}${ext}`);
  }
});

// File filter for PDF/DOCX
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!fileTypes.test(ext.substr(1))) {
    return cb(new Error('Only PDF and DOCX files are allowed!'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8 MB file limit
});

module.exports = upload;
