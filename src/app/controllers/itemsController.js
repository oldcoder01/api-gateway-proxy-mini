'use strict';

const { getAllItems, createItem } = require('../services/itemsService');

async function listItems(event, context) {
  const items = await getAllItems();

  return {
    statusCode: 200,
    body: {
      items: items
    }
  };
}

async function createItemHandler(event, context) {
  // For Express, we'll pass req.body in event.body directly.
  // For Lambda / API Gateway, event.body will be a JSON string.
  var payload = event && event.body ? event.body : {};

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return {
        statusCode: 400,
        body: {
          error: 'BadRequest',
          message: 'Invalid JSON body'
        }
      };
    }
  }

  if (!payload.name || typeof payload.name !== 'string') {
    return {
      statusCode: 400,
      body: {
        error: 'BadRequest',
        message: 'Field "name" is required and must be a string.'
      }
    };
  }

  const item = await createItem(payload.name);

  return {
    statusCode: 201,
    body: item
  };
}

module.exports = {
  listItems,
  createItemHandler
};
