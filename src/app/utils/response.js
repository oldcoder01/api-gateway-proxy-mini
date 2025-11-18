'use strict';

/**
 * Convert an internal { statusCode, body } shape into a Lambda
 * proxy integration response:
 *
 * {
 *   statusCode: number,
 *   headers: { ... },
 *   body: string
 * }
 */

function toLambdaResponse(result) {
  var statusCode = result && result.statusCode ? result.statusCode : 200;
  var body = result && result.body !== undefined ? result.body : null;

  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body === null ? '' : JSON.stringify(body)
  };
}

/**
 * Basic error fallback if something explodes outside normal flow.
 */
function toLambdaError(error) {
  console.error('[lambda] Unhandled error:', error);

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: 'InternalServerError',
      message: 'Something went wrong.',
      details: error && error.message ? error.message : undefined
    })
  };
}

module.exports = {
  toLambdaResponse,
  toLambdaError
};
