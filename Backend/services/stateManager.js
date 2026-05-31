const Session = require('../models/Session');

/**
 * Conversation State Machine.
 * Manages state transitions and provides context-aware system prompts.
 */

// ─── State Transition Map ────────────────────────────────────────
const TRANSITIONS = {
  ONBOARDING: ['PARSING'],
  PARSING: ['SCORE_DELIVERED'],
  SCORE_DELIVERED: ['JD_MATCHING', 'INTERVIEW_MODE', 'JOB_SEARCH', 'OPTIMIZATION_COMPLETE'],
  JD_MATCHING: ['INTERVIEW_MODE', 'OPTIMIZATION_COMPLETE', 'SCORE_DELIVERED'],
  INTERVIEW_MODE: ['OPTIMIZATION_COMPLETE', 'SCORE_DELIVERED', 'JD_MATCHING'],
  OPTIMIZATION_COMPLETE: ['JD_MATCHING', 'JOB_SEARCH', 'COVER_LETTER', 'ONBOARDING'],
  JOB_SEARCH: ['OPTIMIZATION_COMPLETE', 'COVER_LETTER', 'JD_MATCHING'],
  COVER_LETTER: ['OPTIMIZATION_COMPLETE', 'JOB_SEARCH', 'ONBOARDING'],
};

// ─── State Context Prompts ───────────────────────────────────────
const STATE_CONTEXT = {
  ONBOARDING: `The user hasn't uploaded a resume yet. Welcome them and ask them to upload their resume (PDF or paste text) and tell you their target role. Keep it warm and concise. Offer options: [Upload PDF] [Paste Resume Text] [I don't have a resume yet].`,

  PARSING: `The resume is being parsed. Do not show this state to the user. Transition immediately to SCORE_DELIVERED.`,

  SCORE_DELIVERED: `You just analyzed the resume and showed the score card. Now ask: "What would you like to tackle first?" and offer these options:
- Optimize for ATS
- Match to a job description
- Improve my bullets
- Find jobs for my skills`,

  JD_MATCHING: `The user wants to match their resume against a job description. If they haven't provided a JD yet, ask for it. If they have, run a gap analysis, show the Match Score (0-100) with breakdown, highlight gaps and strengths, and offer a targeted rewrite. After showing results, ask: "Want me to ask you a few questions to strengthen this further?"`,

  INTERVIEW_MODE: `You are asking targeted questions to improve the resume. Ask ONE question at a time. Focus on:
- Quantifying achievements ("How many people were on your team?")
- Filling skill gaps ("You list Python — what specific project did you use it for?")
- Addressing gaps ("I see a gap between X and Y dates")
After each answer, immediately update the relevant bullet and show before/after.
After 4-6 questions, offer a revised resume draft.
Never ask more than 2 follow-ups on the same bullet.`,

  OPTIMIZATION_COMPLETE: `The resume has been optimized. Offer next steps:
- Generate a cover letter
- Find matching jobs
- Match against a new job description
- Start over with a new resume`,

  JOB_SEARCH: `The user wants job recommendations. Based on their resume skills and target role, suggest:
- 5 specific job titles to target
- 5 companies known to hire this profile
- 3 relevant job boards
- LinkedIn/Indeed search query strings
Group results by match strength.`,

  COVER_LETTER: `The user wants a cover letter. Ask: "Which company and role? And what tone — Professional, Bold, or Concise?" Then generate the letter with: Hook → Evidence paragraph → Culture fit → Call to action. Offer to generate variants.`,
};

// ─── State Manager Functions ─────────────────────────────────────

/**
 * Check if a state transition is valid.
 * @param {string} currentState
 * @param {string} targetState
 * @returns {boolean}
 */
const canTransition = (currentState, targetState) => {
  const allowed = TRANSITIONS[currentState] || [];
  return allowed.includes(targetState);
};

/**
 * Transition a session to a new state.
 * @param {Object} session - Mongoose Session document
 * @param {string} newState - Target state
 * @returns {Object} Updated session
 */
const transitionTo = async (session, newState) => {
  if (!canTransition(session.state, newState)) {
    // Allow the transition but log a warning — sometimes we need flexibility
    console.warn(`⚠️ Unusual state transition: ${session.state} → ${newState}`);
  }
  session.state = newState;
  await session.save();
  return session;
};

/**
 * Get the system context for the current state.
 * @param {string} state - Current session state
 * @returns {string} Additional system prompt context
 */
const getStateContext = (state) => {
  return STATE_CONTEXT[state] || '';
};

/**
 * Detect the intent from a user message and suggest a state transition.
 * @param {string} message - User's message
 * @param {string} currentState - Current session state
 * @returns {string|null} Suggested next state, or null if no transition needed
 */
const detectIntent = (message) => {
  const lower = message.toLowerCase();

  // Resume upload / paste intent
  if (lower.includes('here is my resume') || lower.includes('paste') || lower.includes('upload')) {
    return 'PARSING';
  }

  // JD matching intent
  if (lower.includes('job description') || lower.includes('match') || lower.includes('jd') ||
      lower.includes('this role') || lower.includes('this position')) {
    return 'JD_MATCHING';
  }

  // Interview / Q&A intent
  if (lower.includes('ask me') || lower.includes('question') || lower.includes('interview') ||
      lower.includes('improve') || lower.includes('bullet')) {
    return 'INTERVIEW_MODE';
  }

  // Job search intent
  if (lower.includes('find job') || lower.includes('job search') || lower.includes('search for') ||
      lower.includes('recommend') || lower.includes('companies')) {
    return 'JOB_SEARCH';
  }

  // Cover letter intent
  if (lower.includes('cover letter') || lower.includes('letter')) {
    return 'COVER_LETTER';
  }

  // ATS optimization intent
  if (lower.includes('ats') || lower.includes('optimize') || lower.includes('keyword')) {
    return 'INTERVIEW_MODE'; // ATS optimization happens through interview mode
  }

  return null;
};

/**
 * Build the conversation messages array for Claude from session history.
 * @param {Object} session - Session document
 * @param {string} newMessage - The new user message
 * @returns {Array} Messages array for Claude
 */
const buildMessages = (session, newMessage) => {
  // Include recent conversation history (last 20 messages to stay within token limits)
  const recentHistory = (session.conversationHistory || []).slice(-20);

  const messages = recentHistory.map((msg) => ({
    role: msg.role === 'system' ? 'user' : msg.role,
    content: msg.content,
  }));

  // Add the new user message
  messages.push({ role: 'user', content: newMessage });

  return messages;
};

module.exports = {
  TRANSITIONS,
  STATE_CONTEXT,
  canTransition,
  transitionTo,
  getStateContext,
  detectIntent,
  buildMessages,
};
