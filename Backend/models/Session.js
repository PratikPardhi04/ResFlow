const mongoose = require('mongoose');

const STATES = [
  'ONBOARDING',
  'PARSING',
  'SCORE_DELIVERED',
  'JD_MATCHING',
  'INTERVIEW_MODE',
  'OPTIMIZATION_COMPLETE',
  'JOB_SEARCH',
  'COVER_LETTER',
];

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // for score cards, match reports, etc.
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },

    // State machine
    state: {
      type: String,
      enum: STATES,
      default: 'ONBOARDING',
    },

    // Conversation
    conversationHistory: [messageSchema],

    // Interview mode tracking
    questionsAsked: [
      {
        question: String,
        answer: String,
        bulletUpdated: String,
        askedAt: { type: Date, default: Date.now },
      },
    ],
    improvementsMade: [
      {
        type: { type: String }, // 'bullet_rewrite', 'keyword_add', 'section_reorder', etc.
        description: String,
        before: String,
        after: String,
        madeAt: { type: Date, default: Date.now },
      },
    ],

    // JD matching
    targetJD: String,
    matchScore: {
      overall: Number,
      breakdown: {
        requiredSkills: Number,
        experienceLevel: Number,
        keywordDensity: Number,
        culturalFit: Number,
      },
      gaps: [String],
      strengths: [String],
    },

    // Version tracking within session
    currentResumeVersion: { type: Number, default: 1 },

    // Session metadata
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for active session lookup
sessionSchema.index({ userId: 1, isActive: 1 });

// Static: valid states
sessionSchema.statics.STATES = STATES;

module.exports = mongoose.model('Session', sessionSchema);
