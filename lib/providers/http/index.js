'use strict';

const Tool = require('cta-tool');
const common = require('cta-common');
const defaults = require('./config.defaults');
const request = require('request-promise-native');
const Express = require('cta-expresswrapper');
/**
 * Http Provider class
 * @class
 */
class HttpProvider extends Tool {
  /**
   * Create a new Http instance
   * @param {object} configuration
   * @param {object} configuration.parameters.url - Http server api url
   * @param {object} dependencies
   */
  constructor(dependencies, configuration) {
    const instance = super(dependencies, configuration);
    const that = this;
    if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }
    this.dependencies = dependencies;
    this.logger = this.logger.author('http');
    if (!configuration.properties.parameters) {
      configuration.properties.parameters = {};
    }
    this.config = common.validate(configuration.properties.parameters, {
      type: 'object',
      items: {
        port: {
          optional: true,
          type: 'string',
          defaultTo: defaults.port,
        },
        url: {
          optional: true,
          type: 'string',
          defaultTo: defaults.url,
        },
      },
    }).output;
    if (!dependencies.hasOwnProperty('express') || dependencies.express === null) {
      this.express = new Express({}, {
        name: 'express',
        properties: {
          port: that.config.port,
        },
      });
    } else {
      this.express = dependencies.express;
    }
    this.express.post('/message', (req, res) => {
      res.end('ok');
    });
    this.express.start();
    this.logger.info('Starting Http provider with configuration', this.config);
    this.fullyInitialized = true;
  }

  /**
   * health check
   * @returns {boolean} - true if connected, false if not
   */
  healthCheck() {
    return true;
  }

  _exec(method, params) {
    const that = this;
    return new Promise((resolve, reject) => {
      try {
        request({
          method: 'POST',
          uri: that.config.url,
          body: {
            method: method,
            params: params,
          },
          json: true,
        }).then((data) => {
          resolve(data);
        }).catch((err) => {
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Produce a message in a queue
   * @param {object} params - object of parameters
   * @param {string} params.queue - the queue name where to produce the message
   * @param {object} params.json - the message to produce as json
   * @return {object} - promise
   */
  produce(params) {
    return this._exec('produce', params);
  }

  /**
   * Get a message from a queue
   * @param {object} params - object parameters
   * @param {string} params.queue - the queue name where to get the message
   * @param {string} params.ack - ack mode
   * if 'auto': ack as soon as the message is consumed
   * else you should ack manually by calling provider's ack method
   * @return {object} - promise
   */
  get(params) {
    return this._exec('get', params);
  }

  /**
   * Consume a message from a queue
   * @param {object} params - object parameters
   * @param {string} params.queue - the queue name where to produce the message
   * @param {function} params.cb - callback function to run after consuming a message
   * @param {string} params.ack - ack mode
   * if 'auto': ack as soon as the message is consumed
   * if 'resolve': ack as soon as the callback is resolved
   * else you should ack manually by calling provider's ack method
   * @return {object} - promise
   */
  consume(params) {
    return this._exec('consume', params);
  }

  /**
   * Publish a message to a chanel
   * @param {object} params - object parameters
   * @param {string} params.queue - the chanel key name where to publish the message
   * @param {object} params.json - the message to publish in json format
   * @return {object} - promise
   */
  publish(params) {
    return this._exec('publish', params);
  }

  /**
   * Subscribe to messages from a chanel
   * @param {object} params - object parameters
   * @param {string} params.queue - the chanel key name where to listen to messages
   * @param {function} params.cb - callback function to run after receiving a message, it takes the received json msg as a param
   * @param {string} params.ack - ack mode:
   * - if 'auto': ack as soon as the message is consumed
   * - if 'resolve': ack as soon as the callback is resolved
   * - else you should ack manually by calling provider's ack method
   * @return {object} - promise
   */
  subscribe(params) {
    return this._exec('subscribe', params);
  }

  /**
   * Acknowledge a message in a queue, remove it from the queue
   * @param {string} ackId - id of the message to acknowledge
   * @returns {Promise}
   */
  ack(ackId) {
    return this._exec('ack', ackId);
  }

  /**
   * Not acknowledge a message in a queue
   * @param {string} params - object of parameters
   * @param {string} params.id - id of the message to acknowledge
   * @param {boolean} params.requeue - weather to requeue the msg or not
   * @returns {Promise}
   */
  nack(params) {
    return this._exec('nack', params);
  }

  /**
   * Get information about a queue
   * @param {string} queue - queue name
   * @return {object} - promise
   */
  info(queue) {
    return this._exec('info', queue);
  }

  /**
   * Cancel a consumer
   * @param {string} consumerTag - consumerTag
   * @return {object} - promise
   */
  cancel(consumerTag) {
    return this._exec('cancel', consumerTag);
  }

}

exports = module.exports = HttpProvider;
