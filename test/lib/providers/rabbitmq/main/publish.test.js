'use strict';

const o = require('../../../../common');
describe('produce', function() {
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
  it('should publish to exchange', function(done) {
    o.co(function * () {
      const topic = o.topic();
      const json = o.json();
      const cb = o.sinon.spy();
      yield mq.subscribe({
        topic: topic,
        cb: () => { done(); },
      });
      yield mq.publish({
        topic: topic,
        json: json,
      });
    })
    .catch((err) => {
      done(err);
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

  it('should reject when it can not publish', function(done) {
    o.co(function *() {
      const topic = o.topic();
      const json = o.json();
      yield mq._connect();
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'publish', () => { return false; });
      o.sinon.stub(mq, '_channel', () => { return Promise.resolve(channel); });
      yield mq.publish({
        topic: topic,
        json: json,
      });
      done('should not be here');
    })
    .catch((err) => {
      mq._channel.restore();
      o.assert(err);
      done();
    });
  });

  it('should catch error and reject', function(done) {
    o.co(function *() {
      const topic = o.topic();
      const json = o.json();
      yield mq._connect();
      const channel = yield mq._channel();
      o.sinon.stub(mq, '_channel', () => { throw new Error('mock channel error') });
      yield mq.publish({
        topic: topic,
        json: json,
      });
      done('should not be here');
    })
    .catch((err) => {
      mq._channel.restore();
      o.assert(err);
      done();
    });
  });
});
