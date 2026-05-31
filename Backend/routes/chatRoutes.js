const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate, chatMessageSchema } = require('../utils/validators');
const {
  startSession,
  getSession,
  getActiveSession,
  sendMessage,
} = require('../controllers/chatController');

// All chat routes are protected
router.use(protect);

// Start a new session
router.post('/session/new', startSession);

// Get active session
router.get('/session/active', getActiveSession);

// Get specific session
router.get('/session/:id', getSession);

// Send message
router.post('/message', validate(chatMessageSchema), sendMessage);

module.exports = router;
