const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const safeMessage = (statusCode < 500 && err.message)
    ? err.message
    : 'An unexpected error occurred while processing your request.';

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
};

module.exports = errorHandler;
