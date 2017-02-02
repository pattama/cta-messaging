'use strict';

const path = require('path');
const fs = require('fs');
const config = {};
let custom = {};

try {
  if (fs.statSync(path.join(__dirname, 'local.js')).isFile()) {
    custom = require('./local.js');
    // console.log('Loading custom configuration');
  }
} catch (e) {
  // console.log('Using default configuration');
}

config.rabbitMqUrl = custom.rabbitMqUrl || 'amqp://rabbitmq?heartbeat=60', // default to host "rabbitmq" for Gitlab CI docker image to work

module.exports = config;
