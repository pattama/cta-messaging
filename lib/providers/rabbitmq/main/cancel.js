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
