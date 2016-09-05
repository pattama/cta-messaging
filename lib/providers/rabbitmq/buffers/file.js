'use strict';

const Nedb = require('nedb');
const path = require('path');

class FileBuffer {
  constructor(config, provider, logger) {
    this.config = config;
    this.provider = provider;
    this.logger = logger;
    this.queues = {};
    this.interval = null;
    const filename = path.join(this.config.location, 'queues.db');
    this.logger.info(`using file buffer ${filename}`);
    this.db = new Nedb({
      filename: filename,
      autoload: true,
    });
  }

  apend(vp) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        that._init();
        if (!that.queues.hasOwnProperty(vp.queue)) {
          that.queues[vp.queue] = 0;
        }
        that.db.insert({
          queue: vp.queue,
          json: vp.json,
        }, (insertErr, doc) => {
          if (insertErr) {
            reject(insertErr);
          } else {
            that.queues[vp.queue]++;
            if (that.queues[vp.queue] < that.config.flushThreshold) {
              that.logger.info(`queue counter ${that.queues[vp.queue]}`);
            } else {
              that._produce(vp.queue);
            }
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  _init() {
    const that = this;
    if (that.interval === null) {
      that.logger.info(`setting flush interval to run each ${that.config.flushInterval} ms`);
      that.interval = setInterval(() => {
        Object.keys(that.queues).forEach((queue) => {
          that._produce(queue);
        });
      }, that.config.flushInterval);
    }
  }

  _produce(queue) {
    const that = this;
    if (that.lockRead === true) {
      that.logger.info('read file is locked');
      return;
    }
    try {
      that.lockRead = true;
      that.db.find({
        queue: queue,
      })
      .limit(that.config.flushThreshold)
      .exec((findErr, docs) => {
        if (findErr) {
          that.lockRead = false;
          that.logger.error(findErr);
          return;
        }
        const messages = docs.map((msg) => {
          return msg.json;
        });
        if (messages.length > 0) {
          that.provider.produce({
            queue: queue,
            json: {
              messages: messages,
            },
            buffer: 'none',
          }).then(() => {
            that.logger.info(`produced ${docs.length} messages from file buffer`);
            const ids = docs.map((msg) => {
              return { _id: msg._id };
            });
            that.db.remove({$or: ids}, { multi: true }, (removeErr, total) => {
              if (removeErr) {
                that.lockRead = false;
                that.logger.error(removeErr);
                return;
              }
              that.logger.info(`removed ${total} messages from file buffer`);
              that.queues[queue] -= total;
              that.lockRead = false;
            });
          }).catch((produceErr) => {
            that.lockRead = false;
            that.logger.error(produceErr);
          });
        } else {
          that.lockRead = false;
        }
      });
    } catch (e) {
      that.lockRead = false;
    }
  }
}

module.exports = FileBuffer;
