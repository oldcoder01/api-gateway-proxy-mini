'use strict';

const { handler } = require('../src/handlers/httpApiHandler');

async function main() {
  const event = {
    routeKey: 'GET /items',
    pathParameters: null,
    body: null,
    requestContext: {
      requestId: 'local-lambda-test'
    }
  };

  const response = await handler(event, {});
  console.log('Lambda-style response:');
  console.log(JSON.stringify(response, null, 2));
}

main().catch(function (error) {
  console.error(error);
  process.exit(1);
});
