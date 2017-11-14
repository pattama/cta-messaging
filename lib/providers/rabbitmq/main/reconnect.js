/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

/**
 * Try to reconnect RabbitMQ each config.reConnectAfter ms
 */

module.exports = function (){
  const that = this;
  if (that.reconnecting === true) {
    that.logger.debug('RabbitMQ is already trying to reconnect...');
    return;
  }
  that.reconnecting = true;
  that.logger.debug('Reconnecting RabbitMQ...');
  if (!that.reconnectInterval) {
    that.reconnectInterval = setInterval(function() {
      that._connect(true)
        .then(() => {
          clearInterval(that.reconnectInterval);
          that.reconnecting = false;
          that.logger.info('RabbitMQ provider has been reconnected.');
          that._reconnectConsumers();
        });
    }, that.config.reConnectAfter);
  }
};
