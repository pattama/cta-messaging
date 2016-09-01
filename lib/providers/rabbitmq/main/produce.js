'use strict';

const _ = require('lodash');

/**
 * Produce a message in a queue
 * @param {object} params - object of parameters
 * @param {string} params.queue - the queue name where to produce the message
 * @param {object} params.json - the message to produce as json
 * @param {boolean} params.buffer - whether to use buffer or not
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
          type: 'boolean',
          optional: true,
          defaultTo: false,
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        if (vp.buffer === true) {
          if (!that.buffer.queues.hasOwnProperty(vp.queue)) {
            that.buffer.queues[vp.queue] = [];
          }
          that.buffer.queues[vp.queue].push(vp.json);
          if (!that.buffer.interval) {
            that.buffer.interval = setInterval(() => {
              const len = that.buffer.queues[vp.queue].length;
              if (len > 0) {
                const messages = _.cloneDeep(that.buffer.queues[vp.queue]);
                that.buffer.queues[vp.queue] = [];
                that.produce({
                  queue: vp.queue,
                  json: {
                    messages: messages,
                  },
                  buffer: false,
                }).then(() => {
                  that.logger.info(`Produced ${len} messages from buffer`);
                });
              }
            }, that.config.flushInterval);
          }
          return resolve('message saved in buffer');
        }
        that.channel.assertQueue(vp.queue, {durable: true, autoDelete: false}, (qErr, qData) => {
          if (qErr) {
            return reject(qErr);
          }
          that.channel.sendToQueue(vp.queue, that._jsonToBuffer(vp.json), {persistent: true}, (sErr) => {
            if (sErr) {
              return reject(sErr);
            }
            that.logger.debug('Produced new message: ', vp.json);
            resolve(qData);
          });
        });
      });
    },
  };
};
