'use strict';

/**
 * Publish a message to be consumed by a subscriber as soon as it is published
 * @param {object} params - object parameters
 * @param {string} params.queue - the queue name where to publish the message
 * @param {object} params.json - the message to publish in json format
 * @param {object} that - reference to main class
 * @return {object}
 */

module.exports = (params, that) => {
  return {
    params: params,
    pattern: {
      queue: {
        type: 'string',
        optional: true,
      },
      json: 'object',
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          // if we provide queue, we want resiliency
          const exName = vp.queue ? 'cta-durable' : 'cta-temporary';
          const durable = vp.queue ? true : false;
          const queue = vp.queue ? vp.queue : '';
          const persistent = vp.queue ? true : false;
          that.channel.assertExchange(exName, 'fanout', {durable: durable}, (aErr, aData) => {
            if (aErr) {
              return reject(aErr);
            }
            that.channel.publish(exName, queue, that._jsonToBuffer(vp.json), {persistent: persistent}, (pErr) => {
              if (pErr) {
                return reject(pErr);
              }
              that.logger.debug('Published new message: ', vp.json);
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
