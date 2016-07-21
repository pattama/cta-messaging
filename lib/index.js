'use strict';

const defaultLogger = require('cta-logger');
const providers = require('./providers');

/**
 * Create a new Io instance
 * @param {string} provider - provider name, refer to list of available providers
 * @param {object} options - provider options, refer to provider's doc
 * @param {object} logger - logger instance
 * @constructor
 */

module.exports = (provider, options, logger) => {
  const _provider = (typeof provider === 'string') ? provider : 'rabbitmq';
  if ( !(_provider in providers) ) {
    throw new Error('Unknown provider "' + _provider + '"');
  }
  return providers[_provider](options, logger || defaultLogger());
};
