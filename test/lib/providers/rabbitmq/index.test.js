'use strict';

const o = require('../../../common');

describe('lib/providers/rabbitmq/index', function() {
  const Rmq = o.providers.rabbitmq;

  it('constructor', function() {
    o.sinon.stub(Rmq.prototype, '_houseKeeping');
    o.sinon.stub(Rmq.prototype, 'init');
    //eslint-disable-next-line no-unused-vars
    const mq = o.mq();
    o.sinon.assert.called(Rmq.prototype._houseKeeping);
    o.sinon.assert.called(Rmq.prototype.init);
    Rmq.prototype._houseKeeping.restore();
    Rmq.prototype.init.restore();
  });

  it('_jsonToBuffer/_bufferToJSON', function() {
    const mq = o.mq();
    const sample = o.json();
    const buffer = mq._jsonToBuffer(sample);
    o.assert.instanceOf(buffer, Buffer);
    const json = mq._bufferToJSON(buffer);
    o.assert.deepEqual(json, sample);
  });

  it('healthCheck', function(done) {
    o.co(function *() {
      o.sinon.stub(Rmq.prototype, 'init');
      o.sinon.stub(Rmq.prototype, '_reConnect');
      const mq = o.mq();
      Rmq.prototype.init.restore();
      yield mq.init();
      o.assert.isOk(mq.healthCheck());
      yield mq.connection.close();
      o.assert.isNotOk(mq.healthCheck());
      Rmq.prototype._reConnect.restore();
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });
});