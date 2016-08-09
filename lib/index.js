'use strict';

const Providers = require('./providers');

/**
 * Messaging tool
 * @param {object} dependencies
 * @param {object} configuration
 * @param {object} configuration.properties
 * @param {string} configuration.properties.provider - provider name, see supported providers list
 * @param {object} configuration.properties.parameters - provider parameters, refer to provider's doc
 * @constructor
 */
function Messaging(dependencies, configuration) {
  const _dependencies = dependencies ? dependencies : {};
  const _configuration = configuration ? configuration : {
    name: 'cta-messaging',
    properties: {
      provider: 'rabbitmq',
    },
    singleton: true,
  };
  return new Providers[_configuration.properties.provider](_dependencies, _configuration);
}

module.exports = Messaging;
