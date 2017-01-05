'use strict';

const o = require('../../../../common');

describe('process message', function() {
  it('should not process already offline acked message', function(done) {
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
        ack: '',
      });
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 0);
      mq.acked[content.id] = Date.now();
      mq.messages[content.id].channel.nack(mq.messages[content.id].msg, false, true);
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 1);
      delete mq.messages[content.id];
      let _get = yield mq.get({
        queue: queue,
        ack: '',
      });
      o.assert.isNull(_get.result.content);
      info = yield mq.info(queue);
      o.assert.strictEqual(info.result.messageCount, 0);
      done();
    })
    .catch(function(err) {
      done(err);
    });
  });

  it('should reject when error occurred', function(done) {
    const mq = o.mq();
    const bufferToJSON = o.sinon.stub(mq, '_bufferToJSON', function() {
      throw new Error('some_error');
    });
    const error = o.sinon.stub(mq.logger, 'error');
    const content = mq._processMsg({content: new Buffer('some_buffer')}, false, {});
    mq._bufferToJSON.restore();
    mq.logger.error.restore();
    o.assert(error.calledWith('some_error'));
    o.assert.isNull(content);
    done();
  });
});
