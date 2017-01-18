'use strict';

const o = require('../../../../common');

describe('reconnect', function() {
  const Rmq = o.providers.rabbitmq;

  before(function() {
    o.sinon.stub(Rmq.prototype, 'init');
  });

  after(function() {
    Rmq.prototype.init.restore();
  });

  it('should set reconnect interval', function(done) {
    const mq = o.mq();
    o.sinon.stub(mq, '_connect', () => {
      return Promise.reject('some_error');
    });
    o.assert.isUndefined(mq.reconnectInterval);
    mq.config.reConnectAfter = 500;
    mq._reConnect();
    o.assert.isOk(mq.reconnecting);
    o.assert(mq.reconnectInterval);
    setTimeout(function() {
      o.assert.strictEqual(mq._connect.callCount, 1);
      o.sinon.stub(mq, '_reconnectConsumers', function() {
        mq._reconnectConsumers.restore();
        mq._connect.restore();
        done();
      });
      mq._connect.restore();
      o.sinon.stub(mq, '_connect', () => {
        return Promise.resolve();
      });
    }, 500);
  });

  it('should set reconnect interval once', function(done) {
    const mq = o.mq();
    o.sinon.stub(mq, '_connect', () => {
      return Promise.reject('some_error');
    });
    o.assert.isUndefined(mq.reconnectInterval);
    mq.config.reConnectAfter = 500;
    mq._reConnect();
    o.sinon.spy(mq.logger, 'debug');
    mq._reConnect();
    o.assert(mq.logger.debug.calledWith('RabbitMQ is already trying to reconnect...'));
    mq.logger.debug.restore();
    mq._connect.restore();
    done();
  });
});
