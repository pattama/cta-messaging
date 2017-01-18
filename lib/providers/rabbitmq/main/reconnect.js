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
