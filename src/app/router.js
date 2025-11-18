'use strict';

const { getHealthStatus } = require('./controllers/healthController');
const {
  listItems,
  getItemByIdHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler
} = require('./controllers/itemsController');
const { notFound } = require('./utils/errors');

async function routeRequest(options) {
  var routeKey = options.routeKey;
  var rawEvent = options.rawEvent;
  var context = options.context;

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
      return notFound('No route for ' + routeKey);
  }
}

module.exports = {
  routeRequest
};