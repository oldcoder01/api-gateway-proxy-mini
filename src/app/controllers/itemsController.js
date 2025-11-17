'use strict';

const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../services/itemsService');

function parseBody(event) {
  var payload = event && event.body ? event.body : {};

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return {
        error: {
          statusCode: 400,
          body: {
            error: 'BadRequest',
            message: 'Invalid JSON body'
          }
        }
      };
    }
  }

  return { payload: payload };
}

function parseId(pathParameters) {
  if (!pathParameters || !pathParameters.id) {
    return {
      error: {
        statusCode: 400,
        body: {
          error: 'BadRequest',
          message: 'Path parameter "id" is required.'
        }
      }
    };
  }

  var rawId = pathParameters.id;
  var id = parseInt(rawId, 10);

  if (Number.isNaN(id)) {
    return {
      error: {
        statusCode: 400,
        body: {
          error: 'BadRequest',
          message: 'Path parameter "id" must be a number.'
        }
      }
    };
  }

  return { id: id };
}

async function listItems(event, context) {
  const items = await getAllItems();

  return {
    statusCode: 200,
    body: {
      items: items
    }
  };
}

async function getItemByIdHandler(event, context) {
  const parsed = parseId(event && event.pathParameters);

  if (parsed.error) {
    return parsed.error;
  }

  const item = await getItemById(parsed.id);

  if (!item) {
    return {
      statusCode: 404,
      body: {
        error: 'NotFound',
        message: 'Item with id ' + parsed.id + ' not found.'
      }
    };
  }

  return {
    statusCode: 200,
    body: item
  };
}

async function createItemHandler(event, context) {
  const result = parseBody(event);

  if (result.error) {
    return result.error;
  }

  const payload = result.payload;

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

async function updateItemHandler(event, context) {
  const idResult = parseId(event && event.pathParameters);

  if (idResult.error) {
    return idResult.error;
  }

  const bodyResult = parseBody(event);

  if (bodyResult.error) {
    return bodyResult.error;
  }

  const payload = bodyResult.payload;

  if (!payload.name || typeof payload.name !== 'string') {
    return {
      statusCode: 400,
      body: {
        error: 'BadRequest',
        message: 'Field "name" is required and must be a string.'
      }
    };
  }

  const item = await updateItem(idResult.id, payload.name);

  if (!item) {
    return {
      statusCode: 404,
      body: {
        error: 'NotFound',
        message: 'Item with id ' + idResult.id + ' not found.'
      }
    };
  }

  return {
    statusCode: 200,
    body: item
  };
}

async function deleteItemHandler(event, context) {
  const parsed = parseId(event && event.pathParameters);

  if (parsed.error) {
    return parsed.error;
  }

  const deleted = await deleteItem(parsed.id);

  if (!deleted) {
    return {
      statusCode: 404,
      body: {
        error: 'NotFound',
        message: 'Item with id ' + parsed.id + ' not found.'
      }
    };
  }

  return {
    statusCode: 204,
    body: null
  };
}

module.exports = {
  listItems,
  getItemByIdHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler
};
