'use strict';

const common = require('cta-common');
const defaults = require('../config.defaults');

class MemoryBuffer {
  /**
   * class constructor
   * @param {object} config - configuration object
   * - flushInterval: interval in ms for flushing the buffer
   * - flushThreshold: max number of messages in buffer, buffer will be flushed when it reaches this size
   * @param {object} provider
   * @param {object} logger
   */
  constructor(config, provider, logger) {
    this.config = common.validate(config, {
      type: 'object',
      optional: true,
      defaultToOptionals: true,
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
    this.data = {
      queue: {},
      topic: {},
    };
    this.interval = null;
    this.logger = logger;
  }

  /**
   * append message to buffer
   * @param {object} vp - validated parameters for provider method
   * @param {string} type - topic or queue
   * @returns {Promise}
   */
  append(vp, type) {
    const that = this;
    try {
      that._init(type);
      const key = (type === 'queue' ? vp.queue : (vp.exchange + (vp.topic ? ('-' + vp.topic) : '')));
      if (!that.data[type].hasOwnProperty(key)) {
        that.data[type][key] = {
          counter: 0,
          messages: [],
        };
      }
      const qData = that.data[type][key];
      qData.messages.push(vp.content);
      if (type === 'topic') {
        qData.exchange = vp.exchange;
        qData.topic = vp.topic;
      }
      qData.counter++;
      const len = qData.messages.length;
      if (len >= that.config.flushThreshold) {
        that._produce(key, type);
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * init buffer
   * @param {string} type - topic or queue
   * @private
   */
  _init(type) {
    const that = this;
    if (that.interval === null) {
      that.interval = setInterval(() => {
        Object.keys(that.data[type]).forEach((key) => {
          that._produce(key, type);
        });
      }, that.config.flushInterval);
    }
  }
  /**
   * send to rabbitmq
   * @param {string} key - queue or exchange-topic
   * @param {string} type - queue or topic
   * @private
   */
  _produce(key, type) {
    const that = this;
    const qData = that.data[type][key];
    const messages = qData.messages.splice(0, that.config.flushThreshold);
    const len = messages.length;
    if (len === 0) {
      that.logger.silly(`nothing to produce for key ${key} of type ${type}`);
      return;
    }
    qData.counter -= len;
    if (type === 'queue') {
      that.provider.produce({
        queue: key,
        content: {
          messages: messages,
        },
        buffer: 'none',
      }).then(() => {
        that.logger.info(`Produced ${len} messages from buffer for queue ${key}`);
      }).catch((err) => {
        Array.prototype.push.apply(qData.messages, messages);
        qData.counter += len;
        that.provider.logger.error(err);
      });
    } else if (type === 'topic') {
      that.provider.publish({
        exchange: qData.exchange,
        topic: qData.topic,
        content: {
          messages: messages,
        },
        buffer: 'none',
      }).then(() => {
        that.logger.info(`Produced ${len} messages from buffer for queue ${key}`);
      }).catch((err) => {
        Array.prototype.push.apply(qData.messages, messages);
        qData.counter += len;
        that.provider.logger.error(err);
      });
    }
  }
}

module.exports = MemoryBuffer;
