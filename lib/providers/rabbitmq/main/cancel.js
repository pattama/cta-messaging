'use strict';

/**
 * Cancel a consumer
 * @param {string} consumerTag - consumerTag
 * @param {object} that - reference to main class
 * @return {object}
 */
module.exports = (consumerTag, that) => {
  return {
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
  };
};
