const mongoose = require('mongoose');

// ─── Parsed Resume Sub-schemas ───────────────────────────────────

const contactSchema = new mongoose.Schema(
  {
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String,
    location: String,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    bullets: [String],
    skills: [String], // skills extracted from this role
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true },
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    url: String,
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: String,
    date: String,
    url: String,
  },
  { _id: false }
);

const scoresSchema = new mongoose.Schema(
  {
    impact: { type: Number, min: 0, max: 10 },
    ats: { type: Number, min: 0, max: 10 },
    clarity: { type: Number, min: 0, max: 10 },
    completeness: { type: Number, min: 0, max: 10 },
    formatting: { type: Number, min: 0, max: 10 },
    overall: { type: Number, min: 0, max: 100 },
    issues: [
      {
        dimension: String,
        issue: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
      },
    ],
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    parsedData: { type: mongoose.Schema.Types.Mixed },
    scores: scoresSchema,
    changes: [String], // what changed in this version
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Resume Schema ──────────────────────────────────────────

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: String,
    fileUrl: String, // S3 URL or local path
    rawText: String, // extracted text from PDF

    // Structured parsed data
    parsedData: {
      name: String,
      contact: contactSchema,
      summary: String,
      skills: {
        technical: [String],
        soft: [String],
        domain: [String],
        tools: [String],
        languages: [String],
      },
      experience: [experienceSchema],
      education: [educationSchema],
      projects: [projectSchema],
      certifications: [certificationSchema],
    },

    // Analysis metadata
    industry: String,
    seniorityLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive'],
    },
    targetRole: String,

    // Scores
    scores: scoresSchema,

    // Version history
    versions: [versionSchema],
    currentVersion: { type: Number, default: 1 },
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

// Index for efficient user lookups
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
