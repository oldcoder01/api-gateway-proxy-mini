'use strict';

const { Pool } = require('pg');

var pool;

if (process.env.DATABASE_URL) {
  // Single connection string (Heroku/RDS style)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
} else {
  // Individual env vars (docker-compose, local dev)
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME || 'app_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
}

async function query(text, params) {
  return pool.query(text, params);
}

// Only needed later if you do transactions:
// async function getClient() { return pool.connect(); }

module.exports = {
  query
};
