const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, resumeTextSchema } = require('../utils/validators');
const {
  uploadResume,
  parseTextResume,
  getResume,
  getScoreCard,
  getMyResumes,
} = require('../controllers/resumeController');

// All resume routes are protected
router.use(protect);

// Upload PDF resume
router.post('/upload', upload.single('resume'), uploadResume);

// Parse pasted resume text
router.post('/parse-text', validate(resumeTextSchema), parseTextResume);

// Get all my resumes
router.get('/', getMyResumes);

// Get specific resume
router.get('/:id', getResume);

// Get score card only
router.get('/:id/score', getScoreCard);

module.exports = router;
