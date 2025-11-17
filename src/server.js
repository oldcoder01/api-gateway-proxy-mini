'use strict';

const express = require('express');
const { getHealthStatus } = require('./app/controllers/healthController');
const {
  listItems,
  getItemByIdHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler
} = require('./app/controllers/itemsController');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health/status route
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
    console.error('[server] Error in GET /status:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

// List all items
app.get('/items', async function (req, res) {
  try {
    const result = await listItems({}, {});
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in GET /items:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

// Get item by id
app.get('/items/:id', async function (req, res) {
  try {
    const result = await getItemByIdHandler(
      {
        pathParameters: {
          id: req.params.id
        }
      },
      {}
    );

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in GET /items/:id:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

// Create item
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

// Update item
app.put('/items/:id', async function (req, res) {
  try {
    const result = await updateItemHandler(
      {
        pathParameters: {
          id: req.params.id
        },
        body: req.body
      },
      {}
    );

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('[server] Error in PUT /items/:id:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Something went wrong.'
    });
  }
});

// Delete item
app.delete('/items/:id', async function (req, res) {
  try {
    const result = await deleteItemHandler(
      {
        pathParameters: {
          id: req.params.id
        }
      },
      {}
    );

    // 204 has no body, but some clients handle it weirdly; just follow what controller returns.
    if (result.statusCode === 204) {
      res.status(204).send();
    } else {
      res.status(result.statusCode).json(result.body);
    }
  } catch (error) {
    console.error('[server] Error in DELETE /items/:id:', error);
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
