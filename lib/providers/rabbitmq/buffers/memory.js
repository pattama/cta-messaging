'use strict';

class MemoryBuffer {
  constructor(config, provider) {
    this.config = config;
    this.provider = provider;
    this.queues = {};
    this.interval = null;
  }

  init() {
    const that = this;
    if (that.interval === null) {
      that.interval = setInterval(() => {
        Object.keys(that.queues).forEach((queue) => {
          that.produce(queue);
        });
      }, that.config.flushInterval);
    }
  }

  apend(vp) {
    const that = this;
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
      that.produce(vp.queue);
    }
  }

  produce(queue) {
    const that = this;
    const qData = that.queues[queue];
    const messages = qData.messages.splice(0, that.config.flushThreshold);
    // that.provider.logger.silly('messages: ', messages, 'qData: ', qData);
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
        that.provider.logger.info(`Produced ${len} messages from buffer for queue ${queue}`);
      }).catch((err) => {
        Array.prototype.push.apply(qData.messages, messages);
        qData.counter += len;
        that.provider.logger.error(err);
      });
    } else {
      that.provider.logger.silly(`nothing to produce for queue ${queue}`);
    }
  }
}

module.exports = MemoryBuffer;
