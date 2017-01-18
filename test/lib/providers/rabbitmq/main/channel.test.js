'use strict';

const o = require('../../../../common');

describe('channel', function() {
  const Rmq = o.providers.rabbitmq;

  beforeEach(function() {
    o.sinon.stub(Rmq.prototype, 'init');
  });

  afterEach(function() {
    Rmq.prototype.init.restore();
  });

  it('should reject when there is no connection', function(done) {
    o.co(function *() {
      const mq = o.mq();
      yield mq._channel();
      done('should not be here');
    })
    .catch(function(err) {
      o.assert(err);
      done();
    });
  });

  it('should reject when channel creation fails', function(done) {
    o.co(function *() {
      const mq = o.mq();
      yield mq._connect();
      o.sinon.stub(mq.connection, 'createConfirmChannel', function() {
        return Promise.reject('some_error');
      });
      yield mq._channel();
      done('should not be here');
    })
    .catch(function(err) {
      o.assert(err);
      done();
    });
  });

  it('should reject when error occurred', function(done) {
    o.co(function *() {
      const mq = o.mq();
      mq.connection = true;
      yield mq._channel();
      done('should not be here');
    })
    .catch(function(err) {
      o.assert(err);
      done();
    });
  });

  it('should create channel when connection ready', function(done) {
    o.co(function *() {
      const mq = o.mq();
      yield mq._connect();
      const channel = yield mq._channel();
      o.assert(channel);
      o.sinon.stub(mq.logger, 'debug', function() { // catch channel error event
        mq.logger.debug.restore();
        o.sinon.stub(mq.logger, 'debug', function() { // catch channel return event
          mq.logger.debug.restore();
          o.sinon.stub(mq.logger, 'debug', function() { // catch channel drain event
            mq.logger.debug.restore();
            done();
          });
          channel.emit('drain');
        });
        channel.emit('return', 'some_msg');
      });
      channel.emit('error', 'some_error');
    })
    .catch(function(err) {
      done(err);
    });
  });
});
