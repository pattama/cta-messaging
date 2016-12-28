'use strict';

const o = require('../../../../common');

describe('lib/providers/rabbitmq/index', function() {
  const Rmq = o.providers.rabbitmq;
  let mq;

  it('constructor', function() {
    o.sinon.stub(Rmq.prototype, '_houseKeeping');
    o.sinon.stub(Rmq.prototype, 'init');
    mq = o.mq();
    o.sinon.assert.called(Rmq.prototype._houseKeeping);
    o.sinon.assert.called(Rmq.prototype.init);
  });

  it('_jsonToBuffer/_bufferToJSON', function() {
    const sample = o.json();
    const buffer = mq._jsonToBuffer(sample);
    o.assert.instanceOf(buffer, Buffer);
    const json = mq._bufferToJSON(buffer);
    o.assert.deepEqual(json, sample);
  });
});