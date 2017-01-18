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
