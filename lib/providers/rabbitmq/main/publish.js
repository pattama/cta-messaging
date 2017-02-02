'use strict';

const FileBuffer = require('../buffers/file');
const MemoryBuffer = require('../buffers/memory');
const co = require('co');

/**
 * Publish a message to be consumed by one or many subscribers as soon as it is published
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, exchange name
 * @param {string} params.topic - optional, topic routing key
 * @param {object} params.content - the message to publish
 * @param {string} params.buffer - buffer storage, if it is set, then produce to rabbitmq server only when one of flushThreshold and flushInterval is reached
 * - none: no buffer
 * - memory: use memory, faster but doesn't survive to application crashes
 * - file: use file on disk, slower but survives to application crashes
 * @return {object}
 */

module.exports = function(params) {
  const that = this;
  return this._exec({
    params: params,
    pattern: {
      type: 'object',
      items: {
        exchange: {
          type: 'string',
          optional: true,
          defaultTo: 'cta-oss',
        },
        topic: {
          type: 'string',
          optional: true,
          defaultTo: '',
        },
        content: 'object',
        buffer: {
          type: 'string',
          optional: true,
          defaultTo: 'none',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        co(function * () {
          if (vp.buffer === 'memory' || vp.buffer === 'file') {
            if (vp.buffer === 'file' && !that.buffer.file) {
              that.buffer.file = new FileBuffer(that.config.buffer, that, that.logger);
            } else if (vp.buffer === 'memory' && !that.buffer.memory) {
              that.buffer.memory = new MemoryBuffer(that.config.buffer, that, that.logger);
            }
            const buffer = (vp.buffer === 'memory' ? that.buffer.memory : that.buffer.file);
            yield buffer.append(vp, 'topic');
            resolve(`saved to ${vp.buffer} buffer: `, vp.content);
          } else {
            const channel = yield that._channel();
            const aData = yield channel.assertExchange(vp.exchange, 'topic', {durable: false});
            if (channel.publish(vp.exchange, vp.topic, that._jsonToBuffer(vp.content), {persistent: 'true'})) {
              that.logger.debug(`Published new message in exchange '${vp.exchange}' with routing key '${vp.topic}'`, vp.content);
              resolve(aData);
            } else {
              that.logger.error(`Message with routing key '${vp.topic}' not published in exchange '${vp.exchange}'`, vp.content);
              reject(aData);
            }
            channel.close();
          }
        }).catch((err) => {
          reject(err);
        });
      });
    },
  });
};
