'use strict';

const o = require('../../../common');
describe('cancel consumer', function() {
  it('consumer', function(done) {
    o.co(function * () {
      const queue = o.shortid.generate();
      const provider = o.lib();
      const consumer = yield provider.consume({
        queue: queue,
        cb: () => {},
        ack: 'auto',
      });
      o.assert.property(provider.consumersChannel.consumers, consumer.result.consumerTag);
      yield provider.cancel(consumer.result.consumerTag);
      o.assert.notProperty(provider.consumersChannel.consumers, consumer.result.consumerTag);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});