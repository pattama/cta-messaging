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
      if (that.buffer.produce.db.memory === null) {
        that.buffer.produce.db.memory = new Nedb();
      }
      if (that.buffer.produce.db.file === null) {
        const filename = path.join(that.config.buffer.location, 'produce.db');
        that.logger.info(`using file buffer ${filename}`);
        that.buffer.produce.db.file = new Nedb({
          filename: filename,
          autoload: true,
        });
      }
      resolve();
    }).catch((err) => {
      reject(err);
    });
    /*try {
      if (that.connection && that.channel) {
        return resolve();
      }
      that._connect(false)
        .then(() => {
          return that._channel(false);
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    } catch (e) {
      reject(e);
    }*/
  });
};
