'use strict';

const co = require('co');

/**
 * Init RabbitMQ connection & channel
 * @param {object} that - reference to main class
 * @private
 */
module.exports = (that) => {
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
