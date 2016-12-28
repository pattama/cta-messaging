'use strict';

const shortId = require('shortid');

/**
 * Process a consumed message:
 * - transform the msg buffer into json
 * - generate an id if necessary
 * - save the message for future acknowledgement if necessary
 * @param {object} msg - consumed message
 * @param {boolean} save - whether to save the message for future acknowledgement
 * @returns {object}
 * @private
 */
module.exports = {
  key: '_processMsg',
  fn: (msg, save, channel, that) => {
    let content = null;
    try {
      content = that._bufferToJSON(msg.content);
      const acked = content.id && that.acked[content.id];
      if (acked) {
        that.logger.debug(`Message with id '${content.id}' has already been acked. Deleting from Queue...`);
        that.nack({
          msg: msg,
          requeue: false,
        });
        content = null;
      }
      if (content !== null && !content.id) {
        content.id = shortId.generate();
      }
      if (save === true && !acked) {
        that.messages[content.id] = {
          msg: msg,
          channel: channel,
          timestamp: Date.now(),
        };
      }
    } catch (e) {
      that.logger.error(e.message);
    }
    return content;
  },
};
