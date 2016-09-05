'use strict';

const co = require('co');
const coForEach = require('co-foreach');

function produceFromFile(that, db, queue) {
  that.buffer.queues.lockRead = true;
  db.find({
    queue: queue,
  })
  .limit(that.config.buffer.flushThreshold)
  .exec((findErr, docs) => {
    if (findErr) {
      that.buffer.queues.lockRead = false;
      that.logger.error(findErr);
      return;
    }
    const messages = docs.map((msg) => {
      return msg.json;
    });
    that.produce({
      queue: queue,
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
          that.buffer.queues.lockRead = false;
          that.logger.error(removeErr);
          return;
        }
        that.logger.info(`removed ${total} messages from buffer`);
        that.buffer.queues[queue] -= total;
        that.buffer.queues.lockRead = false;
      });
    }).catch((produceErr) => {
      that.buffer.queues.lockRead = false;
      that.logger.error(produceErr);
    });
  });
}

function startInterval(that, db) {
  if (that.buffer.queues.interval !== null) {
    return;
  }
  that.buffer.queues.interval = setInterval(() => {
    if (that.buffer.queues.lockRead === true) {
      that.logger.debug(`read file is locked, will try again in ${that.config.buffer.flushInterval} ms`);
      return;
    }
    that.buffer.queues.lockRead = true;
    db.find({}, (findErr, docs) => {
      if (findErr) {
        that.buffer.queues.lockRead = false;
        that.logger.error(findErr);
        return;
      }
      coForEach(Object.keys(that.buffer.queues), function* (queue) {
        const qDocs = docs.filter((doc) => {
          return doc.queue === queue;
        });
        const qMessages = [];
        const qIds = [];
        qDocs.forEach((doc) => {
          qMessages.push(doc.json);
          qIds.push(doc._id);
        });
        if (qMessages.length) {
          yield that.produce({
            queue: queue,
            json: {
              messages: qMessages,
            },
            buffer: 'none',
          }).then(() => {
            const removeIds = qIds.map((id) => {
              return {_id: id};
            });
            db.remove({$or: removeIds}, {multi: true}, (removeErr, total) => {
              if (removeErr) {
                that.buffer.queues.lockRead = false;
                that.logger.error(removeErr);
                return;
              }
              that.logger.info(`removed ${total} messages from buffer`);
              that.buffer.queues[queue] -= removeIds.length;
              that.buffer.queues.lockRead = false;
            });
          }).catch((err) => {
            that.buffer.queues.lockRead = false;
            that.logger.error(err);
          });
          that.logger.info(`produced ${docs.length} messages from buffer`);
        } else {
          that.logger.debug('nothing to produce');
          that.buffer.queues.lockRead = false;
        }
      });
    });
  }, that.config.buffer.flushInterval);
}

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
            const db = (vp.buffer === 'memory' ? that.buffer.queues.dbMemory : that.buffer.queues.dbFile);
            if (!that.buffer.queues.hasOwnProperty(vp.queue)) {
              that.buffer.queues[vp.queue] = 0;
            }
            db.insert({
              queue: vp.queue,
              json: vp.json,
            }, (insertErr, doc) => {
              if (insertErr) {
                that.logger.error(insertErr);
              } else {
                startInterval(that, db);
                that.buffer.queues[vp.queue]++;
                that.logger.info('message saved in buffer: ', vp.json);
                resolve('done');
                // produce to rmq?
                if (that.buffer.queues[vp.queue] < that.config.buffer.flushThreshold) {
                  that.logger.info(`queue counter ${that.buffer.queues[vp.queue]}`);
                  return;
                }
                if (that.buffer.queues.lockRead === true) {
                  that.logger.info('read file is locked');
                } else {
                  produceFromFile(that, db, vp.queue);
                }
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
