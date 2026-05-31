const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ─── Required Environment Variables ──────────────────────────────
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

// ─── Export Validated Config ─────────────────────────────────────
const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Google Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  MAX_TOKENS: parseInt(process.env.MAX_TOKENS, 10) || 8192,

  // OpenAI (Embeddings)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Cohere (Reranking)
  COHERE_API_KEY: process.env.COHERE_API_KEY || '',

  // Supabase (pgvector)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // AWS S3
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',

  // Job APIs
  ADZUNA_APP_ID: process.env.ADZUNA_APP_ID || '',
  ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY || '',

  // Feature Flags
  ENABLE_LIVE_JOBS: process.env.ENABLE_LIVE_JOBS === 'true',
  ENABLE_COVER_LETTER: process.env.ENABLE_COVER_LETTER !== 'false',
  ENABLE_RAG: process.env.ENABLE_RAG === 'true',
  MAX_QUESTIONS_PER_SESSION: parseInt(process.env.MAX_QUESTIONS_PER_SESSION, 10) || 6,
  MAX_RESUME_SIZE_MB: parseInt(process.env.MAX_RESUME_SIZE_MB, 10) || 10,

  // System
  SYSTEM_PROMPT_VERSION: process.env.SYSTEM_PROMPT_VERSION || 'v2.1',
};

module.exports = env;
