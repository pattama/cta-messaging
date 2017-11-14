/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Reconnect consumers after RabbitMQ is reconnected
 * @private
 */
module.exports = function() {
  const that = this;
  const keys = Object.keys(that.consumers);
  const L = keys.length;
  if (L === 0) {
    that.logger.info('No consumers detected');
  } else {
    that.logger.info(`${L} consumer(s) detected, reconnecting them...`);
    for (let i = 0; i < L; i++) {
      const e = that.consumers[keys[i]];
      that[e.method](e.params)
        .then((data) => {
          that.logger.info(`Reconnected consumer with consumerTag "${keys[i]}": `, data);
          delete that.consumers[keys[i]];
        })
        .catch((err) => {
          that.logger.error(`Can't reconnect consumer with consumerTag ${keys[i]}: `, err);
        });
    }
  }
};
