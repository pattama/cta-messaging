'use strict';

/**
 * Acknowledge a message in a queue, remove it from the queue
 * @param {string} ackId - id of the message to acknowledge
 * @returns {object}
 */
module.exports = function(ackId) {
  const that = this;
  return this._exec({
    params: ackId,
    pattern: 'string',
    cb: (id) => {
      return new Promise((resolve, reject) => {
        try {
          if (that.messages.hasOwnProperty(id)) {
            if (that.messages[id].channel) {
              that.messages[id].channel.ack(that.messages[id].msg);
              delete that.messages[id];
            }
            that.acked[id] = Date.now();
            resolve();
          } else {
            reject(`Can't find message with id '${id}' for acknowledgement: already acked/nacked, cleared or never consumed`);
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  });
};
