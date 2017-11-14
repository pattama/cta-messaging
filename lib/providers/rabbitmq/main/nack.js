/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Not acknowledge a message in a queue, put it back to the queue or delete it
 * @param {string} params - object of parameters
 * @param {string} params.id - id of the message to not acknowledge
 * @param {boolean} params.requeue - whether to requeue the msg or remove it completely form rmq
 * @returns {object}
 */
module.exports = function(params) {
  const that = this;
  return this._exec({
    params: params,
    pattern: {
      type: 'object',
      items: {
        id: {
          type: 'string',
          optional: true,
          defaultTo: '',
        },
        requeue: {
          type: 'boolean',
          optional: true,
          defaultTo: true,
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          if (that.messages.hasOwnProperty(vp.id)) {
            if (that.messages[vp.id].channel) {
              that.messages[vp.id].channel.nack(that.messages[vp.id].msg, false, vp.requeue);
              delete that.messages[vp.id];
            }
            resolve();
          } else {
            reject(`Can't find message with id '${vp.id}' for acknowledgement: already acked/nacked, cleared or never consumed`);
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  });
};
