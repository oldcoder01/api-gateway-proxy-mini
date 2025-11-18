'use strict';

/**
 * Build a standard error response shape:
 * {
 *   statusCode: number,
 *   body: {
 *     error: string,
 *     message: string,
 *     details?: any
 *   }
 * }
 */

function badRequest(message, details) {
  return {
    statusCode: 400,
    body: {
      error: 'BadRequest',
      message: message,
      details: details,
      timestamp: new Date().toISOString()
    }
  };
}

function notFound(message, details) {
  return {
    statusCode: 404,
    body: {
      error: 'NotFound',
      message: message,
      details: details,
      timestamp: new Date().toISOString()
    }
  };
}

function internalError(message, details) {
  return {
    statusCode: 500,
    body: {
      error: 'InternalServerError',
      message: message || 'An error has occurred. Please try your request again later.',
      details: details,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  badRequest,
  notFound,
  internalError
};
