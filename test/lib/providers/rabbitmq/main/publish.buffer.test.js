'use strict';

const o = require('../../../../common');

describe('publish/subscribe', function() {
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

  it('should publish to file buffer then to exchange', function(done) {
    o.co(function * () {
      const topic = o.topic();
      const json = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.subscribe({
        topic: topic,
        cb: cb,
      });
      yield mq.publish({
        topic: topic,
        json: json,
        buffer: 'file',
      });
      o.sinon.assert.notCalled(spy);
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should publish to memory buffer then to exchange', function(done) {
    o.co(function *() {
      const topic = o.topic();
      const json = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.subscribe({
        topic: topic,
        cb: cb,
        ack: 'auto',
      });
      yield mq.publish({
        topic: topic,
        json: json,
        buffer: 'memory',
      });
      o.sinon.assert.notCalled(spy);
    })
    .catch((err) => {
      done(err);
    });
  });
});
