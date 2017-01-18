'use strict';

const o = require('../../../../common');

describe('nack', function() {
  it('should put consumed msg back to queue & remove it from memory', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = o.mq();
      yield mq.produce({
        queue: queue,
        content: content,
      });
      let info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 1);
      yield mq.get({
        queue: queue,
      });
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 0);
      o.assert.strictEqual(Object.keys(mq.messages).length, 1);
      o.assert.property(mq.messages, content.id);
      yield mq.nack({id: content.id, requeue: true});
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 1);
      o.assert.strictEqual(Object.keys(mq.messages).length, 0);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should completely remove msg from queue and memory', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = o.mq();
      yield mq.produce({
        queue: queue,
        content: content,
      });
      let info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 1);
      yield mq.get({
        queue: queue,
      });
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 0);
      o.assert.strictEqual(Object.keys(mq.messages).length, 1);
      o.assert.property(mq.messages, content.id);
      yield mq.nack({id: content.id, requeue: false});
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 0);
      o.assert.strictEqual(Object.keys(mq.messages).length, 0);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should reject when msg not found in memory', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = o.mq();
      yield mq.produce({
        queue: queue,
        content: content,
      });
      yield mq.get({
        queue: queue,
      });
      o.assert.property(mq.messages, content.id);
      mq.messages = {};
      yield mq.nack({id: content.id});
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
      mq.messages = {
        'some_id': {
          channel: {
            nack: () => {
              throw new Error('some_error');
            },
          },
        },
      };
      yield mq.nack({id: 'some_id'});
      done('should not be here');
    })
    .catch(function(err) {
      o.assert(err);
      done();
    });
  });
});
