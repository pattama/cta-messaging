'use strict';

const _ = require('lodash');
const Nedb = require('nedb');
const path = require('path');

/**
 * Produce a message in a queue
 * @param {object} params - object of parameters
 * @param {string} params.queue - the queue name where to produce the message
 * @param {object} params.json - the message to produce as json
 * @param {string} params.buffer - buffer storage, if it is set, then produce to rabbitmq server only when one of flushThreshold and flushInterval is reached
 * - none: no buffer
 * - memory: use memory, faster but doesn't survive to application crashes
 * - file: use file on disk, slower but survives to application crashes
 * @param {object} that - reference to main class
 * @return {object} - promise
 */

module.exports = (params, that) => {
  return {
    params: params,
    pattern: {
      type: 'object',
      items: {
        queue: 'string',
        json: 'object',
        buffer: {
          type: 'string',
          optional: true,
          defaultTo: 'none',
        },
      },
    },
    cb: (vp) => {
      return new Promise((resolve, reject) => {
        try {
          if (vp.buffer !== 'none') {
            const db = (vp.buffer === 'memory' ? that.buffer.produce.db.memory : that.buffer.produce.db.file);
            /*if (vp.buffer === 'memory') {
              if (that.buffer.produce.db.memory === null) {
                that.buffer.produce.db.memory = new Nedb();
              }
              db = that.buffer.produce.db.memory;
            } else if (vp.buffer === 'file') {
              if (that.buffer.produce.db.file === null) {
                const filename = path.join(that.config.buffer.location, 'produce.db');
                that.logger.info(`using file buffer ${filename}`);
                that.buffer.produce.db.file = new Nedb({
                  filename: filename,
                  autoload: true,
                });
              }
              db = that.buffer.produce.db.file;
            }*/
            db.insert({
              queue: vp.queue,
              json: vp.json,
            }, (insertErr, doc) => {
              if (insertErr) {
                reject(insertErr);
              } else {
                that.buffer.produce.counter++;
                that.logger.info('message saved in buffer');
                if (that.buffer.produce.counter < that.config.flushThreshold) {
                  return resolve('done');
                }
                if (that.buffer.produce.busy === true) {
                  return resolve('done');
                }
                that.buffer.produce.busy = true;
                db.find({
                  queue: vp.queue,
                }, (findErr, docs) => {
                  if (findErr) {
                    that.logger.error(findErr);
                    reject(findErr);
                  } else if (docs.length >= that.config.flushThreshold) {
                    const messages = docs.map((msg) => {
                      return msg.json;
                    });
                    that.produce({
                      queue: vp.queue,
                      json: {
                        messages: messages,
                      },
                      buffer: 'none',
                    }).then(() => {
                      that.logger.info(`produced ${docs.length} messages from buffer`);
                      const ids = docs.map((msg) => {
                        return { _id: msg._id };
                      });
                      db.remove({$or: ids}, { multi: true }, (removeErr, total) => {
                        if (removeErr) {
                          that.logger.error(removeErr);
                          reject(removeErr);
                        } else {
                          that.logger.info(`removed ${total} messages from buffer`);
                          that.buffer.produce.counter -= total;
                          that.buffer.produce.busy = false;
                          resolve('done');
                        }
                      });
                    }).catch((produceErr) => {
                      that.logger.error(produceErr);
                      reject(produceErr);
                    });
                  } else {
                    that.buffer.produce.busy = false;
                  }
                });
              }
            });
          } else {
            that.channel.assertQueue(vp.queue, {durable: true, autoDelete: false}, (qErr, qData) => {
              if (qErr) {
                return reject(qErr);
              }
              that.channel.sendToQueue(vp.queue, that._jsonToBuffer(vp.json), {persistent: true}, (sErr) => {
                if (sErr) {
                  return reject(sErr);
                }
                that.logger.debug('produced new message: ', vp.json);
                resolve(qData);
              });
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    },
  };
};
