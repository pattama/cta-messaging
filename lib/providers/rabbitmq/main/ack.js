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
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          if (that.messages.hasOwnProperty(vp)) {
            if (that.channel) {
              that.channel.ack(that.messages[vp].msg);
              delete that.messages[vp];
            }
            that.acked[vp] = Date.now();
            resolve();
          } else {
            reject(`Can't find message with id '${vp}' for acknowledgement`);
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
