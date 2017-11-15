/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const _ = require('lodash');
const co = require('co');

/**
 * Consume a message from a queue
 * @param {object} params - object parameters
 * @param {string} params.queue - the queue name where to produce the message
 * @param {function} params.cb - callback function to run after consuming a message
 * @param {string} params.ack - ack mode
 * if 'auto': ack as soon as the message is consumed
 * if 'resolve': ack as soon as the callback is resolved
 * else you should ack manually by calling provider's ack method
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
        cb: 'function',
        prefetch: {
          optional: true,
          type: 'number',
          defaultTo: 0,
        },
        ack: {
          optional: true,
          type: 'string',
          defaultTo: '',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        co(function * () {
          const channel = yield that._channel();
          const qData = yield channel.assertQueue(vp.queue, {durable: true, autoDelete: false});
          if (vp.prefetch) {
            channel.prefetch(vp.prefetch);
          }
          const cData = yield channel.consume(vp.queue, function(msg) {
            if (msg === null) {
              that.logger.info(`Consumer on queue ${vp.queue} has been cancelled.`);
              return;
            }
            const content = that._processMsg(msg, !/^auto$|^resolve$/.test(vp.ack), channel);
            if (content === null) {
              return;
            }
            that.logger.debug('Received new message, ', content);
            let response;
            try {
              response = vp.cb(content, {logger: that.logger});
              that.logger.silly('Callback response: ', response);
            } catch (e) {
              that.logger.error('Consumer callback error: ', e.message || e);
              return;
            }
            Promise.all([response])
              .then(() => {
                that.logger.debug('Resolved consumer callback');
                if (vp.ack === 'resolve') {
                  channel.ack(msg);
                  that.logger.debug('Acknowledged message: ', content);
                }
              })
              .catch((err) => {
                that.logger.error('Consumer callback error: ', err.message || err);
              });
          }, {noAck: (vp.ack === 'auto')});
          that.logger.debug(`Starting new consumer with id ${cData.consumerTag}, waiting for messages in queue ${vp.queue}`);
          that.consumers[cData.consumerTag] = {
            method: 'consume',
            params: params,
            channel: channel,
          };
          resolve(_.assign(qData, cData));
        }).catch((err) => {
          reject(err);
        });
      });
    },
  });
};
