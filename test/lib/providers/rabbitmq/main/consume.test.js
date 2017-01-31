'use strict';

const o = require('../../../../common');

describe('consume', function() {

  it('should ack when option is set to resolve', function(done) {
    const mq = o.mq();
    o.co(function *() {
      const queue = o.queue();
      const content = o.json();
      yield mq._connect(false);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'ack');
      o.sinon.stub(mq, '_channel', () => { return Promise.resolve(channel); });
      yield mq.consume({
        queue: queue,
        cb: () => {
          return Promise.resolve();
        },
        ack: 'resolve',
      });
      mq._channel.restore();
      yield mq.produce({
        queue: queue,
        content: content,
      });
      setTimeout(() => {
        o.assert.strictEqual(channel.ack.callCount, 1);
        done();
      }, 500);
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should reject when create channel fails', function(done) {
    const mq = o.mq();
    o.co(function *() {
      const queue = o.queue();
      o.sinon.stub(mq, '_channel', () => {
        return Promise.reject('some_error');
      });
      yield mq.consume({
        queue: queue,
        cb: () => {},
      });
      done('should not be here');
    })
    .catch(function(err) {
      mq._channel.restore();
      o.assert(err);
      done();
    });
  });

  it('should not call cb when consumed message is null', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      yield mq._connect(true);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'consume', function(queue, cb) {
        cb(null);
        return Promise.resolve({});
      });
      o.sinon.stub(mq, '_channel', () => {
        return Promise.resolve(channel);
      });
      const cb = o.sinon.stub();
      yield mq.consume({
        queue: queue,
        cb: cb,
      });
      o.assert.strictEqual(cb.callCount, 0);
      mq._channel.restore();
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should not call cb when processed message is null', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      const cb = o.sinon.stub();
      yield mq.consume({
        queue: queue,
        cb: cb,
      });
      o.sinon.stub(mq, '_bufferToJSON').returns(null);
      yield mq.produce({
        queue: queue,
        content: o.json(),
      });
      setTimeout(function() {
        mq._bufferToJSON.restore();
        o.assert.strictEqual(cb.callCount, 0);
        done();
      }, 500);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should log cb error when rejected', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      const cb = () => {
        return Promise.reject('cb_error');
      };
      yield mq.consume({
        queue: queue,
        cb: cb,
      });
      o.sinon.stub(mq.logger, 'error');
      yield mq.produce({
        queue: queue,
        content: o.json(),
      });
      setTimeout(() => {
        // console.log('args: ', mq.logger.error.getCalls()[0].args);
        o.sinon.assert.called(mq.logger.error);
        o.assert.strictEqual(mq.logger.error.getCalls()[0].args[1], 'cb_error');
        mq.logger.error.restore();
        done();
      }, 200);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should log cb error when thrown', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      const cb = () => {
        throw new Error('cb_error');
      };
      yield mq.consume({
        queue: queue,
        cb: cb,
      });
      o.sinon.stub(mq.logger, 'error');
      yield mq.produce({
        queue: queue,
        content: o.json(),
      });
      setTimeout(() => {
        // console.log('args: ', mq.logger.error.getCalls()[0].args);
        o.sinon.assert.called(mq.logger.error);
        o.assert.strictEqual(mq.logger.error.getCalls()[0].args[1], 'cb_error');
        mq.logger.error.restore();
        done();
      }, 200);
    })
    .catch(function(err) {
      done(err);
    });
  });
});
