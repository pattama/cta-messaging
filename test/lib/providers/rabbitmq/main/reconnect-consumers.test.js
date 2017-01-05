'use strict';

const o = require('../../../../common');

describe('reconnect consumers', function() {
  it('should reconnect all known consumers after reconnection', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      mq.config.reConnectAfter = 500;
      const consumer = yield mq.consume({
        queue: queue,
        cb: () => {},
      });
      o.assert.property(mq.consumers, consumer.result.consumerTag);
      const _consume = o.sinon.spy(mq, 'consume');
      mq.connection.emit('close');
      setTimeout(function() {
        o.assert.strictEqual(_consume.callCount, 1);
        o.assert.notProperty(mq.consumers, consumer.result.consumerTag);
        o.assert(Object.keys(mq.consumers).length);
        mq.consume.restore();
        done();
      }, 1000);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should log consumer reconnection error', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      mq.config.reConnectAfter = 500;
      const consumer = yield mq.consume({
        queue: queue,
        cb: () => {},
      });
      o.sinon.stub(mq, 'consume', function() {
        return Promise.reject('some_error');
      });
      mq.connection.emit('close');
      o.sinon.stub(mq.logger, 'error');
      setTimeout(function() {
        o.assert.strictEqual(mq.logger.error.getCalls()[0].args[1], 'some_error');
        mq.consume.restore();
        mq.logger.error.restore();
        done();
      }, 1000);
    })
    .catch(function(err) {
      done(err);
    });
  });
});
