'use strict';
const shortid = require('shortid');
const rabbitmq = require('../../lib')(null, {
  name: 'rabbitmq-provider',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      url: 'amqp://localhost?heartbeat=60',
      port: 3600,
    },
  },
  singleton: true,
});
const http = require('../../lib')(null, {
  name: 'http-provider',
  properties: {
    provider: 'http',
    parameters: {
      url: 'http://localhost:3600',
      port: 8060,
    },
  },
  singleton: true,
});
const queue = shortid.generate();
http.produce({
  queue: queue,
  json: {
    data: new Date().toISOString(),
  },
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
