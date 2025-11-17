'use strict';

const { getHealthStatus } = require('./controllers/healthController');
const {
  listItems,
  getItemByIdHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler
} = require('./controllers/itemsController');

async function routeRequest(options) {
  const routeKey = options.routeKey;
  const rawEvent = options.rawEvent;
  const context = options.context;

  switch (routeKey) {
    case 'GET /status':
      return await getHealthStatus(rawEvent, context);

    case 'GET /items':
      return await listItems(rawEvent, context);

    case 'GET /items/{id}':
      return await getItemByIdHandler(rawEvent, context);

    case 'POST /items':
      return await createItemHandler(rawEvent, context);

    case 'PUT /items/{id}':
      return await updateItemHandler(rawEvent, context);

    case 'DELETE /items/{id}':
      return await deleteItemHandler(rawEvent, context);

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
