'use strict';

const config = {
  tools: [
    {
      name: 'express',
      module: 'cta-expresswrapper',
      properties: {
        port: 8080,
      },
      order: 1,
    },
    {
      name: 'healthcheck',
      module: 'cta-healthcheck',
      properties: {
        file: './healths.json',
      },
      dependencies: {
        express: 'express',
      },
      order: 2,
    },
    {
      name: 'messaging',
      module: 'cta-messaging',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          url: 'amqp://localhost?heartbeat=60',
        },
      },
      dependencies: {
        healthcheck: 'healthcheck',
      },
      singleton: true,
      order: 3,
    },
  ],
  bricks: [{
    name: 'somebrick',
    module: './somebrick.js',
  }],
};

const FlowControl = require('cta-flowcontrol');
const Cement = FlowControl.Cement;
const cement = new Cement(config, __dirname);