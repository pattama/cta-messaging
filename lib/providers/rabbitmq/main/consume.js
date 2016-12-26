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
            const content = that._processMsg(msg, !/^auto$|^resolve$/.test(vp.ack));
            if (content === null) {
              return;
            }
            that.logger.debug('Received new message, ', content);
            try {
              const res = vp.cb(content, {logger: that.logger});
            } catch (e) {
              that.logger.error('Consumer callback error: ', e.message || e);
              return;
            }
            Promise.all([res])
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
          that.logger.debug(`consume: starting new consumer with id ${cData.consumerTag}, waiting for messages in queue ${vp.queue}`);
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
  };
};
