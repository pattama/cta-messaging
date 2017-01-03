'use strict';

const amqp = require('amqplib');
const co = require('co');

/**
 * Connect RabbitMQ
 * @param {Boolean} force - whether to force connection or return existing connection
 * @return {object} - promise
 * @private
 */
module.exports = function (force){
  const that = this;
  return new Promise((resolve, reject) => {
    co(function * () {
      if (force !== true && that.connection) {
        return resolve();
      }
      that.logger.debug('Connecting to rabbitMQ...');
      that.connection = yield amqp.connect(that.config.url);
      that.logger.debug('Connected to rabbitMQ, host: ', that.connection.connection.stream._host);
      that.connection.on('close', () => {
        that.connection = null;
        that.logger.debug('RabbitMQ connection close event');
        that._reConnect();
      });
      that.connection.on('error', (err) => {
        that.logger.debug('RabbitMQ connection error event: ', err);
      });
      that.connection.on('blocked', (reason) => {
        that.logger.debug('RabbitMQ connection blocked event: ', reason);
      });
      that.connection.on('unblocked', () => {
        that.logger.debug('RabbitMQ connection unblocked event');
      });
      resolve();
    }).catch((connErr) => {
      that.logger.debug('RabbitMQ connection error: ', connErr);
      that._reConnect();
      reject(connErr);
    });
  });
};
