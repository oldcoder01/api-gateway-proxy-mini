'use strict';

const { getAllItems } = require('../services/itemsService');

async function listItems(event, context) {
  const items = await getAllItems();

  return {
    statusCode: 200,
    body: {
      items: items
    }
  };
}

module.exports = {
  listItems
};
