'use strict';

const o = require('../../../../common');

describe('produce/consume', function() {
  const mq = o.mq();

  it('should produce to queue and consume from it', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const content = o.json();
      yield mq.consume({
        queue: queue,
        cb: () => {
          done();
        },
        prefetch: 1,
        ack: 'auto',
      });
      yield mq.produce({
        queue: queue,
        content: content,
      });
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should reject when it can not produce', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const content = o.json();
      yield mq._connect(false);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'sendToQueue', () => { return false; });
      o.sinon.stub(mq, '_channel', () => { return Promise.resolve(channel); });
      yield mq.produce({
        queue: queue,
        content: content,
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
      const content = o.json();
      yield mq._connect(false);
      o.sinon.stub(mq, '_channel', () => { throw new Error('mock channel error'); });
      yield mq.produce({
        queue: queue,
        content: content,
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
      const content = o.json();
      yield mq._connect(false);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'consume', (queue, callback) => {
        callback(null);
        return Promise.resolve({});
      });
      o.sinon.stub(mq, '_channel').returns(Promise.resolve(channel));
      const cb = () => { };
      const spy = o.sinon.spy(cb);
      yield mq.consume({
        queue: queue,
        cb: cb,
        ack: 'auto',
      });
      mq._channel.restore();
      channel.consume.restore();
      yield mq.produce({
        queue: queue,
        content: content,
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
      const content = o.json();
      yield mq._connect(false);
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
        content: content,
      });
      o.sinon.assert.notCalled(spy);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });

  it('expires', function(done) {
    this.timeout(5000);
    const queue = o.queue();
    o.co(function* coroutine() {
      yield mq.produce({
        queue: queue,
        content: o.json(),
        autoDelete: true,
        expires: 1000,
      });
      const info1 = yield mq.info(queue);
      console.log('> info1: ', info1);
      yield o.sleep(2000);
      const info2 = yield mq.info(queue);
      o.assert.property(info2.result, 'error');
      console.log('> info2: ', info2);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should reject when it can not send to queue', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const content = o.json();
      yield mq._connect(true);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'sendToQueue').returns(false);
      o.sinon.stub(mq, '_channel').returns(Promise.resolve(channel));
      yield mq.produce({
        queue: queue,
        content: content,
      });
      done('should not be here');
    })
    .catch((err) => {
      o.assert(err);
      mq._channel.restore();
      done();
    });
  });
});
