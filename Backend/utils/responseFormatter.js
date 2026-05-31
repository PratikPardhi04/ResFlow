/**
 * Consistent API response formatter.
 * All API responses follow: { success, data, error, meta }
 */

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {*} data - Response payload
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Optional metadata (pagination, etc.)
 */
const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201).
 */
const sendCreated = (res, data, meta = null) => {
  return sendSuccess(res, data, 201, meta);
};

/**
 * Send a no-content response (204).
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} code - Error code
 * @param {*} details - Optional error details
 */
const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    error: { code, message },
  };
  if (details) response.error.details = details;
  return res.status(statusCode).json(response);
};

/**
 * Wrap an async controller to automatically catch errors.
 * Usage: router.get('/path', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendError,
  asyncHandler,
};
