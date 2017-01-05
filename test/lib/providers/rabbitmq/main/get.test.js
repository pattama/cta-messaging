'use strict';

const o = require('../../../../common');

describe('get', function() {
  const io = o.lib();
  const content = o.json();
  const queue = o.queue();

  it('should get message from queue', function(done) {
    o.co(function *() {
      yield io.produce({
        queue: queue,
        content: content,
      });
      const _info1 = yield io.info(queue);
      o.assert.property(_info1, 'result');
      o.assert.propertyVal(_info1.result, 'messageCount', 1);
      const _get = yield io.get({
        queue: queue,
        ack: 'auto',
      });
      o.assert.property(_get, 'result');
      o.assert.deepEqual(_get.result.content, content);
      const _info2 = yield io.info(queue);
      o.assert.property(_info2, 'result');
      o.assert.propertyVal(_info2.result, 'messageCount', 0);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should not process message when queue is empty', function(done) {
    o.co(function *() {
      const queue = o.queue();
      const mq = o.mq();
      yield mq._connect(true);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'get', function() {
        return Promise.resolve(null);
      });
      o.sinon.stub(mq, '_channel', () => {
        return Promise.resolve(channel);
      });
      const data = yield mq.get({
        queue: queue,
      });
      mq._channel.restore();
      o.assert.isNull(data.result.content);
      //console.log('result: ', result);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should resolve null content when create channel fails', function(done) {
    const mq = o.mq();
    o.co(function *() {
      const queue = o.queue();
      o.sinon.stub(mq, '_channel', () => {
        return Promise.reject('some_error');
      });
      const data = yield mq.get({
        queue: queue,
      });
      o.assert.isNull(data.result.content);
      o.assert.strictEqual(data.result.error, 'some_error');
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });
});
