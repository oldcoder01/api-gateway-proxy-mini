'use strict';

function jsonResponse(statusCode, bodyObject) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObject)
  };
}

module.exports = {
  jsonResponse
};
