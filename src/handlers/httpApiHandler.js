'use strict';

const { routeRequest } = require('../app/router');
const { jsonResponse } = require('../app/utils/response');

exports.handler = async (event, context) => {
  try {
    // For HTTP API (v2) request context
    const routeKey = event.routeKey || `${event.requestContext.http.method} ${event.requestContext.http.path}`;

    const result = await routeRequest({
      routeKey: routeKey,
      rawEvent: event,
      context: context
    });

    return jsonResponse(result.statusCode, result.body);
  } catch (error) {
    console.error('[httpApiHandler] Unhandled error', {
      message: error.message,
      stack: error.stack
    });

    return jsonResponse(500, {
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
};
