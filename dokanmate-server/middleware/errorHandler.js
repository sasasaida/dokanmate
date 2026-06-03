// middleware/errorHandler.js
// Catches any unhandled errors and returns a clean JSON response.
// Prevents Express from leaking stack traces to the client.

const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack);

  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal server error';

  res.status(statusCode).json({
    error:   message,
    success: false,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;