const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { AuthenticationError } = require('../utils/errorHandler');

/**
 * JWT Authentication Middleware.
 * Extracts token from Authorization header (Bearer <token>),
 * verifies it, and attaches the user to req.user.
 */
const protect = async (req, _res, next) => {
  try {
    let token;

    // Extract token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('No token provided. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find user (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User belonging to this token no longer exists.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    // JWT verification errors
    return next(new AuthenticationError(error.message));
  }
};

/**
 * Generate JWT token for a user.
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

module.exports = { protect, generateToken };
