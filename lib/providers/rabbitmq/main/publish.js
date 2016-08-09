'use strict';

/**
 * Publish a message to be consumed by one or many subscribers as soon as it is published
 * @param {object} params - object parameters
 * @param {string} params.exchange - optional, the exchange name
 * @param {string} params.topic - optional, the routing key
 * @param {object} params.json - the message
 * @param {object} that - reference to main class
 * @return {object}
 */

module.exports = (params, that) => {
  return {
    params: params,
    pattern: {
      exchange: {
        type: 'string',
        optional: true,
        defaultTo: 'cta-oss',
      },
      topic: {
        type: 'string',
        optional: true,
        defaultTo: '',
      },
      json: 'object',
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          that.channel.assertExchange(vp.exchange, 'topic', {durable: 'true'}, (aErr, aData) => {
            if (aErr) {
              return reject(aErr);
            }
            that.channel.publish(vp.exchange, vp.topic, that._jsonToBuffer(vp.json), {persistent: 'true'}, (pErr) => {
              if (pErr) {
                return reject(pErr);
              }
              that.logger.debug(`Published new message ${vp.json} with routing key ${vp.topic}`);
              resolve(aData);
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
