'use strict';

/**
 * Acknowledge a message in a queue, remove it from the queue
 * @param {string} ackId - id of the message to acknowledge
 * @param {object} that - reference to main class
 * @returns {object}
 */
module.exports = (ackId, that) => {
  return {
    params: ackId,
    pattern: 'string',
    cb: (id) => {
      return new Promise((resolve, reject) => {
        try {
          if (that.messages.hasOwnProperty(id)) {
            if (that.consumersChannel) {
              that.consumersChannel.ack(that.messages[id].msg);
              delete that.messages[id];
            }
            that.acked[id] = Date.now();
            resolve();
          } else {
            reject(`Can't find message with id '${id}' for acknowledgement`);
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
