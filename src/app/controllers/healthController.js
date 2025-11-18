'use strict';

const db = require('../db/client');
const { internalError } = require('../utils/errors');

async function getHealthStatus(event, context) {
  var overallStatus = 'ok';
  var dbStatus = 'unknown';

  try {
    // Lightweight connectivity probe
    await db.query('SELECT 1');
    dbStatus = 'ok';
  } catch (error) {
    console.error('[health] Database connectivity check failed:', error);
    dbStatus = 'unreachable';
    overallStatus = 'error';
  }

  const statusCode = overallStatus === 'ok' ? 200 : 500;

  if (statusCode === 500) {
    return internalError('Health check failed. Database unreachable.');
  }

  return {
    statusCode: statusCode,
    body: {
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  getHealthStatus
};
