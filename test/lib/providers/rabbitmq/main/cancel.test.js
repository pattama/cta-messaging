'use strict';

const o = require('../../../../common');

describe('cancel consumer', function() {
  it('consumer', function(done) {
    o.co(function * () {
      const queue = o.queue();
      const mq = o.mq();
      const _consumer = yield mq.consume({
        queue: queue,
        cb: () => {},
        ack: 'auto',
      });
      const tag = _consumer.result.consumerTag;
      const channel = mq.consumers[tag].channel;
      o.assert(channel);
      o.assert.property(mq.consumers, tag);
      o.assert.property(channel.consumers, tag);
      yield mq.cancel(tag);
      o.assert.notProperty(mq.consumers, tag);
      o.assert.notProperty(channel.consumers, tag);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});