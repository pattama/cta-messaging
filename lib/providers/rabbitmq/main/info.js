'use strict';
const co = require('co');

/**
 * Return information about a queue
 * @param {string} queue - queue name
 * @return {object} - promise
 */
module.exports = function(queue) {
  const that = this;
  return this._exec({
    params: queue,
    pattern: 'string',
    cb: (q) => {
      return new Promise((resolve) => {
        co(function * () {
          const channel = yield that._channel();
          const data = yield channel.checkQueue(q);
          resolve(data);
          channel.close();
        }).catch((e) => {
          resolve({error: e.message || e});
        });
      });
    },
  });
};
