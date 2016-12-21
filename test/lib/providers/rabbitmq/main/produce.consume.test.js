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

  /*it('should produce to queue and consume from it', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const json = o.json();
      yield mq.consume({
        queue: queue,
        cb: () => { done(); },
        prefetch: 1,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        json: json,
      });
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should produce to file buffer first, then to queue and consume from it', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const json = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        json: json,
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
      const json = o.json();
      const cb = () => { done(); };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        json: json,
        buffer: 'memory',
      });
      o.sinon.assert.notCalled(spy);
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should reject when it can not produce', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const json = o.json();
      yield mq._connect();
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'sendToQueue', () => { return false; });
      o.sinon.stub(mq, '_channel', () => { return Promise.resolve(channel); });
      yield mq.produce({
        queue: queue,
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

  it('should catch produce error and reject', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const json = o.json();
      yield mq._connect();
      const channel = yield mq._channel();
      o.sinon.stub(mq, '_channel', () => { throw new Error('mock channel error') });
      yield mq.produce({
        queue: queue,
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

  it('should not call consumer callback when received message is null', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const json = o.json();
      yield mq.init();
      o.sinon.stub(mq.consumersChannel, 'consume', (queue, callback) => {
        callback(null);
        return Promise.resolve({});
      });
      const cb = () => { };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      mq.consumersChannel.consume.restore();
      yield mq.produce({
        queue: queue,
        json: json,
      });
      o.sinon.assert.notCalled(spy);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should not call consumer callback when processed message is null', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const json = o.json();
      yield mq.init();
      o.sinon.stub(mq, '_processMsg', () => {
        return null;
      });
      const cb = () => { };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      mq._processMsg.restore();
      yield mq.produce({
        queue: queue,
        json: json,
      });
      o.sinon.assert.notCalled(spy);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });*/

  it('should throw error when consumer callback fails', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const json = o.json();
      const cb = () => {
        throw new Error('mock cb error');
        done();
        //return Promise.resolve();
        //throw new Error('mock cb error');
      };
      //const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        json: json,
      });
      o.sleep(2000);
      //o.sinon.assert.called(spy);
      //done();
    })
    .catch((err) => {
      done(err);
    });
  });
});
