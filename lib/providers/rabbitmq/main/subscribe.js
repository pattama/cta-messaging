'use strict';

const _ = require('lodash');
const co = require('co');

/**
 * Subscribe to messages from a publisher
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, exchange name
 * @param {string} params.topic - optional, topic routing key
 * @param {function} params.cb - callback function to run after receiving a message, it takes the received json msg as a param
 * @param {string} params.ack - optional, acknowledge mode:
 * - if 'auto': ack as soon as the message is consumed
 * - if 'resolve': ack as soon as the callback is resolved
 * - else you should ack manually by calling provider's ack method
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
        const durable = true;
        co(function * () {
          if (!that.subscribersChannel) {
            that.subscribersChannel = yield that._channel();
          }
          const channel = that.subscribersChannel;
          const xData = yield channel.assertExchange(vp.exchange, 'topic', {durable: durable});
          const qData = yield channel.assertQueue('', {durable: durable});
          yield channel.bindQueue(qData.queue, vp.exchange, vp.topic, {});
          const cData = yield channel.consume(qData.queue, (msg) => {
            if (msg === null) {
              that.logger.info(`Consumer on queue ${vp.queue} has been cancelled.`);
              return;
            }
            const json = that._bufferToJSON(msg.content);
            if (json === null) {
              return;
            }
            that.logger.debug('Received new message, ', json);
            const res = vp.cb(json, {logger: that.logger});
            Promise.all([res])
              .then(() => {
                that.logger.debug('Resolved subscriber callback');
                if (vp.ack === 'resolve') {
                  channel.ack(msg);
                  that.logger.silly('Acknowledged message');
                }
              })
              .catch((err) => {
                throw new Error(err);
              });
          }, {noAck: (vp.ack === 'auto')});
          that.logger.debug(`Starting new consumer with id ${cData.consumerTag}, waiting for messages in exchange '${vp.exchange}' with routing key '${vp.topic}'`);
          that.consumers[cData.consumerTag] = {
            method: 'subscribe',
            params: params,
          };
          resolve(_.assign(xData, qData, cData));
        }).catch((err) => {
          reject(err);
        });
      });
    },
  };
};
