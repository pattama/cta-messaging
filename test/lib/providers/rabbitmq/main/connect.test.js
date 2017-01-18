'use strict';

const o = require('../../../../common');

describe('connect', function() {
  const Rmq = o.providers.rabbitmq;

  before(function() {
    o.sinon.stub(Rmq.prototype, 'init');
  });

  after(function() {
    Rmq.prototype.init.restore();
  });

  it('should reject when connection fails and try to reconnect', function(done) {
    const mq = o.mq();
    o.co(function *() {
      o.sinon.stub(o.amqp, 'connect', function() {
        return Promise.reject('some_error');
      });
      o.sinon.stub(mq, '_reConnect');
      yield mq._connect();
      done('should not be here');
    })
    .catch(function(err) {
      o.assert.isOk(mq._reConnect.called);
      o.amqp.connect.restore();
      mq._reConnect.restore();
      o.assert(err);
      done();
    });
  });

  it('should create connection when it succeed', function(done) {
    const mq = o.mq();
    o.sinon.stub(mq, '_reConnect');
    o.co(function *() {
      yield mq._connect();
      o.assert(mq.connection);
      o.sinon.stub(mq.logger, 'debug', function() { // catch connection blocked event
        console.log(arguments);
        mq.logger.debug.restore();
        o.sinon.stub(mq.logger, 'debug', function() { // catch connection unblocked event
          console.log(arguments);
          mq.logger.debug.restore();
          o.sinon.stub(mq.logger, 'debug', function() { // catch connection error event
            console.log(arguments);
            mq.logger.debug.restore();
            o.sinon.stub(mq.logger, 'debug', function() { // catch connection close event
              console.log(arguments);
              mq.logger.debug.restore();
              o.assert.isOk(mq._reConnect.called);
              mq._reConnect.restore();
              done();
            });
            mq.connection.emit('close');
          });
          mq.connection.emit('error');
        });
        mq.connection.emit('unblocked', 'some_reason');
      });
      mq.connection.emit('blocked', 'some_reason');
    })
    .catch(function(err) {
      done(err);
    });
  });
});
