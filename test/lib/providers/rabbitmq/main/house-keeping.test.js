'use strict';

const o = require('../../../../common');

describe('house keeping', function() {
  it('should clear not acked messages from memory after clearOffset delay', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = new o.lib({}, {
        properties: {
          provider: 'rabbitmq',
          parameters: {
            url: o.config.rabbitMqUrl,
            clearInterval: 500,
            clearOffset: 100,
          },
        },
        singleton: false,
      });
      yield mq.produce({
        queue: queue,
        content: content,
      });
      yield mq.get({
        queue: queue,
      });
      o.assert.strictEqual(Object.keys(mq.messages).length, 1);
      o.assert.property(mq.messages, content.id);
      setTimeout(function() {
        o.assert.strictEqual(Object.keys(mq.messages).length, 0);
        done();
      }, 500);
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should clear acked messages from memory after clearOffset delay', function(done) {
    o.co(function *() {
      const content = o.json();
      const queue = o.queue();
      const mq = new o.lib({}, {
        properties: {
          provider: 'rabbitmq',
          parameters: {
            url: o.config.rabbitMqUrl,
            clearInterval: 500,
            clearOffset: 100,
          },
        },
        singleton: false,
      });
      yield mq.produce({
        queue: queue,
        content: content,
      });
      yield mq.get({
        queue: queue,
      });
      o.assert.strictEqual(Object.keys(mq.messages).length, 1);
      o.assert.property(mq.messages, content.id);
      yield mq.ack(content.id);
      setTimeout(function() {
        o.assert.strictEqual(Object.keys(mq.messages).length, 0);
        o.assert.strictEqual(Object.keys(mq.acked).length, 0);
        done();
      }, 500);
    })
    .catch(function(err) {
      done(err);
    });
  });
});
