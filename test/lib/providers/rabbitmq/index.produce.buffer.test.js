'use strict';

const o = require('../../../common');
describe('rabbitmq produce with buffer', () => {
  context('when flushInterval is reached', () => {
    const rmq = new o.rmq({}, {
      name: 'rmq',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          buffer: {
            flushInterval: 100,
            flushThreshold: 10000,
          },
        },
      },
      singleton: false,
    });
    const queue = o.shortid.generate();
    it('should produce messages in buffer', (done) => {
      return o.co(function* () {
        yield rmq.init();
        const spy = o.sinon.spy();
        yield rmq.consume({
          queue: queue,
          cb: spy,
        });
        const start = Date.now();
        let index = 0;
        while ((Date.now() - start) < rmq.config.buffer.flushInterval) {
          index++;
          yield rmq.produce({
            queue: queue,
            json: {
              index: index,
            },
            buffer: 'memory',
          });
          if (index === 0) {
            o.assert(rmq.buffer.queues.interval);
          }
        }
        setTimeout(() => {
          o.sinon.assert.calledOnce(spy);
          done();
        }, rmq.config.buffer.flushInterval);
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
          buffer: {
            flushInterval: 10000,
            flushThreshold: 10,
          },
        },
      },
      singleton: false,
    });
    const queue = o.shortid.generate();
    it('should produce messages in buffer', (done) => {
      return o.co(function* () {
        yield rmq.init();
        const spy = o.sinon.spy();
        yield rmq.consume({
          queue: queue,
          cb: spy,
        });
        let index = 0;
        while (index < rmq.config.buffer.flushThreshold) {
          index++;
          yield rmq.produce({
            queue: queue,
            json: {
              index: index,
            },
            buffer: 'memory',
          });
        }
        setTimeout(() => {
          o.sinon.assert.calledOnce(spy);
          done();
        }, 100);
      }).catch((err) => {
        done(err);
      });
    });
  });
});
