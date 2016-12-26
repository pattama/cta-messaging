'use strict';
const co = require('co');

/**
 * Get a message from a queue
 * @param {object} params - object parameters
 * @param {string} params.queue - the queue name where to get the message
 * @param {string} params.ack - ack mode
 * if 'auto': ack as soon as the message is consumed
 * else you should ack manually by calling provider's ack method
 * @param {object} that - reference to main class
 * @return {object}
 */

module.exports = (params, that) => {
  return {
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
      return new Promise((resolve, reject) => {
        co(function * () {
          const channel = yield that._channel();
          channel.prefetch(1);
          that.logger.debug(`Getting one message from queue '${vp.queue}'`);
          const msg = yield channel.get(vp.queue, {noAck: (vp.ack === 'auto')});
          let json = {};
          if (!msg) {
            json = null;
            that.logger.debug(`No more messages to get in queue '${vp.queue}'`);
          } else {
            json = that._processMsg(msg, (vp.ack !== 'auto'));
            that.logger.debug('Got new message: ', json);
          }
          resolve({
            json: json,
          });
          channel.close();
        })
        .catch((err) => {
          resolve({
            json: null,
            error: err.message || err,
          });
        });
      });
    },
  };
};
