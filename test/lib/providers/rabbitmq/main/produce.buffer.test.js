'use strict';

const o = require('../../../../common');

describe('produce/consume', function() {
  let mq;
  before(function() {
    mq = new o.lib({}, {
      name: 'messaging',
      module: 'cta-messaging',
      properties: {
        provider: 'rabbitmq',
        parameters: {
          url: 'amqp://localhost?heartbeat=60',
          buffer: {
            location: o.location(),
          },
        },
      },
      singleton: false,
    });
  });

  it('should produce to file buffer first, then to queue and consume from it', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const content = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        content: content,
        buffer: 'file',
      });
      o.sinon.assert.notCalled(spy);
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should produce to memory buffer first, then to queue and consume from it', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const content = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        content: content,
        buffer: 'memory',
      });
      o.sinon.assert.notCalled(spy);
    })
    .catch((err) => {
      done(err);
    });
  });
});
