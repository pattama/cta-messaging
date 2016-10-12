'use strict';

const FileBuffer = require('../buffers/file');
const MemoryBuffer = require('../buffers/memory');

/**
 * Produce a message in a queue
 * @param {object} params - object of parameters
 * @param {string} params.queue - the queue name where to produce the message
 * @param {object} params.json - the message to produce as json
 * @param {string} params.buffer - buffer storage, if it is set, then produce to rabbitmq server only when one of flushThreshold and flushInterval is reached
 * - none: no buffer
 * - memory: use memory, faster but doesn't survive to application crashes
 * - file: use file on disk, slower but survives to application crashes
 * @param {object} that - reference to main class
 * @return {object} - promise
 */

module.exports = (params, that) => {
  return {
    params: params,
    pattern: {
      type: 'object',
      items: {
        queue: 'string',
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
            buffer.append(vp, 'queue')
            .then(() => {
              resolve(`saved to ${vp.buffer} buffer: `, vp.json);
            }).catch((err) => {
              reject(err);
            });
          } else {
            that.channel.assertQueue(vp.queue, {durable: true, autoDelete: false}, (qErr, qData) => {
              if (qErr) {
                return reject(qErr);
              }
              that.channel.sendToQueue(vp.queue, that._jsonToBuffer(vp.json), {persistent: true}, (sErr) => {
                if (sErr) {
                  return reject(sErr);
                }
                that.logger.debug('produced new message: ', vp.json);
                resolve(qData);
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
