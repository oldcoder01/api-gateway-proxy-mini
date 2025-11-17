'use strict';

const db = require('../db/client');

async function getAllItems() {
  const result = await db.query(
    'SELECT id, name, created_at FROM items ORDER BY created_at DESC'
  );

  return result.rows.map(function (row) {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.created_at
    };
  });
}

async function createItem(name) {
  const result = await db.query(
    'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
    [name]
  );

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

module.exports = {
  getAllItems,
  createItem
};
