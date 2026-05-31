const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, jdMatchSchema, jobSearchSchema } = require('../utils/validators');
const { matchResume, findJobs } = require('../controllers/jobController');

// All job routes are protected
router.use(protect);

// Match resume to job description
router.post('/match', validate(jdMatchSchema), matchResume);

// Search jobs & get recommendations
router.get('/search', findJobs);

module.exports = router;
