/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Create RabbitMQ channel
 * @return {object}
 * @private
 */

module.exports = function() {
  const that = this;
  return new Promise((resolve, reject) => {
    try {
      if (!that.connection) {
        return reject('There is no RabbitMQ connection to create a channel');
      }
      that.connection.createConfirmChannel()
        .then((channel) => {
          that.logger.debug('Created new RabbitMQ channel');
          channel.on('close', () => {
            channel = null;
            that.logger.debug('RabbitMQ channel close event');
          });
          channel.on('error', (err) => {
            that.logger.debug('RabbitMQ channel error event: ', err);
          });
          channel.on('return', (msg) => {
            that.logger.debug('RabbitMQ channel return event: ', msg);
          });
          channel.on('drain', () => {
            that.logger.debug('RabbitMQ channel drain event');
          });
          resolve(channel);
        })
        .catch((chErr) => {
          that.logger.debug('RabbitMQ channel creation error: ', chErr);
          return reject(chErr);
        });
    } catch (e) {
      reject(e);
    }
  });
};
