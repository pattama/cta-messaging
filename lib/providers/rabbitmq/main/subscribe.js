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
 * Subscribe to messages from a publisher
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, exchange name
 * @param {string} params.topic - optional, topic routing key
 * @param {function} params.cb - callback function to run after receiving a message, it takes the received msg as param
 * @param {string} params.ack - optional, acknowledge mode:
 * - if 'auto': ack as soon as the message is consumed
 * - if 'resolve': ack as soon as the callback is resolved
 * - else you should ack manually by calling provider's ack method
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
        cb: 'function',
        ack: {
          optional: true,
          type: 'string',
          defaultTo: 'auto',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        co(function * () {
          const channel = yield that._channel();
          const xData = yield channel.assertExchange(vp.exchange, 'topic', {durable: false});
          const qData = yield channel.assertQueue('', {exclusive: true});
          yield channel.bindQueue(qData.queue, vp.exchange, vp.topic, {});
          const cData = yield channel.consume(qData.queue, (msg) => {
            if (msg === null) {
              that.logger.info(`Consumer on queue ${vp.queue} has been cancelled.`);
              return;
            }
            const content = that._bufferToJSON(msg.content);
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
                that.logger.debug('Resolved subscriber callback');
                if (vp.ack === 'resolve') {
                  channel.ack(msg);
                  that.logger.silly('Acknowledged message');
                }
              })
              .catch((err) => {
                that.logger.error('Consumer callback error: ', err.message || err);
              });
          }, {noAck: (vp.ack === 'auto')});
          that.logger.debug(`Starting new consumer with id ${cData.consumerTag}, waiting for messages in exchange '${vp.exchange}' with routing key '${vp.topic}'`);
          that.consumers[cData.consumerTag] = {
            method: 'subscribe',
            params: params,
            channel: channel,
          };
          resolve(_.assign(xData, qData, cData));
        }).catch((err) => {
          reject(err);
        });
      });
    },
  });
};
