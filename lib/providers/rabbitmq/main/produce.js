/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const co = require('co');
const FileBuffer = require('../buffers/file');
const MemoryBuffer = require('../buffers/memory');

/**
 * Produce a message in a queue
 * @param {object} params - object of parameters
 * @param {string} params.queue - the queue name where to produce the message
 * @param {object} params.content - the message to produce
 * @param {string} params.buffer - buffer storage, if it is set, then produce to rabbitmq server only when one of flushThreshold and flushInterval is reached
 * - none: no buffer
 * - memory: use memory, faster but doesn't survive to application crashes
 * - file: use file on disk, slower but survives to application crashes
 * @return {object} - promise
 */

module.exports = function(params) {
  const that = this;
  return this._exec({
    params: params,
    pattern: {
      type: 'object',
      items: {
        queue: 'string',
        content: 'object',
        autoDelete: {
          type: 'boolean',
          optional: true,
          defaultTo: false,
        },
        expires: {
          type: 'number',
          optional: true,
          defaultTo: 0,
        },
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
            yield buffer.append(vp, 'queue');
            resolve(`saved to ${vp.buffer} buffer: `, vp.content);
          } else {
            const options = {durable: true, autoDelete: vp.autoDelete};
            if (vp.expires > 0) {
              options.expires = vp.expires;
            }
            const channel = yield that._channel();
            const qData = yield channel.assertQueue(vp.queue, options);
            if (channel.sendToQueue(vp.queue, that._jsonToBuffer(vp.content), {persistent: true})) {
              that.logger.debug('Produced new message: ', vp.content);
              resolve(qData);
            } else {
              that.logger.error('Message not produced: ', vp.content);
              reject(qData);
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
