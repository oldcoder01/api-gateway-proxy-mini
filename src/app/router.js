'use strict';

const { getHealthStatus } = require('./controllers/healthController');
const { listItems, createItemHandler } = require('./controllers/itemsController');

async function routeRequest({ routeKey, rawEvent, context }) {
  switch (routeKey) {
    case 'GET /status':
      return await getHealthStatus(rawEvent, context);

    case 'GET /items':
      return await listItems(rawEvent, context);

    case 'POST /items':
      return await createItemHandler(rawEvent, context);

    default:
      return {
        statusCode: 404,
        body: {
          error: 'NotFound',
          message: 'No route for ' + routeKey
        }
      };
  }
}

module.exports = {
  routeRequest
};
