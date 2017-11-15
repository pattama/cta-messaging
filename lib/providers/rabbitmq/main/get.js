/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const co = require('co');

/**
 * Get a message from a queue
 * @param {object} params - object parameters
 * @param {string} params.queue - the queue name where to get the message
 * @param {string} params.ack - ack mode
 * if 'auto': ack as soon as the message is consumed
 * else you should ack manually by calling provider's ack method
 * @return {object}
 */

module.exports = function(params) {
  const that = this;
  return this._exec({
    params: params,
    pattern: {
      type: 'object',
      items: {
        queue: 'string',
        ack: {
          optional: true,
          type: 'string',
          defaultTo: '',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve) => {
        co(function * () {
          const channel = yield that._channel();
          channel.prefetch(1);
          that.logger.debug(`Getting one message from queue '${vp.queue}'`);
          // TODO assert queue first
          const msg = yield channel.get(vp.queue, {noAck: (vp.ack === 'auto')});
          let content = {};
          if (!msg) {
            content = null;
            that.logger.debug(`No more messages to get in queue '${vp.queue}'`);
          } else {
            content = that._processMsg(msg, (vp.ack !== 'auto'), channel);
            that.logger.debug('Got new message: ', content);
          }
          resolve({
            content: content,
          });
          if (vp.ack === 'auto') {
            channel.close();
          }
        })
        .catch((err) => {
          resolve({
            content: null,
            error: err.message || err,
          });
        });
      });
    },
  });
};
