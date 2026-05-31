const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errorHandler');
const env = require('../config/env');

// ─── Storage Config ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    // unique filename: timestamp-randomhex-originalname
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_') // sanitize
      .substring(0, 50); // limit length
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

// ─── File Filter ─────────────────────────────────────────────────
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        `Invalid file type: ${file.mimetype}. Only PDF and DOCX files are allowed.`
      ),
      false
    );
  }
};

// ─── Multer Instance ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_RESUME_SIZE_MB * 1024 * 1024, // convert MB to bytes
    files: 1, // only one file at a time
  },
});

module.exports = upload;
