'use strict';

/**
 * Not acknowledge a message in a queue, put it back to the queue
 * @param {string} params - object of parameters
 * @param {string} params.id - id of the message to acknowledge if params.msg not provided
 * @param {object} params.msg - rabbitMQ message to acknowledge if params.id not provided
 * @param {boolean} params.requeue - RabbitMQ option, whether to requeue the msg or not
 * @param {object} that - reference to main class
 * @returns {object}
 */
module.exports = (params, that) => {
  return {
    params: params,
    pattern: {
      type: 'object',
      items: {
        id: {
          type: 'string',
          optional: true,
          defaultTo: '',
        },
        msg: {
          type: 'object',
          optional: true,
          defaultTo: null,
        },
        requeue: {
          type: 'boolean',
          optional: true,
          defaultTo: true,
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          if (that.messages.hasOwnProperty(vp.id)) {
            if (that.messages[vp.id].channel) {
              that.messages[vp.id].channel.nack(that.messages[vp.id].msg);
              delete that.messages[vp.id];
            }
            resolve();
          } else {
            reject(`Can't find message with id '${id}' for not acknowledgement`);
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
