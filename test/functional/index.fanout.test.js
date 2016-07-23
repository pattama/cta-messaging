'use strict';

const o = require('../common');

describe('functional: index / pub-sub', function() {
  Object.keys(o.providers).forEach(function(provider) {
    context(provider + ' provider', function() {
      const io = o.lib(provider);
      it('start subscribers', function(done) {
        return o.co(function* coroutine() {
          const spy1 = o.sinon.spy();
          const spy2 = o.sinon.spy();
          yield io.subscribe({cb: spy1});
          yield io.subscribe({cb: spy2});
          const json = {
            id: o.shortid.generate(),
          };
          yield io.publish({
            json: json,
          });
          o.sinon.assert.calledWith(spy1, json);
          o.sinon.assert.calledWith(spy2, json);
          done();
        }).catch((err) => {
          console.error(err);
          setTimeout(function() {
            done('err');
          }, 100);
        });
      });
    });
  });
});
