/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Cancel a consumer
 * @param {string} consumerTag - consumerTag
 * @return {object}
 */
module.exports = function(consumerTag) {
  const that = this;
  return this._exec({
    params: consumerTag,
    pattern: 'string',
    cb: (tag) => {
      return new Promise((resolve, reject) => {
        let channel = that.consumers[tag].channel;
        channel.cancel(tag)
          .then(() => {
            channel.close();
            delete that.consumers[tag];
            return Promise.resolve();
          })
          .then(resolve, reject);
      });
    },
  });
};
