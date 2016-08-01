'use strict';

const providers = require('./providers');
/**
 * Exports a Messaging tool
 * @param {object} properties - module properties
 * @param {string} properties.provider - provider name, see supported providers list
 * @param {object} properties.parameters - provider parameters, refer to provider's doc
 * @param {object} dependencies
 * @constructor
 */

module.exports = function Messaging(properties, dependencies) {
  const provider = (properties && typeof properties === 'object' && properties.provider) ? properties.provider : 'rabbitmq';
  const parameters = (properties && typeof properties === 'object' && properties.parameters) ? properties.parameters : {};
  if ( !(provider in providers) ) {
    throw new Error(`Unknown provider "${provider}"`);
  }
  return providers[provider](parameters, dependencies, 'cta-messaging');
};
