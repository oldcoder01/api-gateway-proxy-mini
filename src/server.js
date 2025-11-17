'use strict';

const express = require('express');
const { getHealthStatus } = require('./app/controllers/healthController');
const { listItems, createItemHandler } = require('./app/controllers/itemsController');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/status', async function (req, res) {
  try {
    const result = await getHealthStatus(
      {
        requestContext: {
          requestId: 'local-dev'
        }
      },
      {}
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

app.get('/items', async function (req, res) {
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

app.post('/items', async function (req, res) {
  try {
    const result = await createItemHandler(
      {
        body: req.body
      },
      {}
    );

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in POST /items:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

app.listen(port, function () {
  console.log('[server] API listening on port ' + port);
});

module.exports = app;
