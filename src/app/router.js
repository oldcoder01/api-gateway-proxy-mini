'use strict';

const { getHealthStatus } = require('./controllers/healthController');
const { listItems } = require('./controllers/itemsController');

async function routeRequest({ routeKey, rawEvent, context }) {
  // HTTP API v2 routeKey looks like "GET /status"
  switch (routeKey) {
    case 'GET /status':
      return await getHealthStatus(rawEvent, context);

    case 'GET /items':
      return await listItems(rawEvent, context);

    default:
      return {
        statusCode: 404,
        body: {
          error: 'NotFound',
          message: `No route for ${routeKey}`
        }
      };
  }
}

module.exports = {
  routeRequest
};
