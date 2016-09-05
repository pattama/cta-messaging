'use strict';

const co = require('co');
const Nedb = require('nedb');
const path = require('path');
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
      if (!that.channel) {
        yield that._channel(false);
      }
      if (that.buffer.queues.dbMemory === null) {
        that.buffer.queues.dbMemory = new Nedb();
      }
      if (that.buffer.queues.dbFile === null) {
        const filename = path.join(that.config.buffer.location, 'queues.db');
        that.logger.info(`using file buffer ${filename}`);
        that.buffer.queues.dbFile = new Nedb({
          filename: filename,
          autoload: true,
        });
      }
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });
};
