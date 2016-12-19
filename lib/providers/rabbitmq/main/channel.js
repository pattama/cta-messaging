'use strict';

/**
 * Create RabbitMQ channel
 * @param {object} that - reference to main class
 * @param {Boolean} force - whether to force channel creation or return existing channel
 * @return {object}
 * @private
 */

module.exports = {
  key: '_channel',
  fn: (that) => {
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
  },
};
