'use strict';

const common = require('cta-common');
const defaults = require('../config.defaults');

class MemoryBuffer {
  constructor(config, provider, logger) {
    this.config = common.validate(config, {
      type: 'object',
      optional: true,
      items: {
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
    this.queues = {};
    this.interval = null;
    this.logger = logger;
  }

  apend(vp) {
    const that = this;
    try {
      that._init();
      if (!that.queues.hasOwnProperty(vp.queue)) {
        that.queues[vp.queue] = {
          counter: 0,
          messages: [],
        };
      }
      const qData = that.queues[vp.queue];
      qData.messages.push(vp.json);
      qData.counter++;
      const len = qData.messages.length;
      if (len >= that.config.flushThreshold) {
        that._produce(vp.queue);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  _init() {
    const that = this;
    if (that.interval === null) {
      that.interval = setInterval(() => {
        Object.keys(that.queues).forEach((queue) => {
          that._produce(queue);
        });
      }, that.config.flushInterval);
    }
  }

  _produce(queue) {
    const that = this;
    const qData = that.queues[queue];
    const messages = qData.messages.splice(0, that.config.flushThreshold);
    const len = messages.length;
    if (len > 0) {
      qData.counter -= len;
      that.provider.produce({
        queue: queue,
        json: {
          messages: messages,
        },
        buffer: 'none',
      }).then(() => {
        that.logger.info(`Produced ${len} messages from buffer for queue ${queue}`);
      }).catch((err) => {
        Array.prototype.push.apply(qData.messages, messages);
        qData.counter += len;
        that.provider.logger.error(err);
      });
    } else {
      that.logger.silly(`nothing to produce for queue ${queue}`);
    }
  }
}

module.exports = MemoryBuffer;
