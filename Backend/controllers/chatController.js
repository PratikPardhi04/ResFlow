const Session = require('../models/Session');
const Resume = require('../models/Resume');
const { chat } = require('../services/aiEngine');
const {
  detectIntent,
  transitionTo,
  getStateContext,
  buildMessages,
} = require('../services/stateManager');
const { asyncHandler, sendSuccess, sendCreated } = require('../utils/responseFormatter');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

/**
 * @desc    Start a new career coach session
 * @route   POST /api/chat/session/new
 * @access  Protected
 */
const startSession = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  // Deactivate old active sessions
  await Session.updateMany(
    { userId: req.user._id, isActive: true },
    { isActive: false }
  );

  let resume = null;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      throw new NotFoundError('Resume');
    }
  }

  // Initial welcome message context
  const welcomeMessage = "Welcome to AntiGravity. Upload your resume (PDF or paste text) and tell me what role you're targeting. I'll do the rest.";

  const session = await Session.create({
    userId: req.user._id,
    resumeId: resume ? resume._id : null,
    state: resume ? 'SCORE_DELIVERED' : 'ONBOARDING',
    conversationHistory: [
      {
        role: 'assistant',
        content: resume
          ? `I've loaded and analyzed your resume for the ${resume.targetRole || 'target'} role. Let's optimize it!`
          : welcomeMessage,
      },
    ],
    isActive: true,
  });

  sendCreated(res, { session });
});

/**
 * @desc    Get conversation history for a session
 * @route   GET /api/chat/session/:id
 * @access  Protected
 */
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('resumeId');

  if (!session) {
    throw new NotFoundError('Session');
  }

  sendSuccess(res, { session });
});

/**
 * @desc    Get user's current active session or create one
 * @route   GET /api/chat/session/active
 * @access  Protected
 */
const getActiveSession = asyncHandler(async (req, res) => {
  let session = await Session.findOne({
    userId: req.user._id,
    isActive: true,
  }).populate('resumeId');

  if (!session) {
    // Start a fresh one
    session = await Session.create({
      userId: req.user._id,
      state: 'ONBOARDING',
      conversationHistory: [
        {
          role: 'assistant',
          content: "Welcome to AntiGravity. Upload your resume (PDF or paste text) and tell me what role you're targeting. I'll do the rest.",
        },
      ],
      isActive: true,
    });
  }

  sendSuccess(res, { session });
});

/**
 * @desc    Send a message in the chat and get a career coach response
 * @route   POST /api/chat/message
 * @access  Protected
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body;

  // 1. Find or create session
  let session;
  if (sessionId) {
    session = await Session.findOne({ _id: sessionId, userId: req.user._id });
  } else {
    session = await Session.findOne({ userId: req.user._id, isActive: true });
  }

  if (!session) {
    session = await Session.create({
      userId: req.user._id,
      state: 'ONBOARDING',
      conversationHistory: [],
      isActive: true,
    });
  }

  // Make sure populate resume is available if it exists
  let resume = null;
  if (session.resumeId) {
    resume = await Resume.findById(session.resumeId);
  }

  // 2. State transition evaluation
  const detectedState = detectIntent(message);
  if (detectedState && detectedState !== session.state) {
    // transition state
    await transitionTo(session, detectedState);
  }

  // 3. Build messages history for Claude context
  const messagesContext = buildMessages(session, message);

  // 4. Inject State system prompts
  const statePrompt = getStateContext(session.state);
  let resumeContext = '';
  if (resume) {
    resumeContext = `CURRENT RESUME DATA IN CONTEXT:\n${JSON.stringify(resume.parsedData, null, 2)}`;
  }

  const systemPromptAddition = `${statePrompt}\n\n${resumeContext}`;

  // 5. Query Claude API
  let reply;
  try {
    reply = await chat(messagesContext, { systemPromptAddition });
  } catch (error) {
    console.error('Claude Chat Error:', error);
    reply = "I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }

  // 6. Update session state history
  session.conversationHistory.push({
    role: 'user',
    content: message,
  });

  session.conversationHistory.push({
    role: 'assistant',
    content: reply,
  });

  // Save changes
  await session.save();

  sendSuccess(res, {
    reply,
    session,
  });
});

module.exports = {
  startSession,
  getSession,
  getActiveSession,
  sendMessage,
};
