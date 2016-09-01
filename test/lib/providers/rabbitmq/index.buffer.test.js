'use strict';

const o = require('../../../common');
const rmq = new o.rmq({}, {
  name: 'rmq',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      flushInterval: 100,
    },
  },
  singleton: false,
});
const queue = o.shortid.generate();
describe('rabbitmq buffer', () => {
  context('produce', () => {
    it('should store first message in buffer', (done) => {
      return o.co(function* () {
        yield rmq.init();
        let index = 0;
        const start = Date.now();
        console.log((Date.now() - start), rmq.config.flushInterval);
        while ((Date.now() - start) < rmq.config.flushInterval) {
          index++;
          const resp = yield rmq.produce({
            queue: queue,
            json: {
              index: index,
            },
            buffer: true,
          });
          console.log(resp);
          o.assert(rmq.buffer.interval);
          o.assert.strictEqual(rmq.buffer.queues[queue].length, index);
        }
        setTimeout(() => {
          o.assert.strictEqual(rmq.buffer.queues[queue].length, 0);
          done();
        }, 100);
      }).catch((err) => {
        done(err);
      });
    });
  });
});
