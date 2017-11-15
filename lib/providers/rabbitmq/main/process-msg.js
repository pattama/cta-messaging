/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const shortId = require('shortid');

/**
 * Process a consumed message:
 * - transform the msg buffer into json
 * - generate an id if necessary
 * - save the message for future acknowledgement if necessary
 * @param {object} msg - consumed message
 * @param {boolean} save - whether to save the message for future acknowledgement
 * @param {object} channel - rabbitmq channel
 * @returns {object}
 * @private
 */
module.exports = function(msg, save, channel) {
  const that = this;
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
};
