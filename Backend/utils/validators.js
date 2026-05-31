const Joi = require('joi');

/**
 * Request validation schemas using Joi.
 * Each schema validates the request body for its respective endpoint.
 */

// ─── Auth Schemas ────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().trim().lowercase().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// ─── Chat Schemas ────────────────────────────────────────────────

const chatMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message must not exceed 5000 characters',
      'any.required': 'Message is required',
    }),
  sessionId: Joi.string().hex().length(24).optional()
    .messages({
      'string.hex': 'Invalid session ID format',
      'string.length': 'Invalid session ID format',
    }),
});

// ─── Resume Schemas ──────────────────────────────────────────────

const resumeTextSchema = Joi.object({
  resumeText: Joi.string().trim().min(50).max(50000).required()
    .messages({
      'string.min': 'Resume text must be at least 50 characters',
      'string.max': 'Resume text must not exceed 50,000 characters',
      'any.required': 'Resume text is required',
    }),
  targetRole: Joi.string().trim().max(200).optional(),
});

// ─── JD Matching Schemas ─────────────────────────────────────────

const jdMatchSchema = Joi.object({
  jobDescription: Joi.string().trim().min(50).max(50000).required()
    .messages({
      'string.min': 'Job description must be at least 50 characters',
      'string.max': 'Job description must not exceed 50,000 characters',
      'any.required': 'Job description is required',
    }),
  resumeId: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'Invalid resume ID format',
      'string.length': 'Invalid resume ID format',
      'any.required': 'Resume ID is required',
    }),
});

// ─── Cover Letter Schemas ────────────────────────────────────────

const coverLetterSchema = Joi.object({
  resumeId: Joi.string().hex().length(24).required()
    .messages({
      'any.required': 'Resume ID is required',
    }),
  jobDescription: Joi.string().trim().min(50).max(50000).required()
    .messages({
      'any.required': 'Job description is required',
    }),
  companyName: Joi.string().trim().min(1).max(200).required()
    .messages({
      'any.required': 'Company name is required',
    }),
  tone: Joi.string().valid('professional', 'bold', 'concise').default('professional'),
});

// ─── Job Search Schema ───────────────────────────────────────────

const jobSearchSchema = Joi.object({
  query: Joi.string().trim().min(2).max(200).required(),
  location: Joi.string().trim().max(200).optional(),
  remote: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

// ─── Validation Middleware Factory ───────────────────────────────

/**
 * Creates Express middleware that validates req.body against a Joi schema.
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
  }

  // Replace req.body with validated + sanitized values
  req.body = value;
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  chatMessageSchema,
  resumeTextSchema,
  jdMatchSchema,
  coverLetterSchema,
  jobSearchSchema,
  validate,
};
