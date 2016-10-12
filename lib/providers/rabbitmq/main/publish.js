'use strict';

const FileBuffer = require('../buffers/file');
const MemoryBuffer = require('../buffers/memory');

/**
 * Publish a message to be consumed by one or many subscribers as soon as it is published
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, the exchange name
 * @param {string} params.topic - optional, the routing key
 * @param {object} params.json - the message
 * @param {string} params.buffer - buffer storage, if it is set, then produce to rabbitmq server only when one of flushThreshold and flushInterval is reached
 * - none: no buffer
 * - memory: use memory, faster but doesn't survive to application crashes
 * - file: use file on disk, slower but survives to application crashes
 * @param {object} that - reference to main class
 * @return {object}
 */

module.exports = (params, that) => {
  return {
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
        json: 'object',
        buffer: {
          type: 'string',
          optional: true,
          defaultTo: 'none',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          if (vp.buffer === 'memory' || vp.buffer === 'file') {
            if (vp.buffer === 'file' && !that.buffer.file) {
              that.buffer.file = new FileBuffer(that.config.buffer, that, that.logger);
            } else if (vp.buffer === 'memory' && !that.buffer.memory) {
              that.buffer.memory = new MemoryBuffer(that.config.buffer, that, that.logger);
            }
            const buffer = (vp.buffer === 'memory' ? that.buffer.memory : that.buffer.file);
            buffer.append(vp, 'topic')
              .then(() => {
                resolve(`saved to ${vp.buffer} buffer: `, vp.json);
              }).catch((err) => {
                reject(err);
              });
          } else {
            that.channel.assertExchange(vp.exchange, 'topic', {durable: 'true'}, (aErr, aData) => {
              if (aErr) {
                return reject(aErr);
              }
              that.channel.publish(vp.exchange, vp.topic, that._jsonToBuffer(vp.json), {persistent: 'true'}, (pErr) => {
                if (pErr) {
                  return reject(pErr);
                }
                that.logger.debug(`Published new message ${vp.json} with routing key ${vp.topic}`);
                resolve(aData);
              });
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
