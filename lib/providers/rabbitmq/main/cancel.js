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
          that.consumersChannel.cancel(tag).then(resolve, reject);
      });
    },
  };
};
