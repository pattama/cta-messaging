'use strict';

const co = require('co');
const Tool = require('cta-tool');
const common = require('cta-common');
const defaults = require('./config.defaults');

/**
 * RabbitMQProvider class
 * @class
 */
class RabbitMQProvider extends Tool {
  /**
   * Create a new RabbitMQProvider instance
   * @param {object} configuration
   * @param {object} configuration.parameters.url - RabbitMQ url
   * @param {number} configuration.parameters.reConnectAfter - delay in ms to reconnect RabbitMQ after disconnection
   * @param {number} configuration.parameters.clearInterval - interval in ms to clear old messages that are saved in memory for acknowledgement
   * @param {number} configuration.parameters.clearOffset - time offset in ms to clear old messages
   * @param {object} dependencies
   * @param {object} dependencies.healthcheck - cta-healthcheck instance
   */
  constructor(dependencies, configuration) {
    const instance = super(dependencies, configuration);
    const that = this;
    if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }
    this.dependencies = dependencies;
    this.logger = this.logger.author('rabbitmq');
    if (!configuration.properties.parameters) {
      configuration.properties.parameters = {};
    }
    this.config = common.validate(configuration.properties.parameters, {
      type: 'object',
      items: {
        url: {
          optional: true,
          type: 'string',
          defaultTo: defaults.url,
        },
        reConnectAfter: {
          optional: true,
          type: 'number',
          defaultTo: defaults.reConnectAfter,
        },
        reChannelAfter: {
          optional: true,
          type: 'number',
          defaultTo: defaults.reChannelAfter,
        },
        clearInterval: {
          optional: true,
          type: 'number',
          defaultTo: defaults.clearInterval,
        },
        clearOffset: {
          optional: true,
          type: 'number',
          defaultTo: defaults.clearOffset,
        },
        healthCheckInterval: {
          optional: true,
          type: 'number',
          defaultTo: defaults.healthCheckInterval,
        },
        buffer: {
          optional: true,
          type: 'object',
          defaultTo: {},
        },
      },
    }).output;
    this.logger.info('Starting RabbitMQ with configuration ' + JSON.stringify(this.config));
    this.reconnecting = false;
    this.connection = null;
    this.consumers = {};
    this.messages = {};
    this.acked = {};
    this.buffer = {
      memory: null,
      file: null,
    };
    this._houseKeeping();
    this.init();
    if (this.dependencies.healthcheck) {
      setInterval(function() {
        that.healthCheck();
      }, that.config.healthCheckInterval);
    }
    this.fullyInitialized = true;
  }

  /**
   * Convert a buffer to a json
   * @param {buffer} buffer - the buffer to convert
   * @private
   */
  _bufferToJSON(buffer) {
    return JSON.parse(buffer.toString());
  }

  /**
   * @param {object} json - the json to convert
   * @returns {Buffer} - the converted json as buffer
   * @private
   */
  _jsonToBuffer(json) {
    return new Buffer(JSON.stringify(json));
  }

  /**
   * Execute a main method
   * first validate main method params,
   * then check RabbitMQ connection,
   * then execute the method
   * ensure to return a same pattern
   * @param input - object of parameters
   * @param input.params - main method parameters
   * @param input.pattern - main method parameters pattern for validation
   * @param input.cb - main method to execute
   * @returns {Promise} - {result: *, params: *}
   * @private
   */
  _exec(input) {
    const that = this;
    return new Promise((resolve, reject) => {
      co(function*() {
        const vp = common.validate(input.params, input.pattern, {throwErr: true}).output;
        yield that.init();
        const result = yield input.cb(vp); // TODO remove try catch from cb
        resolve({result: result, params: vp});
      }).catch((err) => {
        that.logger.error(err);
        reject(err);
      });
    });
  }

  /**
   * RabbitMQ health check
   * @returns {boolean} - true if connected, false if not
   */
  healthCheck() {
    return (this.connection ? true : false);
    /*this.dependencies.healthcheck.update({
     name: 'Messaging',
     child: 'rabbitmq',
     status: this.connection ? 'green' : 'red',
     reason: this.connection ? 'connected' : 'not connected',
     });*/
  }
}

// private
RabbitMQProvider.prototype._connect = require('./main/connect');
RabbitMQProvider.prototype._reConnect = require('./main/reconnect');
RabbitMQProvider.prototype._reconnectConsumers = require('./main/reconnect-consumers');
RabbitMQProvider.prototype._channel = require('./main/channel');
RabbitMQProvider.prototype._houseKeeping = require('./main/house-keeping');
RabbitMQProvider.prototype._processMsg = require('./main/process-msg');

// public
RabbitMQProvider.prototype.init = require('./main/init');
RabbitMQProvider.prototype.produce = require('./main/produce');
RabbitMQProvider.prototype.get = require('./main/get');
RabbitMQProvider.prototype.consume = require('./main/consume');
RabbitMQProvider.prototype.publish = require('./main/publish');
RabbitMQProvider.prototype.subscribe = require('./main/subscribe');
RabbitMQProvider.prototype.ack = require('./main/ack');
RabbitMQProvider.prototype.nack = require('./main/nack');
RabbitMQProvider.prototype.info = require('./main/info');
RabbitMQProvider.prototype.cancel = require('./main/cancel');

exports = module.exports = RabbitMQProvider;
