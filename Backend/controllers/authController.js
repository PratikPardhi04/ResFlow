const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler, sendSuccess, sendCreated } = require('../utils/responseFormatter');
const { AuthenticationError, ConflictError } = require('../utils/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // Create user (password hashed via pre-save hook)
  const user = await User.create({ name, email, password });

  // Generate JWT
  const token = generateToken(user._id);

  sendCreated(res, {
    user: user.toJSON(),
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate JWT
  const token = generateToken(user._id);

  sendSuccess(res, {
    user: user.toJSON(),
    token,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user.toJSON() });
});

module.exports = { register, login, getMe };
