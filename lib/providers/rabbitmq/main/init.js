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
      if (!that.subscribersChannel) {
        that.subscribersChannel = yield that._channel();
      }
      if (!that.consumersChannel) {
        that.consumersChannel = yield that._channel();
      }
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};
