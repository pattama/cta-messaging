'use strict';

const o = require('../../../common');
describe.skip('rabbitmq publish with buffer', () => {
  context('when flushInterval is reached', () => {
    const rmq = new o.rmq({}, {
      name: 'rmq',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          flushInterval: 100,
          flushThreshold: 10000,
        },
      },
      singleton: false,
    });
    const exchange = o.shortid.generate();
    const topic = o.shortid.generate();
    const bufferId = exchange + '-' + topic;
    it('should send all messages in buffer and flush it', (done) => {
      return o.co(function* () {
        yield rmq.init();
        let index = 0;
        const start = Date.now();
        while ((Date.now() - start) < rmq.config.flushInterval) {
          index++;
          const resp = yield rmq.publish({
            exchange: exchange,
            topic: topic,
            json: {
              index: index,
            },
            buffer: true,
          });
          console.log(resp);
          o.assert(rmq.buffer.intervals.topics);
          o.assert.strictEqual(rmq.buffer.topics[bufferId].messages.length, index);
        }
        setTimeout(() => {
          o.assert.strictEqual(rmq.buffer.topics[bufferId].messages.length, 0);
          done();
        }, 100);
      }).catch((err) => {
        done(err);
      });
    });
  });
  context('when flushThreshold is reached', () => {
    const rmq = new o.rmq({}, {
      name: 'rmq',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          flushInterval: 10000,
          flushThreshold: 10,
        },
      },
      singleton: false,
    });
    const exchange = o.shortid.generate();
    const topic = o.shortid.generate();
    const bufferId = exchange + '-' + topic;
    it('should send all messages in buffer and flush it', (done) => {
      return o.co(function* () {
        yield rmq.init();
        let index = 0;
        while (index < rmq.config.flushThreshold) {
          index++;
          const resp = yield rmq.publish({
            exchange: exchange,
            topic: topic,
            json: {
              index: index,
            },
            buffer: true,
          });
          console.log(resp);
          if (index < rmq.config.flushThreshold) {
            o.assert.strictEqual(rmq.buffer.topics[bufferId].messages.length, index);
          }
        }
        setTimeout(() => {
          o.assert.strictEqual(rmq.buffer.topics[bufferId].messages.length, 0);
          done();
        }, 100);
      }).catch((err) => {
        done(err);
      });
    });
  });
});
