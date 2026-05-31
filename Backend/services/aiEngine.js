const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

// ─── Gemini Client Singleton ─────────────────────────────────────
let client = null;

const getClient = () => {
  if (!client) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Set it in your .env file.');
    }
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
};

// ─── System Prompt (ResumeIQ) ────────────────────────────────────
const SYSTEM_PROMPT = `You are ResumeIQ, the AI career intelligence engine powering AntiGravity — a premium resume review, optimization, and job-matching platform. You combine the analytical rigor of a senior recruiter, the technical precision of an ATS engineer, and the strategic insight of a career coach.

You are not a generic AI assistant. You are a specialist. You speak with confidence, specificity, and warmth. You never give vague advice. Every suggestion you make must be concrete, actionable, and tied to an outcome.

RULES:
1. Never dump a wall of text. Use sections, bullets, and bolding strategically.
2. After every major output, suggest 3-4 next actions.
3. If the resume is weak, be honest but constructive.
4. Never say "Great question!" or use filler affirmations.
5. Use industry-specific language appropriate to the user's field.
6. Always show before/after comparisons when rewriting bullets.
7. Never fabricate experience, skills, or credentials.
8. Respond in valid JSON when the user's message includes [FORMAT:JSON].
9. Keep responses concise and actionable.`;

// ─── Core AI Call ────────────────────────────────────────────────

/**
 * Send a message to Gemini and get a response.
 * @param {Array} messages - Conversation history [{role, content}]
 * @param {Object} options - Additional options
 * @param {string} options.systemPromptAddition - Additional system context
 * @param {number} options.maxTokens - Override max tokens
 * @param {number} options.temperature - Response temperature (0-1)
 * @param {boolean} options.jsonMode - Whether to force JSON output
 * @returns {Promise<string>} Gemini's response text
 */
const chat = async (messages, options = {}) => {
  const genAI = getClient();
  const {
    systemPromptAddition = '',
    maxTokens = env.MAX_TOKENS,
    temperature = 0.7,
    jsonMode = false,
  } = options;

  const systemPrompt = systemPromptAddition
    ? `${SYSTEM_PROMPT}\n\n${systemPromptAddition}`
    : SYSTEM_PROMPT;

  const modelConfig = {
    model: env.GEMINI_MODEL,
    systemInstruction: systemPrompt,
  };

  const model = genAI.getGenerativeModel(modelConfig);

  const generationConfig = {
    maxOutputTokens: maxTokens,
    temperature,
  };

  if (jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  // Map roles for Gemini
  // Gemini expects 'user' or 'model'. Anthropic used 'user'/'assistant'.
  // We filter out any 'system' roles as they are handled via systemInstruction.
  const formattedMessages = messages
    .filter(m => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const response = await model.generateContent({
    contents: formattedMessages,
    generationConfig,
  });

  return response.response.text();
};

/**
 * Send a structured request expecting JSON back.
 * @param {string} prompt - The user prompt
 * @param {string} context - Additional system context
 * @returns {Promise<Object>} Parsed JSON response
 */
const chatJSON = async (prompt, context = '') => {
  const responseText = await chat(
    [{ role: 'user', content: prompt }],
    {
      systemPromptAddition: context,
      temperature: 0.3, // lower temperature for structured output
      jsonMode: true,   // use Gemini's native JSON mode
    }
  );

  try {
    return JSON.parse(responseText);
  } catch (error) {
    // Fallback if the native JSON mode somehow includes markdown or fails
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (fallbackError) {
      console.error('Failed to parse Gemini JSON response:', cleaned.substring(0, 200));
      throw new Error('AI returned invalid JSON. Please try again.');
    }
  }
};

module.exports = {
  chat,
  chatJSON,
  SYSTEM_PROMPT,
};
