const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, coverLetterSchema } = require('../utils/validators');
const { createCoverLetter } = require('../controllers/coverLetterController');

// Cover letter generation (protected)
router.post('/generate', protect, validate(coverLetterSchema), createCoverLetter);

module.exports = router;
