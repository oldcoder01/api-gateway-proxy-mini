'use strict';

const db = require('../db/client');

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

async function getAllItems() {
  const result = await db.query(
    'SELECT id, name, created_at FROM items ORDER BY created_at DESC'
  );

  return result.rows.map(mapRow);
}

async function getItemById(id) {
  const result = await db.query(
    'SELECT id, name, created_at FROM items WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

async function createItem(name) {
  const result = await db.query(
    'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
    [name]
  );

  return mapRow(result.rows[0]);
}

async function updateItem(id, name) {
  const result = await db.query(
    'UPDATE items SET name = $1 WHERE id = $2 RETURNING id, name, created_at',
    [name, id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

async function deleteItem(id) {
  const result = await db.query(
    'DELETE FROM items WHERE id = $1',
    [id]
  );

  // true if a row was deleted, false if nothing matched
  return result.rowCount > 0;
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
