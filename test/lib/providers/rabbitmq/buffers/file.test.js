'use strict';

const o = require('../../../../common');
const config = {
  location: o.os.tmpDir(),
  flushInterval: 500,
  flushThreshold: 10,
};
const logger = require('cta-logger')();
const provider = {
  produce: () => {
    return Promise.resolve();
  },
};
const mainBuffer = new o.buffers.File(config, provider, logger);
const _mProduce = o.sinon.spy(mainBuffer, '_produce');
const _pProduce = o.sinon.spy(provider, 'produce');

describe('file buffer', () => {
  it('instantiation', () => {
    o.assert.deepEqual(mainBuffer.config, config);
    o.assert.deepEqual(mainBuffer.provider, provider);
    o.assert.deepEqual(mainBuffer.queues, {});
    o.assert.strictEqual(mainBuffer.interval, null);
    o.assert.instanceOf(mainBuffer.db, require('nedb'));
  });

  it('init', () => {
    mainBuffer._init();
    o.assert(mainBuffer.interval);
  });

  it('apend one message', (done) => {
    mainBuffer.apend({
      queue: 'abc',
      json: {a: 1, b: 2},
    }).then(() => {
      o.assert.deepEqual(mainBuffer.queues, {abc: 1});
      o.sinon.assert.notCalled(_mProduce);
      o.sinon.assert.notCalled(_pProduce);
      let calls = 1;
      const interval = setInterval(() => {
        o.assert.strictEqual(_mProduce.callCount, calls);
        o.assert.strictEqual(_pProduce.callCount, 1);
        calls++;
        if (calls >= 5) {
          clearInterval(interval);
          done();
        }
      }, config.flushInterval);
    });
  });
});
