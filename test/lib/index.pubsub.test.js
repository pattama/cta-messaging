'use strict';

const o = require('../common');

describe('publish/subscribe on topics', function() {
  const io = o.lib();
  it('publish and subscribe on one topic foo', function(done) {
    this.timeout(10000);
    return o.co(function* coroutine() {
      const spy = o.sinon.spy();
      const sub = yield io.subscribe({
        topic: 'foo',
        cb: spy,
      });
      o.assert.property(sub, 'result');
      const json = o.json();
      const pub = yield io.publish({
        topic: 'foo',
        json: json,
      });
      o.assert.property(pub, 'result');
      setTimeout(() => {
        o.sinon.assert.called(spy);
        done();
      },2000);
    })
    .catch((err) => {
      done(err);
    });
  });
});
