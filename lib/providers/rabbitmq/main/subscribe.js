'use strict';

const _ = require('lodash');

/**
 * Subscribe to messages from a publisher
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, exchange name
 * @param {string} params.topic - optional, routing key
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
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        const durable = true;
        that.channel.assertExchange(vp.exchange, 'topic', {durable: durable}, (xErr, xData) => {
          if (xErr) {
            return reject(xErr);
          }
          that.channel.assertQueue('', {durable: durable}, (qErr, qData) => {
            if (qErr) {
              return reject(qErr);
            }
            that.channel.bindQueue(qData.queue, vp.exchange, vp.topic, {}, (bErr) => {
              if (bErr) {
                return reject(bErr);
              }
              that.channel.consume(qData.queue, (msg) => {
                if (msg === null) {
                  that.logger.info(`Consumer on queue ${vp.queue} has been cancelled.`);
                  return;
                }
                const json = that._bufferToJSON(msg.content);
                if (json === null) {
                  return;
                }
                that.logger.debug('subscribe: received new message, ', json);
                const res = vp.cb(json);
                Promise.all([res])
                .then(() => {
                  that.logger.debug('resolved subscribe callback');
                  if (vp.ack === 'resolve') {
                    that.channel.ack(msg);
                    that.logger.debug('acknowledged message');
                  }
                }, (cbErr) => {
                  that.logger.debug('cb error: ', cbErr);
                });
              }, {noAck: (vp.ack === 'auto')}, (cErr, cData) => {
                if (cErr) {
                  return reject(cErr);
                }
                that.logger.debug(`subscribe: starting new consumer with id ${cData.consumerTag}, waiting for messages in queue ${vp.queue}`);
                that.consumers[cData.consumerTag] = {
                  method: 'subscribe',
                  params: params,
                };
                resolve(_.assign(xData, qData, cData));
              });
            });
          });
        });
      });
    },
  };
};
