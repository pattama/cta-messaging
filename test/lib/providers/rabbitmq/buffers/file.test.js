'use strict';

const o = require('../../../../common');

describe('file buffer', function() {

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

  let mainBuffer;
  let _mProduce;
  let _pProduce;
  let _pPublish;

  beforeEach(function() {
    config.location = o.path.join(o.os.tmpDir(), o.shortid.generate());
    o.mkdirp.sync(config.location);
    mainBuffer = new o.buffers.File(config, provider, logger);
    _mProduce = o.sinon.spy(mainBuffer, '_produce');
    _pProduce = o.sinon.spy(provider, 'produce');
    _pPublish = o.sinon.spy(provider, 'publish');
  });

  afterEach(function(done){
    clearInterval(mainBuffer.interval);
    _mProduce.restore();
    _pProduce.restore();
    _pPublish.restore();
    setTimeout(function() {
      o.rmdir(mainBuffer.config.location, function() {
        done();
      });
    }, 100);
  });

  after(function() {

  });

  it('instantiation', function() {
    o.assert.deepEqual(mainBuffer.config, config);
    o.assert.deepEqual(mainBuffer.provider, provider);
    o.assert.deepEqual(mainBuffer.data.queue, {});
    o.assert.deepEqual(mainBuffer.data.topic, {});
    o.assert.strictEqual(mainBuffer.interval, null);
    o.assert.instanceOf(mainBuffer.buffer, require('nedb'));
  });

  it('init, should set interval', function() {
    mainBuffer._init('queue');
    o.assert(mainBuffer.interval);
  });

  it('init, should not set data when find fails', function(done) {
    clearInterval(mainBuffer.interval);
    mainBuffer.interval = null;
    o.sinon.stub(mainBuffer.buffer, 'find', function(search, fn) {
      fn('find_error', null);
    });
    mainBuffer.data = {
      queue: {},
      topic: {},
    };
    mainBuffer._init('queue');
    setTimeout(function(){
      // console.log('mainBuffer.data.queue: ', mainBuffer.data.queue);
      o.assert.deepEqual(mainBuffer.data.queue, {});
      o.assert.strictEqual(Object.keys(mainBuffer.data.topic).length, 0);
      mainBuffer.buffer.find.restore();
      done();
    }, 100);
  });

  it('init, should set data when find succeed', function(done) {
    clearInterval(mainBuffer.interval);
    mainBuffer.interval = null;
    o.sinon.stub(mainBuffer.buffer, 'find', function(search, fn) {
      const docs = [{
        type: 'queue', key: 'some_queue',
      }, {
        type: 'queue', key: 'some_queue',
      }];
      fn(null, docs);
    });
    mainBuffer._init('queue');
    setTimeout(function(){
      // console.log('mainBuffer.data.queue: ', mainBuffer.data.queue);
      o.assert.strictEqual(mainBuffer.data.queue.some_queue, 2);
      o.assert.strictEqual(Object.keys(mainBuffer.data.topic).length, 0);
      mainBuffer.buffer.find.restore();
      done();
    }, 100);
  });

  it('append message on queue', function(done) {
    mainBuffer.append({
      queue: 'abc',
      content: {a: 1, b: 2},
    }, 'queue').then(() => {
      o.assert.deepEqual(mainBuffer.data.queue, {abc: 1});
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('append message on exchange with topic', function(done) {
    mainBuffer.append({
      exchange: 'some_exchange',
      topic: 'some_topic',
      content: {c: 3, d: 4},
    }, 'topic').then(() => {
      o.assert.deepEqual(mainBuffer.data.topic, {'some_exchange-some_topic': 1});
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('append message on exchange with no topic', function(done) {
    mainBuffer.append({
      exchange: 'some_exchange',
      content: {c: 3, d: 4},
    }, 'topic').then(() => {
      o.assert.deepEqual(mainBuffer.data.topic, {'some_exchange': 1});
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should produce after apend', function(done) {
    mainBuffer.config.flushThreshold = 1;
    mainBuffer.append({
      queue: 'abc',
      content: {a: 1, b: 2},
    }, 'queue').then(() => {
      o.assert.strictEqual(_mProduce.callCount, 1);
      mainBuffer.config.flushThreshold = config.flushThreshold;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should reject when insert fails', function(done) {
    o.sinon.stub(mainBuffer.buffer, 'insert', function(doc, fn) {
      fn('insert_error', null);
    });
    o.co(function *() {
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      done('should not be here');
    })
    .catch(function(err) {
      mainBuffer.buffer.insert.restore();
      //o.assert.strictEqual(err.message, 'insert_error');
      o.assert(err);
      done();
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

  it('_produce, should not read when locked', function(done) {
    mainBuffer.lockRead = true;
    o.sinon.stub(mainBuffer.logger, 'info');
    mainBuffer._produce('some_queue', 'queue');
    setTimeout(function(){
      o.sinon.assert.calledWith(mainBuffer.logger.info, 'read file is locked');
      done();
    }, 100);
  });

  it('_produce, should catch find error', function(done) {
    mainBuffer.lockRead = false;
    o.sinon.stub(mainBuffer.logger, 'error');
    o.sinon.stub(mainBuffer.buffer, 'find', () => {
      return {
        limit: () => {
          return {
            exec: (fn) => {
              fn('find_error', null);
            },
          };
        },
      };
    });
    mainBuffer._produce('some_queue', 'queue');
    setTimeout(function(){
      o.sinon.assert.calledWith(mainBuffer.logger.error, 'find_error');
      mainBuffer.logger.error.restore();
      done();
    }, 1000);
  });

  it('_produce, should catch error and remove lock', function() {
    mainBuffer.lockRead = false;
    delete mainBuffer.buffer;
    mainBuffer._produce('some_queue', 'queue');
    o.assert.isNotOk(mainBuffer.lockRead);
  });

  it('_produce on queue, should catch remove error', function(done) {
    o.co(function *() {
      o.sinon.stub(mainBuffer, '_init');
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      o.sinon.stub(mainBuffer.buffer, 'remove', function(search, options, fn) {
        fn('remove_error', null);
        o.assert.isNotOk(mainBuffer.lockRead);
        done();
      });
      mainBuffer._produce('some_queue', 'queue');
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('_produce on exchange, should catch remove error', function(done) {
    o.co(function *() {
      o.sinon.stub(mainBuffer, '_init');
      yield mainBuffer.append({
        exchange: 'some_exchange',
        topic: 'some_topic',
        content: o.json(),
      }, 'topic');
      o.sinon.stub(mainBuffer.buffer, 'remove', function(search, options, fn) {
        fn('remove_error', null);
        o.assert.isNotOk(mainBuffer.lockRead);
        done();
      });
      mainBuffer._produce('some_exchange-some_topic', 'topic');
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('_produce on queue, should catch produce error', function(done) {
    o.co(function *() {
      provider.produce.restore();
      o.sinon.stub(mainBuffer, '_init');
      yield mainBuffer.append({
        queue: 'some_queue',
        content: o.json(),
      }, 'queue');
      o.sinon.stub(mainBuffer.provider, 'produce', function() {
        return Promise.reject('produce_error');
      });
      o.sinon.stub(mainBuffer.logger, 'error', function(msg) {
        o.assert.strictEqual(msg, 'produce_error');
        o.assert.isNotOk(mainBuffer.lockRead);
        mainBuffer.logger.error.restore();
        done();
      });
      mainBuffer._produce('some_queue', 'queue');
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('_produce on exchange, should catch publish error', function(done) {
    o.co(function *() {
      provider.publish.restore();
      o.sinon.stub(mainBuffer, '_init');
      yield mainBuffer.append({
        exchange: 'some_exchange',
        topic: 'some_topic',
        content: o.json(),
      }, 'topic');
      o.sinon.stub(mainBuffer.provider, 'publish', function() {
        return Promise.reject('publish_error');
      });
      o.sinon.stub(mainBuffer.logger, 'error', function(msg) {
        o.assert.strictEqual(msg, 'publish_error');
        o.assert.isNotOk(mainBuffer.lockRead);
        mainBuffer.logger.error.restore();
        done();
      });
      mainBuffer._produce('some_exchange-some_topic', 'topic');
    })
    .catch(function(err) {
      done(err);
    });
  });
});
