'use strict';

const o = require('../../../../common');
const config = {
  flushInterval: 500,
  flushThreshold: 10,
};
const logger = require('cta-logger')();
const provider = {
  produce: () => {
    return Promise.resolve();
  },
  publish: () => {
    return Promise.resolve();
  },
};

describe('memory buffer', function() {
  let mainBuffer;
  let _mProduce;
  let _pProduce;
  let _pPublish;

  beforeEach(function() {
    mainBuffer = new o.buffers.Memory(config, provider, logger);
    _mProduce = o.sinon.spy(mainBuffer, '_produce');
    _pProduce = o.sinon.spy(provider, 'produce');
    _pPublish = o.sinon.spy(provider, 'publish');
  });

  afterEach(function(){
    clearInterval(mainBuffer.interval);
    mainBuffer._produce.restore();
    provider.produce.restore();
    provider.publish.restore();
  });

  it('instantiation', () => {
    o.assert.deepEqual(mainBuffer.config, config);
    o.assert.deepEqual(mainBuffer.provider, provider);
    o.assert.deepEqual(mainBuffer.data.queue, {});
    o.assert.deepEqual(mainBuffer.data.topic, {});
    o.assert.strictEqual(mainBuffer.interval, null);
  });

  it('init', () => {
    mainBuffer._init('queue');
    o.assert(mainBuffer.interval);
  });

  it('append one message', function(done) {
    this.timeout(2000 + config.flushInterval);
    mainBuffer.append({
      queue: 'some_queue',
      content: {c: 3, d: 4},
    }, 'queue').then(() => {
      o.assert.deepEqual(mainBuffer.data.queue, {'some_queue': {
        counter: 1,
        messages: [{c: 3, d: 4}],
      }});
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
    }).catch((err) => {
      done(err);
    })
  });

  it('append with no topic', function(done) {
    mainBuffer.append({
      exchange: 'some_exchange',
      content: {c: 3, d: 4},
    }, 'topic').then(() => {
      o.assert.deepEqual(mainBuffer.data.topic, {'some_exchange': {
        counter: 1,
        exchange: 'some_exchange',
        topic: undefined,
        messages: [{c: 3, d: 4}],
      }});
      done();
    }).catch((err) => {
      done(err);
    })
  });

  it('should produce when threshold is reached', function(done) {
    o.co(function *() {
      mainBuffer.config.flushThreshold = 1;
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      o.assert.strictEqual(_mProduce.callCount, 1);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should reject when error occurred on append', function(done) {
    o.co(function *() {
      o.sinon.stub(mainBuffer, '_init', function() {
        throw new Error('some_error');
      });
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      done('should not be here');
    })
    .catch(function(err) {
      mainBuffer._init.restore();
      o.assert.strictEqual(err.message, 'some_error');
      done();
    });
  });

  it('should catch produce error', function(done) {
    o.co(function *() {
      provider.produce.restore();
      o.sinon.stub(provider, 'produce', function() {
        return Promise.reject('some_error');
      });
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      mainBuffer._produce('some_queue', 'queue');
      setTimeout(function() {
        o.assert.strictEqual(mainBuffer.data.queue.some_queue.messages.length, 1);
        done();
      }, 100);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should catch publish error', function(done) {
    o.co(function *() {
      provider.publish.restore();
      o.sinon.stub(provider, 'publish', function() {
        return Promise.reject('some_error');
      });
      yield mainBuffer.append({
        exchange: 'some_exchange',
        topic: 'some_topic',
        content: o.json(),
      }, 'topic');
      mainBuffer._produce('some_exchange-some_topic', 'topic');
      setTimeout(function() {
        o.assert.strictEqual(mainBuffer.data.topic['some_exchange-some_topic'].messages.length, 1);
        done();
      }, 100);
    })
    .catch(function(err) {
      done(err);
    });
  });
});
