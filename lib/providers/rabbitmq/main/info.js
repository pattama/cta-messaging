'use strict';
const co = require('co');

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
    cb: (vQueue) => {
      return new Promise((resolve, reject) => {
        co(function * () {
          const channel = yield that._channel();
          const data = yield channel.checkQueue(vQueue);
          resolve(data);
          channel.close();
        }).catch((e) => {
          resolve({error: e.message || e});
        });
      });
    },
  };
};
