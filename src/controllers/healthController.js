'use strict';

const { v4: uuidv4 } = require('uuid');

async function getHealthStatus(event, context) {
  const requestId = (event && event.requestContext && event.requestContext.requestId) || uuidv4();

  return {
    statusCode: 200,
    body: {
      status: 'ok',
      service: 'api-gateway-proxy-mini',
      requestId: requestId,
      awsRequestId: context && context.awsRequestId ? context.awsRequestId : null,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  getHealthStatus
};
