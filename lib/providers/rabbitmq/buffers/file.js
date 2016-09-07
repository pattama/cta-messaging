'use strict';

const Nedb = require('nedb');
const path = require('path');
const common = require('cta-common');
const defaults = require('../config.defaults');

class FileBuffer {
  constructor(config, provider, logger) {
    this.config = common.validate(config, {
      type: 'object',
      optional: true,
      items: {
        location: {
          optional: true,
          type: 'path',
          defaultTo: defaults.buffer.location,
        },
        flushInterval: {
          optional: true,
          type: 'number',
          defaultTo: defaults.buffer.flushInterval,
        },
        flushThreshold: {
          optional: true,
          type: 'number',
          defaultTo: defaults.buffer.flushThreshold,
        },
      },
    }).output;
    this.provider = provider;
    this.logger = logger;
    this.data = {
      queue: {},
      topic: {},
    };
    this.interval = null;
    const filename = path.join(this.config.location, 'buffer.db');
    this.logger.info(`using file buffer ${filename}`);
    this.db = new Nedb({
      filename: filename,
      autoload: true,
    });
  }

  append(vp, type) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        that._init(type);
        const key = (type === 'queue' ? vp.queue : (vp.exchange + (vp.topic ? ('-' + vp.topic) : '')));
        if (!that.data[type].hasOwnProperty(key)) {
          that.data[type][key] = 0;
        }
        that.db.insert({
          type: type,
          key: key,
          params: vp,
        }, (insertErr, doc) => {
          if (insertErr) {
            reject(insertErr);
          } else {
            that.data[type][key]++;
            if (that.data[type][key] < that.config.flushThreshold) {
              that.logger.info(`queue counter ${that.data[type][key]}`);
            } else {
              that._produce(key, type);
            }
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  _init(type) {
    const that = this;
    if (that.interval === null) {
      that.logger.info(`setting flush interval to run each ${that.config.flushInterval} ms`);
      that.interval = setInterval(() => {
        Object.keys(that.data[type]).forEach((key) => {
          that._produce(key, type);
        });
      }, that.config.flushInterval);
      // Retrieve remaining data (when app starts after crash/stop)
      // TODO should run this before any produce/publish method
      that.db.find({}, (err, docs) => {
        if (err) {
          that.logger.error(err);
          return;
        }
        docs.forEach((doc) => {
          if (!that.data[doc.type].hasOwnProperty(doc.key)) {
            that.data[doc.type][doc.key] = 1;
          } else {
            that.data[doc.type][doc.key]++;
          }
        });
      });
    }
  }

  _produce(key, type) {
    const that = this;
    // TODO lock per type & key
    if (that.lockRead === true) {
      that.logger.info('read file is locked');
      return;
    }
    try {
      that.lockRead = true;
      that.db.find({
        type: type,
        key: key,
      })
      .limit(that.config.flushThreshold)
      .exec((findErr, docs) => {
        if (findErr) {
          that.lockRead = false;
          that.logger.error(findErr);
          return;
        }
        const messages = docs.map((doc) => {
          return doc.params.json;
        });
        if (messages.length > 0 && type === 'queue') {
          that.provider.produce({
            queue: key,
            json: {
              messages: messages,
            },
            buffer: 'none',
          }).then(() => {
            that.logger.info(`produced ${docs.length} messages from file buffer`);
            const ids = docs.map((doc) => {
              return {_id: doc._id};
            });
            that.db.remove({$or: ids}, {multi: true}, (removeErr, total) => {
              if (removeErr) {
                that.lockRead = false;
                that.logger.error(removeErr);
                return;
              }
              that.logger.info(`removed ${total} messages from file buffer`);
              that.data[type][key] -= total;
              that.lockRead = false;
            });
          }).catch((produceErr) => {
            that.lockRead = false;
            that.logger.error(produceErr);
          });
        } else if (messages.length > 0 && type === 'topic') {
          const exchange = docs[0].params.exchange;
          const topic = docs[0].params.topic;
          that.provider.publish({
            exchange: exchange,
            topic: topic,
            json: {
              messages: messages,
            },
            buffer: 'none',
          }).then(() => {
            that.logger.info(`published ${docs.length} messages from file buffer`);
            const ids = docs.map((doc) => {
              return { _id: doc._id };
            });
            that.db.remove({$or: ids}, { multi: true }, (removeErr, total) => {
              if (removeErr) {
                that.lockRead = false;
                that.logger.error(removeErr);
                return;
              }
              that.logger.info(`removed ${total} messages from file buffer`);
              that.data[type][key] -= total;
              that.lockRead = false;
            });
          }).catch((publishErr) => {
            that.lockRead = false;
            that.logger.error(publishErr);
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
