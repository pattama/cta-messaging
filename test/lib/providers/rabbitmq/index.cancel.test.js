'use strict';

const o = require('../../../common');
describe('cancel consumer', function() {
  it('consumer', function(done) {
    o.co(function * () {
      const queue = o.shortid.generate();
      const mq = o.mq();
      const consumer = yield mq.consume({
        queue: queue,
        cb: () => {},
        ack: 'auto',
      });
      o.assert.property(mq.consumersChannel.consumers, consumer.result.consumerTag);
      yield mq.cancel(consumer.result.consumerTag);
      o.assert.notProperty(mq.consumersChannel.consumers, consumer.result.consumerTag);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});