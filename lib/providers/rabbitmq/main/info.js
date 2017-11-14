/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

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
