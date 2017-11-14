/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Housekeeping: remove old messages from memory that have not been acknowledged
 * @private
 */
module.exports = function() {
  const that = this;
  setInterval(function() {
    Object.keys(that.messages).forEach((id) => {
      const offset = Date.now() - that.config.clearOffset;
      if (that.messages[id].timestamp < offset) {
        delete that.messages[id];
      }
    });
    Object.keys(that.acked).forEach((id) => {
      const offset = Date.now() - that.config.clearOffset;
      if (that.acked[id] < offset) {
        delete that.acked[id];
      }
    });
  }, that.config.clearInterval);
};
