'use strict';

/**
 * Return information about a queue
 * @param {string} queue - queue name
 * @param {object} that - reference to main class
 * @return {object} - promise
 */
module.exports = (queue, that) => {
  return {
    params: queue,
    pattern: 'string',
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        that.channel.assertQueue(vp, null, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    },
  };
};
