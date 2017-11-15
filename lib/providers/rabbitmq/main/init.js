/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const co = require('co');

/**
 * Init RabbitMQ main connection
 * @private
 */
module.exports = function() {
  const that = this;
  return new Promise((resolve, reject) => {
    co(function* coroutine() {
      if (!that.connection) {
        yield that._connect(false);
      }
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};
