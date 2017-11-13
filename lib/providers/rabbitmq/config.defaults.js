/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * default configuration for RabbitMQ Provider
 */
const os = require('os');
module.exports = {
  url: 'amqp://localhost?heartbeat=60',
  reConnectAfter: 30000,  // 30 * 1000,
  reChannelAfter: 10000,  // 30 * 1000,
  clearInterval: 3600000, // 60 * 60 * 1000,
  clearOffset: 86400000,  // 24 * 60 * 60 * 1000,
  healthCheckInterval: 10000,
  buffer: {
    location: os.tmpDir(), // path
    flushInterval: 1000, // milliseconds
    flushThreshold: 1000, // messages
  },
};
