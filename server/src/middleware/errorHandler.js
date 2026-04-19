// src/middleware/errorHandler.js
// Global error handler — catches any unhandled errors
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Helper to create a structured API error
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, AppError };
