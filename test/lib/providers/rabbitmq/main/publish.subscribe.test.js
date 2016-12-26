'use strict';

const o = require('../../../../common');

describe('publish/subscribe', function() {
  const mq = o.mq();

  it('should publish to exchange', function(done) {
    o.co(function * () {
      const topic = o.topic();
      const content = o.json();
      yield mq.subscribe({
        topic: topic,
        cb: () => { done(); },
      });
      yield mq.publish({
        topic: topic,
        content: content,
      });
    })
    .catch((err) => {
      done(err);
    });
  });

  it('should reject when it can not publish', function(done) {
    o.co(function *() {
      const topic = o.topic();
      const content = o.json();
      yield mq._connect(false);
      const channel = yield mq._channel();
      o.sinon.stub(channel, 'publish', () => { return false; });
      o.sinon.stub(mq, '_channel', () => { return Promise.resolve(channel); });
      yield mq.publish({
        topic: topic,
        content: content,
      });
      done('should not be here');
    })
    .catch((err) => {
      mq._channel.restore();
      o.assert(err);
      done();
    });
  });

  it('should catch error and reject', function(done) {
    o.co(function *() {
      const topic = o.topic();
      const content = o.json();
      yield mq._connect(false);
      const channel = yield mq._channel();
      o.sinon.stub(mq, '_channel', () => { throw new Error('mock channel error') });
      yield mq.publish({
        topic: topic,
        content: content,
      });
      done('should not be here');
    })
    .catch((err) => {
      mq._channel.restore();
      o.assert(err);
      done();
    });
  });
});
