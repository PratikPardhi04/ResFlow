/**
 * Custom application error classes for consistent error handling.
 */

class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT');
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

// ─── Express Error-Handling Middleware ────────────────────────────
const errorMiddleware = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Multer file upload errors
  const multer = require('multer');
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large. Maximum size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Please upload one file at a time.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected field name: "${err.field}". Use "resume" as the form field name.`;
        break;
      default:
        message = `Upload error: ${err.message}`;
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      error: { code, message, details },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT';
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Token expired';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`❌ [${code}] ${message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : message,
    },
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  errorMiddleware,
};
