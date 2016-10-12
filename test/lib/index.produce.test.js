'use strict';

const o = require('../common');

describe('produce', function() {
  this.timeout(5000);
  const io = o.lib();
  it('expires', function(done) {
    const queue = o.shortid.generate();
    return o.co(function* coroutine() {
      const produce = yield io.produce({
        queue: queue,
        json: {foo: 'bar'},
        autoDelete: true,
        expires: 1000,
      });
      console.log('> produce: ', produce);
      const info1 = yield io.info(queue);
      console.log('> info1: ', info1);
      yield o.sleep(2000);
      const info2 = yield io.info(queue);
      o.assert.property(info2.result, 'error');
      console.log('> info2: ', info2);
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});
