'use strict';

const express = require('express');
const { getHealthStatus } = require('./app/controllers/healthController');
const { listItems } = require('./app/controllers/itemsController');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON body (for later POST/PUT routes)
app.use(express.json());

// Health/status route
app.get('/status', async (req, res) => {
  try {
    // Reuse the existing controller – fake event/context for now
    const result = await getHealthStatus(
      {
        requestContext: {
          requestId: 'local-dev'
        }
      },
      {} // context
    );

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in /status:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

// Items route (placeholder)
app.get('/items', async (req, res) => {
  try {
    const result = await listItems({}, {});
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in /items:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

app.listen(port, () => {
  console.log(`[server] API listening on port ${port}`);
});

module.exports = app;
