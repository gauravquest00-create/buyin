import env from '../../config/environment.js';
import { sendError } from '../responses/apiResponse.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
}

export function globalErrorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    return sendError(res, {
      statusCode: 409,
      message: `Duplicate value for unique field(s): ${fields.join(', ')}`,
      code: 'DUPLICATE_KEY_ERROR',
    });
  }

  if (err.name === 'CastError') {
    return sendError(res, {
      statusCode: 400,
      message: `Invalid identifier for field ${err.path}`,
      code: 'INVALID_IDENTIFIER',
    });
  }

  if (statusCode >= 500) {
    logger.error('Unhandled server error', {
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: env.isProduction ? undefined : err.stack,
    });
  }

  return sendError(res, {
    statusCode,
    message: env.isProduction && statusCode >= 500 ? 'An unexpected error occurred' : err.message,
    code,
    details: err.details,
  });
}
