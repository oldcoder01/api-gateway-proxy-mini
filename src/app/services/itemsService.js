'use strict';

// Later you’ll inject DynamoDB client here.
// For now, return static data so the route works.

async function getAllItems() {
  return [
    {
      id: 'item-1',
      name: 'Example item',
      createdAt: new Date().toISOString()
    }
  ];
}

module.exports = {
  getAllItems
};
