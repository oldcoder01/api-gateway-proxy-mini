'use strict';

const { routeRequest } = require('../app/router');
const { toLambdaResponse, toLambdaError } = require('../app/utils/response');

/**
 * Lambda handler for API Gateway HTTP API.
 *
 * Expects events that include:
 * - routeKey (e.g. "GET /items", "POST /items")
 * - pathParameters
 * - body
 * - requestContext
 */
exports.handler = async function (event, context) {
  try {
    var routeKey = event && event.routeKey ? event.routeKey : null;

    if (!routeKey) {
      return toLambdaResponse({
        statusCode: 400,
        body: {
          error: 'BadRequest',
          message: 'Missing routeKey on event.'
        }
      });
    }

    const result = await routeRequest({
      routeKey: routeKey,
      rawEvent: event,
      context: context
    });

    return toLambdaResponse(result);
  } catch (error) {
    return toLambdaError(error);
  }
};
