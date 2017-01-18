'use strict';

const o = require('../../../../common');

describe('ack', function() {
  it('should ack got message from queue and remove it from memory', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = o.mq();
      yield mq.produce({
        queue: queue,
        content: content,
      });
      o.assert.strictEqual(Object.keys(mq.messages).length, 0);
      let info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 1);
      yield mq.get({
        queue: queue,
      });
      o.assert.strictEqual(Object.keys(mq.messages).length, 1);
      o.assert.property(mq.messages, content.id);
      yield mq.ack(content.id);
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
      yield mq.ack(content.id);
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
            ack: () => {
              throw new Error('some_error');
            }
          }
        }
      };
      yield mq.ack('some_id');
      done('should not be here');
    })
    .catch(function(err) {
      o.assert(err);
      done();
    });
  });
});
