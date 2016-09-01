'use strict';

const _ = require('lodash');

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
      type: 'object',
      items: {
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
        buffer: {
          type: 'boolean',
          optional: true,
          defaultTo: false,
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          const bufferId = vp.exchange + (vp.topic ? ('-' + vp.topic) : '');
          if (vp.buffer === true) {
            if (!that.buffer.topics.hasOwnProperty(bufferId)) {
              that.buffer.topics[bufferId] = {
                exchange: vp.exchange,
                topic: vp.topic,
                messages: [],
              };
            }
            that.buffer.topics[bufferId].messages.push(vp.json);
            const len = that.buffer.topics[bufferId].messages.length;
            if (len >= that.config.flushThreshold) {
              const messages = _.cloneDeep(that.buffer.topics[bufferId].messages);
              that.buffer.topics[bufferId].messages = [];
              that.publish({
                exchange: vp.exchange,
                topic: vp.topic,
                json: {
                  messages: messages,
                },
                buffer: false,
              }).then(() => {
                that.logger.info(`Published ${len} messages from buffer`);
              });
            }
            if (!that.buffer.intervals.topics) {
              that.buffer.intervals.topics = setInterval(() => {
                for (const bufferId in that.buffer.topics) {
                  if (!that.buffer.topics.hasOwnProperty(bufferId)) {
                    continue;
                  }
                  const len = that.buffer.topics[bufferId].messages.length;
                  if (len > 0) {
                    const messages = _.cloneDeep(that.buffer.topics[bufferId].messages);
                    that.buffer.topics[bufferId].messages = [];
                    that.publish({
                      exchange: that.buffer.topics[bufferId].exchange,
                      topic: that.buffer.topics[bufferId].topic,
                      json: {
                        messages: messages,
                      },
                      buffer: false,
                    }).then(() => {
                      that.logger.info(`Produced ${len} messages from buffer`);
                    });
                  }
                }
              }, that.config.flushInterval);
            }
            return resolve('message saved in buffer');
          }
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
