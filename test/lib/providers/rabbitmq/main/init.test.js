'use strict';

const o = require('../../../../common');

describe('init', function() {
  it('should reject when connection fails', function(done) {
    const Rmq = o.providers.rabbitmq;
    o.co(function *() {
      o.sinon.stub(Rmq.prototype, '_connect', function () {
        return Promise.reject('some_error');
      });
      const mq = o.mq();
      yield mq.init();
      done('should not be here');
    })
    .catch(function(err) {
      Rmq.prototype._connect.restore();
      o.assert.strictEqual(err, 'some_error');
      done();
    });
  })
});
