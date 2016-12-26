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
});
